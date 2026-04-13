import { useEffect, useState } from "react";

export default function NetworkStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [show, setShow]     = useState(false);

  useEffect(() => {
    function handleOnline()  { setOnline(true);  setShow(true); setTimeout(() => setShow(false), 2500); }
    function handleOffline() { setOnline(false); setShow(true); }

    window.addEventListener("online",  handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online",  handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!show) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
      background:   online ? "var(--green)" : "var(--red)",
      color:        online ? "var(--bg)"    : "white",
      textAlign:    "center",
      padding:      "9px 16px",
      fontFamily:   "var(--font-display)",
      fontWeight:   700, fontSize: "0.82rem",
      letterSpacing:"0.08em", textTransform: "uppercase",
      animation:    "slideDown 0.3s ease both",
    }}>
      {online ? "✓ Back online" : "⚠ No internet connection"}
    </div>
  );
}
