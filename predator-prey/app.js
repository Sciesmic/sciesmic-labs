import {createMeadow,decoratePlayback} from './art.js';
import {content} from './content.js';
import {defaults,normalize,createTrial,coatColor,rng} from './model.js';
import {initLab,onLangChange,getLang,t,renderRich} from '../kit/labs-kit.js';
const $=id=>document.getElementById(id),keys=Object.keys(defaults),params=new URLSearchParams(location.search),snapshots=[];
let seed=Number(params.get('seed')??42)>>>0,settings=normalize({...defaults,...Object.fromEntries(keys.filter(k=>params.has(k)).map(k=>[k,params.get(k)]))}),graphView=params.get('graphView')==='abundance'?'abundance':'percent',showCapacity=params.get('capacity')==='1',mode=['guided','explore','mystery'].includes(params.get('mode'))?params.get('mode'):'guided',trial,timer=null,mysteryCoat='brown';
const meadow=createMeadow($('meadow'));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n=v=>Number(v)>0&&Number(v)<.1?'<0.1':Number(v).toLocaleString(getLang()==='es'?'es-MX':'en-US',{maximumFractionDigits:1});
function syncURL(){const u=new URL(location.href);for(const k of keys)u.searchParams.set(k,settings[k]);u.searchParams.set('seed',seed);u.searchParams.set('lang',getLang());u.searchParams.set('mode',mode);u.searchParams.set('graphView',graphView);u.searchParams.set('capacity',showCapacity?'1':'0');history.replaceState(null,'',u);}
function pause(){clearInterval(timer);timer=null;$('play').textContent=t('play');meadow.playing(false);decoratePlayback();}
function start(){pause();mysteryCoat=rng(seed^731)()<.5?'brown':'white';trial=createTrial(seed,{...settings,...(mode==='mystery'?{coat:mysteryCoat}:{})});$('diagnosis-result').textContent='';syncURL();render();}
function advance(){trial.step();if(trial.frames.at(-1).week>=trial.duration)pause();renderEvidence();}
function drawMeadow(frame){const s={...trial.settings,...frame},myst=mode==='mystery';
 meadow.render(frame,trial.settings,myst,!!timer,t('sceneTitle'),`${t(s.season)}; ${t('snow')} ${n(s.snow)}%; ${t('hares')} ${n(frame.hares)}; ${t('foxes')} ${n(frame.foxes)}. ${t('sceneNote')}`);
 $('scene-status').textContent=`${t(s.season)} · ${n(s.snow)}% ${t('snow').replace(' (%)','')} · ${myst?t('hidden'):t(coatColor(s))} · ${t('year')}: ${n(frame.week/52)}`;
 $('h-count').textContent=n(frame.hares);$('f-count').textContent=n(frame.foxes);$('week-value').textContent=frame.week;$('end-week').textContent=trial.duration;
 $('probability').textContent=myst?t('hidden'):`${t('probability')}: ${n(frame.pDetect*100)}%`;
}
function drawGraph(){
 const frames=trial.frames,pop=trial.settings.experiment==='population',extent=pop?trial.duration/52:trial.duration;
 const percent=graphView==='percent',base=trial.settings,x=w=>65+w/trial.duration*680;
 const value=(f,key)=>percent?f[key]/base[key==='capacity'?'hares':key]*100:f[key];
 const series=[{key:'hares',color:'#284e3d',dash:''},{key:'foxes',color:'#ac4b27',dash:'8 5'},...(showCapacity?[{key:'capacity',color:'#74618e',dash:'2 5'}]:[])];
 const raw=Math.max(1,...series.flatMap(s=>frames.map(f=>value(f,s.key))));
 const spacing=Math.max(1,10**Math.floor(Math.log10(raw/4))),step=Math.ceil(raw/4/spacing)*spacing,max=step*4,y=v=>350-v/max*305;
 const line=s=>`<polyline data-series="${s.key}" fill="none" stroke="${s.color}" stroke-width="${s.key==='capacity'?2:2.7}" stroke-dasharray="${s.dash}" points="${frames.map(f=>`${x(f.week)},${y(value(f,s.key))}`).join(' ')}"/>`;
 $('graph').innerHTML=`<title id="graph-title">${esc(t('counts'))}</title><desc id="graph-desc">${esc(t(percent?'percentNote':'abundanceNote'))} ${showCapacity?esc(t('capacityHelp')):''} ${t('week')} ${frames.at(-1).week}: ${t('hares')} ${n(frames.at(-1).hares)}; ${t('foxes')} ${n(frames.at(-1).foxes)}.</desc><text x="65" y="22" font-size="12" fill="#536b5c">${esc(t(percent?'percentView':'abundanceView'))}</text>${[0,1,2,3,4].map(i=>`<line x1="65" x2="745" y1="${y(step*i)}" y2="${y(step*i)}" stroke="#d5ddcf"/><text x="54" y="${y(step*i)+4}" text-anchor="end" font-size="11" fill="#536b5c">${n(step*i)}${percent?'%':''}</text>`).join('')}${series.map(line).join('')}${[0,.25,.5,.75,1].map(v=>`<text x="${65+680*v}" y="375" text-anchor="middle" font-size="11" fill="#536b5c">${n(extent*v)}</text>`).join('')}<text x="405" y="408" text-anchor="middle" font-size="12" fill="#536b5c">${esc(t(pop?'year':'week'))}</text>`;
 $('capacity-note').textContent=showCapacity?t('capacityHelp')+(percent?' '+t('capacityPercent'):''):t(percent?'percentNote':'abundanceNote');
 $('capacity-key-label').hidden=!showCapacity;document.querySelector('.capacity-key').hidden=!showCapacity;
}
function table(head,rows,caption=''){return `${caption?`<caption>${esc(caption)}</caption>`:''}<thead><tr>${head.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody>`;}
function renderEvidence(){const f=trial.frames.at(-1);drawMeadow(f);drawGraph();
 $('population-flux').innerHTML=[['births',f.hBirths],['kills',f.kills],['deaths',f.hDeaths],['fBirths',f.fBirths],['fDeaths',f.fDeaths]].map(([k,v])=>`<div class="flux"><span>${esc(t(k))}</span><b>${n(v)}</b></div>`).join('');
 $('feedback').textContent=f.week===0?t('feedbackStart'):t(f.fBirths>=f.fDeaths?'feedbackFoxRise':'feedbackFoxFall');
 const rate=f.totalEncounters?n(f.totalDetected/f.totalEncounters*100)+'%':t('noEncounters');
 $('hunt-stats').innerHTML=[['encounters',f.totalEncounters],['detected',f.totalDetected],['kills',f.totalKills],['rate',rate],['capacity',f.capacity]].map(([k,v])=>`<div class="stat"><span>${esc(t(k))}</span><strong>${typeof v==='number'?n(v):esc(v)}</strong></div>`).join('');
 if($('weekly-details').open)renderWeekly();
 const annual=trial.frames.filter(f=>f.week%52===0);$('annual-details').hidden=trial.settings.experiment!=='population';
 $('annual').innerHTML=table(['year','hares','foxes','capacity'].map(tKey=>t(tKey)),annual.map(f=>[n(f.week/52),n(f.hares),n(f.foxes),n(f.capacity)]),t('annual'));
 $('play').textContent=t(timer?'pause':'play');for(const k of ['play','step','finish','one-year'])$(k).disabled=f.week>=trial.duration;decoratePlayback();
}
function renderWeekly(){const cols=['week','season','snow','coatWhite','hares','foxes','capacity','encounters','detected','kills','births','deaths','fBirths','fDeaths'];$('weekly').innerHTML=table(cols.map(k=>t(k)),trial.frames.map(f=>[f.week,t(f.season),n(f.snow),mode==='mystery'?t('hidden'):n(f.white*100),n(f.hares),n(f.foxes),n(f.capacity),n(f.encounters),n(f.detected),n(f.kills),n(f.hBirths),n(f.hDeaths),n(f.fBirths),n(f.fDeaths)]),t('data'));}
function renderHistory(){const head=['experiment','climate','seed','week','season','snow','coat','food','shelter','hares','foxes','capacity','encounters','detected','kills'];$('history').innerHTML=table(head.map(k=>t(k)),snapshots.map(s=>[t(s.settings.experiment),t(s.settings.experiment==='short'||s.settings.climate==='constant'?'climateConstant':'climateSeasonal'),s.seed,s.f.week,t(s.settings.season),s.settings.snow,s.mode==='mystery'?t('hidden'):t(s.settings.coat),s.settings.food,s.settings.shelter,n(s.f.hares),n(s.f.foxes),n(s.f.capacity),n(s.f.totalEncounters),n(s.f.totalDetected),n(s.f.totalKills)]));$('empty').hidden=snapshots.length>0;}
function render(){
 $('flashcards-link').href=`flashcards.html?lang=${getLang()}`;$('mode').value=mode;for(const k of keys)$(k).value=settings[k];$('seed').value=seed;
 if(settings.hares===0||settings.foxes===0)graphView='abundance';$('graph-view').value=graphView;$('graph-view').querySelector('[value=percent]').disabled=settings.hares===0||settings.foxes===0;$('show-capacity').checked=showCapacity;$('climate-control').hidden=settings.experiment!=='population';
 for(const k of ['snow','food','shelter'])$(k+'-value').textContent=settings[k];
 $('coat').disabled=mode==='mystery';$('mystery-box').hidden=mode!=='mystery';$('mode-hint').innerHTML=renderRich(trial.settings.experiment==='population'?t('populationHint')+' '+(mode==='guided'?t('populationGuide'):mode==='mystery'?t('mysteryHint'):''):t(mode+'Hint'));$('years-control').hidden=settings.experiment!=='population';$('one-year').hidden=settings.experiment!=='population';$('finish').textContent=settings.experiment==='population'?t('finishYears',{years:settings.years}):t('finish');$('snow-label').textContent=t(settings.experiment==='population'&&settings.climate==='seasonal'?'peakSnow':'snow');$('season-label').textContent=t(settings.experiment==='population'&&settings.climate==='seasonal'?'startingSeason':'season');renderEvidence();renderHistory();syncURL();
}
for(const k of keys)$(k).addEventListener('change',()=>{settings=normalize({...settings,[k]:$(k).value});start();});
$('seed').addEventListener('change',()=>{seed=Number($('seed').value)>>>0;start();});
$('mode').addEventListener('change',()=>{mode=$('mode').value;start();});
$('graph-view').addEventListener('change',()=>{graphView=$('graph-view').value;drawGraph();syncURL();});
$('show-capacity').addEventListener('change',()=>{showCapacity=$('show-capacity').checked;drawGraph();syncURL();});
for(const button of document.querySelectorAll('[data-preset]'))button.addEventListener('click',()=>{const preset=button.dataset.preset;settings=normalize({...defaults,...(preset==='baseline'?{climate:'constant'}:preset==='user'?{hares:100,foxes:10,season:'summer',snow:40,coat:'white',food:180,years:5}:{})});seed=42;mode='guided';graphView='percent';start();});
$('play').addEventListener('click',()=>{if(timer){pause();return;}timer=setInterval(()=>{const steps=settings.experiment==='population'?8:1;for(let i=0;i<steps;i++)trial.step();if(trial.frames.at(-1).week>=trial.duration)pause();renderEvidence();},settings.experiment==='population'?100:350);renderEvidence();});
$('weekly-details').addEventListener('toggle',()=>{if($('weekly-details').open)renderWeekly();});$('one-year').addEventListener('click',()=>{pause();for(let i=0;i<52;i++)trial.step();renderEvidence();});
$('step').addEventListener('click',()=>{pause();advance();});$('finish').addEventListener('click',()=>{pause();trial.run();renderEvidence();});$('reset').addEventListener('click',start);
$('new').addEventListener('click',()=>{seed=crypto.getRandomValues(new Uint32Array(1))[0];start();});
$('share').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);$('status').textContent=t('copied');}catch{$('status').textContent=t('copyFail');}});
$('save').addEventListener('click',()=>{snapshots.push({seed,settings:{...trial.settings},mode,f:{...trial.frames.at(-1)},frames:trial.frames.map(f=>({...f}))});renderHistory();$('status').textContent=t('saved');});
$('download').addEventListener('click',()=>{const records=[...snapshots,{seed,settings:trial.settings,mode,f:trial.frames.at(-1),frames:trial.frames}];const rows=[['trial','seed','mode',...keys,'week','hare_count','fox_count','encounters','detections','captures','hare_births','other_hare_deaths','fox_births','fox_deaths','total_encounters','total_detections','total_captures','current_season','current_snow_percent','current_white_coat_percent','food_intake_per_fox_last_substep','current_food_capacity']];records.forEach((s,i)=>s.frames.forEach(f=>rows.push([i+1,s.seed,s.mode,...keys.map(k=>k==='coat'&&s.mode==='mystery'?'hidden':s.settings[k]),f.week,f.hares,f.foxes,f.encounters,f.detected,f.kills,f.hBirths,f.hDeaths,f.fBirths,f.fDeaths,f.totalEncounters,f.totalDetected,f.totalKills,f.season,f.snow,s.mode==='mystery'?'hidden':f.white*100,f.intake,f.capacity])));const csv='\uFEFF'+rows.map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='predator-prey-evidence.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
$('diagnose').addEventListener('click',()=>{if(trial.frames.at(-1).week===0){$('diagnosis-result').textContent=t('mysteryHint');return;}$('diagnosis-result').textContent=t($('diagnosis').value===mysteryCoat?'diagnosisGood':'diagnosisBad');});
onLangChange(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));render();$('diagnosis-result').textContent='';$('status').textContent='';});
// State exists before initLab invokes the language callback; language switching never resets a trial.
trial=createTrial(seed,{...settings,...(mode==='mystery'?{coat:rng(seed^731)()<.5?'brown':'white'}:{})});mysteryCoat=trial.settings.coat;initLab(content);
