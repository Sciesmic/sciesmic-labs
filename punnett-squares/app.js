import {content} from './content.js';
import {initLab,onLangChange,getLang,t,renderRich} from '../kit/labs-kit.js';
import {createGraphTools} from '../kit/graph-tools.js';
import {animationInterval,motionPreference} from '../kit/motion.js';
import {GENOTYPES,gametes,cross,simulate,phenotype,categories,focal,mysteryParent,validSeed} from './model.js';
import {MODES,STORAGE_KEY,createStates,encodeSnapshot,decodeSnapshot} from './work-state.js';
const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const params=new URLSearchParams(location.search);
let mode='mono',states=createStates(),nextId=1,restoring=true,persistenceStatus='saved',savedChecks=[];
try{
 const stored=localStorage.getItem(STORAGE_KEY);
 const saved=stored&&stored.length<2000000?decodeSnapshot(JSON.parse(stored)):null;
 if(saved){({mode,states}=saved);$('prediction').value=saved.prediction;$('explanation').value=saved.explanation;savedChecks=saved.checks;persistenceStatus='restored';}
}catch{persistenceStatus='storageUnavailable';}
if(MODES.includes(params.get('mode')))mode=params.get('mode');
const s=()=>states[mode];
let experimentChanged=false;
for(const key of ['p1','p2'])if(GENOTYPES[mode].includes(params.get(key))&&params.get(key)!==s()[key]){s()[key]=params.get(key);experimentChanged=true;}
if(params.has('seed')&&params.get('seed')!==''&&validSeed(params.get('seed'))&&Number(params.get('seed'))!==s().seed){s().seed=Number(params.get('seed'));experimentChanged=true;}
if([4,16,100,1000].includes(Number(params.get('n')))&&Number(params.get('n'))!==s().size){s().size=Number(params.get('n'));experimentChanged=true;}
if(experimentChanged){Object.assign(s(),{result:null,shown:0,playing:false,revealed:false,answers:{},challengeAnswers:{},gametesChecked:false,challengeCell:false,cellFeedback:null});if(mode==='mystery'){const claim=s().claims[s().seed];s().hypothesis=claim?.hypothesis??'';s().reason=claim?.reason??'';}}
let seed=s().seed;
for(const st of Object.values(states))for(const r of [...st.records,st.result].filter(Boolean))nextId=Math.max(nextId,r.id+1);
const format=n=>new Intl.NumberFormat(getLang()==='es'?'es-MX':'en-US',{maximumFractionDigits:4}).format(n),percent=n=>format(n*100)+'%';
const rich=(id,key,vars)=>$(id).innerHTML=renderRich(t(key,vars));
const asset=(p,m=mode)=>'assets/'+(m==='snap'?'snap_plant_'+p:p==='round'?'seed_round_yellow':p==='wrinkled'?'seed_wrinkled_yellow':'seed_'+p)+'.png';
const sq=()=>cross(mode,mode==='mystery'?mysteryParent(seed):s().p1,mode==='mystery'?'rr':s().p2);
const mysteryHidden=()=>mode==='mystery'&&!s().revealed;
const challenge=()=>mode!=='mystery'&&s().practice==='challenge';
const boardLocked=()=>mysteryHidden()||(challenge()&&!s().gametesChecked);
const answers=()=>challenge()?s().challengeAnswers:s().answers;
const graph=createGraphTools($('graph'));
$('graph').parentElement.prepend(document.querySelector('.zoom-control'),$('zoom-note'));
function url(){const u=new URL(location.href);for(const [k,v]of Object.entries({mode,seed,p1:s().p1,p2:s().p2,n:s().size,lang:getLang()}))u.searchParams.set(k,v);return u;}
function syncURL(){history.replaceState(null,'',url());}
function readChecks(){return [...document.querySelectorAll('#lk-checks [data-q]')].flatMap(node=>{const chosen=node.querySelector('input:checked');return chosen?[{id:node.dataset.q,chosen:chosen.value,checked:node.querySelector('fieldset').disabled}]:[];});}
function snapshot(){return encodeSnapshot({mode,states,prediction:$('prediction').value,explanation:$('explanation').value,checks:readChecks()});}
function save(){
 if(restoring)return;
 try{localStorage.setItem(STORAGE_KEY,JSON.stringify(snapshot()));persistenceStatus='saved';}catch{persistenceStatus='storageUnavailable';}
 $('save-status').textContent=t(persistenceStatus);
}
function setStatus(key,vars={}){$('run-status').textContent=t(key,vars);}
function cancelCurrent(){s().playing=false;s().result=null;s().shown=0;}
function buildChanged(){cancelCurrent();Object.assign(s(),{g1:[],g2:[],gameteFeedback:'',gametesChecked:false,answers:{},challengeAnswers:{},cell:0,cellChoices:{},cellReasons:{},challengeCell:false,cellFeedback:null});syncURL();render();}
function renderModes(){$('modes').innerHTML=MODES.map(m=>`<button type="button" data-mode="${m}" aria-pressed="${m===mode}">${esc(t(m))}</button>`).join('');}
function labelGenotype(g){return mode==='snap'?`${g} · ${t(phenotype(g,mode))}`:g;}
function renderParents(){
 $('mode-title').textContent=t(mode);rich('mode-note',mode+'Note');
 for(const [i,key]of [[1,'p1'],[2,'p2']]){
  const options=mode==='mystery'?(i===1?['?']:['rr']):GENOTYPES[mode],el=$(key);
  el.innerHTML=options.map(g=>`<option value="${g}">${esc(g==='?'?'?':labelGenotype(g))}</option>`).join('');
  el.value=mode==='mystery'?(i===1?'?':'rr'):s()[key];el.disabled=mode==='mystery';
  const p=mode==='mystery'?(i===1?'round':'wrinkled'):phenotype(s()[key],mode);$('parent-art-'+i).src=asset(p);$('parent-art-'+i).alt=t(p);
 }
 $('gamete-task').hidden=mode==='mystery';$('mystery-task').hidden=mode!=='mystery';$('practice-label').hidden=mode==='mystery';$('practice-note').hidden=mode==='mystery';
 $('practice').value=s().practice;$('practice-note').textContent=t(challenge()?'challengeNote':'guidedNote');
 $('hypothesis').value=s().hypothesis;$('reason').value=s().reason;
 const options=mode==='di'?['RY','Ry','rY','ry','RR','YY']:mode==='snap'?['R','W','RW']:['R','r','RR'];
 for(const i of [1,2])$('gametes'+i).innerHTML=options.map(g=>`<button type="button" data-gamete="${g}" data-parent="${i}" aria-pressed="${s()['g'+i].includes(g)}">${g}</button>`).join('');
 $('gamete-feedback').textContent=s().gameteFeedback?t(s().gameteFeedback):'';
 $('mystery-feedback').textContent=mode==='mystery'&&s().revealed?t('mysteryRevealed',{g:mysteryParent(seed),p:format(mysteryParent(seed)==='RR'?0:.5)}):'';
 renderRevealGate();
}
function canReveal(){const st=s();return mode==='mystery'&&st.result&&st.shown===st.result.n&&st.result.seed===seed&&['RR','Rr'].includes(st.hypothesis)&&st.reason.trim().length>0;}
function renderRevealGate(){
 $('reveal').disabled=!canReveal()||s().revealed;
 $('reveal').textContent=t(s().revealed?'alreadyRevealed':'reveal');
 $('reveal-requirements').textContent=t(s().revealed?'alreadyRevealed':canReveal()?'revealReady':'revealRequirements');
}
function renderBoard(){
 const board=$('board'),locked=boardLocked();board.className=mode==='di'?'di':'';
 $('fill-board').disabled=locked||(challenge()&&!s().challengeCell);
 $('cell-editor').hidden=locked;$('cell-reason-label').hidden=locked||!challenge();
 if(locked){
  board.className='';board.innerHTML=`<div class="challenge-cover"><p>${esc(t(mysteryHidden()?'mysteryBoard':'challengeBoard'))}</p></div>`;
  $('square-summary').textContent='';$('cell-feedback').textContent='';return;
 }
 const square=sq();board.innerHTML=`<div aria-hidden="true">×</div>`+square.a.map(g=>`<div class="board-head" aria-label="${esc(t('column'))}: ${g}">${g}</div>`).join('')+square.b.map((g,row)=>`<div class="board-head" aria-label="${esc(t('row'))}: ${g}">${g}</div>`+square.a.map((a,col)=>{
  const i=row*square.a.length+col,c=square.cells[i],done=!!answers()[i];return `<button type="button" class="cell ${done?'done':''}" data-cell="${i}" aria-pressed="${s().cell===i}" aria-label="${esc(t('cellLabel',{n:i+1,a,b:g,g:done?c.genotype:t('unfilled')}))}">${done?`<img src="${asset(c.phenotype)}" alt=""><span>${c.genotype}</span>`:'<span class="unknown">?</span>'}</button>`;
 }).join('')).join('');
 const c=square.cells[s().cell];$('cell-prompt').textContent=t('cellPrompt',{n:s().cell+1,a:c.a,b:c.b});
 const choices=mode==='mystery'?['RR','Rr','rr']:GENOTYPES[mode];$('cell-answer').innerHTML=`<option value="">${esc(t('choose'))}</option>`+choices.map(g=>`<option>${g}</option>`).join('');
 $('cell-answer').value=s().cellChoices[s().cell]??'';$('cell-reason').value=s().cellReasons[s().cell]??'';
 $('square-summary').textContent=t('squareSummary',{n:Object.keys(answers()).length,total:square.total})+(challenge()&&!s().challengeCell?' '+t('challengeRevealHint'):'');
 const feedback=s().cellFeedback;$('cell-feedback').className=feedback?.right?'right':'wrong';
 $('cell-feedback').textContent=feedback?t(feedback.key,{...c,g:c.genotype,p:t(c.phenotype)}):'';
}
function countsAt(r,n,m=mode){const counts=Object.fromEntries(categories(m).map(p=>[p,0])),genotypes={};if(r)for(const o of r.offspring.slice(0,n)){counts[o.phenotype]++;genotypes[o.genotype]=(genotypes[o.genotype]??0)+1;}return {counts,genotypes};}
function renderOpening(){
 const st=states.mono;$('family-opening').hidden=mode!=='mono';
 $('family-buttons').innerHTML=[41,42,43].map((familySeed,i)=>`<button type="button" data-family="${familySeed}" ${s().playing?'disabled':''} aria-pressed="${st.families.includes(familySeed)}">${esc(t('familyButton',{n:i+1,seed:familySeed}))}${st.families.includes(familySeed)?' ✓':''}</button>`).join('');
 const completed=[41,42,43].filter(n=>st.families.includes(n));
 $('family-evidence').innerHTML=`<table><thead><tr><th>${esc(t('familyColumn'))}</th><th>${esc(t('round'))}</th><th>${esc(t('wrinkled'))}</th><th>${esc(t('proportion'))} · ${esc(t('wrinkled'))}</th></tr></thead><tbody>`+[41,42,43].map((familySeed,i)=>{
  const r=simulate({mode:'mono',p1:'Rr',p2:'Rr',seed:familySeed,n:4}),done=completed.includes(familySeed);
  return `<tr><th scope="row">${esc(t('familyRow',{n:i+1}))} · ${familySeed}</th><td>${done?r.counts.round:'—'}</td><td>${done?r.counts.wrinkled:'—'}</td><td>${done?format(r.counts.wrinkled/4):'—'}</td></tr>`;
 }).join('')+'</tbody></table>';
 $('family-status').textContent=t(completed.length===3?'familyDone':'familyProgress',{n:completed.length});
 for(const id of ['family-100','family-1000'])$(id).disabled=s().playing||completed.length!==3;
}
function renderResults(){
 const st=s(),r=st.result,n=r?st.shown:0,visible=countsAt(r,n),square=sq();
 $('progress').max=r?.n??st.size;$('progress').value=n;$('seed-readout').textContent=seed;$('seed-input').value=seed;
 $('sample-size').value=st.size;$('run').disabled=st.playing||!!r&&n<r.n;$('pause').disabled=!r||n===r.n;$('pause').textContent=t(r&&n<r.n&&!st.playing?'resume':'pause');
 for(const id of ['p1','p2','sample-size','apply-seed','practice','mystery-a','mystery-b'])$(id).disabled=st.playing||(mode==='mystery'&&['p1','p2'].includes(id));
 setStatus(!r?'ready':n===r.n?'complete':st.playing?'running':'paused',{n,total:r?.n});
 $('offspring').innerHTML=(r?r.offspring.slice(Math.max(0,n-24),n):[]).map(o=>`<img src="${asset(o.phenotype)}" alt="">`).join('');
 const head=mysteryHidden()?`<th>${esc(t('rrHyp'))}</th><th>${esc(t('RrHyp'))}</th>`:`<th class="number">${esc(t('predicted'))}</th><th class="number">${esc(t('expected'))}</th>`;
 $('results').innerHTML=`<thead><tr><th scope="col">${esc(t('phenotypeHeader'))}</th>${head}<th scope="col" class="number">${esc(t('observed'))}</th><th scope="col" class="number">${esc(t('proportion'))}</th></tr></thead><tbody>`+categories(mode).map(p=>{
  const probability=square.phenotypes[p]/square.total;
  return `<tr><th scope="row"><span class="phenotype-label"><img src="${asset(p)}" alt="">${esc(t(p))}</span></th>${mysteryHidden()?`<td class="number">${p==='round'?'1':'0'}</td><td class="number">0.5</td>`:`<td class="number">${format(probability)} <small>(${percent(probability)})</small></td><td class="number">${format(n*probability)}</td>`}<td class="number">${n?visible.counts[p]:'—'}</td><td class="number">${n?format(visible.counts[p]/n):'—'}</td></tr>`;
 }).join('')+`<tr><th scope="row">${esc(t('total'))}</th><td class="number">1</td><td class="number">${mysteryHidden()?'1':n}</td><td class="number">${n}</td><td class="number">${n?'1':'—'}</td></tr></tbody>`;
 const genotypeHidden=mysteryHidden()||(challenge()&&!st.challengeCell);
 $('genotype-table').innerHTML=genotypeHidden?`<p>${esc(t(mysteryHidden()?'mysteryBoard':'challengeRevealHint'))}</p>`:`<table><thead><tr><th scope="col">${esc(t('genotypeHeader'))}</th><th scope="col">${esc(t('predicted'))}</th><th scope="col">${esc(t('observed'))}</th></tr></thead><tbody>`+Object.entries(square.genotypes).map(([g,c])=>`<tr><th scope="row">${g}</th><td>${format(c/square.total)}</td><td>${n?(visible.genotypes[g]??0):'—'}</td></tr>`).join('')+'</tbody></table>';
 renderRevealGate();renderOpening();renderGraph();save();
}
function trialLabel(r){return t('trial',{id:r.id,seed:r.seed,cross:mode==='mystery'?'? × rr':r.p1+' × '+r.p2,n:r.n});}
function visibleRecords(st=s()){const active=st.result&&st.shown?{...st.result,points:st.result.points.slice(0,st.shown)}:null;const records=st.records.filter(r=>r.id!==active?.id&&r.slot!==active?.slot);if(active)records.push(active);return {active,records};}
function renderGraph(){
 const st=s(),{active,records}=visibleRecords(),limit=st.zoom==='auto'?Math.max(st.size,...records.map(r=>r.n)):Number(st.zoom);
 $('graph-zoom').value=st.zoom;$('zoom-note').textContent=t('zoomNote',{n:format(limit)});
 // Explicit view bounds and fixed six slots preserve scale and trial identity under filtering.
 const series=Array.from({length:6},(_,slot)=>{const r=records.find(r=>r.slot===slot);return r?{id:'trial-'+r.id,label:trialLabel(r),points:r.points.filter(p=>p.x<=limit)}:{id:'empty-'+slot,label:'',points:[]};}),theory=[];
 if(mode==='mystery'){
  theory.push({id:'hypothesis-RR',label:t('rrHyp'),points:[{x:0,y:0},{x:limit,y:0}]},{id:'hypothesis-Rr',label:t('RrHyp'),points:[{x:0,y:.5},{x:limit,y:.5}]});$('focal-note').textContent=t('mysteryFocal');
 }else{
  const squares=new Map(records.map(r=>[r.p1+' × '+r.p2,r.square]));squares.set(st.p1+' × '+st.p2,sq());
  for(const [key,q]of squares)theory.push({id:'theory-'+key,label:t('theory',{cross:key}),points:[{x:0,y:q.phenotypes[focal(mode)]/q.total},{x:limit,y:q.phenotypes[focal(mode)]/q.total}]});
  $('focal-note').textContent=t('focalNote',{p:t(focal(mode))});
 }
 graph.update({title:t('graphTitle'),xLabel:t('xLabel'),yLabel:t('yLabel'),xMin:0,xMax:limit,yMin:0,yMax:1,series:[...series,...theory]});
 $('trial-log').innerHTML=records.length?`<table><thead><tr><th>${esc(t('trialLog'))}</th><th>${esc(t('phenotypeHeader'))}</th><th>${esc(t('observed'))}</th><th>${esc(t('proportion'))}</th></tr></thead><tbody>`+records.map(r=>{const n=r===active?st.shown:r.n,c=countsAt(r,n).counts[focal(mode)];return `<tr><th scope="row">${esc(trialLabel(r))}</th><td>${esc(t(focal(mode)))}</td><td>${c}/${n}</td><td>${format(c/n)}</td></tr>`;}).join('')+'</tbody></table>':`<p>${esc(t('noneYet'))}</p>`;
}
function render(){renderModes();renderParents();renderBoard();renderResults();$('save-status').textContent=t(persistenceStatus);}
function finish(){
 const st=s();st.playing=false;st.shown=st.result.n;
 if(!st.records.some(r=>r.id===st.result.id)){st.records.push(st.result);st.records=st.records.slice(-6);}
 if(mode==='mono'&&st.p1==='Rr'&&st.p2==='Rr'&&st.size===4&&[41,42,43].includes(seed)&&!st.families.includes(seed))st.families.push(seed);
 renderResults();
}
function run(){
 const st=s();if(st.playing)return;const r=simulate({mode,p1:st.p1,p2:st.p2,n:st.size,seed});
 Object.assign(r,{id:nextId++,slot:st.nextSlot,revealed:false});st.nextSlot=(st.nextSlot+1)%6;
 st.result=r;st.shown=0;st.playing=true;if(mode==='mystery'){st.revealed=false;$('mystery-feedback').textContent='';renderBoard();}
 syncURL();if(motionPreference.matches)finish();else renderResults();
}
function keepClaim(){if(mode==='mystery')s().claims[seed]={hypothesis:s().hypothesis,reason:s().reason};}
function applySeed(n){
 keepClaim();seed=n;s().seed=n;cancelCurrent();s().revealed=false;s().cellFeedback=null;
 if(mode==='mystery'){s().answers={};const claim=s().claims[seed];s().hypothesis=claim?.hypothesis??'';s().reason=claim?.reason??'';}
 syncURL();render();
}
function sampleFamily(familySeed,n){if(mode!=='mono'||s().playing)return;if(s().p1!=='Rr'||s().p2!=='Rr'){s().p1='Rr';s().p2='Rr';buildChanged();}s().size=n;applySeed(familySeed);run();}
function download(text,type,name){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
function allEvidence(st){const records=[...st.records];if(st.result&&!records.some(r=>r.id===st.result.id))records.push(st.result);return records.map(r=>({r,n:r.id===st.result?.id?st.shown:r.n}));}
function expectedText(r,p){return r.mode==='mystery'&&!r.revealed?`RR: ${p==='round'?1:0}; Rr: 0.5`:format(r.square.phenotypes[p]/r.square.total);}
function notebookCells(m,st){
 const square=cross(m,st.p1,st.p2),completed=[],entries=[];
 for(const practice of ['guided','challenge']){
  const checked=practice==='challenge'?st.challengeAnswers:st.answers;
  for(const [i,c]of square.cells.entries())if(checked[i])completed.push(`<tr><td>${esc(t(practice))}</td><th scope="row">${esc(t('cellPrompt',{n:i+1,a:c.a,b:c.b}))}</th><td>${esc(c.genotype)}</td></tr>`);
 }
 // The editor is shared between practice settings. Do not attribute its entries to a particular setting.
 for(const [i,c]of square.cells.entries())if(st.cellChoices[i]||st.cellReasons[i])entries.push(`<tr><th scope="row">${esc(t('cellPrompt',{n:i+1,a:c.a,b:c.b}))}</th><td>${esc(st.cellChoices[i]||'—')}</td></tr>`);
 return `<h3>${esc(t('notebookCells'))}</h3>`+(completed.length?`<table><thead><tr><th>${esc(t('notebookPractice'))}</th><th>${esc(t('notebookCell'))}</th><th>${esc(t('notebookChecked'))}</th></tr></thead><tbody>${completed.join('')}</tbody></table>`:`<p>${esc(t('notebookNoCells'))}</p>`)+(entries.length?`<table><thead><tr><th>${esc(t('notebookCell'))}</th><th>${esc(t('notebookEntry'))}</th></tr></thead><tbody>${entries.join('')}</tbody></table>`:'');
}
function notebookReasons(m,st){
 const entries=Object.entries(st.cellReasons).filter(([,reason])=>reason.trim());
 if(!entries.length)return '';
 const cells=cross(m,st.p1,st.p2).cells;
 return `<h3>${esc(t('notebookReasoning'))}</h3>`+entries.map(([i,reason])=>`<div class="cell-explanation"><p>${esc(t('cellPrompt',{n:Number(i)+1,a:cells[i]?.a??'?',b:cells[i]?.b??'?'}))}</p><p class="writing">${esc(reason)}</p></div>`).join('');
}
function notebookChecks(){
 const entries=readChecks().map(check=>{
  const q=content.checks.find(q=>q.id===check.id),text=q[getLang()]??q.en,index='ABCD'.indexOf(check.chosen);
  const feedback=check.checked?(Array.isArray(text.feedback)?text.feedback[index]:text.feedback[check.chosen]):'';
  return `<article class="check-response"><h3>${esc(check.id.toUpperCase())}</h3><p>${esc(text.prompt)}</p><p>${esc(t('notebookCheckChoice'))}: ${esc(check.chosen)}. ${esc(text.options[index])}</p><p>${esc(t(check.checked?'submitted':'notSubmitted'))}</p>${feedback?`<p>${esc(t(check.chosen===q.answer?'notebookCorrect':'notebookRevisit'))} ${esc(feedback)}</p>`:''}</article>`;
 });
 return `<h2>${esc(t('notebookChecks'))}</h2>`+(entries.join('')||`<p>${esc(t('notebookNoChecks'))}</p>`);
}
function notebook(){
 const response=v=>`<p class="writing">${esc(v||t('notebookNoWriting'))}</p>`;
 let html=`<h1>${esc(t('notebookTitle'))}</h1><p>${esc(t('notebookIntro'))}</p><button onclick="window.print()">${esc(t('printNotebook'))}</button><h2>${esc(t('predictionLabel'))}</h2>${response($('prediction').value)}<h2>${esc(t('explanationLabel'))}</h2>${response($('explanation').value)}`;
 if(states.mono.families.length){html+=`<h2>${esc(t('familyTitle'))}</h2><table><thead><tr><th>${esc(t('familyColumn'))}</th><th>${esc(t('round'))}</th><th>${esc(t('wrinkled'))}</th></tr></thead><tbody>`+states.mono.families.map(familySeed=>{const r=simulate({mode:'mono',p1:'Rr',p2:'Rr',seed:familySeed,n:4});return `<tr><th>${familySeed}</th><td>${r.counts.round}</td><td>${r.counts.wrinkled}</td></tr>`;}).join('')+'</tbody></table>';}
 for(const m of MODES){const st=states[m];html+=`<section><h2>${esc(t(m))}</h2><h3>${esc(t('notebookSettings'))}</h3><p>${esc(t('seedLabel'))}: ${st.seed} · ${esc(t('sampleSize'))}: ${st.size} · ${esc(t('parent1'))}: ${m==='mystery'?'?':esc(st.p1)} · ${esc(t('parent2'))}: ${esc(st.p2)} · ${esc(t('practiceLabel'))}: ${esc(t(st.practice))}</p>`;
  if(m!=='mystery'){html+=notebookCells(m,st)+`<p>${esc(t('parent1Gametes'))}: ${esc(st.g1.join(', ')||'—')} · ${esc(t('parent2Gametes'))}: ${esc(st.g2.join(', ')||'—')}</p>`+notebookReasons(m,st);}
  else{const claims={...st.claims,[st.seed]:{hypothesis:st.hypothesis,reason:st.reason}};for(const [claimSeed,claim]of Object.entries(claims))if(claim.hypothesis||claim.reason)html+=`<h3>${esc(t('seedLabel'))} ${esc(claimSeed)} · ${esc(t('hypothesis'))}: ${esc(claim.hypothesis||'—')}</h3>${response(claim.reason)}`;}
  for(const {r,n}of allEvidence(st)){const counts=countsAt(r,n,m).counts;html+=`<h3>${esc(t('trial',{id:r.id,seed:r.seed,cross:m==='mystery'&&!r.revealed?'? × rr':r.p1+' × '+r.p2,n}))}</h3><table><thead><tr><th>${esc(t('phenotypeHeader'))}</th><th>${esc(t('observed'))}</th><th>${esc(t('proportion'))}</th><th>${esc(t('predicted'))}</th></tr></thead><tbody>`+categories(m).map(p=>`<tr><th>${esc(t(p))}</th><td>${counts[p]}</td><td>${n?format(counts[p]/n):'—'}</td><td>${esc(expectedText(r,p))}</td></tr>`).join('')+'</tbody></table>';}
  html+='</section>';
 }
 html+=notebookChecks();
 return `<!doctype html><html lang="${getLang()}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(t('notebookTitle'))}</title><style>body{font:16px/1.5 Arial,sans-serif;color:#253c36;max-width:850px;margin:30px auto;padding:20px}h1,h2,h3{line-height:1.2}h2{margin-top:32px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #abb8a0;padding:8px;text-align:left}.writing{white-space:pre-wrap;overflow-wrap:anywhere;background:#f1f3e9;padding:12px}tr,.check-response,.cell-explanation{break-inside:avoid}@media print{button{display:none}body{margin:0;padding:0;font-size:11pt}.writing{background:none}h2,h3{break-after:avoid}table{break-inside:avoid}}@page{size:Letter;margin:.65in}</style></head><body>${html}</body></html>`;
}
$('modes').onclick=e=>{const m=e.target.closest('[data-mode]')?.dataset.mode;if(!m)return;keepClaim();s().playing=false;s().seed=seed;mode=m;seed=s().seed;syncURL();render();document.querySelector(`[data-mode="${mode}"]`).focus();};
for(const key of ['p1','p2'])$(key).onchange=()=>{s()[key]=$(key).value;buildChanged();};
$('practice').onchange=()=>{const previous=s().practice;s().practice=$('practice').value;if(previous!=='challenge'&&s().practice==='challenge')s().gametesChecked=false;s().cellFeedback=null;renderParents();renderBoard();renderResults();};
for(const i of [1,2])$('gametes'+i).onclick=e=>{const b=e.target.closest('[data-gamete]');if(!b)return;const arr=s()['g'+i],g=b.dataset.gamete,index=arr.indexOf(g);index<0?arr.push(g):arr.splice(index,1);b.setAttribute('aria-pressed',String(arr.includes(g)));s().gameteFeedback='';s().gametesChecked=false;$('gamete-feedback').textContent='';renderBoard();save();};
$('check-gametes').onclick=()=>{const ok=[1,2].every(i=>JSON.stringify([...s()['g'+i]].sort())===JSON.stringify([...new Set(gametes(s()['p'+i],mode))].sort()));s().gametesChecked=ok;s().gameteFeedback=ok?'gametesRight':'gametesWrong';$('gamete-feedback').textContent=t(s().gameteFeedback);renderBoard();save();};
$('board').onclick=e=>{const button=e.target.closest('[data-cell]');if(!button||boardLocked())return;s().cell=Number(button.dataset.cell);s().cellFeedback=null;renderBoard();$('cell-answer').focus();save();};
$('cell-answer').onchange=()=>{s().cellChoices[s().cell]=$('cell-answer').value;save();};
$('cell-reason').oninput=()=>{s().cellReasons[s().cell]=$('cell-reason').value;save();};
$('check-cell').onclick=()=>{
 if(boardLocked())return;const c=sq().cells[s().cell],right=$('cell-answer').value===c.genotype;
 if(challenge()&&!$('cell-reason').value.trim()){s().cellFeedback={key:'reasonNeeded',right:false};}
 else{s().cellFeedback={key:right?(challenge()?'challengeCellRight':'cellRight'):'cellWrong',right};if(right){answers()[s().cell]=true;if(challenge())s().challengeCell=true;}}
 renderBoard();renderResults();$('check-cell').focus();
};
$('fill-board').onclick=()=>{if(boardLocked()||(challenge()&&!s().challengeCell))return;sq().cells.forEach((_,i)=>answers()[i]=true);s().cellFeedback=null;renderBoard();save();};
$('family-buttons').onclick=e=>{const button=e.target.closest('[data-family]');if(button)sampleFamily(Number(button.dataset.family),4);};
$('family-100').onclick=()=>sampleFamily(41,100);$('family-1000').onclick=()=>sampleFamily(41,1000);
$('sample-size').onchange=()=>{s().size=Number($('sample-size').value);cancelCurrent();syncURL();renderResults();};
$('run').onclick=run;
$('pause').onclick=()=>{s().playing=!s().playing;if(s().playing&&motionPreference.matches)finish();else renderResults();};
$('reset').onclick=()=>{cancelCurrent();renderResults();};
$('new-trial').onclick=()=>applySeed((seed+1)>>>0);
$('apply-seed').onclick=()=>{const value=$('seed-input').value;if(value!==''&&validSeed(value))applySeed(Number(value));else setStatus('seedError');};
$('copy-link').onclick=async()=>{syncURL();try{await navigator.clipboard.writeText(url().href);setStatus('copied');}catch{setStatus('copyFail');}};
$('graph-zoom').onchange=()=>{s().zoom=$('graph-zoom').value;renderGraph();save();};
$('hypothesis').onchange=()=>{s().hypothesis=$('hypothesis').value;keepClaim();renderRevealGate();save();};
$('reason').oninput=()=>{s().reason=$('reason').value;keepClaim();renderRevealGate();save();};
$('reveal').onclick=()=>{if(!canReveal())return;s().revealed=true;s().result.revealed=true;keepClaim();renderParents();renderBoard();renderResults();};
for(const [id,exampleSeed]of [['mystery-a',42],['mystery-b',29]])$(id).onclick=()=>{if(s().playing)return;s().size=4;applySeed(exampleSeed);run();};
$('export').onclick=()=>{
 const rows=[['mode','trial','seed','parent_1','parent_2','offspring_count','phenotype','observed_count','observed_proportion','predicted_probability']];
 for(const {r,n}of allEvidence(s()))for(const p of categories(mode)){const count=countsAt(r,n).counts[p];rows.push([mode,r.id,r.seed,mode==='mystery'&&!r.revealed?'?':r.p1,r.p2,n,p,count,n?count/n:'',expectedText(r,p)]);}
 download('\ufeff'+rows.map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n'),'text/csv;charset=utf-8','punnett-squares-evidence.csv');setStatus('exported');
};
$('export-notebook').onclick=()=>{save();download(notebook(),'text/html;charset=utf-8','punnett-squares-lab-notebook.html');$('save-status').textContent=t('notebookExported');};
for(const id of ['prediction','explanation'])$(id).addEventListener('input',save);
$('lk-checks').addEventListener('change',()=>queueMicrotask(save));$('lk-checks').addEventListener('click',()=>queueMicrotask(save));
$('start-fresh').onclick=()=>{$('fresh-dialog').showModal();$('cancel-fresh').focus();};
$('cancel-fresh').onclick=()=>$('fresh-dialog').close();$('fresh-dialog').addEventListener('close',()=>$('start-fresh').focus());
$('confirm-fresh').onclick=()=>{restoring=true;try{localStorage.removeItem(STORAGE_KEY);}catch{}const freshURL=new URL(location.href);for(const key of ['seed','mode','p1','p2','n'])freshURL.searchParams.delete(key);location.replace(freshURL);};
window.addEventListener('pagehide',save);
animationInterval(()=>{const st=s();if(!st.playing||!st.result)return;st.shown=Math.min(st.result.n,st.shown+Math.max(1,Math.ceil(st.result.n/24)));if(st.shown===st.result.n)finish();else renderResults();},100);
motionPreference.addEventListener('change',()=>{if(motionPreference.matches&&s().playing)finish();});
onLangChange(()=>{render();syncURL();});
initLab(content);
for(const check of savedChecks){const radio=document.querySelector(`[data-q="${check.id}"] input[value="${check.chosen}"]`);if(radio){radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));if(check.checked)document.querySelector(`[data-check="${check.id}"]`)?.click();}}
if(savedChecks.length)document.activeElement?.blur();
const initialStatus=persistenceStatus;restoring=false;save();if(initialStatus==='restored'&&persistenceStatus!=='storageUnavailable'){$('save-status').textContent=t('restored');}
