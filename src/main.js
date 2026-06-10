import { vec2 } from './math/vector';
import { purePursuit } from './guidance/pure-pursuit';
import { proportionalNav } from './guidance/proportional-nav';
import { leadPursuit } from './guidance/lead-pursuit';
import { createAugmentedPN } from './guidance/augmented-pn';
import { createSimulation, stepSimulation, getFixedDt } from './simulation';
import { createRenderer } from './renderer';
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();
let mousePos = vec2(canvas.width / 2, canvas.height / 4);
canvas.addEventListener('mousemove', (e) => {
    mousePos = vec2(e.clientX, e.clientY);
});
const algorithms = [
    { type: 'pure-pursuit', color: '#ff4444', factory: () => purePursuit, enabled: true },
    { type: 'lead-pursuit', color: '#44aaff', factory: () => leadPursuit, enabled: true },
    { type: 'proportional-nav', color: '#44ff88', factory: () => proportionalNav, enabled: true },
    { type: 'augmented-pn', color: '#ffaa44', factory: () => createAugmentedPN(), enabled: true },
];
let paused = false;
let speedMultiplier = 1;
function buildSim() {
    const w = canvas.width;
    const h = canvas.height;
    const targetConfig = {
        pos: vec2(w * 0.3, h * 0.2),
        speed: 200,
        waypoints: [
            { pos: vec2(w * 0.7, h * 0.2) },
            { pos: vec2(w * 0.8, h * 0.5) },
            { pos: vec2(w * 0.3, h * 0.6) },
            { pos: vec2(w * 0.2, h * 0.2) },
        ],
    };
    const active = algorithms.filter((a) => a.enabled);
    const missileConfigs = active.map((a) => ({
        pos: vec2(w * 0.5, h * 0.85),
        speed: 350,
        maxLateralAcc: 800,
        guidanceType: a.type,
        color: a.color,
        guidanceFn: a.factory(),
    }));
    const guidanceFns = missileConfigs.map((c) => c.guidanceFn);
    return createSimulation(missileConfigs, targetConfig, guidanceFns);
}
let sim = buildSim();
const renderer = createRenderer(ctx);
function resetSim() {
    sim = buildSim();
}
const fixedDt = getFixedDt();
let lastTime = 0;
let accumulator = 0;
function loop(timestamp) {
    const frameDt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;
    if (!paused) {
        accumulator += frameDt * speedMultiplier;
        while (accumulator >= fixedDt) {
            stepSimulation(sim, mousePos);
            accumulator -= fixedDt;
        }
    }
    renderer.draw(sim);
    requestAnimationFrame(loop);
}
requestAnimationFrame((t) => {
    lastTime = t;
    requestAnimationFrame(loop);
});
function createUI() {
    const panel = document.createElement('div');
    panel.id = 'ui-panel';
    document.body.appendChild(panel);
    const controls = document.createElement('div');
    controls.className = 'controls-row';
    panel.appendChild(controls);
    const btnPause = document.createElement('button');
    btnPause.textContent = '⏸';
    btnPause.onclick = () => {
        paused = !paused;
        btnPause.textContent = paused ? '▶' : '⏸';
    };
    controls.appendChild(btnPause);
    const btnReset = document.createElement('button');
    btnReset.textContent = '↺';
    btnReset.onclick = resetSim;
    controls.appendChild(btnReset);
    const speedLabel = document.createElement('span');
    speedLabel.textContent = '1x';
    const speedSlider = document.createElement('input');
    speedSlider.type = 'range';
    speedSlider.min = '1';
    speedSlider.max = '5';
    speedSlider.value = '1';
    speedSlider.oninput = () => {
        speedMultiplier = Number(speedSlider.value);
        speedLabel.textContent = `${speedMultiplier}x`;
    };
    controls.appendChild(speedSlider);
    controls.appendChild(speedLabel);
    const algoRow = document.createElement('div');
    algoRow.className = 'controls-row';
    panel.appendChild(algoRow);
    for (const alg of algorithms) {
        const label = document.createElement('label');
        label.style.color = alg.color;
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = alg.enabled;
        cb.onchange = () => {
            alg.enabled = cb.checked;
            resetSim();
        };
        label.appendChild(cb);
        label.appendChild(document.createTextNode(` ${alg.type}`));
        algoRow.appendChild(label);
    }
}
createUI();
