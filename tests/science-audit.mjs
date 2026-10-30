// Reproducible checks of the shipped model APIs. No browser, hidden answer keys, or output writes by default.
import assert from 'node:assert/strict';
import {readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const slugs=['acids-bases','cell-operations','central-dogma','density-detective','earth-moon','earthquakes-structures','gravity-drop','marsh-beetles','net-force-cart','photosynthesis','plate-boundaries','predator-prey','roller-coaster','seasonal-changes','solar-system','star-life-cycle','states-of-matter'];
const models=Object.fromEntries(await Promise.all(slugs.map(async s=>[s,await import(`../${s}/model.js`)])));
const report={date:new Date().toISOString(),runtime:process.version,command:process.argv.join(' '),seedScheme:'seed = 1..N; each run starts at trial 1; fixed action sequences per setting',quantiles:'sorted linear interpolation at p*(N-1)',models:{},checked:[],results:[]};
for(const s of slugs)report.models[s]=createHash('sha256').update(await readFile(new URL(`../${s}/model.js`,import.meta.url))).digest('hex');
const N=Number(process.env.SCIENCE_TRIALS??1000),only=process.env.SCIENCE_ONLY;
assert.ok(Number.isInteger(N)&&N>0);
const close=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
const quantile=(a,p)=>{const i=(a.length-1)*p,j=Math.floor(i);return a[j]+(a[Math.min(j+1,a.length-1)]-a[j])*(i-j);};
function record(slug,setting,values,units){const sorted=values.toSorted((a,b)=>a-b);assert.ok(sorted.every(Number.isFinite));report.results.push({slug,setting,n:values.length,units,min:sorted[0],p10:quantile(sorted,.1),median:quantile(sorted,.5),p90:quantile(sorted,.9),max:sorted.at(-1)});}
function done(s){console.log(`PASS ${s}`);}
for(const slug of slugs){if((only&&slug!==only)||process.env.SCIENCE_SKIP===slug)continue;const m=models[slug];
 if(slug==='acids-bases'){
  for(let water=0;water<=180;water++){for(const kind of ['acid','base','neutral']){const r=m.dilute({kind,water});close(r.H*r.OH,m.KW,1e-20);close(r.H-r.OH,(kind==='acid'?.01:kind==='base'?-.01:0)*20/r.volume);assert.ok(kind==='neutral'?Math.abs(r.pH-7)<1e-10:kind==='acid'?r.pH<7:r.pH>7);}}
  for(let base=0;base<=120;base+=.1){const r=m.neutralize({base});close(r.H-r.OH,r.Cl-r.Na);close(r.H*r.OH,m.KW,1e-20);assert.ok(Number.isFinite(r.pH));}close(m.neutralize({base:60}).pH,7);
  for(const s of m.samples)close(m.testSample(s.id).pH,s.pH);
 }
 if(slug==='central-dogma'){
  assert.equal(Object.keys(m.CODE).length,64);assert.equal(Object.values(m.CODE).filter(x=>x==='*').length,3);
  const ref=m.express(m.EXAMPLES.reference);assert.equal(ref.rna,'AUGGCUUUUAAAUAA');assert.deepEqual(ref.chain,['M','A','F','K']);
  for(const [key,template] of Object.entries(m.EXAMPLES)){const r=m.express(template);assert.equal(m.complement(r.dna),template);if(key==='noStart')assert.equal(r.status,'noStart');if(key==='earlyStop')assert.ok(r.chain.length<ref.chain.length);if(key==='synonymous')assert.deepEqual(r.chain,ref.chain);}
  for(let seed=1;seed<=N;seed++){const r=m.express(m.templateFromSeed(seed));assert.equal(r.status,'complete');assert.equal(r.chain.length,4);}
 }
 if(slug==='density-detective'){
  for(const id of Object.keys(m.SAMPLES)){const r=m.measure(id);close(r.mass,r.density*r.volume);close(r.calculatedDensity,r.measuredMass/r.measuredVolume);assert.ok(r.submergedFraction>=0&&r.submergedFraction<=1);close(r.displacedVolume,r.floating?r.mass:r.volume);assert.deepEqual(m.replay(id,['mass','volume','calculate','water']),m.replay(id,['mass','volume','calculate','water']));}
  assert.equal(m.density(1,0),null);
 }
 if(slug==='earth-moon'){
  for(const tilt of [0,5.1,10])for(const node of [0,45,90,180])for(const distance of [363300,384400,405500])for(let j=0;j<=64;j++){const r=m.state({tilt,node,distance,day:m.MONTH*j/64});close(Math.hypot(r.x,r.y,r.z),distance);assert.ok(r.fraction>=0&&r.fraction<=1);if(r.eclipse.startsWith('solar'))assert.ok(r.fraction<.01);if(r.eclipse.startsWith('lunar'))assert.ok(r.fraction>.99);}
  assert.equal(m.state({day:0,node:90}).eclipse,'none');assert.equal(m.state({day:0,node:0,distance:363300}).eclipse,'solar-total');
 }
 if(slug==='gravity-drop'){
  for(const id of Object.keys(m.OBJECTS))for(const height of [0,.001,1,5,10,20,30])for(const env of ['air','vacuum']){const r=m.flight(id,height,env);assert.ok(Number.isFinite(r.duration));close(r.impact.height,0);if(env==='vacuum'){close(r.duration,Math.sqrt(2*height/m.G));close(r.impact.speed,Math.sqrt(2*m.G*height));}else assert.ok(r.duration+1e-9>=Math.sqrt(2*height/m.G));let last=height;for(let j=0;j<=30;j++){const s=r.at(r.duration*j/30);assert.ok(s.height<=last+1e-8);last=s.height;close(s.net,s.weight-s.drag);close(s.acceleration,s.net/r.mass);assert.ok(s.speed>=0&&s.acceleration>=-1e-9);}}
 }
 if(slug==='photosynthesis'){
  for(let light=0;light<=100;light+=5)for(let co2=0;co2<=100;co2+=5)for(const color of Object.keys(m.COLORS)){const r=m.at({light,co2,color},10);close(r.net,r.gross-r.respiration);close(r.collected,Math.max(0,r.net)*10);if(!light||!co2)close(r.gross,0);}
  for(let co2=0;co2<=18;co2++)for(let water=0;water<=18;water++){const a=m.makeAtoms(co2,water),b=m.react(a);assert.deepEqual(m.totals(a),m.totals(b));assert.deepEqual(m.react(a,false),a);}
 }
 if(slug==='seasonal-changes'){
  for(const lat of [-80,-60,-40,0,40,60,80])for(const tilt of [0,23.5,35])for(const surface of ['land','ocean']){const y=m.year(lat,tilt,surface);assert.ok(y.closureError<1e-8);for(let day=0;day<=365;day+=5){const s=m.state(lat,day,tilt,surface),opp=m.solar(-lat,day,tilt);assert.ok(s.daylight>=0&&s.daylight<=24);assert.ok(s.energy>=0);close(s.energy,s.meanFlux*.0864);close(s.daylight+opp.daylight,24);if(!tilt)close(s.daylight,12);}}
 }
 if(slug==='solar-system'){
  for(const p of m.planets){close(p.period**2,p.a**3);const a=m.planetAt(p,0),b=m.planetAt(p,p.period*m.YEAR);close(a.x,b.x);close(a.y,b.y);for(let j=0;j<=100;j++){const s=m.planetAt(p,p.period*m.YEAR*j/100);assert.ok(s.r>=p.a*(1-p.e)-1e-8&&s.r<=p.a*(1+p.e)+1e-8);}}
  for(const distance of [.4,1,5])for(const speed of [0,.5,1,1.4,1.8])for(const gravity of [false,true]){const r=m.simulateSandbox({distance,speed,gravity},.5),a=r.samples[0],e=m.energy(a,gravity);for(const s of r.samples){assert.ok(Object.values(s).every(Number.isFinite));if(!gravity){close(s.x,distance);close(s.y,a.vy*s.days/m.YEAR);}if(r.outcome!=='collision')close(m.energy(s,gravity),e,1e-3);}}
 }
 if(slug==='roller-coaster'){
  for(const height of [0,12,20,35])for(const resistance of [0,.06,.12])for(const cars of [1,4])for(const loops of [0,2]){const r=m.simulate({height,resistance,cars,loops});let time=-1,thermal=-1;for(const s of r.samples){assert.ok(Number.isFinite(s.time)&&s.time>=time);time=s.time;assert.ok(s.ke>=-1e-7&&s.thermal>=thermal-1e-7);thermal=s.thermal;close(s.ke,.5*r.mass*s.speed**2);close(s.total,s.ke+s.pe+s.thermal,1e-7);if(s.phase!=='lift')close(s.total,r.inputWork,1e-7);}for(let j=0;j<=100;j++){const s=m.frameAt(r,r.duration*j/100);close(s.ke,.5*r.mass*s.speed**2);close(s.total,s.ke+s.pe+s.thermal,1e-7);}}
 }
 if(slug==='marsh-beetles'){
  for(const habitat of ['pale','dark','mixed'])for(const pressure of [0,1,2,3]){const vals=[];for(let seed=1;seed<=N;seed++){let r=m.createRun(seed);for(let j=0;j<60;j++){const prev=r;r=m.advanceGeneration(r,{habitat,pressure});const z=r.history.at(-1);assert.equal(z.total,z.pale+z.dark);if(r!==prev){assert.equal(z.event.survived+z.event.eaten,prev.population.length);assert.equal(z.total,z.event.survived+z.event.offspring);}assert.ok(r.population.length<=120);if(!pressure&&r!==prev)assert.equal(z.event.eaten,0);}vals.push(r.history.at(-1).paleFraction??0);}record(slug,{habitat,pressure,generations:60},vals,'pale fraction');}
 }
 if(slug==='plate-boundaries'){
  for(const [boundary,crusts] of Object.entries(m.SETUPS))for(const crust of crusts)for(const speed of [1,5,10]){const vals=[];for(let seed=1;seed<=N;seed++){let r=m.createRun(seed,boundary,crust);for(let j=0;j<40;j++){r=m.advanceRun(r,{speed});close(r.moved,r.time*speed*10);if(boundary==='transform'){close(m.oceanChange(r),0);assert.equal(r.volcanoes,0);}for(const v of r.chain)assert.ok(v.dist>=0);assert.ok(r.quakesTotal>=0);}vals.push(r.history.at(-1).highest);}record(slug,{boundary,crust,speed,time:40},vals,'m elevation');}
 }
 if(slug==='net-force-cart'){
  const settings=[...m.MODES.map(mode=>({...m.DEFAULTS[mode]})),{mode:'push',force:0,surface:'none'},{mode:'push',force:2,surface:'none',pushTime:'short'},{mode:'tug',forceRight:2,forceLeft:2,surface:'none',start:'rolling'},...['none','carpet'].flatMap(surface=>[0,3].map(bars=>({mode:'apart',surface,launch:1,barsLeft:bars,barsRight:3-bars})))];
  for(const s of settings){const vals=[];for(let seed=1;seed<=N;seed++){const r=m.advanceTrial(m.createRun(seed),s).history[0];assert.deepEqual(r,m.advanceTrial(m.createRun(seed),s).history[0]);if(r.settings.mode==='apart'){for(const z of r.samples){assert.ok(z.left.x>=m.CART_HALF-1e-3&&z.right.x<=m.TRACK-m.CART_HALF+1e-3);if(z.t<m.LAUNCH_TIME)close(z.left.applied,-z.right.applied,.02);}vals.push(r.result.aMeasLeft);}else{for(const z of r.samples){assert.ok(z.x>=m.CART_HALF-1e-3&&z.x<=m.TRACK-m.CART_HALF+1e-3);if(r.settings.surface==='none'&&r.settings.mode==='tug'&&r.settings.forceRight===r.settings.forceLeft&&z.x>m.CART_HALF+.001&&z.x<m.TRACK-m.CART_HALF-.001)close(z.v,m.ROLL_SPEED,1e-3);}vals.push(r.result.aMeasured);}}record(slug,s,vals,'m/s² measured acceleration');}
 }
 if(slug==='cell-operations'){
  for(const cell of m.CELLS)for(const light of ['on','off'])for(const shutdown of m.SHUTDOWNS){const vals=[];for(let seed=1;seed<=N;seed++){const r=m.advanceTrial(m.createRun(seed),{cell,light,shutdown}).history[0];for(const z of r.samples)for(const gauge of m.GAUGES)assert.ok(z.true[gauge]>=0&&z.true[gauge]<=100);if(!m.HAS[cell][shutdown]&&shutdown!=='none')assert.deepEqual(r.samples,m.advanceTrial(m.createRun(seed),{cell,light,shutdown:'none'}).history[0].samples);vals.push(r.result.endTrue.energy);}record(slug,{cell,light,shutdown},vals,'energy gauge points (schematic)');}
 }
 if(slug==='star-life-cycle'){
  let lastLife=Infinity;for(const mass of m.MASSES){const vals=[];for(let seed=1;seed<=N;seed++){const r=m.simulateStar(mass,m.makeRng(seed));let age=-1;for(const z of r.samples){assert.ok(z.age>=age&&z.age<=m.UNIVERSE_AGE);age=z.age;if(z.T>0&&z.L>0)close(z.L,z.R*z.R*(z.T/m.SUN_T)**4);}if(mass===.5)assert.equal(r.result.endState,'alive');if(mass===1)assert.equal(r.result.endState,'whiteDwarf');vals.push(r.result.msLifeEstimate);}record(slug,{mass},vals,'years main-sequence lifetime');assert.ok(m.msLife(mass)<lastLife);lastLife=m.msLife(mass);}
  for(let seed=1;seed<=N;seed++){const r=m.newSortSet(m.createRun(seed));assert.equal(r.sort.stars.length,12);for(const type of m.TYPES)assert.ok(r.sort.stars.filter(s=>s.type===type).length>=2);}
 }
 if(slug==='states-of-matter'){
  for(const key of Object.keys(m.SUBSTANCES))for(const direction of ['heat','cool'])for(const mass of m.MASSES)for(const power of Object.keys(m.POWERS)){const vals=[];for(let seed=1;seed<=N;seed++){const sim=m.simulate({direction,mass,power},key,m.makeRng(seed)),r={...sim,key,settings:{direction}};close(sim.result.energy,sim.result.power*sim.result.total);for(const seg of sim.segments){close(seg.time,seg.energy/sim.result.power);if(seg.kind==='change'){close(seg.energy,sim.result.mass*seg.L);for(const f of [.001,.25,.5,.75,.999]){const z=m.sampleAt(r,seg.start+seg.time*f);close(z.T,seg.at);close(z.frac,f);assert.equal(z.change,seg.change);assert.ok(Math.abs(z.reading-z.T)<=.25);}}}if(key==='co2')assert.ok(sim.segments.every(s=>s.state!=='liquid'&&s.next!=='liquid'));vals.push(sim.result.total);}record(slug,{key,direction,mass,power},vals,'s total duration');}
 }
 if(slug==='predator-prey'){
  for(const setting of [{},{experiment:'short'},{climate:'constant'},{hares:0},{foxes:0},{food:0},{food:300},{shelter:100}]){const vals=[];for(let seed=1;seed<=N;seed++){const trial=m.createTrial(seed,setting),frames=trial.run();for(let i=1;i<frames.length;i++){const a=frames[i-1],b=frames[i];assert.ok(b.hares>=0&&b.foxes>=0);close(b.hares,a.hares+b.hBirths-b.hDeaths-b.kills);close(b.foxes,a.foxes+b.fBirths-b.fDeaths);assert.ok(b.kills<=b.detected+1e-8&&b.detected<=b.encounters+1e-8);if(setting.hares===0)close(b.hares,0);if(setting.foxes===0){close(b.foxes,0);close(b.kills,0);}}vals.push(frames.at(-1).hares);}record(slug,setting,vals,'expected hares in study area');}
  const a=m.createTrial(42,{climate:'constant'}).run(),b=m.createTrial(42,{climate:'constant'}).run();assert.deepEqual(a,b);
 }
 if(slug==='earthquakes-structures'){
  const scenarios=[{magnitude:6,distance:30,soil:'rock'},{magnitude:6.5,distance:30,soil:'soft'},{magnitude:7,distance:20,soil:'soft'}];
  const d=m.preset('school');const zero=m.simulate(d,{source:'table',amplitude:0});close(zero.summary.peakDrift,0);close(zero.summary.peakAccel,0);
  for(const setting of scenarios){const vals=[];for(let seed=1;seed<=N;seed++){const r=m.simulate(d,{...setting,seed});assert.ok(Number.isFinite(r.summary.peakDrift)&&Number.isFinite(r.summary.peakAccel));assert.ok(r.summary.storyDrifts.every(x=>x>=0));assert.equal(r.samples.length>1,true);for(const z of r.samples){assert.ok(z.positions.every(Number.isFinite));assert.ok(z.drifts.every(Number.isFinite));}vals.push(r.summary.peakDrift);}record(slug,setting,vals,'% peak story drift');}
  for(const stories of [1,3,6])for(const material of Object.keys(m.MATERIALS))for(const foundation of ['fixed','isolated']){const d=m.design(stories,material);d.foundation=foundation;assert.equal(m.validate(d).length,0);const r=m.simulate(d,{source:'table',amplitude:.05,duration:3});assert.ok(Number.isFinite(r.summary.peakDrift));}
 }
 report.checked.push(slug);done(slug);
}
report.deterministicAnchors={
 'acids-bases':{units:'pH at 25 C; volumes mL',base60:models['acids-bases'].neutralize({base:60}).pH,acidDilutedTo200:models['acids-bases'].dilute({kind:'acid',water:180}).pH},
 'central-dogma':{reference:models['central-dogma'].express(models['central-dogma'].EXAMPLES.reference)},
 'density-detective':{units:'g, cm3, g/cm3',wood:models['density-detective'].measure('cube_wood')},
 'gravity-drop':{units:'s, m/s',vacuum10m:models['gravity-drop'].flight('bowling',10,'vacuum').impact},
 'seasonal-changes':{units:'h, deg, MJ/m2/day, C anomaly',northJune:models['seasonal-changes'].state(40,365/4,23.5,'land'),zeroTilt:models['seasonal-changes'].state(40,365/4,0,'land')},
 'solar-system':{units:'AU, Earth years',planets:models['solar-system'].planets.map(({id,a,period})=>({id,a,period}))},
 'photosynthesis':{units:'min, mL O2, mL O2/min',default10:models['photosynthesis'].at({},10),dark10:models['photosynthesis'].at({light:0},10)},
 'earth-moon':{units:'fraction of visible disc',newMoon:models['earth-moon'].state({day:0}).fraction,fullMoon:models['earth-moon'].state({day:models['earth-moon'].MONTH/2}).fraction}
};
report.complete=true;
if(process.argv[2])await writeFile(process.argv[2],JSON.stringify(report,null,2));
console.log(`PASS: ${report.results.length} stochastic settings × ${N} seeded trials; deterministic sweeps complete.`);
