import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import AvatarPicker from "../components/AvatarPicker";
import NetworkStatus from "../components/NetworkStatus";
import ThemeToggle from "../components/ThemeToggle";

const API = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

const BLANK_QUESTION = () => ({
  text: "", options: ["", "", "", ""], correct: 0, time: 20,
});

export default function HomePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [tab, setTab] = useState("join");
  const [pin, setPin] = useState(params.get("pin") || "");
  const [nick, setNick] = useState("");
  const [avatar, setAvatar] = useState("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='100' fill='%232a3040'/%3E%3Ccircle cx='100' cy='70' r='40' fill='%23a0aec0'/%3E%3Cpath d='M40 180A60 50 0 0 1 160 180Z' fill='%23a0aec0'/%3E%3C/svg%3E");
  const [showAvatars, setShowAvatars] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const pinRefs = useRef([]);

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
    } finally { setLoading(false); }
  }

  return (
    <div id="app" className="page-with-footer">
      <NetworkStatus />
      <header className="marketing-nav">
        <a className="marketing-brand" href="/">Quiz Template</a>
        <nav className="marketing-links">
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
        </nav>
        <ThemeToggle />
      </header>

      <section id="screen-registration" className="screen active">
        <div className="screen-inner landing-shell">
          <div className="hero landing-hero reveal-up" style={{ marginTop: 0, textAlign: "left", maxWidth: 1020 }}>
            <div className="hero-eyebrow">Premium Interactive Quiz Template</div>
            <h1 className="hero-title">Reusable Quiz Experience Kit</h1>
            <div className="landing-actions" style={{ justifyContent: "flex-start" }}>
              <a className="btn-primary-sq" href="#join-card">Try Participant Flow</a>
              <a className="btn-secondary-sq" href="#how-it-works">See Flow Map</a>
            </div>
          </div>

          <div className="landing-proof reveal-up">
            <span>Realtime room sync</span>
            <span>Host controls + analytics</span>
            <span>Mobile/desktop responsive</span>
            <span>Smooth micro-interactions</span>
          </div>

          <div id="about" className="card glass-card-sq landing-card reveal-up">
            <h2 className="card-title">About This Template</h2>
            <p className="card-subtitle">This structure mirrors a modern quiz platform UI while keeping all copy generic for reuse.</p>
            <div className="landing-about-grid">
              <div className="notice-box"><span className="notice-icon">A</span><span>Structured sections for onboarding, joining, hosting, and results.</span></div>
              <div className="notice-box"><span className="notice-icon">B</span><span>Dark premium visual system with optional light minimal mode.</span></div>
              <div className="notice-box"><span className="notice-icon">C</span><span>Card-first hierarchy with smooth hover, reveal, and button transitions.</span></div>
              <div className="notice-box"><span className="notice-icon">D</span><span>Accessibility-aware contrast, sizing, and focus treatments.</span></div>
            </div>
          </div>

          <div id="join-card" className="card glass-card-sq reveal-up" style={{ maxWidth: 640, width: "100%" }}>
          <div className="flex border-b border-white/10 mb-8 bg-black/20 rounded-xl overflow-hidden p-1 shadow-inner">
            <button onClick={() => { setTab("join"); setErr(""); }} className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${tab === "join" ? "bg-indigo-500 shadow-lg text-white" : "text-slate-400 hover:bg-white/5"}`}>Participant Login</button>
            <button onClick={() => { setTab("create"); setErr(""); }} className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${tab === "create" ? "bg-indigo-500 shadow-lg text-white" : "text-slate-400 hover:bg-white/5"}`}>Host Dashboard</button>
          </div>

          {tab === "join" ? (
            <form onSubmit={handleJoin} className="flex flex-col gap-6">
              <div>
                <h2 className="card-title">Join Session</h2>
                <p className="card-subtitle">Enter placeholder participant information to simulate a join flow.</p>
              </div>

              <div className="form-group">
                <label className="block text-sm text-slate-300 mb-2 font-medium">Game PIN <span className="text-red-400">*</span></label>
                <div className="flex gap-2 justify-between">
                  {[0,1,2,3,4,5].map(i => (
                    <input key={i} ref={el => pinRefs.current[i] = el}
                      value={pin[i] || ""}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, "").slice(-1);
                        if (!val && e.target.value !== "") return;
                        const newPin = (pin || "").split("");
                        newPin[i] = val;
                        setPin(newPin.join(""));
                        if (val && i < 5) pinRefs.current[i + 1].focus();
                      }}
                      onKeyDown={e => {
                        if (e.key === "Backspace" && !pin[i] && i > 0) pinRefs.current[i - 1].focus();
                      }}
                      className="input-sq text-center font-bold text-xl h-12 px-0"
                      style={{ aspectRatio: "1/1" }}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="block text-sm text-slate-300 mb-2 font-medium">Nickname <span className="text-red-400">*</span></label>
                <input type="text" value={nick} onChange={e => setNick(e.target.value.slice(0, 20))} placeholder="e.g. John Doe" className="input-sq" />
              </div>

              <div className="notice-box bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex gap-3 text-sm text-indigo-200">
                <span className="notice-icon text-xl">📌</span>
                <span>Select an avatar below before joining. Play on full-screen to guarantee speed.</span>
              </div>

              {/* Avatar block inline */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm text-slate-300 font-medium">Your Avatar</label>
                  <button type="button" onClick={() => setShowAvatars(!showAvatars)} className="text-xs text-indigo-400 font-semibold tracking-wide uppercase">{showAvatars ? "Hide ▲" : "Change ▼"}</button>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10 shadow-inner">
                  <img src={avatar} alt="Avatar" className="w-12 h-12 object-contain rounded-lg border border-white/10 bg-black/30 p-1" />
                  <span className="text-slate-300 text-sm font-medium">{nick || "Your nickname"}</span>
                </div>
                {showAvatars && <div className="mt-4"><AvatarPicker selected={avatar} onSelect={e => { setAvatar(e); setShowAvatars(false); }} /></div>}
              </div>

              {err && <div className="error-msg text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-lg">⚠️ {err}</div>}

              <button id="btn-start-quiz" type="submit" disabled={loading || pin.length !== 6 || nick.length < 2} className="btn-primary-sq w-full py-3.5 text-lg font-semibold tracking-wide">
                <span id="btn-start-text">{loading ? "Joining Session..." : "Join Quiz →"}</span>
              </button>
            </form>
          ) : (
            <CreatePanel navigate={navigate} />
          )}
          </div>

          <div id="features" className="card glass-card-sq landing-card reveal-up">
            <h2 className="card-title">Core Components</h2>
            <p className="card-subtitle">Reusable pieces that replicate the original UX rhythm.</p>
            <div className="features-grid" style={{ maxWidth: "none", padding: 0, margin: 0 }}>
              <article className="feature-card"><div className="feature-icon">🧭</div><h3>Adaptive Navbar</h3><p>Sticky navigation with theme toggle and responsive links.</p></article>
              <article className="feature-card"><div className="feature-icon">🗂</div><h3>Glass Cards</h3><p>Layered panels for forms, stats, and stage-based quiz content.</p></article>
              <article className="feature-card"><div className="feature-icon">🎛</div><h3>Interaction Buttons</h3><p>Primary and secondary CTA styles with shimmer motion.</p></article>
              <article className="feature-card"><div className="feature-icon">🧪</div><h3>Quiz Surface</h3><p>Question canvas with options, timers, and result transitions.</p></article>
              <article className="feature-card"><div className="feature-icon">📊</div><h3>Result Layer</h3><p>Distribution, ranking, and card-based score summaries.</p></article>
            </div>
          </div>

          <div id="how-it-works" className="card glass-card-sq landing-card reveal-up">
            <h2 className="card-title">Template Flow</h2>
            <p className="card-subtitle">A neutral sequence you can wire to any backend logic.</p>
            <div className="landing-steps">
              <article className="step-item"><span className="step-index">1</span><div><h3>Configure Session</h3><p>Host sets quiz metadata and question inventory.</p></div></article>
              <article className="step-item"><span className="step-index">2</span><div><h3>Share Access Code</h3><p>Participants join using a short room code and nickname.</p></div></article>
              <article className="step-item"><span className="step-index">3</span><div><h3>Run Live Questions</h3><p>Timed rounds with synchronized answer collection.</p></div></article>
              <article className="step-item"><span className="step-index">4</span><div><h3>Reveal Results</h3><p>Display ranking, streaks, and aggregate answer metrics.</p></div></article>
              <article className="step-item"><span className="step-index">5</span><div><h3>Export Insights</h3><p>Review participation and performance records.</p></div></article>
            </div>
          </div>

          <div className="card glass-card-sq landing-card landing-cta reveal-up">
            <h2 className="card-title">Start Building</h2>
            <p className="card-subtitle">Use this screen set as a drop-in base for your own product content.</p>
            <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", justifyContent: "center" }}>
              <a href="#join-card" className="btn-primary-sq">Open Join Module</a>
              <a href="#features" className="btn-secondary-sq">Browse Components</a>
            </div>
          </div>
        </div>
      </section>
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
      <div style={{ display: "flex", background: "transparent", borderRadius: 12, padding: 4, gap: 4 }}>
        {[
          { id: "premade", label: "📚 Use Pre-built" },
          { id: "custom",  label: "✏️ Build Custom"  },
        ].map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); setErr(""); }} style={{
            flex: 1, padding: "9px 6px", borderRadius: 9,
            fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "0.76rem",
            letterSpacing: "0.04em", cursor: "pointer",
            background: mode === m.id ? "rgba(104,138,93,0.18)" : "transparent",
            color: mode === m.id ? "var(--violet)" : "var(--muted)",
                    border: mode === m.id ? "1.5px solid rgba(96,165,250,0.32)" : "1.5px solid transparent",
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
                    background: selId === q.id ? "rgba(96,165,250,0.08)" : "rgba(17,26,45,0.82)",
                    border: selId === q.id ? "1.5px solid rgba(96,165,250,0.32)" : "1.5px solid var(--border)",
                    boxShadow: selId === q.id ? "0 0 20px rgba(96,165,250,0.1)" : "none",
                    transition: "all 0.15s",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{
                        fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "0.88rem",
                        color: selId === q.id ? "var(--text)" : "var(--muted)",
                      }}>{q.title}</span>
                      {selId === q.id && <span style={{ color: "var(--cyan)", fontSize: "0.9rem" }}>✓</span>}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center", flexWrap: "wrap" }}>
                      <span className="badge" style={{
                        background: "transparent", border: "1px solid var(--border)",
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
          {err && <div style={{ color: "#ff7097", fontSize: "0.8rem", padding: "10px 12px", borderRadius: 10, background: "transparent", border: "1px solid rgba(169,90,90,0.2)" }}>⚠️ {err}</div>}
          <button onClick={createFromPremade} disabled={loading || !selId}
            className="btn-primary-sq w-full btn-violet" style={{ width: "100%", padding: "15px" }}>
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
              className="input-sq"
              maxLength={60}
            />
          </div>

          {/* Questions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: "50vh", overflowY: "auto", paddingRight: 2 }}>
            {questions.map((q, qi) => (
              <div key={qi} style={{
                borderRadius: 16, padding: "14px 14px",
                background: "transparent", border: "1.5px solid var(--border)",
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
                        background: "transparent", border: "1px solid var(--border)",
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
                        background: "transparent", border: "1px solid rgba(169,90,90,0.25)",
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
                    width: "100%", background: "transparent",
                    border: "1.5px solid var(--border)", borderRadius: 10,
                    padding: "10px 12px", color: "var(--text)",
                    fontFamily: "var(--font-inter)", fontSize: "0.88rem",
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
                          width: "100%", background: "transparent",
                          border: `1.5px solid ${q.correct === oi ? optionColors[oi] + "80" : "var(--border)"}`,
                          borderRadius: 10, padding: "8px 10px 8px 38px",
                          color: "var(--text)", fontFamily: "var(--font-inter)",
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
                        background: q.correct === oi ? optionColors[oi] + "22" : "rgba(17,26,45,0.72)",
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
              background: "transparent",
              border: "1.5px dashed rgba(96,165,250,0.3)",
              color: "var(--violet)", fontFamily: "var(--font-inter)",
              fontWeight: 700, fontSize: "0.82rem",
              transition: "all 0.15s",
            }}>
              + Add Question ({questions.length}/20)
            </button>
          )}

          {err && <div style={{ color: "#ff7097", fontSize: "0.8rem", padding: "10px 12px", borderRadius: 10, background: "transparent", border: "1px solid rgba(169,90,90,0.2)" }}>⚠️ {err}</div>}

          <button onClick={createFromCustom} disabled={loading}
            className="btn-primary-sq w-full btn-violet" style={{ width: "100%", padding: "15px" }}>
            {loading ? "Creating..." : `🚀 Launch Quiz (${questions.length} Q)`}
          </button>
        </>
      )}
    </div>
  );
}
