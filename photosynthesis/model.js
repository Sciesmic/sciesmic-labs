/** Photosynthesis 1.0.0. Deterministic instructional model; rates are not species-calibrated.
 * Light and dissolved inorganic carbon are held constant by an ideal reservoir;
 * healthy waterweed, fixed leaf area, ample water/O2/stored sugar, constant temperature.
 * Seed affects illustration only. No invented measurement scatter. See README.
 */
export const VERSION='1.0.0';
export const DURATION=10;
export const RESPIRATION=0.0375; // mL O2/min, constant in this short observation
export const COLORS=Object.freeze({white:1,red:.9,blue:.85,green:.3});
const bounded=(v,min,max,fallback)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Number(v))):fallback;
export function normalize(s={}){return {light:bounded(s.light??75,0,100,75),co2:bounded(s.co2??75,0,100,75),color:Object.hasOwn(COLORS,s.color)?s.color:'white'};}
export function rates(input={}){const s=normalize(input),gross=.6*(s.light/(s.light+25))*(s.co2/(s.co2+25))*COLORS[s.color];return {gross,respiration:RESPIRATION,net:gross-RESPIRATION,collection:Math.max(0,gross-RESPIRATION)};}
export function at(input,minutes=0){const s=normalize(input),time=bounded(minutes,0,DURATION,0),r=rates(s);return {time,...r,collected:r.collection*time,netExchange:r.net*time};}
export function series(input,minutes=DURATION){const end=bounded(minutes,0,DURATION,0),points=[];for(let m=0;m<=Math.floor(end);m++)points.push(at(input,m));if(end%1>1e-9)points.push(at(input,end));return points;}
/** One net reaction packet. Counts are schematic, not a kinetic pathway. */
export function makeAtoms(co2=6,water=6){return {co2:Math.floor(bounded(co2,0,18,6)),water:Math.floor(bounded(water,0,18,6)),sugar:0,oxygen:0};}
export function react(a,light=true){if(!light||a.co2<6||a.water<6)return {...a};return {co2:a.co2-6,water:a.water-6,sugar:a.sugar+1,oxygen:a.oxygen+6};}
export function totals(a){return {C:a.co2+6*a.sugar,H:2*a.water+12*a.sugar,O:2*a.co2+a.water+6*a.sugar+2*a.oxygen};}
export function random(seed){let a=Number(seed)>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=Math.imul(a^(a>>>15),a|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
