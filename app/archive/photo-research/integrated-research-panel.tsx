'use client';
import {useEffect, useState} from 'react';
import {ArrowUpRight, ChevronLeft, ChevronRight, Download, FileText, Loader2, Search} from 'lucide-react';
import type {IntegratedResearchSummary, IntegratedTable} from '@/lib/integrated-research';
import {photoResearchUrl, type PhotoResearchFilters} from '@/lib/photo-research';

type Result = {total: number; page: number; pageSize: number; rows: Record<string, string>[]};
const labels: Record<IntegratedTable, string> = {targets: '조사대상', links: '지역 연결', logs: '조사로그', excluded: '제외목록', idChanges: 'ID 변경', changes: '수정내역'};
const columns: Record<IntegratedTable, string[]> = {
  targets: ['조사단계', '자치구', '법정동', '법정동코드', '처리상태', '목표수량', '확보고유자료수', '기존자료연결수', '다음작업'],
  links: ['자료ID', '자치구', '법정동', '공간범위', '주소관계상태', '연결근거'],
  logs: ['실행일', '검색기관·서비스', '검색어', '열람상태', '확인자료수', '주요결과', '제약사항'],
  excluded: ['후보명', '제외사유', '중복대표자료ID', '확인일', '재검토조건'],
  idChanges: ['이전ID', '수정ID', '사유'], changes: ['회차', '파일', '대상', '변경내용'],
};
export default function IntegratedResearchPanel({summary, onBrowse}: {summary: IntegratedResearchSummary; onBrowse: (filters: PhotoResearchFilters) => void}) {
  const [open, setOpen] = useState(false);
  const [table, setTable] = useState<IntegratedTable>('targets');
  const [query, setQuery] = useState('');
  const [district, setDistrict] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController(); setLoading(true); setError('');
    const timer = setTimeout(() => {
      const p = new URLSearchParams({table, q: query, district, page: String(page)});
      if (table === 'targets' && status) p.set('status', status);
      fetch('/api/archive/integrated-research?' + p, {signal: controller.signal}).then(async response => {
        const result = await response.json() as Result & {error?: string};
        if (!response.ok) throw new Error(result.error || '조사기록을 불러오지 못했습니다.');
        if (!controller.signal.aborted) setData(result);
      }).catch(e => {if (!controller.signal.aborted) setError(e instanceof Error ? e.message : '조사기록을 불러오지 못했습니다.');})
        .finally(() => {if (!controller.signal.aborted) setLoading(false);});
    }, 200);
    return () => {clearTimeout(timer); controller.abort();};
  }, [open, table, query, district, status, page, attempt]);
  const districts = [...new Set(summary.targetOptions.map(row => row.district).filter(Boolean))].sort();
  return <section className="integrated-research" aria-label="서울 전역 통합조사">
    <div className="integrated-heading"><div><span>서울 전역 통합조사 · {summary.date}</span><h2>자료와 조사 과정을 함께 확인합니다.</h2></div><button type="button" onClick={() => onBrowse({batch: summary.datasetId})}>통합자료 {summary.recordCount.toLocaleString('ko-KR')}건 보기<ArrowUpRight size={14}/></button></div>
    <p className="integrated-intro">사진 {summary.mediaCounts['사진']?.toLocaleString('ko-KR')}건 · 지도 {summary.mediaCounts['지도']}건 · 도면 {summary.mediaCounts['도면']}건. {summary.districtCount}개 자치구와 법정동 {summary.dongTargetCount}곳을 조사대상으로 기록했습니다.</p>
    <dl className="integrated-stats"><div><dt>지역 연결</dt><dd>{summary.linkCount.toLocaleString('ko-KR')}건</dd></div><div><dt>첨부 자료상 목표 충족</dt><dd>{summary.completedDongCount} / {summary.dongTargetCount}개 동</dd></div><div><dt>추가 조사 보류</dt><dd>{summary.heldTargetCount}개 동</dd></div><div><dt>기존 조사와 원문 중복</dt><dd>{summary.overlappingRecordCount}건</dd></div></dl>
    <p className="photo-note">{summary.note} 같은 원문의 기록은 조사 ID를 보존해 연결하며, 고유 사진 수로 합산하지 않습니다.</p>
    <details className="integrated-files"><summary><Download size={14}/>첨부 원본 {summary.files.length}개 내려받기</summary><div>{summary.files.map(file => <a key={file.id} href={file.path} download={file.filename}><FileText size={14}/><span>{file.filename}<small>{file.count !== null ? file.count.toLocaleString('ko-KR') + '행 · ' : ''}{(file.sizeBytes / 1024).toLocaleString('ko-KR', {maximumFractionDigits: 0})} KB</small></span><Download size={13}/></a>)}</div><p className="photo-note">마스터 1,562건을 등록 기준으로 사용했습니다. 신규자료 1,542행과 수정내역은 누적 이력으로 보존하며 자료 수에 더하지 않습니다. 원본 파일의 내용과 표기는 그대로 내려받을 수 있습니다.</p></details>
    <details className="integrated-audit" onToggle={e => setOpen(e.currentTarget.open)}><summary>조사 진행·지역 연결·제외 및 수정 이력<ChevronRight size={15}/></summary>
      <div className="integrated-tabs" aria-label="조사표 선택">{Object.entries(labels).map(([key, label]) => <button key={key} type="button" aria-pressed={table === key} onClick={() => {setTable(key as IntegratedTable); setPage(1); setDistrict(''); setStatus('');}}>{label}</button>)}</div>
      <div className="integrated-controls"><label className="photo-search"><Search size={16}/><span className="sr-only">조사기록 검색</span><input value={query} maxLength={150} onChange={e => {setQuery(e.target.value); setPage(1);}} placeholder="지명·자료 ID·조사어·사유 검색"/></label>{!['changes', 'idChanges'].includes(table) && <label>자치구<select value={district} onChange={e => {setDistrict(e.target.value); setPage(1);}}><option value="">모든 자치구</option>{districts.map(name => <option key={name}>{name}</option>)}</select></label>}{table === 'targets' && <label>첨부 자료의 처리상태<select value={status} onChange={e => {setStatus(e.target.value); setPage(1);}}><option value="">모든 상태</option><option>완료</option><option>보류</option></select></label>}</div>
      <div aria-live="polite" aria-busy={loading} className="integrated-results">{loading ? <p><Loader2 size={16} className="spin"/>조사기록을 불러오는 중입니다.</p> : error ? <p role="alert">{error} <button type="button" onClick={() => setAttempt(n => n + 1)}>다시 불러오기</button></p> : <><p>{labels[table]} {data?.total.toLocaleString('ko-KR') || 0}행</p>{!data?.rows.length && <p>조건에 맞는 기록이 없습니다.</p>}{data?.rows.map((row, index) => <article key={table + index}><div className="integrated-row-heading"><b>{table === 'targets' ? [row['자치구'], row['법정동']].filter(Boolean).join(' ') || '서울 전체' : row['후보명'] || row['검색어'] || row['연결ID'] || row['이전ID'] || row['대상']}</b>{row['처리상태'] && <span>{row['처리상태']}</span>}</div><dl>{columns[table].filter(key => row[key]).map(key => <div key={key}><dt>{key}</dt><dd>{row[key]}</dd></div>)}</dl>{table === 'targets' && <button className="integrated-browse" type="button" onClick={() => onBrowse({target: row['대상ID'], district: row['자치구'], dong: row['법정동']})}>이 대상의 연결 자료 보기<ArrowUpRight size={13}/></button>}{(row['자료ID'] || row['수정ID'] || row['중복대표자료ID']) && <button className="integrated-browse" type="button" onClick={() => onBrowse({id: row['자료ID'] || row['수정ID'] || row['중복대표자료ID']})}>연결된 자료 보기<ArrowUpRight size={13}/></button>}<details><summary>원본 항목 전체 보기</summary><dl>{Object.entries(row).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{photoResearchUrl(value) ? <a href={photoResearchUrl(value)!} target="_blank" rel="noopener noreferrer">{value}<ArrowUpRight size={12}/></a> : value || '빈 값'}</dd></div>)}</dl></details></article>)}</>}</div>
      {!loading && !error && <nav className="photo-pagination" aria-label="조사기록 페이지"><span>{data?.page || 1} / {Math.max(1, Math.ceil((data?.total || 0) / 20))}</span><div><button type="button" disabled={!data || data.page <= 1} onClick={() => setPage((data?.page || 1) - 1)}><ChevronLeft size={14}/>이전</button><button type="button" disabled={!data || data.page * 20 >= data.total} onClick={() => setPage((data?.page || 1) + 1)}>다음<ChevronRight size={14}/></button></div></nav>}
    </details>
  </section>;
}
