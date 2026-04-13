import { useEffect, useState } from "react";
import { formatScore } from "../utils/scoring";

const PODIUM = [
  { rank: 2, height: 100, color: "#94a3b8", label: "2nd", delay: 200 },
  { rank: 1, height: 140, color: "#ffb938", label: "1st", delay: 0   },
  { rank: 3, height: 70,  color: "#cd7c30", label: "3rd", delay: 350 },
];

export default function Podium({ players = [] }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  if (players.length < 1) return null;

  const getPlayer = (rank) => players.find(p => p.rank === rank);

  return (
    <div style={{
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      gap: 8,
      width: "100%",
      maxWidth: 380,
      padding: "20px 10px 0",
    }}>
      {PODIUM.map(({ rank, height, color, label, delay }) => {
        const player = getPlayer(rank);
        if (!player && rank <= 3 && rank > players.length) return (
          <div key={rank} style={{ flex: 1 }} />
        );
        if (!player) return <div key={rank} style={{ flex: 1 }} />;

        const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };

        return (
          <div key={rank} style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
          }}>
            {/* Avatar + name above bar */}
            <div style={{
              textAlign: "center",
              marginBottom: 8,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
              transition: `opacity 0.5s ${delay + 200}ms, transform 0.5s ${delay + 200}ms cubic-bezier(0.22,1,0.36,1)`,
            }}>
              <div style={{ fontSize: rank === 1 ? "2.4rem" : "1.8rem", lineHeight: 1 }}>
                {player.emoji || medals[rank]}
              </div>
              <div style={{
                fontFamily: "var(--font-display)", fontWeight: 700,
                fontSize: rank === 1 ? "0.88rem" : "0.75rem",
                color: rank === 1 ? "#ffb938" : "var(--text)",
                marginTop: 4,
                maxWidth: 80, overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap",
                textShadow: rank === 1 ? "0 0 15px rgba(255,185,56,0.5)" : "none"
              }}>
                {player.nickname}
              </div>
              <div style={{
                fontFamily: "var(--font-mono)", fontWeight: 700,
                fontSize: "0.7rem", color: color,
                marginTop: 2,
              }}>
                {formatScore(player.score)}
              </div>
            </div>

            {/* Bar */}
            <div className="podium-bar" style={{
              width: "100%",
              height: visible ? height : 0,
              background: `linear-gradient(180deg, ${color}55 0%, ${color}22 100%)`,
              border: `1px solid ${color}55`,
              transition: `height 0.7s ${delay}ms cubic-bezier(0.22,1,0.36,1)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transformOrigin: "bottom",
            }}>
              <span style={{
                fontFamily: "var(--font-display)", fontWeight: 800,
                fontSize: "1.4rem", color,
                textShadow: `0 0 15px ${color}88`,
              }}>
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
