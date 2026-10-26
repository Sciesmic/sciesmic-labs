// Sciesmic predator-prey art pack v1 / sprite kit v1.2. Illustration only.
const assets = {"sky_spring":{"frame":[900,440],"anchor":[450,220]},"hills_spring":{"frame":[900,440],"anchor":[450,220]},"trees_spring":{"frame":[900,440],"anchor":[450,220]},"ground_spring":{"frame":[900,440],"anchor":[450,220]},"sky_summer":{"frame":[900,440],"anchor":[450,220]},"hills_summer":{"frame":[900,440],"anchor":[450,220]},"trees_summer":{"frame":[900,440],"anchor":[450,220]},"ground_summer":{"frame":[900,440],"anchor":[450,220]},"sky_fall":{"frame":[900,440],"anchor":[450,220]},"hills_fall":{"frame":[900,440],"anchor":[450,220]},"trees_fall":{"frame":[900,440],"anchor":[450,220]},"ground_fall":{"frame":[900,440],"anchor":[450,220]},"sky_winter":{"frame":[900,440],"anchor":[450,220]},"hills_winter":{"frame":[900,440],"anchor":[450,220]},"trees_winter":{"frame":[900,440],"anchor":[450,220]},"ground_winter":{"frame":[900,440],"anchor":[450,220]},"snow_hills":{"frame":[900,440],"anchor":[450,220]},"snow_trees":{"frame":[900,440],"anchor":[450,220]},"snow_ground":{"frame":[900,440],"anchor":[450,220]},"snow_patches":{"frame":[900,440],"anchor":[450,220]},"fx_mystery":{"frame":[64,64],"anchor":[32,32]},"hare_brown_idle":{"frame":[128,96],"anchor":[64,82]},"hare_brown_hop_a":{"frame":[128,96],"anchor":[64,82]},"hare_brown_hop_b":{"frame":[128,96],"anchor":[64,82]},"hare_brown_hop_c":{"frame":[128,96],"anchor":[64,82]},"hare_white_idle":{"frame":[128,96],"anchor":[64,82]},"hare_white_hop_a":{"frame":[128,96],"anchor":[64,82]},"hare_white_hop_b":{"frame":[128,96],"anchor":[64,82]},"hare_white_hop_c":{"frame":[128,96],"anchor":[64,82]},"fox_idle":{"frame":[192,144],"anchor":[96,130]},"fox_walk_a":{"frame":[192,144],"anchor":[96,130]},"fox_walk_b":{"frame":[192,144],"anchor":[96,130]},"shrub_summer":{"frame":[128,96],"anchor":[64,82]},"shrub_fall":{"frame":[128,96],"anchor":[64,82]},"shrub_bare":{"frame":[128,96],"anchor":[64,82]},"shrub_snow":{"frame":[128,96],"anchor":[64,82]},"willow_browse":{"frame":[96,96],"anchor":[48,82]},"grass_green":{"frame":[96,64],"anchor":[48,50]},"grass_dry":{"frame":[96,64],"anchor":[48,50]},"clover":{"frame":[96,64],"anchor":[48,50]},"btn_play":{"frame":[96,96],"anchor":[48,48]},"btn_play_pressed":{"frame":[96,96],"anchor":[48,48]},"btn_pause":{"frame":[96,96],"anchor":[48,48]},"btn_pause_pressed":{"frame":[96,96],"anchor":[48,48]},"btn_step":{"frame":[96,96],"anchor":[48,48]},"btn_step_pressed":{"frame":[96,96],"anchor":[48,48]},"btn_year":{"frame":[96,96],"anchor":[48,48]},"btn_year_pressed":{"frame":[96,96],"anchor":[48,48]},"btn_finish":{"frame":[96,96],"anchor":[48,48]},"btn_finish_pressed":{"frame":[96,96],"anchor":[48,48]},"btn_reset":{"frame":[96,96],"anchor":[48,48]},"btn_reset_pressed":{"frame":[96,96],"anchor":[48,48]},"btn_new":{"frame":[96,96],"anchor":[48,48]},"btn_new_pressed":{"frame":[96,96],"anchor":[48,48]},"icon_hare":{"frame":[64,64],"anchor":[32,32]},"icon_fox":{"frame":[64,64],"anchor":[32,32]}};
const url=id=>`assets/art/${id}.png`;
const image=(id,extra='')=>`<image href="${url(id)}" width="${assets[id].frame[0]}" height="${assets[id].frame[1]}" ${extra}/>`;
export function createMeadow(svg){
 svg.innerHTML='<title id="meadow-title"></title><desc id="meadow-desc"></desc><g class="landscape" aria-hidden="true"></g><g class="meadow-objects" aria-hidden="true"></g>';
 const landscape=svg.querySelector('.landscape'),objects=svg.querySelector('.meadow-objects');let topology='';const nodes=new Map();
 function playing(value){svg.classList.toggle('art-playing',value);}
 function render(frame,settings,mystery,isPlaying,title,description){
  svg.querySelector('title').textContent=title;svg.querySelector('desc').textContent=description;
  const snow=Math.max(0,Math.min(1,frame.snow/100)),season=frame.season;
  const layers=[[`sky_${season}`,1],[`hills_${season}`,1],['snow_hills',snow],[`trees_${season}`,1],['snow_trees',snow],[`ground_${season}`,1],['snow_patches',Math.min(1,snow*4)],['snow_ground',Math.max(0,(snow-.5)*2)]];
  if(!landscape.children.length)landscape.innerHTML=layers.map(([id,alpha])=>image(id,`opacity="${alpha}"`)).join('');
  layers.forEach(([id,alpha],i)=>{landscape.children[i].setAttribute('href',url(id));landscape.children[i].setAttribute('opacity',alpha)});
  const h=Math.min(22,Math.ceil(frame.hares/6)),f=Math.min(5,Math.ceil(frame.foxes/2)),shelter=Math.round(settings.shelter/5),food=Math.round(settings.food/35);
  const key=[h,f,shelter,food,mystery,season].join(':');
  if(key!==topology){
   topology=key;const items=[];
   const place=(id,x,y,scale,body)=>{const a=assets[id];items.push({key:`${id}:${x}:${y}`,y,html:`<g transform="translate(${x} ${y}) scale(${scale}) translate(${-a.anchor[0]} ${-a.anchor[1]})">${body||image(id)}</g>`})};
   for(let i=0;i<food;i++){const id=season==='winter'?'willow_browse':season==='fall'?'grass_dry':i%2?'clover':'grass_green';place(id,45+(i*119%820),250+(i*43%160),.55,`<g class="food-art">${image(id)}</g>`)}
   for(let i=0;i<shelter;i++){const id=season==='winter'?'shrub_bare':season==='fall'?'shrub_fall':'shrub_summer';place(id,55+(i*163%800),280+(i*61%130),.63,image(id)+(season==='winter'?image('shrub_snow','class="shrub-snow"'):''))}
   for(let i=0;i<h;i++){
    const y=265+Math.floor(i/6)*43+(i%2)*8,scale=.53+(y-240)*.0005;
    const pose=p=>image(`hare_brown_${p}`)+image(`hare_white_${p}`,'class="white-coat"');
    place(mystery?'fx_mystery':'hare_brown_idle',75+(i%6)*137+(Math.floor(i/6)%2)*18,y,scale,mystery?null:`<g class="animal hare-art" style="--phase:-${i*.137}s"><g class="rest-pose">${pose('idle')}</g><g class="animated-pose">${['hop_a','hop_b','hop_c'].map((p,j)=>`<g class="pose pose-three frame-${j}">${pose(p)}</g>`).join('')}</g></g>`);
   }
   for(let i=0;i<f;i++){const y=325+(i%2)*65;place('fox_idle',130+i*157,y,.53+(y-240)*.0005,`<g class="animal fox-art" style="--phase:-${i*.21}s"><g class="rest-pose">${image('fox_idle')}</g><g class="animated-pose">${['fox_walk_a','fox_walk_b'].map((id,j)=>`<g class="pose pose-two frame-${j}">${image(id)}</g>`).join('')}</g></g>`)}
   const ordered=items.sort((a,b)=>a.y-b.y),active=new Set(ordered.map(item=>item.key));
   for(const [key,entry] of nodes)if(!active.has(key)){entry.node.remove();nodes.delete(key)}
   ordered.forEach((item,index)=>{
    let entry=nodes.get(item.key);
    if(!entry||entry.html!==item.html){const node=document.createElementNS('http://www.w3.org/2000/svg','g');node.innerHTML=item.html;if(entry)entry.node.replaceWith(node);entry={node,html:item.html};nodes.set(item.key,entry)}
    if(objects.children[index]!==entry.node)objects.insertBefore(entry.node,objects.children[index]||null);
   });
  }
  svg.style.setProperty('--coat-white',Math.max(0,Math.min(1,frame.white)));
  svg.style.setProperty('--snow-cover',snow);
  playing(isPlaying);
 }
 return {render,playing};
}
export function decoratePlayback(){
 for(const [id,art] of Object.entries({play:document.querySelector('#meadow').classList.contains('art-playing')?'pause':'play',step:'step','one-year':'year',finish:'finish',reset:'reset',new:'new'})){
  const button=document.getElementById(id),label=button.textContent;
  if(button.dataset.artLabel===label&&button.dataset.art===art&&button.querySelector('img'))continue;
  button.dataset.artLabel=label;button.dataset.art=art;button.replaceChildren();
  const icon=document.createElement('span');icon.className='button-art';icon.setAttribute('aria-hidden','true');
  for(const suffix of ['', '_pressed']){const img=document.createElement('img');img.src=url(`btn_${art}${suffix}`);img.alt='';img.className=suffix?'pressed-icon':'normal-icon';icon.append(img)}
  const text=document.createElement('span');text.textContent=label;button.append(icon,text);
 }
}
