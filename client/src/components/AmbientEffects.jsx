import { useEffect, useRef } from "react";

function withAlpha(color, alpha) {
  const rgbaMatch = color.match(/rgba?\(([^)]+)\)/i);
  if (!rgbaMatch) return color;
  const channels = rgbaMatch[1]
    .split(",")
    .slice(0, 3)
    .map((channel) => channel.trim());
  return `rgba(${channels.join(", ")}, ${alpha})`;
}

function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

function easeOutQuart(value) {
  return 1 - Math.pow(1 - value, 4);
}

export default function AmbientEffects() {
  const canvasRef = useRef(null);
  const cursorRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const cursor = cursorRef.current;
    if (!canvas || !cursor) return undefined;

    const disableCursor =
      (typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches) ||
      (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0) ||
      ("ontouchstart" in window);
    const disableCanvas =
      typeof window.matchMedia === "function" && window.matchMedia("(max-width: 768px)").matches;

    canvas.hidden = disableCanvas;
    cursor.hidden = disableCanvas || disableCursor;
    cursor.style.opacity = "0";
    cursor.classList.remove("hover");

    if (disableCanvas) {
      return undefined;
    }

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) {
      return undefined;
    }

    let width = window.innerWidth;
    let height = window.innerHeight;
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetX = mouseX;
    let targetY = mouseY;
    let drawFrameId = 0;
    let cursorFrameId = 0;
    let disposed = false;
    let cursorVisible = false;

    const gridSpacing = 40;
    const dotRadius = 1.5;
    const interactionRadius = 180;
    const maxScale = 3.5;
    const maxDisplacement = 25;
    const dots = [];

    const readPalette = () => {
      const styles = getComputedStyle(document.documentElement);
      return {
        base: styles.getPropertyValue("--canvas-base").trim() || "#050508",
        glowPrimary: styles.getPropertyValue("--canvas-glow-primary").trim() || "rgba(59, 130, 246, 0.12)",
        glowSecondary: styles.getPropertyValue("--canvas-glow-secondary").trim() || "rgba(59, 130, 246, 0.05)",
        dot: styles.getPropertyValue("--canvas-dot").trim() || "rgba(156, 163, 175, 0.08)",
        dotGlow: styles.getPropertyValue("--canvas-dot-glow").trim() || "rgba(59, 130, 246, 0.22)",
      };
    };

    let palette = readPalette();

    const initDots = () => {
      dots.length = 0;
      for (let x = gridSpacing; x < width; x += gridSpacing) {
        for (let y = gridSpacing; y < height; y += gridSpacing) {
          dots.push({
            baseX: x,
            baseY: y,
            x,
            y,
            scale: 1,
            opacity: 0.08,
            vx: 0,
            vy: 0,
          });
        }
      }
    };

    const updateCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initDots();
    };

    const draw = () => {
      if (disposed) return;
      ctx.fillStyle = palette.base;
      ctx.fillRect(0, 0, width, height);

      const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, interactionRadius);
      gradient.addColorStop(0, palette.glowPrimary);
      gradient.addColorStop(0.4, palette.glowSecondary);
      gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      for (const dot of dots) {
        const dx = mouseX - dot.baseX;
        const dy = mouseY - dot.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < interactionRadius) {
          const influence = 1 - dist / interactionRadius;
          const eased = easeOutQuart(influence);
          const angle = Math.atan2(dy, dx);
          const pushDistance = eased * maxDisplacement;

          const nextX = dot.baseX - Math.cos(angle) * pushDistance;
          const nextY = dot.baseY - Math.sin(angle) * pushDistance;

          dot.vx = (nextX - dot.x) * 0.2;
          dot.vy = (nextY - dot.y) * 0.2;
          dot.x += dot.vx;
          dot.y += dot.vy;
          dot.scale = lerp(dot.scale, 1 + eased * maxScale, 0.15);
          dot.opacity = lerp(dot.opacity, 0.08 + eased * 0.7, 0.15);
        } else {
          dot.vx = (dot.baseX - dot.x) * 0.1;
          dot.vy = (dot.baseY - dot.y) * 0.1;
          dot.x += dot.vx;
          dot.y += dot.vy;
          dot.scale = lerp(dot.scale, 1, 0.1);
          dot.opacity = lerp(dot.opacity, 0.08, 0.1);
        }

        ctx.save();
        ctx.translate(dot.x, dot.y);
        ctx.scale(dot.scale, dot.scale);

        ctx.beginPath();
        ctx.arc(0, 0, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = withAlpha(palette.dot, dot.opacity);
        ctx.fill();

        if (dot.scale > 1.5) {
          ctx.beginPath();
          ctx.arc(0, 0, dotRadius * 2.5, 0, Math.PI * 2);
          const glowOpacity = (dot.scale - 1.5) * 0.15;
          ctx.fillStyle = withAlpha(palette.dotGlow, glowOpacity);
          ctx.fill();
        }

        ctx.restore();
      }

      drawFrameId = requestAnimationFrame(draw);
    };

    const updateCursor = (event) => {
      if (disposed) return;
      targetX = event.clientX;
      targetY = event.clientY;
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      if (!cursorVisible) {
        cursor.style.opacity = "1";
        cursorVisible = true;
      }
    };

    const smoothCursor = () => {
      if (disposed) return;
      mouseX = lerp(mouseX, targetX, 0.15);
      mouseY = lerp(mouseY, targetY, 0.15);
      cursorFrameId = requestAnimationFrame(smoothCursor);
    };

    const handleMouseOver = (event) => {
      if (event.target.closest("button, .btn, input, textarea, select, a")) {
        cursor.classList.add("hover");
      }
    };

    const handleMouseOut = (event) => {
      if (event.target.closest("button, .btn, input, textarea, select, a")) {
        cursor.classList.remove("hover");
      }
    };

    const handleThemeChange = () => {
      palette = readPalette();
    };

    updateCanvasSize();
    draw();
    smoothCursor();

    window.addEventListener("resize", updateCanvasSize);
    window.addEventListener("mousemove", updateCursor);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-ui"] });

    return () => {
      disposed = true;
      cancelAnimationFrame(drawFrameId);
      cancelAnimationFrame(cursorFrameId);
      observer.disconnect();
      window.removeEventListener("resize", updateCanvasSize);
      window.removeEventListener("mousemove", updateCursor);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

  return (
    <>
      <canvas id="canvas" ref={canvasRef} aria-hidden="true" />
      <div id="cursor" ref={cursorRef} aria-hidden="true" />
    </>
  );
}
