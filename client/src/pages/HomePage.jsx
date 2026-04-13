import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import AvatarPicker from "../components/AvatarPicker";
import NetworkStatus from "../components/NetworkStatus";

const API = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

const BLANK_QUESTION = () => ({
  text: "",
  options: ["", "", "", ""],
  correct: 0,
  time: 20,
});

export default function HomePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [tab, setTab]         = useState("join");
  const [pin, setPin]         = useState(params.get("pin") || "");
  const [nick, setNick]       = useState("");
  const [avatar, setAvatar]   = useState("🦊");
  const [showAvatars, setShowAvatars] = useState(false);
  const [err, setErr]         = useState("");
  const [loading, setLoading] = useState(false);
  const [muted, setMuted]     = useState(() => localStorage.getItem("qf_muted") === "1");

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    localStorage.setItem("qf_muted", next ? "1" : "0");
  }

  async function handleJoin(e) {
    e.preventDefault(); setErr("");
    if (pin.length !== 6) { setErr("Enter a valid 6-digit PIN"); return; }
    if (nick.trim().length < 2) { setErr("Nickname needs 2+ characters"); return; }
    setLoading(true);
    try {
      await axios.get(`${API}/api/games/${pin}`);
      navigate(`/play/${pin}?nickname=${encodeURIComponent(nick.trim())}&avatar=${encodeURIComponent(avatar)}`);
    } catch {
      setErr("Game not found — double-check the PIN!");
      if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    } finally { setLoading(false); }
  }

  // Floating particles
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1.5,
    dur: Math.random() * 6 + 6,
    delay: Math.random() * 5,
    color: ["var(--cyan)","var(--violet)","var(--pink)","var(--amber)"][Math.floor(Math.random()*4)],
  }));

  return (
    <div className="mesh-bg animate-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      <NetworkStatus />

      {/* Dot grid */}
      <div className="dot-grid" style={{ position: "fixed", inset: 0, opacity: 0.2, pointerEvents: "none" }} />

      {/* Floating particles */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {particles.map(p => (
          <div key={p.id} style={{
            position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size, borderRadius: "50%",
            background: p.color, opacity: 0.35,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            animation: `timerPulse ${p.dur}s ease-in-out ${p.delay}s infinite`,
          }} />
        ))}
      </div>

      {/* Header */}
      <header style={{
        position: "relative", zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 20px",
        borderBottom: "1px solid rgba(28,34,64,0.6)",
        backdropFilter: "blur(20px)",
        gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 14,
            background: "linear-gradient(135deg, var(--violet), var(--cyan))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.2rem", boxShadow: "0 0 24px rgba(124,92,252,0.45)",
            flexShrink: 0,
          }}>🎯</div>
          <div>
            <div style={{
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1rem,4vw,1.3rem)",
              background: "linear-gradient(135deg,var(--cyan),var(--violet))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>QuizFlow</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Real-Time Quiz Platform
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={toggleMute} className="btn-ghost" style={{
            padding: "8px 12px", borderRadius: 10, fontSize: "0.95rem",
          }} title={muted ? "Unmute" : "Mute"}>
            {muted ? "🔇" : "🔊"}
          </button>
          <button onClick={() => setTab("create")} className="btn-ghost" style={{
            padding: "8px 16px", borderRadius: 12,
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "0.8rem", letterSpacing: "0.05em",
          }}>
            Host →
          </button>
        </div>
      </header>

      {/* Hero + Card */}
      <main style={{
        flex: 1, position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "24px 16px 40px",
      }}>
        {/* Headline */}
        <div className="animate-slide-up" style={{ textAlign: "center", marginBottom: 28 }}>
          <div className="badge badge-cyan" style={{ marginBottom: 14, margin: "0 auto 14px" }}>
            <div className="live-dot" />
            Live Multiplayer Quiz
          </div>
          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 800,
            fontSize: "clamp(2.2rem,8vw,5rem)",
            lineHeight: 1.04, marginBottom: 12,
          }}>
            Play Smarter.<br />
            <span className="grad-text">Win Faster.</span>
          </h1>
          <p style={{
            color: "var(--muted)", fontSize: "clamp(0.88rem,2.5vw,1rem)",
            maxWidth: 380, margin: "0 auto", lineHeight: 1.6,
          }}>
            Host or join real-time quizzes. Compete on speed &amp; knowledge. Climb the leaderboard live.
          </p>
        </div>

        {/* Main card */}
        <div className="animate-pop-in glass-bright" style={{
          width: "100%", maxWidth: 480,
          borderRadius: 24, overflow: "hidden",
          animationDelay: "150ms", animationFillMode: "both",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(42,48,96,0.6)",
        }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
            {[
              { id: "join",   label: "🎮 Join Game"  },
              { id: "create", label: "🎯 Host Game"  },
            ].map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setErr(""); }} style={{
                flex: 1, padding: "15px 0",
                fontFamily: "var(--font-display)", fontWeight: 700,
                fontSize: "0.82rem", letterSpacing: "0.06em", textTransform: "uppercase",
                color: tab === t.id ? "var(--cyan)" : "var(--muted)",
                background: tab === t.id ? "rgba(6,247,217,0.05)" : "transparent",
                borderBottom: `2px solid ${tab === t.id ? "var(--cyan)" : "transparent"}`,
                transition: "all 0.2s", cursor: "pointer",
              }}>{t.label}</button>
            ))}
          </div>

          <div style={{ padding: "22px 20px" }}>
            {tab === "join" ? (
              <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* PIN */}
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
                    Game PIN
                  </label>
                  <input
                    value={pin}
                    onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter 6-digit PIN"
                    maxLength={6}
                    autoFocus
                    className="qf-input pin"
                    style={{ fontSize: "clamp(1.4rem,5vw,2rem)", letterSpacing: "0.3em" }}
                    onFocus={e => { e.target.style.borderColor = "var(--cyan)"; e.target.style.boxShadow = "0 0 0 3px rgba(6,247,217,0.12)"; }}
                    onBlur={e  => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
                  />
                  {pin.length > 0 && pin.length < 6 && (
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--muted)", marginTop: 5 }}>
                      {6 - pin.length} more digit{6 - pin.length !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>

                {/* Nickname */}
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
                    Nickname
                  </label>
                  <input
                    value={nick}
                    onChange={e => setNick(e.target.value.slice(0, 20))}
                    placeholder="e.g. QuizMaster99"
                    maxLength={20}
                    className="qf-input"
                    onFocus={e => { e.target.style.borderColor = "var(--violet)"; e.target.style.boxShadow = "0 0 0 3px rgba(124,92,252,0.12)"; }}
                    onBlur={e  => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
                  />
                </div>

                {/* Avatar */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                      Your Avatar
                    </label>
                    <button type="button" onClick={() => setShowAvatars(!showAvatars)} style={{
                      fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--cyan)",
                      background: "none", border: "none", cursor: "pointer",
                    }}>
                      {showAvatars ? "Hide ▲" : "Change ▼"}
                    </button>
                  </div>

                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", borderRadius: 12,
                    background: "rgba(6,8,17,0.6)", border: "1.5px solid var(--border)",
                  }}>
                    <span style={{ fontSize: "1.8rem" }}>{avatar}</span>
                    <span style={{ fontFamily: "var(--font-body)", color: "var(--muted)", fontSize: "0.83rem" }}>
                      {nick || "Your nickname"} · ready to play!
                    </span>
                  </div>

                  {showAvatars && (
                    <div className="animate-slide-up" style={{ marginTop: 10 }}>
                      <AvatarPicker selected={avatar} onSelect={e => { setAvatar(e); setShowAvatars(false); }} />
                    </div>
                  )}
                </div>

                {/* Error */}
                {err && (
                  <div className="animate-pop-in" style={{
                    padding: "11px 14px", borderRadius: 12,
                    background: "rgba(255,61,110,0.08)",
                    border: "1px solid rgba(255,61,110,0.3)",
                    color: "#ff7097", fontSize: "0.83rem",
                    fontFamily: "var(--font-body)",
                  }}>⚠️ {err}</div>
                )}

                <button type="submit" disabled={loading || pin.length !== 6 || nick.length < 2}
                  className="btn-primary" style={{ width: "100%", padding: "15px" }}>
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ animation: "timerPulse 0.7s ease infinite" }}>⏳</span> Joining...
                    </span>
                  ) : "Join Game →"}
                </button>
              </form>
            ) : (
              <CreatePanel navigate={navigate} />
            )}
          </div>
        </div>

        {/* Feature pills */}
        <div className="animate-slide-up" style={{
          display: "flex", gap: 8, flexWrap: "wrap",
          justifyContent: "center", marginTop: 22,
          animationDelay: "280ms", animationFillMode: "both",
        }}>
          {[
            { icon: "⚡", label: "Real-time WebSocket" },
            { icon: "🛡️", label: "Anti-cheat" },
            { icon: "📱", label: "Mobile first" },
            { icon: "🔊", label: "Sound effects" },
            { icon: "🏆", label: "Live leaderboard" },
          ].map(f => (
            <div key={f.label} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 12px", borderRadius: 99,
              background: "rgba(13,16,34,0.7)", border: "1px solid var(--border)",
              color: "var(--muted)", fontSize: "0.72rem",
              fontFamily: "var(--font-body)",
            }}>
              {f.icon} {f.label}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

/* ── Create Game Panel ─────────────────────────────────── */
function CreatePanel({ navigate }) {
  const [mode, setMode]   = useState("premade"); // "premade" | "custom"
  const [quizzes, setQ]   = useState([]);
  const [selId, setSelId] = useState("");
  const [loading, setL]   = useState(false);
  const [fetching, setF]  = useState(true);
  const [err, setErr]     = useState("");

  // Custom quiz state
  const [quizTitle, setQT]   = useState("");
  const [questions, setQs]   = useState([BLANK_QUESTION()]);

  useEffect(() => {
    axios.get(`${API}/api/quizzes`)
      .then(r => { setQ(r.data.quizzes); if (r.data.quizzes[0]) setSelId(r.data.quizzes[0].id); })
      .catch(() => setErr("Could not load pre-made quizzes"))
      .finally(() => setF(false));
  }, []);

  /* ── Premade: create game directly ── */
  async function createFromPremade() {
    if (!selId) return;
    setL(true); setErr("");
    try {
      const hostId = `host_${Date.now()}`;
      const { data } = await axios.post(`${API}/api/games/create`, { quizId: selId, hostId });
      navigate(`/host/${data.pin}?hostId=${hostId}`);
    } catch { setErr("Failed — is the server running?"); }
    finally  { setL(false); }
  }

  /* ── Custom: validate → POST /api/quizzes → create game ── */
  async function createFromCustom() {
    if (!quizTitle.trim()) { setErr("Quiz needs a title"); return; }
    const invalid = questions.findIndex(q =>
      !q.text.trim() || q.options.some(o => !o.trim())
    );
    if (invalid !== -1) { setErr(`Question ${invalid + 1}: fill in all fields`); return; }
    if (questions.length < 1) { setErr("Add at least 1 question"); return; }

    setL(true); setErr("");
    try {
      const hostId = `host_${Date.now()}`;
      // Register custom quiz
      const { data: qData } = await axios.post(`${API}/api/quizzes`, {
        title: quizTitle.trim(),
        description: "Custom quiz",
        category: "Custom",
        difficulty: "Medium",
        questions: questions.map(q => ({
          text: q.text.trim(),
          options: q.options.map(o => o.trim()),
          correct: q.correct,
          time: q.time,
        })),
      });
      // Create game session
      const { data: gData } = await axios.post(`${API}/api/games/create`, {
        quizId: qData.quiz.id, hostId,
      });
      navigate(`/host/${gData.pin}?hostId=${hostId}`);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to create quiz");
    } finally { setL(false); }
  }

  /* ── Question helpers ── */
  function updateQ(idx, field, value) {
    setQs(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  }
  function updateOption(qIdx, oIdx, value) {
    setQs(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const opts = [...q.options];
      opts[oIdx] = value;
      return { ...q, options: opts };
    }));
  }
  function addQuestion() {
    if (questions.length >= 20) return;
    setQs(prev => [...prev, BLANK_QUESTION()]);
  }
  function removeQuestion(idx) {
    if (questions.length <= 1) return;
    setQs(prev => prev.filter((_, i) => i !== idx));
  }

  const diffColors = { Easy: "var(--green)", Medium: "var(--amber)", Hard: "var(--red)" };
  const optionLabels = ["A", "B", "C", "D"];
  const optionColors = ["#e85d6e","#4a90d9","#f5a623","#7ed321"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Mode toggle */}
      <div style={{ display: "flex", background: "rgba(6,8,17,0.6)", borderRadius: 12, padding: 4, gap: 4 }}>
        {[
          { id: "premade", label: "📚 Use Pre-built" },
          { id: "custom",  label: "✏️ Build Custom"  },
        ].map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); setErr(""); }} style={{
            flex: 1, padding: "9px 6px", borderRadius: 9,
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.76rem",
            letterSpacing: "0.04em", cursor: "pointer",
            background: mode === m.id ? "rgba(124,92,252,0.18)" : "transparent",
            color: mode === m.id ? "var(--violet)" : "var(--muted)",
            border: mode === m.id ? "1.5px solid rgba(124,92,252,0.35)" : "1.5px solid transparent",
            transition: "all 0.15s",
          }}>{m.label}</button>
        ))}
      </div>

      {/* PRE-MADE MODE */}
      {mode === "premade" && (
        <>
          <div>
            <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
              Choose Quiz
            </label>
            {fetching ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 62, borderRadius: 14 }} />)}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 230, overflowY: "auto" }}>
                {quizzes.map(q => (
                  <button key={q.id} onClick={() => setSelId(q.id)} style={{
                    textAlign: "left", padding: "12px 14px", borderRadius: 14, cursor: "pointer",
                    background: selId === q.id ? "rgba(6,247,217,0.07)" : "rgba(6,8,17,0.6)",
                    border: selId === q.id ? "1.5px solid rgba(6,247,217,0.4)" : "1.5px solid var(--border)",
                    boxShadow: selId === q.id ? "0 0 20px rgba(6,247,217,0.08)" : "none",
                    transition: "all 0.15s",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{
                        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.88rem",
                        color: selId === q.id ? "var(--text)" : "#a0aec0",
                      }}>{q.title}</span>
                      {selId === q.id && <span style={{ color: "var(--cyan)", fontSize: "0.9rem" }}>✓</span>}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center", flexWrap: "wrap" }}>
                      <span className="badge" style={{
                        background: "rgba(13,16,34,0.8)", border: "1px solid var(--border)",
                        color: "var(--muted)", padding: "2px 8px", fontSize: "0.62rem",
                      }}>{q.category}</span>
                      <span style={{ color: "var(--muted)", fontSize: "0.7rem" }}>{q.questionCount} questions</span>
                      <span style={{ fontSize: "0.7rem", color: diffColors[q.difficulty] || "var(--muted)", fontWeight: 600 }}>
                        {q.difficulty}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {err && <div style={{ color: "#ff7097", fontSize: "0.8rem", padding: "10px 12px", borderRadius: 10, background: "rgba(255,61,110,0.07)", border: "1px solid rgba(255,61,110,0.2)" }}>⚠️ {err}</div>}
          <button onClick={createFromPremade} disabled={loading || !selId}
            className="btn-primary btn-violet" style={{ width: "100%", padding: "15px" }}>
            {loading ? "Creating..." : "Create Game →"}
          </button>
        </>
      )}

      {/* CUSTOM MODE */}
      {mode === "custom" && (
        <>
          {/* Quiz title */}
          <div>
            <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
              Quiz Title
            </label>
            <input
              value={quizTitle}
              onChange={e => setQT(e.target.value.slice(0, 60))}
              placeholder="e.g. Science Bowl Round 1"
              className="qf-input"
              maxLength={60}
            />
          </div>

          {/* Questions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: "50vh", overflowY: "auto", paddingRight: 2 }}>
            {questions.map((q, qi) => (
              <div key={qi} style={{
                borderRadius: 16, padding: "14px 14px",
                background: "rgba(6,8,17,0.7)", border: "1.5px solid var(--border)",
              }}>
                {/* Q header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{
                    fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--violet)",
                    fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                  }}>
                    Q{qi + 1}
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {/* Time selector */}
                    <select
                      value={q.time}
                      onChange={e => updateQ(qi, "time", Number(e.target.value))}
                      style={{
                        background: "rgba(13,16,34,0.9)", border: "1px solid var(--border)",
                        color: "var(--muted)", borderRadius: 8, padding: "4px 8px",
                        fontSize: "0.7rem", fontFamily: "var(--font-mono)", cursor: "pointer",
                      }}
                    >
                      {[10,15,20,30,45,60].map(t => (
                        <option key={t} value={t}>⏱ {t}s</option>
                      ))}
                    </select>
                    {questions.length > 1 && (
                      <button onClick={() => removeQuestion(qi)} style={{
                        background: "rgba(255,61,110,0.1)", border: "1px solid rgba(255,61,110,0.25)",
                        color: "#ff7097", borderRadius: 7, padding: "4px 9px",
                        fontSize: "0.72rem", cursor: "pointer",
                      }}>✕</button>
                    )}
                  </div>
                </div>

                {/* Question text */}
                <textarea
                  value={q.text}
                  onChange={e => updateQ(qi, "text", e.target.value)}
                  placeholder="Type your question here..."
                  rows={2}
                  maxLength={240}
                  style={{
                    width: "100%", background: "rgba(13,16,34,0.8)",
                    border: "1.5px solid var(--border)", borderRadius: 10,
                    padding: "10px 12px", color: "var(--text)",
                    fontFamily: "var(--font-body)", fontSize: "0.88rem",
                    resize: "vertical", outline: "none",
                    transition: "border-color 0.2s",
                    marginBottom: 10,
                  }}
                  onFocus={e => e.target.style.borderColor = "var(--violet)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"}
                />

                {/* Options */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                  {q.options.map((opt, oi) => (
                    <div key={oi} style={{ position: "relative" }}>
                      <div style={{
                        position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                        width: 22, height: 22, borderRadius: 6,
                        background: optionColors[oi] + "33",
                        border: `1px solid ${optionColors[oi]}66`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.65rem", fontFamily: "var(--font-mono)", fontWeight: 700,
                        color: optionColors[oi], pointerEvents: "none", zIndex: 1,
                      }}>
                        {optionLabels[oi]}
                      </div>
                      <input
                        value={opt}
                        onChange={e => updateOption(qi, oi, e.target.value)}
                        placeholder={`Option ${optionLabels[oi]}`}
                        maxLength={100}
                        style={{
                          width: "100%", background: "rgba(13,16,34,0.8)",
                          border: `1.5px solid ${q.correct === oi ? optionColors[oi] + "80" : "var(--border)"}`,
                          borderRadius: 10, padding: "8px 10px 8px 38px",
                          color: "var(--text)", fontFamily: "var(--font-body)",
                          fontSize: "0.8rem", outline: "none",
                          transition: "border-color 0.2s",
                          boxSizing: "border-box",
                        }}
                        onFocus={e => e.target.style.borderColor = optionColors[oi]}
                        onBlur={e => e.target.style.borderColor = q.correct === oi ? optionColors[oi] + "80" : "var(--border)"}
                      />
                    </div>
                  ))}
                </div>

                {/* Correct answer selector */}
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                    ✓ Correct Answer
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {optionLabels.map((lbl, oi) => (
                      <button key={oi} onClick={() => updateQ(qi, "correct", oi)} style={{
                        flex: 1, padding: "7px 4px",
                        borderRadius: 8, cursor: "pointer",
                        background: q.correct === oi ? optionColors[oi] + "22" : "rgba(13,16,34,0.6)",
                        border: `1.5px solid ${q.correct === oi ? optionColors[oi] : "var(--border)"}`,
                        color: q.correct === oi ? optionColors[oi] : "var(--muted)",
                        fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.78rem",
                        transition: "all 0.15s",
                      }}>
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add question btn */}
          {questions.length < 20 && (
            <button onClick={addQuestion} style={{
              padding: "10px", borderRadius: 12, cursor: "pointer",
              background: "rgba(124,92,252,0.06)",
              border: "1.5px dashed rgba(124,92,252,0.35)",
              color: "var(--violet)", fontFamily: "var(--font-display)",
              fontWeight: 700, fontSize: "0.82rem",
              transition: "all 0.15s",
            }}>
              + Add Question ({questions.length}/20)
            </button>
          )}

          {err && <div style={{ color: "#ff7097", fontSize: "0.8rem", padding: "10px 12px", borderRadius: 10, background: "rgba(255,61,110,0.07)", border: "1px solid rgba(255,61,110,0.2)" }}>⚠️ {err}</div>}

          <button onClick={createFromCustom} disabled={loading}
            className="btn-primary btn-violet" style={{ width: "100%", padding: "15px" }}>
            {loading ? "Creating..." : `🚀 Launch Quiz (${questions.length} Q)`}
          </button>
        </>
      )}
    </div>
  );
}
