#!/usr/bin/env node
/**
 * Collects 성북마을아카이브 photographs (list pages with types=PHOTOGRAPH, then each record page).
 * Keeps the parsed record; only 공공누리/CCL records are used later. Resumable via data/seongbuk-archive/raw.jsonl.
 * Usage: node --experimental-transform-types --import ./tests/ts-resolver.mjs scripts/harvest-seongbuk-archive.mjs [--concurrency 8] [--refresh-list]
 */
import {execFile} from 'node:child_process';
import {appendFileSync,existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {parseSeongbukItem,parseSeongbukList,seongbukListUrl,seongbukUsable,SEONGBUK} from '../lib/seongbuk-archive.ts';
const dir=new URL('../data/seongbuk-archive/',import.meta.url);mkdirSync(dir,{recursive:true});
const idsFile=new URL('ids.json',dir),rawFile=new URL('raw.jsonl',dir);
const concurrency=Number(process.argv[process.argv.indexOf('--concurrency')+1])||8;
const curl=url=>new Promise((res,rej)=>execFile('curl',['-s','--fail','--max-time','40',url],{maxBuffer:5e7},(e,out)=>e?rej(e):res(out)));
const get=async url=>{for(let i=0;i<3;i++){try{if(process.env.HARVEST_CURL)return await curl(url);const r=await fetch(url,{signal:AbortSignal.timeout(40000)});if(r.ok)return await r.text();}catch{}await new Promise(r=>setTimeout(r,2000*(i+1)));}throw new Error('failed '+url);};
let ids=existsSync(idsFile)&&!process.argv.includes('--refresh-list')?JSON.parse(readFileSync(idsFile,'utf8')):null;
if(!ids){const set=new Set();for(let p=0;p<400;p++){const found=parseSeongbukList(await get(seongbukListUrl(p)));found.forEach(i=>set.add(i));process.stdout.write(`\rlist ${p} · ${set.size}`);if(found.length<100)break;}ids=[...set];writeFileSync(idsFile,JSON.stringify(ids));console.log('\nids',ids.length);}
const done=new Set(existsSync(rawFile)?readFileSync(rawFile,'utf8').split('\n').flatMap(l=>{try{return l?[JSON.parse(l).id]:[];}catch{return [];}}):[]);
const todo=ids.filter(i=>!done.has(i));console.log('todo',todo.length);let n=0,kept=0;const t0=Date.now();
await Promise.all(Array.from({length:concurrency},async()=>{while(todo.length){const id=todo.shift();try{const item=parseSeongbukItem(id,await get(`${SEONGBUK}/item/${id}`));const ok=seongbukUsable(item);if(ok)kept++;appendFileSync(rawFile,JSON.stringify({...item,ok})+'\n');}catch{console.error('\nskip',id);}if(++n%50===0)process.stdout.write(`\r${n}/${n+todo.length} · kept ${kept} · ${Math.round((Date.now()-t0)/1000)}s`);}}));
console.log('\nfinished',n,'kept',kept);
