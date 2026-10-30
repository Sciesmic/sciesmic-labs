// Star Life Cycle Lab model. Pure functions, no DOM.
// Life Cycle mode: pick a star's starting mass (in Suns) and follow it from its birth in a nebula to its end
// state. Every sample has an age, a stage, a surface temperature (kelvin), a brightness (luminosity, Sun = 1)
// and a size (radius, Sun = 1), so the star can be plotted as a moving point on a Hertzsprung-Russell diagram.
// Star Sorter mode: a set of 12 mystery stars (temperature + brightness) to classify on the H-R diagram as
// main sequence, giant, supergiant or white dwarf.
//
// Misconception guardrails built into the model:
//  - More mass does NOT mean a longer life. A massive star has more fuel but burns it far faster, so it
//    leaves the main sequence first (25 Suns: about 7 million years; the Sun: about 10 billion years).
//  - A star's place on the main sequence is set by its mass. It stays in about the same spot for almost its
//    whole life; it does not slide along the main sequence as it ages.
//  - Only stars of more than about 8 Suns explode as supernovas. A Sun-sized star never explodes: it swells
//    into a red giant, puffs off its outer layers and leaves a white dwarf.
//  - Color tells temperature: red stars are the coolest, blue stars are the hottest.
//  - No star smaller than about 0.8 Suns has ever left the main sequence, because the universe (about
//    13.8 billion years old) is younger than their lifetimes. A run stops at that age.
//
// Chance is built in on purpose so repeated trials vary a little:
//  - each star's starting mass differs from the chosen mass by about ±2% (clouds never collapse exactly alike),
//  - each star's makeup changes how fast it burns fuel, so lifetimes vary by about ±4% more,
//  - the dividing line between a neutron star and a black hole is not sharp: it falls somewhere around
//    20–26 Suns, so the biggest stars usually, but not always, leave black holes.
// Main-sequence lifetimes and brightnesses are rounded textbook values. The model is a simplified,
// original teaching model; it skips smaller steps (such as helium burning) inside each stage.

export const MASSES = [0.5, 1, 2, 5, 10, 15, 25];
export const UNIVERSE_AGE = 13.8e9;
export const SUPERNOVA_MASS = 8;
export const TYPES = ["main", "giant", "supergiant", "dwarf"];
export const SUN_T = 5778;

/** Main-sequence lifetime in years for each starting mass (rounded textbook values). */
const MS_LIFE = { 0.5: 6e10, 1: 1e10, 2: 1.2e9, 5: 1e8, 10: 2.5e7, 15: 1.3e7, 25: 7e6 };

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
const lerp = (a, b, f) => a + (b - a) * f;
const logLerp = (a, b, f) => Math.exp(lerp(Math.log(a), Math.log(b), f));

/** Brightness (Sun = 1) of a main-sequence star of mass m (mass–luminosity relation). */
export function msLuminosity(m) {
  if (m < 0.43) return 0.23 * m ** 2.3;
  if (m < 2) return m ** 4;
  return 1.4 * m ** 3.5;
}
/** Radius (Sun = 1) of a main-sequence star of mass m. */
export function msRadius(m) { return m <= 1 ? m ** 0.8 : m ** 0.57; }
/** Surface temperature from brightness and size (Stefan–Boltzmann law, Sun = 5,778 K). */
export function temperature(L, R) { return SUN_T * (L / (R * R)) ** 0.25; }
/** Size from brightness and temperature. */
export function radius(L, T) { return Math.sqrt(L) / (T / SUN_T) ** 2; }
/** Main-sequence lifetime for a mass between the table values (log-log interpolation). */
export function msLife(m) {
  const ms = MASSES;
  if (m <= ms[0]) return MS_LIFE[ms[0]] * (m / ms[0]) ** -2.5;
  if (m >= ms.at(-1)) return MS_LIFE[ms.at(-1)] * (m / ms.at(-1)) ** -1.2;
  for (let i = 0; i < ms.length - 1; i++) {
    const a = ms[i], b = ms[i + 1];
    if (m >= a && m <= b) return logLerp(MS_LIFE[a], MS_LIFE[b], Math.log(m / a) / Math.log(b / a));
  }
  return MS_LIFE[1];
}

/** Color word for a temperature. */
export function colorOf(T) {
  if (T < 4000) return "red";
  if (T < 5200) return "orange";
  if (T < 6000) return "yellow";
  if (T < 7500) return "yellowWhite";
  if (T < 10000) return "white";
  if (T < 20000) return "blueWhite";
  return "blue";
}

export const DEFAULTS = { mode: "life", mass: 1, speed: "normal" };
export function normalize(settings) {
  const s = { ...DEFAULTS, ...settings };
  s.mode = s.mode === "sorter" ? "sorter" : "life";
  s.mass = MASSES.includes(Number(s.mass)) ? Number(s.mass) : DEFAULTS.mass;
  s.speed = s.speed === "slow" ? "slow" : "normal";
  return s;
}

export function createRun(seed) {
  return { seed: Number(seed) >>> 0, history: [], sortCount: 0, sort: null, sortHistory: [] };
}

/** Build the life story of one star as a list of samples. */
export function simulateStar(chosenMass, rng) {
  const m = chosenMass * clamp(1 + normal(rng, 0.02), 0.96, 1.04);
  const life = msLife(m) * clamp(1 + normal(rng, 0.04), 0.9, 1.1);
  const holeLine = clamp(23 + normal(rng, 2), 18, 28);       // neutron star vs black hole dividing line, this star
  const L0 = msLuminosity(m), R0 = msRadius(m), T0 = temperature(L0, R0);
  const massive = m > SUPERNOVA_MASS;
  const samples = [];
  const push = (age, stage, L, T) => samples.push({ age, stage, L, T, R: Number.isFinite(L) && T > 0 ? radius(L, T) : null });

  // Protostar: a glowing ball of gas contracting out of the nebula toward the main sequence.
  const pre = Math.min(life * 0.006, 5e7);
  for (let i = 0; i <= 3; i++) { const f = i / 4; push(pre * f, "protostar", logLerp(L0 * 6, L0 * 1.3, f), lerp(Math.min(T0, 4200) * 0.92, T0 * 0.97, f)); }
  // Main sequence: fusing hydrogen in the core. The star barely moves on the H-R diagram.
  const msEnd = pre + life;
  const L1 = L0 * (massive ? 1.6 : 1.5), T1 = massive ? T0 * 0.88 : T0 * 0.98;
  for (let i = 0; i <= 10; i++) {
    const f = i / 10, age = pre + life * f;
    if (age > UNIVERSE_AGE) { push(UNIVERSE_AGE, "main", logLerp(L0, L1, (UNIVERSE_AGE - pre) / life), lerp(T0, T1, (UNIVERSE_AGE - pre) / life)); return finish(true); }
    push(age, "main", logLerp(L0, L1, f), lerp(T0, T1, f));
  }
  if (massive) {
    // Red supergiant: the core runs out of hydrogen; the star swells enormously and cools.
    const sgLife = life * 0.11, Lsg = Math.max(L1 * 1.3, 4e4 * (m / 10) ** 2.2);
    for (let i = 1; i <= 7; i++) { const f = i / 7; push(msEnd + sgLife * f, "supergiant", logLerp(L1, Lsg, f), logLerp(T1, 3600, f ** 0.7)); }
    const end = msEnd + sgLife;
    push(end, "supernova", 4e9, 20000);
    const remnant = m >= holeLine ? "blackHole" : "neutronStar";
    push(end + 1e4, remnant, remnant === "neutronStar" ? null : 0, null);
    push(end + 1e6, remnant, remnant === "neutronStar" ? null : 0, null);
    return finish(false, remnant);
  }
  // Red giant: the core runs out of hydrogen; the star swells and cools, then brightens a lot.
  const gLife = life * 0.12, Lpeak = 3000 * m ** 1.1;
  const giant = [[0.25, L1 * 2.2, T1 * 0.8], [0.45, Math.max(L1 * 4, 8), 4600], [0.7, Lpeak * 0.12, 4100], [0.88, Lpeak * 0.45, 3600], [1, Lpeak, 3200]];
  for (const [f, L, T] of giant) {
    const age = msEnd + gLife * f;
    if (age > UNIVERSE_AGE) { push(UNIVERSE_AGE, "giant", L, Math.min(T, T1)); return finish(true); }
    push(age, "giant", L, Math.min(T, T1));
  }
  // Planetary nebula: the outer layers drift away; the hot core is uncovered.
  const gEnd = msEnd + gLife;
  for (let i = 1; i <= 3; i++) { const f = i / 3, age = gEnd + 3e4 * f;
    if (age > UNIVERSE_AGE) { cappedSample(age, "nebulaShell", Lpeak * lerp(1, 0.7, f), logLerp(3200, 90000, f)); return finish(true, null, true); }
    push(age, "nebulaShell", Lpeak * lerp(1, 0.7, f), logLerp(3200, 90000, f)); }
  // White dwarf: the leftover core, hot but tiny, cooling and fading for billions of years.
  const wdStart = gEnd + 3e4;
  const cool = [[1e5, 30, 70000], [1e6, 1.5, 45000], [1e8, 0.04, 22000], [1e9, 0.004, 12000]];
  for (const [dt, L, T] of cool) {
    if (wdStart + dt > UNIVERSE_AGE) { cappedSample(wdStart + dt, "dwarf", L, T); return finish(false, "whiteDwarf", true); }
    push(wdStart + dt, "dwarf", L, T);
  }
  return finish(false, "whiteDwarf");

  function cappedSample(age, stage, L, T) {
    const prev = samples.at(-1), f = (UNIVERSE_AGE - prev.age) / (age - prev.age);
    push(UNIVERSE_AGE, stage, logLerp(prev.L, L, f), logLerp(prev.T, T, f));
  }
  function finish(stillAlive, endState = null, ageLimited = false) {
    const peak = samples.filter((s) => s.L > 0 && s.stage !== "supernova" && s.stage !== "protostar");
    const giantPhase = samples.filter((s) => s.stage === "giant" || s.stage === "supergiant");
    return {
      samples,
      result: {
        actualMass: Math.round(m * 100) / 100,
        ageLimited: ageLimited || stillAlive,
        msLife: stillAlive ? null : life,
        msLifeEstimate: life,
        totalLife: stillAlive ? null : (endState === "whiteDwarf" ? wdStart : samples.find((s) => s.stage === "supernova").age),
        endState: stillAlive ? "alive" : endState,
        finalStage: samples.at(-1).stage,
        maxRadius: Math.max(...peak.map((s) => s.R)),
        maxL: Math.max(...peak.map((s) => s.L)),
        msL: L0, msT: T0, msR: R0,
        giantMaxR: giantPhase.length ? Math.max(...giantPhase.map((s) => s.R)) : null,
        holeLine: Math.round(holeLine * 10) / 10,
      },
    };
  }
}

/** Run one life-cycle trial. */
export function advanceTrial(run, settings) {
  const s = normalize(settings);
  const index = run.history.length + 1;
  const rng = makeRng(run.seed + index * 7919 + 1);
  const star = simulateStar(s.mass, rng);
  const trial = { index, settings: { mass: s.mass }, samples: star.samples, result: star.result };
  return { ...run, history: [...run.history, trial] };
}

/* ---------- Star Sorter ---------- */

/** Make one mystery star of a given type. */
function mysteryStar(type, rng) {
  const u = () => rng();
  if (type === "main") {
    const m = Math.exp(lerp(Math.log(0.3), Math.log(18), u()));
    const L = msLuminosity(m) * 10 ** normal(rng, 0.08);
    return { type, L, T: temperature(msLuminosity(m), msRadius(m)) * (1 + normal(rng, 0.03)) };
  }
  if (type === "giant") return { type, T: lerp(3500, 5200, u()), L: 10 ** lerp(1.6, 3, u()) };
  if (type === "supergiant") return { type, T: u() < 0.6 ? lerp(3400, 4500, u()) : lerp(6000, 22000, u()), L: 10 ** lerp(4.4, 5.4, u()) };
  return { type, T: lerp(7000, 28000, u()), L: 10 ** lerp(-3.6, -2.1, u()) };
}

/** Round a reading the way the sorter shows it: temperature to 100 K, brightness to 2 significant figures. */
export function roundReading(star) {
  const T = Math.round(star.T / 100) * 100;
  const L = Number(star.L.toPrecision(2));
  return { ...star, T, L, R: Number.isFinite(L) && T > 0 ? radius(L, T) : null };
}

/** Pick a new set of 12 mystery stars: at least 2 of each type, the rest by chance, in shuffled order. */
export function newSortSet(run) {
  const n = run.sortCount + 1;
  const rng = makeRng(run.seed + n * 104729 + 17);
  const types = [...TYPES, ...TYPES];
  while (types.length < 12) types.push(rng() < 0.4 ? "main" : TYPES[Math.floor(rng() * 4)]);
  for (let i = types.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [types[i], types[j]] = [types[j], types[i]]; }
  const stars = types.map((type, i) => ({ id: i + 1, ...roundReading(mysteryStar(type, rng)) }));
  return { ...run, sortCount: n, sort: { n, stars, checked: null } };
}

/** Score a set of picks ({ starId: type }). */
export function checkSort(run, picks) {
  if (!run.sort) return run;
  const rows = run.sort.stars.map((star) => ({ id: star.id, pick: picks[star.id] ?? null, answer: star.type, right: picks[star.id] === star.type }));
  const checked = { rows, score: rows.filter((r) => r.right).length };
  return { ...run, sort: { ...run.sort, checked }, sortHistory: [...run.sortHistory, { n: run.sort.n, score: checked.score, misses: rows.filter((r) => !r.right).map((r) => r.id) }] };
}
