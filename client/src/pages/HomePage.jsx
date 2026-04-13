import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import AvatarPicker from "../components/AvatarPicker";
import NetworkStatus from "../components/NetworkStatus";
import ThemeToggle from "../components/ThemeToggle";

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
  const [avatar, setAvatar]   = useState("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='100' fill='%232a3040'/%3E%3Ccircle cx='100' cy='70' r='40' fill='%23a0aec0'/%3E%3Cpath d='M40 180A60 50 0 0 1 160 180Z' fill='%23a0aec0'/%3E%3C/svg%3E");
  const [showAvatars, setShowAvatars] = useState(false);
  const [err, setErr]         = useState("");
  const [loading, setLoading] = useState(false);
  const [muted, setMuted]     = useState(() => localStorage.getItem("qf_muted") === "1");
  const pinRefs = useRef([]);

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

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

  return (
    <div className="mesh-bg animate-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      <NetworkStatus />

      {/* Dot grid */}
      <div className="dot-grid" style={{ position: "fixed", inset: 0, opacity: 0.2, pointerEvents: "none" }} />

      {/* Header */}
      <header className="site-header">
        <div className="site-header-inner">
          <a href="#top" className="brand-wordmark" aria-label="QuizFlow home">
            <div className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div className="brand-copy">
              <div className="brand-title">QuizFlow</div>
              <div className="brand-subtitle">Invite-only secure quizzes</div>
            </div>
          </a>

          <nav className="topbar-actions" aria-label="Primary">
            {[
              { id: "about", label: "About" },
              { id: "features", label: "Features" },
              { id: "works", label: "How It Works" },
              { id: "setup", label: "Setup Guide" },
            ].map(item => (
              <button key={item.id} type="button" className="btn-ghost" style={{ padding: "8px 12px", borderRadius: 999, fontSize: "0.78rem", letterSpacing: "0.02em" }} onClick={() => scrollTo(item.id)}>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="topbar-actions">
            <button type="button" className="btn-primary-sq" style={{ padding: "10px 16px", borderRadius: 16 }} onClick={() => { setTab("create"); scrollTo("launch"); }}>
              Create Quiz
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero + Card */}
      <main className="page-main" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
        <section id="top" className="hero-block" style={{ padding: "1rem 0 2.25rem" }}>
          <div className="hero-eyebrow">Modern Secure Quiz App Experience</div>
          <h1 className="hero-title" style={{ maxWidth: 1100, margin: "0 auto" }}>
            Secure Quiz app - Smart <br />&amp; Secure Quiz Platform
          </h1>
          <p className="hero-copy" style={{ maxWidth: 820 }}>
            Host or join real-time quizzes with a clean, invite-only flow. The experience stays simple, fast, and readable on every screen.
          </p>

          <div className="pill-row" style={{ justifyContent: "center", marginTop: "1.7rem" }}>
            <button type="button" className="btn-primary-sq" onClick={() => { setTab("create"); scrollTo("launch"); }}>
              Create a Quiz
            </button>
            <button type="button" className="btn-secondary-sq" onClick={() => scrollTo("works")}>
              How It Works
            </button>
          </div>

          <div className="hero-proof" aria-label="Highlights">
            {[
              "Invite-only access",
              "Live dashboard analytics",
              "Works on mobile + desktop",
              "Share link in seconds",
            ].map(item => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </section>

        <section id="about" className="glass-card-sq" style={{ padding: "1.35rem", marginTop: "1.5rem" }}>
          <div style={{ maxWidth: 760 }}>
            <div className="hero-eyebrow" style={{ marginBottom: 0.6 }}>About SecureQuiz</div>
            <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 3vw, 2.25rem)", letterSpacing: "-0.03em", color: "var(--text)" }}>
              Secure Quiz app built for anyone who wants to run or take quizzes quickly and securely.
            </h2>
          </div>

          <div className="section-shell" style={{ marginTop: "1.15rem" }}>
            {[
              {
                title: "Create in minutes",
                copy: "Simple question and option inputs with no setup overhead.",
              },
              {
                title: "Share instantly",
                copy: "Generate a quiz link, send the PIN, and bring players in fast.",
              },
              {
                title: "Track live results",
                copy: "See submissions, answer splits, and rankings in real time.",
              },
              {
                title: "Reduce cheating",
                copy: "Built-in monitoring keeps the experience honest and focused.",
              },
            ].map((item, index) => (
              <div key={item.title} className="meta-card" style={{ alignItems: "flex-start", padding: "1rem", minHeight: 112 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 999,
                  display: "grid", placeItems: "center",
                  background: index === 0 ? "rgba(96,165,250,0.12)" : index === 1 ? "rgba(47,111,58,0.12)" : index === 2 ? "rgba(139,92,246,0.12)" : "rgba(245,158,11,0.12)",
                  color: "var(--text)", border: "1px solid var(--border)", flexShrink: 0,
                  fontFamily: "var(--font-mono)", fontWeight: 700,
                }}>
                  {index + 1}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "var(--text)" }}>{item.title}</div>
                  <div style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>{item.copy}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="pill-row" style={{ justifyContent: "center", marginTop: "1.5rem" }}>
          {[
            "Modern UI",
            "Invite-only access",
            "Live dashboards",
            "Mobile-first flows",
          ].map(item => (
            <span key={item}>{item}</span>
          ))}
        </section>

        <section id="works" className="section-shell" style={{ marginTop: "1.75rem", alignItems: "stretch" }}>
          <div className="glass-card-sq" style={{ padding: "1.35rem" }}>
            <div className="hero-eyebrow" style={{ marginBottom: 8 }}>How It Works</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.8rem", letterSpacing: "-0.03em", marginBottom: 18, color: "var(--text)" }}>
              A simple flow from setup to live play.
            </div>
            <div className="panel-stack">
              {[
                ["01", "Create or pick a quiz", "Start from a template or build your own question set."],
                ["02", "Share the access PIN", "Send the room code and let players join from any device."],
                ["03", "Run the game live", "Watch the leaderboard, answer stats, and results update in real time."],
              ].map(step => (
                <div key={step[0]} className="meta-card" style={{ alignItems: "flex-start" }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 14,
                    display: "grid", placeItems: "center",
                    background: "rgba(26,37,23,0.06)", color: "var(--text)",
                    border: "1px solid var(--border)", flexShrink: 0,
                    fontFamily: "var(--font-mono)", fontWeight: 700,
                  }}>{step[0]}</div>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{step[1]}</div>
                    <div style={{ color: "var(--muted)", lineHeight: 1.6, fontSize: "0.9rem" }}>{step[2]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div id="launch" className="glass-card-sq" style={{ padding: "1.35rem" }}>
            <div className="hero-eyebrow" style={{ marginBottom: 8 }}>Setup Guide</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.8rem", letterSpacing: "-0.03em", marginBottom: 12, color: "var(--text)" }}>
              Launch or join a session.
            </div>
            <div style={{ marginBottom: 16, color: "var(--muted)", lineHeight: 1.6 }}>
              Use the participant login to join with a PIN, or switch to the host dashboard to start a new game.
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {[
                { id: "join", label: "Join" },
                { id: "create", label: "Host" },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { setTab(item.id); setErr(""); }}
                  className="btn-secondary-sq"
                  style={{ flex: 1, padding: "10px 12px", borderRadius: 999, background: tab === item.id ? "rgba(26,37,23,0.08)" : "rgba(255,255,255,0.8)" }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="glass-card-sq" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ display: "flex", borderBottom: "1px solid rgba(26,37,23,0.08)", background: "rgba(255,255,255,0.55)" }}>
                {[
                  { id: "join", label: "Participant Login" },
                  { id: "create", label: "Host Dashboard" },
                ].map(t => (
                  <button key={t.id} onClick={() => { setTab(t.id); setErr(""); }} style={{
                    flex: 1, padding: "14px 0",
                    fontFamily: "var(--font-display)", fontWeight: 700,
                    fontSize: "0.84rem", letterSpacing: "0.01em",
                    color: tab === t.id ? "var(--text)" : "var(--muted)",
                    background: tab === t.id ? "rgba(26,37,23,0.06)" : "transparent",
                    borderBottom: `2px solid ${tab === t.id ? "var(--cyan)" : "transparent"}`,
                    transition: "all 0.2s", cursor: "pointer",
                  }}>{t.label}</button>
                ))}
              </div>

              <div style={{ padding: "20px" }}>
                {tab === "join" ? (
                  <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
                        Game PIN
                      </label>
                      <div style={{ display: "flex", gap: 6, justifyContent: "space-between" }}>
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
                            className={`input-sq ${err.includes("PIN") ? "ans-btn wrong" : ""}`}
                            style={{
                              width: "15%", aspectRatio: "1/1", textAlign: "center",
                              fontSize: "1.6rem", padding: 0, fontFamily: "var(--font-mono)", fontWeight: 700,
                              transition: "all 0.2s cubic-bezier(0.175,0.885,0.32,1.275)",
                            }}
                            onFocus={e => e.target.select()}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
                        Nickname
                      </label>
                      <input
                        value={nick}
                        onChange={e => setNick(e.target.value.slice(0, 20))}
                        placeholder="e.g. QuizMaster99"
                        maxLength={20}
                        className="input-sq"
                      />
                    </div>

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
                        background: "rgba(255,255,255,0.72)", border: "1.5px solid var(--border)",
                      }}>
                        <img src={avatar} alt="Avatar" style={{ width: 44, height: 44, objectFit: "contain", background: "transparent", borderRadius: 12, border: "1px solid rgba(26,37,23,0.1)" }} />
                        <span style={{ fontFamily: "var(--font-inter)", color: "var(--muted)", fontSize: "0.83rem" }}>
                          {nick || "Your nickname"} · ready to play!
                        </span>
                      </div>

                      {showAvatars && (
                        <div className="animate-slide-up" style={{ marginTop: 10 }}>
                          <AvatarPicker selected={avatar} onSelect={e => { setAvatar(e); setShowAvatars(false); }} />
                        </div>
                      )}
                    </div>

                    {err && (
                      <div className="animate-pop-in" style={{
                        padding: "11px 14px", borderRadius: 12,
                        background: "rgba(159,58,47,0.08)",
                        border: "1px solid rgba(159,58,47,0.2)",
                        color: "#9f3a2f", fontSize: "0.83rem",
                        fontFamily: "var(--font-inter)",
                      }}>⚠️ {err}</div>
                    )}

                    <button type="submit" disabled={loading || pin.length !== 6 || nick.length < 2}
                      className="btn-primary-sq w-full" style={{ width: "100%", padding: "15px" }}>
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
          </div>
        </section>

        <section id="setup" className="pill-row" style={{ justifyContent: "center", marginTop: "1.5rem" }}>
          {[
            "Simple question builder",
            "Live response tracking",
            "Leaderboards in real time",
            "Cheat-aware game flow",
          ].map(item => (
            <span key={item}>{item}</span>
          ))}
        </section>
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
