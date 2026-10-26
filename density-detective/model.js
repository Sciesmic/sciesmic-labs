import {SAMPLES} from './samples.js';
export {SAMPLES};
export const MATERIALS=['wood','foam','acrylic','aluminum','steel','brass'];
export const WATER_DENSITY=1;
export const round=(n,d=2)=>Math.round((n+Number.EPSILON)*10**d)/10**d;
export function density(mass,volume){if(!Number.isFinite(mass)||!Number.isFinite(volume)||mass<0||volume<=0)return null;return mass/volume;}
export function sampleId(material,shape){return shape==='cube'?`cube_${material}`:`${material}_${shape}`;}
export function mystery(seed){let n=Number(seed)>>>0;n^=n<<13;n^=n>>>17;n^=n<<5;const a=Object.keys(SAMPLES);return a[(n>>>0)%a.length];}
export function measure(id){
 const s=SAMPLES[id];if(!s)throw new RangeError('Unknown sample');
 const mass=s.density*s.volume, measuredMass=round(mass),volume=round(s.volume),floating=s.density<WATER_DENSITY;
 return {...s,id,mass,measuredMass,measuredVolume:volume,calculatedDensity:density(measuredMass,volume),floating,displacedVolume:floating?mass/WATER_DENSITY:s.volume,submergedFraction:Math.min(1,s.density/WATER_DENSITY),method:s.shape==='cube'?'ruler':s.fits?'cylinder':'overflow',initial:s.fits?50:0,final:s.fits?50+s.volume:s.volume};
}
// Deterministic action replay. Seed changes only which mystery is selected, never physics.
export function replay(id,actions){let state={id,mass:false,volume:false,water:false,calculated:false};for(const a of actions){if(a==='reset')state={id,mass:false,volume:false,water:false,calculated:false};else if(['mass','volume','water'].includes(a))state[a]=true;else if(a==='calculate'&&state.mass&&state.volume)state.calculated=true;}return {...state,readings:measure(id)};}
