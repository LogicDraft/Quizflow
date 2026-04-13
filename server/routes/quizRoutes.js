const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/quizController");

// Quiz routes
router.get("/quizzes", ctrl.getAllQuizzes);
router.get("/quizzes/:id", ctrl.getQuizById);
router.post("/quizzes", ctrl.createQuiz);

// Game session routes
router.post("/games/create", ctrl.createGame);
router.get("/games/:pin", ctrl.getGame);

module.exports = router;
