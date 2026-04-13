import { getMedal, formatScore } from "../utils/scoring";

export default function Leaderboard({ players = [], showChange = true, maxRows = 10, compact = false }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? 6 : 8, width: "100%" }}>
      {players.slice(0, maxRows).map((p, i) => {
        const medal  = getMedal(p.rank);
        const isTop3 = p.rank <= 3;
        const borderColor = p.rank === 1 ? "rgba(213,185,120,0.45)"
          : p.rank === 2 ? "rgba(162,170,162,0.25)"
          : p.rank === 3 ? "rgba(169,142,108,0.25)"
          : "rgba(45,59,39,0.85)";
        const bgColor = p.rank === 1 ? "rgba(213,185,120,0.07)"
          : isTop3 ? "rgba(104,138,93,0.06)"
          : "rgba(26,37,23,0.55)";

        // Rank change (if server sends prevRank)
        const rankDelta = p.prevRank !== undefined ? p.prevRank - p.rank : null;

        return (
          <div key={p.id} className={`animate-rank-in ${p.rank === 1 ? "leaderboard-glow" : ""}`}
            style={{ animationDelay: `${i * 55}ms`, animationFillMode: "both" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: compact ? 8 : 10,
              padding: compact ? "10px 13px" : "12px 16px",
              borderRadius: 14, background: bgColor,
              border: `1px solid ${borderColor}`,
              backdropFilter: "blur(8px)",
              transition: "all 0.3s ease",
            }}>
              {/* Rank */}
              <div style={{
                width: compact ? 28 : 34, textAlign: "center", flexShrink: 0,
                fontFamily: "var(--font-inter)", fontWeight: 800,
                fontSize: medal ? (compact ? "1.1rem" : "1.4rem") : (compact ? "0.75rem" : "0.85rem"),
                color: p.rank === 1 ? "#ffb938" : p.rank === 2 ? "#cbd5e1" : p.rank === 3 ? "#cd7c30" : "var(--muted)",
                textShadow: p.rank <= 3 ? "0 0 10px currentColor" : "none",
              }}>
                {medal || `#${p.rank}`}
              </div>

              {/* Name */}
              <div style={{
                flex: 1, overflow: "hidden",
                fontFamily: "var(--font-inter)", fontWeight: 700,
                fontSize: compact ? "0.82rem" : "0.92rem",
                color: isTop3 ? "var(--text)" : "#a0aec0",
                whiteSpace: "nowrap", textOverflow: "ellipsis",
              }}>{p.nickname}</div>

              {/* Rank change */}
              {rankDelta !== null && rankDelta !== 0 && (
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.65rem",
                  color: rankDelta > 0 ? "var(--green)" : "var(--red)",
                  flexShrink: 0, fontWeight: 700,
                }}>
                  {rankDelta > 0 ? `▲${rankDelta}` : `▼${Math.abs(rankDelta)}`}
                </div>
              )}

              {/* Points gained */}
              {showChange && p.lastPoints > 0 && (
                <div style={{
                  fontFamily: "var(--font-mono)", fontWeight: 600,
                  fontSize: compact ? "0.72rem" : "0.8rem",
                  color: "var(--green)", flexShrink: 0,
                  textShadow: "0 0 8px rgba(163,196,152,0.5)",
                }}>
                  +{formatScore(p.lastPoints)}
                </div>
              )}

              {/* Total score */}
              <div style={{
                fontFamily: "var(--font-mono)", fontWeight: 700, flexShrink: 0,
                minWidth: compact ? 50 : 60, textAlign: "right",
                fontSize: compact ? "0.82rem" : "0.92rem",
                color: p.rank === 1 ? "#ffb938" : isTop3 ? "var(--cyan)" : "var(--text)",
                textShadow: p.rank === 1 ? "0 0 10px rgba(213,185,120,0.5)" : isTop3 ? "0 0 8px rgba(172,200,162,0.4)" : "none",
              }}>
                {formatScore(p.score)}
              </div>
            </div>
          </div>
        );
      })}

      {players.length === 0 && (
        <div style={{ textAlign: "center", color: "var(--muted)", padding: "2rem", fontFamily: "var(--font-inter)" }}>
          No players yet...
        </div>
      )}
    </div>
  );
}
