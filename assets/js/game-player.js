/**
 * QuizFlow Live Game — game-player.js
 * Mobile-first player logic:
 *   PIN entry → Nickname → Lobby → Answering → Result → Final
 *
 * Depends on: supabase-config.js (exports `supabase`)
 */

import { supabase } from './supabase-config.js';

// ─── Constants ───────────────────────────────────────────
const TIMER_MAX = 20; // default seconds per question

// Answer button colors / shapes
const ANS_COLORS = ['red', 'blue', 'yellow', 'green'];
const ANS_SHAPES = ['▲', '◆', '⬤', '■'];

// Avatar color names for CSS classes
const AVATAR_CLASSES = ['av-0','av-1','av-2','av-3','av-4','av-5','av-6','av-7'];

// ─── State ───────────────────────────────────────────────
const state = {
  pin: '',
  roomId: null,
  roomRow: null,
  quizData: null,
  playerId: null,
  nickname: '',
  avatarIdx: 0,
  currentQuestionIdx: -1,
  timerInterval: null,
  timerSecondsLeft: TIMER_MAX,
  questionDuration: TIMER_MAX,
  totalScore: 0,
  correctCount: 0,
  hasAnswered: false,
  selectedAnswer: null,
  realtimeChannel: null,
  playerCount: 0,
};

// ─── DOM helpers ─────────────────────────────────────────
const $ = id => document.getElementById(id);

function showScreen(id) {
  document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));
  const el = $(id);
  if (el) el.classList.add('active');
}

function showError(elId, msg) {
  const el = $(elId);
  if (!el) return;
  el.textContent = msg;
  el.classList.add('visible');
}

function hideError(elId) {
  const el = $(elId);
  if (el) el.classList.remove('visible');
}

function setLoading(btnId, textId, spinnerId, loading) {
  const btn = $(btnId);
  const txt = $(textId);
  const spin = $(spinnerId);
  if (btn) btn.disabled = loading;
  if (txt) txt.style.display = loading ? 'none' : '';
  if (spin) spin.style.display = loading ? 'inline-block' : 'none';
}

// ─── Avatar helpers ──────────────────────────────────────
function getAvatarInitial(nickname) {
  return (nickname || '?')[0].toUpperCase();
}

function renderAvatarClass(idx) { return AVATAR_CLASSES[idx % AVATAR_CLASSES.length]; }

// ─── Screen: PIN ─────────────────────────────────────────
function initPinScreen() {
  const inp = $('inp-pin');
  const btn = $('btn-join-pin');

  inp.addEventListener('input', () => {
    hideError('pin-error');
    const raw = inp.value.replace(/\D/g, '').slice(0, 6);
    inp.value = raw;
    btn.disabled = raw.length !== 6;
  });

  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !btn.disabled) btn.click();
  });

  btn.addEventListener('click', handlePinSubmit);
}

async function handlePinSubmit() {
  const pin = $('inp-pin').value.trim();
  if (pin.length !== 6) { showError('pin-error', 'Enter a 6-digit PIN'); return; }

  setLoading('btn-join-pin', 'btn-join-pin-text', 'btn-join-pin-spinner', true);
  hideError('pin-error');

  try {
    // Look up active room by PIN
    const { data: rooms, error } = await supabase
      .from('game_rooms')
      .select('id, status, quiz_id')
      .eq('pin', pin)
      .in('status', ['waiting', 'playing'])
      .limit(1);

    if (error) throw error;
    if (!rooms || rooms.length === 0) {
      showError('pin-error', 'Invalid PIN or game has ended. Ask your teacher for a new PIN.');
      return;
    }

    const room = rooms[0];
    if (room.status === 'playing') {
      showError('pin-error', 'This game is already in progress. Wait for the next round.');
      return;
    }

    state.pin = pin;
    state.roomId = room.id;

    // Fetch quiz data
    const { data: quiz, error: qErr } = await supabase
      .from('quizzes')
      .select('title, questions, timer')
      .eq('id', room.quiz_id)
      .single();

    if (qErr) throw qErr;
    state.quizData = quiz;
    state.questionDuration = quiz.timer || TIMER_MAX;

    showScreen('screen-nickname');
    $('inp-nickname').focus();
  } catch (err) {
    showError('pin-error', err.message || 'Failed to find game. Try again.');
  } finally {
    setLoading('btn-join-pin', 'btn-join-pin-text', 'btn-join-pin-spinner', false);
  }
}

// ─── Screen: Nickname ────────────────────────────────────
function initNicknameScreen() {
  const inp = $('inp-nickname');
  const btn = $('btn-join-nickname');

  inp.addEventListener('input', () => {
    hideError('nickname-error');
    btn.disabled = inp.value.trim().length < 1;
  });

  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !btn.disabled) btn.click();
  });

  btn.addEventListener('click', handleNicknameSubmit);
  $('btn-back-pin').addEventListener('click', () => showScreen('screen-pin'));

  // Avatar picker
  document.querySelectorAll('.avatar-pick-btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.avatar-pick-btn').forEach(x => x.style.borderColor = 'transparent');
      b.style.borderColor = 'white';
      state.avatarIdx = parseInt(b.dataset.av);

      // Update letter on selected avatar buttons
      const nick = inp.value.trim();
      if (nick) {
        document.querySelectorAll('.avatar-pick-btn').forEach((ab) => {
          ab.textContent = String.fromCharCode(65 + parseInt(ab.dataset.av));
        });
      }
    });
  });
}

async function handleNicknameSubmit() {
  const nickname = $('inp-nickname').value.trim();
  if (!nickname) { showError('nickname-error', 'Enter a nickname'); return; }
  if (nickname.length > 20) { showError('nickname-error', 'Nickname must be under 20 characters'); return; }

  setLoading('btn-join-nickname', 'btn-join-nick-text', 'btn-join-nick-spinner', true);
  hideError('nickname-error');

  try {
    // Check nickname uniqueness in room
    const { data: existing } = await supabase
      .from('players')
      .select('id')
      .eq('room_id', state.roomId)
      .ilike('nickname', nickname)
      .limit(1);

    if (existing && existing.length > 0) {
      showError('nickname-error', 'This nickname is taken! Choose another.');
      return;
    }

    // Insert player
    const { data: player, error } = await supabase
      .from('players')
      .insert([{
        room_id: state.roomId,
        nickname,
        avatar_idx: state.avatarIdx,
        total_score: 0,
      }])
      .select()
      .single();

    if (error) throw error;
    state.playerId = player.id;
    state.nickname = nickname;

    // Persist in session storage (page refresh resilience)
    sessionStorage.setItem('qf_player_id', player.id);
    sessionStorage.setItem('qf_room_id', state.roomId);
    sessionStorage.setItem('qf_nickname', nickname);
    sessionStorage.setItem('qf_avatar_idx', state.avatarIdx);

    goToLobby();
  } catch (err) {
    showError('nickname-error', err.message || 'Failed to join. Try again.');
  } finally {
    setLoading('btn-join-nickname', 'btn-join-nick-text', 'btn-join-nick-spinner', false);
  }
}

// ─── Screen: Lobby ───────────────────────────────────────
function goToLobby() {
  // Update lobby UI
  $('lobby-nickname-display').textContent = state.nickname;
  $('lobby-pin-display').textContent = state.pin;
  const avBadge = $('lobby-avatar-badge');
  avBadge.className = `lobby-avatar ${renderAvatarClass(state.avatarIdx)}`;
  avBadge.textContent = getAvatarInitial(state.nickname);
  $('lobby-game-title').textContent = state.quizData?.title || 'Quiz';

  showScreen('screen-lobby');
  subscribeToRoom();
}

// ─── Realtime: Room subscription ─────────────────────────
function subscribeToRoom() {
  if (state.realtimeChannel) {
    supabase.removeChannel(state.realtimeChannel);
  }

  // Poll player count every 3s (simpler than realtime for count)
  updatePlayerCount();
  const countInterval = setInterval(updatePlayerCount, 3000);
  state.countInterval = countInterval;

  // Subscribe to game_rooms changes (host controls game state)
  const channel = supabase
    .channel(`room-${state.roomId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'game_rooms', filter: `id=eq.${state.roomId}` },
      handleRoomUpdate
    )
    .subscribe();

  state.realtimeChannel = channel;
}

async function updatePlayerCount() {
  const { count } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', state.roomId);

  state.playerCount = count || 0;
  const el = $('lobby-player-count');
  if (el) el.textContent = state.playerCount;
}

function handleRoomUpdate(payload) {
  const room = payload.new;
  state.roomRow = room;

  if (room.status === 'playing') {
    // Host started the game
    clearInterval(state.countInterval);
    const qIdx = room.current_question_index;
    if (qIdx !== state.currentQuestionIdx) {
      state.currentQuestionIdx = qIdx;
      showGetReady(qIdx, () => showQuestion(qIdx, room));
    }
  } else if (room.status === 'results') {
    // Show answer result
    showAnswerResult(room);
  } else if (room.status === 'finished') {
    showFinalScreen();
  }
}

// ─── Get Ready Countdown ─────────────────────────────────
function showGetReady(qIdx, callback) {
  showScreen('screen-get-ready');
  const cd = $('get-ready-countdown');
  const qn = $('get-ready-q-num');
  qn.textContent = `Question ${qIdx + 1} of ${state.quizData?.questions?.length || '?'}`;

  let count = 3;
  cd.textContent = count;
  cd.style.animation = 'none'; void cd.offsetWidth; cd.style.animation = 'resultPop 0.4s cubic-bezier(0.34,1.56,0.64,1)';

  const iv = setInterval(() => {
    count--;
    if (count <= 0) {
      clearInterval(iv);
      callback();
    } else {
      cd.textContent = count;
      cd.style.animation = 'none'; void cd.offsetWidth; cd.style.animation = 'resultPop 0.4s cubic-bezier(0.34,1.56,0.64,1)';
    }
  }, 1000);
}

// ─── Screen: Answering ───────────────────────────────────
function showQuestion(qIdx, room) {
  const questions = state.quizData?.questions;
  if (!questions || qIdx >= questions.length) return;

  const q = questions[qIdx];
  state.hasAnswered = false;
  state.selectedAnswer = null;

  // Update answer button texts
  const opts = q.options || q.choices || [];
  for (let i = 0; i < 4; i++) {
    const el = $(`ans-${i}-text`);
    if (el) el.textContent = opts[i] || '';
    const btn = $(`ans-${i}`);
    if (btn) {
      btn.disabled = false;
      btn.classList.remove('selected', 'correct', 'wrong');
      btn.style.opacity = '';
    }
  }

  $('ans-q-label').textContent = `Question ${qIdx + 1}`;

  // Start timer
  const duration = state.questionDuration;
  const endAt = room.question_end_at ? new Date(room.question_end_at) : new Date(Date.now() + duration * 1000);
  startTimer(endAt, duration);

  showScreen('screen-answering');

  // Wire up buttons
  document.querySelectorAll('.answer-btn').forEach(btn => {
    btn.onclick = () => handleAnswer(parseInt(btn.dataset.idx), endAt);
  });
}

// Timer logic
function startTimer(endAt, duration) {
  clearInterval(state.timerInterval);

  const circumference = 2 * Math.PI * 25; // r=25
  const ring = $('timer-ring-fill');
  const num = $('timer-ring-num');
  ring.style.strokeDasharray = circumference;

  function tick() {
    const now = Date.now();
    const secondsLeft = Math.max(0, Math.round((endAt - now) / 1000));
    const pct = secondsLeft / duration;

    ring.style.strokeDashoffset = circumference * (1 - pct);
    num.textContent = secondsLeft;

    if (secondsLeft <= 5) {
      ring.classList.add('urgent');
      num.classList.add('urgent');
    }

    if (secondsLeft <= 0) {
      clearInterval(state.timerInterval);
      if (!state.hasAnswered) {
        disableAnswerButtons();
      }
    }
  }

  tick();
  state.timerInterval = setInterval(tick, 500);
}

async function handleAnswer(idx, endAt) {
  if (state.hasAnswered) return;
  state.hasAnswered = true;
  state.selectedAnswer = idx;
  clearInterval(state.timerInterval);

  // Visual feedback
  document.querySelectorAll('.answer-btn').forEach((btn, i) => {
    btn.disabled = true;
    if (i === idx) btn.classList.add('selected');
    else btn.style.opacity = '0.4';
  });

  // Save to Supabase
  try {
    await supabase
      .from('player_answers')
      .upsert([{
        room_id: state.roomId,
        player_id: state.playerId,
        question_index: state.currentQuestionIdx,
        answer_index: idx,
        answered_at: new Date().toISOString(),
      }], { onConflict: 'player_id,question_index' });
  } catch (err) {
    console.error('Failed to save answer:', err);
  }
}

function disableAnswerButtons() {
  document.querySelectorAll('.answer-btn').forEach(btn => { btn.disabled = true; });
}

// ─── Screen: Answer Result ───────────────────────────────
async function showAnswerResult(room) {
  clearInterval(state.timerInterval);

  // Fetch our answer result from DB
  let isCorrect = false;
  let pointsEarned = 0;

  if (state.playerId && state.currentQuestionIdx >= 0) {
    const { data } = await supabase
      .from('player_answers')
      .select('is_correct, points_earned')
      .eq('player_id', state.playerId)
      .eq('question_index', state.currentQuestionIdx)
      .single();

    if (data) {
      isCorrect = data.is_correct;
      pointsEarned = data.points_earned;
    }

    // Get updated score
    const { data: playerData } = await supabase
      .from('players')
      .select('total_score')
      .eq('id', state.playerId)
      .single();

    if (playerData) state.totalScore = playerData.total_score;
    if (isCorrect) state.correctCount++;
  }

  // Update result UI
  $('result-icon').textContent = state.hasAnswered ? (isCorrect ? '🎉' : '😞') : '⏱️';
  const verdict = $('result-verdict');
  verdict.textContent = !state.hasAnswered ? 'Time\'s Up!' : (isCorrect ? 'Correct!' : 'Wrong!');
  verdict.className = `result-verdict ${isCorrect ? 'correct' : 'wrong'}`;

  const pointsEl = $('result-points');
  pointsEl.textContent = `+${pointsEarned}`;

  // Rank
  const { count: rank } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', state.roomId)
    .gt('total_score', state.totalScore);

  $('result-rank-text').textContent = `Rank #${(rank || 0) + 1}`;

  showScreen('screen-answer-result');
}

// ─── Screen: Final ───────────────────────────────────────
async function showFinalScreen() {
  // Get final score
  const { data: playerData } = await supabase
    .from('players')
    .select('total_score')
    .eq('id', state.playerId)
    .single();

  if (playerData) state.totalScore = playerData.total_score;

  // Get rank
  const { count: rank } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', state.roomId)
    .gt('total_score', state.totalScore);

  $('final-rank').textContent = `#${(rank || 0) + 1}`;
  $('final-score').textContent = state.totalScore.toLocaleString();
  $('final-correct').textContent = state.correctCount;

  showScreen('screen-final');

  // Confetti for top performers
  if ((rank || 0) < 3) launchConfetti();
}

// ─── Confetti ─────────────────────────────────────────────
function launchConfetti() {
  const colors = ['#6366f1','#0ea5e9','#f43f5e','#fbbf24','#4ade80','#a78bfa'];
  for (let i = 0; i < 80; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-particle';
    const size = Math.random() * 8 + 4;
    el.style.cssText = `
      left: ${Math.random() * 100}vw;
      width: ${size}px;
      height: ${size * (Math.random() > 0.5 ? 1 : 2.5)}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${Math.random() * 2 + 2}s;
      animation-delay: ${Math.random() * 1.5}s;
    `;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

// ─── Play Again ──────────────────────────────────────────
function initPlayAgain() {
  $('btn-play-again').addEventListener('click', () => {
    sessionStorage.clear();
    window.location.href = '/pages/index.html';
  });
}

// ─── Session Restore ─────────────────────────────────────
async function tryRestoreSession() {
  const savedPlayerId = sessionStorage.getItem('qf_player_id');
  const savedRoomId = sessionStorage.getItem('qf_room_id');
  const savedNickname = sessionStorage.getItem('qf_nickname');
  const savedAvatar = sessionStorage.getItem('qf_avatar_idx');

  if (!savedPlayerId || !savedRoomId) return false;

  // Check if room still active
  const { data: room } = await supabase
    .from('game_rooms')
    .select('*')
    .eq('id', savedRoomId)
    .in('status', ['waiting','playing','results'])
    .single();

  if (!room) { sessionStorage.clear(); return false; }

  // Restore state
  state.playerId = savedPlayerId;
  state.roomId = savedRoomId;
  state.roomRow = room;
  state.nickname = savedNickname || 'Player';
  state.avatarIdx = parseInt(savedAvatar || '0');
  state.pin = room.pin;

  // Fetch quiz
  const { data: quiz } = await supabase
    .from('quizzes')
    .select('title, questions, timer')
    .eq('id', room.quiz_id)
    .single();

  state.quizData = quiz;
  state.questionDuration = quiz?.timer || TIMER_MAX;

  // Fetch score + correct count
  const { data: playerRow } = await supabase
    .from('players')
    .select('total_score')
    .eq('id', savedPlayerId)
    .single();
  if (playerRow) state.totalScore = playerRow.total_score;

  const { count: correct } = await supabase
    .from('player_answers')
    .select('*', { count: 'exact', head: true })
    .eq('player_id', savedPlayerId)
    .eq('is_correct', true);
  state.correctCount = correct || 0;

  goToLobby();
  return true;
}

// ─── Init ─────────────────────────────────────────────────
async function init() {
  // Set site URL display hint
  const restored = await tryRestoreSession();
  if (!restored) {
    initPinScreen();
    initNicknameScreen();
    initPlayAgain();
  } else {
    initPlayAgain();
  }
}

init();
