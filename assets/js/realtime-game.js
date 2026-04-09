import { supabase } from "./supabase-config.js";

const state = {
  role: "player",

  room: null,
  roomChannel: null,
  playersChannel: null,

  player: null,
  playerNickname: "",
  pendingPin: "",

  hostName: "",
  hostQuiz: null,
  hostQuestions: [],

  questionTimerId: null,
  questionEndAtMs: null,
};

const $ = (id) => document.getElementById(id);
const $$ = (q) => Array.from(document.querySelectorAll(q));

function setError(id, message) {
  const el = $(id);
  if (!el) return;
  if (!message) {
    el.classList.remove("show");
    el.textContent = "";
    return;
  }
  el.textContent = message;
  el.classList.add("show");
}

function showRole(role) {
  state.role = role;
  const isPlayer = role === "player";

  $("switch-player").classList.toggle("active", isPlayer);
  $("switch-host").classList.toggle("active", !isPlayer);
  $("switch-player").setAttribute("aria-selected", String(isPlayer));
  $("switch-host").setAttribute("aria-selected", String(!isPlayer));

  $("player-view").classList.toggle("active", isPlayer);
  $("host-view").classList.toggle("active", !isPlayer);
  $("host-view").setAttribute("aria-hidden", String(isPlayer));

  // Ensure a valid screen is visible after switching roles.
  if (isPlayer) {
    const anyActive = $$("#player-view .screen.active").length > 0;
    if (!anyActive) showScreen("player-view", "player-screen-pin");
  } else {
    const anyActive = $$("#host-view .screen.active").length > 0;
    if (!anyActive) showScreen("host-view", "host-screen-setup");
    // Always bring host back to setup when switching from player for clarity.
    showScreen("host-view", "host-screen-setup");
  }

  // Keep URL in sync so reload preserves selected role.
  const url = new URL(window.location.href);
  if (isPlayer) {
    url.searchParams.delete("role");
  } else {
    url.searchParams.set("role", "host");
  }
  window.history.replaceState({}, "", url.toString());
}

function showScreen(prefix, id) {
  $$("#" + prefix + " .screen").forEach((s) => s.classList.remove("active"));
  const target = $(id);
  if (target) target.classList.add("active");
}

function clearTimer() {
  if (state.questionTimerId) {
    clearInterval(state.questionTimerId);
    state.questionTimerId = null;
  }
}

function startLocalTimer(targetId, endAtMs) {
  clearTimer();
  const target = $(targetId);
  state.questionEndAtMs = endAtMs;

  function tick() {
    const left = Math.max(0, Math.ceil((state.questionEndAtMs - Date.now()) / 1000));
    if (target) target.textContent = String(left);
    if (left <= 0) clearTimer();
  }

  tick();
  state.questionTimerId = setInterval(tick, 250);
}

async function loadHostQuizzes() {
  const select = $("host-quiz-select");
  select.innerHTML = "<option value=''>Loading quizzes...</option>";

  const { data, error } = await supabase
    .from("quizzes")
    .select("id, title, questions, config")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    select.innerHTML = "<option value=''>Failed to load quizzes</option>";
    setError("host-setup-error", error.message);
    return;
  }

  const hostName = String($("host-name-input").value || "").trim().toLowerCase();
  const filtered = hostName
    ? (data || []).filter((q) => {
        const owner = String(q?.config?.creator_name || "").trim().toLowerCase();
        return owner === hostName;
      })
    : (data || []);

  const list = filtered.length ? filtered : (data || []);

  if (!list.length) {
    select.innerHTML = "<option value=''>No quizzes available</option>";
    return;
  }

  select.innerHTML = "<option value=''>Select quiz</option>" +
    list.map((q) => `<option value='${q.id}'>${q.title} (${Array.isArray(q.questions) ? q.questions.length : 0} Q)</option>`).join("");

  select.onchange = () => {
    const chosen = list.find((q) => q.id === select.value);
    state.hostQuiz = chosen || null;
    state.hostQuestions = Array.isArray(chosen?.questions) ? chosen.questions : [];
  };
}

async function createRoom() {
  setError("host-setup-error", "");

  const hostName = String($("host-name-input").value || "").trim();
  const quizId = String($("host-quiz-select").value || "").trim();

  if (!hostName) return setError("host-setup-error", "Enter host name.");
  if (!quizId) return setError("host-setup-error", "Select a quiz.");

  state.hostName = hostName;

  const pinRpc = await supabase.rpc("generate_game_pin");
  const pin = pinRpc.data || String(Math.floor(100000 + Math.random() * 900000));

  const insert = await supabase
    .from("game_rooms")
    .insert({
      quiz_id: quizId,
      pin,
      host_id: hostName,
      status: "waiting",
      current_question_index: -1,
      question_duration_ms: 20000,
    })
    .select("*")
    .single();

  if (insert.error) {
    return setError("host-setup-error", insert.error.message);
  }

  state.room = insert.data;
  $("host-pin").textContent = state.room.pin;
  showScreen("host-view", "host-screen-lobby");
  await refreshPlayersGrid();
  subscribeHostChannels();
}

async function findRoomByPin(pin) {
  const res = await supabase
    .from("game_rooms")
    .select("*")
    .eq("pin", pin)
    .in("status", ["waiting", "question_active", "leaderboard"])
    .limit(1);

  if (res.error) throw res.error;
  return (res.data || [])[0] || null;
}

async function playerContinuePin() {
  setError("player-pin-error", "");

  const pin = String($("player-pin-input").value || "").replace(/\D/g, "").slice(0, 6);
  if (pin.length !== 6) return setError("player-pin-error", "Enter a valid 6-digit PIN.");

  const room = await findRoomByPin(pin);
  if (!room) return setError("player-pin-error", "Room not found or already finished.");

  state.pendingPin = pin;
  state.room = room;
  showScreen("player-view", "player-screen-nickname");
}

async function playerJoinLobby() {
  setError("player-nickname-error", "");
  const nickname = String($("player-nickname-input").value || "").trim();
  if (!nickname) return setError("player-nickname-error", "Enter nickname.");

  const exists = await supabase
    .from("players")
    .select("id")
    .eq("room_id", state.room.id)
    .ilike("nickname", nickname)
    .limit(1);

  if ((exists.data || []).length > 0) {
    return setError("player-nickname-error", "Nickname already taken.");
  }

  const ins = await supabase
    .from("players")
    .insert({
      room_id: state.room.id,
      nickname,
      total_score: 0,
    })
    .select("*")
    .single();

  if (ins.error) return setError("player-nickname-error", ins.error.message);

  state.player = ins.data;
  state.playerNickname = nickname;

  $("player-lobby-name").textContent = nickname;
  $("player-lobby-pin").textContent = state.room.pin;

  showScreen("player-view", "player-screen-lobby");
  subscribePlayerRoomChannel();
}

function getQuestionObject(index) {
  return state.hostQuestions[index] || null;
}

function getQuestionOptions(question) {
  if (!question) return ["", "", "", ""];
  if (Array.isArray(question.options)) return question.options;
  if (Array.isArray(question.choices)) return question.choices;
  return ["", "", "", ""];
}

function getCorrectAnswerIndex(question) {
  if (!question) return 0;
  if (typeof question.correct === "number") return question.correct;
  if (typeof question.correctIndex === "number") return question.correctIndex;

  const opts = getQuestionOptions(question);
  const answerText = String(question.answer || "");
  const idx = opts.findIndex((o) => String(o) === answerText);
  return idx >= 0 ? idx : 0;
}

async function hostStartGame() {
  if (!state.room || !state.hostQuestions.length) {
    return setError("host-setup-error", "Selected quiz has no questions.");
  }
  await hostActivateQuestion(0);
}

async function hostActivateQuestion(index) {
  const q = getQuestionObject(index);
  if (!q) return;

  const startIso = new Date().toISOString();
  const upd = await supabase
    .from("game_rooms")
    .update({
      status: "question_active",
      current_question_index: index,
      question_started_at: startIso,
      question_duration_ms: 20000,
    })
    .eq("id", state.room.id)
    .select("*")
    .single();

  if (upd.error) {
    setError("host-setup-error", upd.error.message);
    return;
  }

  state.room = upd.data;
  renderHostQuestion(q, index);
  showScreen("host-view", "host-screen-question");
  startLocalTimer("host-q-timer", Date.now() + 20000);
}

function renderHostQuestion(question, index) {
  $("host-q-index").textContent = `Question ${index + 1}`;
  $("host-q-text").textContent = question.question || question.q || "Question";

  const imgWrap = $("host-q-image-wrap");
  const img = $("host-q-image");
  if (question.image) {
    img.src = question.image;
    imgWrap.classList.remove("hidden");
  } else {
    imgWrap.classList.add("hidden");
  }

  const opts = getQuestionOptions(question);
  for (let i = 0; i < 4; i++) {
    $(`host-opt-${i}`).textContent = String(opts[i] || `Option ${String.fromCharCode(65 + i)}`);
  }
}

async function hostEndQuestion() {
  if (!state.room) return;
  clearTimer();

  const qIndex = state.room.current_question_index;
  const question = getQuestionObject(qIndex);
  const correctIndex = getCorrectAnswerIndex(question);

  const grade = await supabase.rpc("grade_current_question", {
    p_room_id: state.room.id,
    p_question_index: qIndex,
    p_correct_answer_index: correctIndex,
    p_question_duration_ms: state.room.question_duration_ms || 20000,
  });

  if (grade.error) {
    setError("host-setup-error", grade.error.message);
    return;
  }

  const upd = await supabase
    .from("game_rooms")
    .update({ status: "leaderboard" })
    .eq("id", state.room.id)
    .select("*")
    .single();

  if (!upd.error) {
    state.room = upd.data;
  }

  await renderLeaderboard();
  showScreen("host-view", "host-screen-leaderboard");
}

async function hostNextQuestion() {
  if (!state.room) return;
  const next = state.room.current_question_index + 1;
  if (next >= state.hostQuestions.length) {
    return hostFinishGame();
  }
  await hostActivateQuestion(next);
}

async function hostFinishGame() {
  if (!state.room) return;
  await supabase
    .from("game_rooms")
    .update({ status: "finished" })
    .eq("id", state.room.id);

  clearTimer();
  showScreen("host-view", "host-screen-setup");
  state.room = null;
  state.players = [];
}

async function renderLeaderboard() {
  const panel = $("host-leaderboard");
  panel.innerHTML = "";

  const list = await supabase
    .from("players")
    .select("nickname, total_score")
    .eq("room_id", state.room.id)
    .order("total_score", { ascending: false })
    .limit(5);

  (list.data || []).forEach((p, i) => {
    const row = document.createElement("div");
    row.className = "lb-row";
    row.innerHTML = `
      <div class="lb-rank">${i + 1}</div>
      <div class="lb-name">${escapeHtml(p.nickname)}</div>
      <div class="lb-score">${Number(p.total_score || 0).toLocaleString()}</div>
    `;
    panel.appendChild(row);
  });

  if (!panel.children.length) {
    panel.innerHTML = "<div class='subtitle'>No players yet.</div>";
  }
}

async function refreshPlayersGrid() {
  if (!state.room) return;
  const grid = $("host-players-grid");
  const count = $("host-player-count");

  const res = await supabase
    .from("players")
    .select("id, nickname")
    .eq("room_id", state.room.id)
    .order("joined_at", { ascending: true });

  const players = res.data || [];
  count.textContent = String(players.length);
  $("host-start-game").disabled = players.length < 1;

  grid.innerHTML = players.map((p) => `<div class='player-chip'>${escapeHtml(p.nickname)}</div>`).join("");
}

function subscribeHostChannels() {
  if (!state.room) return;

  if (state.playersChannel) supabase.removeChannel(state.playersChannel);

  state.playersChannel = supabase
    .channel(`host-players-${state.room.id}`)
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "players",
      filter: `room_id=eq.${state.room.id}`,
    }, () => {
      void refreshPlayersGrid();
      if (state.room?.status === "leaderboard") {
        void renderLeaderboard();
      }
    })
    .subscribe();
}

function subscribePlayerRoomChannel() {
  if (!state.room) return;

  if (state.roomChannel) supabase.removeChannel(state.roomChannel);

  state.roomChannel = supabase
    .channel(`player-room-${state.room.id}`)
    .on("postgres_changes", {
      event: "UPDATE",
      schema: "public",
      table: "game_rooms",
      filter: `id=eq.${state.room.id}`,
    }, (payload) => {
      state.room = payload.new;
      void handlePlayerRoomUpdate();
    })
    .subscribe();
}

async function handlePlayerRoomUpdate() {
  if (!state.room || !state.player) return;

  const status = state.room.status;

  if (status === "waiting") {
    showScreen("player-view", "player-screen-lobby");
    return;
  }

  if (status === "question_active") {
    showScreen("player-view", "player-screen-question");

    const qIndex = Number(state.room.current_question_index || 0);
    $("player-question-label").textContent = `Question ${qIndex + 1}`;

    const startedMs = new Date(state.room.question_started_at || Date.now()).getTime();
    const endMs = startedMs + Number(state.room.question_duration_ms || 20000);
    startLocalTimer("player-timer", endMs);

    $$(".shape-btn").forEach((btn) => {
      btn.disabled = false;
    });

    return;
  }

  if (status === "leaderboard") {
    clearTimer();
    await renderPlayerResult();
    showScreen("player-view", "player-screen-result");
    return;
  }

  if (status === "finished") {
    clearTimer();
    const panel = $("player-result-panel");
    panel.className = "result-panel correct";
    $("player-result-title").textContent = "Game Finished";
    $("player-result-points").textContent = "Thanks for playing";
    showScreen("player-view", "player-screen-result");
  }
}

async function renderPlayerResult() {
  const qIndex = Number(state.room.current_question_index || 0);
  const ans = await supabase
    .from("player_answers")
    .select("is_correct, points_earned")
    .eq("player_id", state.player.id)
    .eq("question_index", qIndex)
    .limit(1);

  const row = (ans.data || [])[0];
  const panel = $("player-result-panel");
  const ok = !!row?.is_correct;

  panel.className = `result-panel ${ok ? "correct" : "wrong"}`;
  $("player-result-title").textContent = ok ? "Correct!" : "Incorrect";
  $("player-result-points").textContent = ok ? `+${row?.points_earned || 0}` : "+0";
}

async function submitPlayerAnswer(answerIndex) {
  if (!state.room || !state.player) return;

  const qIndex = Number(state.room.current_question_index || 0);
  const startedMs = new Date(state.room.question_started_at || Date.now()).getTime();
  const reaction = Math.max(0, Date.now() - startedMs);

  $$(".shape-btn").forEach((btn) => {
    btn.disabled = true;
  });

  const ins = await supabase
    .from("player_answers")
    .insert({
      player_id: state.player.id,
      room_id: state.room.id,
      question_index: qIndex,
      answer_index: answerIndex,
      reaction_time_ms: reaction,
    });

  if (ins.error) {
    // Ignore duplicate insert race for same question.
    if (!String(ins.error.message || "").toLowerCase().includes("duplicate")) {
      console.warn(ins.error.message);
    }
  }
}

function escapeHtml(v) {
  return String(v || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function wireEvents() {
  $("switch-player").addEventListener("click", () => showRole("player"));
  $("switch-host").addEventListener("click", () => showRole("host"));

  const pinInput = $("player-pin-input");
  const pinContinue = $("player-pin-continue");

  pinInput.addEventListener("input", () => {
    pinInput.value = pinInput.value.replace(/\D/g, "").slice(0, 6);
    pinContinue.disabled = pinInput.value.length !== 6;
    setError("player-pin-error", "");
  });

  pinContinue.addEventListener("click", () => { void playerContinuePin(); });
  $("player-nickname-join").addEventListener("click", () => { void playerJoinLobby(); });

  $$(".shape-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.answerIndex || 0);
      void submitPlayerAnswer(idx);
    });
  });

  $("host-name-input").addEventListener("blur", () => { void loadHostQuizzes(); });
  $("host-create-room").addEventListener("click", () => { void createRoom(); });
  $("host-start-game").addEventListener("click", () => { void hostStartGame(); });
  $("host-end-question").addEventListener("click", () => { void hostEndQuestion(); });
  $("host-next-question").addEventListener("click", () => { void hostNextQuestion(); });
  $("host-finish-game").addEventListener("click", () => { void hostFinishGame(); });
}

async function init() {
  try {
    wireEvents();
    const params = new URLSearchParams(window.location.search);
    const wantedRole = (params.get("role") || "").toLowerCase();
    showRole(wantedRole === "host" ? "host" : "player");
    await loadHostQuizzes();
  } catch (err) {
    console.error("Failed to initialize app:", err);
  }
}

void init();
