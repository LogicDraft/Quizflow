export function calculateScore(remaining, total) {
  return Math.round(Math.max(100, 1000 * (remaining / total)));
}
export function formatScore(s) { return (s || 0).toLocaleString(); }
export function getRankSuffix(r) { return r===1?"st":r===2?"nd":r===3?"rd":"th"; }
export function getMedal(r) { return r===1?"🥇":r===2?"🥈":r===3?"🥉":null; }

export const ANSWER_COLORS = [
  { bg:"#2563eb", light:"#4f8cff", label:"A", icon:"▲" },
  { bg:"#e11d74", light:"#ff5fa2", label:"B", icon:"◆" },
  { bg:"#d97706", light:"#f6b73c", label:"C", icon:"●" },
  { bg:"#059669", light:"#21c58f", label:"D", icon:"■" },
];

export function launchConfetti(n = 100) {
  const colors = ["#72f0ff","#9a87ff","#ff86c2","#7fe7c6","#f6cf7d","#ff748f","#fff"];
  const shapes = ["circle","square","triangle"];
  for (let i = 0; i < n; i++) {
    const el = document.createElement("div");
    el.className = "confetti-particle";
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size  = Math.random() * 10 + 5;
    el.style.cssText = `
      left:${Math.random()*100}vw; top:-20px;
      width:${size}px; height:${size}px;
      background:${color};
      border-radius:${shapes[Math.floor(Math.random()*3)]==="circle"?"50%":"3px"};
      animation:confettiFall ${Math.random()*2+2}s linear ${Math.random()*1.5}s forwards;
      transform:rotate(${Math.random()*360}deg);
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 5000);
  }
}
