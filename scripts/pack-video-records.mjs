import {readFileSync,writeFileSync} from 'node:fs';
import {gzipSync} from 'node:zlib';
const folder=new URL('../data/video-workbooks/',import.meta.url);
const raw=JSON.parse(readFileSync(new URL('records.json',folder),'utf8'));
const items=JSON.parse(readFileSync(new URL('index.json',folder),'utf8')).items;
const packed={version:1,byVideo:{},shards:{}};
for(let start=0;start<items.length;start+=64){
 const batch=items.slice(start,start+64),key=String(start/64);
 const refs=[...new Set(batch.flatMap(i=>i.refs))].sort();
 const rowrefs=[...new Set(refs.flatMap(ref=>[ref,...raw.records[ref].supportingRefs]))].sort();
 const value={records:Object.fromEntries(refs.map(ref=>[ref,raw.records[ref]])),rows:Object.fromEntries(rowrefs.filter(ref=>raw.rows[ref]).map(ref=>[ref,raw.rows[ref]]))};
 const payload=Buffer.from(JSON.stringify(value));
 if(payload.length>2*1024*1024)throw new Error('Video detail shard exceeds 2 MiB; reduce batch size');
 packed.shards[key]=gzipSync(payload).toString('base64');
 for(const item of batch)packed.byVideo[item.id]=key;
}
writeFileSync(new URL('records-packed.json',folder),JSON.stringify(packed)+'\n');
