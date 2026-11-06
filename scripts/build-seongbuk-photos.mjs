#!/usr/bin/env node
/** data/seongbuk-archive/raw.jsonl → data/seongbuk-archive/photos.json. Every record is 성북구; dongs come from title/description/생산지. */
import {readFileSync,writeFileSync} from 'node:fs';
import {loadDongs,matchDongs,backgroundPick,capPerDong} from './lib/dong-match.mjs';
import {dateOf} from './lib/dong-match.mjs';
const root=new URL('../',import.meta.url);const {patterns}=loadDongs(root);
const items=readFileSync(new URL('data/seongbuk-archive/raw.jsonl',root),'utf8').split('\n').flatMap(l=>{try{return l?[JSON.parse(l)]:[];}catch{return [];}}).filter((i,k,a)=>i.ok&&a.findIndex(x=>x.id===i.id)===k);
const unescape=t=>(t||'').replace(/&#x([0-9a-f]+);/gi,(_,h)=>String.fromCodePoint(parseInt(h,16))).replace(/&#(\d+);/g,(_,d)=>String.fromCodePoint(Number(d))).replace(/&amp;/g,'&').replace(/&quot;/g,'"');
const entry=(i,dong)=>({district:'성북구',...(dong?{dong}:{}),title:unescape(i.title),date:dateOf(i.date,i.title),imageUrl:i.image,sourceUrl:`https://archive.sb.go.kr/item/${i.id}`,institution:'성북마을아카이브',credit:`성북마을아카이브 · ${i.creator||'성북문화원'}`,license:`${i.license.replace(/^획득 · /,'')} · 출처: 성북마을아카이브(https://archive.sb.go.kr)`,description:unescape(i.description||i.title).slice(0,300),allowDisplay:true});
const out=[];const rest=[];let matched=0;
for(const i of items){const chosen=matchDongs([i.title,i.description,i.place].join(' '),patterns,'성북구');if(chosen.length){matched++;for(const p of chosen)out.push(entry(i,p.dong));}else rest.push(i);}
for(const i of backgroundPick(rest,40))out.push(entry(i,''));
const capped=capPerDong(out);writeFileSync(new URL('data/seongbuk-archive/photos.json',root),JSON.stringify(capped));
console.log(`성북마을아카이브 usable ${items.length} · matched ${matched} · entries ${capped.length} (before cap ${out.length}) · dongs ${new Set(out.filter(e=>e.dong).map(e=>e.dong)).size}`);
