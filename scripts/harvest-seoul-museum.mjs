#!/usr/bin/env node
/**
 * Searches 서울역사아카이브 for every legal-dong name (and its short forms) in the four photo collections,
 * then reads each hit's detail page (title, date, place, description, its own 공공누리 type).
 * Resumable: data/seoul-museum/hits.json and raw.jsonl. Set HARVEST_CURL=1 to use curl per request.
 * Usage: node --experimental-transform-types --import ./tests/ts-resolver.mjs scripts/harvest-seoul-museum.mjs [--concurrency 8] [--refresh-search]
 */
import {execFile} from 'node:child_process';
import {appendFileSync,existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {MUSEUM_COLLECTIONS,museumSearchUrl,museumViewUrl,parseMuseumItem,parseMuseumSearch,museumUsable} from '../lib/seoul-museum.ts';
const root=new URL('../',import.meta.url);const dir=new URL('data/seoul-museum/',root);mkdirSync(dir,{recursive:true});
const hitsFile=new URL('hits.json',dir),rawFile=new URL('raw.jsonl',dir);
const concurrency=Number(process.argv[process.argv.indexOf('--concurrency')+1])||8;
const curl=url=>new Promise((res,rej)=>execFile('curl',['-s','--fail','--max-time','40',url],{maxBuffer:5e7},(e,out)=>e?rej(e):res(out)));
const get=async url=>{for(let i=0;i<3;i++){try{if(process.env.HARVEST_CURL)return await curl(url);const r=await fetch(url,{signal:AbortSignal.timeout(40000)});if(r.ok)return await r.text();}catch{}await new Promise(r=>setTimeout(r,2000*(i+1)));}throw new Error('failed '+url);};
async function pool(items,fn){const q=[...items];await Promise.all(Array.from({length:concurrency},async()=>{while(q.length)await fn(q.shift());}));}
const bundle=JSON.parse(readFileSync(new URL('data/document-research/bundle.json',root),'utf8'));
const queries=[...new Set(bundle.targets.filter(t=>t.level==='법정동').flatMap(t=>{const base=t.name.replace(/\d+가$/,'').replace(/(\D)\d+동$/,'$1동');const bare=base.replace(/동$/,'');return [t.name,/동$/.test(base)?base:'',bare.length>=3?bare:''];}).filter(q=>q.length>=2))];
let hits=existsSync(hitsFile)&&!process.argv.includes('--refresh-search')?JSON.parse(readFileSync(hitsFile,'utf8')):null;
if(!hits){
  const map=new Map();let n=0;
  await pool(queries.flatMap(q=>MUSEUM_COLLECTIONS.map(c=>[q,c])),async([q,c])=>{
    for(let page=1;page<=30;page++){let found;try{found=parseMuseumSearch(await get(museumSearchUrl(q,c,page)));}catch(e){console.error('\nsearch fail',q,c,page);break;}
      for(const h of found){const prev=map.get(h.fileId);if(prev)prev.queries.includes(q)||prev.queries.push(q);else map.set(h.fileId,{...h,queries:[q]});}
      if(found.length<100)break;}
    if(++n%40===0)process.stdout.write(`\rsearch ${n}/${queries.length*MUSEUM_COLLECTIONS.length} · items ${map.size}`);
  });
  hits=[...map.values()];writeFileSync(hitsFile,JSON.stringify(hits));console.log('\nhits',hits.length,'from',queries.length,'queries');
}
const done=new Set(existsSync(rawFile)?readFileSync(rawFile,'utf8').split('\n').flatMap(l=>{try{return l?[JSON.parse(l).fileId]:[];}catch{return [];}}):[]);
const todo=hits.filter(h=>!done.has(h.fileId));console.log('details todo',todo.length);
let n=0,kept=0;const t0=Date.now();
await pool(todo,async h=>{try{const item=parseMuseumItem(await get(museumViewUrl(h)));const ok=museumUsable(item);if(ok)kept++;appendFileSync(rawFile,JSON.stringify({...h,ok,...item})+'\n');}catch(e){console.error('\nskip',h.fileId);}
  if(++n%50===0)process.stdout.write(`\r${n}/${todo.length} · kept ${kept} · ${Math.round((Date.now()-t0)/1000)}s`);});
console.log('\nfinished',n,'kept',kept);
