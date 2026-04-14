import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

const FEATURES = [
  "Separate participant and hosting portals",
  "Realtime join and host control workflow",
  "Custom quiz builder with timed questions",
  "Modern responsive UI for desktop and mobile",
  "Dark/minimal theme toggle support",
];

const STEPS = [
  "Open Hosting Portal and create/select a quiz",
  "Launch the session and share the PIN",
  "Participants join from Participant Portal",
  "Run live questions and reveal scores",
  "Complete the game and view final ranking",
];

export default function InfoPage() {
  const location = useLocation();

  useEffect(() => {
    const targetByPath = {
      "/about": "about",
      "/features": "features",
      "/how-it-works": "how-it-works",
    };
    const targetId = targetByPath[location.pathname] || "about";
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.pathname]);

  return (
    <div className="mesh-bg" style={{ minHeight: "100vh" }}>
      <header className="site-header">
        <div className="site-header-inner" style={{ justifyContent: "center", gap: "1rem" }}>
          <a href="/about" className="btn-ghost" style={{ padding: "8px 12px", textDecoration: "none" }}>About</a>
          <a href="/features" className="btn-ghost" style={{ padding: "8px 12px", textDecoration: "none" }}>Features</a>
          <a href="/how-it-works" className="btn-ghost" style={{ padding: "8px 12px", textDecoration: "none" }}>How It Works</a>
          <a href="/" className="btn-secondary-sq" style={{ padding: "8px 14px", textDecoration: "none" }}>Home</a>
          <ThemeToggle />
        </div>
      </header>

      <main className="page-main" style={{ maxWidth: 980, display: "grid", gap: 14 }}>
        <section id="about" className="glass-card-sq" style={{ padding: "1.6rem" }}>
          <div className="hero-eyebrow">About</div>
          <h1 className="hero-title" style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)" }}>About This Platform</h1>
          <p className="hero-copy" style={{ marginTop: "0.8rem" }}>
            This is a reusable quiz platform with dedicated host and participant portals, real-time gameplay, and clean modern visuals.
          </p>
        </section>

        <section id="features" className="glass-card-sq" style={{ padding: "1.6rem" }}>
          <div className="hero-eyebrow">Features</div>
          <h2 className="hero-title" style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)" }}>Core Features</h2>
          <div style={{ display: "grid", gap: 10, marginTop: "1rem" }}>
            {FEATURES.map((item, idx) => (
              <div key={item} className="meta-card">
                <strong style={{ width: 26 }}>{String(idx + 1).padStart(2, "0")}</strong>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="glass-card-sq" style={{ padding: "1.6rem" }}>
          <div className="hero-eyebrow">How It Works</div>
          <h2 className="hero-title" style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)" }}>Flow</h2>
          <div style={{ display: "grid", gap: 10, marginTop: "1rem" }}>
            {STEPS.map((item, idx) => (
              <div key={item} className="meta-card">
                <strong style={{ width: 26 }}>{idx + 1}</strong>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
