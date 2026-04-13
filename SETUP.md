# 🎯 QuizFlow v3 — Setup Guide

## ⚡ Quick Start (5 minutes)

### 1. Extract the zip
```
quizflow/
  client/   ← React frontend
  server/   ← Node.js backend
```

### 2. Install dependencies
```bash
# Backend
cd quizflow/server
npm install

# Frontend
cd quizflow/client
npm install
```

### 3. Create env files
```bash
# server/.env
PORT=3001
CLIENT_URL=http://localhost:5173

# client/.env
VITE_SERVER_URL=http://localhost:3001
```

### 4. Run both (2 terminals)
```bash
# Terminal 1 — Backend
cd server && node index.js

# Terminal 2 — Frontend
cd client && npm run dev
```

Open: http://localhost:5173

---

## 🎮 How to Play
1. Click **Host Game** → pick a quiz → Create → you get a PIN
2. Share the PIN with friends
3. Friends open the URL → enter PIN + nickname + avatar
4. Host clicks **Start Quiz**
5. Questions appear — answer fast for more points!

---

## 🌐 Deploy Free (Permanent)

### Backend → Railway.app
1. Push to GitHub
2. railway.app → New Project → deploy from GitHub
3. Root: `server/`, Start: `node index.js`
4. Add env: `CLIENT_URL=https://your-app.vercel.app`

### Frontend → Vercel.com
1. vercel.com → New Project → GitHub repo
2. Root: `client/`, Build: `npm run build`, Output: `dist`
3. Add env: `VITE_SERVER_URL=https://your-server.railway.app`

---

## 📋 Complete Feature List

### Core Game
- ✅ 6-digit PIN game rooms
- ✅ Real-time WebSocket sync (Socket.io)
- ✅ Host + Player roles
- ✅ 3 built-in quizzes (General, Tech, Science)
- ✅ Speed-based scoring: 1000 × (time_left / total_time)
- ✅ Anti-cheat: one answer per round, tab-switch detection

### UI / Visual
- ✅ Dark neon theme — cyan + violet + pink palette
- ✅ Mesh gradient + dot grid + noise texture backgrounds
- ✅ Floating ambient particles (homepage)
- ✅ Animated gradient headline text
- ✅ Glassmorphism cards with backdrop blur
- ✅ Page enter/exit transitions

### Mobile Player Screen
- ✅ Circular SVG countdown timer with ring animation
- ✅ Large tap-friendly answer buttons (4 colors + icons)
- ✅ Speed badge — BLAZING / FAST / GOOD / SLOW
- ✅ Streak counter — 🔥 5× streak!
- ✅ Mobile haptic feedback (vibration API)
- ✅ Animated score counter (counts up with easing)
- ✅ Avatar picker (24 emoji options)
- ✅ Emoji reactions with floating animations
- ✅ Answer reveal — correct/wrong highlight + glow

### Host Dashboard
- ✅ Big PIN display with neon glow
- ✅ PIN copy button + link share
- ✅ Live player grid in lobby
- ✅ Answer progress bar + per-player dots
- ✅ Answer distribution chart on reveal
- ✅ Question progress dots strip
- ✅ Animated podium (1st/2nd/3rd)
- ✅ Live leaderboard with rank change arrows

### Sound Effects (Web Audio API)
- ✅ Correct answer — ascending chord arpeggio
- ✅ Wrong answer — descending sawtooth + bass thud
- ✅ Countdown — pitch sequence, GO! chord burst
- ✅ Timer tick + urgency beeps (last 5 seconds)
- ✅ Victory fanfare — 8-note melody
- ✅ Player join ping
- ✅ Mute toggle (saved in localStorage)

### Polish
- ✅ Network offline/online banner
- ✅ Loading skeleton screens
- ✅ Animated leaderboard rank-in per row
- ✅ Confetti burst on game end
- ✅ 404 branded not-found page
- ✅ Error toast notifications
