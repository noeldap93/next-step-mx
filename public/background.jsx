// Particle / neural-network background canvas with subtle parallax + mouse pull
const ParticleField = ({ density = 1, intensity = 0.8, mode = "neural", paused = false, theme = "dark" }) => {
  const canvasRef = React.useRef(null);
  const mouseRef = React.useRef({ x: -9999, y: -9999, has: false });
  const rafRef = React.useRef(0);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;

    const isLight = theme === "light";
    const dotColor = isLight ? "rgba(15,15,17," : "rgba(255,255,255,";
    const lineColor = isLight ? "rgba(15,15,17," : "rgba(255,255,255,";

    let particles = [];
    const baseCount = mode === "blobs" ? 14 : mode === "grid" ? 80 : 110;

    function resize() {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.floor(baseCount * density * Math.min(1.4, (W * H) / (1280 * 720)));
      particles = new Array(count).fill(0).map(() => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.2 + 0.4,
        phase: Math.random() * Math.PI * 2,
      }));
    }

    function onMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.has = true;
    }
    function onLeave() {
      mouseRef.current.has = false;
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    let t0 = performance.now();
    const linkDist = mode === "grid" ? 110 : 150;

    function frame(t) {
      const dt = Math.min(40, t - t0);
      t0 = t;
      if (paused) {
        rafRef.current = requestAnimationFrame(frame);
        return;
      }

      ctx.clearRect(0, 0, W, H);

      // soft vignette wash
      const grad = ctx.createRadialGradient(W * 0.5, H * 0.45, 50, W * 0.5, H * 0.5, Math.max(W, H) * 0.7);
      if (isLight) {
        grad.addColorStop(0, "rgba(245,245,247,0)");
        grad.addColorStop(1, "rgba(225,225,228,0.6)");
      } else {
        grad.addColorStop(0, "rgba(20,20,24,0)");
        grad.addColorStop(1, "rgba(0,0,0,0.55)");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      const m = mouseRef.current;

      if (mode === "blobs") {
        // big slow gradient orbs (kept lightweight; few of them)
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.phase += 0.0025 * dt;
          const cx = p.x + Math.cos(p.phase) * 80;
          const cy = p.y + Math.sin(p.phase * 0.7) * 80;
          const radius = 220 + Math.sin(p.phase * 0.5) * 60;
          const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
          const alpha = 0.06 * intensity;
          g.addColorStop(0, dotColor + alpha + ")");
          g.addColorStop(1, dotColor + "0)");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, W, H);
          p.x += p.vx * dt * 0.6;
          p.y += p.vy * dt * 0.6;
          if (p.x < -200) p.x = W + 200;
          if (p.x > W + 200) p.x = -200;
          if (p.y < -200) p.y = H + 200;
          if (p.y > H + 200) p.y = -200;
        }
      } else {
        // dots + connecting lines
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          // mouse repulsion / attraction
          if (m.has) {
            const dx = p.x - m.x;
            const dy = p.y - m.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 160 * 160) {
              const f = (1 - Math.sqrt(d2) / 160) * 0.6;
              p.vx += (dx / Math.sqrt(d2 + 0.01)) * f * 0.05;
              p.vy += (dy / Math.sqrt(d2 + 0.01)) * f * 0.05;
            }
          }
          p.x += p.vx * dt * 0.6 * intensity;
          p.y += p.vy * dt * 0.6 * intensity;
          // gentle drag
          p.vx *= 0.992;
          p.vy *= 0.992;
          // wrap
          if (p.x < -10) p.x = W + 10;
          if (p.x > W + 10) p.x = -10;
          if (p.y < -10) p.y = H + 10;
          if (p.y > H + 10) p.y = -10;
        }

        // lines
        ctx.lineWidth = 1;
        for (let i = 0; i < particles.length; i++) {
          const a = particles[i];
          for (let j = i + 1; j < particles.length; j++) {
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < linkDist * linkDist) {
              const op = (1 - Math.sqrt(d2) / linkDist) * 0.18 * intensity;
              ctx.strokeStyle = lineColor + op + ")";
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }

        // dots
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          ctx.fillStyle = dotColor + (0.55 * intensity) + ")";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }

        // mouse glow
        if (m.has) {
          const g2 = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 180);
          g2.addColorStop(0, dotColor + (0.06 * intensity) + ")");
          g2.addColorStop(1, dotColor + "0)");
          ctx.fillStyle = g2;
          ctx.fillRect(0, 0, W, H);
        }
      }

      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [density, intensity, mode, paused, theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
};

window.ParticleField = ParticleField;
