import { useEffect, useState } from "react";
import { formatScore, launchConfetti } from "../utils/scoring";

const PODIUM = [
  { rank: 2, height: 100, color: "#72f0ff", label: "2nd", delay: 2000 },
  { rank: 1, height: 140, color: "#f6cf7d", label: "1st", delay: 4000 },
  { rank: 3, height: 70,  color: "#ff86c2", label: "3rd", delay: 500 },
];

export default function Podium({ players = [] }) {
  const [visibleRanks, setVisibleRanks] = useState({});

  useEffect(() => {
    // Reveal individually
    const t3 = setTimeout(() => { setVisibleRanks(prev => ({...prev, 3: true})); launchConfetti(40, { origin: { x: 0.8, y: 0.8 } }); }, 500);
    const t2 = setTimeout(() => { setVisibleRanks(prev => ({...prev, 2: true})); launchConfetti(40, { origin: { x: 0.2, y: 0.8 } }); }, 2000);
    const t1 = setTimeout(() => { setVisibleRanks(prev => ({...prev, 1: true})); launchConfetti(120, { origin: { x: 0.5, y: 0.4 } }); }, 4000);
    
    return () => { clearTimeout(t3); clearTimeout(t2); clearTimeout(t1); };
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
              opacity: visibleRanks[rank] ? 1 : 0,
              transform: visibleRanks[rank] ? "translateY(0)" : "translateY(16px)",
              transition: `opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)`,
            }}>
              <div style={{ display: "flex", justifyContent: "center" }}>
                {player.emoji && (player.emoji.startsWith("/") || player.emoji.startsWith("data:")) ? (
                  <img src={player.emoji} alt="Avatar" style={{ width: rank === 1 ? 64 : 48, height: rank === 1 ? 64 : 48, objectFit: "contain", background: "transparent", borderRadius: 12, border: `2px solid ${color}80` }} />
                ) : (
                  <div style={{ fontSize: rank === 1 ? "2.4rem" : "1.8rem", lineHeight: 1 }}>{player.emoji || medals[rank]}</div>
                )}
              </div>
              <div style={{
                fontFamily: "var(--font-inter)", fontWeight: 700,
                fontSize: rank === 1 ? "0.88rem" : "0.75rem",
                color: rank === 1 ? "var(--amber)" : "var(--text)",
                marginTop: 4,
                maxWidth: 80, overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap",
                textShadow: rank === 1 ? "0 0 15px rgba(246,207,125,0.5)" : "none"
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
              height: visibleRanks[rank] ? height : 0,
              background: `linear-gradient(180deg, ${color}55 0%, ${color}22 100%)`,
              border: `1px solid ${color}55`,
              transition: `height 0.8s cubic-bezier(0.22,1,0.36,1)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transformOrigin: "bottom",
            }}>
              <span style={{
                fontFamily: "var(--font-inter)", fontWeight: 800,
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
