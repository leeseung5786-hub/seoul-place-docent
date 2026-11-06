#!/usr/bin/env node
/** data/seoul-archives/raw.jsonl → data/seoul-archives/photos.json (manual-photos format). Matching rules: scripts/lib/dong-match.mjs */
import {readFileSync,writeFileSync} from 'node:fs';
import {loadDongs,matchDongs,backgroundPick,capPerDong} from './lib/dong-match.mjs';
import {dateOf} from './lib/dong-match.mjs';
const root=new URL('../',import.meta.url);const {dongs,patterns,districts}=loadDongs(root);
const items=readFileSync(new URL('data/seoul-archives/raw.jsonl',root),'utf8').split('\n').flatMap(l=>{try{return l?[JSON.parse(l)]:[];}catch{return [];}}).filter((i,k,a)=>i.ok&&a.findIndex(x=>x.id===i.id)===k);
const entry=(i,district,dong)=>({district,...(dong?{dong}:{}),title:i.title,date:dateOf(i.date,i.title),imageUrl:i.thumb,sourceUrl:`https://archives.seoul.go.kr/item/${i.id}`,institution:'서울기록원',credit:`서울기록원 · ${i.creator||'서울특별시'}`,license:'서울기록원 공개 기록 · 이용유형 제한없음'+(i.useNote?` (${i.useNote})`:''),description:(i.description||i.title).slice(0,300),allowDisplay:true});
const out=[];const bg=new Map();let matched=0;
for(const i of items){const text=[i.title,i.description,i.keywords,...(i.places||[])].join(' ');const chosen=matchDongs(text,patterns);
  if(chosen.length){matched++;for(const p of chosen)out.push(entry(i,p.district,p.dong));continue;}
  const ds=districts.filter(d=>text.includes(d));if(ds.length===1)bg.set(ds[0],[...(bg.get(ds[0])||[]),i]);}
for(const [d,list] of bg)for(const i of backgroundPick(list))out.push(entry(i,d,''));
const capped=capPerDong(out);writeFileSync(new URL('data/seoul-archives/photos.json',root),JSON.stringify(capped));
console.log(`서울기록원 photos ${items.length} · matched ${matched} · entries ${capped.length} (before cap ${out.length}) · dongs ${new Set(out.filter(e=>e.dong).map(e=>e.district+e.dong)).size}/${dongs.length}`);
