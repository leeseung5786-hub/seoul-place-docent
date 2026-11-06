#!/usr/bin/env node
/**
 * Turns data/seoul-archives/raw.jsonl (from harvest-seoul-archives.mjs) into data/seoul-archives/photos.json,
 * one entry per (photo, legal dong) in the same shape as data/manual-photos.json.
 * Matching: a photo goes to a 법정동 when its title, description, keywords or linked places name that dong
 * (삼선동2가, or 삼선동 for every 삼선동N가; 여의도 for 여의도동). Names shared by two districts (신사동, 신정동)
 * and two-syllable names that are also ordinary words (합동, 정동) also need the district in the text. Photos naming only a district become district background (≤40 per district).
 */
import {readFileSync,writeFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const bundle=JSON.parse(readFileSync(new URL('data/document-research/bundle.json',root),'utf8'));
const dongs=bundle.targets.filter(t=>t.level==='법정동').map(t=>({district:t.district,dong:t.name}));
const nameCount=new Map();for(const d of dongs)nameCount.set(d.dong,(nameCount.get(d.dong)||0)+1);
const items=readFileSync(new URL('data/seoul-archives/raw.jsonl',root),'utf8').split('\n').flatMap(l=>{try{return l?[JSON.parse(l)]:[];}catch{return [];}}).filter((i,k,a)=>i.ok&&a.findIndex(x=>x.id===i.id)===k);
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
// A name counts only as a whole word start: 신정동 matches 신정동에서 but not 북신정동, and 삼선동 does not match 삼선동5가 (handled as exact).
// Two-syllable names (합동, 명동, 정동) are also ordinary words (한미합동), so they must stand alone or take a particle.
const has=(text,name)=>name.length<=2?new RegExp(`(?<![가-힣])${esc(name)}(?![0-9]|[가-힣](?<![에의을은이과와로도]))`).test(text):new RegExp(`(?<![가-힣])${esc(name)}(?![0-9]|구(?![가-힣]))`).test(text);
const patterns=dongs.map(d=>{
  const base=d.dong.replace(/\d+가$/,'').replace(/(\D)\d+동$/,'$1동');const bare=base.replace(/동$/,'');
  return {...d,needsDistrict:d.dong.length<=2&&d.dong!=='명동',names:[...new Set([d.dong,/동$/.test(base)?base:'',bare.length>=3&&bare!==base?bare:''].filter(Boolean))],shared:nameCount.get(d.dong)>1};
});
const districts=[...new Set(dongs.map(d=>d.district))];
const out=[];const perDistrict=new Map();let matched=0;
const entry=(i,district,dong)=>({district,...(dong?{dong}:{}),title:i.title,date:i.date||'시기 미상',imageUrl:i.thumb,sourceUrl:`https://archives.seoul.go.kr/item/${i.id}`,institution:'서울기록원',credit:`서울기록원 · ${i.creator||'서울특별시'}`,license:'서울기록원 공개 기록 · 이용유형 제한없음'+(i.useNote?` (${i.useNote})`:''),description:(i.description||i.title).slice(0,400),allowDisplay:true});
for(const i of items){
  const text=[i.title,i.description,i.keywords,...(i.places||[])].join(' ');
  const hits=patterns.filter(p=>p.names.some(n=>has(text,n))&&(!(p.shared||p.needsDistrict)||text.includes(p.district)));
  // When the full legal name (삼선동5가) is present, do not also spread the photo to its siblings.
  const exact=hits.filter(p=>has(text,p.dong));const chosen=(exact.length?exact:hits).slice(0,6);
  if(chosen.length){matched++;for(const p of chosen)out.push(entry(i,p.district,p.dong));continue;}
  const ds=districts.filter(d=>text.includes(d));
  if(ds.length===1){const list=perDistrict.get(ds[0])||[];list.push(i);perDistrict.set(ds[0],list);}
}
for(const [d,list] of perDistrict){list.sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999'));const step=Math.max(1,Math.floor(list.length/40));for(let k=0;k<list.length&&k/step<40;k+=step)out.push(entry(list[k],d,''));}
writeFileSync(new URL('data/seoul-archives/photos.json',root),JSON.stringify(out));
const covered=new Set(out.filter(e=>e.dong).map(e=>e.district+' '+e.dong));
console.log(`photos ${items.length} · matched to dongs ${matched} · entries ${out.length} · dongs covered ${covered.size}/${dongs.length} · districts with background ${perDistrict.size}`);
