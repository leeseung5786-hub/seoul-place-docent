import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {parseSourcePeriod,importArchiveCaptures,archiveCoverage} from '../lib/archive-capture.ts';
import {seedArchive} from '../lib/archive-seed.ts';
import {listArchiveSources,archiveSourceDetail,archiveRegions,saveArchiveSource} from '../lib/archive-db.ts';
function db(){const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON');for(const file of ['0000_green_namora.sql','0001_glamorous_overlord.sql','0002_chunky_trauma.sql','0003_wide_bulldozer.sql','0004_sharp_metal_master.sql'])sql.exec(readFileSync(new URL('../drizzle/'+file,import.meta.url),'utf8'));return {sql,prepare(query){return {values:[],bind(...v){this.values=v;return this;},async first(){return sql.prepare(query).get(...this.values)||null;},async all(){return {results:sql.prepare(query).all(...this.values)};},async run(){return sql.prepare(query).run(...this.values);}};},async batch(items){sql.exec('BEGIN');try{const r=[];for(const s of items)r.push(await s.run());sql.exec('COMMIT');return r;}catch(e){sql.exec('ROLLBACK');throw e;}}};}
const fixture={source:{title:'옛 지역 사진',institution:'서울역사박물관',url:'https://museum.seoul.go.kr/archive/example-record',kind:'photo',summary:'사진 목록',rights:'KOGL1',rightsUrl:'https://museum.seoul.go.kr/archive/example-record',rightsNote:'해당 상세 자료의 공공누리 제1유형 표시 확인',storageAllowed:true,reuseAllowed:true,reviewStatus:'source_captured',regionIds:['gu-성동구']},metadata:{명칭:'옛 지역 사진',시기:'1960년대',자료출처:'조사보고서 32쪽'},description:'공장 사이의 골목과 구두 부품을 파는 상점이 보인다.',sourceLocator:'상세 자료 내용 항목',attribution:'서울역사박물관 · 옛 지역 사진 · 공공누리 제1유형',rightsEvidence:'개별 자료에서 공공누리 제1유형 확인',capturedAt:'2026-10-16T00:00:00.000Z',pageHash:'a'.repeat(64)};
test('user-provided research report adds one catalog document without promoting 215 fragments to history',async()=>{
 const d=db();await seedArchive(d,'test');
 const input=JSON.parse(readFileSync(new URL('../data/uploaded-city-history-report-capture-2026-10-21.json',import.meta.url),'utf8'));
 const count=table=>d.sql.prepare(`SELECT count(*) AS n FROM ${table}`).get().n;
 const before={sources:count('archive_sources'),passages:count('archive_passages'),facts:count('archive_facts'),regions:count('archive_regions')};
 const payload={batchId:'uploaded-report-20261021',items:[input]};
 const first=await importArchiveCaptures(d,payload,'test');
 const repeated=await importArchiveCaptures(d,payload,'test');
 assert.equal(count('archive_sources'),before.sources+1);
 assert.equal(count('archive_passages'),before.passages);
 assert.equal(count('archive_facts'),before.facts);
 assert.equal(count('archive_regions'),before.regions);
 assert.equal(repeated.items[0].status,'unchanged');
 const detail=await archiveSourceDetail(d,first.items[0].sourceId);
 assert.equal(detail.source.review_status,'needs_review');
 assert.equal(detail.source.reuse_allowed,0);
 assert.equal(detail.captures[0].start_year,null);
 assert.equal(detail.captures[0].end_year,null);
 assert.equal(detail.versions.length,1);
 assert.equal((await listArchiveSources(d,new URLSearchParams({q:'서울 도시 역사자료 아카이브 구축 보고',before2000:'true'}))).total,0);
});
test('date parser preserves year, decade, century and estimated range precision',()=>{assert.deepEqual(parseSourcePeriod('1963'),{startYear:1963,endYear:1963,precision:'year'});assert.deepEqual(parseSourcePeriod('1960년대'),{startYear:1960,endYear:1969,precision:'decade'});assert.deepEqual(parseSourcePeriod('1960년경'),{startYear:1960,endYear:1960,precision:'year_estimated'});assert.deepEqual(parseSourcePeriod('18세기 중엽'),{startYear:1700,endYear:1799,precision:'century'});assert.equal(parseSourcePeriod('미상').startYear,null);assert.equal(parseSourcePeriod('2001~1990').startYear,null);});
test('capture stores original description, raw metadata and attribution without creating historical facts',async()=>{const d=db();await seedArchive(d,'test');const r=await importArchiveCaptures(d,{batchId:'fixture-1',items:[fixture]},'test');const detail=await archiveSourceDetail(d,r.items[0].sourceId);assert.equal(detail.passages[0].text_kind,'transcription');assert.equal(detail.passages[0].review_status,'source_captured');assert.equal(detail.facts.length,0);assert.equal(detail.captures.length,1);assert.equal(JSON.parse(detail.captures[0].raw_metadata).자료출처,'조사보고서 32쪽');assert.equal(detail.captures[0].attribution,fixture.attribution);assert.equal(detail.captures[0].start_year,1960);});
test('repeating a capture leaves one source, one passage and one version',async()=>{const d=db();await seedArchive(d,'test');const a=await importArchiveCaptures(d,{batchId:'fixture-1',items:[fixture]},'test');const b=await importArchiveCaptures(d,{batchId:'fixture-1',items:[fixture]},'test');assert.equal(b.items[0].status,'unchanged');assert.equal(b.items[0].sourceId,a.items[0].sourceId);const s=await archiveSourceDetail(d,a.items[0].sourceId);assert.equal(s.versions.length,1);assert.equal(s.passages.length,1);});
test('changed description makes a new immutable capture and version',async()=>{const d=db();await seedArchive(d,'test');const a=await importArchiveCaptures(d,{batchId:'fixture-1',items:[fixture]},'test');await importArchiveCaptures(d,{batchId:'fixture-2',items:[{...fixture,description:'보완된 원문 설명',metadata:{...fixture.metadata,시기:'2008'}}]},'test');const detail=await archiveSourceDetail(d,a.items[0].sourceId);assert.equal(detail.versions.length,2);assert.equal(detail.captures.length,2);assert.ok(detail.passages.some(p=>p.text===fixture.description));assert.equal((await listArchiveSources(d,new URLSearchParams({q:'옛 지역 사진',before2000:'true'}))).total,0);});
test('search reaches body-only words and content/date filters exclude uncaptured catalog entries',async()=>{const d=db();await seedArchive(d,'test');await importArchiveCaptures(d,{batchId:'fixture-1',items:[fixture]},'test');assert.equal((await listArchiveSources(d,new URLSearchParams({q:'구두 부품',content:'original',before2000:'true'}))).total,1);assert.equal((await listArchiveSources(d,new URLSearchParams({q:'구두 부품',content:'files'}))).total,0);});
test('original capture is refused unless storage permission and item-level rights evidence exist',async()=>{const d=db();await seedArchive(d,'test');await assert.rejects(()=>importArchiveCaptures(d,{batchId:'fixture-1',items:[{...fixture,source:{...fixture.source,rights:'unknown',storageAllowed:false,reuseAllowed:false}}]},'test'),e=>e.code==='ARCHIVE_RIGHTS');await assert.rejects(()=>importArchiveCaptures(d,{batchId:'fixture-1',items:[{...fixture,rightsEvidence:''}]},'test'),e=>e.code==='ARCHIVE_RIGHTS');assert.equal(d.sql.prepare('SELECT count(*) AS n FROM archive_captures').get().n,0);});
test('coverage separates catalog-only sources, original text and saved files',async()=>{const d=db();await seedArchive(d,'test');await importArchiveCaptures(d,{batchId:'fixture-1',items:[fixture]},'test');const rows=await archiveCoverage(d);assert.equal(rows.items.length,25);const gu=rows.items.find(r=>r.name==='성동구');assert.equal(gu.sources,4);assert.equal(gu.original_text,1);assert.equal(gu.with_files,0);});
test('batch size and dates are validated before writes',async()=>{const d=db();await seedArchive(d,'test');await assert.rejects(()=>importArchiveCaptures(d,{batchId:'fixture-1',items:Array(11).fill(fixture)},'test'),e=>e.code==='ARCHIVE_CAPTURE_INPUT');await assert.rejects(()=>importArchiveCaptures(d,{batchId:'fixture-1',items:[{...fixture,capturedAt:'not-a-date'}]},'test'),e=>e.code==='ARCHIVE_CAPTURE_DATE');});

test('metadata key order does not duplicate captures while source metadata changes do create a version',async()=>{const d=db();await seedArchive(d,'test');const a=await importArchiveCaptures(d,{batchId:'fixture-1',items:[fixture]},'test');const reordered={...fixture,metadata:{자료출처:fixture.metadata.자료출처,시기:fixture.metadata.시기,명칭:fixture.metadata.명칭}};const b=await importArchiveCaptures(d,{batchId:'fixture-2',items:[reordered]},'test');assert.equal(b.items[0].status,'unchanged');await importArchiveCaptures(d,{batchId:'fixture-3',items:[{...fixture,source:{...fixture.source,summary:'목록 설명 보완'}}]},'test');assert.equal((await archiveSourceDetail(d,a.items[0].sourceId)).versions.length,2);});

test('open-ended and abbreviated periods are not narrowed to a single year',()=>{assert.deepEqual(parseSourcePeriod('1960년대 이후'),{startYear:1960,endYear:null,precision:'open_after'});assert.deepEqual(parseSourcePeriod('1940년 이전'),{startYear:null,endYear:1940,precision:'open_before'});assert.deepEqual(parseSourcePeriod('1960~70년대'),{startYear:1960,endYear:1979,precision:'range_decades'});});
test('collected official corpus imports with item-level rights gates and without promoting captions to historical events',async()=>{const d=db();await seedArchive(d,'test');const rows=JSON.parse(readFileSync(new URL('../data/museum-captures-2026-10-16.json',import.meta.url),'utf8'));assert.equal(rows.length,129);for(let i=0;i<rows.length;i+=10)await importArchiveCaptures(d,{batchId:'corpus-'+i,items:rows.slice(i,i+10)},'test');assert.equal(d.sql.prepare('SELECT count(*) AS n FROM archive_sources').get().n,174);assert.equal(d.sql.prepare('SELECT count(*) AS n FROM archive_captures').get().n,129);assert.equal(d.sql.prepare('SELECT count(*) AS n FROM archive_passages').get().n,146);assert.equal(d.sql.prepare('SELECT count(*) AS n FROM archive_facts').get().n,21);assert.equal(d.sql.prepare("SELECT count(*) AS n FROM archive_sources WHERE rights='KOGL2' AND storage_allowed=1").get().n,0);const r=await importArchiveCaptures(d,{batchId:'corpus-0',items:rows.slice(0,10)},'test');assert.ok(r.items.every(v=>v.status==='unchanged'));});

const scoped={...fixture,source:{...fixture.source,title:'동명 유래 확인',url:'https://example.go.kr/dong-origin',rights:'unknown',rightsUrl:'',rightsNote:'원문 복제 허용 미확인. 사실 요약만 작성.',storageAllowed:false,reuseAllowed:false,reviewStatus:'needs_review',regionIds:['gu-도봉구']},metadata:{자료유형:'동명유래',시기:''},description:'',rightsEvidence:'원문 보관 허용 미확인 · 사실 요약과 원문을 구분',sections:[{text:'지역 이름은 도봉산과 관련된다. 상세 연혁은 원문을 대조해야 한다.',locator:'동명유래 > 도봉동',textKind:'paraphrase',regionIds:['dong-도봉구-도봉동'],regionLabel:'도봉동',relation:'exact_name',basis:'제공기관의 도봉동 표제 확인'}]};
test('scoped factual abstract stays pending and is not counted as original text or a reviewed history',async()=>{const d=db();await seedArchive(d,'test');const a=await importArchiveCaptures(d,{batchId:'scoped-1',items:[scoped]},'test');const detail=await archiveSourceDetail(d,a.items[0].sourceId);assert.equal(detail.passages[0].review_status,'pending');assert.equal(detail.passages[0].regions[0].label,'도봉동');const coverage=await archiveCoverage(d);const dong=coverage.dongs.find(x=>x.id==='dong-도봉구-도봉동');assert.equal(dong.passage_count,1);assert.equal(dong.original_count,0);assert.equal(dong.reviewed_count,0);assert.equal(coverage.items.find(x=>x.id==='gu-도봉구').dongs_with_passages,1);assert.equal((await listArchiveSources(d,new URLSearchParams({regionId:dong.id,content:'regional'}))).total,1);});
test('scoped corpus repeats without duplicating passages and changed scope evidence creates a new version',async()=>{const d=db();await seedArchive(d,'test');const a=await importArchiveCaptures(d,{batchId:'scoped-1',items:[scoped]},'test');const b=await importArchiveCaptures(d,{batchId:'scoped-1',items:[scoped]},'test');assert.equal(b.items[0].status,'unchanged');await importArchiveCaptures(d,{batchId:'scoped-2',items:[{...scoped,sections:[{...scoped.sections[0],basis:'원문 표제를 재확인'}]}]},'test');const detail=await archiveSourceDetail(d,a.items[0].sourceId);assert.equal(detail.passages.length,2);assert.equal(detail.versions.length,2);assert.equal((await archiveCoverage(d)).dongs.find(x=>x.id==='dong-도봉구-도봉동').passage_count,1);});
test('removing a dong scope from a newer capture preserves history while clearing current coverage and region search',async()=>{const d=db();await seedArchive(d,'test');await importArchiveCaptures(d,{batchId:'scoped-1',items:[scoped]},'test');await importArchiveCaptures(d,{batchId:'scoped-2',items:[{...scoped,sections:[]}]},'test');assert.equal((await archiveCoverage(d)).dongs.find(x=>x.id==='dong-도봉구-도봉동').passage_count,0);assert.equal((await listArchiveSources(d,new URLSearchParams({regionId:'dong-도봉구-도봉동'}))).total,0);});
test('scope IDs and exact legal names are validated before any source write',async()=>{const d=db();await seedArchive(d,'test');for(const section of [{...scoped.sections[0],regionIds:['dong-없는지역']},{...scoped.sections[0],regionLabel:'창동'},{...scoped.sections[0],regionIds:['gu-도봉구']}])await assert.rejects(()=>importArchiveCaptures(d,{batchId:'bad-scope',items:[{...scoped,sections:[section]}]},'test'),e=>e.code==='ARCHIVE_REGION');assert.equal(d.sql.prepare('SELECT count(*) AS n FROM archive_sources').get().n,45);});
test('a shared neighborhood name tagged to a district never inflates legal dong coverage',async()=>{const d=db();await seedArchive(d,'test');await importArchiveCaptures(d,{batchId:'shared-scope',items:[{...scoped,source:{...scoped.source,regionIds:['gu-성북구']},sections:[{...scoped.sections[0],regionLabel:'삼선동',regionIds:['gu-성북구'],relation:'district_context',basis:'공통 동명 설명 · 세부 가 단위는 구분되지 않음'}]}]},'test');assert.equal((await archiveCoverage(d)).items.find(x=>x.id==='gu-성북구').dongs_with_passages,0);});


test('metadata-only edits preserve the last captured dong scopes',async()=>{const d=db();await seedArchive(d,'test');const a=await importArchiveCaptures(d,{batchId:'scoped-1',items:[scoped]},'test');await saveArchiveSource(d,{...scoped.source,summary:'목록 설명 보완'},'test',a.items[0].sourceId,1);const coverage=await archiveCoverage(d);assert.equal(coverage.dongs.find(x=>x.id==='dong-도봉구-도봉동').passage_count,1);assert.equal((await listArchiveSources(d,new URLSearchParams({regionId:'dong-도봉구-도봉동',content:'regional'}))).total,1);});
test('curated dong corpus stores 74 short abstracts for 69 legal names without claiming original reuse rights',async()=>{const d=db();await seedArchive(d,'test');const rows=JSON.parse(readFileSync(new URL('../data/dong-history-captures-2026-10-16.json',import.meta.url),'utf8'));assert.equal(rows.length,28);assert.ok(rows.every(r=>!r.description&&!r.source.storageAllowed&&!r.source.reuseAllowed));for(let i=0;i<rows.length;i+=10)await importArchiveCaptures(d,{batchId:'dong-corpus-'+i,items:rows.slice(i,i+10)},'test');assert.equal(d.sql.prepare('SELECT count(*) AS n FROM archive_passage_regions').get().n,74);const coverage=await archiveCoverage(d);assert.equal(coverage.dongs.filter(d=>d.passage_count>0).length,69);assert.equal(coverage.dongs.filter(d=>d.passage_count===0).length,398);assert.equal(coverage.dongs.reduce((n,d)=>n+d.original_count,0),0);const regions=await archiveRegions(d);assert.equal(regions.find(x=>x.id==='dong-송파구-가락동').source_count,1);assert.equal(coverage.dongs.find(x=>x.id==='dong-성북구-삼선동1가').passage_count,0);const repeated=await importArchiveCaptures(d,{batchId:'dong-corpus-0',items:rows.slice(0,10)},'test');assert.ok(repeated.items.every(x=>x.status==='unchanged'));});

test('new district corpus preserves provenance, uncertain dates and source-specific rights',()=>{const rows=JSON.parse(readFileSync(new URL('../data/neighborhood-expansion-2026-10-17.json',import.meta.url),'utf8'));assert.equal(rows.length,32);assert.equal(rows.reduce((n,r)=>n+r.sections.length,0),89);assert.equal(new Set(rows.map(r=>r.source.url)).size,32);assert.equal(rows.filter(r=>r.pageHash.length===64).length,22);for(const row of rows){assert.equal(row.description,'');assert.equal(row.metadata.시기,'');assert.equal(row.source.publicationDate,'');assert.equal(row.source.reviewStatus,'needs_review');assert.ok(!JSON.stringify(row).includes('\ufffd'));assert.ok(row.sections.every(s=>s.textKind==='paraphrase'&&s.basis&&s.locator));if(row.source.rights==='KOGL1'){assert.equal(row.source.institution,'서대문구청');assert.ok(row.source.storageAllowed&&row.source.reuseAllowed);}else assert.ok(!row.source.storageAllowed&&!row.source.reuseAllowed);}const mapo=rows.find(r=>r.source.institution==='마포구청');assert.equal(mapo.sections.find(s=>s.regionLabel==='노고산').relation,'district_context');const gw=rows.find(r=>r.source.institution==='광진구청');assert.equal(gw.sections.find(s=>s.regionLabel==='모진동').relation,'district_context');});
test('combined production corpora yield 234 sources, 309 passages and 147 scoped legal names without promoting abstracts to facts',async()=>{const d=db();await seedArchive(d,'test');for(const filename of ['museum-captures-2026-10-16.json','dong-history-captures-2026-10-16.json','neighborhood-expansion-2026-10-17.json']){const rows=JSON.parse(readFileSync(new URL('../data/'+filename,import.meta.url),'utf8'));for(let i=0;i<rows.length;i+=10)await importArchiveCaptures(d,{batchId:filename.replace(/[^a-zA-Z0-9_-]/g,'-')+'-'+i,items:rows.slice(i,i+10)},'test');}assert.equal(d.sql.prepare('SELECT count(*) AS n FROM archive_sources').get().n,234);assert.equal(d.sql.prepare('SELECT count(*) AS n FROM archive_passages').get().n,309);assert.equal(d.sql.prepare('SELECT count(*) AS n FROM archive_passage_regions').get().n,163);assert.equal(d.sql.prepare('SELECT count(*) AS n FROM archive_facts').get().n,21);const c=await archiveCoverage(d);assert.equal(c.dongs.filter(r=>r.passage_count>0).length,147);assert.equal(c.items.filter(r=>r.dongs_with_passages>0).length,17);for(const [id,q]of [['dong-마포구-염리동','소금'],['dong-서초구-내곡동','1972'],['dong-동대문구-신설동','경마장'],['dong-관악구-남현동','1980']])assert.ok((await listArchiveSources(d,new URLSearchParams({regionId:id,q,content:'regional'}))).total>0);assert.equal(c.dongs.find(r=>r.id==='dong-마포구-노고산동').passage_count,0);const rows=JSON.parse(readFileSync(new URL('../data/neighborhood-expansion-2026-10-17.json',import.meta.url),'utf8'));const repeat=await importArchiveCaptures(d,{batchId:'repeat-expansion-4',items:rows.slice(0,10)},'test');assert.ok(repeat.items.every(i=>i.status==='unchanged'));});

test('fifth corpus distinguishes index evidence, direct document fingerprints and five licensed excerpts',()=>{
 const rows=JSON.parse(readFileSync(new URL('../data/district-foundations-2026-10-17.json',import.meta.url),'utf8'));
 assert.equal(rows.length,32);assert.equal(new Set(rows.map(r=>r.source.url)).size,32);
 assert.equal(rows.filter(r=>r.pageHash.length===64).length,13);
 assert.ok(!JSON.stringify(rows).includes('\ufffd'));
 const licensed=rows.filter(r=>r.source.rights==='KOGL1');assert.equal(licensed.length,5);
 assert.equal(rows.flatMap(r=>r.sections).filter(s=>s.textKind==='quotation').length,5);
 for(const r of rows){assert.equal(r.metadata.시기,'');assert.equal(r.source.reviewStatus,'needs_review');assert.equal(r.description,'');
  for(const s of r.sections){assert.ok(s.locator&&s.basis);if(s.textKind==='quotation'){assert.equal(r.source.rights,'KOGL1');assert.ok(r.source.storageAllowed&&r.source.reuseAllowed);assert.ok(s.text.split(/\s+/).length<=25);}else assert.equal(s.textKind,'paraphrase');}
  if(r.source.rights==='unknown')assert.ok(!r.source.storageAllowed&&!r.source.reuseAllowed);
 }
 const sd=rows.find(r=>r.source.institution==='성동구청');assert.ok(sd.metadata.확인방법.includes('검색 색인'));assert.equal(sd.pageHash,'');
 assert.equal(sd.sections.find(s=>s.regionLabel==='금호동').relation,'district_context');
 assert.equal(sd.sections.find(s=>s.regionLabel==='성수동1가').relation,'exact_name');
 const pdf=rows.find(r=>r.source.kind==='publication');assert.ok(pdf.sections.every(s=>s.locator.includes('PDF 31')));assert.ok(pdf.metadata.확인방법.includes('렌더링'));
});

test('fifth corpus covers 209 legal names in 25 gu while original evidence and shared contexts remain distinct',async()=>{
 const d=db();await seedArchive(d,'test');
 for(const filename of ['museum-captures-2026-10-16.json','dong-history-captures-2026-10-16.json','neighborhood-expansion-2026-10-17.json','district-foundations-2026-10-17.json']){
  const rows=JSON.parse(readFileSync(new URL('../data/'+filename,import.meta.url),'utf8'));
  for(let i=0;i<rows.length;i+=10)await importArchiveCaptures(d,{batchId:filename.replace(/[^a-zA-Z0-9_-]/g,'-')+'-'+i,items:rows.slice(i,i+10)},'test');
 }
 assert.equal(d.sql.prepare('SELECT count(*) AS n FROM archive_sources').get().n,266);
 assert.equal(d.sql.prepare('SELECT count(*) AS n FROM archive_passages').get().n,380);
 assert.equal(d.sql.prepare('SELECT count(*) AS n FROM archive_passage_regions').get().n,234);
 assert.equal(d.sql.prepare('SELECT count(*) AS n FROM archive_facts').get().n,21);
 const c=await archiveCoverage(d);assert.equal(c.dongs.filter(r=>r.passage_count>0).length,209);assert.equal(c.dongs.filter(r=>r.passage_count===0).length,258);assert.equal(c.items.filter(r=>r.dongs_with_passages>0).length,25);
 for(const id of ['dong-성동구-금호동1가','dong-용산구-용산동4가','dong-동작구-동작동'])assert.equal(c.dongs.find(r=>r.id===id).passage_count,0);
 const quoted=c.dongs.find(r=>r.id==='dong-종로구-내자동');assert.equal(quoted.original_count,1);assert.equal(quoted.reviewed_count,0);
 for(const [regionId,q] of [['dong-동작구-노량진동','옹기'],['dong-중랑구-신내동','택지개발'],['dong-강남구-개포동','1983'],['dong-성동구-성수동1가','서독도리']])assert.ok((await listArchiveSources(d,new URLSearchParams({regionId,q,content:'regional'}))).total>0);
 const rows=JSON.parse(readFileSync(new URL('../data/district-foundations-2026-10-17.json',import.meta.url),'utf8'));const r=await importArchiveCaptures(d,{batchId:'repeat-foundation-5',items:rows.slice(0,10)},'test');assert.ok(r.items.every(x=>x.status==='unchanged'));
});

test('completion corpus fills precisely the 258 missing names with bounded facts and traceable receipts',()=>{
 const rows=JSON.parse(readFileSync(new URL('../data/legal-dong-completion-2026-10-17.json',import.meta.url),'utf8'));
 const target=JSON.parse(readFileSync(new URL('../data/legal-dong-gap-targets-2026-10-17.json',import.meta.url),'utf8'));
 const audit=JSON.parse(readFileSync(new URL('../data/legal-dong-completion-audit-2026-10-17.json',import.meta.url),'utf8'));
 const names=JSON.parse(readFileSync(new URL('../data/legal-dong-name-crosschecks-2026-10-17.json',import.meta.url),'utf8'));
 assert.equal(rows.length,258);assert.equal(new Set(rows.map(r=>r.source.url)).size,258);
 const ids=rows.flatMap(r=>r.sections.flatMap(s=>s.regionIds));assert.equal(ids.length,258);assert.equal(new Set(ids).size,258);assert.deepEqual([...ids].sort(),target.targets.map(t=>t.id).sort());
 assert.equal(audit.directHtmlReceipts,257);assert.equal(audit.webOnlyReceipts,1);
 for(const row of rows){assert.equal(row.description,'');assert.equal(row.source.reviewStatus,'needs_review');assert.equal(row.metadata.시기||'','');assert.equal(row.source.publicationDate,'');assert.equal(row.sections.length,1);const p=row.sections[0];assert.equal(p.textKind,'paraphrase');assert.equal(p.relation,'exact_name');assert.ok(p.locator&&p.basis&&p.text.split(/\s+/).length<=30);if(row.source.rights==='unknown')assert.ok(!row.source.storageAllowed&&!row.source.reuseAllowed);else assert.equal(p.regionLabel,'도렴동');}
 assert.ok(!JSON.stringify(rows).includes('\ufffd'));
 for(const proof of names){const e=audit.evidence.find(e=>e.regionId===proof.regionId);assert.equal(e.nameCrosscheck.officialCode,proof.officialCode);assert.equal(e.nameCrosscheck.addressName,proof.currentName);assert.notEqual(e.nameCrosscheck.dictionaryName,proof.currentName);}
 for(const name of ['신사동','수서동','압구정동']){const row=rows.find(r=>r.sections[0].regionLabel===name);assert.ok(row.sections[0].locator.includes('txt-box'));}
});

test('complete production corpus gives 467 named dong entries without upgrading facts or duplicating reimports',async()=>{
 const d=db();await seedArchive(d,'test');
 const files=['museum-captures-2026-10-16.json','dong-history-captures-2026-10-16.json','neighborhood-expansion-2026-10-17.json','district-foundations-2026-10-17.json','legal-dong-completion-2026-10-17.json'];
 for(const filename of files){const rows=JSON.parse(readFileSync(new URL('../data/'+filename,import.meta.url),'utf8'));for(let i=0;i<rows.length;i+=10)await importArchiveCaptures(d,{batchId:filename.replace(/[^a-zA-Z0-9_-]/g,'-')+'-'+i,items:rows.slice(i,i+10)},'test');}
 for(const [table,n] of [['archive_sources',524],['archive_passages',638],['archive_passage_regions',492],['archive_captures',479],['archive_facts',21]])assert.equal(d.sql.prepare('SELECT count(*) AS n FROM '+table).get().n,n);
 const coverage=await archiveCoverage(d);assert.equal(coverage.dongs.length,467);assert.ok(coverage.dongs.every(r=>r.passage_count>0));assert.equal(coverage.items.filter(r=>r.dongs_with_passages>0).length,25);
 const targets=JSON.parse(readFileSync(new URL('../data/legal-dong-gap-targets-2026-10-17.json',import.meta.url),'utf8')).targets;
 for(const t of targets){const dong=coverage.dongs.find(r=>r.id===t.id);assert.equal(dong.reviewed_count,0);assert.equal(dong.original_count,0);}
 for(const [regionId,q] of [['dong-종로구-명륜1가','1936'],['dong-중구-광희동1가','1946'],['dong-성북구-동선동2가','1963'],['dong-영등포구-당산동2가','토지구획정리'],['dong-동작구-상도1동','1980']])assert.ok((await listArchiveSources(d,new URLSearchParams({regionId,q,content:'regional'}))).total>0);
 const rows=JSON.parse(readFileSync(new URL('../data/legal-dong-completion-2026-10-17.json',import.meta.url),'utf8'));const repeat=await importArchiveCaptures(d,{batchId:'completion-repeat-6',items:rows.slice(0,10)},'test');assert.ok(repeat.items.every(r=>r.status==='unchanged'));
 assert.equal(d.sql.prepare('SELECT count(*) AS n FROM archive_passages').get().n,638);
});

test('historical-name research keeps qualified aliases, catalog evidence and original access distinct',()=>{
 const research=JSON.parse(readFileSync(new URL('../data/historical-place-name-research-2026-10-23.json',import.meta.url),'utf8'));
 const captures=JSON.parse(readFileSync(new URL('../data/historical-name-captures-2026-10-23.json',import.meta.url),'utf8'));
 assert.equal(research.aliases.length,27);
 assert.equal(new Set(research.aliases.map(a=>a.district)).size,6);
 assert.equal(captures.length,68);
 assert.equal(new Set(captures.map(r=>r.source.url)).size,captures.length);
 assert.equal(new Set(captures.map(r=>r.source.providerId)).size,captures.length);
 assert.equal(research.records.length,captures.length);
 const aliases=new Map(research.aliases.map(a=>[a.id,a]));
 const compact=s=>s.replace(/[^가-힣A-Za-z0-9一-龥]/g,'');
 for(let i=0;i<captures.length;i++){
  const c=captures[i],r=research.records[i];
  assert.equal(c.source.url,r.url);
  assert.equal(c.source.providerId,r.providerId);
  assert.ok(new URL(r.url).hostname.endsWith('.archives.go.kr'));
  assert.equal(r.openness,'공개');
  assert.ok(Number(r.productionYear)>=1900&&Number(r.productionYear)<2000);
  assert.equal(r.originalFileRetrieved,false);assert.equal(r.parcelVerified,false);
  assert.equal(c.source.rights,'unknown');assert.equal(c.source.reviewStatus,'metadata_checked');
  assert.equal(c.source.storageAllowed,false);assert.equal(c.source.reuseAllowed,false);
  assert.ok(!c.description&&!c.sections?.length);
  assert.ok(c.metadata.원문확인상태.includes('미열람'));
  const matched=r.aliasIds.map(id=>{assert.ok(aliases.has(id));return aliases.get(id);});
  assert.deepEqual(c.source.regionIds,[...new Set(matched.map(a=>a.catalogRegionId))].sort());
  for(const a of matched){
   const title=compact(r.title);
   assert.ok(a.variants.some(v=>title.includes(v)));
   assert.ok(title.includes(compact(a.parent)));
   assert.ok(a.evidence.url&&a.evidence.locator&&a.evidence.method);
   assert.equal(a.spatialRelation,'historical_area_candidate');
  }
 }
 assert.ok(research.queries.some(q=>q.duplicateOf));
 assert.equal(research.aliases.find(a=>a.historicalName==='서독도리').currentDong,'성수동1가');
 assert.equal(research.aliases.find(a=>a.historicalName==='동독도리').currentDong,'성수동2가');
 assert.equal(research.aliases.find(a=>a.historicalName==='중계리').selectedRecordCount,0);
 assert.equal(research.aliases.find(a=>a.historicalName==='상계리').selectedRecordCount,0);
});

test('historical-name catalog import adds 68 sources without altering passages, facts, files or exact dong coverage',async()=>{
 const d=db();await seedArchive(d,'test');
 const rows=JSON.parse(readFileSync(new URL('../data/historical-name-captures-2026-10-23.json',import.meta.url),'utf8'));
 const count=table=>d.sql.prepare('SELECT count(*) AS n FROM '+table).get().n;
 const baseline=Object.fromEntries(['archive_sources','archive_versions','archive_captures','archive_passages','archive_facts','archive_assets','archive_regions','archive_passage_regions'].map(t=>[t,count(t)]));
 const beforeCoverage=(await archiveCoverage(d)).dongs.map(r=>[r.id,r.passage_count,r.sources,r.original_count,r.reviewed_count]);
 const imported=[];
 for(let i=0;i<rows.length;i+=10){
  const payload={batchId:'historical-name-test-'+i,items:rows.slice(i,i+10)};
  const first=await importArchiveCaptures(d,payload,'test');
  assert.ok(first.items.every(r=>r.status==='created'));imported.push(...first.items);
  const replay=await importArchiveCaptures(d,payload,'test');
  assert.ok(replay.items.every(r=>r.status==='unchanged'));
 }
 for(const t of ['archive_sources','archive_versions','archive_captures'])assert.equal(count(t),baseline[t]+rows.length);
 for(const t of ['archive_passages','archive_facts','archive_assets','archive_regions','archive_passage_regions'])assert.equal(count(t),baseline[t]);
 assert.deepEqual((await archiveCoverage(d)).dongs.map(r=>[r.id,r.passage_count,r.sources,r.original_count,r.reviewed_count]),beforeCoverage);
 assert.equal((await listArchiveSources(d,new URLSearchParams({q:'옛 지명 추가 조사',before2000:'true'}))).total,rows.length);
 for(const r of imported){
  const detail=await archiveSourceDetail(d,r.sourceId);
  assert.equal(detail.versions.length,1);assert.equal(detail.captures.length,1);
  assert.equal(detail.passages.length,0);assert.equal(detail.facts.length,0);assert.equal(detail.assets.length,0);
  assert.equal(detail.source.review_status,'metadata_checked');
  assert.ok(detail.regions.every(r=>r.level==='district'));
 }
});
