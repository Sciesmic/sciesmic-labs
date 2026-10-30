// Cell Operations Lab model. Pure functions, no DOM.
// One plant cell or one animal cell runs for a 24-hour "cell day" in 1-hour steps.
// Six gauges (0–100) describe the cell's health:
//   energy   – usable energy released from sugar by the mitochondria
//   proteins – proteins built by ribosomes, using instructions from the nucleus
//   sugar    – food: made by chloroplasts in light (plant) or taken in through the membrane (animal)
//   water    – how full and firm the cell is (the vacuole stores water in plant cells)
//   waste    – waste left in the cell (higher is worse); the membrane pumps it out, the vacuole stores it
//   shape    – whether the cell holds its shape (the cell wall supports a plant cell)
// Students shut down one organelle (Explore) or diagnose a hidden fault (Mystery cell).
//
// Misconception guardrails built into the model:
//  - Chloroplasts make sugar (food); they do not run the cell. Only mitochondria release usable energy
//    from sugar, in plant cells as well as animal cells. A plant cell in bright light with its
//    mitochondria off still runs out of energy, even while its sugar piles up.
//  - The cell membrane, not the cell wall, controls what enters and leaves. With the wall off, a plant
//    cell still controls what goes in and out, but nothing stops it swelling with water.
//  - Shutting down a part a cell does not have (a cell wall or chloroplasts in an animal cell) changes nothing.
//
// Chance is built in on purpose so repeated trials vary a little:
//  - each trial's rates (sugar making, energy release, protein building, water flow) differ by about ±9%,
//  - each gauge reading has a small measurement error (about ±2 points).
// The model is a simplified, original teaching model. It does not include the chemistry of cells.

export const CELLS = ["animal", "plant"];
export const PARTS = ["membrane", "wall", "nucleus", "ribosomes", "cytoplasm", "mitochondria", "chloroplasts", "vacuole"];
export const SHUTDOWNS = ["none", ...PARTS];
export const GAUGES = ["energy", "proteins", "sugar", "water", "waste", "shape"];
export const HOURS = 24;
export const HAS = {
  animal: { membrane: true, wall: false, nucleus: true, ribosomes: true, cytoplasm: true, mitochondria: true, chloroplasts: false, vacuole: true },
  plant: { membrane: true, wall: true, nucleus: true, ribosomes: true, cytoplasm: true, mitochondria: true, chloroplasts: true, vacuole: true },
};
/** Healthy starting levels for each cell type. */
export const START = {
  animal: { energy: 90, proteins: 90, sugar: 80, water: 80, waste: 15, shape: 85 },
  plant: { energy: 90, proteins: 90, sugar: 85, water: 88, waste: 15, shape: 95 },
};

export function makeRng(seed) {
  let value = (Number(seed) >>> 0) || 1;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let next = Math.imul(value ^ (value >>> 15), 1 | value);
    next = (next + Math.imul(next ^ (next >>> 7), 61 | next)) ^ next;
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}
const normal = (rng, sd = 1) => { const u = Math.max(rng(), 1e-9), v = rng(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * sd; };
const clamp = (value, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, value));

export const DEFAULTS = { mode: "explore", cell: "plant", light: "on", shutdown: "none" };

export function normalize(settings) {
  const s = { ...DEFAULTS, ...settings };
  s.mode = s.mode === "mystery" ? "mystery" : "explore";
  if (!CELLS.includes(s.cell)) s.cell = DEFAULTS.cell;
  s.light = s.light === "off" ? "off" : "on";
  if (!SHUTDOWNS.includes(s.shutdown)) s.shutdown = "none";
  return s;
}

/** Start a run. Every trial and every mystery case draws its chance from the run seed. */
export function createRun(seed) {
  return { seed: Number(seed) >>> 0, history: [], mysteryCount: 0, mystery: null };
}

/** Pick a new hidden fault. About 1 case in 9 has nothing broken. The cell type is picked too. */
export function newMystery(run) {
  const n = run.mysteryCount + 1;
  const rng = makeRng(run.seed + n * 104729 + 17);
  const cell = rng() < 0.5 ? "animal" : "plant";
  const options = ["none", ...PARTS.filter((part) => HAS[cell][part])];
  const fault = options[Math.floor(rng() * options.length)];
  return { ...run, mysteryCount: n, mystery: { n, cell, fault, diagnosis: null } };
}

/** Record a diagnosis for the current mystery case. */
export function diagnose(run, guess) {
  if (!run.mystery) return run;
  const correct = guess === run.mystery.fault;
  return { ...run, mystery: { ...run.mystery, diagnosis: { guess, correct } } };
}

/** Simulate one 24-hour cell day. Returns hourly samples (true values and gauge readings) and a summary. */
export function simulateDay(cell, light, shutdown, rng) {
  const on = (part) => HAS[cell][part] && shutdown !== part;   // is this part present and working?
  const jitter = () => clamp(1 + normal(rng, 0.09), 0.78, 1.22);
  const k = { sugar: jitter(), energy: jitter(), protein: jitter(), water: jitter() };
  const plant = cell === "plant";
  let s = { ...START[cell], instructions: 1, stores: 100 };
  const read = (state, t) => {
    const g = {};
    for (const key of GAUGES) g[key] = t === 0 ? Math.round(state[key]) : Math.round(clamp(state[key] + normal(rng, 2)));
    return g;
  };
  const samples = [{ t: 0, true: pick(s), g: read(s, 0), alive: true }];
  let lowEnergyHours = 0, death = null;
  for (let t = 1; t <= HOURS; t++) {
    const flow = on("cytoplasm") ? 1 : 0.4;                    // cytoplasm: where the cell's work happens and materials move
    const membrane = on("membrane");
    // Sugar (food).
    let supply = 0;
    if (plant) {
      const making = light === "on" && on("chloroplasts");
      // Dark, or no chloroplasts: the cell lives on stored starch, which runs low after about a day.
      supply = making ? 9 * k.sugar * (1 + (85 - s.sugar) / 85) : (s.stores > 0 ? 7.4 * k.sugar : 0);
      if (!making) s.stores -= 4.5;
    } else {
      supply = membrane ? 9 * k.sugar * (1 + (80 - s.sugar) / 80) : 0; // animal cells take in sugar through the membrane
    }
    supply *= flow;
    const use = (on("mitochondria") ? 9 * flow : 1.2) * (s.sugar > 0 ? 1 : 0);
    const leak = membrane ? 0 : 0.18 * s.sugar;                 // a failed membrane lets the cell's contents leak out
    s.sugar = clamp(s.sugar + supply - use - leak);
    // Schematic aerobic ATP-supply gauge. Cytosolic ATP and chloroplast-internal ATP are omitted.
    let energyTarget = on("mitochondria") ? 92 * Math.min(1, s.sugar / 25) * (flow === 1 ? 1 : 0.5) : 6;
    if (!membrane) energyTarget *= 0.6;
    s.energy = clamp(s.energy + 0.5 * k.energy * (energyTarget - s.energy));
    // Proteins: ribosomes build them from the nucleus's instructions, using energy.
    s.instructions = on("nucleus") ? Math.min(1, s.instructions + 0.4) : s.instructions * 0.7;
    const proteinTarget = 92 * (on("ribosomes") ? 1 : 0) * s.instructions * Math.min(1, s.energy / 45) * (flow === 1 ? 1 : 0.6);
    s.proteins = clamp(s.proteins + 0.14 * k.protein * (proteinTarget - s.proteins) - (membrane ? 0 : 0.24 * s.proteins));
    // Water.
    let waterTarget = plant ? 88 : 80;
    if (plant && !on("vacuole")) waterTarget = 32;              // no vacuole to store water: the cell wilts
    if (plant && !on("wall")) waterTarget = 100;                // assumes hypotonic surroundings for this wall-removal illustration
    if (!membrane) waterTarget = plant ? 22 : 100;               // schematic loss of regulation, NOT a calculation of osmotic water direction
    if (s.energy < 20 && membrane) waterTarget = (waterTarget + 50) / 2; // pumps that balance water need energy
    s.water = clamp(s.water + 0.3 * k.water * (waterTarget - s.water));
    // Waste.
    const made = 4 + 4 * (s.energy / 90);
    let removal = (8 / 15) * Math.min(1, s.energy / 50) * flow * (membrane ? 1 : 0.3);
    if (!on("vacuole")) removal *= plant ? 0.45 : 0.85;          // plant vacuoles store a lot of waste; animal vacuoles are small
    s.waste = clamp(s.waste + made - removal * s.waste);
    // Shape.
    if (plant) {
      if (!on("wall")) s.shape = clamp(s.shape - Math.max(0, s.water - 86) * 0.9);     // swells with no wall to hold it
      else s.shape = clamp(s.shape + 0.3 * ((s.water < 50 ? 75 : 95) - s.shape));      // wall keeps its shape; wilting softens it
    } else {
      if (!membrane) s.shape = clamp(s.shape - 26 * k.water);                           // schematic loss of shape after membrane failure
      else s.shape = clamp(s.shape + 0.3 * (85 - s.shape) - (s.water > 92 ? 8 : 0));
    }
    // Did the cell die this hour?
    lowEnergyHours = s.energy < 12 ? lowEnergyHours + 1 : 0;
    if (s.shape < 20) death = { hour: t, cause: "burst" };
    else if (!membrane && (s.sugar < 6 || s.proteins < 40)) death = { hour: t, cause: "leaked" };
    else if (lowEnergyHours >= 2) death = { hour: t, cause: "energy" };
    else if (s.proteins < 12) death = { hour: t, cause: "proteins" };
    else if (s.waste > 85) death = { hour: t, cause: "waste" };
    samples.push({ t, true: pick(s), g: read(s, t), alive: !death });
    if (death) break;
  }
  return { samples, death, summary: summarize(cell, samples, death) };
}

function pick(s) { const out = {}; for (const key of GAUGES) out[key] = Math.round(s[key] * 10) / 10; return out; }

/** Health status from the true values: healthy, stressed, failing or died. */
export function status(cell, values, dead) {
  if (dead) return "died";
  const base = START[cell];
  const score = (Math.min(values.energy / base.energy, 1) + Math.min(values.proteins / base.proteins, 1) + Math.min(values.water / base.water, 1)
    + Math.min(values.shape / base.shape, 1) + Math.min(1, Math.max(0, (100 - values.waste) / (100 - base.waste))) + Math.min(1, values.sugar / 40)) / 6;
  return score >= 0.85 ? "healthy" : score >= 0.65 ? "stressed" : "failing";
}

/** First sign: the first gauge to move 20 or more points away from its healthy start (true values). */
function firstSign(cell, samples) {
  const base = START[cell];
  for (const sample of samples.slice(1)) {
    let best = null;
    for (const key of GAUGES) {
      const change = sample.true[key] - base[key];
      if (Math.abs(change) >= 20 && (!best || Math.abs(change) > Math.abs(best.change))) best = { gauge: key, change: Math.round(change), hour: sample.t };
    }
    if (best) return { ...best, direction: best.change > 0 ? "up" : "down" };
  }
  return null;
}

function summarize(cell, samples, death) {
  const last = samples.at(-1);
  return {
    status: status(cell, last.true, Boolean(death)),
    deathHour: death?.hour ?? null, cause: death?.cause ?? null,
    end: last.g, endTrue: last.true, hours: last.t,
    firstSign: firstSign(cell, samples),
  };
}

/** Run one 24-hour trial. Explore uses the chosen shutdown; Mystery uses the hidden fault. */
export function advanceTrial(run, settings) {
  const s = normalize(settings);
  const index = run.history.length + 1;
  const rng = makeRng(run.seed + index * 7919 + 1);
  const mystery = s.mode === "mystery" ? run.mystery : null;
  const cell = mystery ? mystery.cell : s.cell;
  const shutdown = mystery ? mystery.fault : s.shutdown;
  const day = simulateDay(cell, s.light, shutdown, rng);
  const trial = {
    index, settings: { ...s, cell, shutdown: mystery ? "hidden" : shutdown },
    mysteryN: mystery?.n ?? null, hidden: mystery ? mystery.fault : null,
    samples: day.samples, result: day.summary,
  };
  return { ...run, history: [...run.history, trial] };
}
