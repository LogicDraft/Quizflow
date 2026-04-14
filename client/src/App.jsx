import { BrowserRouter, Route, Routes } from "react-router-dom";
import ThemeToggle from "./components/ThemeToggle";
import AmbientEffects from "./components/AmbientEffects";
import { SocketProvider } from "./context/SocketContext";
import HomePage from "./pages/HomePage";
import ParticipantPage from "./pages/ParticipantPage";
import HostingPage from "./pages/HostingPage";
import HostDashboard from "./pages/HostDashboard";
import PlayerScreen from "./pages/PlayerScreen";

function NotFound() {
  return (
    <div className="mesh-bg">
      <div className="dot-grid" style={{ position: "fixed", inset: 0, opacity: 0.22, pointerEvents: "none" }} />

      <header className="site-header">
        <div className="site-header-inner">
          <a className="brand-wordmark" href="/">
            <div className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div className="brand-copy">
              <div className="brand-title">QuizFlow</div>
              <div className="brand-subtitle">Secure live quiz sessions</div>
            </div>
          </a>

          <div className="topbar-actions">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="page-main" style={{ minHeight: "calc(100vh - 7rem)", display: "grid", placeItems: "center" }}>
        <div className="glass-card-sq animate-pop-in" style={{ maxWidth: 560, width: "100%", padding: "2rem", textAlign: "center" }}>
          <div className="hero-eyebrow">Missing Route</div>
          <h1 className="hero-title" style={{ fontSize: "clamp(3rem, 10vw, 5rem)" }}>
            404
          </h1>
          <p className="hero-copy" style={{ marginTop: "0.8rem" }}>
            This page or game room could not be found.
          </p>
          <div className="pill-row" style={{ justifyContent: "center", marginTop: "1.5rem" }}>
            <a href="/" className="btn-primary-sq" style={{ textDecoration: "none" }}>
              Back Home
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <SocketProvider>
      <AmbientEffects />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/participant" element={<ParticipantPage />} />
          <Route path="/hosting" element={<HostingPage />} />
          <Route path="/about" element={<HomePage />} />
          <Route path="/features" element={<HomePage />} />
          <Route path="/how-it-works" element={<HomePage />} />
          <Route path="/host" element={<HostDashboard />} />
          <Route path="/host/:pin" element={<HostDashboard />} />
          <Route path="/play/:pin" element={<PlayerScreen />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
}
