import { useState, useEffect } from "react";
import { ANSWER_COLORS } from "../utils/scoring";

/**
 * AnswerDistribution
 * Shows per-option vote counts as animated bars.
 * Props: options[], correctIndex, distribution { 0: count, 1: count, ... }, total
 */
export default function AnswerDistribution({ options = [], correctIndex, distribution = {}, total = 1 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const maxCount = Math.max(...Object.values(distribution), 1);

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: "0.68rem",
        color: "var(--muted)", letterSpacing: "0.12em",
        textTransform: "uppercase", marginBottom: 4
      }}>
        Answer Distribution
      </div>

      {options.map((opt, i) => {
        const count   = distribution[i] || 0;
        const pct     = Math.round((count / Math.max(total, 1)) * 100);
        const barPct  = (count / maxCount) * 100;
        const isRight = i === correctIndex;
        const color   = isRight ? "var(--green)" : ANSWER_COLORS[i].bg;
        const c       = ANSWER_COLORS[i];

        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Label */}
            <div style={{
              width: 32, height: 32, borderRadius: 9, flexShrink: 0,
              background: color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.85rem",
              color: "white", position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(135deg,rgba(255,255,255,0.2) 0%,transparent 60%)",
              }} />
              {isRight ? "✓" : c.label}
            </div>

            {/* Bar + text */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{
                  fontFamily: "var(--font-body)", fontSize: "0.78rem",
                  color: isRight ? "var(--green)" : "var(--text)",
                  fontWeight: isRight ? 600 : 400,
                  maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                }}>
                  {opt}
                </span>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.72rem",
                  color: isRight ? "var(--green)" : "var(--muted)",
                  fontWeight: 600, flexShrink: 0, marginLeft: 8
                }}>
                  {count} ({pct}%)
                </span>
              </div>

              {/* Track */}
              <div style={{
                height: 8, background: "var(--border)",
                borderRadius: 99, overflow: "hidden"
              }}>
                <div style={{
                  height: "100%", borderRadius: 99,
                  background: isRight
                    ? "linear-gradient(90deg,var(--green),#00c97a)"
                    : `linear-gradient(90deg,${color},${color}bb)`,
                  width: visible ? `${barPct}%` : "0%",
                  transition: `width 0.7s ${i * 80}ms cubic-bezier(0.22,1,0.36,1)`,
                  boxShadow: isRight ? "0 0 10px rgba(13,242,160,0.5)" : "none",
                }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
