'use client';
import {useEffect,useState} from 'react';
type Correction={id:string;revision:number;beforeText:string;afterText:string;reason:string;createdAt:string;active:boolean;evidence:{sourceUrl:string;sourceLocator:string;observedAt:string}};
export default function ArchivePassageCorrections({sourceId,refresh}:{sourceId:string;refresh:number}){
 const [items,setItems]=useState<Correction[]>([]),[error,setError]=useState(''),[truncated,setTruncated]=useState(false);
 useEffect(()=>{const controller=new AbortController();setItems([]);setError('');setTruncated(false);
  fetch('/api/archive/passage-corrections?'+new URLSearchParams({sourceId}),{signal:controller.signal,cache:'no-store'}).then(async r=>{const d=await r.json() as {items:Correction[];truncated:boolean;error?:{message?:string}};if(!r.ok)throw Error(d.error?.message||'교정 이력 조회 실패');if(!controller.signal.aborted){setItems(d.items);setTruncated(d.truncated);}}).catch(e=>{if(!controller.signal.aborted)setError(e.message);});return()=>controller.abort();
 },[sourceId,refresh]);
 if(error)return <p role="alert">교정 이력을 불러오지 못했습니다. {error}</p>;
 if(!items.length)return null;
 return <section className="archive-capture-evidence"><h3>재서술 교정 이력</h3><p className="archive-muted">이전 문장과 교정 근거를 함께 보존합니다. 자료 버전·원문·권리·지역 연결은 유지하며, 교정 후의 대조 상태는 본문 검토 기록에서 확인하세요.</p>
 {items.map(r=><details key={r.id}><summary>교정 {r.revision} · {new Date(r.createdAt).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})}{!r.active?' · 이후 변경 있음':''}</summary><dl className="archive-definition"><div><dt>이전 문장</dt><dd>{r.beforeText}</dd></div><div><dt>교정 문장</dt><dd>{r.afterText}</dd></div><div><dt>교정 사유</dt><dd>{r.reason}</dd></div><div><dt>원문 위치</dt><dd><a href={r.evidence.sourceUrl} target="_blank" rel="noopener noreferrer">{r.evidence.sourceLocator}</a></dd></div><div><dt>원문 확인일</dt><dd>{new Date(r.evidence.observedAt).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul'})}</dd></div></dl></details>)}
 {truncated&&<p>최근 교정 100개까지 표시했습니다.</p>}</section>;
}
