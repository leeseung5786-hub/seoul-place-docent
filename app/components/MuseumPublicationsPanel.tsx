'use client';
import {useEffect, useState} from 'react';
import {ArrowUpRight, BookOpen, Loader2} from 'lucide-react';
import type {MuseumPublications} from '@/lib/place-context';
export default function MuseumPublicationsPanel({district, dongs, regionName, onLoaded}: {district: string; dongs: string[]; regionName: string; onLoaded: (value: MuseumPublications | null) => void}) {
  const [data, setData] = useState<MuseumPublications | null>(null);
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false); const [attempt, setAttempt] = useState(0);
  const queryKey = JSON.stringify([...new Set([...dongs, regionName, district].filter(Boolean))]);
  useEffect(() => {
    setData(null); onLoaded(null); setError('');
    const terms = JSON.parse(queryKey) as string[]; if (!terms.length) {setLoading(false); return;}
    const controller = new AbortController(); setLoading(true);
    const params = new URLSearchParams(); terms.forEach(q => params.append('q', q));
    fetch('/api/publications?' + params, {signal: controller.signal}).then(async r => {
      const body = await r.json() as MuseumPublications & {error?: {message?: string}}; if (!r.ok) throw new Error(body.error?.message || '박물관 간행물을 불러오지 못했습니다.');
      if (!controller.signal.aborted) {setData(body); onLoaded(body);}
    }).catch(e => {if (!controller.signal.aborted) setError(e instanceof Error ? e.message : '간행물 조회에 실패했습니다.');})
      .finally(() => {if (!controller.signal.aborted) setLoading(false);});
    return () => controller.abort();
  }, [queryKey, onLoaded, attempt]);
  return <section className="museum-publications" aria-label="서울역사박물관 간행물">
    <div className="museum-publications-heading"><div><span className="overline">SEOUL MUSEUM OF HISTORY</span><h4><BookOpen size={17}/>관련 공식 간행물</h4></div><a href="https://data.seoul.go.kr/dataList/OA-23062/S/1/datasetView.do" target="_blank" rel="noopener noreferrer">목록 출처<ArrowUpRight size={13}/></a></div>
    {loading ? <p className="help-text" role="status"><Loader2 size={14} className="spin"/>박물관 간행물 목록을 확인하고 있습니다.</p> : error ? <p className="help-text" role="alert">{error} <button onClick={() => setAttempt(n => n + 1)}>다시 조회</button></p> : data && <>
      <p className="help-text">지역명과 제목·소개가 일치하는 검색 후보 {data.total}건입니다. 개별 건물·필지와의 관계는 원문에서 확인해 주세요.</p>
      <div className="museum-publication-grid">{data.items.map(item => <article key={item.id}><span>{item.category}</span><h5>{item.title}</h5><p>{item.museum} · 발행 {item.published || '미기재'}</p>{item.description && <p>{item.description.slice(0, 200)}</p>}{item.ebookUrl ? <a href={item.ebookUrl} target="_blank" rel="noopener noreferrer">전자책 읽기<ArrowUpRight size={13}/></a> : <small>전자책 링크 미제공</small>}</article>)}</div>
      {!data.items.length && <p className="help-text">현재 목록에서 해당 지역명과 일치하는 간행물을 찾지 못했습니다.</p>}
      <p className="help-text">{data.mode === 'snapshot' ? '저장된 공식 목록 · 확인 ' : '공식 서지 목록 조회 '}{new Date(data.queriedAt).toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'})}{data.truncated && ' · 일부 결과 표시'}</p>
    </>}
  </section>;
}
