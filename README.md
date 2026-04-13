# 🎯 QuizFlow — Real-Time Multiplayer Quiz Platform

A full-stack, Kahoot-style quiz application with WebSocket-powered real-time multiplayer, anti-cheat systems, live leaderboards, and a premium dark neon UI.

---

## ✨ Features

| Feature | Details |
|---|---|
| **Real-Time Sync** | Socket.io WebSockets — questions, answers, leaderboard all sync instantly |
| **Host Dashboard** | Big-screen view: PIN display, player lobby, question display, answer tracking |
| **Player Screen** | Mobile-first: answer buttons, timer, feedback, emoji reactions |
| **Scoring** | Speed-based: `1000 × (remaining_time / total_time)`, min 100 pts |
| **Anti-Cheat** | One answer per round, tab-switch detection, timer lock |
| **Sound Effects** | Web Audio API procedural sounds — no files needed |
| **Confetti** | CSS particle burst on game end |
| **3 Sample Quizzes** | General Knowledge, Tech & Coding, Science |

---

## 🗂️ Folder Structure

```
quizflow/
├── client/                  # React + Vite + Tailwind frontend
│   └── src/
│       ├── pages/
│       │   ├── HomePage.jsx         # Join / Create game
│       │   ├── HostDashboard.jsx    # Full host game management
│       │   └── PlayerScreen.jsx     # Mobile player answer screen
│       ├── components/
│       │   ├── Timer.jsx            # Animated countdown bar
│       │   ├── Leaderboard.jsx      # Animated ranked list
│       │   ├── CountdownOverlay.jsx # 3-2-1-GO! overlay
│       │   └── EmojiReactions.jsx   # Floating emoji reactions
│       ├── context/
│       │   └── SocketContext.jsx    # Socket.io singleton context
│       ├── hooks/
│       │   └── useSound.js          # Web Audio API sounds
│       └── utils/
│           └── scoring.js           # Score formula, confetti, helpers
│
└── server/                  # Node.js + Express + Socket.io backend
    ├── index.js             # Entry point
    ├── data/
    │   └── quizzes.js       # Built-in sample quizzes
    ├── models/
    │   └── GameStore.js     # In-memory session manager
    ├── controllers/
    │   └── quizController.js # REST API handlers
    ├── routes/
    │   └── quizRoutes.js    # API route definitions
    └── sockets/
        └── gameSocket.js    # All Socket.io game logic
```

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
# From the quizflow/ root:
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment variables

```bash
# server/.env  (copy from .env.example)
PORT=3001
CLIENT_URL=http://localhost:5173

# client/.env  (copy from .env.example)
VITE_SERVER_URL=http://localhost:3001
```

### 3. Start the backend

```bash
cd server
npm run dev    # uses nodemon for hot-reload
# Server starts at http://localhost:3001
```

### 4. Start the frontend

```bash
cd client
npm run dev
# App starts at http://localhost:5173
```

---

## 🎮 How to Play

### As Host:
1. Go to `http://localhost:5173`
2. Click **Host Game** tab
3. Select a quiz and click **Create Game**
4. You'll be taken to the Host Dashboard with a **6-digit PIN**
5. Share the PIN with players
6. Click **Start Quiz** when ready

### As Player:
1. Go to `http://localhost:5173` on your phone/browser
2. Enter the **6-digit PIN** and a nickname
3. Click **Join Game**
4. Tap answer buttons when questions appear
5. Faster correct answers = more points!

---

## 🔌 Socket.io Event Reference

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `host:join` | `{ pin }` | Host registers for a game room |
| `host:start` | `{ pin }` | Start the quiz |
| `host:next` | `{ pin }` | Skip to reveal early |
| `host:continue` | `{ pin }` | Move to next question |
| `host:end_game` | `{ pin }` | End game early |
| `player:join` | `{ pin, nickname }` | Player joins lobby |
| `player:answer` | `{ pin, answerIndex }` | Submit answer |
| `player:tab_switch` | `{ pin }` | Tab-switch detected |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `host:joined` | `{ pin, quizTitle, questionCount, players }` | Host confirmed |
| `lobby:update` | `{ players, playerCount }` | Player joined/left |
| `game:starting` | `{ countdown }` | 3-2-1 countdown |
| `question:start` | `{ index, total, text, options, time }` | New question |
| `host:answer_count` | `{ answered, total }` | Live answer counter |
| `player:answer_result` | `{ isCorrect, points, totalScore }` | Private feedback |
| `question:reveal` | `{ correctAnswer, leaderboard, ... }` | Reveal + leaderboard |
| `game:end` | `{ leaderboard, quizTitle }` | Final results |
| `error` | `{ message }` | Error message |

---

## 🌐 Deployment

### Frontend → Vercel
```bash
cd client
npm run build
# Deploy `dist/` to Vercel
# Set env: VITE_SERVER_URL=https://your-backend.railway.app
```

### Backend → Railway / Render
```bash
# Set env vars in Railway/Render dashboard:
PORT=3001
CLIENT_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express 4 |
| Real-time | Socket.io v4 |
| Storage | In-memory (swap GameStore with Redis for production) |
| Fonts | Exo 2, DM Sans, JetBrains Mono |
| Audio | Web Audio API (procedural, no files) |

---

## 🔧 Adding MongoDB (Optional)

Replace the in-memory `quizDB` map in `controllers/quizController.js` with Mongoose:

```js
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);

const Quiz = mongoose.model('Quiz', new mongoose.Schema({
  title: String, category: String, difficulty: String,
  questions: [{ text: String, options: [String], correct: Number, time: Number }]
}));
```

---

## 🏆 Scoring Formula

```
score = 1000 × (remaining_time / total_time)
minimum = 100 points (for any correct answer)
```

Example: Answer in 3s out of 20s → `1000 × (17/20) = 850 pts`

---

Built with ❤️ using React + Socket.io + Tailwind CSS
