import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import AvatarPicker from "../components/AvatarPicker";
import NetworkStatus from "../components/NetworkStatus";
import ThemeToggle from "../components/ThemeToggle";

const API = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

const BLANK_QUESTION = () => ({
  text: "",
  options: ["", "", "", ""],
  correct: 0,
  time: 20,
});

/* ──────────────────────────────────────────────
   Premium CSS — injected once at mount
   Uses CSS vars from style.css + minimal.css
─────────────────────────────────────────────── */
const PREMIUM_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;800;900&family=Syne:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');

/* ── Ambient Orbs ── */
.hp-orbs { position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden; }
.hp-orb {
  position:absolute;border-radius:50%;filter:blur(90px);
  animation:orbFloat 22s ease-in-out infinite;
}
.hp-orb-1 { width:640px;height:640px;top:-180px;left:-120px;
  background:radial-gradient(circle,rgba(6,182,212,0.22),transparent 70%);animation-delay:0s; }
.hp-orb-2 { width:520px;height:520px;top:22%;right:-160px;
  background:radial-gradient(circle,rgba(59,130,246,0.18),transparent 70%);animation-delay:-9s; }
.hp-orb-3 { width:440px;height:440px;bottom:8%;left:28%;
  background:radial-gradient(circle,rgba(139,92,246,0.16),transparent 70%);animation-delay:-16s; }
@keyframes orbFloat {
  0%,100% { transform:translate(0,0) scale(1); }
  33%     { transform:translate(28px,-44px) scale(1.04); }
  66%     { transform:translate(-22px,32px) scale(0.97); }
}
html[data-ui="minimal"] .hp-orb-1 { background:radial-gradient(circle,rgba(172,200,162,0.28),transparent 70%); }
html[data-ui="minimal"] .hp-orb-2 { background:radial-gradient(circle,rgba(137,166,127,0.2),transparent 70%); }
html[data-ui="minimal"] .hp-orb-3 { background:radial-gradient(circle,rgba(26,37,23,0.1),transparent 70%); }

/* ── Grid overlay ── */
.hp-grid {
  position:fixed;inset:0;pointer-events:none;z-index:0;
  background-image:
    linear-gradient(rgba(148,163,184,0.028) 1px, transparent 1px),
    linear-gradient(90deg,rgba(148,163,184,0.028) 1px, transparent 1px);
  background-size:64px 64px;
}
html[data-ui="minimal"] .hp-grid {
  background-image:
    linear-gradient(rgba(26,37,23,0.055) 1px, transparent 1px),
    linear-gradient(90deg,rgba(26,37,23,0.055) 1px, transparent 1px);
}

/* ── Navbar ── */
.hp-nav {
  position:sticky;top:0;z-index:200;
  display:flex;align-items:center;justify-content:space-between;
  height:66px;padding:0 2rem;
  background:var(--header-bg,rgba(13,15,23,0.82));
  backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
  border-bottom:1px solid var(--glass-border,rgba(148,163,184,0.1));
  gap:1rem;
}
html[data-ui="minimal"] .hp-nav {
  background:rgba(243,248,240,0.94);
  border-bottom-color:rgba(26,37,23,0.12);
}

.hp-brand {
  display:flex;align-items:center;gap:10px;
  text-decoration:none;color:inherit;flex-shrink:0;
}
.hp-brand-icon {
  width:38px;height:38px;border-radius:11px;flex-shrink:0;
  background:linear-gradient(135deg,var(--accent,#06b6d4),var(--primary,#3b82f6));
  display:grid;place-items:center;
  box-shadow:0 0 22px rgba(6,182,212,0.32);
  transition:box-shadow 0.3s;
}
.hp-brand:hover .hp-brand-icon { box-shadow:0 0 32px rgba(6,182,212,0.5); }
html[data-ui="minimal"] .hp-brand-icon {
  background:linear-gradient(135deg,#acc8a2,#1a2517);
  box-shadow:0 0 16px rgba(26,37,23,0.18);
}
.hp-brand-name {
  font-family:'Orbitron',monospace;font-weight:800;font-size:1rem;
  letter-spacing:0.1em;text-transform:uppercase;color:var(--text-1,#fff);line-height:1;
}
html[data-ui="minimal"] .hp-brand-name { color:#162012; }
.hp-brand-tagline {
  font-size:0.55rem;color:var(--text-3,#64748b);letter-spacing:0.16em;
  text-transform:uppercase;font-family:'Inter',sans-serif;margin-top:2px;
}
html[data-ui="minimal"] .hp-brand-tagline { color:#546d4e; }

.hp-nav-links {
  display:flex;gap:2px;align-items:center;flex:1;justify-content:center;
}
@media(max-width:860px){ .hp-nav-links { display:none; } }

.hp-nav-link {
  padding:7px 13px;border-radius:8px;font-size:0.76rem;font-weight:500;
  color:var(--text-2,#94a3b8);background:none;border:none;cursor:pointer;
  letter-spacing:0.025em;transition:all 0.18s;font-family:'Inter',sans-serif;
}
.hp-nav-link:hover { color:var(--text-1,#fff);background:var(--surface-2,rgba(255,255,255,0.06)); }
html[data-ui="minimal"] .hp-nav-link { color:#546d4e; }
html[data-ui="minimal"] .hp-nav-link:hover { color:#162012;background:rgba(26,37,23,0.07); }

.hp-nav-actions { display:flex;align-items:center;gap:10px;flex-shrink:0; }

/* ── Buttons ── */
.hp-btn {
  display:inline-flex;align-items:center;justify-content:center;gap:7px;
  border-radius:11px;font-family:'Inter',sans-serif;font-weight:600;
  letter-spacing:0.04em;cursor:pointer;transition:all 0.22s;
  white-space:nowrap;text-decoration:none;border:none;
}
.hp-btn-sm { padding:9px 18px;font-size:0.78rem; }
.hp-btn-md { padding:12px 24px;font-size:0.84rem; }
.hp-btn-lg { padding:14px 30px;font-size:0.9rem;border-radius:13px; }
.hp-btn-full { width:100%;padding:14px 20px;font-size:0.86rem; }

.hp-btn-primary {
  background:linear-gradient(135deg,var(--accent,#06b6d4) 0%,var(--primary,#3b82f6) 100%);
  color:#fff;border:1px solid rgba(255,255,255,0.12);
  box-shadow:0 4px 18px rgba(6,182,212,0.24);
}
.hp-btn-primary:hover:not(:disabled) {
  transform:translateY(-2px);filter:brightness(1.07);
  box-shadow:0 8px 30px rgba(6,182,212,0.38);
}
.hp-btn-primary:disabled { opacity:0.38;cursor:not-allowed;transform:none; }
html[data-ui="minimal"] .hp-btn-primary {
  background:linear-gradient(135deg,#31472b,#1a2517);
  box-shadow:0 4px 18px rgba(26,37,23,0.22);border-color:rgba(26,37,23,0.25);
}

.hp-btn-secondary {
  background:var(--surface-1,rgba(255,255,255,0.04));color:var(--text-1,#fff);
  border:1px solid var(--glass-border,rgba(148,163,184,0.12));
}
.hp-btn-secondary:hover { background:var(--surface-2,rgba(255,255,255,0.07));transform:translateY(-2px); border-color:rgba(148,163,184,0.22); }
html[data-ui="minimal"] .hp-btn-secondary { color:#162012;background:rgba(255,255,255,0.68);border-color:rgba(26,37,23,0.16); }
html[data-ui="minimal"] .hp-btn-secondary:hover { background:#ddecd5;border-color:rgba(26,37,23,0.28); }

/* ── Main content ── */
.hp-main {
  position:relative;z-index:1;
  max-width:1260px;margin:0 auto;
  padding:0 1.75rem 5rem;
}

/* ── Hero ── */
.hp-hero {
  text-align:center;padding:5.5rem 0 3.5rem;
}

.hp-hero-badge {
  display:inline-flex;align-items:center;gap:9px;
  padding:5px 16px 5px 8px;border-radius:100px;
  background:var(--surface-accent,rgba(6,182,212,0.07));
  border:1px solid var(--surface-accent-border,rgba(6,182,212,0.22));
  color:var(--accent,#06b6d4);font-size:0.66rem;font-weight:700;
  letter-spacing:0.12em;text-transform:uppercase;
  margin-bottom:1.8rem;cursor:default;
  animation:badgePulse 3.5s ease-in-out infinite;
}
.hp-badge-pip {
  width:7px;height:7px;border-radius:50%;
  background:var(--accent,#06b6d4);
  box-shadow:0 0 9px var(--accent,#06b6d4);
  animation:pipBlink 1.6s ease-in-out infinite;
}
@keyframes badgePulse { 0%,100%{box-shadow:0 0 0 0 rgba(6,182,212,0);} 50%{box-shadow:0 0 0 10px rgba(6,182,212,0.04);} }
@keyframes pipBlink   { 0%,100%{opacity:1;} 50%{opacity:0.28;} }
html[data-ui="minimal"] .hp-hero-badge {
  background:rgba(26,37,23,0.07);border-color:rgba(26,37,23,0.2);color:#1a2517;
}
html[data-ui="minimal"] .hp-badge-pip { background:#1a2517;box-shadow:0 0 8px rgba(26,37,23,0.28); }

.hp-h1 {
  font-family:'Syne',var(--font-display,sans-serif);font-weight:800;
  font-size:clamp(2.9rem,5.8vw,5.2rem);line-height:1.04;
  letter-spacing:-0.045em;margin:0 auto 1.5rem;
  max-width:980px;color:var(--text-1,#fff);
}
.hp-h1 .hp-accent-text {
  background:linear-gradient(135deg,var(--accent,#06b6d4) 0%,var(--primary,#3b82f6) 52%,var(--accent-2,#8b5cf6) 100%);
  -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;
}
html[data-ui="minimal"] .hp-h1 { color:#162012; }
html[data-ui="minimal"] .hp-h1 .hp-accent-text {
  background:linear-gradient(135deg,#31472b,#1a2517);
  -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;
}

.hp-hero-sub {
  font-size:clamp(0.95rem,1.8vw,1.12rem);color:var(--text-2,#94a3b8);
  max-width:600px;margin:0 auto 2.75rem;line-height:1.78;font-family:'Inter',sans-serif;
}
html[data-ui="minimal"] .hp-hero-sub { color:#546d4e; }

.hp-hero-ctas {
  display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:2.75rem;
}

.hp-proof {
  display:flex;justify-content:center;flex-wrap:wrap;gap:1.8rem;
}
.hp-proof-item {
  display:flex;align-items:center;gap:7px;font-size:0.75rem;
  color:var(--text-3,#64748b);font-weight:500;letter-spacing:0.02em;font-family:'Inter',sans-serif;
}
.hp-proof-dot { width:5px;height:5px;border-radius:50%;background:var(--accent,#06b6d4);flex-shrink:0; }
html[data-ui="minimal"] .hp-proof-item { color:#546d4e; }
html[data-ui="minimal"] .hp-proof-dot { background:#31472b; }

/* ── Glass Card ── */
.hp-card {
  background:var(--glass,rgba(15,23,42,0.86));
  border:1px solid var(--glass-border,rgba(148,163,184,0.1));
  border-radius:22px;position:relative;overflow:hidden;
  backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);
  padding:1.75rem;
  box-shadow:0 8px 32px rgba(0,0,0,0.28);
  transition:border-color 0.3s,box-shadow 0.3s;
}
.hp-card::before {
  content:'';position:absolute;inset:0;pointer-events:none;border-radius:inherit;
  background:linear-gradient(145deg,rgba(255,255,255,0.038) 0%,transparent 55%);
}
.hp-card-topline {
  position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent 0%,var(--accent,#06b6d4) 50%,transparent 100%);
  opacity:0.55;
}
html[data-ui="minimal"] .hp-card {
  background:rgba(237,245,233,0.9);border-color:rgba(26,37,23,0.13);
  backdrop-filter:none;-webkit-backdrop-filter:none;
  box-shadow:0 8px 32px rgba(13,22,12,0.1);
}
html[data-ui="minimal"] .hp-card::before { background:linear-gradient(145deg,rgba(255,255,255,0.55),transparent 60%); }
html[data-ui="minimal"] .hp-card-topline { background:linear-gradient(90deg,transparent,#31472b,transparent);opacity:0.4; }

/* ── Section layout ── */
.hp-section { margin-top:2rem; }
.hp-grid-2 { display:grid;grid-template-columns:1fr 1fr;gap:1.5rem; }
.hp-grid-2-wide { display:grid;grid-template-columns:1.15fr 0.85fr;gap:1.5rem;align-items:start; }
@media(max-width:900px) { .hp-grid-2,.hp-grid-2-wide { grid-template-columns:1fr; } }

/* ── Eyebrow + Heading ── */
.hp-eyebrow {
  font-family:'Inter',sans-serif;font-size:0.62rem;font-weight:700;
  letter-spacing:0.2em;text-transform:uppercase;
  color:var(--accent,#06b6d4);margin-bottom:0.6rem;
}
html[data-ui="minimal"] .hp-eyebrow { color:#31472b; }

.hp-heading {
  font-family:'Syne',var(--font-display,sans-serif);font-weight:700;
  font-size:clamp(1.3rem,2.4vw,1.85rem);letter-spacing:-0.03em;
  color:var(--text-1,#fff);line-height:1.2;margin:0 0 0.5rem;
}
html[data-ui="minimal"] .hp-heading { color:#162012; }

.hp-body {
  font-size:0.88rem;line-height:1.72;color:var(--text-2,#94a3b8);font-family:'Inter',sans-serif;
}
html[data-ui="minimal"] .hp-body { color:#546d4e; }

/* ── About feature items ── */
.hp-features-grid { display:grid;grid-template-columns:1fr 1fr;gap:0.85rem;margin-top:1.25rem; }
@media(max-width:640px) { .hp-features-grid { grid-template-columns:1fr; } }

.hp-feature {
  display:flex;gap:13px;align-items:flex-start;padding:1rem 1rem;
  border-radius:14px;background:var(--surface-1,rgba(255,255,255,0.03));
  border:1px solid var(--glass-border,rgba(148,163,184,0.08));
  transition:all 0.24s;
}
.hp-feature:hover {
  background:var(--surface-2,rgba(255,255,255,0.065));
  border-color:rgba(148,163,184,0.18);transform:translateY(-2px);
}
html[data-ui="minimal"] .hp-feature { background:rgba(255,255,255,0.48);border-color:rgba(26,37,23,0.1); }
html[data-ui="minimal"] .hp-feature:hover { background:rgba(255,255,255,0.78);border-color:rgba(26,37,23,0.22); }

.hp-feature-num {
  width:33px;height:33px;border-radius:9px;display:grid;place-items:center;
  flex-shrink:0;font-family:'Orbitron',monospace;font-weight:700;font-size:0.65rem;
  color:var(--text-1,#fff);background:var(--surface-2,rgba(255,255,255,0.06));
  border:1px solid var(--glass-border);
}
html[data-ui="minimal"] .hp-feature-num { background:rgba(26,37,23,0.08);border-color:rgba(26,37,23,0.14);color:#1a2517; }

.hp-feature-label { font-family:'Syne',sans-serif;font-weight:700;font-size:0.86rem;color:var(--text-1,#fff);margin-bottom:3px; }
html[data-ui="minimal"] .hp-feature-label { color:#162012; }
.hp-feature-desc { font-size:0.78rem;line-height:1.6;color:var(--text-2,#94a3b8); }
html[data-ui="minimal"] .hp-feature-desc { color:#546d4e; }

/* ── Tags pills ── */
.hp-tags { display:flex;flex-wrap:wrap;gap:8px; }
.hp-tag {
  padding:5px 14px;border-radius:100px;font-size:0.7rem;font-weight:600;
  letter-spacing:0.05em;color:var(--text-2,#94a3b8);
  background:var(--surface-1,rgba(255,255,255,0.03));
  border:1px solid var(--glass-border,rgba(148,163,184,0.1));
  font-family:'Inter',sans-serif;transition:all 0.18s;
}
.hp-tag:hover { background:var(--surface-2);border-color:rgba(148,163,184,0.2);color:var(--text-1); }
html[data-ui="minimal"] .hp-tag { color:#344a2d;background:rgba(255,255,255,0.5);border-color:rgba(26,37,23,0.14); }

/* ── Steps ── */
.hp-step {
  display:flex;gap:16px;align-items:flex-start;padding:1.1rem;
  border-radius:14px;background:var(--surface-1,rgba(255,255,255,0.03));
  border:1px solid var(--glass-border,rgba(148,163,184,0.08));
}
.hp-step + .hp-step { margin-top:10px; }
html[data-ui="minimal"] .hp-step { background:rgba(255,255,255,0.44);border-color:rgba(26,37,23,0.1); }

.hp-step-badge {
  width:42px;height:42px;border-radius:13px;display:grid;place-items:center;
  flex-shrink:0;font-family:'Orbitron',monospace;font-weight:700;font-size:0.65rem;
  color:var(--accent,#06b6d4);background:rgba(6,182,212,0.08);
  border:1px solid rgba(6,182,212,0.2);
}
html[data-ui="minimal"] .hp-step-badge { color:#1a2517;background:rgba(26,37,23,0.07);border-color:rgba(26,37,23,0.18); }

.hp-step-title { font-family:'Syne',sans-serif;font-weight:700;font-size:0.88rem;color:var(--text-1,#fff);margin-bottom:4px; }
html[data-ui="minimal"] .hp-step-title { color:#162012; }
.hp-step-body { font-size:0.8rem;color:var(--text-2,#94a3b8);line-height:1.6; }
html[data-ui="minimal"] .hp-step-body { color:#546d4e; }

/* ── Divider ── */
.hp-divider { height:1px;background:var(--glass-border,rgba(148,163,184,0.08));margin:1.4rem 0; }

/* ── Inner tab strip ── */
.hp-tab-strip {
  display:flex;margin:-1.75rem -1.75rem 1.6rem;
  border-bottom:1px solid var(--glass-border,rgba(148,163,184,0.1));
  background:rgba(255,255,255,0.02);overflow:hidden;border-radius:22px 22px 0 0;
}
html[data-ui="minimal"] .hp-tab-strip { background:rgba(255,255,255,0.38);border-bottom-color:rgba(26,37,23,0.1); }

.hp-tab-btn {
  flex:1;padding:15px 8px;border:none;cursor:pointer;background:transparent;
  font-family:'Syne',sans-serif;font-weight:700;font-size:0.78rem;
  letter-spacing:0.08em;text-transform:uppercase;
  color:var(--text-3,#64748b);border-bottom:2px solid transparent;
  transition:all 0.2s;position:relative;top:1px;
}
.hp-tab-btn.active { color:var(--accent,#06b6d4);border-bottom-color:var(--accent,#06b6d4); }
html[data-ui="minimal"] .hp-tab-btn { color:#546d4e; }
html[data-ui="minimal"] .hp-tab-btn.active { color:#1a2517;border-bottom-color:#1a2517; }

/* ── Mode toggle (create panel) ── */
.hp-mode-bar {
  display:flex;gap:5px;padding:4px;border-radius:11px;
  background:var(--surface-1,rgba(255,255,255,0.03));
  border:1px solid var(--glass-border);margin-bottom:1.25rem;
}
html[data-ui="minimal"] .hp-mode-bar { background:rgba(26,37,23,0.04);border-color:rgba(26,37,23,0.12); }

.hp-mode-btn {
  flex:1;padding:9px 8px;border-radius:8px;border:none;cursor:pointer;
  font-family:'Inter',sans-serif;font-weight:700;font-size:0.73rem;
  letter-spacing:0.04em;transition:all 0.18s;color:var(--text-3,#64748b);background:transparent;
}
.hp-mode-btn.active {
  background:rgba(6,182,212,0.1);color:var(--accent,#06b6d4);
  border:1px solid rgba(6,182,212,0.26);box-shadow:0 2px 8px rgba(6,182,212,0.08);
}
html[data-ui="minimal"] .hp-mode-btn { color:#546d4e; }
html[data-ui="minimal"] .hp-mode-btn.active { background:rgba(26,37,23,0.08);color:#1a2517;border-color:rgba(26,37,23,0.2);box-shadow:none; }

/* ── Form label ── */
.hp-label {
  display:block;font-family:'Inter',sans-serif;font-size:0.6rem;font-weight:700;
  letter-spacing:0.16em;text-transform:uppercase;
  color:var(--text-3,#64748b);margin-bottom:8px;
}
html[data-ui="minimal"] .hp-label { color:#546d4e; }

/* ── Input ── */
.hp-input {
  width:100%;padding:11px 14px;border-radius:11px;
  background:var(--field-bg,rgba(255,255,255,0.04));
  border:1.5px solid var(--glass-border,rgba(148,163,184,0.12));
  color:var(--text-1,#fff);font-family:'Inter',sans-serif;font-size:0.9rem;
  outline:none;transition:border-color 0.2s,box-shadow 0.2s;box-sizing:border-box;
}
.hp-input:focus { border-color:var(--accent,#06b6d4);box-shadow:0 0 0 3px rgba(6,182,212,0.11); }
.hp-input::placeholder { color:var(--text-3,#64748b); }
html[data-ui="minimal"] .hp-input { background:rgba(255,255,255,0.68);border-color:rgba(26,37,23,0.18);color:#162012; }
html[data-ui="minimal"] .hp-input:focus { border-color:#1a2517;box-shadow:0 0 0 3px rgba(172,200,162,0.48); }
html[data-ui="minimal"] .hp-input::placeholder { color:#546d4e; }

/* ── PIN grid ── */
.hp-pin-row { display:flex;gap:7px;justify-content:space-between; }
.hp-pin-cell {
  flex:1;aspect-ratio:1;max-width:58px;text-align:center;border-radius:13px;
  background:var(--field-bg,rgba(255,255,255,0.04));
  border:1.5px solid var(--glass-border,rgba(148,163,184,0.12));
  color:var(--text-1,#fff);font-family:'Orbitron',monospace;font-weight:700;font-size:1.45rem;
  outline:none;transition:all 0.22s cubic-bezier(0.34,1.56,0.64,1);
}
.hp-pin-cell:focus,.hp-pin-cell.has-val {
  border-color:var(--accent,#06b6d4);
  box-shadow:0 0 0 3px rgba(6,182,212,0.1),0 0 18px rgba(6,182,212,0.14);
  transform:scale(1.07);
}
html[data-ui="minimal"] .hp-pin-cell { background:rgba(255,255,255,0.68);border-color:rgba(26,37,23,0.18);color:#162012; }
html[data-ui="minimal"] .hp-pin-cell:focus,html[data-ui="minimal"] .hp-pin-cell.has-val {
  border-color:#1a2517;box-shadow:0 0 0 3px rgba(172,200,162,0.42);
}

/* ── Avatar preview ── */
.hp-avatar-row {
  display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;
}
.hp-avatar-preview {
  display:flex;align-items:center;gap:12px;padding:10px 14px;
  border-radius:13px;background:var(--field-bg,rgba(255,255,255,0.04));
  border:1.5px solid var(--glass-border,rgba(148,163,184,0.12));
  transition:all 0.2s;
}
html[data-ui="minimal"] .hp-avatar-preview { background:rgba(255,255,255,0.65);border-color:rgba(26,37,23,0.16); }
.hp-avatar-nick { font-size:0.82rem;color:var(--text-2,#94a3b8);font-family:'Inter',sans-serif; }
html[data-ui="minimal"] .hp-avatar-nick { color:#546d4e; }

/* ── Error ── */
.hp-error {
  padding:11px 14px;border-radius:11px;
  background:var(--error-bg,rgba(244,63,94,0.1));
  border:1px solid var(--error-border,rgba(244,63,94,0.28));
  color:var(--error-text,#fca5a5);font-size:0.82rem;font-family:'Inter',sans-serif;
  animation:errShake 0.38s ease;
}
@keyframes errShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-7px);} 40%{transform:translateX(7px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
html[data-ui="minimal"] .hp-error { background:rgba(159,58,47,0.07);border-color:rgba(159,58,47,0.2);color:#9f3a2f; }

/* ── Skeleton ── */
.hp-skel {
  border-radius:12px;height:64px;
  background:linear-gradient(90deg,var(--surface-1) 0%,var(--surface-2) 50%,var(--surface-1) 100%);
  background-size:200% 100%;
  animation:skelMove 1.8s ease-in-out infinite;
}
@keyframes skelMove { 0%{background-position:200% 0;} 100%{background-position:-200% 0;} }

/* ── Quiz option row ── */
.hp-quiz-row {
  display:flex;flex-direction:column;gap:7px;max-height:224px;
  overflow-y:auto;padding-right:2px;
}
.hp-quiz-row::-webkit-scrollbar { width:4px; }
.hp-quiz-row::-webkit-scrollbar-thumb { background:var(--glass-border);border-radius:4px; }

.hp-quiz-item {
  text-align:left;width:100%;padding:11px 14px;border-radius:12px;cursor:pointer;
  background:var(--surface-1,rgba(255,255,255,0.03));
  border:1.5px solid var(--glass-border,rgba(148,163,184,0.1));
  transition:all 0.16s;
}
.hp-quiz-item.sel,
.hp-quiz-item:hover { background:rgba(6,182,212,0.06);border-color:rgba(6,182,212,0.3); }
.hp-quiz-item.sel { box-shadow:0 0 22px rgba(6,182,212,0.08); }
html[data-ui="minimal"] .hp-quiz-item { background:rgba(255,255,255,0.42);border-color:rgba(26,37,23,0.11);color:#344a2d; }
html[data-ui="minimal"] .hp-quiz-item.sel,html[data-ui="minimal"] .hp-quiz-item:hover { background:rgba(26,37,23,0.06);border-color:rgba(26,37,23,0.28); }

.hp-quiz-name { font-family:'Syne',sans-serif;font-weight:700;font-size:0.85rem;color:var(--text-1,#fff); }
html[data-ui="minimal"] .hp-quiz-name { color:#162012; }
.hp-quiz-item.sel .hp-quiz-name { color:var(--accent,#06b6d4); }
html[data-ui="minimal"] .hp-quiz-item.sel .hp-quiz-name { color:#1a2517; }

.hp-quiz-meta { display:flex;gap:9px;align-items:center;margin-top:4px;flex-wrap:wrap; }
.hp-chip {
  padding:2px 9px;border-radius:100px;font-size:0.6rem;font-weight:700;
  letter-spacing:0.06em;text-transform:uppercase;
  background:var(--surface-2);border:1px solid var(--glass-border);
  color:var(--text-3);font-family:'Inter',sans-serif;
}
html[data-ui="minimal"] .hp-chip { background:rgba(26,37,23,0.07);border-color:rgba(26,37,23,0.14);color:#546d4e; }
.hp-quiz-cnt,.hp-quiz-diff { font-size:0.68rem;color:var(--text-3,#64748b);font-family:'Inter',sans-serif; }
.diff-easy { color:var(--success,#10b981) !important; }
.diff-medium { color:var(--warning,#f59e0b) !important; }
.diff-hard { color:var(--danger,#f43f5e) !important; }

/* ── Custom question card ── */
.hp-q-card {
  border-radius:14px;padding:14px;
  background:var(--surface-1,rgba(255,255,255,0.03));
  border:1.5px solid var(--glass-border,rgba(148,163,184,0.1));
}
html[data-ui="minimal"] .hp-q-card { background:rgba(255,255,255,0.42);border-color:rgba(26,37,23,0.11); }

.hp-textarea {
  width:100%;background:var(--field-bg,rgba(255,255,255,0.04));
  border:1.5px solid var(--glass-border,rgba(148,163,184,0.12));
  border-radius:10px;padding:10px 12px;color:var(--text-1,#fff);
  font-family:'Inter',sans-serif;font-size:0.87rem;resize:vertical;
  outline:none;transition:border-color 0.2s;box-sizing:border-box;
}
.hp-textarea:focus { border-color:var(--accent-2,#8b5cf6); }
.hp-textarea::placeholder { color:var(--text-3); }
html[data-ui="minimal"] .hp-textarea { background:rgba(255,255,255,0.6);border-color:rgba(26,37,23,0.18);color:#162012; }
html[data-ui="minimal"] .hp-textarea:focus { border-color:#1a2517; }
html[data-ui="minimal"] .hp-textarea::placeholder { color:#546d4e; }

.hp-add-q {
  width:100%;padding:10px;border-radius:11px;cursor:pointer;background:transparent;
  border:1.5px dashed rgba(6,182,212,0.22);color:var(--accent,#06b6d4);
  font-family:'Inter',sans-serif;font-weight:700;font-size:0.8rem;transition:all 0.18s;
}
.hp-add-q:hover { border-color:rgba(6,182,212,0.46);background:rgba(6,182,212,0.04); }
html[data-ui="minimal"] .hp-add-q { border-color:rgba(26,37,23,0.24);color:#1a2517; }
html[data-ui="minimal"] .hp-add-q:hover { border-color:rgba(26,37,23,0.4);background:rgba(26,37,23,0.04); }

.hp-q-hdr { display:flex;align-items:center;justify-content:space-between;margin-bottom:10px; }
.hp-q-num {
  font-family:'Orbitron',monospace;font-size:0.6rem;font-weight:700;
  color:var(--accent-2,#8b5cf6);letter-spacing:0.12em;text-transform:uppercase;
}
html[data-ui="minimal"] .hp-q-num { color:#1a2517; }
.hp-q-controls { display:flex;gap:7px;align-items:center; }

.hp-select {
  background:transparent;border:1px solid var(--glass-border);
  color:var(--text-2);border-radius:8px;padding:4px 8px;
  font-size:0.68rem;font-family:'Inter',sans-serif;cursor:pointer;outline:none;
}
html[data-ui="minimal"] .hp-select { color:#546d4e;border-color:rgba(26,37,23,0.18); }

.hp-rm-btn {
  background:transparent;border:1px solid rgba(244,63,94,0.2);
  color:var(--danger,#f43f5e);border-radius:7px;padding:4px 9px;
  font-size:0.7rem;cursor:pointer;font-family:'Inter',sans-serif;transition:all 0.16s;
}
.hp-rm-btn:hover { background:rgba(244,63,94,0.08);border-color:rgba(244,63,94,0.38); }

.hp-opts-grid { display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px; }
.hp-opt-wrap { position:relative; }
.hp-opt-lbl {
  position:absolute;left:10px;top:50%;transform:translateY(-50%);
  width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;
  font-size:0.62rem;font-family:'Orbitron',monospace;font-weight:700;pointer-events:none;z-index:1;
}
.hp-opt-input {
  width:100%;padding:8px 10px 8px 38px;border-radius:10px;
  background:transparent;color:var(--text-1,#fff);
  font-family:'Inter',sans-serif;font-size:0.79rem;outline:none;transition:border-color 0.2s;
  box-sizing:border-box;border:1.5px solid var(--glass-border);
}
.hp-opt-input::placeholder { color:var(--text-3); }
html[data-ui="minimal"] .hp-opt-input { color:#162012; }
html[data-ui="minimal"] .hp-opt-input::placeholder { color:#546d4e; }

.hp-correct-row { display:flex;gap:6px; }
.hp-correct-lbl { font-family:'Inter',sans-serif;font-size:0.58rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-3);margin-bottom:6px; }
.hp-correct-btn {
  flex:1;padding:7px 4px;border-radius:8px;cursor:pointer;font-family:'Orbitron',monospace;
  font-weight:700;font-size:0.74rem;transition:all 0.15s;border:1.5px solid var(--glass-border);
  background:var(--surface-1);color:var(--text-3);
}

/* ── Scroll stagger ── */
.hp-rise {
  opacity:0;transform:translateY(18px);
  animation:hpRise 0.5s ease forwards;
}
.hp-rise:nth-child(1){animation-delay:0.04s;}
.hp-rise:nth-child(2){animation-delay:0.09s;}
.hp-rise:nth-child(3){animation-delay:0.14s;}
.hp-rise:nth-child(4){animation-delay:0.19s;}
@keyframes hpRise { to{opacity:1;transform:translateY(0);} }

.hp-slide-up { animation:hpRise 0.3s ease both; }

/* ── Spin ── */
@keyframes hpSpin { to{transform:rotate(360deg);} }
.hp-spin { display:inline-block;animation:hpSpin 0.75s linear infinite; }

/* ── Responsive ── */
@media(max-width:680px) {
  .hp-main { padding:0 1rem 3rem; }
  .hp-hero { padding:3.5rem 0 2.5rem; }
  .hp-h1 { font-size:clamp(2.2rem,8.5vw,3rem); }
  .hp-proof { gap:1.1rem; }
  .hp-card { padding:1.3rem; }
  .hp-tab-strip { margin:-1.3rem -1.3rem 1.3rem; padding:0 1.3rem; }
}
`;

/* ───────────────────────────────────────────── */

export default function HomePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [tab, setTab]       = useState("join");
  const [pin, setPin]       = useState(params.get("pin") || "");
  const [nick, setNick]     = useState("");
  const [avatar, setAvatar] = useState(
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='100' fill='%232a3040'/%3E%3Ccircle cx='100' cy='70' r='40' fill='%23a0aec0'/%3E%3Cpath d='M40 180A60 50 0 0 1 160 180Z' fill='%23a0aec0'/%3E%3C/svg%3E"
  );
  const [showAvatars, setShowAvatars] = useState(false);
  const [err, setErr]   = useState("");
  const [loading, setLoading] = useState(false);
  const pinRefs = useRef([]);

  // Inject CSS once
  useEffect(() => {
    const id = "hp-premium-css";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = PREMIUM_CSS;
      document.head.appendChild(s);
    }
  }, []);

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleJoin(e) {
    e.preventDefault();
    setErr("");
    if (pin.length !== 6) { setErr("Enter a valid 6-digit PIN"); return; }
    if (nick.trim().length < 2) { setErr("Nickname needs at least 2 characters"); return; }
    setLoading(true);
    try {
      await axios.get(`${API}/api/games/${pin}`);
      navigate(`/play/${pin}?nickname=${encodeURIComponent(nick.trim())}&avatar=${encodeURIComponent(avatar)}`);
    } catch {
      setErr("Game not found — double-check the PIN!");
      if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    } finally { setLoading(false); }
  }

  const NAV_LINKS = [
    { id: "about",    label: "About"       },
    { id: "features", label: "Features"    },
    { id: "works",    label: "How It Works"},
    { id: "launch",   label: "Get Started" },
  ];

  const PROOF_ITEMS = [
    "Invite-only access",
    "Live dashboard analytics",
    "Mobile + desktop",
    "Share link in seconds",
  ];

  const ABOUT_ITEMS = [
    { num: "01", title: "Create in minutes",   desc: "Simple question and option inputs — no setup overhead." },
    { num: "02", title: "Share instantly",      desc: "Generate a quiz link, send the PIN, bring players in fast." },
    { num: "03", title: "Track live results",   desc: "Submissions, answer splits, and rankings update in real time." },
    { num: "04", title: "Reduce cheating",      desc: "Built-in monitoring keeps the experience honest and focused." },
  ];

  const STEPS = [
    ["01", "Create or pick a quiz",   "Start from a template or build your own question set."],
    ["02", "Share the access PIN",    "Send the room code and let players join from any device."],
    ["03", "Run the game live",       "Watch the leaderboard, answer stats, and results update in real time."],
  ];

  const FEATURE_TAGS = ["Modern UI", "Invite-only access", "Live dashboards", "Mobile-first flows"];
  const SETUP_TAGS   = ["Simple question builder", "Live response tracking", "Leaderboards in real time", "Cheat-aware game flow"];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      <NetworkStatus />

      {/* Ambient background */}
      <div className="hp-orbs" aria-hidden="true">
        <div className="hp-orb hp-orb-1" />
        <div className="hp-orb hp-orb-2" />
        <div className="hp-orb hp-orb-3" />
      </div>
      <div className="hp-grid" aria-hidden="true" />

      {/* ── Navigation ── */}
      <header className="hp-nav" role="banner">
        <a href="#top" className="hp-brand" aria-label="QuizFlow home">
          <div className="hp-brand-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div>
            <div className="hp-brand-name">QuizFlow</div>
            <div className="hp-brand-tagline">Secure Quiz Platform</div>
          </div>
        </a>

        <nav className="hp-nav-links" aria-label="Primary navigation">
          {NAV_LINKS.map(item => (
            <button key={item.id} type="button" className="hp-nav-link"
              onClick={() => scrollTo(item.id)}>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hp-nav-actions">
          <button type="button"
            className="hp-btn hp-btn-primary hp-btn-sm"
            onClick={() => { setTab("create"); scrollTo("launch"); }}>
            Create Quiz
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="hp-main" style={{ flex: 1 }}>

        {/* ── Hero ── */}
        <section id="top" className="hp-hero">
          <div className="hp-hero-badge" role="note">
            <span className="hp-badge-pip" aria-hidden="true" />
            Modern Secure Quiz Experience
          </div>

          <h1 className="hp-h1">
            Smart &amp; Secure<br />
            <span className="hp-accent-text">Quiz Platform</span>
          </h1>

          <p className="hp-hero-sub">
            Host or join real-time quizzes with a clean, invite-only flow.
            The experience stays fast, honest, and readable on every screen.
          </p>

          <div className="hp-hero-ctas">
            <button type="button"
              className="hp-btn hp-btn-primary hp-btn-lg"
              onClick={() => { setTab("create"); scrollTo("launch"); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Create a Quiz
            </button>
            <button type="button"
              className="hp-btn hp-btn-secondary hp-btn-lg"
              onClick={() => scrollTo("works")}>
              How It Works
            </button>
          </div>

          <div className="hp-proof" aria-label="Highlights">
            {PROOF_ITEMS.map(item => (
              <span key={item} className="hp-proof-item">
                <span className="hp-proof-dot" aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
        </section>

        {/* ── About ── */}
        <section id="about" className="hp-section">
          <div className="hp-card">
            <div className="hp-card-topline" aria-hidden="true" />
            <div style={{ maxWidth: 700 }}>
              <div className="hp-eyebrow">About SecureQuiz</div>
              <h2 className="hp-heading" style={{ fontSize: "clamp(1.5rem,2.8vw,2.1rem)" }}>
                Built for anyone who wants to run or take quizzes quickly and securely.
              </h2>
            </div>
            <div className="hp-features-grid" style={{ marginTop: "1.35rem" }}>
              {ABOUT_ITEMS.map(item => (
                <div key={item.num} className="hp-feature hp-rise">
                  <div className="hp-feature-num">{item.num}</div>
                  <div>
                    <div className="hp-feature-label">{item.title}</div>
                    <div className="hp-feature-desc">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Feature tags ── */}
        <section id="features" className="hp-section">
          <div className="hp-tags">
            {FEATURE_TAGS.map(t => <span key={t} className="hp-tag">{t}</span>)}
          </div>
        </section>

        {/* ── How it works + Launch card ── */}
        <section id="works" className="hp-section">
          <div className="hp-grid-2-wide">

            {/* Steps */}
            <div className="hp-card">
              <div className="hp-card-topline" aria-hidden="true" />
              <div className="hp-eyebrow">How It Works</div>
              <h2 className="hp-heading">A simple flow from setup to live play.</h2>
              <div className="hp-body" style={{ marginBottom: "1.35rem" }}>
                Three steps is all it takes to go from zero to a live, scored quiz.
              </div>
              {STEPS.map(step => (
                <div key={step[0]} className="hp-step">
                  <div className="hp-step-badge">{step[0]}</div>
                  <div>
                    <div className="hp-step-title">{step[1]}</div>
                    <div className="hp-step-body">{step[2]}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Launch / Join card ── */}
            <div id="launch" className="hp-card">
              <div className="hp-card-topline" aria-hidden="true" />
              <div className="hp-eyebrow">Get Started</div>
              <h2 className="hp-heading">Launch or join a session.</h2>
              <p className="hp-body" style={{ marginBottom: "1.4rem" }}>
                Use the participant login to join with a PIN, or host a new game from the dashboard.
              </p>

              {/* ── Inner tabs ── */}
              <div className="hp-tab-strip">
                {[
                  { id: "join",   label: "Participant Login" },
                  { id: "create", label: "Host Dashboard"    },
                ].map(t => (
                  <button key={t.id} type="button"
                    className={`hp-tab-btn ${tab === t.id ? "active" : ""}`}
                    onClick={() => { setTab(t.id); setErr(""); }}>
                    {t.label}
                  </button>
                ))}
              </div>

              {tab === "join" ? (
                <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                  {/* PIN */}
                  <div>
                    <label className="hp-label">Game PIN</label>
                    <div className="hp-pin-row">
                      {[0,1,2,3,4,5].map(i => (
                        <input
                          key={i}
                          ref={el => pinRefs.current[i] = el}
                          value={pin[i] || ""}
                          className={`hp-pin-cell ${pin[i] ? "has-val" : ""}`}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, "").slice(-1);
                            if (!val && e.target.value !== "") return;
                            const chars = (pin || "").split("");
                            chars[i] = val;
                            setPin(chars.join(""));
                            if (val && i < 5) pinRefs.current[i + 1]?.focus();
                          }}
                          onKeyDown={e => {
                            if (e.key === "Backspace" && !pin[i] && i > 0)
                              pinRefs.current[i - 1]?.focus();
                          }}
                          onFocus={e => e.target.select()}
                          inputMode="numeric"
                          maxLength={1}
                          aria-label={`PIN digit ${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Nickname */}
                  <div>
                    <label className="hp-label" htmlFor="hp-nick">Nickname</label>
                    <input
                      id="hp-nick"
                      value={nick}
                      onChange={e => setNick(e.target.value.slice(0, 20))}
                      placeholder="e.g. QuizMaster99"
                      maxLength={20}
                      className="hp-input"
                    />
                  </div>

                  {/* Avatar */}
                  <div>
                    <div className="hp-avatar-row">
                      <label className="hp-label" style={{ margin: 0 }}>Your Avatar</label>
                      <button type="button" onClick={() => setShowAvatars(v => !v)} style={{
                        background: "none", border: "none", cursor: "pointer",
                        fontFamily: "'Inter',sans-serif", fontSize: "0.62rem",
                        fontWeight: 700, color: "var(--accent,#06b6d4)",
                        letterSpacing: "0.08em", textTransform: "uppercase",
                      }}>
                        {showAvatars ? "Hide ▲" : "Change ▼"}
                      </button>
                    </div>
                    <div className="hp-avatar-preview">
                      <img src={avatar} alt="Selected avatar"
                        style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 11,
                          border: "1px solid var(--glass-border)", background: "transparent" }} />
                      <span className="hp-avatar-nick">
                        {nick || "Your nickname"} · ready to play!
                      </span>
                    </div>
                    {showAvatars && (
                      <div className="hp-slide-up" style={{ marginTop: 10 }}>
                        <AvatarPicker selected={avatar}
                          onSelect={v => { setAvatar(v); setShowAvatars(false); }} />
                      </div>
                    )}
                  </div>

                  {err && <div className="hp-error" role="alert">⚠️ {err}</div>}

                  <button type="submit"
                    disabled={loading || pin.length !== 6 || nick.length < 2}
                    className="hp-btn hp-btn-primary hp-btn-full">
                    {loading ? (
                      <><span className="hp-spin">⏳</span> Joining…</>
                    ) : "Join Game →"}
                  </button>
                </form>
              ) : (
                <CreatePanel navigate={navigate} />
              )}
            </div>
          </div>
        </section>

        {/* ── Setup tags ── */}
        <section id="setup" className="hp-section">
          <div className="hp-tags">
            {SETUP_TAGS.map(t => <span key={t} className="hp-tag">{t}</span>)}
          </div>
        </section>

      </main>
    </div>
  );
}

/* ── Create Game Panel ─────────────────────────────────── */
function CreatePanel({ navigate }) {
  const [mode, setMode]     = useState("premade");
  const [quizzes, setQ]     = useState([]);
  const [selId, setSelId]   = useState("");
  const [loading, setL]     = useState(false);
  const [fetching, setF]    = useState(true);
  const [err, setErr]       = useState("");

  const [quizTitle, setQT]  = useState("");
  const [questions, setQs]  = useState([BLANK_QUESTION()]);

  useEffect(() => {
    axios.get(`${API}/api/quizzes`)
      .then(r => {
        setQ(r.data.quizzes);
        if (r.data.quizzes[0]) setSelId(r.data.quizzes[0].id);
      })
      .catch(() => setErr("Could not load pre-made quizzes"))
      .finally(() => setF(false));
  }, []);

  async function createFromPremade() {
    if (!selId) return;
    setL(true); setErr("");
    try {
      const hostId = `host_${Date.now()}`;
      const { data } = await axios.post(`${API}/api/games/create`, { quizId: selId, hostId });
      navigate(`/host/${data.pin}?hostId=${hostId}`);
    } catch { setErr("Failed — is the server running?"); }
    finally  { setL(false); }
  }

  async function createFromCustom() {
    if (!quizTitle.trim()) { setErr("Quiz needs a title"); return; }
    const bad = questions.findIndex(q =>
      !q.text.trim() || q.options.some(o => !o.trim())
    );
    if (bad !== -1) { setErr(`Question ${bad + 1}: fill in all fields`); return; }

    setL(true); setErr("");
    try {
      const hostId = `host_${Date.now()}`;
      const { data: qData } = await axios.post(`${API}/api/quizzes`, {
        title: quizTitle.trim(),
        description: "Custom quiz",
        category: "Custom",
        difficulty: "Medium",
        questions: questions.map(q => ({
          text: q.text.trim(),
          options: q.options.map(o => o.trim()),
          correct: q.correct,
          time: q.time,
        })),
      });
      const { data: gData } = await axios.post(`${API}/api/games/create`, {
        quizId: qData.quiz.id, hostId,
      });
      navigate(`/host/${gData.pin}?hostId=${hostId}`);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to create quiz");
    } finally { setL(false); }
  }

  function updateQ(idx, field, value) {
    setQs(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  }
  function updateOpt(qIdx, oIdx, value) {
    setQs(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const opts = [...q.options];
      opts[oIdx] = value;
      return { ...q, options: opts };
    }));
  }
  function addQ() { if (questions.length < 20) setQs(p => [...p, BLANK_QUESTION()]); }
  function rmQ(idx) { if (questions.length > 1) setQs(p => p.filter((_, i) => i !== idx)); }

  const OPT_COLORS  = ["#e85d6e","#4a90d9","#f5a623","#7ed321"];
  const OPT_LABELS  = ["A","B","C","D"];

  const diffColor = { Easy: "var(--success,#10b981)", Medium: "var(--warning,#f59e0b)", Hard: "var(--danger,#f43f5e)" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Mode toggle */}
      <div className="hp-mode-bar">
        {[
          { id: "premade", label: "📚  Pre-built" },
          { id: "custom",  label: "✏️  Build Custom" },
        ].map(m => (
          <button key={m.id} type="button"
            className={`hp-mode-btn ${mode === m.id ? "active" : ""}`}
            onClick={() => { setMode(m.id); setErr(""); }}>
            {m.label}
          </button>
        ))}
      </div>

      {/* ── Premade mode ── */}
      {mode === "premade" && (
        <>
          <div>
            <label className="hp-label">Choose Quiz</label>
            {fetching ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[1,2,3].map(i => <div key={i} className="hp-skel" />)}
              </div>
            ) : (
              <div className="hp-quiz-row">
                {quizzes.map(q => (
                  <button key={q.id} type="button"
                    className={`hp-quiz-item ${selId === q.id ? "sel" : ""}`}
                    onClick={() => setSelId(q.id)}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span className="hp-quiz-name">{q.title}</span>
                      {selId === q.id && (
                        <span style={{ color: "var(--accent,#06b6d4)", fontSize: "0.85rem" }}>✓</span>
                      )}
                    </div>
                    <div className="hp-quiz-meta">
                      <span className="hp-chip">{q.category}</span>
                      <span className="hp-quiz-cnt">{q.questionCount} questions</span>
                      <span className="hp-quiz-diff" style={{ color: diffColor[q.difficulty], fontWeight: 600 }}>
                        {q.difficulty}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {err && <div className="hp-error" role="alert">⚠️ {err}</div>}

          <button type="button" onClick={createFromPremade} disabled={loading || !selId}
            className="hp-btn hp-btn-primary hp-btn-full">
            {loading ? "Creating…" : "Create Game →"}
          </button>
        </>
      )}

      {/* ── Custom mode ── */}
      {mode === "custom" && (
        <>
          <div>
            <label className="hp-label" htmlFor="hp-quiz-title">Quiz Title</label>
            <input id="hp-quiz-title"
              value={quizTitle}
              onChange={e => setQT(e.target.value.slice(0, 60))}
              placeholder="e.g. Science Bowl Round 1"
              className="hp-input" maxLength={60} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: "52vh", overflowY: "auto", paddingRight: 2 }}>
            {questions.map((q, qi) => (
              <div key={qi} className="hp-q-card">

                {/* Q header */}
                <div className="hp-q-hdr">
                  <span className="hp-q-num">Q{qi + 1}</span>
                  <div className="hp-q-controls">
                    <select value={q.time} onChange={e => updateQ(qi, "time", Number(e.target.value))}
                      className="hp-select">
                      {[10,15,20,30,45,60].map(t => (
                        <option key={t} value={t}>⏱ {t}s</option>
                      ))}
                    </select>
                    {questions.length > 1 && (
                      <button type="button" className="hp-rm-btn" onClick={() => rmQ(qi)}>✕</button>
                    )}
                  </div>
                </div>

                {/* Question text */}
                <textarea
                  value={q.text}
                  onChange={e => updateQ(qi, "text", e.target.value)}
                  placeholder="Type your question here…"
                  rows={2} maxLength={240}
                  className="hp-textarea"
                  style={{ width: "100%", marginBottom: 10 }}
                />

                {/* Options grid */}
                <div className="hp-opts-grid">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="hp-opt-wrap">
                      <div className="hp-opt-lbl" style={{
                        background: OPT_COLORS[oi] + "28",
                        border: `1px solid ${OPT_COLORS[oi]}55`,
                        color: OPT_COLORS[oi],
                      }}>
                        {OPT_LABELS[oi]}
                      </div>
                      <input
                        value={opt}
                        onChange={e => updateOpt(qi, oi, e.target.value)}
                        placeholder={`Option ${OPT_LABELS[oi]}`}
                        maxLength={100}
                        className="hp-opt-input"
                        style={{
                          border: `1.5px solid ${q.correct === oi ? OPT_COLORS[oi] + "70" : "var(--glass-border,rgba(148,163,184,0.12))"}`,
                        }}
                        onFocus={e => e.target.style.borderColor = OPT_COLORS[oi]}
                        onBlur={e => {
                          e.target.style.borderColor = q.correct === oi
                            ? OPT_COLORS[oi] + "70"
                            : "var(--glass-border,rgba(148,163,184,0.12))";
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Correct answer */}
                <div className="hp-correct-lbl">✓ Correct Answer</div>
                <div className="hp-correct-row">
                  {OPT_LABELS.map((lbl, oi) => (
                    <button key={oi} type="button"
                      className="hp-correct-btn"
                      onClick={() => updateQ(qi, "correct", oi)}
                      style={{
                        background: q.correct === oi ? OPT_COLORS[oi] + "1e" : "var(--surface-1,rgba(255,255,255,0.03))",
                        borderColor: q.correct === oi ? OPT_COLORS[oi] : "var(--glass-border,rgba(148,163,184,0.12))",
                        color: q.correct === oi ? OPT_COLORS[oi] : "var(--text-3,#64748b)",
                      }}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {questions.length < 20 && (
            <button type="button" className="hp-add-q" onClick={addQ}>
              + Add Question ({questions.length}/20)
            </button>
          )}

          {err && <div className="hp-error" role="alert">⚠️ {err}</div>}

          <button type="button" onClick={createFromCustom} disabled={loading}
            className="hp-btn hp-btn-primary hp-btn-full">
            {loading ? "Creating…" : `🚀 Launch Quiz (${questions.length} Q)`}
          </button>
        </>
      )}
    </div>
  );
}
