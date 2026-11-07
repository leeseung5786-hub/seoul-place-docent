import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {videoCatalog,videoDetails,filterVideoCatalog,videoRelation} from '../lib/video-catalog.ts';
import {GET} from '../app/api/archive/video-research/route.ts';
import legacy from '../data/consolidated-video-research.json';
import original from '../data/video-workbooks/records.json';
import {loadVideoRecords} from '../lib/video-records.ts';
const records=Object.values(original.records);
const uploaded=records.filter(r=>!r.ref.startsWith('legacy:'));
const query=async params=>{const r=await GET(new Request('https://example.test/api/archive/video-research?dataset=combined&'+params));return {status:r.status,body:await r.json()};};

test('every packed video preserves all original provenance and keeps decoded shards bounded',async()=>{
 const manifest=readFileSync(new URL('../data/video-workbooks/records-packed.json',import.meta.url));
 assert.ok(manifest.byteLength<256*1024,'Worker contains only a small video-to-asset manifest');
 assert.equal(JSON.parse(manifest).shards,undefined,'gzip payloads belong to static assets, not Worker code');
 for(const item of videoCatalog.items){
  const shard=await loadVideoRecords(item.id);assert.ok(shard);
  for(const ref of item.refs){
   assert.deepEqual(shard.records[ref],original.records[ref]);
   for(const row of [ref,...original.records[ref].supportingRefs])if(original.rows[row])assert.deepEqual(shard.rows[row],original.rows[row]);
  }
 }
 assert.equal(await loadVideoRecords('missing'),null);
 const source=readFileSync(new URL('../lib/video-catalog.ts',import.meta.url),'utf8');
 assert.doesNotMatch(source,/import\(['"]\.\.\/data\/video-workbooks\/records\.json/);
});

test('all 26 workbooks, 25 districts and actual single PDF retain byte-identical originals',()=>{
 assert.equal(videoCatalog.meta.workbookCount,26);assert.equal(videoCatalog.meta.districtCount,25);assert.equal(videoCatalog.meta.pdfCount,1);
 for(const source of videoCatalog.files){const b=readFileSync(new URL('../public'+source.path,import.meta.url));assert.equal(b.length,source.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),source.sha256);}
 assert.equal(createHash('sha256').update(readFileSync(new URL('../public/research/video-workbooks/original.zip',import.meta.url))).digest('hex'),videoCatalog.meta.archiveSha256);
 for(const file of videoCatalog.files.filter(f=>f.kind==='xlsx'))assert.equal(uploaded.filter(r=>r.ref.startsWith(file.id+':')).length,file.primaryRows);
 assert.equal(videoCatalog.sheets.filter(s=>s.role==='primary').length,26);
});
test('primary rows, mirrors, duplicate videos and legacy overlap reconcile without lost provenance',()=>{
 assert.equal(uploaded.length,3740);assert.equal(videoCatalog.meta.primaryRows,uploaded.length);
 assert.equal(videoCatalog.items.length,3812);assert.equal(videoCatalog.items.filter(i=>i.url).length,3749);assert.equal(videoCatalog.items.filter(i=>!i.url).length,63);
 assert.equal(new Set(videoCatalog.items.filter(i=>i.url).map(i=>i.url)).size,3749);
 assert.equal(videoCatalog.meta.duplicatePrimaryRows,126);assert.equal(videoCatalog.meta.legacyOverlap,6);
 const refs=videoCatalog.items.flatMap(i=>i.refs);assert.equal(refs.length,3944);assert.equal(new Set(refs).size,3944);
 assert.equal(uploaded.reduce((n,r)=>n+r.segments.length,0),2394);
 for(const old of legacy.items)assert.ok(refs.includes('legacy:'+old.id));
 for(const record of uploaded){const row=original.rows[record.ref];assert.equal(row.originalId,record.originalId);const sheet=videoCatalog.sheets.find(s=>s.fileId===row.fileId&&s.sheet===row.sheet);assert.equal(sheet.role,'primary');const id=sheet.headers.findIndex(v=>v==='자료ID'||v==='번호');assert.equal(row.cells[id],record.originalId);for(const ref of record.supportingRefs){assert.equal(original.rows[ref].originalId,record.originalId);assert.equal(original.rows[ref].fileId,row.fileId);}}
});
test('nothing is silently promoted to independent playback, location or embedding verification',()=>{
 assert.ok(videoCatalog.items.every(i=>!i.independentlyVerified&&!i.embeddingAllowed));
 for(const r of records)for(const s of r.segments){assert.equal(s.verifiedTime,false);if(s.validTime){assert.ok(s.start>=0&&s.end>s.start);}if(!r.ref.startsWith('legacy:'))assert.equal(original.rows[s.ref].originalId,r.originalId);}
 assert.ok(uploaded.some(r=>r.reportedPlayback));assert.ok(uploaded.some(r=>r.filmedAt&&r.publishedAt));
});
test('combined API paginates and filters while legacy consumers retain original contract',async()=>{
 const first=await query('');assert.equal(first.status,200);assert.equal(first.body.total,3812);assert.equal(first.body.items.length,12);assert.equal(first.body.items[0].refs,undefined);assert.equal(first.body.records,undefined);
 const second=await query('page=2');assert.notEqual(first.body.items[0].id,second.body.items[0].id);
 assert.equal((await query('status=held')).body.total,63);
 assert.equal((await query('source=legacy')).body.total,204);
 for(const district of first.body.options.districts){const data=(await query(new URLSearchParams({district}))).body;assert.ok(data.total>0,district);assert.ok(data.items.every(i=>i.regionLinks.some(l=>l.district===district)));}
 for(const params of ['page=0','limit=100','district=부산','period=invalid','status=verified'])assert.equal((await query(params)).status,400);
 const old=await (await GET(new Request('https://example.test/api/archive/video-research'))).json();assert.equal(old.total,128);
});
test('legal-dong matching is paired with district and district/city records stay background',async()=>{
 const base={...videoCatalog.items[0],regionLinks:[{district:'성동구',legalDongs:['성수동1가'],administrativeDong:'성수1가1동',mentionedDongs:[],place:'성수동',scope:'미확인'},{district:'종로구',legalDongs:['세종로'],administrativeDong:'',mentionedDongs:[],place:'',scope:'미확인'}]};
 assert.equal(videoRelation(base,'성동구','성수동1가'),'legal_dong_candidate');assert.equal(videoRelation(base,'성동구','세종로'),'district_background');assert.equal(videoRelation(base,'광진구','성수동1가'),null);
 assert.equal(filterVideoCatalog([base],{district:'성동구',dong:'세종로'}).length,0);
 const place=await query(new URLSearchParams({district:'성동구',dong:'성수동1가',mode:'place',limit:'6'}));assert.ok(place.body.items.length<=6);assert.ok(place.body.items.every(i=>i.relation));
 const strict=await query(new URLSearchParams({district:'성동구',dong:'세종로'}));assert.equal(strict.body.total,0);
});
test('full text, provider and historical subject filters do not mistake publication dates for history',()=>{
 const base={...videoCatalog.items[0],historicalPeriods:['1890년대'],date:'2026-11-05'};
 assert.equal(filterVideoCatalog([base],{period:'before1900'}).length,1);assert.equal(filterVideoCatalog([base],{period:'from2000'}).length,0);
 assert.equal(filterVideoCatalog([{...base,historicalPeriods:[]}],{period:'unknown'}).length,1);
 const known=videoCatalog.items.find(i=>i.providers.length);assert.ok(filterVideoCatalog([known],{provider:known.providers[0]}).length);
 assert.equal(filterVideoCatalog([known],{query:'없는제목조합zzzz'}).length,0);
});
test('on-demand details bind raw columns, segments and original source to the requested video only',async()=>{
 const selected=videoCatalog.items.find(i=>i.source==='both');const detail=await videoDetails(selected.id);assert.ok(detail.records.length>=2);assert.deepEqual(detail.records.map(r=>r.ref),selected.refs);
 const allowed=new Set(detail.records.flatMap(r=>[r.ref,...r.supportingRefs]));assert.ok(detail.rows.every(row=>allowed.has(row.fileId==='legacy'?'legacy:'+row.originalId:`${row.fileId}:${row.sheet}:${row.row}`)));
 assert.equal(await videoDetails('video-not-found'),null);
 assert.equal((await query('id=not-valid')).status,400);assert.equal((await query('id=video-00000000000000000000')).status,404);
 const returned=await query('id='+selected.id);assert.equal(returned.status,200);assert.equal(returned.body.item.id,selected.id);
});
test('client panel imports no complete catalog or raw source rows at runtime',()=>{
 const panel=readFileSync(new URL('../app/components/VideoResearchPanel.tsx',import.meta.url),'utf8');assert.match(panel,/import type \{videoDetails\}/);assert.doesNotMatch(panel,/import .*from ['"]@\/data\//);assert.doesNotMatch(panel,/<iframe/);assert.match(panel,/verifiedTime&&segment.validTime/);
});
