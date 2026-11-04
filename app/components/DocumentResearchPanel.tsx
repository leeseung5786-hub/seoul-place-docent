'use client';
import {useEffect, useState} from 'react';
import {ArrowUpRight, BookOpen, ChevronRight, FileText, Info, Loader2} from 'lucide-react';
import {readingText} from '@/lib/docent-story';
import type {DocumentPlaceResearch} from '@/lib/document-research';
import './document-research-panel.css';
export default function DocumentResearchPanel({district, dongs, onLoaded}: {district: string; dongs: string[]; onLoaded: (data: DocumentPlaceResearch | null) => void}) {
  const [data, setData] = useState<DocumentPlaceResearch | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const dongKey = dongs.join('|');
  useEffect(() => {
    setData(null); onLoaded(null); setError('');
    if (!district) return;
    const controller = new AbortController();
    setLoading(true);
    const params = new URLSearchParams({mode: 'place', district});
    dongKey.split('|').filter(Boolean).forEach(dong => params.append('dong', dong));
    fetch(`/api/archive/document-research?${params}`, {signal: controller.signal}).then(async response => {
      const body = await response.json() as DocumentPlaceResearch & {error?: string};
      if (!response.ok) throw new Error(body.error || '문헌 조사자료를 불러오지 못했습니다.');
      if (!controller.signal.aborted) {setData(body); onLoaded(body);}
    }).catch(e => {if (!controller.signal.aborted) setError(e instanceof Error ? e.message : '문헌 조사자료를 불러오지 못했습니다.');})
      .finally(() => {if (!controller.signal.aborted) setLoading(false);});
    return () => controller.abort();
  }, [district, dongKey, onLoaded, attempt]);
  if (!district) return null;
  const params = new URLSearchParams({table: 'drafts', district});
  if (data?.target) params.set('target', data.target);
  const href = '/archive/document-research?' + params;
  return <section className="place-doc-panel" aria-label="지역 문헌 조사자료">
    <div className="place-doc-heading"><span><BookOpen size={15}/>추가 문헌 조사자료</span><a href={href}>전체 보기<ArrowUpRight size={14}/></a></div>
    <h4>{data?.scope === 'legal_dong' ? data.drafts.map(r => r.values['동·권역명']).join('·') : district}의 역사 문헌</h4>
    {loading ? <p className="place-doc-message" role="status"><Loader2 size={15} className="spin"/>문헌 조사자료를 불러오는 중입니다.</p> : error ? <div className="place-doc-message" role="alert"><Info size={15}/><span>{error}</span><button type="button" onClick={() => setAttempt(n => n + 1)}>다시 불러오기</button></div> : data && <>
      <p className="place-doc-scope">{data.scope === 'legal_dong' ? '선택한 법정동의 이름과 자치구가 일치하는 조사자료입니다.' : '자치구 범위의 배경 조사자료를 표시합니다.'} 개별 건물·부지와의 관계는 미검증입니다.</p>
      {data.drafts.map(row => <article key={row.id}><div className="place-doc-meta"><span>{row.values['지역구분']} · {row.values['동·권역명']}</span></div><p>{readingText(row.values['본문초안'])}</p><details className="place-doc-evidence"><summary>이 글의 근거 · {row.evidenceIds.length}건</summary>{row.evidenceIds.map((id,i)=>{const claim=data.context.claims.find(c=>c.id===id);return <div key={id}><p><b>{i+1}.</b> {claim?.text}</p>{claim?.sourceIds.map(sourceId=>{const source=data.context.sources.find(s=>s.id===sourceId);return source?.url?<a key={sourceId} href={source.url} target="_blank" rel="noopener noreferrer">{source.title}<ArrowUpRight size={12}/></a>:null;})}<a href={'/archive/document-research?table=claims&id='+encodeURIComponent(id)}>상세 근거<ChevronRight size={12}/></a></div>;})}<a href={href}>전체 문헌과 근거<ChevronRight size={13}/></a></details></article>)}
      {!!data.timeline.length && <div className="place-doc-timeline"><b>자료 속 연표 <span>{data.timelineTotal}개 중 {data.timeline.length}개</span></b>{data.timeline.map(row => <div key={row.id}><span>{row.values['시기표기']}</span><a href={`/archive/document-research?table=timeline&id=${row.id}`}>{row.values['사건']}<ChevronRight size={12}/></a></div>)}</div>}
      <p className="place-doc-footnote"><FileText size={13}/>첨부 CSV의 조사 결과 · 자료 확인 2026.10.17~10.21 · 원문 대조 기록과 별도</p>
    </>}
  </section>;
}
