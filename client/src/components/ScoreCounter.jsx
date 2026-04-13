import { useEffect, useRef, useState } from "react";
import { formatScore } from "../utils/scoring";

export default function ScoreCounter({ value = 0, duration = 800, style = {} }) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);
  const rafRef  = useRef(null);

  useEffect(() => {
    const from  = prevRef.current;
    const to    = value;
    const start = performance.now();

    cancelAnimationFrame(rafRef.current);

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (to - from) * ease);
      setDisplay(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        prevRef.current = to;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return (
    <span style={{
      fontFamily: "var(--font-mono)",
      fontVariantNumeric: "tabular-nums",
      ...style,
    }}>
      {formatScore(display)}
    </span>
  );
}
