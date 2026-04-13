import { useState } from "react";
const REACTIONS = ["🔥","⚡","💯","🎉","😱","🚀","🏆","👏"];

export default function EmojiReactions({ onReact }) {
  const [floaters, setFloaters] = useState([]);

  function react(emoji) {
    const id = Date.now() + Math.random();
    const x  = 15 + Math.random() * 70;
    setFloaters(f => [...f, { id, emoji, x }]);
    setTimeout(() => setFloaters(f => f.filter(e => e.id !== id)), 1800);
    onReact?.(emoji);
  }

  return (
    <div style={{position:"relative",width:"100%"}}>
      {/* Floating emojis */}
      {floaters.map(f => (
        <div key={f.id} style={{
          position:"fixed", bottom:"90px", left:`${f.x}%`,
          fontSize:"2rem", pointerEvents:"none", zIndex:200,
          animation:"floatUp 1.8s ease-out forwards"
        }}>{f.emoji}</div>
      ))}

      {/* Buttons */}
      <div style={{display:"flex",gap:"8px",flexWrap:"wrap",justifyContent:"center"}}>
        {REACTIONS.map(e => (
          <button key={e} onClick={() => react(e)} style={{
            fontSize:"1.4rem", padding:"8px 10px",
            borderRadius:"12px", cursor:"pointer",
            background:"rgba(13,16,34,0.8)",
            border:"1px solid var(--border)",
            transition:"transform 0.12s cubic-bezier(0.175,0.885,0.32,1.275), background 0.15s",
            WebkitTapHighlightColor:"transparent"
          }}
          onMouseEnter={e => e.target.style.transform = "scale(1.3)"}
          onMouseLeave={e => e.target.style.transform = "scale(1)"}
          onMouseDown={e => e.target.style.transform  = "scale(0.85)"}
          onMouseUp={e => e.target.style.transform    = "scale(1.3)"}
          >{e}</button>
        ))}
      </div>
    </div>
  );
}
