import {content} from './content.js';
import {initLab,onLangChange,t,getLang,renderRich} from '../kit/labs-kit.js';
import {state,year,challenge,YEAR} from './model.js';
const $=id=>document.getElementById(id),params=new URLSearchParams(location.search);
const number=(key,fallback,min,max)=>{const n=Number(params.get(key));return params.has(key)&&Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback;};
let seed=number('seed',314159,0,4294967295)>>>0,mode=['explore','compare','claim'].includes(params.get('mode'))?params.get('mode'):'explore';
let day=number('day',91.25,0,365),lat=number('lat',40,-80,80),latB=number('latB',-40,-80,80),tilt=number('tilt',23.5,0,35),surface=params.get('surface')==='ocean'?'ocean':'land';
let playing=false,timer=null,rows=[];
const fmt=(v,d=1)=>new Intl.NumberFormat(getLang()==='es'?'es-MX':'en-US',{minimumFractionDigits:d,maximumFractionDigits:d}).format(Math.abs(v)<1e-9?0:v);
const events=['mar','jun','sep','dec'],both=()=>mode!=='explore';
function sync(){const u=new URL(location.href);Object.entries({seed,mode,day,lat,latB,tilt,surface,lang:getLang()}).forEach(([k,v])=>u.searchParams.set(k,v));history.replaceState(null,'',u);}
function stop(){playing=false;clearInterval(timer);timer=null;}
function eventName(d){const i=events.findIndex((_,i)=>Math.abs(d-i*YEAR/4)<.01);return i<0?t('modelDay',{day:fmt(d,2)}):t(events[i]);}
function orbit(){
 const a=day/YEAR*Math.PI*2,x=235+155*Math.cos(a-Math.PI/2),y=150+100*Math.sin(a-Math.PI/2);
 // Oblique schematic projection: June on left; N-axis fixed rightward in screen plane.
 const px=235-155*Math.sin(a),py=150-100*Math.cos(a),r=22;
 const earth=(cx,cy,active=false)=>`<g transform="translate(${cx} ${cy})"><circle r="${r}" fill="${active?'#257b82':'#bdd8ce'}" stroke="#2c6368" stroke-width="1"/><path d="M -22 0 Q 0 12 22 0 M 0 -22 Q 15 0 0 22" fill="none" stroke="#e3eee4"/><g transform="rotate(${tilt})"><line y1="-36" y2="36" stroke="#173b47" stroke-width="2"/><text x="-4" y="-41" font-size="10" fill="#173b47">N</text></g></g>`;
 $('orbit').innerHTML=`<svg viewBox="0 0 470 310" role="img" aria-label="${t('orbitLabel')}"><ellipse cx="235" cy="150" rx="155" ry="100" fill="none" stroke="#acbfb4" stroke-dasharray="4 5"/><circle cx="235" cy="150" r="32" fill="#f2bb50"/><circle cx="235" cy="150" r="42" fill="none" stroke="#e8cd8f"/><text x="235" y="155" text-anchor="middle" font-size="12" fill="#583b11">${t('sun')}</text>${[[235,50],[80,150],[235,250],[390,150]].map(([x,y])=>earth(x,y)).join('')}<line x1="235" y1="150" x2="${px}" y2="${py}" stroke="#d9b267" stroke-dasharray="4 4"/>${earth(px,py,true)}<text x="235" y="12" text-anchor="middle" font-size="10" fill="#50676b">${t('mar')}</text><text x="32" y="201" text-anchor="middle" font-size="10" fill="#50676b">${t('jun')}</text><text x="235" y="303" text-anchor="middle" font-size="10" fill="#50676b">${t('sep')}</text><text x="425" y="201" text-anchor="middle" font-size="10" fill="#50676b">${t('dec')}</text></svg>`;
 // Fixed orientation is projected and schematic; tilt magnitude is represented by the numeric control, not axis length.
}
const headings=()=>['place','event','daylight','noonAngle','energy','temperature','tilt','surface'];
function tableHead(){return '<thead><tr>'+headings().map(k=>`<th scope="col">${t(k)}${k==='daylight'?' (h)':k==='noonAngle'?' (°)':k==='energy'?' ('+t('energyUnit')+')':k==='temperature'?' (°C)':''}</th>`).join('')+'</tr></thead>';}
function tableRow(s,label){return `<tr><td>${label} · ${fmt(s.latitude,1)}°</td><td>${eventName(s.day)}</td><td>${fmt(s.daylight)}</td><td>${fmt(s.noonAngle)}</td><td>${fmt(s.energy)}</td><td>${fmt(s.temperature)}</td><td>${fmt(s.tilt)}°</td><td>${t(s.surface)}</td></tr>`;}
function readings(){const places=[[lat,'a'],...(both()?[[latB,'b']]:[])];
 $('readings').innerHTML=places.map(([l,name])=>{const s=state(l,day,tilt,surface);return `<div class="reading-row"><h3 class="reading-title">${t(name)} · ${fmt(l,1)}° · ${eventName(day)}</h3><div class="metrics">${[['daylight',s.daylight,'hours'],['noonAngle',s.noonAngle,'degrees'],['energy',s.energy,'energyUnit'],['temperature',s.temperature,'tempUnit']].map(([k,v,u])=>`<div class="stat"><span class="label">${t(k)}</span><span class="value">${fmt(v)}</span><span class="unit">${t(u)}</span></div>`).join('')}</div></div>`;}).join('');
 $('annual-table').innerHTML=tableHead()+'<tbody>'+events.flatMap((_,i)=>places.map(([l,n])=>tableRow(state(l,i*YEAR/4,tilt,surface),t(n)))).join('')+'</tbody>';
}
function graph(){const metric=$('metric').value,ys=year(lat,tilt,surface).values,bs=both()?year(latB,tilt,surface).values:[];
 const values=[...ys,...bs].map(s=>s[metric]);let lo=metric==='temperature'?Math.floor(Math.min(-1,...values)/5)*5:0,hi=metric==='daylight'?24:metric==='energy'?Math.ceil(Math.max(...values)/10)*10:Math.ceil(Math.max(1,...values)/5)*5;
 if(hi===lo)hi=lo+1;const X=d=>55+d/YEAR*670,Y=v=>255-(v-lo)/(hi-lo)*210;
 const path=data=>data.filter((_,i)=>i%8===0||i===data.length-1).map((s,i)=>(i?'L':'M')+X(s.day).toFixed(2)+' '+Y(s[metric]).toFixed(2)).join(' ');
 $('graph').innerHTML=`<svg viewBox="0 0 760 310" role="img" aria-label="${t(metric)}. ${t('chartDesc')}"><text x="55" y="21" font-size="12" fill="#50676b">${t(metric)} (${metric==='daylight'?'h':metric==='energy'?t('energyUnit'):'°C'})</text>${Array.from({length:5},(_,i)=>{let v=lo+(hi-lo)*i/4;return `<line x1="55" x2="725" y1="${Y(v)}" y2="${Y(v)}" stroke="#dce5dd"/><text x="45" y="${Y(v)+4}" text-anchor="end" font-size="11" fill="#50676b">${fmt(v,0)}</text>`;}).join('')}<path d="${path(ys)}" fill="none" stroke="#086b70" stroke-width="3"/>${bs.length?`<path d="${path(bs)}" fill="none" stroke="#bd5725" stroke-width="3" stroke-dasharray="8 5"/>`:''}<line x1="${X(day)}" x2="${X(day)}" y1="40" y2="255" stroke="#173b47" stroke-width="1"/>${events.map((e,i)=>`<text x="${X(i*YEAR/4)}" y="279" text-anchor="${i===0?'start':'middle'}" font-size="10" fill="#50676b">${t(e)}</text>`).join('')}<text x="55" y="302" font-size="11" fill="#086b70">— ${t('a')} ${fmt(lat,0)}°</text>${both()?`<text x="265" y="302" font-size="11" fill="#a94b20">- - ${t('b')} ${fmt(latB,0)}°</text>`:''}</svg>`;
}
function render(){
 $('latitude').value=lat;$('latitude-b').value=latB;$('tilt').value=tilt;$('date').value=day;$('surface').value=surface;
 $('latitude-value').textContent=fmt(lat,1)+'°';$('latitude-b-value').textContent=fmt(latB,1)+'°';$('tilt-value').textContent=fmt(tilt,1)+'°';$('date-value').textContent=eventName(day);
 $('date').setAttribute('aria-valuetext',eventName(day));$('seed-value').textContent=seed;$('mode-hint').innerHTML=renderRich(t(mode+'Hint'));
 $('compare-control').hidden=!both();$('challenge-note').hidden=mode!=='claim';$('challenge-note').textContent=t('challengeNote',{seed,lat:challenge(seed).latitude});
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===mode));document.querySelectorAll('[data-day]').forEach(b=>b.setAttribute('aria-pressed',Math.abs(Number(b.dataset.day)-day)<.01));
 $('play').textContent=t(playing?'pause':'play');$('play').setAttribute('aria-pressed',playing);$('play-status').textContent=t(playing?'running':day===YEAR?'complete':'paused');
 $('flashcards-link').href='flashcards.html?lang='+getLang();$('empty').hidden=rows.length>0;$('download').disabled=!rows.length;
 $('history-table').innerHTML=rows.length?tableHead()+'<tbody>'+rows.map(s=>tableRow(s,t(s.place))).join('')+'</tbody>':'';
 orbit();readings();graph();sync();
}
for(const [id,key] of [['latitude','lat'],['latitude-b','latB'],['tilt','tilt'],['date','day']])$(id).addEventListener('input',e=>{stop();const v=Number(e.target.value);if(key==='lat')lat=v;if(key==='latB')latB=v;if(key==='tilt')tilt=v;if(key==='day')day=v;render();});
$('surface').addEventListener('change',()=>{stop();surface=$('surface').value;render();});$('metric').addEventListener('change',graph);
const beginChallenge=()=>{const c=challenge(seed);lat=c.latitude;latB=c.opposite;day=c.day;tilt=c.tilt;surface='land';mode='claim';};
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{stop();mode=b.dataset.mode;if(mode==='claim')beginChallenge();render();}));
document.querySelectorAll('[data-day]').forEach(b=>b.addEventListener('click',()=>{stop();day=Number(b.dataset.day);render();}));
$('play').addEventListener('click',()=>{if(playing){stop();render();return;}if(day>=YEAR)day=0;playing=true;timer=setInterval(()=>{day=Math.min(YEAR,day+1.25);if(day>=YEAR)stop();render();},100);render();});
$('reset').addEventListener('click',()=>{stop();day=0;$('utility-status').textContent='';render();});
$('new-trial').addEventListener('click',()=>{stop();seed=(seed+1)>>>0;beginChallenge();render();});
$('record').addEventListener('click',()=>{rows.push({...state(lat,day,tilt,surface),place:'a',seed},...(both()?[{...state(latB,day,tilt,surface),place:'b',seed}]:[]));render();$('record-status').textContent=t('recorded',{n:rows.length});});
$('download').addEventListener('click',()=>{const columns=['place','latitude_deg','day_since_March_equinox','tilt_deg','surface','daylight_h','noon_angle_deg','solar_MJ_m2_day','temperature_anomaly_C','challenge_seed'];const values=rows.map(s=>[s.place,s.latitude,s.day,s.tilt,s.surface,s.daylight,s.noonAngle,s.energy,s.temperature,s.seed]);const csv='\uFEFF'+[columns,...values].map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='seasonal-changes-evidence.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);$('utility-status').textContent=t('downloaded');});
$('copy-link').addEventListener('click',async()=>{sync();try{await navigator.clipboard.writeText(location.href);$('utility-status').textContent=t('copied');}catch{$('utility-status').textContent=t('copyFail');}});
// The shared popover is closed on language changes to avoid showing a stale-language definition.
onLangChange(()=>{const pop=document.querySelector('.lk-pop');if(pop)pop.hidden=true;document.querySelectorAll('.lk-term[aria-expanded=true]').forEach(b=>b.setAttribute('aria-expanded','false'));$('utility-status').textContent='';$('record-status').textContent='';render();});
initLab(content);
