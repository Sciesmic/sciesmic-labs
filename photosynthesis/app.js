import {motionPreference, animationFrame, animationNow} from '../kit/motion.js';
import {content} from './content.js';
import {initLab,onLangChange,getLang,t,renderRich} from '../kit/labs-kit.js';
import {VERSION,DURATION,normalize,at,series,makeAtoms,react,totals,random} from './model.js';
const $=id=>document.getElementById(id),q=new URLSearchParams(location.search);
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=(n,d=2)=>(Math.sign(n)*Math.round((Math.abs(n)+1e-12)*10**d)/10**d).toLocaleString(getLang()==='es'?'es-MX':'en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
let settings=normalize({light:q.get('light')??75,co2:q.get('co2')??75,color:q.get('color')??'white'}),seed=Number(q.get('seed')??42)>>>0;
let mode=['lab','leaf','atoms','cycle'].includes(q.get('mode'))?q.get('mode'):'lab',zoom='plant',time=0,playing=false,last=0,lastDraw=0,trialId=1,nextId=2,records=[],selected=null,savedMessage='';
let atomState=makeAtoms(),atomStart=totals(atomState);
const palette=['#386548','#a25426','#3c6a9c','#7b5685','#69792c','#a0445b'];
const image=(id,x,y,w,h,extra='')=>`<image href="assets/${id}.png" x="${x}" y="${y}" width="${w}" height="${h}" ${extra}/>`;
function conditions(s){return t('trialSettings',{light:fmt(s.light,0),color:t(s.color),co2:fmt(s.co2,0)});}
function bubbleOffsets(){const r=random(seed);return Array.from({length:8},()=>({x:120+r()*35,y:210+r()*70,delay:r()*-3}));}
let bubbles=bubbleOffsets();
function scene(){
 const r=at(settings,time),night=settings.light===0;let h='';$('scene').closest('.scene-frame').dataset.night=String(mode==='cycle'&&night);
 if(mode==='cycle'){
  h=image(night?'sky_night':'sky_day',0,0,720,440);
  if(!night)h+=image('sun',35,48,86,86);
  for(const id of ['pot_cutaway','roots_mature','soil_top_wet',night?'plant_night':'plant_mature'])h+=image(id,210,82,300,300);
  const ink=night?'#f4ecdc':'#355540',panel=night?'#203727':'#fffdf7';
  h+=`<rect x="22" y="137" width="676" height="95" rx="12" fill="${panel}" opacity=".91"/><rect x="22" y="253" width="676" height="95" rx="12" fill="${panel}" opacity=".91"/>`;
  // Separate gross flows make ongoing respiration visible even when net release is positive.
  function flux(name,rate,y,input,output){
   const active=rate>1e-10,phase=motionPreference.matches?0:time*(.4+rate*2),count=active?Math.max(1,Math.ceil(rate*10)):0;
   let f=`<g data-process="${name}" data-rate="${rate}" data-active="${active}"><text x="38" y="${y-24}" fill="${ink}" font-size="15" font-family="system-ui" font-weight="700">${safe(t(name==='photo'?'photoProcess':'respProcess'))}</text><text x="682" y="${y-24}" text-anchor="end" fill="${ink}" font-size="14" font-family="system-ui">${fmt(rate,4)} mL O₂/min</text>`;
   for(const [start,end,molecule]of [[52,278,input],[442,668,output]]){
    f+=`<path d="M${start} ${y}H${end}" stroke="${name==='photo'?'#6e9847':'#b67d55'}" stroke-width="3" stroke-dasharray="7 7"/><path d="M${end-9} ${y-6}L${end} ${y}L${end-9} ${y+6}" fill="none" stroke="${ink}" stroke-width="2"/>`;
    for(let i=0;i<count;i++){const u=(phase+i/count)%1;f+=image('molecule_'+molecule,start+(end-start-45)*u,y-12,45,24,`data-flux="${name}-${molecule}-${i}"`);}
   }
   f+=`<text x="45" y="${y+28}" fill="${ink}" font-size="13" font-family="system-ui">${input==='co2'?'CO₂ →':'O₂ →'}</text><text x="674" y="${y+28}" fill="${ink}" text-anchor="end" font-size="13" font-family="system-ui">${output==='o2'?'→ O₂':'→ CO₂'}</text>`;
   f+=image(name==='photo'?'chloroplast_active':'molecule_glucose',316,y-20,88,42);
   if(!active)f+=`<text x="360" y="${y+31}" fill="${ink}" text-anchor="middle" font-size="12" font-family="system-ui">${safe(t('photoStopped'))}</text>`;
   return f+'</g>';
  }
  h+=flux('photo',r.gross,185,'co2','o2')+flux('resp',r.respiration,301,'o2','co2');
  if(settings.light>0){const phase=motionPreference.matches?0:time*(.4+settings.light/100);for(let i=0;i<3;i++){const u=(phase+i/3)%1;h+=`<circle data-photon="${i}" cx="${110+200*u}" cy="${85+42*u}" r="5" fill="#f3c94e" stroke="#a97a1f"/>`;}}
  h+=`<rect x="70" y="383" width="580" height="38" rx="9" fill="${panel}" opacity=".96"/><text x="360" y="407" text-anchor="middle" fill="${ink}" font-size="15" font-family="system-ui">${safe(t(Math.abs(r.net)<1e-10?'netZero':r.net>0?'netOut':'netIn'))}</text>`;
  $('scene-description').textContent=t('cycleVisualNote')+' '+t('soilNote');$('scene-caption').textContent=t('cycleVisualNote');
 }else{
  h='<rect width="720" height="440" fill="#e9eedf"/><path d="M0 373H720V440H0Z" fill="#d2d9bd"/><path d="M0 373H720" stroke="#a8b59b"/>';
  // The lamp and tube share the native 256x320 apparatus frame at scale 1.
  h+='<g transform="translate(65,100)">';for(const id of ['lamp_base','lamp_arm','lamp_head',settings.light>0?'lamp_bulb_on':'lamp_bulb_off'])h+=image(id,0,0,256,256);h+='</g>';
  if(settings.light>0)h+=image(settings.color==='white'?'beam_bright':'beam_'+settings.color,127,206,256,170,`opacity="${.25+.6*settings.light/100}" transform="rotate(-35 255 206)"`);
  if(settings.color!=='white'&&settings.light>0)h+=image('filter_'+settings.color,210,203,91,71);
  h+='<g transform="translate(265,65)">';
  for(const id of ['beaker_back','beaker_water','waterweed_a','funnel_inverted','tube_back'])h+=image(id,0,0,256,320);
  h+=`<defs><clipPath id="gas-clip"><rect x="112" y="68" width="32" height="${11*r.collected}"/></clipPath></defs>`+image('tube_gas',0,0,256,320,'clip-path="url(#gas-clip)"');
  if(playing&&r.collection>0)for(const b of bubbles.slice(0,Math.max(1,Math.ceil(r.collection*20))))h+=image('bubble_small',b.x,270-((time*r.collection*60+b.y)%105),15,15,'class="bubble"');
  for(const id of ['tube_front','beaker_front'])h+=image(id,0,0,256,320);h+='</g>';
  h+=`<path d="M407 ${133+11*r.collected}H500" stroke="#386548" stroke-width="1.5"/><rect x="493" y="${116+11*r.collected}" width="146" height="34" rx="6" fill="#fffdf7"/><text x="504" y="${138+11*r.collected}" font-family="system-ui" font-size="15" fill="#355540">${fmt(r.collected)} mL O₂</text>`;
  $('scene-description').textContent=t('sceneLab');$('scene-caption').textContent=t('bubbleNote');
 }
 $('scene-title').textContent=t(mode==='cycle'?'cycle':'lab');$('scene-art').innerHTML=h;
 $('clock').textContent=fmt(time,1)+' min';$('scene-condition').textContent=conditions(settings);
}
function live(){
 const r=at(settings,time);
 $('collected').innerHTML=fmt(r.collected)+' <small>mL</small>';
 $('gross').innerHTML=fmt(r.gross,4)+' <small>mL/min</small>';
 $('resp').innerHTML=fmt(r.respiration,4)+' <small>mL/min</small>';
 $('net').innerHTML=(r.net>0?'+':'')+fmt(r.net,4)+' <small>mL/min</small>';
 $('play').textContent=t(playing?'pause':'play');$('status').textContent=t(time>=DURATION?'complete':playing?'running':'ready');
 $('record').disabled=time===0;scene();renderGraph();liveTable();
}
function leaf(){
 document.querySelectorAll('[data-zoom]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.zoom===zoom)));
 $('leaf-heading').textContent=t(zoom+'View');$('leaf-text').innerHTML=renderRich(t(zoom+'Text'));
 if(zoom==='plant')$('leaf-art').innerHTML=`<div class="plant-stack" role="img" aria-label="${safe(t('plantAlt'))}">${['pot_cutaway','roots_mature','soil_top_wet','plant_mature'].map(id=>`<img src="assets/${id}.png" alt="">`).join('')}</div>`;
 else $('leaf-art').innerHTML=`<img src="assets/${zoom==='leaf'?'leaf_cross_section.png':'chloroplast_active.svg'}" alt="${safe(t(zoom==='leaf'?'leafAlt':'chloroAlt'))}">`;
}
function atoms(){
 for(const key of ['co2','water','sugar','oxygen']){const card=document.querySelector(`[data-molecule="${key}"]`);card.querySelector('b').textContent=atomState[key]+' × '+({co2:'CO₂',water:'H₂O',sugar:'C₆H₁₂O₆',oxygen:'O₂'}[key]);card.classList.toggle('empty-stock',atomState[key]===0);card.dataset.count=atomState[key];}
 const names=['CO₂','H₂O',t('glucoseName')+' (C₆H₁₂O₆)','O₂'];
 $('molecules').innerHTML=['co2','water','sugar','oxygen'].map((k,i)=>`<tr><th scope="row">${names[i]}</th><td>${atomState[k]}</td></tr>`).join('');
 const a=totals(atomState);$('atom-audit').innerHTML=['C','H','O'].map((k,i)=>`<tr><th scope="row">${t(['carbon','hydrogen','oxygenAtoms'][i])}</th><td>${atomStart[k]}</td><td>${a[k]}</td></tr>`).join('');
 const lit=$('atom-light').checked,limited=atomState.co2<6||atomState.water<6;
 $('build').disabled=!lit||limited;$('atom-status').textContent=t(!lit?'atomDark':limited?'atomLimited':'atomReady');
}
function resetAtoms(){atomState=makeAtoms($('atom-co2').value,$('atom-water').value);$('atom-co2').value=atomState.co2;$('atom-water').value=atomState.water;atomStart=totals(atomState);atoms();}
function header(id,keys){$(id).innerHTML='<tr>'+keys.map(k=>`<th scope="col">${safe(t(k))}</th>`).join('')+'</tr>';}
function liveTable(){header('data-head',['timeLabel','volumeLabel','rate']);$('data-body').innerHTML=series(settings,time).map(r=>`<tr><th scope="row">${fmt(r.time)}</th><td>${fmt(r.collected)}</td><td>${fmt(r.collection,3)}</td></tr>`).join('');}
function historyTable(){
 header('history-head',['trial','settings','timeLabel','volumeLabel','rate','seedColumn']);
 $('history-body').innerHTML=records.map(r=>`<tr><th scope="row">${r.id}</th><td>${safe(conditions(r.settings))}</td><td>${fmt(r.time)}</td><td>${fmt(at(r.settings,r.time).collected)}</td><td>${fmt(at(r.settings,r.time).collection,3)}</td><td>${r.seed}</td></tr>`).join('');
 $('no-records').hidden=records.length>0;$('saved').textContent=savedMessage?t(savedMessage):'';
 $('trial-legend').innerHTML=records.map((r,i)=>`<span class="trial-key" style="border-color:${palette[(i+1)%palette.length]}">${safe(t('trial'))} ${r.id} · ${safe(conditions(r.settings))} · ${fmt(r.time,1)} min</span>`).join('');
 $('download').disabled=records.length===0;$('clear').disabled=records.length===0;
}
function allSeries(){return [{id:'current',label:t('current')+' #'+trialId,settings,time,seed},...($('compare').checked?records.map(r=>({...r,label:t('trial')+' '+r.id})):[])];}
function pointText(r,p){return t('point',{trial:r.label,time:fmt(p.time),volume:fmt(p.collected)});}
function renderGraph(){
 const data=allSeries();
 function svg(prefix){let h=`<div class="graph-wrap"><svg viewBox="0 0 760 330" role="group" aria-label="${safe(t('graphTitle'))}"><title>${safe(t('graphTitle'))}</title>`;
 for(let y=0;y<=4;y++)h+=`<path d="M65 ${270-y*55}H715" stroke="#dce2d1"/><text x="51" y="${274-y*55}" text-anchor="end">${y}</text>`;
 for(let m=0;m<=10;m+=2)h+=`<text x="${65+m*65}" y="293" text-anchor="middle">${m}</text>`;
 h+=`<path d="M65 50V270H715" fill="none" stroke="#8c9c80"/><text x="390" y="321" text-anchor="middle">${safe(t('timeLabel'))}</text><text transform="translate(17 165) rotate(-90)" text-anchor="middle">${safe(t('volumeLabel'))}</text>`;
 data.forEach((r,i)=>{const points=series(r.settings,r.time),color=palette[i%palette.length];h+=`<path d="${points.map((p,j)=>(j?'L':'M')+(65+p.time*65)+','+(270-p.collected*55)).join(' ')}" fill="none" stroke="${color}" stroke-width="${i===0?3:2}" ${i?'stroke-dasharray="6 5"':''}/>`;
 for(const [j,p]of points.entries())h+=`<circle id="${prefix}-${i}-${j}" data-series="${i}" data-point="${j}" cx="${65+p.time*65}" cy="${270-p.collected*55}" r="${selected?.id===r.id&&Math.abs(selected.time-p.time)<1e-8?7:5}" fill="${i===0?color:'#fffdf7'}" stroke="${color}" role="button" tabindex="0" aria-label="${safe(pointText(r,p))}"/>`;});
 return h+'</svg></div>';}
 const choices=data.flatMap((r,i)=>series(r.settings,r.time).map((p,j)=>`<option value="${i}:${j}" ${selected?.id===r.id&&Math.abs(selected.time-p.time)<1e-8?'selected':''}>${safe(pointText(r,p))}</option>`)).join('');
 for(const id of ['point-picker','large-point-picker'])$(id).innerHTML=choices;
 $('inline-graph').innerHTML=svg('g');if($('graph-dialog').open)$('large-graph').innerHTML=svg('lg');
 if(selected){const r=data.find(r=>r.id===selected.id);if(r){const p=at(r.settings,selected.time);$('point-readout').textContent=pointText(r,p);$('large-readout').textContent=pointText(r,p);}else{$('point-readout').textContent='';$('large-readout').textContent='';selected=null;}}
}
function selectPoint(node){if(!node.matches('[data-series]'))return;playing=false;const r=allSeries()[Number(node.dataset.series)],p=series(r.settings,r.time)[Number(node.dataset.point)],id=node.id;selected={id:r.id,time:p.time};$('play').textContent=t('play');$('status').textContent=t('ready');renderGraph();document.getElementById(id)?.focus();}
for(const id of ['inline-graph','large-graph']){$(id).addEventListener('click',e=>selectPoint(e.target));$(id).addEventListener('keydown',e=>{if(e.target.matches('[data-series]')&&['Enter',' '].includes(e.key)){e.preventDefault();selectPoint(e.target);}});}
for(const [id,prefix] of [['point-picker','g'],['large-point-picker','lg']]){
 $(id).addEventListener('focus',()=>{playing=false;$('play').textContent=t('play');$('status').textContent=t('ready');});
 $(id).addEventListener('change',()=>{const [i,j]=$(id).value.split(':');const point=document.getElementById(`${prefix}-${i}-${j}`);if(point)selectPoint(point);$(id).focus();});
}
function save(){if(time<=0)return false;const duplicate=records.some(r=>r.id===trialId&&r.time===time);if(duplicate){savedMessage='duplicate';historyTable();return false;}const existing=records.find(r=>r.id===trialId);if(existing)existing.time=time;else records.push({id:trialId,settings:{...settings},time,seed});savedMessage='saved';historyTable();return true;}
function fresh(){playing=false;time=0;selected=null;trialId=nextId++;seed=(seed+1)>>>0;bubbles=bubbleOffsets();$('seed').textContent=seed;live();}
function changeSettings(){if(time>0)save();settings=normalize({light:$('light').value,co2:$('co2').value,color:$('color').value});fresh();render();}
function render(){
 // Close any definition from a previous language/view before its opener is replaced.
 document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
 $('mode-hint').innerHTML=renderRich(t('hint'+mode[0].toUpperCase()+mode.slice(1)));
 $('experiment').hidden=!['lab','cycle'].includes(mode);$('leaf-workspace').hidden=mode!=='leaf';$('atoms-workspace').hidden=mode!=='atoms';$('day-controls').hidden=mode!=='cycle';
 $('light').value=settings.light;$('co2').value=settings.co2;$('color').value=settings.color;$('light-out').textContent=fmt(settings.light,0)+'%';$('co2-out').textContent=fmt(settings.co2,0)+'%';
 $('flashcards-link').href=`flashcards.html?lang=${getLang()}`;$('seed').textContent=seed;$('motion-note').hidden=!motionPreference.matches;
 leaf();atoms();historyTable();live();
}
for(const id of ['light','co2','color'])$(id).addEventListener(id==='color'?'change':'input',changeSettings);
for(const b of document.querySelectorAll('[data-mode]'))b.addEventListener('click',()=>{playing=false;mode=b.dataset.mode;render();});
for(const b of document.querySelectorAll('[data-zoom]'))b.addEventListener('click',()=>{zoom=b.dataset.zoom;leaf();});
$('play').addEventListener('click',()=>{if(time>=DURATION)fresh();playing=!playing;last=animationNow();live();});
$('advance').addEventListener('click',()=>{playing=false;time=Math.min(DURATION,time+1);live();});
$('finish').addEventListener('click',()=>{playing=false;time=DURATION;live();});
$('reset').addEventListener('click',()=>{playing=false;time=0;selected=null;live();});
$('new-trial').addEventListener('click',()=>{if(time>0)save();fresh();});
$('record').addEventListener('click',()=>{save();renderGraph();});
$('compare').addEventListener('change',renderGraph);
$('clear').addEventListener('click',()=>{records=[];savedMessage='';selected=null;historyTable();renderGraph();});
$('day').addEventListener('click',()=>{$('light').value=75;changeSettings();});$('night').addEventListener('click',()=>{$('light').value=0;changeSettings();});
$('build').addEventListener('click',()=>{atomState=react(atomState,$('atom-light').checked);atoms();});
$('atom-reset').addEventListener('click',()=>{$('atom-co2').value=6;$('atom-water').value=6;$('atom-light').checked=true;resetAtoms();$('atom-status').textContent=t('moleculesReset');});for(const id of ['atom-co2','atom-water'])$(id).addEventListener('change',resetAtoms);$('atom-light').addEventListener('change',atoms);
$('enlarge').addEventListener('click',()=>{playing=false;$('play').textContent=t('play');$('graph-dialog').showModal();renderGraph();$('close-graph').focus();});
$('close-graph').addEventListener('click',()=>$('graph-dialog').close());$('graph-dialog').addEventListener('close',()=>$('enlarge').focus());
$('graph-dialog').addEventListener('click',e=>{if(e.target===$('graph-dialog')){const r=$('graph-dialog').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('graph-dialog').close();}});
$('copy').addEventListener('click',async()=>{const u=new URL(location.href);u.search='';for(const [k,v]of Object.entries({...settings,seed,mode,lang:getLang()}))u.searchParams.set(k,v);try{await navigator.clipboard.writeText(u.href);$('copy-status').textContent=t('copied');}catch{$('copy-status').textContent=t('copyFail')+u.href;}});
$('download').addEventListener('click',()=>{const rows=[['trial','time_min','collected_O2_mL','gross_O2_mL_per_min','respiration_O2_mL_per_min','net_O2_mL_per_min','light_relative_percent','carbon_supply_relative_percent','color','illustration_seed','model_version'],...records.flatMap(r=>series(r.settings,r.time).map(p=>[r.id,p.time,p.collected,p.gross,p.respiration,p.net,r.settings.light,r.settings.co2,r.settings.color,r.seed,VERSION]))];const data='\uFEFF'+rows.map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n'),url=URL.createObjectURL(new Blob([data],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='photosynthesis-evidence.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
let media=motionPreference;media.addEventListener('change',()=>{$('motion-note').hidden=!media.matches;});
function animate(now){if(playing){time=Math.min(DURATION,time+Math.min(.15,(now-last)/1000)*.5);if(time>=DURATION)playing=false;if(now-lastDraw>180||!playing){live();lastDraw=now;}}last=now;animationFrame(animate);}
onLangChange(render);initLab(content);animationFrame(animate);
