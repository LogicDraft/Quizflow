# QuizFlow — Single-File Live Quiz Game

## Concept & Vision

QuizFlow is a high-energy, Kahoot-style multiplayer quiz platform that transforms any gathering into an electrifying competition. The experience prioritizes adrenaline—every millisecond counts, every correct answer feels like a victory, and every leaderboard shift creates a moment of drama. The design language is bold, colorful, and unapologetically fun—think arcade meets quiz show.

## Design Language

### Aesthetic Direction
**Reference:** Kahoot meets TikTok—vibrant, kinetic, and unmistakably "game." Bold gradients, large typography, and animations that reward interaction.

### Color Palette
- **Primary:** `#6366f1` (Indigo) — trust, energy
- **Secondary:** `#0ea5e9` (Sky Blue) — playfulness
- **Accent:** `#f43f5e` (Rose) — urgency, excitement
- **Background:** `#0f0c29` → `#302b63` → `#24243e` (Deep space gradient)
- **Surface:** `rgba(255,255,255,0.06)` (Frosted glass)
- **Text:** `#ffffff` (pure white on dark)

**Answer Tile Colors (Kahoot-inspired):**
- Red: `#E21B3C`
- Blue: `#1368CE`
- Yellow: `#D89E00`
- Green: `#26890C`

### Typography
- **Display:** 'Outfit' (Google Fonts) — geometric, modern, excellent for large numbers
- **Body:** 'Ubuntu' (Google Fonts) — friendly, readable

### Spatial System
- 8px base unit
- Cards: 20px border-radius, 2rem padding
- Buttons: 12px border-radius, 0.95rem vertical padding
- Grid gaps: 0.75rem for answer tiles

### Motion Philosophy
- **Entrance:** `cubic-bezier(0.34, 1.56, 0.64, 1)` — springy overshoot
- **Transitions:** 150-200ms for micro-interactions
- **Countdown:** Linear countdown ring animation
- **Celebration:** Confetti particles on final podium
- **Feedback:** Scale bounce on correct answer, opacity reduction on wrong

### Visual Assets
- Bootstrap Icons for UI elements
- Emoji for avatar representation
- SVG timer ring with animated stroke-dashoffset

## Layout & Structure

### Architecture
Single HTML file containing:
1. Player Flow (Mobile-first)
2. Host Flow (Desktop-optimized)
3. Shared Supabase Realtime integration
4. All CSS embedded
5. All JS embedded

### Screen Flow

**Player Flow:**
```
PIN Entry → Nickname Entry → Waiting Lobby → Get Ready (3-2-1) → Answer Screen → Result Feedback → (repeat or) Final Score
```

**Host Flow:**
```
Auth Login → Quiz Selection → Lobby (PIN + Players) → Question Control → Leaderboard → Final Podium
```

### Responsive Strategy
- Player screens: 100vh centered, mobile-first
- Host screens: Full viewport with sticky nav, scrollable content areas
- Answer grid: 2x2 on mobile, maintains large touch targets

## Features & Interactions

### Host Game Flow

#### 1. Lobby Screen
- Giant 6-digit PIN display with gradient text and glow effect
- Animated player join list (chips slide in with spring animation)
- Real-time player count badge
- "Start Game" button (disabled until 1+ players)
- Site URL display for easy sharing
- "Cancel Game" option

#### 2. Question Screen
- Full-screen question text (large, readable)
- 4 colored answer tiles showing answer text
- Circular countdown timer ring (20 seconds default)
- Timer changes color (purple → red) when ≤5 seconds remain
- Live answer count bar showing X/Y players responded
- Mini leaderboard showing top 5 scores
- "End Question" button for manual advancement

#### 3. Answer Reveal Screen
- Correct answer highlighted with white border glow
- Wrong answers crossed out (reduced opacity)
- Animated bar chart showing distribution of answers
- Player counts per answer option

#### 4. Leaderboard Screen
- Top 5 (or all) players with rank medals
- Rank change arrows (↑↓) based on previous position
- Staggered animation for each row
- "Next Question" or "See Final Results" button
- Gold/Silver/Bronze special styling for top 3

#### 5. Final Podium Screen
- Top 3 podium display with trophy emoji
- Confetti cannon animation (50+ particles)
- Exportable results (copy to clipboard)
- "Play Again" and "Back to Home" options

### Player Flow (Mobile-first)

#### 1. PIN Entry
- Giant numeric input field
- Auto-advance focus after each digit
- Large "Join Game" button
- Link to host view

#### 2. Nickname Entry
- Fun emoji/avatar picker (8 color options)
- Name field (max 20 chars)
- "Let's Go!" button

#### 3. Waiting Lobby
- "You're in! 🎉" celebration text
- Bouncing animation while waiting
- Player nickname + avatar badge
- Current game PIN display
- Live player count
- Pulsing indicator

#### 4. Answer Screen
- **NO question text** — only 4 massive colored buttons
- Shape icons inside: ▲ ◆ ● ■
- Circular timer ring at top
- Question number indicator
- Tap locks answer immediately
- Visual feedback on selection (scale + opacity)
- Buttons disabled after selection

#### 5. Result Feedback
- Full-screen ✅ or ❌
- Points earned with bonus description ("+850 pts — Fast!")
- Current rank badge
- Auto-advance to next question or final score

## Component Inventory

### Host Components

#### PIN Display
- States: Default, Copied (flash animation)
- Gradient text, letter-spacing, drop-shadow glow

#### Player Chip
- States: Default, Entering (slide-in animation)
- Avatar circle + nickname text
- 8 color variants

#### Answer Tile (Host View)
- States: Default, Revealed (correct highlight, wrong fade)
- Contains: colored background, text, bar chart below

#### Timer Ring
- States: Normal (purple), Urgent (≤5s, red), Finished (empty)
- SVG circle with animated stroke-dashoffset

#### Leaderboard Row
- States: Default, Gold (#1), Silver (#2), Bronze (#3)
- Contains: rank medal, avatar, name, score

### Player Components

#### Large Answer Button
- States: Default, Hover, Selected, Correct, Wrong, Disabled
- Contains: shape icon, answer text
- Full viewport minus header

#### Timer Ring (Player)
- Same as host but positioned in header
- Countdown number in center

#### Result Screen
- States: Correct (green), Wrong (red)
- Large icon, verdict text, points, rank

## Technical Approach

### Stack
- **Frontend:** Vanilla HTML/CSS/JS (single file)
- **Backend:** Supabase (PostgreSQL + Realtime)
- **Auth:** Supabase Auth (email/password for hosts)

### Supabase Schema
```sql
-- quizzes: id, title, questions (jsonb), created_at
-- game_rooms: id, quiz_id, pin, status, current_question_index, question_end_at
-- players: id, room_id, nickname, avatar_idx, total_score, joined_at
-- player_answers: id, room_id, player_id, question_index, answer_index, is_correct, points_earned, answered_at
```

### Realtime Subscriptions
- `game_rooms` — status changes (waiting → playing → results → finished)
- `players` — new player joins
- `player_answers` — live answer counts during questions

### State Management
Single global state object with:
- Current screen
- Room/PIN info
- Player data
- Question index
- Timer state
- Realtime channels

### Key Functions
- `generatePIN()` — 6-digit random
- `subscribeToRoom()` — Realtime listener
- `submitAnswer()` — Lock in player's choice
- `gradeQuestion()` — Server-side scoring
- `renderLeaderboard()` — Sorted player display
- `launchConfetti()` — Particle animation

### Scoring Formula
```
points = max(200, round(1000 * (secondsRemaining / 20)))
```
- Faster answers = more points
- Minimum 200 points for any correct answer
- 0 points for wrong answers
