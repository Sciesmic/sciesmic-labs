import {content} from './content.js';
import {initLab,onLangChange,t,renderRich,getLang} from '../kit/labs-kit.js';
import {OBJECTS,simulate,challenge,settings} from './model.js';
const $=id=>document.getElementById(id),q=new URLSearchParams(location.search),ids=Object.keys(OBJECTS);
let seed=Number(q.get('seed')??42)>>>0,mode=['compare','experiment','challenge'].includes(q.get('mode'))?q.get('mode'):'compare';
let p=settings({a:q.get('a')??'feather',b:q.get('b')??'bowling',height:q.has('height')?q.get('height'):10,environment:q.get('environment')});
if(mode==='challenge')p=challenge(seed);
let trials=[],time=0,observed=0,playing=false,started=false,raf=0,last=0,historyRows=[],recorded=false,run=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt=(n,d=3)=>Number(n).toLocaleString(getLang()==='es'?'es-MX':'en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const name=id=>t(id),env=e=>t(e),safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function url(){const u=new URL(location.href);for(const[k,v]of Object.entries({...p,mode,seed,lang:getLang()}))u.searchParams.set(k,v);return u;}
function syncURL(){window.history.replaceState(null,'',url());}
function build(){trials=(mode==='compare'?['air','vacuum']:[p.environment]).map(environment=>simulate({...p,environment}));}
const duration=()=>Math.max(...trials.map(r=>r.duration));
function stop(){playing=false;cancelAnimationFrame(raf);last=0;}
function reset(){stop();time=0;observed=0;started=false;recorded=false;run++;$('record-status').textContent='';$('challenge-feedback').textContent='';build();render();}
const ART={feather:{file:'feather',w:160,h:64,cx:80,cy:32,scale:.34},bowling:{file:'bowling_ball',w:96,h:96,cx:48,cy:50,scale:.42},basketball:{file:'basketball',w:96,h:96,cx:48,cy:50,scale:.42},paper:{file:'paper_flat',w:160,h:64,cx:81,cy:34,scale:.34},crumpled:{file:'paper_crumpled',w:96,h:96,cx:49,cy:50,scale:.48}};
function icon(id){const a=ART[id];return `<image class="object-art" data-object="${id}" href="assets/${a.file}.png" x="${-a.cx*a.scale}" y="${-a.cy*a.scale}" width="${a.w*a.scale}" height="${a.h*a.scale}"/>`;}
function drawChambers(){
 $('chambers').style.gridTemplateColumns=trials.length===1?'minmax(0,1fr)':'';
 $('chambers').innerHTML=trials.map(r=>{const e=r.settings.environment;
 const ticks=[0,.25,.5,.75,1].map(u=>`<line x1="88" x2="214" y1="${85+u*305}" y2="${85+u*305}" stroke="#63564b" stroke-opacity="${u===1?.65:.2}" ${u===1?'stroke-dasharray="3 3"':''}/><text x="79" y="${89+u*305}" text-anchor="end" font-size="11" fill="#536b66">${fmt(p.height*(1-u),1)}</text>`).join('');
 const layer=file=>`<image href="assets/${file}.png" x="50" y="0" width="200" height="480" class="chamber-art"/>`;
 return `<article class="chamber ${e}"><h3>${env(e)} · ${fmt(p.height,0)} m</h3><svg class="drop-svg" viewBox="0 0 300 485" role="img" aria-label="${safe(env(e)+' · '+t('aLabel')+': '+name(p.a)+' · '+t('bLabel')+': '+name(p.b))}"><text x="79" y="65" text-anchor="end" font-size="11" fill="#536b66">m</text>${layer('drop_chamber_back')}${ticks}${r.objects.map((o,i)=>{const st=o.at(time),u=p.height?st.distance/p.height:1,y=85+u*305,x=122+i*56;return `<path d="M${x} 85V${y}" stroke="#63564b" stroke-opacity=".65" stroke-width="1" ${i?'stroke-dasharray="4 3"':''}/><g class="falling-object" data-lane="${i?'b':'a'}" data-height="${st.height}" transform="translate(${x},${y})">${icon(o.id)}<circle r="1.6" fill="#fff" stroke="#2a201d" stroke-width=".6"/></g>`;}).join('')}${e==='air'?layer('drop_chamber_air'):''}${layer('drop_chamber_front')}${layer(e==='air'?'drop_chamber_needle':'drop_chamber_needle_vacuum')}<text x="122" y="62" text-anchor="middle" font-size="11" fill="#2a201d">A</text><text x="178" y="62" text-anchor="middle" font-size="11" fill="#2a201d">B</text></svg><div class="chamber-times">${r.objects.map((o,i)=>`<span><b>${i?'B':'A'} · ${safe(name(o.id))}</b><br>${t('fallTime')}<strong>${started&&time>=o.duration?fmt(o.duration)+' s':'—'}</strong></span>`).join('')}</div></article>`;
 }).join('');
}
function table(head,rows){return `<thead><tr>${head.map(v=>`<th scope="col">${safe(v)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(v=>`<td>${safe(v)}</td>`).join('')}</tr>`).join('')}</tbody>`;}
function drawReadings(){const rows=[];trials.forEach(r=>r.objects.forEach((o,i)=>{const s=o.at(time);rows.push([env(r.settings.environment),(i?'B · ':'A · ')+name(o.id),fmt(o.mass),fmt(s.height),fmt(s.speed),fmt(s.weight,4),fmt(s.drag,4),fmt(s.net,4),fmt(s.acceleration),t(started&&s.impact?'landed':!started?'waiting':'falling')]);}));
 $('readings').innerHTML=table(['chamber','object','mass','position','speed','weight','drag','net','acceleration','state'].map(t),rows);
}
function graph(){const d=Math.max(.5,observed),h=Math.max(1,p.height),X=x=>60+730*x/d,Y=y=>250-215*y/h;
 let svg='';for(let j=0;j<=4;j++){const y=j*h/4,x=j*d/4;svg+=`<line x1="60" x2="790" y1="${Y(y)}" y2="${Y(y)}" stroke="#dbe5df"/><text x="48" y="${Y(y)+4}" text-anchor="end" font-size="12" fill="#536b66">${fmt(y,1)}</text><text x="${X(x)}" y="274" text-anchor="middle" font-size="12" fill="#536b66">${fmt(x,2)}</text>`;}
 svg+='<text x="16" y="20" font-size="12">m</text><text x="805" y="292" font-size="12">s</text>';
 const rows=[],times=new Set([0]);if(observed>0){for(let j=1;j<=10;j++)times.add(observed*j/10);trials.forEach(r=>r.objects.forEach(o=>{if(o.duration<=observed)times.add(o.duration);}));}
 trials.forEach(r=>r.objects.forEach((o,i)=>{const end=Math.min(observed,o.duration),points=Array.from({length:101},(_,j)=>{const x=end*j/100;return `${X(x)},${Y(o.at(x).height)}`;}).join(' ');svg+=`<polyline points="${points}" fill="none" stroke="${r.settings.environment==='air'?'#086e72':'#a95018'}" stroke-width="${i?2.5:3}" ${i?'stroke-dasharray="8 6"':''}/>`;}));
 $('graph').innerHTML=svg;
 [...times].sort((a,b)=>a-b).forEach(x=>rows.push([fmt(x),...trials.flatMap(r=>r.objects.map(o=>fmt(o.at(x).height)))]));
 $('samples').innerHTML=table([t('sampleTime'),...trials.flatMap(r=>r.objects.map((o,i)=>env(r.settings.environment)+' '+(i?'B':'A')+' (m)'))],rows);
}
function live(){const done=started&&observed>=duration();$('clock').textContent=fmt(time)+' s';$('timeline').max=observed;$('timeline').value=time;$('timeline').disabled=!started;
 $('status').textContent=t(!started?'ready':playing?'running':done&&time>=duration()?'finished':'paused');$('play').textContent=t(playing?'pause':started?'resume':'release');$('play').disabled=done&&time>=duration();$('step').disabled=done&&time>=duration();$('record').disabled=!done||recorded;$('guess').disabled=started;
 $('zero-note').hidden=p.height!==0;drawChambers();drawReadings();graph();
 if(done&&mode==='challenge')$('challenge-feedback').textContent=t($('guess').value===trials[0].winner?'correctGuess':'wrongGuess')+' '+t(trials[0].winner);
}
function render(){document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===mode));$('mode-hint').innerHTML=renderRich(t(mode+'Hint'));
 ['a','b'].forEach(k=>{$(k).innerHTML=ids.map(id=>`<option value="${id}">${name(id)}</option>`).join('');$(k).value=p[k];$(k).disabled=mode==='challenge';});$('height').value=p.height;$('height').disabled=mode==='challenge';$('environment').value=p.environment;$('environment').disabled=mode==='challenge';$('environment-control').hidden=mode==='compare';$('challenge-panel').hidden=mode!=='challenge';$('seed').textContent=seed;$('flashcards-link').href=`flashcards.html?lang=${getLang()}`;syncURL();live();drawHistory();}
function advance(dt){started=true;time=Math.min(duration(),time+dt);observed=Math.max(observed,time);if(time>=duration())stop();live();}
function tick(ts){if(!playing)return;if(!last)last=ts;let dt=Math.min(.1,(ts-last)/1000);if(reduced){if(ts-last<250){raf=requestAnimationFrame(tick);return;}dt=.25;}last=ts;advance(dt);if(playing)raf=requestAnimationFrame(tick);}
$('play').onclick=()=>{if(playing){stop();live();}else{playing=true;started=true;last=0;raf=requestAnimationFrame(tick);live();}};
$('step').onclick=()=>{stop();advance(.25);};$('reset').onclick=reset;
$('timeline').oninput=()=>{stop();time=Number($('timeline').value);live();};
['a','b','height','environment'].forEach(k=>$(k).addEventListener('change',()=>{p=settings({...p,[k]:$(k).value});reset();}));
for(const b of document.querySelectorAll('[data-mode]'))b.onclick=()=>{mode=b.dataset.mode;if(mode==='challenge')p=challenge(seed);reset();};
$('new-trial').onclick=()=>{seed=(seed+1)>>>0;p=challenge(seed);reset();};
$('record').onclick=()=>{if(observed<duration()||recorded)return;trials.forEach(r=>r.objects.forEach((o,i)=>historyRows.push({trial:run,environment:r.settings.environment,object:o.id,lane:i?'B':'A',height:p.height,mass:o.mass,time:o.duration,speed:o.impact.speed})));recorded=true;$('record-status').textContent=t('saved');live();drawHistory();};
function drawHistory(){$('history').innerHTML=table(['trial','chamber','object','height','mass','fallTime','impactSpeed'].map(t),historyRows.map(r=>[r.trial,env(r.environment),r.lane+' · '+name(r.object),fmt(r.height,1),fmt(r.mass),fmt(r.time),fmt(r.speed)]));$('download').disabled=!historyRows.length;}
$('clear').onclick=()=>{historyRows=[];drawHistory();$('record-status').textContent=t('cleared');};
$('download').onclick=()=>{const head=['trial','environment','object','lane','height_m','mass_kg','fall_time_s','impact_speed_m_s'];const quote=x=>'"'+String(x).replaceAll('"','""')+'"';const rows=historyRows.map(r=>[r.trial,r.environment,r.object,r.lane,r.height,r.mass,r.time,r.speed]);const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\uFEFF'+[head,...rows].map(row=>row.map(quote).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));a.download='gravity-drop-evidence.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(url().href);$('copy-status').textContent=t('copied');}catch{$('copy-status').textContent=t('copyFallback')+' '+url().href;}};
// Close active definition before language changes so its text cannot become stale.
document.addEventListener('click',e=>{if(e.target.closest('[data-lang]'))document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));},true);
build();onLangChange(render);initLab(content);
