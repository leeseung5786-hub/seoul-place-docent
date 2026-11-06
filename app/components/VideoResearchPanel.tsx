'use client';
import {useEffect, useState} from 'react';
import {ArrowUpRight, Film, Loader2, Play} from 'lucide-react';
import type {ResearchVideo} from '@/lib/video-research';
import './video-research-panel.css';
type Data = {total: number; page: number; pageSize: number; items: ResearchVideo[]; meta: {uniqueVideoCount: number; segmentCount: number; excludedCount: number; normalizedUrlCount: number; invalidTimeCount: number; groupCounts: Record<string, number>}};
function Video({item}: {item: ResearchVideo}) {
  const [start, setStart] = useState<number | null>(null);
  return <article className="video-record">
    <div className="video-record-meta"><span>{item.group === 'A' ? '보고서 우선 영상' : '후보 영상'}</span><span>자료 날짜 표기 · {item.date}</span></div>
    <h4>{item.title}</h4><p className="video-record-place">{item.place}</p>
    <small>{item.channel} · {item.id}</small>
    {item.url && <div className="video-record-actions"><button type="button" onClick={() => setStart(start === null ? 0 : null)}><Play size={14}/>{start === null ? '영상 재생' : '재생 닫기'}</button><a href={item.url} target="_blank" rel="noopener noreferrer">YouTube에서 보기<ArrowUpRight size={13}/></a></div>}
    {start !== null && item.videoId && <><iframe key={start} src={`https://www.youtube-nocookie.com/embed/${item.videoId}?start=${start}`} title={item.title} loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/><p className="video-play-note">재생이 제한되면 YouTube 원문에서 확인해 주세요.</p></>}
    {!!item.segments.length && <details><summary>장면과 시간 보기 · {item.segments.length}개</summary>{item.segments.map((segment, index) => <div className="video-segment" key={index}><b>{segment.startLabel}–{segment.endLabel}</b><p>{segment.description}</p><small>{segment.place}</small>{segment.validTime && item.url ? <button type="button" onClick={() => setStart(segment.start)}>이 장면 재생</button> : <small>제공 자료의 시간 표기를 확인해야 합니다.</small>}</div>)}</details>}
    {item.group === 'B' && <p className="video-candidate-note">{item.reason}</p>}
    <p className="video-review-note">제공 보고서의 설명 · 영상·연대·장소 독립 대조 전 · 개별 건물·부지 일치 미확인</p>
  </article>;
}
export default function VideoResearchPanel({district = '', dong = '', archive = false}: {district?: string; dong?: string; archive?: boolean}) {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('A');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {setPage(1);}, [district, dong, query, group]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(''); setData(null);
    const params = new URLSearchParams({q: query, group, page: String(page)});
    if (district) params.set('district', district);
    if (dong) params.set('dong', dong);
    fetch('/api/archive/video-research?' + params, {signal: controller.signal}).then(async response => {
      const body = await response.json() as Data & {error?: string};
      if (!response.ok) throw new Error(body.error || '영상을 불러오지 못했습니다.');
      if (!controller.signal.aborted) setData(body);
    }).catch(e => {if (!controller.signal.aborted) setError(e instanceof Error ? e.message : '영상을 불러오지 못했습니다.');})
      .finally(() => {if (!controller.signal.aborted) setLoading(false);});
    return () => controller.abort();
  }, [district, dong, query, group, page, attempt]);
  return <section className="video-research-panel" aria-label="첨부 역사 영상 자료">
    <header><span><Film size={18}/>영상으로 보는 동네의 시간</span>{!archive && <a href="/archive/video-research">전체 영상 보기<ArrowUpRight size={14}/></a>}</header>
    <h3>{archive ? '역사 영상과 장면을 찾아보세요' : `${district} ${dong}의 영상 기록`}</h3>
    <p>옛 지명과 시설, 장면별 시간을 함께 살펴보세요. 보고서의 조사 설명과 원문 영상을 연결했습니다.</p>
    {archive && <><div className="video-source-links"><a href="/research/consolidated-20261106/seoul_historical_video_consolidated_report.md" target="_blank" rel="noopener noreferrer">첨부 보고서 원본</a><a href="/api/archive/video-research?group=all&download=1">전체 목록·제외 사유 내려받기</a></div><div className="video-filters"><label>장소·제목 검색<input value={query} onChange={e => setQuery(e.target.value)} placeholder="예: 중앙청, 응봉, 여의도"/></label><label>보고서 분류<select value={group} onChange={e => setGroup(e.target.value)}><option value="A">A군 우선 영상</option><option value="B">B군 후보 영상</option><option value="all">A·B 전체</option></select></label></div>{data && <p className="video-import-summary">전체 {data.meta.uniqueVideoCount}개 · A군 {data.meta.groupCounts.A}개 · B군 {data.meta.groupCounts.B}개 · 장면 {data.meta.segmentCount}개 · 제외 {data.meta.excludedCount}개</p>}</>}
    {loading ? <p role="status"><Loader2 size={16} className="spin"/>영상 자료를 불러오는 중입니다.</p> : error ? <p role="alert">{error} <button type="button" onClick={() => setAttempt(n => n + 1)}>다시 불러오기</button></p> : data && <>
      <p className="video-scope-note">{archive ? '2026.11.06 첨부 보고서 기준' : '선택한 자치구·법정동 이름이 함께 연결된 자료'} · 제공 보고서의 확인 상태와 사이트의 독립 검증은 구분합니다.</p>
      <div className="video-record-grid">{data.items.map(item => <Video key={item.id} item={item}/>)}</div>
      {!data.items.length && <p>이 동네와 연결된 영상 기록은 아직 없어요. 전체 영상 자료에서 다른 장소를 찾아보세요.</p>}
      {data.total > data.pageSize && <nav className="video-pagination" aria-label="영상 목록 페이지"><button type="button" disabled={page <= 1} onClick={() => setPage(n => n - 1)}>이전</button><span>{page} / {Math.ceil(data.total / data.pageSize)} · {data.total}개</span><button type="button" disabled={page * data.pageSize >= data.total} onClick={() => setPage(n => n + 1)}>다음</button></nav>}
      {archive && <p className="video-scope-note">유튜브 URL {data.meta.normalizedUrlCount}개의 형식을 정리했습니다. 시간 표기가 맞지 않는 {data.meta.invalidTimeCount}개 장면은 바로 재생 기능을 제공하지 않습니다. 제외 목록은 원본과 내려받기 파일에 보존합니다.</p>}
    </>}
  </section>;
}
