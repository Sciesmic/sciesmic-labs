// Seasonal Changes 1.0.0. DOM-free deterministic model. Units: days, degrees, W/m², MJ/m²/day, °C anomaly.
export const VERSION='1.0.0', YEAR=365, SOLAR=1361;
const rad=Math.PI/180,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function solar(latitude=40,day=0,tilt=23.5){
 if(![latitude,day,tilt].every(Number.isFinite)||Math.abs(latitude)>80||tilt<0||tilt>35)throw new RangeError('latitude ±80; tilt 0–35; finite day');
 const phase=((day%YEAR)+YEAR)%YEAR/YEAR*2*Math.PI,phi=latitude*rad;
 const declination=Math.asin(Math.sin(tilt*rad)*Math.sin(phase));
 const x=-Math.tan(phi)*Math.tan(declination),h=Math.acos(clamp(x,-1,1));
 const mean=Math.max(0,SOLAR/Math.PI*(h*Math.sin(phi)*Math.sin(declination)+Math.cos(phi)*Math.cos(declination)*Math.sin(h)));
 return {latitude,day,tilt,declination:declination/rad,daylight:24*h/Math.PI,noonAngle:90-Math.abs(latitude-declination/rad),meanFlux:mean,energy:mean*.0864};
}
const cache=new Map();
export function year(latitude=40,tilt=23.5,surface='land'){
 if(!['land','ocean'].includes(surface))throw new RangeError('surface');
 const key=[latitude,tilt,surface].join(':');if(cache.has(key))return cache.get(key);
 const dt=.25,n=YEAR/dt,tau=surface==='land'?18:60,decay=Math.exp(-dt/tau);
 const samples=Array.from({length:n},(_,i)=>solar(latitude,i*dt,tilt));
 const annualMean=samples.reduce((s,x)=>s+x.meanFlux,0)/n;
 // Exact periodic solution of A(next)=decay*A + (1-decay)*0.085*(Q-annualMean).
 let b=0;for(const x of samples)b=decay*b+(1-decay)*.085*(x.meanFlux-annualMean);
 let a=b/(1-Math.pow(decay,n));const start=a;
 const values=samples.map(x=>{const result={...x,temperature:a};a=decay*a+(1-decay)*.085*(x.meanFlux-annualMean);return result;});
 values.push({...values[0],day:YEAR});
 const result={values,annualMean,tau,closureError:Math.abs(a-start)};cache.set(key,result);return result;
}
export function state(latitude,day,tilt,surface){
 const ys=year(latitude,tilt,surface).values,index=(((day%YEAR)+YEAR)%YEAR)*4,i=Math.floor(index),f=index-i;
 return {...solar(latitude,day,tilt),surface,temperature:ys[i].temperature*(1-f)+ys[i+1].temperature*f};
}
export function challenge(seed=1){const n=(Number(seed)>>>0);return {latitude:[30,45,60][n%3],opposite:-( [30,45,60][n%3]),day:YEAR/4,tilt:23.5};}
