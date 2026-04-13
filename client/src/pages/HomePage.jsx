import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AvatarPicker from "../components/AvatarPicker";
import NetworkStatus from "../components/NetworkStatus";

const API = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

export default function HomePage() {
  const navigate = useNavigate();
  const [tab, setTab]         = useState("join");
  const [pin, setPin]         = useState("");
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
        padding: "16px 24px",
        borderBottom: "1px solid rgba(28,34,64,0.6)",
        backdropFilter: "blur(20px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 16,
            background: "linear-gradient(135deg, var(--violet), var(--cyan))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.35rem", boxShadow: "0 0 24px rgba(124,92,252,0.45)",
            flexShrink: 0,
          }}>🎯</div>
          <div>
            <div style={{
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.35rem",
              background: "linear-gradient(135deg,var(--cyan),var(--violet))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>QuizFlow</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--muted)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Real-Time Quiz Platform
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={toggleMute} className="btn-ghost" style={{
            padding: "8px 12px", borderRadius: 10, fontSize: "0.95rem",
            fontFamily: "var(--font-body)",
          }} title={muted ? "Unmute" : "Mute"}>
            {muted ? "🔇" : "🔊"}
          </button>
          <button onClick={() => navigate("/host")} className="btn-ghost" style={{
            padding: "9px 18px", borderRadius: 12,
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "0.82rem", letterSpacing: "0.05em",
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
        padding: "32px 16px 40px",
      }}>
        {/* Headline */}
        <div className="animate-slide-up" style={{ textAlign: "center", marginBottom: 36 }}>
          <div className="badge badge-cyan" style={{ marginBottom: 18, margin: "0 auto 18px" }}>
            <div className="live-dot" />
            Live Multiplayer Quiz
          </div>
          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 800,
            fontSize: "clamp(2.6rem,8vw,5.5rem)",
            lineHeight: 1.04, marginBottom: 16,
          }}>
            Play Smarter.<br />
            <span className="grad-text">Win Faster.</span>
          </h1>
          <p style={{
            color: "var(--muted)", fontSize: "clamp(0.95rem,2.5vw,1.1rem)",
            maxWidth: 400, margin: "0 auto", lineHeight: 1.65,
          }}>
            Host or join real-time quizzes. Compete on speed &amp; knowledge. Climb the leaderboard live.
          </p>
        </div>

        {/* Main card */}
        <div className="animate-pop-in glass-bright" style={{
          width: "100%", maxWidth: 460,
          borderRadius: 26, overflow: "hidden",
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
                flex: 1, padding: "17px 0",
                fontFamily: "var(--font-display)", fontWeight: 700,
                fontSize: "0.85rem", letterSpacing: "0.06em", textTransform: "uppercase",
                color: tab === t.id ? "var(--cyan)" : "var(--muted)",
                background: tab === t.id ? "rgba(6,247,217,0.05)" : "transparent",
                borderBottom: `2px solid ${tab === t.id ? "var(--cyan)" : "transparent"}`,
                transition: "all 0.2s", cursor: "pointer",
              }}>{t.label}</button>
            ))}
          </div>

          <div style={{ padding: "26px 24px" }}>
            {tab === "join" ? (
              <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* PIN */}
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
                    Game PIN
                  </label>
                  <input
                    value={pin}
                    onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="• • • • • •"
                    maxLength={6}
                    autoFocus
                    className="qf-input pin"
                    onFocus={e => { e.target.style.borderColor = "var(--cyan)"; e.target.style.boxShadow = "0 0 0 3px rgba(6,247,217,0.12)"; }}
                    onBlur={e  => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
                  />
                  {pin.length > 0 && pin.length < 6 && (
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--muted)", marginTop: 5 }}>
                      {6 - pin.length} more digit{6 - pin.length !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>

                {/* Nickname */}
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
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
                    <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                      Your Avatar
                    </label>
                    <button type="button" onClick={() => setShowAvatars(!showAvatars)} style={{
                      fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--cyan)",
                      background: "none", border: "none", cursor: "pointer",
                    }}>
                      {showAvatars ? "Hide ▲" : "Change ▼"}
                    </button>
                  </div>

                  {/* Selected preview */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 14px", borderRadius: 12,
                    background: "rgba(6,8,17,0.6)", border: "1.5px solid var(--border)",
                  }}>
                    <span style={{ fontSize: "2rem" }}>{avatar}</span>
                    <span style={{ fontFamily: "var(--font-body)", color: "var(--muted)", fontSize: "0.85rem" }}>
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
                    padding: "12px 16px", borderRadius: 12,
                    background: "rgba(255,61,110,0.08)",
                    border: "1px solid rgba(255,61,110,0.3)",
                    color: "#ff7097", fontSize: "0.85rem",
                    fontFamily: "var(--font-body)",
                    animation: "shake 0.4s ease, popIn 0.3s ease",
                  }}>⚠️ {err}</div>
                )}

                <button type="submit" disabled={loading || pin.length !== 6 || nick.length < 2}
                  className="btn-primary" style={{ width: "100%", padding: "16px" }}>
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
          display: "flex", gap: 10, flexWrap: "wrap",
          justifyContent: "center", marginTop: 28,
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
              padding: "6px 14px", borderRadius: 99,
              background: "rgba(13,16,34,0.7)", border: "1px solid var(--border)",
              color: "var(--muted)", fontSize: "0.75rem",
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
  const [quizzes, setQ]   = useState([]);
  const [selId, setSelId] = useState("");
  const [loading, setL]   = useState(false);
  const [fetching, setF]  = useState(true);
  const [err, setErr]     = useState("");

  useEffect(() => {
    axios.get(`${API}/api/quizzes`)
      .then(r => { setQ(r.data.quizzes); if (r.data.quizzes[0]) setSelId(r.data.quizzes[0].id); })
      .catch(() => setErr("Could not load quizzes"))
      .finally(() => setF(false));
  }, []);

  async function create() {
    if (!selId) return;
    setL(true); setErr("");
    try {
      const hostId = `host_${Date.now()}`;
      const { data } = await axios.post(`${API}/api/games/create`, { quizId: selId, hostId });
      navigate(`/host/${data.pin}?hostId=${hostId}`);
    } catch { setErr("Failed — is the server running?"); }
    finally  { setL(false); }
  }

  const diffColors = { Easy: "var(--green)", Medium: "var(--amber)", Hard: "var(--red)" };

  if (fetching) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 68, borderRadius: 14 }} />)}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
          Choose Quiz
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto" }}>
          {quizzes.map(q => (
            <button key={q.id} onClick={() => setSelId(q.id)} style={{
              textAlign: "left", padding: "13px 16px", borderRadius: 14, cursor: "pointer",
              background: selId === q.id ? "rgba(6,247,217,0.07)" : "rgba(6,8,17,0.6)",
              border: selId === q.id ? "1.5px solid rgba(6,247,217,0.4)" : "1.5px solid var(--border)",
              boxShadow: selId === q.id ? "0 0 20px rgba(6,247,217,0.08)" : "none",
              transition: "all 0.15s",
            }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.9rem",
                  color: selId === q.id ? "var(--text)" : "#a0aec0",
                }}>{q.title}</span>
                {selId === q.id && <span style={{ color: "var(--cyan)", fontSize: "0.9rem" }}>✓</span>}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 5, alignItems: "center" }}>
                <span className="badge" style={{
                  background: "rgba(13,16,34,0.8)", border: "1px solid var(--border)",
                  color: "var(--muted)", padding: "2px 8px", fontSize: "0.65rem",
                }}>{q.category}</span>
                <span style={{ color: "var(--muted)", fontSize: "0.72rem" }}>{q.questionCount} questions</span>
                <span style={{ fontSize: "0.72rem", color: diffColors[q.difficulty] || "var(--muted)", fontWeight: 600 }}>
                  {q.difficulty}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {err && <div style={{ color: "#ff7097", fontSize: "0.82rem", padding: "10px 14px", borderRadius: 10, background: "rgba(255,61,110,0.07)", border: "1px solid rgba(255,61,110,0.2)" }}>⚠️ {err}</div>}

      <button onClick={create} disabled={loading || !selId}
        className="btn-primary btn-violet" style={{ width: "100%", padding: "16px" }}>
        {loading ? "Creating..." : "Create Game →"}
      </button>
    </div>
  );
}
