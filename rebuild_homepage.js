const fs = require('fs');
const path = require('path');

const file = path.join('c:/Users/gowda/Downloads/Anti Neo Project/Quizflow/client/src/pages/HomePage.jsx');

const content = fs.readFileSync(file, 'utf8');

// The CreatePanel function starts at: /* ── Create Game Panel
const splitBoundary = "/* ── Create Game Panel ─────────────────────────────────── */";
const splitIdx = content.indexOf(splitBoundary);
const createPanelContent = content.substring(splitIdx);


const newHomePageComponent = `import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import AvatarPicker from "../components/AvatarPicker";
import NetworkStatus from "../components/NetworkStatus";
import ThemeToggle from "../components/ThemeToggle";

const API = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

const BLANK_QUESTION = () => ({
  text: "", options: ["", "", "", ""], correct: 0, time: 20,
});

export default function HomePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [tab, setTab] = useState("join");
  const [pin, setPin] = useState(params.get("pin") || "");
  const [nick, setNick] = useState("");
  const [avatar, setAvatar] = useState("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='100' fill='%232a3040'/%3E%3Ccircle cx='100' cy='70' r='40' fill='%23a0aec0'/%3E%3Cpath d='M40 180A60 50 0 0 1 160 180Z' fill='%23a0aec0'/%3E%3C/svg%3E");
  const [showAvatars, setShowAvatars] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const pinRefs = useRef([]);

  async function handleJoin(e) {
    e.preventDefault(); setErr("");
    if (pin.length !== 6) { setErr("Enter a valid 6-digit PIN"); return; }
    if (nick.trim().length < 2) { setErr("Nickname needs 2+ characters"); return; }
    setLoading(true);
    try {
      await axios.get(\`\${API}/api/games/\${pin}\`);
      navigate(\`/play/\${pin}?nickname=\${encodeURIComponent(nick.trim())}&avatar=\${encodeURIComponent(avatar)}\`);
    } catch {
      setErr("Game not found — double-check the PIN!");
    } finally { setLoading(false); }
  }

  return (
    <div id="app" className="relative after:absolute after:inset-0 after:bg-[url('/noise.png')] after:opacity-[0.02] after:pointer-events-none min-h-screen flex flex-col font-inter tracking-tight">
      <NetworkStatus />
      
      <section id="screen-registration" className="screen active w-full mx-auto px-4 z-10 flex flex-col items-center py-16 flex-1">
        
        {/* HERO SECTION */}
        <div className="hero text-center mb-10 w-full max-w-xl mx-auto">
          <div className="hero-eyebrow text-slate-400 font-medium tracking-wide uppercase text-sm mb-4">Interactive Quiz Platform</div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-white mb-4" style={{ fontFamily: "var(--font-inter)" }}>QuizFlow</h1>
        </div>

        {/* REGISTRATION CARD (Mirrors reg-card exactly) */}
        <div className="card glass-card-sq p-8 w-full max-w-md mx-auto transition-all duration-300 ease-out animate-[fadeIn_0.5s_ease-out_forwards]" id="reg-card">
          <div className="flex border-b border-white/10 mb-8 bg-black/20 rounded-xl overflow-hidden p-1 shadow-inner">
            <button onClick={() => { setTab("join"); setErr(""); }} className={\`flex-1 py-3 text-sm font-semibold rounded-lg transition-all \${tab === "join" ? "bg-indigo-500 shadow-lg text-white" : "text-slate-400 hover:bg-white/5"}\`}>Participant Login</button>
            <button onClick={() => { setTab("create"); setErr(""); }} className={\`flex-1 py-3 text-sm font-semibold rounded-lg transition-all \${tab === "create" ? "bg-indigo-500 shadow-lg text-white" : "text-slate-400 hover:bg-white/5"}\`}>Host Dashboard</button>
          </div>

          {tab === "join" ? (
            <form onSubmit={handleJoin} className="flex flex-col gap-6">
              <div>
                <h2 className="card-title text-3xl font-semibold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Join Session</h2>
                <p className="card-subtitle text-slate-400 text-sm leading-relaxed mt-2">Enter your details to begin the quiz.</p>
              </div>

              <div className="form-group">
                <label className="block text-sm text-slate-300 mb-2 font-medium">Game PIN <span className="text-red-400">*</span></label>
                <div className="flex gap-2 justify-between">
                  {[0,1,2,3,4,5].map(i => (
                    <input key={i} ref={el => pinRefs.current[i] = el}
                      value={pin[i] || ""}
                      onChange={e => {
                        const val = e.target.value.replace(/\\D/g, "").slice(-1);
                        if (!val && e.target.value !== "") return;
                        const newPin = (pin || "").split("");
                        newPin[i] = val;
                        setPin(newPin.join(""));
                        if (val && i < 5) pinRefs.current[i + 1].focus();
                      }}
                      onKeyDown={e => {
                        if (e.key === "Backspace" && !pin[i] && i > 0) pinRefs.current[i - 1].focus();
                      }}
                      className="input-sq text-center font-bold text-xl h-12 px-0"
                      style={{ aspectRatio: "1/1" }}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="block text-sm text-slate-300 mb-2 font-medium">Nickname <span className="text-red-400">*</span></label>
                <input type="text" value={nick} onChange={e => setNick(e.target.value.slice(0, 20))} placeholder="e.g. John Doe" className="input-sq" />
              </div>

              <div className="notice-box bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex gap-3 text-sm text-indigo-200">
                <span className="notice-icon text-xl">📌</span>
                <span>Select an avatar below before joining. Play on full-screen to guarantee speed.</span>
              </div>

              {/* Avatar block inline */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm text-slate-300 font-medium">Your Avatar</label>
                  <button type="button" onClick={() => setShowAvatars(!showAvatars)} className="text-xs text-indigo-400 font-semibold tracking-wide uppercase">{showAvatars ? "Hide ▲" : "Change ▼"}</button>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10 shadow-inner">
                  <img src={avatar} alt="Avatar" className="w-12 h-12 object-contain rounded-lg border border-white/10 bg-black/30 p-1" />
                  <span className="text-slate-300 text-sm font-medium">{nick || "Your nickname"}</span>
                </div>
                {showAvatars && <div className="mt-4"><AvatarPicker selected={avatar} onSelect={e => { setAvatar(e); setShowAvatars(false); }} /></div>}
              </div>

              {err && <div className="error-msg text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-lg">⚠️ {err}</div>}

              <button id="btn-start-quiz" type="submit" disabled={loading || pin.length !== 6 || nick.length < 2} className="btn-primary-sq w-full py-3.5 text-lg font-semibold tracking-wide">
                <span id="btn-start-text">{loading ? "Joining Session..." : "Join Quiz →"}</span>
              </button>
            </form>
          ) : (
            <CreatePanel navigate={navigate} />
          )}
        </div>

        {/* HOW IT WORKS SECTION (SecureQuizWeb struct) */}
        {!tab.includes("create") && (
          <div className="w-full mt-24 text-center pb-20 px-4">
            <div className="section-header mb-12">
              <div className="section-eyebrow text-slate-400 font-medium tracking-widest uppercase text-sm mb-3">How It Works</div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Live Quiz Mechanics</h2>
              <p className="text-slate-400 max-w-xl mx-auto text-base">Powered by advanced WebSockets to ensure extreme sync integrity and fast question rounds.</p>
            </div>
            
            <div className="features-grid grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
              <div className="feature-card glass-card-sq p-8 group hover:-translate-y-1 transition-transform">
                <div className="feature-icon text-3xl mb-5 inline-block p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">🛡️</div>
                <h3 className="text-xl font-bold text-white mb-3">Host Lock</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Teachers create quick sessions, share a 6-digit PIN, and control the pace of the questions live.</p>
              </div>
              <div className="feature-card glass-card-sq p-8 group hover:-translate-y-1 transition-transform">
                <div className="feature-icon text-3xl mb-5 inline-block p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">⚡</div>
                <h3 className="text-xl font-bold text-white mb-3">Live Race</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Students select answers rapidly. Points are calculated instantly based on visual interaction speed.</p>
              </div>
              <div className="feature-card glass-card-sq p-8 group hover:-translate-y-1 transition-transform">
                <div className="feature-icon text-3xl mb-5 inline-block p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">🏆</div>
                <h3 className="text-xl font-bold text-white mb-3">Leaderboards</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Dynamic podiums update completely in sync after every single question.</p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

`;

fs.writeFileSync(file, newHomePageComponent + "\\n" + createPanelContent);
