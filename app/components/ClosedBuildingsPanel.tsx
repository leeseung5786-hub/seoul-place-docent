import {ArrowUpRight, Loader2} from 'lucide-react';
import type {PlaceContext} from '@/lib/place-context';
export default function ClosedBuildingsPanel({data, loading, onRetry}: {data: PlaceContext | null; loading: boolean; onRetry: () => void}) {
  return <section className="closed-buildings" aria-label="같은 지번의 폐쇄말소대장"><h4>같은 지번의 폐쇄말소대장</h4>
    <p className="help-text">폐쇄·말소된 대장의 행정기록입니다. 현재 건물과의 동일성이나 과거 필지 경계는 별도 대조가 필요합니다.</p>
    {loading ? <p className="help-text" role="status"><Loader2 size={14} className="spin"/>폐쇄말소대장을 확인하고 있습니다.</p> : data?.closed.status === 'ok' ? <>
      <p className="help-text">제공기관 조회 {data.closed.data.total}건 · 현재 지번 식별정보와 일치하는 표시 {data.closed.data.items.length}건</p>
      {data.closed.data.items.length ? <div className="closed-building-grid">{data.closed.data.items.map((item, i) => <article key={item.id + i}><h5>{item.name || '건물명 미기재'}</h5><p>{item.use || '용도 미기재'} · {item.closureType || '폐쇄말소대장'}</p><p>{item.lotAddress}</p><dl><div><dt>사용승인일</dt><dd>{/^\d{8}$/.test(item.approved) ? item.approved.replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3') : '미기재'}</dd></div><div><dt>연면적</dt><dd>{item.area ? Number(item.area).toLocaleString('ko-KR') + '㎡' : '미기재'}</dd></div><div><dt>대장 식별번호</dt><dd>{item.id || '미기재'}</dd></div></dl></article>)}</div> : <p className="help-text">현재 지번과 일치하는 폐쇄말소대장을 확인하지 못했습니다. 과거 건물이 없었다는 뜻은 아닙니다.</p>}
      {data.closed.data.truncated && <p className="help-text">조회 상한으로 일부 대장만 표시합니다.</p>}<a className="source-link" href={data.closed.data.sourceUrl} target="_blank" rel="noopener noreferrer">건축HUB 자료 출처<ArrowUpRight size={13}/></a>
    </> : <p className="help-text">{data?.closed.status === 'unavailable' ? data.closed.message : '폐쇄말소대장 응답을 확인하지 못했습니다.'} <button onClick={onRetry}>다시 조회</button></p>}
  </section>;
}
