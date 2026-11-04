import snapshot from '../data/official-code-lifecycle-2026-10-20.json';
import {ServiceError} from './providers';
import {validateRegionReviewInput} from './archive-region-review';
import {hashText} from './archive-validation';

export const lifecycleScopeNote='공식 법정동 코드 조회자료의 코드·전체 명칭·현존/폐지 상태를 확인했습니다. 조회 시점의 상태이며 법령 시행일, 역사본문 검토 또는 개별 건물·부지 동일성 확인을 뜻하지 않습니다.';
type Region={id:string;parent_id:string;name:string;level:string;official_code:string|null;source_note:string;source_url:string;as_of:string;aliases:string;created_at:string};
type Review={id:string;revision:number;method:string;status:string;official_code:string|null;evidence:string;before_state:string};
type Snapshot=typeof snapshot;

/** The caller supplies only a registered ID and a CAS guard, never evidence.
 * This immutable, reviewed snapshot contains identifying facts, not a writable
 * client assertion or a user-selected remote URL.
 */
export function resolveLifecycleRow(region:Pick<Region,'id'|'parent_id'|'name'|'official_code'>,district:string,data:Snapshot=snapshot){
 const name=`서울특별시 ${district} ${region.name}`;
 const entries=data.entries.filter(x=>x.id===region.id&&x.name===name);
 if(entries.length!==1)throw new ServiceError('LIFECYCLE_SOURCE','공식 원문에서 명칭이 유일하게 일치하는 행을 확인해야 합니다.',503);
 const row=entries[0];
 if(!/^11\d{8}$/.test(row.code)||!['현존','폐지'].includes(row.state)||!Number.isInteger(row.row)||row.row<2||row.row>data.sourceRows+1||!/^\d{8}$|^$/.test(row.created)||!/^\d{8}$|^$/.test(row.abolished)||!/^[a-f0-9]{64}$/.test(data.fileSha256))throw new ServiceError('LIFECYCLE_SOURCE','공식 원문 행의 코드·상태·위치·무결성 정보를 확인해야 합니다.',503);
 if(row.state==='현존'&&row.abolished)throw new ServiceError('LIFECYCLE_SOURCE','현존 상태와 폐지일이 상충하는 원문입니다.',503);
 return {row,status:row.code!==region.official_code?'lifecycle_conflict':row.state==='현존'?'verified_current':'verified_abolished'};
}

export async function verifyRegionLifecycle(db:D1Database,input:unknown,actor:string){return reviewRegionLifecycle(db,input,actor,false);}

/** A distinct, narrowly gated path for an exact official legal name that the
 * first address-search page did not observe. It never asserts address absence
 * or manufactures a successful address observation. */
export async function verifyRegionOfficialCode(db:D1Database,input:unknown,actor:string){return reviewRegionLifecycle(db,input,actor,true);}

async function reviewRegionLifecycle(db:D1Database,input:unknown,actor:string,officialCodeOnly:boolean){
 const p=validateRegionReviewInput(input);
 const region=await db.prepare('SELECT * FROM archive_regions WHERE id=?').bind(p.regionId).first<Region>();
 if(!region||region.level!=='legal_dong')throw new ServiceError('REGION_NOT_FOUND','등록된 법정동을 선택해 주세요.',404);
 const parent=await db.prepare("SELECT name FROM archive_regions WHERE id=? AND level='district'").bind(region.parent_id).first<{name:string}>();
 if(!parent)throw new ServiceError('REGION_PARENT','자치구 연결을 확인해 주세요.',409);
 const resolved=resolveLifecycleRow(region,parent.name),row=resolved.row;
 const previous=await db.prepare('SELECT * FROM archive_region_reviews WHERE region_id=? ORDER BY revision DESC LIMIT 1').bind(region.id).first<Review>();
 const revision=previous?.revision||0;
 if(p.expectedRevision===revision-1&&previous?.method==='official_code_snapshot'&&region.official_code===previous.official_code&&JSON.parse(previous.before_state).officialCode===p.expectedCode&&JSON.parse(previous.evidence).fileSha256===snapshot.fileSha256&&(!officialCodeOnly||JSON.parse(previous.evidence).verificationBasis==='official_snapshot_only'))return {id:region.id,revision,reviewId:previous.id,status:previous.status,officialCode:region.official_code,unchanged:true,scopeNote:lifecycleScopeNote};
 if(p.expectedRevision!==revision||region.official_code!==p.expectedCode)throw new ServiceError('REGION_CONFLICT','다른 지역 검토가 저장됐습니다. 최신 상태를 다시 조회해 주세요.',409);
 const address=await db.prepare("SELECT id,official_code,status,evidence FROM archive_region_reviews WHERE region_id=? AND method='juso_exact_name' ORDER BY revision DESC LIMIT 1").bind(region.id).first<{id:string;official_code:string|null;status:string;evidence:string}>();
 if(officialCodeOnly){
  const observed=address?JSON.parse(address.evidence):null;
  if(region.official_code!==null||!address||previous?.id!==address.id||address.status!=='unconfirmed'||address.official_code!==null||!Array.isArray(observed?.matched)||observed.matched.length!==0||row.state!=='현존')throw new ServiceError('OFFICIAL_CODE_REVIEW_REQUIRED','코드가 비어 있고 최근 주소 응답에 정확한 명칭이 없는 현존 법정동만 공식 원문으로 대조할 수 있습니다.',409);
  if(await db.prepare("SELECT id FROM archive_regions WHERE official_code=? AND id!=? AND level='legal_dong'").bind(row.code,region.id).first())throw new ServiceError('REGION_CODE_DUPLICATE','다른 법정동에 같은 코드가 있어 기존 값을 유지했습니다.',409);
 }else if(!region.official_code||!address||address.status!=='address_observed'||address.official_code!==region.official_code)throw new ServiceError('LIFECYCLE_ADDRESS_REQUIRED','먼저 현재 명칭·코드를 공식 주소 응답과 대조해 주세요.',409);
 const status=officialCodeOnly?'verified_current':resolved.status,newCode=officialCodeOnly?row.code:region.official_code;
 const checkedAt=new Date().toISOString(),reviewId=crypto.randomUUID();
 const evidence={sourceUrl:snapshot.sourceUrl,downloadUrl:snapshot.downloadUrl,requestMethod:snapshot.method,sourceParameters:snapshot.parameters,
  sourceLocator:`${snapshot.fileName} / ${snapshot.sheetName}!A${row.row}:E${row.row}`,
  fileSha256:snapshot.fileSha256,zipSha256:snapshot.zipSha256,fileBytes:snapshot.fileBytes,sourceRows:snapshot.sourceRows,
  sourceAsOf:snapshot.sourceAsOf,retrievedAt:snapshot.retrievedAt,asOfNote:snapshot.asOfNote,
  row:{number:row.row,code:row.code,name:row.name,state:row.state,created:row.created||null,abolished:row.abolished||null},
  officialLifecycle:status==='lifecycle_conflict'?'code_conflict':row.state==='현존'?'current':'abolished',
  addressReviewId:address!.id,addressCode:address!.official_code,addressObservationStatus:address!.status,
  verificationBasis:officialCodeOnly?'official_snapshot_only':'address_and_official_snapshot',
  addressLimit:officialCodeOnly?'주소 검색 첫 페이지에서 정확한 명칭을 관측하지 못함. 주소 부재나 전체 검색 완료를 뜻하지 않으며 주소 응답 대조 수에 포함하지 않음.':null,checkedAt,
  result:status==='lifecycle_conflict'?'공식 원문 코드와 기존 주소 코드가 상충하여 기존 값 유지':officialCodeOnly?'공식 원문의 전체 명칭·현존 상태로 빈 코드 입력. 주소 응답 일치는 미확인으로 유지':`공식 원문의 전체 명칭·코드 일치 및 ${row.state} 상태 확인`,
  rightsNote:snapshot.rightsNote,scopeNote:lifecycleScopeNote};
 const before={officialCode:region.official_code,sourceUrl:region.source_url,sourceNote:region.source_note,asOf:region.as_of,name:region.name,parentId:region.parent_id,aliases:region.aliases};
 const after={...before,officialCode:newCode},fingerprint=await hashText(JSON.stringify(evidence));
 const guard='id=? AND official_code IS ? AND source_url=? AND source_note=? AND as_of=? AND name=? AND parent_id=? AND aliases=?';
 const values=[region.id,region.official_code,region.source_url,region.source_note,region.as_of,region.name,region.parent_id,region.aliases];
 const duplicateGuard=officialCodeOnly?" AND NOT EXISTS(SELECT 1 FROM archive_regions other WHERE other.id!=? AND other.level='legal_dong' AND other.official_code=?)":'';
 try{await db.batch([
  db.prepare(`INSERT INTO archive_region_reviews (id,region_id,revision,status,method,official_code,official_name,evidence,before_state,after_state,actor,checked_at) SELECT ?,?,?,?,?,?,?,?,?,?,?,? FROM archive_regions WHERE ${guard}${duplicateGuard}`).bind(reviewId,region.id,revision+1,status,'official_code_snapshot',newCode,region.name,JSON.stringify(evidence),JSON.stringify(before),JSON.stringify(after),actor,checkedAt,...values,...(officialCodeOnly?[region.id,newCode]:[])),
  ...(officialCodeOnly?[db.prepare(`UPDATE archive_regions SET official_code=? WHERE ${guard} AND EXISTS(SELECT 1 FROM archive_region_reviews WHERE id=?)`).bind(newCode,...values,reviewId)]:[]),
  db.prepare('INSERT INTO archive_audit (id,source_id,action,actor,note,created_at) SELECT ?,NULL,?,?,?,? WHERE EXISTS(SELECT 1 FROM archive_region_reviews WHERE id=?)').bind(crypto.randomUUID(),'region_lifecycle_verification',actor,JSON.stringify({regionId:region.id,reviewId,revision:revision+1,status,fingerprint,before,after,scopeNote:lifecycleScopeNote}),checkedAt,reviewId)
 ]);}catch{throw new ServiceError('REGION_CONFLICT','동시 검토가 있어 저장하지 않았습니다. 최신 상태를 확인해 주세요.',409);}
 if(!await db.prepare('SELECT id FROM archive_region_reviews WHERE id=?').bind(reviewId).first())throw new ServiceError('REGION_CONFLICT','지역 정보가 변경되어 저장하지 않았습니다. 최신 상태를 확인해 주세요.',409);
 return {id:region.id,revision:revision+1,reviewId,status,officialCode:newCode,observedCode:row.code,verificationBasis:evidence.verificationBasis,checkedAt,unchanged:false,scopeNote:lifecycleScopeNote};
}
