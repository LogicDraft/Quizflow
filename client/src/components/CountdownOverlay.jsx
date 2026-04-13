import { useEffect, useState } from "react";
import { useSound } from "../hooks/useSound";

export default function CountdownOverlay({ onDone }) {
  const [n, setN]       = useState(3);
  const [key, setKey]   = useState(0);
  const { playCountdown } = useSound();

  useEffect(() => {
    playCountdown(n);
    if (n === 0) { setTimeout(onDone, 800); return; }
    const t = setTimeout(() => { setN(c => c-1); setKey(k => k+1); }, 950);
    return () => clearTimeout(t);
  }, [n]);

  const isGo = n === 0;
  const colors = ["var(--cyan)","var(--violet)","var(--pink)","var(--green)"];
  const color  = isGo ? "var(--green)" : colors[3 - n] || "var(--cyan)";

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:100,
      display:"flex", alignItems:"center", justifyContent:"center",
      background:"rgba(6,8,17,0.92)", backdropFilter:"blur(16px)"
    }}>
      {/* Dot grid */}
      <div className="dot-grid" style={{position:"absolute",inset:0,opacity:0.3}}/>

      {/* Ripple rings */}
      {[0,1,2].map(i => (
        <div key={`${key}-${i}`} style={{
          position:"absolute",
          width: 200, height: 200,
          borderRadius:"50%",
          border:`2px solid ${color}`,
          opacity:0,
          animation:`ripple 1.2s ease-out ${i*0.25}s forwards`
        }}/>
      ))}

      {/* Number */}
      <div key={key} style={{
        textAlign:"center",
        animation:"countIn 0.7s cubic-bezier(0.175,0.885,0.32,1.275) both"
      }}>
        <div style={{
          fontFamily:"'Syne',sans-serif",
          fontWeight:800,
          fontSize: isGo ? "7rem" : "11rem",
          lineHeight:1,
          color,
          textShadow:`0 0 40px ${color}, 0 0 80px ${color}55`
        }}>
          {isGo ? "GO!" : n}
        </div>
        <div style={{
          fontFamily:"'Plus Jakarta Sans',sans-serif",
          color:"var(--muted)",
          letterSpacing:"0.25em",
          textTransform:"uppercase",
          fontSize:"0.85rem",
          marginTop:"1rem"
        }}>
          {isGo ? "Quiz Starting!" : n===1 ? "Almost..." : "Get Ready"}
        </div>
      </div>
    </div>
  );
}
