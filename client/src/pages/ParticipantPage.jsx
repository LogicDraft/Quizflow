import { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import AvatarPicker from "../components/AvatarPicker";
import NetworkStatus from "../components/NetworkStatus";
import ThemeToggle from "../components/ThemeToggle";

const API = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

export default function ParticipantPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [pin, setPin] = useState(params.get("pin") || "");
  const [nick, setNick] = useState("");
  const [avatar, setAvatar] = useState("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='100' fill='%232a3040'/%3E%3Ccircle cx='100' cy='70' r='40' fill='%23a0aec0'/%3E%3Cpath d='M40 180A60 50 0 0 1 160 180Z' fill='%23a0aec0'/%3E%3C/svg%3E");
  const [showAvatars, setShowAvatars] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const pinRefs = useRef([]);

  async function handleJoin(e) {
    e.preventDefault();
    setErr("");
    if (pin.length !== 6) {
      setErr("Enter a valid 6-digit PIN");
      return;
    }
    if (nick.trim().length < 2) {
      setErr("Nickname needs at least 2 characters");
      return;
    }
    setLoading(true);
    try {
      await axios.get(`${API}/api/games/${pin}`);
      navigate(`/play/${pin}?nickname=${encodeURIComponent(nick.trim())}&avatar=${encodeURIComponent(avatar)}`);
    } catch {
      setErr("Game not found - double-check the PIN");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mesh-bg" style={{ minHeight: "100vh" }}>
      <NetworkStatus />
      <header className="site-header">
        <div className="site-header-inner">
          <a className="brand-wordmark" href="/">
            <div className="brand-mark" aria-hidden="true">P</div>
            <div className="brand-copy">
              <div className="brand-title">Participant Portal</div>
              <div className="brand-subtitle">Join a live session</div>
            </div>
          </a>
          <div className="topbar-actions">
            <a href="/" className="btn-ghost" style={{ padding: "8px 12px", textDecoration: "none" }}>Home</a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="page-main" style={{ maxWidth: 680 }}>
        <div className="glass-card-sq" style={{ padding: "1.5rem" }}>
          <h1 className="hero-title" style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}>Join Quiz</h1>
          <p className="hero-copy" style={{ marginTop: "0.4rem" }}>Enter your PIN, nickname, and avatar to participate.</p>

          <form onSubmit={handleJoin} style={{ marginTop: "1.3rem", display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className="field-label">Game PIN</label>
              <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      pinRefs.current[i] = el;
                    }}
                    value={pin[i] || ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(-1);
                      if (!val && e.target.value !== "") return;
                      const chars = (pin || "").split("");
                      chars[i] = val;
                      setPin(chars.join(""));
                      if (val && i < 5) pinRefs.current[i + 1]?.focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !pin[i] && i > 0) pinRefs.current[i - 1]?.focus();
                    }}
                    className="pin-slot"
                    maxLength={1}
                    inputMode="numeric"
                    aria-label={`PIN digit ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="participant-nick">Nickname</label>
              <input
                id="participant-nick"
                className="input-sq"
                value={nick}
                onChange={(e) => setNick(e.target.value.slice(0, 20))}
                placeholder="e.g. Player One"
                maxLength={20}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label className="field-label" style={{ marginBottom: 0 }}>Avatar</label>
                <button type="button" className="btn-ghost" style={{ padding: "6px 10px" }} onClick={() => setShowAvatars((v) => !v)}>
                  {showAvatars ? "Hide" : "Change"}
                </button>
              </div>
              <div className="meta-card">
                <img src={avatar} alt="Avatar" style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 8 }} />
                <span style={{ color: "var(--muted)" }}>{nick || "Your nickname"}</span>
              </div>
              {showAvatars && (
                <div style={{ marginTop: 8 }}>
                  <AvatarPicker selected={avatar} onSelect={(v) => { setAvatar(v); setShowAvatars(false); }} />
                </div>
              )}
            </div>

            {err && <div className="hp-error">{err}</div>}

            <button type="submit" className="btn-primary-sq" disabled={loading || pin.length !== 6 || nick.length < 2}>
              {loading ? "Joining..." : "Join Quiz ->"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
