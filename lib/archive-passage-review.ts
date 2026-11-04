import {ServiceError} from './providers';
import {canonicalUrl,hashText,safeArchiveUrl} from './archive-validation';

export const passageReviewScopeNote='기존 본문과 제공기관 원문의 대조 기록입니다. 전승·추정은 그대로 구분하며 역사적 사실의 독립 확정, 개별 건물·부지 동일성이나 원문·사진·영상의 보관·재사용 허락을 뜻하지 않습니다.';
export const reviewDimensions=['names','chronology','tradition','consistency','rights','spatial'] as const;
export const classificationLabels:Record<string,string>={factual:'원문에 명시된 설명',tradition:'전승·유래설',mixed:'사실 설명과 전승 혼합',inference:'추정·해석',conflict:'상충',unconfirmed:'확인 보류'};
type Check={result:'checked'|'unresolved'|'not_applicable';note:string};
type Evidence={sourceUrl:string;sourceLocator:string;observedAt:string;sourceHash:string|null;classification:string;spatialScope:'neighborhood'|'district';scopeNote:string;summary:string;checks:Record<typeof reviewDimensions[number],Check>};
type Input={passageId:string;expectedRevision:number;expectedFingerprint:string;status:'content_checked'|'needs_review';evidence:Evidence};
const scopeSql="coalesce((SELECT json_group_array(json_object('id',scope.id,'regionId',scope.region_id,'label',scope.label,'relation',scope.relation,'basis',scope.basis)) FROM (SELECT pr.* FROM archive_passage_regions pr WHERE pr.passage_id=p.id ORDER BY pr.region_id,pr.id) scope),'[]')";
// SQLite creates this canonical snapshot both when reading and in the guarded
// transaction, so concurrent changes to text, metadata or scope invalidate it.
const stateSql=`json_object('passageId',p.id,'sourceId',p.source_id,'versionId',p.version_id,'text',p.text,'locator',p.locator,'textKind',p.text_kind,'sourceVersion',s.current_version,'sourceUrl',s.url,'institution',s.institution,'rights',s.rights,'rightsUrl',s.rights_url,'rightsNote',s.rights_note,'storageAllowed',s.storage_allowed,'reuseAllowed',s.reuse_allowed,'scopes',json(${scopeSql}))`;
const currentSql='pv.version=(SELECT max(vv.version) FROM archive_passages pp JOIN archive_versions vv ON vv.id=pp.version_id WHERE pp.source_id=p.source_id)';
export {stateSql as passageStateSql,currentSql as currentPassageSql};
export const activePassageReviewSql=`EXISTS(SELECT 1 FROM archive_passage_reviews checked JOIN archive_sources s ON s.id=p.source_id WHERE checked.passage_id=p.id AND checked.revision=(SELECT max(n.revision) FROM archive_passage_reviews n WHERE n.passage_id=p.id) AND checked.status='content_checked' AND checked.snapshot_json=${stateSql})`;
const joins='FROM archive_passages p JOIN archive_sources s ON s.id=p.source_id JOIN archive_versions pv ON pv.id=p.version_id AND pv.source_id=p.source_id';
const reviewJoin='LEFT JOIN archive_passage_reviews rv ON rv.passage_id=p.id AND rv.revision=(SELECT max(rn.revision) FROM archive_passage_reviews rn WHERE rn.passage_id=p.id)';
type Row={id:string;source_id:string;version_id:string;text:string;locator:string;text_kind:string;review_status:string;source_version:number;source_url:string;source_title:string;institution:string;state_json:string;review_id:string|null;review_revision:number;review_hash:string|null;review_status_latest:string|null;review_evidence:string|null;review_snapshot:string|null;reviewed_at:string|null;review_actor:string|null;is_current:number};
const projection=`p.*,s.current_version AS source_version,s.url AS source_url,s.title AS source_title,s.institution,${stateSql} AS state_json,rv.id AS review_id,coalesce(rv.revision,0) AS review_revision,rv.content_hash AS review_hash,rv.status AS review_status_latest,rv.evidence AS review_evidence,rv.snapshot_json AS review_snapshot,rv.checked_at AS reviewed_at,rv.actor AS review_actor,(${currentSql}) AS is_current`;
function fail(message:string):never{throw new ServiceError('PASSAGE_REVIEW_INPUT',message,400);}
function object(value:unknown,keys:string[]){if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!keys.includes(k)))fail('본문 검토 항목을 확인해 주세요.');return value as Record<string,unknown>;}
function text(value:unknown,max:number,min=1){if(typeof value!=='string'||value.trim().length<min||value.trim().length>max)fail('원문 위치와 항목별 검토 내용을 확인해 주세요.');return (value as string).trim();}
export function validatePassageReview(input:unknown):Input{
 const p=object(input,['passageId','expectedRevision','expectedFingerprint','status','evidence']);
 if(!Number.isInteger(p.expectedRevision)||(p.expectedRevision as number)<0||typeof p.expectedFingerprint!=='string'||!/^[a-f0-9]{64}$/.test(p.expectedFingerprint)||!['content_checked','needs_review'].includes(String(p.status)))fail('본문 ID·지문·검토 리비전·결과를 확인해 주세요.');
 const e=object(p.evidence,['sourceUrl','sourceLocator','observedAt','sourceHash','classification','spatialScope','scopeNote','summary','checks']);
 const observedAt=text(e.observedAt,40),time=Date.parse(observedAt);
 if(!Number.isFinite(time)||time>Date.now()+300000||time<Date.now()-7*86400000)fail('최근 7일 안에 실제 원문을 확인한 시각이 필요합니다.');
 if(typeof e.classification!=='string'||!Object.hasOwn(classificationLabels,e.classification)||(typeof e.spatialScope!=='string'||!['neighborhood','district'].includes(e.spatialScope)))fail('전승·추정·상충 분류와 동네·자치구 범위를 확인해 주세요.');
 if(e.sourceHash!==null&&!(typeof e.sourceHash==='string'&&/^[a-f0-9]{64}$/.test(e.sourceHash)))fail('직접 확보한 원문의 지문 또는 null을 입력해 주세요.');
 const raw=object(e.checks,[...reviewDimensions]),checks={} as Evidence['checks'];
 for(const name of reviewDimensions){const c=object(raw[name],['result','note']);if(!['checked','unresolved','not_applicable'].includes(String(c.result)))fail('항목별 대조 결과가 필요합니다.');checks[name]={result:c.result as Check['result'],note:text(c.note,1000,5)};}
 if(p.status==='content_checked'&&(Object.values(checks).some(c=>c.result==='unresolved')||['conflict','unconfirmed'].includes(e.classification)))fail('미해결·상충 항목은 재검토 필요 상태로 남겨 주세요.');
 if(p.status==='content_checked'&&(['names','consistency','rights','spatial'] as const).some(k=>checks[k].result!=='checked'))fail('명칭·상충·이용조건·공간 범위의 실제 대조가 필요합니다.');
 if(p.status==='content_checked'&&['tradition','mixed','inference'].includes(e.classification)&&checks.tradition.result!=='checked')fail('전승·추정의 표기 보존 여부를 확인해 주세요.');
 return {passageId:text(p.passageId,200),expectedRevision:p.expectedRevision as number,expectedFingerprint:p.expectedFingerprint as string,status:p.status as Input['status'],evidence:{sourceUrl:safeArchiveUrl(e.sourceUrl),sourceLocator:text(e.sourceLocator,500),observedAt,sourceHash:e.sourceHash as string|null,classification:e.classification,spatialScope:e.spatialScope as Evidence['spatialScope'],scopeNote:text(e.scopeNote,1000,5),summary:text(e.summary,2000,5),checks}};
}
export async function passageReviewStats(db:D1Database){
 return db.prepare(`WITH entries AS (SELECT rv.id AS review_id,rv.status,rv.snapshot_json=${stateSql} AS active ${joins} ${reviewJoin} WHERE ${currentSql}) SELECT count(*) AS currentPassages,coalesce(sum(review_id IS NOT NULL AND active),0) AS reviewed,coalesce(sum(status='content_checked' AND active),0) AS contentChecked,coalesce(sum(status='needs_review' AND active),0) AS needsReview,coalesce(sum(review_id IS NULL OR NOT active),0) AS unreviewed,coalesce(sum(review_id IS NULL OR NOT active OR status!='content_checked'),0) AS remaining FROM entries`).first();
}
export async function listPassageReviewTargets(db:D1Database,params:URLSearchParams){
 const after=params.get('after')||'',sourceId=params.get('sourceId')||'',kind=params.get('textKind')||'',limit=Number(params.get('limit')||20);
 if(after.length>200||sourceId.length>200||!Number.isInteger(limit)||limit<1||limit>30||kind&&!['paraphrase','transcription','quotation'].includes(kind))fail('본문 검토 목록의 범위를 확인해 주세요.');
 const where=[currentSql,'p.id>?'],values:unknown[]=[after];
 if(sourceId){where.push('p.source_id=?');values.push(sourceId);}if(kind){where.push('p.text_kind=?');values.push(kind);}
 if(params.get('unreviewed')==='true')where.push(`(rv.id IS NULL OR rv.snapshot_json!=${stateSql})`);
 else if(params.get('pending')!=='false')where.push(`(rv.id IS NULL OR rv.snapshot_json!=${stateSql} OR rv.status!='content_checked')`);
 const rows=(await db.prepare(`SELECT ${projection} ${joins} ${reviewJoin} WHERE ${where.join(' AND ')} ORDER BY p.id LIMIT ?`).bind(...values,limit+1).all<Row>()).results;
 const items=await Promise.all(rows.slice(0,limit).map(async r=>({...r,scopes:JSON.parse(r.state_json).scopes,fingerprint:await hashText(r.state_json),latestReview:r.review_id?{id:r.review_id,revision:r.review_revision,status:r.review_status_latest,active:r.review_snapshot===r.state_json,evidence:JSON.parse(r.review_evidence||'{}'),checkedAt:r.reviewed_at}:null})));
 return {items,hasMore:rows.length>limit,nextCursor:rows.length>limit?items.at(-1)?.id||null:null,stats:await passageReviewStats(db),scopeNote:passageReviewScopeNote};
}
export async function sourcePassageReviews(db:D1Database,sourceId:string){
 if(!sourceId||sourceId.length>200)fail('자료 ID를 확인해 주세요.');
 const rows=(await db.prepare(`SELECT ${projection} ${joins} ${reviewJoin} WHERE p.source_id=? AND rv.id IS NOT NULL ORDER BY p.id LIMIT 201`).bind(sourceId).all<Row>()).results;
 return {items:rows.slice(0,200).map(r=>({passageId:r.id,locator:r.locator,versionId:r.version_id,sourceVersion:r.source_version,reviewId:r.review_id,revision:r.review_revision,status:r.review_status_latest,active:!!r.is_current&&r.review_snapshot===r.state_json,evidence:JSON.parse(r.review_evidence||'{}'),actor:r.review_actor,checkedAt:r.reviewed_at})),truncated:rows.length>200,scopeNote:passageReviewScopeNote};
}
export async function reviewArchivePassage(db:D1Database,input:unknown,actor:string){
 const p=validatePassageReview(input);
 const row=await db.prepare(`SELECT ${projection} ${joins} ${reviewJoin} WHERE p.id=? AND ${currentSql}`).bind(p.passageId).first<Row>();
 if(!row)throw new ServiceError('PASSAGE_NOT_CURRENT','현재 본문을 다시 조회해 주세요.',404);
 if(canonicalUrl(p.evidence.sourceUrl)!==canonicalUrl(row.source_url))throw new ServiceError('PASSAGE_REVIEW_SOURCE','등록된 제공기관 원문과 같은 URL의 대조 근거가 필요합니다.',400);
 const fingerprint=await hashText(row.state_json),evidence=JSON.stringify(p.evidence),revision=row.review_revision;
 if(p.expectedRevision===revision-1&&row.review_hash===fingerprint&&p.expectedFingerprint===fingerprint&&row.review_evidence===evidence&&row.review_status_latest===p.status&&row.review_status===p.status)return {id:row.id,reviewId:row.review_id,revision,status:p.status,fingerprint,unchanged:true,scopeNote:passageReviewScopeNote};
 if(p.expectedRevision!==revision||p.expectedFingerprint!==fingerprint)throw new ServiceError('PASSAGE_REVIEW_CONFLICT','본문·자료·지역 분류 또는 검토 기록이 변경됐습니다. 최신 상태를 다시 읽어 주세요.',409);
 const scopes=JSON.parse(row.state_json).scopes as {regionId:string;relation:string}[];
 const districtOnly=scopes.length>0&&scopes.every(s=>s.relation==='district_context');
 if(p.evidence.spatialScope==='district'){
  const scopeLevels=(await db.prepare('SELECT r.level FROM archive_passage_regions pr JOIN archive_regions r ON r.id=pr.region_id WHERE pr.passage_id=?').bind(row.id).all<{level:string}>()).results;
  if(!districtOnly||scopeLevels.length!==scopes.length||scopeLevels.some(s=>s.level!=='district'))throw new ServiceError('PASSAGE_REVIEW_SCOPE','자치구 검토는 기존 자치구 맥락 연결이 있는 본문에만 기록할 수 있습니다.',400);
 }else if(districtOnly&&p.status==='content_checked')throw new ServiceError('PASSAGE_REVIEW_SCOPE','자치구 전체 설명은 동네 대조 완료로 기록할 수 없습니다. 자치구 범위를 선택해 주세요.',400);
 const id=crypto.randomUUID(),checkedAt=new Date().toISOString();
 try{await db.batch([
  db.prepare(`INSERT INTO archive_passage_reviews (id,passage_id,version_id,source_version,revision,status,content_hash,snapshot_json,evidence,actor,checked_at) SELECT ?,p.id,p.version_id,s.current_version,?,?,?,?,?,?,? ${joins} WHERE p.id=? AND ${currentSql} AND p.review_status=? AND ${stateSql}=? AND coalesce((SELECT max(revision) FROM archive_passage_reviews WHERE passage_id=p.id),0)=?`).bind(id,revision+1,p.status,fingerprint,row.state_json,evidence,actor,checkedAt,row.id,row.review_status,row.state_json,revision),
  db.prepare('UPDATE archive_passages SET review_status=? WHERE id=? AND EXISTS(SELECT 1 FROM archive_passage_reviews WHERE id=?)').bind(p.status,row.id,id),
  db.prepare('INSERT INTO archive_audit (id,source_id,action,actor,note,created_at) SELECT ?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM archive_passage_reviews WHERE id=?)').bind(crypto.randomUUID(),row.source_id,'passage_content_review',actor,JSON.stringify({passageId:row.id,reviewId:id,revision:revision+1,fingerprint,beforeStatus:row.review_status,status:p.status,scopeNote:passageReviewScopeNote}),checkedAt,id)
 ]);}catch{throw new ServiceError('PASSAGE_REVIEW_CONFLICT','동시 수정 또는 감사 기록 오류로 저장하지 않았습니다.',409);}
 if(!await db.prepare('SELECT id FROM archive_passage_reviews WHERE id=?').bind(id).first())throw new ServiceError('PASSAGE_REVIEW_CONFLICT','본문이나 자료가 변경돼 저장하지 않았습니다. 다시 조회해 주세요.',409);
 return {id:row.id,reviewId:id,revision:revision+1,status:p.status,fingerprint,checkedAt,unchanged:false,scopeNote:passageReviewScopeNote};
}
