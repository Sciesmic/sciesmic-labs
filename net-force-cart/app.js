import { advanceTrial, createRun, normalize, massOf, DEFAULTS, MODES, CART_HALF, TRACK, G, PUSH_STOP, LAUNCH, ROLL_SPEED } from "./model.js";
import { initLab, onLangChange, renderRich, t } from "../kit/labs-kit.js";
import { content } from "./content.js";

const $ = (selector) => document.querySelector(selector);
const params = new URLSearchParams(location.search);
const startMode = MODES.includes(params.get("mode")) ? params.get("mode") : "push";

const state = {
  mode: startMode,
  settings: { push: { ...DEFAULTS.push }, tug: { ...DEFAULTS.tug }, apart: { ...DEFAULTS.apart } },
  seed: seedFromLocation(), run: null, prediction: "",
  playing: false, playToken: 0, frame: null, preview: true, chartSelection: [],
};
state.run = createRun(state.seed);

const refs = {
  scene: $("#scene"), sceneLive: $("#scene-live"), sceneHeading: $("#scene-heading"), sceneSub: $("#scene-sub"), eventCard: $("#event-card"),
  modeChoices: $("#mode-choices"), modeHint: $("#mode-hint"), modeControls: $("#mode-controls"),
  run: $("#run-button"), runLabel: $("#run-label"), reset: $("#reset-button"), newSeed: $("#new-seed-button"), seed: $("#seed-readout"), prediction: $("#prediction"),
  outcome: $("#outcome-copy"), stats: $("#stat-row"), fbd: $("#fbd"), fbdWhen: $("#fbd-when"), fbdNote: $("#fbd-note"),
  chart: $("#chart"), chartKey: $("#chart-key"), chartSelection: $("#chart-selection"), clearChartSelection: $("#clear-chart-selection"),
  history: $("#history-body"), reflection: $("#reflection-prompt"),
};

function seedFromLocation() {
  const value = params.get("seed");
  return value && /^\d+$/.test(value) ? Number(value) >>> 0 : Math.floor(Math.random() * 2 ** 32) >>> 0;
}

/* ---------- formatting ---------- */
const fmt = (value, digits = 2) => {
  const text = Math.abs(value) < 0.5 * 10 ** -digits ? (0).toFixed(digits) : Number(value).toFixed(digits);
  return text.replace("-", "−");
};
const abs = (value, digits = 2) => fmt(Math.abs(value), digits);
const esc = (text) => String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const SURF_KEY = { none: "None", smooth: "Smooth", felt: "Felt", carpet: "Carpet" };
const surfName = (s) => t(`surf${SURF_KEY[s]}`);
const surfLower = (s) => t(`surf${SURF_KEY[s]}Lower`);
const barsText = (bars) => t(bars === 0 ? "bars0" : bars === 1 ? "bars1" : "barsN", { kg: massOf(bars).toFixed(2), n: bars });
const launchName = (level) => t(`launch${level}`);
const dirWord = (value) => t(value >= 0 ? "dirRight" : "dirLeft");
const modeTrials = () => state.run.history.filter((trial) => trial.settings.mode === state.mode);
const lastTrial = () => modeTrials().at(-1) ?? null;

function setupText(s) {
  if (s.mode === "push") return t("setupPush", { f: s.force.toFixed(1), short: s.pushTime === "short" ? t("setupShort") : "", surface: surfLower(s.surface) });
  if (s.mode === "tug") return t("setupTug", { fr: s.forceRight.toFixed(1), fl: s.forceLeft.toFixed(1), surface: surfLower(s.surface), rolling: s.start === "rolling" ? t("setupRolling") : "" });
  return t("setupApart", { launch: launchName(s.launch).toLowerCase(), surface: surfLower(s.surface) });
}

/* ---------- controls ---------- */
function rangeField(id, label, min, max, step, value, output) {
  return `<fieldset><legend class="sr-only">${esc(label)}</legend>
    <label class="range-label" for="${id}"><span>${esc(label)}</span><output id="${id}-out" for="${id}">${esc(output)}</output></label>
    <input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" /></fieldset>`;
}
function segField(name, legend, options, value, cols = "") {
  return `<fieldset><legend>${esc(legend)}</legend><div class="segmented-control ${cols}">${options.map(([key, label]) =>
    `<button type="button" class="choice ${key === value ? "active" : ""}" data-field="${name}" data-value="${key}" aria-pressed="${key === value}">${esc(label)}</button>`).join("")}</div>
    ${name === "surface" ? `<p class="hint" id="surface-hint">${renderRich(t(`surfHint${SURF_KEY[value]}`))}</p>` : ""}</fieldset>`;
}
const SURFACE_OPTIONS = () => ["none", "smooth", "felt", "carpet"].map((key) => [key, surfName(key)]);

function renderControls() {
  refs.modeChoices.innerHTML = MODES.map((mode) => {
    const label = t({ push: "modePush", tug: "modeTug", apart: "modeApart" }[mode]);
    return `<button type="button" class="choice ${mode === state.mode ? "active" : ""}" data-mode="${mode}" aria-pressed="${mode === state.mode}">${esc(label)}</button>`;
  }).join("");
  refs.modeHint.innerHTML = renderRich(t({ push: "modeHintPush", tug: "modeHintTug", apart: "modeHintApart" }[state.mode]));
  const s = state.settings[state.mode];
  let html = "";
  if (state.mode === "push") {
    html += rangeField("force", t("forceLabel"), 0, 4, 0.5, s.force, t("forceOut", { f: s.force.toFixed(1) }));
    html += segField("pushTime", t("pushTimeLegend"), [["all", t("pushAll")], ["short", t("pushShort")]], s.pushTime, "two");
    html += rangeField("bars", t("massLabel"), 0, 3, 1, s.bars, barsText(s.bars));
  } else if (state.mode === "tug") {
    html += rangeField("forceRight", t("forceRightLabel"), 0, 4, 0.5, s.forceRight, t("forceOut", { f: s.forceRight.toFixed(1) }));
    html += rangeField("forceLeft", t("forceLeftLabel"), 0, 4, 0.5, s.forceLeft, t("forceOut", { f: s.forceLeft.toFixed(1) }));
    html += segField("start", t("startLegend"), [["rest", t("startRest")], ["rolling", t("startRolling")]], s.start, "two");
    html += rangeField("bars", t("massLabel"), 0, 3, 1, s.bars, barsText(s.bars));
  } else {
    html += rangeField("launch", t("launchLabel"), 1, 3, 1, s.launch, launchName(s.launch));
    html += rangeField("barsLeft", t("massLeftLabel"), 0, 3, 1, s.barsLeft, barsText(s.barsLeft));
    html += rangeField("barsRight", t("massRightLabel"), 0, 3, 1, s.barsRight, barsText(s.barsRight));
  }
  html += segField("surface", t("surfaceLegend"), SURFACE_OPTIONS(), s.surface, "two");
  refs.modeControls.innerHTML = html;
  refs.modeChoices.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode)));
  refs.modeControls.querySelectorAll("input[type=range]").forEach((input) => input.addEventListener("input", () => {
    s[input.id] = Number(input.value);
    Object.assign(s, normalize(s));
    $(`#${input.id}-out`).textContent = outputText(input.id, s[input.id]);
    state.preview = true;
    render();
  }));
  refs.modeControls.querySelectorAll("[data-field]").forEach((button) => button.addEventListener("click", () => {
    const field = button.dataset.field;
    s[field] = button.dataset.value;
    state.preview = true;
    refs.modeControls.querySelectorAll(`[data-field="${field}"]`).forEach((other) => {
      const on = other === button;
      other.classList.toggle("active", on);
      other.setAttribute("aria-pressed", String(on));
    });
    if (field === "surface") $("#surface-hint").innerHTML = renderRich(t(`surfHint${SURF_KEY[s.surface]}`));
    render();
  }));
}

function outputText(id, value) {
  if (id.startsWith("force")) return t("forceOut", { f: value.toFixed(1) });
  if (id.startsWith("bars")) return barsText(value);
  if (id === "launch") return launchName(value);
  return String(value);
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

/* ---------- scene ---------- */
const X0 = 50, PX = 350, RAIL = 236;               // px for x = 0 m; px per meter; top of the surface
const px = (x) => X0 + x * PX;
const CART_W = CART_HALF * 2 * PX, CART_H = 34, WHEEL_R = 7;
const ARROW = 26;                                   // px per newton in the scene
const COLORS = { push: "#1d6fb8", friction: "#c4581c", net: "#173138", pair: "#7a3f8f" };

function arrowPath(x1, y, x2, color, width = 5, id = "") {
  const dir = Math.sign(x2 - x1) || 1, len = Math.abs(x2 - x1);
  if (len < 1) return "";
  const head = Math.min(11, Math.max(7, len * 0.45));
  const shaftEnd = x2 - dir * head;
  return `<g class="arrow" ${id ? `data-arrow="${id}"` : ""}><line x1="${x1}" y1="${y}" x2="${shaftEnd}" y2="${y}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/><path d="M${x2},${y} L${shaftEnd},${y - head * 0.7} L${shaftEnd},${y + head * 0.7} Z" fill="${color}"/></g>`;
}
const arrowLen = (force) => (Math.abs(force) < 0.005 ? 0 : Math.max(14, Math.min(4.6, Math.abs(force)) * ARROW));

function cartSvg(cx, bars, label, accent = "#0b6a69") {
  const left = cx - CART_W / 2, top = RAIL - 2 * WHEEL_R - CART_H + 2;
  const barSvg = Array.from({ length: bars }, (_, i) => `<rect x="${left + 5}" y="${top - 8 * (i + 1)}" width="${CART_W - 10}" height="7" rx="1.5" fill="#4b5560" stroke="#2e353c" stroke-width="1"/>`).join("");
  return `<g class="cart">
    ${barSvg}
    <rect x="${left}" y="${top}" width="${CART_W}" height="${CART_H}" rx="5" fill="${accent}" stroke="#173138" stroke-width="1.5"/>
    <rect x="${left + 6}" y="${top + 7}" width="${CART_W - 12}" height="6" rx="3" fill="#fffdf8" opacity=".55"/>
    <circle cx="${left + 13}" cy="${RAIL - WHEEL_R}" r="${WHEEL_R}" fill="#2b2f33"/><circle cx="${left + 13}" cy="${RAIL - WHEEL_R}" r="2.2" fill="#c9cfd4"/>
    <circle cx="${left + CART_W - 13}" cy="${RAIL - WHEEL_R}" r="${WHEEL_R}" fill="#2b2f33"/><circle cx="${left + CART_W - 13}" cy="${RAIL - WHEEL_R}" r="2.2" fill="#c9cfd4"/>
    ${label ? `<text class="cart-label" x="${cx}" y="${top + CART_H - 7}" text-anchor="middle">${esc(label)}</text>` : ""}
  </g>`;
}

function surfaceSvg(surface) {
  const width = TRACK * PX;
  const fills = { none: "#dff1fb", smooth: "url(#alu)", felt: "#3f7d55", carpet: "url(#carpet)" };
  return `<defs>
      <linearGradient id="alu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e7ebee"/><stop offset=".5" stop-color="#b9c2c9"/><stop offset="1" stop-color="#8e989f"/></linearGradient>
      <pattern id="carpet" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#8a5a3c"/><circle cx="2" cy="2" r="1.3" fill="#a8734f"/><circle cx="6" cy="6" r="1.3" fill="#6f4730"/></pattern>
      <pattern id="ice" width="24" height="16" patternUnits="userSpaceOnUse"><path d="M0 16 L12 0" stroke="#fff" stroke-width="2" opacity=".7"/></pattern>
    </defs>
    <rect x="${px(0)}" y="${RAIL}" width="${width}" height="16" fill="${fills[surface]}" stroke="#58716c" stroke-width="1"/>
    ${surface === "none" ? `<rect x="${px(0)}" y="${RAIL}" width="${width}" height="16" fill="url(#ice)"/>` : ""}
    ${surface === "felt" ? `<rect x="${px(0)}" y="${RAIL}" width="${width}" height="16" fill="none" stroke="#2c5a3d" stroke-dasharray="2 3"/>` : ""}
    <rect x="${px(0) - 12}" y="${RAIL - 40}" width="12" height="56" rx="2" fill="#58716c"/><rect x="${px(TRACK)}" y="${RAIL - 40}" width="12" height="56" rx="2" fill="#58716c"/>
    <g class="ruler">${Array.from({ length: 5 }, (_, i) => i * 0.5).map((m) => `<line x1="${px(m)}" y1="${RAIL + 18}" x2="${px(m)}" y2="${RAIL + 26}"/><text x="${px(m)}" y="${RAIL + 40}" text-anchor="middle">${t("lblTrack", { m: m.toFixed(1) })}</text>`).join("")}</g>
    <text class="surface-label" x="${px(TRACK / 2)}" y="${RAIL + 62}" text-anchor="middle">${esc(surfName(surface))}</text>`;
}

/** Forces to draw for one cart: pushes come in from the sides, friction sits at wheel level, net force above. */
function cartForces(cx, f, showNet = true) {
  const top = RAIL - 2 * WHEEL_R - CART_H + 2;
  const leftEdge = cx - CART_W / 2, rightEdge = cx + CART_W / 2;
  let out = "";
  const yPush = top + CART_H / 2;
  if (f.pushRight > 0.005) { const len = arrowLen(f.pushRight); out += arrowPath(leftEdge - 4 - len, yPush, leftEdge - 4, COLORS.push, 5, "push-right"); out += `<text class="force-label push" x="${leftEdge - 6}" y="${yPush - 11}" text-anchor="end">${t("lblPush", { f: abs(f.pushRight, 1) })}</text>`; }
  if (f.pushLeft > 0.005) { const len = arrowLen(f.pushLeft); out += arrowPath(rightEdge + 4 + len, yPush, rightEdge + 4, COLORS.push, 5, "push-left"); out += `<text class="force-label push" x="${rightEdge + 6}" y="${yPush - 11}" text-anchor="start">${t("lblPush", { f: abs(f.pushLeft, 1) })}</text>`; }
  if (f.friction !== null && Math.abs(f.friction) >= 0.005) {
    const len = arrowLen(f.friction), dir = Math.sign(f.friction);
    out += arrowPath(cx, RAIL + 8, cx + dir * len, COLORS.friction, 4, "friction");
    out += `<text class="force-label friction" x="${cx + dir * (len + 4)}" y="${RAIL + 4}" text-anchor="${dir > 0 ? "start" : "end"}">${t("lblFriction", { f: abs(f.friction) })}</text>`;
  }
  if (showNet && f.net !== null) {
    const y = top - 8 * (f.bars ?? 0) - 18;
    if (Math.abs(f.net) < 0.005) out += `<text class="force-label net" x="${cx}" y="${y + 4}" text-anchor="middle">${t("lblNetZero")}</text>`;
    else {
      const len = arrowLen(f.net), dir = Math.sign(f.net);
      out += arrowPath(cx, y, cx + dir * len, COLORS.net, 6, "net");
      out += `<text class="force-label net" x="${cx + dir * (len + 5)}" y="${y + 4}" text-anchor="${dir > 0 ? "start" : "end"}">${t("lblNet", { f: abs(f.net) })}</text>`;
    }
  }
  return out;
}

/** Build the frame to draw: a playback sample, the end of the last trial, or a preview of the current settings. */
function idleFrame() {
  const s = normalize(state.settings[state.mode]);
  if (s.mode === "apart") return { mode: "apart", t: 0, spring: LAUNCHING, carts: [
    { x: 1.0 - CART_HALF, v: 0, bars: s.barsLeft, pushLeft: 0, pushRight: 0, friction: null, net: null },
    { x: 1.0 + CART_HALF, v: 0, bars: s.barsRight, pushLeft: 0, pushRight: 0, friction: null, net: null }], preview: true };
  const cart = s.mode === "push"
    ? { x: 0.2, v: 0, bars: s.bars, pushRight: s.force, pushLeft: 0, friction: null, net: null }
    : { x: 1.0, v: s.start === "rolling" ? ROLL_SPEED : 0, bars: s.bars, pushRight: s.forceRight, pushLeft: s.forceLeft, friction: null, net: null };
  return { mode: s.mode, t: 0, carts: [cart], preview: true };
}
const LAUNCHING = "ready";

function frameFromSample(trial, sample) {
  const s = trial.settings;
  if (s.mode === "apart") {
    const contact = sample.spring > 0;
    return { mode: "apart", t: sample.t, spring: contact ? "pushing" : "released", carts: [
      { x: sample.left.x, v: sample.left.vMeas, bars: s.barsLeft, pushLeft: contact ? sample.spring : 0, pushRight: 0, friction: sample.left.friction, net: sample.left.net, pair: contact ? -sample.spring : 0 },
      { x: sample.right.x, v: sample.right.vMeas, bars: s.barsRight, pushLeft: 0, pushRight: contact ? sample.spring : 0, friction: sample.right.friction, net: sample.right.net, pair: contact ? sample.spring : 0 }] };
  }
  const r = trial.result;
  // The 0.5 s sample still holds the forces from just before the push stopped.
  const pushOn = s.mode === "tug" || s.pushTime === "all" || sample.t < PUSH_STOP + 1e-9;
  return { mode: s.mode, t: sample.t, carts: [{ x: sample.x, v: sample.vMeas, bars: s.bars,
    pushRight: pushOn ? r.pushRight : 0, pushLeft: pushOn ? r.pushLeft : 0, friction: sample.friction, net: sample.net }] };
}

function drawScene(frame) {
  const s = state.settings[state.mode];
  const surface = frame.surface ?? s.surface;
  let body = `<title id="scene-title">${esc(t({ push: "sceneHeadPush", tug: "sceneHeadTug", apart: "sceneHeadApart" }[frame.mode]))}</title><desc id="scene-desc">${esc(sceneDescription())}</desc>`;
  body += surfaceSvg(surface);
  if (frame.mode === "apart") {
    const [L, R] = frame.carts;
    const touching = frame.spring !== "released";
    if (touching) {
      const gapL = px(L.x) + CART_W / 2, gapR = px(R.x) - CART_W / 2, y = RAIL - 2 * WHEEL_R - CART_H / 2;
      body += `<path class="spring" d="M${gapL},${y} l2,-6 l2,12 l2,-12 l2,12 l2,-6" transform="translate(${(gapR - gapL - 10) / 2},0)"/>`;
    }
    body += cartSvg(px(L.x), L.bars, t("tagLeft"), "#5b4a8b");
    body += cartSvg(px(R.x), R.bars, t("tagRight"), "#0b6a69");
    if (frame.preview || frame.spring === "pushing") {
      const preset = frame.preview ? LAUNCH[state.settings.apart.launch] : null;
      const fL = frame.preview ? preset : Math.abs(L.pair), fR = frame.preview ? preset : Math.abs(R.pair);
      const top = RAIL - 2 * WHEEL_R - CART_H + 2 - 8 * Math.max(L.bars, R.bars) - 22;
      const lenL = arrowLen(fL), lenR = arrowLen(fR);
      body += arrowPath(px(L.x), top, px(L.x) - lenL, COLORS.pair, 6, "pair-left") + arrowPath(px(R.x), top, px(R.x) + lenR, COLORS.pair, 6, "pair-right");
      if (!frame.preview) {
        body += `<text class="force-label pair" x="${px(L.x) - lenL - 6}" y="${top + 4}" text-anchor="end">${t("lblForceOnLeft", { f: abs(fL) })}</text>`;
        body += `<text class="force-label pair" x="${px(R.x) + lenR + 6}" y="${top + 4}" text-anchor="start">${t("lblForceOnRight", { f: abs(fR) })}</text>`;
      } else body += `<text class="force-label pair" x="${px(1.0)}" y="${top - 12}" text-anchor="middle">${t("lblSpring")}: ${esc(launchName(state.settings.apart.launch))}</text>`;
    } else {
      body += cartForces(px(L.x), { ...L, pushLeft: 0, pushRight: 0 }, false) + cartForces(px(R.x), { ...R, pushLeft: 0, pushRight: 0 }, false);
    }
    body += `<g class="readout"><text x="${px(0)}" y="26">${t("readoutT", { t: frame.t.toFixed(2) })}</text>
      <text x="${px(0)}" y="46">${esc(t("nameLeft"))}: ${t("readoutV", { v: fmt(L.v) })}</text><text x="${px(0)}" y="66">${esc(t("nameRight"))}: ${t("readoutV", { v: fmt(R.v) })}</text></g>`;
  } else {
    const cart = frame.carts[0];
    body += cartSvg(px(cart.x), cart.bars, "");
    body += cartForces(px(cart.x), cart, !frame.preview);
    body += `<g class="readout"><text x="${px(0)}" y="26">${t("readoutT", { t: frame.t.toFixed(2) })}</text><text x="${px(0)}" y="46">${t("readoutV", { v: fmt(cart.v) })}</text></g>`;
  }
  refs.scene.innerHTML = body;
  // On narrow screens the scene scrolls sideways: keep the moving cart (or the middle, for two carts) in view.
  const wrap = refs.scene.parentElement;
  if (wrap.scrollWidth > wrap.clientWidth + 1) {
    const focusX = frame.mode === "apart" ? px(1.0) : px(frame.carts[0].x);
    wrap.scrollLeft = focusX * (wrap.scrollWidth / 800) - wrap.clientWidth / 2;
  }
}

function sceneDescription() {
  const trial = lastTrial();
  if (state.preview || !trial) return t("sceneDescIdle", { setup: setupText(normalize(state.settings[state.mode])) });
  return t("sceneDescDone", { n: trial.index, sentence: plain(trialSentence(trial)) });
}
const plain = (text) => text.replace(/\[\[[a-z0-9-]+\|([^\]]+)\]\]/g, "$1");

/* ---------- playback ---------- */
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
    // Hold the first frame so students can read the starting forces (the spring push lasts only 0.1 s).
    drawPlaybackFrame(trial, trial.samples[0]);
    await wait(trial.settings.mode === "apart" ? 1300 : 700);
    if (token !== state.playToken) return;
    const start = performance.now();
    const endT = trial.samples.at(-1).t;
    await new Promise((resolve) => {
      const tick = (now) => {
        if (token !== state.playToken) { resolve(); return; }
        const simT = Math.min(endT, ((now - start) / 1000) * 0.5);
        drawPlaybackFrame(trial, interpolate(trial, simT));
        if (simT >= endT) resolve(); else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
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

function interpolate(trial, simT) {
  const samples = trial.samples;
  let i = samples.findIndex((p) => p.t > simT);
  if (i <= 0) return i === 0 ? samples[0] : samples.at(-1);
  const a = samples[i - 1], b = samples[i], f = (simT - a.t) / (b.t - a.t);
  const mix = (p, q) => ({ ...p, x: p.x + (q.x - p.x) * f });
  return trial.settings.mode === "apart" ? { ...a, t: simT, left: mix(a.left, b.left), right: mix(a.right, b.right) } : { ...mix(a, b), t: simT };
}

function drawPlaybackFrame(trial, sample) {
  const frame = frameFromSample(trial, sample);
  frame.surface = trial.settings.surface;
  drawScene(frame);
  // Event text set during playback is not overwritten by render(): render() skips the event card while playing.
  refs.eventCard.textContent = frame.mode === "apart"
    ? t("eventPlayingApart", { t: frame.t.toFixed(2), vl: fmt(frame.carts[0].v), vr: fmt(frame.carts[1].v) })
    : t("eventPlaying", { t: frame.t.toFixed(2), v: fmt(frame.carts[0].v) });
}

/* ---------- words for a trial ---------- */
function trialSentence(trial) {
  const s = trial.settings, r = trial.result, n = trial.index;
  if (s.mode === "apart") return t("sApart", { n, fl: abs(r.forceOnLeft), fr: abs(r.forceOnRight), ml: r.massLeft.toFixed(2), mr: r.massRight.toFixed(2), al: abs(r.aMeasLeft), ar: abs(r.aMeasRight) });
  const vars = { n, net: abs(r.net), dir: dirWord(r.net), m: r.mass.toFixed(2), a: fmt(r.aMeasured), p: fmt(r.aPredicted), v: abs(r.vStart), surface: surfLower(s.surface) };
  let text = t({ rest: "sRest", speedUp: "sSpeedUp", constant: "sConstant", slowDown: "sSlow", stopped: "sStopped", reversed: "sReversed" }[r.outcome], vars);
  if (r.after) {
    const key = { constant: "sAfterConstant", slowDown: "sAfterSlow", stopped: "sAfterStopped" }[r.after.behavior];
    text += t(key, { v: abs(r.after.vAtStop), f: abs(r.after.friction) });
  }
  if (r.bumped) text += t("sEnd");
  return text;
}

function resultWords(trial) {
  const r = trial.result;
  let text = t({ rest: "rRest", speedUp: "rSpeedUp", constant: "rConstant", slowDown: "rSlow", stopped: "rStopped", reversed: "rReversed" }[r.outcome]);
  if (r.after) text += t({ constant: "rCoastConst", slowDown: "rCoastSlow", stopped: "rCoastStopped" }[r.after.behavior]);
  return text;
}

/* ---------- evidence: stats + free-body diagram ---------- */
function renderStats(trial) {
  const stat = (label, value) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`;
  if (!trial) {
    refs.stats.innerHTML = state.mode === "apart"
      ? stat(t("statFL"), "—") + stat(t("statFR"), "—") + stat(t("statAL"), "—") + stat(t("statAR"), "—")
      : stat(t("statNet"), "—") + stat(t("statMass"), "—") + stat(t("statA"), "—") + stat(t("statPred"), "—");
    return;
  }
  const r = trial.result;
  refs.stats.innerHTML = trial.settings.mode === "apart"
    ? stat(t("statFL"), t("unitN", { v: fmt(r.forceOnLeft) })) + stat(t("statFR"), t("unitN", { v: fmt(r.forceOnRight) })) + stat(t("statAL"), t("unitA", { v: fmt(r.aMeasLeft) })) + stat(t("statAR"), t("unitA", { v: fmt(r.aMeasRight) }))
    : stat(t("statNet"), t("unitN", { v: fmt(r.net) })) + stat(t("statMass"), t("unitKg", { v: r.mass.toFixed(2) })) + stat(t("statA"), t("unitA", { v: fmt(r.aMeasured) })) + stat(t("statPred"), t("unitA", { v: fmt(r.aPredicted) }));
}

function fbdArrow(x1, y1, x2, y2, color, label, anchor, lx, ly, width = 4) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 1) return "";
  const ux = (x2 - x1) / len, uy = (y2 - y1) / len, head = Math.min(10, Math.max(6, len * 0.4));
  const bx = x2 - ux * head, by = y2 - uy * head;
  return `<line x1="${x1}" y1="${y1}" x2="${bx}" y2="${by}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>
    <path d="M${x2},${y2} L${bx - uy * head * 0.7},${by + ux * head * 0.7} L${bx + uy * head * 0.7},${by - ux * head * 0.7} Z" fill="${color}"/>
    <text class="fbd-label" x="${lx}" y="${ly}" text-anchor="${anchor}" fill="${color}">${esc(label)}</text>`;
}

function renderFbd(trial) {
  if (!trial) {
    refs.fbd.innerHTML = `<title id="fbd-title">${esc(t("fbdHeading"))}</title><desc id="fbd-desc">${esc(t("fbdNone"))}</desc><text class="fbd-empty" x="180" y="115" text-anchor="middle">${esc(t("fbdNone"))}</text>`;
    refs.fbdWhen.textContent = ""; refs.fbdNote.textContent = "";
    return;
  }
  const s = trial.settings, r = trial.result;
  const H = 22; // px per newton (horizontal)
  const hl = (force) => (Math.abs(force) < 0.005 ? 0 : Math.max(14, Math.min(4.2, Math.abs(force)) * H));
  if (s.mode === "apart") {
    const y = 95;
    const boxes = `<rect x="95" y="${y - 22}" width="60" height="44" rx="5" fill="#5b4a8b" opacity=".9"/><rect x="205" y="${y - 22}" width="60" height="44" rx="5" fill="#0b6a69" opacity=".9"/>
      <text class="fbd-box" x="125" y="${y + 5}" text-anchor="middle">${r.massLeft.toFixed(2)} kg</text><text class="fbd-box" x="235" y="${y + 5}" text-anchor="middle">${r.massRight.toFixed(2)} kg</text>`;
    const lenL = hl(r.forceOnLeft), lenR = hl(r.forceOnRight);
    refs.fbd.innerHTML = `<title id="fbd-title">${esc(t("fbdHeading"))}</title><desc id="fbd-desc">${esc(t("fbdApartDesc", { fl: abs(r.forceOnLeft), fr: abs(r.forceOnRight) }))}</desc>${boxes}
      ${fbdArrow(95, y, 95 - lenL, y, COLORS.pair, t("unitN", { v: abs(r.forceOnLeft) }), "middle", 95 - lenL / 2, y - 14)}
      ${fbdArrow(265, y, 265 + lenR, y, COLORS.pair, t("unitN", { v: abs(r.forceOnRight) }), "middle", 265 + lenR / 2, y - 14)}
      <text class="fbd-caption" x="180" y="175" text-anchor="middle">${esc(t("fbdApartDesc", { fl: abs(r.forceOnLeft), fr: abs(r.forceOnRight) }).split(":")[0])}</text>`;
    refs.fbdWhen.textContent = t("fbdWhenApart");
    refs.fbdNote.textContent = "";
    return;
  }
  const cx = 180, cy = 92, w = 76, h = 44;
  const weight = r.mass * G, vScale = 4.2; // px per newton (vertical, shorter so it fits)
  const parts = [], list = [];
  parts.push(`<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="5" fill="#0b6a69" opacity=".9"/><text class="fbd-box" x="${cx}" y="${cy + 5}" text-anchor="middle">${r.mass.toFixed(2)} kg</text>`);
  parts.push(fbdArrow(cx, cy + h / 2, cx, cy + h / 2 + weight * vScale, "#58716c", t("fbdGravity", { f: weight.toFixed(1) }), "start", cx + 8, cy + h / 2 + weight * vScale - 4, 3));
  parts.push(fbdArrow(cx, cy - h / 2, cx, cy - h / 2 - weight * vScale, "#58716c", t("fbdNormal", { f: weight.toFixed(1) }), "start", cx + 8, cy - h / 2 - weight * vScale + 12, 3));
  list.push(t("fbdGravity", { f: weight.toFixed(1) }), t("fbdNormal", { f: weight.toFixed(1) }));
  if (r.pushRight > 0.005) {
    const len = hl(r.pushRight), label = s.mode === "tug" ? t("fbdRight", { f: abs(r.pushRight) }) : t("fbdPush", { f: abs(r.pushRight) });
    parts.push(fbdArrow(cx + w / 2, cy - 8, cx + w / 2 + len, cy - 8, COLORS.push, label, "start", cx + w / 2 + 2, cy - 16));
    list.push(label);
  }
  if (r.pushLeft > 0.005) {
    const len = hl(r.pushLeft), label = t("fbdLeft", { f: abs(r.pushLeft) });
    parts.push(fbdArrow(cx - w / 2, cy - 8, cx - w / 2 - len, cy - 8, COLORS.push, label, "end", cx - w / 2 - 2, cy - 16));
    list.push(label);
  }
  if (Math.abs(r.friction) >= 0.005) {
    const len = hl(r.friction), dir = Math.sign(r.friction), x0 = cx + dir * w / 2, label = t("fbdFriction", { f: abs(r.friction) });
    parts.push(fbdArrow(x0, cy + 12, x0 + dir * len, cy + 12, COLORS.friction, label, dir > 0 ? "start" : "end", x0 + dir * 2, cy + 30));
    list.push(label);
  }
  const netLabel = Math.abs(r.net) < 0.005 ? t("fbdNetZero") : t("fbdNet", { f: abs(r.net), dir: dirWord(r.net) === t("dirRight") ? "→" : "←" });
  if (Math.abs(r.net) >= 0.005) { const len = hl(r.net), dir = Math.sign(r.net); parts.push(fbdArrow(cx, 214, cx + dir * len, 214, COLORS.net, netLabel, dir > 0 ? "end" : "start", dir > 0 ? cx - 6 : cx + 6, 218, 5)); }
  else parts.push(`<text class="fbd-label" x="${cx}" y="218" text-anchor="middle" fill="${COLORS.net}">${esc(netLabel)}</text>`);
  refs.fbd.innerHTML = `<title id="fbd-title">${esc(t("fbdHeading"))}</title><desc id="fbd-desc">${esc(t("fbdDesc", { list: list.join(", "), net: netLabel }))}</desc>${parts.join("")}`;
  refs.fbdWhen.textContent = t("fbdWhen");
  refs.fbdNote.textContent = t("fbdVertical") + (r.after ? ` ${t("fbdAfter", { f: abs(r.after.friction), net: abs(r.after.net) })}` : "");
}

/* ---------- velocity–time graph ---------- */
// Stop each line where its cart hits an end stop, so the graph shows only motion on the track.
function untilBump(points, bumped) {
  if (!bumped) return points;
  const stop = points.findIndex((p, i) => i > 0 && p.atEnd);
  return stop > 0 ? points.slice(0, stop) : points;
}
const atEnd = (x) => x <= CART_HALF + 1e-6 || x >= TRACK - CART_HALF - 1e-6;

function seriesFor(trial, role) {
  if (!trial) return [];
  if (trial.settings.mode === "apart") return [
    { id: `L${trial.index}`, name: t("nameLeft"), cls: "left", pts: untilBump(trial.samples.map((p) => ({ t: p.t, v: p.left.vMeas, atEnd: atEnd(p.left.x) })), trial.result.bumpedLeft) },
    { id: `R${trial.index}`, name: t("nameRight"), cls: "right", pts: untilBump(trial.samples.map((p) => ({ t: p.t, v: p.right.vMeas, atEnd: atEnd(p.right.x) })), trial.result.bumpedRight) }];
  return [{ id: `C${trial.index}`, name: role === "prev" ? `${t("nameCart")} (#${trial.index})` : t("nameCart"), cls: role === "prev" ? "prev" : "this", pts: untilBump(trial.samples.map((p) => ({ t: p.t, v: p.vMeas, atEnd: atEnd(p.x) })), trial.result.bumped) }];
}

function niceStep(range) { const raw = range / 5, pow = 10 ** Math.floor(Math.log10(raw)), n = raw / pow; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * pow; }

function renderChart() {
  const trials = modeTrials();
  const current = state.preview && state.playing ? null : trials.at(-1) ?? null;
  const prev = state.mode !== "apart" ? trials.at(-2) ?? null : null;
  const series = [...(prev ? seriesFor(prev, "prev") : []), ...seriesFor(current, "this")];
  refs.chartKey.innerHTML = !current ? "" : state.mode === "apart"
    ? `<span class="key-left">${esc(t("keyLeft"))}</span><span class="key-right">${esc(t("keyRight"))}</span>`
    : `<span class="key-this">${esc(t("keyThis"))}</span>${prev ? `<span class="key-prev">${esc(t("keyPrev"))}</span>` : ""}`;
  const W = 600, H = 320, left = 60, right = 20, top = 20, bottom = 52, uw = W - left - right, uh = H - top - bottom;
  if (!current) {
    refs.chart.innerHTML = `<title id="chart-title">${esc(t("chartTitle"))}</title><desc id="chart-description">${esc(t("chartDescEmpty"))}</desc><text class="chart-empty" x="${W / 2}" y="${H / 2}" text-anchor="middle">${esc(t("chartEmpty"))}</text>`;
    refs.chartSelection.textContent = "";
    refs.clearChartSelection.disabled = true;
    return;
  }
  const allPts = series.flatMap((s) => s.pts);
  const tMax = Math.max(0.5, ...allPts.map((p) => p.t));
  let vMin = Math.min(0, ...allPts.map((p) => p.v)), vMax = Math.max(0, ...allPts.map((p) => p.v));
  if (vMax - vMin < 0.5) vMax = vMin + 0.5;
  const vStep = niceStep(vMax - vMin);
  vMin = Math.floor(vMin / vStep) * vStep; vMax = Math.ceil(vMax / vStep) * vStep;
  const tStep = niceStep(tMax), tEnd = Math.ceil(tMax / tStep) * tStep;
  const x = (time) => left + (time / tEnd) * uw, y = (v) => top + (1 - (v - vMin) / (vMax - vMin)) * uh;
  const vTicks = []; for (let v = vMin; v <= vMax + 1e-9; v += vStep) vTicks.push(Math.round(v * 1000) / 1000);
  const tTicks = []; for (let tt = 0; tt <= tEnd + 1e-9; tt += tStep) tTicks.push(Math.round(tt * 1000) / 1000);
  const sel = state.chartSelection;
  let body = `<title id="chart-title">${esc(t("chartTitle"))}</title><desc id="chart-description">${esc(chartText(current))}</desc>
    <g class="grid">${vTicks.map((v) => `<line x1="${left}" y1="${y(v)}" x2="${W - right}" y2="${y(v)}"/><text x="${left - 8}" y="${y(v) + 4}" text-anchor="end">${fmt(v, Number.isInteger(Math.round(vStep * 1000) / 100) ? 1 : 2)}</text>`).join("")}</g>
    <line class="zero" x1="${left}" y1="${y(0)}" x2="${W - right}" y2="${y(0)}"/>
    ${tTicks.map((tt) => `<text x="${x(tt)}" y="${top + uh + 16}" text-anchor="middle">${tt.toFixed(tStep < 0.5 ? 2 : 1)}</text>`).join("")}
    <text class="axis-label" x="${left + uw / 2}" y="${H - 8}" text-anchor="middle">${esc(t("axisT"))}</text>
    <text class="axis-label" transform="translate(14 ${top + uh / 2}) rotate(-90)" text-anchor="middle">${esc(t("axisV"))}</text>`;
  if (current.settings.mode === "push" && current.settings.pushTime === "short") body += `<g class="annotation"><line x1="${x(PUSH_STOP)}" y1="${top}" x2="${x(PUSH_STOP)}" y2="${top + uh}"/><text x="${x(PUSH_STOP) + 4}" y="${top + 12}">${esc(t("chartPushStops"))}</text></g>`;
  const range = selectedRange(series);
  if (range) body += `<line class="slope-line" x1="${x(range.a.t)}" y1="${y(range.a.v)}" x2="${x(range.b.t)}" y2="${y(range.b.v)}"/>`;
  let first = true;
  for (const s of series) {
    body += `<polyline class="line ${s.cls}" points="${s.pts.map((p) => `${x(p.t)},${y(p.v)}`).join(" ")}"/>`;
    s.pts.forEach((p, i) => {
      const isSel = sel.some((q) => q.series === s.id && q.i === i);
      const label = t("pointLabel", { name: s.name, t: p.t.toFixed(2), v: fmt(p.v) });
      const mark = s.cls === "left" ? `<rect class="mark" x="${x(p.t) - 3}" y="${y(p.v) - 3}" width="6" height="6"/>` : `<circle class="mark" cx="${x(p.t)}" cy="${y(p.v)}" r="3"/>`;
      body += `<g class="chart-point ${s.cls} ${isSel ? "selected-point" : ""}" role="button" tabindex="${first ? 0 : -1}" data-series="${s.id}" data-i="${i}" aria-label="${esc(label)}"><title>${esc(label)}</title><circle class="point-hit" cx="${x(p.t)}" cy="${y(p.v)}" r="7" fill="transparent"/>${mark}</g>`;
      first = false;
    });
  }
  body += `<line x1="${left}" y1="${top + uh}" x2="${W - right}" y2="${top + uh}" stroke="#58716c"/><line x1="${left}" y1="${top}" x2="${left}" y2="${top + uh}" stroke="#58716c"/>`;
  refs.chart.innerHTML = body;
  refs.chart.querySelectorAll(".chart-point").forEach((point) => {
    point.addEventListener("click", () => selectPoint(point));
    point.addEventListener("keydown", pointKeydown);
  });
  refs.clearChartSelection.disabled = sel.length === 0;
  if (!range) refs.chartSelection.textContent = sel.length ? t("selSecond") : t("selDefault");
  else {
    const a = (range.b.v - range.a.v) / (range.b.t - range.a.t);
    refs.chartSelection.textContent = t("selResult", { name: range.name, v1: fmt(range.a.v), t1: range.a.t.toFixed(2), v2: fmt(range.b.v), t2: range.b.t.toFixed(2), a: fmt(a) }) + t("selNote");
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
  if (trial.settings.mode === "apart") return t("chartDescApart", { n: trial.index, vl: fmt(trial.result.vLeft), vr: fmt(trial.result.vRight) });
  return t("chartDesc", { n: trial.index, v0: fmt(trial.samples[0].vMeas), v1: fmt(trial.samples.at(-1).vMeas), t: trial.samples.at(-1).t.toFixed(2) });
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
  const rows = [];
  const cell = (value) => `<td>${esc(value)}</td>`;
  for (const trial of state.run.history) {
    const s = trial.settings, r = trial.result;
    if (s.mode === "apart") {
      rows.push(`<tr>${cell(`${trial.index}L`)}${cell(`${setupText(s)} · ${t("rowLeft")}`)}${cell(r.massLeft.toFixed(2))}${cell(fmt(r.forceOnLeft))}${cell(fmt(r.aMeasLeft))}${cell(fmt(r.forceOnLeft / r.massLeft))}${cell(t("rApartLeft", { v: abs(r.vLeft) }))}</tr>`);
      rows.push(`<tr>${cell(`${trial.index}R`)}${cell(`${setupText(s)} · ${t("rowRight")}`)}${cell(r.massRight.toFixed(2))}${cell(fmt(r.forceOnRight))}${cell(fmt(r.aMeasRight))}${cell(fmt(r.forceOnRight / r.massRight))}${cell(t("rApartRight", { v: abs(r.vRight) }))}</tr>`);
    } else {
      rows.push(`<tr>${cell(trial.index)}${cell(setupText(s))}${cell(r.mass.toFixed(2))}${cell(fmt(r.net))}${cell(fmt(r.aMeasured))}${cell(fmt(r.aPredicted))}${cell(resultWords(trial))}</tr>`);
    }
  }
  refs.history.innerHTML = rows.length ? rows.join("") : `<tr><td colspan="7" class="empty">${esc(t("tableEmpty"))}</td></tr>`;
}

/* ---------- main render ---------- */
function render() {
  const trial = lastTrial();
  refs.sceneHeading.textContent = t({ push: "sceneHeadPush", tug: "sceneHeadTug", apart: "sceneHeadApart" }[state.mode]);
  refs.sceneSub.textContent = t({ push: "sceneSubPush", tug: "sceneSubTug", apart: "sceneSubApart" }[state.mode]);
  refs.seed.textContent = state.seed;
  refs.runLabel.textContent = state.playing ? t("runningBtn") : t("runBtn");
  refs.run.disabled = state.playing;
  document.querySelectorAll(".controls-panel button.choice, .controls-panel input").forEach((node) => { node.disabled = state.playing; });
  refs.reset.disabled = refs.newSeed.disabled = false;
  if (!state.playing) {
    if (state.preview || !trial) drawScene(idleFrame());
    else { const frame = frameFromSample(trial, trial.samples.at(-1)); frame.surface = trial.settings.surface; drawScene(frame); }
    refs.eventCard.textContent = state.preview || !trial ? t("eventStart") : t("eventDone", { n: trial.index });
  }
  const shown = state.playing ? state.run.history.at(-1) : trial;
  const ready = !state.playing && shown;
  refs.outcome.innerHTML = ready ? renderRich(trialSentence(shown)) : renderRich(t("outcomeStart"));
  renderStats(ready ? shown : null);
  renderFbd(ready ? shown : null);
  if (!state.playing) renderChart();
  renderTable();
  refs.reflection.innerHTML = renderRich(state.run.history.length ? reflectionText() : t("reflectStart"));
}

function reflectionText() {
  const prediction = state.prediction === "" ? t("reflectNone") : t("reflectYours", { text: t({ more: "reflectMore", stop: "reflectStop", heavy: "reflectHeavy", mass: "reflectMass" }[state.prediction]) });
  return t("reflectBody", { prediction });
}

/* ---------- wiring ---------- */
function cancelPlayback() { state.playToken++; state.playing = false; }
refs.run.addEventListener("click", runTrial);
refs.prediction.addEventListener("change", () => { state.prediction = refs.prediction.value; render(); });
refs.reset.addEventListener("click", () => { cancelPlayback(); state.chartSelection = []; state.preview = true; state.run = createRun(state.seed); render(); });
refs.newSeed.addEventListener("click", () => {
  cancelPlayback();
  state.chartSelection = []; state.preview = true;
  state.seed = Math.floor(Math.random() * 2 ** 32) >>> 0;
  state.run = createRun(state.seed);
  const url = new URL(location.href);
  url.searchParams.set("seed", state.seed); url.searchParams.set("mode", state.mode);
  history.replaceState({}, "", url);
  render();
});
refs.clearChartSelection.addEventListener("click", () => { state.chartSelection = []; renderChart(); });
$("#copy-seed-button").addEventListener("click", async () => { try { await navigator.clipboard.writeText(String(state.seed)); } catch { /* clipboard permission is optional */ } });
$("#simplifications-button").addEventListener("click", (event) => { const panel = $("#simplifications"); panel.hidden = !panel.hidden; event.currentTarget.setAttribute("aria-expanded", String(!panel.hidden)); });
onLangChange(() => { renderControls(); if (state.playing) { refs.runLabel.textContent = t("runningBtn"); } else render(); });
initLab(content);
renderControls();
render();
