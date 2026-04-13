import { useState } from "react";

export default function PINShare({ pin }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard?.writeText(pin).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const joinURL = `${window.location.origin}/?pin=${pin}`;

  function copyLink() {
    navigator.clipboard?.writeText(joinURL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {/* PIN display */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 16px", borderRadius: 12,
        background: "transparent",
        border: "1px solid rgba(114,240,255,0.24)",
      }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: "0.65rem",
          color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.12em",
        }}>PIN</span>
        <span style={{
          fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.5rem",
          color: "var(--cyan)", letterSpacing: "0.3em",
          textShadow: "0 0 15px rgba(114,240,255,0.5)",
        }}>{pin}</span>
      </div>

      {/* Copy PIN */}
      <button
        onClick={copy}
        title="Copy PIN"
        style={{
          padding: "9px 14px",
          borderRadius: 10,
          background: copied ? "rgba(127,231,198,0.14)" : "rgba(17,26,45,0.8)",
          border: `1.5px solid ${copied ? "rgba(127,231,198,0.4)" : "var(--border)"}`,
          color: copied ? "var(--green)" : "var(--muted)",
          fontFamily: "var(--font-mono)", fontSize: "0.72rem",
          fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
          transition: "all 0.15s", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 5,
          whiteSpace: "nowrap",
        }}
      >
        {copied ? "✓ Copied!" : "📋 Copy"}
      </button>

      {/* Copy link */}
      <button
        onClick={copyLink}
        title="Copy join link"
        style={{
          padding: "9px 12px",
          borderRadius: 10,
          background: "rgba(17,26,45,0.7)",
          border: "1.5px solid var(--border)",
          color: "var(--muted)",
          fontSize: "1rem",
          transition: "all 0.15s", cursor: "pointer",
        }}
      >
        🔗
      </button>
    </div>
  );
}
