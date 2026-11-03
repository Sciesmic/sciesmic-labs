import {particleState,sampleAt} from './model.js';
const ROOT=new URL('./assets/',import.meta.url),images=new Map();
const files=['bilayer_tile_idle','bilayer_tile_wiggle_a','bilayer_tile_wiggle_b','channel_open','channel_closed','aquaporin','carrier_open_in','carrier_open_out','carrier_bound','pump_inward_open','pump_na_bound','pump_outward_open','pump_k_bound','pump_inward_release','atp','adp','phosphate','molecule_o2','ion_na_idle','ion_k_idle','glucose_ring_idle','protein_large_idle',...['a','b','c','d'].flatMap(x=>['endocytosis_'+x,'exocytosis_'+x])];
export const ready=Promise.all(files.map(name=>new Promise(resolve=>{const im=new Image();im.onload=()=>resolve();im.onerror=()=>resolve();im.src=new URL(name+'.svg',ROOT);images.set(name,im);})));
export function assetFor(name){return images.get(name)?.src||'';}
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const mix=(a,b,u)=>a+(b-a)*u;
const smooth=u=>u*u*(3-2*u);
function drawImage(ctx,key,x,y,w,h){const im=images.get(key);if(im?.complete&&im.naturalWidth)ctx.drawImage(im,x,y,w,h);}
function hash(id,seed){let n=Math.imul((id+17)^(seed>>>0),2654435761);return(n>>>0)/4294967296;}
function home(id,seed,time,side,width=900){const a=hash(id,seed),b=hash(id+591,seed),c=hash(id+3791,seed);return {x:32+(width-64)*(.5+.29*Math.sin(time*.29+a*70)+.17*Math.sin(time*.71+b*90)),y:side==='out'?204-(5+Math.abs(145*Math.sin(time*.39+b*80)+15*Math.sin(time*.93+c*90))):256+(5+Math.abs(145*Math.sin(time*.39+b*80)+15*Math.sin(time*.93+c*90)))};}
function slotX(slot,n,width){return width/2+(slot-(Math.max(1,n)-1)/2)*105;}
export function drawScene(canvas,trial,time,{lang='en',highlight=true,trace=false,reduced=false}={}){
 const ctx=canvas.getContext('2d'),W=900,H=470;canvas.width=W;canvas.height=H;
 const s=trial.settings,osm=s.mode==='osmosis',width=osm?620:W;
 const snap=sampleAt(trial,time);ctx.fillStyle='#d9eef7';ctx.fillRect(0,0,width,230);ctx.fillStyle='#faf0da';ctx.fillRect(0,230,width,H-230);
 ctx.fillStyle='#315b71';ctx.font='bold 13px system-ui';ctx.fillText(lang==='es'?'AFUERA · líquido extracelular':'OUTSIDE · extracellular fluid',20,24);ctx.fillText(lang==='es'?'ADENTRO · citoplasma':'INSIDE · cytoplasm',20,H-14);
 const tile=reduced?'bilayer_tile_idle':['bilayer_tile_idle','bilayer_tile_wiggle_a','bilayer_tile_wiggle_b'][Math.floor(time*5)%3];
 for(let x=0;x<width;x+=83)drawImage(ctx,tile,x,204,85,52);
 const n=s.proteins;
 if(osm){for(let j=0;j<n;j++)drawImage(ctx,'aquaporin',slotX(j,n,width)-24,190,48,80);}
 else if(['carrier','pump','homeostasis','cotransport','channels'].includes(s.mode)||(['selectivity','permeability'].includes(s.mode)&&s.pathway!=='lipid')){
  for(let j=0;j<n;j++){
   let key='carrier_open_out';
   if(s.mode==='channels'||s.pathway==='channel')key=s.gate==='leak'||(s.gate==='ligand'&&s.ligand)||(s.gate==='voltage'&&s.voltage>=-50)?'channel_open':'channel_closed';
   else if(['pump','homeostasis'].includes(s.mode)){const cycle=trial.cycles.find(c=>c.slot===j&&time>=c.start&&time<c.end);key=cycle?['pump_na_bound','pump_outward_open','pump_k_bound','pump_inward_release'][Math.min(3,Math.floor((time-cycle.start)/1.5))]:'pump_inward_open';}
   else key=['carrier_open_out','carrier_bound','carrier_open_in'][Math.floor(time*2)%3];
   drawImage(ctx,key,slotX(j,n,width)-37,177,74,110);
  }
 }
 if(s.mode==='homeostasis'){drawImage(ctx,'channel_open',100,190,55,80);drawImage(ctx,'channel_open',740,190,55,80);}
 if(s.mode==='vesicles'){const active=s.energy&&trial.events.some(e=>e.kind==='vesicle'&&Math.floor(e.at/8)===Math.floor(time/8));const phase=active?(time%8<1?0:time%8<2?1:time%8<3.5?2:3):0;drawImage(ctx,`${s.bulk==='exo'?'exocytosis':'endocytosis'}_${'abcd'[phase]}`,width/2-100,128,200,205);}
 if(osm){
  // Representative water paths on each side and through the membrane; gross fluxes measured separately.
  const step=Math.min(119,Math.floor(time)),a=trial.rows[step],b=trial.rows[step+1];const inRate=b.waterIn-a.waterIn,outRate=b.waterOut-a.waterOut;
  for(let i=0;i<56;i++){let side=i%2?'in':'out',p=home(i,trial.seed,time,side,width);const rate=side==='out'?inRate:outRate;const u=(time*.8*Math.max(.1,rate/.02)+hash(i,trial.seed))%4;if(i<12&&u<1){p.x=slotX(i%n||0,Math.max(1,n),width);p.y=side==='out'?180+100*u:280-100*u;}ctx.fillStyle='#2a86bf';ctx.beginPath();ctx.arc(p.x,p.y,4,0,Math.PI*2);ctx.fill();}
  for(let i=0;i<Math.min(48,s.inside+s.outside);i++){const side=i<Math.round(48*s.outside/(s.inside+s.outside||1))?'out':'in',p=home(i+900,trial.seed,time*.4,side,width);ctx.fillStyle='#b5653e';ctx.fillRect(p.x-4,p.y-4,8,8);}
  drawCell(ctx,snap,s,lang);
 }else {const bubbles=new Set();
 const cargoPose=(p,at,side)=>{if(s.mode!=='vesicles'||side!=='in')return home(p.id,trial.seed,at,side,width);const last=trial.byParticle[p.id].filter(e=>e.at<=at&&e.to==='in').at(-1);const group=last?500+Math.floor(last.at):Math.floor(p.id/4);const index=last?trial.events.filter(e=>e.kind==='vesicle'&&e.at===last.at).findIndex(e=>e.id===p.id):p.id%4;const c=home(group,trial.seed,at*.35,'in',width);return {x:c.x+(index%2?8:-8),y:c.y+(index<2?-8:8),cx:c.x,cy:c.y,group};};
 for(const p of trial.particles){
  const ps=particleState(trial,p.id,time);let pose=cargoPose(p,time,ps.side),event=ps.event;
  const bindingCycle=trial.cycles.find(c=>time>=c.start&&time<c.end&&(c.na.includes(p.id)||c.k.includes(p.id)));
  if(bindingCycle&&!event){const isNa=bindingCycle.na.includes(p.id),start=bindingCycle.start+(isNa?0:3),until=isNa?bindingCycle.naAt-.5:bindingCycle.kAt-.5;if(time>=start&&time<=until){const from=home(p.id,trial.seed,start,isNa?'in':'out',width),u=smooth(clamp((time-start),0,1));pose={x:mix(from.x,slotX(bindingCycle.slot,n,width)+(p.id%3-1)*11,u),y:mix(from.y,isNa?274:186,u)};}}
  if(event){const u=time-event.at+.5,from=cargoPose(p,event.at-.5,event.from),to=cargoPose(p,event.at+.5,event.to);let x=event.kind==='lipid'?40+hash(p.id+Math.floor(event.at)*8,trial.seed)*(width-80):event.kind==='leak'?(p.species==='na'?128:767):slotX(event.slot,n,width);const y0=event.from==='out'?186:274,y1=event.to==='out'?186:274;
   if(['pumpNa','pumpK','cotransport','vesicle'].includes(event.kind)){const group=trial.events.filter(e=>e.at===event.at&&e.slot===event.slot&&e.kind===event.kind);x+=(group.findIndex(e=>e.id===p.id)-(group.length-1)/2)*16;}
   if(event.kind.startsWith('pump')){from.x=x;from.y=y0;}
   if(u<.3){const f=smooth(u/.3);pose={x:mix(from.x,x,f),y:mix(from.y,y0,f)};}
   else if(u<.7)pose={x,y:mix(y0,y1,(u-.3)/.4)};
   else {const f=smooth((u-.7)/.3);pose={x:mix(x,to.x,f),y:mix(y1,to.y,f)};}
   if(highlight){ctx.strokeStyle=event.to==='in'?'#007d75':'#a64b16';ctx.lineWidth=2;ctx.beginPath();ctx.arc(pose.x,pose.y,15,0,Math.PI*2);ctx.stroke();}
  }
  if(pose.group!==undefined&&!bubbles.has(pose.group)){bubbles.add(pose.group);ctx.fillStyle='#e0eada';ctx.strokeStyle='#688d72';ctx.lineWidth=2;ctx.beginPath();ctx.arc(pose.cx,pose.cy,24,0,7);ctx.fill();ctx.stroke();}
  const key={o2:'molecule_o2',co2:'molecule_o2',na:'ion_na_idle',k:'ion_k_idle',glucose:'glucose_ring_idle',cargo:'protein_large_idle'}[p.species];const size=['glucose','cargo'].includes(p.species)?19:['na','k'].includes(p.species)?14:13;
  drawImage(ctx,key,pose.x-size/2,pose.y-size/2,size,size);
  if(p.species==='co2'){ctx.fillStyle='#516274';ctx.beginPath();ctx.arc(pose.x,pose.y,3,0,7);ctx.fill();}
  if(trace&&p.id===0){ctx.strokeStyle='#a32174';ctx.lineWidth=2;ctx.beginPath();ctx.arc(pose.x,pose.y,19,0,7);ctx.stroke();ctx.fillStyle='#70204f';ctx.font='bold 13px system-ui';ctx.fillText('#1',pose.x+18,pose.y-10);}
 }}
 if(['pump','homeostasis'].includes(s.mode)){drawImage(ctx,snap.atp>0?'atp':'adp',25,360,45,45);ctx.fillStyle='#364c58';ctx.font='bold 15px system-ui';ctx.fillText(`ATP: ${snap.atp}  |  ADP + Pi: ${s.atp-snap.atp}`,82,390);}
 if(s.mode==='channels'&&s.voltage){ctx.fillStyle='#40526c';ctx.font='bold 15px system-ui';ctx.fillText(`V = ${s.voltage} mV (${lang==='es'?'fijo':'clamped'})`,670,30);}
}
function drawCell(ctx,r,s,lang){
 ctx.fillStyle='#f4f8ef';ctx.fillRect(620,0,280,470);ctx.fillStyle='#284936';ctx.font='bold 15px system-ui';ctx.fillText(lang==='es'?'Respuesta de toda la célula':'Whole-cell response',642,35);
 const cx=760,cy=230,scale=Math.cbrt(r.volumeIn),radius=77*scale;
 if(s.cell==='plant'){ctx.fillStyle='#e4efc7';ctx.strokeStyle='#6a8643';ctx.lineWidth=12;ctx.beginPath();ctx.roundRect(650,106,220,245,18);ctx.fill();ctx.stroke();}
 ctx.fillStyle='#eedcba';ctx.strokeStyle='#b26639';ctx.lineWidth=4;ctx.beginPath();if(s.cell==='plant'){const shrink=Math.min(1,scale);ctx.roundRect(cx-99*shrink,cy-111*shrink,198*shrink,222*shrink,20);}else ctx.ellipse(cx,cy,radius,radius*.95,0,0,7);ctx.fill();ctx.stroke();
 ctx.fillStyle='#b3cce6';ctx.beginPath();ctx.ellipse(cx,cy,radius*.7,radius*.72,0,0,7);ctx.fill();ctx.fillStyle='#895c9d';ctx.beginPath();ctx.ellipse(cx+35,cy+35,15,19,.4,0,7);ctx.fill();
 ctx.fillStyle='#38576a';ctx.font='14px system-ui';ctx.fillText(`${lang==='es'?'Volumen':'Volume'}: ${r.volumeIn.toFixed(2)}`,650,390);ctx.fillText(`${lang==='es'?'Presión de pared':'Wall pressure'}: ${r.pressure.toFixed(1)}`,650,414);
}
