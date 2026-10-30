// Net Force Cart Lab model. Pure functions, no DOM.
// A dynamics cart (or two) on a 2.0 m level track. Forces are in newtons (N), mass in kilograms (kg),
// velocity in m/s and acceleration in m/s². The model integrates Newton's second law (a = Fnet / m)
// in 0.005 s steps and records a sample every 0.05 s, like a motion sensor.
//
// Misconception guardrails built into the model:
//  - A cart never slows down "on its own". With net force = 0, velocity stays exactly the same.
//    Slowing comes from friction or end-stop contact; collisions are not time-resolved.
//  - A force is not "used up" or stored in the cart. When a push stops, its arrow disappears;
//    the cart keeps the velocity it already had.
//  - In Push apart mode the two carts always push on each other with equal and opposite forces,
//    whatever their masses. Only their accelerations differ.
//
// Chance is built in on purpose so repeated trials vary a little:
//  - each trial's friction differs from the surface's typical value by about ±8% (surfaces are not perfectly even),
//  - each applied force is off from its setting by about ±2% (a real push or spring is never exact;
//    in Tug mode both pushes share the same error, so equal settings stay exactly balanced),
//  - the motion sensor adds a little noise (about ±0.004 m/s) to each velocity reading.

export const G = 9.8;
export const TRACK = 2.0;           // m
export const CART_HALF = 0.085;     // half a cart length, m
export const BASE_MASS = 0.5;       // empty cart, kg
export const BAR_MASS = 0.25;       // each mass bar, kg
export const MODES = ["push", "tug", "apart"];
export const SURFACES = { none: 0, smooth: 0.005, felt: 0.06, carpet: 0.15 }; // typical friction coefficient
export const LAUNCH = { 1: 2, 2: 4, 3: 6 };   // average spring force (N) while the plunger pushes
export const LAUNCH_TIME = 0.1;     // s the plunger is in contact
export const ROLL_SPEED = 0.4;      // m/s starting speed for "already rolling" in Tug mode
export const PUSH_STOP = 0.5;       // s when a short push ends
const DT = 0.005, SAMPLE = 0.05;    // motion sensor samples 20 times per second
const MAX_TIME = { push: 4, tug: 4, apart: 3 };
const STATIC_FACTOR = 1.3;          // static friction is a little stronger than sliding friction

export const massOf = (bars) => BASE_MASS + BAR_MASS * Math.min(3, Math.max(0, Number(bars) || 0));

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
const r2 = (value) => Math.round(value * 100) / 100;
const r3 = (value) => Math.round(value * 1000) / 1000;

/** Default settings for each mode; the app keeps one settings object per mode. */
export const DEFAULTS = {
  push: { mode: "push", force: 2, bars: 0, surface: "smooth", pushTime: "all" },
  tug: { mode: "tug", forceRight: 3, forceLeft: 1, bars: 0, surface: "smooth", start: "rest" },
  apart: { mode: "apart", launch: 2, barsLeft: 0, barsRight: 0, surface: "smooth" },
};

export function normalize(settings) {
  const mode = MODES.includes(settings?.mode) ? settings.mode : "push";
  const s = { ...DEFAULTS[mode], ...settings, mode };
  if (!(s.surface in SURFACES)) s.surface = DEFAULTS[mode].surface;
  const force = (value) => clamp(Math.round((Number(value) || 0) * 2) / 2, 0, 4);
  const bars = (value) => clamp(Math.round(Number(value) || 0), 0, 3);
  if (mode === "push") { s.force = force(s.force); s.bars = bars(s.bars); s.pushTime = s.pushTime === "short" ? "short" : "all"; }
  if (mode === "tug") { s.forceRight = force(s.forceRight); s.forceLeft = force(s.forceLeft); s.bars = bars(s.bars); s.start = s.start === "rolling" ? "rolling" : "rest"; }
  if (mode === "apart") { s.launch = clamp(Math.round(Number(s.launch) || 2), 1, 3); s.barsLeft = bars(s.barsLeft); s.barsRight = bars(s.barsRight); }
  return s;
}

/** Start a run. Every trial in the run draws its chance from the run seed and the trial number. */
export function createRun(seed) {
  return { seed: Number(seed) >>> 0, history: [] };
}

/* ---------- one cart, one time step ---------- */
function stepCart(cart, applied, mu) {
  const fk = mu * cart.m * G, fs = STATIC_FACTOR * fk;
  let friction;
  if (cart.v === 0) friction = Math.abs(applied) <= fs ? -applied : -Math.sign(applied) * fk;
  else friction = -Math.sign(cart.v) * fk;
  const net = applied + friction;
  const a = net / cart.m;
  let v = cart.v + a * DT;
  // Friction can stop a cart but never pushes it backward.
  if (cart.v !== 0 && Math.sign(v) !== Math.sign(cart.v) && Math.abs(applied) <= fs) v = 0;
  if (cart.v === 0 && Math.abs(applied) <= fs) v = 0;
  let x = cart.x + ((cart.v + v) / 2) * DT;
  let bumped = cart.bumped;
  if (x <= CART_HALF || x >= TRACK - CART_HALF) {
    // The end stop holds the cart: it is at rest and the stop balances any push, so the net force is zero.
    x = clamp(x, CART_HALF, TRACK - CART_HALF); v = 0; bumped = bumped || (x <= CART_HALF ? "left" : "right");
    return { ...cart, x, v, a: 0, applied, friction: 0, stop: -applied, net: 0, bumped };
  }
  return { ...cart, x, v, a, applied, friction, stop: 0, net, bumped };
}

function sampleOf(cart, rng) {
  return {
    x: r3(cart.x), v: r3(cart.v), vMeas: r3(cart.v === 0 ? 0 : cart.v + normal(rng, 0.004)), // a still cart reads 0.00
    stop: r2(cart.stop || 0), applied: r2(cart.applied), friction: r2(cart.friction), net: r2(cart.net), a: r2(cart.a),
  };
}

/** Least-squares slope of measured velocity over the samples (acceleration a motion sensor would report). */
export function slope(points) {
  if (points.length < 2) return 0;
  const n = points.length, mt = points.reduce((s, p) => s + p.t, 0) / n, mv = points.reduce((s, p) => s + p.v, 0) / n;
  let num = 0, den = 0;
  points.forEach((p) => { num += (p.t - mt) * (p.v - mv); den += (p.t - mt) ** 2; });
  return den ? num / den : 0;
}

/* ---------- Push and Tug: one cart ---------- */
function runOneCart(settings, rng) {
  const s = settings;
  const m = massOf(s.bars);
  const mu = SURFACES[s.surface] * clamp(1 + normal(rng, 0.08), 0.75, 1.25);
  const kick = () => clamp(1 + normal(rng, 0.02), 0.94, 1.06);
  let appliedAt;
  let cart;
  const pushes = { right: 0, left: 0 };
  if (s.mode === "push") {
    const F = s.force * kick();
    pushes.right = F;
    appliedAt = (t) => (s.pushTime === "short" && t >= PUSH_STOP - 1e-9 ? 0 : F);
    cart = { m, x: 0.2, v: 0, a: 0, applied: 0, friction: 0, net: 0, bumped: null };
  } else {
    // Both pushes come from the same kind of spring scale, so they share one calibration error:
    // equal settings always give exactly balanced forces.
    const k = kick(), FR = s.forceRight * k, FL = s.forceLeft * k;
    pushes.right = FR; pushes.left = FL;
    appliedAt = () => FR - FL;
    cart = { m, x: 1.0, v: s.start === "rolling" ? ROLL_SPEED : 0, a: 0, applied: 0, friction: 0, net: 0, bumped: null };
  }
  // Settle the forces at t = 0 without moving the cart (so the first sample shows the real forces).
  const first = stepCart({ ...cart }, appliedAt(0), mu);
  cart = { ...cart, a: first.a, applied: first.applied, friction: first.friction, net: first.net };
  const samples = [{ t: 0, ...sampleOf(cart, rng) }];
  const maxT = MAX_TIME[s.mode];
  const steps = Math.round(maxT / DT), every = Math.round(SAMPLE / DT);
  let endT = maxT;
  for (let i = 1; i <= steps; i++) {
    const t = i * DT;
    cart = stepCart(cart, appliedAt(t - DT), mu);
    if (i % every === 0 || cart.bumped) {
      samples.push({ t: r2(t), ...sampleOf(cart, rng) });
      if (cart.bumped) { endT = r2(t); break; }
    }
    // Stop early once the cart is at rest and the forces cannot move it.
    if (cart.v === 0 && t > 0.3 && Math.abs(appliedAt(t)) <= STATIC_FACTOR * mu * m * G && i % every === 0) { endT = r2(t); break; }
  }
  return { samples, endT, m, mu, bumped: cart.bumped, appliedAt, pushes };
}

function summarizeOneCart(s, sim) {
  const { samples, m, mu } = sim;
  // Phase 1: while the starting forces act (all of Tug; Push until the push stops).
  const phaseEnd = s.mode === "push" && s.pushTime === "short" ? PUSH_STOP : Infinity;
  const phase1 = samples.filter((p) => p.t <= phaseEnd + 1e-9);
  const moving1 = phase1.filter((p, i) => i === 0 ? p.v !== 0 || s.mode === "tug" : true);
  const forceSample = phase1.find((p) => p.v !== 0) ?? phase1[phase1.length - 1] ?? samples[0];
  // Fit the measured velocity while it is changing under constant forces (stop at an end bump or a stop).
  let fitPoints = [];
  for (const p of moving1) {
    fitPoints.push({ t: p.t, v: p.vMeas });
    if (p.v === 0 && fitPoints.length > 1) break;
  }
  if (sim.bumped) fitPoints = fitPoints.filter((p) => p.t < sim.endT - 1e-9);
  const stayedAtRest = samples.every((p) => p.v === 0);
  const aMeasured = stayedAtRest ? 0 : r2(slope(fitPoints));
  const startV = samples[0].v, endPhase = phase1[phase1.length - 1];
  const vMax = Math.max(...samples.map((p) => Math.abs(p.v)));
  const net = forceSample.net, friction = forceSample.friction, applied = forceSample.applied;
  let outcome;
  if (stayedAtRest) outcome = "rest";
  else if (Math.abs(net) < 0.005) outcome = "constant";
  else if (startV === 0 || Math.sign(net) === Math.sign(startV)) outcome = "speedUp";
  else if (samples.some((p) => Math.sign(p.v) === -Math.sign(startV) && p.v !== 0)) outcome = "reversed";
  else if (endPhase.v === 0 || samples.at(-1).v === 0) outcome = "stopped";
  else outcome = "slowDown";
  // After a short push: what did the cart do with no push?
  let after = null;
  if (s.mode === "push" && s.pushTime === "short" && !stayedAtRest) {
    const coast = samples.filter((p) => p.t > PUSH_STOP + 1e-9);
    const atStop = samples.find((p) => Math.abs(p.t - PUSH_STOP) < 1e-9) ?? endPhase;
    if (coast.length) {
      const c = coast[0];
      after = {
        friction: c.friction, net: c.net, vAtStop: atStop.v, vEnd: coast.at(-1).v,
        a: r2(slope([{ t: atStop.t, v: atStop.vMeas }, ...coast.filter((p) => p.v !== 0 || p === coast[0]).map((p) => ({ t: p.t, v: p.vMeas }))])),
        behavior: Math.abs(c.net) < 0.005 ? "constant" : coast.at(-1).v === 0 && !sim.bumped ? "stopped" : "slowDown",
      };
    }
  }
  return {
    mass: r2(m), mu: r3(mu), applied, pushRight: r2(sim.pushes.right), pushLeft: r2(sim.pushes.left), friction, net, aMeasured, aPredicted: r2(net / m),
    vStart: startV, vEnd: samples.at(-1).v, vMax: r3(vMax), outcome, after, bumped: sim.bumped, endT: sim.endT,
    distance: r3(Math.abs(samples.at(-1).x - samples[0].x)),
  };
}

/* ---------- Push apart: two carts ---------- */
function runApart(s, rng) {
  const mL = massOf(s.barsLeft), mR = massOf(s.barsRight);
  const mu = SURFACES[s.surface] * clamp(1 + normal(rng, 0.08), 0.75, 1.25);
  const F = LAUNCH[s.launch] * clamp(1 + normal(rng, 0.02), 0.94, 1.06);
  let L = { m: mL, x: 1.0 - CART_HALF, v: 0, a: 0, applied: 0, friction: 0, net: 0, bumped: null };
  let R = { m: mR, x: 1.0 + CART_HALF, v: 0, a: 0, applied: 0, friction: 0, net: 0, bumped: null };
  // While the plunger pushes, the spring pushes the left cart left and the right cart right with equal force.
  const springAt = (t) => (t < LAUNCH_TIME - 1e-9 ? F : 0);
  const sample = (t) => ({ t: r2(t), left: sampleOf(L, rng), right: sampleOf(R, rng), spring: r2(springAt(t)) });
  const settle = (cart, applied) => { const f = stepCart({ ...cart }, applied, mu); return { ...cart, a: f.a, applied: f.applied, friction: f.friction, net: f.net }; };
  L = settle(L, -F); R = settle(R, F);
  const samples = [sample(0)];
  const steps = Math.round(MAX_TIME.apart / DT), every = Math.round(SAMPLE / DT);
  let peak = null;
  let endT = MAX_TIME.apart;
  for (let i = 1; i <= steps; i++) {
    const t = i * DT, Fs = springAt(t - DT);
    L = stepCart(L, -Fs, mu); R = stepCart(R, Fs, mu);
    if (!peak && Fs > 0) peak = { FonL: r2(-Fs), FonR: r2(Fs), aL: r2(L.a), aR: r2(R.a) };
    if (i % every === 0) samples.push(sample(t));
    if (i % every === 0 && t > LAUNCH_TIME && L.v === 0 && R.v === 0) { endT = r2(t); break; }
  }
  // A force sensor on each cart's bumper reads the spring force (with a little noise).
  const read = (value) => r2(value + normal(rng, 0.02));
  const launchSample = samples.find((p) => p.t >= LAUNCH_TIME - 1e-9);
  const result = {
    massLeft: r2(mL), massRight: r2(mR), mu: r3(mu), force: r2(F),
    forceOnLeft: read(-F), forceOnRight: read(F),
    aLeft: r2(-F / mL), aRight: r2(F / mR),
    vLeft: launchSample.left.vMeas, vRight: launchSample.right.vMeas,
    // What a student gets from the motion sensor: change in velocity during the push ÷ push time.
    aMeasLeft: r2(launchSample.left.vMeas / LAUNCH_TIME), aMeasRight: r2(launchSample.right.vMeas / LAUNCH_TIME),
    distLeft: r3(Math.abs(samples.at(-1).left.x - samples[0].left.x)), distRight: r3(Math.abs(samples.at(-1).right.x - samples[0].right.x)),
    bumpedLeft: L.bumped, bumpedRight: R.bumped, endT,
  };
  return { samples, result, peak };
}

/** Run one trial with the given settings. Returns a new run with the trial added to history. */
export function advanceTrial(run, settings) {
  const s = normalize(settings);
  const index = run.history.length + 1;
  const rng = makeRng(run.seed + index * 7919 + 1);
  let trial;
  if (s.mode === "apart") {
    const sim = runApart(s, rng);
    trial = { index, settings: s, samples: sim.samples, result: sim.result };
  } else {
    const sim = runOneCart(s, rng);
    trial = { index, settings: s, samples: sim.samples, result: summarizeOneCart(s, sim) };
  }
  return { ...run, history: [...run.history, trial] };
}
