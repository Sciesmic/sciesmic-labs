import {run,sampleAt,normalize,DEFAULTS,STEPS,focusSpecies} from './model.js';
import {drawScene,ready,assetFor} from './renderer.js';
import {modeText} from './content-base.js';
import {initLab,onLangChange,getLang,t,renderRich} from '../kit/labs-kit.js';
import {createGraphTools} from '../kit/graph-tools.js';
import {animationFrame,motionPreference} from '../kit/motion.js';
export function startLab(content){
 const $=id=>document.getElementById(id),hs=content.level==='biology',params=new URLSearchParams(location.search);
 let seed=/^\d+$/.test(params.get('seed')||'')?Number(params.get('seed'))>>>0:42;
 const modeDefaults={diffusion:{species:'o2'},selectivity:{species:'na'},osmosis:{inside:40,outside:80},permeability:{species:'o2'},channels:{species:'na',pathway:'channel'},carrier:{species:'glucose'},pump:{},homeostasis:{},cotransport:{species:'glucose',inside:80,outside:20},vesicles:{species:'cargo'}};
 let currentMode=content.modes.includes(params.get('mode'))?params.get('mode'):content.modes[0];
 let settings={...DEFAULTS,...modeDefaults[currentMode],mode:currentMode};
 for(const key of Object.keys(DEFAULTS))if(params.has(key)&&key!=='mode'){const base=DEFAULTS[key];settings[key]=typeof base==='number'?Number(params.get(key)):typeof base==='boolean'?params.get(key)==='true':params.get(key);}
 settings=normalize(settings);
 let trial=run(settings,seed),time=0,maxTime=0,playing=false,handle=null,last=null,lastUi=-1,lastDraw=-1,saved=[],nextId=1;
 const graph=createGraphTools($('graph'));
 const fmt=(n,digits=2)=>new Intl.NumberFormat(getLang()==='es'?'es-MX':'en-US',{maximumFractionDigits:digits}).format(n);
 const symbol=sp=>({o2:'O₂',co2:'CO₂',na:'Na⁺',k:'K⁺',glucose:getLang()==='es'?'Glucosa':'Glucose',cargo:getLang()==='es'?'Carga':'Cargo',water:'H₂O'}[sp]||sp);
 const escape=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const controls=Object.keys(DEFAULTS).filter(k=>k!=='mode');
 const live=()=>sampleAt(trial,time);
 function setInputs(){for(const key of controls){const el=$(key);if(!el)continue;if(el.type==='checkbox')el.checked=!!settings[key];else el.value=settings[key];}}
 function readInputs(){const vals={mode:currentMode};for(const key of controls){const el=$(key);if(el)vals[key]=el.type==='checkbox'?el.checked:el.value;}return normalize(vals);}
 function pause(){playing=false;if(handle!==null)cancelAnimationFrame(handle);handle=null;last=null;update();}
 function reset(useNewSeed=false){pause();if(useNewSeed)seed=(seed+1)>>>0;settings=readInputs();trial=run(settings,seed);time=0;maxTime=0;lastUi=-1;update();draw();}
 function draw(){drawScene($('scene'),trial,time,{lang:getLang(),highlight:$('highlights').checked,trace:$('trace').checked,reduced:motionPreference.matches});}
 function frame(stamp){if(!playing)return;if(last===null)last=stamp;const dt=Math.min(.1,(stamp-last)/1000);last=stamp;time=Math.min(STEPS,time+dt*Number($('speed').value));maxTime=Math.max(maxTime,time);if(!motionPreference.matches||Math.floor(time)!==lastDraw){draw();lastDraw=Math.floor(time);}if(Math.floor(time*4)!==lastUi){update();lastUi=Math.floor(time*4);}if(time>=STEPS){pause();draw();return;}handle=animationFrame(frame);}
 function play(){if(playing){pause();return;}if(time>=STEPS){time=0;maxTime=0;}playing=true;last=null;lastUi=-1;update();handle=animationFrame(frame);}
 function modes(){
  $('modes').innerHTML=content.modes.map(m=>`<button data-mode="${m}" aria-pressed="${m===currentMode}">${escape(t('mode_'+m))}</button>`).join('');
  $('modes').querySelectorAll('button').forEach(button=>button.onclick=()=>{pause();currentMode=button.dataset.mode;settings=normalize({...DEFAULTS,...modeDefaults[currentMode],mode:currentMode});setInputs();trial=run(settings,seed);time=0;maxTime=0;modes();update();draw();});
  const m=currentMode;const shown=new Set();
  if(!['pump','homeostasis','osmosis','cotransport','vesicles'].includes(m))shown.add('species');
  if(!['pump','homeostasis'].includes(m)){shown.add('inside');shown.add('outside');shown.add('volume');}
  if(['selectivity','permeability'].includes(m))shown.add('pathway');
  if(['selectivity','permeability','carrier','channels','pump','homeostasis','cotransport','osmosis'].includes(m))shown.add('proteins');
  if(hs&&(['channels','selectivity','permeability'].includes(m)))shown.add('channelSpecies');
  if(m==='channels'){shown.add('gate');shown.add('voltage');if(settings.gate==='ligand')shown.add('ligand');}
  if(['pump','homeostasis'].includes(m))shown.add('atp');
  if(m==='osmosis')shown.add('cell');
  if(m==='cotransport'){shown.add('gradient');shown.add('voltage');}
  if(m==='vesicles'){shown.add('bulk');shown.add('energy');}
  document.querySelectorAll('[data-control]').forEach(el=>el.hidden=!shown.has(el.dataset.control));
  $('mode-guide').innerHTML=renderRich(modeText[m][getLang()][1]);
  $('metric').querySelector('[value="volume"]').hidden=m!=='osmosis';$('metric').querySelector('[value="atp"]').hidden=!['pump','homeostasis'].includes(m);
  if(m==='osmosis')$('metric').value='volume';else if(['volume','atp'].includes($('metric').value))$('metric').value='concentration';
 }
 function quantity(row,tr,metric,side){const sp=focusSpecies(tr.settings);if(metric==='volume')return row.volumeIn;if(metric==='atp')return row.atp;if(metric==='flux')return sp==='water'?(side==='in'?row.waterIn:row.waterOut):tr.events.filter(e=>e.species===sp&&e.to===side&&e.at<=row.time).length;if(sp==='water')return metric==='amount'?(side==='in'?row.volumeIn:row.volumeOut):tr.settings[side==='in'?'inside':'outside']/row[side==='in'?'volumeIn':'volumeOut'];const amount=row.counts[sp][side];return metric==='amount'?amount:amount/row[side==='in'?'volumeIn':'volumeOut'];}
 function dataRows(tr,until){const rows=tr.rows.filter(r=>r.time<=until&&r.time%2===0);if(until%2!==0)rows.push(sampleAt(tr,until));return rows;}
 function updateEvidence(){
  const metric=$('metric').value,unit=metric==='concentration'?t('units'):metric==='volume'?t('volumeUnits'):metric==='flux'?(currentMode==='osmosis'?t('volumeUnits'):t('crossings')):metric==='atp'?'ATP':t('amount');
  const series=[];const sources=[...saved.filter(x=>x.trial.settings.mode===currentMode),{id:'current',trial,until:time,label:getLang()==='es'?'Actual':'Current'}];
  let bound=metric==='volume'?1.7:metric==='atp'?40:metric==='concentration'?100:20;
  for(const source of sources){const tr=source.trial,sp=focusSpecies(tr.settings),first=tr.rows[0];if(metric==='concentration')bound=Math.max(bound,sp==='water'?Math.max(tr.settings.inside/.3,tr.settings.outside/.4):(first.counts[sp].in+first.counts[sp].out)/Math.min(first.volumeIn,first.volumeOut));else if(metric==='amount')bound=Math.max(bound,sp==='water'?2:first.counts[sp].in+first.counts[sp].out);else if(metric==='flux')bound=Math.max(bound,quantity(tr.final,tr,'flux','in'),quantity(tr.final,tr,'flux','out'));}
  if(metric==='flux')bound=Math.ceil(bound/10)*10;
  for(const source of sources)for(const side of ['in','out']){if(side==='out'&&['volume','atp'].includes(metric))continue;const tr=source.trial;series.push({id:source.id+'-'+side,label:source.label+' · '+(metric==='flux'?(side==='in'?t('inward'):t('outward')):(side==='in'?t('inCount'):t('outCount')))+' · '+symbol(focusSpecies(tr.settings)),points:dataRows(tr,source.until).map(row=>({id:source.id+'-'+side+'-'+row.time,x:row.time,y:quantity(row,tr,metric,side)}))});}
  graph.update({title:t(metric==='concentration'?'concentration':metric==='flux'?'fluxMetric':metric==='volume'?'volumeMetric':metric==='atp'?'atpMetric':'amount'),xLabel:t('timeUnits'),yLabel:unit,xMin:0,xMax:STEPS,yMin:0,yMax:bound,series});
  const sp=focusSpecies(settings),r=live();
  $('data-head').innerHTML='<tr>'+[t('time'),sp==='water'?t('volumeShort'):t('inCount')+' · '+symbol(sp),sp==='water'?(getLang()==='es'?'Volumen exterior':'Outside volume'):t('outCount')+' · '+symbol(sp),t('inConc')+' · '+t('units'),t('outConc')+' · '+t('units'),t('atpLeft')].map(x=>`<th scope="col">${escape(x)}</th>`).join('')+'</tr>';
  $('data-body').innerHTML=dataRows(trial,time).filter((r,i,a)=>r.time%10===0||i===a.length-1).map(r=>`<tr><th scope="row">${fmt(r.time)}</th><td>${fmt(sp==='water'?r.volumeIn:r.counts[sp].in)}</td><td>${fmt(sp==='water'?r.volumeOut:r.counts[sp].out)}</td><td>${fmt(quantity(r,trial,'concentration','in'))}</td><td>${fmt(quantity(r,trial,'concentration','out'))}</td><td>${['pump','homeostasis'].includes(currentMode)?r.atp:'—'}</td></tr>`).join('');
  $('comparisons').innerHTML=saved.length?saved.map(x=>`<div class="comparison-item"><span>${escape(x.label)} · ${escape(t('mode_'+x.trial.settings.mode))} · ${fmt(x.until)} ${escape(t('timeUnits'))} · seed ${x.trial.seed}</span><button data-remove="${x.id}" aria-label="${getLang()==='es'?'Quitar':'Remove'} ${escape(x.label)}">×</button></div>`).join(''):`<p class="muted">${escape(t('noComparisons'))}</p>`;
  $('comparisons').querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{saved=saved.filter(x=>x.id!==b.dataset.remove);updateEvidence();});
 }
 function update(){
  const r=live(),sp=focusSpecies(settings),osm=sp==='water';
  $('seed-value').value=String(seed);$('clock').value=`${fmt(time)} / ${STEPS}`;
  $('run').textContent=playing?t('pause'):time>0?t('resume'):t('run');
  $('timeline').max=String(Math.max(.5,maxTime));$('timeline').value=String(time);
  $('play-status').textContent=time>=STEPS?t('end'):playing?t('playing'):t('stopped');
  $('reduced-note').hidden=!motionPreference.matches;$('limit-note').hidden=!r.limit;
  $('scene-description').textContent=t(osm?'waterSymbols':'oneParticle');
  const names={o2:'molecule_o2',co2:'molecule_o2',na:'ion_na_idle',k:'ion_k_idle',glucose:'glucose_ring_idle',cargo:'protein_large_idle'};
  $('particle-legend').innerHTML=osm?`<span>● H₂O</span><span>■ ${getLang()==='es'?'Soluto no penetrante':'Nonpenetrating solute'}</span>`:[...new Set(trial.particles.map(p=>p.species))].map(sp=>`<span><img src="${escape(assetFor(names[sp]))}" alt="">${escape(sp==='cargo'?(getLang()==='es'?'Carga':'Cargo'):t(sp))}</span>`).join('');
  const stats=osm?[[t('volumeShort'),r.volumeIn,t('volumeUnits')],[t('inConc'),settings.inside/r.volumeIn,t('units')],[t('outConc'),settings.outside/r.volumeOut,t('units')],[t('pressureLabel'),r.pressure,'']]:[[symbol(sp)+' · '+t('inCount'),r.counts[sp].in,t('amount')],[symbol(sp)+' · '+t('outCount'),r.counts[sp].out,t('amount')],[t('inConc'),r.counts[sp].in/r.volumeIn,t('units')],[t('outConc'),r.counts[sp].out/r.volumeOut,t('units')]];
  if(['pump','homeostasis'].includes(currentMode))stats.push([t('cycle'),r.cycles,''],[t('atpLeft'),r.atp,'ATP'],['K⁺ · '+t('inCount'),r.counts.k.in,t('amount')],['K⁺ · '+t('outCount'),r.counts.k.out,t('amount')]);
  if(currentMode==='cotransport')stats.push(['Glucose · '+t('inCount'),r.counts.glucose.in,t('amount')],['Glucose · '+t('outCount'),r.counts.glucose.out,t('amount')]);
  $('stats').innerHTML=stats.map(([label,value,unit])=>`<div class="stat"><span>${escape(label)}</span><strong>${fmt(value)}</strong><small>${escape(unit)}</small></div>`).join('');
  const inward=quantity(r,trial,'flux','in'),outward=quantity(r,trial,'flux','out');
  const fluxRows=osm?[[t('waterBalance'),`${fmt(inward)} / ${fmt(outward)} ${t('volumeUnits')}`],[t('net'),fmt(inward-outward)]]:[[symbol(sp)+' · '+t('inward'),fmt(inward)],[symbol(sp)+' · '+t('outward'),fmt(outward)],[symbol(sp)+' · '+t('net'),fmt(inward-outward)]];
  if(['pump','homeostasis','cotransport'].includes(currentMode)){const second=currentMode==='cotransport'?'glucose':'k';for(const side of ['in','out'])fluxRows.push([symbol(second)+' · '+t(side==='in'?'inward':'outward'),fmt(trial.events.filter(e=>e.species===second&&e.to===side&&e.at<=time).length)]);}
  $('flux').innerHTML=fluxRows.map(([l,v])=>`<span>${escape(l)}: <b>${escape(v)}</b></span>`).join('');
  let mechanism='';if(['pump','homeostasis'].includes(currentMode)){const c=trial.cycles.find(c=>time>=c.start&&time<c.end);mechanism=c?t('pump'+Math.min(3,Math.floor((time-c.start)/1.5))):t('waiting');}else if(currentMode==='vesicles')mechanism=(settings.energy?t('vesicle'+(time%8<1?0:time%8<2?1:time%8<3.5?2:3)):t('energyOff'));else if(['carrier','cotransport'].includes(currentMode))mechanism=t('bound');$('mechanism').textContent=mechanism;
  updateEvidence();
 }
 $('run').onclick=play;$('reset').onclick=()=>reset(false);$('new').onclick=()=>reset(true);
 $('step').onclick=()=>{pause();const next=trial.events.find(e=>e.at>time+.001);time=Math.min(STEPS,currentMode==='osmosis'?Math.floor(time)+1:['pump','homeostasis','vesicles'].includes(currentMode)?time+.5:next?.at??Math.floor(time)+1);maxTime=Math.max(maxTime,time);update();draw();};
 $('record').onclick=()=>{pause();const id='saved-'+nextId++;saved.push({id,trial,until:time,label:(getLang()==='es'?'Prueba ':'Trial ')+(nextId-1)});updateEvidence();};
 $('timeline').oninput=()=>{pause();time=Math.min(maxTime,Number($('timeline').value));update();draw();};
 $('metric').onchange=updateEvidence;
 for(const key of controls){const el=$(key);if(el)el.onchange=()=>{reset();modes();update();};}
 for(const key of ['highlights','trace'])$(key).onchange=draw;
 $('share').onclick=async()=>{const url=new URL(location.href);url.search='';url.searchParams.set('seed',String(seed));url.searchParams.set('lang',getLang());for(const [key,value] of Object.entries(settings))url.searchParams.set(key,String(value));try{await navigator.clipboard.writeText(url.href);$('share-status').textContent=t('copied');}catch{$('share-status').textContent=url.href;}};
 motionPreference.addEventListener('change',()=>{last=null;update();draw();});
 setInputs();onLangChange(()=>{modes();update();draw();$('other-lab').href=`../${hs?'cell-transport':'cell-transport-biology'}/?lang=${getLang()}`;});initLab(content);modes();update();ready.then(draw);
 // Read-only QA hooks expose state, never drive the physical model from rendering.
 window.transportLab={get trial(){return trial},get time(){return time},get playing(){return playing},sample:()=>live()};
}
