const fs = require('fs');
const path = require('path');

const file = path.join('c:/Users/gowda/Downloads/Anti Neo Project/Quizflow/client/src/pages/HostDashboard.jsx');
const content = fs.readFileSync(file, 'utf8');

// I will just apply the styling changes using regex to restructure the top level returns in HostDashboard.jsx
let newContent = content.replace(
  /<div className="mesh-bg".*?>/,
  \`<div id="app" className="relative after:absolute after:inset-0 after:bg-[url('/noise.png')] after:opacity-[0.02] after:pointer-events-none min-h-screen flex flex-col font-inter tracking-tight">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(99,102,241,0.25),transparent_50%)] pointer-events-none z-0"></div>\`
);

// Rework the Header
newContent = newContent.replace(
  /<header style=\{\{.*borderBottom: "1px solid rgba\(148,163,184,0\.12\)".*\}\}>/s,
  \`<header className="relative z-10 flex items-center justify-between flex-wrap gap-2 px-6 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-[0_0_40px_rgba(99,102,241,0.15)] m-4">\`
);

// Ensure the Lobby grid uses the updated Tailwind exact structures
newContent = newContent.replace(
  /<div className="animate-phase".*?padding: "clamp\(20px,5vw,40px\) clamp\(16px,4vw,24px\)".*?>/s,
  \`<div className="animate-[fadeIn_0.5s_ease-out_forwards] flex-1 flex flex-col items-center justify-center p-6 gap-8 z-10 w-full max-w-5xl mx-auto">\`
);

// Make the Live Player cards look exactly like SecureQuiz dashboards
newContent = newContent.replace(
  /className="glass-card-sq animate-pop-in"/g,
  'className="glass-card-sq p-4 flex items-center gap-3 w-full hover:-translate-y-1 transition-transform animate-[fadeIn_0.5s_ease-out_forwards]"'
);

fs.writeFileSync(file, newContent);
console.log("Updated HostDashboard.jsx layout to map SecureQuizWeb dashboard structure smoothly.");
