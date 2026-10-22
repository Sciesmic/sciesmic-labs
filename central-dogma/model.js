// Central Dogma 1.0.0. Pure deterministic sequence model. Standard genetic code.
export const VERSION = '1.0.0';
const bases = 'UCAG';
const amino = 'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG';
export const CODE = Object.freeze(Object.fromEntries([...bases].flatMap((a,i)=>[...bases].flatMap((b,j)=>[...bases].map((c,k)=>[a+b+c,amino[i*16+j*4+k]])))));
export const AA = ['A','R','N','D','C','Q','E','G','H','I','L','K','M','F','P','S','T','W','Y','V'];
export function validateDNA(s) { if (typeof s !== 'string' || !/^[ACGT]{3,60}$/.test(s)) throw new Error('DNA must contain 3–60 A/C/G/T bases'); return s; }
export function complement(s, rna=false) { validateDNA(s); const map = rna ? {A:'U',T:'A',C:'G',G:'C'} : {A:'T',T:'A',C:'G',G:'C'}; return [...s].map(b=>map[b]).join(''); }
// Input template is displayed 3′→5′. Output strands are 5′→3′, left to right.
export function translate(rna) {
 if (typeof rna !== 'string' || !/^[ACGU]*$/.test(rna)) throw new Error('Invalid RNA');
 // This teaching fragment has its annotated start site at position 1. Do not scan arbitrary downstream AUGs.
 if (!rna.startsWith('AUG')) return {chain:[],codons:[],stop:null,status:'noStart',trailing:rna.length%3};
 const chain=[], codons=[];
 for(let i=0;i+2<rna.length;i+=3) { const codon=rna.slice(i,i+3), aa=CODE[codon]; codons.push(codon); if(aa==='*') return {chain,codons,stop:i/3+1,status:'complete',trailing:rna.length%3}; chain.push(aa); }
 return {chain,codons,stop:null,status:'noStop',trailing:rna.length%3};
}
export function express(template) { const dna=complement(template),rna=complement(template,true);return {template,dna,rna,...translate(rna)}; }
export function mutate(template,index,base) { validateDNA(template); if(!Number.isInteger(index)||index<0||index>=template.length||!/[ACGT]/.test(base)||base.length!==1) throw new Error('Invalid edit');return template.slice(0,index)+base+template.slice(index+1); }
export const EXAMPLES = Object.freeze({reference:'TACCGAAAATTTATT',synonymous:'TACCGGAAATTTATT',missense:'TACCGAGAATTTATT',earlyStop:'TACACTAAATTTATT',noStart:'AACCGAAAATTTATT',noStop:'TACCGAAAATTTATA'});
export function compare(a,b) { const x=express(a),y=express(b);return {original:x,edited:y,changedBases:Math.max(a.length,b.length)-[...a].filter((v,i)=>v===b[i]).length,changedAmino:Math.max(x.chain.length,y.chain.length)-x.chain.filter((v,i)=>v===y.chain[i]).length,sameChain:x.chain.join('')===y.chain.join('')}; }
export function templateFromSeed(seed) { let x=Number(seed)>>>0; const pool=['GCU','UUU','AAA','GGU','UAC','CAG','AGU','CCU'];const c=['AUG'];for(let i=0;i<3;i++){x=(Math.imul(1664525,x)+1013904223)>>>0;c.push(pool[(x>>>16)%pool.length]);}c.push('UAA');const map={A:'T',U:'A',C:'G',G:'C'};return [...c.join('')].map(b=>map[b]).join(''); }
