import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SocketProvider } from "./context/SocketContext";
import HomePage      from "./pages/HomePage";
import HostDashboard from "./pages/HostDashboard";
import PlayerScreen  from "./pages/PlayerScreen";

function NotFound() {
  return (
    <div className="mesh-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "24px" }}>
      <div className="dot-grid" style={{ position: "fixed", inset: 0, opacity: 0.2, pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 10 }}>
        <div style={{ fontSize: "6rem", marginBottom: 12 }}>🎯</div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "3rem", color: "var(--cyan)", marginBottom: 8 }}>404</div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.2rem", color: "var(--text)", marginBottom: 8 }}>Page Not Found</div>
        <div style={{ color: "var(--muted)", marginBottom: 28, fontSize: "0.9rem" }}>This game room doesn't exist.</div>
        <a href="/" style={{
          display: "inline-block", padding: "14px 32px", borderRadius: 14,
          background: "linear-gradient(135deg,var(--cyan),var(--violet))",
          color: "var(--bg)", fontFamily: "var(--font-display)",
          fontWeight: 800, fontSize: "0.9rem", letterSpacing: "0.08em",
          textTransform: "uppercase", textDecoration: "none",
          boxShadow: "0 0 30px rgba(6,247,217,0.25)",
        }}>← Back Home</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"          element={<HomePage />}      />
          <Route path="/host"      element={<HostDashboard />} />
          <Route path="/host/:pin" element={<HostDashboard />} />
          <Route path="/play/:pin" element={<PlayerScreen />}  />
          <Route path="*"          element={<NotFound />}      />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
}
