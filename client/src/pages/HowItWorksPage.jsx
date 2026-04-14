import ThemeToggle from "../components/ThemeToggle";

const STEPS = [
  "Host opens Hosting Portal and selects or creates a quiz",
  "Host starts a game session and gets a room PIN",
  "Participant opens Participant Portal and joins with PIN",
  "Questions run live and scores update in realtime",
  "Host and players continue until final ranking",
];

export default function HowItWorksPage() {
  return (
    <div className="mesh-bg" style={{ minHeight: "100vh" }}>
      <header className="site-header">
        <div className="site-header-inner">
          <a className="brand-wordmark" href="/">
            <div className="brand-mark" aria-hidden="true">W</div>
            <div className="brand-copy">
              <div className="brand-title">How It Works</div>
              <div className="brand-subtitle">Step-by-step flow</div>
            </div>
          </a>
          <div className="topbar-actions">
            <a href="/" className="btn-ghost" style={{ padding: "8px 12px", textDecoration: "none" }}>Home</a>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="page-main" style={{ maxWidth: 900 }}>
        <div className="glass-card-sq" style={{ padding: "1.6rem" }}>
          <h1 className="hero-title" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>How It Works</h1>
          <div style={{ display: "grid", gap: 10, marginTop: "1rem" }}>
            {STEPS.map((item, idx) => (
              <div key={item} className="meta-card">
                <strong style={{ width: 26 }}>{idx + 1}</strong>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
