const AVATARS = [
  "/avatars/peter1.webp", "/avatars/lois1.webp", "/avatars/meg1.png", "/avatars/chris.png",
  "/avatars/brian3.png", "/avatars/stewie1.webp", "/avatars/quagmire.png", "/avatars/joe1.png",
  "/avatars/cleveland-animation-actionmodal-0014x.webp", "/avatars/mort1.png", "/avatars/bonnie1.png", "/avatars/herbert2.png",
  "/avatars/tricia.webp", "/avatars/bruce2.png", "/avatars/jerome2.webp", "/avatars/cheryl-tiegs.webp"
];

export default function AvatarPicker({ selected, onSelect }) {
  // If no selected avatar or it's a legacy emoji, select the first one by default
  const isSelected = (avatar) => selected === avatar;

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
        {AVATARS.map(avatarPath => (
          <button
            type="button"
            key={avatarPath}
            onClick={() => onSelect(avatarPath)}
            style={{
              padding: "4px",
              borderRadius: 14,
              transition: "transform 0.15s cubic-bezier(0.175,0.885,0.32,1.275), background 0.15s, border-color 0.15s",
              background: isSelected(avatarPath)
                ? "rgba(6,247,217,0.15)"
                : "rgba(13,16,34,0.5)",
              border: isSelected(avatarPath)
                ? "1.5px solid rgba(6,247,217,0.6)"
                : "1.5px solid rgba(28,34,64,0.8)",
              transform: isSelected(avatarPath) ? "scale(1.15)" : "scale(1)",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <img src={avatarPath} alt="Avatar" style={{
              width: "100%", height: "auto", aspectRatio: "1/1",
              objectFit: "contain",
              filter: isSelected(avatarPath) ? "none" : "grayscale(30%) brightness(0.8)",
              transition: "filter 0.15s",
            }} />
          </button>
        ))}
      </div>
    </div>
  );
}
