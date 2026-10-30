import {motionPreference, animationFrame} from '../kit/motion.js';
import {content} from './content.js';
import {SAMPLES,MATERIALS,measure,mystery,sampleId,round} from './model.js';
import {initLab,onLangChange,t,renderRich,getLang,setLang} from '../kit/labs-kit.js';
const $=id=>document.getElementById(id),params=new URLSearchParams(location.search);
let seed=Number(params.get('seed')??42)>>>0;
let mode=['guided','explore','mystery'].includes(params.get('mode'))?params.get('mode'):'guided';
let material=MATERIALS.includes(params.get('material'))?params.get('material'):'wood';
let shape=['cube','small','large'].includes(params.get('shape'))?params.get('shape'):'cube';
if(mode==='guided')shape='cube';
let id=mode==='mystery'?mystery(seed):sampleId(material,shape),state,rows=[],nextTrial=1,selected=null,excluded=new Set(),raf=0,last=0,elapsed=0,playing=false,waterStarted=false;
const reduced=()=>motionPreference.matches;
const fmt=(v,d=2)=>Number(v).toLocaleString(getLang()==='es'?'es-MX':'en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const image=(file,x,y,w,h,attrs='')=>`<image href="assets/${file}.svg" x="${x}" y="${y}" width="${w}" height="${h}" ${attrs}/>`;
const m=()=>measure(id);
function rowName(r){return r.mystery&&!r.revealed?t('unknown'):t(r.material)+' · '+t(r.shape);}
function sampleName(){return mode==='mystery'&&!state.revealed?t('unknown'):t(m().material)+' · '+t(m().shape);}
function specimen(x,y,scale=1,mask=mode==='mystery'&&!state.revealed){
 if(mask)return `<g transform="translate(${x},${y}) scale(${scale})"><rect x="38" y="55" width="100" height="77" rx="10" fill="#6c7770" stroke="#2a201d" stroke-width="3"/><text x="88" y="107" text-anchor="middle" fill="#fffef9" font-size="35">?</text></g>`;
 return image(id,x,y,176*scale,144*scale);
}
function shell(svg,label){return `<svg viewBox="${svg.box}" role="img" aria-label="${safe(label)}">${svg.body}</svg>`;}
function massScene(){
 const s=m(),ready=state.mass;
 $('mass-scene').innerHTML=shell({box:'0 0 360 280',body:`<path d="M0 250H360" stroke="#c6ccbb"/>${image('balance_base',20,140,320,120)}${image('balance_pan',20,140,320,120)}${ready?specimen(68,94,.65):specimen(80,3,.65)}${image('balance_lcd',20,140,320,120)}<text x="275" y="228" text-anchor="middle" fill="#2a201d" font-size="16" font-family="monospace" font-weight="bold">${ready?fmt(s.measuredMass):'—'} g</text>`},t('massStation')+': '+(ready?fmt(s.measuredMass)+' g':t('waiting')));
}
function cylinder(x,y,value,object=false,scale=1,clip='measure-water'){
 const level=380-value*3;
 return `<g transform="translate(${x} ${y}) scale(${scale})"><defs><clipPath id="${clip}"><rect x="25" y="${level}" width="70" height="${420-level}"/></clipPath></defs>${image('cylinder_100ml_back',0,0,120,420)}${object?(id==='steel_small'?'<g transform="rotate(-90 60 343)">'+specimen(16,290,.5)+'</g>':specimen(16,290,.5)):''}<g clip-path="url(#${clip})">${image('cylinder_100ml_water',0,0,120,420)}</g><g transform="translate(0 ${-3*value})">${image('cylinder_100ml_meniscus',0,0,120,420)}</g>${image('cylinder_100ml_front',0,0,120,420)}</g>`;
}
function volumeScene(){
 const s=m();let body,box;
 if(s.method==='ruler'){
 box='0 0 360 280';body=`${specimen(11,88,.5)}${image('ruler_15cm',10,147,340,48)}${state.volume?'<path d="M30 135V210M70 135V210M30 205H70" fill="none" stroke="#b65c25" stroke-width="1.5"/><text x="50" y="235" text-anchor="middle" font-size="14" fill="#263b36">2.00 cm</text>':''}`;
 }else if(s.method==='cylinder'){
 box='0 0 360 450';body=cylinder(42,12,50,false,1,'before-water')+cylinder(196,12,state.volume?s.final:50,state.volume,1,'after-water');
 }else{
 box='0 0 360 380';body=`<g transform="translate(0 40)">${image('overflow_can_back',0,0,260,260)}${state.volume?specimen(45,112,.5):''}${image('overflow_can_water',0,0,260,260)}${image('overflow_can_front',0,0,260,260)}</g>${cylinder(260,55,state.volume?s.measuredVolume:0,false,.72,'catch-water')}`;
 }
 $('volume-scene').innerHTML=shell({box,body},t('volumeStation')+' · '+t(s.method)+(state.volume?': '+fmt(s.measuredVolume)+' cm³':''));
 $('volume-note').textContent=!state.volume?'':s.method==='ruler'?t('rulerNote'):s.method==='cylinder'?t('cylinderNote',{a:fmt(50),b:fmt(s.final),v:fmt(s.measuredVolume)}):t('overflowNote',{v:fmt(s.measuredVolume)});
 $('float-guard').hidden=!(state.volume&&s.floating&&s.method!=='ruler');
}
function waterScene(){
 const s=m(),u=Math.min(1,elapsed/1.4),eased=u*u*(3-2*u),current=waterStarted?eased:0,water=150+(waterStarted?s.displacedVolume*current:0),level=212-water*.56;
 const bounds=s.shape==='cube'?[100,92]:s.bounds;
 const bottom=s.floating?level+bounds[1]*.5*s.submergedFraction:208;
 const objY=(waterStarted?(1-current)*35+current*bottom:35)-66;
 const body=`<defs><clipPath id="beaker-water"><rect x="35" y="${level}" width="150" height="${240-level}"/></clipPath></defs><g transform="translate(70 40)">${image('beaker_250ml_back',0,0,220,240)}${specimen(66,objY,.5)}<g clip-path="url(#beaker-water)">${image('beaker_250ml_water',0,0,220,240)}</g><g transform="translate(0 ${-water*.56})">${image('beaker_250ml_meniscus',0,0,220,240)}</g>${image('beaker_250ml_front',0,0,220,240)}</g>`;
 $('water-scene').innerHTML=shell({box:'0 0 360 300',body},t('floatStation')+': '+(state.water?t(s.floating?'floating':'sinking'):t('waiting')));
}
function stop(){cancelAnimationFrame(raf);playing=false;last=0;}
function syncURL(){const u=new URL(location.href);for(const[k,v]of Object.entries({mode,seed,material,shape,lang:getLang()}))u.searchParams.set(k,v);history.replaceState(null,'',u);return u;}
function reset(){stop();elapsed=0;waterStarted=false;state={mass:false,volume:false,water:false,calculated:false,recorded:false,revealed:false};$('density-input').value='';$('calculation-feedback').textContent='';$('mystery-feedback').textContent='';$('guess').value='';render();}
function readings(){
 const s=m();$('mass-reading').textContent=state.mass?fmt(s.measuredMass):'—';$('volume-reading').textContent=state.volume?fmt(s.measuredVolume):'—';$('water-reading').textContent=state.water?t(s.floating?'floating':'sinking'):'—';
 $('water-note').textContent=state.water?t(s.floating?'floatNote':'sinkNote',{v:fmt(s.displacedVolume)}):'';
 const count=['mass','volume','water','calculated'].filter(k=>state[k]).length;
 $('progress').textContent=t('progress',{n:count});$('calculate').disabled=!(state.mass&&state.volume);$('record').disabled=count!==4||state.recorded;
 $('record-status').textContent=t(state.recorded?'recorded':count===4?'readyRecord':'needMeasurements');
 $('pause').hidden=!waterStarted||state.water;$('pause').textContent=t(playing?'pause':'resume');$('drop').disabled=waterStarted;
 if(state.calculated)$('calculation-feedback').textContent=t('calcCorrect',{m:fmt(s.measuredMass),v:fmt(s.measuredVolume),d:fmt(s.calculatedDensity)});
}
function render(){
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===mode));
 $('mode-hint').innerHTML=renderRich(t(mode+'Hint'));$('material-control').hidden=mode==='mystery';$('shape-control').hidden=mode==='mystery';
 $('material').innerHTML=MATERIALS.map(v=>`<option value="${v}">${t(v)}</option>`).join('');$('material').value=material;
 $('shape').innerHTML=(mode==='guided'?['cube']:['cube','small','large']).map(v=>`<option value="${v}">${t(v)}</option>`).join('');$('shape').value=shape;
 $('sample-art').src='assets/'+(mode==='mystery'&&!state.revealed?'cube_steel':id)+'.svg';$('sample-art').className=mode==='mystery'&&!state.revealed?'masked':'';$('sample-art').alt=sampleName();$('sample-name').textContent=sampleName();
 $('graph-view').querySelector('[value=material]').textContent=t(mode==='mystery'&&!state.revealed?'currentMystery':'currentMaterial');
 $('mystery-panel').hidden=mode!=='mystery';$('new-mystery').hidden=mode!=='mystery';$('guided-steps').hidden=mode!=='guided';
 const guess=$('guess').value;$('guess').innerHTML=`<option value="">${t('choose')}</option>`+MATERIALS.map(v=>`<option value="${v}">${t(v)}</option>`).join('');$('guess').value=guess;
 $('seed').textContent=seed;$('flashcards-link').href=`flashcards.html?lang=${getLang()}`;
 $('reference-table').innerHTML='<div class="reference-grid">'+MATERIALS.map(v=>`<div class="reference-item">${imageHTML(v)}<strong>${t(v)}</strong><span>${fmt(SAMPLES['cube_'+v].density)} g/cm³</span></div>`).join('')+'</div>';
 readings();massScene();volumeScene();waterScene();notebook();graph();syncURL();
 if(state.revealed)$('mystery-feedback').textContent=t('guessCorrect',{name:t(m().material)});
}
function imageHTML(v){return `<img src="assets/cube_${v}.svg" alt="">`;}
function table(head,body){return `<thead><tr>${head.map(s=>`<th scope="col">${safe(s)}</th>`).join('')}</tr></thead><tbody>${body.map(row=>`<tr>${row.map(v=>`<td>${safe(v)}</td>`).join('')}</tr>`).join('')}</tbody>`;}
function rowData(r){return ['T'+r.n,rowName(r),fmt(r.measuredMass),fmt(r.measuredVolume),fmt(r.calculatedDensity),t(r.floating?'floating':'sinking'),t(r.method)];}
function notebook(){
 $('notebook-empty').hidden=!!rows.length;$('download').disabled=!rows.length;
 $('history').innerHTML=rows.length?table(['trial','sample','massHeading','volumeHeading','densityHeading','outcome','method'].map(t),rows.map(rowData)):'';
}
const colors=['#275d50','#a84b22','#394f97','#6f4082','#805a16','#22717d'];
function visibleRows(){return rows.filter(r=>!excluded.has(r.n)&&($('graph-view').value!=='material'||(mode==='mystery'&&!state.revealed?r.mystery&&r.seed===seed:r.material===m().material)));}
function graph(){
 $('graph-trials').innerHTML=rows.length?rows.map(r=>`<label><input type="checkbox" data-trial="${r.n}" ${excluded.has(r.n)?'':'checked'}>T${r.n} · ${safe(rowName(r))}</label>`).join(''):safe(t('graphEmpty'));
 const visible=visibleRows();if(!visible.some(r=>r.n===selected))selected=visible[0]?.n??null;
 $('inspect').innerHTML=visible.map(r=>`<option value="${r.n}">T${r.n} · ${safe(rowName(r))}</option>`).join('');$('inspect').disabled=!visible.length;$('inspect').value=selected??'';
 let g='';for(let v=0;v<=80;v+=20){const y=300-v*3.2;g+=`<path d="M70 ${y}H750" stroke="#d6dbcc"/><text x="58" y="${y+4}" text-anchor="end">${v}</text>`;}for(let v=0;v<=16;v+=2){const x=70+v*42.5;g+=`<path d="M${x} 44V300" stroke="#e8ecdf"/><text x="${x}" y="323" text-anchor="middle">${v}</text>`;}
 g+=`<path d="M70 44V300H750" fill="none" stroke="#5c6e65"/><text x="70" y="23">${safe(t('graphY'))}</text><text x="750" y="348" text-anchor="end">${safe(t('graphX'))}</text>`;
 g+=visible.map(r=>{const x=70+r.measuredVolume*42.5,y=300-r.measuredMass*3.2,c=colors[(r.n-1)%colors.length];return `<g class="graph-point" role="button" tabindex="0" data-point="${r.n}" aria-pressed="${selected===r.n}" aria-label="${safe(t('pointReadout',{n:r.n,name:rowName(r),v:fmt(r.measuredVolume),m:fmt(r.measuredMass),d:fmt(r.calculatedDensity),outcome:t(r.floating?'floating':'sinking')}))}"><circle cx="${x}" cy="${y}" r="19" fill="transparent"/><circle cx="${x}" cy="${y}" r="${selected===r.n?8:6}" fill="${c}" stroke="#fffef9" stroke-width="2"/><text x="${x+10}" y="${y-9}">T${r.n}</text></g>`;}).join('');
 $('graph').innerHTML=g;inspect();$('graph-table').innerHTML=visible.length?table(['trial','sample','massHeading','volumeHeading','densityHeading','outcome','method'].map(t),visible.map(rowData)):'';
}
function inspect(){const r=rows.find(v=>v.n===selected);$('point-readout').textContent=r?t('pointReadout',{n:r.n,name:rowName(r),v:fmt(r.measuredVolume),m:fmt(r.measuredMass),d:fmt(r.calculatedDensity),outcome:t(r.floating?'floating':'sinking')}):t('graphEmpty');}
$('material').onchange=()=>{material=$('material').value;id=sampleId(material,shape);reset();};
$('shape').onchange=()=>{shape=$('shape').value;id=sampleId(material,shape);reset();};
for(const b of document.querySelectorAll('[data-mode]'))b.onclick=()=>{mode=b.dataset.mode;if(mode==='guided')shape='cube';id=mode==='mystery'?mystery(seed):sampleId(material,shape);reset();};
$('weigh').onclick=()=>{state.mass=true;readings();massScene();};
$('measure').onclick=()=>{state.volume=true;readings();volumeScene();};
function frame(now){if(!playing)return;if(reduced())elapsed=1.4;else if(last)elapsed+=Math.min(.05,(now-last)/1000);last=now;if(elapsed>=1.4){elapsed=1.4;state.water=true;stop();}waterScene();readings();if(playing)raf=animationFrame(frame);}
$('drop').onclick=()=>{waterStarted=true;if(reduced()){elapsed=1.4;state.water=true;waterScene();readings();}else{playing=true;last=0;readings();raf=animationFrame(frame);}};
$('pause').onclick=()=>{if(playing)stop();else{playing=true;last=0;raf=animationFrame(frame);}readings();};
$('reset').onclick=reset;
$('new-mystery').onclick=()=>{seed=(seed+1)>>>0;id=mystery(seed);reset();};
$('calculate').onclick=()=>{if(!(state.mass&&state.volume)){$('calculation-feedback').textContent=t('calcReady');return;}const raw=$('density-input').value,answer=Number(raw),expected=round(m().calculatedDensity);if(raw.trim()&&Number.isFinite(answer)&&Math.abs(answer-expected)<.005){state.calculated=true;readings();}else{$('calculation-feedback').textContent=t('calcWrong');}};
$('density-input').oninput=()=>{state.calculated=false;state.recorded=false;$('calculation-feedback').textContent='';readings();};
$('check-mystery').onclick=()=>{if(!state.calculated){$('mystery-feedback').textContent=t('guessFirst');return;}if($('guess').value===m().material){state.revealed=true;rows.forEach(r=>{if(r.mystery&&r.seed===seed)r.revealed=true;});render();$('mystery-feedback').textContent=t('guessCorrect',{name:t(m().material)});}else $('mystery-feedback').textContent=t('guessWrong');};
$('record').onclick=()=>{if($('record').disabled)return;const s=m();const r={...s,n:nextTrial++,seed,mystery:mode==='mystery',revealed:state.revealed};rows.push(r);selected=r.n;state.recorded=true;readings();notebook();graph();};
$('clear').onclick=()=>{rows=[];nextTrial=1;selected=null;excluded.clear();state.recorded=false;readings();notebook();graph();};
$('graph-view').onchange=graph;
$('graph-trials').onchange=e=>{const n=Number(e.target.dataset.trial);if(e.target.checked)excluded.delete(n);else excluded.add(n);graph();};
$('inspect').onchange=()=>{selected=Number($('inspect').value);graph();};
function selectPoint(target){selected=Number(target.dataset.point);graph();$('graph').querySelector(`[data-point="${selected}"]`)?.focus();}
$('graph').onclick=e=>{const point=e.target.closest('[data-point]');if(point)selectPoint(point);};
$('graph').onkeydown=e=>{const point=e.target.closest('[data-point]');if(!point)return;const a=visibleRows(),i=a.findIndex(r=>r.n===Number(point.dataset.point));if(['Enter',' ','ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();selected=e.key==='Home'?a[0].n:e.key==='End'?a.at(-1).n:e.key==='ArrowLeft'?a[Math.max(0,i-1)].n:e.key==='ArrowRight'?a[Math.min(a.length-1,i+1)].n:Number(point.dataset.point);graph();$('graph').querySelector(`[data-point="${selected}"]`)?.focus();}};
$('enlarge-graph').onclick=()=>{if(playing){stop();readings();}$('graph-dialog-body').append($('graph-workspace'));$('graph-dialog').showModal();$('close-graph').focus();};
$('close-graph').onclick=()=>$('graph-dialog').close();
$('graph-dialog').onclose=()=>{$('graph-slot').append($('graph-workspace'));$('enlarge-graph').focus();};
$('graph-language').onclick=()=>setLang(getLang()==='en'?'es':'en');
$('share').onclick=async()=>{const url=syncURL().href;try{await navigator.clipboard.writeText(url);$('share-status').textContent=t('copied');}catch{$('share-status').textContent=t('copyFallback')+' '+url;}};
$('download').onclick=()=>{const headers=['trial','sample','mass_g','volume_cm3','calculated_density_g_cm3','water_test','volume_method','mystery_seed'];const data=rows.map(r=>['T'+r.n,rowName(r),r.measuredMass,r.measuredVolume,r.calculatedDensity,r.floating?'floats':'sinks',r.method,r.mystery?r.seed:'']);const csv='\uFEFF'+[headers,...data].map(a=>a.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n');const a=document.createElement('a'),url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.href=url;a.download='density-detective-trials.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
// Close the kit popover before switching languages; preserve all student evidence and writing.
document.addEventListener('click',e=>{if(e.target.closest('[data-lang],#graph-language'))document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));},true);
onLangChange(()=>{document.querySelector('.lk-pop')?.setAttribute('hidden','');$('share-status').textContent='';render();});
state={mass:false,volume:false,water:false,calculated:false,recorded:false,revealed:false};
initLab(content);
