import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {saveArchiveSource,addArchivePassage} from '../lib/archive-db.ts';
import {listPassageReviewTargets,reviewArchivePassage,passageReviewStats,reviewDimensions} from '../lib/archive-passage-review.ts';
import {validatePassageCorrection,correctArchiveParaphrase,sourcePassageCorrections} from '../lib/archive-passage-correction.ts';
function database(){
 const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON');
 for(const n of readdirSync(new URL('../drizzle/',import.meta.url)).filter(n=>n.endsWith('.sql')).sort())sql.exec(readFileSync(new URL('../drizzle/'+n,import.meta.url),'utf8'));
 return {sql,prepare(q){return {values:[],bind(...v){this.values=v;return this;},async first(){return sql.prepare(q).get(...this.values)||null;},async all(){return {results:sql.prepare(q).all(...this.values)};},async run(){return sql.prepare(q).run(...this.values);}};},async batch(items){sql.exec('BEGIN');try{const out=[];for(const x of items)out.push(await x.run());sql.exec('COMMIT');return out;}catch(e){sql.exec('ROLLBACK');throw e;}}};
}
const src={title:'교정 시험 자료',institution:'서울역사편찬원',url:'https://history.seoul.go.kr/archive/correction-fixture',kind:'web',summary:'동명 위치 관계',regionIds:[]};
const count=(d,t)=>d.sql.prepare('SELECT count(*) AS n FROM '+t).get().n;
const get=async(d,id)=>(await listPassageReviewTargets(d,new URLSearchParams({pending:'false',sourceId:id}))).items[0];
async function fixture(kind='paraphrase'){
 const d=database(),source={...src,...(kind==='paraphrase'?{}:{rights:'KOGL1',rightsUrl:src.url,rightsNote:'fixture license',storageAllowed:true,reuseAllowed:true})},s=await saveArchiveSource(d,source,'fixture');
 const p=await addArchivePassage(d,s.id,{text:'성균관과 동학이 있던 지역의 이름이다.',locator:'동명 유래 첫 문단',textKind:kind},'fixture');
 let row=await get(d,s.id);
 const checks=Object.fromEntries(reviewDimensions.map(k=>[k,{result:'checked',note:'원문 위치와 명칭·전승·권리 한정을 대조했다.'}]));
 const evidence={sourceUrl:src.url,sourceLocator:'동명 유래 첫 문단',observedAt:new Date().toISOString(),sourceHash:'a'.repeat(64),classification:'factual',spatialScope:'neighborhood',scopeNote:'동네 맥락이며 건물·부지 동일성은 확인하지 않았다.',summary:'성균관 아래쪽이라는 위치와 동학의 소재를 구별했다.',checks};
 const reviewed=await reviewArchivePassage(d,{passageId:p.id,expectedRevision:0,expectedFingerprint:row.fingerprint,status:'needs_review',evidence:{...evidence,checks:{...checks,spatial:{result:'unresolved',note:'두 시설이 모두 동 안에 있었다고 읽힐 수 있다.'}}}},'first-reviewer');
 row=await get(d,s.id);
 const input={passageId:p.id,expectedReviewRevision:reviewed.revision,expectedCorrectionRevision:0,expectedFingerprint:row.fingerprint,text:'성균관 아래쪽에 있고 동학이 있었던 지역적 배경에서 이름을 설명한다.',reason:'성균관과 동학의 서로 다른 위치 관계를 원문에 맞게 구별한다.',evidence};
 return {d,s,p,row,input,evidence};
}
test('correction validates bounded paraphrases, fresh complete evidence and rejects arbitrary fields',async()=>{
 const {input}=await fixture();assert.equal(validatePassageCorrection(input).text,input.text);
 for(const bad of [{...input,sql:'DELETE FROM archive_passages'},{...input,text:''},{...input,text:'가'.repeat(1201)},{...input,reason:'짧다'},{...input,expectedCorrectionRevision:-1},{...input,evidence:{...input.evidence,sourceHash:null}},{...input,evidence:{...input.evidence,observedAt:'2000-01-01'}},{...input,evidence:{...input.evidence,classification:'conflict'}}])assert.throws(()=>validatePassageCorrection(bad));
});
test('correction preserves IDs, all source versions, rights, mapping and prior review; new text requires review',async()=>{
 const {d,s,p,input,row,evidence}=await fixture();
 const tables=['archive_sources','archive_versions','archive_passage_regions','archive_facts','archive_assets','archive_captures','archive_passage_reviews'];const before=Object.fromEntries(tables.map(t=>[t,d.sql.prepare('SELECT * FROM '+t).all()]));const audits=count(d,'archive_audit');
 const first=await correctArchiveParaphrase(d,input,'editor');assert.equal(first.unchanged,false);assert.equal(first.correctionRevision,1);
 for(const t of tables)assert.deepEqual(d.sql.prepare('SELECT * FROM '+t).all(),before[t]);
 const after=await get(d,s.id);assert.equal(after.id,p.id);assert.equal(after.version_id,row.version_id);assert.equal(after.locator,row.locator);assert.equal(after.text_kind,row.text_kind);assert.equal(after.text,input.text);assert.equal(after.fingerprint,first.fingerprint);assert.equal(after.latestReview.active,false);
 assert.equal((await passageReviewStats(d)).unreviewed,1);assert.equal(count(d,'archive_audit'),audits+1);
 const history=await sourcePassageCorrections(d,s.id);assert.equal(history.items.length,1);assert.equal(history.items[0].beforeText,row.text);assert.equal(history.items[0].afterText,input.text);assert.equal(history.items[0].priorReviewId,row.latestReview.id);assert.equal(history.items[0].active,true);
 const corrected=await reviewArchivePassage(d,{passageId:p.id,expectedRevision:1,expectedFingerprint:after.fingerprint,status:'content_checked',evidence},'second-reviewer');assert.equal(corrected.revision,2);assert.equal((await passageReviewStats(d)).contentChecked,1);
 const replay=await correctArchiveParaphrase(d,input,'retry');assert.equal(replay.correctionId,first.correctionId);assert.equal(replay.unchanged,true);assert.equal(count(d,'archive_passage_corrections'),1);assert.equal(count(d,'archive_audit'),audits+2);
});
test('correction refuses quotations, transcriptions, attached facts, wrong source and changed review revisions',async()=>{
 for(const kind of ['quotation','transcription']){const {d,input}=await fixture(kind);await assert.rejects(()=>correctArchiveParaphrase(d,input,'editor'),e=>e.code==='PASSAGE_CORRECTION_KIND');assert.equal(count(d,'archive_passage_corrections'),0);}
 const {d,input,p,s}=await fixture();
 await assert.rejects(()=>correctArchiveParaphrase(d,{...input,evidence:{...input.evidence,sourceUrl:'https://example.org/unrelated'}},'editor'),e=>e.code==='PASSAGE_CORRECTION_SOURCE');
 await assert.rejects(()=>correctArchiveParaphrase(d,{...input,expectedReviewRevision:0},'editor'),e=>e.code==='PASSAGE_CORRECTION_CONFLICT');
 d.sql.prepare("INSERT INTO archive_facts(id,source_id,passage_id,title,description,time_label,created_at) VALUES (?,?,?,?,?,?,?)").run('fact',s.id,p.id,'기존 연표','설명','미상',new Date().toISOString());
 await assert.rejects(()=>correctArchiveParaphrase(d,input,'editor'),e=>e.code==='PASSAGE_CORRECTION_KIND');assert.equal(count(d,'archive_passage_corrections'),0);
});
test('audit failure rolls correction and new text back together',async()=>{
 const {d,input,s,row}=await fixture();d.sql.exec("CREATE TRIGGER fail_correction BEFORE INSERT ON archive_audit WHEN NEW.action='passage_paraphrase_correction' BEGIN SELECT RAISE(ABORT,'fixture'); END");
 await assert.rejects(()=>correctArchiveParaphrase(d,input,'editor'),e=>e.code==='PASSAGE_CORRECTION_CONFLICT');assert.equal(count(d,'archive_passage_corrections'),0);assert.equal((await get(d,s.id)).text,row.text);assert.equal((await get(d,s.id)).latestReview.active,true);
});
test('atomic guard rejects edits to text, scopes, source metadata or latest review between read and commit',async()=>{
 for(const change of ['text','scope','source','review']){
  const {d,input,p,s,row}=await fixture(),batch=d.batch.bind(d),audits=count(d,'archive_audit');
  d.batch=async items=>{
   if(change==='text')d.sql.prepare('UPDATE archive_passages SET text=? WHERE id=?').run('다른 편집자의 새 문장이다.',p.id);
   if(change==='scope')d.sql.prepare('UPDATE archive_passages SET locator=? WHERE id=?').run('다른 원문 문단',p.id);
   if(change==='source')d.sql.prepare('UPDATE archive_sources SET rights_note=? WHERE id=?').run('변경된 권리 메모',s.id);
   if(change==='review')d.sql.prepare('INSERT INTO archive_passage_reviews SELECT ?,passage_id,version_id,source_version,revision+1,status,content_hash,snapshot_json,evidence,actor,checked_at FROM archive_passage_reviews WHERE id=?').run('new-review',row.latestReview.id);
   return batch(items);
  };
  await assert.rejects(()=>correctArchiveParaphrase(d,input,'racing'),e=>e.code==='PASSAGE_CORRECTION_CONFLICT');assert.equal(count(d,'archive_passage_corrections'),0);assert.equal(count(d,'archive_audit'),audits);assert.notEqual((await get(d,s.id)).text,input.text);
 }
});
test('two concurrent corrections commit one revision and retry preserves identity',async()=>{
 const {d,input,s}=await fixture(),out=await Promise.allSettled([correctArchiveParaphrase(d,input,'one'),correctArchiveParaphrase(d,input,'two')]);
 assert.equal(out.filter(x=>x.status==='fulfilled').length,1);assert.equal(count(d,'archive_passage_corrections'),1);const first=out.find(x=>x.status==='fulfilled').value;
 const replay=await correctArchiveParaphrase(d,input,'retry');assert.equal(replay.correctionId,first.correctionId);assert.equal((await sourcePassageCorrections(d,s.id)).items.length,1);
});
test('later catalog updates invalidate history active flag and reject stale correction replays',async()=>{
 const {d,input,s}=await fixture();await correctArchiveParaphrase(d,input,'editor');await saveArchiveSource(d,{...src,title:'새 목록'},'catalog-editor',s.id,1);
 assert.equal((await sourcePassageCorrections(d,s.id)).items[0].active,false);await assert.rejects(()=>correctArchiveParaphrase(d,input,'retry'),e=>e.code==='PASSAGE_CORRECTION_REVIEW');
});
test('correction cannot relabel district context and handles newlines and unicode in canonical snapshots',async()=>{
 const {d,input,s}=await fixture();input.text='원문에 맞춘 줄바꿈\n성균관 아래쪽과 동학의 위치를 구별한다. 😀';const first=await correctArchiveParaphrase(d,input,'editor');assert.equal((await get(d,s.id)).fingerprint,first.fingerprint);
 const f=await fixture();f.input.evidence.spatialScope='district';await assert.rejects(()=>correctArchiveParaphrase(f.d,f.input,'editor'),e=>e.code==='PASSAGE_CORRECTION_SCOPE');
});
