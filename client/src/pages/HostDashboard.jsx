import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useSound } from "../hooks/useSound";
import Leaderboard from "../components/Leaderboard";
import Timer from "../components/Timer";
import CountdownOverlay from "../components/CountdownOverlay";
import AnswerDistribution from "../components/AnswerDistribution";
import PINShare from "../components/PINShare";
import Podium from "../components/Podium";
import NetworkStatus from "../components/NetworkStatus";
import { ANSWER_COLORS, launchConfetti, formatScore } from "../utils/scoring";

const P = { CONNECTING:"connecting", LOBBY:"lobby", STARTING:"starting", QUESTION:"question", REVEAL:"reveal", FINAL:"final" };

export default function HostDashboard() {
  const { pin }  = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { playStart, playCorrect, playJoin, playVictory, playLobbyMusic, stopLobbyMusic } = useSound();

  const [phase, setPhase]     = useState(P.CONNECTING);
  const [players, setPlayers] = useState([]);
  const [quizTitle, setQT]    = useState("");
  const [qCount, setQC]       = useState(0);
  const [allQs, setAllQs]     = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [curQ, setCurQ]       = useState(null);
  const [reveal, setReveal]   = useState(null);
  const [lb, setLb]           = useState([]);
  const [ansCount, setAns]    = useState({ answered: 0, total: 0 });
  const [err, setErr]         = useState("");
  const [timerOn, setTimer]   = useState(false);
  const qIdxRef               = useRef(0);

  useEffect(() => {
    if (!socket || !pin) return;
    socket.emit("host:join", { pin });

    socket.on("host:joined",      ({ quizTitle, questionCount, questions, players }) => { setQT(quizTitle); setQC(questionCount); setAllQs(questions || []); setPlayers(players); setPhase(P.LOBBY); });
    socket.on("lobby:update",     ({ players }) => { setPlayers(players); playJoin(); });
    socket.on("game:starting",    () => setPhase(P.STARTING));
    socket.on("question:start",   q  => { setCurQ(q); setReveal(null); setAns({ answered: 0, total: players.length }); setTimer(true); qIdxRef.current = q.index; setPhase(P.QUESTION); });
    socket.on("host:answer_count",({ answered, total }) => setAns({ answered, total }));
    socket.on("question:reveal",  d  => { setReveal(d); setLb(d.leaderboard); setTimer(false); setPhase(P.REVEAL); playCorrect(); });
    socket.on("game:end",         ({ leaderboard }) => { setLb(leaderboard); setPhase(P.FINAL); playVictory(); launchConfetti(160); });
    socket.on("error",            ({ message }) => setErr(message));

    return () => ["host:joined","lobby:update","game:starting","question:start","host:answer_count","question:reveal","game:end","error"].forEach(e => socket.off(e));
  }, [socket, pin]);

  // Manage lobby music
  useEffect(() => {
    if (phase === P.LOBBY) playLobbyMusic();
    else stopLobbyMusic();
    return () => stopLobbyMusic();
  }, [phase, playLobbyMusic, stopLobbyMusic]);

  const emit = (ev, d = {}) => socket?.emit(ev, { pin, ...d });

  return (
    <div className="mesh-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div className="dot-grid" style={{ position: "fixed", inset: 0, opacity: 0.14, pointerEvents: "none" }} />
      <NetworkStatus />
      {phase === P.STARTING && <CountdownOverlay onDone={() => {}} />}

      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 8,
        padding: "12px 16px",
        background: "rgba(6,8,17,0.88)", backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(28,34,64,0.7)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12, flexShrink: 0,
            background: "linear-gradient(135deg,var(--violet),var(--cyan))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.1rem", boxShadow: "0 0 20px rgba(124,92,252,0.4)",
          }}>🎯</div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(0.9rem,3vw,1.05rem)",
              background: "linear-gradient(135deg,var(--cyan),var(--violet))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>QuizFlow</div>
            {quizTitle && <div style={{ fontSize: "0.65rem", color: "var(--muted)", marginTop: -1, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{quizTitle}</div>}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {pin && <PINShare pin={pin} />}
          {phase !== P.FINAL && (
            <button onClick={() => { if (confirm("End the game early?")) emit("host:end_game"); }}
              className="btn-danger" style={{ padding: "7px 12px", borderRadius: 10, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.75rem" }}>
              End
            </button>
          )}
          <button onClick={() => navigate("/")} className="btn-ghost"
            style={{ padding: "7px 12px", borderRadius: 10, fontFamily: "var(--font-body)", fontSize: "0.8rem" }}>
            ← Exit
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, display: "flex", position: "relative", zIndex: 10, overflow: "hidden" }}>

        {/* CONNECTING */}
        {phase === P.CONNECTING && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "3.5rem", marginBottom: 14, animation: "timerPulse 1s ease infinite" }}>🎯</div>
              <div style={{ fontFamily: "var(--font-display)", color: "var(--muted)" }}>Connecting to session...</div>
            </div>
          </div>
        )}

        {/* LOBBY */}
        {phase === P.LOBBY && (
          <div className="animate-phase" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(20px,5vw,40px) clamp(16px,4vw,24px)", gap: 24 }}>
            {/* PIN hero */}
            <div style={{ textAlign: "center" }}>
              <div className="badge badge-cyan" style={{ margin: "0 auto 14px" }}>
                <div className="live-dot" />
                Waiting for players
              </div>
              <div style={{
                fontFamily: "var(--font-display)", fontWeight: 800,
                fontSize: "clamp(3rem,12vw,7.5rem)",
                letterSpacing: "0.25em", lineHeight: 1,
                color: "var(--cyan)", textShadow: "0 0 40px rgba(6,247,217,0.45), 0 0 80px rgba(6,247,217,0.2)",
              }}>{pin}</div>
              <div style={{ color: "var(--muted)", fontSize: "clamp(0.78rem,2vw,0.9rem)", marginTop: 10, padding: "0 10px" }}>
                {quizTitle} · {qCount} question{qCount !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Player grid */}
            <div style={{ width: "100%", maxWidth: 740 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--text)", fontSize: "0.95rem" }}>
                  Players <span style={{ color: "var(--cyan)" }}>({players.length})</span>
                </span>
                {players.length > 0 && <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div className="live-dot" />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--green)" }}>LIVE</span>
                </div>}
              </div>

              {players.length === 0 ? (
                <div className="glass" style={{ borderRadius: 22, padding: "clamp(28px,6vw,52px) 24px", textAlign: "center" }}>
                  <div style={{ fontSize: "3rem", marginBottom: 10 }}>👀</div>
                  <div style={{ fontFamily: "var(--font-display)", color: "var(--muted)", fontSize: "0.95rem" }}>Waiting for players to join...</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--faint)", marginTop: 6 }}>Share the PIN above</div>
                </div>
              ) : (
                <div className="player-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 8 }}>
                  {players.map((p, i) => (
                    <div key={p.id} className="glass animate-pop-in" style={{
                      borderRadius: 14, padding: "10px 12px",
                      display: "flex", alignItems: "center", gap: 8,
                      animationDelay: `${i * 40}ms`, animationFillMode: "both",
                    }}>
                      <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>{p.emoji || "🦊"}</span>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.82rem", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.nickname}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 400 }}>
              <button onClick={() => setShowPreview(true)}
                className="btn-ghost" style={{ flex: 1, padding: "16px", borderRadius: 16, fontSize: "0.9rem", color: "var(--cyan)", border: "1.5px solid rgba(6,247,217,0.3)" }}>
                👁 Review
              </button>
              <button onClick={() => { emit("host:start"); playStart(); }} disabled={players.length === 0}
                className="btn-primary" style={{ flex: 2, padding: "16px", borderRadius: 16, fontSize: "clamp(0.9rem,3vw,1.1rem)" }}>
                {players.length === 0 ? "Waiting..." : `Start (${players.length}) →`}
              </button>
            </div>

            {/* PREVIEW MODAL */}
            {showPreview && (
              <div className="animate-pop-in" style={{
                position: "fixed", inset: 0, zIndex: 100,
                background: "rgba(6,8,17,0.9)", backdropFilter: "blur(12px)",
                display: "flex", flexDirection: "column", padding: "20px",
              }}>
                <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--text)" }}>Preview: {quizTitle}</div>
                  <button onClick={() => setShowPreview(false)} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: "1.5rem", cursor: "pointer" }}>✕</button>
                </header>
                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16, paddingRight: 8 }}>
                  {allQs.map((q, i) => (
                    <div key={i} style={{ background: "rgba(13,16,34,0.7)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
                      <div style={{ color: "var(--cyan)", fontFamily: "var(--font-mono)", fontSize: "0.7rem", marginBottom: 6 }}>Question {i + 1} — {q.time}s</div>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1rem", marginBottom: 12 }}>{q.text}</div>
                      <div className="ans-grid">
                        {q.options.map((opt, oi) => (
                          <div key={oi} style={{
                            padding: "8px 12px", borderRadius: 8, fontSize: "0.85rem",
                            background: "rgba(6,8,17,0.6)",
                            border: `1.5px solid ${oi === q.correct ? "var(--green)" : "var(--border)"}`,
                            color: oi === q.correct ? "var(--green)" : "var(--muted)",
                          }}>
                            {["A","B","C","D"][oi]}: {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* QUESTION */}
        {phase === P.QUESTION && curQ && (
          <div className="animate-phase q-card-pad" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "clamp(12px,3vw,20px)", gap: 14, maxWidth: 940, margin: "0 auto", width: "100%" }}>
            {/* Top bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.72rem",
                  color: "var(--muted)", letterSpacing: "0.1em",
                }}>
                  Q{curQ.index + 1} / {curQ.total}
                </div>
                {/* Progress dots */}
                <div style={{ display: "flex", gap: 5 }}>
                  {Array.from({ length: curQ.total }).map((_, i) => (
                    <div key={i} style={{
                      width: i === curQ.index ? 20 : 7, height: 7, borderRadius: 4,
                      background: i < curQ.index ? "var(--green)" : i === curQ.index ? "var(--cyan)" : "var(--border)",
                      transition: "all 0.4s ease",
                      boxShadow: i === curQ.index ? "0 0 8px var(--cyan)" : "none",
                    }} />
                  ))}
                </div>
              </div>
              <button onClick={() => emit("host:next")} className="btn-ghost"
                style={{ padding: "7px 14px", borderRadius: 9, fontFamily: "var(--font-display)", fontSize: "0.75rem", fontWeight: 600 }}>
                Skip →
              </button>
            </div>

            <Timer totalTime={curQ.time} running={timerOn} onExpire={() => setTimer(false)} />

            {/* Question card */}
            <div className="glass animate-pop-in" style={{
              borderRadius: 22, padding: "28px 32px", textAlign: "center",
              border: "1px solid rgba(124,92,252,0.2)",
              boxShadow: "0 0 50px rgba(124,92,252,0.07)",
            }}>
              <div style={{
                fontFamily: "var(--font-display)", fontWeight: 700,
                fontSize: "clamp(1.1rem,3vw,1.65rem)", color: "var(--text)", lineHeight: 1.4,
              }}>
                {curQ.text}
              </div>
            </div>

            {/* Options */}
            <div className="ans-grid" style={{ gap: 10 }}>
              {curQ.options.map((opt, i) => {
                const c = ANSWER_COLORS[i];
                return (
                  <div key={i} className="animate-slide-up" style={{
                    background: c.bg, borderRadius: 18, padding: "15px 18px",
                    display: "flex", alignItems: "center", gap: 12,
                    animationDelay: `${i * 65}ms`, animationFillMode: "both",
                    boxShadow: `0 4px 20px ${c.bg}44`,
                    position: "relative", overflow: "hidden",
                  }}>
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(255,255,255,0.14) 0%,transparent 55%)", pointerEvents: "none" }} />
                    <span style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem", color: "white",
                    }}>{c.label}</span>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "white", fontSize: "0.92rem" }}>{opt}</span>
                  </div>
                );
              })}
            </div>

            {/* Live answer progress */}
            <div className="glass" style={{ borderRadius: 16, padding: "14px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontFamily: "var(--font-body)", color: "var(--muted)", fontSize: "0.82rem" }}>
                  Live answers
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--cyan)", fontSize: "0.95rem" }}>
                  {ansCount.answered} / {ansCount.total}
                </span>
              </div>
              <div style={{ height: 5, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  background: "linear-gradient(90deg,var(--green),var(--cyan))",
                  width: `${ansCount.total > 0 ? (ansCount.answered / ansCount.total) * 100 : 0}%`,
                  transition: "width 0.4s ease",
                  boxShadow: "0 0 8px rgba(6,247,217,0.5)",
                }} />
              </div>
              {/* Dot per player */}
              {players.length <= 20 && (
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 10 }}>
                  {players.map((_, i) => (
                    <div key={i} style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: i < ansCount.answered ? "var(--green)" : "var(--border)",
                      boxShadow: i < ansCount.answered ? "0 0 6px var(--green)" : "none",
                      transition: "all 0.3s ease",
                    }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* REVEAL */}
        {phase === P.REVEAL && reveal && (
          <div className="animate-phase reveal-layout" style={{ flex: 1, display: "flex", gap: 20, padding: "clamp(12px,3vw,20px)", maxWidth: 1060, margin: "0 auto", width: "100%", flexWrap: "wrap", overflowY: "auto" }}>
            {/* Left */}
            <div style={{ flex: 1, minWidth: "min(300px, 100%)", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Question {qIdxRef.current + 1} — Result
              </div>

              {/* Correct answer callout */}
              <div className="glass animate-pop-in" style={{
                borderRadius: 22, padding: "22px 26px", textAlign: "center",
                border: "1px solid rgba(13,242,160,0.25)",
                boxShadow: "0 0 40px rgba(13,242,160,0.06)",
              }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--muted)", marginBottom: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Correct Answer
                </div>
                <div style={{
                  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.65rem",
                  color: "var(--green)", textShadow: "0 0 20px rgba(13,242,160,0.55)",
                }}>
                  ✓ {reveal.correctText}
                </div>
              </div>

              {/* Stats row */}
              <div className="glass" style={{ borderRadius: 18, padding: "14px 20px", display: "flex", justifyContent: "space-around" }}>
                {[
                  { val: reveal.answeredCount, label: "Answered",     color: "var(--cyan)"  },
                  { val: reveal.totalCount,    label: "Players",      color: "var(--muted)" },
                  { val: `${reveal.totalCount > 0 ? Math.round((reveal.answeredCount / reveal.totalCount) * 100) : 0}%`, label: "Rate", color: "var(--amber)" },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.7rem", color: s.color }}>{s.val}</div>
                    <div style={{ color: "var(--muted)", fontSize: "0.7rem", marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Answer distribution */}
              {curQ && (
                <div className="glass" style={{ borderRadius: 18, padding: "16px 20px" }}>
                  <AnswerDistribution
                    options={curQ.options}
                    correctIndex={reveal.correctAnswer}
                    distribution={reveal.distribution || {}}
                    total={reveal.totalCount}
                  />
                </div>
              )}

              <button onClick={() => emit("host:continue")} className="btn-primary" style={{ padding: "16px", borderRadius: 16, marginTop: "auto" }}>
                {qIdxRef.current + 1 >= qCount ? "🏆 Final Results" : "Next Question →"}
              </button>
            </div>

            {/* Right: leaderboard */}
            <div style={{ width: "min(310px, 100%)", flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Live Rankings
              </div>
              <Leaderboard players={lb} showChange compact maxRows={8} />
            </div>
          </div>
        )}

        {/* FINAL */}
        {phase === P.FINAL && (
          <div className="animate-phase" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px 20px", gap: 24, overflowY: "auto" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "4.5rem", marginBottom: 10 }}>🏆</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(2rem,5vw,3.5rem)", color: "var(--text)" }}>
                Quiz Complete!
              </div>
              <div style={{ color: "var(--muted)", marginTop: 6 }}>{quizTitle}</div>
            </div>

            {/* Podium */}
            <Podium players={lb} />

            {/* Full leaderboard */}
            <div style={{ width: "100%", maxWidth: 500 }}>
              <Leaderboard players={lb} showChange={false} maxRows={10} />
            </div>

            <button onClick={() => navigate("/")} className="btn-primary btn-violet" style={{ padding: "16px 48px", borderRadius: 18, fontSize: "1.05rem" }}>
              Play Again →
            </button>
          </div>
        )}
      </main>

      {err && (
        <div className="animate-pop-in" style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "rgba(255,61,110,0.92)", backdropFilter: "blur(12px)",
          color: "white", padding: "12px 22px", borderRadius: 14,
          fontFamily: "var(--font-display)", fontWeight: 600, zIndex: 100,
          display: "flex", gap: 10, alignItems: "center", whiteSpace: "nowrap",
        }}>
          ⚠️ {err}
          <button onClick={() => setErr("")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>✕</button>
        </div>
      )}
    </div>
  );
}
