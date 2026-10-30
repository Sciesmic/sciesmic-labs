import {motionPreference, animationWait} from '../kit/motion.js';
import {createGraphTools} from '../kit/graph-tools.js';
import { advanceTrial, createRun, newSortSet, checkSort, normalize, DEFAULTS, MASSES, TYPES, SUPERNOVA_MASS, colorOf, msLuminosity, msRadius, temperature, makeRng } from "./model.js";
import { initLab, onLangChange, renderRich, t, getLang } from "../kit/labs-kit.js";
import { content } from "./content.js";

const $ = (selector) => document.querySelector(selector);
const params = new URLSearchParams(location.search);

const state = {
  mode: params.get("mode") === "sorter" ? "sorter" : "life",
  settings: { ...DEFAULTS },
  seed: seedFromLocation(), run: null, prediction: "",
  playing: false, playToken: 0, preview: true, frame: null,
  chartPick: null, picks: {}, showRegions: false,
};
state.run = createRun(state.seed);
if (state.mode === "sorter") state.run = newSortSet(state.run);

const refs = {
  scene: $("#scene"), sceneLive: $("#scene-live"), sceneHeading: $("#scene-heading"), sceneSub: $("#scene-sub"), eventCard: $("#event-card"),
  track: $("#stage-track"), readouts: $("#readouts"), readoutsWrap: $("#readouts-wrap"),
  modeChoices: $("#mode-choices"), modeHint: $("#mode-hint"), modeControls: $("#mode-controls"),
  run: $("#run-button"), runLabel: $("#run-label"), reset: $("#reset-button"), newSeed: $("#new-seed-button"), seed: $("#seed-readout"), prediction: $("#prediction"),
  outcomeHeading: $("#outcome-heading"), outcomeEyebrow: $("#outcome-eyebrow"), outcome: $("#outcome-copy"), stats: $("#stat-row"), sortWrap: $("#sort-wrap"),
  chart: $("#chart"), chartKey: $("#chart-key"), chartSelection: $("#chart-selection"),
  lifeTable: $("#life-table"), sortTable: $("#sort-table"), history: $("#history-body"), sortHistory: $("#sort-history-body"), reflection: $("#reflection-prompt"),
};

function seedFromLocation() {
  const value = params.get("seed");
  return value && /^\d+$/.test(value) ? Number(value) >>> 0 : Math.floor(Math.random() * 2 ** 32) >>> 0;
}

/* ---------- words and numbers ---------- */
const esc = (text) => String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const cap = (word) => word.charAt(0).toUpperCase() + word.slice(1);
const plain = (text) => text.replace(/\[\[[a-z0-9-]+\|([^\]]+)\]\]/g, "$1");
const locale = () => (getLang() === "es" ? "es-MX" : "en-US");
const num = (value, digits = 0) => new Intl.NumberFormat(locale(), { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value);
/** Two significant figures, written out ("0.0040", "3,000", "110,000"). */
function sig(value) {
  if (!value) return "0";
  const rounded = Number(value.toPrecision(2));
  const decimals = Math.max(0, 1 - Math.floor(Math.log10(Math.abs(rounded))));
  return num(rounded, Math.min(decimals, 5));
}
function years(value) {
  if (value >= 1e9) return t("yrBillion", { v: num(value / 1e9, value >= 1e10 ? 1 : 2) });
  if (value >= 1e6) return t("yrMillion", { v: num(value / 1e6, value >= 1e8 ? 0 : 1) });
  if (value >= 1e3) return t("yrThousand", { v: num(Math.round(value / 1e3)) });
  return t("yrPlain", { v: num(Math.round(value)) });
}
const kelvin = (T) => t("kelvin", { v: num(Math.round(T / 100) * 100) });
const massLabel = (m) => t(m === 1 ? "massOne" : "massMany", { m: num(m, m < 1 ? 1 : 0) });
const massAdj = (m) => t(m === 1 ? "massAdjOne" : "massAdjMany", { m: num(m, m < 1 ? 1 : 0) });
const colorWord = (T) => t(`color${cap(colorOf(T))}`);
const stageName = (stage, mass) => {
  if (stage === "giant" && mass >= 2) return t("stageGiant");
  return t(`stage${cap(stage)}`);
};
const endName = (end) => t(`end${cap(end)}`);
const typeName = (type) => t(`type${cap(type)}`);
const TERM = { main: "main-sequence", giant: "red-giant", supergiant: "supergiant", supernova: "supernova", dwarf: "white-dwarf", whiteDwarf: "white-dwarf", neutronStar: "neutron-star", blackHole: "black-hole", protostar: "nebula" };
const lastTrial = () => state.run.history.at(-1) ?? null;
const sortSet = () => state.run.sort;

/** Blackbody-style color for a temperature (for drawing only). */
function starColor(T) {
  const stops = [[2500, [255, 120, 60]], [3500, [255, 165, 95]], [4500, [255, 205, 140]], [5800, [255, 240, 205]], [7500, [250, 248, 255]], [10000, [214, 226, 255]], [20000, [175, 198, 255]], [40000, [150, 178, 255]]];
  if (T <= stops[0][0]) return `rgb(${stops[0][1]})`;
  for (let i = 0; i < stops.length - 1; i++) {
    const [ta, ca] = stops[i], [tb, cb] = stops[i + 1];
    if (T <= tb) { const f = (Math.log(T) - Math.log(ta)) / (Math.log(tb) - Math.log(ta)); return `rgb(${ca.map((c, k) => Math.round(c + (cb[k] - c) * f)).join(",")})`; }
  }
  return `rgb(${stops.at(-1)[1]})`;
}

/* ---------- controls ---------- */
function segField(name, legend, options, value, cols, hint = "", disabled = false) {
  return `<fieldset><legend>${esc(legend)}</legend><div class="segmented-control ${cols}">${options.map(([key, label]) =>
    `<button type="button" class="choice ${String(key) === String(value) ? "active" : ""}" data-field="${name}" data-value="${key}" aria-pressed="${String(key) === String(value)}" ${disabled ? "disabled" : ""}>${esc(label)}</button>`).join("")}</div>
    ${hint ? `<p class="hint" id="${name}-hint">${renderRich(hint)}</p>` : ""}</fieldset>`;
}

function massHint(m) {
  if (m < 0.8) return t("massHintRed");
  if (m === 1) return t("massHintSun");
  return m > SUPERNOVA_MASS ? t("massHintBig") : t("massHintMid");
}

function renderControls() {
  refs.modeChoices.innerHTML = ["life", "sorter"].map((mode) =>
    `<button type="button" class="choice ${mode === state.mode ? "active" : ""}" data-mode="${mode}" aria-pressed="${mode === state.mode}">${esc(t(mode === "life" ? "modeLife" : "modeSorter"))}</button>`).join("");
  refs.modeHint.innerHTML = renderRich(t(state.mode === "life" ? "modeHintLife" : "modeHintSorter"));
  const s = state.settings;
  let html = "";
  if (state.mode === "life") {
    html += segField("mass", t("massLegend"), MASSES.map((m) => [m, massLabel(m)]), s.mass, "mass", massHint(s.mass));
    html += segField("speed", t("speedLegend"), [["normal", t("speedNormal")], ["slow", t("speedSlow")]], s.speed, "two", t("speedHint"));
  } else {
    html += segField("regions", t("regionsLegend"), [["off", t("regionsOff")], ["on", t("regionsOn")]], state.showRegions ? "on" : "off", "two", t("regionsHint"));
    const set = sortSet();
    const done = Boolean(set.checked);
    html += `<fieldset class="sorter-box"><legend>${esc(t("sortSetLegend", { n: set.n }))}</legend>
      <p class="hint">${esc(done ? t("sortDoneHint") : t("sortHint", { n: Object.keys(state.picks).length }))}</p>
      <div class="diag-actions"><button type="button" class="${done ? "secondary-button" : "text-button"}" id="sort-new">${esc(t("sortNew"))}</button></div>
      ${state.run.sortHistory.length ? `<p class="hint small">${esc(t("sortScoreAll", { sets: state.run.sortHistory.length, n: state.run.sortHistory.reduce((a, h) => a + h.score, 0), total: state.run.sortHistory.length * 12 }))}</p>` : ""}
    </fieldset>`;
  }
  refs.modeControls.innerHTML = html;
  wireControls();
}

function wireControls() {
  refs.modeChoices.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode)));
  refs.modeControls.querySelectorAll("[data-field]").forEach((button) => button.addEventListener("click", () => {
    if (state.playing) return;
    const { field, value } = button.dataset;
    if (field === "regions") state.showRegions = value === "on";
    else { state.settings[field] = value; Object.assign(state.settings, normalize(state.settings)); if (field === "mass") { state.preview = true; state.chartPick = null; } }
    renderControls();
    render();
    refs.modeControls.querySelector(`[data-field="${field}"][data-value="${value}"]`)?.focus();
  }));
  $("#sort-new")?.addEventListener("click", () => {
    if (state.playing) return;
    state.run = newSortSet(state.run);
    state.picks = {}; state.chartPick = null;
    renderControls(); render();
    $("#sort-new")?.focus();
  });
}

function setMode(mode) {
  if (state.playing || mode === state.mode) return;
  state.mode = mode;
  if (mode === "sorter" && !sortSet()) state.run = newSortSet(state.run);
  state.chartPick = null;
  state.preview = !lastTrial();
  const url = new URL(location.href);
  url.searchParams.set("mode", mode); url.searchParams.set("seed", state.seed);
  history.replaceState({}, "", url);
  renderControls();
  render();
}

/* ---------- the scene ---------- */
const W = 800, H = 440, CX = 400, CY = 205;
const starPx = (R) => Math.max(3, Math.min(150, 6 + 24 * (Math.log10(R) + 2)));
let skyCache = "";
function sky() {
  if (skyCache) return skyCache;
  const rng = makeRng(4242);
  let out = `<defs><radialGradient id="space" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#1b2a52"/><stop offset="1" stop-color="#070b1c"/></radialGradient>
    <radialGradient id="glow"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".55" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <radialGradient id="cloud"><stop offset="0" stop-color="#c77dba" stop-opacity=".55"/><stop offset="1" stop-color="#6a3d8c" stop-opacity="0"/></radialGradient>
    <radialGradient id="shell"><stop offset=".6" stop-color="#4fd1c5" stop-opacity="0"/><stop offset=".85" stop-color="#4fd1c5" stop-opacity=".55"/><stop offset="1" stop-color="#e86aa6" stop-opacity="0"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#space)"/>`;
  for (let i = 0; i < 90; i++) out += `<circle cx="${(rng() * W).toFixed(0)}" cy="${(rng() * H).toFixed(0)}" r="${(0.4 + rng() * 1.1).toFixed(1)}" fill="#fff" opacity="${(0.25 + rng() * 0.6).toFixed(2)}"/>`;
  skyCache = out;
  return out;
}

function starBody(x, y, R, T, extra = "") {
  const r = starPx(R), color = starColor(T);
  return `<g ${extra}><circle cx="${x}" cy="${y}" r="${(r * 1.7).toFixed(1)}" fill="${color}" opacity=".18"/><circle cx="${x}" cy="${y}" r="${(r * 1.25).toFixed(1)}" fill="${color}" opacity=".3"/>
    <circle cx="${x}" cy="${y}" r="${r.toFixed(1)}" fill="${color}"/><circle cx="${x - r * 0.25}" cy="${y - r * 0.25}" r="${(r * 0.55).toFixed(1)}" fill="url(#glow)" opacity=".7"/></g>`;
}

/** Draw one moment of a star's life. view = { sample, mass, progress (0–1 within protostar), done, trial }. */
function drawLife(view) {
  const { sample, mass } = view;
  let body = sky();
  const stage = sample ? sample.stage : "idle";
  if (stage === "idle" || stage === "protostar") {
    const fade = stage === "idle" ? 1 : 1 - (view.progress ?? 0) * 0.7;
    const rng = makeRng(99);
    for (let i = 0; i < 9; i++) body += `<ellipse cx="${CX + (rng() - 0.5) * 360}" cy="${CY + (rng() - 0.5) * 220}" rx="${120 + rng() * 120}" ry="${70 + rng() * 70}" fill="url(#cloud)" opacity="${(fade * (0.6 + rng() * 0.4)).toFixed(2)}"/>`;
    if (stage === "protostar") body += starBody(CX, CY, sample.R, sample.T);
    else body += `<circle cx="${CX}" cy="${CY}" r="7" fill="#ffb98a" opacity=".85"/><circle cx="${CX}" cy="${CY}" r="16" fill="#ffb98a" opacity=".2"/>`;
  } else if (stage === "nebulaShell") {
    const k = (view.shellStep ?? 1);
    const rr = 70 + k * 45;
    body += `<circle cx="${CX}" cy="${CY}" r="${rr}" fill="url(#shell)"/><circle cx="${CX}" cy="${CY}" r="${rr * 0.93}" fill="none" stroke="#7fe3d6" stroke-width="2" opacity=".55"/>`;
    body += starBody(CX, CY, Math.max(sample.R, 0.05), sample.T);
  } else if (stage === "dwarf") {
    body += `<circle cx="${CX}" cy="${CY}" r="200" fill="url(#shell)" opacity=".25"/>`;
    body += starBody(CX, CY, sample.R, sample.T);
  } else if (stage === "supernova") {
    const rays = Array.from({ length: 24 }, (_, i) => { const a = (i * Math.PI) / 12, r1 = i % 2 ? 170 : 120; return `${(CX + Math.cos(a) * r1).toFixed(0)},${(CY + Math.sin(a) * r1).toFixed(0)} ${(CX + Math.cos(a + 0.13) * 40).toFixed(0)},${(CY + Math.sin(a + 0.13) * 40).toFixed(0)}`; }).join(" ");
    body += `<circle cx="${CX}" cy="${CY}" r="190" fill="#ffd27a" opacity=".22"/><polygon points="${rays}" fill="#ffe8a8" opacity=".85"/><circle cx="${CX}" cy="${CY}" r="60" fill="#fffbe8"/>`;
  } else if (stage === "neutronStar") {
    body += `<circle cx="${CX}" cy="${CY}" r="210" fill="#e86aa6" opacity=".08"/><circle cx="${CX}" cy="${CY}" r="150" fill="none" stroke="#e86aa6" stroke-width="3" stroke-dasharray="10 14" opacity=".35"/>`;
    body += `<line x1="${CX - 120}" y1="${CY - 150}" x2="${CX + 120}" y2="${CY + 150}" stroke="#bcd3ff" stroke-width="5" opacity=".55" stroke-linecap="round"/>`;
    body += `<circle cx="${CX}" cy="${CY}" r="14" fill="#bcd3ff" opacity=".35"/><circle cx="${CX}" cy="${CY}" r="5" fill="#f2f6ff"/>`;
  } else if (stage === "blackHole") {
    body += `<circle cx="${CX}" cy="${CY}" r="210" fill="#e86aa6" opacity=".08"/><circle cx="${CX}" cy="${CY}" r="150" fill="none" stroke="#e86aa6" stroke-width="3" stroke-dasharray="10 14" opacity=".35"/>`;
    body += `<ellipse cx="${CX}" cy="${CY}" rx="70" ry="16" fill="none" stroke="#ff9b4a" stroke-width="5" opacity=".75"/><circle cx="${CX}" cy="${CY}" r="30" fill="#000" stroke="#ffcf8a" stroke-width="1.5"/>`;
    body += `<path d="M${CX - 70},${CY} A70,16 0 0 0 ${CX + 70},${CY}" fill="none" stroke="#ff9b4a" stroke-width="5" opacity=".9"/>`;
  } else {
    body += starBody(CX, CY, sample.R, sample.T);
  }
  // Sun-size reference circle.
  const sunR = starPx(1);
  body += `<g class="sun-ref"><circle cx="70" cy="${H - 70}" r="${sunR}" fill="none" stroke="#ffe08a" stroke-width="1.5" stroke-dasharray="4 4"/><text x="16" y="${H - 70 + sunR + 16}" text-anchor="start">${esc(t("sunRef"))}</text></g>`;
  // Readouts.
  body += `<g class="readout"><text x="20" y="32">${esc(sample ? t("ageTag", { age: years(sample.age) }) : t("ageTagStart"))}</text>`;
  body += `<text x="${W - 20}" y="32" text-anchor="end">${esc(sample ? stageName(stage, mass) : t("stageIdle"))}</text></g>`;
  const note = sample ? stageNote(stage) : "";
  if (note) body += `<text class="scene-note" x="${CX}" y="${H - 22}" text-anchor="middle">${esc(note)}</text>`;
  if (view.cap) body += `<g class="cap-tag"><rect x="210" y="${H - 66}" width="380" height="30" rx="8"/><text x="${CX}" y="${H - 46}" text-anchor="middle">${esc(t("capTag"))}</text></g>`;
  refs.scene.innerHTML = `<title id="scene-title">${esc(t("sceneHeadLife", { m: massLabel(mass) }))}</title><desc id="scene-desc">${esc(sceneDescription(view))}</desc>${body}`;
  centerScroll();
}

function stageNote(stage) {
  return { neutronStar: t("noteNeutron"), blackHole: t("noteHole"), dwarf: t("noteDwarf"), supernova: t("noteSupernova"), nebulaShell: t("noteShell") }[stage] ?? "";
}

function drawSorter() {
  const set = sortSet();
  let body = sky();
  set.stars.forEach((star, i) => {
    const col = i % 6, row = Math.floor(i / 6);
    const x = 80 + col * 128, y = 130 + row * 190;
    const r = Math.max(3, Math.min(48, 6 + 8 * (Math.log10(star.R) + 2)));
    const color = starColor(star.T);
    const picked = state.chartPick?.series === "sort" && state.chartPick.i === i;
    body += `<g class="sorter-star"><circle cx="${x}" cy="${y}" r="${(r * 1.6).toFixed(1)}" fill="${color}" opacity=".18"/><circle cx="${x}" cy="${y}" r="${r.toFixed(1)}" fill="${color}"/>
      ${picked ? `<circle cx="${x}" cy="${y}" r="${(r + 8).toFixed(1)}" fill="none" stroke="#ffcf5a" stroke-width="2.5"/>` : ""}
      <text x="${x}" y="${y + 70}" text-anchor="middle">${esc(t("starN", { n: star.id }))}</text></g>`;
  });
  body += `<text class="scene-note" x="${CX}" y="${H - 16}" text-anchor="middle">${esc(t("sorterSceneNote"))}</text>`;
  refs.scene.innerHTML = `<title id="scene-title">${esc(t("sceneHeadSorter", { n: set.n }))}</title><desc id="scene-desc">${esc(t("sorterDesc", { list: set.stars.map((s) => t("sorterDescItem", { n: s.id, color: colorWord(s.T) })).join("; ") }))}</desc>${body}`;
  centerScroll();
}

function centerScroll() {
  const wrap = refs.scene.parentElement;
  if (!wrap.dataset.centered && wrap.scrollWidth > wrap.clientWidth + 1) { wrap.scrollLeft = (wrap.scrollWidth - wrap.clientWidth) / 2; wrap.dataset.centered = "1"; }
}

function sceneDescription(view) {
  if (!view.sample) return t("descIdle", { m: massLabel(view.mass) });
  const s = view.sample;
  if (s.stage === "neutronStar") return t("descNeutron", { age: years(s.age) });
  if (s.L <= 0) return t("descRemnant", { age: years(s.age), stage: stageName(s.stage, view.mass) });
  return t("descStar", { age: years(s.age), stage: stageName(s.stage, view.mass), color: colorWord(s.T), T: kelvin(s.T), L: sig(s.L), R: sig(s.R) });
}

/* ---------- stage track and readouts ---------- */
function stagesFor(trial) {
  if (!trial) return ["protostar", "main", "?", "?", "?"];
  const seen = [];
  for (const s of trial.samples) if (!seen.includes(s.stage)) seen.push(s.stage);
  return seen;
}
function renderTrack(trial, current) {
  const stages = stagesFor(trial);
  const reached = trial ? stages.indexOf(current) : (current === "protostar" ? 0 : -1);
  refs.track.innerHTML = stages.map((stage, i) => {
    const label = stage === "?" ? "?" : stageName(stage, trial?.settings.mass ?? state.settings.mass);
    const cls = i < reached ? "done" : i === reached ? "now" : "";
    const tokened = stage !== "?" && TERM[stage] && stage !== "protostar" ? renderRich(`[[${TERM[stage]}|${label}]]`) : esc(label);
    return `<li class="${cls}" ${i === reached ? 'aria-current="step"' : ""}>${tokened}</li>`;
  }).join("");
}

const FUSION = { protostar: "fuseNone", main: "fuseMain", giant: "fuseGiant", supergiant: "fuseSuper", nebulaShell: "fuseShell", dwarf: "fuseDwarf", supernova: "fuseSupernova", neutronStar: "fuseRemnant", blackHole: "fuseRemnant" };
function renderReadouts(sample, mass) {
  const row = (label, value, cls = "") => `<div class="${cls}"><dt>${esc(label)}</dt><dd>${value}</dd></div>`;
  if (state.mode === "sorter") { refs.readoutsWrap.hidden = true; return; }
  refs.readoutsWrap.hidden = false;
  if (!sample) {
    refs.readouts.innerHTML = row(t("rdAge"), "0") + row(t("rdStage"), esc(t("stageIdle"))) + row(t("rdTemp"), "—") + row(t("rdColor"), "—") + row(t("rdBright"), "—") + row(t("rdSize"), "—") + row(t("rdFusion"), esc(t("fuseNone")), "wide");
    return;
  }
  const lit = sample.L > 0;
  const swatch = lit ? `<span class="swatch" style="background:${starColor(sample.T)}"></span>` : "";
  refs.readouts.innerHTML = row(t("rdAge"), esc(years(sample.age))) + row(t("rdStage"), esc(stageName(sample.stage, mass)))
    + row(t("rdTemp"), lit ? esc(sample.stage === "supernova" ? "—" : kelvin(sample.T)) : "—") + row(t("rdColor"), lit && sample.stage !== "supernova" ? `${swatch}${esc(colorWord(sample.T))}` : "—")
    + row(t("rdBright"), lit ? esc(sample.stage === "supernova" ? t("brightBillions") : t("timesSun", { v: sig(sample.L) })) : esc(t(sample.stage === "neutronStar" ? "thermalOutside" : "brightNone")))
    + row(t("rdSize"), lit && sample.stage !== "supernova" ? esc(t("timesSun", { v: sig(sample.R) })) : esc(sample.stage === "neutronStar" ? t("sizeCity") : sample.stage === "blackHole" ? t("sizeHole") : "—"))
    + row(t("rdFusion"), esc(t(FUSION[sample.stage])), "wide");
}

/* ---------- playback ---------- */
const reducedMotion = () => motionPreference.matches;
const wait = animationWait;

function lifeView(trial, index) {
  const sample = trial.samples[index];
  const pre = trial.samples.filter((s) => s.stage === "protostar");
  const shells = trial.samples.filter((s) => s.stage === "nebulaShell");
  return {
    sample, mass: trial.settings.mass,
    progress: sample.stage === "protostar" ? pre.indexOf(sample) / Math.max(1, pre.length - 1) : 1,
    shellStep: sample.stage === "nebulaShell" ? shells.indexOf(sample) + 1 : 3,
    cap: trial.result.ageLimited && index === trial.samples.length - 1,
  };
}

async function runTrial() {
  if (state.playing) return;
  if (state.mode === "sorter") { checkMySort(); return; }
  state.run = advanceTrial(state.run, { ...state.settings });
  const trial = lastTrial();
  state.preview = false; state.chartPick = null;
  const token = ++state.playToken;
  if (!reducedMotion()) {
    state.playing = true;
    render();
    const delay = state.settings.speed === "slow" ? 950 : 380;
    for (let i = 0; i < trial.samples.length; i++) {
      if (reducedMotion()) break;
      if (token !== state.playToken) return;
      state.frame = i;
      const view = lifeView(trial, i);
      drawLife(view);
      renderReadouts(view.sample, trial.settings.mass);
      renderTrack(trial, view.sample.stage);
      renderChart();
      // Event text set during playback is not overwritten by render(): render() skips the event card while playing.
      refs.eventCard.textContent = t("eventPlaying", { stage: stageName(view.sample.stage, trial.settings.mass), age: years(view.sample.age) });
      await wait(i === 0 ? 600 : delay);
    }
    if (token !== state.playToken) return;
    await wait(250);
  }
  if (token !== state.playToken) return;
  state.playing = false; state.frame = null;
  renderControls();
  render();
  refs.eventCard.textContent = t("eventDone", { n: trial.index });
  refs.sceneLive.textContent = plain(trialSentence(trial));
}

/* ---------- words for a trial ---------- */
function trialSentence(trial) {
  const r = trial.result, m = massAdj(trial.settings.mass);
  const vars = { n: trial.index, m, ms: years(r.msLife ?? 0), total: years(r.totalLife ?? 0), size: sig(r.giantMaxR ?? r.maxRadius), est: years(r.msLifeEstimate) };
  let text = t({ alive: "sAlive", whiteDwarf: "sDwarf", neutronStar: "sNeutron", blackHole: "sHole" }[r.endState], vars);
  const all = state.run.history;
  const prev = all[all.indexOf(trial) - 1];
  if (prev && prev.settings.mass !== trial.settings.mass && r.msLife && prev.result.msLife) {
    const ratio = prev.result.msLife / r.msLife;
    text += " " + t(ratio > 1 ? "sCompareShorter" : "sCompareLonger", { p: prev.index, pm: massLabel(prev.settings.mass), x: ratio > 1 ? sig(ratio) : sig(1 / ratio) });
  }
  if (trial.settings.mass === 25 && r.endState === "neutronStar") text += " " + t("sRareNeutron");
  return text;
}

function renderStats(trial) {
  const stat = (label, value) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`;
  if (!trial) { refs.stats.innerHTML = stat(t("statMs"), "—") + stat(t("statTotal"), "—") + stat(t("statEnd"), "—"); return; }
  const r = trial.result;
  refs.stats.innerHTML = stat(t("statMs"), r.msLife ? years(r.msLife) : t("statStillGoing")) + stat(t("statTotal"), r.totalLife ? years(r.totalLife) : t("statStillGoing")) + stat(t("statEnd"), endName(r.endState));
}

/* ---------- Star Sorter ---------- */
function renderSorter() {
  const set = sortSet();
  const checked = set.checked;
  const rowFor = (star, i) => {
    const res = checked?.rows.find((r) => r.id === star.id);
    const pick = state.picks[star.id] ?? "";
    const sel = `<select id="pick-${star.id}" data-star="${star.id}" aria-label="${esc(t("pickAria", { n: star.id }))}" ${checked ? "disabled" : ""}>
      <option value="">${esc(t("pickBlank"))}</option>${TYPES.map((type) => `<option value="${type}" ${pick === type ? "selected" : ""}>${esc(typeName(type))}</option>`).join("")}</select>`;
    const mark = res ? `<span class="mark ${res.right ? "right" : "wrong"}">${res.right ? "✓" : "✗"}</span>` : "";
    const why = res ? `<tr class="why ${res.right ? "right" : "wrong"}"><td colspan="5">${esc(res.right ? t("sortRight", { type: typeName(star.type) }) : t("sortWrong", { type: typeName(star.type) }))} ${esc(t(`why${cap(star.type)}`))}</td></tr>` : "";
    const active = state.chartPick?.series === "sort" && state.chartPick.i === i;
    return `<tr class="${active ? "active" : ""}"><th scope="row">${star.id}</th><td>${esc(num(star.T))}</td><td>${esc(sig(star.L))}</td><td><span class="swatch" style="background:${starColor(star.T)}"></span>${esc(colorWord(star.T))}</td><td>${sel} ${mark}</td></tr>${why}`;
  };
  refs.sortWrap.innerHTML = `<div class="table-wrap sort-table-wrap" tabindex="0" aria-label="${esc(t("sortTableLabel"))}"><table class="sort-table"><thead><tr><th>${esc(t("sThStar"))}</th><th>${esc(t("sThTemp"))}</th><th>${esc(t("sThBright"))}</th><th>${esc(t("sThColor"))}</th><th>${esc(t("sThType"))}</th></tr></thead>
    <tbody>${set.stars.map(rowFor).join("")}</tbody></table></div>`;
  refs.sortWrap.querySelectorAll("select[data-star]").forEach((select) => select.addEventListener("change", () => {
    if (select.value) state.picks[select.dataset.star] = select.value; else delete state.picks[select.dataset.star];
    const hint = refs.modeControls.querySelector(".sorter-box .hint");
    if (hint) hint.textContent = t("sortHint", { n: Object.keys(state.picks).length });
    refs.run.disabled = Object.keys(state.picks).length < 12;
  }));
}

function checkMySort() {
  const set = sortSet();
  if (set.checked || Object.keys(state.picks).length < 12) return;
  state.run = checkSort(state.run, state.picks);
  renderControls();
  render();
  refs.sceneLive.textContent = t("sortScore", { n: sortSet().checked.score });
  refs.outcome.focus?.();
}

/* ---------- H-R diagram ---------- */
const CH = { W: 600, H: 400, left: 62, right: 14, top: 14, bottom: 56 };
const T_MAX = 50000, T_MIN = 2000, L_MIN = 1e-4, L_MAX = 1e6;
const cx = (T) => CH.left + (Math.log(T_MAX / Math.min(T_MAX, Math.max(T_MIN, T))) / Math.log(T_MAX / T_MIN)) * (CH.W - CH.left - CH.right);
const cy = (L) => CH.top + (1 - (Math.log10(Math.min(L_MAX, Math.max(L_MIN, L))) - Math.log10(L_MIN)) / (Math.log10(L_MAX) - Math.log10(L_MIN))) * (CH.H - CH.top - CH.bottom);
const offChart = (p) => p.T > T_MAX || p.T < T_MIN || p.L > L_MAX || p.L < L_MIN;

function regionsSvg(show) {
  // Main-sequence band from the model's own mass–brightness relation.
  const ms = [];
  for (let m = 0.2; m <= 40; m *= 1.15) { const L = msLuminosity(m), T = temperature(L, msRadius(m)); ms.push([cx(T), cy(L)]); }
  const up = ms.map(([x, y]) => `${x.toFixed(1)},${(y - 18).toFixed(1)}`), down = ms.map(([x, y]) => `${x.toFixed(1)},${(y + 18).toFixed(1)}`).reverse();
  let out = `<polygon class="ms-band ${show ? "" : "faint"}" points="${[...up, ...down].join(" ")}"/>`;
  if (!show) return out;
  out += `<ellipse class="region giant" cx="${cx(4300)}" cy="${cy(250)}" rx="62" ry="34"/><ellipse class="region super" cx="${cx(8000)}" cy="${cy(1.2e5)}" rx="190" ry="24"/><ellipse class="region dwarf" cx="${cx(15000)}" cy="${cy(1.5e-3)}" rx="70" ry="30"/>`;
  out += `<text class="region-label" x="${cx(26000)}" y="${cy(400)}" transform="rotate(32 ${cx(26000)} ${cy(400)})">${esc(t("regMain"))}</text>`;
  out += `<text class="region-label" x="${cx(4300)}" y="${cy(250) + 4}" text-anchor="middle">${esc(t("regGiant"))}</text>`;
  out += `<text class="region-label" x="${cx(8000)}" y="${cy(1.2e5) + 4}" text-anchor="middle">${esc(t("regSuper"))}</text>`;
  out += `<text class="region-label" x="${cx(15000)}" y="${cy(1.5e-3) + 4}" text-anchor="middle">${esc(t("regDwarf"))}</text>`;
  return out;
}

function chartSeries() {
  if (state.mode === "sorter") {
    return [{ id: "sort", cls: "sort", pts: sortSet().stars.map((s) => ({ ...s, label: t("starN", { n: s.id }), num: s.id })) }];
  }
  const trials = state.run.history;
  const current = state.playing ? trials.at(-1) : state.preview ? null : trials.at(-1);
  const idx = current ? trials.indexOf(current) : -1;
  const prev = idx > 0 ? trials[idx - 1] : null;
  const upto = state.playing && state.frame !== null ? state.frame + 1 : Infinity;
  const toPts = (trial, limit = Infinity) => trial.samples.slice(0, limit).filter((s) => s.L > 0).map((s) => ({ ...s, label: t("ptLabel", { n: trial.index, age: years(s.age), stage: stageName(s.stage, trial.settings.mass) }) }));
  return [prev ? { id: `T${prev.index}`, cls: "prev", trial: prev, pts: toPts(prev) } : null, current ? { id: `T${current.index}`, cls: "this", trial: current, pts: toPts(current, upto) } : null].filter(Boolean);
}

function renderChart() {
  const series = chartSeries();
  const { W: CW, H: CHt, left, right, top, bottom } = CH;
  const showRegions = state.mode === "life" || state.showRegions;
  let body = `<title id="chart-title">${esc(t("chartTitle"))}</title><desc id="chart-description">${esc(chartDescription(series))}</desc>`;
  // Color strip under the temperature axis.
  const strip = [40000, 20000, 10000, 7000, 5800, 4500, 3500, 2500].map((T) => `<stop offset="${((cx(T) - left) / (CW - left - right)).toFixed(3)}" stop-color="${starColor(T)}"/>`).join("");
  body += `<defs><linearGradient id="tstrip">${strip}</linearGradient></defs>`;
  body += `<rect class="plot-bg" x="${left}" y="${top}" width="${CW - left - right}" height="${CHt - top - bottom}"/>`;
  body += `<g class="grid">${[-4, -2, 0, 2, 4, 6].map((e) => `<line x1="${left}" y1="${cy(10 ** e)}" x2="${CW - right}" y2="${cy(10 ** e)}"/><text x="${left - 6}" y="${cy(10 ** e) + 4}" text-anchor="end">${esc(sig(10 ** e))}</text>`).join("")}</g>`;
  body += `<g class="grid">${[40000, 20000, 10000, 5000, 3000].map((T) => `<line x1="${cx(T)}" y1="${top}" x2="${cx(T)}" y2="${CHt - bottom}"/><text x="${cx(T)}" y="${CHt - bottom + 26}" text-anchor="middle">${esc(num(T))}</text>`).join("")}</g>`;
  body += `<rect x="${left}" y="${CHt - bottom + 3}" width="${CW - left - right}" height="7" rx="2" fill="url(#tstrip)"/>`;
  body += regionsSvg(showRegions);
  // Sun reference.
  body += `<g class="sun-mark"><circle cx="${cx(5778)}" cy="${cy(1)}" r="6"/><circle cx="${cx(5778)}" cy="${cy(1)}" r="1.8" class="dot"/><text x="${cx(5778) + 9}" y="${cy(1) - 7}">${esc(t("sunWord"))}</text></g>`;
  body += `<g class="axes"><line x1="${left}" y1="${CHt - bottom}" x2="${CW - right}" y2="${CHt - bottom}"/><line x1="${left}" y1="${top}" x2="${left}" y2="${CHt - bottom}"/></g>`;
  body += `<text class="axis-label" x="${left + (CW - left - right) / 2}" y="${CHt - 6}" text-anchor="middle">${esc(t("axisT"))}</text>`;
  body += `<text class="axis-label" transform="translate(13 ${top + (CHt - top - bottom) / 2}) rotate(-90)" text-anchor="middle">${esc(t("axisL"))}</text>`;
  if (!series.length) body += `<text class="chart-empty" x="${left + (CW - left - right) / 2}" y="${top + 40}" text-anchor="middle">${esc(t("chartEmpty"))}</text>`;
  let first = true;
  for (const s of series) {
    if (s.cls !== "sort") body += `<polyline class="track ${s.cls}" points="${s.pts.map((p) => `${cx(p.T).toFixed(1)},${cy(p.L).toFixed(1)}`).join(" ")}"/>`;
    s.pts.forEach((p, i) => {
      const picked = state.chartPick?.series === s.id && state.chartPick.i === i;
      const x = cx(p.T), y = cy(p.L), off = offChart(p);
      const latest = s.cls === "this" && i === s.pts.length - 1;
      const r = s.cls === "sort" ? 7 : latest ? 6 : 3.6;
      body += `<g class="chart-point ${s.cls} ${picked ? "selected-point" : ""} ${latest ? "latest" : ""}" role="button" tabindex="${first && s.cls !== "prev" ? 0 : -1}" data-series="${s.id}" data-i="${i}" aria-label="${esc(pointText(s, p))}"><title>${esc(pointText(s, p))}</title>
        <circle class="point-hit" cx="${x}" cy="${y}" r="10" fill="transparent"/><circle class="mark" cx="${x}" cy="${y}" r="${r}" ${s.cls !== "prev" ? `fill="${starColor(p.T)}"` : ""}/>
        ${off ? `<text class="off-arrow" x="${x + (p.T > T_MAX ? -9 : 0)}" y="${y + (p.L > L_MAX ? -8 : 4)}" text-anchor="middle">${p.L > L_MAX ? "▲" : p.T > T_MAX ? "◀" : ""}</text>` : ""}
        ${s.cls === "sort" ? `<text class="pt-num" x="${x}" y="${y + 3.5}" text-anchor="middle">${p.num}</text>` : ""}</g>`;
      if (s.cls !== "prev") first = false;
    });
  }
  refs.chart.innerHTML = body;
  refs.chart.querySelectorAll(".chart-point").forEach((point) => { point.addEventListener("click", () => pickPoint(point)); point.addEventListener("keydown", pointKeydown); });
  refs.chartKey.innerHTML = state.mode === "sorter" ? `<span>${esc(t("keySorter"))}</span>` : series.length ? `<span class="key-this">${esc(t("keyThis"))}</span>${series.some((s) => s.cls === "prev") ? `<span class="key-prev">${esc(t("keyPrev"))}</span>` : ""}<span class="key-sun">${esc(t("keySun"))}</span>` : "";
  const pick = state.chartPick && series.find((s) => s.id === state.chartPick.series)?.pts[state.chartPick.i];
  refs.chartSelection.textContent = pick ? pointText(series.find((s) => s.id === state.chartPick.series), pick) : t(state.mode === "sorter" ? "selSorter" : "selDefault");
}

function pointText(s, p) {
  const off = offChart(p) ? ` ${t("offChart")}` : "";
  if (s.cls === "sort") return t("ptSorter", { label: p.label, T: kelvin(p.T), L: sig(p.L), color: colorWord(p.T) }) + off;
  const L = p.stage === "supernova" ? t("brightBillions") : t("timesSun", { v: sig(p.L) });
  return t("ptLife", { label: p.label, T: p.stage === "supernova" ? "—" : kelvin(p.T), L }) + off;
}

function chartDescription(series) {
  if (!series.length) return t("chartDescEmpty");
  if (state.mode === "sorter") return t("chartDescSorter");
  const s = series.find((x) => x.cls === "this");
  if (!s || !s.pts.length) return t("chartDescEmpty");
  const a = s.pts[0], b = s.pts.at(-1);
  return t("chartDesc", { n: s.trial.index, m: massLabel(s.trial.settings.mass), T0: kelvin(a.T), L0: sig(a.L), T1: kelvin(b.T), L1: sig(b.L), stage: stageName(b.stage, s.trial.settings.mass) });
}

function pickPoint(element) {
  const pick = { series: element.dataset.series, i: Number(element.dataset.i) };
  state.chartPick = state.chartPick && state.chartPick.series === pick.series && state.chartPick.i === pick.i ? null : pick;
  renderChart();
  if (state.mode === "sorter") { drawSorter(); renderSorter(); }
  refs.chart.querySelector(`.chart-point[data-series="${pick.series}"][data-i="${pick.i}"]`)?.focus();
}

function pointKeydown(event) {
  const point = event.currentTarget;
  if (event.key === "Enter" || event.key === " ") { event.preventDefault(); pickPoint(point); return; }
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

/* ---------- records ---------- */
function renderTables() {
  const cell = (value) => `<td>${esc(value)}</td>`;
  refs.lifeTable.hidden = state.mode !== "life";
  refs.sortTable.hidden = state.mode !== "sorter";
  const rows = state.run.history.map((trial) => {
    const r = trial.result;
    return `<tr>${cell(trial.index)}${cell(massLabel(trial.settings.mass))}${cell(num(r.actualMass, 2))}${cell(colorWord(r.msT))}${cell(r.msLife ? years(r.msLife) : t("rowStill", { est: years(r.msLifeEstimate) }))}${cell(r.totalLife ? years(r.totalLife) : "—")}${cell(t("timesSun", { v: sig(r.giantMaxR ?? r.maxRadius) }))}${cell(endName(r.endState))}</tr>`;
  });
  refs.history.innerHTML = rows.length ? rows.join("") : `<tr><td colspan="8" class="empty">${esc(t("tableEmpty"))}</td></tr>`;
  const srows = state.run.sortHistory.map((h) => `<tr>${cell(h.n)}${cell(t("sortOf12", { n: h.score }))}${cell(h.misses.length ? h.misses.map((id) => t("starN", { n: id })).join(", ") : t("sortNoMiss"))}</tr>`);
  refs.sortHistory.innerHTML = srows.length ? srows.join("") : `<tr><td colspan="3" class="empty">${esc(t("sortTableEmpty"))}</td></tr>`;
}

/* ---------- main render ---------- */
function lockControls() {
  if (!state.playing) return;
  document.querySelectorAll(".controls-panel button.choice, #sort-new").forEach((node) => { node.disabled = true; });
}

function render() {
  const trial = lastTrial();
  const sorter = state.mode === "sorter";
  document.body.classList.toggle("sorter-mode", sorter);
  refs.sceneHeading.textContent = sorter ? t("sceneHeadSorter", { n: sortSet().n }) : t("sceneHeadLife", { m: massLabel(state.playing ? trial.settings.mass : state.preview || !trial ? state.settings.mass : trial.settings.mass) });
  refs.sceneSub.textContent = t(sorter ? "sceneSubSorter" : "sceneSubLife");
  refs.seed.textContent = state.seed;
  refs.runLabel.textContent = sorter ? t(sortSet().checked ? "sortCheckedBtn" : "sortCheckBtn") : state.playing ? t("runningBtn") : t("runBtn");
  refs.run.disabled = state.playing || (sorter && (Boolean(sortSet().checked) || Object.keys(state.picks).length < 12));
  lockControls();
  refs.track.hidden = sorter;
  if (sorter) {
    drawSorter();
    renderReadouts(null);
    refs.eventCard.textContent = t(sortSet().checked ? "eventSortDone" : "eventSort", { n: sortSet().checked?.score ?? 0 });
  } else if (!state.playing) {
    if (state.preview || !trial) { drawLife({ sample: null, mass: state.settings.mass }); renderReadouts(null); renderTrack(null, null); }
    else { const i = trial.samples.length - 1, view = lifeView(trial, i); drawLife(view); renderReadouts(view.sample, trial.settings.mass); renderTrack(trial, view.sample.stage); }
    refs.eventCard.textContent = state.preview || !trial ? t("eventStart") : t("eventDone", { n: trial.index });
  }
  refs.outcomeEyebrow.textContent = t(sorter ? "sortEyebrow" : "whatHappened");
  refs.outcomeHeading.textContent = t(sorter ? "sortHeading" : "outcomeHeading");
  refs.sortWrap.hidden = !sorter;
  refs.stats.hidden = sorter;
  if (sorter) {
    const checked = sortSet().checked;
    refs.outcome.innerHTML = renderRich(checked ? t("sortScore", { n: checked.score }) : t("sortIntro"));
    renderSorter();
  } else {
    const shown = state.playing ? null : (state.preview ? null : trial);
    refs.outcome.innerHTML = shown ? renderRich(trialSentence(shown)) : renderRich(t("outcomeStart"));
    renderStats(shown);
  }
  if (!state.playing) renderChart();
  renderTables();
  refs.reflection.innerHTML = renderRich(state.run.history.length ? reflectionText() : t("reflectStart"));
}

function reflectionText() {
  const prediction = state.prediction === "" ? t("reflectNone") : t("reflectYours", { text: t({ small: "predSmall", sun: "predSun", big: "predBig", same: "predSame" }[state.prediction]) });
  return t("reflectBody", { prediction });
}

/* ---------- wiring ---------- */
function cancelPlayback() { state.playToken++; state.playing = false; state.frame = null; }
function restart(seed) {
  cancelPlayback();
  state.chartPick = null; state.preview = true; state.picks = {};
  state.seed = seed;
  state.run = createRun(seed);
  if (state.mode === "sorter") state.run = newSortSet(state.run);
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
$("#copy-seed-button").addEventListener("click", async () => { try { await navigator.clipboard.writeText(String(state.seed)); } catch { /* clipboard permission is optional */ } });
$("#simplifications-button").addEventListener("click", (event) => { const panel = $("#simplifications"); panel.hidden = !panel.hidden; event.currentTarget.setAttribute("aria-expanded", String(!panel.hidden)); });
onLangChange(() => { renderControls(); if (state.playing) { refs.runLabel.textContent = t("runningBtn"); lockControls(); } else render(); });
initLab(content);
renderControls();
render();

createGraphTools(document.getElementById('chart'), {legacy:true});
