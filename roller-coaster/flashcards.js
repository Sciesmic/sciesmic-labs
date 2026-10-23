import {content} from './content.js';
const $=id=>document.getElementById(id),params=new URLSearchParams(location.search);
let lang=params.get('lang');if(!['en','es'].includes(lang)){try{lang=localStorage.getItem('sciesmic-labs-lang');}catch{}if(!['en','es'].includes(lang))lang=navigator.language?.startsWith('es')?'es':'en';}
const t=(key,vars={})=>Object.entries(vars).reduce((s,[k,v])=>s.replaceAll(`{${k}}`,v),content.strings[lang][key]);
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
$('card-language').value=['en','es','both'].includes(params.get('cards'))?params.get('cards'):lang;
function cardLanguages(){return $('card-language').value==='both'?['en','es']:[$('card-language').value];}
function render(){
 document.documentElement.lang=lang;document.title=t('cardsTitle');document.querySelectorAll('[data-card-i18n]').forEach(n=>n.textContent=t(n.dataset.cardI18n));
 $('back-link').href=`./?lang=${lang}`;$('ui-language').textContent=lang==='en'?'Español':'English';$('ui-language').lang=lang==='en'?'es':'en';
}
function renderCards(){
 const languages=cardLanguages();
 $('cards').innerHTML=content.vocab.map((v,i)=>`<article class="vocab-card" data-term-id="${v.id}"><div class="card-front"><small>${t('cardNumber',{n:i+1,total:content.vocab.length})}</small>${languages.map((l,j)=>`<h2 lang="${l}" class="${j?'alt-language':''}">${safe(v[l].term)}</h2>`).join('')}</div><div class="card-back">${languages.map((l,j)=>`<p lang="${l}" class="${j?'alt-language':''}">${safe(v[l].def)}</p>`).join('')}</div></article>`).join('');
 $('cards').setAttribute('aria-label',t('flashcards'));document.querySelector('.toolbar').setAttribute('aria-label',t('flashcards'));
 const u=new URL(location.href);u.searchParams.set('lang',lang);u.searchParams.set('cards',$('card-language').value);history.replaceState(null,'',u);
}
function download(data,type,extension){const blob=new Blob([data],{type});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${t('cardsFile')}-${$('card-language').value}.${extension}`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);$('export-status').textContent=t('exportDone');}
$('card-language').addEventListener('change',()=>{$('export-status').textContent='';renderCards();});
$('ui-language').addEventListener('click',()=>{lang=lang==='en'?'es':'en';if($('card-language').value!=='both')$('card-language').value=lang;$('export-status').textContent='';render();renderCards();});
$('print-cards').addEventListener('click',()=>window.print());
$('csv-cards').addEventListener('click',()=>{const languages=cardLanguages();const quote=v=>'"'+String(v).replaceAll('"','""')+'"';const rows=[languages.flatMap(l=>[`${content.strings[l].termHeading} (${l})`,`${content.strings[l].definitionHeading} (${l})`]),...content.vocab.map(v=>languages.flatMap(l=>[v[l].term,v[l].def]))];download('\uFEFF'+rows.map(r=>r.map(quote).join(',')).join('\r\n'),'text/csv;charset=utf-8','csv');});
$('html-cards').addEventListener('click',()=>{const css=[...document.styleSheets[0].cssRules].map(r=>r.cssText).join('\n');const html=`<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${safe(t('cardsTitle'))}</title><style>${css}</style></head><body><main><header><h1>${safe(t('cardsTitle'))}</h1></header><div class="toolbar"><button onclick="window.print()">${safe(t('printCards'))}</button></div><p class="instructions">${safe(t('cardsInstructions'))}</p><p class="review">${safe(t('cardsReview'))}</p><section id="cards">${$('cards').innerHTML}</section><footer>${safe(t('cardsNotice'))}</footer></main></body></html>`;download(html,'text/html;charset=utf-8','html');});
render();renderCards();
