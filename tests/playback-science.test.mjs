import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import * as cart from '../net-force-cart/model.js';
import * as quake from '../earthquakes-structures/model.js';
const source=readFileSync(new URL('../net-force-cart/app.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'').split('/* ---------- words for a trial ---------- */')[0];
const context=vm.createContext({...cart,URLSearchParams,location:{search:'?seed=42'},document:{querySelector:()=>null},animationWait:()=>Promise.resolve(),motionPreference:{matches:false},t:key=>key});
vm.runInContext(source,context);
function frame(settings,time){context.trial=cart.advanceTrial(cart.createRun(42),settings).history[0];context.time=time;return vm.runInContext('frameFromSample(trial,interpolate(trial,time))',context);}
test('short push loses its applied and net-force arrows together',()=>{
 const f=frame({mode:'push',force:2,surface:'none',pushTime:'short'},.501);
 assert.equal(f.carts[0].pushRight,0);assert.equal(f.carts[0].net,0);
});
test('spring force and net force agree immediately after contact ends',()=>{
 const f=frame({mode:'apart',surface:'none'},.101);
 for(const c of f.carts){assert.equal(c.pushRight,0);assert.equal(c.pushLeft,0);assert.equal(c.net,0);}
});
test('moving velocity readout changes continuously between samples',()=>{
 const f=frame({mode:'push',force:2,surface:'none'},.025);
 const t=context.trial,s=t.samples;
 assert.ok(f.carts[0].v>s[0].v&&f.carts[0].v<s[1].v);
});
test('seismic playback interpolates displacement while retaining only observed damage/peaks',()=>{
 const r=quake.simulate(quake.preset('school'),{magnitude:7,distance:20,soil:'soft'});
 for(let i=0;i<r.samples.length-1;i++){const a=r.samples[i],b=r.samples[i+1],mid=quake.sampleAt(r,(a.time+b.time)/2);assert.deepEqual(mid.damage,a.damage);assert.deepEqual(mid.peaks,a.peaks);assert.ok(Math.abs(mid.roof-(a.roof+b.roof)/2)<1e-8);}
 for(const s of r.samples)assert.deepEqual(quake.sampleAt(r,s.time),s);
});

test('static friction vanishes when a stuck cart is released',()=>{
 for(const settings of [{mode:'apart',launch:1,surface:'carpet',barsLeft:3,barsRight:3}]){
  const f=frame(settings,settings.mode==='apart'?.101:.501);
  for(const c of f.carts){assert.equal(c.v,0);assert.equal(c.friction,0);assert.equal(c.net,0);}
 }
});
