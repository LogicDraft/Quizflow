const AVATARS = [
  "🦊","🐯","🦁","🐸","🦄","🐉","🦋","🐺",
  "🦅","🐳","🦝","🐧","🦜","🐻","🦈","🐙",
  "🦩","🦊","🐱","🐭","🐹","🐼","🦔","🦦",
];

export default function AvatarPicker({ selected, onSelect }) {
  return (
    <div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: "0.68rem",
        color: "var(--muted)", letterSpacing: "0.12em",
        textTransform: "uppercase", marginBottom: 10,
      }}>
        Choose Avatar
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(8, 1fr)",
        gap: 6,
      }}>
        {AVATARS.map(emoji => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            style={{
              fontSize: "1.4rem",
              padding: "8px 4px",
              borderRadius: 10,
              transition: "transform 0.12s cubic-bezier(0.175,0.885,0.32,1.275), background 0.12s",
              background: selected === emoji
                ? "rgba(6,247,217,0.15)"
                : "rgba(13,16,34,0.5)",
              border: selected === emoji
                ? "1.5px solid rgba(6,247,217,0.45)"
                : "1.5px solid rgba(28,34,64,0.8)",
              transform: selected === emoji ? "scale(1.2)" : "scale(1)",
              cursor: "pointer",
              lineHeight: 1,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
