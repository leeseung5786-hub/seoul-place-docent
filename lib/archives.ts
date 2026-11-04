import {XMLParser,XMLValidator} from 'fast-xml-parser';
import {checkedFetch,ServiceError} from './providers';
import {filterArchiveRecords} from './archive-geography';
export type ArchiveSecrets={NATIONAL_ARCHIVES_API_KEY?:string;SEOUL_PHOTOS_API_KEY?:string};
export type ArchiveCandidate={id:string;title:string;description:string;productionYear:string;institution:string;recordType:string;openness:string;onlineReading:string;url:string;scope:'검색 후보';relation:string};
export type ArchiveSearch={provider:'national'|'photos';items:ArchiveCandidate[];total:number;providerTotal:number;excludedCount?:number;outsideScopeCount?:number;geographicScope?:readonly string[];unconfirmedLocationCount?:number;filterScope?:'page'|'query';page:number;pageSize:number;query:string;queriedAt:string;sourceUrl:string;truncated:boolean};
export const PHOTO_COLLECTION_ENDPOINT='https://api.odcloud.kr/api/15134917/v1/uddi:abe4c16a-d8e9-49be-997a-f97f77ad4342';
export const xmlParser=new XMLParser({ignoreAttributes:true,parseTagValue:false,trimValues:true,processEntities:true});
export function readProviderXml(text:string){if(/<!DOCTYPE|<!ENTITY/i.test(text)||XMLValidator.validate(text)!==true)throw new ServiceError('XML_FORMAT','제공기관 응답을 해석하지 못했습니다.');return xmlParser.parse(text);}
export function cleanText(value:unknown){return (typeof value==='string'||typeof value==='number'?String(value):'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();}
export function safeRecordUrl(value:unknown){const text=String(value??'').trim();try{const u=new URL(text);if(!['https:','http:'].includes(u.protocol)||!(u.hostname==='archives.go.kr'||u.hostname.endsWith('.archives.go.kr')))return '';u.protocol='https:';return u.href;}catch{return '';}}
function findChannel(data:unknown,depth=0):Record<string,any>|null {if(!data||typeof data!=='object'||depth>8)return null;const d=data as Record<string,any>;if(d.channel&&typeof d.channel==='object')return d.channel;for(const value of Object.values(d)){const c=findChannel(value,depth+1);if(c)return c;}return null;}
export function normalizeNationalXml(text:string){
 const parsed=readProviderXml(text);const channel=findChannel(parsed);
 if(!channel||channel.total===undefined||!/^\d+$/.test(String(channel.total)))throw new ServiceError('NATIONAL_PROVIDER','국가기록원 응답을 확인하지 못했습니다. 인증·활용신청 상태 또는 제공기관 오류를 확인해야 합니다.');
 const raw=channel.item;const rows:Record<string,unknown>[]=Array.isArray(raw)?raw:raw&&typeof raw==='object'?[raw]:[];
 const items:ArchiveCandidate[]=rows.map(x=>({id:[cleanText(x.rc_type),cleanText(x.rc_code),cleanText(x.rc_rfile_no),cleanText(x.rc_ritem_no)].join(':'),title:cleanText(x.title)||'제목 미기재',description:'',productionYear:cleanText(x.prod_year),institution:cleanText(x.prod_name),recordType:cleanText(x.rc_type).toUpperCase()==='RFILE'?'철':cleanText(x.rc_type).toUpperCase()==='RITEM'?'건':'미기재',openness:({'1':'공개','2':'부분공개','3':'비공개'} as Record<string,string>)[cleanText(x.is_open)]??'미확인',onlineReading:cleanText(x.online_reading)==='Y'?'온라인 원문 열람 가능':cleanText(x.online_reading)==='N'?'온라인 원문 미제공':'미확인',url:safeRecordUrl(x.link),scope:'검색 후보',relation:'검색어 기반 메타데이터 후보 · 서울·경기 내 장소 메타데이터 후보 · 현재 주소와 같은 부지인지 미검증'}));
 return {items,total:Number(channel.total)};
}
/** Every query/page uses the same Seoul/Gyeonggi scope. Unknown is not outside. */
export const excludeUnrelatedNationalRecords=filterArchiveRecords;
export function normalizePhotoJson(data:Record<string,any>){
 if(!Array.isArray(data.data)||!Number.isFinite(Number(data.totalCount)))throw new ServiceError('PHOTO_PROVIDER','사진 컬렉션 응답을 확인하지 못했습니다. 해당 API의 활용신청·인증 상태를 확인해 주세요.');
 const items:ArchiveCandidate[]=data.data.map((x:Record<string,unknown>)=>({id:cleanText(x['ID(컬렉션번호)']??x.ID),title:cleanText(x['TITLE(컬렉션제목)']??x.TITLE)||'제목 미기재',description:cleanText(x['DESC(컬렉션내용)']??x.DESC),productionYear:'',institution:'서울기록원',recordType:'사진 컬렉션 목록',openness:'목록 공개 · 원본별 이용조건 별도 확인',onlineReading:'사진 원본은 공식 아카이브에서 확인',url:'',scope:'검색 후보',relation:'컬렉션 제목·설명의 키워드 일치 · 촬영 위치와 입력 부지 일치 미검증'}));
 return {items,total:Number(data.totalCount)};
}
export function validQuery(query:string,allowEmpty=false){const q=query.trim().replace(/[\^|"<>]/g,' ').replace(/\s+/g,' ').trim();if(q.length>(80)||(!allowEmpty&&q.length<2))throw new ServiceError('INVALID_QUERY','검색어를 2~80자로 입력해 주세요.',400);return q;}
export function validPage(page:number){if(!Number.isInteger(page)||page<1||page>100)throw new ServiceError('INVALID_PAGE','페이지를 확인해 주세요.',400);}
export async function nationalRecords(query:string,page:number,secrets:ArchiveSecrets):Promise<ArchiveSearch>{
 const q=validQuery(query);validPage(page);if(!secrets.NATIONAL_ARCHIVES_API_KEY)throw new ServiceError('KEY_MISSING','국가기록물 연결을 준비 중입니다.',503);
 const u=new URL('https://apis.data.go.kr/1741050/openapi/searcharc');Object.entries({serviceKey:secrets.NATIONAL_ARCHIVES_API_KEY,query:q,pageNo:String(page),display:'10'}).forEach(([k,v])=>u.searchParams.set(k,v));
 const d=normalizeNationalXml(await(await checkedFetch(u)).text());const filtered=excludeUnrelatedNationalRecords(d.items);return {provider:'national',...d,...filtered,filterScope:'page',providerTotal:d.total,page,pageSize:10,query:q,queriedAt:new Date().toISOString(),sourceUrl:'https://www.data.go.kr/data/15158780/openapi.do',truncated:false};
}
let photoCache:{expires:number;items:ArchiveCandidate[];total:number;queriedAt:string}|undefined;
export async function photoCollections(query:string,page:number,secrets:ArchiveSecrets):Promise<ArchiveSearch>{
 const q=validQuery(query,true);validPage(page);if(!secrets.SEOUL_PHOTOS_API_KEY)throw new ServiceError('KEY_MISSING','사진 컬렉션 연결을 준비 중입니다.',503);
 let data=photoCache;if(!data||data.expires<Date.now()){
  const items:ArchiveCandidate[]=[];let total=0,p=1;do{const u=new URL(PHOTO_COLLECTION_ENDPOINT);Object.entries({serviceKey:secrets.SEOUL_PHOTOS_API_KEY,page:String(p),perPage:'100',returnType:'JSON'}).forEach(([k,v])=>u.searchParams.set(k,v));const response=await checkedFetch(u);let raw:Record<string,any>;try{raw=await response.json() as Record<string,any>;}catch{throw new ServiceError('PHOTO_FORMAT','사진 컬렉션 응답을 해석하지 못했습니다.');}const d=normalizePhotoJson(raw);items.push(...d.items);total=d.total;p++;}while((p-1)*100<total&&p<=10);data={expires:Date.now()+60*60*1000,items,total,queriedAt:new Date().toISOString()};photoCache=data;
 }
 const terms=q.toLowerCase().split(/\s+/).filter(Boolean);const matches=data.items.filter(x=>terms.every(term=>(x.title+' '+x.description).toLowerCase().includes(term)));
 const filtered=filterArchiveRecords(matches);
 return {provider:'photos',...filtered,items:filtered.items.slice((page-1)*10,page*10),filterScope:'query',total:filtered.items.length,providerTotal:data.total,page,pageSize:10,query:q,queriedAt:data.queriedAt,sourceUrl:'https://www.data.go.kr/data/15134917/fileData.do',truncated:data.total>1000};
}
