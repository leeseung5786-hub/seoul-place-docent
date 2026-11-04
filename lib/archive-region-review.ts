import {ServiceError,searchAddresses,type Secrets} from './providers';
import {hashText} from './archive-validation';

export const regionReviewLimit='주소 검색 응답에서 법정동 명칭과 코드가 일치함을 확인한 관측입니다. 행정표준코드의 생성·폐지 상태, 전체 법정동 목록의 완전성, 역사자료 내용 또는 건물·부지 동일성은 별도 검증 대상입니다.';
const meaningUrl='https://business.juso.go.kr/addrlink/qna/qnaDetail.do?bulletinRefSn=119802&noticeMgtSn=119802&noticeType=QNA';
type Region={id:string;parent_id:string;name:string;level:string;official_code:string|null;source_note:string;source_url:string;as_of:string;aliases:string;created_at:string};
type Review={id:string;region_id:string;revision:number;status:string;official_code:string|null;evidence:string;before_state:string;checked_at:string};
export function validateRegionReviewInput(input:unknown){
 const p=input as Record<string,unknown>|null;
 if(!p||typeof p.regionId!=='string'||p.regionId.length>150||!Number.isInteger(p.expectedRevision)||(p.expectedRevision as number)<0||!(p.expectedCode===null||typeof p.expectedCode==='string'&&/^11\d{8}$/.test(p.expectedCode)))throw new ServiceError('REGION_INPUT','지역 ID·기존 코드·검토 버전을 확인해 주세요.',400);
 return {regionId:p.regionId,expectedRevision:p.expectedRevision as number,expectedCode:p.expectedCode as string|null};
}
export async function regionReviewStats(db:D1Database){
 return await db.prepare(`SELECT
 (SELECT count(*) FROM archive_regions WHERE level='legal_dong') AS total,
 (SELECT count(*) FROM archive_regions WHERE level='legal_dong' AND official_code IS NOT NULL) AS withCode,
 (SELECT count(*) FROM archive_region_reviews rv WHERE rv.revision=(SELECT max(n.revision) FROM archive_region_reviews n WHERE n.region_id=rv.region_id)) AS reviewed,
 (SELECT count(*) FROM archive_region_reviews rv WHERE method='juso_exact_name' AND status='address_observed' AND rv.revision=(SELECT max(n.revision) FROM archive_region_reviews n WHERE n.region_id=rv.region_id AND n.method='juso_exact_name')) AS addressObserved,
 (SELECT count(*) FROM archive_region_reviews rv WHERE method='juso_exact_name' AND status='unconfirmed' AND rv.revision=(SELECT max(n.revision) FROM archive_region_reviews n WHERE n.region_id=rv.region_id AND n.method='juso_exact_name')) AS addressUnconfirmed,
 (SELECT count(*) FROM archive_region_reviews rv WHERE method='official_code_snapshot' AND json_extract(rv.evidence,'$.verificationBasis')='official_snapshot_only' AND rv.revision=(SELECT max(n.revision) FROM archive_region_reviews n WHERE n.region_id=rv.region_id AND n.method='official_code_snapshot')) AS officialCodeOnly,
 (SELECT count(*) FROM archive_region_reviews rv WHERE method='official_code_snapshot' AND rv.revision=(SELECT max(n.revision) FROM archive_region_reviews n WHERE n.region_id=rv.region_id AND n.method='official_code_snapshot')) AS lifecycleChecked,
 (SELECT count(*) FROM archive_region_reviews rv WHERE status='verified_current' AND rv.revision=(SELECT max(n.revision) FROM archive_region_reviews n WHERE n.region_id=rv.region_id AND n.method='official_code_snapshot')) AS verifiedCurrent,
 (SELECT count(*) FROM archive_region_reviews rv WHERE status='verified_abolished' AND rv.revision=(SELECT max(n.revision) FROM archive_region_reviews n WHERE n.region_id=rv.region_id AND n.method='official_code_snapshot')) AS verifiedAbolished,
 (SELECT count(*) FROM archive_region_reviews rv WHERE status='unconfirmed' AND rv.revision=(SELECT max(n.revision) FROM archive_region_reviews n WHERE n.region_id=rv.region_id)) AS unconfirmed,
 (SELECT count(*) FROM archive_region_reviews rv WHERE status IN ('code_conflict','lifecycle_conflict') AND rv.revision=(SELECT max(n.revision) FROM archive_region_reviews n WHERE n.region_id=rv.region_id)) AS conflicts`).first();
}
export async function listRegionReviews(db:D1Database){
 const rows=await db.prepare(`SELECT r.*,coalesce(rv.revision,0) AS review_revision,rv.status AS verification_status,rv.method AS verification_method,rv.official_name AS observed_name,rv.checked_at,rv.evidence AS verification_evidence FROM archive_regions r LEFT JOIN archive_region_reviews rv ON rv.region_id=r.id AND rv.revision=(SELECT max(n.revision) FROM archive_region_reviews n WHERE n.region_id=r.id) WHERE r.level='legal_dong' ORDER BY r.parent_id,r.name`).all();
 return {items:rows.results,stats:await regionReviewStats(db),scopeNote:'주소 응답 관측과 공식 코드 원문의 현존·폐지 상태 확인을 구분합니다. 최신 근거의 방법·확인일·공간 범위를 함께 확인하세요.',addressScopeNote:regionReviewLimit};
}
export async function verifyRegionAddress(db:D1Database,input:unknown,actor:string,secrets:Secrets){
 const p=validateRegionReviewInput(input);
 const region=await db.prepare('SELECT * FROM archive_regions WHERE id=?').bind(p.regionId).first<Region>();
 if(!region||region.level!=='legal_dong')throw new ServiceError('REGION_NOT_FOUND','등록된 법정동을 선택해 주세요.',404);
 const parent=await db.prepare("SELECT name FROM archive_regions WHERE id=? AND level='district'").bind(region.parent_id).first<{name:string}>();
 if(!parent)throw new ServiceError('REGION_PARENT','자치구 연결을 확인해 주세요.',409);
 const previous=await db.prepare('SELECT * FROM archive_region_reviews WHERE region_id=? ORDER BY revision DESC LIMIT 1').bind(region.id).first<Review>();
 const revision=previous?.revision||0;
 // A retried committed request is safe without another upstream query.
 if(p.expectedRevision===revision-1&&previous?.status==='address_observed'&&region.official_code===previous.official_code&&JSON.parse(previous.before_state).officialCode===p.expectedCode)return {id:region.id,revision,reviewId:previous.id,status:previous.status,officialCode:region.official_code,unchanged:true,scopeNote:regionReviewLimit};
 if(p.expectedRevision!==revision||region.official_code!==p.expectedCode)throw new ServiceError('REGION_CONFLICT','다른 지역 검토가 저장됐습니다. 최신 상태를 다시 조회해 주세요.',409);
 const query=`서울특별시 ${parent.name} ${region.name}`;
 const response=await searchAddresses(query,1,secrets);
 const matches=response.candidates.filter(c=>c.siNm==='서울특별시'&&c.sggNm===parent.name&&c.emdNm===region.name);
 const codes=[...new Set(matches.map(c=>c.admCd))];
 const code=codes.length===1?codes[0]:null;
 const duplicate=code?await db.prepare("SELECT id FROM archive_regions WHERE official_code=? AND id!=? AND level='legal_dong'").bind(code,region.id).first<{id:string}>():null;
 const status=!code?'unconfirmed':duplicate||region.official_code&&region.official_code!==code?'code_conflict':'address_observed';
 const evidence={sourceUrl:'https://business.juso.go.kr/addrlink/addrLinkApi.do',meaningUrl,
  sourceLocator:'results.juso[]의 siNm·sggNm·emdNm·admCd 및 roadAddr·jibunAddr',
  query,page:1,countPerPage:10,total:response.total,returned:response.candidates.length,
  matched:matches.map(c=>({siNm:c.siNm,sggNm:c.sggNm,emdNm:c.emdNm,admCd:c.admCd,roadAddr:c.roadAddr,jibunAddr:c.jibunAddr})),
  observedAt:response.queriedAt,officialLifecycle:'not_checked',
  result:status==='address_observed'?'자치구·법정동명 완전일치 및 단일 코드 관측':status==='code_conflict'?'기존 코드 또는 다른 지역의 코드와 상충하여 기존 값 유지':'완전일치하는 단일 코드가 없어 기존 값 유지',
  duplicateRegionId:duplicate?.id||null,
  rightsNote:'공식 주소 응답에서 식별 사실만 기록. API 인증값과 선택 토큰은 저장하지 않음. 역사 원문·사진의 보관 또는 재사용 허락을 의미하지 않음.',scopeNote:regionReviewLimit};
 const checkedAt=response.queriedAt,reviewId=crypto.randomUUID(),newCode=status==='address_observed'?code:region.official_code;
 const before={officialCode:region.official_code,sourceUrl:region.source_url,sourceNote:region.source_note,asOf:region.as_of,name:region.name,parentId:region.parent_id,aliases:region.aliases};
 const after={...before,officialCode:newCode};
 const fingerprint=await hashText(JSON.stringify({status,code,evidence}));
 // Revision uniqueness makes the entire D1 batch roll back on a concurrent
 // reviewer. The UPDATE's original values also guard other region writers.
 const guard='id=? AND official_code IS ? AND source_url=? AND source_note=? AND as_of=? AND name=? AND parent_id=? AND aliases=?';
 const guardValues=[region.id,region.official_code,region.source_url,region.source_note,region.as_of,region.name,region.parent_id,region.aliases];
 const duplicateGuard=status==='address_observed'?" AND NOT EXISTS(SELECT 1 FROM archive_regions other WHERE other.id!=? AND other.level='legal_dong' AND other.official_code=?)":'';
 const statements=[
  db.prepare(`INSERT INTO archive_region_reviews (id,region_id,revision,status,method,official_code,official_name,evidence,before_state,after_state,actor,checked_at) SELECT ?,?,?,?,?,?,?,?,?,?,?,? FROM archive_regions WHERE ${guard}${duplicateGuard}`).bind(reviewId,region.id,revision+1,status,'juso_exact_name',code,matches[0]?.emdNm||null,JSON.stringify(evidence),JSON.stringify(before),JSON.stringify(after),actor,checkedAt,...guardValues,...(duplicateGuard?[region.id,code]:[])),
  db.prepare(`UPDATE archive_regions SET official_code=? WHERE ${guard} AND EXISTS(SELECT 1 FROM archive_region_reviews WHERE id=?)`).bind(newCode,...guardValues,reviewId),
  db.prepare('INSERT INTO archive_audit (id,source_id,action,actor,note,created_at) SELECT ?,NULL,?,?,?,? WHERE EXISTS(SELECT 1 FROM archive_region_reviews WHERE id=?)').bind(crypto.randomUUID(),'region_verification',actor,JSON.stringify({regionId:region.id,revision:revision+1,reviewId,status,fingerprint,before,after,scopeNote:regionReviewLimit}),checkedAt,reviewId)
 ];
 try{await db.batch(statements);}catch{throw new ServiceError('REGION_CONFLICT','동시 검토가 있어 저장하지 않았습니다. 최신 상태를 확인해 주세요.',409);}
 if(!await db.prepare('SELECT id FROM archive_region_reviews WHERE id=?').bind(reviewId).first())throw new ServiceError('REGION_CONFLICT','지역 정보가 변경되어 저장하지 않았습니다. 최신 상태를 확인해 주세요.',409);
 return {id:region.id,revision:revision+1,reviewId,status,officialCode:newCode,observedCode:code,matched:matches.length,checkedAt,unchanged:false,scopeNote:regionReviewLimit};
}
