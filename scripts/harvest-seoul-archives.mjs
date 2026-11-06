#!/usr/bin/env node
/**
 * Collects every record of 서울기록원 서울사진아카이브 once (list + detail pages), keeping only items that are
 * 공개 and 이용유형 제한없음. Resumable: progress is appended to data/seoul-archives/raw.jsonl.
 * Usage: node --experimental-transform-types --import ./tests/ts-resolver.mjs scripts/harvest-seoul-archives.mjs [--concurrency 6] [--refresh-list]
 * --refresh-list re-reads the list pages so newly published photos are picked up; already collected items are skipped.
 * Set HARVEST_CURL=1 to use curl for each request (useful behind proxies that stall keep-alive connections).
 */
import {execFile} from 'node:child_process';
import {appendFileSync,existsSync,mkdirSync,readFileSync} from 'node:fs';
import {parseArchiveItem,parseArchiveList,archiveUsable,SEOUL_ARCHIVES} from '../lib/seoul-archives.ts';
const dir=new URL('../data/seoul-archives/',import.meta.url);mkdirSync(dir,{recursive:true});
const rawFile=new URL('raw.jsonl',dir);const idsFile=new URL('ids.json',dir);
const concurrency=Number(process.argv[process.argv.indexOf('--concurrency')+1])||6;
const curl=url=>new Promise((res,rej)=>execFile('curl',['-s','--fail','--max-time','25','-A','SeoulPlaceDocent/1.0 (https://github.com/xeonica/seoul-place-docent)',url],{maxBuffer:2e7},(e,out)=>e?rej(e):res(out)));
const get=async url=>{for(let i=0;i<3;i++){try{if(process.env.HARVEST_CURL)return await curl(url);const r=await fetch(url,{signal:AbortSignal.timeout(25000)});if(r.ok)return await r.text();}catch{}await new Promise(r=>setTimeout(r,1500*(i+1)));}throw new Error('failed '+url);};
let ids;
if(existsSync(idsFile)&&!process.argv.includes('--refresh-list'))ids=JSON.parse(readFileSync(idsFile,'utf8'));
else{
  const first=parseArchiveList(await get(`${SEOUL_ARCHIVES}/photo/list?page=1&pageSize=100`));const pages=Math.ceil(first.total/100);
  const cards=new Map(first.cards.map(c=>[c.id,c]));
  for(let p=2;p<=pages;p++){for(const c of parseArchiveList(await get(`${SEOUL_ARCHIVES}/photo/list?page=${p}&pageSize=100`)).cards)cards.set(c.id,c);process.stdout.write(`\rlist ${p}/${pages} · ${cards.size}`);}
  ids=[...cards.values()];(await import('node:fs')).writeFileSync(idsFile,JSON.stringify(ids));console.log('\nids',ids.length,'of',first.total);
}
const done=new Set(existsSync(rawFile)?readFileSync(rawFile,'utf8').split('\n').filter(Boolean).map(l=>JSON.parse(l).id):[]);
const todo=ids.filter(c=>!done.has(c.id));console.log('todo',todo.length,'done',done.size);
let n=0,kept=0;const t0=Date.now();
async function worker(){while(todo.length){const card=todo.shift();try{const item=parseArchiveItem(card.id,await get(`${SEOUL_ARCHIVES}/item/${card.id}`));
  const ok=archiveUsable(item);if(ok)kept++;appendFileSync(rawFile,JSON.stringify({id:card.id,ok,thumb:card.thumb,...(ok?item:{title:item.title,access:item.access,use:item.use})})+'\n');}
  catch(e){console.error('\nskip',card.id,e.message);}
  if(++n%50===0)process.stdout.write(`\r${n} items · kept ${kept} · ${Math.round((Date.now()-t0)/1000)}s`);}}
await Promise.all(Array.from({length:concurrency},worker));
console.log('\nfinished',n,'kept',kept);
