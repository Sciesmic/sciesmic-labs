// Pure, deterministic teaching model. Weight is the local gravitational force.
export const GRAVITY = Object.freeze({earth:9.81,moon:1.62,mars:3.71,jupiter:24.79});
export const MYSTERY_GRAVITY = Object.freeze([1.62,5.20,12.40,18.10]);
export const MASS_OPTIONS = Object.freeze([0,0.5,1,2,5,10,20]);
export function mysteryGravity(seed=42){
  const n=Number(seed);
  if(!Number.isSafeInteger(n)||n<0||n>4294967295) throw new RangeError('seed');
  let x=(n+0x9e3779b9)>>>0;
  x^=x>>>16;x=Math.imul(x,0x7feb352d)>>>0;x^=x>>>15;
  x=Math.imul(x,0x846ca68b)>>>0;x^=x>>>16;
  return MYSTERY_GRAVITY[(x>>>0)%MYSTERY_GRAVITY.length];
}
export function measure(mass,place,seed=42){
  if(!MASS_OPTIONS.includes(mass)) throw new RangeError('mass');
  const gravity=place==='mystery'?mysteryGravity(seed):GRAVITY[place];
  if(gravity===undefined) throw new RangeError('place');
  return Object.freeze({massKg:mass,gravityMps2:gravity,weightN:mass*gravity,place});
}
export function allPoints(place,seed=42){return MASS_OPTIONS.map(mass=>measure(mass,place,seed));}
