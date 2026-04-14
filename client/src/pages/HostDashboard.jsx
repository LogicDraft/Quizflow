import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useSound } from "../hooks/useSound";
import Leaderboard from "../components/Leaderboard";
import CircularTimer from "../components/CircularTimer";
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
      <header className="sticky top-0 z-50 flex items-center justify-between flex-wrap gap-2 px-4 py-3 bg-white/5 backdrop-blur-2xl border-b border-white/10">
        <div className="flex items-center gap-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          <div>
            <div className="font-inter font-bold text-lg tracking-tight text-white">
              Quiz<span className="text-indigo-400">Flow</span> Host
            </div>
            {quizTitle && <div className="text-xs text-slate-400 -mt-0.5 max-w-[200px] truncate">{quizTitle}</div>}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {pin && <PINShare pin={pin} />}
          {phase !== P.FINAL && (
            <button onClick={() => { if (confirm("End the game early?")) emit("host:end_game"); }}
              className="btn-danger" style={{ padding: "7px 12px", borderRadius: 10, fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "0.75rem" }}>
              End
            </button>
          )}
          <button onClick={() => navigate("/")} className="btn-ghost"
            style={{ padding: "7px 12px", borderRadius: 10, fontFamily: "var(--font-inter)", fontSize: "0.8rem" }}>
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
              <div style={{ fontFamily: "var(--font-inter)", color: "var(--muted)" }}>Connecting to session...</div>
            </div>
          </div>
        )}

        {/* LOBBY */}
        {phase === P.LOBBY && (
          <div className="animate-phase flex-1 flex flex-col items-center justify-center p-6 gap-8 z-10 w-full max-w-4xl mx-auto">
            {/* PIN hero */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                Waiting for players
              </div>
              <div className="font-inter font-black text-6xl md:text-8xl tracking-widest leading-none text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 drop-shadow-[0_0_40px_rgba(99,102,241,0.3)]">
                {pin}
              </div>
              <div className="text-slate-400 text-sm mt-4 px-2 tracking-wide">
                {quizTitle} · {qCount} question{qCount !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Player grid */}
            <div className="w-full max-w-4xl bg-black/10 rounded-2xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-6">
                <span className="font-inter font-bold text-slate-200 text-lg tracking-tight">
                  Players <span className="text-indigo-400">({players.length})</span>
                </span>
                {players.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-[live-pulse_1.5s_infinite]" />
                    <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-green-400">Live</span>
                  </div>
                )}
              </div>

              {players.length === 0 ? (
                <div className="glass-card-sq border-dashed border-2 border-slate-700/50 rounded-2xl flex flex-col items-center justify-center py-16 text-center">
                  <div className="text-5xl mb-4 opacity-70">👀</div>
                  <div className="text-slate-300 font-medium tracking-wide">Waiting for players to join...</div>
                  <div className="text-slate-500 text-sm mt-3">Share the PIN above</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {players.map((p, i) => (
                    <div key={p.id} className="glass-card-sq p-3 rounded-xl flex items-center gap-3 hover:-translate-y-1 transition-transform animate-[fadeIn_0.3s_ease-out_forwards]" style={{ animationDelay: `${i * 30}ms` }}>
                      <img src={(p.emoji.startsWith("/") || p.emoji.startsWith("data:")) ? p.emoji : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='100' fill='%232a3040'/%3E%3Ccircle cx='100' cy='70' r='40' fill='%23a0aec0'/%3E%3Cpath d='M40 180A60 50 0 0 1 160 180Z' fill='%23a0aec0'/%3E%3C/svg%3E"} alt="Avatar" className="w-9 h-9 rounded-md object-contain bg-black/20 p-1 border border-white/5 flex-shrink-0" />
                      <span className="font-inter font-semibold text-sm text-white truncate w-full">
                        {p.nickname}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4 w-full max-w-md mt-4">
              <button onClick={() => setShowPreview(true)}
                className="btn-ghost flex-1 py-4 rounded-xl text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/10 transition-all font-semibold tracking-wide flex items-center justify-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                Review
              </button>
              <button onClick={() => { emit("host:start"); playStart(); }} disabled={players.length === 0}
                className="btn-primary-sq flex-[1.5] py-4 rounded-xl text-[1.05rem] tracking-wide font-bold shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:shadow-none hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] text-white">
                {players.length === 0 ? "Waiting..." : `Start (${players.length}) →`}
              </button>
            </div>

            {/* PREVIEW MODAL */}
            {showPreview && (
              <div className="animate-pop-in" style={{
                position: "fixed", inset: 0, zIndex: 100,
                background: "transparent", backdropFilter: "blur(12px)",
                display: "flex", flexDirection: "column", padding: "20px",
              }}>
                <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ fontFamily: "var(--font-inter)", fontWeight: 700, color: "var(--text)" }}>Preview: {quizTitle}</div>
                  <button onClick={() => setShowPreview(false)} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: "1.5rem", cursor: "pointer" }}>✕</button>
                </header>
                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16, paddingRight: 8 }}>
                  {allQs.map((q, i) => (
                    <div key={i} style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
                      <div style={{ color: "var(--cyan)", fontFamily: "var(--font-mono)", fontSize: "0.7rem", marginBottom: 6 }}>Question {i + 1} — {q.time}s</div>
                      <div style={{ fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "1rem", marginBottom: 12 }}>{q.text}</div>
                      <div className="ans-grid">
                        {q.options.map((opt, oi) => (
                          <div key={oi} style={{
                            padding: "8px 12px", borderRadius: 8, fontSize: "0.85rem",
                            background: "transparent",
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
                style={{ padding: "7px 14px", borderRadius: 9, fontFamily: "var(--font-inter)", fontSize: "0.75rem", fontWeight: 600 }}>
                Skip →
              </button>
            </div>

            {/* Dashboard grid */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 10 }}>
              
              {/* Question card */}
              <div className="glass-card-sq animate-pop-in" style={{
                flex: "1 1 500px", borderRadius: 22, padding: "clamp(28px,6vw,60px) 32px", textAlign: "center",
                border: "1px solid rgba(148,163,184,0.16)", boxShadow: "0 0 50px rgba(96,165,250,0.06)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
              }}>
                <div style={{
                  fontFamily: "var(--font-inter)", fontWeight: 700,
                  fontSize: "clamp(1.5rem,4vw,3rem)", color: "var(--text)", lineHeight: 1.3,
                }}>
                  {curQ.text}
                </div>
              </div>

              {/* Side controls (Desktop Timer & Progress) */}
              <div style={{ flex: "1 1 250px", display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="glass-card-sq animate-slide-up" style={{ borderRadius: 18, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--muted)", marginBottom: 16 }}>TIME REMAINING</div>
                  <CircularTimer totalTime={curQ.time} running={timerOn} onExpire={() => setTimer(false)} size={130} />
                </div>

                <div className="glass-card-sq animate-slide-up" style={{ borderRadius: 18, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, animationDelay: "100ms" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--muted)", marginBottom: 16 }}>ANSWERS LOGGED</div>
                  <div style={{ position: "relative", width: 100, height: 100 }}>
                    <svg width="100" height="100" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
                      <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" strokeWidth="12" />
                      <circle cx="60" cy="60" r="54" fill="none" stroke="var(--cyan)" strokeWidth="12" strokeDasharray="339.3" strokeDashoffset={339.3 - (339.3 * (ansCount.answered / Math.max(1, ansCount.total)))} style={{ transition: "stroke-dashoffset 0.5s ease" }} strokeLinecap="round" />
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", flexDirection: "column" }}>
                      <span style={{ fontFamily: "var(--font-inter)", fontWeight: 800, fontSize: "1.8rem" }}>{ansCount.answered}</span>
                      <span style={{ fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "0.8rem", color: "var(--muted)", marginTop: -6 }}>/ {ansCount.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Options */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
              {curQ.options.map((opt, i) => {
                const c = ANSWER_COLORS[i];
                return (
                  <div key={i} className="ans-btn" style={{
                    background: c.bg, borderRadius: 18, padding: "20px 18px",
                    display: "flex", alignItems: "center", gap: 12,
                    animation: `slideInUp 0.6s cubic-bezier(0.22,1,0.36,1) ${i * 80}ms both`,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -4px 0 rgba(0,0,0,0.22), 0 8px 16px rgba(0,0,0,0.3)`,
                  }}>
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(255,255,255,0.14) 0%,transparent 55%)", pointerEvents: "none" }} />
                    <span style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: "transparent", display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "var(--font-inter)", fontWeight: 800, fontSize: "1.2rem", color: "var(--text)", zIndex: 1
                    }}>{c.label}</span>
                    <span style={{ fontFamily: "var(--font-inter)", fontWeight: 700, color: "var(--text)", fontSize: "1.1rem", zIndex: 1, wordBreak: "break-word" }}>{opt}</span>
                  </div>
                );
              })}
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
              <div className="glass-card-sq animate-pop-in" style={{
                borderRadius: 22, padding: "22px 26px", textAlign: "center",
                border: "1px solid rgba(96,165,250,0.18)",
                boxShadow: "0 0 40px rgba(96,165,250,0.06)",
              }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--muted)", marginBottom: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Correct Answer
                </div>
                <div style={{
                  fontFamily: "var(--font-inter)", fontWeight: 800, fontSize: "1.65rem",
                  color: "var(--green)", textShadow: "0 0 20px rgba(16,185,129,0.55)",
                }}>
                  ✓ {reveal.correctText}
                </div>
              </div>

              {/* Stats row */}
              <div className="glass-card-sq" style={{ borderRadius: 18, padding: "14px 20px", display: "flex", justifyContent: "space-around" }}>
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
                <div className="glass-card-sq" style={{ borderRadius: 18, padding: "16px 20px" }}>
                  <AnswerDistribution
                    options={curQ.options}
                    correctIndex={reveal.correctAnswer}
                    distribution={reveal.distribution || {}}
                    total={reveal.totalCount}
                  />
                </div>
              )}

              <button onClick={() => emit("host:continue")} className="btn-primary-sq w-full" style={{ padding: "16px", borderRadius: 16, marginTop: "auto" }}>
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
              <div style={{ fontFamily: "var(--font-inter)", fontWeight: 800, fontSize: "clamp(2rem,5vw,3.5rem)", color: "var(--text)" }}>
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

            <button onClick={() => navigate("/")} className="btn-primary-sq w-full btn-violet" style={{ padding: "16px 48px", borderRadius: 18, fontSize: "1.05rem" }}>
              Play Again →
            </button>
          </div>
        )}
      </main>

      {err && (
        <div className="animate-pop-in" style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "transparent", backdropFilter: "blur(12px)",
          color: "var(--text)", padding: "12px 22px", borderRadius: 14,
          fontFamily: "var(--font-inter)", fontWeight: 600, zIndex: 100,
          display: "flex", gap: 10, alignItems: "center", whiteSpace: "nowrap",
        }}>
          ⚠️ {err}
          <button onClick={() => setErr("")} style={{ background: "none", border: "none", color: "rgba(22,32,18,0.6)", cursor: "pointer" }}>✕</button>
        </div>
      )}
    </div>
  );
}
