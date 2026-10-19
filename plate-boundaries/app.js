import { advanceRun, chainTable, createRun, MAX_TIME, SETUPS, slabDepth, stripeTable } from "./model.js";
import { initLab, onLangChange, renderRich, t, getLang } from "../kit/labs-kit.js";
import { content } from "./content.js";

const $ = (selector) => document.querySelector(selector);
const params = new URLSearchParams(location.search);
const startBoundary = SETUPS[params.get("boundary")] ? params.get("boundary") : "divergent";
const startCrust = SETUPS[startBoundary].includes(params.get("crust")) ? params.get("crust") : SETUPS[startBoundary][0];
const startSpeed = Math.min(10, Math.max(1, Number(params.get("speed")) || 5));

const DEFAULT_MEASURE = { divergent: "oceanChange", convergent: "highest", transform: "quakesTotal", hotspot: "volcanoes" };
const state = { boundary: startBoundary, crust: startCrust, speed: startSpeed, running: false, runToken: 0, seed: seedFromLocation(), prediction: "", run: null, measure: DEFAULT_MEASURE[startBoundary], chartSelection: [] };
state.run = createRun(state.seed, state.boundary, state.crust);

const refs = {
  scene: $("#scene"), sceneDesc: $("#scene-desc-text"), sceneHeading: $("#scene-heading"), sceneSub: $("#scene-sub"), eventCard: $("#event-card"), time: $("#time-badge"), legend: $("#legend"),
  boundaryChoices: $("#boundary-choices"), crustChoices: $("#crust-choices"), hint: $("#setting-hint"), speed: $("#speed"), speedOutput: $("#speed-output"), speedHint: $("#speed-hint"),
  step: $("#step-button"), run: $("#run-button"), reset: $("#reset-button"), trial: $("#new-trial-button"), seed: $("#seed-readout"), prediction: $("#prediction"),
  outcome: $("#outcome-copy"), high: $("#stat-high"), low: $("#stat-low"), volc: $("#stat-volc"), quakes: $("#stat-quakes"), deep: $("#stat-deep"), ocean: $("#stat-ocean"),
  chart: $("#chart"), measure: $("#measure"), chartSelection: $("#chart-selection"), clearChartSelection: $("#clear-chart-selection"),
  rocksHeading: $("#rocks-heading"), rocksBody: $("#rocks-body"), history: $("#history-body"), reflection: $("#reflection-prompt"),
};

function seedFromLocation() {
  const value = params.get("seed");
  return value && /^\d+$/.test(value) ? Number(value) >>> 0 : Math.floor(Math.random() * 2 ** 32) >>> 0;
}

const key = () => `${state.boundary}-${state.crust}`;
const num = (value) => new Intl.NumberFormat(getLang() === "es" ? "es-MX" : "en-US").format(value);
const signed = (value) => (value > 0 ? "+" : value < 0 ? "−" : "") + num(Math.abs(value));
const esc = (text) => String(text).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const settingName = (k = key()) => t(`set_${k}`);
const flooded = () => state.run.floodedAt !== null;
const hasStripes = () => state.boundary === "divergent" && (state.crust === "oo" || flooded());

/* ------------------------------------------------------------------ */
/* Controls                                                            */
/* ------------------------------------------------------------------ */
function renderControls() {
  refs.boundaryChoices.innerHTML = Object.keys(SETUPS).map((b) =>
    `<button type="button" class="choice ${b === state.boundary ? "active" : ""}" data-boundary="${b}" aria-pressed="${b === state.boundary}"><span>${esc(t(`b_${b}`))}</span><small>${esc(t(`b_${b}_sub`))}</small></button>`).join("");
  refs.crustChoices.innerHTML = SETUPS[state.boundary].map((c) =>
    `<button type="button" class="choice ${c === state.crust ? "active" : ""}" data-crust="${c}" aria-pressed="${c === state.crust}">${esc(t(`c_${c}`))}</button>`).join("");
  refs.boundaryChoices.querySelectorAll("[data-boundary]").forEach((button) => button.addEventListener("click", () => {
    if (state.running) return;
    state.boundary = button.dataset.boundary; state.crust = SETUPS[state.boundary][0]; state.measure = DEFAULT_MEASURE[state.boundary]; restart(); refs.boundaryChoices.querySelector(`[data-boundary="${state.boundary}"]`)?.focus();
  }));
  refs.crustChoices.querySelectorAll("[data-crust]").forEach((button) => button.addEventListener("click", () => {
    if (state.running) return;
    state.crust = button.dataset.crust; restart(); refs.crustChoices.querySelector(`[data-crust="${state.crust}"]`)?.focus();
  }));
  document.querySelectorAll(".choice").forEach((button) => { button.disabled = state.running; });
}

function restart() {
  cancelActiveRun();
  state.chartSelection = [];
  state.run = createRun(state.seed, state.boundary, state.crust);
  updateUrl();
  render();
}

function updateUrl() {
  const query = new URLSearchParams({ seed: state.seed, boundary: state.boundary, crust: state.crust, speed: state.speed });
  const lang = params.get("lang"); if (lang) query.set("lang", lang);
  history.replaceState({}, "", `${location.pathname}?${query}`);
}

/* ------------------------------------------------------------------ */
/* Main render                                                         */
/* ------------------------------------------------------------------ */
function render() {
  const run = state.run, current = run.history.at(-1), complete = run.time >= MAX_TIME;
  renderControls();
  refs.time.textContent = t("timeBadge", { n: num(run.time) });
  refs.sceneHeading.textContent = settingName();
  refs.sceneSub.textContent = state.boundary === "transform" ? t("mapView") : t("crossSection");
  refs.hint.innerHTML = renderRich(t(`hint_${key()}`));
  refs.speedOutput.textContent = t("speedOut", { v: state.speed });
  refs.speedHint.textContent = t("speedHint", { v: state.speed, km: num(state.speed * 10) });
  refs.seed.textContent = state.seed;
  refs.high.textContent = t("meters", { n: num(current.highest) });
  refs.low.textContent = t("meters", { n: num(current.lowest) });
  refs.volc.textContent = num(current.volcanoes);
  refs.quakes.textContent = num(current.quakesTotal);
  const deepestEver = Math.max(0, ...run.history.map((h) => h.deepest ?? 0));
  refs.deep.textContent = run.time ? t("kmUnit", { n: num(deepestEver) }) : "—";
  refs.ocean.textContent = t("kmUnit", { n: signed(current.oceanChange) });
  refs.outcome.textContent = run.time ? outcomeSentence(current) : t("outcomeStart");
  refs.eventCard.textContent = complete ? t("eventMax", { n: MAX_TIME }) : current.event ? eventSummary(current) : t("eventStart");
  refs.step.disabled = state.running || complete;
  refs.run.disabled = state.running || complete;
  refs.speed.disabled = state.running;
  refs.clearChartSelection.disabled = state.chartSelection.length === 0;
  refs.measure.value = state.measure;
  drawScene();
  renderLegend();
  renderChart();
  renderRocks();
  refs.history.replaceChildren(...run.history.map(row));
  refs.reflection.innerHTML = renderRich(run.time ? reflectionText(current) : t("reflectStart"));
}

function eventSummary(current) {
  const e = current.event;
  const parts = [t("evQuakes", { n: num(e.quakes), m: e.largest ? e.largest.toFixed(1) : "—" })];
  if (e.flooded) parts.push(t("evFlooded"));
  if (e.islands) parts.push(t("evIslands"));
  if (e.firstVolcano) parts.push(t("evFirstVolcano"));
  if (e.supereruption) parts.push(t("evSuper"));
  else if (e.newVolcanoes && state.boundary === "hotspot") parts.push(t("evNewVolcano"));
  if (e.reversals) parts.push(t("evReversals", { n: e.reversals }));
  return parts.join(" · ");
}

function outcomeSentence(current) {
  const run = state.run;
  const lead = t("outLead", { t: num(run.time), v: current.speed ?? state.speed, km: num(run.moved) });
  const k = key();
  let body = "";
  if (k === "divergent-oo") body = t("out_div_oo", { oc: num(current.oceanChange), n: num(run.stripes.length) });
  else if (k === "divergent-cc") body = flooded() ? t("out_div_cc_flooded", { tf: num(run.floodedAt), oc: num(current.oceanChange) }) : t("out_div_cc", { km: num(run.riftWidth) });
  else if (k === "convergent-cc") body = t("out_conv_cc", { h: num(current.highest) });
  else if (state.boundary === "convergent") body = t("out_sub", { sub: num(run.subducted), low: num(Math.abs(current.lowest)), deep: num(Math.max(0, ...run.history.map((h) => h.deepest ?? 0))) }) + " " + (current.volcanoes ? t("out_volc", { n: current.volcanoes }) : t("out_noVolc"));
  else if (state.boundary === "transform") body = t("out_transform", { km: num(run.moved), q: num(current.quakesTotal) });
  else if (k === "hotspot-o") { const chain = chainTable(run), oldest = chain.at(-1); body = t("out_hot_o", { n: chain.length, d: num(oldest.dist), a: num(oldest.age) }); }
  else if (k === "hotspot-c") body = run.supereruptions ? t("out_hot_c", { n: run.supereruptions, km: num(run.moved) }) : t("out_hot_c_none", { km: num(run.moved) });
  return `${lead} ${body}`;
}

function reflectionText(current) {
  const prediction = state.prediction === "" ? t("reflectNone") : t("reflectYours", { text: t({ div: "predDiv", cc: "predCC", oc: "predOC", tr: "predTr" }[state.prediction]) });
  return t("reflectBody", { prediction, t: num(current.time), setting: settingName() });
}

function row(item) {
  const tr = document.createElement("tr");
  if (state.chartSelection.some((point) => point.time === item.time)) tr.classList.add("chart-selected");
  const values = [item.time, item.speed ?? "—", num(item.moved), num(item.highest), num(item.lowest), item.volcanoes, item.time ? item.quakes : "—", item.deepest ?? "—", item.largest?.toFixed(1) ?? "—", signed(item.oceanChange)];
  values.forEach((value) => { const cell = document.createElement("td"); cell.textContent = value; tr.append(cell); });
  return tr;
}

/* ------------------------------------------------------------------ */
/* Scene drawing (SVG, original art)                                   */
/* ------------------------------------------------------------------ */
const W = 800, SEA = 150, ES = 0.012, PXKM = 0.25, Y0 = 245, KMY = 0.24;
const C = { sky1: "#e4f1f5", sky2: "#c9e2ec", water: "#5f9fbe", oceanCrust: "#3f4c5a", contCrust: "#c8a36a", lith: "#8b6b55", mantle: "#e3a77b", mantle2: "#d99566", magma: "#e4572e", quake: "#ffd23f", volc: "#6a4636", extinct: "#8d8a86", normal: "#25313d", reversed: "#ece5d3" };
const yE = (elev) => SEA - elev * ES;
const OB = (elev) => yE(elev) + 42; // ocean lithosphere base
const CB = (elev) => yE(elev) + 72; // continental lithosphere base
const pts = (list) => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
const range = (a, b, step = 4) => { const out = []; for (let x = a; x <= b; x += step) out.push(x); if (out.at(-1) !== b) out.push(b); return out; };
const hash = (n) => { let v = (n * 2654435761) >>> 0; v ^= v >>> 13; v = Math.imul(v, 1274126177) >>> 0; return (v >>> 0) / 4294967296; };

// A plate: surface from elev(x), crust band of given thickness and type(x), lithosphere down to base(x).
function plate(xs, elev, typeAt, base, opts = {}) {
  const top = xs.map((x) => [x, yE(elev(x))]);
  const bottom = xs.map((x) => [x, Math.max(base(x), yE(elev(x)) + 12)]).reverse();
  let out = `<polygon points="${pts([...top, ...bottom])}" fill="${C.lith}"/>`;
  let segment = [], segType = null;
  const flush = () => {
    if (segment.length > 1) {
      const thick = (x) => (segType === "c" ? 24 : 9) + (opts.root ? opts.root(x) : 0);
      const upper = segment.map((x) => [x, yE(elev(x))]);
      const lower = segment.map((x) => [x, yE(elev(x)) + thick(x)]).reverse();
      out += `<polygon class="crust-${segType}" points="${pts([...upper, ...lower])}" fill="${segType === "c" ? C.contCrust : C.oceanCrust}"${opts.clip && segType === "o" ? ` id="${opts.clip}"` : ""}/>`;
    }
  };
  xs.forEach((x) => { const type = typeAt(x); if (type !== segType) { if (segment.length) segment.push(x); flush(); segment = [x]; segType = type; } else segment.push(x); });
  flush();
  return out;
}

function arrow(x1, x2, y, label) {
  const dir = Math.sign(x2 - x1), head = x2 - dir * 10;
  const tx = (x1 + x2) / 2;
  return `<g class="motion"><line x1="${x1}" y1="${y}" x2="${head}" y2="${y}" stroke="#fffdf8" stroke-width="5" stroke-linecap="round"/><polygon points="${x2},${y} ${head},${y - 8} ${head},${y + 8}" fill="#fffdf8"/>${label ? `<text x="${tx}" y="${y - 10}" text-anchor="middle" class="scene-label light">${esc(label)}</text>` : ""}</g>`;
}

function volcanoShape(x, elev, baseElev, active, scale = 1) {
  const apex = yE(elev), base = yE(baseElev), h = Math.max(6, base - apex), half = (10 + h * 0.5) * scale;
  const color = active ? C.volc : C.extinct;
  let svg = `<polygon points="${x - half},${base + 1} ${x - 4},${apex} ${x + 4},${apex} ${x + half},${base + 1}" fill="${color}" stroke="rgba(0,0,0,.25)"/>`;
  if (active) svg += `<path d="M${x - 4} ${apex} q4 -10 8 0" fill="${C.magma}"/><circle class="glow" cx="${x}" cy="${apex - 4}" r="4" fill="${C.magma}" opacity=".8"/>`;
  return svg;
}

function quakeDots(placer) {
  const history = state.run.history;
  let svg = "";
  history.slice(-3).forEach((h, back, list) => {
    const age = list.length - 1 - back; // 0 = latest
    (h.event?.list ?? []).forEach(([depth, mag, r], index) => {
      const [x, y] = placer(depth, r, hash(index + h.time * 97));
      const radius = 2 + Math.max(0, mag - 4) * 1.4;
      svg += `<circle class="quake ${age === 0 ? "new" : ""}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${radius.toFixed(1)}" fill="${C.quake}" stroke="#7a2e00" stroke-width="1" opacity="${[1, 0.45, 0.22][age]}" style="--d:${(index % 12) * 40}ms"/>`;
    });
  });
  return svg;
}

function background(water = true) {
  return `<defs><linearGradient id="sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${C.sky1}"/><stop offset="1" stop-color="${C.sky2}"/></linearGradient>
    <linearGradient id="mantle" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${C.mantle}"/><stop offset="1" stop-color="${C.mantle2}"/></linearGradient></defs>
    <rect width="${W}" height="${SEA}" fill="url(#sky)"/>
    ${water ? `<rect y="${SEA}" width="${W}" height="150" fill="${C.water}"/>` : `<rect y="${SEA}" width="${W}" height="70" fill="${C.mantle}"/>`}
    <rect y="205" width="${W}" height="215" fill="url(#mantle)"/>
    <g class="mantle-flow" stroke="#c7794d" stroke-width="1.5" fill="none" opacity=".55"><path d="M40 360 q60 -26 120 0 t120 0"/><path d="M520 380 q60 -26 120 0 t120 0"/><path d="M300 400 q50 -20 100 0"/></g>`;
}

function labels(extra = "") {
  return `<text x="${W - 8}" y="${SEA - 5}" text-anchor="end" class="scene-label">${esc(t("seaLevel"))}</text>
    <text x="12" y="368" class="scene-label">${esc(t("mantleLabel"))}</text>
    <text x="12" y="20" class="scene-label muted">${esc(t("notToScale"))}</text>${extra}`;
}

function drawScene() {
  const run = state.run, k = key(), now = run.history.at(-1);
  let svg = "";
  if (k === "divergent-oo" || (k === "divergent-cc" && flooded())) svg = sceneRidge(run, k);
  else if (k === "divergent-cc") svg = sceneRift(run, now);
  else if (k === "convergent-cc") svg = sceneCollision(run, now);
  else if (state.boundary === "convergent") svg = sceneSubduction(run, now, state.crust === "oo");
  else if (state.boundary === "transform") svg = sceneTransform(run);
  else svg = sceneHotspot(run, now, state.crust === "o");
  refs.scene.innerHTML = `<title id="scene-title">${esc(settingName())}</title><desc id="scene-desc">${esc(sceneDescription())}</desc>${svg}`;
  refs.sceneDesc.textContent = sceneDescription();
}

function sceneDescription() {
  return t(`desc_${key()}`) + " " + (state.run.time ? outcomeSentence(state.run.history.at(-1)) : t("outcomeStart"));
}

function stripeSegments(run, halfW, scale = PXKM) {
  // From the ridge outward: [startPx, endPx, polarity]
  const edges = [...run.stripes].sort((a, b) => a.dist - b.dist).map((s) => s.dist * scale);
  const out = []; let start = 0, polarity = run.polarity;
  edges.forEach((edge) => { out.push([start, Math.min(edge, halfW), polarity]); start = edge; polarity = -polarity; });
  out.push([start, halfW, polarity]);
  return out.filter(([a, b]) => b > a);
}

function sceneRidge(run, k) {
  const isRift = k === "divergent-cc";
  const age = isRift ? run.time - run.floodedAt : run.time;
  const halfO = Math.min(isRift ? 300 : 390, (run.spreadKm / 2) * PXKM);
  const margin = isRift ? (run.floodWidth / 2) * PXKM : 0;
  const elev = (x) => {
    const d = Math.abs(x - 400);
    if (d <= halfO) return -2500 - 350 * Math.sqrt(halfO ? (d / halfO) * age : 0) - (d < 5 ? 300 : 0);
    if (!isRift) return Math.max(-4000, -2500 - 350 * Math.sqrt(age + (d - halfO) / 20));
    const m = d - halfO;
    if (m <= margin) { const edgeOcean = -2500 - 350 * Math.sqrt(age); return edgeOcean + (300 - edgeOcean) * Math.pow(m / Math.max(1, margin), 0.6); }
    return 300 + (state.run.mountain - 300) * Math.exp(-Math.pow((m - margin - 18) / 40, 2));
  };
  const typeAt = (x) => (isRift && Math.abs(x - 400) > halfO ? "c" : "o");
  const base = (x) => (typeAt(x) === "c" ? CB(300) : yE(elev(x)) + 16 + Math.min(26, Math.abs(x - 400) * 0.12));
  const xs = range(0, W);
  let svg = background();
  svg += plate(xs.filter((x) => x <= 400), elev, typeAt, base) + plate(xs.filter((x) => x >= 400), elev, typeAt, base);
  // magnetic stripes painted on the new ocean crust
  const segs = stripeSegments(run, halfO);
  let stripes = "";
  segs.forEach(([a, b, polarity]) => {
    [[400 + a, 400 + b], [400 - b, 400 - a]].forEach(([x1, x2]) => {
      const sx = range(Math.round(x1), Math.round(x2), 2);
      const up = sx.map((x) => [x, yE(elev(x)) + 0.5]);
      const low = sx.map((x) => [x, yE(elev(x)) + 8.5]).reverse();
      stripes += `<polygon points="${pts([...up, ...low])}" fill="${polarity > 0 ? C.normal : C.reversed}"/>`;
    });
  });
  svg += stripes;
  // magma rising under the ridge
  svg += `<path d="M370 300 Q 400 250 395 ${yE(-2800)} L 405 ${yE(-2800)} Q 400 250 430 300 Z" fill="${C.magma}" opacity=".85"/>`;
  svg += quakeDots((depth, r) => [400 + (r - 0.5) * 40, yE(-2600) + 6 + depth * 1.2]);
  svg += arrow(330, 230, 236, t("plateMoves")) + arrow(470, 570, 236, t("plateMoves"));
  svg += labels(`<text x="400" y="${yE(-2500) - 34}" text-anchor="middle" class="scene-label">${esc(t(isRift ? "newOceanLabel" : "ridgeLabel"))}</text><line x1="400" y1="${yE(-2500) - 30}" x2="400" y2="${yE(-2500) - 6}" stroke="#173138" stroke-width="1"/>`);
  return svg;
}

function sceneRift(run, now) {
  const rw = Math.max(8, (run.riftWidth / 2) * PXKM);
  const floor = now.lowest;
  const elev = (x) => {
    const d = Math.abs(x - 400);
    if (d <= rw) return floor;
    const m = d - rw;
    if (m < 14) return floor + (run.mountain - floor) * (m / 14);
    return 300 + (run.mountain - 300) * Math.exp(-Math.pow((m - 14) / 45, 2));
  };
  const xs = range(0, W);
  let svg = background(false);
  svg += plate(xs.filter((x) => x <= 400), elev, () => "c", (x) => CB(300) - Math.max(0, 40 - Math.abs(x - 400)) * 0.6, { root: (x) => -Math.max(0, 16 - Math.abs(x - 400) / 4) });
  svg += plate(xs.filter((x) => x >= 400), elev, () => "c", (x) => CB(300) - Math.max(0, 40 - Math.abs(x - 400)) * 0.6, { root: (x) => -Math.max(0, 16 - Math.abs(x - 400) / 4) });
  // faults on rift walls
  svg += `<g stroke="#5b4026" stroke-width="1.5"><line x1="${400 - rw}" y1="${yE(floor)}" x2="${400 - rw - 14}" y2="${yE(floor) + 30}"/><line x1="${400 + rw}" y1="${yE(floor)}" x2="${400 + rw + 14}" y2="${yE(floor) + 30}"/></g>`;
  svg += `<path d="M380 320 Q 400 260 397 ${yE(floor) + 18} L 403 ${yE(floor) + 18} Q 400 260 420 320 Z" fill="${C.magma}" opacity=".7"/>`;
  for (let i = 0; i < now.volcanoes; i++) { const x = 400 + (i % 2 ? 1 : -1) * (rw + 26 + i * 8); svg += volcanoShape(x, run.mountain + 900, run.mountain - 200, true, 0.6); }
  svg += quakeDots((depth, r) => [400 + (r - 0.5) * (rw * 2 + 40), yE(floor) + 6 + depth * 1.2]);
  svg += arrow(330, 230, 200, t("plateMoves")) + arrow(470, 570, 200, t("plateMoves"));
  svg += labels(`<text x="400" y="${yE(floor) - 40}" text-anchor="middle" class="scene-label">${esc(t("riftLabel"))}</text>`);
  return svg;
}

function sceneSubduction(run, now, oceanOcean) {
  const yT = yE(now.lowest), depth = slabDepth(run);
  const L = Math.max(40, (Math.max(yT, Y0) + depth * KMY + 10 - yT) / 0.7071);
  const A = [400, yT], E = [400 + L * 0.7071, yT + L * 0.7071], F = [E[0] - 26, E[1] + 26];
  const LB = OB(-4000), gx = F[0] - (F[1] - LB);
  const leftElev = (x) => (x < 290 ? -4000 : -4000 + (now.lowest + 4000) * Math.pow((x - 290) / 110, 2));
  const slabTopY = (x) => yT + (x - 400);
  let svg = background();
  // sinking (subducting) ocean plate
  const leftTop = range(0, 400).map((x) => [x, yE(leftElev(x))]);
  svg += `<polygon points="${pts([...leftTop, E, F, [gx, LB], [0, LB]])}" fill="${C.lith}"/>`;
  svg += `<polygon points="${pts([...leftTop, ...range(0, 400).reverse().map((x) => [x, yE(leftElev(x)) + 9])])}" fill="${C.oceanCrust}"/>`;
  svg += `<line x1="${A[0]}" y1="${A[1] + 4}" x2="${E[0]}" y2="${E[1] + 4}" stroke="${C.oceanCrust}" stroke-width="9"/>`;
  // overriding plate
  const archX = oceanOcean ? 545 : 560;
  const rightElev = oceanOcean
    ? (x) => Math.max(-4000 + (x < 430 ? (now.lowest + 4000) * Math.pow(Math.max(0, 430 - x) / 40, 2) : 0), x < 400 ? now.lowest : -4000, -4000 + (now.highest + 4000) * Math.exp(-Math.pow((x - archX) / 42, 2)))
    : (x) => (x < 450 ? now.lowest + (300 - now.lowest) * Math.pow((x - 386) / 64, 0.7) : 300 + (now.highest - 300) * Math.exp(-Math.pow((x - archX) / 85, 2)));
  const xsR = range(386, W);
  svg += plate(xsR, rightElev, () => (oceanOcean ? "o" : "c"), (x) => Math.min(oceanOcean ? OB(-4000) : CB(300), slabTopY(x) - 1));
  // magma from the slab once it is about 100 km deep
  if (now.volcanoes > 0) {
    const sx = 400 + (Math.max(yT, Y0) + 100 * KMY - yT);
    svg += `<path d="M${sx} ${slabTopY(sx)} C ${sx + 20} ${slabTopY(sx) - 40}, ${archX - 10} ${yE(now.highest) + 70}, ${archX} ${yE(now.highest) + 12}" stroke="${C.magma}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".85"/>`;
    for (let i = 0; i < now.volcanoes; i++) {
      const x = archX + (i - (now.volcanoes - 1) / 2) * 26;
      const surfaceHere = rightElev(x);
      svg += volcanoShape(x, surfaceHere + (oceanOcean ? 300 : 1100) * (1 - Math.abs(i - (now.volcanoes - 1) / 2) * 0.18), surfaceHere - 200, true, 0.55);
    }
  }
  svg += quakeDots((d, r, j) => {
    const y = Math.max(yT, Y0) + d * KMY;
    return [400 + (y - yT) - j * 24 + (d < 40 ? (r - 0.5) * 40 : 0), y + j * 4];
  });
  svg += arrow(120, 240, 225, t("plateMoves")) + arrow(760, 660, oceanOcean ? 225 : 200, t("plateMoves"));
  svg += labels(`<text x="400" y="${yT + 22}" text-anchor="middle" class="scene-label light">${esc(t("trenchLabel"))}</text>
    <text x="${Math.min(700, E[0] - 30)}" y="${Math.min(392, E[1] - 10)}" text-anchor="end" class="scene-label">${esc(t("slabLabel"))}</text>`);
  return svg;
}

function sceneCollision(run, now) {
  const peak = (x) => Math.exp(-Math.pow((x - 400) / 110, 2));
  const elev = (x) => 300 + (now.highest - 300) * peak(x);
  const root = (x) => ((now.highest - 300) / 8500) * 70 * peak(x);
  const xs = range(0, W);
  let svg = background(false);
  svg += plate(xs, elev, () => "c", (x) => CB(300) + root(x) + 8, { root });
  // folded layers in the crust
  let folds = "";
  for (let i = 1; i <= 3; i++) {
    const line = range(150, 650, 8).map((x) => [x, yE(elev(x)) + i * (5 + root(x) / 5) + Math.sin(x / 18) * peak(x) * 6]);
    folds += `<polyline points="${pts(line)}" fill="none" stroke="#9c7a45" stroke-width="1.4" opacity=".8"/>`;
  }
  svg += folds + `<line x1="400" y1="${yE(now.highest) + 14}" x2="400" y2="${CB(300) + root(400)}" stroke="#5b4026" stroke-width="1.5" stroke-dasharray="4 4"/>`;
  svg += `<polygon points="372,${CB(300) + root(400) + 28} 430,${CB(300) + root(400) + 22} 470,${CB(300) + root(400) + 96} 450,${CB(300) + root(400) + 104}" fill="${C.lith}" opacity=".8"/>`;
  svg += quakeDots((depth, r) => [400 + (r - 0.5) * 220, yE(elev(400 + (r - 0.5) * 220)) + 8 + depth * 1.2]);
  svg += arrow(110, 230, 200, t("plateMoves")) + arrow(690, 570, 200, t("plateMoves"));
  svg += labels(`<text x="400" y="${yE(now.highest) - 10}" text-anchor="middle" class="scene-label">${esc(t("foldLabel"))}</text>`);
  return svg;
}

function sceneTransform(run) {
  const ocean = state.crust === "oo";
  const off = Math.min(640, run.moved * PXKM);
  const plateFill = ocean ? "#4c7b94" : "#d9c08a", plateFill2 = ocean ? "#5a88a0" : "#cdb27a";
  let svg = `<rect width="${W}" height="420" fill="${plateFill}"/><rect y="210" width="${W}" height="210" fill="${plateFill2}"/>`;
  // texture
  for (let i = 0; i < 40; i++) svg += `<circle cx="${hash(i) * W}" cy="${20 + hash(i + 99) * 380}" r="${1.5 + hash(i + 7) * 2.5}" fill="#000" opacity=".06"/>`;
  const feature = ocean ? "#2a3d4a" : "#2f7fb3";
  const topX = 400 - off / 2, botX = 400 + off / 2;
  const wiggle = (x0, y0, y1) => range(y0, y1, 10).map((y) => [x0 + Math.sin(y / 22) * 8, y]);
  svg += `<polyline points="${pts(wiggle(topX, 20, 210))}" fill="none" stroke="${feature}" stroke-width="${ocean ? 7 : 6}" stroke-linecap="round"/>`;
  svg += `<polyline points="${pts(wiggle(botX, 210, 400))}" fill="none" stroke="${feature}" stroke-width="${ocean ? 7 : 6}" stroke-linecap="round"/>`;
  svg += `<line x1="0" y1="210" x2="${W}" y2="210" stroke="#7a2e00" stroke-width="3" stroke-dasharray="10 6"/>`;
  if (off > 6) svg += `<g><line x1="${topX + 8}" y1="196" x2="${botX - 8}" y2="196" stroke="#173138" stroke-width="1.5"/><polygon points="${topX + 2},196 ${topX + 10},191 ${topX + 10},201" fill="#173138"/><polygon points="${botX - 2},196 ${botX - 10},191 ${botX - 10},201" fill="#173138"/><text x="${(topX + botX) / 2}" y="188" text-anchor="middle" class="scene-label">${esc(t("offsetLabel", { km: num(Math.round(run.moved)) }))}</text></g>`;
  svg += quakeDots((depth, r) => [40 + r * 720, 210 + (depth / 20 - 0.5) * 16]);
  svg += arrow(560, 440, 70, t("plateMoves")) + arrow(240, 360, 330, t("plateMoves"));
  svg += `<rect x="0" y="0" width="${W}" height="26" fill="rgba(255,253,248,.82)"/><text x="10" y="18" class="scene-label">${esc(t(ocean ? "featureRidge" : "featureStream"))}</text><text x="${W - 8}" y="18" text-anchor="end" class="scene-label muted">${esc(t("mapViewNote"))}</text><text x="${W - 8}" y="232" text-anchor="end" class="scene-label light">${esc(t("faultLabel"))}</text>`;
  return svg;
}

function sceneHotspot(run, now, ocean) {
  const PLUME = 600;
  const chain = chainTable(run);
  const land = (x) => 1400 + (now.highest - 1400) * Math.exp(-Math.pow((x - PLUME) / 90, 2));
  const elev = ocean ? () => -4000 : land;
  const xs = range(0, W);
  let svg = background(ocean);
  svg += `<path d="M${PLUME - 40} 420 C ${PLUME - 30} 340, ${PLUME - 18} 280, ${PLUME - 10} ${ocean ? OB(-4000) : CB(1400)} L ${PLUME + 10} ${ocean ? OB(-4000) : CB(1400)} C ${PLUME + 18} 280, ${PLUME + 30} 340, ${PLUME + 40} 420 Z" fill="${C.magma}" opacity=".75"/>`;
  svg += plate(xs, elev, () => (ocean ? "o" : "c"), () => (ocean ? OB(-4000) : CB(1400)));
  svg += `<path d="M${PLUME} ${ocean ? OB(-4000) : CB(1400)} L ${PLUME} ${yE(ocean ? -3600 : now.highest) + 6}" stroke="${C.magma}" stroke-width="5" opacity=".9"/>`;
  let lastLabel = Infinity;
  [...chain].reverse().forEach((v) => {
    const x = PLUME - v.dist * PXKM;
    if (x < -40) return;
    if (ocean) svg += volcanoShape(x, v.height, -4000, v.active);
    else {
      const surf = land(x);
      svg += `<ellipse cx="${x}" cy="${yE(surf) + 1}" rx="17" ry="5" fill="${v.active ? "#5a2a1c" : "#7b6a55"}"/>`;
      if (v.active) svg += `<path d="M${x - 6} ${yE(surf) - 4} q3 -8 6 0 t6 0" stroke="#fffdf8" stroke-width="2" fill="none" opacity=".8"/>`;
    }
    if (Math.abs(lastLabel - x) > 38) { svg += `<text x="${x}" y="${(ocean ? Math.min(yE(Math.max(v.height, -2000)), yE(0)) : yE(land(x))) - 14}" text-anchor="middle" class="scene-label age">${esc(t("ageLabel", { a: num(v.age) }))}</text>`; lastLabel = x; }
  });
  if (now.event?.supereruption) svg += `<g class="ash" fill="#7c7c7c" opacity=".75"><circle cx="${PLUME}" cy="40" r="26"/><circle cx="${PLUME - 26}" cy="56" r="20"/><circle cx="${PLUME + 28}" cy="52" r="22"/><rect x="${PLUME - 6}" y="56" width="12" height="${yE(now.highest) - 60}"/></g>`;
  svg += quakeDots((depth, r) => [PLUME + (r - 0.5) * 70, yE(elev(PLUME)) + 6 + depth * 1.2]);
  svg += arrow(320, 200, ocean ? 225 : 185, t("plateMoves"));
  svg += labels(`<text x="${PLUME + 48}" y="330" class="scene-label">${esc(t("plumeLabel"))}</text><text x="${PLUME + 48}" y="346" class="scene-label muted">${esc(t("plumeStays"))}</text>`);
  return svg;
}

function renderLegend() {
  const items = [["quake", t("lgQuake")]];
  if (state.boundary !== "transform") items.push(["volcano", t("lgVolcano")], ["ocean", t("lgOceanCrust")], ["cont", t("lgContCrust")], ["mantle", t("lgMantle")], ["magma", t("lgMagma")]);
  if (hasStripes()) items.push(["normal", t("lgNormal")], ["reversed", t("lgReversed")]);
  refs.legend.innerHTML = items.map(([cls, label]) => `<li><i class="sw sw-${cls}" aria-hidden="true"></i>${esc(label)}</li>`).join("");
}

/* ------------------------------------------------------------------ */
/* Evidence in the rocks                                               */
/* ------------------------------------------------------------------ */
function depthBins() {
  const bins = [0, 0, 0];
  state.run.history.forEach((h) => (h.event?.list ?? []).forEach(([d]) => { bins[d < 70 ? 0 : d < 300 ? 1 : 2]++; }));
  return bins;
}

function renderRocks() {
  const run = state.run;
  let html = "";
  if (hasStripes()) {
    refs.rocksHeading.textContent = t("rocksStripes");
    const rows = stripeTable(run);
    html += `<p class="rocks-intro">${renderRich(t("stripesIntro"))}</p>${stripeBar(run)}`;
    html += rows.length
      ? `<div class="table-wrap small-table" tabindex="0" aria-label="${esc(t("stripesTableLabel"))}"><table><thead><tr><th>${t("thEdge")}</th><th>${t("thAge")}</th><th>${t("thFromRidge")}</th><th>${t("thBetween")}</th></tr></thead><tbody>${rows.map((r, i) => `<tr><td>${i + 1}</td><td>${r.age.toFixed(1)}</td><td>${num(r.fromRidge)}</td><td>${num(r.between)}</td></tr>`).join("")}</tbody></table></div><p class="hint">${renderRich(t("stripesMath"))}</p>`
      : `<p class="hint">${t("stripesNone")}</p>`;
  } else if (state.boundary === "hotspot") {
    refs.rocksHeading.textContent = t(state.crust === "o" ? "rocksChain" : "rocksCalderas");
    const rows = chainTable(run);
    html += `<p class="rocks-intro">${renderRich(t(state.crust === "o" ? "chainIntro" : "calderaIntro"))}</p>`;
    html += rows.length
      ? `<div class="table-wrap small-table" tabindex="0" aria-label="${esc(t("chainTableLabel"))}"><table><thead><tr><th>${t("thVolcano")}</th><th>${t("thAge")}</th><th>${t("thFromHotspot")}</th>${state.crust === "o" ? `<th>${t("thHeight")}</th>` : ""}<th>${t("thStatus")}</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${r.id}</td><td>${r.age}</td><td>${num(r.dist)}</td>${state.crust === "o" ? `<td>${num(r.height)}</td>` : ""}<td>${statusText(r)}</td></tr>`).join("")}</tbody></table></div><p class="hint">${renderRich(t("chainMath"))}</p>`
      : `<p class="hint">${t("calderaNone")}</p>`;
  } else {
    refs.rocksHeading.textContent = t("rocksQuakes");
    html += `<p class="rocks-intro">${renderRich(t(`rocks_${state.boundary === "divergent" ? "rift" : state.boundary === "transform" ? "transform" : state.crust === "cc" ? "collision" : "subduction"}`))}</p>`;
  }
  const bins = depthBins(), total = bins.reduce((a, b) => a + b, 0);
  html += `<h3>${t("depthHeading")}</h3><div class="depth-bars" role="list">${["binShallow", "binMid", "binDeep"].map((label, i) =>
    `<div role="listitem" class="depth-row"><span>${t(label)}</span><span class="bar"><i style="width:${total ? (bins[i] / total) * 100 : 0}%"></i></span><b>${num(bins[i])}</b></div>`).join("")}</div>`;
  refs.rocksBody.innerHTML = html;
}

function statusText(r) {
  if (state.crust === "c") return t(r.active ? "stActiveCaldera" : "stOldCaldera");
  if (r.active) return t("stActive");
  return t(r.height > 0 ? "stIsland" : "stSeamount");
}

function stripeBar(run) {
  // The map strip zooms to fit, so stripes stay readable at any speed or time.
  const halfKm = Math.max(25, run.spreadKm / 2), scale = 380 / Math.max(halfKm, 120);
  const halfO = halfKm * scale;
  const segs = stripeSegments(run, halfO, scale);
  let rects = "";
  segs.forEach(([a, b, polarity]) => {
    rects += `<rect x="${400 + a}" y="14" width="${b - a}" height="34" fill="${polarity > 0 ? C.normal : C.reversed}"/><rect x="${400 - b}" y="14" width="${b - a}" height="34" fill="${polarity > 0 ? C.normal : C.reversed}"/>`;
  });
  return `<svg class="stripe-bar" viewBox="0 0 800 70" role="img" aria-label="${esc(t("stripeBarLabel", { n: run.stripes.length }))}">
    <rect x="0" y="14" width="800" height="34" fill="#9aa7ad"/>${rects}
    <line x1="400" y1="6" x2="400" y2="56" stroke="${C.magma}" stroke-width="3"/>
    <text x="400" y="68" text-anchor="middle" class="scene-label">${esc(t("ridgeLabel"))}</text>
    <text x="4" y="66" class="scene-label muted">${esc(t("olderLabel"))}</text><text x="796" y="66" text-anchor="end" class="scene-label muted">${esc(t("olderLabel"))}</text></svg>`;
}

/* ------------------------------------------------------------------ */
/* Chart with two-point rate tool                                      */
/* ------------------------------------------------------------------ */
const MEASURE_UNIT = { highest: "m", lowest: "m", volcanoes: "", quakesTotal: "", oceanChange: "km", moved: "km" };

function niceRange(values) {
  let lo = Math.min(...values), hi = Math.max(...values);
  if (hi - lo < 4) { const pad = Math.max(2, Math.abs(lo) * 0.05); lo -= pad; hi += pad; }
  const span = hi - lo, step = Math.pow(10, Math.floor(Math.log10(span / 4)));
  const nice = Math.max(1, [1, 2, 5, 10].map((m) => m * step).find((s) => span / s <= 5) ?? step * 10);
  return { lo: Math.floor(lo / nice) * nice, hi: Math.ceil(hi / nice) * nice, step: nice };
}

function renderChart() {
  const history = state.run.history, m = state.measure;
  const width = 600, height = 300, left = 70, right = 20, top = 22, bottom = 50;
  const uw = width - left - right, uh = height - top - bottom;
  const maxT = Math.max(10, history.at(-1).time);
  const { lo, hi, step } = niceRange(history.map((h) => h[m]));
  const x = (time) => left + (time / maxT) * uw;
  const y = (value) => top + (1 - (value - lo) / (hi - lo)) * uh;
  const ticks = []; for (let v = lo; v <= hi + 1e-9; v += step) ticks.push(v);
  const xTicks = [...new Set([0, Math.round(maxT / 4), Math.round(maxT / 2), Math.round(maxT * 0.75), maxT])];
  const unit = MEASURE_UNIT[m];
  const label = t(`m${{ highest: "High", lowest: "Low", volcanoes: "Volc", quakesTotal: "Quakes", oceanChange: "Ocean", moved: "Moved" }[m]}`);
  const speedChanges = history.filter((h, i) => i > 1 && h.speed !== history[i - 1].speed);
  const sel = selectedRange();
  const points = history.map((h) => {
    const sel = state.chartSelection.some((p) => p.time === h.time);
    const aria = t("pointLabel", { t: h.time, v: num(h[m]), u: unit, name: label });
    return `<g class="chart-point ${sel ? "selected-point" : ""}" role="button" tabindex="${h.time === 0 ? 0 : -1}" data-time="${h.time}" aria-label="${esc(aria)}"><title>${esc(aria)}</title><circle class="point-hit" cx="${x(h.time)}" cy="${y(h[m])}" r="7" fill="transparent"/><circle class="point-mark" cx="${x(h.time)}" cy="${y(h[m])}" r="3.6"/></g>`;
  }).join("");
  refs.chart.innerHTML = `<title id="chart-title">${esc(t("chartTitle", { name: label }))}</title><desc id="chart-description">${esc(chartText(label, unit))}</desc>
    <text class="axis-label" x="${left + uw / 2}" y="${height - 8}" text-anchor="middle">${esc(t("axisTime"))}</text>
    <text class="axis-label" transform="translate(14 ${top + uh / 2}) rotate(-90)" text-anchor="middle">${esc(label + (unit ? ` (${unit})` : ""))}</text>
    <g class="grid">${ticks.map((v) => `<line x1="${left}" y1="${y(v)}" x2="${width - right}" y2="${y(v)}"/><text x="${left - 8}" y="${y(v) + 4}" text-anchor="end">${num(Math.round(v))}</text>`).join("")}</g>
    ${lo < 0 && hi > 0 ? `<line x1="${left}" y1="${y(0)}" x2="${width - right}" y2="${y(0)}" stroke="#58716c" stroke-width="1.2"/>` : ""}
    ${sel ? `<rect class="range-band" x="${x(sel.start.time)}" y="${top}" width="${x(sel.end.time) - x(sel.start.time)}" height="${uh}"/>` : ""}
    ${speedChanges.map((h) => `<g class="annotation"><line x1="${x(h.time - 1)}" y1="${top}" x2="${x(h.time - 1)}" y2="${top + uh}"/><text x="${x(h.time - 1) + 4}" y="${top + 11}">${esc(t("speedShort", { v: h.speed }))}</text></g>`).join("")}
    <polyline class="line" points="${history.map((h) => `${x(h.time)},${y(h[m])}`).join(" ")}"/>
    ${points}
    <line x1="${left}" y1="${top + uh}" x2="${width - right}" y2="${top + uh}" stroke="#58716c"/><line x1="${left}" y1="${top}" x2="${left}" y2="${top + uh}" stroke="#58716c"/>
    ${xTicks.map((tick) => `<text x="${x(tick)}" y="${top + uh + 16}" text-anchor="middle">${tick}</text>`).join("")}`;
  refs.chart.querySelectorAll(".chart-point").forEach((point) => {
    point.addEventListener("click", () => selectChartPoint(point));
    point.addEventListener("keydown", handleChartPointKeydown);
  });
  renderSelectionText(label, unit);
}

function chartText(label, unit) {
  const history = state.run.history, start = history[0], end = history.at(-1), m = state.measure;
  return t("chartDesc", { name: label, t: end.time, v1: num(start[m]), v2: num(end[m]), u: unit });
}

function selectedRange() {
  if (state.chartSelection.length !== 2) return null;
  const [a, b] = [...state.chartSelection].sort((p, q) => p.time - q.time);
  return a.time === b.time ? null : { start: a, end: b };
}

function renderSelectionText(label, unit) {
  const sel = selectedRange();
  if (!sel) { refs.chartSelection.textContent = state.chartSelection.length ? t("selSecond") : t("selDefault"); return; }
  const history = state.run.history, m = state.measure;
  const a = history.find((h) => h.time === sel.start.time), b = history.find((h) => h.time === sel.end.time);
  if (!a || !b) { refs.chartSelection.textContent = t("selDefault"); return; }
  const rate = (b[m] - a[m]) / (b.time - a.time);
  const rateText = `${rate > 0 ? "+" : rate < 0 ? "−" : ""}${num(Math.round(Math.abs(rate) * 10) / 10)}`;
  const speeds = new Set(history.filter((h) => h.time > a.time && h.time <= b.time).map((h) => h.speed));
  refs.chartSelection.textContent = t("selResult", { name: label, t1: a.time, v1: num(a[m]), t2: b.time, v2: num(b[m]), u: unit, rate: rateText }) + (speeds.size > 1 ? t("selMulti") : "");
}

function handleChartPointKeydown(event) {
  const point = event.currentTarget;
  if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectChartPoint(point); return; }
  if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) {
    event.preventDefault();
    const points = [...refs.chart.querySelectorAll(".chart-point")];
    const index = points.indexOf(point), dir = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    points[(index + dir + points.length) % points.length]?.focus();
  }
}

function selectChartPoint(element) {
  const point = { time: Number(element.dataset.time) };
  const existing = state.chartSelection.findIndex((p) => p.time === point.time);
  if (existing >= 0) state.chartSelection.splice(existing, 1);
  else if (state.chartSelection.length >= 2) state.chartSelection = [point];
  else state.chartSelection.push(point);
  render();
  refs.chart.querySelector(`.chart-point[data-time="${point.time}"]`)?.focus();
}

/* ------------------------------------------------------------------ */
/* Running time forward                                                */
/* ------------------------------------------------------------------ */
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function stepOnce(token) {
  if (state.run.time >= MAX_TIME) return false;
  state.run = advanceRun(state.run, { speed: state.speed });
  render();
  await wait(reducedMotion() ? 40 : 380);
  return token === state.runToken;
}

async function runSteps(count) {
  if (state.running) return;
  state.running = true; render();
  const token = ++state.runToken;
  for (let i = 0; i < count; i++) if (!await stepOnce(token)) break;
  if (token === state.runToken) { state.running = false; render(); }
}

function cancelActiveRun() { state.runToken++; state.running = false; }

refs.step.addEventListener("click", () => runSteps(1));
refs.run.addEventListener("click", () => runSteps(10));
refs.speed.addEventListener("input", () => { state.speed = Number(refs.speed.value); updateUrl(); render(); });
refs.prediction.addEventListener("change", () => { state.prediction = refs.prediction.value; render(); });
refs.measure.addEventListener("change", () => { state.measure = refs.measure.value; state.chartSelection = []; render(); });
refs.reset.addEventListener("click", () => restart());
refs.trial.addEventListener("click", () => { state.seed = Math.floor(Math.random() * 2 ** 32) >>> 0; state.prediction = ""; refs.prediction.value = ""; restart(); });
refs.clearChartSelection.addEventListener("click", () => { state.chartSelection = []; render(); });
$("#copy-seed-button").addEventListener("click", async () => { try { await navigator.clipboard.writeText(String(state.seed)); } catch { /* clipboard is optional */ } });
$("#simplifications-button").addEventListener("click", (event) => { const panel = $("#simplifications"); panel.hidden = !panel.hidden; event.currentTarget.setAttribute("aria-expanded", String(!panel.hidden)); });
refs.speed.value = String(state.speed);
onLangChange(() => render());
initLab(content);
render();
