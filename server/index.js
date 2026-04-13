/**
 * QuizFlow — Main Server Entry Point
 * Express + Socket.io real-time quiz backend
 */

require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const quizRoutes = require("./routes/quizRoutes");
const registerSocketHandlers = require("./sockets/gameSocket");

const app = express();
const server = http.createServer(app);

// ── CORS config ──────────────────────────────────────────
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({
  origin: CLIENT_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// ── Socket.io setup ──────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 20000,
  pingInterval: 10000
});

// Register all socket event handlers
registerSocketHandlers(io);

// ── REST API routes ───────────────────────────────────────
app.use("/api", quizRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "🎯 QuizFlow Server Running",
    version: "1.0.0",
    status: "healthy"
  });
});

// ── Start server ──────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════╗
  ║   🎯 QuizFlow Server Started      ║
  ║   Port: ${PORT}                      ║
  ║   Mode: ${process.env.NODE_ENV || "development"}              ║
  ╚═══════════════════════════════════╝
  `);
});

module.exports = { app, server };
