// Original Sciesmic teaching model v1.0.0. No DOM or presentation clock.
// Independent segregation/fertilization; no linkage, selection, mutation or environmental effects.
export const VERSION='1.0.0';
export const GENOTYPES={mono:['RR','Rr','rr'],di:['RRYY','RRYy','RRyy','RrYY','RrYy','Rryy','rrYY','rrYy','rryy'],snap:['RR','RW','WW'],mystery:['RR','Rr']};
export const DEFAULTS={mono:['Rr','Rr'],di:['RrYy','RrYy'],snap:['RW','RW'],mystery:['Rr','rr']};
export function rng(seed){let s=Number(seed)>>>0;return ()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
export function validSeed(seed){return Number.isInteger(Number(seed))&&Number(seed)>=0&&Number(seed)<=4294967295;}
export function mysteryParent(seed){if(!validSeed(seed))throw Error('Invalid seed');return rng((Number(seed)^0x9E3779B9)>>>0)()<.5?'RR':'Rr';}
export function gametes(genotype,mode){
 const valid=mode==='mystery'?['RR','Rr','rr']:GENOTYPES[mode];if(!valid?.includes(genotype))throw Error('Invalid genotype');
 // Retain duplicate gametes: each row/column represents an equiprobable segregation path.
 return mode==='di'?[genotype[0]+genotype[2],genotype[0]+genotype[3],genotype[1]+genotype[2],genotype[1]+genotype[3]]:[...genotype];
}
const pair=(a,b)=>[a,b].sort((x,y)=>x===y?0:x===x.toUpperCase()&&y!==y.toUpperCase()?-1:x!==x.toUpperCase()&&y===y.toUpperCase()?1:x.localeCompare(y)).join('');
export function combine(a,b,mode){return mode==='di'?pair(a[0],b[0])+pair(a[1],b[1]):pair(a,b);}
export function phenotype(g,mode){if(mode==='snap')return g==='RR'?'red':g==='WW'?'white':'pink';if(mode==='di')return (g.slice(0,2).includes('R')?'round':'wrinkled')+'_'+(g.slice(2).includes('Y')?'yellow':'green');return g.includes('R')?'round':'wrinkled';}
export function categories(mode){return mode==='snap'?['red','pink','white']:mode==='di'?['round_yellow','round_green','wrinkled_yellow','wrinkled_green']:['round','wrinkled'];}
export function focal(mode){return mode==='snap'?'pink':mode==='di'?'wrinkled_green':'wrinkled';}
export function cross(mode,p1,p2){
 const a=gametes(p1,mode),b=gametes(p2,mode),cells=[];const genotypes={},phenotypes=Object.fromEntries(categories(mode).map(x=>[x,0]));
 for(const row of b)for(const col of a){const genotype=combine(col,row,mode),p=phenotype(genotype,mode);cells.push({a:col,b:row,genotype,phenotype:p});genotypes[genotype]=(genotypes[genotype]??0)+1;phenotypes[p]++;}
 return {a,b,cells,genotypes,phenotypes,total:cells.length};
}
export function simulate({mode='mono',p1=DEFAULTS[mode]?.[0],p2=DEFAULTS[mode]?.[1],seed=42,n=100}){
 if(!validSeed(seed)||!Number.isInteger(n)||n<0||n>10000)throw Error('Invalid seed or sample size');
 if(mode==='mystery'){p1=mysteryParent(seed);p2='rr';}
 const square=cross(mode,p1,p2),random=rng(seed),counts=Object.fromEntries(categories(mode).map(x=>[x,0])),genotypes={},offspring=[],points=[];let hits=0;
 for(let i=0;i<n;i++){const a=square.a[Math.floor(random()*square.a.length)],b=square.b[Math.floor(random()*square.b.length)],g=combine(a,b,mode),p=phenotype(g,mode);counts[p]++;genotypes[g]=(genotypes[g]??0)+1;offspring.push({a,b,genotype:g,phenotype:p});if(p===focal(mode))hits++;points.push({x:i+1,y:hits/(i+1)});}
 return {mode,p1,p2,seed:Number(seed),n,square,counts,genotypes,offspring,points};
}
