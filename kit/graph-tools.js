// Shared enlargement and data-point access. No simulation state is copied or reset.
import {getLang,onLangChange} from './labs-kit.js';
import {prepareGraphData} from './graph-data.js';
const words={en:{enlarge:'Enlarge graph',close:'Close graph',compare:'Compare series / trials',all:'All series / trials',point:'Inspect a data point',empty:'Run or record an investigation to inspect data.',table:'Graph data table',series:'Series / trial',hint:'Select a point below or use arrow keys on the graph. Trial colors and axes stay the same when you filter. The highlighted point is shown with guide lines.'},es:{enlarge:'Ampliar gráfica',close:'Cerrar gráfica',compare:'Comparar series y pruebas',all:'Todas las series y pruebas',point:'Inspeccionar un punto',empty:'Realiza o registra una investigación para inspeccionar datos.',table:'Tabla de datos de la gráfica',series:'Serie o prueba',hint:'Selecciona un punto abajo o usa las flechas en la gráfica. Los colores y los ejes se mantienen al filtrar. El punto seleccionado se muestra con líneas guía.'}};
const txt=k=>words[getLang()][k],safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=n=>new Intl.NumberFormat(getLang()==='es'?'es-MX':'en-US',{maximumSignificantDigits:5}).format(n);
let next=0;
export function createGraphTools(element,{legacy=false}={}) {
 const id=++next,wrapper=document.createElement('div');wrapper.className='lk-graph-tools';
 element.before(wrapper);wrapper.append(element);
 const toolbar=document.createElement('div');toolbar.className='lk-graph-toolbar';
 const expand=document.createElement('button');expand.type='button';expand.className='lk-btn';toolbar.append(expand);wrapper.append(toolbar);
 const dialog=document.createElement('dialog');dialog.className='lk-graph-dialog';dialog.setAttribute('aria-label',txt('enlarge'));
 const close=document.createElement('button');close.type='button';close.className='lk-btn';dialog.append(close);document.body.append(dialog);
 // Legacy panels include their own point/range controls: enlarge those intact with the chart.
 const movable=legacy?(wrapper.closest('.chart-panel')??wrapper):wrapper,anchor=document.createComment('graph location');movable.before(anchor);
 expand.onclick=()=>{dialog.append(movable);dialog.showModal();close.focus();};
 close.onclick=()=>dialog.close();dialog.addEventListener('close',()=>{anchor.after(movable);expand.focus();});
 let data=null,filter='*',picked=null,points=[];
 const controls=document.createElement('div');controls.className='lk-graph-selects';
 const compareLabel=document.createElement('label'),pointLabel=document.createElement('label'),compare=document.createElement('select'),point=document.createElement('select'),readout=document.createElement('p');
 compare.id=`lk-series-${id}`;point.id=`lk-point-${id}`;compareLabel.htmlFor=compare.id;pointLabel.htmlFor=point.id;readout.className='lk-point-readout';readout.setAttribute('aria-live','polite');
 const compareText=document.createElement('span'),pointText=document.createElement('span');compareLabel.append(compareText,compare);pointLabel.append(pointText,point);controls.append(compareLabel,pointLabel);
 const details=document.createElement('details'),summary=document.createElement('summary'),tableWrap=document.createElement('div');tableWrap.className='lk-graph-table';tableWrap.tabIndex=0;details.append(summary,tableWrap);
 const legend=document.createElement('ul');legend.className='lk-graph-legend';
 const hint=document.createElement('p');hint.className='lk-graph-hint';
 if(!legacy)wrapper.append(legend,controls,readout,hint,details);
 function labels(){expand.textContent=txt('enlarge');close.textContent=txt('close');dialog.setAttribute('aria-label',txt('enlarge'));compareText.textContent=txt('compare');pointText.textContent=txt('point');summary.textContent=txt('table');hint.textContent=txt('hint');tableWrap.setAttribute('aria-label',txt('table'));}
 function choose(key,focus=false){picked=points.some(p=>p.key===key)?key:points[0]?.key??null;point.value=picked??'';const p=points.find(p=>p.key===picked);readout.textContent=p?`${p.series}: ${data.xLabel} ${num(p.x)}; ${data.yLabel} ${num(p.y)}${p.label?' · '+p.label:''}`:txt('empty');
 const guide=element.querySelector('[data-point-guide]');if(guide&&p){const marker=[...element.querySelectorAll('[data-graph-key]')].find(n=>n.dataset.graphKey===picked);if(marker){const x=marker.getAttribute('cx'),y=marker.getAttribute('cy');guide.innerHTML=`<path d="M80 ${y}H${x}V255" fill="none" stroke="#48656d" stroke-width="1.5" stroke-dasharray="4 4"/>`;}}
 element.querySelectorAll('[data-graph-key]').forEach(n=>{const selected=n.dataset.graphKey===picked;n.setAttribute('tabindex',selected?'0':'-1');n.setAttribute('aria-pressed',String(selected));n.setAttribute('r',selected?'6':'3.5');n.setAttribute('fill-opacity',selected?'1':n.dataset.marker??'1');n.setAttribute('stroke',selected?'#152b40':'none');});if(focus)element.querySelector(`[data-graph-key="${picked}"]`)?.focus();}
 function draw(){if(!data)return;labels();
 const prepared=prepareGraphData(data,filter);
 const {series,shown,xmin,xmax,ymin,ymax}=prepared;filter=prepared.filter;points=prepared.points;
 const compareOptions=`<option value="*">${safe(txt('all'))}</option>`+series.map(s=>`<option value="${safe(s.id)}">${safe(s.label)}</option>`).join('');if(compare.innerHTML!==compareOptions)compare.innerHTML=compareOptions;compare.value=filter;compare.disabled=!series.length;
 const opts=points.map(p=>`<option value="${safe(p.key)}">${safe(p.series)} · ${safe(data.xLabel)} ${num(p.x)} · ${safe(data.yLabel)} ${num(p.y)}${p.label?' · '+safe(p.label):''}</option>`).join('');if(point.innerHTML!==opts)point.innerHTML=opts;point.disabled=!points.length;
 const X=x=>80+(x-xmin)/(xmax-xmin)*580,Y=y=>255-(y-ymin)/(ymax-ymin)*205;
 const colors=['#086b70','#a54b22','#6e4c94','#315e99','#92553c','#52712a'];
 legend.innerHTML=shown.map((s)=>{const j=s.index;return `<li><span aria-hidden="true" style="border-color:${colors[j%colors.length]};border-top-style:${j%2?'dashed':'solid'}"></span>${safe(s.label)}</li>`;}).join('');
 let markup=`<title>${safe(data.title??data.yLabel)}</title><desc>${safe(txt('hint'))}</desc><text x="80" y="22" font-size="12">${safe(data.yLabel)}</text><text x="370" y="308" text-anchor="middle" font-size="12">${safe(data.xLabel)}</text>`;
 for(let i=0;i<=4;i++){const f=i/4,y=ymin+(ymax-ymin)*f,x=xmin+(xmax-xmin)*f;markup+=`<line x1="80" x2="660" y1="${Y(y)}" y2="${Y(y)}" stroke="#d7e0df"/><text x="70" y="${Y(y)+4}" text-anchor="end" font-size="11">${num(y)}</text><text x="${X(x)}" y="280" text-anchor="middle" font-size="11">${num(x)}</text>`;}
 shown.forEach((s)=>{const j=s.index,ps=s.points,color=colors[j%colors.length];if(s.line!==false)markup+=`<polyline points="${ps.map(p=>X(p.x)+','+Y(p.y)).join(' ')}" fill="none" stroke="${color}" stroke-width="2.5" stroke-dasharray="${j%2?'7 4':''}"/>`;for(const [i,p] of ps.entries())markup+=`<circle data-marker="${s.line===false||i%Math.max(1,Math.ceil(ps.length/24))===0?1:0}" pointer-events="all" data-graph-key="${safe(p.key)}" role="button" tabindex="-1" aria-label="${safe(p.series+' · '+data.xLabel+' '+num(p.x)+' · '+data.yLabel+' '+num(p.y)+(p.label?' · '+p.label:''))}" cx="${X(p.x)}" cy="${Y(p.y)}" r="3.5" fill="${color}"/>`;});
 markup+='<g data-point-guide aria-hidden="true" pointer-events="none"></g>';
 const focused=element.querySelector('[data-graph-key]:focus')?.dataset.graphKey;
 const svg=element instanceof SVGElement?element:document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 720 320');svg.setAttribute('role','group');svg.setAttribute('aria-label',data.title??data.yLabel);svg.removeAttribute('aria-labelledby');svg.innerHTML=markup;if(svg!==element){element.removeAttribute('aria-labelledby');element.setAttribute('role','group');element.setAttribute('aria-label',data.title??data.yLabel);element.replaceChildren(svg);}
 tableWrap.innerHTML=`<table><thead><tr><th scope="col">${safe(txt('series'))}</th><th scope="col">${safe(data.xLabel)}</th><th scope="col">${safe(data.yLabel)}</th></tr></thead><tbody>${points.map(p=>`<tr><th scope="row">${safe(p.series+(p.label?' · '+p.label:''))}</th><td>${num(p.x)}</td><td>${num(p.y)}</td></tr>`).join('')}</tbody></table>`;
 choose(picked);if(focused)choose(picked,true);
 }
 element.addEventListener('click',e=>{const key=e.target.closest('[data-graph-key]')?.dataset.graphKey;if(key)choose(key);});
 element.addEventListener('keydown',e=>{const key=e.target.closest('[data-graph-key]')?.dataset.graphKey;if(!key)return;const i=points.findIndex(p=>p.key===key);if(['ArrowLeft','ArrowDown','ArrowRight','ArrowUp','Home','End','Enter',' '].includes(e.key)){e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?points.length-1:e.key==='ArrowLeft'||e.key==='ArrowDown'?Math.max(0,i-1):e.key==='ArrowRight'||e.key==='ArrowUp'?Math.min(points.length-1,i+1):i;choose(points[n].key,true);}});
 compare.onchange=()=>{filter=compare.value;draw();};point.onchange=()=>choose(point.value);
 onLangChange(()=>{labels();if(data)draw();});labels();
 return {update(nextData){data=nextData;draw();},close(){if(dialog.open)dialog.close();}};
}
