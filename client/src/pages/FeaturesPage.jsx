import ThemeToggle from "../components/ThemeToggle";

const FEATURES = [
  "Separate participant and hosting portals",
  "Realtime session join and host controls",
  "Custom quiz builder with question options",
  "Responsive card-based UI",
  "Theme toggle with glass/minimal modes",
];

export default function FeaturesPage() {
  return (
    <div className="mesh-bg" style={{ minHeight: "100vh" }}>
      <header className="site-header">
        <div className="site-header-inner">
          <a className="brand-wordmark" href="/">
            <div className="brand-mark" aria-hidden="true">F</div>
            <div className="brand-copy">
              <div className="brand-title">Features</div>
              <div className="brand-subtitle">What you get</div>
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
          <h1 className="hero-title" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>Features</h1>
          <div style={{ display: "grid", gap: 10, marginTop: "1rem" }}>
            {FEATURES.map((item, idx) => (
              <div key={item} className="meta-card">
                <strong style={{ width: 26 }}>{String(idx + 1).padStart(2, "0")}</strong>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
