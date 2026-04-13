/**
 * QuizFlow Socket.io Game Logic
 * Handles all real-time communication between host and players.
 */

const GameStore = require("../models/GameStore");
const xss = require("xss");

// Timer references per game PIN
const questionTimers = new Map();

function clearQuestionTimer(pin) {
  if (questionTimers.has(pin)) {
    clearTimeout(questionTimers.get(pin));
    questionTimers.delete(pin);
  }
}

/**
 * Sanitize question for broadcast — remove correct answer for players
 */
function sanitizeQuestion(question, index, total) {
  return {
    index,
    total,
    id: question.id,
    text: question.text,
    // Randomize option order (store shuffle mapping if needed for anti-cheat)
    options: question.options,
    time: question.time,
    points: question.points
  };
}

module.exports = function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // ─────────────────────────────────────────────
    // HOST: Create or rejoin game (after REST API creates session)
    // ─────────────────────────────────────────────
    socket.on("host:join", ({ pin }) => {
      const session = GameStore.getSession(pin);
      if (!session) {
        socket.emit("error", { message: "Game session not found" });
        return;
      }
      // Host joins the Socket.io room for this game
      socket.join(pin);
      socket.data.role = "host";
      socket.data.pin = pin;

      socket.emit("host:joined", {
        pin,
        quizTitle: session.quiz.title,
        questionCount: session.quiz.questions.length,
        questions: session.quiz.questions, // Sent for Host Preview
        players: session.players
      });
      console.log(`[Host] Joined game ${pin}`);
    });

    // ─────────────────────────────────────────────
    // PLAYER: Join a game with PIN + nickname
    // ─────────────────────────────────────────────
    socket.on("player:join", ({ pin, nickname }) => {
      const session = GameStore.getSession(pin);

      if (!session) {
        socket.emit("error", { message: "Invalid PIN. Check and try again!" });
        return;
      }
      if (session.status !== "lobby") {
        socket.emit("error", { message: "Game already started. Too late to join!" });
        return;
      }
      if (!nickname || nickname.trim().length < 1) {
        socket.emit("error", { message: "Please enter a valid nickname" });
        return;
      }

      const sanitizedNickname = xss(nickname.trim());

      // Check for duplicate nickname
      const duplicate = session.players.find(
        p => p.nickname.toLowerCase() === sanitizedNickname.toLowerCase()
      );
      if (duplicate) {
        socket.emit("error", { message: "Nickname already taken. Choose another!" });
        return;
      }

      const player = {
        id: socket.id,
        nickname: sanitizedNickname,
        score: 0,
        emoji: xss(avatar || "/avatars/blank.svg"),
        answers: []
      };

      GameStore.addPlayer(pin, player);
      socket.join(pin);
      socket.data.role = "player";
      socket.data.pin = pin;
      socket.data.nickname = player.nickname;

      // Confirm to the player
      socket.emit("player:joined", {
        playerId: socket.id,
        nickname: player.nickname,
        emoji: player.emoji,
        quizTitle: session.quiz.title
      });

      // Update lobby for everyone
      io.to(pin).emit("lobby:update", {
        players: session.players.map(p => ({ id: p.id, nickname: p.nickname, emoji: p.emoji })),
        playerCount: session.players.length
      });

      console.log(`[Player] ${nickname} joined game ${pin}`);
    });

    // ─────────────────────────────────────────────
    // HOST: Start the quiz
    // ─────────────────────────────────────────────
    socket.on("host:start", ({ pin }) => {
      const session = GameStore.getSession(pin);
      if (!session) return;
      if (session.players.length < 1) {
        socket.emit("error", { message: "Need at least 1 player to start!" });
        return;
      }

      io.to(pin).emit("game:starting", { countdown: 3 });

      // 3 second countdown then first question
      setTimeout(() => {
        broadcastNextQuestion(io, pin);
      }, 3500);
    });

    // ─────────────────────────────────────────────
    // HOST: Skip to next question manually
    // ─────────────────────────────────────────────
    socket.on("host:next", ({ pin }) => {
      clearQuestionTimer(pin);
      revealAnswer(io, pin);
    });

    // ─────────────────────────────────────────────
    // HOST: Proceed after reveal
    // ─────────────────────────────────────────────
    socket.on("host:continue", ({ pin }) => {
      const session = GameStore.getSession(pin);
      if (!session) return;

      const nextIndex = session.currentQuestion + 1;
      if (nextIndex >= session.quiz.questions.length) {
        endGame(io, pin);
      } else {
        broadcastNextQuestion(io, pin);
      }
    });

    // ─────────────────────────────────────────────
    // PLAYER: Submit answer
    // ─────────────────────────────────────────────
    socket.on("player:answer", ({ pin, answerIndex }) => {
      const session = GameStore.getSession(pin);
      if (!session || session.status !== "question") return;

      const result = GameStore.recordAnswer(pin, socket.id, answerIndex);
      if (!result) return; // duplicate answer blocked

      // Private feedback to the answering player
      socket.emit("player:answer_result", {
        isCorrect: result.isCorrect,
        points: result.points,
        correctAnswer: result.correctAnswer,
        totalScore: session.scores[socket.id] || 0
      });

      // Update answer count for host
      const answered = session.submittedThisRound.size;
      const total = session.players.length;
      io.to(pin).emit("host:answer_count", { answered, total });

      // Auto-reveal if all players answered
      if (answered >= total) {
        clearQuestionTimer(pin);
        setTimeout(() => revealAnswer(io, pin), 500);
      }
    });

    // ─────────────────────────────────────────────
    // ANTI-CHEAT: Tab switch detection
    // ─────────────────────────────────────────────
    socket.on("player:tab_switch", ({ pin }) => {
      const session = GameStore.getSession(pin);
      if (!session || session.status !== "question") return;

      // Auto-submit wrong answer (index -1)
      if (!session.submittedThisRound.has(socket.id)) {
        GameStore.recordAnswer(pin, socket.id, -1);
        socket.emit("player:tab_warning", {
          message: "Tab switching detected! Answer auto-submitted."
        });

        const answered = session.submittedThisRound.size;
        io.to(pin).emit("host:answer_count", {
          answered,
          total: session.players.length
        });
      }
    });

    // ─────────────────────────────────────────────
    // HOST: End game early
    // ─────────────────────────────────────────────
    socket.on("host:end_game", ({ pin }) => {
      clearQuestionTimer(pin);
      endGame(io, pin);
    });

    // ─────────────────────────────────────────────
    // DISCONNECT
    // ─────────────────────────────────────────────
    socket.on("disconnect", () => {
      const { role, pin, nickname } = socket.data;
      if (!pin) return;

      const session = GameStore.getSession(pin);
      if (!session) return;

      if (role === "host") {
        // Host left — notify all players
        io.to(pin).emit("game:host_left", { message: "Host disconnected. Game ended." });
        clearQuestionTimer(pin);
        GameStore.deleteSession(pin);
        console.log(`[Host] Left game ${pin} — session deleted`);
      } else if (role === "player") {
        if (session.status === "lobby") {
          // Only remove from lobby, not mid-game
          GameStore.removePlayer(pin, socket.id);
          io.to(pin).emit("lobby:update", {
            players: session.players.map(p => ({ id: p.id, nickname: p.nickname, emoji: p.emoji })),
            playerCount: session.players.length
          });
        }
        console.log(`[Player] ${nickname} left game ${pin}`);
      }
    });
  });
};

// ─────────────────────────────────────────────────────────
// HELPER: Broadcast next question to all clients
// ─────────────────────────────────────────────────────────
function broadcastNextQuestion(io, pin) {
  const session = GameStore.nextQuestion(pin);
  if (!session) return;

  const q = session.quiz.questions[session.currentQuestion];
  const questionData = sanitizeQuestion(
    q,
    session.currentQuestion,
    session.quiz.questions.length
  );

  io.to(pin).emit("question:start", questionData);

  // Auto-reveal when timer runs out
  const timer = setTimeout(() => {
    revealAnswer(io, pin);
  }, q.time * 1000 + 500); // +500ms buffer

  questionTimers.set(pin, timer);
}

// ─────────────────────────────────────────────────────────
// HELPER: Reveal correct answer and show leaderboard
// ─────────────────────────────────────────────────────────
function revealAnswer(io, pin) {
  const session = GameStore.getSession(pin);
  if (!session || session.status === "reveal") return;

  session.status = "reveal";
  const q = session.quiz.questions[session.currentQuestion];
  const leaderboard = GameStore.getLeaderboard(pin);

  io.to(pin).emit("question:reveal", {
    correctAnswer: q.correct,
    correctText: q.options[q.correct],
    distribution: session.answerDistribution,
    leaderboard: leaderboard.slice(0, 10),
    answeredCount: session.submittedThisRound.size,
    totalCount: session.players.length
  });
}

// ─────────────────────────────────────────────────────────
// HELPER: End the game and show final results
// ─────────────────────────────────────────────────────────
function endGame(io, pin) {
  const session = GameStore.getSession(pin);
  if (!session) return;

  session.status = "finished";
  const leaderboard = GameStore.getLeaderboard(pin);

  io.to(pin).emit("game:end", {
    leaderboard,
    quizTitle: session.quiz.title,
    totalQuestions: session.quiz.questions.length
  });

  // Send individual history to each player
  session.players.forEach(p => {
    io.to(p.id).emit("game:history", {
      answers: p.answers || []
    });
  });

  // Clean up after 30 minutes
  setTimeout(() => GameStore.deleteSession(pin), 30 * 60 * 1000);
  console.log(`[Game] Ended: ${pin}`);
}

// ─────────────────────────────────────────────────────────
// HELPER: Random player emoji
// ─────────────────────────────────────────────────────────
function getRandomEmoji() {
  const emojis = ["🦊", "🐯", "🦁", "🐸", "🦄", "🐉", "🦋", "🐺", "🦅", "🐳", "🦊", "🐻", "🦝", "🐧", "🦜"];
  return emojis[Math.floor(Math.random() * emojis.length)];
}
