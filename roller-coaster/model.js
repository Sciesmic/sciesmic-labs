// Energy on the Rails 2.0.0. SI units. Pure deterministic energy model.
export const VERSION='2.0.0',G=9.8,LIFT_SPEED=4,CAR_SPACING=3.8,WHEELBASE=1.89,RIDER_MASS=35;
export function settings(input={}){
 const n=(key,d,lo,hi)=>Math.max(lo,Math.min(hi,Number.isFinite(Number(input[key]))?Number(input[key]):d));
 return {height:n('height',20,0,35),mass:n('mass',50,10,300),hill:n('hill',15,0,40),hill2:n('hill2',8,0,35),hills:Math.round(n('hills',2,0,2)),loops:Math.round(n('loops',1,0,2)),radius:n('radius',6,2,12),cars:Math.round(n('cars',3,1,4)),riders:Math.round(n('riders',2,0,4)),resistance:n('resistance',0,0,.12),shape:input.shape==='compact'?'compact':'wide'};
}
export const trainMass=input=>{const p=settings(input);return p.cars*(p.mass+p.riders*RIDER_MASS);};
const mix=(a,b,u)=>a+(b-a)*u,smooth=u=>u*u*(3-2*u);
export function buildTrack(input={}){
 const p=settings(input),points=[],marks=[];let x=0,y=0,length=0;
 function add(nx,ny){if(points.length)length+=Math.hypot(nx-x,ny-y);x=nx;y=ny;points.push({x,y,s:length});}
 function line(dx,ny,steps){const x0=x,y0=y;steps??=Math.ceil(Math.max(dx,Math.abs(ny-y0))*16);for(let j=1;j<=steps;j++){let u=j/steps;add(x0+dx*u,mix(y0,ny,smooth(u)));}}
 const mark=(id)=>{const m={id,s:length,x,y};marks.push(m);return m;};
 add(0,0);line(16,0);mark('liftStart');line(28,p.height);mark('liftCrest');line(17,p.height);const release=mark('release');line(1,p.height);mark('dropStart');line(p.shape==='compact'?18:28,0);line(14,0);const bottom=mark('bottom');
 for(let loop=0;loop<p.loops;loop++){
  line(p.radius+2,0);const bx=x,r=p.radius,start=length;
  for(let j=1;j<=720;j++){const a=2*Math.PI*j/720;add(bx+r*Math.sin(a),r*(1-Math.cos(a)));if(j===360)mark('loopTop'+(loop+1));}
  mark('loopExit'+(loop+1));line(p.radius+2,0);
 }
 let goal=null;
 for(let hill=0;hill<p.hills;hill++){
  const h=hill===0?p.hill:p.hill2,w=p.shape==='compact'?14:20;
  line(w,h);const crest=mark(hill===0?'hillCrest':'hill2Crest');if(hill===0)goal=crest;line(w,0);line(14,0);
 }
 line(16,0);const brake=mark('brakeStart');line(10,0);const finish=mark('finish');line(5,0);
 return {points,marks,release,bottom,goal,brake,finish,length,bounds:{minX:0,maxX:x,maxY:Math.max(p.height,p.hill*(p.hills>0),p.hill2*(p.hills>1),2*p.radius*(p.loops>0))}};
}
export function trackPoint(track,s){
 const a=track.points;s=Math.max(0,Math.min(track.length,s));let lo=0,hi=a.length-1;
 while(lo+1<hi){const m=(lo+hi)>>1;if(a[m].s<=s)lo=m;else hi=m;}
 const p=a[lo],q=a[hi],u=q.s===p.s?0:(s-p.s)/(q.s-p.s),dx=q.x-p.x,dy=q.y-p.y,ds=Math.hypot(dx,dy);
 return {x:mix(p.x,q.x,u),y:mix(p.y,q.y,u),s,tx:ds?dx/ds:1,ty:ds?dy/ds:0};
}
export function positions(track,p,s){return Array.from({length:p.cars},(_,i)=>trackPoint(track,s-i*CAR_SPACING));}
export function meanHeight(track,p,s){return positions(track,p,s).reduce((sum,q)=>sum+q.y,0)/p.cars;}
export function carPose(track,s){
 const rear=trackPoint(track,s-WHEELBASE/2),front=trackPoint(track,s+WHEELBASE/2),radius=.2925;
 const wheel=q=>({x:q.x-q.ty*radius,y:q.y+q.tx*radius,contact:q});
 const rw=wheel(rear),fw=wheel(front),angle=Math.atan2(fw.y-rw.y,fw.x-rw.x),mx=(rw.x+fw.x)/2,my=(rw.y+fw.y)/2;
 return {rear:rw,front:fw,x:mx+Math.sin(angle)*.27,y:my-Math.cos(angle)*.27,angle,wheelSpan:Math.hypot(fw.x-rw.x,fw.y-rw.y)};
}
export function simulate(input={}){
 const p=settings(input),track=buildTrack(p),mass=trainMass(p),startS=14,releaseS=track.release.s,releaseTime=(releaseS-startS)/LIFT_SPEED+.5;
 const liftThermal=p.resistance*mass*G*(releaseS-startS),releasePE=mass*G*meanHeight(track,p,releaseS),releaseKE=.5*mass*LIFT_SPEED**2,inputWork=liftThermal+releasePE+releaseKE;
 function liftState(time){const q=time<=1?startS+2*time*time:startS+2+LIFT_SPEED*(time-1),s=Math.min(releaseS,q),speed=time<=1?LIFT_SPEED*time:LIFT_SPEED,pe=mass*G*meanHeight(track,p,s),ke=.5*mass*speed**2,thermal=p.resistance*mass*G*(s-startS);return {...trackPoint(track,s),height:pe/(mass*G),distance:s-startS,speed,pe,ke,thermal,total:pe+ke+thermal,motorWork:pe+ke+thermal,time,phase:'lift'};}
 function freeState(s){const pe=mass*G*meanHeight(track,p,s),thermal=liftThermal+p.resistance*mass*G*(s-releaseS),available=inputWork-pe-thermal;return {...trackPoint(track,s),height:pe/(mass*G),distance:s-startS,speed:Math.sqrt(2*Math.max(0,available)/mass),pe,ke:Math.max(0,available),thermal,total:inputWork,motorWork:inputWork,available,phase:'coast'};}
 const samples=[liftState(0)];for(let j=1;j<=320;j++)samples.push(liftState(releaseTime*j/320));
 const release={...freeState(releaseS),time:releaseTime};samples[samples.length-1]=release;
 const checkpoints=[...track.marks.filter(m=>m.s>releaseS&&m.s<=track.brake.s).map(m=>m.s)];
 let coords=[];for(let s=releaseS+.08;s<track.brake.s;s+=.08)coords.push(s);coords.push(...checkpoints,track.brake.s);coords=[...new Set(coords)].sort((a,b)=>a-b);
 let last=release,time=releaseTime,outcome='complete';
 for(const s of coords){let state=freeState(s);
  if(state.available<=0){let lo=last.s,hi=s;for(let k=0;k<45;k++){let mid=(lo+hi)/2;if(freeState(mid).available>0)lo=mid;else hi=mid;}state={...freeState((lo+hi)/2),ke:0,speed:0};outcome='turn';}
  const ds=state.s-last.s;time+=2*ds/Math.max(1e-10,last.speed+state.speed);state.time=time;samples.push(state);last=state;if(outcome==='turn')break;
 }
 if(outcome==='complete'){
  const brakeStart={...last};for(let j=1;j<=160;j++){const u=j/160,s=track.brake.s+10*u,ke=brakeStart.ke*(1-u),thermal=brakeStart.thermal+brakeStart.ke*u;const state={...trackPoint(track,s),height:0,distance:s-startS,speed:Math.sqrt(2*ke/mass),pe:0,ke,thermal,total:inputWork,motorWork:inputWork,phase:'brake'};time+=2*(s-last.s)/Math.max(1e-10,last.speed+state.speed);state.time=time;samples.push(state);last=state;}
 }
 const end=samples.at(-1),bottom=samples.find(s=>Math.abs(s.s-track.bottom.s)<1e-6)??null;
 const sensors=track.marks.filter(m=>['release','bottom','loopTop1','loopTop2','hillCrest','hill2Crest','finish'].includes(m.id)).map(mark=>{const q=samples.find(q=>Math.abs(q.s-mark.s)<1e-6);return {...mark,reading:q??null};});
 return {settings:p,track,mass,startS,release,releaseTime,samples,end,bottom,sensors,outcome,duration:time,targetReached:track.goal?end.s>=track.goal.s:false,inputWork,freeState,liftState};
}
export function frameAt(trial,time){
 time=Math.max(0,Math.min(trial.duration,time));if(time<=trial.releaseTime)return trial.liftState(time);if(time>=trial.duration)return trial.end;
 const a=trial.samples;let lo=0,hi=a.length-1;while(lo+1<hi){const m=(lo+hi)>>1;if(a[m].time<=time)lo=m;else hi=m;}
 const p=a[lo],q=a[hi],u=(time-p.time)/(q.time-p.time),s=mix(p.s,q.s,u);
 if(q.phase!=='brake')return {...trial.freeState(s),time};
 const ke=mix(p.ke,q.ke,u),thermal=mix(p.thermal,q.thermal,u);return {...trackPoint(trial.track,s),height:0,distance:s-trial.startS,speed:Math.sqrt(2*ke/trial.mass),pe:0,ke,thermal,total:trial.inputWork,motorWork:trial.inputWork,time,phase:'brake'};
}
export function challenge(seed=42){let x=(Math.imul(Number(seed)>>>0,1664525)+1013904223)>>>0;return settings({height:12+x%13,hill:10+((x>>>8)%21),mass:50,resistance:0,shape:'wide',hills:1,loops:0,cars:1,riders:0});}
