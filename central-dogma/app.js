import {initLab,onLangChange,t,getLang,renderRich} from '../kit/labs-kit.js';
import {content} from './content.js';
import {CODE,AA,EXAMPLES,express,compare,mutate,templateFromSeed,validateDNA} from './model.js';
const $=id=>document.getElementById(id), params=new URLSearchParams(location.search);
let seed=Number(params.get('seed')||42)>>>0;
let original=seed===42?EXAMPLES.reference:templateFromSeed(seed);
try { if(params.has('template')) original=validateDNA(params.get('template')); } catch {}
let edited=original;
try { if(params.has('edited')) edited=validateDNA(params.get('edited')); } catch {}
let mode=['guided','build','investigate'].includes(params.get('mode'))?params.get('mode'):'guided',stage='dna',selected=0,checked=false,errors=[],timer=null,records=[];
let answers={dna:[],rna:[],protein:[]},passed={dna:false,rna:false,protein:false},message=null;
let mysteryKey=null,mysteryCount=0;
const names=['dna','rna','protein'];
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const valueLabel=v=>v==='*'?t('stop'):v;
const aaLabel=v=>v==='*'?t('stop'):(content.aminoAcids[v]?.abbr||v);
const aaFull=v=>v==='*'?t('stop'):(content.aminoAcids[v]?.abbr+' · '+content.aminoAcids[v]?.[getLang()]);

// Use the shared kit's term-button contract. Match longest phrases first, with Unicode word boundaries.
function richTerms(text) {
 const aliases=Object.entries(content.termAliases[getLang()]).flatMap(([id,words])=>words.map(word=>({id,word}))).sort((a,b)=>b.word.length-a.word.length);
 const escapeRE=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const re=new RegExp('(?<![\\p{L}\\p{N}])('+aliases.map(x=>escapeRE(x.word)).join('|')+')(?![\\p{L}\\p{N}])','giu');
 return renderRich(String(text).replace(re,word=>{const item=aliases.find(x=>x.word.toLocaleLowerCase()===word.toLocaleLowerCase());return `[[${item.id}|${word}]]`;}));
}
function renderContextTerms() {
 document.querySelectorAll('.lede, .predict h2, .instruction, #mode-hint, .strand-label>span:first-child, .limit, .explain h2, #detail-note, .notes>p, .chart-panel>.hint, .chart-panel>h2').forEach(node=>{
  if(!node.querySelector('.lk-term'))node.innerHTML=richTerms(node.textContent);
 });
 const link=$('flashcards-link');link.href=`flashcards.html?lang=${getLang()}`;
}

function expected(){const x=express(original);return stage==='dna'?[...x.dna]:stage==='rna'?[...x.rna]:[...x.chain,...(x.stop!==null?['*']:[])];}
function slotKind(){return t(stage==='dna'?'coding':stage==='rna'?'rna':'protein');}
function staticStrand(label,sequence,start='5′',end='3′',amino=false){const seq=Array.isArray(sequence)?sequence:[...sequence];return `<div class="strand-block"><div class="strand-label"><span>${safe(label)}</span><span class="direction">${start} → ${end}</span></div><div class="strand-scroll" tabindex="0" aria-label="${safe(label)}"><div class="strand">${seq.map((v,i)=>`<span class="base-tile ${amino?'aa-tile':(i%3===2?'codon-end':'')} ${v==='*'?'signal':''}" data-base="${v}"><small>${i+1}</small>${safe(amino?aaLabel(v):valueLabel(v))}</span>`).join('')||`<p class="hint">${t('chainEmpty')}</p>`}</div></div></div>`;}
function renderConstruction(){
 const x=express(original),exp=expected();
 document.querySelectorAll('[data-stage]').forEach(b=>{b.setAttribute('aria-pressed',b.dataset.stage===stage);b.disabled=b.dataset.stage==='protein'&&!passed.rna;});
 $('stage-note').textContent=t(stage==='dna'?'replicationNote':stage==='rna'?'rnaNote':'proteinNote')+(stage==='protein'?' '+t(x.status==='noStart'?'chainEmpty':x.stop?'stopHelp':'noStop'):'');
 const source=stage==='protein'?staticStrand(t('rna'),x.rna):staticStrand(t('template'),original,'3′','5′');
 $('strands').innerHTML=source+`<div class="strand-block"><div class="strand-label"><span>${slotKind()}</span><span class="direction">${stage==='protein'?'N → C':'5′ → 3′'}</span></div><div class="strand-scroll"><div class="strand">${exp.map((v,i)=>`<button class="base-tile slot ${stage==='protein'?'aa-tile':(i%3===2?'codon-end':'')} ${errors.includes(i)?'error':''} ${answers[stage][i]==='*'?'signal':''}" data-slot="${i}" data-base="${answers[stage][i]||''}" aria-label="${safe(t('slotLabel',{kind:slotKind(),n:i+1,value:stage==='protein'?aaLabel(answers[stage][i]||t('empty')):valueLabel(answers[stage][i]||t('empty'))}))}" aria-pressed="${selected===i}"><small>${i+1}</small>${safe(stage==='protein'?aaLabel(answers[stage][i]||'·'):valueLabel(answers[stage][i]||'·'))}</button>`).join('')}</div></div></div>`;
 const choices=stage==='protein'?[...AA,'*']:stage==='dna'?['A','T','C','G']:['A','U','C','G'];
 $('palette').innerHTML=choices.map(v=>`<button data-choice="${v}" aria-label="${safe(stage==='protein'?aaFull(v):valueLabel(v))}">${safe(stage==='protein'?aaLabel(v):valueLabel(v))}</button>`).join('');
 $('selected-position').textContent=t('selected',{n:selected+1})+(stage==='protein'?` · ${x.codons[selected]||''}`:'');
 $('progress').textContent=t('progress',{n:answers[stage].filter(Boolean).length,total:exp.length});
 $('construction-feedback').textContent=message?t(message.key,message.vars||{}):'';
 $('next-stage').hidden=stage==='protein';$('next-stage').disabled=!passed[stage];
 $('skip-dna').hidden=stage!=='dna';$('show-hint').hidden=mode!=='guided';renderContextTerms();
}
function fill(v,automated=false){
 const exp=expected();if(!exp.length)return;
 const i=selected,right=v===exp[i];
 if(mode==='guided'&&!automated){message=stage==='protein'?{key:right?'goodAA':'badAA',vars:{codon:express(original).codons[i],aa:aaLabel(exp[i])}}:{key:right?'goodBase':'badBase',vars:{a:original[i],b:exp[i]}};if(!right){renderConstruction();$('palette').querySelector(`[data-choice="${v}"]`)?.focus();return;}}
 answers[stage][i]=v;passed[stage]=false;if(stage==='rna'){passed.protein=false;answers.protein=[];}checked=false;errors=[];
 if(mode==='guided'||automated){selected=Math.min(i+1,exp.length-1);if(answers[stage].length===exp.length&&exp.every((v,i)=>answers[stage][i]===v)){passed[stage]=true;message={key:'correctConstruction'};}}
 renderConstruction();renderEvidence();
 if(!automated)$('palette').querySelector(`[data-choice="${v}"]`)?.focus();
}
function stop(){if(timer)clearInterval(timer);timer=null;$('play').textContent=t('play');}
function reset(keepSeed=true){stop();mysteryCount=0;mysteryKey=null;$('mystery-task').hidden=true;if(!keepSeed){seed=(seed+1)>>>0;original=templateFromSeed(seed);}edited=original;answers={dna:[],rna:[],protein:[]};passed={dna:false,rna:false,protein:false};stage='dna';selected=0;errors=[];checked=false;records=[];message=null;$('explanation').value='';$('prediction').value='';$('utility-status').textContent='';render();syncURL();}
function syncURL(){const url=new URL(location.href);url.searchParams.set('seed',seed);url.searchParams.set('template',original);url.searchParams.set('edited',edited);url.searchParams.set('mode',mode);history.replaceState(null,'',url);}
function setStage(s){stop();stage=s;selected=0;errors=[];message=null;renderConstruction();renderEvidence();}
function setEdited(s){stop();mysteryKey=null;$('mystery-task').hidden=true;edited=s;message=null;$('edit-feedback').textContent='';renderInvestigation();renderEvidence();syncURL();}
function renderInvestigation(){
 const options=Object.keys(EXAMPLES).map(k=>`<option value="${k}">${t(k)}</option>`).join('');const was=$('example').value;$('example').innerHTML=options;$('example').value=Object.keys(EXAMPLES).find(k=>EXAMPLES[k]===edited)||was||'reference';
 const pos=$('edit-position').value;$('edit-position').innerHTML=[...edited].map((v,i)=>`<option value="${i}">${i+1} · ${v}</option>`).join('');if(Number(pos)<edited.length)$('edit-position').value=pos||'0';
 $('custom-template').value=edited;
 const diagnosis=$('diagnosis').value;$('diagnosis').innerHTML=['synonymous','missense','earlyStop','noStart','noStop'].map(k=>`<option value="${k}">${t(k)}</option>`).join('');if(diagnosis)$('diagnosis').value=diagnosis;
 if(mysteryKey)$('example').value='';
 const x=express(edited);
 $('comparison-strands').innerHTML=staticStrand(t('template'),edited,'3′','5′')+staticStrand(t('rna'),x.rna)+staticStrand(t('protein'),x.chain,'N','C',true)+`<p class="hint">${t('status')}: ${t(x.status)}${x.stop?` · ${t('stopPosition')}: ${x.stop}`:''}</p>`;
}
function renderEvidence(){
 const show=mode==='investigate'||passed.protein;
 const x=express(original),y=express(edited),c=compare(original,edited);
 $('record').disabled=!show;$('result').innerHTML=show?`<p class="result-chain">${safe((mode==='investigate'?y:x).chain.map(aaLabel).join(' – '))||t('chainEmpty')}</p><div class="table-wrap"><table><thead><tr><th>${t('quantity')}</th><th>${t('original')}</th>${mode==='investigate'?`<th>${t('edited')}</th>`:''}</tr></thead><tbody>${[['bases',original.length,edited.length],['aminoCount',x.chain.length,y.chain.length],['stopPosition',x.stop||t('none'),y.stop||t('none')],['status',t(x.status),t(y.status)]].map(([k,a,b])=>`<tr><th>${t(k)}</th><td>${a}</td>${mode==='investigate'?`<td>${b}</td>`:''}</tr>`).join('')}</tbody></table></div>${mode==='investigate'?`<p>${t('same')}: <b>${t(c.sameChain?'yes':'no')}</b></p><p>${t('changed')}: <b>${c.changedAmino}</b></p>`:''}`:`<p class="hint">${t('buildHint')}</p>`;
 renderHistory();renderContextTerms();
}
function renderHistory(){
 $('history-head').innerHTML=`<tr><th>${t('trial')}</th><th>${t('template')}</th><th>${t('rna')}</th><th>${t('protein')}</th><th>${t('status')}</th></tr>`;
 $('history-body').innerHTML=records.length?records.map((r,i)=>`<tr><td>${i+1} · ${t(r.kind)}</td><td class="sequence">${r.template}</td><td class="sequence">${r.rna}</td><td>${r.chain.map(aaLabel).join(' – ')||'—'}</td><td>${t(r.status)}${r.stop?` (${r.stop})`:''}</td></tr>`).join(''):`<tr><td colspan="5">${t('noRecords')}</td></tr>`;
 $('download').disabled=!records.length;
}
function render(){
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===mode));
 $('construction').hidden=mode==='investigate';$('investigation').hidden=mode!=='investigate';$('play').hidden=mode!=='guided';
 $('mode-hint').textContent=t(mode==='guided'?'guidedHint':mode==='build'?'buildHint':'investigateHint');$('seed-value').textContent=seed;
 $('play').textContent=t(timer?'pause':'play');$('detail-note').hidden=!$('detail').checked;
 $('codon-chart').innerHTML=Object.entries(CODE).map(([codon,aa])=>`<span class="${aa==='*'?'stop-codon':''}">${codon} ${safe(aaLabel(aa))}</span>`).join('');
 renderConstruction();renderInvestigation();renderEvidence();renderContextTerms();
}
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{stop();mode=b.dataset.mode;message=null;render();syncURL();}));
document.querySelectorAll('[data-stage]').forEach(b=>b.addEventListener('click',()=>setStage(b.dataset.stage)));
$('strands').addEventListener('click',e=>{const b=e.target.closest('[data-slot]');if(!b)return;selected=Number(b.dataset.slot);renderConstruction();$('strands').querySelector(`[data-slot="${selected}"]`).focus();});
$('palette').addEventListener('click',e=>{const b=e.target.closest('[data-choice]');if(b){stop();fill(b.dataset.choice);}});
$('check-construction').addEventListener('click',()=>{stop();errors=expected().map((v,i)=>v===answers[stage][i]?-1:i).filter(i=>i>=0);checked=true;passed[stage]=!errors.length;message=errors.length?{key:'wrongConstruction',vars:{n:errors.length}}:{key:'correctConstruction'};renderConstruction();renderEvidence();});
$('show-hint').addEventListener('click',()=>{stop();const exp=expected(),i=exp.findIndex((v,i)=>answers[stage][i]!==v);if(i>=0){selected=i;fill(exp[i],true);}});
$('next-stage').addEventListener('click',()=>{if(passed[stage])setStage(names[names.indexOf(stage)+1]);});
$('skip-dna').addEventListener('click',()=>setStage('rna'));
$('clear-stage').addEventListener('click',()=>{stop();answers[stage]=[];passed[stage]=false;if(stage==='rna'){passed.protein=false;answers.protein=[];}selected=0;errors=[];message=null;renderConstruction();renderEvidence();});
$('play').addEventListener('click',()=>{if(timer){stop();return;}$('play').textContent=t('pause');timer=setInterval(()=>{const exp=expected(),i=exp.findIndex((v,i)=>answers[stage][i]!==v);if(i>=0){selected=i;fill(exp[i],true);}else if(stage!=='protein'){stage=names[names.indexOf(stage)+1];selected=0;renderConstruction();}else stop();},450);});
$('example').addEventListener('change',()=>{original=EXAMPLES.reference;stage='dna';selected=0;answers={dna:[],rna:[],protein:[]};passed={dna:false,rna:false,protein:false};setEdited(EXAMPLES[$('example').value]);});
$('use-template').addEventListener('click',()=>{original=edited;answers={dna:[],rna:[],protein:[]};passed={dna:false,rna:false,protein:false};stage='dna';selected=0;mode='build';stop();message=null;render();syncURL();});
$('mystery').addEventListener('click',()=>{original=EXAMPLES.reference;stage='dna';selected=0;answers={dna:[],rna:[],protein:[]};passed={dna:false,rna:false,protein:false};const keys=['synonymous','missense','earlyStop','noStart','noStop'];const key=keys[(seed+mysteryCount++)%keys.length];setEdited(EXAMPLES[key]);mysteryKey=key;$('mystery-task').hidden=false;$('mystery-feedback').textContent='';$('example').value='';});
$('diagnose').addEventListener('click',()=>{$('mystery-feedback').textContent=t($('diagnosis').value===mysteryKey?'mysteryCorrect':'mysteryWrong');});
$('apply-edit').addEventListener('click',()=>setEdited(mutate(edited,Number($('edit-position').value),$('edit-base').value)));
$('apply-custom').addEventListener('click',()=>{try{const s=$('custom-template').value.toUpperCase().replace(/\s/g,'');validateDNA(s);setEdited(s);}catch{$('edit-feedback').textContent=t('invalid');}});
$('restore').addEventListener('click',()=>setEdited(original));
$('reset').addEventListener('click',()=>reset());$('new-trial').addEventListener('click',()=>reset(false));
$('copy-link').addEventListener('click',async()=>{syncURL();const url=new URL(location.href);url.searchParams.set('lang',getLang());try{await navigator.clipboard.writeText(url.href);$('utility-status').textContent=t('copied');}catch{$('utility-status').textContent=t('copyFail');}});
$('detail').addEventListener('change',()=>{$('detail-note').hidden=!$('detail').checked;});
$('record').addEventListener('click',()=>{records.push({kind:'original',...express(original)});if(mode==='investigate')records.push({kind:'edited',...express(edited)});$('utility-status').textContent=t('recorded');renderHistory();});
$('download').addEventListener('click',()=>{const quote=s=>'"'+String(s).replaceAll('"','""')+'"';const rows=[['seed','trial','DNA template 3 to 5','mRNA 5 to 3','amino acids N to C','amino acid count','stop codon position','status'],...records.map((r,i)=>[seed,i+1,r.template,r.rna,r.chain.join('-'),r.chain.length,r.stop??'',r.status])];const blob=new Blob(['\uFEFF'+rows.map(r=>r.map(quote).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=t('csvName');a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);});
onLangChange(render);initLab(content);syncURL();
