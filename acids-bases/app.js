import {content} from './content.js?v=1.0.2';
import {samples,testSample,dilute,neutralize,measure} from './model.js';
import {initLab,onLangChange,getLang,t,renderRich} from '../kit/labs-kit.js';
const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const params=new URLSearchParams(location.search),valid=(key,values,fallback)=>values.includes(params.get(key))?params.get(key):fallback;
const readNumber=(key,min,max,fallback)=>{const n=Number(params.get(key));return params.has(key)&&Number.isFinite(n)&&n>=min&&n<=max?n:fallback;};
let state={mode:valid('mode',['test','dilute','neutralize'],'test'),sample:valid('sample',samples.map(s=>s.id),'lemon_juice'),kind:valid('kind',['acid','base','neutral'],'acid'),water:readNumber('water',0,180,0),base:readNumber('base',0,120,0),tool:valid('tool',['probe','strip','indicator'],'probe')};
let seed=(params.get('seed')??'ph-2026').slice(0,64),trial=1,measured=false,records=[],selected=-1,timer=null,art={};
const colors=['#c22c3c','#de4b3f','#eb6b32','#ef8f32','#ecae34','#e4cb43','#92bc4a','#57a365','#409993','#3d81ad','#4c65a6','#645099','#743b8e','#623082','#542774'];
const color=p=>colors[Math.max(0,Math.min(14,Math.round(p)))];
const fmt=(n,d=1)=>new Intl.NumberFormat(getLang()==='es'?'es-MX':'en-US',{maximumFractionDigits:d}).format(n);
const scientific=n=>n.toExponential(2).replace('e',' × 10^');
const current=()=>state.mode==='test'?testSample(state.sample):state.mode==='dilute'?dilute({kind:state.kind,water:state.water}):neutralize({base:state.base});
const solutionKey=()=>state.mode==='test'?state.sample:state.mode==='dilute'?(state.kind==='neutral'?'neutralSolution':state.kind):'acid';
const added=()=>state.mode==='dilute'?state.water:state.mode==='neutralize'?state.base:0;
function syncURL(){const u=new URL(location.href);Object.entries({...state,seed,lang:getLang()}).forEach(([k,v])=>u.searchParams.set(k,v));history.replaceState(null,'',u);}
function stop(){if(timer!==null){clearInterval(timer);timer=null;}$('auto').textContent=t('run');}
function mutate(fn){stop();fn();measured=false;$('status').textContent='';render();}
function resetControls(){state.water=0;state.base=0;measured=false;}
function sprite(id,x,y,w,h,fill,level){let source=art[id]??'';if(fill){const doc=new DOMParser().parseFromString(source,'image/svg+xml');doc.querySelectorAll('.liq [fill],.liq[fill]').forEach(n=>{const dark='#'+fill.slice(1).match(/../g).map(v=>Math.round(parseInt(v,16)*.72).toString(16).padStart(2,'0')).join('');n.setAttribute('fill',n.getAttribute('opacity')==='0.25'?dark:fill);});if(level!==undefined)doc.querySelector('.liq')?.setAttribute('transform',`translate(0 ${212*(1-level/250)}) scale(1 ${level/250})`);source=new XMLSerializer().serializeToString(doc.documentElement);}
 // Prefix SVG ids per instance to avoid clipPath collisions between reused sprites.
 const prefix=`${id}-${x}-${y}-`.replaceAll('.','x');source=source.replace(/id="([^"]+)"/g,(_,v)=>`id="${prefix}${v}"`).replace(/url\(#([^\)]+)\)/g,(_,v)=>`url(#${prefix}${v})`);
 return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${source.match(/viewBox="([^"]+)"/)?.[1]??'0 0 64 64'}">${source.replace(/^.*?<svg[^>]*>/s,'').replace(/<\/svg>\s*$/,'')}</svg>`;
}
function renderScene(s){const fill=measured&&state.tool==='indicator'?color(measure(s.pH,'indicator')):state.mode==='test'?s.color:'#b4d4dc';
 const bottle=state.mode==='test'?state.sample:state.mode==='dilute'?(state.kind==='base'?'base_bottle':state.kind==='neutral'?'water':'acid_bottle'):'acid_bottle';
 // Equipment art is schematic; numeric volume is the authoritative measurement.
 let html=sprite('bg_lab_wall',0,0,640,400)+sprite('bg_lab_bench',0,0,640,400)+sprite(bottle,30,206,96,144)+sprite('meter_body',104,34,360,315)+sprite('meter_lcd',104,34,360,315)+sprite('meter_button',104,34,360,315);
 const bx=282,by=172;
 html+=sprite('beaker_250ml_back',bx,by,165,180);
 const surface=by+(212-.56*s.volume)*.75;
 if(measured&&state.tool==='probe')html+=sprite('meter_arm',104,surface+5-218*.75,360,315);
 html+=sprite('beaker_250ml_water',bx,by,165,180,fill,s.volume);
 html+=`<path d="M${bx+42*.75} ${surface}h${135*.75}" fill="none" stroke="${fill}" stroke-width="2"/>`;
 html+=sprite('beaker_250ml_front',bx,by,165,180);
 if(state.tool==='strip'){html+=sprite('ph_strip',470,120,36,180);if(measured)html+=sprite('ph_strip_pad',470,120,36,180,color(measure(s.pH,'strip')));}
 if(state.tool==='indicator')html+=sprite('indicator_bottle',480,206,96,144);
 if(state.mode==='neutralize')html+=sprite('base_bottle',490,206,96,144)+`<text x="538" y="305" text-anchor="middle" font-size="11" fill="#173138">NaOH</text>`;
 if(bottle==='acid_bottle'||bottle==='base_bottle')html+=`<text x="78" y="305" text-anchor="middle" font-size="11" fill="#173138">${bottle==='acid_bottle'?'HCl':'NaOH'}</text>`;
 $('scene-svg').innerHTML=html;
 $('scene-reading').textContent=measured&&state.tool==='probe'?measure(s.pH).toFixed(2):'—';
}
function random(){let h=2166136261;for(const c of seed)h=Math.imul(h^c.charCodeAt(0),16777619);return ()=>{h+=0x6D2B79F5;let v=Math.imul(h^(h>>>15),1|h);v^=v+Math.imul(v^(v>>>7),61|v);return ((v^(v>>>14))>>>0)/4294967296;};}
function renderParticles(s){
 if(!measured){$('particles').innerHTML='';$('h-value').textContent='—';$('oh-value').textContent='—';$('spectators').hidden=true;return;}
 const rand=random(),h=Math.min(12,2+Math.round(Math.max(0,7-s.pH)*1.5)),oh=Math.min(12,2+Math.round(Math.max(0,s.pH-7)*1.5));
 let html=sprite('zoom_backdrop',0,0,240,240,measured?color(s.pH):'#c4dcd7');
 const particles=[...Array(6).fill('water_molecule_idle'),...Array(h).fill('hydronium'),...Array(oh).fill('ion_oh_idle')];
 if(state.mode==='neutralize'){particles.push(...Array(3).fill('ion_cl_idle'));if(state.base>0)particles.push(...Array(3).fill('ion_na_idle'));}
 // Hydronium is derived from existing H2O art plus an additional H and charge.
 particles.forEach((id,i)=>{const a=i*2.39996,r=28+Math.sqrt((i+.5)/particles.length)*62,x=104+Math.cos(a)*r+(rand()-.5)*5,y=104+Math.sin(a)*r;
 html+=`<g class="ion" style="animation-delay:-${fmt(rand()*3,2).replaceAll(',','')}s">`;
 html+=id==='hydronium'?`<g>${sprite('water_molecule_idle',x,y,32,32)}<circle cx="${x+16}" cy="${y+5}" r="4.4" fill="#f4f1ea" stroke="#2a201d" stroke-width="1.6"/><text x="${x+26}" y="${y+4}" font-size="11" fill="#173138">+</text></g>`:sprite(id,x,y,32,32);
 html+='</g>';});
 html+=sprite('inset_rim',0,0,240,240);$('particles').innerHTML=html;
 $('h-value').textContent=scientific(s.H);$('oh-value').textContent=scientific(s.OH);$('spectators').hidden=state.mode!=='neutralize';
}
function summary(r){return t('pointRead',{trial:r.trial,mode:t(r.mode),sample:t(r.sample),added:fmt(r.added),volume:fmt(r.volume),ph:r.pH.toFixed(r.tool==='probe'?2:0),tool:t(r.tool)});}
function visibleRecords(){return records.map((r,i)=>({...r,i})).filter(r=>$('compare').value==='all'||r.trial===trial);}
function chartMarkup(){const list=visibleRecords(),palette=['#0b6a69','#a64626','#685299','#315da4'];let html=`<svg viewBox="0 0 760 300" role="group" aria-label="${esc(t('graphTitle'))}"><title>${esc(t('graphTitle'))}</title>`;
 for(let p=0;p<=14;p+=2){const y=248-p/14*218;html+=`<line x1="54" y1="${y}" x2="730" y2="${y}" stroke="#dce5dd"/><text x="40" y="${y+4}" class="chart-text" text-anchor="end">${p}</text>`;}
 for(let v=0;v<=180;v+=30){const x=54+v/180*676;html+=`<text x="${x}" y="269" class="chart-text" text-anchor="middle">${v}</text>`;}
 html+=`<text x="392" y="293" class="chart-text" text-anchor="middle">${esc(t('thAdded'))}</text><text x="12" y="20" class="chart-text">pH</text>`;
 // Only connect points from the same trial, mode, solution and instrument.
 const groups=new Map();for(const r of list){const key=[r.trial,r.mode,r.sample,r.tool].join('|');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r);}
 for(const group of groups.values()){const c=palette[(group[0].trial-1)%4],points=group.map(r=>`${54+r.added/180*676},${248-r.pH/14*218}`).join(' ');if(group.length>1)html+=`<polyline class="chart-line" points="${points}" stroke="${c}"/>`;}
 for(const r of list){const x=54+r.added/180*676,y=248-r.pH/14*218;html+=`<circle class="chart-point" tabindex="0" role="button" data-point="${r.i}" aria-label="${esc(summary(r))}" cx="${x}" cy="${y}" r="${selected===r.i?7:5}" fill="${palette[(r.trial-1)%4]}" stroke="${selected===r.i?'#e3522a':'white'}" stroke-width="2"/>`;}
 return html+'</svg>';}
function selectPoint(i){selected=i;renderEvidence();}
function renderEvidence(){const list=visibleRecords();if(!list.some(r=>r.i===selected))selected=list[0]?.i??-1;
 for(const id of ['chart-host','large-chart']){$(id).innerHTML=chartMarkup();$(id).querySelectorAll('[data-point]').forEach(n=>{n.addEventListener('click',()=>selectPoint(Number(n.dataset.point)));n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();const i=Number(n.dataset.point);selectPoint(i);$(id).querySelector(`[data-point="${i}"]`)?.focus();}});});}
 for(const id of ['point','large-point']){$(id).innerHTML=list.length?list.map(r=>`<option value="${r.i}">${esc(summary(r))}</option>`).join(''):`<option value="-1">${esc(t('noPoints'))}</option>`;$(id).value=String(selected);$(id).disabled=!list.length;}
 for(const id of ['point-read','large-point-read'])$(id).textContent=records[selected]?summary(records[selected]):t('noPoints');
 $('records').innerHTML=records.map(r=>`<tr>${[`${t('trial')} ${r.trial} · ${t(r.mode)}`,t(r.sample),fmt(r.added),fmt(r.volume),t(r.tool),r.pH.toFixed(r.tool==='probe'?2:0),r.note].map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('');
}
function render(){
 document.querySelectorAll('[data-mode]').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.mode===state.mode)));
 for(const mode of ['test','dilute','neutralize'])$(`${mode}-controls`).hidden=state.mode!==mode;
 $('mode-hint').innerHTML=renderRich(t(state.mode+'Hint'));$('sample').innerHTML=samples.map(s=>`<option value="${s.id}">${esc(t(s.id))}</option>`).join('');$('sample').value=state.sample;
 $('solution').value=state.kind;$('tool').value=state.tool;$('water').value=state.water;$('base').value=state.base;$('water-output').textContent=fmt(state.water);$('base-output').textContent=fmt(state.base);
 $('trial-badge').textContent=`${t('trial')} ${trial}`;$('seed').textContent=seed;
 const s=current(),p=measure(s.pH,state.tool);$('reading').textContent=measured?p.toFixed(state.tool==='probe'?2:0):'—';
 $('classification').textContent=measured?t(Math.abs(s.pH-7)<1e-8?'neutral':s.pH<7?'acidic':'basic'):'';$('volume').textContent=`${fmt(s.volume)} mL`;$('volume').setAttribute('aria-label',`${t('volume')}: ${fmt(s.volume)}`);
 $('measurement-status').textContent=t(measured?'measured':'notMeasured');$('record').disabled=!measured;$('scale-marker').hidden=!measured;
 if(measured)$('scale-marker').style.left=`${(48+36*s.pH)/600*100}%`;
 else $('scale-marker').style.removeProperty('left');
 $('add-water').disabled=state.water>=180;$('add-base').disabled=state.base>=120;$('fine-base').disabled=state.base>=120;$('auto').disabled=state.base>=120&&timer===null;$('auto').textContent=t(timer===null?'run':'pause');
 renderScene(s);renderParticles(s);renderEvidence();syncURL();
}
function doMeasure(){measured=true;render();}
function saveRecord(){if(!measured){$('status').textContent=t('observationRequired');return;}const s=current();records.push({trial,mode:state.mode,sample:solutionKey(),added:added(),volume:s.volume,tool:state.tool,pH:measure(s.pH,state.tool),modelPH:s.pH,H:s.H,OH:s.OH,note:$('note').value});selected=records.length-1;$('status').textContent=t('recorded');renderEvidence();}
$('sample').addEventListener('change',e=>mutate(()=>state.sample=e.target.value));$('solution').addEventListener('change',e=>mutate(()=>state.kind=e.target.value));$('tool').addEventListener('change',e=>mutate(()=>state.tool=e.target.value));
for(const id of ['water','base'])$(id).addEventListener('input',e=>mutate(()=>state[id]=Number(e.target.value)));
document.querySelectorAll('[data-mode]').forEach(n=>n.addEventListener('click',()=>mutate(()=>state.mode=n.dataset.mode)));
$('add-water').addEventListener('click',()=>mutate(()=>state.water=Math.min(180,state.water+20)));
$('add-base').addEventListener('click',()=>mutate(()=>state.base=Math.min(120,Number((state.base+5).toFixed(1)))));
$('fine-base').addEventListener('click',()=>mutate(()=>state.base=Math.min(120,Number((state.base+.1).toFixed(1)))));
$('measure').addEventListener('click',doMeasure);$('record').addEventListener('click',saveRecord);
$('reset').addEventListener('click',()=>mutate(resetControls));$('new-trial').addEventListener('click',()=>mutate(()=>{trial++;resetControls();$('note').value='';}));
$('auto').addEventListener('click',()=>{if(timer!==null){stop();return;}if(state.base>=120)return;timer=setInterval(()=>{state.base=Math.min(120,Number((state.base+1).toFixed(1)));render();if(state.base>=120){stop();render();$('status').textContent=t('autoDone');}},180);$('auto').textContent=t('pause');});
$('compare').addEventListener('change',renderEvidence);for(const id of ['point','large-point'])$(id).addEventListener('change',e=>selectPoint(Number(e.target.value)));
$('expand').addEventListener('click',()=>{$('graph-dialog').showModal();$('close-graph').focus();});$('close-graph').addEventListener('click',()=>$('graph-dialog').close());$('graph-dialog').addEventListener('close',()=>$('expand').focus());
$('share').addEventListener('click',async()=>{syncURL();try{await navigator.clipboard.writeText(location.href);$('status').textContent=t('copied');}catch{$('status').textContent=location.href;}});
$('download').addEventListener('click',()=>{const quote=s=>'"'+String(s??'').replaceAll('"','""')+'"',header=['trial','mode','solution','added_mL','total_mL','tool','measured_pH','model_pH','H3O_mol_L','OH_mol_L','observation','prediction','conclusion'];const rows=records.map(r=>[r.trial,r.mode,r.sample,r.added,r.volume,r.tool,r.pH,r.modelPH,r.H,r.OH,r.note,$('prediction').value,$('conclusion').value]);if(!rows.length)rows.push(Array(11).fill('').concat([$('prediction').value,$('conclusion').value]));const blob=new Blob(['\uFEFF'+[header,...rows].map(row=>row.map(quote).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='sciesmic-ph-inquiry.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);$('status').textContent=t('exported');});
const names=['bg_lab_wall','bg_lab_bench','meter_body','meter_lcd','meter_button','meter_arm','beaker_250ml_back','beaker_250ml_water','beaker_250ml_front','ph_strip','ph_strip_pad','indicator_bottle','acid_bottle','base_bottle','zoom_backdrop','inset_rim','water_molecule_idle','ion_oh_idle','ion_na_idle','ion_cl_idle',...samples.map(s=>s.id)];
await Promise.all(names.map(async id=>{const r=await fetch(`assets/${id}.svg`);if(!r.ok)throw new Error(`Missing art: ${id}`);art[id]=await r.text();}));
onLangChange(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));stop();render();});initLab(content);
