import {ServiceError} from './providers';
import {hashText} from './archive-validation';
import {currentPassageSql,passageStateSql} from './archive-passage-review';

export const originalObservationScopeNote='등록된 공식 원문의 제한된 열람 시도 기록입니다. HTTP 성공·문자열 발견은 내용 대조 완료, 역사 사실·공간 동일성 확인 또는 복제·재사용 허락이 아닙니다. 본문·검토 상태·버전·권리·지역 연결은 바꾸지 않습니다. 발췌는 응답에서만 제공하며 감사 DB에는 저장하지 않습니다.';
const officialHosts=new Set(['www.gangseo.seoul.kr','sd.go.kr','www.sd.go.kr','culture.jongno.go.kr','www.yongsan.go.kr','museum.seoul.go.kr']);
const byteLimit=1_000_000,excerptLimit=6000;
type Input={passageId:string;expectedFingerprint:string;requestId:string;searchText:string};
function fail(message:string):never{throw new ServiceError('ORIGINAL_OBSERVATION_INPUT',message,400);}
export function validateOriginalObservation(value:unknown):Input{
 if(!value||typeof value!=='object'||Array.isArray(value))fail('원문 열람 대상을 확인해 주세요.');
 const p=value as Record<string,unknown>;
 if(Object.keys(p).some(k=>!['passageId','expectedFingerprint','requestId','searchText'].includes(k)))fail('등록 본문 ID와 검색 문자열만 입력할 수 있습니다.');
 if(typeof p.passageId!=='string'||!p.passageId.trim()||p.passageId.length>200||typeof p.expectedFingerprint!=='string'||!/^[a-f0-9]{64}$/.test(p.expectedFingerprint)||typeof p.requestId!=='string'||! /^[A-Za-z0-9-]{1,100}$/.test(p.requestId)||typeof p.searchText!=='string'||!p.searchText.trim()||p.searchText.length>80||/[\u0000-\u001f]/.test(p.searchText))fail('본문 지문·요청 ID·검색 문자열을 확인해 주세요.');
 return {passageId:p.passageId.trim(),expectedFingerprint:p.expectedFingerprint,requestId:p.requestId,searchText:p.searchText.trim()};
}
export function officialOriginalUrl(raw:string,from?:string){
 let u:URL;try{u=new URL(raw);}catch{throw new ServiceError('ORIGINAL_OBSERVATION_URL','공식 원문 URL 형식을 확인해 주세요.',400);}
 if(u.protocol!=='https:'||u.username||u.password||u.port&&u.port!=='443'||!officialHosts.has(u.hostname))throw new ServiceError('ORIGINAL_OBSERVATION_URL','허용된 공식 기관의 HTTPS 원문만 열람할 수 있습니다.',400);
 if(from&&u.hostname.replace(/^www\./,'')!==new URL(from).hostname.replace(/^www\./,''))throw new ServiceError('ORIGINAL_OBSERVATION_REDIRECT','다른 기관으로 향하는 이동은 열람하지 않습니다.',400);
 u.hash='';return u.href;
}
function entities(text:string){return text.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp|middot|ndash|mdash|hellip|copy);/gi,(_,e:string)=>{
 const names:Record<string,string>={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',middot:'·',ndash:'–',mdash:'—',hellip:'…',copy:'©'};
 if(e[0]!=='#')return names[e.toLowerCase()]||'';
 const n=e[1].toLowerCase()==='x'?parseInt(e.slice(2),16):parseInt(e.slice(1),10);
 return n>0&&n<=0x10ffff&&!(n>=0xd800&&n<=0xdfff)?String.fromCodePoint(n):'�';
});}
export function originalTextWindow(html:string,searchText:string){
 const clean=html.replace(/<!--[\s\S]*?-->/g,' ').replace(/<(script|style|template|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,' ');
 const normalize=(s:string)=>entities(s.replace(/<[^>]*>/g,' ')).replace(/\s+/g,' ').trim();
 const title=normalize(clean.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i)?.[1]||'').slice(0,300);
 const plain=normalize(clean),needle=searchText.replace(/\s+/g,' ').trim(),at=plain.lastIndexOf(needle);
 if(at<0)return {title,textLength:plain.length,searchFound:false,excerpt:null,excerptStart:null,excerptTruncated:false};
 const start=Math.max(0,at-1200),excerpt=plain.slice(start,start+excerptLimit);
 return {title,textLength:plain.length,searchFound:true,excerpt,excerptStart:start,excerptTruncated:start>0||start+excerpt.length<plain.length};
}
async function shaBytes(bytes:Uint8Array){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new Uint8Array(bytes).buffer))].map(b=>b.toString(16).padStart(2,'0')).join('');}
type Transport={requestedUrl:string;finalUrl:string;attemptedAt:string;completedAt:string;httpStatus:number|null;contentType:string|null;status:'observed'|'failed';errorCode:string|null;bytes:number|null;htmlSha256:string|null;encoding:string|null;title:string;searchFound:boolean;excerpt:string|null;excerptStart:number|null;excerptTruncated:boolean;textLength:number|null;excerptSha256:string|null};
export async function fetchOfficialOriginal(url:string,searchText:string,fetcher:typeof fetch=fetch,timeoutMs=15000):Promise<Transport>{
 const requestedUrl=officialOriginalUrl(url),controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
 const out:Transport={requestedUrl,finalUrl:requestedUrl,attemptedAt:new Date().toISOString(),completedAt:'',httpStatus:null,contentType:null,status:'failed',errorCode:null,bytes:null,htmlSha256:null,encoding:null,title:'',searchFound:false,excerpt:null,excerptStart:null,excerptTruncated:false,textLength:null,excerptSha256:null};
 try{
  let response:Response|undefined;
  for(let i=0;i<4;i++){
   response=await fetcher(out.finalUrl,{method:'GET',redirect:'manual',credentials:'omit',signal:controller.signal,headers:{Accept:'text/html, application/xhtml+xml','User-Agent':'SeoulPlaceHistory-OriginalReview/1.0'}});
   out.httpStatus=response.status;
   if([301,302,303,307,308].includes(response.status)){
    const location=response.headers.get('location');await response.body?.cancel();
    if(!location||i===3){out.errorCode='REDIRECT_LIMIT';return out;}
    try{out.finalUrl=officialOriginalUrl(new URL(location,out.finalUrl).href,requestedUrl);}catch{out.errorCode='REDIRECT_BLOCKED';return out;}
   }else break;
  }
  if(!response||response.status!==200){out.errorCode='HTTP_STATUS';await response?.body?.cancel();return out;}
  const type=response.headers.get('content-type')||'';out.contentType=type;
  if(!/^(text\/html|application\/xhtml\+xml)(;|$)/i.test(type)){out.errorCode='UNSUPPORTED_MEDIA';await response.body?.cancel();return out;}
  if(Number(response.headers.get('content-length'))>byteLimit){out.errorCode='BODY_TOO_LARGE';await response.body?.cancel();return out;}
  const chunks:Uint8Array[]=[];let total=0;const reader=response.body?.getReader();
  if(!reader){out.errorCode='EMPTY_BODY';return out;}
  while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>byteLimit){await reader.cancel();out.errorCode='BODY_TOO_LARGE';return out;}chunks.push(value);}
  const bytes=new Uint8Array(total);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  out.bytes=total;out.htmlSha256=await shaBytes(bytes);
  const prefix=new TextDecoder().decode(bytes.slice(0,4096));
  out.encoding=(type.match(/charset=["']?([^\s;"']+)/i)?.[1]||prefix.match(/charset\s*=\s*["']?([\w-]+)/i)?.[1]||'utf-8').toLowerCase();
  let html:string;try{html=new TextDecoder(out.encoding,{fatal:true}).decode(bytes);}catch{out.errorCode='DECODING_FAILED';return out;}
  Object.assign(out,originalTextWindow(html,searchText));out.status='observed';
  out.excerptSha256=out.excerpt===null?null:await hashText(out.excerpt);
  return out;
 }catch{out.errorCode=controller.signal.aborted?'TIMEOUT':'NETWORK_ERROR';return out;}
 finally{clearTimeout(timer);out.completedAt=new Date().toISOString();}
}
type Saved={id:string;source_id:string;actor:string;action:string;note:string;created_at:string};
export async function observeArchiveOriginal(db:D1Database,value:unknown,actor:string,fetcher:typeof fetch=fetch){
 const p=validateOriginalObservation(value),inputHash=await hashText(JSON.stringify(p)),id='original-observation-'+await hashText(actor+'|'+p.requestId);
 const previous=await db.prepare('SELECT * FROM archive_audit WHERE id=?').bind(id).first<Saved>();
 const replay=(row:Saved)=>{const observation=JSON.parse(row.note);if(row.action!=='passage_original_observation'||row.actor!==actor||observation.inputHash!==inputHash)throw new ServiceError('ORIGINAL_OBSERVATION_CONFLICT','이미 사용된 요청 ID의 대상을 바꿀 수 없습니다.',409);return {observation,excerpt:null,unchanged:true,scopeNote:originalObservationScopeNote};};
 if(previous)return replay(previous);
 const row=await db.prepare(`SELECT p.id,p.source_id,s.url,${passageStateSql} AS state_json FROM archive_passages p JOIN archive_sources s ON s.id=p.source_id JOIN archive_versions pv ON pv.id=p.version_id AND pv.source_id=p.source_id WHERE p.id=? AND ${currentPassageSql}`).bind(p.passageId).first<{id:string;source_id:string;url:string;state_json:string}>();
 if(!row)throw new ServiceError('PASSAGE_NOT_CURRENT','현재 본문을 다시 조회해 주세요.',404);
 if(await hashText(row.state_json)!==p.expectedFingerprint)throw new ServiceError('ORIGINAL_OBSERVATION_CONFLICT','본문·원문·권리·지역 연결이 변경됐습니다.',409);
 const transport=await fetchOfficialOriginal(officialOriginalUrl(row.url),p.searchText,fetcher),{excerpt,...metadata}=transport;
 const observation={id,requestId:p.requestId,inputHash,passageId:row.id,sourceId:row.source_id,fingerprint:p.expectedFingerprint,searchText:p.searchText,...metadata,htmlHashKind:'response_body_bytes',excerptKind:'normalized_html_text_window',excerptLength:excerpt?.length||0,actor,scopeNote:originalObservationScopeNote};
 try{await db.prepare(`INSERT OR IGNORE INTO archive_audit (id,source_id,action,actor,note,created_at) SELECT ?,p.source_id,?,?,?,? FROM archive_passages p JOIN archive_sources s ON s.id=p.source_id JOIN archive_versions pv ON pv.id=p.version_id AND pv.source_id=p.source_id WHERE p.id=? AND ${currentPassageSql} AND ${passageStateSql}=?`).bind(id,'passage_original_observation',actor,JSON.stringify(observation),transport.completedAt,row.id,row.state_json).run();}catch{throw new ServiceError('ORIGINAL_OBSERVATION_AUDIT','원문 열람 감사 기록을 저장하지 못했습니다.',409);}
 const saved=await db.prepare('SELECT * FROM archive_audit WHERE id=?').bind(id).first<Saved>();
 if(!saved)throw new ServiceError('ORIGINAL_OBSERVATION_CONFLICT','열람 중 본문·자료가 변경돼 기록하지 않았습니다.',409);
 if(saved.note!==JSON.stringify(observation))return replay(saved);
 return {observation,excerpt,unchanged:false,scopeNote:originalObservationScopeNote};
}
export async function listOriginalObservations(db:D1Database,sourceId:unknown){
 if(typeof sourceId!=='string'||!sourceId||sourceId.length>200)fail('자료 ID를 확인해 주세요.');
 const rows=(await db.prepare("SELECT * FROM archive_audit WHERE source_id=? AND action='passage_original_observation' ORDER BY created_at DESC,id DESC LIMIT 31").bind(sourceId).all<Saved>()).results;
 return {items:rows.slice(0,30).map(r=>JSON.parse(r.note)),truncated:rows.length>30,scopeNote:originalObservationScopeNote};
}
