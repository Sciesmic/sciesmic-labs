import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import * as model from './model.js';

// Exercise the production SVG renderer without adding a browser or package dependency.
const source = readFileSync(new URL('./app.js', import.meta.url), 'utf8')
  .replace(/^import .*;\n/gm, '').split('/* ---------- wiring ---------- */')[0];
const context = vm.createContext({ ...model, URLSearchParams, location: {search:'?seed=42'},
  document: {querySelector:()=>null}, animationNow:()=>1000, animationWait:()=>Promise.resolve(), motionPreference:{matches:true}, performance: {now:()=>1000},
  t: key=>key, matchMedia:()=>({matches:true}) });
vm.runInContext(source, context);
const render = (frame, expression='beakerSvg(testFrame)') => {
  context.testFrame = {key:'water', mystery:false, state:'solid', change:null, next:null,
    frac:0, direction:'heat', power:'medium', t:0, T:0, ...frame};
  return vm.runInContext(expression, context);
};

test('solid disappears continuously at the end of melting', () => {
  const svg = render({change:'melting', next:'liquid', frac:1-1e-9});
  const side = Number(svg.match(/scale\(([^)]+)\)/)[1])*64;
  assert.ok(side < .1, `remaining solid should approach zero, got ${side}`);
});

test('liquid disappears continuously at the end of boiling', () => {
  const svg = render({state:'liquid', change:'boiling', next:'gas', frac:1-1e-9});
  const radius = Number(svg.match(/data-phase="liquid"[\s\S]*?height="([^"]+)"/)[1]);
  assert.ok(radius < .1, `remaining liquid should approach zero, got ${radius}`);
});

test('all six phase changes render finite nonnegative geometry at both endpoints', () => {
  for (const [state, next, change] of [['solid','liquid','melting'],['liquid','gas','boiling'],
    ['gas','liquid','condensing'],['liquid','solid','freezing'],['solid','gas','sublimation'],['gas','solid','deposition']]) {
    for (const frac of [0,1e-9,.25,.5,.75,1-1e-9,1]) {
      for (const key of ['water','co2']) {
        const svg = render({state,next,change,frac,key});
        assert.doesNotMatch(svg, /NaN|Infinity/);
        for (const attr of svg.matchAll(/(?:width|height|rx|ry|r)="(-?[\d.]+)"/g)) assert.ok(Number(attr[1])>=0);
      }
    }
  }
});

test('particle identity stays stable through phases and mystery hides substance', () => {
  for (const state of ['solid','liquid','gas']) {
    const water = render({state},'particleLayerSvg(testFrame)');
    const co2 = render({state,key:'co2'},'particleLayerSvg(testFrame)');
    const hidden = render({state,key:'co2',mystery:true},'particleLayerSvg(testFrame)');
    assert.equal((water.match(/<g /g)||[]).length,30);
    assert.equal((water.match(/atom-red/g)||[]).length,30);
    assert.equal((co2.match(/atom-red/g)||[]).length,60);
    assert.equal((co2.match(/atom-carbon/g)||[]).length,30);
    assert.doesNotMatch(hidden,/atom-carbon|atom-red/);
    assert.equal((hidden.match(/atom-mystery/g)||[]).length,30);
  }
});

test('playback reuses molecule nodes; substance changes rebuild them', () => {
  const elements = new Map(); let rebuilds = 0;
  const scene = {
    set innerHTML(value) {
      rebuilds++;
      elements.clear();
      for (const selector of ['#scene-title','#scene-desc','#sample-layer','#instrument-layer','.view-label','.view-legend']) elements.set(selector,{});
      elements.set('#particle-layer', {children:Array.from({length:30},()=>({setAttribute(){}}))});
    },
    querySelector: selector=>elements.get(selector),
  };
  context.mockScene = scene;
  vm.runInContext('refs.scene = mockScene; refs.track = {}; refs.readouts = {};', context);
  render({state:'solid'}, 'drawScene(testFrame)');
  const nodes = elements.get('#particle-layer').children;
  render({state:'liquid'}, 'drawScene(testFrame)');
  render({state:'gas'}, 'drawScene(testFrame)');
  assert.equal(rebuilds,1);
  assert.equal(elements.get('#particle-layer').children,nodes);
  render({key:'co2'}, 'drawScene(testFrame)');
  assert.equal(rebuilds,2);
  assert.notEqual(elements.get('#particle-layer').children,nodes);
});


test('beaker stays open and only boiling liquid produces bubbles', () => {
  const boiling = render({state:'liquid',next:'gas',change:'boiling',frac:.5,t:12});
  assert.match(boiling,/data-boiling-bubble/);
  assert.match(boiling,/data-vapor/);
  const dryIce = render({key:'co2',state:'solid',next:'gas',change:'sublimation',frac:.5,t:12});
  assert.doesNotMatch(dryIce,/data-boiling-bubble|data-phase="liquid"/);
  const gas = render({state:'gas',t:12});
  assert.doesNotMatch(gas,/data-phase="solid"|data-phase="liquid"/);
  assert.match(gas,/data-vapor/);
  assert.doesNotMatch(gas,/bag-glass/);
});

test('liquid and gas use the same kinetic-speed cue at a fixed temperature', () => {
  const displacement=state=>{
    context.phaseState=state;
    return vm.runInContext(`particles.forEach(p=>{p.x=VIEW.cx;p.y=VIEW.cy+60;p.vx=1;p.vy=0;p.a=0;});
      stepParticles({state:phaseState,T:100,change:null},1);
      Math.hypot(particles[0].x-VIEW.cx,particles[0].y-(VIEW.cy+60));`,context);
  };
  assert.ok(Math.abs(displacement('liquid')-displacement('gas'))<1e-9);
});


test('playback stays isothermal right across every phase boundary', () => {
  for (const key of Object.keys(model.SUBSTANCES)) for (const direction of ['heat','cool']) {
    const sim = model.simulate({direction,mass:50,power:'high'}, key, model.makeRng(42));
    context.testTrial = {...sim, key, settings:{direction}};
    for (const plateau of sim.result.plateaus) {
      for (const time of [plateau.start+.0001, plateau.end-.0001]) {
        context.testTime = time;
        const actual = vm.runInContext('interpolate(testTrial,testTime)',context);
        assert.equal(actual.T,plateau.at);
        assert.equal(actual.change,plateau.change);
        assert.ok(actual.frac>0&&actual.frac<1);
      }
    }
  }
});
