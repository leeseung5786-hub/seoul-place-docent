import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {seedRegions} from '../lib/archive-seed.ts';
import {listRegionReviews,regionReviewStats,verifyRegionAddress,validateRegionReviewInput} from '../lib/archive-region-review.ts';
import {archiveCoverage} from '../lib/archive-capture.ts';

function database(){
 const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON');
 for(const name of readdirSync(new URL('../drizzle/',import.meta.url)).filter(n=>n.endsWith('.sql')).sort())sql.exec(readFileSync(new URL('../drizzle/'+name,import.meta.url),'utf8'));
 for(const r of seedRegions())sql.prepare('INSERT INTO archive_regions (id,parent_id,name,level,official_code,aliases,source_url,source_note,as_of,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').run(r.id,r.parentId,r.name,r.level,r.officialCode,r.aliases,r.sourceUrl,r.sourceNote,r.asOf,r.createdAt);
 return {sql,prepare(query){return {values:[],bind(...v){this.values=v;return this;},async first(){return sql.prepare(query).get(...this.values)||null;},async all(){return {results:sql.prepare(query).all(...this.values)};},async run(){return sql.prepare(query).run(...this.values);}};},async batch(items){sql.exec('BEGIN');try{const results=[];for(const s of items)results.push(await s.run());sql.exec('COMMIT');return results;}catch(e){sql.exec('ROLLBACK');throw e;}}};
}
const id='dong-종로구-가회동',input={regionId:id,expectedRevision:0,expectedCode:null},secrets={JUSO_API_KEY:'fixture-secret'};
const address={roadAddr:'서울특별시 종로구 북촌로 45-1 (가회동)',jibunAddr:'서울특별시 종로구 가회동 74',siNm:'서울특별시',sggNm:'종로구',emdNm:'가회동',admCd:'1111014600',bdMgtSn:'1111014600100790002018535',lnbrMnnm:'74',lnbrSlno:'0',mtYn:'0'};
function provider(t,rows=[address],hook){let calls=0;t.mock.method(globalThis,'fetch',async url=>{calls++;assert.equal(url.hostname,'business.juso.go.kr');assert.equal(url.searchParams.get('keyword'),'서울특별시 종로구 가회동');if(hook)await hook();return Response.json({results:{common:{errorCode:'0',totalCount:String(rows.length)},juso:rows}});});return ()=>calls;}
const count=(d,table)=>d.sql.prepare('SELECT count(*) AS n FROM '+table).get().n;

test('rejects invalid versions, unregistered names and non-legal regions before fetching',async t=>{
 for(const bad of [{}, {...input,expectedRevision:-1},{...input,expectedCode:'administrative'},{...input,expectedRevision:0.5}])assert.throws(()=>validateRegionReviewInput(bad),e=>e.code==='REGION_INPUT');
 const d=database(),calls=provider(t);
 for(const regionId of ['not-registered','gu-종로구'])await assert.rejects(()=>verifyRegionAddress(d,{...input,regionId},'test',secrets),e=>e.code==='REGION_NOT_FOUND');
 assert.equal(calls(),0);assert.equal(count(d,'archive_region_reviews'),0);
});
test('records exact official address fields with version/audit and preserves original region identity and source',async t=>{
 const d=database(),before=d.sql.prepare('SELECT * FROM archive_regions WHERE id=?').get(id);provider(t,[address,{...address,lnbrMnnm:'75',jibunAddr:'서울특별시 종로구 가회동 75'}]);
 const result=await verifyRegionAddress(d,input,'test-reviewer',secrets);
 assert.equal(result.status,'address_observed');assert.equal(result.officialCode,address.admCd);assert.equal(result.matched,2);
 const after=d.sql.prepare('SELECT * FROM archive_regions WHERE id=?').get(id);assert.deepEqual({...after,official_code:null},{...before});
 const review=d.sql.prepare('SELECT * FROM archive_region_reviews').get();assert.equal(review.revision,1);assert.equal(review.actor,'test-reviewer');
 const evidence=JSON.parse(review.evidence);assert.equal(evidence.officialLifecycle,'not_checked');assert.equal(evidence.matched[0].emdNm,'가회동');assert.ok(evidence.observedAt);assert.match(evidence.sourceLocator,/results.juso/);
 assert.ok(!JSON.stringify(review).includes('fixture-secret'));assert.ok(!review.evidence.includes('token'));assert.equal(JSON.parse(review.before_state).officialCode,null);assert.equal(JSON.parse(review.after_state).officialCode,address.admCd);
 assert.equal(count(d,'archive_audit'),1);assert.equal(count(d,'archive_sources'),0);assert.equal(count(d,'archive_passages'),0);
 const listing=await listRegionReviews(d);assert.equal(listing.stats.addressObserved,1);assert.equal(listing.stats.withCode,3);assert.equal(listing.items.find(r=>r.id===id).review_revision,1);
 const coverage=await archiveCoverage(d);assert.equal(coverage.dongs.find(r=>r.id===id).official_code,address.admCd);assert.equal(coverage.dongs.find(r=>r.id===id).reviewed_count,0);
});
test('same-name administrative or substring results cannot establish a legal-dong code',async t=>{
 const d=database();provider(t,[{...address,emdNm:'가회행정동'}]);
 const result=await verifyRegionAddress(d,input,'test',secrets);assert.equal(result.status,'unconfirmed');assert.equal(result.officialCode,null);assert.equal((await regionReviewStats(d)).unconfirmed,1);
});
test('ambiguous official codes remain unconfirmed',async t=>{
 const d=database();provider(t,[address,{...address,admCd:'1111014700'}]);const result=await verifyRegionAddress(d,input,'test',secrets);assert.equal(result.status,'unconfirmed');assert.equal(result.officialCode,null);
});
test('conflicting existing code remains unchanged and receives a separate conflict record',async t=>{
 const d=database();d.sql.prepare('UPDATE archive_regions SET official_code=? WHERE id=?').run('1111014500',id);provider(t);
 const result=await verifyRegionAddress(d,{...input,expectedCode:'1111014500'},'test',secrets);assert.equal(result.status,'code_conflict');assert.equal(result.officialCode,'1111014500');assert.equal((await regionReviewStats(d)).conflicts,1);
});
test('one observed code cannot silently link two different legal-dong IDs',async t=>{
 const d=database();d.sql.prepare('UPDATE archive_regions SET official_code=? WHERE id=?').run(address.admCd,'dong-종로구-계동');provider(t);
 const result=await verifyRegionAddress(d,input,'test',secrets);assert.equal(result.status,'code_conflict');assert.equal(result.officialCode,null);
});
test('repeating a committed request returns its revision without duplicate writes or upstream calls',async t=>{
 const d=database(),calls=provider(t);const first=await verifyRegionAddress(d,input,'test',secrets),again=await verifyRegionAddress(d,input,'test',secrets);
 assert.equal(again.unchanged,true);assert.equal(first.reviewId,again.reviewId);assert.equal(calls(),1);assert.equal(count(d,'archive_region_reviews'),1);assert.equal(count(d,'archive_audit'),1);
 await assert.rejects(()=>verifyRegionAddress(d,{...input,expectedCode:'1111010100'},'test',secrets),e=>e.code==='REGION_CONFLICT');
});
test('concurrent reviewers commit exactly one revision and one audit',async t=>{
 const d=database();provider(t);const results=await Promise.allSettled([verifyRegionAddress(d,input,'first',secrets),verifyRegionAddress(d,input,'second',secrets)]);
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.find(r=>r.status==='rejected').reason.code,'REGION_CONFLICT');assert.equal(count(d,'archive_region_reviews'),1);assert.equal(count(d,'archive_audit'),1);
});
test('upstream failures do not masquerade as a completed geographic review',async t=>{
 const d=database();t.mock.method(globalThis,'fetch',async()=>new Response('temporarily unavailable',{status:503}));
 await assert.rejects(()=>verifyRegionAddress(d,input,'test',secrets),e=>e.code==='UPSTREAM_HTTP');assert.equal(count(d,'archive_region_reviews'),0);assert.equal(count(d,'archive_audit'),0);
});
test('a failed region update rolls back the revision and audit together',async t=>{
 const d=database();provider(t);d.sql.exec("CREATE TRIGGER fail_region BEFORE UPDATE ON archive_regions BEGIN SELECT RAISE(ABORT,'fixture'); END");
 await assert.rejects(()=>verifyRegionAddress(d,input,'test',secrets),e=>e.code==='REGION_CONFLICT');assert.equal(count(d,'archive_region_reviews'),0);assert.equal(count(d,'archive_audit'),0);assert.equal(d.sql.prepare('SELECT official_code FROM archive_regions WHERE id=?').get(id).official_code,null);
});
