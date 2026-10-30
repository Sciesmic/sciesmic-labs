// States of Matter Lab model. Pure functions, no DOM.
// An idealized sample at about 1 atmosphere is illustrated in an open beaker on a heating/cooling plate.
// The model follows the sample even after vapor leaves; gas cooling represents a supplied gas sample.
// The plate adds (or removes) thermal energy at a steady rate (watts = joules per second). Every few
// seconds the model records the time, the thermometer reading, the state, how much of the sample has
// changed state, and the energy added so far.
//
// Explore mode: water or carbon dioxide (dry ice). Mystery mode: an unlabeled sample that is one of four
// pure substances; read its melting and boiling temperatures off the heating curve to identify it.
//
// Misconception guardrails built into the model:
//  - While a sample is changing state (melting, boiling, subliming, freezing, condensing, depositing), its
//    temperature stays flat. The energy goes into pulling particles apart (or comes out as they come
//    together), not into making them move faster. The heater can be on "high" and boiling water still
//    reads about 100 °C.
//  - A stronger heater or a bigger sample changes HOW LONG a state change takes, never the temperature it
//    happens at. Melting, boiling and sublimation temperatures are fixed for each substance at 1 atm.
//  - At about 1 atm, carbon dioxide never becomes a liquid: solid CO₂ sublimes straight to gas at −78.5 °C.
//  - Particles never change identity. Water stays H₂O and carbon dioxide stays CO₂ in every state.
//  - Freezing happens at the same temperature as melting, and condensing at the same temperature as boiling.
//
// Chance is built in on purpose so repeated trials vary a little:
//  - the plate's real power differs from its setting by about ±3% (the outlet and the coils are never exact),
//  - the sample's real mass differs from the label by about ±1%,
//  - the starting temperature varies by about ±1.5 °C,
//  - the thermometer reading jitters by about ±0.2 °C.
// Specific heats and latent heats are rounded reference values; the model uses one specific heat for each
// state and assumes no energy is lost to the room. It is a simplified, original teaching model.

export const MODES = ["explore", "mystery"];
export const POWERS = { low: 100, medium: 200, high: 400 };   // watts (joules per second)
export const MASSES = [50, 100, 200];                          // grams
export const T_COLD = -130, T_HOT = 150;                       // °C, start of heating / start of cooling runs

/** Rounded reference values. c = specific heat (J/g·°C), L = latent heat (J/g), temperatures in °C at ~1 atm. */
export const SUBSTANCES = {
  water: { formula: "H₂O", mp: 0, bp: 100, cS: 2.05, cL: 4.18, cG: 2.01, Lf: 334, Lv: 2257 },
  co2: { formula: "CO₂", sub: -78.5, cS: 1.0, cG: 0.80, Ls: 571 },
  ethanol: { formula: "C₂H₅OH", mp: -114, bp: 78, cS: 1.0, cL: 2.44, cG: 1.42, Lf: 109, Lv: 841 },
  acetone: { formula: "C₃H₆O", mp: -95, bp: 56, cS: 1.3, cL: 2.17, cG: 1.29, Lf: 98, Lv: 501 },
};
export const MYSTERY_KEYS = ["water", "ethanol", "acetone", "co2"];
export const MYSTERY_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "M", "P", "Q", "R", "S", "T"];

export const DEFAULTS = {
  explore: { mode: "explore", substance: "water", power: "medium", mass: 100, direction: "heat" },
  mystery: { mode: "mystery", power: "medium", mass: 100, direction: "heat" },
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
const clamp = (value, lo, hi) => Math.min(hi, Math.max(lo, value));
const round1 = (value) => Math.round(value * 10) / 10;

export function normalize(settings) {
  const mode = settings?.mode === "mystery" ? "mystery" : "explore";
  const s = { ...DEFAULTS[mode], ...settings, mode };
  if (mode === "explore") s.substance = s.substance === "co2" ? "co2" : "water";
  s.power = POWERS[s.power] ? s.power : "medium";
  s.mass = MASSES.includes(Number(s.mass)) ? Number(s.mass) : 100;
  s.direction = s.direction === "cool" ? "cool" : "heat";
  return s;
}

/** Pick the hidden substance and its letter for mystery sample number k of this seed. */
export function mysteryFor(seed, k) {
  const rng = makeRng((Number(seed) >>> 0) + 104729 * (k + 1));
  const key = MYSTERY_KEYS[Math.floor(rng() * MYSTERY_KEYS.length)];
  const letter = MYSTERY_LETTERS[Math.floor(rng() * MYSTERY_LETTERS.length)];
  return { key, letter, k };
}

export function createRun(seed) {
  const s = Number(seed) >>> 0;
  return { seed: s, history: [], mystery: mysteryFor(s, 0), guesses: [] };
}
export function newMystery(run) {
  return { ...run, mystery: mysteryFor(run.seed, run.mystery.k + 1) };
}
export function guessMystery(run, key) {
  const correct = key === run.mystery.key;
  return { ...run, guesses: [...run.guesses, { k: run.mystery.k, letter: run.mystery.letter, guess: key, correct }] };
}

/**
 * Heating (or cooling) segments for a substance between T_COLD and T_HOT.
 * Each segment: { kind, from, to, energyPerGram, state, change? }.
 */
export function segmentsFor(key, direction) {
  const m = SUBSTANCES[key];
  const heat = [];
  if (m.sub !== undefined) {
    heat.push({ kind: "warm", state: "solid", from: T_COLD, to: m.sub, c: m.cS });
    heat.push({ kind: "change", state: "solid", next: "gas", change: "sublimation", at: m.sub, L: m.Ls });
    heat.push({ kind: "warm", state: "gas", from: m.sub, to: T_HOT, c: m.cG });
  } else {
    heat.push({ kind: "warm", state: "solid", from: T_COLD, to: m.mp, c: m.cS });
    heat.push({ kind: "change", state: "solid", next: "liquid", change: "melting", at: m.mp, L: m.Lf });
    heat.push({ kind: "warm", state: "liquid", from: m.mp, to: m.bp, c: m.cL });
    heat.push({ kind: "change", state: "liquid", next: "gas", change: "boiling", at: m.bp, L: m.Lv });
    heat.push({ kind: "warm", state: "gas", from: m.bp, to: T_HOT, c: m.cG });
  }
  if (direction === "heat") return heat;
  const REVERSE = { melting: "freezing", boiling: "condensing", sublimation: "deposition" };
  return heat.slice().reverse().map((seg) => seg.kind === "warm"
    ? { ...seg, from: seg.to, to: seg.from }
    : { ...seg, state: seg.next, next: seg.state, change: REVERSE[seg.change] });
}

/** Choose a sampling step (s) so a run has at most about 60 samples. */
function sampleStep(total) {
  for (const dt of [5, 10, 15, 20, 30, 45, 60, 90, 120]) if (total / dt <= 60) return dt;
  return 180;
}

/** Simulate one run. Returns samples and a summary of every flat part (plateau). */
export function simulate(settings, key, rng) {
  const s = normalize(settings);
  const power = POWERS[s.power] * clamp(1 + normal(rng, 0.03), 0.92, 1.08);   // J/s
  const mass = s.mass * clamp(1 + normal(rng, 0.01), 0.97, 1.03);            // g
  const startShift = clamp(normal(rng, 1.5), -4, 4);
  const segs = segmentsFor(key, s.direction).map((seg) => ({ ...seg }));
  // The run starts a little warmer or colder than the nominal temperature; the first segment absorbs it.
  if (segs[0].kind === "warm") segs[0].from += startShift;
  let clock = 0, energy = 0;
  for (const seg of segs) {
    seg.energy = seg.kind === "warm" ? mass * seg.c * Math.abs(seg.to - seg.from) : mass * seg.L;
    seg.start = clock;
    seg.time = seg.energy / power;
    clock += seg.time;
    seg.end = clock;
    seg.e0 = energy;
    energy += seg.energy;
  }
  const total = clock, dt = sampleStep(total);
  const at = (time) => {
    const seg = segs.find((g) => time <= g.end + 1e-9) ?? segs.at(-1);
    const f = seg.time > 0 ? clamp((time - seg.start) / seg.time, 0, 1) : 1;
    if (seg.kind === "warm") return { T: seg.from + (seg.to - seg.from) * f, state: seg.state, change: null, frac: 0, seg };
    return { T: seg.at, state: seg.state, next: seg.next, change: seg.change, frac: f, seg };
  };
  const samples = [];
  for (let time = 0; time < total + dt - 1e-9; time += dt) {
    const tt = Math.min(time, total);
    const p = at(tt);
    const reading = round1(p.T + clamp(normal(rng, 0.1), -0.2, 0.2));
    samples.push({ t: tt, T: p.T, reading, state: p.state, next: p.next ?? null, change: p.change, frac: p.frac, energy: segEnergy(p.seg, tt) });
    if (tt >= total) break;
  }
  const plateaus = segs.filter((g) => g.kind === "change").map((g) => {
    const flat = samples.filter((p) => p.change === g.change && p.frac > 0 && p.frac < 1);
    const mean = flat.length ? flat.reduce((sum, p) => sum + p.reading, 0) / flat.length : g.at;
    return { change: g.change, at: g.at, reading: round1(mean), start: g.start, end: g.end, length: g.time, energy: g.energy };
  });
  return {
    samples, dt, segments: segs,
    result: { key, power, mass, startT: segs[0].from, endT: segs.at(-1).to, total, energy, plateaus },
  };
  function segEnergy(seg, time) { return seg.e0 + power * clamp(time - seg.start, 0, seg.time); }
}

export function advanceTrial(run, settings) {
  const s = normalize(settings);
  const index = run.history.length + 1;
  const rng = makeRng(run.seed + index * 7919 + 1);
  const key = s.mode === "mystery" ? run.mystery.key : s.substance;
  const sim = simulate(s, key, rng);
  const trial = { index, settings: s, key, mystery: s.mode === "mystery" ? { ...run.mystery } : null, samples: sim.samples, dt: sim.dt, segments: sim.segments, result: sim.result };
  return { ...run, history: [...run.history, trial] };
}

/** Kinetic-energy cue for drawings: average particle speed grows with the square root of kelvin temperature. */
export function motionLevel(tempC) { return Math.sqrt(Math.max(1, tempC + 273.15) / 273.15); }

/** Continuous physical state follows the thermal segments, not straight lines between sensor samples. */
export function sampleAt(trial, time) {
  const t = Math.max(0, Math.min(trial.result.total, Number(time) || 0));
  const seg = trial.segments.find(s => t <= s.end + 1e-9) ?? trial.segments.at(-1);
  const f = seg.time ? Math.max(0, Math.min(1, (t - seg.start) / seg.time)) : 1;
  const T = seg.kind === 'change' ? seg.at : seg.from + (seg.to - seg.from) * f;
  const i = trial.samples.findIndex(p => p.t > t);
  const a = i <= 0 ? (i === 0 ? trial.samples[0] : trial.samples.at(-1)) : trial.samples[i - 1];
  const b = i > 0 ? trial.samples[i] : a;
  const blend = b.t === a.t ? 0 : (t - a.t) / (b.t - a.t);
  // Interpolate only sensor error; never interpolate across a physical plateau.
  const noise = (a.reading - a.T) * (1 - blend) + (b.reading - b.T) * blend;
  return {t, T, reading: round1(T + noise), state: seg.state, next: seg.next ?? null,
    change: seg.change ?? null, frac: seg.kind === 'change' ? f : 0,
    energy: seg.e0 + trial.result.power * Math.max(0, Math.min(seg.time, t - seg.start))};
}
