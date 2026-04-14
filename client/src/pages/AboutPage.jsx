import ThemeToggle from "../components/ThemeToggle";

export default function AboutPage() {
  return (
    <div className="mesh-bg" style={{ minHeight: "100vh" }}>
      <header className="site-header">
        <div className="site-header-inner">
          <a className="brand-wordmark" href="/">
            <div className="brand-mark" aria-hidden="true">A</div>
            <div className="brand-copy">
              <div className="brand-title">About</div>
              <div className="brand-subtitle">Platform overview</div>
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
          <h1 className="hero-title" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>About This Platform</h1>
          <p className="hero-copy" style={{ marginTop: "0.8rem" }}>
            This website is designed as a reusable quiz experience with dedicated host and participant portals, realtime gameplay, and modern UI patterns.
          </p>
        </div>
      </main>
    </div>
  );
}
