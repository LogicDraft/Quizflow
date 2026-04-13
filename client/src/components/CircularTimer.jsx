import { useEffect, useRef, useState } from "react";
import { useSound } from "../hooks/useSound";

const SIZE   = 120;
const STROKE = 10;
const R      = (SIZE / 2) - (STROKE / 2);
const CIRC   = 2 * Math.PI * R;

export default function CircularTimer({ totalTime, running = true, onExpire, size = SIZE }) {
  const [left, setLeft]   = useState(totalTime);
  const [offset, setOffset] = useState(0);
  const startRef          = useRef(Date.now());
  const expiredRef        = useRef(false);
  const { playTick, playUrgent } = useSound();

  useEffect(() => {
    setLeft(totalTime);
    setOffset(0);
    expiredRef.current = false;
    startRef.current = Date.now();
    if (!running) return;

    const id = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const rem     = Math.max(0, totalTime - elapsed);
      const pct     = rem / totalTime;

      setLeft(Math.ceil(rem));
      setOffset(CIRC * (1 - pct));

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
  const pct    = left / totalTime;

  const strokeColor = urgent
    ? "#ff3d6e"
    : pct > 0.5 ? "var(--cyan)" : "#ffb938";

  const scale = size / SIZE;

  return (
    <div className="circular-timer" style={{
      width: size, height: size,
      position: "relative", flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <svg width={size} height={size} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* Track */}
        <circle
          className="track"
          cx={SIZE/2} cy={SIZE/2} r={R}
          strokeWidth={STROKE}
          stroke="var(--border)"
        />
        {/* Animated fill */}
        <circle
          className="fill"
          cx={SIZE/2} cy={SIZE/2} r={R}
          strokeWidth={STROKE}
          stroke={strokeColor}
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1s linear, stroke 0.5s ease",
            filter: urgent ? "drop-shadow(0 0 6px rgba(169,90,90,0.8))"
                           : "drop-shadow(0 0 5px rgba(172,200,162,0.6))",
          }}
        />
      </svg>

      {/* Number in center */}
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <span style={{
          fontFamily: "var(--font-display)", fontWeight: 800,
          fontSize: size * 0.28,
          color: urgent ? "var(--red)" : "var(--cyan)",
          lineHeight: 1,
          animation: urgent ? "timerPulse 0.5s ease-in-out infinite" : "none",
          textShadow: urgent
            ? "0 0 15px rgba(169,90,90,0.8)"
            : "0 0 12px rgba(172,200,162,0.6)",
        }}>
          {left}
        </span>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: size * 0.1,
          color: "var(--muted)", letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}>sec</span>
      </div>
    </div>
  );
}
