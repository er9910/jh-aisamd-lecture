/* Animated violet fluid + particle-network background.
   Fixed full-viewport canvas behind the deck. Mouse-interactive.
   Exposes window.deckBG.setMood(level) — 0 calm (content), 1 intense (section). */
(function () {
  const canvas = document.getElementById('bg');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  // ---- pointer ----
  const pointer = { x: W / 2, y: H / 2, tx: W / 2, ty: H / 2, active: false };
  window.addEventListener('pointermove', (e) => {
    pointer.tx = e.clientX; pointer.ty = e.clientY; pointer.active = true;
  });
  window.addEventListener('pointerleave', () => { pointer.active = false; });

  // ---- violet palette ----
  const palette = [
    [124, 58, 237],   // violet-600
    [139, 92, 246],   // violet-500
    [168, 85, 247],   // purple-500
    [109, 40, 217],   // violet-700
    [192, 38, 211],   // fuchsia-600
    [76, 29, 149],    // violet-900 deep
  ];

  // ---- fluid blobs (large soft radial gradients drifting) ----
  const blobs = [];
  const BLOB_N = 5;
  for (let i = 0; i < BLOB_N; i++) {
    const c = palette[i % palette.length];
    blobs.push({
      x: Math.random() * W, y: Math.random() * H,
      r: 320 + Math.random() * 320,
      a: Math.random() * Math.PI * 2,
      sp: 0.00018 + Math.random() * 0.0003,
      orbit: 120 + Math.random() * 220,
      ox: Math.random() * W, oy: Math.random() * H,
      col: c,
    });
  }

  // ---- particles (network) ----
  let particles = [];
  function buildParticles() {
    const n = Math.round(Math.min(110, (W * H) / 16000));
    particles = [];
    for (let i = 0; i < n; i++) {
      particles.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.6,
      });
    }
  }
  buildParticles();
  window.addEventListener('resize', buildParticles);

  // ---- mood ----
  let mood = 0.18, moodTarget = 0.18;
  window.deckBG = { setMood: (v) => { moodTarget = v; } };

  let t = 0;
  function frame() {
    t += 1;
    mood += (moodTarget - mood) * 0.04;
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;

    // base wash
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#04030a';
    ctx.fillRect(0, 0, W, H);

    // fluid blobs (additive)
    ctx.globalCompositeOperation = 'lighter';
    for (const b of blobs) {
      b.a += b.sp * (1 + mood * 1.6);
      const px = b.ox + Math.cos(b.a) * b.orbit + Math.sin(b.a * 0.6) * 60;
      const py = b.oy + Math.sin(b.a * 1.1) * b.orbit + Math.cos(b.a * 0.4) * 60;
      // gentle pull toward pointer
      const dx = pointer.x - px, dy = pointer.y - py;
      const pull = pointer.active ? 0.06 : 0;
      const cx = px + dx * pull, cy = py + dy * pull;
      const rr = b.r * (0.85 + mood * 0.5);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
      const [r, gg, bl] = b.col;
      const alpha = 0.32 + mood * 0.3;
      g.addColorStop(0, `rgba(${r},${gg},${bl},${alpha})`);
      g.addColorStop(0.5, `rgba(${r},${gg},${bl},${alpha * 0.35})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, rr, 0, Math.PI * 2);
      ctx.fill();
    }

    // particle network
    ctx.globalCompositeOperation = 'source-over';
    const LINK = 132;
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      // pointer repel/attract subtle
      if (pointer.active) {
        const dx = p.x - pointer.x, dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 26000 && d2 > 1) {
          const f = (26000 - d2) / 26000 * 0.4;
          const d = Math.sqrt(d2);
          p.x += (dx / d) * f; p.y += (dy / d) * f;
        }
      }
      if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;
    }
    // links
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK) {
          const o = (1 - d / LINK) * (0.18 + mood * 0.25);
          ctx.strokeStyle = `rgba(167,139,250,${o})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    // dots
    for (const p of particles) {
      ctx.fillStyle = `rgba(199,180,253,${0.5 + mood * 0.3})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // vignette
    ctx.globalCompositeOperation = 'source-over';
    const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);

    requestAnimationFrame(frame);
  }
  frame();
})();
