const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/quizController");
const rateLimit = require("express-rate-limit");

// Rate Limiters
const createGameLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 game creations per windowMs
  message: { success: false, message: "Too many games created from this IP, please try again in a minute" }
});

const pinJoinLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 game joins per windowMs (prevents PIN brute forcing)
  message: { success: false, message: "Too many join attempts, please try again in a minute" }
});

// Quiz routes
router.get("/quizzes", ctrl.getAllQuizzes);
router.get("/quizzes/:id", ctrl.getQuizById);
router.post("/quizzes", createGameLimiter, ctrl.createQuiz); // Apply to custom quiz creation too

// Game session routes
router.post("/games/create", createGameLimiter, ctrl.createGame);
router.get("/games/:pin", pinJoinLimiter, ctrl.getGame);

module.exports = router;
