/**
 * GameStore — In-memory store for active QuizFlow game sessions.
 * Replaces Redis for simplicity; swap with Redis for production.
 */

const sessions = new Map(); // pin → gameSession

/**
 * Generate a unique 6-digit PIN
 */
function generatePIN() {
  let pin;
  do {
    pin = Math.floor(100000 + Math.random() * 900000).toString();
  } while (sessions.has(pin));
  return pin;
}

/**
 * Create a new game session
 */
function createSession(hostId, quiz) {
  const pin = generatePIN();
  const session = {
    pin,
    hostId,
    quiz,
    players: [],           // { id, nickname, score, answers: [], rank: 0 }
    currentQuestion: -1,   // index into quiz.questions
    status: "lobby",       // lobby | question | reveal | leaderboard | finished
    questionStartTime: null,
    scores: {},            // playerId → total score
    submittedThisRound: new Set(),
    answerDistribution: {}, // { optionIndex: count }
    createdAt: Date.now()
  };
  sessions.set(pin, session);
  return session;
}

/**
 * Get a session by PIN
 */
function getSession(pin) {
  return sessions.get(pin) || null;
}

/**
 * Delete a session
 */
function deleteSession(pin) {
  sessions.delete(pin);
}

/**
 * Add a player to a session
 */
function addPlayer(pin, player) {
  const s = sessions.get(pin);
  if (!s) return null;
  s.players.push(player);
  s.scores[player.id] = 0;
  return s;
}

/**
 * Remove a player from a session
 */
function removePlayer(pin, playerId) {
  const s = sessions.get(pin);
  if (!s) return;
  s.players = s.players.filter(p => p.id !== playerId);
  delete s.scores[playerId];
}

/**
 * Advance to the next question
 */
function nextQuestion(pin) {
  const s = sessions.get(pin);
  if (!s) return null;
  s.currentQuestion++;
  s.status = "question";
  s.questionStartTime = Date.now();
  s.submittedThisRound = new Set();
  s.answerDistribution = {};
  return s;
}

/**
 * Record a player's answer and compute score
 */
function recordAnswer(pin, playerId, answerIndex) {
  const s = sessions.get(pin);
  if (!s) return null;

  // Anti-cheat: only one answer per round
  if (s.submittedThisRound.has(playerId)) return null;
  s.submittedThisRound.add(playerId);

  // Track distribution
  s.answerDistribution[answerIndex] = (s.answerDistribution[answerIndex] || 0) + 1;

  const q = s.quiz.questions[s.currentQuestion];
  const elapsed = (Date.now() - s.questionStartTime) / 1000;
  const remaining = Math.max(0, q.time - elapsed);
  const isCorrect = answerIndex === q.correct;

  let points = 0;
  if (isCorrect) {
    points = Math.round(1000 * (remaining / q.time));
    points = Math.max(points, 100); // minimum 100 pts for correct answer
  }

  s.scores[playerId] = (s.scores[playerId] || 0) + points;

  const player = s.players.find(p => p.id === playerId);
  if (player) {
    player.score = s.scores[playerId];
    player.lastAnswer = answerIndex;
    player.lastCorrect = isCorrect;
    player.lastPoints = points;
    
    // Store history for the post-game breakdown
    if (!player.answers) player.answers = [];
    player.answers.push({
      questionIndex: s.currentQuestion,
      isCorrect,
      points,
      elapsed,
      reactionTimeFormatted: elapsed < 5 ? "FAST" : elapsed < 1 ? "BLAZING!" : ""
    });
  }

  return { isCorrect, points, correctAnswer: q.correct };
}

/**
 * Build sorted leaderboard from current session scores
 */
function getLeaderboard(pin) {
  const s = sessions.get(pin);
  if (!s) return [];

  return [...s.players]
    .sort((a, b) => (s.scores[b.id] || 0) - (s.scores[a.id] || 0))
    .map((p, i) => ({
      rank: i + 1,
      id: p.id,
      nickname: p.nickname,
      score: s.scores[p.id] || 0,
      lastPoints: p.lastPoints || 0,
      lastCorrect: p.lastCorrect || false
    }));
}

module.exports = {
  createSession,
  getSession,
  deleteSession,
  addPlayer,
  removePlayer,
  nextQuestion,
  recordAnswer,
  getLeaderboard
};
