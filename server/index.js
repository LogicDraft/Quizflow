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

const normalizeOrigin = (origin) => {
  if (!origin || typeof origin !== "string") return origin;
  return origin.endsWith("/") ? origin.slice(0, -1) : origin;
};

const allowedOrigins = CLIENT_URL.split(",")
  .map((origin) => normalizeOrigin(origin.trim()))
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  const normalized = normalizeOrigin(origin);
  return allowedOrigins.includes(normalized);
};

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// ── Socket.io setup ──────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
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
