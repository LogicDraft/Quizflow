import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useSound } from "../hooks/useSound";
import CircularTimer from "../components/CircularTimer";
import CountdownOverlay from "../components/CountdownOverlay";
import EmojiReactions from "../components/EmojiReactions";
import Podium from "../components/Podium";
import ScoreCounter from "../components/ScoreCounter";
import NetworkStatus from "../components/NetworkStatus";
import { ANSWER_COLORS, formatScore, getMedal, launchConfetti } from "../utils/scoring";

const P = { CONNECTING:"connecting", LOBBY:"lobby", STARTING:"starting",
            QUESTION:"question", ANSWERED:"answered", REVEAL:"reveal", FINAL:"final" };

// Speed tiers
function getSpeed(points) {
  if (points >= 900) return { label: "BLAZING",  icon: "⚡", color: "var(--cyan)"  };
  if (points >= 700) return { label: "FAST",     icon: "🔥", color: "var(--amber)" };
  if (points >= 400) return { label: "GOOD",     icon: "👍", color: "var(--green)" };
  return                  { label: "SLOW",     icon: "🐢", color: "var(--muted)" };
}

export default function PlayerScreen() {
  const { pin }       = useParams();
  const [sp]          = useSearchParams();
  const navigate      = useNavigate();
  const { socket }    = useSocket();
  const { playCorrect, playWrong, playVictory, playStart } = useSound();

  const nickname  = sp.get("nickname") || "Player";
  const initEmoji = sp.get("avatar")   || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='100' fill='%232a3040'/%3E%3Ccircle cx='100' cy='70' r='40' fill='%23a0aec0'/%3E%3Cpath d='M40 180A60 50 0 0 1 160 180Z' fill='%23a0aec0'/%3E%3C/svg%3E";

  const [phase, setPhase]       = useState(P.CONNECTING);
  const [emoji]                 = useState(initEmoji);
  const [quizTitle, setQT]      = useState("");
  const [pCount, setPC]         = useState(0);
  const [question, setQ]        = useState(null);
  const [selected, setSelected] = useState(null);
  const [result, setResult]     = useState(null);
  const [totalScore, setTS]     = useState(0);
  const [prevScore, setPrevS]   = useState(0);
  const [reveal, setReveal]     = useState(null);
  const [lb, setLb]             = useState([]);
  const [myRank, setRank]       = useState(null);
  const [streak, setStreak]     = useState(0);
  const [err, setErr]           = useState("");
  const [qNum, setQNum]         = useState(0);
  const [history, setHistory]   = useState([]);
  const [urgent, setUrgent]     = useState(false);

  // Haptic feedback
  const vibrate = (pattern) => navigator.vibrate?.(pattern);

  // Urgency Timer
  useEffect(() => {
    if (phase === P.QUESTION && question && selected === null) {
      if (question.time <= 5) {
        setUrgent(true);
      } else {
        const tid = setTimeout(() => setUrgent(true), (question.time - 5) * 1000);
        return () => clearTimeout(tid);
      }
    } else {
      setUrgent(false);
    }
  }, [phase, question, selected]);

  // Anti-cheat: tab switch
  useEffect(() => {
    const fn = () => { if (document.hidden && phase === P.QUESTION) socket?.emit("player:tab_switch", { pin }); };
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
  }, [phase, socket, pin]);

  useEffect(() => {
    if (!socket) return;
    socket.emit("player:join", { pin, nickname, avatar: emoji });

    socket.on("player:joined",        ({ quizTitle }) => { setQT(quizTitle); setPhase(P.LOBBY); });
    socket.on("lobby:update",         ({ playerCount }) => setPC(playerCount));
    socket.on("game:starting",        () => { setPhase(P.STARTING); playStart(); });
    socket.on("question:start",       q  => { setQ(q); setSelected(null); setResult(null); setReveal(null); setQNum(q.index + 1); setPhase(P.QUESTION); });
    socket.on("player:answer_result", ({ isCorrect, points, totalScore: ts }) => {
      setPrevS(totalScore);
      setResult({ isCorrect, points });
      setTS(ts);
      setPhase(P.ANSWERED);
      if (isCorrect) { playCorrect(); setStreak(s => s + 1); vibrate([40, 20, 40]); }
      else           { playWrong();   setStreak(0);            vibrate([80]);        }
    });
    socket.on("player:tab_warning",   ({ message }) => { setErr(message); setTimeout(() => setErr(""), 4000); });
    socket.on("question:reveal",      d  => {
      setReveal(d); setLb(d.leaderboard);
      const me = d.leaderboard.find(p => p.id === socket.id);
      if (me) setRank(me.rank);
      setPhase(P.REVEAL);
    });
    socket.on("game:end",             ({ leaderboard }) => {
      setLb(leaderboard);
      const me = leaderboard.find(p => p.id === socket.id);
      if (me) { setRank(me.rank); if (me.rank === 1) { playVictory(); launchConfetti(120); vibrate([50,30,50,30,100]); } }
      setPhase(P.FINAL);
    });
    socket.on("game:history",         ({ answers }) => setHistory(answers));
    socket.on("game:host_left",       () => { setErr("Host disconnected. Game ended."); setTimeout(() => navigate("/"), 3000); });
    socket.on("error",                ({ message }) => { setErr(message); setTimeout(() => setErr(""), 5000); });

    return () => ["player:joined","lobby:update","game:starting","question:start","player:answer_result","player:tab_warning","question:reveal","game:end","game:history","game:host_left","error"].forEach(e => socket.off(e));
  }, [socket, pin, nickname]);

  function answer(idx) {
    if (phase !== P.QUESTION || selected !== null) return;
    setSelected(idx);
    vibrate(30);
    socket.emit("player:answer", { pin, answerIndex: idx });
  }

  /* ── Status bar ─────────────────────────────────── */
  const StatusBar = () => (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "11px 16px",
      background: "rgba(17,24,16,0.9)", backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(45,59,39,0.7)",
      position: "sticky", top: 0, zIndex: 40,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img src={(emoji.startsWith("/") || emoji.startsWith("data:")) ? emoji : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='100' fill='%232a3040'/%3E%3Ccircle cx='100' cy='70' r='40' fill='%23a0aec0'/%3E%3Cpath d='M40 180A60 50 0 0 1 160 180Z' fill='%23a0aec0'/%3E%3C/svg%3E"} alt="Avatar" style={{ width: 38, height: 38, objectFit: "contain", borderRadius: 8, background: "rgba(26,37,23,0.08)", border: "1px solid rgba(26,37,23,0.1)" }} />
        <div>
          <div style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.9rem",
            color: "var(--text)", maxWidth: 110, overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{nickname}</div>
          {streak >= 2 && (
            <div style={{
              fontSize: "0.62rem", color: "var(--amber)",
              fontFamily: "var(--font-mono)", fontWeight: 600,
              animation: "streakBounce 0.6s ease",
            }}>🔥 {streak}× streak!</div>
          )}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {myRank && (
          <span style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.88rem",
            color: myRank <= 3 ? "var(--amber)" : "var(--muted)",
          }}>
            {getMedal(myRank) || `#${myRank}`}
          </span>
        )}
        <div style={{ textAlign: "right" }}>
          <ScoreCounter value={totalScore} style={{
            fontWeight: 700, fontSize: "1.05rem", color: "var(--cyan)",
            textShadow: "0 0 12px rgba(172,200,162,0.5)",
          }} />
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>pts</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mesh-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div className="dot-grid" style={{ position: "fixed", inset: 0, opacity: 0.18, pointerEvents: "none" }} />
      {urgent && <div className="urgency-vignette" />}
      <NetworkStatus />
      {phase === P.STARTING && <CountdownOverlay onDone={() => {}} />}
      <StatusBar />

      <main style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", zIndex: 10, overflow: "hidden" }}>

        {/* CONNECTING */}
        {phase === P.CONNECTING && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <div style={{ fontSize: "4rem", animation: "timerPulse 1s ease infinite" }}>🎯</div>
            <div style={{ fontFamily: "var(--font-display)", color: "var(--muted)" }}>Connecting...</div>
          </div>
        )}

        {/* LOBBY */}
        {phase === P.LOBBY && (
          <div className="animate-phase" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 20px", gap: 22, textAlign: "center" }}>
            <div style={{ position: "relative", width: 120, height: 120 }}>
              <img src={(emoji.startsWith("/") || emoji.startsWith("data:")) ? emoji : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='100' fill='%232a3040'/%3E%3Ccircle cx='100' cy='70' r='40' fill='%23a0aec0'/%3E%3Cpath d='M40 180A60 50 0 0 1 160 180Z' fill='%23a0aec0'/%3E%3C/svg%3E"} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "contain", position: "relative", zIndex: 5, filter: "drop-shadow(0 10px 20px rgba(26,37,23,0.15))" }} />
              {/* Animated rings */}
              {[0,1].map(i => (
                <div key={i} style={{
                  position: "absolute", inset: -12 - i*16, borderRadius: "50%",
                  border: "1.5px solid rgba(172,200,162,0.3)",
                  animation: `ripple ${1.5 + i * 0.5}s ease-out ${i * 0.4}s infinite`,
                }} />
              ))}
            </div>

            <div className="animate-slide-up">
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2.2rem", color: "var(--text)" }}>
                {nickname}
              </div>
              <div style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: 5 }}>
                You're in! 🎉
              </div>
            </div>

            <div className="glass animate-pop-in" style={{
              borderRadius: 22, padding: "18px 40px",
              border: "1px solid rgba(104,138,93,0.2)",
              animationDelay: "80ms", animationFillMode: "both",
            }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: "var(--text)" }}>{quizTitle}</div>
              <div style={{ color: "var(--muted)", fontSize: "0.82rem", marginTop: 5 }}>
                {pCount} player{pCount !== 1 ? "s" : ""} in lobby
              </div>
            </div>

            <div style={{ display: "flex", gap: 16 }}>
              {["⚡","🔥","🎯","🏆"].map((e, i) => (
                <span key={i} style={{ fontSize: "2rem", animation: `timerPulse ${1.4 + i * 0.3}s ease ${i * 0.25}s infinite` }}>{e}</span>
              ))}
            </div>

            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--muted)", letterSpacing: "0.15em", textTransform: "uppercase", animation: "timerPulse 2s ease infinite" }}>
              Waiting for host to start...
            </div>
          </div>
        )}

        {/* QUESTION / ANSWERED */}
        {(phase === P.QUESTION || phase === P.ANSWERED) && question && (
          <div className="animate-phase" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "clamp(10px,3vw,16px) clamp(12px,3vw,16px) 14px", gap: 10 }}>
            {/* Q progress pills */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 4 }}>
                {Array.from({ length: question.total }).map((_, i) => (
                  <div key={i} style={{
                    height: 6, borderRadius: 4,
                    width: i === question.index ? 20 : 7,
                    background: i < question.index ? "var(--green)" : i === question.index ? "var(--cyan)" : "var(--border)",
                    transition: "all 0.4s ease",
                    boxShadow: i === question.index ? "0 0 8px var(--cyan)" : "none",
                  }} />
                ))}
              </div>
              <div className="badge badge-cyan" style={{ padding: "3px 10px", fontSize: "0.62rem" }}>
                {question.index + 1}/{question.total}
              </div>
            </div>

            {/* Circular timer + question */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <CircularTimer
                totalTime={question.time}
                running={phase === P.QUESTION && selected === null}
                size={90}
                onExpire={() => { if (phase === P.QUESTION) setPhase(P.ANSWERED); }}
              />
              <div className="glass" style={{
                flex: 1, borderRadius: 18, padding: "16px 18px",
                border: "1px solid rgba(104,138,93,0.15)",
                boxShadow: "0 4px 20px rgba(104,138,93,0.05)",
              }}>
                <div style={{
                  fontFamily: "var(--font-display)", fontWeight: 700,
                  fontSize: "clamp(0.88rem,3.5vw,1.1rem)", color: "var(--text)", lineHeight: 1.45,
                  wordBreak: "break-word", overflowWrap: "break-word",
                }}>
                  {question.text}
                </div>
              </div>
            </div>

            {/* Answer buttons */}
            <div className={`ans-grid ${urgent ? "heartbeat-grid" : ""}`} style={{ flex: 1 }}>
              {question.options.map((opt, i) => {
                const c         = ANSWER_COLORS[i];
                const isSel     = selected === i;
                const isAns     = phase === P.ANSWERED;
                const isCorrect = result && isSel && result.isCorrect;
                const isWrong   = result && isSel && !result.isCorrect;

                return (
                  <button key={i} onClick={() => answer(i)} disabled={isAns} className={`ans-btn ${isSel ? "selected" : ""} ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`}
                    style={{
                      background: isSel ? c.light : c.bg,
                      borderRadius: 16,
                      padding: "0 10px",
                      minHeight: "clamp(70px,15vw,90px)",
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", gap: 4,
                      opacity: isAns && !isSel ? 0.35 : 1,
                    }}
                  >
                    {/* Inner shimmer */}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(255,255,255,0.16) 0%,transparent 55%)", pointerEvents: "none", zIndex: 1 }} />
                    <span style={{ fontSize: "clamp(1rem,4vw,1.4rem)", position: "relative", zIndex: 2 }}>{c.icon}</span>
                    <span style={{
                      fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--text)",
                      fontSize: "clamp(0.72rem,2.5vw,0.84rem)", textAlign: "center", lineHeight: 1.3,
                      position: "relative", zIndex: 2,
                      wordBreak: "break-word", overflowWrap: "break-word",
                    }}>{opt}</span>

                    {/* Selected pulse dot */}
                    {isSel && !result && (
                      <div style={{
                        position: "absolute", top: 8, right: 10, zIndex: 3,
                        width: 8, height: 8, borderRadius: "50%",
                        background: "rgba(255,255,255,0.6)",
                        animation: "timerPulse 0.5s ease-in-out infinite",
                      }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Result feedback Breakdown */}
            {result && (
              <div className="animate-pop-in" style={{
                borderRadius: 18, padding: "18px",
                background: result.isCorrect ? "rgba(163,196,152,0.08)" : "rgba(169,90,90,0.08)",
                border: `1.5px solid ${result.isCorrect ? "rgba(163,196,152,0.3)" : "rgba(169,90,90,0.3)"}`,
                display: "flex", flexDirection: "column", gap: 10,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: result.isCorrect ? "1px solid rgba(163,196,152,0.2)" : "1px solid rgba(169,90,90,0.2)", paddingBottom: 10 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.5rem", color: result.isCorrect ? "var(--green)" : "var(--red)" }}>
                    {result.isCorrect ? "✓ Correct!" : "✗ Wrong!"}
                  </div>
                  {streak >= 2 && result.isCorrect && (
                    <div style={{ fontSize: "0.8rem", color: "var(--amber)", fontWeight: 700 }}>🔥 {streak} in a row!</div>
                  )}
                </div>

                {result.isCorrect && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "0.95rem", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                    <div className="animate-slide-up" style={{ display: "flex", justifyContent: "space-between", color: "var(--text)", animationDelay: "100ms", animationFillMode: "both" }}>
                      <span>Base Points:</span>
                      <span>+{Math.min(500, result.points)}</span>
                    </div>
                    <div className="animate-slide-up" style={{ display: "flex", justifyContent: "space-between", color: "var(--text)", animationDelay: "200ms", animationFillMode: "both" }}>
                      <span>Speed Bonus:</span>
                      <span>+{Math.max(0, result.points - 500)}</span>
                    </div>
                    <div className="animate-slide-up" style={{ display: "flex", justifyContent: "space-between", color: "var(--green)", fontSize: "1.2rem", fontWeight: 800, marginTop: 4, paddingTop: 4, borderTop: "1px dashed rgba(163,196,152,0.3)", animationDelay: "300ms", animationFillMode: "both" }}>
                      <span>Total:</span>
                      <span>+{result.points}</span>
                    </div>
                    {/* Speed badge */}
                    {(() => { const s = getSpeed(result.points); return (
                      <div className="speed-badge animate-pop-in" style={{
                        background: `${s.color}15`, border: `1px solid ${s.color}40`, color: s.color,
                        marginTop: 4, animationDelay: "450ms", animationFillMode: "both"
                      }}>
                        {s.icon} {s.label}
                      </div>
                    ); })()}
                  </div>
                )}
              </div>
            )}

            {phase === P.ANSWERED && !result && (
              <div style={{ textAlign: "center", color: "var(--muted)", fontFamily: "var(--font-display)", fontSize: "0.85rem", padding: "12px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                {/* Equalizer animation */}
                <div style={{ display: "flex", gap: 4, height: 16, alignItems: "flex-end" }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ width: 4, background: "var(--cyan)", borderRadius: 2, animation: `timerPulse ${0.5 + i*0.2}s ease-in-out infinite alternate` }} />
                  ))}
                </div>
                ⏳ Waiting for others...
              </div>
            )}
          </div>
        )}

        {/* REVEAL */}
        {phase === P.REVEAL && reveal && (
          <div className="phase-enter-up" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 18px", gap: 18, textAlign: "center", overflowY: "auto" }}>
            <div style={{ fontSize: "5rem", lineHeight: 1, animation: selected === reveal.correctAnswer ? "popIn 0.5s ease" : "shake 0.4s ease" }}>
              {selected === reveal.correctAnswer ? "🎉" : "😔"}
            </div>

            <div>
              <div style={{
                fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem",
                color: selected === reveal.correctAnswer ? "var(--green)" : "var(--red)",
              }}>
                {selected === reveal.correctAnswer ? "Correct!" : "Incorrect"}
              </div>
              <div style={{ color: "var(--muted)", fontSize: "0.88rem", marginTop: 6 }}>
                Correct: <span style={{ color: "var(--text)", fontWeight: 600 }}>{reveal.correctText}</span>
              </div>
            </div>

            {/* Score card */}
            <div className="glass" style={{
              borderRadius: 22, padding: "18px 40px",
              border: "1px solid rgba(172,200,162,0.18)",
            }}>
              <ScoreCounter value={totalScore} style={{
                fontWeight: 800, fontSize: "2.4rem", color: "var(--cyan)",
                textShadow: "0 0 20px rgba(172,200,162,0.55)",
              }} />
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 4 }}>
                Total Score
              </div>
              {myRank && (
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: myRank <= 3 ? "var(--amber)" : "var(--text)", marginTop: 8, fontSize: "1.1rem" }}>
                  {getMedal(myRank) || `#${myRank}`} Rank
                </div>
              )}
            </div>

            <div style={{ marginTop: 10 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", color: "var(--pink)", fontWeight: 700, marginBottom: 8, animation: "popIn 1s ease 1s both" }}>React while you wait 👇</div>
              <EmojiReactions />
            </div>

            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase", animation: "timerPulse 2s ease infinite", marginTop: 10 }}>
              Next question coming up...
            </div>
          </div>
        )}

        {/* FINAL */}
        {phase === P.FINAL && (
          <div className="animate-phase" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 16px", gap: 18 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "4.5rem", lineHeight: 1, marginBottom: 8 }}>
                {myRank === 1 ? "🏆" : getMedal(myRank) || "🎯"}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2.2rem", color: "var(--text)" }}>
                {myRank === 1 ? "You Won!" : myRank <= 3 ? "Top 3! 🎉" : `Rank #${myRank}`}
              </div>
              <ScoreCounter value={totalScore} style={{
                fontWeight: 800, fontSize: "1.6rem", color: "var(--cyan)",
                textShadow: "0 0 15px rgba(172,200,162,0.5)",
              }} />
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>final score</div>
            </div>

            {/* Podium (top 3) */}
            <Podium players={lb} />

            {/* Leaderboard */}
            <div style={{ width: "100%", maxWidth: 400 }}>
              {lb.map((p, i) => (
                <div key={p.id} className="animate-rank-in" style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "11px 14px", borderRadius: 14, marginBottom: 7,
                  background: p.nickname === nickname ? "rgba(172,200,162,0.08)" : "rgba(26,37,23,0.6)",
                  border: p.nickname === nickname ? "1.5px solid rgba(172,200,162,0.3)" : "1.5px solid rgba(45,59,39,0.8)",
                  animationDelay: `${i * 45}ms`, animationFillMode: "both",
                }}>
                  <div style={{
                    width: 28, textAlign: "center",
                    fontFamily: "var(--font-display)", fontWeight: 800,
                    fontSize: p.rank <= 3 ? "1rem" : "0.78rem",
                    color: p.rank === 1 ? "#ffb938" : p.rank === 2 ? "#cbd5e1" : p.rank === 3 ? "#cd7c30" : "var(--muted)",
                  }}>
                    {getMedal(p.rank) || `#${p.rank}`}
                  </div>
                  <div style={{
                    flex: 1, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.88rem",
                    color: p.nickname === nickname ? "var(--cyan)" : "var(--text)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {p.nickname}{p.nickname === nickname ? " (you)" : ""}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.88rem", color: p.rank === 1 ? "#ffb938" : "var(--text)" }}>
                    {formatScore(p.score)}
                  </div>
                </div>
              ))}
            </div>

            {/* Private Player History */}
            {history && history.length > 0 && (
              <div style={{ width: "100%", maxWidth: 400, marginTop: 10 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.88rem", color: "var(--text)", marginBottom: 10, textAlign: "center" }}>
                  Your Performance Breakdown
                </div>
                {history.map((ans, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px", borderRadius: 12, marginBottom: 8,
                    background: ans.isCorrect ? "rgba(172,200,162,0.06)" : "rgba(169,90,90,0.06)",
                    border: `1.5px solid ${ans.isCorrect ? "var(--green)" : "var(--red)"}`
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ fontWeight: 800, fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: ans.isCorrect ? "var(--green)" : "var(--red)" }}>
                        Q{i + 1}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text)" }}>
                        {ans.isCorrect ? "✓ Correct" : "✗ Wrong"}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>
                        {ans.reactionTimeFormatted}
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.88rem", color: "var(--text)" }}>
                        +{ans.points}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => navigate("/")} className="btn-primary btn-violet"
              style={{ padding: "15px 36px", borderRadius: 16, width: "100%", maxWidth: 400, fontSize: "0.95rem" }}>
              Play Again →
            </button>
          </div>
        )}
      </main>

      {/* Error toast */}
      {err && (
        <div className="animate-pop-in" style={{
          position: "fixed", bottom: 20, left: 12, right: 12,
          background: "rgba(169,90,90,0.92)", backdropFilter: "blur(12px)",
          color: "var(--text)", padding: "13px 16px", borderRadius: 14,
          fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.88rem",
          zIndex: 200, textAlign: "center",
        }}>⚠️ {err}</div>
      )}
    </div>
  );
}
