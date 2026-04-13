import { useEffect, useRef, useState } from "react";
import { useSound } from "../hooks/useSound";

export default function Timer({ totalTime, running = true, onExpire, size = "normal" }) {
  const [left, setLeft]   = useState(totalTime);
  const [pct, setPct]     = useState(100);
  const startRef          = useRef(Date.now());
  const expiredRef        = useRef(false);
  const { playTick, playUrgent } = useSound();

  useEffect(() => {
    setLeft(totalTime); setPct(100);
    expiredRef.current = false;
    startRef.current = Date.now();
    if (!running) return;

    const id = setInterval(() => {
      const elapsed  = (Date.now() - startRef.current) / 1000;
      const rem      = Math.max(0, totalTime - elapsed);
      setLeft(Math.ceil(rem));
      setPct((rem / totalTime) * 100);

      if (Math.ceil(rem) <= 5 && rem > 0) playUrgent();
      else if (rem > 0) playTick();

      if (rem <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        clearInterval(id);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [totalTime, running]);

  const urgent = left <= 5;
  const isLarge = size === "large";

  const barColor = urgent
    ? "linear-gradient(90deg,#ff3d6e,#ff8f00)"
    : pct > 50
    ? "linear-gradient(90deg,#06f7d9,#7c5cfc)"
    : "linear-gradient(90deg,#ffb938,#ff3d6e)";

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-xs uppercase tracking-widest" style={{color:"var(--muted)"}}>Time</span>
        <span
          className={`font-display font-black tabular-nums ${isLarge ? "text-4xl" : "text-2xl"}`}
          style={{
            color: urgent ? "var(--red)" : "var(--cyan)",
            animation: urgent ? "timerPulse 0.5s ease-in-out infinite" : "none",
            textShadow: urgent ? "0 0 20px rgba(255,61,110,0.8)" : "0 0 15px rgba(6,247,217,0.6)"
          }}
        >
          {left}s
        </span>
      </div>

      {/* Track */}
      <div style={{background:"var(--border)",borderRadius:9999,overflow:"hidden",height: isLarge ? 10 : 6,position:"relative"}}>
        <div
          style={{
            height:"100%", borderRadius:9999,
            background: barColor,
            width: `${pct}%`,
            transition: "width 1s linear",
            boxShadow: urgent
              ? "0 0 12px rgba(255,61,110,0.8)"
              : "0 0 12px rgba(6,247,217,0.6)"
          }}
        />
        {/* Shimmer */}
        {!urgent && (
          <div style={{
            position:"absolute", top:0, left:0, right:0, bottom:0,
            background:"linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.15) 50%,transparent 100%)",
            animation:"gradientShift 2s linear infinite",
            backgroundSize:"200% 100%"
          }}/>
        )}
      </div>
    </div>
  );
}
