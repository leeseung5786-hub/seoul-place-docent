"""Publish photo research metadata without downloading or granting rights to images."""
import csv
import hashlib
import io
import json
import pathlib
import re
import shutil
import sys
from collections import Counter
from datetime import datetime
from urllib.parse import urlsplit
from zoneinfo import ZoneInfo

ROOT = pathlib.Path(__file__).resolve().parents[1]
INPUT = pathlib.Path(sys.argv[1])
DISTRICT_FILES = {
 '영등포구_누적_2026-10-21': ('YDP-HIST-001', '영등포구'),
 '종로구_누적_2026-10-21': ('JNR-HIST-001', '종로구'),
 '중구_누적_2026-10-21': ('JNG-HIST-001', '중구'),
 '성동구_누적_2026-10-21': ('SDG-HIST-001', '성동구'),
 '강북구_누적_2026-10-23': ('GBK-HIST-001', '강북구'),
}
DISTRICT_BATCHES = {batch: district for batch, district in DISTRICT_FILES.values()}
DISTRICT_BATCHES['YONGSAN-HIST-001'] = '용산구'
RAW_BATCH_OVERRIDES = {'YONGSAN-HIST-001': 'SEONGDONG-SEONGSU-001'}
REGIONS = {
 'NOWON-월계동-001': ('노원구', '월계동'),
 'NOWON-공릉동-001': ('노원구', '공릉동'),
 'NOWON-하계동-001': ('노원구', '하계동'),
 'NOWON-중계동-001': ('노원구', '중계동'),
 'NOWON-상계동-001': ('노원구', '상계동'),
 'BONGWONDONG-SEODAEMUNGU-001': ('서대문구', '봉원동'),
 'BUKAHYEONDONG-SEODAEMUNGU-001': ('서대문구', '북아현동'),
 'BUKGAJWADONG-SEODAEMUNGU-001': ('서대문구', '북가좌동'),
 'BULGWANGDONG-EUNPYEONGGU-001': ('은평구', '불광동'),
 'CHANGCHEONDONG-SEODAEMUNGU-001': ('서대문구', '창천동'),
 'CHEONYEONDONG-SEODAEMUNGU-001': ('서대문구', '천연동'),
 'CHUNGJEONGRO2GA-SEODAEMUNGU-001': ('서대문구', '충정로2가'),
 'CHUNGJEONGRO3GA-SEODAEMUNGU-001': ('서대문구', '충정로3가'),
 'DAEHYEONDONG-SEODAEMUNGU-001': ('서대문구', '대현동'),
 'DAEJODONG-EUNPYEONGGU-001': ('은평구', '대조동'),
 'DAESINDONG-SEODAEMUNGU-001': ('서대문구', '대신동'),
 'EUNGAMDONG-EUNPYEONGGU-001': ('은평구', '응암동'),
 'GALHYEONDONG-EUNPYEONGGU-001': ('은평구', '갈현동'),
 'GUSANDONG-EUNPYEONGGU-001': ('은평구', '구산동'),
 'HAPDONG-SEODAEMUNGU-001': ('서대문구', '합동'),
 'HONGEUNDONG-SEODAEMUNGU-001': ('서대문구', '홍은동'),
 'HONGJEDONG-SEODAEMUNGU-001': ('서대문구', '홍제동'),
 'HYEONJEODONG-SEODAEMUNGU-001': ('서대문구', '현저동'),
 'JEUNGSANDONG-EUNPYEONGGU-001': ('은평구', '증산동'),
 'JINGWANDONG-EUNPYEONGGU-001': ('은평구', '진관동'),
 'MAPO-아현동-001': ('마포구', '아현동'),
 'MAPO-창전동-001': ('마포구', '창전동'),
 'MAPO-대흥동-001': ('마포구', '대흥동'),
 'MAPO-당인동-001': ('마포구', '당인동'),
 'MAPO-도화동-001': ('마포구', '도화동'),
 'MAPO-동교동-001': ('마포구', '동교동'),
 'MAPO-공덕동-001': ('마포구', '공덕동'),
 'MAPO-구수동-001': ('마포구', '구수동'),
 'MAPO-하중동-001': ('마포구', '하중동'),
 'MAPO-합정동-001': ('마포구', '합정동'),
 'MAPO-신정동-001': ('마포구', '신정동'),
 'MAPO-신수동-001': ('마포구', '신수동'),
 'MAPO-토정동-001': ('마포구', '토정동'),
 'MAPO-염리동-001': ('마포구', '염리동'),
 'MAPO-연남동-001': ('마포구', '연남동'),
 'MAPO-용강동-001': ('마포구', '용강동'),
 'MIGEUNDONG-SEODAEMUNGU-001': ('서대문구', '미근동'),
 'NAENGCHEONDONG-SEODAEMUNGU-001': ('서대문구', '냉천동'),
 'NAMGAJWADONG-SEODAEMUNGU-001': ('서대문구', '남가좌동'),
 'NOKBEONDONG-EUNPYEONGGU-001': ('은평구', '녹번동'),
 'OKCHEONDONG-SEODAEMUNGU-001': ('서대문구', '옥천동'),
 'SINCHONDONG-SEODAEMUNGU-001': ('서대문구', '신촌동'),
 'SINSADONG-EUNPYEONGGU-001': ('은평구', '신사동'),
 'SUSAEKDONG-EUNPYEONGGU-001': ('은평구', '수색동'),
 'YEOKCHONDONG-EUNPYEONGGU-001': ('은평구', '역촌동'),
 'YEONGCHEONDONG-SEODAEMUNGU-001': ('서대문구', '영천동'),
 'YEONHUIDONG-SEODAEMUNGU-001': ('서대문구', '연희동'),
}
MAPO_FILES = {
 'MAPO-AHYEON-001': 'MAPO-아현동-001',
 'MAPO-CHANGJEON-001': 'MAPO-창전동-001',
 'MAPO-DAEHEUNG-001': 'MAPO-대흥동-001',
 'MAPO-DANGIN-001': 'MAPO-당인동-001',
 'MAPO-DOHWA-001': 'MAPO-도화동-001',
 'MAPO-DONGGYO-001': 'MAPO-동교동-001',
 'MAPO-GONGDEOK-001': 'MAPO-공덕동-001',
 'MAPO-GUSU-001': 'MAPO-구수동-001',
 'MAPO-HAJUNG-001': 'MAPO-하중동-001',
 'MAPO-HAPJEONG-001': 'MAPO-합정동-001',
 'MAPO-SINJEONG-001': 'MAPO-신정동-001',
 'MAPO-SINSU-001': 'MAPO-신수동-001',
 'MAPO-TOJEONG-001': 'MAPO-토정동-001',
 'MAPO-YEOMNI-001': 'MAPO-염리동-001',
 'MAPO-YEONNAM-001': 'MAPO-연남동-001',
 'MAPO-YONGGANG-001': 'MAPO-용강동-001',
}
MULTI_BATCH_FILES = {
 'NOWON-HISTORY-PHOTOS.csv': [key for key in REGIONS if key.startswith('NOWON-')],
}
# This supplied row explicitly documents a neighboring place across the district boundary.
# Retain its original district, rather than treating it as a photograph taken in Mapo.
ADJACENT_DISTRICTS = {'MAPO-아현동-001-P004': ('마포구', '서대문구')}
known = json.loads((ROOT / 'data/seoul-regions.json').read_text())
known_places = {(d['name'], name) for d in known['districts'] for name in d['dongs']}
known_districts = {d['name'] for d in known['districts']}
preview_path = ROOT / 'data/photo-research/source-preview-links.json'
resolved_previews = json.loads(preview_path.read_text()) if preview_path.exists() else {}

def url(value):
    if not value: return None
    match = re.match(r'^https?://[^\s<>]+', value)
    if not match: return None
    supplied = match.group(0)
    parsed = urlsplit(supplied)
    return supplied if parsed.hostname and not parsed.username and not parsed.password else None

items = []
files = []
prior_summary = ROOT / 'data/photo-research/summary.json'
previous = json.loads(prior_summary.read_text())['meta']['files'] if prior_summary.exists() else []
selected = {f['id']: (ROOT / 'public' / f['path'].lstrip('/'), f['filename']) for f in previous}
for incoming in INPUT.glob('*사진조사.csv'):
    selected[incoming.name.removesuffix('_사진조사.csv')] = (incoming, incoming.name)
for incoming in INPUT.glob('MAPO-*.csv'):
    selected[MAPO_FILES[incoming.stem]] = (incoming, incoming.name)
for incoming in INPUT.glob('*_누적_*.csv'):
    stem = re.sub(r'\(\d+\)$', '', incoming.stem)
    if stem in DISTRICT_FILES:
        selected[DISTRICT_FILES[stem][0]] = (incoming, incoming.name)
for incoming in INPUT.glob('용산구_역사시각자료_조사_1000건_*.csv'):
    selected['YONGSAN-HIST-001'] = (incoming, incoming.name)
for filename, batches in MULTI_BATCH_FILES.items():
    incoming = INPUT / filename
    if incoming.exists():
        for batch in batches:
            selected[batch] = (incoming, filename)
for expected_batch, (path, original_name) in sorted(selected.items()):
    # District exports have an unquoted comment before the real CSV header.
    with path.open(encoding='utf-8-sig', newline='') as f:
        content = f.read()
    source_note, header_line = '', 1
    if content.startswith('#'):
        source_note, content = content.split('\n', 1)
        source_note, header_line = source_note.strip(), 2
    source_rows = list(csv.DictReader(io.StringIO(content)))
    if not source_rows: continue
    assert all(None not in row and all(isinstance(v, str) for v in row.values()) for row in source_rows), path.name
    batch_ids = {r['조사묶음ID'] for r in source_rows}
    raw_batch = RAW_BATCH_OVERRIDES.get(expected_batch, expected_batch)
    assert batch_ids == set(MULTI_BATCH_FILES.get(original_name, [raw_batch])), (path.name, batch_ids)
    indexed_rows = [(index, row) for index, row in enumerate(source_rows, 1) if row['조사묶음ID'] == raw_batch]
    raw = [row for _, row in indexed_rows]
    assert raw, (path.name, expected_batch)
    batch_id = expected_batch
    assert batch_id in REGIONS or batch_id in DISTRICT_BATCHES, batch_id
    district, dong = REGIONS.get(batch_id, (DISTRICT_BATCHES.get(batch_id), ''))
    collection_scope = 'dong' if dong else 'district'
    if batch_id == 'YONGSAN-HIST-001':
        source_note = '첨부 CSV의 조사묶음ID는 SEONGDONG-SEONGSU-001이지만 자치구 1,000행이 모두 용산구여서 용산구로 분류했습니다. 원본 표기는 보존합니다. 사진 800행·지도 100행·영상 100행이며 이미지 주소는 없습니다. 원문 URL 표본 3건은 503·404·오류 페이지로 해당 기록을 확인하지 못했습니다. 제목·시기·주소 대조·이용조건은 첨부 자료의 표기로 수록하며, 원문 확인이 필요한 자료로 분류합니다.'
    assert (district, dong) in known_places if dong else district in known_districts
    if len(batch_ids) > 1:
        source_note = f'공통 원본 CSV에는 {len(batch_ids)}개 동의 {len(source_rows)}행이 함께 들어 있습니다. 이 조사묶음은 {dong} {len(raw)}행이며, 원본 다운로드는 전체 {len(source_rows)}행을 제공합니다. 데이터 행 번호는 공통 원본 기준입니다.'
    asset = pathlib.Path(original_name).stem.removesuffix('_사진조사').lower() + '.csv'
    if batch_id in ['GBK-HIST-001', 'YONGSAN-HIST-001']:
        asset = {'GBK-HIST-001': 'gangbuk-history-20261023.csv', 'YONGSAN-HIST-001': 'yongsan-history-1000-20261026.csv'}[batch_id]
    destination = ROOT / 'public/research/seoul-photo-research' / asset
    if path.resolve() != destination.resolve(): shutil.copyfile(path, destination)
    files.append(dict(id=batch_id, district=district, dong=dong, filename=original_name, count=len(raw),
        columns=list(raw[0]), path='/research/seoul-photo-research/' + asset,
        collectionScope=collection_scope, sourceNote=source_note, headerLine=header_line,
        sha256=hashlib.sha256(path.read_bytes()).hexdigest(), sizeBytes=path.stat().st_size,
        **({'sourceFileRecordCount': len(source_rows)} if len(batch_ids) > 1 else {})))
    for index, r in indexed_rows:
        # Parenthetical qualifications describe the target/record, not another district.
        record_district = re.split(r'[（(]', r['자치구'], maxsplit=1)[0].strip()
        assert record_district in known_districts, (r['자료ID'], r['자치구'])
        if record_district != district:
            assert ADJACENT_DISTRICTS.get(r['자료ID']) == (district, record_district), (r['자료ID'], r['자치구'], district)
            assert '법정동 경계를 넘어선 주변 자료' in r['주소관계근거'], r['자료ID']
        record_type = 'building' if r.get('자료구분') == '건물 역사 카드' else 'visual'
        assert r['자료ID'].startswith(batch_id + '-') or batch_id == 'YONGSAN-HIST-001' and re.fullmatch(r'YONGSAN-001-P\d{3,4}', r['자료ID']) or record_type == 'building' and re.fullmatch(r'BLDG-\d+( 정정)?', r['자료ID']), r['자료ID']
        source = url(r['원문URL'])
        preview = url(r.get('미리보기URL')) or url(resolved_previews.get(r['자료ID'], {}).get('url'))
        warnings = []
        if batch_id == 'SDG-HIST-001' and '최초 건설 시기 표기' in r['역사적대상시기'] and '촬영일은 목록에 없음' in r['역사적대상시기']:
            warnings.append('촬영·제작일 열의 ' + r['촬영·제작일'] + '은 첨부 설명에서 시설의 최초 건설 시기로 구분한 값입니다. 사진의 실제 촬영일은 목록에서 확인되지 않았습니다. 원본 표기를 함께 보존합니다.')
        source_kind = 'portal' if source and (urlsplit(source).hostname == 'map.ngii.go.kr' or urlsplit(source).path in ['/', '/next/viewMainNew.do']) else 'collection' if source and urlsplit(source).path.endswith('/folderView.do') else 'record' if source else 'missing'
        key = hashlib.sha256(source.encode()).hexdigest()[:16] if source else 'missing-' + r['자료ID']
        items.append(dict(id=r['자료ID'], batchId=batch_id, district=district, dong=dong,
            collectionScope=collection_scope, recordType=record_type, mediaType=r.get('매체유형', '사진'),
            correctionOf=r['자료ID'].removesuffix(' 정정') if record_type == 'building' and r['자료ID'].endswith(' 정정') else None,
            dataRow=index, sourceUrl=source, sourceKey=key, sourceLinkType=source_kind, previewUrl=preview,
            provider=urlsplit(source).hostname if source else '원문 URL 미확인',
            reviewStatus=r['검토상태'], relation=r['주소관계상태'] or '미확인', scope=r['공간범위'],
            candidate=r['검토상태'] == '원문 미확인 후보' or batch_id == 'YONGSAN-HIST-001', conflictMentioned='상충' in (r['추가확인사항'] + r['주소관계근거'] + r.get('상충·주의', '')),
            values=r, **({'metadataWarnings': warnings} if warnings else {}),
            **({'importWarnings': ['첨부 CSV의 조사묶음ID는 성동·성수로 적혀 있으나 자치구 열에 따라 용산구 자료로 분류했습니다.', '원문 URL 표본에서 해당 자료를 확인하지 못했습니다. 제목·촬영일·주소 대조·이용조건은 첨부 자료의 표기이며 원문에서 확인이 필요합니다.']} if batch_id == 'YONGSAN-HIST-001' else {})))
assert len(items) == len({r['id'] for r in items})
for r in items:
    r['correctionIds'] = [other['id'] for other in items if other['batchId'] == r['batchId'] and other['correctionOf'] == r['id']]
    if r['correctionOf']: assert r['correctionOf'] in {other['id'] for other in items if other['batchId'] == r['batchId']}
source_counts = Counter(r['sourceKey'] for r in items if r['sourceUrl'])
preview_counts = Counter(r['previewUrl'] for r in items if r['previewUrl'])
for r in items:
    r['sameSourceCount'] = source_counts.get(r['sourceKey'], 0)
    r['samePreviewCount'] = preview_counts.get(r['previewUrl'], 0)
for f in files:
    subset = [r for r in items if r['batchId'] == f['id']]
    f['sourceUrlCount'] = len({r['sourceUrl'] for r in subset if r['sourceUrl']})
    f['candidateCount'] = sum(r['candidate'] for r in subset)
    f['previewLinkCount'] = sum(bool(r['previewUrl']) for r in subset)
    f['visualRecordCount'] = sum(r['recordType'] == 'visual' for r in subset)
    f['buildingRecordCount'] = sum(r['recordType'] == 'building' for r in subset)
    f['correctionCount'] = sum(bool(r['correctionOf']) for r in subset)
    warning_count = sum(bool(r.get('metadataWarnings')) for r in subset)
    if warning_count:
        f['sourceNote'] += ' | 날짜 해석 주의: 성수대교 ' + str(warning_count) + '행의 촬영·제작일 열은 첨부 설명에서 시설의 최초 건설 시기로 구분합니다. 실제 사진 촬영일은 목록에서 미확인입니다.'
dates = sorted({r['values']['확인일'] for r in items})
meta = dict(id='SEOUL-PHOTO-RESEARCH-20261022', title='서울 사진·지도·영상·건물 조사자료', importedOn=datetime.now(ZoneInfo('Asia/Seoul')).date().isoformat(),
    recordCount=len(items), batchCount=len(files), districtCount=len({f['district'] for f in files}),
    dongCount=sum(f['collectionScope'] == 'dong' for f in files), districtBatchCount=sum(f['collectionScope'] == 'district' for f in files),
    visualRecordCount=sum(r['recordType'] == 'visual' for r in items), buildingRecordCount=sum(r['recordType'] == 'building' for r in items),
    correctionCount=sum(bool(r['correctionOf']) for r in items), mediaTypes=sorted({r['mediaType'] for r in items}),
    sourceUrlCount=len(source_counts), portalLinkCount=sum(r['sourceLinkType'] == 'portal' for r in items), missingSourceUrlCount=sum(not r['sourceUrl'] for r in items),
    repeatedSourceGroupCount=sum(v > 1 for v in source_counts.values()),
    repeatedPreviewGroupCount=sum(v > 1 for v in preview_counts.values()),
    previewLinkCount=sum(bool(r['previewUrl']) for r in items), candidateCount=sum(r['candidate'] for r in items),
    accessUnavailableCount=sum(r['values'].get('파일확보상태') == '접근 불가' for r in items),
    downloadedPhotoCount=0, dateRange=dates[0:1] + dates[-1:], files=files,
    relationCounts=dict(Counter(r['relation'] for r in items)), scopeCounts=dict(Counter(r['scope'] for r in items)),
    providers=sorted({r['provider'] for r in items if r['sourceUrl']}),
    scopeNote='제공된 CSV의 사진·지도·건물 조사목록입니다. 항목 수는 고유 사진 수나 원본 확보 수가 아닙니다. 현재 모습 사진과 정정 카드도 포함되며 촬영·제작일, 역사적 대상 시기, 게시일과 확인일을 구분합니다. 자치구 단위 자료는 특정 동·건물·필지와의 일치가 확인된 자료가 아닙니다.',
    rightsNote='이용조건과 표시 가능 여부는 첨부 자료의 표기입니다. 원본·썸네일 파일을 새 복제하거나 자동 표시하지 않으며, 제공기관 원문과 공개 미리보기 링크에서 확인합니다.')
for name, payload in [('bundle.json', dict(meta=meta, items=items)), ('summary.json', dict(meta=meta))]:
    (ROOT / 'data/photo-research' / name).write_text(json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + '\n')
(ROOT / 'data/photo-research/counts.json').write_text(json.dumps({**{key: meta[key] for key in ['recordCount', 'batchCount', 'districtCount', 'dongCount', 'districtBatchCount', 'visualRecordCount', 'buildingRecordCount', 'correctionCount']}, 'districts': sorted({f['district'] for f in files})}, ensure_ascii=False, separators=(',', ':')) + '\n')
print(json.dumps({k: meta[k] for k in ['recordCount','sourceUrlCount','missingSourceUrlCount','previewLinkCount','candidateCount','accessUnavailableCount','repeatedSourceGroupCount','repeatedPreviewGroupCount']},ensure_ascii=False))
if (ROOT / 'public/research/seoul-integrated-research/자료마스터.csv').exists():
    import subprocess
    subprocess.run([sys.executable, str(ROOT / 'scripts/import-integrated-research.py')], check=True)
