import {ServiceError} from './providers';
import {canonicalUrl,hashText} from './archive-validation';
import {validatePassageReview,passageStateSql,currentPassageSql} from './archive-passage-review';

export const passageCorrectionScopeNote='짧은 재서술의 편집 교정입니다. 이전 문장과 근거를 보존하며 원문·자료 버전·권리·지역 연결은 바꾸지 않습니다. 교정 후에는 새 본문 대조가 필요합니다.';
function fail(message:string):never{throw new ServiceError('PASSAGE_CORRECTION_INPUT',message,400);}
function text(value:unknown,max:number,min=1){if(typeof value!=='string'||value.trim().length<min||value.trim().length>max)fail('교정 문장과 사유를 확인해 주세요.');return (value as string).trim();}
export function validatePassageCorrection(value:unknown){
 if(!value||typeof value!=='object'||Array.isArray(value))fail('교정 항목을 확인해 주세요.');
 const p=value as Record<string,unknown>;
 if(Object.keys(p).some(k=>!['passageId','expectedReviewRevision','expectedCorrectionRevision','expectedFingerprint','text','reason','evidence'].includes(k)))fail('지원하지 않는 교정 항목입니다.');
 if(!Number.isInteger(p.expectedCorrectionRevision)||(p.expectedCorrectionRevision as number)<0)fail('교정 리비전을 확인해 주세요.');
 const reviewed=validatePassageReview({passageId:p.passageId,expectedRevision:p.expectedReviewRevision,expectedFingerprint:p.expectedFingerprint,status:'content_checked',evidence:p.evidence});
 if(!reviewed.evidence.sourceHash)fail('직접 확인한 등록 원문의 SHA-256 근거가 필요합니다.');
 return {passageId:reviewed.passageId,expectedReviewRevision:reviewed.expectedRevision,expectedCorrectionRevision:p.expectedCorrectionRevision as number,expectedFingerprint:reviewed.expectedFingerprint,text:text(p.text,1200,10),reason:text(p.reason,1000,10),evidence:reviewed.evidence};
}
const joins='FROM archive_passages p JOIN archive_sources s ON s.id=p.source_id JOIN archive_versions pv ON pv.id=p.version_id AND pv.source_id=p.source_id';
type Row={id:string;source_id:string;version_id:string;text:string;text_kind:string;review_status:string;source_version:number;source_url:string;state_json:string;after_state:string;review_id:string;review_revision:number;review_snapshot:string;review_status_latest:string;correction_revision:number;fact_count:number};
type Correction={id:string;revision:number;request_hash:string;before_hash:string;after_hash:string;created_at:string};
export async function correctArchiveParaphrase(db:D1Database,input:unknown,actor:string){
 const p=validatePassageCorrection(input),requestHash=await hashText(JSON.stringify(p));
 const row=await db.prepare(`SELECT p.*,s.current_version AS source_version,s.url AS source_url,${passageStateSql} AS state_json,json_set(${passageStateSql},'$.text',?) AS after_state,rv.id AS review_id,rv.revision AS review_revision,rv.snapshot_json AS review_snapshot,rv.status AS review_status_latest,coalesce((SELECT max(revision) FROM archive_passage_corrections WHERE passage_id=p.id),0) AS correction_revision,(SELECT count(*) FROM archive_facts WHERE passage_id=p.id) AS fact_count ${joins} LEFT JOIN archive_passage_reviews rv ON rv.passage_id=p.id AND rv.revision=(SELECT max(revision) FROM archive_passage_reviews WHERE passage_id=p.id) WHERE p.id=? AND ${currentPassageSql}`).bind(p.text,p.passageId).first<Row>();
 if(!row)throw new ServiceError('PASSAGE_NOT_CURRENT','현재 본문을 다시 조회해 주세요.',404);
 if(canonicalUrl(row.source_url)!==canonicalUrl(p.evidence.sourceUrl))throw new ServiceError('PASSAGE_CORRECTION_SOURCE','등록된 원문과 같은 URL의 근거가 필요합니다.',400);
 const beforeHash=await hashText(row.state_json);
 const latest=await db.prepare('SELECT id,revision,request_hash,before_hash,after_hash,created_at FROM archive_passage_corrections WHERE passage_id=? ORDER BY revision DESC LIMIT 1').bind(row.id).first<Correction>();
 if(latest&&latest.revision===p.expectedCorrectionRevision+1&&latest.request_hash===requestHash&&latest.after_hash===beforeHash)return {id:row.id,correctionId:latest.id,correctionRevision:latest.revision,fingerprint:latest.after_hash,beforeFingerprint:latest.before_hash,unchanged:true,scopeNote:passageCorrectionScopeNote};
 if(row.text_kind!=='paraphrase'||row.fact_count)throw new ServiceError('PASSAGE_CORRECTION_KIND','연표가 연결되지 않은 짧은 재서술만 교정할 수 있습니다. 인용·전사는 원문 그대로 보존합니다.',400);
 if(row.review_status!=='needs_review'||row.review_status_latest!=='needs_review'||row.review_snapshot!==row.state_json)throw new ServiceError('PASSAGE_CORRECTION_REVIEW','현재 본문에 대한 미해결 검토가 먼저 필요합니다.',409);
 if(row.review_revision!==p.expectedReviewRevision||row.correction_revision!==p.expectedCorrectionRevision||beforeHash!==p.expectedFingerprint)throw new ServiceError('PASSAGE_CORRECTION_CONFLICT','본문·검토·교정 또는 자료가 변경됐습니다. 최신 상태를 읽어 주세요.',409);
 const scopes=JSON.parse(row.state_json).scopes as {relation:string}[];
 if(p.evidence.spatialScope!=='neighborhood'||scopes.some(s=>s.relation==='district_context'))throw new ServiceError('PASSAGE_CORRECTION_SCOPE','이 교정 경로는 기존 동네 재서술에만 사용합니다. 공간 연결은 바꾸지 않습니다.',400);
 if(row.text===p.text)fail('변경된 재서술이 필요합니다.');
 const id=crypto.randomUUID(),now=new Date().toISOString(),afterHash=await hashText(row.after_state),evidence=JSON.stringify(p.evidence);
 try{await db.batch([
  db.prepare(`INSERT INTO archive_passage_corrections (id,passage_id,version_id,source_version,revision,prior_review_id,request_hash,before_hash,after_hash,before_snapshot,after_snapshot,reason,evidence,actor,created_at) SELECT ?,p.id,p.version_id,s.current_version,?,?,?,?,?,?,?,?,?,?,? ${joins} WHERE p.id=? AND ${currentPassageSql} AND p.text_kind='paraphrase' AND p.review_status='needs_review' AND ${passageStateSql}=? AND coalesce((SELECT max(revision) FROM archive_passage_corrections WHERE passage_id=p.id),0)=? AND (SELECT id FROM archive_passage_reviews WHERE passage_id=p.id ORDER BY revision DESC LIMIT 1)=? AND NOT EXISTS(SELECT 1 FROM archive_facts WHERE passage_id=p.id)`).bind(id,row.correction_revision+1,row.review_id,requestHash,beforeHash,afterHash,row.state_json,row.after_state,p.reason,evidence,actor,now,row.id,row.state_json,row.correction_revision,row.review_id),
  db.prepare("UPDATE archive_passages SET text=?,review_status='needs_review' WHERE id=? AND EXISTS(SELECT 1 FROM archive_passage_corrections WHERE id=?)").bind(p.text,row.id,id),
  db.prepare('INSERT INTO archive_audit (id,source_id,action,actor,note,created_at) SELECT ?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM archive_passage_corrections WHERE id=?)').bind(crypto.randomUUID(),row.source_id,'passage_paraphrase_correction',actor,JSON.stringify({passageId:row.id,correctionId:id,correctionRevision:row.correction_revision+1,priorReviewId:row.review_id,beforeHash,afterHash,reason:p.reason,scopeNote:passageCorrectionScopeNote}),now,id)
 ]);}catch{throw new ServiceError('PASSAGE_CORRECTION_CONFLICT','동시 수정 또는 감사 기록 오류로 교정을 저장하지 않았습니다.',409);}
 if(!await db.prepare('SELECT id FROM archive_passage_corrections WHERE id=?').bind(id).first())throw new ServiceError('PASSAGE_CORRECTION_CONFLICT','본문·자료·검토가 변경돼 교정하지 않았습니다.',409);
 return {id:row.id,correctionId:id,correctionRevision:row.correction_revision+1,fingerprint:afterHash,beforeFingerprint:beforeHash,unchanged:false,scopeNote:passageCorrectionScopeNote};
}
export async function sourcePassageCorrections(db:D1Database,sourceId:string){
 const id=text(sourceId,200);
 const rows=(await db.prepare(`SELECT c.*,(${currentPassageSql} AND c.after_snapshot=${passageStateSql}) AS active FROM archive_passage_corrections c JOIN archive_passages p ON p.id=c.passage_id JOIN archive_sources s ON s.id=p.source_id JOIN archive_versions pv ON pv.id=p.version_id WHERE p.source_id=? ORDER BY c.created_at DESC,c.id DESC LIMIT 101`).bind(id).all<Record<string,unknown>>()).results;
 return {items:rows.slice(0,100).map(r=>({id:r.id,passageId:r.passage_id,versionId:r.version_id,sourceVersion:r.source_version,revision:r.revision,priorReviewId:r.prior_review_id,beforeFingerprint:r.before_hash,fingerprint:r.after_hash,beforeText:JSON.parse(String(r.before_snapshot)).text,afterText:JSON.parse(String(r.after_snapshot)).text,reason:r.reason,evidence:JSON.parse(String(r.evidence)),actor:r.actor,createdAt:r.created_at,active:!!r.active})),truncated:rows.length>100,scopeNote:passageCorrectionScopeNote};
}
