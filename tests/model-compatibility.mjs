import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import * as thermal from '../states-of-matter/model.js';
import * as seismic from '../earthquakes-structures/model.js';
const base='9d8347e63be7592548674809525c2844d7338df7';
async function baseline(path){const text=execFileSync('git',['show',`${base}:${path}`],{encoding:'utf8'});return import('data:text/javascript;base64,'+Buffer.from(text).toString('base64'));}
const oldThermal=await baseline('states-of-matter/model.js');
let trials=0;
for(let seed=1;seed<=100;seed++)for(const key of Object.keys(thermal.SUBSTANCES))for(const direction of ['heat','cool'])for(const mass of thermal.MASSES)for(const power of Object.keys(thermal.POWERS)){
 const input={direction,mass,power},a=thermal.simulate(input,key,thermal.makeRng(seed)),b=oldThermal.simulate(input,key,oldThermal.makeRng(seed));
 assert.deepEqual(a.samples,b.samples);assert.deepEqual(a.result,b.result);assert.equal(a.dt,b.dt);trials++;
}
const oldSeismic=await baseline('earthquakes-structures/model.js');
for(let seed=1;seed<=20;seed++)for(const setting of [{magnitude:6,distance:30,soil:'rock'},{magnitude:6.5,distance:30,soil:'soft'},{magnitude:7,distance:20,soil:'soft'}]){
 assert.deepEqual(seismic.simulate(seismic.preset('school'),{...setting,seed}),oldSeismic.simulate(oldSeismic.preset('school'),{...setting,seed}));trials++;
}
console.log(`PASS: ${trials} exact full-output comparisons against ${base}; sensor samples, numeric results and seismic summaries unchanged.`);
