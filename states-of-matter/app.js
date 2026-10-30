import {motionPreference, animationFrame, animationNow, animationWait} from '../kit/motion.js';
import {createGraphTools} from '../kit/graph-tools.js';
import { advanceTrial, sampleAt, createRun, newMystery, guessMystery, normalize, segmentsFor, motionLevel, DEFAULTS, MODES, POWERS, MASSES, MYSTERY_KEYS, SUBSTANCES } from "./model.js";
import { initLab, onLangChange, renderRich, t } from "../kit/labs-kit.js";
import { content } from "./content.js";

const $ = (selector) => document.querySelector(selector);
const params = new URLSearchParams(location.search);
const startMode = MODES.includes(params.get("mode")) ? params.get("mode") : "explore";

const state = {
  mode: startMode,
  settings: { explore: { ...DEFAULTS.explore }, mystery: { ...DEFAULTS.mystery } },
  seed: seedFromLocation(), run: null, prediction: "",
  playing: false, playToken: 0, preview: true, chartSelection: [], frame: null,
};
state.run = createRun(state.seed);

const refs = {
  scene: $("#scene"), sceneLive: $("#scene-live"), sceneHeading: $("#scene-heading"), sceneSub: $("#scene-sub"), eventCard: $("#event-card"),
  track: $("#stage-track"), readouts: $("#readouts"),
  modeChoices: $("#mode-choices"), modeHint: $("#mode-hint"), modeControls: $("#mode-controls"),
  run: $("#run-button"), runLabel: $("#run-label"), reset: $("#reset-button"), newSeed: $("#new-seed-button"), seed: $("#seed-readout"), prediction: $("#prediction"),
  outcome: $("#outcome-copy"), stats: $("#stat-row"), mystery: $("#mystery-wrap"),
  chart: $("#chart"), chartKey: $("#chart-key"), chartSelection: $("#chart-selection"), clearChartSelection: $("#clear-chart-selection"),
  history: $("#history-body"), reflection: $("#reflection-prompt"),
};

function seedFromLocation() {
  const value = params.get("seed");
  return value && /^\d+$/.test(value) ? Number(value) >>> 0 : Math.floor(Math.random() * 2 ** 32) >>> 0;
}

/* ---------- formatting ---------- */
const fmt = (value, digits = 1) => {
  const text = Math.abs(value) < 0.5 * 10 ** -digits ? (0).toFixed(digits) : Number(value).toFixed(digits);
  return text.replace("-", "−");
};
const minutes = (seconds) => fmt(seconds / 60, 1);
const esc = (text) => String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const cap = (text) => text.charAt(0).toUpperCase() + text.slice(1);
const plain = (text) => text.replace(/\[\[[a-z0-9-]+\|([^\]]+)\]\]/g, "$1");
const SUB_KEY = { water: "subWater", co2: "subCo2", ethanol: "subEthanol", acetone: "subAcetone" };
const CHANGE_KEY = { melting: "chMelting", boiling: "chBoiling", sublimation: "chSublimation", freezing: "chFreezing", condensing: "chCondensing", deposition: "chDeposition" };
const STATE_KEY = { solid: "stSolid", liquid: "stLiquid", gas: "stGas" };
const POWER_KEY = { low: "powerLow", medium: "powerMedium", high: "powerHigh" };
const stateName = (s) => t(STATE_KEY[s]);
const changeName = (c) => t(CHANGE_KEY[c]);
const modeTrials = () => state.run.history.filter((trial) => trial.settings.mode === state.mode);
const lastTrial = () => modeTrials().at(-1) ?? null;
/** What a trial's sample is called: its substance in Explore, "Sample X" in Mystery (the identity stays hidden). */
const sampleName = (trial) => (trial.mystery ? t("sampleLetter", { letter: trial.mystery.letter }) : t(SUB_KEY[trial.key]));
/** The same name for use inside a sentence ("100 g of water"). */
const sampleInSentence = (trial) => (trial.mystery ? t("sampleInText", { letter: trial.mystery.letter }) : t(SUB_KEY[trial.key]).toLowerCase());
const currentKey = () => (state.mode === "mystery" ? state.run.mystery.key : state.settings.explore.substance);

function setupText(s, trial = null) {
  const name = trial ? sampleInSentence(trial) : s.mode === "mystery" ? t("sampleInText", { letter: state.run.mystery.letter }) : t(SUB_KEY[s.substance]).toLowerCase();
  return t(s.direction === "heat" ? "setupHeat" : "setupCool", { name, m: s.mass, w: POWERS[s.power] });
}

/* ---------- controls ---------- */
function segField(name, legend, options, value, cols = "") {
  return `<fieldset><legend>${esc(legend)}</legend><div class="segmented-control ${cols}">${options.map(([key, label]) =>
    `<button type="button" class="choice ${String(key) === String(value) ? "active" : ""}" data-field="${name}" data-value="${key}" aria-pressed="${String(key) === String(value)}">${esc(label)}</button>`).join("")}</div></fieldset>`;
}

function renderControls() {
  refs.modeChoices.innerHTML = MODES.map((mode) => {
    const label = t(mode === "explore" ? "modeExplore" : "modeMystery");
    return `<button type="button" class="choice ${mode === state.mode ? "active" : ""}" data-mode="${mode}" aria-pressed="${mode === state.mode}">${esc(label)}</button>`;
  }).join("");
  refs.modeHint.innerHTML = renderRich(t(state.mode === "explore" ? "modeHintExplore" : "modeHintMystery", { letter: state.run.mystery.letter }));
  const s = state.settings[state.mode];
  let html = "";
  if (state.mode === "explore") {
    html += segField("substance", t("substanceLegend"), [["water", t("subWater")], ["co2", t("subCo2")]], s.substance, "two");
    html += segField("direction", t("directionLegend"), [["heat", t("dirHeat")], ["cool", t("dirCool")]], s.direction, "two");
  } else {
    html += `<fieldset><legend>${esc(t("mysteryLegend"))}</legend><p class="mystery-tag"><span class="mystery-chip">${esc(t("sampleLetter", { letter: state.run.mystery.letter }))}</span> <button type="button" class="secondary-button small" id="new-mystery">${esc(t("newMysteryBtn"))}</button></p><p class="hint">${renderRich(t("mysteryStart"))}</p></fieldset>`;
  }
  html += segField("power", t("powerLegend"), Object.keys(POWERS).map((key) => [key, t(POWER_KEY[key], { w: POWERS[key] })]), s.power, "three");
  html += segField("mass", t("massLegend"), MASSES.map((m) => [m, t("massOut", { m })]), s.mass, "three");
  html += `<p class="hint" id="power-hint">${renderRich(t(s.direction === "cool" ? "powerHintCool" : "powerHint"))}</p>`;
  refs.modeControls.innerHTML = html;
  refs.modeChoices.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode)));
  refs.modeControls.querySelectorAll("[data-field]").forEach((button) => button.addEventListener("click", () => {
    if (state.playing) return;
    const field = button.dataset.field;
    s[field] = field === "mass" ? Number(button.dataset.value) : button.dataset.value;
    Object.assign(s, normalize(s));
    state.preview = true;
    state.chartSelection = [];
    renderControls();
    render();
    refs.modeControls.querySelector(`[data-field="${field}"][data-value="${button.dataset.value}"]`)?.focus();
  }));
  $("#new-mystery")?.addEventListener("click", () => {
    if (state.playing) return;
    state.run = newMystery(state.run);
    state.preview = true;
    state.chartSelection = [];
    renderControls();
    render();
    $("#new-mystery")?.focus();
  });
}

function setMode(mode) {
  if (state.playing || mode === state.mode) return;
  state.mode = mode;
  state.chartSelection = [];
  state.preview = !lastTrial();
  const url = new URL(location.href);
  url.searchParams.set("mode", mode);
  url.searchParams.set("seed", state.seed);
  history.replaceState({}, "", url);
  renderControls();
  render();
}

/* ---------- frames: what the scene shows ---------- */
function idleFrame() {
  const s = normalize(state.settings[state.mode]);
  const segs = segmentsFor(currentKey(), s.direction);
  const first = segs[0];
  return { preview: true, key: currentKey(), mystery: s.mode === "mystery", direction: s.direction, power: s.power, t: 0, T: first.from, reading: first.from, state: first.state, next: null, change: null, frac: 0, energy: 0 };
}
function frameFromSample(trial, sample) {
  return { preview: false, key: trial.key, mystery: Boolean(trial.mystery), direction: trial.settings.direction, power: trial.settings.power, ...sample };
}
function interpolate(trial, simT) { return sampleAt(trial, simT); }
function stateLabel(frame) {
  if (!frame.change) return stateName(frame.state);
  return t("changingLabel", { change: changeName(frame.change), pct: Math.round(frame.frac * 100), next: stateName(frame.next) });
}

/* ---------- scene: plate, beaker and particle view ---------- */
const VIEW = { cx: 590, cy: 205, r: 150 };
const N_PARTICLES = 30;
const COLORS = {
  water: { solid: "#cfe8f6", liquid: "#5aa9e6", gas: "#e8f3fb" },
  co2: { solid: "#eef1f3", liquid: "#cfd6db", gas: "#f2f4f6" },
  mystery: { solid: "#e5ddf3", liquid: "#a993d4", gas: "#f1edf8" },
};
const palette = (frame) => (frame.mystery ? COLORS.mystery : frame.key === "co2" ? COLORS.co2 : COLORS.water);

/** Share of the sample in each state for this frame. */
function shares(frame) {
  const out = { solid: 0, liquid: 0, gas: 0 };
  if (!frame.change) out[frame.state] = 1;
  else { out[frame.state] = 1 - frame.frac; out[frame.next] = frame.frac; }
  return out;
}

/** Lightweight vector materials: crisp at any zoom, with no external assets. */
function sceneDefs() {
  return `<defs>
    <linearGradient id="beaker-glass"><stop stop-color="#ffffff" stop-opacity=".65"/><stop offset=".35" stop-color="#eaf7fa" stop-opacity=".12"/><stop offset="1" stop-color="#88b6c3" stop-opacity=".28"/></linearGradient>
    <linearGradient id="ice-face" x2=".8" y2="1"><stop stop-color="#ffffff"/><stop offset=".5" stop-color="#cceaf3"/><stop offset="1" stop-color="#7db8cf"/></linearGradient>
    <linearGradient id="plate-metal" x2="0" y2="1"><stop stop-color="#6e878c"/><stop offset=".2" stop-color="#405960"/><stop offset="1" stop-color="#243b43"/></linearGradient>
    <radialGradient id="lens-paper" cx=".35" cy=".25" r=".85"><stop stop-color="#ffffff"/><stop offset="1" stop-color="#eaf3ef"/></radialGradient>
    <radialGradient id="atom-red" cx=".3" cy=".25"><stop stop-color="#ffa68e"/><stop offset=".5" stop-color="#df6357"/><stop offset="1" stop-color="#a63138"/></radialGradient>
    <radialGradient id="atom-carbon" cx=".3" cy=".25"><stop stop-color="#8b9ba0"/><stop offset="1" stop-color="#34454d"/></radialGradient>
    <radialGradient id="atom-mystery" cx=".3" cy=".25"><stop stop-color="#c5abe9"/><stop offset="1" stop-color="#7351aa"/></radialGradient>
  </defs>`;
}

function plateSvg(frame) {
  const heat = frame.direction === "heat";
  const level = { low: 0.35, medium: 0.65, high: 1 }[frame.power];
  const glow = heat ? `rgba(227,82,42,${0.25 + 0.6 * level})` : `rgba(64,140,214,${0.25 + 0.6 * level})`;
  const coils = Array.from({ length: 5 }, (_, i) => `<path d="M${95 + i * 44},346 q11,-9 22,0 t22,0" fill="none" stroke="${glow}" stroke-width="4" stroke-linecap="round"/>`).join("");
  return `<ellipse cx="195" cy="373" rx="151" ry="9" fill="#385b60" opacity=".13"/><rect x="70" y="330" width="250" height="34" rx="6" fill="url(#plate-metal)"/><rect x="78" y="336" width="234" height="22" rx="4" fill="#2f3b3e"/>${coils}
    <rect x="60" y="364" width="270" height="12" rx="4" fill="#33424a"/>
    <text class="plate-label" x="195" y="396" text-anchor="middle">${esc(t(heat ? "plateHeat" : "plateCool", { w: POWERS[frame.power] }))}</text>`;
}

function beakerSvg(frame) {
  const p = palette(frame), sh = shares(frame);
  const cx = 195, baseY = 326, left = 111, right = 279, top = 144;
  const vessel = `M${left},${top} V${baseY - 17} Q${left},${baseY} ${left + 18},${baseY} H${right - 18} Q${right},${baseY} ${right},${baseY - 17} V${top}`;
  let inside = "";
  if (sh.liquid > 0) {
    const h = 110 * sh.liquid, y = baseY - h;
    inside += `<g data-phase="liquid" clip-path="url(#beaker-clip)">
      <rect x="${left + 3}" y="${y}" width="162" height="${h}" fill="${p.liquid}" opacity=".7"/>
      <ellipse cx="${cx}" cy="${y}" rx="81" ry="${Math.min(5, h / 2)}" fill="${p.liquid}"/>
      <path d="M119,${y} Q195,${y + 7} 271,${y}" fill="none" stroke="#fff" stroke-width="2" opacity=".6"/>`;
    // Bubbles belong to boiling liquid, never to sublimating dry ice.
    if (frame.change === "boiling" && sh.liquid > .03) {
      for (let i = 0; i < 7; i++) {
        const rise = ((frame.t * .055 + i * .137) % 1);
        inside += `<circle data-boiling-bubble="true" cx="${132 + (i * 29) % 126}" cy="${baseY - rise * h}" r="${2 + (i % 3)}" fill="none" stroke="#fff" stroke-width="1.5" opacity="${.25 + .5 * rise}"/>`;
      }
    }
    inside += `</g>`;
  }
  if (sh.solid > 0) {
    const scale = Math.cbrt(sh.solid);
    inside += `<g data-phase="solid" transform="translate(${cx} ${baseY - 3}) scale(${scale})">`;
    for (const [x,y,angle] of [[-58,-55,-9],[-2,-62,10],[-28,-96,22]]) {
      inside += `<g transform="translate(${x} ${y}) rotate(${angle} 26 26)">
        <rect width="52" height="52" rx="6" fill="${frame.mystery || frame.key === "co2" ? p.solid : "url(#ice-face)"}" stroke="#a5c8d4" stroke-width="1.5"/>
        <path d="M5 5 H47 L38 14 H14 Z" fill="#fff" opacity=".65"/>
        <path d="M47 5 V47 L38 38 V14 Z" fill="#5b95ad" opacity=".18"/>
        <path d="M8 39 L20 25 L30 29" fill="none" stroke="#fff" stroke-width="1.5" opacity=".6"/>
      </g>`;
    }
    inside += `</g>`;
  }
  // Schematic gas motion crosses the open rim. Gas itself has no visible fill.
  let vapor = "";
  if (sh.gas > 0 && (frame.state === "gas" || frame.change)) {
    const incoming = frame.direction === "cool";
    for (let i = 0; i < 4; i++) {
      const phase = (frame.t * .035 + i * .25) % 1;
      const rise = incoming ? 1 - phase : phase;
      const x = 143 + i * 34, y = top - 8 - rise * 38;
      vapor += `<path data-vapor="true" d="M${x},${y + 20} q-8,-7 0,-14 t0,-14" fill="none" stroke="#71a9b6" stroke-width="2.5" stroke-linecap="round" opacity="${sh.gas * (.25 + .45 * Math.sin(phase * Math.PI))}"/>`;
    }
  }
  const marks = [180,214,248,282].map(y => `<path d="M259,${y} h16" stroke="#83aab6" stroke-width="1.5"/>`).join("");
  return `<defs><clipPath id="beaker-clip"><path d="${vessel} Z"/></clipPath></defs>
    <ellipse cx="${cx}" cy="329" rx="91" ry="5" fill="#345963" opacity=".15"/>
    <path d="${vessel} Z" fill="url(#beaker-glass)"/>${inside}${vapor}
    <path d="${vessel}" fill="none" stroke="#7299a6" stroke-width="4"/>
    <ellipse cx="${cx}" cy="${top}" rx="84" ry="5" fill="none" stroke="#7299a6" stroke-width="2.5"/>
    <path d="M121,157 V303 Q121,316 133,316" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>${marks}
    <line x1="235" y1="260" x2="${VIEW.cx - VIEW.r + 8}" y2="${VIEW.cy + 40}" stroke="#9fb1ad" stroke-width="2" stroke-dasharray="5 5"/>
    <circle cx="235" cy="260" r="10" fill="none" stroke="#9fb1ad" stroke-width="2"/>`;
}

function readoutSvg(frame) {
  return `<g class="thermo"><rect x="22" y="22" width="170" height="64" rx="10" fill="#173138"/>
    <text class="thermo-label" x="36" y="42">${esc(t("thermoLabel"))}</text>
    <text class="thermo-value" x="36" y="74">${esc(t("unitC", { v: fmt(frame.reading) }))}</text></g>
    <g class="readout"><text x="210" y="44">${esc(t("readoutT", { t: minutes(frame.t) }))}</text>
    <text x="210" y="68">${esc(stateLabel(frame))}</text></g>`;
}

/* particles: positions persist between frames so motion is smooth */
const particles = Array.from({ length: N_PARTICLES }, (_, i) => {
  const col = i % 6, row = Math.floor(i / 6);
  return { home: { x: VIEW.cx - 75 + col * 30, y: VIEW.cy + 105 - row * 27 }, x: VIEW.cx, y: VIEW.cy, vx: 0, vy: 0, a: (i * 47) % 360, va: 0, seed: (i * 2654435761) >>> 0 };
});
particles.forEach((p, i) => { p.x = p.home.x; p.y = p.home.y; const ang = i * 2.4; p.vx = Math.cos(ang); p.vy = Math.sin(ang); p.va = (i % 2 ? 1 : -1) * (0.6 + (i % 5) * 0.2); });

function particleStates(frame) {
  // Particles that changed state first are the last ones in the list, so the solid keeps its lower rows longest.
  const out = [];
  const changed = frame.change ? Math.round(frame.frac * N_PARTICLES) : 0;
  for (let i = 0; i < N_PARTICLES; i++) out.push(i >= N_PARTICLES - changed ? frame.next : frame.state);
  return out;
}

function stepParticles(frame, dtFrames) {
  const states = particleStates(frame);
  const level = motionLevel(frame.T);
  particles.forEach((p, i) => {
    const st = states[i];
    if (st === "solid") {
      // Vibrate in place around a fixed spot: particles are packed in a pattern.
      const amp = 1.2 + 1.6 * level;
      p.jx = Math.sin((animationNow() / 70) * (0.8 + (i % 7) * 0.09) + i) * amp;
      p.jy = Math.cos((animationNow() / 63) * (0.85 + (i % 5) * 0.1) + i * 1.7) * amp;
      p.x += (p.home.x - p.x) * Math.min(1, 0.15 * dtFrames);
      p.y += (p.home.y - p.y) * Math.min(1, 0.15 * dtFrames);
      return;
    }
    p.jx = 0; p.jy = 0;
    const speed = 0.9 * level * dtFrames;
    const norm = Math.hypot(p.vx, p.vy) || 1;
    p.x += (p.vx / norm) * speed;
    p.y += (p.vy / norm) * speed;
    p.a += p.va * level * dtFrames;
    if (st === "liquid") {
      // Liquid: stay close together near the bottom but slide past one another.
      if (p.y < VIEW.cy + 30) { p.vy = Math.abs(p.vy) + 0.3; p.y += 1.5 * dtFrames; }
      p.vx += Math.sin(p.seed + animationNow() / 900) * 0.05 * dtFrames;
    }
    const dx = p.x - VIEW.cx, dy = p.y - VIEW.cy, d = Math.hypot(dx, dy), maxR = VIEW.r - 14;
    if (d > maxR) {
      const nx = dx / d, ny = dy / d, dot = p.vx * nx + p.vy * ny;
      p.vx -= 2 * dot * nx; p.vy -= 2 * dot * ny;
      p.x = VIEW.cx + nx * maxR; p.y = VIEW.cy + ny * maxR;
    }
  });
}

function moleculeSvg(frame, p) {
  const x = p.x + (p.jx ?? 0), y = p.y + (p.jy ?? 0);
  if (frame.mystery) return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${p.a.toFixed(0)})"><circle r="7.5" fill="url(#atom-mystery)"/><circle cx="7" cy="-3" r="3.5" fill="#fff" stroke="#7a5fb8" stroke-width="1"/></g>`;
  if (frame.key === "co2") return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${p.a.toFixed(0)})"><circle cx="-9" r="5" fill="url(#atom-red)"/><circle cx="9" r="5" fill="url(#atom-red)"/><circle r="5.5" fill="url(#atom-carbon)"/></g>`;
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${p.a.toFixed(0)})"><circle cx="-5.5" cy="-5" r="3.6" fill="#fff" stroke="#8aa1a8" stroke-width="1"/><circle cx="5.5" cy="-5" r="3.6" fill="#fff" stroke="#8aa1a8" stroke-width="1"/><circle r="6.5" fill="url(#atom-red)"/></g>`;
}

function particleLayerSvg(frame) {
  return particles.map((p) => moleculeSvg(frame, p)).join("");
}

function viewSvg(frame) {
  const legend = frame.mystery ? t("legendMystery") : frame.key === "co2" ? t("legendCo2") : t("legendWater");
  return `<defs><clipPath id="view-clip"><circle cx="${VIEW.cx}" cy="${VIEW.cy}" r="${VIEW.r - 3}"/></clipPath></defs>
    <circle cx="${VIEW.cx}" cy="${VIEW.cy}" r="${VIEW.r}" fill="url(#lens-paper)" stroke="#58716c" stroke-width="3"/>
    <circle cx="${VIEW.cx}" cy="${VIEW.cy}" r="${VIEW.r + 6}" fill="none" stroke="#fff" stroke-width="2" opacity=".8"/><g id="particle-layer" clip-path="url(#view-clip)">${particleLayerSvg(frame)}</g>
    <text class="view-label" x="${VIEW.cx}" y="${VIEW.cy - VIEW.r - 14}" text-anchor="middle">${esc(t("viewLabel"))}</text>
    <text class="view-legend" x="${VIEW.cx}" y="${VIEW.cy + VIEW.r + 26}" text-anchor="middle">${esc(legend)}</text>`;
}

let sceneKind = null;
let particleNodes = [];
function updateParticleTransforms() {
  particleNodes.forEach((node, i) => {
    const p = particles[i];
    node.setAttribute("transform", `translate(${(p.x + (p.jx ?? 0)).toFixed(1)} ${(p.y + (p.jy ?? 0)).toFixed(1)}) rotate(${p.a.toFixed(0)})`);
  });
}

function drawScene(frame) {
  state.frame = frame;
  const kind = frame.mystery ? "mystery" : frame.key;
  // Keep molecule nodes and the lens alive throughout playback. Only their transforms change.
  if (sceneKind !== kind) {
    refs.scene.innerHTML = `<title id="scene-title"></title><desc id="scene-desc"></desc>${sceneDefs()}
      <path d="M0 365 H365" stroke="#9eb9b6" stroke-width="1" opacity=".45"/>
      <g id="sample-layer"></g><g id="instrument-layer"></g><g id="lens-layer">${viewSvg(frame)}</g>`;
    sceneKind = kind;
    particleNodes = [...refs.scene.querySelector("#particle-layer").children];
  }
  refs.scene.querySelector("#scene-title").textContent = t("sceneTitle");
  refs.scene.querySelector("#scene-desc").textContent = sceneDescription(frame);
  refs.scene.querySelector("#sample-layer").innerHTML = plateSvg(frame) + beakerSvg(frame);
  refs.scene.querySelector("#instrument-layer").innerHTML = readoutSvg(frame);
  // Refresh localized labels without replacing the animated nodes.
  refs.scene.querySelector(".view-label").textContent = t("viewLabel");
  refs.scene.querySelector(".view-legend").textContent = frame.mystery ? t("legendMystery") : frame.key === "co2" ? t("legendCo2") : t("legendWater");
  updateParticleTransforms();
  renderTrack(frame);
  renderReadouts(frame);
}

function sceneDescription(frame) {
  const trial = lastTrial();
  const base = t("sceneDesc", { name: frame.mystery ? t("sampleLetter", { letter: state.run.mystery.letter }) : t(SUB_KEY[frame.key]), state: stateLabel(frame), temp: fmt(frame.reading), t: minutes(frame.t) });
  if (state.preview || !trial) return `${base} ${t("sceneDescIdle")}`;
  return base;
}

/* the particle animation runs on its own loop; it only redraws the particle layer */
const reducedMotion = () => motionPreference.matches;
let lastTick = animationNow();
function particleLoop(now) {
  const dtFrames = Math.min(3, (now - lastTick) / 16.7);
  lastTick = now;
  if (state.frame && !reducedMotion() && !document.hidden) {
    stepParticles(state.frame, dtFrames);
    updateParticleTransforms();
  }
  animationFrame(particleLoop);
}
/** With reduced motion, place particles once for the current state (no animation). */
function settleParticles(frame) {
  const states = particleStates(frame);
  particles.forEach((p, i) => {
    p.jx = 0; p.jy = 0;
    // Fixed, spread-out spots: lattice for a solid, a loose layer at the bottom for a liquid, everywhere for a gas.
    const u = ((i * 0.7548776662 + 0.5) % 1), v = ((i * 0.5698402910 + 0.5) % 1);   // evenly spread (R2 sequence)
    if (states[i] === "solid") { p.x = p.home.x; p.y = p.home.y; }
    else if (states[i] === "liquid") { p.x = VIEW.cx - 105 + u * 210; p.y = VIEW.cy + 40 + v * 80; }
    else { const ang = u * 2 * Math.PI, rad = Math.sqrt(v) * (VIEW.r - 20); p.x = VIEW.cx + Math.cos(ang) * rad; p.y = VIEW.cy + Math.sin(ang) * rad; }
  });
}

/* ---------- state track + readouts ---------- */
function renderTrack(frame) {
  if (frame.mystery && frame.preview) { refs.track.innerHTML = `<li>${esc(t("trackMystery"))}</li>`; return; }
  const segs = segmentsFor(frame.key, frame.direction);
  const items = segs.map((seg) => seg.kind === "warm" ? { id: `s-${seg.state}`, label: stateName(seg.state) } : { id: `c-${seg.change}`, label: changeName(seg.change) });
  const now = frame.change ? `c-${frame.change}` : `s-${frame.state}`;
  refs.track.innerHTML = items.map((item) => `<li class="${item.id === now ? "now" : ""} ${item.id.startsWith("c-") ? "change" : ""}" ${item.id === now ? 'aria-current="step"' : ""}>${esc(cap(item.label))}</li>`).join("");
}
function renderReadouts(frame) {
  const row = (label, value) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`;
  refs.readouts.innerHTML = row(t("roState"), cap(stateLabel(frame))) + row(t("roTemp"), t("unitC", { v: fmt(frame.reading) })) + row(t("roTime"), t("unitMin", { v: minutes(frame.t) })) +
    row(t(frame.direction === "heat" ? "roEnergyIn" : "roEnergyOut"), t("unitKJ", { v: fmt(frame.energy / 1000) }));
}

/* ---------- playback ---------- */
const wait = animationWait;
const PLAY_MS = 8000;

async function runTrial() {
  if (state.playing) return;
  state.run = advanceTrial(state.run, state.settings[state.mode]);
  const trial = state.run.history.at(-1);
  state.preview = false;
  state.chartSelection = [];
  const token = ++state.playToken;
  if (!reducedMotion()) {
    state.playing = true;
    render();
    drawPlaybackFrame(trial, trial.samples[0]);
    await wait(500);
    if (token !== state.playToken) return;
    const start = animationNow(), endT = trial.samples.at(-1).t;
    await new Promise((resolve) => {
      const tick = (now) => {
        if (token !== state.playToken) { resolve(); return; }
        const simT = reducedMotion() ? endT : Math.min(endT, ((now - start) / PLAY_MS) * endT);
        drawPlaybackFrame(trial, interpolate(trial, simT));
        renderChart(simT);
        if (simT >= endT) resolve(); else animationFrame(tick);
      };
      animationFrame(tick);
    });
    if (token !== state.playToken) return;
    await wait(250);
  }
  if (token !== state.playToken) return;
  state.playing = false;
  render();
  refs.eventCard.textContent = t("eventDone", { n: trial.index });
  refs.sceneLive.textContent = plain(trialSentence(trial));
}

function drawPlaybackFrame(trial, sample) {
  const frame = frameFromSample(trial, sample);
  drawScene(frame);
  // Event text set during playback is not overwritten by render(): render() skips the event card while playing.
  refs.eventCard.textContent = t("eventPlaying", { t: minutes(frame.t), temp: fmt(frame.reading), state: stateLabel(frame) });
}

/* ---------- words for a trial ---------- */
function trialSentence(trial) {
  const r = trial.result, s = trial.settings;
  const name = sampleInSentence(trial);
  const flats = r.plateaus.map((p) => t("flatPart", { change: changeName(p.change), temp: fmt(p.reading), len: minutes(p.length) }));
  const list = flats.length === 1 ? flats[0] : `${flats.slice(0, -1).join(", ")} ${t("and")} ${flats.at(-1)}`;
  let text = t(s.direction === "heat" ? "sHeat" : "sCool", { n: trial.index, name, m: s.mass, w: POWERS[s.power], from: fmt(r.startT), to: fmt(r.endT), total: minutes(r.total), list, count: r.plateaus.length });
  if (trial.key === "co2" && !trial.mystery) text += t(s.direction === "heat" ? "sCo2Heat" : "sCo2Cool");
  return text;
}
function flatCell(p) { return p ? t("flatCell", { change: cap(changeName(p.change)), temp: fmt(p.reading), len: minutes(p.length) }) : "—"; }

/* ---------- evidence: stats + mystery ---------- */
function renderStats(trial) {
  const stat = (label, value) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`;
  if (!trial) { refs.stats.innerHTML = stat(t("statFlat1"), "—") + stat(t("statFlat2"), "—") + stat(t("statTotal"), "—") + stat(t("statEnergy"), "—"); return; }
  const r = trial.result;
  const flat = r.plateaus.map((p) => stat(t("statFlatAt", { change: cap(changeName(p.change)) }), t("statFlatVal", { temp: fmt(p.reading), len: minutes(p.length) })));
  refs.stats.innerHTML = flat.join("") + (flat.length === 1 ? stat(t("statLiquid"), t("statNoLiquid")) : "") + stat(t("statTotal"), t("unitMin", { v: minutes(r.total) })) +
    stat(t(trial.settings.direction === "heat" ? "statEnergy" : "statEnergyOut"), t("unitKJ", { v: fmt(r.energy / 1000) }));
}

function renderMystery() {
  if (state.mode !== "mystery") { refs.mystery.hidden = true; refs.mystery.innerHTML = ""; return; }
  refs.mystery.hidden = false;
  const m = state.run.mystery;
  const tested = state.run.history.some((trial) => trial.mystery && trial.mystery.k === m.k);
  const guess = [...state.run.guesses].reverse().find((g) => g.k === m.k);
  const ref = MYSTERY_KEYS.map((key) => {
    const sub = SUBSTANCES[key];
    const mp = sub.sub !== undefined ? t("refSublimes", { temp: fmt(sub.sub) }) : t("unitC", { v: fmt(sub.mp, 0) });
    const bp = sub.sub !== undefined ? t("refNoLiquid") : t("unitC", { v: fmt(sub.bp, 0) });
    return `<tr><th scope="row">${esc(t(SUB_KEY[key]))}</th><td>${esc(mp)}</td><td>${esc(bp)}</td></tr>`;
  }).join("");
  const buttons = MYSTERY_KEYS.map((key) => `<button type="button" class="choice" data-guess="${key}" ${tested ? "" : "disabled"} aria-pressed="${guess?.guess === key}">${esc(t(SUB_KEY[key]))}</button>`).join("");
  let feedback = tested ? t("guessPrompt", { letter: m.letter }) : t("guessLocked", { letter: m.letter });
  if (guess) feedback = guess.correct ? t("guessRight", { letter: m.letter, name: t(SUB_KEY[m.key]).toLowerCase() }) : t("guessWrong", { letter: m.letter, name: t(SUB_KEY[guess.guess]).toLowerCase() });
  refs.mystery.innerHTML = `<h3 class="mystery-heading">${esc(t("mysteryHeading", { letter: m.letter }))}</h3>
    <div class="table-wrap small-table"><table class="ref-table"><caption>${esc(t("refCaption"))}</caption><thead><tr><th scope="col">${esc(t("refSubstance"))}</th><th scope="col">${esc(t("refMelt"))}</th><th scope="col">${esc(t("refBoil"))}</th></tr></thead><tbody>${ref}</tbody></table></div>
    <div class="segmented-control two guess-row" role="group" aria-label="${esc(t("guessLabel"))}">${buttons}</div>
    <p class="hint guess-feedback ${guess ? (guess.correct ? "right" : "wrong") : ""}" aria-live="polite">${renderRich(feedback)}</p>`;
  refs.mystery.querySelectorAll("[data-guess]").forEach((button) => button.addEventListener("click", () => {
    state.run = guessMystery(state.run, button.dataset.guess);
    renderMystery();
    refs.mystery.querySelector(`[data-guess="${button.dataset.guess}"]`)?.focus();
  }));
}

/* ---------- temperature–time graph ---------- */
function seriesFor(trial, role, upTo = Infinity) {
  if (!trial) return [];
  const pts = trial.samples.filter((p) => p.t <= upTo + 1e-9).map((p) => ({ t: p.t / 60, v: p.reading }));
  if (upTo < Infinity && upTo > 0) { const p = interpolate(trial, upTo); pts.push({ t: upTo / 60, v: p.reading }); }
  const name = role === "prev" ? t("namePrev", { n: trial.index }) : t("nameThis", { n: trial.index });
  return [{ id: `T${trial.index}`, name, cls: role, pts }];
}
function niceStep(range, target = 6) { const raw = range / target, pow = 10 ** Math.floor(Math.log10(raw)), n = raw / pow; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * pow; }

function renderChart(upTo = Infinity) {
  const trials = modeTrials();
  const playingNow = state.playing && upTo < Infinity;
  const current = state.playing && !playingNow ? null : trials.at(-1) ?? null;
  const prev = trials.at(-2) ?? null;
  const series = [...(prev && !playingNow ? seriesFor(prev, "prev") : []), ...seriesFor(current, "this", playingNow ? upTo : Infinity)];
  refs.chartKey.innerHTML = !current ? "" : `<span class="key-this">${esc(t("keyThis"))}</span>${prev && !playingNow ? `<span class="key-prev">${esc(t("keyPrev"))}</span>` : ""}`;
  const W = 600, H = 340, left = 62, right = 20, top = 22, bottom = 52, uw = W - left - right, uh = H - top - bottom;
  if (!current) {
    refs.chart.innerHTML = `<title id="chart-title">${esc(t("chartTitle"))}</title><desc id="chart-description">${esc(t("chartDescEmpty"))}</desc><text class="chart-empty" x="${W / 2}" y="${H / 2}" text-anchor="middle">${esc(t("chartEmpty"))}</text>`;
    refs.chartSelection.textContent = "";
    refs.clearChartSelection.disabled = true;
    return;
  }
  const full = [...(prev ? seriesFor(prev, "prev") : []), ...seriesFor(current, "this")].flatMap((s) => s.pts);
  const tMax = Math.max(1, ...full.map((p) => p.t));
  const vMin = -140, vMax = 160, vStep = 20;
  const tStep = niceStep(tMax), tEnd = Math.ceil(tMax / tStep) * tStep;
  const x = (time) => left + (time / tEnd) * uw, y = (v) => top + (1 - (v - vMin) / (vMax - vMin)) * uh;
  const vTicks = []; for (let v = vMin; v <= vMax + 1e-9; v += vStep) vTicks.push(v);
  const tTicks = []; for (let tt = 0; tt <= tEnd + 1e-9; tt += tStep) tTicks.push(Math.round(tt * 1000) / 1000);
  const sel = state.chartSelection;
  let body = `<title id="chart-title">${esc(t("chartTitle"))}</title><desc id="chart-description">${esc(chartText(current))}</desc>
    <g class="grid">${vTicks.map((v) => `<line x1="${left}" y1="${y(v)}" x2="${W - right}" y2="${y(v)}"/><text x="${left - 8}" y="${y(v) + 4}" text-anchor="end">${fmt(v, 0)}</text>`).join("")}</g>
    <line class="zero" x1="${left}" y1="${y(0)}" x2="${W - right}" y2="${y(0)}"/>
    ${tTicks.map((tt) => `<text x="${x(tt)}" y="${top + uh + 16}" text-anchor="middle">${Number.isInteger(tt) ? tt : tt.toFixed(1)}</text>`).join("")}
    <text class="axis-label" x="${left + uw / 2}" y="${H - 8}" text-anchor="middle">${esc(t("axisT"))}</text>
    <text class="axis-label" transform="translate(14 ${top + uh / 2}) rotate(-90)" text-anchor="middle">${esc(t("axisTemp"))}</text>`;
  if (!playingNow) {
    // Label each flat part of this trial with the temperature it happened at.
    for (const p of current.result.plateaus) {
      const x1 = x(p.start / 60), x2 = x(p.end / 60), yy = y(p.reading);
      const label = t("chartFlat", { change: cap(changeName(p.change)), temp: fmt(p.reading) });
      const below = yy < top + 24;
      body += `<g class="annotation"><line x1="${left}" y1="${yy}" x2="${W - right}" y2="${yy}"/><text x="${Math.min(W - right - 4, Math.max(left + 4, (x1 + x2) / 2))}" y="${below ? yy + 15 : yy - 7}" text-anchor="middle">${esc(label)}</text></g>`;
    }
  }
  const range = selectedRange(series);
  if (range) body += `<line class="slope-line" x1="${x(range.a.t)}" y1="${y(range.a.v)}" x2="${x(range.b.t)}" y2="${y(range.b.v)}"/>`;
  let first = true;
  for (const s of series) {
    body += `<polyline class="line ${s.cls}" points="${s.pts.map((p) => `${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ")}"/>`;
    if (playingNow) continue;
    s.pts.forEach((p, i) => {
      const isSel = sel.some((q) => q.series === s.id && q.i === i);
      const label = t("pointLabel", { name: s.name, t: fmt(p.t, 1), v: fmt(p.v) });
      body += `<g class="chart-point ${s.cls} ${isSel ? "selected-point" : ""}" role="button" tabindex="${first ? 0 : -1}" data-series="${s.id}" data-i="${i}" aria-label="${esc(label)}"><title>${esc(label)}</title><circle class="point-hit" cx="${x(p.t)}" cy="${y(p.v)}" r="5" fill="transparent"/><circle class="mark" cx="${x(p.t)}" cy="${y(p.v)}" r="${s.cls === "prev" ? 2 : 2.6}"/></g>`;
      first = false;
    });
  }
  body += `<line x1="${left}" y1="${top + uh}" x2="${W - right}" y2="${top + uh}" stroke="#58716c"/><line x1="${left}" y1="${top}" x2="${left}" y2="${top + uh}" stroke="#58716c"/>`;
  refs.chart.innerHTML = body;
  if (playingNow) { refs.chartSelection.textContent = ""; return; }
  refs.chart.querySelectorAll(".chart-point").forEach((point) => {
    point.addEventListener("click", () => selectPoint(point));
    point.addEventListener("keydown", pointKeydown);
  });
  refs.clearChartSelection.disabled = sel.length === 0;
  if (!range) refs.chartSelection.innerHTML = renderRich(sel.length ? t("selSecond") : t("selDefault"));
  else {
    const rate = (range.b.v - range.a.v) / (range.b.t - range.a.t);
    refs.chartSelection.innerHTML = renderRich(t("selResult", { name: range.name, v1: fmt(range.a.v), t1: fmt(range.a.t), v2: fmt(range.b.v), t2: fmt(range.b.t), r: fmt(rate) }) + (Math.abs(rate) < 1 ? t("selFlat") : t("selNote")));
  }
}

function selectedRange(series) {
  if (state.chartSelection.length !== 2) return null;
  const [p, q] = state.chartSelection;
  if (p.series !== q.series || p.i === q.i) return null;
  const s = series.find((item) => item.id === p.series);
  if (!s) return null;
  const [i, j] = [p.i, q.i].sort((m, n) => m - n);
  return { name: s.name, a: s.pts[i], b: s.pts[j] };
}

function chartText(trial) {
  const r = trial.result;
  const flats = r.plateaus.map((p) => t("chartFlat", { change: changeName(p.change), temp: fmt(p.reading) })).join("; ");
  return t("chartDesc", { n: trial.index, name: sampleName(trial), from: fmt(r.startT), to: fmt(r.endT), total: minutes(r.total), flats });
}

function selectPoint(element) {
  const point = { series: element.dataset.series, i: Number(element.dataset.i) };
  const sel = state.chartSelection;
  const existing = sel.findIndex((q) => q.series === point.series && q.i === point.i);
  if (existing >= 0) sel.splice(existing, 1);
  else if (sel.length === 0 || (sel.length === 1 && sel[0].series === point.series)) sel.push(point);
  else state.chartSelection = [point];
  renderChart();
  refs.chart.querySelector(`.chart-point[data-series="${point.series}"][data-i="${point.i}"]`)?.focus();
}

function pointKeydown(event) {
  const point = event.currentTarget;
  if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectPoint(point); return; }
  if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) {
    event.preventDefault();
    const points = [...refs.chart.querySelectorAll(".chart-point")];
    const index = points.indexOf(point), step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    points.forEach((p) => p.setAttribute("tabindex", "-1"));
    const next = points[(index + step + points.length) % points.length];
    next.setAttribute("tabindex", "0");
    next.focus();
  }
}

/* ---------- trial log ---------- */
function renderTable() {
  const cell = (value) => `<td>${esc(value)}</td>`;
  const rows = state.run.history.map((trial) => {
    const s = trial.settings, r = trial.result;
    return `<tr>${cell(trial.index)}${cell(sampleName(trial))}${cell(t(s.direction === "heat" ? "dirHeatShort" : "dirCoolShort"))}${cell(s.mass)}${cell(POWERS[s.power])}${cell(flatCell(r.plateaus[0]))}${cell(flatCell(r.plateaus[1]))}${cell(minutes(r.total))}</tr>`;
  });
  refs.history.innerHTML = rows.length ? rows.join("") : `<tr><td colspan="8" class="empty">${esc(t("tableEmpty"))}</td></tr>`;
}

/* ---------- main render ---------- */
function render() {
  const trial = lastTrial();
  refs.sceneHeading.textContent = t(state.mode === "explore" ? "sceneHeadExplore" : "sceneHeadMystery", { letter: state.run.mystery.letter });
  refs.sceneSub.textContent = setupText(normalize(state.settings[state.mode]));
  refs.seed.textContent = state.seed;
  refs.runLabel.textContent = state.playing ? t("runningBtn") : t(state.settings[state.mode].direction === "cool" ? "runCoolBtn" : "runBtn");
  refs.run.disabled = state.playing;
  document.querySelectorAll(".controls-panel button.choice, .controls-panel #new-mystery").forEach((node) => { node.disabled = state.playing; });
  if (!state.playing) {
    const frame = state.preview || !trial ? idleFrame() : frameFromSample(trial, trial.samples.at(-1));
    if (reducedMotion()) settleParticles(frame);
    drawScene(frame);
    refs.eventCard.textContent = state.preview || !trial ? t("eventStart") : t("eventDone", { n: trial.index });
  }
  const shown = state.playing ? null : trial;
  refs.outcome.innerHTML = renderRich(shown ? trialSentence(shown) : t("outcomeStart"));
  renderStats(shown);
  renderMystery();
  if (!state.playing) renderChart();
  renderTable();
  refs.reflection.innerHTML = renderRich(state.run.history.length ? reflectionText() : t("reflectStart"));
}

function reflectionText() {
  const key = { rises: "reflectRises", flat: "reflectFlat", hotter: "reflectHotter", drops: "reflectDrops" }[state.prediction];
  const prediction = key ? t("reflectYours", { text: t(key) }) : t("reflectNone");
  return t("reflectBody", { prediction });
}

/* ---------- wiring ---------- */
function cancelPlayback() { state.playToken++; state.playing = false; }
refs.run.addEventListener("click", runTrial);
refs.prediction.addEventListener("change", () => { state.prediction = refs.prediction.value; render(); });
refs.reset.addEventListener("click", () => { cancelPlayback(); state.chartSelection = []; state.preview = true; state.run = createRun(state.seed); renderControls(); render(); });
refs.newSeed.addEventListener("click", () => {
  cancelPlayback();
  state.chartSelection = []; state.preview = true;
  state.seed = Math.floor(Math.random() * 2 ** 32) >>> 0;
  state.run = createRun(state.seed);
  const url = new URL(location.href);
  url.searchParams.set("seed", state.seed); url.searchParams.set("mode", state.mode);
  history.replaceState({}, "", url);
  renderControls();
  render();
});
refs.clearChartSelection.addEventListener("click", () => { state.chartSelection = []; renderChart(); });
$("#copy-seed-button").addEventListener("click", async () => { try { await navigator.clipboard.writeText(String(state.seed)); } catch { /* clipboard permission is optional */ } });
$("#simplifications-button").addEventListener("click", (event) => { const panel = $("#simplifications"); panel.hidden = !panel.hidden; event.currentTarget.setAttribute("aria-expanded", String(!panel.hidden)); });
onLangChange(() => { renderControls(); if (state.playing) { refs.runLabel.textContent = t("runningBtn"); } else render(); });
initLab(content);
renderControls();
render();
animationFrame(particleLoop);

createGraphTools(document.getElementById('chart'), {legacy:true});
