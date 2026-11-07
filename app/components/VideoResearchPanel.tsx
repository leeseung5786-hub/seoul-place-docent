'use client';
import {useEffect,useState} from 'react';
import {ArrowUpRight,Film,Loader2} from 'lucide-react';
import {relationLabels,type CatalogVideo,type VideoRelation,type VideoSource} from '@/lib/video-catalog-types';
import type {videoDetails} from '@/lib/video-catalog';
import './video-research-panel.css';

type Item=Omit<CatalogVideo,'refs'>&{sourceRowCount:number;relation?:VideoRelation};
type Details=NonNullable<Awaited<ReturnType<typeof videoDetails>>>;
type Data={total:number;page:number;pageSize:number;items:Item[];options:{districts:string[];providers:string[]};files:VideoSource[];meta:{workbookCount:number;primaryRows:number;uniqueLinkedVideos:number;heldRows:number;duplicatePrimaryRows:number;legacyOverlap:number;pdfCount:number;segmentRows:number;uniqueEntries:number}};
function Video({item}:{item:Item}){
 const [open,setOpen]=useState(false),[details,setDetails]=useState<Details|null>(null),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
 useEffect(()=>{if(!open)return;const controller=new AbortController();setError('');fetch('/api/archive/video-research?'+new URLSearchParams({dataset:'combined',id:item.id}),{signal:controller.signal}).then(async r=>{if(!r.ok)throw new Error('원본 조사 행을 불러오지 못했습니다.');return await r.json() as Details;}).then(d=>{if(!controller.signal.aborted)setDetails(d);}).catch(e=>{if(!controller.signal.aborted)setError(e instanceof Error?e.message:'조회 실패');});return()=>controller.abort();},[open,item.id,attempt]);
 return <article className="video-record">
  <div className="video-record-meta"><span>{item.source==='legacy'?'기존 보고서':item.source==='both'?'엑셀·기존 보고서 통합':'엑셀 조사자료'}</span><span>{item.url?'원문 링크 후보':'URL 확인 대기'}</span></div>
  <h4>{item.title}</h4>
  <p className="video-record-place">{[...new Set(item.regionLinks.map(l=>[l.district||'서울 전체',l.place].filter(Boolean).join(' · ')))].join(' / ')}</p>
  <small>{item.channel||'제작기관 미기재'}</small>
  {item.possibleDuplicateCount>0&&<p className="video-candidate-note">같은 제목의 다른 링크 {item.possibleDuplicateCount}개 · 중복 여부 검토 대기 <a href={'/archive/video-research?'+new URLSearchParams({q:item.title})}>함께 찾아보기</a></p>}
  <p>{item.description||'설명은 원본 조사 행에서 확인하세요.'}</p>
  <p>역사적 대상 시기: {item.historicalPeriods.join(' / ')||'미확인'}</p>
  <small>자료 날짜: {item.date||'미기재'} · {item.dateType||'날짜 종류 미기재'} · 길이: {item.duration||'미확인'}</small>
  <p className="video-scope-note">{item.relation?relationLabels[item.relation]:'지역 관련 조사 후보 · 건물·부지 일치 미검증'}</p>
  {item.url&&<div className="video-record-actions"><a href={item.url} target="_blank" rel="noopener noreferrer">원본 영상 페이지 열기<ArrowUpRight size={13}/></a></div>}
  <p className="video-review-note">원본 페이지의 현재 접근·재생·이용조건은 독립 검증 전입니다. 조사자료의 확인 표기는 상세에서 구분해 보여드립니다.</p>
  <details onToggle={e=>setOpen(e.currentTarget.open)}><summary>출처·시간 구간·원본 조사 행 ({item.sourceRowCount}행)</summary>
   {!details&&!error&&open&&<p role="status">조사 행을 불러오는 중입니다.</p>}
   {error&&<p role="alert">{error}<button onClick={()=>setAttempt(n=>n+1)}>다시 불러오기</button></p>}
   {details&&<>
    {details.records.map(record=><section className="video-original-record" key={record.ref}>
     <h5>{record.originalId} · {record.district||'서울 전체/기존 보고서'}</h5>
     <dl><dt>원자료 확인 수준</dt><dd>{record.reportedVerification||'기존 보고서 표기'}</dd><dt>원자료 실제 재생 확인 표기</dt><dd>{record.reportedPlayback||'미기재'}</dd><dt>사이트 독립 검증</dt><dd>미실시</dd><dt>행정동 / 법정동</dt><dd>{record.administrativeDong||'미확인'} / {record.legalDongs.join(', ')||'미확인'}</dd><dt>주소 표기 (영상 속 장소와 동일성 미검증)</dt><dd>{record.address||'미확인'}</dd><dt>촬영일 / 제작일 / 게시일</dt><dd>{record.filmedAt||'미확인'} / {record.producedAt||'미확인'} / {record.publishedAt||'미확인'}</dd><dt>저작권·이용조건 원문</dt><dd>{record.rights||'개별 조건 미확인'}</dd><dt>검토 메모</dt><dd>{record.notes||'별도 원본 참조'}</dd></dl>
     {record.sourceUrl&&<a href={record.sourceUrl} target="_blank" rel="noopener noreferrer">조사 출처 열기 ↗</a>}
     {record.segments.map((segment,i)=><div className="video-segment" key={segment.ref+':'+i}><b>원자료 시간: {segment.startLabel||'미기재'}–{segment.endLabel||'미기재'}</b><p>{segment.place} · {segment.description}</p><small>{segment.basis}</small><small>{segment.validTime?'시간 형식 확인 · 장면/시간 독립 검증 전':'시간 미확인 또는 형식·순서 확인 필요'}</small>{segment.verifiedTime&&segment.validTime&&item.videoId&&item.url&&<a href={item.url+'&t='+segment.start+'s'} target="_blank" rel="noopener noreferrer">검증된 구간 열기 ↗</a>}</div>)}
    </section>)}
    <details><summary>원본 열·값과 보조 시트 행 펼치기 ({details.rows.length}행)</summary>{details.rows.map((r,i)=><section className="video-raw-row" key={i}><b>{details.files.find(f=>f.id===r.fileId)?.filename||'기존 통합보고서'} · {r.sheet} · {r.row??'보고서'}행 · {r.originalId}</b><pre>{JSON.stringify({headers:details.sheets.find(s=>s.fileId===r.fileId&&s.sheet===r.sheet)?.headers,cells:r.cells,hyperlinks:r.hyperlinks},null,2)}</pre></section>)}</details>
    {!!details.references.length&&<div className="video-pdf-references"><h5>같은 URL이 기재된 참고 PDF</h5><p>URL 일치 관계이며 문서 내용·재생 검증 결과를 자동으로 합친 것이 아닙니다.</p>{details.references.map((r,i)=><a key={i} href={(details.files.find(f=>f.id===r.fileId)?.path||'')+'#page='+r.page} target="_blank" rel="noopener noreferrer">참고 PDF {r.page}쪽 ↗ </a>)}</div>}
    <div className="video-source-links">{details.files.map(f=><a key={f.id} href={f.path} download>{f.filename} 원본 내려받기</a>)}</div>
   </>}
  </details>
 </article>;
}
export default function VideoResearchPanel({district='',dong='',archive=false}:{district?:string;dong?:string;archive?:boolean}){
 const [query,setQuery]=useState(''),[selectedDistrict,setDistrict]=useState(district),[selectedDong,setDong]=useState(dong),[period,setPeriod]=useState(''),[provider,setProvider]=useState(''),[status,setStatus]=useState(''),[source,setSource]=useState(''),[page,setPage]=useState(1),[attempt,setAttempt]=useState(0);
 const [data,setData]=useState<Data|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true);
 useEffect(()=>{if(!archive)return;const p=new URLSearchParams(window.location.search);setDistrict(p.get('district')||'');setDong(p.get('dong')||'');setQuery(p.get('q')||'');},[archive]);
 useEffect(()=>{const controller=new AbortController();setLoading(true);setError('');const p=new URLSearchParams({dataset:'combined',q:query,district:selectedDistrict,dong:selectedDong,period,provider,status,source,page:String(page),limit:archive?'12':'6'});if(!archive)p.set('mode','place');const timer=setTimeout(()=>{fetch('/api/archive/video-research?'+p,{signal:controller.signal}).then(async r=>{const body=await r.json() as Data&{error?:string};if(!r.ok)throw new Error(body.error||'조회 실패');if(!controller.signal.aborted)setData(body);}).catch(e=>{if(!controller.signal.aborted)setError(e instanceof Error?e.message:'조회 실패');}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});},200);return()=>{clearTimeout(timer);controller.abort();};},[query,selectedDistrict,selectedDong,period,provider,status,source,page,attempt,archive]);
 function change(setter:(value:string)=>void,value:string){setter(value);setPage(1);}
 return <section className="video-research-panel" aria-label="역사 영상 자료">
  <header><span><Film size={18}/>영상으로 보는 동네의 시간</span>{!archive&&<a href={'/archive/video-research?'+new URLSearchParams({district,dong})}>전체 영상 보기<ArrowUpRight size={14}/></a>}</header>
  <h3>{archive?'서울 역사 영상 조사자료':`${district} ${dong}의 관련 영상`}</h3>
  <p>원본 영상 링크와 조사자료를 탐색합니다. 건물·부지의 직접 근거, 주변 장소, 동네, 자치구 배경의 동일성을 임의로 확정하지 않습니다.</p>
  {archive&&<>
   <div className="video-filters">
    <label>제목·설명·제작기관·장소 검색<input value={query} maxLength={150} onChange={e=>change(setQuery,e.target.value)} placeholder="예: 청량리역, 대한뉴스"/></label>
    <label>자치구<select value={selectedDistrict} onChange={e=>{change(setDistrict,e.target.value);setDong('');}}><option value="">서울 전체</option>{data?.options.districts.map(d=><option key={d}>{d}</option>)}</select></label>
    <label>행정동·법정동·관련 장소<input value={selectedDong} maxLength={60} onChange={e=>change(setDong,e.target.value)} placeholder="예: 성수동1가, 신림동"/></label>
    <label>역사적 대상 시기<select value={period} onChange={e=>change(setPeriod,e.target.value)}><option value="">전체 시기</option><option value="before1900">1900년 이전</option><option value="1900-1944">1900–1944년</option><option value="1945-1999">1945–1999년</option><option value="from2000">2000년 이후</option><option value="unknown">대상 연도 미확인</option></select></label>
    <label>자료원<select value={provider} onChange={e=>change(setProvider,e.target.value)}><option value="">전체 자료원</option>{data?.options.providers.map(p=><option key={p}>{p}</option>)}</select></label>
    <label>확인 상태<select value={status} onChange={e=>change(setStatus,e.target.value)}><option value="">전체 상태</option><option value="pending">원문 링크 후보 · 독립 검증 전</option><option value="held">URL·영상 ID 확인 대기</option></select></label>
    <label>조사 자료<select value={source} onChange={e=>change(setSource,e.target.value)}><option value="">엑셀·기존 보고서 전체</option><option value="workbooks">이번 엑셀</option><option value="legacy">기존 통합보고서</option></select></label>
   </div>
   {data&&<p className="video-import-summary">엑셀 {data.meta.workbookCount}개 · 대표 조사 {data.meta.primaryRows.toLocaleString()}행 · 반복 {data.meta.duplicatePrimaryRows}행 통합 · 기존 보고서와 {data.meta.legacyOverlap}개 중복 통합 · 통합 링크 후보 {data.meta.uniqueLinkedVideos.toLocaleString()}개 · URL 확인 대기 {data.meta.heldRows}행</p>}
   <details className="video-file-list"><summary>원본 엑셀·ZIP·참고 PDF와 시트별 처리 내역</summary><p>PDF는 참고 문서로 별도 보존하며 영상 행과 자동 병합하지 않았습니다. 이 압축파일의 PDF는 {data?.meta.pdfCount??'…'}개입니다.</p><div className="video-source-links"><a href="/research/video-workbooks/original.zip" download>원본 ZIP</a><a href="/research/video-workbooks/import-audit.json" download>시트별 집계·원본 지문</a><a href="/research/consolidated-20261106/seoul_historical_video_consolidated_report.md">기존 통합보고서</a><a href="/api/archive/video-research?group=all&download=1">기존 영상·제외 목록</a>{data?.files.map(f=><a key={f.id} href={f.path} download>{f.filename}</a>)}</div></details>
  </>}
  {loading?<p role="status"><Loader2 size={16} className="spin"/>영상 자료를 불러오는 중입니다.</p>:error?<p role="alert">{error}<button onClick={()=>setAttempt(n=>n+1)}>다시 불러오기</button></p>:data&&<>
   <p role="status">검색 결과 {data.total.toLocaleString()}개 · {data.page}/{Math.max(1,Math.ceil(data.total/data.pageSize))}페이지{!archive?' · 최대 6개씩 표시':''}</p>
   {!archive&&<p className="video-scope-note">법정동 관련 후보 → 지명 관련 후보 → 자치구·서울 배경 순서입니다. 배경영상은 선택한 건물에서 촬영된 영상이라는 뜻이 아닙니다.</p>}
   <div className="video-record-grid">{data.items.map(i=><Video key={i.id} item={i}/>)}</div>
   {!data.items.length&&<p>해당 조건의 영상 조사자료가 없습니다. 검색 조건을 바꿔 주세요.</p>}
   {archive&&data.total>data.pageSize&&<nav className="video-pagination" aria-label="영상 목록 페이지"><button disabled={data.page<=1} onClick={()=>setPage(data.page-1)}>이전</button><span>{data.page}/{Math.ceil(data.total/data.pageSize)}</span><button disabled={data.page*data.pageSize>=data.total} onClick={()=>setPage(data.page+1)}>다음</button></nav>}
  </>}
 </section>;
}
