import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {saveArchiveSource,addArchivePassage} from '../lib/archive-db.ts';
import {listPassageReviewTargets,passageReviewStats,sourcePassageReviews,reviewArchivePassage,validatePassageReview,reviewDimensions} from '../lib/archive-passage-review.ts';
import {archiveCoverage} from '../lib/archive-capture.ts';

function database(){
 const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON');
 for(const n of readdirSync(new URL('../drizzle/',import.meta.url)).filter(n=>n.endsWith('.sql')).sort())sql.exec(readFileSync(new URL('../drizzle/'+n,import.meta.url),'utf8'));
 return {sql,prepare(q){return {values:[],bind(...v){this.values=v;return this;},async first(){return sql.prepare(q).get(...this.values)||null;},async all(){return {results:sql.prepare(q).all(...this.values)};},async run(){return sql.prepare(q).run(...this.values);}};},async batch(items){sql.exec('BEGIN');try{const out=[];for(const x of items)out.push(await x.run());sql.exec('COMMIT');return out;}catch(e){sql.exec('ROLLBACK');throw e;}}};
}
const src={title:'검토 시험 자료',institution:'서울역사편찬원',url:'https://history.seoul.go.kr/archive/fixture',kind:'web',summary:'가회동에 대한 자료',regionIds:[]};
const count=(d,t)=>d.sql.prepare('SELECT count(*) AS n FROM '+t).get().n;
async function fixture(){
 const d=database(),s=await saveArchiveSource(d,src,'fixture'),p=await addArchivePassage(d,s.id,{text:'가회동의 옛 지명에 관한 전승을 소개한다.',locator:'가회동 > 동명 유래',textKind:'paraphrase'},'fixture');
 const row=(await listPassageReviewTargets(d,new URLSearchParams())).items[0];
 const checks=Object.fromEntries(reviewDimensions.map(k=>[k,{result:'checked',note:k==='rights'?'짧은 재서술만 대조하며 원문 재사용 허락은 별도다.':'제공기관 문단과 현재 본문 표기를 직접 대조했다.'}]));
 const input={passageId:p.id,expectedRevision:0,expectedFingerprint:row.fingerprint,status:'content_checked',evidence:{sourceUrl:src.url,sourceLocator:'가회동 항목 > 동명 유래 문단',observedAt:new Date().toISOString(),sourceHash:null,classification:'tradition',spatialScope:'neighborhood',scopeNote:'가회동 동네의 유래 설명이며 개별 부지 동일성은 미검토다.',summary:'전승이라는 한정을 보존한 재서술이 원문과 일치한다.',checks}};
 return {d,s,p,row,input};
}
test('passage queue distinguishes actual current content from catalog metadata and bounds cursor/filter input',async()=>{
 const {d,input}=await fixture();const q=await listPassageReviewTargets(d,new URLSearchParams({limit:'1'}));assert.equal(q.items.length,1);assert.equal(q.items[0].fingerprint.length,64);assert.equal(q.stats.currentPassages,1);assert.equal(q.stats.unreviewed,1);
 for(const params of [{limit:'31'},{limit:'NaN'},{textKind:'arbitrary'}])await assert.rejects(()=>listPassageReviewTargets(d,new URLSearchParams(params)),e=>e.code==='PASSAGE_REVIEW_INPUT');
 assert.equal((await listPassageReviewTargets(d,new URLSearchParams({after:"' OR 1=1 --",sourceId:'missing'}))).items.length,0);
 assert.equal(validatePassageReview(input).evidence.classification,'tradition');
});
test('review validation refuses unsupported scope, wrong provenance, future dates and unresolved approval',async()=>{
 const {d,input}=await fixture();
 const bad=[{...input,evidence:{...input.evidence,spatialScope:['district']}},{...input,evidence:{...input.evidence,spatialScope:{}}},{...input,sql:'DELETE FROM archive_sources'},{...input,expectedRevision:-1},{...input,evidence:{...input.evidence,spatialScope:'building'}},{...input,evidence:{...input.evidence,observedAt:'2099-01-01T00:00:00Z'}},{...input,evidence:{...input.evidence,classification:'conflict'}},{...input,evidence:{...input.evidence,checks:{...input.evidence.checks,names:{result:'unresolved',note:'명칭이 아직 확인되지 않았다.'}}}},{...input,evidence:{...input.evidence,checks:{...input.evidence.checks,rights:{result:'not_applicable',note:'권리 확인을 생략하려 한다.'}}}},{...input,evidence:{...input.evidence,checks:{...input.evidence.checks,tradition:{result:'not_applicable',note:'전승의 한정을 확인하지 않았다.'}}}}];
 for(const x of bad)assert.throws(()=>validatePassageReview(x),e=>e.code==='PASSAGE_REVIEW_INPUT');
 await assert.rejects(()=>reviewArchivePassage(d,{...input,evidence:{...input.evidence,sourceUrl:'https://example.org/unrelated'}},'reviewer'),e=>e.code==='PASSAGE_REVIEW_SOURCE');assert.equal(count(d,'archive_passage_reviews'),0);
});
test('committed content review appends evidence and audit without changing source versions, rights, scope or facts',async()=>{
 const {d,input,p,s}=await fixture(),source=d.sql.prepare('SELECT * FROM archive_sources').all(),versions=d.sql.prepare('SELECT * FROM archive_versions').all(),old=d.sql.prepare('SELECT * FROM archive_passages').get(),auditBefore=count(d,'archive_audit');
 const first=await reviewArchivePassage(d,input,'fixture-reviewer');assert.equal(first.status,'content_checked');assert.equal(first.revision,1);
 assert.deepEqual(d.sql.prepare('SELECT * FROM archive_sources').all(),source);assert.deepEqual(d.sql.prepare('SELECT * FROM archive_versions').all(),versions);
 assert.deepEqual({...d.sql.prepare('SELECT * FROM archive_passages').get(),review_status:old.review_status},{...old});assert.equal(count(d,'archive_facts'),0);assert.equal(count(d,'archive_passage_regions'),0);assert.equal(count(d,'archive_audit'),auditBefore+1);
 const r=d.sql.prepare('SELECT * FROM archive_passage_reviews').get();assert.equal(r.actor,'fixture-reviewer');assert.equal(r.passage_id,p.id);assert.equal(r.content_hash,input.expectedFingerprint);assert.equal(JSON.parse(r.evidence).classification,'tradition');
 const listing=await sourcePassageReviews(d,s.id);assert.equal(listing.items[0].active,true);assert.match(listing.scopeNote,/부지/);assert.equal((await passageReviewStats(d)).contentChecked,1);assert.equal((await listPassageReviewTargets(d,new URLSearchParams())).items.length,0);
});
test('identical retry returns the same review while altered evidence with a stale revision conflicts',async()=>{
 const {d,input}=await fixture();const first=await reviewArchivePassage(d,input,'one'),before=count(d,'archive_audit'),retry=await reviewArchivePassage(d,input,'retry');assert.equal(retry.reviewId,first.reviewId);assert.equal(retry.unchanged,true);assert.equal(count(d,'archive_audit'),before);assert.equal(count(d,'archive_passage_reviews'),1);
 await assert.rejects(()=>reviewArchivePassage(d,{...input,evidence:{...input.evidence,summary:'기존 요청과 다른 검토 내용이다.'}},'stale'),e=>e.code==='PASSAGE_REVIEW_CONFLICT');
});
test('concurrent passage reviews commit exactly one revision and audit',async()=>{
 const {d,input}=await fixture(),before=count(d,'archive_audit');const r=await Promise.allSettled([reviewArchivePassage(d,input,'one'),reviewArchivePassage(d,input,'two')]);assert.equal(r.filter(x=>x.status==='fulfilled').length,1);assert.equal(count(d,'archive_passage_reviews'),1);assert.equal(count(d,'archive_audit'),before+1);
});
test('failure to record audit rolls review and passage status back together',async()=>{
 const {d,input}=await fixture();d.sql.exec("CREATE TRIGGER fail_review BEFORE INSERT ON archive_audit WHEN NEW.action='passage_content_review' BEGIN SELECT RAISE(ABORT,'fixture'); END");
 await assert.rejects(()=>reviewArchivePassage(d,input,'reviewer'),e=>e.code==='PASSAGE_REVIEW_CONFLICT');assert.equal(count(d,'archive_passage_reviews'),0);assert.equal(d.sql.prepare('SELECT review_status FROM archive_passages').get().review_status,'pending');
});
test('text or metadata changed after reading invalidates the fingerprint',async()=>{
 for(const change of ['text','metadata']){const {d,input,p,s}=await fixture();if(change==='text')d.sql.prepare('UPDATE archive_passages SET text=? WHERE id=?').run('다른 본문으로 바뀌었다.',p.id);else await saveArchiveSource(d,{...src,title:'새 자료명'},'other',s.id,1);await assert.rejects(()=>reviewArchivePassage(d,input,'stale'),e=>e.code==='PASSAGE_REVIEW_CONFLICT');assert.equal(count(d,'archive_passage_reviews'),0);}
});
test('a concurrent text or geographic mapping edit invalidates the atomic write guard',async()=>{
 for(const change of ['text','scope']){const {d,input,p}=await fixture(),batch=d.batch.bind(d);d.batch=async items=>{if(change==='text')d.sql.prepare('UPDATE archive_passages SET locator=? WHERE id=?').run('바뀐 문단 위치',p.id);else {d.sql.prepare('INSERT INTO archive_regions (id,name,level,source_url,as_of,created_at) VALUES (?,?,?,?,?,?)').run('test-dong','가회동','legal_dong',src.url,'2026-10-21',new Date().toISOString());d.sql.prepare('INSERT INTO archive_passage_regions (id,passage_id,region_id,label,relation,basis) VALUES (?,?,?,?,?,?)').run('new-scope',p.id,'test-dong','가회동','exact_name','독립 분류 수정');}return batch(items);};await assert.rejects(()=>reviewArchivePassage(d,input,'stale'),e=>e.code==='PASSAGE_REVIEW_CONFLICT');assert.equal(count(d,'archive_passage_reviews'),0);assert.equal(d.sql.prepare('SELECT review_status FROM archive_passages').get().review_status,'pending');}
});
test('later catalog changes display the old review as stale and return the passage to the queue',async()=>{
 const {d,input,s}=await fixture();await reviewArchivePassage(d,input,'reviewer');await saveArchiveSource(d,{...src,subjectPeriod:'독립 수정'},'other',s.id,1);const q=await listPassageReviewTargets(d,new URLSearchParams());assert.equal(q.stats.currentPassages,1);assert.equal(q.stats.contentChecked,0);assert.equal(q.stats.unreviewed,1);assert.equal(q.items.length,1);assert.equal((await sourcePassageReviews(d,s.id)).items[0].active,false);
});
test('superseded body versions cannot be newly reviewed or counted as current',async()=>{
 const {d,input,s}=await fixture();await reviewArchivePassage(d,input,'reviewer');await saveArchiveSource(d,{...src,title:'수정본'},'other',s.id,1);await addArchivePassage(d,s.id,{text:'수정된 현행 본문이다.',locator:'새 문단',textKind:'paraphrase'},'other');await assert.rejects(()=>reviewArchivePassage(d,{...input,expectedRevision:1},'old'),e=>e.code==='PASSAGE_NOT_CURRENT');const stats=await passageReviewStats(d);assert.equal(stats.currentPassages,1);assert.equal(stats.unreviewed,1);assert.equal(stats.contentChecked,0);assert.equal(count(d,'archive_passages'),2);
});
test('an unresolved comparison is recorded separately and cannot inflate completed counts',async()=>{
 const {d,input}=await fixture();input.status='needs_review';input.evidence.classification='conflict';input.evidence.checks.chronology={result:'unresolved',note:'본문 연도와 원문 표기가 상충한다.'};await reviewArchivePassage(d,input,'reviewer');const stats=await passageReviewStats(d);assert.equal(stats.reviewed,1);assert.equal(stats.needsReview,1);assert.equal(stats.contentChecked,0);assert.equal(stats.remaining,1);assert.equal((await listPassageReviewTargets(d,new URLSearchParams())).items.length,1);
});
test('coverage stops counting an older review when source metadata changes without replacing the captured passage',async()=>{
 const {d,input,p,s,row}=await fixture(),now=new Date().toISOString();
 for(const [id,parent,name,level] of [['fixture-gu',null,'시험구','district'],['fixture-dong','fixture-gu','가회동','legal_dong']])d.sql.prepare('INSERT INTO archive_regions (id,parent_id,name,level,source_url,as_of,created_at) VALUES (?,?,?,?,?,?,?)').run(id,parent,name,level,src.url,'2026-10-21',now);
 d.sql.prepare('INSERT INTO archive_passage_regions (id,passage_id,region_id,label,relation,basis) VALUES (?,?,?,?,?,?)').run('scope',p.id,'fixture-dong','가회동','exact_name','원문 명칭 대조');
 d.sql.prepare('INSERT INTO archive_captures (id,source_id,version_id,batch_id,fingerprint,raw_metadata,source_locator,attribution,rights_evidence,period_label,date_precision,captured_at,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').run('capture',s.id,row.version_id,'fixture','a'.repeat(64),'{}','가회동 문단','fixture','짧은 자체 재서술','','unknown',now,now);
 input.expectedFingerprint=(await listPassageReviewTargets(d,new URLSearchParams())).items[0].fingerprint;await reviewArchivePassage(d,input,'reviewer');
 assert.equal((await archiveCoverage(d)).dongs[0].reviewed_count,1);
 await saveArchiveSource(d,{...src,subjectPeriod:'목록 시기 수정'},'other',s.id,1);
 const c=(await archiveCoverage(d)).dongs[0];assert.equal(c.passage_count,1);assert.equal(c.reviewed_count,0);
});
async function scopeFixture(level='district',relation='district_context'){
 const f=await fixture(),now=new Date().toISOString();
 f.d.sql.prepare('INSERT INTO archive_regions (id,name,level,source_url,as_of,created_at) VALUES (?,?,?,?,?,?)').run('scope-region','서초구',level,src.url,'2026-10-22',now);
 f.d.sql.prepare('INSERT INTO archive_passage_regions (id,passage_id,region_id,label,relation,basis) VALUES (?,?,?,?,?,?)').run('district-scope',f.p.id,'scope-region','서초구',relation,'기존 자치구 맥락 연결');
 f.input.expectedFingerprint=(await listPassageReviewTargets(f.d,new URLSearchParams())).items[0].fingerprint;
 f.input.evidence.spatialScope='district';f.input.evidence.scopeNote='서초구 전체 행정 변천의 맥락이며 개별 동·부지에 확대하지 않는다.';
 return f;
}
test('district review persists the exact scope and audit while retaining mappings, versions and retry identity',async()=>{
 const {d,input,s}=await scopeFixture(),scopes=d.sql.prepare('SELECT * FROM archive_passage_regions').all(),versions=d.sql.prepare('SELECT * FROM archive_versions').all(),before=count(d,'archive_audit');
 const result=await reviewArchivePassage(d,input,'district-reviewer'),listed=(await sourcePassageReviews(d,s.id)).items[0];
 assert.equal(listed.evidence.spatialScope,'district');assert.equal(listed.status,'content_checked');assert.equal(listed.active,true);
 assert.deepEqual(d.sql.prepare('SELECT * FROM archive_passage_regions').all(),scopes);assert.deepEqual(d.sql.prepare('SELECT * FROM archive_versions').all(),versions);
 const retry=await reviewArchivePassage(d,input,'retry');assert.equal(retry.reviewId,result.reviewId);assert.equal(retry.unchanged,true);assert.equal(count(d,'archive_audit'),before+1);
});
test('district evidence cannot relabel an unmapped, legal-dong, exact-name or mixed-scope passage',async()=>{
 for(const variation of ['none','level','relation','mixed']){
  const {d,input,p}=variation==='none'?await fixture():await scopeFixture(variation==='level'?'legal_dong':'district',variation==='relation'?'exact_name':'district_context');
  input.evidence.spatialScope='district';
  if(variation==='mixed'){
   d.sql.prepare('INSERT INTO archive_regions (id,name,level,source_url,as_of,created_at) VALUES (?,?,?,?,?,?)').run('extra-dong','서초동','legal_dong',src.url,'2026-10-22',new Date().toISOString());
   d.sql.prepare('INSERT INTO archive_passage_regions (id,passage_id,region_id,label,relation,basis) VALUES (?,?,?,?,?,?)').run('extra-scope',p.id,'extra-dong','서초동','exact_name','독립 동명 연결');
   input.expectedFingerprint=(await listPassageReviewTargets(d,new URLSearchParams())).items[0].fingerprint;
  }
  const audits=count(d,'archive_audit');await assert.rejects(()=>reviewArchivePassage(d,input,'reviewer'),e=>e.code==='PASSAGE_REVIEW_SCOPE');
  assert.equal(count(d,'archive_passage_reviews'),0);assert.equal(count(d,'archive_audit'),audits);assert.equal(d.sql.prepare('SELECT review_status FROM archive_passages').get().review_status,'pending');
 }
});
test('a district-only passage cannot be approved as neighborhood scope and concurrent remapping invalidates the guard',async()=>{
 const {d,input}=await scopeFixture();input.evidence.spatialScope='neighborhood';await assert.rejects(()=>reviewArchivePassage(d,input,'reviewer'),e=>e.code==='PASSAGE_REVIEW_SCOPE');assert.equal(count(d,'archive_passage_reviews'),0);
 input.evidence.spatialScope='district';const batch=d.batch.bind(d);d.batch=async statements=>{d.sql.prepare("UPDATE archive_passage_regions SET relation='exact_name' WHERE id='district-scope'").run();return batch(statements);};
 await assert.rejects(()=>reviewArchivePassage(d,input,'racing-reviewer'),e=>e.code==='PASSAGE_REVIEW_CONFLICT');assert.equal(count(d,'archive_passage_reviews'),0);assert.equal(d.sql.prepare('SELECT review_status FROM archive_passages').get().review_status,'pending');
});
