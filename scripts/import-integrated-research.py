"""Import the supplied final master once; retain exports and audit tables verbatim."""
import csv
import hashlib
import io
import json
import pathlib
import re
import shutil
import sys
from collections import Counter, defaultdict
from urllib.parse import urlsplit

ROOT = pathlib.Path(__file__).resolve().parents[1]
DEST = ROOT / 'public/research/seoul-integrated-research'
INPUT = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else DEST
OUT = ROOT / 'data/integrated-research'
DEST.mkdir(parents=True, exist_ok=True)
OUT.mkdir(parents=True, exist_ok=True)
DATASET = 'SEOUL-INTEGRATED-20261023'
TABLES = {
    'master': '자료마스터.csv', 'links': '자료지역연결표.csv',
    'targets': '조사대상목록.csv', 'logs': '조사로그.csv',
    'excluded': '제외목록.csv', 'idChanges': '자료ID변경내역.csv',
    'changes': '수정내역_전체.csv', 'newRecords': '신규자료_전체.csv',
}

def read_csv(path):
    reader = csv.DictReader(io.StringIO(path.read_text(encoding='utf-8-sig')))
    # The supplied targets header has a quoted BOM and literal quotes inside the field.
    # Normalize the header only in the parsed view; original download bytes stay unchanged.
    return [{key.lstrip('\ufeff').strip('"'): value for key, value in row.items()} for row in reader]

def write(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, separators=(',', ':')) + '\n')

files = []
tables = {}
for key, filename in [*TABLES.items(), ('state', '최종상태.json'), ('report', '통합보고서.md'), ('workbook', '서울장소의시간_통합.xlsx')]:
    source = INPUT / filename
    destination = DEST / filename
    if source.resolve() != destination.resolve():
        shutil.copyfile(source, destination)
    payload = destination.read_bytes()
    if filename.endswith('.csv'):
        tables[key] = read_csv(destination)
        assert all(None not in row and all(isinstance(v, str) for v in row.values()) for row in tables[key]), filename
    files.append(dict(id=key, filename=filename, path='/research/seoul-integrated-research/' + filename,
                      sizeBytes=len(payload), sha256=hashlib.sha256(payload).hexdigest(),
                      count=len(tables[key]) if key in tables else None))

state = json.loads((DEST / '최종상태.json').read_text(encoding='utf-8-sig'))
master, links, targets = (tables[k] for k in ['master', 'links', 'targets'])
by_id = {row['자료ID']: row for row in master}
by_target = {row['대상ID']: row for row in targets}
assert len(by_id) == len(master)
assert len(by_target) == len(targets)
assert len({row['연결ID'] for row in links}) == len(links)
regions = json.loads((ROOT / 'data/seoul-regions.json').read_text())
known_places = {(d['name'], dong) for d in regions['districts'] for dong in d['dongs']}
known_districts = {d['name'] for d in regions['districts']}
for row in targets:
    assert row['시도명'] == '서울특별시' and re.fullmatch(r'11\d{8}', row['법정동코드'])
    if row['법정동']:
        assert (row['자치구'], row['법정동']) in known_places
    elif row['자치구']:
        assert row['자치구'] in known_districts
by_source_links = defaultdict(list)
for row in links:
    assert row['자료ID'] in by_id and row['대상ID'] in by_target
    target = by_target[row['대상ID']]
    assert all(row[k] == target[k] for k in ['자치구', '법정동', '법정동코드'])
    by_source_links[row['자료ID']].append(row)

# Incremental exports are provenance, never additional records.
aliases = {row['이전ID']: row['수정ID'] for row in tables['idChanges']}
assert all(row['수정ID'] in by_id for row in tables['idChanges'])
assert all(aliases.get(row['자료ID'], row['자료ID']) in by_id for row in tables['newRecords'])
assert state['누적고유자료수'] == len(master) and state['누적지역연결수'] == len(links)

items = []
for index, row in enumerate(master, 1):
    source = row['원문URL']
    parsed = urlsplit(source)
    assert parsed.scheme in ['https', 'http'] and parsed.hostname and not parsed.username and not parsed.password
    assert by_source_links[row['자료ID']]
    assert not row['자치구'] or row['자치구'] in known_districts
    assert not row['법정동'] or (row['자치구'], row['법정동']) in known_places
    scope = 'dong' if row['법정동'] else 'district' if row['자치구'] else 'city'
    items.append(dict(id=row['자료ID'], batchId=DATASET, district=row['자치구'], dong=row['법정동'],
        dataRow=index, collectionScope=scope, recordType='visual', mediaType=row['매체유형'],
        correctionOf=None, correctionIds=[], sourceUrl=source,
        sourceKey=hashlib.sha256(source.encode()).hexdigest()[:16], sourceLinkType='record',
        previewUrl=None, provider=parsed.hostname, reviewStatus=row['검토상태'],
        relation=row['주소관계상태'] or '미확인', scope=row['공간범위'], candidate=False,
        conflictMentioned='상충' in (row['추가확인사항'] + row['주소관계근거']),
        sameSourceCount=1, samePreviewCount=0, regionLinks=by_source_links[row['자료ID']], values=row))

legacy = json.loads((ROOT / 'data/photo-research/bundle.json').read_text())
assert not ({row['id'] for row in legacy['items']} & set(by_id))
old_urls = {row['sourceUrl'] for row in legacy['items'] if row['sourceUrl']}
overlap = sum(row['sourceUrl'] in old_urls for row in items)
target_counts = Counter(row['대상ID'] for row in links)
progress = dict(datasetId=DATASET, recordCount=len(master), linkCount=len(links), targetCount=len(targets),
    districtCount=len(known_districts), dongTargetCount=sum(row['조사단계'] == '법정동' for row in targets),
    completedTargetCount=sum(row['처리상태'] == '완료' for row in targets),
    completedDongCount=sum(row['처리상태'] == '완료' and row['조사단계'] == '법정동' for row in targets),
    heldTargetCount=sum(row['처리상태'] == '보류' for row in targets),
    linkedDongCount=len({row['대상ID'] for row in links if row['조사단계'] == '법정동'}),
    logCount=len(tables['logs']), excludedCount=len(tables['excluded']), changeCount=len(tables['changes']),
    idChangeCount=len(tables['idChanges']), incrementalRecordCount=len(tables['newRecords']),
    overlappingRecordCount=overlap, mediaCounts=dict(Counter(row['매체유형'] for row in master)),
    visualCheckCounts=dict(Counter(row['시각적내용확인상태'] for row in master)),
    historicalNameCount=sum(bool(row['과거지명']) for row in master),
    date=state['마지막실행일'], files=files, idAliases=aliases,
    targetOptions=[dict(id=row['대상ID'], district=row['자치구'], dong=row['법정동'], code=row['법정동코드'],
                        level=row['조사단계'], status=row['처리상태'], count=target_counts[row['대상ID']]) for row in targets],
    note='조사대상의 완료는 첨부 자료의 목표수량 충족 상태입니다. 홈페이지의 원문 대조 완료나 건물·필지 일치를 뜻하지 않습니다. 이미지를 직접 확인하지 않은 상태와 원문 이용조건을 보존합니다.')
write('photo-items.json', items)
write('support.json', {key: value for key, value in tables.items() if key not in ['master', 'newRecords']})
write('summary.json', progress)

combined = legacy['items'] + items
source_counts = Counter(row['sourceKey'] for row in combined if row['sourceUrl'])
preview_counts = Counter(row['previewUrl'] for row in combined if row['previewUrl'])
master_file = next(file for file in files if file['id'] == 'master')
file = dict(id=DATASET, district='', dong='', filename=master_file['filename'], count=len(items),
    columns=list(master[0]), path=master_file['path'], sha256=master_file['sha256'], sizeBytes=master_file['sizeBytes'],
    sourceUrlCount=len({row['sourceUrl'] for row in items}), candidateCount=0, previewLinkCount=0,
    collectionScope='city', sourceNote='서울 전역 통합조사. 대상 493곳의 상태와 지역 연결은 별도 조사기록으로 보존합니다.', headerLine=1,
    visualRecordCount=len(items), buildingRecordCount=0, correctionCount=0)
places = {(row['district'], row['dong']) for row in legacy['items'] if row['dong']}
places.update((row['자치구'], row['법정동']) for row in links if row['법정동'])
meta = dict(legacy['meta'], importedOn=max(legacy['meta']['importedOn'], state['마지막실행일']), recordCount=len(combined),
    batchCount=len(legacy['meta']['files']) + 1, districtCount=len(known_districts), dongCount=len(places),
    visualRecordCount=sum(row['recordType'] == 'visual' for row in combined),
    sourceUrlCount=len(source_counts), repeatedSourceGroupCount=sum(count > 1 for count in source_counts.values()),
    providers=sorted({row['provider'] for row in combined if row['sourceUrl']}),
    mediaTypes=sorted({row['mediaType'] for row in combined}), files=legacy['meta']['files'] + [file],
    scopeCounts=dict(Counter(row['scope'] for row in combined)), relationCounts=dict(Counter(row['relation'] for row in combined)),
    dateRange=[min(row['values']['확인일'] for row in combined), max(row['values']['확인일'] for row in combined)],
    districts=sorted(known_districts), places=[dict(district=gu, dong=dong) for gu, dong in sorted(places)],
    integratedResearch=progress,
    scopeNote='제공된 CSV의 사진·지도·도면·영상·건물 조사목록입니다. 항목 수는 고유 사진 수나 원본 확보 수가 아닙니다. 같은 원문을 서로 다른 조사에서 기록한 항목은 연결해 표시합니다. 지역 연결은 건물·필지의 동일성을 보증하지 않습니다.')
(ROOT / 'data/photo-research/combined-summary.json').write_text(json.dumps(dict(meta=meta), ensure_ascii=False, separators=(',', ':')) + '\n')
counts = {key: meta[key] for key in ['recordCount', 'batchCount', 'districtCount', 'dongCount', 'districtBatchCount', 'visualRecordCount', 'buildingRecordCount', 'correctionCount']}
counts.update(districts=meta['districts'], integratedRecordCount=len(items), integratedLinkCount=len(links))
(ROOT / 'data/photo-research/combined-counts.json').write_text(json.dumps(counts, ensure_ascii=False, separators=(',', ':')) + '\n')
print(json.dumps({**counts, 'overlappingRecordCount': overlap, 'targets': len(targets), 'held': progress['heldTargetCount']}, ensure_ascii=False))
