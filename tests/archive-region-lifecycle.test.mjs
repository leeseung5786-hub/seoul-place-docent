import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import snapshot from '../data/official-code-lifecycle-2026-10-20.json';
import {seedRegions} from '../lib/archive-seed.ts';
import {regionReviewStats,listRegionReviews,verifyRegionAddress} from '../lib/archive-region-review.ts';
import {resolveLifecycleRow,verifyRegionLifecycle,verifyRegionOfficialCode} from '../lib/archive-region-lifecycle.ts';
import {archiveCoverage} from '../lib/archive-capture.ts';

function database(){
 const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON');
 for(const name of readdirSync(new URL('../drizzle/',import.meta.url)).filter(n=>n.endsWith('.sql')).sort())sql.exec(readFileSync(new URL('../drizzle/'+name,import.meta.url),'utf8'));
 for(const r of seedRegions())sql.prepare('INSERT INTO archive_regions (id,parent_id,name,level,official_code,aliases,source_url,source_note,as_of,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').run(r.id,r.parentId,r.name,r.level,r.officialCode,r.aliases,r.sourceUrl,r.sourceNote,r.asOf,r.createdAt);
 return {sql,prepare(query){return {values:[],bind(...v){this.values=v;return this;},async first(){return sql.prepare(query).get(...this.values)||null;},async all(){return {results:sql.prepare(query).all(...this.values)};},async run(){return sql.prepare(query).run(...this.values);}};},async batch(items){sql.exec('BEGIN');try{const results=[];for(const s of items)results.push(await s.run());sql.exec('COMMIT');return results;}catch(e){sql.exec('ROLLBACK');throw e;}}};
}
const id='dong-종로구-가회동',code='1111014600',input={regionId:id,expectedRevision:1,expectedCode:code};
const region={id,parent_id:'gu-종로구',name:'가회동',official_code:code};
const address={roadAddr:'서울특별시 종로구 북촌로 45-1 (가회동)',jibunAddr:'서울특별시 종로구 가회동 74',siNm:'서울특별시',sggNm:'종로구',emdNm:'가회동',admCd:code,bdMgtSn:'1111014600100790002018535',lnbrMnnm:'74',lnbrSlno:'0',mtYn:'0'};
const count=(d,table)=>d.sql.prepare('SELECT count(*) AS n FROM '+table).get().n;
async function observe(t,d,observedCode=code){
 t.mock.method(globalThis,'fetch',async()=>Response.json({results:{common:{errorCode:'0',totalCount:'1'},juso:[{...address,admCd:observedCode}]}}));
 return verifyRegionAddress(d,{regionId:id,expectedRevision:0,expectedCode:null},'fixture-address',{JUSO_API_KEY:'fixture-secret'});
}

test('official snapshot maps exactly all registered names and preserves state/date provenance',()=>{
 const legal=seedRegions().filter(x=>x.level==='legal_dong');
 assert.equal(snapshot.entries.length,467);assert.equal(new Set(snapshot.entries.map(x=>x.id)).size,467);
 assert.equal(snapshot.sourceRows,1112);assert.deepEqual(snapshot.sourceStates,{'현존':493,'폐지':619});
 assert.equal(snapshot.fileSha256,'00e482e0f2cc862a49a6d28ae511a81df70ac2f6e4935f8bc1142fb832271bf9');
 assert.equal(snapshot.zipSha256,'d5dd60146799664f0ccd857704b6f597955673dc627c2e90d3b88c095866d774');
 assert.equal(snapshot.sourceAsOf,null);assert.equal(snapshot.retrievedAt,'2026-10-20T10:41:31.000Z');
 for(const r of legal){const found=snapshot.entries.find(x=>x.id===r.id);assert.equal(found.name,`서울특별시 ${r.parentId.slice(3)} ${r.name}`);assert.equal(found.state,'현존');assert.equal(found.abolished,'');}
 assert.equal(snapshot.entries.find(x=>x.id===id).created,'');
});
test('lifecycle resolution requires exact ID, district and full legal name; ambiguous rows are rejected',()=>{
 assert.equal(resolveLifecycleRow(region,'종로구').status,'verified_current');
 for(const r of [{...region,id:'unknown'},{...region,name:'가회행정동'}])assert.throws(()=>resolveLifecycleRow(r,'종로구'),e=>e.code==='LIFECYCLE_SOURCE');
 assert.throws(()=>resolveLifecycleRow(region,'중구'),e=>e.code==='LIFECYCLE_SOURCE');
 const record=snapshot.entries.find(x=>x.id===id);
 assert.throws(()=>resolveLifecycleRow(region,'종로구',{...snapshot,entries:[record,record]}),e=>e.code==='LIFECYCLE_SOURCE');
});
test('malformed states, dates, rows and fingerprints never become verified lifecycle evidence',()=>{
 const record=snapshot.entries.find(x=>x.id===id);
 for(const patch of [{state:'추정'},{row:0},{row:2000},{created:'알 수 없음'},{abolished:'20200101'}])assert.throws(()=>resolveLifecycleRow(region,'종로구',{...snapshot,entries:[{...record,...patch}]}),e=>e.code==='LIFECYCLE_SOURCE');
 assert.throws(()=>resolveLifecycleRow(region,'종로구',{...snapshot,fileSha256:'missing'}),e=>e.code==='LIFECYCLE_SOURCE');
 assert.equal(resolveLifecycleRow(region,'종로구',{...snapshot,entries:[{...record,state:'폐지',abolished:'20200101'}]}).status,'verified_abolished');
});
test('lifecycle API refuses non-legal IDs, invalid CAS input and missing address observation without mutation',async()=>{
 const d=database();
 for(const regionId of ['missing','gu-종로구'])await assert.rejects(()=>verifyRegionLifecycle(d,{...input,regionId},'fixture'),e=>e.code==='REGION_NOT_FOUND');
 await assert.rejects(()=>verifyRegionLifecycle(d,{...input,expectedRevision:-1},'fixture'),e=>e.code==='REGION_INPUT');
 await assert.rejects(()=>verifyRegionLifecycle(d,{regionId:id,expectedRevision:0,expectedCode:null},'fixture'),e=>e.code==='LIFECYCLE_ADDRESS_REQUIRED');
 assert.equal(count(d,'archive_region_reviews'),0);assert.equal(count(d,'archive_audit'),0);
});
test('official state review appends evidence/audit and preserves address history, region identity and source data',async t=>{
 const d=database(),observed=await observe(t,d),before=d.sql.prepare('SELECT * FROM archive_regions WHERE id=?').get(id);
 const result=await verifyRegionLifecycle(d,input,'fixture-lifecycle');
 assert.equal(result.status,'verified_current');assert.equal(result.revision,2);assert.equal(result.officialCode,code);
 assert.deepEqual(d.sql.prepare('SELECT * FROM archive_regions WHERE id=?').get(id),before);
 const row=d.sql.prepare('SELECT * FROM archive_region_reviews WHERE id=?').get(result.reviewId),e=JSON.parse(row.evidence);
 assert.equal(e.officialLifecycle,'current');assert.equal(e.row.code,code);assert.equal(e.row.name,'서울특별시 종로구 가회동');assert.equal(e.row.state,'현존');
 assert.equal(e.row.created,null);assert.equal(e.row.abolished,null);assert.equal(e.sourceAsOf,null);assert.equal(e.addressReviewId,observed.reviewId);
 assert.equal(e.sourceLocator,`${snapshot.fileName} / Sheet0!A${e.row.number}:E${e.row.number}`);assert.equal(e.fileSha256,snapshot.fileSha256);
 assert.equal(row.actor,'fixture-lifecycle');assert.equal(JSON.parse(row.before_state).officialCode,code);assert.equal(row.before_state,row.after_state);
 assert.equal(count(d,'archive_region_reviews'),2);assert.equal(count(d,'archive_audit'),2);assert.equal(count(d,'archive_sources'),0);assert.equal(count(d,'archive_passages'),0);
 assert.equal(d.sql.prepare('SELECT status FROM archive_region_reviews WHERE id=?').get(observed.reviewId).status,'address_observed');
 const stats=await regionReviewStats(d);assert.equal(stats.reviewed,1);assert.equal(stats.addressObserved,1);assert.equal(stats.lifecycleChecked,1);assert.equal(stats.verifiedCurrent,1);assert.equal(stats.conflicts,0);
 const listing=await listRegionReviews(d);assert.equal(listing.items.find(x=>x.id===id).verification_status,'verified_current');
 const coverage=await archiveCoverage(d);assert.equal(coverage.dongs.find(x=>x.id===id).verification_status,'verified_current');
 assert.ok(!JSON.stringify(row).includes('fixture-secret'));
});
test('repeated lifecycle writes return the original ID/revision without duplicate audit and stale guards conflict',async t=>{
 const d=database();await observe(t,d);const first=await verifyRegionLifecycle(d,input,'first'),again=await verifyRegionLifecycle(d,input,'retry');
 assert.equal(again.unchanged,true);assert.equal(again.reviewId,first.reviewId);assert.equal(again.revision,2);assert.equal(count(d,'archive_audit'),2);
 await assert.rejects(()=>verifyRegionLifecycle(d,{...input,expectedRevision:0},'stale'),e=>e.code==='REGION_CONFLICT');
 await assert.rejects(()=>verifyRegionLifecycle(d,{...input,expectedCode:'1111014500'},'stale'),e=>e.code==='REGION_CONFLICT');
});
test('conflicting official snapshot code never overwrites the observed code',async t=>{
 const d=database(),wrong='1111014700';await observe(t,d,wrong);
 const result=await verifyRegionLifecycle(d,{...input,expectedCode:wrong},'fixture');assert.equal(result.status,'lifecycle_conflict');assert.equal(result.officialCode,wrong);
 assert.equal(d.sql.prepare('SELECT official_code FROM archive_regions WHERE id=?').get(id).official_code,wrong);
 const stats=await regionReviewStats(d);assert.equal(stats.conflicts,1);assert.equal(stats.verifiedCurrent,0);assert.equal(stats.lifecycleChecked,1);assert.equal(stats.addressObserved,1);
});
test('concurrent lifecycle reviewers commit exactly one revision and audit',async t=>{
 const d=database();await observe(t,d);const results=await Promise.allSettled([verifyRegionLifecycle(d,input,'one'),verifyRegionLifecycle(d,input,'two')]);
 assert.equal(results.filter(x=>x.status==='fulfilled').length,1);assert.equal(results.find(x=>x.status==='rejected').reason.code,'REGION_CONFLICT');assert.equal(count(d,'archive_region_reviews'),2);assert.equal(count(d,'archive_audit'),2);
});
test('failed lifecycle audit rolls the whole new review back without touching address history',async t=>{
 const d=database();await observe(t,d);d.sql.exec("CREATE TRIGGER fail_lifecycle BEFORE INSERT ON archive_audit WHEN NEW.action='region_lifecycle_verification' BEGIN SELECT RAISE(ABORT,'fixture'); END");
 await assert.rejects(()=>verifyRegionLifecycle(d,input,'fixture'),e=>e.code==='REGION_CONFLICT');assert.equal(count(d,'archive_region_reviews'),1);assert.equal(count(d,'archive_audit'),1);assert.equal((await regionReviewStats(d)).lifecycleChecked,0);
});
test('concurrent region edits invalidate lifecycle guards without writing a false verification',async t=>{
 const d=database();await observe(t,d);const batch=d.batch.bind(d);d.batch=async items=>{d.sql.prepare('UPDATE archive_regions SET source_note=? WHERE id=?').run('independent edit',id);return batch(items);};
 await assert.rejects(()=>verifyRegionLifecycle(d,input,'fixture'),e=>e.code==='REGION_CONFLICT');assert.equal(count(d,'archive_region_reviews'),1);assert.equal(count(d,'archive_audit'),1);
});
test('later address observations do not erase separately recorded lifecycle verification metrics',async t=>{
 const d=database();await observe(t,d);await verifyRegionLifecycle(d,input,'fixture');
 await verifyRegionAddress(d,{regionId:id,expectedRevision:2,expectedCode:code},'later',{JUSO_API_KEY:'fixture-secret'});
 const stats=await regionReviewStats(d);assert.equal(stats.addressObserved,1);assert.equal(stats.lifecycleChecked,1);assert.equal(stats.verifiedCurrent,1);
});

async function unobserved(t,d,rows=[]){
 t.mock.method(globalThis,'fetch',async()=>Response.json({results:{common:{errorCode:'0',totalCount:String(rows.length)},juso:rows}}));
 return verifyRegionAddress(d,{regionId:id,expectedRevision:0,expectedCode:null},'fixture-address',{JUSO_API_KEY:'fixture-secret'});
}
const emptyCodeInput={regionId:id,expectedRevision:1,expectedCode:null};
test('official-only code review requires a committed zero-exact-match address observation',async t=>{
 const d=database();
 await assert.rejects(()=>verifyRegionOfficialCode(d,{...emptyCodeInput,expectedRevision:0},'fixture'),e=>e.code==='OFFICIAL_CODE_REVIEW_REQUIRED');
 await unobserved(t,d,[{...address,emdNm:'가회행정동'}]);
 const result=await verifyRegionOfficialCode(d,emptyCodeInput,'fixture');
 assert.equal(result.officialCode,code);assert.equal(result.status,'verified_current');
 assert.equal(result.verificationBasis,'official_snapshot_only');
});
test('official-only review records exact snapshot provenance without claiming an address match',async t=>{
 const d=database(),old=await unobserved(t,d),before=d.sql.prepare('SELECT * FROM archive_regions WHERE id=?').get(id);
 const result=await verifyRegionOfficialCode(d,{...emptyCodeInput,officialCode:'invented',state:'폐지',sourceUrl:'https://example.com'},'fixture-official');
 const current=d.sql.prepare('SELECT * FROM archive_regions WHERE id=?').get(id);
 assert.deepEqual({...current,official_code:null},{...before});assert.equal(current.official_code,code);
 const review=d.sql.prepare('SELECT * FROM archive_region_reviews WHERE id=?').get(result.reviewId),e=JSON.parse(review.evidence);
 assert.equal(e.addressReviewId,old.reviewId);assert.equal(e.addressCode,null);assert.equal(e.addressObservationStatus,'unconfirmed');
 assert.equal(e.verificationBasis,'official_snapshot_only');assert.match(e.addressLimit,/첫 페이지/);assert.match(e.addressLimit,/부재/);
 assert.equal(e.row.code,code);assert.equal(e.row.state,'현존');assert.equal(e.fileSha256,snapshot.fileSha256);assert.equal(e.sourceAsOf,null);
 assert.equal(JSON.parse(review.before_state).officialCode,null);assert.equal(JSON.parse(review.after_state).officialCode,code);
 assert.equal(d.sql.prepare('SELECT status FROM archive_region_reviews WHERE id=?').get(old.reviewId).status,'unconfirmed');
 const stats=await regionReviewStats(d);assert.equal(stats.addressObserved,0);assert.equal(stats.addressUnconfirmed,1);assert.equal(stats.officialCodeOnly,1);assert.equal(stats.lifecycleChecked,1);assert.equal(stats.verifiedCurrent,1);
 assert.equal(count(d,'archive_sources'),0);assert.equal(count(d,'archive_passages'),0);assert.equal(count(d,'archive_audit'),2);
 assert.ok(!JSON.stringify(review).includes('fixture-secret'));
});
test('official-only review cannot replace an observed or pre-existing code',async t=>{
 const d=database();await observe(t,d);
 await assert.rejects(()=>verifyRegionOfficialCode(d,input,'fixture'),e=>e.code==='OFFICIAL_CODE_REVIEW_REQUIRED');
 assert.equal(count(d,'archive_region_reviews'),1);assert.equal(d.sql.prepare('SELECT official_code FROM archive_regions WHERE id=?').get(id).official_code,code);
});
test('ambiguous matching address codes cannot use the zero-match official-only path',async t=>{
 const d=database();await unobserved(t,d,[address,{...address,admCd:'1111014700'}]);
 await assert.rejects(()=>verifyRegionOfficialCode(d,emptyCodeInput,'fixture'),e=>e.code==='OFFICIAL_CODE_REVIEW_REQUIRED');
 assert.equal(count(d,'archive_region_reviews'),1);assert.equal(d.sql.prepare('SELECT official_code FROM archive_regions WHERE id=?').get(id).official_code,null);
});
test('official-only review rejects duplicate codes without changing either legal region',async t=>{
 const d=database();await unobserved(t,d);
 d.sql.prepare('UPDATE archive_regions SET official_code=? WHERE id=?').run(code,'dong-종로구-계동');
 await assert.rejects(()=>verifyRegionOfficialCode(d,emptyCodeInput,'fixture'),e=>e.code==='REGION_CODE_DUPLICATE');
 assert.equal(count(d,'archive_region_reviews'),1);assert.equal(count(d,'archive_audit'),1);
 assert.equal(d.sql.prepare('SELECT official_code FROM archive_regions WHERE id=?').get(id).official_code,null);
});
test('official-only retry is idempotent while stale revision or code guards fail',async t=>{
 const d=database();await unobserved(t,d);
 const first=await verifyRegionOfficialCode(d,emptyCodeInput,'first'),again=await verifyRegionOfficialCode(d,emptyCodeInput,'retry');
 assert.equal(again.unchanged,true);assert.equal(again.reviewId,first.reviewId);assert.equal(again.revision,2);assert.equal(count(d,'archive_audit'),2);
 await assert.rejects(()=>verifyRegionOfficialCode(d,{...emptyCodeInput,expectedRevision:0},'stale'),e=>e.code==='REGION_CONFLICT');
 await assert.rejects(()=>verifyRegionOfficialCode(d,{...emptyCodeInput,expectedCode:'1111014500'},'stale'),e=>e.code==='REGION_CONFLICT');
});
test('concurrent official-only reviews append exactly one code revision and audit',async t=>{
 const d=database();await unobserved(t,d);
 const results=await Promise.allSettled([verifyRegionOfficialCode(d,emptyCodeInput,'one'),verifyRegionOfficialCode(d,emptyCodeInput,'two')]);
 assert.equal(results.filter(x=>x.status==='fulfilled').length,1);assert.equal(results.find(x=>x.status==='rejected').reason.code,'REGION_CONFLICT');
 assert.equal(count(d,'archive_region_reviews'),2);assert.equal(count(d,'archive_audit'),2);
});
test('official-only code assignment and review roll back together on an audit error',async t=>{
 const d=database();await unobserved(t,d);
 d.sql.exec("CREATE TRIGGER fail_official BEFORE INSERT ON archive_audit WHEN NEW.action='region_lifecycle_verification' BEGIN SELECT RAISE(ABORT,'fixture'); END");
 await assert.rejects(()=>verifyRegionOfficialCode(d,emptyCodeInput,'fixture'),e=>e.code==='REGION_CONFLICT');
 assert.equal(count(d,'archive_region_reviews'),1);assert.equal(count(d,'archive_audit'),1);
 assert.equal(d.sql.prepare('SELECT official_code FROM archive_regions WHERE id=?').get(id).official_code,null);
});
test('a concurrent duplicate assignment invalidates the official-only transaction',async t=>{
 const d=database();await unobserved(t,d);const batch=d.batch.bind(d);
 d.batch=async items=>{d.sql.prepare('UPDATE archive_regions SET official_code=? WHERE id=?').run(code,'dong-종로구-계동');return batch(items);};
 await assert.rejects(()=>verifyRegionOfficialCode(d,emptyCodeInput,'fixture'),e=>e.code==='REGION_CONFLICT');
 assert.equal(count(d,'archive_region_reviews'),1);assert.equal(d.sql.prepare('SELECT official_code FROM archive_regions WHERE id=?').get(id).official_code,null);
});
