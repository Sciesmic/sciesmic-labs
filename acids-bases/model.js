// Ideal aqueous strong electrolytes at 25 °C. Volumes in mL, concentrations mol/L.
// No DOM, randomness or time dependence. Household pH is reference data only.
export const KW = 1e-14;
export const samples = [
 ['lemon_juice',2,'#eed773'],['vinegar',2.5,'#eee2ba'],['cola',2.5,'#674233'],
 ['coffee',5,'#7d5940'],['milk',6.5,'#fff8df'],['water',7,'#b4d4dc'],
 ['baking_soda',8.3,'#e6e9e1'],['hand_soap',10,'#e5aaca'],
 ['ammonia_cleaner',11.5,'#a0d9d1'],['drain_cleaner',13.5,'#bdcfbd']
].map(([id,pH,color])=>({id,pH,color}));
function bounded(x,min,max){if(!Number.isFinite(x)||x<min||x>max)throw new RangeError(`Expected ${min}–${max}, got ${x}`);return x;}
export function equilibrium(excess){
 if(!Number.isFinite(excess))throw new RangeError('Finite concentration required');
 const root=Math.hypot(excess,2*Math.sqrt(KW));
 // Stable quadratic: H - OH = excess and H * OH = Kw.
 const H=excess>=0?(excess+root)/2:2*KW/(root-excess);
 const OH=KW/H;
 return {H,OH,pH:-Math.log10(H),excess};
}
export function testSample(id){const s=samples.find(s=>s.id===id);if(!s)throw new RangeError('Unknown sample');const H=10**(-s.pH);return {...s,H,OH:KW/H,volume:120};}
export function dilute({kind='acid',water=0}={}){
 if(!['acid','base','neutral'].includes(kind))throw new RangeError('Unknown solution');
 bounded(water,0,180);const volume=20+water;
 const initial=kind==='acid'?.01:kind==='base'?-.01:0;
 return {...equilibrium(initial*20/volume),volume,water,kind,initialMoles:Math.abs(initial)*.02};
}
export function neutralize({base=0}={}){
 bounded(base,0,120);const volume=60+base,acidMoles=.01*.060,baseMoles=.01*base/1000;
 return {...equilibrium((acidMoles-baseMoles)/(volume/1000)),volume,base,acidMoles,baseMoles,Na:baseMoles/(volume/1000),Cl:acidMoles/(volume/1000),reacted:Math.min(acidMoles,baseMoles)};
}
export function measure(pH,tool='probe'){if(!['probe','strip','indicator'].includes(tool))throw new RangeError('Unknown instrument');return tool==='probe'?Number(pH.toFixed(2)):Math.max(0,Math.min(14,Math.round(pH)));}
export function replay(settings,actions){return actions.map(action=>settings.mode==='dilute'?dilute({...settings,...action}):settings.mode==='neutralize'?neutralize(action):testSample(action.sample??settings.sample));}
