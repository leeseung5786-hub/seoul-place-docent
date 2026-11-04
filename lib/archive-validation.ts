import {ServiceError} from './providers';
import {classifyRecordGeography} from './archive-geography';
export const rightsLabels:Record<string,string>={unknown:'이용조건 미확인',KOGL0:'공공누리 제0유형',KOGL1:'공공누리 제1유형',KOGL2:'공공누리 제2유형',KOGL3:'공공누리 제3유형',KOGL4:'공공누리 제4유형',permission:'개별 이용허락',public_domain:'보호기간 만료 등 확인'};
export const reviewLabels:Record<string,string>={pending:'검토 대기',source_captured:'원문 확보 · 검토 대기',metadata_checked:'목록 확인',content_checked:'내용 검토',needs_review:'재검토 필요',rejected:'제외'};
export const kindLabels:Record<string,string>={collection:'컬렉션',publication:'간행물',document:'문서',photo:'사진',map:'지도',web:'웹자료',dataset:'데이터 목록'};
export type SourceInput={title:string;institution:string;providerId:string;url:string;kind:string;summary:string;publicationDate:string;subjectPeriod:string;rights:string;rightsUrl:string;rightsNote:string;storageAllowed:boolean;reuseAllowed:boolean;reviewStatus:string;regionIds:string[];changeNote:string};
function bounded(v:unknown,name:string,max:number,required=false){if(v!==undefined&&typeof v!=='string')throw new ServiceError('ARCHIVE_INPUT',`${name} 형식을 확인해 주세요.`,400);const s=(typeof v==='string'?v:'').trim();if((required&&!s)||s.length>max)throw new ServiceError('ARCHIVE_INPUT',`${name} 항목을 확인해 주세요.`,400);return s;}
export function safeArchiveUrl(v:unknown,required=true){const s=bounded(v,'원문 URL',2000,required);if(!s)return '';try{const u=new URL(s);if(!['https:','http:'].includes(u.protocol)||u.username||u.password||u.hostname==='localhost'||/^(127\.|10\.|192\.168\.|169\.254\.)/.test(u.hostname))throw new Error();return u.href;}catch{throw new ServiceError('ARCHIVE_URL','공개 원문의 http 또는 https URL을 입력해 주세요.',400);}}
export function validateSource(input:unknown):SourceInput {
 if(!input||typeof input!=='object'||Array.isArray(input))throw new ServiceError('ARCHIVE_INPUT','자료 내용을 확인해 주세요.',400);
 const d=input as Record<string,unknown>;const regionIds=d.regionIds??[];
 if(typeof d.title==='string'&&classifyRecordGeography({title:d.title,description:typeof d.summary==='string'?d.summary:undefined})==='outside_scope')throw new ServiceError('ARCHIVE_GEOGRAPHY','서울특별시·경기도 밖의 지역 자료는 등록할 수 없습니다. 소장기관 주소와 자료가 다루는 장소를 구분해 주세요.',400);
 if(!Array.isArray(regionIds)||regionIds.length>30||regionIds.some(v=>typeof v!=='string'||v.length>200))throw new ServiceError('ARCHIVE_REGIONS','지역 분류를 확인해 주세요.',400);
 for(const k of ['storageAllowed','reuseAllowed'])if(d[k]!==undefined&&typeof d[k]!=='boolean')throw new ServiceError('ARCHIVE_INPUT','이용허락 확인 값을 확인해 주세요.',400);
 const rights=bounded(d.rights,'이용조건',40)||'unknown',reviewStatus=bounded(d.reviewStatus,'검토 상태',40)||'pending',kind=bounded(d.kind,'자료 유형',40)||'web';
 if(!rightsLabels[rights]||!reviewLabels[reviewStatus]||!kindLabels[kind])throw new ServiceError('ARCHIVE_INPUT','자료 유형·이용조건·검토 상태를 확인해 주세요.',400);
 const rightsNote=bounded(d.rightsNote,'이용조건 확인 근거',3000),rightsUrl=safeArchiveUrl(d.rightsUrl,false),storageAllowed=d.storageAllowed===true,reuseAllowed=d.reuseAllowed===true;
 if((storageAllowed||reuseAllowed)&&(rights==='unknown'||!rightsNote||!rightsUrl))throw new ServiceError('ARCHIVE_RIGHTS','보관·재사용 허용에는 이용조건과 확인 근거 URL·설명이 필요합니다.',400);
 if(reuseAllowed&&['KOGL3','KOGL4'].includes(rights))throw new ServiceError('ARCHIVE_RIGHTS','변경금지 자료는 설명 변형·재사용 대상으로 설정할 수 없습니다.',400);
 return {title:bounded(d.title,'자료명',300,true),institution:bounded(d.institution,'제공기관',150,true),providerId:bounded(d.providerId,'기관 자료 ID',200),url:safeArchiveUrl(d.url),kind,summary:bounded(d.summary,'목록 설명',4000),publicationDate:bounded(d.publicationDate,'발행일',50),subjectPeriod:bounded(d.subjectPeriod,'대상 시기',200),rights,rightsUrl,rightsNote,storageAllowed,reuseAllowed,reviewStatus,regionIds:[...new Set(regionIds)] as string[],changeNote:bounded(d.changeNote,'변경 사유',1000)};
}
export function canonicalUrl(s:string){const u=new URL(s);u.hash='';for(const k of [...u.searchParams.keys()])if(k.startsWith('utm_'))u.searchParams.delete(k);u.searchParams.sort();return u.href;}
export async function hashText(value:string){const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');}
export function validatePassage(d:Record<string,unknown>,canStore:boolean){const text=bounded(d.text,'본문',12000,true),locator=bounded(d.locator,'원문 위치',500,true),textKind=bounded(d.textKind,'본문 종류',40)||'paraphrase';if(!['paraphrase','quotation','transcription'].includes(textKind))throw new ServiceError('ARCHIVE_PASSAGE','본문 종류를 확인해 주세요.',400);if(textKind!=='paraphrase'&&!canStore)throw new ServiceError('ARCHIVE_RIGHTS','원문 보관 허용을 확인한 뒤 인용·전사 본문을 등록해 주세요.',400);return {text,locator,textKind};}
export function escapeLike(q:string){return q.replace(/[\\%_]/g,'\\$&');}
