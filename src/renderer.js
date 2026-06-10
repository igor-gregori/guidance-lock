import { angle } from './math/vector';
export function createRenderer(ctx) {
    function drawTrail(trail, color) {
        if (trail.length < 2)
            return;
        const len = trail.length;
        for (let i = 1; i < len; i++) {
            ctx.strokeStyle = color;
            ctx.globalAlpha = i / len * 0.6;
            ctx.beginPath();
            ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
            ctx.lineTo(trail[i].x, trail[i].y);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }
    function drawMissile(m) {
        drawTrail(m.trail, m.color);
        if (!m.alive)
            return;
        const a = angle(m.vel);
        ctx.save();
        ctx.translate(m.pos.x, m.pos.y);
        ctx.rotate(a + Math.PI / 2);
        ctx.fillStyle = m.color;
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(-3, 4);
        ctx.lineTo(3, 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
    function drawTarget(t) {
        drawTrail(t.trail, 'rgba(255,255,255,0.4)');
        if (!t.alive)
            return;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(t.pos.x, t.pos.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    function drawHud(sim) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px monospace';
        ctx.fillText(`t = ${sim.time.toFixed(2)}s`, 10, 20);
        if (!sim.running && sim.results.length > 0) {
            let y = 50;
            for (const r of sim.results) {
                ctx.fillStyle = r.color;
                const status = r.hit ? 'HIT' : `MISS (${r.missDistance.toFixed(1)}px)`;
                ctx.fillText(`${r.guidanceType}: ${status} | ${r.time.toFixed(2)}s`, 10, y);
                y += 20;
            }
        }
    }
    return {
        draw(sim) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.lineWidth = 1;
            drawTarget(sim.target);
            for (const m of sim.missiles)
                drawMissile(m);
            drawHud(sim);
        },
    };
}
