import {motionPreference, animationWait} from '../kit/motion.js';
import {createGraphTools} from '../kit/graph-tools.js';
import { advanceTrial, createRun, newMystery, normalize, DEFAULTS, HAS, PARTS, SHUTDOWNS, GAUGES, START, HOURS, makeRng } from "./model.js";
import { initLab, onLangChange, renderRich, t } from "../kit/labs-kit.js";
import { content } from "./content.js";

const $ = (selector) => document.querySelector(selector);
const params = new URLSearchParams(location.search);

const state = {
  mode: params.get("mode") === "mystery" ? "mystery" : "explore",
  settings: { ...DEFAULTS },
  seed: seedFromLocation(), run: null, prediction: "",
  playing: false, playToken: 0, preview: true,
  chartGauge: "energy", chartSelection: [], diagnoses: new Map(), diagGuess: "",
};
state.run = createRun(state.seed);
if (state.mode === "mystery") state.run = newMystery(state.run);

const refs = {
  scene: $("#scene"), sceneLive: $("#scene-live"), sceneHeading: $("#scene-heading"), sceneSub: $("#scene-sub"), eventCard: $("#event-card"),
  gauges: $("#gauges"), modeChoices: $("#mode-choices"), modeHint: $("#mode-hint"), modeControls: $("#mode-controls"),
  run: $("#run-button"), runLabel: $("#run-label"), reset: $("#reset-button"), newSeed: $("#new-seed-button"), seed: $("#seed-readout"), prediction: $("#prediction"),
  outcome: $("#outcome-copy"), stats: $("#stat-row"), clue: $("#clue-box"),
  chart: $("#chart"), chartKey: $("#chart-key"), chartGauges: $("#chart-gauges"), chartSelection: $("#chart-selection"), clearChartSelection: $("#clear-chart-selection"),
  history: $("#history-body"), reflection: $("#reflection-prompt"),
};

function seedFromLocation() {
  const value = params.get("seed");
  return value && /^\d+$/.test(value) ? Number(value) >>> 0 : Math.floor(Math.random() * 2 ** 32) >>> 0;
}

/* ---------- words ---------- */
const esc = (text) => String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const cap = (word) => word.charAt(0).toUpperCase() + word.slice(1);
const partName = (part) => t(part === "none" ? "partNone" : `part${cap(part)}`);
const partLower = (part) => t(`lower${cap(part)}`);
const gaugeName = (gauge) => t(`g${cap(gauge)}`);
const cellWord = (cell) => t(cell === "animal" ? "cellWordAnimal" : "cellWordPlant");
const TERM = { membrane: "cell-membrane", wall: "cell-wall", nucleus: "nucleus", ribosomes: "ribosome", cytoplasm: "cytoplasm", mitochondria: "mitochondria", chloroplasts: "chloroplast", vacuole: "vacuole" };
const termToken = (part) => `[[${TERM[part]}|${partName(part)}]]`;
const minus = (value) => String(value).replace("-", "−");
const plain = (text) => text.replace(/\[\[[a-z0-9-]+\|([^\]]+)\]\]/g, "$1");
const mystery = () => state.run.mystery;
const currentCell = () => (state.mode === "mystery" && mystery() ? mystery().cell : state.settings.cell);
const modeTrials = () => state.run.history.filter((trial) => state.mode === "mystery" ? trial.mysteryN === mystery()?.n : trial.settings.mode === "explore");
const lastTrial = () => modeTrials().at(-1) ?? null;
const diagnosisFor = (n) => state.diagnoses.get(n) ?? null;

/* ---------- controls ---------- */
function segField(name, legend, options, value, cols, hint = "", disabled = false) {
  return `<fieldset><legend>${esc(legend)}</legend><div class="segmented-control ${cols}">${options.map(([key, label, extra = ""]) =>
    `<button type="button" class="choice ${key === value ? "active" : ""} ${extra}" data-field="${name}" data-value="${key}" aria-pressed="${key === value}" ${disabled ? "disabled" : ""}>${esc(label)}</button>`).join("")}</div>
    ${hint ? `<p class="hint" id="${name}-hint">${renderRich(hint)}</p>` : ""}</fieldset>`;
}

function shutHint() {
  const s = state.settings;
  if (s.shutdown === "none") return t("shutHintNone");
  if (!HAS[s.cell][s.shutdown]) return `${t("shutHint", { part: termToken(s.shutdown) })} ${t("notInAnimal")}`;
  return t("shutHint", { part: termToken(s.shutdown) });
}

function renderControls() {
  refs.modeChoices.innerHTML = ["explore", "mystery"].map((mode) =>
    `<button type="button" class="choice ${mode === state.mode ? "active" : ""}" data-mode="${mode}" aria-pressed="${mode === state.mode}">${esc(t(mode === "explore" ? "modeExplore" : "modeMystery"))}</button>`).join("");
  refs.modeHint.innerHTML = renderRich(t(state.mode === "explore" ? "modeHintExplore" : "modeHintMystery"));
  const s = state.settings, cell = currentCell(), locked = state.mode === "mystery";
  let html = segField("cell", t("cellLegend"), [["animal", t("cellAnimal")], ["plant", t("cellPlant")]], cell, "two", locked ? t("cellLockedHint") : "", locked);
  html += segField("light", t("lightLegend"), [["on", t("lightOn")], ["off", t("lightOff")]], s.light, "two", t(cell === "animal" ? "lightHintAnimal" : "lightHintPlant"));
  if (state.mode === "explore") {
    html += segField("shutdown", t("shutLegend"), SHUTDOWNS.map((part) => [part, partName(part), part !== "none" && !HAS[s.cell][part] ? "absent" : ""]), s.shutdown, "three", shutHint());
  } else html += mysteryBox();
  refs.modeControls.innerHTML = html;
  wireControls();
}

function mysteryBox() {
  const m = mystery();
  const diag = diagnosisFor(m.n);
  const ran = modeTrials().length > 0;
  const options = ["none", ...PARTS.filter((part) => HAS[m.cell][part])];
  const score = [...state.diagnoses.values()];
  let feedback = "";
  if (diag) {
    const answer = m.fault === "none" ? t("diagNothingAnswer") : partName(m.fault);
    const guess = diag.guess === "none" ? t("diagNothing") : partName(diag.guess);
    feedback = `<b>${esc(diag.correct ? t("diagRight", { part: answer }) : t("diagWrong", { guess, part: answer }))}</b> ${esc(clueText(m.fault, m.cell))}`;
  }
  return `<fieldset class="mystery-box"><legend>${esc(t("diagLegend"))}</legend>
    <p class="mystery-case">${esc(t("mysteryCase", { n: m.n, cell: cellWord(m.cell) }))}</p>
    <label class="diag-label" for="diag-select">${esc(t("diagPick"))}</label>
    <select id="diag-select" ${diag ? "disabled" : ""}>
      <option value=""></option>
      ${options.map((part) => `<option value="${part}" ${(diag ? diag.guess : state.diagGuess) === part ? "selected" : ""}>${esc(part === "none" ? t("diagNothing") : partName(part))}</option>`).join("")}
    </select>
    <div class="diag-actions">
      ${diag ? "" : `<button type="button" class="secondary-button" id="diag-check" ${ran && state.diagGuess ? "" : "disabled"}>${esc(t("diagCheck"))}</button>`}
      <button type="button" class="${diag ? "secondary-button" : "text-button"}" id="mystery-new">${esc(t("mysteryNew"))}</button>
    </div>
    ${!ran && !diag ? `<p class="hint small">${esc(t("diagNeedRun"))}</p>` : ""}
    <p class="diag-feedback ${diag ? (diag.correct ? "right" : "wrong") : ""}" id="diag-feedback" aria-live="polite">${feedback}</p>
    ${score.length ? `<p class="hint small">${esc(t("diagScore", { n: score.filter((d) => d.correct).length, total: score.length }))}</p>` : ""}
  </fieldset>`;
}

function clueText(fault, cell) {
  if (fault === "vacuole") return t(cell === "plant" ? "clueVacuolePlant" : "clueVacuoleAnimal");
  return t(`clue${cap(fault)}`);
}

function wireControls() {
  refs.modeChoices.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode)));
  refs.modeControls.querySelectorAll("[data-field]").forEach((button) => button.addEventListener("click", () => {
    if (state.playing) return;
    state.settings[button.dataset.field] = button.dataset.value;
    Object.assign(state.settings, normalize(state.settings));
    state.preview = true;
    state.chartSelection = [];
    const focusKey = `[data-field="${button.dataset.field}"][data-value="${button.dataset.value}"]`;
    renderControls();
    render();
    refs.modeControls.querySelector(focusKey)?.focus();
  }));
  $("#diag-select")?.addEventListener("change", (event) => {
    state.diagGuess = event.target.value;
    const check = $("#diag-check");
    if (check) check.disabled = !(state.diagGuess && modeTrials().length);
  });
  $("#diag-check")?.addEventListener("click", () => {
    const m = mystery();
    if (!state.diagGuess || diagnosisFor(m.n)) return;
    state.diagnoses.set(m.n, { guess: state.diagGuess, correct: state.diagGuess === m.fault, fault: m.fault, cell: m.cell });
    renderControls();
    render();
    $("#diag-feedback")?.focus?.();
  });
  $("#mystery-new")?.addEventListener("click", () => {
    if (state.playing) return;
    state.run = newMystery(state.run);
    state.diagGuess = ""; state.preview = true; state.chartSelection = [];
    renderControls();
    render();
    $("#mystery-new")?.focus();
  });
}

function setMode(mode) {
  if (state.playing || mode === state.mode) return;
  state.mode = mode;
  if (mode === "mystery" && !mystery()) state.run = newMystery(state.run);
  state.chartSelection = [];
  state.preview = !lastTrial();
  const url = new URL(location.href);
  url.searchParams.set("mode", mode);
  url.searchParams.set("seed", state.seed);
  history.replaceState({}, "", url);
  renderControls();
  render();
}

/* ---------- cell drawing ---------- */
const CX = 400, CY = 218;
const OFF_FILL = "#cdd2d4", OFF_STROKE = "#7d868b";
const PLANT = {
  wall: { x: 190, y: 55, w: 420, h: 320 },
  nucleus: [268, 135, 38],
  vacuole: [446, 226, 215, 185],
  mitochondria: [[230, 252, -70], [312, 346, 8], [572, 334, -18], [560, 96, 14]],
  chloroplasts: [[352, 86, -8], [456, 84, 6], [592, 180, 82], [592, 262, 94], [420, 352, 4], [508, 354, -6], [230, 330, -35]],
  vacuoles: [],
};
const ANIMAL = {
  nucleus: [398, 206, 46],
  mitochondria: [[266, 174, -30], [284, 284, 25], [522, 150, 20], [546, 266, -15], [420, 330, 5]],
  vacuoles: [[322, 230, 14], [482, 212, 12], [452, 104, 10]],
  chloroplasts: [],
};

function animalPath(scale = 1) {
  const pts = [];
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const r = 1 + 0.045 * Math.sin(3 * a + 0.6) + 0.03 * Math.cos(5 * a);
    pts.push([CX + Math.cos(a) * 218 * r * scale, CY + Math.sin(a) * 152 * r * scale]);
  }
  return `M${pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" L")} Z`;
}

/** Fixed spots for the little particles (ribosomes, sugar, waste, proteins), chosen once per cell type. */
const POOLS = {};
function pool(cell) {
  if (POOLS[cell]) return POOLS[cell];
  const rng = makeRng(cell === "plant" ? 2026 : 1913);
  const blockers = cell === "plant"
    ? [[...PLANT.nucleus.slice(0, 2), PLANT.nucleus[2] + 10], ...PLANT.mitochondria.map(([x, y]) => [x, y, 30]), ...PLANT.chloroplasts.map(([x, y]) => [x, y, 28])]
    : [[...ANIMAL.nucleus.slice(0, 2), ANIMAL.nucleus[2] + 10], ...ANIMAL.mitochondria.map(([x, y]) => [x, y, 30]), ...ANIMAL.vacuoles.map(([x, y, r]) => [x, y, r + 8])];
  const inside = (x, y) => {
    if (cell === "plant") {
      const [vx, vy, vw, vh] = PLANT.vacuole;
      const inVac = Math.abs(x - vx) < vw / 2 + 8 && Math.abs(y - vy) < vh / 2 + 8;
      return x > 222 && x < 578 && y > 88 && y < 342 && !inVac;
    }
    return ((x - CX) / 190) ** 2 + ((y - CY) / 126) ** 2 < 1;
  };
  const points = [];
  let tries = 0;
  while (points.length < 170 && tries++ < 20000) {
    const x = 200 + rng() * 400, y = 60 + rng() * 310;
    if (!inside(x, y)) continue;
    if (blockers.some(([bx, by, r]) => Math.hypot(x - bx, y - by) < r)) continue;
    if (points.some(([px, py]) => Math.hypot(x - px, y - py) < 11)) continue;
    points.push([Math.round(x), Math.round(y)]);
  }
  POOLS[cell] = points;
  return points;
}

const hexagon = (x, y, r) => `<path class="p-sugar" d="M${Array.from({ length: 6 }, (_, i) => { const a = Math.PI / 6 + (i * Math.PI) / 3; return `${(x + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`; }).join(" L")} Z"/>`;
const spark = (x, y, r) => `<path class="p-energy" d="M${x},${y - r} L${x + r * 0.3},${y - r * 0.3} L${x + r},${y} L${x + r * 0.3},${y + r * 0.3} L${x},${y + r} L${x - r * 0.3},${y + r * 0.3} L${x - r},${y} L${x - r * 0.3},${y - r * 0.3} Z"/>`;

function mitochondrion(x, y, rot, off) {
  return `<g transform="translate(${x} ${y}) rotate(${rot})" class="organelle ${off ? "off" : ""}">
    <ellipse rx="25" ry="12" fill="${off ? OFF_FILL : "#f2a65a"}" stroke="${off ? OFF_STROKE : "#b4622a"}" stroke-width="2.2" ${off ? 'stroke-dasharray="4 3"' : ""}/>
    <path d="M-18,0 q4,-8 8,0 t8,0 t8,0 t8,0" fill="none" stroke="${off ? OFF_STROKE : "#b4622a"}" stroke-width="1.8"/></g>`;
}
function chloroplast(x, y, rot, off) {
  return `<g transform="translate(${x} ${y}) rotate(${rot})" class="organelle ${off ? "off" : ""}">
    <ellipse rx="25" ry="13" fill="${off ? OFF_FILL : "#6db65b"}" stroke="${off ? OFF_STROKE : "#3c7a31"}" stroke-width="2.2" ${off ? 'stroke-dasharray="4 3"' : ""}/>
    ${[-10, 0, 10].map((dx) => `<rect x="${dx - 3}" y="-6" width="6" height="12" rx="2" fill="${off ? "#b6bcbf" : "#3f8c35"}"/>`).join("")}</g>`;
}

/** Draw the cell. view = { cell, light, shown (part drawn as off, or none), values (true gauge values), hour, death }. */
function drawScene(view) {
  const { cell, light, shown, values, hour, death } = view;
  const plant = cell === "plant";
  const off = (part) => shown === part;
  const dead = Boolean(death);
  const burst = death?.cause === "burst";
  const base = START[cell];
  const swell = plant ? (off("wall") ? 1 + Math.max(0, 95 - values.shape) / 280 : 1) : 1 + Math.max(0, base.shape - values.shape) / 260;
  let body = `<title id="scene-title">${esc(state.mode === "mystery" ? t("sceneHeadMystery", { n: mystery().n }) : t("sceneHeadExplore"))}</title><desc id="scene-desc">${esc(sceneDescription(view))}</desc>`;
  body += `<rect x="0" y="0" width="800" height="440" fill="${light === "on" ? "#f3f7ee" : "#dfe4ea"}"/>`;
  // Cell body.
  let cellSvg = "";
  const pts = pool(cell);
  if (plant) {
    const { x, y, w, h } = PLANT.wall;
    const inset = values.water < 55 && !off("wall") ? 9 + Math.min(26, (55 - values.water) * 0.8) : 9;
    cellSvg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="#e6eed2" stroke="${off("wall") ? OFF_STROKE : "#7d9b4a"}" stroke-width="${off("wall") ? 4 : 14}" ${off("wall") ? 'stroke-dasharray="6 6"' : ""} ${burst ? 'stroke-dasharray="40 18"' : ""}/>`;
    cellSvg += `<rect class="${off("cytoplasm") ? "cyto-off" : ""}" x="${x + inset}" y="${y + inset}" width="${w - 2 * inset}" height="${h - 2 * inset}" rx="16" fill="${off("cytoplasm") ? "#e6e2d6" : "#fbf3d5"}" stroke="${off("membrane") ? OFF_STROKE : "#c99a3b"}" stroke-width="3" ${off("membrane") || burst ? 'stroke-dasharray="7 6"' : ""}/>`;
    const [vx, vy, vw, vh] = PLANT.vacuole;
    const f = off("vacuole") ? 0.5 : Math.min(1.08, 0.45 + 0.55 * values.water / 88);
    cellSvg += `<rect class="organelle" x="${vx - (vw * f) / 2}" y="${vy - (vh * f) / 2}" width="${vw * f}" height="${vh * f}" rx="${40 * f}" fill="${off("vacuole") ? OFF_FILL : "#cfe7f6"}" stroke="${off("vacuole") ? OFF_STROKE : "#5f9fc6"}" stroke-width="2.5" ${off("vacuole") ? 'stroke-dasharray="5 4"' : ""}/>`;
    PLANT.chloroplasts.forEach(([cx, cy, rot]) => { cellSvg += chloroplast(cx, cy, rot, off("chloroplasts")); });
    PLANT.mitochondria.forEach(([mx, my, rot]) => { cellSvg += mitochondrion(mx, my, rot, off("mitochondria")); });
  } else {
    cellSvg += `<path d="${animalPath()}" fill="${off("cytoplasm") ? "#ece4dd" : "#fbe5d8"}" stroke="${off("membrane") ? OFF_STROKE : "#c0674a"}" stroke-width="4" ${off("membrane") || burst ? 'stroke-dasharray="9 7"' : ""}/>`;
    ANIMAL.vacuoles.forEach(([vx, vy, r]) => { cellSvg += `<circle class="organelle" cx="${vx}" cy="${vy}" r="${r}" fill="${off("vacuole") ? OFF_FILL : "#cfe7f6"}" stroke="${off("vacuole") ? OFF_STROKE : "#5f9fc6"}" stroke-width="2" ${off("vacuole") ? 'stroke-dasharray="4 3"' : ""}/>`; });
    ANIMAL.mitochondria.forEach(([mx, my, rot]) => { cellSvg += mitochondrion(mx, my, rot, off("mitochondria")); });
  }
  const [nx, ny, nr] = plant ? PLANT.nucleus : ANIMAL.nucleus;
  cellSvg += `<g class="organelle"><circle cx="${nx}" cy="${ny}" r="${nr}" fill="${off("nucleus") ? OFF_FILL : "#cdb9e6"}" stroke="${off("nucleus") ? OFF_STROKE : "#6d4e9c"}" stroke-width="2.5" ${off("nucleus") ? 'stroke-dasharray="5 4"' : ""}/>
    <circle cx="${nx + 8}" cy="${ny - 6}" r="${nr * 0.32}" fill="${off("nucleus") ? "#b6bcbf" : "#8b6bbd"}"/></g>`;
  // Ribosomes: fixed dots.
  pts.slice(140, 170).forEach(([x, y]) => { cellSvg += `<circle class="p-ribo ${off("ribosomes") ? "off" : ""}" cx="${x}" cy="${y}" r="2.8"/>`; });
  // Particles that track the gauges.
  const count = (value, max) => Math.round((Math.max(0, Math.min(100, value)) / 100) * max);
  pts.slice(0, count(values.sugar, 18)).forEach(([x, y]) => { cellSvg += hexagon(x, y, 4.2); });
  pts.slice(60, 60 + count(values.waste, 26)).forEach(([x, y]) => { cellSvg += `<rect class="p-waste" x="${x - 2.6}" y="${y - 2.6}" width="5.2" height="5.2" rx="1"/>`; });
  pts.slice(100, 100 + count(values.proteins, 14)).forEach(([x, y]) => { cellSvg += `<path class="p-protein" d="M${x - 6},${y} l3,-3 l3,3 l3,-3 l3,3"/>`; });
  const mitos = plant ? PLANT.mitochondria : ANIMAL.mitochondria;
  const perMito = count(values.energy, 3);
  mitos.forEach(([mx, my]) => { for (let i = 0; i < perMito; i++) { const a = i * 2.1 + mx * 0.01; cellSvg += spark(Math.round(mx + Math.cos(a) * 34), Math.round(my + Math.sin(a) * 22), 5); } });
  if (burst) {
    const spill = makeRng(77);
    for (let i = 0; i < 26; i++) { const a = spill() * Math.PI * 2, r = 1.02 + spill() * 0.22; cellSvg += `<circle class="p-spill" cx="${(CX + Math.cos(a) * 225 * r).toFixed(0)}" cy="${(CY + Math.sin(a) * 165 * r).toFixed(0)}" r="${2 + spill() * 3}"/>`; }
  }
  body += `<g class="cell ${dead ? "dead" : ""}" transform="translate(${CX} ${CY}) scale(${swell.toFixed(3)}) translate(${-CX} ${-CY})">${cellSvg}</g>`;
  body += labelsSvg(cell, shown, values);
  // Clock and light.
  body += `<g class="readout"><text x="20" y="30">${esc(t("clockHour", { h: hour }))}</text></g>`;
  body += light === "on"
    ? `<g class="sun" transform="translate(752 34)"><circle r="13" fill="#ffd23f" stroke="#c98a00" stroke-width="2"/>${Array.from({ length: 8 }, (_, i) => { const a = (i * Math.PI) / 4; return `<line x1="${(Math.cos(a) * 18).toFixed(1)}" y1="${(Math.sin(a) * 18).toFixed(1)}" x2="${(Math.cos(a) * 25).toFixed(1)}" y2="${(Math.sin(a) * 25).toFixed(1)}" stroke="#c98a00" stroke-width="2.5" stroke-linecap="round"/>`; }).join("")}</g><text class="sun-label" x="752" y="76" text-anchor="middle">${esc(t("sunOn"))}</text>`
    : `<g transform="translate(752 34)"><path d="M6,-14 A15,15 0 1 0 6,14 A11,11 0 1 1 6,-14 Z" fill="#8a96a8"/></g><text class="sun-label" x="752" y="76" text-anchor="middle">${esc(t("sunOff"))}</text>`;
  if (dead) body += `<g class="died"><rect x="250" y="392" width="300" height="32" rx="8"/><text x="400" y="413" text-anchor="middle">${esc(t("diedTag", { h: death.hour }))}${burst ? ` · ${esc(t("burstTag"))}` : ""}</text></g>`;
  refs.scene.innerHTML = body;
  // On narrow screens the scene scrolls sideways inside its box: start centered on the cell, once.
  const wrap = refs.scene.parentElement;
  if (!wrap.dataset.centered && wrap.scrollWidth > wrap.clientWidth + 1) { wrap.scrollLeft = (wrap.scrollWidth - wrap.clientWidth) / 2; wrap.dataset.centered = "1"; }
}

/** Labels with leader lines. Parts the cell does not have get no label. */
function labelsSvg(cell, shown, values) {
  const plant = cell === "plant";
  const inset = plant && values.water < 55 && shown !== "wall" ? 9 + Math.min(26, (55 - values.water) * 0.8) : 9;
  const target = plant ? [580, 300] : [520, 120];
  const ribo = pool(cell).slice(140, 170).reduce((best, p) => (Math.hypot(p[0] - target[0], p[1] - target[1]) < Math.hypot(best[0] - target[0], best[1] - target[1]) ? p : best));
  const items = plant ? [
    ["wall", "left", 78, [192, 84]], ["nucleus", "left", 140, [231, 136]], ["membrane", "left", 200, [190 + inset, 205]],
    ["mitochondria", "left", 262, [206, 252]], ["cytoplasm", "left", 322, [262, 300]],
    ["chloroplasts", "right", 150, [606, 182]], ["vacuole", "right", 226, [554, 226]], ["ribosomes", "right", 300, ribo],
  ] : [
    ["membrane", "left", 104, [214, 160]], ["nucleus", "left", 168, [352, 200]], ["mitochondria", "left", 238, [244, 180]],
    ["cytoplasm", "left", 312, [330, 300]], ["ribosomes", "right", 130, ribo], ["vacuole", "right", 214, [494, 212]],
  ];
  let out = "";
  for (const [part, side, y, [ax, ay]] of items) {
    const isOff = shown === part;
    const x = side === "left" ? 150 : 650;
    const label = t(`lbl${cap(part)}`) + (isOff ? ` · ${t("offTag")}` : "");
    out += `<line class="leader" x1="${side === "left" ? x + 4 : x - 4}" y1="${y - 4}" x2="${ax}" y2="${ay}"/><circle class="leader-dot" cx="${ax}" cy="${ay}" r="2.6"/>
      <text class="part-label ${isOff ? "off" : ""}" x="${x}" y="${y}" text-anchor="${side === "left" ? "end" : "start"}">${esc(label)}</text>`;
  }
  if (!plant) out += `<text class="absent-note" x="20" y="428">${esc(t("absentNote"))}</text>`;
  return out;
}

function sceneDescription(view) {
  const trial = lastTrial();
  if (!state.preview && trial && !state.playing) return t("sceneDescDone", { n: trial.index, sentence: plain(trialSentence(trial)) });
  const stateText = state.mode === "mystery" && view.shown === "none" && !diagnosisFor(mystery().n) ? t("descMystery") : view.shown === "none" ? t("descAllOn") : t("descOff", { part: partLower(view.shown) });
  return t("sceneDescIdle", { cell: cellWord(view.cell), state: stateText });
}

/** What part to draw as shut down: the chosen part (Explore) or, once diagnosed, the hidden fault (Mystery). */
function shownPart(trial) {
  if (state.mode === "explore") return trial ? trial.settings.shutdown : state.settings.shutdown;
  const m = mystery();
  return diagnosisFor(m.n) ? m.fault : "none";
}

function idleView() {
  const cell = currentCell();
  return { cell, light: state.settings.light, shown: shownPart(null), values: { ...START[cell] }, hour: 0, death: null };
}
function trialView(trial, sample) {
  const last = sample === trial.samples.at(-1);
  const death = last && trial.result.deathHour ? { hour: trial.result.deathHour, cause: trial.result.cause } : null;
  return { cell: trial.settings.cell, light: trial.settings.light, shown: shownPart(trial), values: sample.true, hour: sample.t, death, readings: sample.g };
}

/* ---------- gauges ---------- */
function renderGauges(readings, cell) {
  const base = START[cell];
  refs.gauges.innerHTML = GAUGES.map((gauge) => {
    const v = readings ? readings[gauge] : base[gauge];
    const low = gauge === "waste" ? v >= 40 : v <= base[gauge] - 25;
    return `<li class="gauge ${gauge} ${low ? "warn" : ""}"><span class="g-name">${esc(gaugeName(gauge))}</span>
      <span class="g-bar" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${v}" aria-label="${esc(t("gaugeAria", { name: gaugeName(gauge), v }))}"><span style="width:${v}%"></span><i style="left:${base[gauge]}%" aria-hidden="true"></i></span>
      <span class="g-val">${v}</span></li>`;
  }).join("");
}

/* ---------- playback ---------- */
const reducedMotion = () => motionPreference.matches;
const wait = animationWait;

async function runTrial() {
  if (state.playing) return;
  state.run = advanceTrial(state.run, { ...state.settings, mode: state.mode });
  const trial = state.run.history.at(-1);
  state.preview = false;
  state.chartSelection = [];
  const token = ++state.playToken;
  if (!reducedMotion()) {
    state.playing = true;
    render();
    for (const sample of trial.samples) {
      if (reducedMotion()) break;
      if (token !== state.playToken) return;
      const view = trialView(trial, sample);
      drawScene(view);
      renderGauges(sample.g, trial.settings.cell);
      // Event text set during playback is not overwritten by render(): render() skips the event card while playing.
      refs.eventCard.textContent = t("eventPlaying", { h: sample.t });
      await wait(sample.t === 0 ? 500 : 280);
    }
    if (token !== state.playToken) return;
    await wait(200);
  }
  if (token !== state.playToken) return;
  state.playing = false;
  renderControls();
  render();
  refs.eventCard.textContent = t("eventDone", { n: trial.index });
  refs.sceneLive.textContent = plain(trialSentence(trial));
}

/* ---------- words for a trial ---------- */
function trialSentence(trial) {
  const s = trial.settings, r = trial.result;
  const vars = { n: trial.index, cell: cellWord(s.cell), h: r.deathHour };
  let text = t({ healthy: "sHealthy", stressed: "sStressed", failing: "sFailing", died: "sDied" }[r.status], { ...vars, cause: r.cause ? t(`cause${cap(r.cause)}`) : "" });
  if (r.firstSign) text += t("sSign", { gauge: gaugeName(r.firstSign.gauge), dir: t(r.firstSign.direction === "up" ? "dirUp" : "dirDown"), h: r.firstSign.hour });
  if (s.mode === "explore" && s.shutdown !== "none" && !HAS[s.cell][s.shutdown]) text += t("sNoPart", { cell: cellWord(s.cell), part: t(`bare${cap(s.shutdown)}`) });
  if (s.cell === "plant" && s.light === "off") text += t("sDark");
  return text;
}

function renderStats(trial) {
  const stat = (label, value) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`;
  if (!trial) { refs.stats.innerHTML = stat(t("statStatus"), "—") + stat(t("statHour"), "—") + stat(t("statFirst"), "—"); return; }
  const r = trial.result;
  const sign = r.firstSign ? `${gaugeName(r.firstSign.gauge)} ${r.firstSign.direction === "up" ? "↑" : "↓"} · ${r.firstSign.hour} h` : t("statNone");
  refs.stats.innerHTML = stat(t("statStatus"), t(`status${cap(r.status)}`)) + stat(t("statHour"), String(r.deathHour ?? HOURS)) + stat(t("statFirst"), sign);
}

function renderClue(trial) {
  // In Explore mode, after a trial with a part shut down, show what that part does (its job explains the symptoms).
  if (!trial || state.mode !== "explore" || trial.settings.shutdown === "none" || !HAS[trial.settings.cell][trial.settings.shutdown]) { refs.clue.hidden = true; refs.clue.innerHTML = ""; return; }
  refs.clue.hidden = false;
  refs.clue.innerHTML = `<b>${renderRich(termToken(trial.settings.shutdown))}</b>: ${esc(clueText(trial.settings.shutdown, trial.settings.cell))}`;
}

/* ---------- gauge graph ---------- */
function renderChartGauges() {
  refs.chartGauges.innerHTML = GAUGES.map((gauge) => `<button type="button" class="choice ${gauge === state.chartGauge ? "active" : ""}" data-gauge="${gauge}" aria-pressed="${gauge === state.chartGauge}">${esc(gaugeName(gauge))}</button>`).join("");
  refs.chartGauges.querySelectorAll("[data-gauge]").forEach((button) => button.addEventListener("click", () => {
    state.chartGauge = button.dataset.gauge; state.chartSelection = [];
    renderChartGauges(); renderChart();
    refs.chartGauges.querySelector(`[data-gauge="${state.chartGauge}"]`)?.focus();
  }));
}

function renderChart() {
  const trials = modeTrials();
  const current = state.playing ? null : trials.at(-1) ?? null;
  const prev = current ? trials.at(-2) ?? null : null;
  const gauge = state.chartGauge;
  const series = [prev, current].filter(Boolean).map((trial) => ({ id: `T${trial.index}`, cls: trial === current ? "this" : "prev", name: t("nameThis", { n: trial.index }), pts: trial.samples.map((p) => ({ h: p.t, v: p.g[gauge] })) }));
  refs.chartKey.innerHTML = current ? `<span class="key-this">${esc(t("keyThis"))}</span>${prev ? `<span class="key-prev">${esc(t("keyPrev"))}</span>` : ""}` : "";
  const W = 600, H = 300, left = 52, right = 16, top = 16, bottom = 48, uw = W - left - right, uh = H - top - bottom;
  if (!current) {
    refs.chart.innerHTML = `<title id="chart-title">${esc(t("chartTitle"))}</title><desc id="chart-description">${esc(t("chartDescEmpty"))}</desc><text class="chart-empty" x="${W / 2}" y="${H / 2}" text-anchor="middle">${esc(t("chartEmpty"))}</text>`;
    refs.chartSelection.textContent = ""; refs.clearChartSelection.disabled = true;
    return;
  }
  const x = (h) => left + (h / HOURS) * uw, y = (v) => top + (1 - v / 100) * uh;
  const sel = state.chartSelection;
  const last = current.samples.at(-1);
  let body = `<title id="chart-title">${esc(t("chartTitle"))}</title><desc id="chart-description">${esc(t("chartDesc", { gauge: gaugeName(gauge), n: current.index, v0: current.samples[0].g[gauge], v1: last.g[gauge], h: last.t }))}</desc>
    <g class="grid">${[0, 20, 40, 60, 80, 100].map((v) => `<line x1="${left}" y1="${y(v)}" x2="${W - right}" y2="${y(v)}"/><text x="${left - 8}" y="${y(v) + 4}" text-anchor="end">${v}</text>`).join("")}</g>
    ${[0, 4, 8, 12, 16, 20, 24].map((h) => `<text x="${x(h)}" y="${top + uh + 16}" text-anchor="middle">${h}</text>`).join("")}
    <line class="healthy-line" x1="${left}" y1="${y(START[current.settings.cell][gauge])}" x2="${W - right}" y2="${y(START[current.settings.cell][gauge])}"/>
    <text class="axis-label" x="${left + uw / 2}" y="${H - 8}" text-anchor="middle">${esc(t("axisT"))}</text>
    <text class="axis-label" transform="translate(13 ${top + uh / 2}) rotate(-90)" text-anchor="middle">${esc(t("axisV"))}</text>`;
  body += `<g class="axes"><line x1="${left}" y1="${top + uh}" x2="${W - right}" y2="${top + uh}"/><line x1="${left}" y1="${top}" x2="${left}" y2="${top + uh}"/></g>`;
  const range = selectedRange(series);
  if (range) body += `<line class="slope-line" x1="${x(range.a.h)}" y1="${y(range.a.v)}" x2="${x(range.b.h)}" y2="${y(range.b.v)}"/>`;
  let first = true;
  for (const s of series) {
    body += `<polyline class="line ${s.cls}" points="${s.pts.map((p) => `${x(p.h)},${y(p.v)}`).join(" ")}"/>`;
    s.pts.forEach((p, i) => {
      const isSel = sel.some((q) => q.series === s.id && q.i === i);
      const label = t("pointLabel", { name: s.name, h: p.h, v: p.v });
      body += `<g class="chart-point ${s.cls} ${isSel ? "selected-point" : ""}" role="button" tabindex="${first && s.cls === "this" ? 0 : -1}" data-series="${s.id}" data-i="${i}" aria-label="${esc(label)}"><title>${esc(label)}</title><circle class="point-hit" cx="${x(p.h)}" cy="${y(p.v)}" r="7" fill="transparent"/><circle class="mark" cx="${x(p.h)}" cy="${y(p.v)}" r="3"/></g>`;
      if (s.cls === "this") first = false;
    });
  }
  refs.chart.innerHTML = body;
  refs.chart.querySelectorAll(".chart-point").forEach((point) => { point.addEventListener("click", () => selectPoint(point)); point.addEventListener("keydown", pointKeydown); });
  refs.clearChartSelection.disabled = sel.length === 0;
  if (!range) refs.chartSelection.textContent = sel.length ? t("selSecond") : t("selDefault");
  else {
    const rate = (range.b.v - range.a.v) / (range.b.h - range.a.h);
    refs.chartSelection.textContent = t("selResult", { name: `${range.name} · ${gaugeName(gauge)}`, v1: range.a.v, h1: range.a.h, v2: range.b.v, h2: range.b.h, r: minus((Math.round(rate * 10) / 10).toFixed(1)) });
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
    const s = trial.settings, r = trial.result, e = r.end;
    let shut = partName(s.shutdown === "hidden" ? "none" : s.shutdown);
    let result = r.status === "died" ? t("rDied", { h: r.deathHour }) : t(`r${cap(r.status)}`);
    if (trial.mysteryN) {
      const diag = diagnosisFor(trial.mysteryN);
      shut = t("rowMystery", { n: trial.mysteryN }) + (diag ? ` (${trial.hidden === "none" ? t("partNone") : partName(trial.hidden)})` : "");
      if (diag) result += t("rDiag", { guess: diag.guess === "none" ? t("partNone") : partName(diag.guess), mark: diag.correct ? "✓" : "✗" });
    }
    return `<tr>${cell(trial.index)}${cell(t(s.cell === "animal" ? "rowAnimal" : "rowPlant"))}${cell(t(s.light === "on" ? "rowLightOn" : "rowLightOff"))}${cell(shut)}${GAUGES.map((g) => cell(e[g])).join("")}${cell(result)}</tr>`;
  });
  refs.history.innerHTML = rows.length ? rows.join("") : `<tr><td colspan="11" class="empty">${esc(t("tableEmpty"))}</td></tr>`;
}

/* ---------- main render ---------- */
function lockControls() {
  if (!state.playing) return;
  document.querySelectorAll(".controls-panel button.choice, .controls-panel select, #diag-check, #mystery-new").forEach((node) => { node.disabled = true; });
}

function render() {
  const trial = lastTrial();
  refs.sceneHeading.textContent = state.mode === "mystery" ? t("sceneHeadMystery", { n: mystery().n }) : t("sceneHeadExplore");
  refs.sceneSub.textContent = t(state.mode === "mystery" ? "sceneSubMystery" : "sceneSubExplore");
  refs.seed.textContent = state.seed;
  refs.runLabel.textContent = state.playing ? t("runningBtn") : t("runBtn");
  refs.run.disabled = state.playing;
  lockControls();
  if (!state.playing) {
    if (state.preview || !trial) { const view = idleView(); drawScene(view); renderGauges(null, view.cell); }
    else { const sample = trial.samples.at(-1); drawScene(trialView(trial, sample)); renderGauges(sample.g, trial.settings.cell); }
    refs.eventCard.textContent = state.preview || !trial ? t("eventStart") : t("eventDone", { n: trial.index });
  }
  const shown = state.playing ? null : (state.preview ? null : trial);
  refs.outcome.innerHTML = shown ? renderRich(trialSentence(shown)) : renderRich(t("outcomeStart"));
  renderStats(shown);
  renderClue(shown);
  if (!state.playing) renderChart();
  renderTable();
  refs.reflection.innerHTML = renderRich(state.run.history.length ? reflectionText() : t("reflectStart"));
}

function reflectionText() {
  const prediction = state.prediction === "" ? t("reflectNone") : t("reflectYours", { text: t({ chloro: "reflectChloro", energy: "reflectEnergy", wilt: "reflectWilt", grow: "reflectGrow" }[state.prediction]) });
  return t("reflectBody", { prediction });
}

/* ---------- wiring ---------- */
function cancelPlayback() { state.playToken++; state.playing = false; }
function restart(seed) {
  cancelPlayback();
  state.chartSelection = []; state.preview = true; state.diagnoses = new Map(); state.diagGuess = "";
  state.seed = seed;
  state.run = createRun(seed);
  if (state.mode === "mystery") state.run = newMystery(state.run);
  const url = new URL(location.href);
  url.searchParams.set("seed", state.seed); url.searchParams.set("mode", state.mode);
  history.replaceState({}, "", url);
  renderControls();
  render();
}
refs.run.addEventListener("click", runTrial);
refs.prediction.addEventListener("change", () => { state.prediction = refs.prediction.value; render(); });
refs.reset.addEventListener("click", () => restart(state.seed));
refs.newSeed.addEventListener("click", () => restart(Math.floor(Math.random() * 2 ** 32) >>> 0));
refs.clearChartSelection.addEventListener("click", () => { state.chartSelection = []; renderChart(); });
$("#copy-seed-button").addEventListener("click", async () => { try { await navigator.clipboard.writeText(String(state.seed)); } catch { /* clipboard permission is optional */ } });
$("#simplifications-button").addEventListener("click", (event) => { const panel = $("#simplifications"); panel.hidden = !panel.hidden; event.currentTarget.setAttribute("aria-expanded", String(!panel.hidden)); });
onLangChange(() => { renderControls(); renderChartGauges(); if (state.playing) { refs.runLabel.textContent = t("runningBtn"); lockControls(); } else render(); });
initLab(content);
renderControls();
renderChartGauges();
render();

createGraphTools(document.getElementById('chart'), {legacy:true});
