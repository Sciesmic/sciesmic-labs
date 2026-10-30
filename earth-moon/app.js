import {createGraphTools} from '../kit/graph-tools.js';
import {content} from './content.js';
import {initLab,onLangChange,t,renderRich,getLang} from '../kit/labs-kit.js';
import {state,settings,series,challenge,MONTH,RM} from './model.js';
const $=id=>document.getElementById(id),query=new URLSearchParams(location.search),safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let seed=Number(query.get('seed')??42)>>>0,mode=['phases','eclipses','challenge'].includes(query.get('mode'))?query.get('mode'):'phases';
let p=settings(Object.fromEntries(['day','tilt','node','distance'].filter(k=>query.has(k)).map(k=>[k,query.get(k)]))),hemisphere=query.get('hemisphere')==='south'?'south':'north';
if(mode==='challenge')p=challenge(seed);
const sharedGraph=createGraphTools(document.getElementById('graph'));
let rows=[],revealed=false,playing=false,last=0,raf=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt=(n,d=2)=>Number(n).toLocaleString(getLang()==='es'?'es-MX':'en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const img=(file,x,y,w,h=w,extra='')=>`<image href="assets/${file}.png" x="${x}" y="${y}" width="${w}" height="${h}" ${extra}/>`;
function url(){const u=new URL(location.href);Object.entries({...p,hemisphere,mode,seed,lang:getLang()}).forEach(([k,v])=>u.searchParams.set(k,v));return u;}
function stop(){playing=false;cancelAnimationFrame(raf);last=0;}
function orbit(s){const x=320+s.x/s.distance*228,y=320+s.y/s.distance*228;
 $('orbit').innerHTML=`<svg viewBox="0 0 640 640" role="img" aria-label="${safe(t('spaceView')+' · '+t(s.phaseId)+' · '+t('latitude')+': '+fmt(s.latitude)+'°')}">${img('orbit_view_base',0,0,640)}<line x1="320" y1="320" x2="${x}" y2="${y}" stroke="#776c57" stroke-width="2" stroke-dasharray="7 7"/>${img('earth_topdown',248,248,144)}${img('moon_topdown',x-32,y-32,64)}<text x="26" y="30" fill="#2a201d" font-size="17">${safe(t('sunlight'))}</text><text x="320" y="414" text-anchor="middle" font-size="18" fill="#2a201d">${safe(t('earth'))}</text><circle cx="${x}" cy="${y}" r="26" fill="none" stroke="#b05b16" stroke-width="2"/></svg>`;
}
function moon(s,hide){if(hide){$('moon-view').innerHTML=`<p class="concealed">${t('hiddenView')}</p>`;return;}
 const r=92,c=1-2*s.fraction,q=Math.acos(Math.max(-1,Math.min(1,c))),wax=s.y>=0,limb=wax?1:0,term=(q<Math.PI/2?0:1)^(wax?0:1),rx=Math.max(.0001,r*Math.abs(c));
 const disc='M128 36 A92 92 0 1 1 128 220 A92 92 0 1 1 128 36 Z';
 const lit=s.fraction<1e-10?'':s.fraction>1-1e-10?disc:`M128 36 A92 92 0 0 ${limb} 128 220 A${rx} 92 0 0 ${term} 128 36 Z`;
 let dark=s.fraction<1e-10?disc:s.fraction>1-1e-10?'':disc+' '+lit;
 let shadow='';if(s.x>0&&s.eclipse.startsWith('lunar')){const cx=128-s.y/RM*r,cy=128+s.z/RM*r;const layer=(file,rad,master)=>{const w=512*(rad/RM*r)/master;return img(file,cx-w/2,cy-w/2,w);};shadow=`<g clip-path="url(#disc)">${layer('earth_penumbra',s.penumbra,246)}${s.shadowDistance<s.umbra+RM?layer('earth_umbra',s.umbra,189):''}</g>`;}
 $('moon-view').innerHTML=`<svg viewBox="0 0 256 256" role="img" aria-label="${safe(t(s.phaseId)+' · '+fmt(s.fraction*100)+'% · '+t(s.eclipse))}"><defs><clipPath id="dark"><path d="${dark}" clip-rule="evenodd"/></clipPath><clipPath id="disc"><circle cx="128" cy="128" r="92"/></clipPath></defs><g transform="${hemisphere==='south'?'rotate(180 128 128)':''}">${img('moon_lit',0,0,256)}${dark?img('moon_dark',0,0,256,256,'clip-path="url(#dark)"'):''}${shadow}${img('moon_outline',0,0,256)}</g></svg>`;
}
function sun(s){const scale=70/s.sunRadius,w=256*(70/72)*(s.moonRadius/s.sunRadius),x=128+Math.atan2(s.y,-s.x)*scale,y=128-Math.asin(s.z/s.distance)*scale;
 $('sun-view').innerHTML=`<svg viewBox="0 0 256 256" role="img" aria-label="${safe(t('sunView')+' · '+t(s.eclipse))}"><g transform="${hemisphere==='south'?'rotate(180 128 128)':''}">${img('sun_disc',0,0,256)}${s.x<0?img('moon_silhouette',x-w/2,y-w/2,w):''}</g></svg>`;
 $('eclipse-caption').textContent=t(s.eclipse);$('tilt-art').src=`assets/orbit_tilt_${Math.abs(p.node%180)<.001||p.tilt===0?'eclipse':'miss'}.png`;$('tilt-art').alt=t('tiltCaption')+' · '+t('tiltNote');
}
const table=(heads,data)=>`<thead><tr>${heads.map(v=>`<th scope="col">${safe(v)}</th>`).join('')}</tr></thead><tbody>${data.map(row=>`<tr>${row.map(v=>`<td>${safe(v)}</td>`).join('')}</tr>`).join('')}</tbody>`;
function graph(){const ss=series(p),snapshotLabel=s=>fmt(s.tilt,1)+'° · '+fmt(s.node,0)+'° · '+fmt(s.distance,0)+' km';
 sharedGraph.update({title:t('fraction'),xLabel:t('day')+' (d)',yLabel:t('fraction')+' (%)',xMin:0,xMax:MONTH,yMin:0,yMax:100,series:[{id:'current',label:t('current')+' · '+snapshotLabel(p),points:ss.map(s=>({x:s.day,y:s.fraction*100,label:t(s.phaseId)}))},...rows.map((s,i)=>({id:'record-'+i,label:t('trial')+' '+(i+1)+' · '+snapshotLabel(s),line:false,points:[{x:s.day,y:s.fraction*100,label:t(s.phaseId)+' · '+t(s.eclipse)}]}))]});
 $('cycle-table').innerHTML=table([t('day'),t('fraction'),t('phaseLabel'),t('event')],ss.map(s=>[fmt(s.day),fmt(s.fraction*100),t(s.phaseId),t(s.eclipse)]));
}
function history(){const heads=['trial','day','tilt','node','distance','phaseLabel','fraction','event'];$('history').innerHTML=table(heads.map(t),rows.map((s,j)=>[j+1,fmt(s.day),fmt(s.tilt,1),fmt(s.node,0),fmt(s.distance,0),t(s.phaseId),fmt(s.fraction*100),t(s.eclipse)]));$('download').disabled=!rows.length;}
function live(){const s=state(p),hidden=mode==='challenge'&&!revealed;orbit(s);moon(s,hidden);sun(s);
 $('phase-name').textContent=hidden?'—':t(s.phaseId);$('phase-percent').textContent=hidden?'':fmt(s.fraction*100)+'%';
 $('day').value=p.day;$('day-value').textContent=fmt(p.day)+' / '+fmt(MONTH);$('play').textContent=t(playing?'pause':'play');$('play-status').textContent=t(playing?'running':p.day>=MONTH?'finished':'paused');
 $('readings').innerHTML=['phaseLabel','fraction','latitude','event'].map((k,j)=>`<dl class="reading"><dt>${t(k)}</dt><dd>${[t(s.phaseId),fmt(s.fraction*100)+'%',fmt(s.latitude)+'°',t(s.eclipse)][j]}</dd></dl>`).join('');
 $('evidence').hidden=hidden;$('chart-panel').hidden=hidden;$('eclipse-panel').hidden=mode!=='eclipses'&&(mode!=='challenge'||hidden);$('reveal').disabled=revealed;$('play').disabled=mode==='challenge';$('step').disabled=mode==='challenge';$('day').disabled=mode==='challenge';
 window.history.replaceState(null,'',url());
}
function render(){document.title=t('title')+' | Sciesmic Labs';$('flashcards-link').href=`flashcards.html?lang=${getLang()}`;$('mode-hint').innerHTML=renderRich(t(mode+'Hint'));
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));$('hemisphere').value=hemisphere;
 for(const k of ['tilt','node','distance']){$(k).value=p[k];$(k).disabled=mode==='challenge';$(k+'-value').textContent=fmt(p[k],k==='tilt'?1:0)+(k==='distance'?' km':'°');}
 $('phase-stops').innerHTML=['new','first-quarter','full','third-quarter'].map((id,j)=>`<button data-stop="${j}" ${mode==='challenge'?'disabled':''}>${t(id)}</button>`).join('');$('phase-stops').querySelectorAll('button').forEach(b=>b.onclick=()=>{stop();p.day=MONTH*Number(b.dataset.stop)/4;live();graph();});
 $('challenge-panel').hidden=mode!=='challenge';$('seed').textContent=seed;live();graph();history();
}
function tick(ts){if(!playing)return;if(!last)last=ts;let dt=(ts-last)/1000;if(reduced&&dt<.25){raf=requestAnimationFrame(tick);return;}last=ts;p.day=Math.min(MONTH,p.day+Math.min(dt,.5)*1.5);if(p.day>=MONTH)stop();live();graph();if(playing)raf=requestAnimationFrame(tick);}
$('play').onclick=()=>{if(playing)stop();else{if(p.day>=MONTH)p.day=0;playing=true;last=0;raf=requestAnimationFrame(tick);}live();};
$('step').onclick=()=>{stop();p.day=Math.min(MONTH,p.day+1);live();graph();};
$('reset').onclick=()=>{stop();p=mode==='challenge'?challenge(seed):settings({...p,day:0});revealed=false;$('record-status').textContent='';render();};
for(const k of ['day','tilt','node','distance'])$(k).oninput=()=>{stop();p=settings({...p,[k]:Number($(k).value)});$('record-status').textContent='';render();};
$('hemisphere').onchange=()=>{hemisphere=$('hemisphere').value;live();};
for(const b of document.querySelectorAll('[data-mode]'))b.onclick=()=>{stop();mode=b.dataset.mode;revealed=false;if(mode==='challenge')p=challenge(seed);render();};
$('reveal').onclick=()=>{revealed=true;render();};$('new-trial').onclick=()=>{stop();seed=(seed+1)>>>0;p=challenge(seed);revealed=false;$('guess').value='';render();};
$('record').onclick=()=>{rows.push(state(p));history();graph();$('record-status').textContent=t('saved');};$('clear').onclick=()=>{rows=[];history();graph();$('record-status').textContent=t('cleared');};
$('download').onclick=()=>{const quote=v=>'"'+String(v).replaceAll('"','""')+'"',heads=['record','day','tilt_deg','node_deg','distance_km','phase_id','phase_illumination_percent','eclipse_id'];const data=rows.map((s,j)=>[j+1,s.day,s.tilt,s.node,s.distance,s.phaseId,s.fraction*100,s.eclipse]);const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\uFEFF'+[heads,...data].map(row=>row.map(quote).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));a.download='earth-moon-evidence.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(url().href);$('utility-status').textContent=t('copied');}catch{$('utility-status').textContent=t('copyFallback')+' '+url().href;}};
document.addEventListener('click',e=>{if(e.target.closest('[data-lang]'))document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));},true);
onLangChange(render);initLab(content);
