const sampleQuizzes = require("../data/quizzes");
const GameStore = require("../models/GameStore");
const xss = require("xss");

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
  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: "Quiz title is required" });
  }
  if (!Array.isArray(questions) || questions.length < 1) {
    return res.status(400).json({ success: false, message: "At least 1 question is required" });
  }
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.text || !q.text.trim()) {
      return res.status(400).json({ success: false, message: `Question ${i + 1} is missing text` });
    }
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      return res.status(400).json({ success: false, message: `Question ${i + 1} must have exactly 4 options` });
    }
    if (q.options.some(o => !o || !o.trim())) {
      return res.status(400).json({ success: false, message: `Question ${i + 1} has an empty option` });
    }
    if (typeof q.correct !== "number" || q.correct < 0 || q.correct > 3) {
      return res.status(400).json({ success: false, message: `Question ${i + 1} has an invalid correct answer index` });
    }
    if (!q.time || q.time < 5 || q.time > 120) {
      questions[i] = { ...q, time: 20 }; // fall back to default
    }
  }
  const id = `quiz_custom_${Date.now()}`;
  const quiz = {
    id,
    title: xss(title.trim()),
    description: xss(description || "Custom quiz"),
    category: xss(category || "Custom"),
    difficulty: xss(difficulty || "Medium"),
    questions: questions.map(q => ({
      ...q,
      text: xss(q.text.trim()),
      options: q.options.map(o => xss(o.trim()))
    }))
  };
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
