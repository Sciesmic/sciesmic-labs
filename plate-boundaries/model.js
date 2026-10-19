// Plate Boundary Lab model. Pure functions, no DOM.
// One step = 1 million years (Myr). Plate speed is in cm/yr, so 1 cm/yr moves a plate 10 km per Myr.
//
// Misconception guardrails built into the model:
//  - Features take millions of years: speeds are locked to real plate rates (1–10 cm/yr) and every step is 1 Myr.
//  - The hot spot never moves: it always sits at distance 0. Only the plate (and its volcanoes) move.
//  - The mantle is solid rock that flows slowly. Nothing in the model floats on a liquid layer.
//  - Transform boundaries make no new crust and destroy none.
//  - Earth does not grow: crust made at a ridge is matched by crust destroyed at subduction zones elsewhere.

export const MAX_TIME = 40; // Myr
export const KM_PER_MYR_PER_CMYR = 10;

export const SETUPS = {
  divergent: ["oo", "cc"],
  convergent: ["oc", "oo", "cc"],
  transform: ["oo", "cc"],
  hotspot: ["o", "c"],
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

const poisson = (rng, lambda) => { const limit = Math.exp(-lambda); let k = 0, p = 1; do { k++; p *= rng(); } while (p > limit); return k - 1; };
const normal = (rng, sd = 1) => { const u = Math.max(rng(), 1e-9), v = rng(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * sd; };
const uniform = (rng, lo, hi) => lo + rng() * (hi - lo);
const approach = (value, target, rate) => value + (target - value) * (1 - Math.exp(-rate));
const round = (value, step = 1) => Math.round(value / step) * step;

// Earthquake behavior for each setting: base count per Myr at 5 cm/yr, depth range (km), magnitude range.
const QUAKES = {
  "divergent-oo": { base: 6, depth: [2, 12], mag: [4.5, 6.2] },
  "divergent-cc": { base: 7, depth: [5, 30], mag: [4.5, 6.8] },
  "convergent-oc": { base: 18, slab: 660, mag: [5, 9.0] },
  "convergent-oo": { base: 16, slab: 700, mag: [5, 8.6] },
  "convergent-cc": { base: 12, depth: [5, 90], mag: [5, 8.2] },
  "transform-oo": { base: 13, depth: [2, 15], mag: [4.5, 7.2] },
  "transform-cc": { base: 14, depth: [2, 20], mag: [4.5, 7.9] },
  "hotspot-o": { base: 4, depth: [2, 15], mag: [4, 6.9] },
  "hotspot-c": { base: 5, depth: [2, 15], mag: [4, 6.5] },
};

export const settingKey = (run) => `${run.boundary}-${run.crust}`;
const settingCode = (key) => [...key].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);

export function createRun(seed, boundary = "divergent", crust = SETUPS[boundary][0]) {
  if (!SETUPS[boundary]?.includes(crust)) crust = SETUPS[boundary][0];
  const setup = makeRng((Number(seed) >>> 0) + 7 + settingCode(`${boundary}-${crust}`));
  const run = {
    seed: Number(seed) >>> 0, boundary, crust, time: 0, moved: 0, quakesTotal: 0,
    mountain: 300, trench: -4000, subducted: 0, riftWidth: 20,
    floodWidth: round(uniform(setup, 120, 200)), floodedAt: null,
    polarity: 1, nextReversal: uniform(setup, 0.1, 1.2), stripes: [], spreadKm: 0,
    chain: [], nextId: 1, volcanoes: 0, nextSpacing: round(uniform(setup, 40, 100)),
    supereruptions: 0, history: [],
  };
  if (boundary === "hotspot" && crust === "o") run.chain.push({ id: run.nextId++, born: 0, dist: 0, height: -4000, active: true });
  if (boundary === "divergent" && crust === "oo") run.volcanoes = 1;
  if (boundary === "convergent" && crust === "oo") run.mountain = -4000;
  if (boundary === "hotspot" && crust === "c") run.mountain = 2000;
  run.history.push(snapshot(run, null, null));
  return run;
}

function surface(run) {
  const key = settingKey(run);
  switch (key) {
    case "divergent-oo": return { highest: -2500, lowest: -4000 };
    case "divergent-cc": {
      if (run.floodedAt === null) return { highest: run.mountain, lowest: round(300 - Math.min(1, run.riftWidth / run.floodWidth) * 250, 10) };
      return { highest: run.mountain, lowest: round(-2500 - 350 * Math.sqrt(Math.max(0, run.time - run.floodedAt)), 10) };
    }
    case "convergent-oc": return { highest: run.mountain, lowest: run.trench };
    case "convergent-oo": return { highest: Math.max(run.mountain, -4000), lowest: run.trench };
    case "convergent-cc": return { highest: run.mountain, lowest: 200 };
    case "transform-oo": return { highest: -3800, lowest: -4200 };
    case "transform-cc": return { highest: 600, lowest: 100 };
    case "hotspot-o": return { highest: Math.max(-4000, ...run.chain.map((v) => v.height)), lowest: -4000 };
    case "hotspot-c": return { highest: run.mountain, lowest: 1400 };
    default: return { highest: 0, lowest: 0 };
  }
}

export function slabDepth(run) {
  const cap = QUAKES[settingKey(run)].slab;
  return cap ? Math.min(cap, run.subducted * 0.55) : 0;
}

export function oceanChange(run) {
  if (run.boundary === "divergent") return run.crust === "oo" ? run.spreadKm : run.floodedAt === null ? 0 : run.spreadKm;
  if (run.boundary === "convergent" && run.crust !== "cc") return -run.subducted;
  return 0;
}

export function snapshot(run, speed, event) {
  const { highest, lowest } = surface(run);
  return {
    time: run.time, speed, moved: run.moved, highest: round(highest, 10), lowest: round(lowest, 10),
    volcanoes: volcanoCount(run), quakes: event?.quakes ?? 0, deepest: event?.deepest ?? null, largest: event?.largest ?? null,
    quakesTotal: run.quakesTotal, oceanChange: oceanChange(run), event,
  };
}

export function volcanoCount(run) {
  if (run.boundary === "hotspot") return run.chain.length;
  return run.volcanoes;
}

/** Advance one million years. Returns a new run with one more history snapshot. */
export function advanceRun(run, { speed }) {
  if (run.time >= MAX_TIME) return run;
  const v = Math.min(10, Math.max(1, Number(speed) || 5));
  const key = settingKey(run);
  const rng = makeRng(run.seed + (run.time + 1) * 9973 + v * 101 + settingCode(key));
  const next = { ...run, stripes: run.stripes.map((s) => ({ ...s })), chain: run.chain.map((c) => ({ ...c })) };
  const km = v * KM_PER_MYR_PER_CMYR; // relative plate motion this Myr
  const event = { quakes: 0, deepest: null, largest: null, newVolcanoes: 0, reversals: 0, list: [] };
  next.moved = run.moved + km;
  next.time = run.time + 1;

  // ---- boundary processes ----
  if (run.boundary === "divergent") {
    let spreading = run.crust === "oo" || run.floodedAt !== null;
    if (run.crust === "cc" && run.floodedAt === null) {
      next.riftWidth = run.riftWidth + km;
      next.mountain = approach(run.mountain, 1800, 0.02 * v) + normal(rng, 40);
      next.volcanoes = Math.min(3, Math.floor(next.riftWidth / 50) + (rng() < 0.3 ? 1 : 0));
      if (next.riftWidth >= run.floodWidth) {
        next.floodedAt = next.time; event.flooded = true;
        next.spreadKm = next.riftWidth - run.floodWidth; spreading = false; // new sea floor starts now
        next.polarity = 1; next.nextReversal = next.time + uniform(rng, 0.1, 1.2);
      }
    }
    if (spreading) {
      if (run.crust === "cc") next.riftWidth = run.riftWidth + km;
      // Each side moves away from the ridge at half the plate speed.
      next.stripes.forEach((s) => { s.dist += km / 2; });
      let t = run.nextReversal;
      while (t < next.time) {
        next.polarity = -next.polarity;
        next.stripes.push({ t: round(t, 0.01), dist: (next.time - t) * km / 2, polarity: next.polarity });
        event.reversals++;
        t += Math.max(0.1, -Math.log(Math.max(rng(), 1e-6)) * 0.7);
      }
      next.nextReversal = t;
      next.spreadKm = run.spreadKm + km;
      next.volcanoes = 1 + (rng() < 0.5 ? 1 : 0) + (rng() < 0.12 * v / 5 ? 1 : 0);
      if (run.crust === "cc") next.mountain = approach(run.mountain, 1800, 0.01 * v) + normal(rng, 40);
    }
  } else if (run.boundary === "convergent") {
    if (run.crust === "cc") {
      next.mountain = approach(run.mountain, 8800, 0.016 * v) + normal(rng, 80);
      next.volcanoes = 0;
    } else {
      next.subducted = run.subducted + km;
      const depth = slabDepth(next);
      const trenchMax = run.crust === "oo" ? -10500 : -7500;
      next.trench = -4000 + (trenchMax + 4000) * (1 - Math.exp(-0.004 * next.subducted)) + normal(rng, 100);
      const magmaReady = depth >= 100; // slab must reach about 100 km before it releases water that melts the mantle
      if (run.crust === "oc") {
        next.mountain = approach(run.mountain, 6500, (magmaReady ? 0.012 : 0.004) * v) + normal(rng, 60);
        if (magmaReady && run.volcanoes < 6 && rng() < 0.55) { next.volcanoes = run.volcanoes + 1; event.newVolcanoes = 1; }
      } else {
        if (magmaReady) {
          next.mountain = approach(run.mountain, 3000, 0.03 * v) + normal(rng, 80);
          if (run.mountain <= 0 && next.mountain > 0) event.islands = true;
          if (run.volcanoes < 5 && rng() < 0.55) { next.volcanoes = run.volcanoes + 1; event.newVolcanoes = 1; }
        }
      }
      if (magmaReady && run.volcanoes === 0 && next.volcanoes > 0) event.firstVolcano = true;
    }
  } else if (run.boundary === "transform") {
    next.volcanoes = 0;
  } else if (run.boundary === "hotspot") {
    next.chain.forEach((c) => { c.dist += km; });
    if (run.crust === "o") {
      // The active volcano grows while it sits over the fixed plume, then the plate carries it away.
      next.chain.forEach((c) => {
        if (c.active) c.height = Math.min(4200, c.height + (4200 - c.height) * 0.5 + normal(rng, 120));
        else c.height = Math.max(-4000, c.height - 150);
      });
      const active = next.chain.find((c) => c.active);
      if (active && active.dist > run.nextSpacing) {
        active.active = false;
        next.chain.push({ id: run.nextId, born: next.time, dist: 0, height: -4000, active: true });
        next.nextId = run.nextId + 1; event.newVolcanoes = 1;
        next.nextSpacing = round(uniform(rng, 40, 100));
      }
    } else {
      next.mountain = 2000 + normal(rng, 150);
      if (rng() < 0.4) {
        next.chain.forEach((c) => { c.active = false; });
        next.chain.push({ id: run.nextId, born: next.time, dist: 0, height: 0, active: true });
        next.nextId = run.nextId + 1; next.supereruptions = run.supereruptions + 1;
        event.supereruption = true; event.newVolcanoes = 1;
      }
    }
  }

  // ---- earthquakes ----
  const q = QUAKES[key];
  const lambda = q.base * (0.35 + 0.13 * v);
  event.quakes = poisson(rng, lambda);
  const maxDepth = q.slab ? Math.max(15, slabDepth(next)) : null;
  for (let i = 0; i < event.quakes; i++) {
    const depth = q.slab ? Math.pow(rng(), 1.4) * maxDepth : uniform(rng, q.depth[0], q.depth[1]);
    const mag = q.mag[0] + (q.mag[1] - q.mag[0]) * Math.pow(rng(), 3);
    event.list.push([round(depth), Math.round(mag * 10) / 10, rng()]);
    event.deepest = Math.max(event.deepest ?? 0, round(depth));
    event.largest = Math.max(event.largest ?? 0, Math.round(mag * 10) / 10);
  }
  next.quakesTotal = run.quakesTotal + event.quakes;
  next.mountain = round(next.mountain, 10);
  next.trench = round(next.trench, 10);
  next.history = [...run.history, snapshot(next, v, event)];
  return next;
}

/** Magnetic stripe boundaries, newest first, for the stripes table. */
export function stripeTable(run) {
  return [...run.stripes].reverse().map((s) => ({ age: Math.round((run.time - s.t) * 10) / 10, fromRidge: Math.round(s.dist), between: Math.round(s.dist * 2) }));
}

/** Hot-spot chain, newest first. */
export function chainTable(run) {
  return [...run.chain].reverse().map((c) => ({ id: c.id, age: run.time - c.born, dist: Math.round(c.dist), height: round(c.height, 10), active: c.active }));
}
