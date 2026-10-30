// Original educational model, Sciesmic 2026. SI internally; no DOM or random display noise.
export const VERSION='1.0.0';
export const MATERIALS={timber:{mass:6000,k:5e6,yieldDrift:.008,cost:4},steel:{mass:9000,k:9e6,yieldDrift:.012,cost:6},concrete:{mass:14000,k:16e6,yieldDrift:.006,cost:7}};
export const COMPONENTS=['frame','light','heavy','diagonal','xbrace','connection','damper','erase'];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,Number(x)||0));
export const emptyBay=()=>({frame:false,floor:'none',brace:'none',connection:false,damper:false});
export function design(stories=3,material='timber',filled=true){return {material:MATERIALS[material]?material:'timber',foundation:'fixed',stories:Array.from({length:clamp(stories,1,6)},()=>Array.from({length:2},()=>({...emptyBay(),frame:filled,floor:filled?'light':'none'})))};}
export function preset(id='school'){return design(id==='house'?1:id==='tower'?6:3,id==='house'?'timber':id==='tower'?'steel':'concrete');}
export function applyComponent(d,story,bay,part){const next=structuredClone(d),b=next.stories[story]?.[bay];if(!b||!COMPONENTS.includes(part))return next;
 if(part==='erase')next.stories[story][bay]=emptyBay();else if(part==='frame')b.frame=!b.frame;else if(part==='light'||part==='heavy')b.floor=b.floor===part?'none':part;else if(part==='diagonal'||part==='xbrace')b.brace=b.brace===part?'none':part;else b[part]=!b[part];return next;}
export function validate(d){const issues=[];if(!d||!MATERIALS[d.material]||!Array.isArray(d.stories)||d.stories.length<1||d.stories.length>6)return ['shape'];d.stories.forEach((row,i)=>{if(!Array.isArray(row)||row.length!==2){issues.push('shape');return;}row.forEach((b,j)=>{if(!b||b.frame!==true||!['light','heavy'].includes(b.floor)||!['none','diagonal','xbrace'].includes(b.brace)||typeof b.connection!=='boolean'||typeof b.damper!=='boolean')issues.push(`${i+1}:${j+1}`);});});return issues;}
export function cost(d){return (d.foundation==='isolated'?12:4)+d.stories.flat().reduce((s,b)=>s+(b.frame?MATERIALS[d.material].cost:0)+(b.floor==='light'?2:b.floor==='heavy'?3:0)+(b.brace==='diagonal'?3:b.brace==='xbrace'?5:0)+(b.connection?2:0)+(b.damper?4:0),0);}
export function settings(p={}){return {source:p.source==='table'?'table':'earthquake',magnitude:Math.round(clamp(p.magnitude??6,4,8)*2)/2,distance:clamp(p.distance??30,5,100),soil:p.soil==='soft'?'soft':'rock',amplitude:clamp(p.amplitude??.15,0,.8),frequency:clamp(p.frequency??1,.3,5),duration:clamp(p.duration??10,3,20),seed:Number(p.seed??42)>>>0};}
function rng(seed){let a=seed;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
export function motion(input={}){const s=settings(input),random=rng(s.seed),phases=Array.from({length:5},()=>random()*Math.PI*2);
 // Teaching scenario mapping, NOT a ground-motion prediction equation or regional hazard estimate.
 const pga=s.source==='table'?s.amplitude*9.81:9.81*.035*10**(.28*(s.magnitude-5))*(30/Math.hypot(s.distance,10))**.85*(s.soil==='soft'?1.5:1);
 const active=s.source==='table'?s.duration:5+2*(s.magnitude-4),frequency=s.source==='table'?s.frequency:s.soil==='soft'?.75:1.7;
 const raw=t=>{if(t<=0||t>=active)return 0;const envelope=Math.sin(Math.PI*t/active)**2;return envelope*(s.source==='table'?Math.sin(2*Math.PI*frequency*t):[.45,.7,1,1.45,2.1].reduce((sum,f,i)=>sum+[.12,.2,.36,.2,.12][i]*Math.sin(2*Math.PI*frequency*f*t+phases[i]),0));};
 let peak=0;for(let i=0;i<=Math.ceil(active*1000);i++)peak=Math.max(peak,Math.abs(raw(i/1000)));return {settings:s,pga,active,duration:active+8,frequency,at:t=>peak?pga*raw(t)/peak:0};}
export function properties(d){const mat=MATERIALS[d.material],rows=d.stories.map(row=>{let m=0,k=0,cap=0,c=0;row.forEach(b=>{const stiff=mat.k*(1+(b.brace==='diagonal'?.8:b.brace==='xbrace'?1.5:0))*(b.connection?1.15:1),y=3*mat.yieldDrift*(b.connection?1.5:1);m+=mat.mass+(b.floor==='heavy'?9000:3000);k+=stiff;cap+=stiff*y;c+=(b.damper?.18:.025)*2*Math.sqrt(stiff*(mat.mass+3000));});return {mass:m,k,yieldForce:cap,c};});
 if(d.foundation==='isolated'){const total=rows.reduce((s,r)=>s+r.mass,0),k=total*(2*Math.PI*.45)**2;rows.unshift({mass:total*.12,k,yieldForce:Infinity,c:2*.22*Math.sqrt(k*total)});}return rows;}
export function simulate(d,input={},options={}){const issues=validate(d);if(issues.length)throw new Error('Unsupported assembly: '+issues.join(','));const ground=motion(input),props=properties(d),n=props.length,iso=d.foundation==='isolated'?1:0,dt=options.dt??.001,steps=Math.ceil(ground.duration/dt),stride=Math.max(1,Math.round(.05/dt));
 let x=Array(n).fill(0),v=Array(n).fill(0),plastic=Array(n).fill(0),accumulatedPlastic=Array(n).fill(0),maxDrift=Array(d.stories.length).fill(0),maxPlastic=Array(n).fill(0),peakRoof=0,peakAccel=0,limit=false;
 const samples=[];let lastAccel=Array(n).fill(0);
 function forces(){const f=[],cv=[];for(let i=0;i<n;i++){const delta=x[i]-(i?x[i-1]:0),vel=v[i]-(i?v[i-1]:0),r=props[i],trial=r.k*(delta-plastic[i]),hard=.03*r.k;
  if(Number.isFinite(r.yieldForce)){const excess=Math.abs(trial)-(r.yieldForce+hard*accumulatedPlastic[i]);if(excess>0){const increment=excess/(r.k+hard);plastic[i]+=Math.sign(trial)*increment;accumulatedPlastic[i]+=increment;maxPlastic[i]=Math.max(maxPlastic[i],Math.abs(plastic[i]));}}
  f.push(r.k*(delta-plastic[i]));cv.push(r.c*vel);}return {f,cv};}
 function acceleration(t){const {f,cv}=forces(),ag=ground.at(t);return props.map((r,i)=>((i<n-1?f[i+1]+cv[i+1]:0)-f[i]-cv[i])/r.mass-ag);}
 function sample(t){const drifts=d.stories.map((_,i)=>(x[i+iso]-(i+iso?x[i+iso-1]:0))/3*100);samples.push({time:t,ground:ground.at(t),roof:x[n-1]*100,roofAccel:lastAccel[n-1]+ground.at(t),drifts,positions:x.slice(iso).map(z=>z*100),base:iso?x[0]*100:0,peaks:{drift:maxDrift.slice(),roof:peakRoof,accel:peakAccel},damage:drifts.map((_,i)=>maxPlastic[i+iso]>1e-6?'yielded':'elastic')});}
 lastAccel=acceleration(0);sample(0);
 for(let step=1;step<=steps;step++){const t=step*dt;
  // Semi-implicit Euler with submillisecond convergence checks in the private runner.
  for(let i=0;i<n;i++){v[i]+=lastAccel[i]*dt;x[i]+=v[i]*dt;}
  lastAccel=acceleration(t);peakRoof=Math.max(peakRoof,Math.abs(x[n-1]*100));peakAccel=Math.max(peakAccel,Math.abs(lastAccel[n-1]+ground.at(t)));
  for(let i=iso;i<n;i++)maxDrift[i-iso]=Math.max(maxDrift[i-iso],Math.abs((x[i]-(i?x[i-1]:0))/3*100));
  limit=maxDrift.some(z=>z>8)||(iso&&Math.abs(x[0])>.6)||x.some(z=>!Number.isFinite(z));
  if(step%stride===0||step===steps||limit)sample(t);if(limit)break;
 }
 const damage=maxDrift.map((z,i)=>maxPlastic[i+iso]>1e-6?(z>2.5*(props[i+iso].yieldForce/props[i+iso].k)/3*100?'major':'yielded'):'elastic');
 return {version:VERSION,design:structuredClone(d),settings:ground.settings,ground:{pga:ground.pga,active:ground.active,frequency:ground.frequency},samples,summary:{peakDrift:Math.max(...maxDrift),storyDrifts:maxDrift,peakRoof,peakAccel,residualRoof:x[n-1]*100,damage,cost:cost(d),limit,end:samples.at(-1).time},plastic:plastic.slice(iso)};
}
export function challengePass(r){return !r.summary.limit&&r.design.stories.length>=3&&r.summary.cost<=90&&r.summary.peakDrift<=1.5&&r.summary.damage.every(x=>x==='elastic');}

/** Playback between saved integration samples; damage and running peaks never anticipate a future sample. */
export function sampleAt(result, time) {
 const a=result.samples,t=Math.max(a[0].time,Math.min(a.at(-1).time,Number(time)||0));
 let lo=0,hi=a.length-1;
 while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(a[mid].time<=t)lo=mid;else hi=mid-1;}
 const p=a[lo],q=a[lo+1];if(!q||t===p.time)return p;
 const f=(t-p.time)/(q.time-p.time),mix=(x,y)=>x+(y-x)*f;
 return {...p,time:t,ground:mix(p.ground,q.ground),roof:mix(p.roof,q.roof),roofAccel:mix(p.roofAccel,q.roofAccel),base:mix(p.base,q.base),positions:p.positions.map((x,i)=>mix(x,q.positions[i])),drifts:p.drifts.map((x,i)=>mix(x,q.drifts[i]))};
}
