// Original teaching model 3.0.0. Expected abundance in a fixed modeled study area; not a wildlife forecast.
export const defaults=Object.freeze({hares:100,foxes:6,season:'winter',snow:100,coat:'seasonal',food:240,shelter:25,experiment:'population',years:20,climate:'seasonal'});
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function normalize(input={}){
 const num=(k,min,max)=>clamp(Math.round(Number.isFinite(Number(input[k]))?Number(input[k]):defaults[k]),min,max);
 return {hares:num('hares',0,300),foxes:num('foxes',0,30),season:['spring','summer','fall','winter'].includes(input.season)?input.season:defaults.season,snow:num('snow',0,100),coat:['seasonal','brown','white'].includes(input.coat)?input.coat:defaults.coat,food:num('food',0,300),shelter:num('shelter',0,100),experiment:input.experiment==='short'?'short':'population',years:[5,10,20,30].includes(num('years',5,30))?num('years',5,30):20,climate:input.climate==='constant'?'constant':'seasonal'};
}
export function rng(seed){let a=Number(seed)>>>0;return()=>{a+=0x6D2B79F5;let t=Math.imul(a^a>>>15,1|a);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};}
const names=['spring','summer','fall','winter'];
export function environment(settings,week=0,seed=42){
 const s=normalize(settings);if(s.experiment==='short'||s.climate==='constant')return {...s,white:s.coat==='white'||s.coat==='seasonal'&&s.season==='winter'?1:0,capacity:s.food};
 const offset=names.indexOf(s.season)*13,absolute=offset+week,phase=absolute%52,year=Math.floor(absolute/52),random=rng((Number(seed)>>>0)^Math.imul(year+1,2654435761)),anomaly=(random()-.5)*4;
 // Coat follows a day-length proxy. Snow responds independently to seeded annual timing anomalies.
 const winterWave=x=>clamp((Math.cos(2*Math.PI*(x-45.5)/52)+.1)/1.1,0,1);
 const snow=s.snow*winterWave(phase-anomaly),white=s.coat==='white'?1:s.coat==='brown'?0:winterWave(phase);
 const season=names[Math.floor(phase/13)];
 return {...s,season,snow,white,phase,capacity:s.food*(1+.08*Math.cos(2*Math.PI*(phase-16)/52))};
}
export function coatColor(s){const white=s.white??(s.coat==='white'||s.coat==='seasonal'&&s.season==='winter'?1:0);return white>=.85?'white':white<=.15?'brown':'mixed';}
export function detection(s){const white=s.white??(s.coat==='white'||s.coat==='seasonal'&&s.season==='winter'?1:0),mismatch=white*(1-s.snow/100)+(1-white)*s.snow/100;return(.5+.15*mismatch)*(1-.2*s.shelter/100);}
export function createTrial(seed=42,input={},options={}){
 const settings=normalize(input),frames=[],random=rng(seed),duration=settings.experiment==='population'?settings.years*52:13,substeps=options.substeps??8;
 let h=settings.hares,f=settings.foxes;
 const env0=environment(settings,0,seed);
 frames.push({week:0,hares:h,foxes:f,encounters:0,detected:0,kills:0,hBirths:0,hDeaths:0,fBirths:0,fDeaths:0,totalEncounters:0,totalDetected:0,totalKills:0,pDetect:detection(env0),intake:0,season:env0.season,snow:env0.snow,white:env0.white,capacity:env0.capacity});
 function step(){
  if(frames.at(-1).week>=duration)return frames.at(-1);
  const prev=frames.at(-1),week=prev.week+1,env=environment(settings,prev.week,seed),p=detection(env),weather=.98+random()*.04;
  let encounters=0,detected=0,kills=0,hBirths=0,hDeaths=0,fBirths=0,fDeaths=0;
  // Logistic prey renewal and a saturating Type II capture response. Expected counts, not tracked individuals.
  // Food intake supports births and shortage increases mortality in the SAME interval; no hidden reserve/delay queue.
  const seasonal=settings.experiment==='population'&&settings.climate==='seasonal';
  const recruitment=.06*(seasonal?1+.10*Math.cos(2*Math.PI*(env.phase-10)/52):1),dt=1/substeps;
  let intake=0;
  for(let j=0;j<substeps;j++){
   const e=f*(.95/.5/.65)*h/(h+80)*weather*dt,d=e*p,k=Math.min(h,d*.65);
   encounters+=e;detected+=d;kills+=k;
   intake=f>0?k/(f*dt):0;
   const hb=env.capacity>0?recruitment*h*dt:0;
   const hd=env.capacity>0?Math.min(h, recruitment*h*h/env.capacity*dt):Math.min(h,.4*h*dt);
   // All fluxes use the same pre-step state. Scale prey losses if extreme controls exhaust the population.
   const scale=k+hd>h?h/(k+hd):1,actualK=k*scale,actualD=hd*scale;
   kills+=actualK-k;intake=f>0?actualK/(f*dt):0;
   const fb=.06*actualK,fd=Math.min(f,f*(.025+.08*Math.max(0,1-intake/.5))*dt);
   h=Math.max(0,h+hb-actualD-actualK);f=Math.max(0,f+fb-fd);
   hBirths+=hb;hDeaths+=actualD;fBirths+=fb;fDeaths+=fd;
  }
  // Closed study area, explicit negligible-abundance cutoff; losses are included in the balance.
  if(h>0&&h<.01){hDeaths+=h;h=0;}
  if(f>0&&f<.01){fDeaths+=f;f=0;}
  const frame={week,hares:h,foxes:f,encounters,detected,kills,hBirths,hDeaths,fBirths,fDeaths,totalEncounters:prev.totalEncounters+encounters,totalDetected:prev.totalDetected+detected,totalKills:prev.totalKills+kills,pDetect:p,intake,season:env.season,snow:env.snow,white:env.white,capacity:env.capacity};
  frames.push(frame);return frame;
 }
 return {seed:Number(seed)>>>0,settings,frames,duration,step,run(){while(frames.at(-1).week<duration)step();return frames;}};
}
