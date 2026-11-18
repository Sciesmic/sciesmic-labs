// Compact, versioned local work. Scientific results are regenerated from their seeds.
import {DEFAULTS,GENOTYPES,simulate,validSeed} from './model.js';
export const MODES=['mono','di','snap','mystery'];
export const STORAGE_KEY='sciesmic-punnett-squares-work-v1';
export function createStates(){return Object.fromEntries(MODES.map(mode=>[mode,{
 p1:DEFAULTS[mode][0],p2:DEFAULTS[mode][1],seed:mode==='mono'?41:42,size:mode==='mono'?4:100,
 g1:[],g2:[],gameteFeedback:'',gametesChecked:false,practice:'guided',answers:{},challengeAnswers:{},
 cell:0,cellChoices:{},cellReasons:{},cellFeedback:null,challengeCell:false,zoom:'auto',
 revealed:false,result:null,shown:0,playing:false,records:[],nextSlot:0,hypothesis:'',reason:'',claims:{},families:[],
}]))}
const text=v=>typeof v==='string'?v.slice(0,10000):'';
const integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;
export function trialSummary(r){return r?{mode:r.mode,p1:r.p1,p2:r.p2,seed:r.seed,n:r.n,id:r.id,slot:r.slot,revealed:!!r.revealed}:null;}
function restoreTrial(raw,mode){
 if(!raw||raw.mode!==mode||!integer(raw.seed,0,4294967295)||![4,16,100,1000].includes(raw.n)||!integer(raw.id,1,10000000)||!integer(raw.slot,0,5))return null;
 if(mode!=='mystery'&&(!GENOTYPES[mode].includes(raw.p1)||!GENOTYPES[mode].includes(raw.p2)))return null;
 const result=simulate({mode,p1:raw.p1,p2:raw.p2,seed:raw.seed,n:raw.n});
 return {...result,id:raw.id,slot:raw.slot,revealed:!!raw.revealed};
}
export function encodeSnapshot({mode,states,prediction,explanation,checks}){
 return {schema:1,mode,prediction,explanation,checks,states:Object.fromEntries(MODES.map(m=>{
 const st=states[m];return [m,{...st,playing:false,result:trialSummary(st.result),records:st.records.map(trialSummary)}];
 }))};
}
export function decodeSnapshot(raw){
 if(!raw||raw.schema!==1||!raw.states)return null;
 const states=createStates();
 for(const mode of MODES){
  const v=raw.states[mode];if(!v||typeof v!=='object')continue;const st=states[mode],cells=mode==='di'?16:4;
  for(const k of ['p1','p2'])if(GENOTYPES[mode].includes(v[k]))st[k]=v[k];
  if(integer(v.seed,0,4294967295))st.seed=v.seed;if([4,16,100,1000].includes(v.size))st.size=v.size;
  const options=mode==='di'?['RY','Ry','rY','ry','RR','YY']:mode==='snap'?['R','W','RW']:['R','r','RR'];
  for(const k of ['g1','g2'])st[k]=Array.isArray(v[k])?[...new Set(v[k].filter(g=>options.includes(g)))]:[];
  st.practice=v.practice==='challenge'?'challenge':'guided';st.gametesChecked=v.gametesChecked===true;st.challengeCell=v.challengeCell===true;
  st.gameteFeedback=['gametesRight','gametesWrong'].includes(v.gameteFeedback)?v.gameteFeedback:'';
  for(const k of ['answers','challengeAnswers','cellChoices','cellReasons'])for(let i=0;i<cells;i++){
   const value=v[k]?.[i];if(k==='cellReasons'){if(typeof value==='string')st[k][i]=text(value);}
   else if(k==='cellChoices'){if((mode==='mystery'?['RR','Rr','rr']:GENOTYPES[mode]).includes(value))st[k][i]=value;}
   else if(value===true)st[k][i]=true;
  }
  if(integer(v.cell,0,cells-1))st.cell=v.cell;
  if(['auto','4','16','100','1000'].includes(v.zoom))st.zoom=v.zoom;
  st.hypothesis=['RR','Rr'].includes(v.hypothesis)?v.hypothesis:'';st.reason=text(v.reason);
  for(const [seed,claim]of Object.entries(v.claims??{}).slice(-50))if(validSeed(seed)&&claim&&typeof claim==='object')st.claims[seed]={hypothesis:['RR','Rr'].includes(claim.hypothesis)?claim.hypothesis:'',reason:text(claim.reason)};
  st.families=Array.isArray(v.families)?[...new Set(v.families.filter(seed=>[41,42,43].includes(seed)))]:[];
  st.records=Array.isArray(v.records)?v.records.slice(-6).flatMap(r=>{const trial=restoreTrial(r,mode);return trial?[trial]:[]}):[];
  st.result=restoreTrial(v.result,mode);
  if(st.result&&(st.result.seed!==st.seed||st.result.n!==st.size||(mode!=='mystery'&&(st.result.p1!==st.p1||st.result.p2!==st.p2))))st.result=null;
  st.shown=st.result&&integer(v.shown,0,st.result.n)?v.shown:0;st.revealed=mode==='mystery'&&v.revealed===true&&!!st.result?.revealed;
  if(integer(v.nextSlot,0,5))st.nextSlot=v.nextSlot;
  if(st.result){const index=st.records.findIndex(r=>r.id===st.result.id);if(index>=0)st.records[index]=st.result;}
 }
 return {mode:MODES.includes(raw.mode)?raw.mode:'mono',states,prediction:text(raw.prediction),explanation:text(raw.explanation),checks:Array.isArray(raw.checks)?raw.checks.slice(0,5).filter(c=>c&&/^q[1-5]$/.test(c.id)&&'ABCD'.includes(c.chosen)&&c.chosen.length===1).map(c=>({id:c.id,chosen:c.chosen,checked:c.checked===true})):[]};
}
