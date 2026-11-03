// Well-mixed, seeded teaching model. Time and volumes are model units, not calibrated seconds/litres.
// Individual crossing events conserve particles. Brownian-looking in-compartment paths are presentation only.
export const STEPS=120;
export const SPECIES=['o2','co2','na','k','glucose','cargo'];
export const DEFAULTS={mode:'diffusion',species:'o2',inside:20,outside:80,volume:1,proteins:2,pathway:'lipid',channelSpecies:'na',gate:'leak',ligand:true,voltage:0,atp:20,cell:'animal',bulk:'endo',energy:true,gradient:'high'};
export function random(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
export function normalize(v={}){const s={...DEFAULTS,...v};for(const key of ['inside','outside'])s[key]=Math.max(0,Math.min(120,Math.round(+s[key]||0)));s.proteins=Math.max(0,Math.min(4,Math.round(+s.proteins||0)));s.atp=Math.max(0,Math.min(40,Math.round(+s.atp||0)));s.volume=Math.max(.5,Math.min(1.5,+s.volume||1));s.voltage=[-70,0,30].includes(+s.voltage)?+s.voltage:0;s.species=SPECIES.includes(s.species)?s.species:'o2';s.cell=s.cell==='plant'?'plant':'animal';return s;}
export function waterFlux(si,so,vi,vo,cell,permeability=1){
 const pressure=cell==='plant'?400*Math.max(vi-1,0):0;
 const net=.0008*permeability*(si/vi-so/vo-pressure);
 // Gross exchange persists in pure water and at zero net flow.
 return {net,into:.02*permeability+Math.max(net,0),outof:.02*permeability+Math.max(-net,0),pressure};
}
export function run(input={},seed=42){
 const s=normalize(input),rng=random(seed),particles=[],events=[],cycles=[],rows=[];
 let sides=[],reserved=new Set(),atp=s.atp,vi=s.volume,vo=2-s.volume,win=0,wout=0,completed=0,vesicles=0,limit=false;
 const add=(species,n,side)=>{for(let i=0;i<n;i++){const id=particles.length;particles.push({id,species,initialSide:side});sides.push(side);}};
 const multi=['pump','homeostasis','cotransport'].includes(s.mode);
 if(multi){add('na',s.mode==='cotransport'?(s.gradient==='high'?20:60):24,'in');add('na',s.mode==='cotransport'?(s.gradient==='high'?100:60):96,'out');add('k',96,'in');add('k',24,'out');if(s.mode==='cotransport'){add('glucose',s.inside,'in');add('glucose',s.outside,'out');}}
 else if(s.mode!=='osmosis'){add(s.mode==='vesicles'?'cargo':s.species,s.inside,'in');add(s.mode==='vesicles'?'cargo':s.species,s.outside,'out');}
 const initial=particles.map(p=>p.initialSide);
 const available=(sp,side)=>particles.filter(p=>p.species===sp&&sides[p.id]===side&&!reserved.has(p.id)).map(p=>p.id);
 const choose=(ids,n)=>{const a=[...ids];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a.slice(0,n);};
 const transfer=(ids,to,at,kind,slot=0)=>{for(const id of ids){const from=sides[id];if(from===to)continue;sides[id]=to;events.push({id,species:particles[id].species,from,to,at,kind,slot});}};
 function snapshot(time){const counts=Object.fromEntries(SPECIES.map(sp=>[sp,{in:0,out:0}]));for(const p of particles)counts[p.species][sides[p.id]]++;return {time,counts,volumeIn:vi,volumeOut:vo,atp,cycles:completed,vesicles,waterIn:win,waterOut:wout,pressure:s.cell==='plant'?400*Math.max(vi-1,0):0,limit};}
 rows.push(snapshot(0));
 for(let tick=0;tick<STEPS;tick++){
  if(s.mode==='osmosis'){
   // Stable substeps, incompressible total volume. Stop at disclosed geometry limit, not a claimed biological equilibrium.
   for(let sub=0;sub<10;sub++){const f=waterFlux(s.inside,s.outside,vi,vo,s.cell,.15+.425*s.proteins);let dv=f.net/10;const nv=Math.max(.3,Math.min(1.6,vi+dv));if(Math.abs(nv-vi-dv)>1e-10)limit=true;dv=nv-vi;vi=nv;vo=2-vi;win+=f.into/10;wout+=f.outof/10;if(limit){win-=Math.max(f.net,0)/10;wout-=Math.max(-f.net,0)/10;win+=Math.max(dv,0);wout+=Math.max(-dv,0);}}
  }else{
   // Passive permeability uses P*A/V. The ion-rate ratio obeys exp(-z*V/26 mV) for a fixed voltage clamp.
   const gated=s.gate==='leak'||(s.gate==='ligand'&&s.ligand)||(s.gate==='voltage'&&s.voltage>=-50);
   const before=[...sides];
   for(const p of particles){
    if(reserved.has(p.id))continue;
    let rate=0,kind='lipid';
    if(['diffusion','selectivity','permeability','channels','homeostasis'].includes(s.mode)){
     if(p.species==='o2'||p.species==='co2')rate=.035;
     const route=s.mode==='channels'?'channel':s.pathway;
     if((s.mode==='channels'||s.mode==='selectivity'||s.mode==='permeability')&&route==='channel'&&p.species===s.channelSpecies&&gated){rate=.018*s.proteins;kind='channel';}
     if(s.mode==='homeostasis'&&['na','k'].includes(p.species)){rate=.002;kind='leak';}
    }
    const side=before[p.id];
    const ionic=['na','k'].includes(p.species)&&['channels','homeostasis'].includes(s.mode);
    const alpha=rate*Math.exp(ionic?-s.voltage/52:0)/vo,beta=rate*Math.exp(ionic?s.voltage/52:0)/vi;
    // Exact two-compartment transition probability over one model interval:
    // preserves the correct volume-weighted/electrochemical equilibrium without a time-step bias.
    const chance=(side==='out'?alpha:beta)/(alpha+beta||1)*(-Math.expm1(-alpha-beta));
    if(rng()<chance)transfer([p.id],side==='in'?'out':'in',tick+.5,kind,Math.floor(rng()*Math.max(1,s.proteins)));
   }
   // Carriers alternate access; finite turnover limits throughput. No ATP is consumed.
   if(s.mode==='carrier'||(['selectivity','permeability'].includes(s.mode)&&s.pathway==='carrier')){
    for(let slot=0;slot<s.proteins;slot++)if(s.species==='glucose'&&tick%3===0){const inn=available('glucose','in'),out=available('glucose','out'),ci=inn.length/vi,co=out.length/vo,total=ci+co;if(rng()<total/(total+40)){const from=rng()<co/(total||1)?out:inn;if(from.length)transfer(choose(from,1),from===out?'in':'out',tick+.5,'carrier',slot);}}
   }
   if(['pump','homeostasis'].includes(s.mode)){
    if(tick%6===0&&tick+6<=STEPS)for(let slot=0;slot<s.proteins;slot++){
     const na=choose(available('na','in'),3),k=choose(available('k','out'),2);
     if(atp>=1&&na.length===3&&k.length===2){atp--;for(const id of [...na,...k])reserved.add(id);cycles.push({start:tick,slot,na,k,naAt:tick+2.5,kAt:tick+4.5,end:tick+5.5});}
    }
    for(const cycle of cycles){if(Math.floor(cycle.naAt)===tick)transfer(cycle.na,'out',cycle.naAt,'pumpNa',cycle.slot);if(Math.floor(cycle.kAt)===tick)transfer(cycle.k,'in',cycle.kAt,'pumpK',cycle.slot);if(Math.floor(cycle.end)===tick){completed++;for(const id of [...cycle.na,...cycle.k])reserved.delete(id);}}
   }
   if(s.mode==='cotransport'&&tick%6===0){for(let slot=0;slot<s.proteins;slot++){
    const ni=available('na','in'),no=available('na','out'),gi=available('glucose','in'),go=available('glucose','out');
    // Forward-only teaching approximation: 2 Na+ downhill may power glucose uphill. No direct ATP use.
    const dg=2*Math.log(Math.max(.5,ni.length)/vi/(Math.max(.5,no.length)/vo))+Math.log(Math.max(.5,gi.length)/vi/(Math.max(.5,go.length)/vo))+2*s.voltage/26;
    if(no.length>=2&&go.length&&dg<0){transfer(choose(no,2),'in',tick+.5,'cotransport',slot);transfer(choose(go,1),'in',tick+.5,'cotransport',slot);}
   }}
   if(s.mode==='vesicles'&&s.energy&&tick%8===3){const from=s.bulk==='exo'?'in':'out';const ids=choose(available('cargo',from),4);if(ids.length){transfer(ids,from==='in'?'out':'in',tick+.5,'vesicle',0);vesicles++;}}
  }
  rows.push(snapshot(tick+1));
 }
 events.sort((a,b)=>a.at-b.at||a.id-b.id);
 const byParticle=particles.map(p=>events.filter(e=>e.id===p.id));
 return {settings:s,seed:seed>>>0,particles,initial,events,byParticle,cycles,rows,final:rows.at(-1)};
}
export function sampleAt(trial,time){
 const t=Math.max(0,Math.min(STEPS,time)),n=Math.floor(t),a=trial.rows[n],b=trial.rows[Math.min(STEPS,n+1)],f=t-n;
 const counts=Object.fromEntries(SPECIES.map(sp=>[sp,{...a.counts[sp]}]));
 for(const e of trial.events)if(e.at>=n&&e.at<=t&&e.at<n+1){counts[e.species][e.from]--;counts[e.species][e.to]++;}
 const interpolate=key=>a[key]+(b[key]-a[key])*f;
 const completed=trial.cycles.filter(c=>c.end<=t).length;
 return {...a,time:t,counts,volumeIn:interpolate('volumeIn'),volumeOut:interpolate('volumeOut'),waterIn:interpolate('waterIn'),waterOut:interpolate('waterOut'),pressure:interpolate('pressure'),atp:trial.settings.atp-trial.cycles.filter(c=>c.start+.25<=t&&c.start<STEPS).length,cycles:completed,vesicles:trial.events.filter(e=>e.kind==='vesicle'&&e.at<=t).reduce((set,e)=>set.add(e.at),new Set()).size};
}
export function particleState(trial,id,time){const list=trial.byParticle[id];let side=trial.initial[id],near=null;for(const e of list){if(e.at<=time)side=e.to;if(Math.abs(e.at-time)<.5)near=e;}return {side,event:near};}
export function focusSpecies(s){return s.mode==='osmosis'?'water':['pump','homeostasis','cotransport'].includes(s.mode)?'na':s.mode==='vesicles'?'cargo':s.species;}
