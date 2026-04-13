const sampleQuizzes = require("../data/quizzes");
const GameStore = require("../models/GameStore");

// In-memory quiz store (swap with MongoDB in production)
const quizDB = new Map(sampleQuizzes.map(q => [q.id, q]));

/**
 * GET /api/quizzes — list all available quizzes
 */
const getAllQuizzes = (req, res) => {
  const quizzes = Array.from(quizDB.values()).map(q => ({
    id: q.id,
    title: q.title,
    description: q.description,
    category: q.category,
    difficulty: q.difficulty,
    questionCount: q.questions.length
  }));
  res.json({ success: true, quizzes });
};

/**
 * GET /api/quizzes/:id — get full quiz with questions
 */
const getQuizById = (req, res) => {
  const quiz = quizDB.get(req.params.id);
  if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });
  res.json({ success: true, quiz });
};

/**
 * POST /api/quizzes — create a custom quiz
 */
const createQuiz = (req, res) => {
  const { title, description, category, difficulty, questions } = req.body;
  if (!title || !questions || questions.length < 1) {
    return res.status(400).json({ success: false, message: "Title and questions required" });
  }
  const id = `quiz_custom_${Date.now()}`;
  const quiz = { id, title, description, category: category || "Custom", difficulty: difficulty || "Medium", questions };
  quizDB.set(id, quiz);
  res.json({ success: true, quiz });
};

/**
 * POST /api/games/create — host creates a new game session
 */
const createGame = (req, res) => {
  const { quizId, hostId } = req.body;
  const quiz = quizDB.get(quizId);
  if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });
  const session = GameStore.createSession(hostId || `host_${Date.now()}`, quiz);
  res.json({ success: true, pin: session.pin, quizTitle: quiz.title });
};

/**
 * GET /api/games/:pin — get session info (lobby state)
 */
const getGame = (req, res) => {
  const session = GameStore.getSession(req.params.pin);
  if (!session) return res.status(404).json({ success: false, message: "Game not found" });
  res.json({
    success: true,
    pin: session.pin,
    status: session.status,
    quizTitle: session.quiz.title,
    playerCount: session.players.length
  });
};

module.exports = { getAllQuizzes, getQuizById, createQuiz, createGame, getGame };
