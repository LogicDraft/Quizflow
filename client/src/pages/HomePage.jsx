import ThemeToggle from "../components/ThemeToggle";
import NetworkStatus from "../components/NetworkStatus";

export default function HomePage() {
  return (
    <div className="mesh-bg" style={{ minHeight: "100vh" }}>
      <NetworkStatus />

      <style>{`
        .home-top-nav {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          width: 100%;
        }
        .home-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 3.15rem;
          padding: 0 1.55rem;
          border-radius: 999px;
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.01em;
          text-decoration: none;
          border: 1px solid var(--border);
          background: var(--surface-strong);
          color: var(--text);
          transition: all var(--transition);
        }
        .home-pill:hover {
          transform: translateY(-1px);
          border-color: var(--border-strong);
          box-shadow: var(--shadow-soft);
        }
        .home-pill-primary {
          background: var(--btn-primary);
          color: #fff;
          border-color: rgba(255, 255, 255, 0.14);
          box-shadow: var(--btn-primary-shadow);
        }
        .home-pill-primary:hover {
          filter: brightness(1.06);
        }
        .home-footer {
          margin-top: 2.2rem;
          padding: 1.05rem 0 0.5rem;
          background: linear-gradient(180deg, rgba(141, 173, 132, 0.22), rgba(141, 173, 132, 0.06));
        }
        .home-footer-content {
          width: min(1280px, calc(100vw - 1.2rem));
          margin: 0 auto;
          padding: 1.9rem 2rem 1.05rem;
          border-radius: 2rem;
          border: 1px solid var(--border);
          background: var(--surface-strong);
          box-shadow: var(--shadow-soft);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }
        .home-footer-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 2rem;
          flex-wrap: wrap;
          padding-bottom: 1.35rem;
        }
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 0.9rem;
        }
        .footer-brand-icon {
          width: 3rem;
          height: 3rem;
          border-radius: 0.95rem;
          display: grid;
          place-items: center;
          border: 1px solid rgba(96, 165, 250, 0.28);
          background: linear-gradient(145deg, rgba(96, 165, 250, 0.14), rgba(141, 173, 132, 0.2));
          color: rgba(96, 165, 250, 0.9);
        }
        .footer-brand-text {
          font-family: var(--font-display);
          font-size: 1.05rem;
          letter-spacing: 0.01em;
          color: var(--text);
          font-weight: 700;
        }
        .footer-brand-tagline {
          margin-top: 0.2rem;
          font-size: 0.8rem;
          color: var(--muted);
        }
        .footer-connect {
          display: flex;
          align-items: flex-start;
          justify-content: flex-start;
          gap: 0.7rem;
          flex-wrap: wrap;
        }
        .footer-connect-label {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--muted);
          font-weight: 700;
          min-width: 100%;
        }
        .footer-links {
          display: flex;
          align-items: center;
          gap: 0.78rem;
          flex-wrap: wrap;
        }
        .footer-link {
          display: inline-flex;
          align-items: center;
          gap: 0.48rem;
          text-decoration: none;
          color: var(--muted);
          border: 1px solid var(--border);
          background: var(--surface-strong);
          border-radius: 0.85rem;
          padding: 0.72rem 1rem;
          font-size: 0.86rem;
          font-weight: 600;
          transition: all var(--transition);
        }
        .footer-link:hover {
          color: var(--text);
          border-color: var(--border-strong);
          transform: translateY(-1px);
        }
        .footer-link svg {
          width: 14px;
          height: 14px;
          fill: currentColor;
          flex-shrink: 0;
        }
        .footer-bottom {
          margin-top: 0.2rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
        }
        .footer-copy {
          color: var(--muted);
          font-size: 0.86rem;
          letter-spacing: 0.01em;
        }
        @media (max-width: 900px) {
          .home-footer-content {
            padding: 1.3rem 1rem 0.9rem;
            border-radius: 1.35rem;
          }
          .home-top-nav {
            gap: 0.62rem;
          }
          .home-pill {
            min-height: 2.75rem;
            padding: 0 1.05rem;
            font-size: 0.82rem;
          }
        }
        @media (max-width: 600px) {
          .home-top-nav {
            justify-content: center;
          }
          .home-pill {
            min-height: 2.55rem;
            padding: 0 0.9rem;
            font-size: 0.78rem;
          }
          .footer-link {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <header className="site-header">
        <div className="site-header-inner" style={{ justifyContent: "center" }}>
          <div className="home-top-nav">
            <a href="#about" className="home-pill">About</a>
            <a href="#features" className="home-pill">Features</a>
            <a href="#how-it-works" className="home-pill">How It Works</a>
            <a href="#get-started" className="home-pill home-pill-primary">Get Started</a>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="page-main" style={{ maxWidth: 980, display: "grid", gap: 14 }}>
        <section id="about" className="glass-card-sq" style={{ padding: "2rem", textAlign: "center" }}>
          <div className="hero-eyebrow">Simple Home</div>
          <h1 className="hero-title" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)" }}>Quiz Platform</h1>
          <p className="hero-copy" style={{ marginTop: "0.9rem" }}>
            About: This platform supports real-time quiz sessions with dedicated participant and hosting portals.
          </p>
        </section>

        <section id="features" className="glass-card-sq" style={{ padding: "1.8rem" }}>
          <div className="hero-eyebrow">Features</div>
          <h2 className="hero-title" style={{ fontSize: "clamp(1.6rem, 3.6vw, 2.4rem)" }}>Everything in One Experience</h2>
          <div style={{ display: "grid", gap: 10, marginTop: "1rem" }}>
            {[
              "Separate participant and hosting websites",
              "Live join with PIN and nickname",
              "Custom quiz builder and launch flow",
              "Realtime gameplay with leaderboard",
              "Theme toggle and responsive UI",
            ].map((item, idx) => (
              <div key={item} className="meta-card" style={{ justifyContent: "flex-start" }}>
                <strong style={{ width: 30 }}>{String(idx + 1).padStart(2, "0")}</strong>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="glass-card-sq" style={{ padding: "1.8rem" }}>
          <div className="hero-eyebrow">How It Works</div>
          <h2 className="hero-title" style={{ fontSize: "clamp(1.6rem, 3.6vw, 2.4rem)" }}>Step-by-Step Flow</h2>
          <div style={{ display: "grid", gap: 10, marginTop: "1rem" }}>
            {[
              "Host opens Hosting Website and selects/creates a quiz",
              "Host starts the game and shares a PIN",
              "Participants join from Participant Website",
              "Questions run in realtime and scores update",
              "Session ends with final ranking",
            ].map((item, idx) => (
              <div key={item} className="meta-card" style={{ justifyContent: "flex-start" }}>
                <strong style={{ width: 30 }}>{idx + 1}</strong>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="get-started" className="glass-card-sq" style={{ padding: "2rem", textAlign: "center" }}>
          <div className="hero-eyebrow">Get Started</div>
          <h2 className="hero-title" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>Choose your portal to continue.</h2>
          <p className="hero-copy" style={{ marginTop: "0.9rem" }}>
            Start as a participant to join a quiz, or as a host to create and launch.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12, marginTop: "1.2rem" }}>
            <a href="/participant" className="btn-primary-sq" style={{ textDecoration: "none", justifyContent: "center" }}>
              Participant Website
            </a>
            <a href="/hosting" className="btn-secondary-sq" style={{ textDecoration: "none", justifyContent: "center" }}>
              Hosting Website
            </a>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="home-footer-content">
          <div className="home-footer-top">
            <div className="footer-brand">
              <div className="footer-brand-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <div className="footer-brand-text">The SecureQuiz Project</div>
                <div className="footer-brand-tagline">Smart &amp; Secure Quiz Platform</div>
              </div>
            </div>

            <div className="footer-connect">
              <span className="footer-connect-label">Connect</span>
              <div className="footer-links">
              <a href="https://github.com/GOWTHAM-314" target="_blank" rel="noopener noreferrer" className="footer-link">
                <svg viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                GitHub
              </a>
              <a href="https://www.linkedin.com/in/gowtham-gowda-c-b-a29727353/" target="_blank" rel="noopener noreferrer" className="footer-link">
                <svg viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                LinkedIn
              </a>
              <a href="https://www.instagram.com/gowtham_gowda_c_b" target="_blank" rel="noopener noreferrer" className="footer-link">
                <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                Instagram
              </a>
              <a href="mailto:gowdagowtham7930@gmail.com" className="footer-link">
                <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
                Contact
              </a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-copy">&copy; 2026 The SecureQuiz Project. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
