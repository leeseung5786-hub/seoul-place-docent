'use client';
import {useEffect, useState} from 'react';
import {ArrowUpRight, Camera, ChevronLeft, ChevronRight, FileText, Loader2} from 'lucide-react';
import PhotoPreview from './PhotoPreview';
import {photoResearchCredit, photoResearchText, photoResearchThumbnail, type PhotoResearchItem, type PlacePhotoResearch} from '@/lib/photo-research';
import './photo-research-panel.css';

function VisualCard({item, districtScope}: {item: PhotoResearchItem; districtScope: boolean}) {
  const thumbnail = photoResearchThumbnail(item);
  const title = photoResearchText(item.values['자료명'] || item.id);
  const source = item.sourceUrl || item.previewUrl;
  const detail = '/archive/photo-research?id=' + encodeURIComponent(item.id);
  return <article className="place-visual-card">
    <div className="place-visual-image">
      <PhotoPreview item={item}/>
      <span className="place-visual-type">{item.mediaType || '시각자료'}</span>
    </div>
    <div className="place-visual-body">
      <div className="place-visual-meta"><span>{districtScope ? '자치구 배경자료' : '동네 조사자료'}</span></div>
      <h5>{title}</h5>
      <p>{photoResearchText(item.values['사이트용캡션초안'] || item.values['내용설명'] || '자료 원문에서 내용과 촬영 위치를 확인하세요.')}</p>
      <small>{item.values['촬영·제작일'] ? '촬영·제작일 표기: ' + item.values['촬영·제작일'] : '역사적 대상 시기: ' + (item.values['역사적대상시기'] || '미확인')}</small>
      {item.metadataWarnings?.map(note => <p key={note} className="place-visual-warning">{note}</p>)}
      <div className="place-visual-actions">{source && <a href={source} target="_blank" rel="noopener noreferrer">{item.sourceLinkType === 'collection' ? '기관 컬렉션 열기' : item.sourceLinkType === 'portal' ? '제공기관에서 찾기' : '원문 열기'}<ArrowUpRight size={13}/></a>}
        {item.previewUrl && item.previewUrl !== source && <a href={item.previewUrl} target="_blank" rel="noopener noreferrer">공개 미리보기<ArrowUpRight size={13}/></a>}</div>
      <details className="place-visual-evidence"><summary>출처·장소 관계</summary><p>{photoResearchCredit(item)}</p>
        <p>{districtScope ? '선택한 자치구 전체의 배경자료입니다.' : item.values['주소관계근거'] || item.relation} 개별 건물·필지 일치는 미검증입니다.</p>
        <p>{item.values['이용조건'] || '이용조건은 원문에서 확인하세요.'}</p><a href={detail}>조사 항목 상세<ChevronRight size={12}/></a></details>
      {thumbnail && <p className="place-visual-credit">{photoResearchCredit(item)}{item.values['이용조건'] && <span className="place-visual-rights">{photoResearchText(item.values['이용조건'])}</span>}</p>}
    </div>
  </article>;
}

export default function PhotoResearchPanel({district, dongs, onLoaded}: {district: string; dongs: string[]; onLoaded: (data: PlacePhotoResearch | null) => void}) {
  const [data, setData] = useState<PlacePhotoResearch | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [pagination, setPagination] = useState({key: '', page: 1});
  const dongKey = dongs.join('|');
  const selectionKey = JSON.stringify([district, dongKey]);
  const page = pagination.key === selectionKey ? pagination.page : 1;
  useEffect(() => {
    setData(null); onLoaded(null); setError('');
    if (!district) {setLoading(false); return;}
    const controller = new AbortController(); setLoading(true);
    const p = new URLSearchParams({mode: 'place', district, visualPage: String(page)});
    dongKey.split('|').filter(Boolean).forEach(dong => p.append('dong', dong));
    fetch('/api/archive/photo-research?' + p, {signal: controller.signal}).then(async response => {
      const body = await response.json() as PlacePhotoResearch & {error?: string};
      if (!response.ok) throw new Error(body.error || '시각자료를 불러오지 못했습니다.');
      if (!controller.signal.aborted) {setData(body); onLoaded(body);}
    }).catch(e => {if (!controller.signal.aborted) setError(e instanceof Error ? e.message : '시각자료를 불러오지 못했습니다.');})
      .finally(() => {if (!controller.signal.aborted) setLoading(false);});
    return () => controller.abort();
  }, [district, dongKey, page, onLoaded, attempt]);
  if (!district) return null;
  const params = new URLSearchParams({district});
  if (dongs.length === 1 && data?.visuals.scope !== 'district') params.set('dong', dongs[0]);
  const href = '/archive/photo-research?' + params;
  const gallery = data?.visuals;
  const districtScope = gallery?.scope === 'district';
  function paginate(next: number) {
    setPagination({key: selectionKey, page: next});
    document.getElementById('place-photo-gallery')?.scrollIntoView({behavior: 'smooth', block: 'start'});
  }
  return <section className="place-photo-panel" id="place-photo-gallery" aria-label="관련 사진·지도 자료">
    <div className="place-photo-heading"><div><span><Camera size={15}/>VISUAL ARCHIVE</span><h4>{districtScope ? district + '의 배경 시각자료' : '이곳과 연결된 사진·지도'}</h4></div><a href={href}>전체 자료실<ArrowUpRight size={14}/></a></div>
    {loading ? <p className="place-photo-message" role="status"><Loader2 size={16} className="spin"/>관련 시각자료를 찾고 있습니다.</p> : error ? <div className="place-photo-message" role="alert"><span>{error}</span><button type="button" onClick={() => setAttempt(n => n + 1)}>다시 불러오기</button></div> : gallery && <>
      <p className="place-photo-intro">{districtScope ? '해당 동의 연결 자료가 없어 자치구 전체의 배경자료를 보여드립니다. 입력 주소와 같은 장소로 확인된 자료는 아닙니다.' : '선택한 동의 조사묶음·지역연결표를 바탕으로 찾았습니다. 사진 속 장소와 개별 건물·필지의 일치는 별도 확인이 필요합니다.'}</p>
      {gallery.total > 0 ? <><div className="place-photo-count" role="status">관련 시각자료 {gallery.total.toLocaleString('ko-KR')}건 · {gallery.page}/{Math.max(1, Math.ceil(gallery.total / gallery.pageSize))}페이지</div>
        <div className="place-visual-grid">{gallery.rows.map(item => <VisualCard key={item.id} item={item} districtScope={districtScope}/>)}</div>
        {gallery.total > gallery.pageSize && <nav className="place-photo-pagination" aria-label="관련 시각자료 페이지"><button type="button" onClick={() => paginate(gallery.page - 1)} disabled={gallery.page <= 1}><ChevronLeft size={15}/>이전</button><span>{(gallery.page - 1) * gallery.pageSize + 1}–{Math.min(gallery.page * gallery.pageSize, gallery.total)} / {gallery.total}건</span><button type="button" onClick={() => paginate(gallery.page + 1)} disabled={gallery.page * gallery.pageSize >= gallery.total}>다음<ChevronRight size={15}/></button></nav>}</> : <div className="place-visual-empty"><FileText size={25}/><p>이 지역에 연결된 시각자료를 아직 확인하지 못했습니다.</p><a href={href}>자료실에서 더 찾아보기<ArrowUpRight size={14}/></a></div>}
      {gallery.sourceOnlyTotal > 0 && <details className="place-photo-source-records"><summary>이미지 파일이 연결되지 않은 기록 {gallery.sourceOnlyTotal.toLocaleString('ko-KR')}건</summary><p>이 기록들은 자료실에서 출처와 설명을 확인할 수 있습니다.</p><ul>{gallery.sourceOnlyRows.map(item => <li key={item.id}><a href={'/archive/photo-research?id=' + encodeURIComponent(item.id)}>{photoResearchText(item.values['자료명'] || item.id)}<ArrowUpRight size={12}/></a></li>)}</ul><a href={href}>전체 조사자료 보기<ArrowUpRight size={13}/></a></details>}
      {!!data?.candidateCount && <p className="place-photo-note">원문 미확인 후보 {data.candidateCount}건은 전체 자료실에서 확인할 수 있습니다.</p>}
      <p className="place-photo-note">공개 미리보기 사진을 바로 보여드립니다. 사진을 누르면 확대되며, 출처와 이용조건을 함께 확인할 수 있습니다.</p>
    </>}
  </section>;
}
