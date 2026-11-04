"""Build a traceable, read-only publication of the eight uploaded research tables."""
import csv
import hashlib
import json
import pathlib
import re
import shutil
import sys
from collections import Counter

ROOT = pathlib.Path(__file__).resolve().parents[1]
INPUT = pathlib.Path(sys.argv[1])
TABLES = [
    ('targets', '조사대상', '01', '대상ID'),
    ('sources', '문헌', '02', '자료ID'),
    ('links', '지역 연결', '03', '연결ID'),
    ('claims', '주장·근거', '04', '근거ID'),
    ('drafts', '본문 초안', '05', '대상ID'),
    ('timeline', '연표', '06', None),
    ('leads', '시각자료 단서', '07', None),
    ('progress', '진행 현황', '08', '대상ID'),
]
raw = {}
manifest = []
for key, title, prefix, pk in TABLES:
    path, = INPUT.glob(prefix + '_*.csv')
    with path.open(encoding='utf-8-sig', newline='') as f:
        raw[key] = list(csv.DictReader(f))
    asset = f'{prefix}-{key}.csv'
    shutil.copyfile(path, ROOT / 'public/research/seoul-history-doc' / asset)
    manifest.append(dict(key=key, title=title, filename=path.name, path='/research/seoul-history-doc/' + asset,
                         count=len(raw[key]), columns=list(raw[key][0]), sizeBytes=path.stat().st_size,
                         sha256=hashlib.sha256(path.read_bytes()).hexdigest()))

by_target = {r['대상ID']: r for r in raw['targets']}
source_ids = {r['자료ID'] for r in raw['sources']}
claim_ids = {r['근거ID'] for r in raw['claims']}
assert len(by_target) == len(raw['targets'])
assert len(source_ids) == len(raw['sources'])
assert len(claim_ids) == len(raw['claims'])
assert all(r['시도명'] == '서울특별시' for r in raw['targets'])
reference_names = json.loads((ROOT / 'data/seoul-regions.json').read_text())
known_dongs = {(d['name'], n) for d in reference_names['districts'] for n in d['dongs']}
assert all((r['자치구'], r['법정동']) in known_dongs for r in raw['targets'] if r['조사단계'] == '법정동')

def split_sources(value):
    return [s.strip() for s in re.split(r'[,;|\n]+', value) if s.strip()]

def evidence(value):
    return list(dict.fromkeys(re.findall(r'E\d{6}', value)))

def normalized_name(value):
    return re.sub(r'\s*\(법정동\)\s*$', '', value).strip()

def target_name(r):
    if r['조사단계'] == '서울전체': return '서울특별시'
    return r['법정동'] if r['조사단계'] == '법정동' else r['자치구']

by_name = {(r['자치구'], target_name(r)): r['대상ID'] for r in raw['targets']}
by_name[('서울전체', '서울특별시')] = 'SEOUL'

def name_targets(r):
    gu = r.get('자치구', '')
    if r.get('지역구분') == '서울전체': return ['SEOUL']
    name = normalized_name(r.get('동·권역명', r.get('동·권역', '')))
    if (gu, name) in by_name: return [by_name[(gu, name)]]
    if r.get('지역구분') == '자치구' and ('서울전체', name) not in by_name:
        return [t['대상ID'] for t in raw['targets'] if t['조사단계'] == '자치구' and t['자치구'] == gu]
    return []

warnings = []
link_targets = {}
invalid_links = set()
for r in raw['links']:
    assert r['대상ID'] in by_target
    assert r['자료ID'] in source_ids
    target = by_target[r['대상ID']]
    if target['조사단계'] == '법정동' and (normalized_name(r['동·권역명']) != target['법정동'] or r['자치구'] != target['자치구']):
        reason = f"원본 대상ID는 {target['자치구']} {target['법정동']}, 지역명은 {r['자치구']} {r['동·권역명']}입니다. 자동 지역 연결에서 제외했습니다."
        warnings.append(dict(table='links', id=r['연결ID'], reason=reason))
        invalid_links.add(r['연결ID'])
    else:
        link_targets.setdefault(r['자료ID'], set()).add(r['대상ID'])

rows = {}
for key, title, prefix, pk in TABLES:
    rows[key] = []
    for i, r in enumerate(raw[key]):
        rid = r[pk] if pk else f'{prefix}-{i+1:04d}'
        issues = [w['reason'] for w in warnings if w['table'] == key and w['id'] == rid]
        sids = [r['자료ID']] if '자료ID' in r else split_sources(r.get('근거자료ID', ''))
        eids = evidence(r.get('사용근거ID', r.get('근거ID', '')))
        if key == 'claims': eids = [r['근거ID']]
        for sid in sids: assert sid in source_ids, (rid, sid)
        for eid in eids: assert eid in claim_ids, (rid, eid)
        tids = [r['대상ID']] if r.get('대상ID') in by_target else name_targets(r)
        if key == 'sources': tids = sorted(link_targets.get(rid, set()))
        if key == 'links' and rid in invalid_links: tids = []
        label = (r.get('자료명') or r.get('동·권역명') or r.get('동·권역') or r.get('법정동') or r.get('자치구') or title)
        if key == 'targets': label = target_name(r)
        if key == 'claims': label = r['주제']
        if key == 'timeline': label = r['시기표기']
        if key == 'leads': label = r.get('시설·사업명') or r['동·권역']
        rows[key].append(dict(id=rid, targetIds=tids, sourceIds=sids, evidenceIds=eids,
            district='서울전체' if key == 'targets' and rid == 'SEOUL' else r.get('자치구', ''), label=label,
            status=r.get('검토상태', r.get('처리상태', r.get('본문초안상태', ''))),
            issues=issues, values=r))

url_groups = Counter(r['원문URL'] for r in raw['sources'])
dates = sorted({r.get(k, '') for key in raw for r in raw[key] for k in ['확인일', '마지막확인일', '작성일', '최종확인일'] if re.fullmatch(r'\d{4}-\d{2}-\d{2}', r.get(k, ''))})
meta = dict(id='SEOUL-HISTORY-DOC-20261022', title='서울 역사 문헌 조사자료', importedOn='2026-10-22',
    dateRange=[dates[0], dates[-1]], totalRecords=sum(len(v) for v in raw.values()),
    files=manifest, counts={k: len(v) for k, v in raw.items()},
    sourceUrlCount=len(url_groups), repeatedUrlGroupCount=sum(v > 1 for v in url_groups.values()),
    invalidLinkCount=len(invalid_links), missingReferenceCount=0, warnings=warnings,
    scopeNote='첨부 CSV에 기록된 문헌 조사 결과입니다. 검토 상태·확인일·이용조건은 제공 자료의 표기이며, 사이트의 기존 원문 대조 기록과 별도로 보존합니다. 지역 조사자료를 개별 건물·부지의 역사로 연결하지 않습니다.')
targets = [dict(id=r['대상ID'], parentId=r['상위대상ID'], name=target_name(r), district='서울전체' if r['대상ID'] == 'SEOUL' else r['자치구'],
                level=r['조사단계'], code=r['법정동코드']) for r in raw['targets']]
for filename, data in [('bundle.json', dict(meta=meta, targets=targets, tables=rows)), ('summary.json', dict(meta=meta, targets=targets))]:
    (ROOT / 'data/document-research' / filename).write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')
print(json.dumps(dict(counts=meta['counts'], total=meta['totalRecords'], warnings=warnings, dateRange=meta['dateRange'], uniqueUrls=len(url_groups)), ensure_ascii=False))
