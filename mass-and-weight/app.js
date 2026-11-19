import {content} from './content.js?v=1.1.0';
import {GRAVITY,MASS_OPTIONS,allPoints,measure,mysteryGravity} from './model.js?v=1.1.0';
import {initLab,onLangChange,t,getLang,renderRich} from '../kit/labs-kit.js';
import {createGraphTools} from '../kit/graph-tools.js';
import {motionPreference,animationFrame} from '../kit/motion.js';
const $=id=>document.getElementById(id),num=(n,d=2)=>new Intl.NumberFormat(getLang()==='es'?'es-MX':'en-US',{minimumFractionDigits:d,maximumFractionDigits:d}).format(n);
const url=new URL(location.href),paramSeed=url.searchParams.has('seed')?Number(url.searchParams.get('seed')):42;
let seed=Number.isSafeInteger(paramSeed)&&paramSeed>=0&&paramSeed<=4294967295?paramSeed:42;
let mode='compare',reading=null,rows=[],revealed=false,animationToken=0,statusKey='statusReady';
const graph=createGraphTools($('graph'));
$('seed').value=String(seed);
function placeName(place){return t(place==='mystery'?'mysteryPlanet':place);}
function setStatus(key){statusKey=key;$('status').textContent=t(key);}
function setMode(next){mode=next;reading=null;revealed=false;$('reveal-status').textContent='';$('record').disabled=true;render();setStatus('statusReady');}
function graphData(){
 const places=mode==='compare'?['earth','moon','mars','jupiter']:['mystery'];
 const series=places.map(place=>({id:place,label:placeName(place),line:place!=='mystery',points:place==='mystery'?rows.filter(r=>r.place==='mystery'&&r.seed===seed).map(r=>({x:r.massKg,y:r.weightN,label:`${t('trial')} ${r.index}`})):allPoints(place).map(r=>({x:r.massKg,y:r.weightN}))}));
 return {title:t('graphTitle'),xLabel:t('graphX'),yLabel:t('graphY'),xMin:0,xMax:20,yMin:0,yMax:500,series};
}
function render(){
 $('status').textContent=t(statusKey);
 if(revealed){const actual=mysteryGravity(seed),estimate=Number($('estimate').value);$('reveal-status').textContent=`${t(Math.abs(estimate-actual)<=.1?'estimateCorrect':'estimateTry')} ${t('mysteryValue',{g:num(actual)})}`;}
 $('mode-compare').setAttribute('aria-pressed',String(mode==='compare'));$('mode-mystery').setAttribute('aria-pressed',String(mode==='mystery'));
 $('mode-help').innerHTML=renderRich(t(mode==='compare'?'modeHelp':'mysteryHelp'));
 $('place').hidden=mode==='mystery';document.querySelector('label[for="place"]').hidden=mode==='mystery';$('mystery-tools').hidden=mode!=='mystery';
 const place=mode==='mystery'?'mystery':$('place').value;
 $('planet-name').textContent=placeName(place);$('planet-icon').hidden=place==='mystery';$('surface').hidden=place==='mystery';$('scene').classList.toggle('unknown',place==='mystery');
 if(place!=='mystery'){$('planet-icon').src=`assets/${place}.svg`;$('surface').src=`assets/surface_${place}.svg`;}
 const mass=Number($('mass').value),g=place==='mystery'?mysteryGravity(seed):GRAVITY[place];
 $('mass-reading').textContent=t('massReading',{m:num(mass,mass%1?1:0)});
 $('weight-reading').textContent=reading?t('weightReading',{w:num(reading.weightN)}):t('weightReading',{w:'—'});
 $('gravity-reading').textContent=place==='mystery'&&!revealed?t('hiddenGravity'):t('gravityReading',{g:num(g)});
 $('meter-value').textContent=reading?`${num(reading.weightN)} N`:'— N';
 $('force-arrow').setAttribute('aria-label',reading?`${t('arrowLabel')}: ${num(reading.weightN)} N`:t('arrowLabel'));
 $('force-arrow').style.setProperty('--force',reading?String(Math.max(.3,Math.min(1.65,reading.weightN/120))):'.3');
 $('notebook').replaceChildren(...rows.map((r)=>{const tr=document.createElement('tr');const cells=[r.index,placeName(r.place)+(r.place==='mystery'?' #'+r.seed:''),num(r.massKg,r.massKg%1?1:0),num(r.weightN),r.place==='mystery'&&(!revealed||r.seed!==seed)?'?':num(r.gravityMps2)];cells.forEach((v,i)=>{const td=document.createElement(i===0?'th':'td');td.textContent=v;if(i===0)td.scope='row';tr.append(td);});return tr;}));
 graph.update(graphData());$('seed').value=String(seed);
 const myst=rows.filter(r=>r.place==='mystery'&&r.seed===seed&&r.massKg>0),distinct=new Set(myst.map(r=>r.massKg));$('reveal').disabled=distinct.size<2||!Number.isFinite(Number($('estimate').value))||$('estimate').value==='';
}
function animateMeter(){const token=++animationToken;if(motionPreference.matches)return;const start=performance.now();function frame(){if(token!==animationToken)return;const p=Math.min(1,(performance.now()-start)/420);$('meter-value').style.opacity=String(.3+.7*p);if(p<1)animationFrame(frame);else $('meter-value').style.opacity='';}animationFrame(frame);}
$('mode-compare').onclick=()=>setMode('compare');$('mode-mystery').onclick=()=>setMode('mystery');
$('mass').onchange=()=>{reading=null;$('record').disabled=true;render();setStatus('statusReady');};
$('place').onchange=()=>{reading=null;$('record').disabled=true;render();setStatus('statusReady');};
$('measure').onclick=()=>{reading=measure(Number($('mass').value),mode==='mystery'?'mystery':$('place').value,seed);$('record').disabled=false;render();setStatus('statusMeasured');animateMeter();};
$('record').onclick=()=>{if(!reading){setStatus('statusNoRecord');return;}rows.push({...reading,seed:reading.place==='mystery'?seed:null,index:rows.length+1});$('record').disabled=true;reading=null;render();setStatus('statusSaved');};
$('clear').onclick=()=>{rows=[];reading=null;$('record').disabled=true;render();setStatus('statusCleared');};
function applySeed(n){if(!Number.isSafeInteger(n)||n<0||n>4294967295){$('seed').setCustomValidity('0–4294967295');$('seed').reportValidity();return;}$('seed').setCustomValidity('');seed=n;reading=null;revealed=false;$('record').disabled=true;$('reveal-status').textContent='';$('estimate').value='';url.searchParams.set('seed',String(seed));history.replaceState(null,'',url);render();setStatus('statusSeed');}
$('set-seed').onclick=()=>applySeed(Number($('seed').value));$('new-mystery').onclick=()=>applySeed((seed+1)>>>0);
$('share').onclick=async()=>{const link=new URL(location.href);link.searchParams.set('seed',String(seed));link.searchParams.set('lang',getLang());try{await navigator.clipboard.writeText(link.href);$('status').textContent=t('copyDone');}catch{$('status').textContent=t('copyFallback')+' '+link.href;}};
$('estimate').oninput=render;
$('reveal').onclick=()=>{const actual=mysteryGravity(seed),estimate=Number($('estimate').value);revealed=true;$('reveal-status').textContent=`${t(Math.abs(estimate-actual)<=.1?'estimateCorrect':'estimateTry')} ${t('mysteryValue',{g:num(actual)})}`;render();};
onLangChange(render);
initLab(content);
render();setStatus('statusReady');
