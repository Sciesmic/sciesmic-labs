import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../kit/motion.js',import.meta.url),'utf8').replaceAll('export ','');
function setup({stored=null,query='',system=false,blocked=false}={}){
 let time=0,queue=[],intervals=[],events={},writes=[];
 const media={matches:system,addEventListener:(name,fn)=>events.media=fn};
 const doc={hidden:false,documentElement:{dataset:{}},addEventListener:(name,fn)=>events[name]=fn};
 const ctx=vm.createContext({matchMedia:()=>media,URL,URLSearchParams,location:{search:query,href:'https://example.test/lab/'+query},history:{replaceState:(...args)=>writes.push(args)},localStorage:{getItem:()=>{if(blocked)throw Error();return stored;},setItem:(_k,v)=>{if(blocked)throw Error();stored=v;}},document:doc,performance:{now:()=>time},requestAnimationFrame:fn=>{queue.push(fn);return queue.length;},setInterval:fn=>{intervals.push(fn);return intervals.length;}});
 vm.runInContext(source,ctx);
 return {run:s=>vm.runInContext(s,ctx),doc,media,frame(t){time=t;const q=queue;queue=[];q.forEach(fn=>fn(t));},time(t){time=t;},hide(t){time=t;doc.hidden=true;events.visibilitychange();},show(t){time=t;doc.hidden=false;events.visibilitychange();},interval(){intervals.forEach(fn=>fn());},system(value){media.matches=value;events.media();},stored:()=>stored,writes};
}
test('system, saved preference, URL precedence and live updates',()=>{
 const a=setup({system:true});assert.equal(a.doc.documentElement.dataset.motion,'reduce');a.run('setReducedMotion(false)');assert.equal(a.stored(),'full');assert.equal(a.run('motionPreference.matches'),false);a.system(true);assert.equal(a.run('motionPreference.matches'),false);
 const b=setup({stored:'full',query:'?motion=reduce'});assert.equal(b.run('motionPreference.matches'),true);b.run('setReducedMotion(false)');assert.equal(b.writes.length,1);
 const c=setup({blocked:true});c.run('setReducedMotion(true)');assert.equal(c.run('motionPreference.matches'),true);
});
test('background time is excluded from RAF timestamps and waits',async()=>{
 const a=setup();a.time(100);a.run('var seen=-1;animationFrame(t=>seen=t);var finished=false;animationWait(500).then(()=>finished=true)');a.frame(200);assert.equal(a.run('seen'),200);
 a.hide(200);a.frame(20200);assert.equal(a.run('animationNow()'),200);await Promise.resolve();assert.equal(a.run('finished'),false);
 a.show(20200);a.frame(20599);await Promise.resolve();assert.equal(a.run('finished'),false);a.frame(20600);await Promise.resolve();assert.equal(a.run('finished'),true);assert.equal(a.run('animationNow()'),600);
});
test('interval-driven science steps stop in background without catch-up',()=>{
 const a=setup();a.run('var steps=0;animationInterval(()=>steps++,100)');a.interval();a.hide(100);for(let i=0;i<50;i++)a.interval();assert.equal(a.run('steps'),1);a.show(10000);a.interval();assert.equal(a.run('steps'),2);
});
