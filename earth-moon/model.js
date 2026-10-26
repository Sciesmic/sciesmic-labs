// Earth & Moon 1.0.0: DOM-free deterministic teaching geometry. km, days, degrees.
export const VERSION='1.0.0', MONTH=29.53059, RE=6371, RM=1737.4, RS=695700, AU=149597870.7;
const R=Math.PI/180, clamp=(x,a,b)=>Math.max(a,Math.min(b,x)), wrap=x=>((x%360)+360)%360;
export function settings(p={}){const n=(key,d,a,b)=>{const v=Number(p[key]??d);return Number.isFinite(v)?clamp(v,a,b):d;};return {day:n('day',MONTH/4,0,MONTH),tilt:n('tilt',5.1,0,10),node:n('node',90,0,180),distance:n('distance',384400,363300,405500)};}
export function state(raw={}){
 const p=settings(raw),a=p.day/MONTH*360,N=p.node*R,u=(a-p.node)*R,i=p.tilt*R,D=p.distance;
 // Circular relative-Sun teaching orbit, rotated by node and inclination.
 const x=-D*(Math.cos(N)*Math.cos(u)-Math.sin(N)*Math.sin(u)*Math.cos(i));
 const y=D*(Math.sin(N)*Math.cos(u)+Math.cos(N)*Math.sin(u)*Math.cos(i));
 const z=D*Math.sin(u)*Math.sin(i),c=clamp(-x/D,-1,1),phase=wrap(Math.atan2(y,-x)/R);
 const fraction=(1-c)/2, latitude=Math.asin(clamp(z/D,-1,1))/R;
 const sunRadius=Math.asin(RS/AU),moonRadius=Math.asin(RM/D),solarSeparation=Math.acos(c),d=Math.hypot(y,z);
 const umbra=RE-Math.max(0,x)*(RS-RE)/AU,penumbra=RE+Math.max(0,x)*(RS+RE)/AU;
 let eclipse='none';
 if(x<0&&solarSeparation<sunRadius+moonRadius){
  eclipse=solarSeparation<=Math.abs(moonRadius-sunRadius)?(moonRadius>=sunRadius?'solar-total':'solar-annular'):'solar-partial';
 }else if(x>0&&d<penumbra+RM){
  eclipse=d+RM<=umbra?'lunar-total':d<umbra+RM?'lunar-partial':'lunar-penumbral';
 }
 const phaseIds=['new','waxing-crescent','first-quarter','waxing-gibbous','full','waning-gibbous','third-quarter','waning-crescent'];
 return {...p,x,y,z,phase,latitude,fraction,phaseId:phaseIds[Math.floor((phase+22.5)/45)%8],eclipse,sunRadius,moonRadius,solarSeparation,umbra,penumbra,shadowDistance:d};
}
export function challenge(seed=42){const s=Number(seed)>>>0;return settings({day:[0,MONTH/4,MONTH/2,MONTH*3/4][s%4],tilt:5.1,node:[0,90][Math.floor(s/4)%2],distance:384400});}
export function series(p={}){return Array.from({length:33},(_,j)=>state({...p,day:MONTH*j/32}));}
