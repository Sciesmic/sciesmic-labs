import {motionPreference, animationFrame, animationNow} from '../kit/motion.js';
import {createGraphTools} from '../kit/graph-tools.js';
import {content} from './content.js';
import {initLab,onLangChange,getLang,t} from '../kit/labs-kit.js';
import {simulate,frameAt,challenge,settings,trainMass,positions,carPose,trackPoint,CAR_SPACING} from './model.js';
import {carSymbols} from './art.js';
const $=id=>document.getElementById(id),params=new URLSearchParams(location.search),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const keys=['height','mass','hill','hill2','hills','loops','radius','cars','riders','resistance','shape'];
const energyGraph=createGraphTools(document.getElementById('energy-graph')),compareGraph=createGraphTools(document.getElementById('compare-graph'));
let mode=['explore','compare','challenge'].includes(params.get('mode'))?params.get('mode'):'explore',seed=Number(params.get('seed')||42)>>>0;
let p=settings(Object.fromEntries(keys.filter(k=>params.has(k)).map(k=>[k,params.get(k)])));if(mode==='challenge')p=challenge(seed);
let trial=simulate(p),time=0,furthest=0,playing=false,started=false,last=0,records=[],guessTested=false,lastEvidence=-1,savedKind='';
const fmt=(n,d=2)=>Number(n).toLocaleString(getLang()==='es'?'es-MX':'en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const src=name=>'assets/sprites/'+name+'.svg';
function syncControls(){for(const k of keys){$(k).value=p[k];$(k).disabled=mode==='challenge'||(k==='radius'&&p.loops===0)||(k==='hill'&&p.hills===0)||(k==='hill2'&&p.hills<2);if(k!=='shape')$(k+'-out').textContent=fmt(p[k],k==='resistance'?2:0);}for(const id of ['load-note','table-load-note'])$(id).textContent=t('loadNote',{mass:fmt(trainMass(p),0)});}
function resetTrial(){playing=false;started=false;time=0;furthest=0;guessTested=false;lastEvidence=-1;$('challenge-feedback').textContent='';trial=simulate(p);buildScene();draw(true);}
const view=()=>frameAt(trial,time);
function buildScene(){
 const track=trial.track,rail=track.points.filter((_,i)=>i%3===0||i===track.points.length-1).map((q,i)=>(i?'L':'M')+q.x.toFixed(4)+','+(-q.y).toFixed(4)).join(' ');
 const inLoop=s=>track.marks.some(m=>m.id.startsWith('loopExit')&&s>=m.s-2*Math.PI*p.radius-.01&&s<=m.s+.01);
 let ties='',supports='';for(let s=0;s<=track.length;s+=.95){const q=trackPoint(track,s),nx=-q.ty*.42,ny=q.tx*.42;ties+=`<path d="M${q.x+nx},${-q.y-ny}L${q.x-nx},${-q.y+ny}"/>`;}
 for(let s=4;s<=track.length;s+=5){const q=trackPoint(track,s);if(q.y>.8&&!inLoop(s))supports+=`<path d="M${q.x-.35},${-q.y+.15}V1.6M${q.x+.35},${-q.y+.15}V1.6M${q.x-.9},1.6L${q.x+.35},${-q.y+.15}"/>`;}
 const labels=track.marks.filter(m=>['release','bottom','hillCrest','hill2Crest','loopTop1','loopTop2'].includes(m.id)).map(m=>`<text x="${m.x}" y="${-m.y-2.8}" font-size="1.05" text-anchor="middle" fill="#2a201d" stroke="#f1e6d2" stroke-width=".16" paint-order="stroke">${esc(t(m.id==='release'?'releasePoint':m.id==='bottom'?'bottomPoint':m.id))}</text>`).join('');
 $('track').innerHTML=`<defs>${carSymbols}</defs><image id="scene-bg" href="${src('bg_day_composite')}" width="1400" height="690" preserveAspectRatio="none"/><g id="world"><g stroke="#785c47" stroke-width=".22" fill="none">${supports}</g><image href="${src('track_station')}" x="1" y="-6.25" width="8" height="8"/><image href="${src('track_brake_run')}" x="${track.brake.x}" y="-6.25" width="8" height="8"/><g stroke="#8a6c51" stroke-width=".18">${ties}</g><path d="${rail}" fill="none" stroke="#2a201d" stroke-width=".48" stroke-linejoin="round"/><path d="${rail}" fill="none" stroke="#a3aaa8" stroke-width=".20" stroke-linejoin="round"/><path d="${rail}" fill="none" stroke="#f1e6d2" stroke-width=".055" stroke-linejoin="round"/>${labels}<g id="coaster-train"></g></g>`;
 const sc=940/(track.bounds.maxX+4),mapd=track.points.filter((_,i)=>i%5===0||i===track.points.length-1).map((q,i)=>(i?'L':'M')+(30+q.x*sc).toFixed(2)+','+(140-q.y*3).toFixed(2)).join(' ');
 $('route-map').innerHTML=`<path d="${mapd}" fill="none" stroke="#b08a67" stroke-width="3"/><circle id="map-train" r="6" fill="#d0693a" stroke="#2a201d" stroke-width="2"/>`;
 $('route-map').setAttribute('aria-label',t('overview'));$('scene-bg').setAttribute('href',src($('scenery').value==='blueprint'?'bg_blueprint':'bg_'+$('scenery').value+'_composite'));
}
function drawTrack(s){
 const track=trial.track,overview=$('camera').value==='overview',scale=overview?Math.min(13,1280/(track.bounds.maxX+8)):Math.min(15.5,500/(track.bounds.maxY+6));
 const windowWidth=1280/scale,left=overview?0:Math.max(0,Math.min(track.bounds.maxX-windowWidth+4,s.x-windowWidth*.42)),tx=60-left*scale,ground=585;
 $('world').setAttribute('transform',`translate(${tx},${ground}) scale(${scale})`);
 const size=p.mass<80?'light':p.mass<180?'medium':'heavy',state=s.speed>12?'excited':time>=trial.duration&&trial.outcome==='turn'?'scared':'calm';
 const cars=positions(track,p,s.s);let html='';
 cars.forEach((car,i)=>{
  const q=s.s-i*CAR_SPACING,pose=carPose(track,q),angle=-pose.angle*180/Math.PI,bodyScale=.0225,stretch=pose.wheelSpan/1.89;
  let riders='';const rscale=p.riders>2?.64:p.riders===2?.82:1;
  for(let r=0;r<p.riders;r++){const seat=p.riders===1?-7:-26+r*48/(p.riders-1);riders+=`<image class="rider" href="${src('rider'+'ABCD'[r]+'_'+state)}" x="${seat-64*rscale}" y="${-58-92*rscale}" width="${128*rscale}" height="${96*rscale}"/>`;}
  html+=`<g class="coaster-car" data-car="${i+1}" transform="translate(${pose.x},${-pose.y}) rotate(${angle}) scale(${bodyScale*stretch},${bodyScale})">${riders}<use href="#body-${size}"/><path d="M-32 -65H24" fill="none" stroke="#2a201d" stroke-width="4" stroke-linecap="round"/></g>`;
  for(const [name,w] of [['rear',pose.rear],['front',pose.front]]){
   const rotation=s.distance/.2925*180/Math.PI;
   html+=`<g class="wheel" data-car="${i+1}" data-bogie="${name}" data-contact-x="${w.contact.x}" data-contact-y="${w.contact.y}" data-center-x="${w.x}" data-center-y="${w.y}" transform="translate(${w.x},${-w.y}) rotate(${rotation})"><circle r=".2925" fill="#4b4441" stroke="#2a201d" stroke-width=".09"/><path d="M-.20 0H.20M-.10 -.173L.10 .173M.10 -.173L-.10 .173" stroke="#8b817a" stroke-width=".056"/><circle r=".10" fill="#f1e6d2" stroke="#2a201d" stroke-width=".056"/></g>`;
  }
 });
 $('coaster-train').innerHTML=html;
 const mp=$('map-train');mp.setAttribute('cx',30+s.x*940/(track.bounds.maxX+4));mp.setAttribute('cy',140-s.y*3);
 $('route-progress').textContent=t('progress',{n:fmt(100*frameAt(trial,furthest).distance/(track.finish.s-trial.startS),0)});
 $('track').setAttribute('aria-label',`${t('workspace')}. ${p.cars} ${t('cars')}; ${p.riders} ${t('riders')}. ${t('heightLabel')}: ${fmt(s.height)}; ${t('speedLabel')}: ${fmt(s.speed)}.`);
}
function graph(){const quantities=[['ke','kineticLabel'],['pe','potentialLabel'],['thermal','thermalLabel'],['motorWork','motorWork']];
 const group=(samples,label,id)=>quantities.map(([key,name])=>({id:id+'-'+key,label:label+' · '+t(name),points:samples.filter((_,i)=>i%8===0||i===samples.length-1).map(s=>({x:s.distance,y:s[key]}))}));
 const current=trial.samples.filter(q=>q.time<=furthest+1e-8);if(furthest>0)current.push(frameAt(trial,furthest));
 energyGraph.update({title:t('graphTitle'),xLabel:t('distance'),yLabel:t('joules'),xMin:0,yMin:0,series:[...records.flatMap((r,i)=>group(r.observed,t('trial')+' '+(i+1),'saved-'+i)),...group(current,t('currentPoint'),'current')]});
 $('graph-empty').hidden=furthest>0;
}

const headings=(id,items)=>$(id).innerHTML='<tr>'+items.map(v=>'<th scope="col">'+esc(v)+'</th>').join('')+'</tr>';
function readingTable(s){
 headings('readings-head',[t('point'),t('heightLabel'),t('speedLabel'),t('kineticLabel')+' (J)',t('potentialLabel')+' (J)',t('thermalLabel')+' (J)']);
 const rows=[[t('stationPoint'),trial.samples[0]],...trial.sensors.map(q=>[t(q.id==='release'?'releasePoint':q.id==='bottom'?'bottomPoint':q.id),q.reading&&q.reading.time<=furthest+1e-7?q.reading:null]),[t('currentPoint'),s]];
 $('readings-body').innerHTML=rows.map(([label,q])=>`<tr><th scope="row">${esc(label)}</th>${q?[q.height,q.speed,q.ke,q.pe,q.thermal].map(v=>`<td>${fmt(v)}</td>`).join(''):`<td colspan="5">${t('notMeasured')}</td>`}</tr>`).join('');
}
function history(){
 headings('history-head',[t('trial'),t('height'),t('totalMass'),t('cars'),t('riders'),t('loops'),t('resistance'),t('bottomSpeed'),t('bottomKE'),t('outcome'),t('setupDetails')]);
 $('history-body').innerHTML=records.length?records.map((r,i)=>`<tr><th scope="row">${i+1}</th>${[fmt(r.settings.height,0),fmt(r.mass,0),r.settings.cars,r.settings.riders,r.settings.loops,fmt(r.settings.resistance),fmt(r.bottom.speed),fmt(r.bottom.ke),t(r.outcome)].map(v=>`<td>${esc(v)}</td>`).join('')}<td><details><summary>${esc(t('setupDetails'))}</summary><dl>${Object.entries(r.settings).map(([key,v])=>`<dt>${esc(t('setting_'+key))}</dt><dd>${esc(typeof v==='number'?fmt(v,2):t(v))}</dd>`).join('')}</dl></details></td></tr>`).join(''):`<tr><td colspan="11">${t('noRecords')}</td></tr>`;
 $('comparison').hidden=mode!=='compare'&&!records.length;const byMass=$('compare-x').value==='mass',value=r=>byMass?r.mass:r.bottom.speed,axisLabel=t(byMass?'totalMass':'bottomSpeed'),maxV=Math.max(1,...records.map(value)),maxK=Math.max(1,...records.map(r=>r.bottom.ke));
 compareGraph.update({title:t('bottomKE'),xLabel:axisLabel,yLabel:t('bottomKE'),xMin:0,yMin:0,series:records.map((r,i)=>({id:'record-'+i,label:t('trial')+' '+(i+1)+' · '+t('height')+' '+fmt(r.settings.height,0)+' m · '+t('totalMass')+' '+fmt(r.mass,0)+' kg',line:false,points:[{x:value(r),y:r.bottom.ke}]}))});
 graph();
}
function showGuess(){
 if(!guessTested)return;
 if(trial.track.goal&&frameAt(trial,furthest).s>=trial.track.goal.s||furthest>=trial.duration){const matched=($('guess').value==='yes')===trial.targetReached;$('challenge-feedback').textContent=t(matched?'correctPrediction':'revisePrediction');}else $('challenge-feedback').textContent=t('pendingPrediction');
}
function draw(force=false){
 const s=view();drawTrack(s);$('speed-value').textContent=fmt(s.speed);$('height-value').textContent=fmt(s.height);$('time-value').textContent=fmt(time);
 $('play').textContent=playing?t('pause'):started&&time<trial.duration?t('resume'):t('release');$('status').textContent=time>=trial.duration?t(trial.outcome):!started?t('ready'):!playing?t('paused'):t(s.phase==='lift'?'lifting':s.phase==='brake'?'braking':'running');
 $('timeline').max=Math.max(1,Math.round(furthest*1000));$('timeline').value=Math.round(time*1000);$('timeline').disabled=furthest===0;$('timeline').setAttribute('aria-valuetext',fmt(time)+' s');
 $('total').textContent=t('totalLabel')+': '+fmt(s.total)+' J';$('motor-work').textContent=t('motorWork')+': '+fmt(s.motorWork)+' J';
 $('energy-bars').innerHTML=[['kineticLabel',s.ke,'#d0693a'],['potentialLabel',s.pe,'#5f8fa6'],['thermalLabel',s.thermal,'#b8504a']].map(([k,v,c])=>`<div class="energy-item"><span>${t(k)}</span><div class="energy-track"><div class="energy-fill" style="width:${s.total?100*v/s.total:0}%;background:${c}"></div></div><strong>${fmt(v)} J</strong></div>`).join('');
 if(force||Math.abs(furthest-lastEvidence)>.12||time>=trial.duration){graph();readingTable(s);showGuess();lastEvidence=furthest;}
}
function render(){syncControls();$('saved').textContent=savedKind?t(savedKind):'';document.querySelectorAll('[data-mode]').forEach(n=>n.setAttribute('aria-pressed',n.dataset.mode===mode));$('mode-hint').textContent=t('hint'+mode[0].toUpperCase()+mode.slice(1));$('challenge-panel').hidden=mode!=='challenge';$('seed-value').textContent=seed;$('flashcards-link').href=`flashcards.html?lang=${getLang()}`;buildScene();history();draw(true);}
for(const k of keys)$(k).addEventListener('input',()=>{p=settings(Object.fromEntries(keys.map(k=>[k,$(k).value])));resetTrial();render();});
for(const k of ['camera','scenery'])$(k).addEventListener('change',()=>{buildScene();draw(true);});
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;if(mode==='challenge')p=challenge(seed);resetTrial();render();}));
$('play').addEventListener('click',()=>{if(time>=trial.duration)resetTrial();playing=!playing;started=true;last=animationNow();draw(true);});
$('reset').addEventListener('click',resetTrial);
$('timeline').addEventListener('input',()=>{playing=false;started=true;time=Math.max(0,Math.min(furthest,Number($('timeline').value)/1000));draw(true);});
$('record').addEventListener('click',()=>{if(!trial.bottom||furthest<trial.bottom.time){savedKind='collectFirst';$('saved').textContent=t(savedKind);return;}records.push({settings:{...p},mass:trial.mass,bottom:trial.bottom,outcome:furthest>=trial.duration?trial.outcome:'outcomeLive',seed,observedUntil:furthest,observed:trial.samples.filter(q=>q.time<=furthest)});savedKind='saved';$('saved').textContent=t(savedKind);history();});
$('compare-x').addEventListener('change',history);$('clear').addEventListener('click',()=>{records=[];savedKind='';$('saved').textContent='';history();});
$('new-trial').addEventListener('click',()=>{seed=(seed+1)>>>0;p=challenge(seed);resetTrial();render();});
$('test-prediction').addEventListener('click',()=>{guessTested=true;$('challenge-feedback').textContent=t('pendingPrediction');playing=true;started=true;last=animationNow();draw(true);});
$('guess').addEventListener('change',()=>{guessTested=false;$('challenge-feedback').textContent='';});
$('copy').addEventListener('click',async()=>{const u=new URL(location.href);u.search='';for(const [k,v] of Object.entries({lang:getLang(),mode,seed,...p}))u.searchParams.set(k,v);try{await navigator.clipboard.writeText(u.href);$('copy-status').textContent=t('copied');}catch{$('copy-status').textContent=t('copyFail')+u.href;}});
$('download').addEventListener('click',()=>{const fields=['trial','lift_height_m','empty_car_mass_kg','cars','riders_per_car','total_mass_kg','loops','loop_radius_m','later_hills','second_hill_m','third_hill_m','resistance','shape','bottom_speed_m_s','bottom_KE_J','observed_until_s','observed_outcome','model_version','seed'];const rows=records.map((r,i)=>[i+1,r.settings.height,r.settings.mass,r.settings.cars,r.settings.riders,r.mass,r.settings.loops,r.settings.radius,r.settings.hills,r.settings.hill,r.settings.hill2,r.settings.resistance,r.settings.shape,r.bottom.speed,r.bottom.ke,r.observedUntil,r.outcome,'2.0.0',r.seed]);const csv='\uFEFF'+[fields,...rows].map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='energy-on-the-rails-trials.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);});
let lastMotionDraw=0;
function animate(now){if(playing){time=Math.min(trial.duration,time+Math.min(.08,(now-last)/1000)*Number($('playback-speed').value));furthest=Math.max(furthest,time);if(time>=trial.duration)playing=false;if(!motionPreference.matches||now-lastMotionDraw>=250||!playing){draw();lastMotionDraw=now;}}last=now;animationFrame(animate);}
onLangChange(()=>{const pop=document.querySelector('.lk-pop');if(pop)pop.hidden=true;document.querySelectorAll('.lk-term[aria-expanded=true]').forEach(n=>n.setAttribute('aria-expanded','false'));render();});
initLab(content);animationFrame(animate);
