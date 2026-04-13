export function calculateScore(remaining, total) {
  return Math.round(Math.max(100, 1000 * (remaining / total)));
}
export function formatScore(s) { return (s || 0).toLocaleString(); }
export function getRankSuffix(r) { return r===1?"st":r===2?"nd":r===3?"rd":"th"; }
export function getMedal(r) { return r===1?"🥇":r===2?"🥈":r===3?"🥉":null; }

export const ANSWER_COLORS = [
  { bg:"#3b5bdb", light:"#4c6ef5", label:"A", icon:"▲" },
  { bg:"#c2255c", light:"#e03131", label:"B", icon:"◆" },
  { bg:"#e67700", light:"#f59f00", label:"C", icon:"●" },
  { bg:"#087f5b", light:"#0ca678", label:"D", icon:"■" },
];

export function launchConfetti(n = 100) {
  const colors = ["#06f7d9","#7c5cfc","#f72b8b","#0df2a0","#ffb938","#ff3d6e","#fff"];
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
