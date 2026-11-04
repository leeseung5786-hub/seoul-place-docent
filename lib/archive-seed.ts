import regionMaster from '../data/seoul-regions.json';
import collections from '../data/museum-collections.json';
import checkedIntros from '../data/checked-intros.json';
import {regions as legacyRegions,sources as legacySources} from './history';
import {validateSource} from './archive-validation';
import {saveArchiveSource} from './archive-db';
export const regionId=(gu:string,dong?:string)=>dong?`dong-${gu}-${dong}`:`gu-${gu}`;
export function seedRegions(){
 const now='2026-10-16T00:00:00.000Z';const base={officialCode:null as string|null,sourceUrl:regionMaster.sourceUrl,asOf:regionMaster.retrievedAt,createdAt:now,sourceNote:regionMaster.note};
 return [{...base,id:'city-seoul',parentId:null,name:'서울특별시',level:'city',aliases:JSON.stringify(['한성','경성'])},...regionMaster.districts.flatMap(d=>[{...base,id:regionId(d.name),parentId:'city-seoul',name:d.name,level:'district',aliases:'[]'},...d.dongs.map(n=>({...base,id:regionId(d.name,n),parentId:regionId(d.name),name:n,level:'legal_dong',aliases:'[]',officialCode:(regionMaster.codeOverrides as Record<string,string>)[d.name+'/'+n]||null}))]),...collections.map(c=>({...base,id:'area-'+c.categoryId,parentId:regionId(c.gu),name:c.name,level:'historical_area',aliases:JSON.stringify(legacyRegions.find(r=>r.name===c.name)?.aliases||[]),sourceUrl:c.url,sourceNote:'생활문화조사 자료의 지역명. 법정동 전체와 같은 범위인지 미검증.'}))];
}
export async function seedArchive(db:D1Database,actor:string){
 const existing=await db.prepare('SELECT id FROM archive_imports WHERE id=?').bind('foundation-2026-10-16-v1').first();if(existing)return {alreadyImported:true,...await counts(db)};
 const now=new Date().toISOString();const regions=seedRegions();
 for(let offset=0;offset<regions.length;offset+=50)await db.batch(regions.slice(offset,offset+50).map(r=>db.prepare('INSERT INTO archive_regions (id,parent_id,name,level,official_code,aliases,source_url,source_note,as_of,created_at) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(r.id,r.parentId,r.name,r.level,r.officialCode,r.aliases,r.sourceUrl,r.sourceNote,r.asOf,r.createdAt)));
 let created=0;
 const base={rights:'unknown',rightsUrl:'',rightsNote:'원문·사진·간행물의 보관 및 재사용 조건은 개별 확인 전입니다.',storageAllowed:false,reuseAllowed:false,reviewStatus:'metadata_checked',publicationDate:'',subjectPeriod:'',changeNote:'공식 자료 목록 등록 · 건물·부지 연결 없음'};
 const sourceInputs=[{id:'SEOUL-REGION-LIST',...base,title:'서울특별시 자치구별 동 현황',institution:'서울특별시',providerId:'autonomy_sub',url:regionMaster.sourceUrl,kind:'dataset',summary:regionMaster.note,regionIds:['city-seoul']},{id:'SEOUL-HISTORY-INTRO',...base,title:'서울특별시 · 서울의 역사',institution:'서울특별시',providerId:'seoul-history',url:'https://www.seoul.go.kr/seoul/history.do',kind:'web',summary:'서울 전체의 역사적 배경을 탐색하는 공식 소개입니다. 세부 사실과 원문 구간은 추가 등록 대상입니다.',regionIds:['city-seoul']},...collections.map(c=>{const legacy=legacyRegions.find(r=>r.name===c.name),source=legacySources.find(s=>s.id===legacy?.sourceId);return {id:'SMH-'+c.categoryId,...base,title:`서울생활문화자료조사 · ${c.name}`,institution:'서울역사박물관',providerId:c.categoryId,url:c.url,kind:'collection',summary:legacy?.summary||`${c.name} 생활문화조사의 공식 컬렉션 목록입니다. 조사 내용·시기·원문 이용조건은 추가 검토 대상입니다.`,publicationDate:'',subjectPeriod:legacy?`조사 ${legacy.surveyYear}년 · 지역 소개에서 다루는 여러 시기 (발행일 별도 확인)`:'',reviewStatus:legacy?'content_checked':'metadata_checked',regionIds:[regionId(c.gu),'area-'+c.categoryId,...regionMaster.districts.find(d=>d.name===c.gu)!.dongs.filter(n=>(legacy?.dongs||[]).includes(n)||n===c.name).map(n=>regionId(c.gu,n))].slice(0,30),changeNote:source?'기존 지역 소개 검토 내용 이전 · 원문 전체 미보관':'공식 컬렉션 목록 등록 · 세부 내용 검토 전'};})];
 for(const entry of sourceInputs){
  const found=await db.prepare('SELECT id,current_version FROM archive_sources WHERE url=?').bind(entry.url).first<{id:string;current_version:number}>();
  const d=validateSource(entry);
  const previousVersion=found?await db.prepare('SELECT id FROM archive_versions WHERE source_id=? AND version=?').bind(found.id,found.current_version).first<{id:string}>():null;
  const result=found?{id:found.id,versionId:previousVersion!.id}:await saveArchiveSource(db,d,actor);if(!found)created++;
  const legacy=legacyRegions.find(r=>r.url===entry.url);if(!legacy)continue;
  const priorFacts=await db.prepare('SELECT count(*) AS n FROM archive_facts WHERE source_id=?').bind(result.id).first<{n:number}>();if(priorFacts?.n===legacy.events.length)continue;
  const checked=checkedIntros.find(c=>c.categoryId===entry.providerId);
  const passageId='legacy-'+legacy.id;
  const stmts=[db.prepare('INSERT INTO archive_passages (id,source_id,version_id,locator,text,text_kind,review_status,created_at) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(passageId,result.id,result.versionId,'지역 소개 본문에 근거한 기존 재서술 · 원문 직접 인용 아님',legacy.summary,'paraphrase','legacy_checked',now)];
  legacy.events.forEach((e,i)=>{const evidenceId=passageId+'-event-'+i;stmts.push(db.prepare('INSERT INTO archive_passages (id,source_id,version_id,locator,text,text_kind,review_status,created_at) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(evidenceId,result.id,result.versionId,'지역 소개 본문에 근거한 연표 재서술 · 원문 구간 대조 대기',e.text,'paraphrase','legacy_checked',now));stmts.push(db.prepare('INSERT INTO archive_facts (id,source_id,passage_id,title,description,time_label,start_year,end_year,scope,review_status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind('legacy-'+legacy.id+'-'+i,result.id,evidenceId,e.title,e.text,e.time,e.from,e.to??null,'neighborhood','legacy_checked',now));});
  stmts.push(db.prepare('INSERT INTO archive_audit (id,source_id,action,actor,note,created_at) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(),result.id,'legacy_import',actor,checked?`지역 소개 페이지 응답 확인 ${checked.checkedAt} · 본문 지문 ${checked.introHash} · 기존 재서술 이전. 개별 사실 원문 대조 추가 필요.`:'기존 재서술 이전 · 개별 사실 원문 대조 추가 필요',now));await db.batch(stmts);
 }
 await db.batch([db.prepare('INSERT INTO archive_imports (id,kind,source_url,status,record_count,note,created_at) VALUES (?,?,?,?,?,?,?)').bind('foundation-2026-10-16-v1','foundation',regionMaster.sourceUrl,'completed',regions.length,JSON.stringify({sourcesCreated:created,note:regionMaster.note}),now),db.prepare('INSERT INTO archive_audit (id,source_id,action,actor,note,created_at) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(),null,'seed',actor,'지역 계층·공식 컬렉션 목록·기존 지역 설명 초기 적재',now)]);
 return {alreadyImported:false,...await counts(db)};
}
async function counts(db:D1Database){return await db.prepare('SELECT (SELECT count(*) FROM archive_regions) AS regions,(SELECT count(*) FROM archive_sources) AS sources,(SELECT count(*) FROM archive_facts) AS facts').first();}
