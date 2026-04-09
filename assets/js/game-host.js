/**
 * QuizFlow Live Game — game-host.js
 * Host logic:
 *   Auth → Select Quiz → Lobby → Question Control → Leaderboard → Final
 *
 * Depends on: supabase-config.js (exports `supabase`)
 */

import { supabase } from './supabase-config.js';

// ─── Constants ───────────────────────────────────────────
const DEFAULT_TIMER = 20;
const LEADERBOARD_DISPLAY_DELAY = 4000; // ms to show leaderboard before hiding

// Avatar color names
const AVATAR_CLASSES = ['av-0','av-1','av-2','av-3','av-4','av-5','av-6','av-7'];
const AVATAR_BG = [
  '#6366f1','#ec4899','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#14b8a6'
];

// ─── State ───────────────────────────────────────────────
const state = {
  user: null,
  selectedQuizId: null,
  selectedQuiz: null,
  questionDuration: DEFAULT_TIMER,
  roomId: null,
  roomPin: null,
  players: [],
  currentQuestionIdx: -1,
  timerInterval: null,
  timerSecondsLeft: DEFAULT_TIMER,
  realtimeChannel: null,
  answerChannel: null,
  answerCounts: [0, 0, 0, 0],
  responsesTotal: 0,
  questionEndAt: null,
  gameOver: false,
};

// ─── DOM helpers ─────────────────────────────────────────
const $ = id => document.getElementById(id);

function showHostScreen(id) {
  document.querySelectorAll('.host-screen').forEach(s => s.classList.remove('active'));
  const el = $(id);
  if (el) el.classList.add('active');
}

function setNavStatus(text, connected = false) {
  const el = $('nav-status-text');
  if (el) el.textContent = text;
  const dot = document.querySelector('.host-status-dot');
  if (dot) dot.style.background = connected ? '#22c55e' : '#ef4444';
}

function showSelectError(msg) {
  const el = $('select-error');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
}

// ─── Auth ─────────────────────────────────────────────────
async function initAuth() {
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    await onUserLoggedIn(session.user);
  } else {
    showHostScreen('host-screen-auth');
    setupAuthForm();
  }

  supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user && !state.user) {
      onUserLoggedIn(session.user);
    } else if (!session) {
      state.user = null;
      showHostScreen('host-screen-auth');
    }
  });
}

function setupAuthForm() {
  const formEmail = $('form-email-login');
  if (formEmail) {
    formEmail.addEventListener('submit', handleLogin);
  }
}

async function handleLogin(e) {
  if (e) e.preventDefault();
  
  const name = $('inp-login-name').value.trim();
  const email = $('inp-login-email').value.trim();
  const password = email + "QuizFlowSecret123";
  let errEl = document.getElementById('auth-error');
  if (!errEl) {
    errEl = document.createElement('div');
    errEl.id = 'auth-error';
    errEl.style.cssText = 'color:#dc2626;font-size:0.85rem;margin-bottom:0.75rem;padding:0.5rem 0.75rem;background:#fee2e2;border-radius:8px;display:none;';
    $('form-email-login').insertAdjacentElement('afterend', errEl);
  }
  
  errEl.style.display = 'none';

  if (!name || !email) {
    errEl.textContent = 'Please enter your name and Gmail ID.';
    errEl.style.display = 'block';
    return;
  }

  const btn = $('btn-email-login');
  const txt = $('btn-auth-text');
  const spin = $('btn-auth-spinner');
  btn.disabled = true;
  if(txt) txt.style.display = 'none';
  if(spin) spin.style.display = 'inline-block';

  let { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error && error.message.includes("Invalid login credentials")) {
    const res = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    error = res.error;
  }

  btn.disabled = false;
  if(txt) txt.style.display = '';
  if(spin) spin.style.display = 'none';

  if (error) {
    errEl.textContent = error.message;
    errEl.style.display = 'block';
  }
}

async function onUserLoggedIn(user) {
  state.user = user;
  setNavStatus('Connected', true);

  const navUser = $('nav-user');
  if (navUser) navUser.textContent = user.email?.split('@')[0] || 'Host';

  const logoutBtn = $('btn-logout');
  if (logoutBtn) {
    logoutBtn.style.display = 'inline';
    logoutBtn.onclick = () => supabase.auth.signOut();
  }

  // Set site URL
  const urlEl = $('site-url');
  if (urlEl) urlEl.textContent = window.location.hostname + '/pages/index.html';

  await loadQuizzes();
  showHostScreen('host-screen-select');
  initSelectScreen();
}

// ─── Load Quizzes ─────────────────────────────────────────
async function loadQuizzes() {
  const sel = $('quiz-select');
  if (!sel) return;

  const { data: quizzes, error } = await supabase
    .from('quizzes')
    .select('id, title, questions, timer, is_active')
    .eq('host_id', state.user.id)
    .order('created_at', { ascending: false });

  if (error || !quizzes) {
    sel.innerHTML = '<option value="">— Failed to load quizzes —</option>';
    return;
  }

  if (quizzes.length === 0) {
    sel.innerHTML = '<option value="">— No quizzes found. Create one first. —</option>';
    return;
  }

  sel.innerHTML = '<option value="">— Select a quiz —</option>' +
    quizzes.map(q =>
      `<option value="${q.id}">${q.title} (${q.questions?.length || 0} Qs)</option>`
    ).join('');
}

// ─── Select Screen ────────────────────────────────────────
function initSelectScreen() {
  const sel = $('quiz-select');
  const btn = $('btn-launch');

  sel.addEventListener('change', () => {
    $('select-error').style.display = 'none';
    state.selectedQuizId = sel.value;

    if (!sel.value) {
      btn.disabled = true;
      $('quiz-preview').style.display = 'none';
      return;
    }

    // Show preview (fetch from already-loaded select options for title)
    showQuizPreview(sel.value, sel.options[sel.selectedIndex]?.text);
    btn.disabled = false;
  });

  btn.addEventListener('click', handleLaunch);

  // Timer presets
  document.querySelectorAll('.timer-preset-btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.timer-preset-btn').forEach(x => {
        x.classList.remove('host-btn-primary');
        x.classList.add('host-btn-secondary');
        x.textContent = x.dataset.secs + 's';
      });
      b.classList.remove('host-btn-secondary');
      b.classList.add('host-btn-primary');
      b.textContent = b.dataset.secs + 's ✓';
      state.questionDuration = parseInt(b.dataset.secs);
    });
  });
}

async function showQuizPreview(quizId, titleHint) {
  const preview = $('quiz-preview');
  preview.style.display = 'block';

  $('preview-title').textContent = titleHint || 'Loading…';
  $('preview-timer').textContent = state.questionDuration;

  const { data: quiz } = await supabase
    .from('quizzes')
    .select('title, questions, timer')
    .eq('id', quizId)
    .single();

  if (quiz) {
    state.selectedQuiz = quiz;
    $('preview-title').textContent = quiz.title;
    $('preview-q-count').textContent = quiz.questions?.length || 0;
    $('preview-timer').textContent = quiz.timer || state.questionDuration;
    if (quiz.timer) state.questionDuration = quiz.timer;
  }
}

async function handleLaunch() {
  if (!state.selectedQuizId) {
    showSelectError('Please select a quiz first.');
    return;
  }

  const btn = $('btn-launch');
  const txt = $('btn-launch-text');
  const spin = $('btn-launch-spinner');
  btn.disabled = true;
  txt.style.display = 'none';
  spin.style.display = 'inline-block';

  try {
    // Generate PIN
    const { data: pinData, error: pinErr } = await supabase.rpc('generate_game_pin');
    if (pinErr) throw pinErr;
    const pin = pinData;

    // Fetch quiz if not already
    if (!state.selectedQuiz) {
      const { data: quiz } = await supabase
        .from('quizzes')
        .select('title, questions, timer')
        .eq('id', state.selectedQuizId)
        .single();
      state.selectedQuiz = quiz;
    }

    // Create game room
    const { data: room, error: roomErr } = await supabase
      .from('game_rooms')
      .insert([{
        quiz_id: state.selectedQuizId,
        host_id: state.user.id,
        pin,
        status: 'waiting',
        current_question_index: 0,
      }])
      .select()
      .single();

    if (roomErr) throw roomErr;

    state.roomId = room.id;
    state.roomPin = pin;
    state.currentQuestionIdx = -1;
    state.players = [];

    showLobby();
  } catch (err) {
    showSelectError(err.message || 'Failed to create game room. Try again.');
    btn.disabled = false;
    txt.style.display = '';
    spin.style.display = 'none';
  }
}

// ─── Lobby ────────────────────────────────────────────────
function showLobby() {
  // Update UI
  $('host-pin-display').textContent = state.roomPin;
  $('lobby-quiz-title').textContent = state.selectedQuiz?.title || 'Quiz';
  $('lobby-quiz-meta').textContent =
    `${state.selectedQuiz?.questions?.length || 0} questions · ${state.questionDuration}s per question`;

  setNavStatus(`Game PIN: ${state.roomPin}`, true);
  showHostScreen('host-screen-lobby');

  // Wire controls
  $('btn-start-game').addEventListener('click', handleStartGame);
  $('btn-cancel-lobby').addEventListener('click', handleCancelGame);

  // Subscribe to player joins
  subscribeToPlayers();
  refreshPlayerList();
}

function subscribeToPlayers() {
  if (state.realtimeChannel) supabase.removeChannel(state.realtimeChannel);

  const channel = supabase
    .channel(`lobby-players-${state.roomId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'players', filter: `room_id=eq.${state.roomId}` },
      payload => {
        state.players.push(payload.new);
        renderPlayerChip(payload.new);
        updateLobbyPlayerCount();
      }
    )
    .subscribe();

  state.realtimeChannel = channel;
}

async function refreshPlayerList() {
  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('room_id', state.roomId)
    .order('joined_at');

  if (!players) return;
  state.players = players;

  const list = $('host-player-list');
  list.innerHTML = '';

  if (players.length === 0) {
    list.innerHTML = '<div id="lobby-empty-state" style="font-size:0.82rem;color:#94a3b8;padding:0.25rem;">No players yet — share the PIN!</div>';
  } else {
    players.forEach(renderPlayerChip);
  }

  updateLobbyPlayerCount();
}

function renderPlayerChip(player) {
  const emptyState = $('lobby-empty-state');
  if (emptyState) emptyState.remove();

  const chip = document.createElement('div');
  chip.className = 'player-chip';
  chip.id = `chip-${player.id}`;
  const av = document.createElement('div');
  av.className = `player-chip-avatar ${AVATAR_CLASSES[player.avatar_idx % 8]}`;
  av.textContent = player.nickname[0].toUpperCase();
  chip.appendChild(av);
  chip.appendChild(document.createTextNode(player.nickname));
  $('host-player-list').appendChild(chip);
}

function updateLobbyPlayerCount() {
  const count = state.players.length;
  const countEl = $('lobby-count');
  if (countEl) countEl.textContent = count;
  const startBtn = $('btn-start-game');
  if (startBtn) startBtn.disabled = count < 1;
}

async function handleCancelGame() {
  if (!confirm('Cancel and delete this game room?')) return;
  await supabase
    .from('game_rooms')
    .update({ status: 'finished' })
    .eq('id', state.roomId);
  showHostScreen('host-screen-select');
  state.roomId = null;
  state.roomPin = null;
}

// ─── Start Game → First Question ─────────────────────────
async function handleStartGame() {
  $('btn-start-game').disabled = true;

  // Fetch current players
  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('room_id', state.roomId)
    .order('joined_at');
  state.players = players || [];

  // Remove lobby channel
  if (state.realtimeChannel) supabase.removeChannel(state.realtimeChannel);

  await launchQuestion(0);
}

// ─── Question Flow ────────────────────────────────────────
async function launchQuestion(qIdx) {
  state.currentQuestionIdx = qIdx;
  state.answerCounts = [0, 0, 0, 0];
  state.responsesTotal = 0;

  const questions = state.selectedQuiz?.questions;
  if (!questions || qIdx >= questions.length) {
    await endGame();
    return;
  }

  const q = questions[qIdx];
  const endAt = new Date(Date.now() + state.questionDuration * 1000);
  state.questionEndAt = endAt;

  // Update room in Supabase (broadcasts to players via Realtime)
  const { error } = await supabase
    .from('game_rooms')
    .update({
      status: 'playing',
      current_question_index: qIdx,
      question_end_at: endAt.toISOString(),
    })
    .eq('id', state.roomId);

  if (error) { alert('Failed to advance question: ' + error.message); return; }

  // Populate host question UI
  populateHostQuestion(q, qIdx);
  showHostScreen('host-screen-question');

  // Subscribe to answers
  subscribeToAnswers(qIdx);

  // Start countdown
  startHostTimer(endAt, () => onQuestionTimeUp(qIdx));
}

function populateHostQuestion(q, qIdx) {
  const questions = state.selectedQuiz?.questions || [];
  $('host-q-label').textContent = `Question ${qIdx + 1} of ${questions.length}`;
  $('host-marks-badge').textContent = '+1000 pts';
  $('host-question-text').textContent = q.question || q.text || '';

  // Image support
  const imgWrap = $('host-question-image-wrap');
  const img = $('host-question-image');
  if (q.image) {
    img.src = q.image;
    imgWrap.style.display = 'block';
  } else {
    imgWrap.style.display = 'none';
  }

  // Answer tiles
  const opts = q.options || q.choices || [];
  for (let i = 0; i < 4; i++) {
    const el = $(`host-ans-${i}-text`);
    if (el) el.textContent = opts[i] || '';
    const bar = $(`host-ans-${i}-bar`);
    if (bar) bar.style.width = '0%';
    const cnt = $(`host-ans-${i}-count`);
    if (cnt) cnt.textContent = '0 answers';
  }

  // Reset response bar
  $('host-response-count').textContent = '0';
  $('host-total-players').textContent = state.players.length;
  $('host-response-bar').style.width = '0%';

  // Show/hide next/finish buttons
  const hasNextQ = qIdx + 1 < questions.length;
  $('btn-next-question').style.display = 'none';
  $('btn-finish-game').style.display = 'none';
  $('btn-end-question').style.display = '';
  $('btn-end-question').onclick = () => onQuestionTimeUp(qIdx);
  $('btn-next-question').onclick = () => launchQuestion(qIdx + 1);
  $('btn-finish-game').onclick = () => endGame();
  $('btn-lb-next').style.display = hasNextQ ? '' : 'none';
  $('btn-lb-finish').textContent = hasNextQ ? 'End Game Early' : 'See Final Results';
  $('btn-lb-next').onclick = () => launchQuestion(qIdx + 1);
  $('btn-lb-finish').onclick = () => endGame();

  updateMiniLeaderboard();
}

// ─── Host Timer ───────────────────────────────────────────
function startHostTimer(endAt, onTimeUp) {
  clearInterval(state.timerInterval);

  const track = $('host-timer-bar');
  const numEl = $('host-timer-num');
  const duration = state.questionDuration;
  let fired = false;

  function tick() {
    const now = Date.now();
    const left = Math.max(0, (endAt - now) / 1000);
    const pct = (left / duration) * 100;

    if (numEl) numEl.textContent = Math.ceil(left);
    if (track) track.style.width = `${pct}%`;

    // Color change when urgent
    if (track) {
      track.style.background = left <= 5
        ? 'linear-gradient(90deg, #ef4444, #f97316)'
        : 'linear-gradient(90deg, #6366f1, #0ea5e9)';
    }

    if (left <= 0 && !fired) {
      fired = true;
      clearInterval(state.timerInterval);
      onTimeUp();
    }
  }

  tick();
  state.timerInterval = setInterval(tick, 500);
}

// ─── Subscribe to Answers ─────────────────────────────────
function subscribeToAnswers(qIdx) {
  if (state.answerChannel) supabase.removeChannel(state.answerChannel);

  const ch = supabase
    .channel(`answers-${state.roomId}-${qIdx}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'player_answers',
        filter: `room_id=eq.${state.roomId}`,
      },
      payload => {
        const ans = payload.new;
        if (ans.question_index !== qIdx) return;

        const idx = ans.answer_index;
        if (idx !== null && idx >= 0 && idx < 4) {
          state.answerCounts[idx]++;
        }
        state.responsesTotal++;
        updateAnswerBars();
      }
    )
    .subscribe();

  state.answerChannel = ch;
}

function updateAnswerBars() {
  const total = state.responsesTotal;
  const playerCount = state.players.length;

  for (let i = 0; i < 4; i++) {
    const cnt = state.answerCounts[i];
    const pct = total > 0 ? Math.round((cnt / Math.max(playerCount, total)) * 100) : 0;
    const bar = $(`host-ans-${i}-bar`);
    const cntEl = $(`host-ans-${i}-count`);
    if (bar) bar.style.width = `${pct}%`;
    if (cntEl) cntEl.textContent = `${cnt} ${cnt === 1 ? 'answer' : 'answers'}`;
  }

  // Response progress bar
  const pct = playerCount > 0 ? Math.min(100, Math.round((total / playerCount) * 100)) : 0;
  $('host-response-count').textContent = total;
  $('host-response-bar').style.width = `${pct}%`;
}

// ─── On Question Timeout ─────────────────────────────────
async function onQuestionTimeUp(qIdx) {
  clearInterval(state.timerInterval);
  if (state.answerChannel) supabase.removeChannel(state.answerChannel);

  $('btn-end-question').style.display = 'none';

  // Update room status → 'results' (signals players to show result screen)
  await supabase
    .from('game_rooms')
    .update({ status: 'results' })
    .eq('id', state.roomId);

  // Grade the question server-side
  await supabase.rpc('grade_question', {
    p_room_id: state.roomId,
    p_question_index: qIdx,
  });

  // Refresh players with new scores
  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('room_id', state.roomId)
    .order('total_score', { ascending: false });

  state.players = players || [];

  const questions = state.selectedQuiz?.questions || [];
  const hasNextQ = qIdx + 1 < questions.length;

  // Show leaderboard
  $('lb-title').textContent = hasNextQ ? `After Q${qIdx + 1}` : 'Final Leaderboard';
  renderLeaderboard('host-leaderboard-list', state.players.slice(0, 8));
  showHostScreen('host-screen-leaderboard');
}

// ─── End Game ─────────────────────────────────────────────
async function endGame() {
  clearInterval(state.timerInterval);
  if (state.realtimeChannel) supabase.removeChannel(state.realtimeChannel);
  if (state.answerChannel) supabase.removeChannel(state.answerChannel);

  state.gameOver = true;

  // Update room to finished
  await supabase
    .from('game_rooms')
    .update({ status: 'finished' })
    .eq('id', state.roomId);

  // Fetch final scores
  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('room_id', state.roomId)
    .order('total_score', { ascending: false });

  state.players = players || [];

  renderLeaderboard('host-final-leaderboard', state.players);
  showHostScreen('host-screen-final');
  setNavStatus('Game Ended');

  $('btn-play-again-host').onclick = () => {
    state.roomId = null;
    state.roomPin = null;
    state.currentQuestionIdx = -1;
    state.players = [];
    state.selectedQuiz = null;
    state.selectedQuizId = null;
    showHostScreen('host-screen-select');
    loadQuizzes();
  };
}

// ─── Leaderboard Renderer ─────────────────────────────────
function renderLeaderboard(containerId, players) {
  const container = $(containerId);
  if (!container) return;

  const medals = ['🥇', '🥈', '🥉'];
  container.innerHTML = '';

  if (players.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:#94a3b8;font-size:0.9rem;padding:1rem;">No players yet.</div>';
    return;
  }

  players.forEach((p, idx) => {
    const row = document.createElement('div');
    const rankClass = idx < 3 ? `rank-${idx + 1}` : '';
    row.className = `leaderboard-row ${rankClass}`;

    const color = AVATAR_BG[p.avatar_idx % AVATAR_BG.length];
    row.innerHTML = `
      <div class="leaderboard-rank">${medals[idx] || idx + 1}</div>
      <div class="leaderboard-avatar" style="background:${color};">${p.nickname[0].toUpperCase()}</div>
      <div class="leaderboard-name">${escapeHTML(p.nickname)}</div>
      <div class="leaderboard-score">${(p.total_score || 0).toLocaleString()}</div>
    `;
    container.appendChild(row);
  });
}

// ─── Mini leaderboard in question screen ─────────────────
function updateMiniLeaderboard() {
  const container = $('host-mini-leaderboard');
  if (!container) return;

  const sorted = [...state.players].sort((a, b) => b.total_score - a.total_score).slice(0, 5);

  if (sorted.length === 0) {
    container.innerHTML = '<div style="font-size:0.8rem;color:#94a3b8;">No scores yet.</div>';
    return;
  }

  container.innerHTML = sorted.map((p, i) => {
    const color = AVATAR_BG[p.avatar_idx % AVATAR_BG.length];
    return `
      <div style="display:flex;align-items:center;gap:0.5rem;padding:0.4rem 0;border-bottom:1px solid #f1f5f9;">
        <span style="font-size:0.75rem;font-weight:700;color:#94a3b8;width:20px;">#${i+1}</span>
        <div style="width:24px;height:24px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:800;color:#fff;">${p.nickname[0].toUpperCase()}</div>
        <span style="flex:1;font-size:0.82rem;font-weight:600;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHTML(p.nickname)}</span>
        <span style="font-size:0.8rem;font-weight:700;color:#6366f1;">${(p.total_score || 0).toLocaleString()}</span>
      </div>
    `;
  }).join('');
}

// ─── Utility ─────────────────────────────────────────────
function escapeHTML(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

// ─── Init ─────────────────────────────────────────────────
initAuth();
