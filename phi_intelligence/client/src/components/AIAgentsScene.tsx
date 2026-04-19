import { useEffect, useRef } from 'react';

export default function AIAgentsScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    let W = 0, H = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      W = rect.width;
      H = rect.height;
    };
    resize();
    window.addEventListener('resize', resize);

    // ── Isometric helpers ──
    // Tile size in world space
    const TILE = 72;
    // Isometric projection: world (wx, wy) → screen (sx, sy)
    // Camera looks from upper-left down-right
    const isoX = (wx: number, wy: number) => (wx - wy) * 0.82;
    const isoY = (wx: number, wy: number) => (wx + wy) * 0.42;

    // Rounded rect helper
    const rr = (x: number, y: number, w: number, h: number, r: number) => {
      const R = Math.max(0, Math.min(r, Math.min(w, h) / 2));
      ctx.beginPath();
      ctx.moveTo(x + R, y);
      ctx.lineTo(x + w - R, y);
      ctx.arcTo(x + w, y, x + w, y + R, R);
      ctx.lineTo(x + w, y + h - R);
      ctx.arcTo(x + w, y + h, x + w - R, y + h, R);
      ctx.lineTo(x + R, y + h);
      ctx.arcTo(x, y + h, x, y + h - R, R);
      ctx.lineTo(x, y + R);
      ctx.arcTo(x, y, x + R, y, R);
      ctx.closePath();
    };

    // ── Draw isometric tile grid ──
    const drawGrid = () => {
      const cx = W * 0.52;
      const cy = H * 0.48;
      const gridRange = 9;

      for (let gx = -gridRange; gx <= gridRange; gx++) {
        for (let gy = -gridRange; gy <= gridRange; gy++) {
          const wx = gx * TILE;
          const wy = gy * TILE;
          const sx = cx + isoX(wx, wy);
          const sy = cy + isoY(wx, wy);

          // Skip tiles off screen
          if (sx < -TILE * 2 || sx > W + TILE * 2 || sy < -TILE * 2 || sy > H + TILE * 2) continue;

          // Diamond (isometric tile shape)
          const hw = TILE * 0.82; // half-width on screen
          const hh = TILE * 0.42; // half-height on screen

          // Tile fill — subtle gradient based on distance from center
          const dist = Math.sqrt(gx * gx + gy * gy) / gridRange;
          const tileAlpha = Math.max(0, 0.12 - dist * 0.08);

          ctx.beginPath();
          ctx.moveTo(sx, sy - hh);       // top
          ctx.lineTo(sx + hw, sy);       // right
          ctx.lineTo(sx, sy + hh);       // bottom
          ctx.lineTo(sx - hw, sy);       // left
          ctx.closePath();
          ctx.fillStyle = `rgba(0,140,255,${tileAlpha})`;
          ctx.fill();

          // Tile border
          const borderAlpha = Math.max(0, 0.22 - dist * 0.14);
          ctx.strokeStyle = `rgba(0,163,255,${borderAlpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // Dot pattern on tile (4 dots per tile)
          const dotAlpha = Math.max(0, 0.30 - dist * 0.22);
          ctx.fillStyle = `rgba(0,163,255,${dotAlpha})`;
          const dotR = 1.1;
          for (let dx = -1; dx <= 1; dx += 2) {
            for (let dy = -1; dy <= 1; dy += 2) {
              const ddx = dx * hw * 0.28;
              const ddy = dy * hh * 0.28;
              ctx.beginPath();
              ctx.arc(sx + ddx, sy + ddy, dotR, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }
    };

    // ── Draw the portal (standing screen with pillar poles) ──
    const drawPortal = () => {
      const cx = W * 0.52;
      const cy = H * 0.48;

      // Portal sits at world ~(0, 0), facing diagonally
      // We draw it as a perspective-ish rectangle
      const pw = W * 0.26;
      const ph = H * 0.48;
      const px = cx - pw * 0.42;
      const py = cy - ph * 0.72;

      // Skew to give isometric feel — left edge slightly shorter
      const skew = pw * 0.12;

      // Ambient glow behind portal
      const glow = ctx.createRadialGradient(px + pw * 0.5, py + ph * 0.45, 0, px + pw * 0.5, py + ph * 0.45, pw * 1.1);
      glow.addColorStop(0, 'rgba(0,163,255,0.28)');
      glow.addColorStop(0.4, 'rgba(0,100,220,0.10)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(px - pw * 0.5, py - ph * 0.2, pw * 2, ph * 1.4);

      // Portal face (trapezoid for perspective)
      ctx.beginPath();
      ctx.moveTo(px + skew, py);                    // top-left
      ctx.lineTo(px + pw, py);                       // top-right
      ctx.lineTo(px + pw, py + ph);                  // bottom-right
      ctx.lineTo(px, py + ph);                       // bottom-left
      ctx.closePath();

      const pf = ctx.createLinearGradient(px, py, px + pw, py + ph);
      pf.addColorStop(0, 'rgba(0,100,220,0.13)');
      pf.addColorStop(0.5, 'rgba(0,163,255,0.08)');
      pf.addColorStop(1, 'rgba(0,50,150,0.15)');
      ctx.fillStyle = pf;
      ctx.fill();

      // Portal border glow
      ctx.shadowColor = 'rgba(0,180,255,0.9)';
      ctx.shadowBlur = 18;
      ctx.strokeStyle = 'rgba(0,200,255,0.55)';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Corner pillar poles (metallic cylinders at 4 corners)
      const drawPillar = (bx: number, by: number, pillarH: number) => {
        const pw2 = 5;
        // Pillar body
        const pg = ctx.createLinearGradient(bx - pw2, by - pillarH, bx + pw2, by);
        pg.addColorStop(0, 'rgba(140,160,190,0.9)');
        pg.addColorStop(0.3, 'rgba(200,210,225,0.85)');
        pg.addColorStop(0.5, 'rgba(100,120,150,0.8)');
        pg.addColorStop(0.7, 'rgba(180,195,210,0.85)');
        pg.addColorStop(1, 'rgba(80,95,120,0.7)');
        ctx.fillStyle = pg;
        rr(bx - pw2, by - pillarH, pw2 * 2, pillarH, 2);
        ctx.fill();
        // Pillar top cap
        ctx.beginPath();
        ctx.arc(bx, by - pillarH, pw2 + 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(180,200,220,0.85)';
        ctx.fill();
        // Glow on pillar
        ctx.shadowColor = 'rgba(0,163,255,0.5)';
        ctx.shadowBlur = 8;
        ctx.strokeStyle = 'rgba(0,163,255,0.25)';
        ctx.lineWidth = 0.8;
        rr(bx - pw2, by - pillarH, pw2 * 2, pillarH, 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      };

      const pillarH = ph * 0.18;
      // Bottom-left pillar
      drawPillar(px, py + ph, pillarH + ph);
      // Bottom-right pillar
      drawPillar(px + pw, py + ph, pillarH + ph);
    };

    // ── Agent type ──
    interface Agent { progress: number; walkPhase: number; }

    // 3 agents staggered
    const agents: Agent[] = [
      { progress: 0.05, walkPhase: 0 },
      { progress: 0.38, walkPhase: 2.1 },
      { progress: 0.71, walkPhase: 4.2 },
    ];

    // Agent path: diagonal from upper-right behind portal → lower-left foreground
    // progress 0 = far (small, upper-right), 1 = near (huge, lower-left)
    const agentProject = (progress: number) => {
      const p = Math.pow(Math.max(0, progress), 0.52);
      // Start upper-right, end lower-left
      const startX = W * 0.72;
      const startY = H * 0.14;
      const endX = W * 0.15;
      const endY = H * 1.12;
      const x = startX + (endX - startX) * p;
      const y = startY + (endY - startY) * p;
      // Scale: near agent is massive
      const scale = 0.12 + Math.pow(progress, 0.48) * 1.55;
      // Fade
      const alpha = Math.min(1, progress * 6) * Math.min(1, (1.08 - progress) * 4.5);
      return { x, y, scale: Math.max(0, scale), alpha: Math.max(0, alpha) };
    };

    // ── Draw a robot agent ──
    const drawAgent = (agent: Agent) => {
      const { x, y, scale, alpha } = agentProject(agent.progress);
      if (alpha < 0.01 || scale < 0.05) return;

      const bob = Math.sin(agent.walkPhase) * 4.5 * scale;
      const ay = y + bob;

      // Base dimensions
      const bW = 110 * scale;
      const bH = 100 * scale;

      ctx.globalAlpha = alpha;

      // ── Floor glow/shadow
      ctx.beginPath();
      ctx.ellipse(x, ay + bH * 0.08, bW * 0.50, bH * 0.08, 0, 0, Math.PI * 2);
      const sg = ctx.createRadialGradient(x, ay + bH * 0.08, 0, x, ay + bH * 0.08, bW * 0.50);
      sg.addColorStop(0, `rgba(0,163,255,${0.28 * Math.min(1, scale)})`);
      sg.addColorStop(1, 'rgba(0,163,255,0)');
      ctx.fillStyle = sg;
      ctx.fill();

      // ── Legs
      const legW = bW * 0.15;
      const legH = bH * 0.22;
      const lbL = Math.sin(agent.walkPhase * 2) * legH * 0.20;
      const lbR = Math.sin(agent.walkPhase * 2 + Math.PI) * legH * 0.20;

      // Left leg
      const llg = ctx.createLinearGradient(0, ay, 0, ay + legH);
      llg.addColorStop(0, 'rgba(18,38,72,0.95)');
      llg.addColorStop(1, 'rgba(8,18,38,0.90)');
      ctx.fillStyle = llg;
      rr(x - bW * 0.20 - legW / 2, ay + lbL, legW, legH, Math.max(2, 3 * scale));
      ctx.fill();
      // Right leg
      rr(x + bW * 0.20 - legW / 2, ay + lbR, legW, legH, Math.max(2, 3 * scale));
      ctx.fill();

      // ── Body (rounded cube)
      const bodyX = x - bW / 2;
      const bodyY = ay - bH;
      const bodyR = Math.max(6, 14 * scale);

      // Body main fill — dark metallic
      const bg = ctx.createLinearGradient(bodyX, bodyY, bodyX + bW, bodyY + bH);
      bg.addColorStop(0, 'rgba(22,46,86,0.97)');
      bg.addColorStop(0.35, 'rgba(14,28,56,0.97)');
      bg.addColorStop(0.65, 'rgba(18,38,70,0.96)');
      bg.addColorStop(1, 'rgba(8,16,34,0.95)');
      ctx.fillStyle = bg;
      rr(bodyX, bodyY, bW, bH, bodyR);
      ctx.fill();

      // Body highlight edge (top-left shine like metallic reflection)
      const shine = ctx.createLinearGradient(bodyX, bodyY, bodyX + bW * 0.5, bodyY + bH * 0.5);
      shine.addColorStop(0, 'rgba(120,160,210,0.18)');
      shine.addColorStop(0.5, 'rgba(80,120,180,0.05)');
      shine.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = shine;
      rr(bodyX, bodyY, bW, bH, bodyR);
      ctx.fill();

      // Body border with glow
      ctx.shadowColor = 'rgba(0,163,255,0.7)';
      ctx.shadowBlur = Math.max(8, 24 * scale);
      ctx.strokeStyle = 'rgba(0,163,255,0.45)';
      ctx.lineWidth = Math.max(1, 2 * scale);
      rr(bodyX, bodyY, bW, bH, bodyR);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // ── Ear panels (side bumps)
      const earW = bW * 0.08;
      const earH = bH * 0.35;
      const earY = bodyY + bH * 0.2;
      // Left ear
      rr(bodyX - earW * 0.6, earY, earW, earH, Math.max(2, 3 * scale));
      ctx.fillStyle = 'rgba(18,40,75,0.9)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,163,255,0.3)';
      ctx.lineWidth = Math.max(0.6, 1.2 * scale);
      ctx.stroke();
      // Right ear
      rr(bodyX + bW - earW * 0.4, earY, earW, earH, Math.max(2, 3 * scale));
      ctx.fill();
      ctx.stroke();

      // ── Face panel (inner screen)
      const fW = bW * 0.74;
      const fH = bH * 0.50;
      const fX = x - fW / 2;
      const fY = bodyY + bH * 0.12;
      rr(fX, fY, fW, fH, Math.max(4, 7 * scale));
      ctx.fillStyle = 'rgba(16,50,100,0.55)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,163,255,0.15)';
      ctx.lineWidth = Math.max(0.5, 1 * scale);
      ctx.stroke();

      // ── Eyes (glowing rectangles with rounded corners)
      const eyeY = fY + fH * 0.38;
      const eW = bW * 0.20;
      const eH = bH * 0.17;
      const eGap = bW * 0.18;
      const eyeR = Math.max(2, 4 * scale);

      // Eye glow
      ctx.shadowColor = 'rgba(0,210,255,1)';
      ctx.shadowBlur = Math.max(10, 26 * scale);
      ctx.fillStyle = 'rgba(0,215,255,1)';
      rr(x - eGap - eW / 2, eyeY - eH / 2, eW, eH, eyeR);
      ctx.fill();
      rr(x + eGap - eW / 2, eyeY - eH / 2, eW, eH, eyeR);
      ctx.fill();

      // Lighter inner eye
      ctx.shadowBlur = 0;
      const eInset = Math.max(1, 2.5 * scale);
      ctx.fillStyle = 'rgba(140,230,255,0.45)';
      rr(x - eGap - eW / 2 + eInset, eyeY - eH / 2 + eInset, eW - eInset * 2, eH - eInset * 2, eyeR * 0.6);
      ctx.fill();
      rr(x + eGap - eW / 2 + eInset, eyeY - eH / 2 + eInset, eW - eInset * 2, eH - eInset * 2, eyeR * 0.6);
      ctx.fill();

      // Eye highlight spec
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      const hW = eW * 0.24;
      const hH = eH * 0.24;
      ctx.fillRect(x - eGap - eW / 2 + eW * 0.14, eyeY - eH / 2 + eH * 0.14, hW, hH);
      ctx.fillRect(x + eGap - eW / 2 + eW * 0.14, eyeY - eH / 2 + eH * 0.14, hW, hH);

      // ── Antenna
      const antH = bH * 0.25;
      const antX = x;
      const antBaseY = bodyY;

      // Stem
      ctx.beginPath();
      ctx.moveTo(antX, antBaseY);
      ctx.lineTo(antX, antBaseY - antH);
      ctx.strokeStyle = 'rgba(140,165,200,0.85)';
      ctx.lineWidth = Math.max(1.5, 3 * scale);
      ctx.shadowColor = 'rgba(0,163,255,0.6)';
      ctx.shadowBlur = Math.max(4, 8 * scale);
      ctx.stroke();

      // Antenna tip ball
      const tipR = Math.max(2.5, 5.5 * scale);
      ctx.beginPath();
      ctx.arc(antX, antBaseY - antH, tipR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,225,255,1)';
      ctx.shadowColor = 'rgba(0,225,255,1)';
      ctx.shadowBlur = Math.max(8, 20 * scale);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    };

    // ── Main draw loop ──
    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Background
      const bg = ctx.createRadialGradient(W * 0.5, H * 0.4, 0, W * 0.5, H * 0.5, W * 0.75);
      bg.addColorStop(0, '#060c1a');
      bg.addColorStop(0.5, '#030810');
      bg.addColorStop(1, '#000005');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      drawGrid();

      // Draw portal behind the mid-agent
      drawPortal();

      // Sort by progress (far first) for painter's algorithm
      const sorted = [...agents].sort((a, b) => a.progress - b.progress);
      sorted.forEach(a => drawAgent(a));

      // Advance agents
      agents.forEach(agent => {
        agent.progress += 0.0018;
        agent.walkPhase += 0.10;
        if (agent.progress > 1.08) agent.progress -= 1.03;
      });

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
}
