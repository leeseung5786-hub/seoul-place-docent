import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {saveArchiveSource,addArchivePassage} from '../lib/archive-db.ts';
import {listPassageReviewTargets} from '../lib/archive-passage-review.ts';
import {validateOriginalObservation,officialOriginalUrl,originalTextWindow,fetchOfficialOriginal,observeArchiveOriginal,listOriginalObservations} from '../lib/archive-original-observation.ts';

const url='https://www.gangseo.seoul.kr/kids/kids010501';
const body='<html><title>공식 지명 안내</title><script>염창동 삭제할 스크립트</script><p>염창동은 소금 보관 창고라는 설명이다. &amp; &#xC11C;&#50872;</p></html>';
const response=(text=body)=>new Response(text,{headers:{'content-type':'text/html; charset=utf-8'}});
const count=(d,t)=>d.sql.prepare('SELECT count(*) AS n FROM '+t).get().n;
function database(){
 const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON');
 for(const name of readdirSync(new URL('../drizzle/',import.meta.url)).filter(n=>n.endsWith('.sql')).sort())sql.exec(readFileSync(new URL('../drizzle/'+name,import.meta.url),'utf8'));
 return {sql,prepare(q){return {values:[],bind(...v){this.values=v;return this;},async first(){return sql.prepare(q).get(...this.values)||null;},async all(){return {results:sql.prepare(q).all(...this.values)};},async run(){return sql.prepare(q).run(...this.values);}};},async batch(items){sql.exec('BEGIN');try{const out=[];for(const item of items)out.push(await item.run());sql.exec('COMMIT');return out;}catch(error){sql.exec('ROLLBACK');throw error;}}};
}
async function fixture(sourceUrl=url){
 const d=database(),s=await saveArchiveSource(d,{title:'서울 염창동 원문 확인',institution:'강서구',url:sourceUrl,kind:'web',summary:'염창동 설명',regionIds:[]},'fixture');
 const p=await addArchivePassage(d,s.id,{text:'소금 보관 시설에서 이름을 설명한다.',textKind:'paraphrase',locator:'염창동 문단'},'fixture');
 const row=(await listPassageReviewTargets(d,new URLSearchParams())).items[0];
 return {d,s,p,row,input:{passageId:p.id,expectedFingerprint:row.fingerprint,requestId:'fixture-request-1',searchText:'염창동'}};
}
test('original observation validates its narrow shape and never accepts a caller-supplied URL or SQL',()=>{
 const p={passageId:'id',expectedFingerprint:'a'.repeat(64),requestId:'request-1',searchText:'염창동'};
 assert.deepEqual(validateOriginalObservation(p),p);
 for(const bad of [{...p,url:'https://example.org'},{...p,sql:'DELETE'},{...p,expectedFingerprint:'bad'},{...p,requestId:'../x'},{...p,searchText:'\n'},{...p,searchText:'a'.repeat(81)},null,[]])assert.throws(()=>validateOriginalObservation(bad),e=>e.code==='ORIGINAL_OBSERVATION_INPUT');
});
test('official URLs reject private addresses, credentials, other hosts, ports and cross-institution redirects',()=>{
 for(const bad of ['http://www.gangseo.seoul.kr/a','https://127.0.0.1/a','https://[::1]/','https://user@www.gangseo.seoul.kr/a','https://www.gangseo.seoul.kr:444/a','https://www.gangseo.seoul.kr.evil.test/a','https://example.org/'])assert.throws(()=>officialOriginalUrl(bad));
 assert.equal(officialOriginalUrl('https://www.sd.go.kr/tour/contents.do?key=1926','https://sd.go.kr/tour/contents.do?key=1926'),'https://www.sd.go.kr/tour/contents.do?key=1926');
 assert.throws(()=>officialOriginalUrl('https://www.yongsan.go.kr/a',url),e=>e.code==='ORIGINAL_OBSERVATION_REDIRECT');
});
test('normalized text is inert, bounded, explicit about windows and does not fabricate a missing match',()=>{
 const w=originalTextWindow(body,'염창동');assert.equal(w.searchFound,true);assert.match(w.excerpt,/서울/);assert.doesNotMatch(w.excerpt,/스크립트|<p>|&amp;/);
 assert.equal(originalTextWindow(body,'없는 문장').excerpt,null);
 const long=originalTextWindow('<p>'+('앞'.repeat(7000))+'염창동'+('뒤'.repeat(9000))+'</p>','염창동');assert.equal(long.excerpt.length,6000);assert.equal(long.excerptTruncated,true);assert.ok(long.excerptStart>0);
});
test('transport hashes exact response body bytes and sends no service credentials or cookies',async()=>{
 let options;const r=await fetchOfficialOriginal(url,'염창동',async(u,o)=>{assert.equal(u,url);options=o;return response();});
 assert.equal(r.status,'observed');assert.equal(r.searchFound,true);assert.equal(r.htmlSha256,createHash('sha256').update(body).digest('hex'));assert.equal(r.bytes,Buffer.byteLength(body));
 assert.equal(options.redirect,'manual');assert.equal(options.credentials,'omit');assert.deepEqual(Object.keys(options.headers).sort(),['Accept','User-Agent']);assert.ok(r.completedAt>=r.attemptedAt);assert.match(r.excerptSha256,/^[a-f0-9]{64}$/);
});
test('redirects are manually constrained and a public response cannot redirect to an arbitrary target',async()=>{
 let calls=0;const blocked=await fetchOfficialOriginal(url,'염창동',async()=>{calls++;return new Response(null,{status:302,headers:{location:'https://127.0.0.1/private'}});});
 assert.equal(calls,1);assert.equal(blocked.errorCode,'REDIRECT_BLOCKED');assert.equal(blocked.excerpt,null);
 let n=0;const alias=await fetchOfficialOriginal('https://sd.go.kr/tour/contents.do?key=1926','염창동',async(u)=>{n++;return n===1?new Response(null,{status:301,headers:{location:'https://www.sd.go.kr/tour/contents.do?key=1926'}}):response();});
 assert.equal(alias.status,'observed');assert.match(alias.finalUrl,/www\.sd\.go\.kr/);
 const loop=await fetchOfficialOriginal(url,'염창동',async()=>new Response(null,{status:302,headers:{location:url}}));assert.equal(loop.errorCode,'REDIRECT_LIMIT');
});
test('HTTP, non-HTML, oversized, invalid encoding, network and timeout outcomes do not become successful comparisons',async()=>{
 for(const [make,code]of [[()=>new Response('unavailable',{status:503}),'HTTP_STATUS'],[()=>new Response('%PDF',{headers:{'content-type':'application/pdf'}}),'UNSUPPORTED_MEDIA'],[()=>new Response(body,{headers:{'content-type':'text/html','content-length':'1000001'}}),'BODY_TOO_LARGE'],[()=>response('a'.repeat(1000001)),'BODY_TOO_LARGE'],[()=>new Response(Uint8Array.of(255),{headers:{'content-type':'text/html;charset=utf-8'}}),'DECODING_FAILED']]){const r=await fetchOfficialOriginal(url,'염창동',async()=>make());assert.equal(r.status,'failed');assert.equal(r.errorCode,code);assert.equal(r.excerpt,null);}
 assert.equal((await fetchOfficialOriginal(url,'염창동',async()=>{throw new Error('network');})).errorCode,'NETWORK_ERROR');
 const timeout=await fetchOfficialOriginal(url,'염창동',async(_u,o)=>new Promise((_resolve,reject)=>o.signal.addEventListener('abort',()=>reject(new Error('aborted')),{once:true})),5);assert.equal(timeout.errorCode,'TIMEOUT');
});
test('observation and its metadata-only audit preserve content, versions, rights, scope and review state',async()=>{
 const {d,input,s}=await fixture(),tables=['archive_sources','archive_versions','archive_passages','archive_passage_reviews','archive_passage_regions','archive_facts','archive_assets'];
 const snapshot=Object.fromEntries(tables.map(t=>[t,d.sql.prepare('SELECT * FROM '+t).all()])),before=count(d,'archive_audit');
 const out=await observeArchiveOriginal(d,input,'service-fixture',async()=>response());assert.equal(out.unchanged,false);assert.match(out.excerpt,/소금/);assert.equal(count(d,'archive_audit'),before+1);
 for(const t of tables)assert.deepEqual(d.sql.prepare('SELECT * FROM '+t).all(),snapshot[t]);
 const a=d.sql.prepare("SELECT * FROM archive_audit WHERE action='passage_original_observation'").get(),note=JSON.parse(a.note);assert.equal(note.id,out.observation.id);assert.equal(note.actor,'service-fixture');assert.equal(note.excerpt,undefined);assert.equal(note.html,undefined);assert.equal(note.searchFound,true);assert.equal(note.htmlSha256,out.observation.htmlSha256);
 assert.equal((await listOriginalObservations(d,s.id)).items[0].id,note.id);
});
test('retry reuses the recorded ID without a second fetch or body storage, while changed payload conflicts',async()=>{
 const {d,input}=await fixture();let calls=0;const fetcher=async()=>{calls++;return response();};const first=await observeArchiveOriginal(d,input,'service',fetcher),n=count(d,'archive_audit'),again=await observeArchiveOriginal(d,input,'service',fetcher);
 assert.equal(calls,1);assert.equal(again.unchanged,true);assert.equal(again.excerpt,null);assert.equal(again.observation.id,first.observation.id);assert.equal(count(d,'archive_audit'),n);
 await assert.rejects(()=>observeArchiveOriginal(d,{...input,searchText:'가양동'},'service',fetcher),e=>e.code==='ORIGINAL_OBSERVATION_CONFLICT');assert.equal(calls,1);
});
test('missing, stale and nonofficial registered sources are rejected before any network call',async()=>{
 for(const scenario of ['missing','stale','host']){
  const {d,input}=await fixture(scenario==='host'?'https://example.org/registered':url);let calls=0;
  if(scenario==='missing')input.passageId='missing';if(scenario==='stale')input.expectedFingerprint='a'.repeat(64);
  const n=count(d,'archive_audit');await assert.rejects(()=>observeArchiveOriginal(d,input,'service',async()=>{calls++;return response();}));assert.equal(calls,0);assert.equal(count(d,'archive_audit'),n);
 }
});
test('concurrent metadata edits cannot append an observation against a stale snapshot',async()=>{
 const {d,input,s}=await fixture(),n=count(d,'archive_audit');
 await assert.rejects(()=>observeArchiveOriginal(d,input,'service',async()=>{d.sql.prepare('UPDATE archive_sources SET rights_note=? WHERE id=?').run('다른 검토자의 권리 메모',s.id);return response();}),e=>e.code==='ORIGINAL_OBSERVATION_CONFLICT');
 assert.equal(count(d,'archive_audit'),n);assert.equal(count(d,'archive_passage_reviews'),0);
});
test('transport failures are audited without inventing content, and audit failures cannot return success',async()=>{
 const {d,input}=await fixture();const out=await observeArchiveOriginal(d,input,'service',async()=>new Response(null,{status:503}));assert.equal(out.observation.status,'failed');assert.equal(out.observation.httpStatus,503);assert.equal(out.observation.htmlSha256,null);assert.equal(out.excerpt,null);assert.equal(count(d,'archive_passage_reviews'),0);
 d.sql.exec("CREATE TRIGGER fail_observe BEFORE INSERT ON archive_audit WHEN NEW.action='passage_original_observation' BEGIN SELECT RAISE(ABORT,'fixture'); END");
 await assert.rejects(()=>observeArchiveOriginal(d,{...input,requestId:'request-failure'},'service',async()=>response()),e=>e.code==='ORIGINAL_OBSERVATION_AUDIT');
});
test('observation listing bounds source input and explicitly marks history truncation',async()=>{
 const {d,s}=await fixture();await assert.rejects(()=>listOriginalObservations(d,null));await assert.rejects(()=>listOriginalObservations(d,'a'.repeat(201)));
 for(let i=0;i<31;i++)d.sql.prepare('INSERT INTO archive_audit (id,source_id,action,actor,note,created_at) VALUES (?,?,?,?,?,?)').run('observation-'+i,s.id,'passage_original_observation','fixture',JSON.stringify({id:'observation-'+i}),'2026-10-24T00:00:00Z');
 const listed=await listOriginalObservations(d,s.id);assert.equal(listed.items.length,30);assert.equal(listed.truncated,true);
});
