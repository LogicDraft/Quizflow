import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NetworkStatus from "../components/NetworkStatus";
import ThemeToggle from "../components/ThemeToggle";

const API = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

const BLANK_QUESTION = () => ({
  text: "",
  options: ["", "", "", ""],
  correct: 0,
  time: 20,
});

export default function HostingPage() {
  const navigate = useNavigate();
  return (
    <div className="mesh-bg" style={{ minHeight: "100vh" }}>
      <NetworkStatus />
      <header className="site-header">
        <div className="site-header-inner">
          <a className="brand-wordmark" href="/">
            <div className="brand-mark" aria-hidden="true">H</div>
            <div className="brand-copy">
              <div className="brand-title">Hosting Portal</div>
              <div className="brand-subtitle">Create and launch sessions</div>
            </div>
          </a>
          <div className="topbar-actions">
            <a href="/" className="btn-ghost" style={{ padding: "8px 12px", textDecoration: "none" }}>Home</a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="page-main" style={{ maxWidth: 860 }}>
        <div className="glass-card-sq" style={{ padding: "1.5rem" }}>
          <h1 className="hero-title" style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}>Host Setup</h1>
          <p className="hero-copy" style={{ marginTop: "0.4rem" }}>Choose an existing quiz or build your custom quiz.</p>
          <CreatePanel navigate={navigate} />
        </div>
      </main>
    </div>
  );
}

function CreatePanel({ navigate }) {
  const [mode, setMode] = useState("premade");
  const [quizzes, setQ] = useState([]);
  const [selId, setSelId] = useState("");
  const [loading, setL] = useState(false);
  const [fetching, setF] = useState(true);
  const [err, setErr] = useState("");

  const [quizTitle, setQT] = useState("");
  const [questions, setQs] = useState([BLANK_QUESTION()]);

  useEffect(() => {
    axios
      .get(`${API}/api/quizzes`)
      .then((r) => {
        setQ(r.data.quizzes);
        if (r.data.quizzes[0]) setSelId(r.data.quizzes[0].id);
      })
      .catch(() => setErr("Could not load pre-made quizzes"))
      .finally(() => setF(false));
  }, []);

  async function createFromPremade() {
    if (!selId) return;
    setL(true);
    setErr("");
    try {
      const hostId = `host_${Date.now()}`;
      const { data } = await axios.post(`${API}/api/games/create`, { quizId: selId, hostId });
      navigate(`/host/${data.pin}?hostId=${hostId}`);
    } catch {
      setErr("Failed - is the server running?");
    } finally {
      setL(false);
    }
  }

  async function createFromCustom() {
    if (!quizTitle.trim()) {
      setErr("Quiz needs a title");
      return;
    }
    const bad = questions.findIndex((q) => !q.text.trim() || q.options.some((o) => !o.trim()));
    if (bad !== -1) {
      setErr(`Question ${bad + 1}: fill in all fields`);
      return;
    }

    setL(true);
    setErr("");
    try {
      const hostId = `host_${Date.now()}`;
      const { data: qData } = await axios.post(`${API}/api/quizzes`, {
        title: quizTitle.trim(),
        description: "Custom quiz",
        category: "Custom",
        difficulty: "Medium",
        questions: questions.map((q) => ({
          text: q.text.trim(),
          options: q.options.map((o) => o.trim()),
          correct: q.correct,
          time: q.time,
        })),
      });
      const { data: gData } = await axios.post(`${API}/api/games/create`, {
        quizId: qData.quiz.id,
        hostId,
      });
      navigate(`/host/${gData.pin}?hostId=${hostId}`);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to create quiz");
    } finally {
      setL(false);
    }
  }

  function updateQ(idx, field, value) {
    setQs((prev) => prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q)));
  }

  function updateOpt(qIdx, oIdx, value) {
    setQs((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const opts = [...q.options];
        opts[oIdx] = value;
        return { ...q, options: opts };
      }),
    );
  }

  function addQ() {
    if (questions.length < 20) setQs((p) => [...p, BLANK_QUESTION()]);
  }

  function rmQ(idx) {
    if (questions.length > 1) setQs((p) => p.filter((_, i) => i !== idx));
  }

  const OPT_COLORS = ["#e85d6e", "#4a90d9", "#f5a623", "#7ed321"];
  const OPT_LABELS = ["A", "B", "C", "D"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: "1rem" }}>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn-secondary-sq" onClick={() => setMode("premade")} style={{ flex: 1, background: mode === "premade" ? "var(--surface-strong)" : undefined }}>
          Pre-built
        </button>
        <button className="btn-secondary-sq" onClick={() => setMode("custom")} style={{ flex: 1, background: mode === "custom" ? "var(--surface-strong)" : undefined }}>
          Custom
        </button>
      </div>

      {mode === "premade" && (
        <>
          <label className="field-label">Choose Quiz</label>
          {fetching ? (
            <div className="meta-card">Loading quizzes...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto" }}>
              {quizzes.map((q) => (
                <button key={q.id} className="btn-ghost" style={{ justifyContent: "space-between", width: "100%", padding: "10px 12px", borderRadius: 10, border: selId === q.id ? "1px solid var(--cyan)" : undefined }} onClick={() => setSelId(q.id)}>
                  <span>{q.title}</span>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>{q.questionCount} Q</span>
                </button>
              ))}
            </div>
          )}
          <button className="btn-primary-sq" onClick={createFromPremade} disabled={loading || !selId}>
            {loading ? "Creating..." : "Create Game ->"}
          </button>
        </>
      )}

      {mode === "custom" && (
        <>
          <label className="field-label" htmlFor="host-quiz-title">Quiz Title</label>
          <input id="host-quiz-title" className="input-sq" value={quizTitle} onChange={(e) => setQT(e.target.value.slice(0, 60))} placeholder="e.g. Science Round" maxLength={60} />

          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: "50vh", overflowY: "auto" }}>
            {questions.map((q, qi) => (
              <div key={qi} className="meta-card" style={{ display: "block" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <strong>Question {qi + 1}</strong>
                  <div style={{ display: "flex", gap: 8 }}>
                    <select className="select-sq" value={q.time} onChange={(e) => updateQ(qi, "time", Number(e.target.value))}>
                      {[10, 15, 20, 30, 45, 60].map((t) => (
                        <option key={t} value={t}>{t}s</option>
                      ))}
                    </select>
                    {questions.length > 1 && (
                      <button className="btn-danger" onClick={() => rmQ(qi)}>Remove</button>
                    )}
                  </div>
                </div>

                <textarea className="input-sq" rows={2} value={q.text} onChange={(e) => updateQ(qi, "text", e.target.value)} placeholder="Type question" />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                  {q.options.map((opt, oi) => (
                    <input key={oi} className="input-sq" value={opt} onChange={(e) => updateOpt(qi, oi, e.target.value)} placeholder={`Option ${OPT_LABELS[oi]}`} style={{ borderColor: q.correct === oi ? OPT_COLORS[oi] : undefined }} />
                  ))}
                </div>

                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  {OPT_LABELS.map((lbl, oi) => (
                    <button key={oi} className="btn-ghost" style={{ flex: 1, borderColor: q.correct === oi ? OPT_COLORS[oi] : undefined }} onClick={() => updateQ(qi, "correct", oi)}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {questions.length < 20 && (
            <button className="btn-secondary-sq" onClick={addQ}>+ Add Question ({questions.length}/20)</button>
          )}

          <button className="btn-primary-sq" onClick={createFromCustom} disabled={loading}>
            {loading ? "Creating..." : `Launch Quiz (${questions.length} Q)`}
          </button>
        </>
      )}

      {err && <div className="hp-error">{err}</div>}
    </div>
  );
}
