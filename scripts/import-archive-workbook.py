"""Reconcile the supplied workbook against shipped records without overwriting observations."""
import collections
import copy
import csv
import hashlib
import io
import json
import re
import shutil
import sys
from pathlib import Path
from urllib.parse import urlsplit
import openpyxl

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public/research/archive-workbook-20261108'
OUT = ROOT / 'data/archive-workbook'
ASSETS.mkdir(parents=True, exist_ok=True)
OUT.mkdir(parents=True, exist_ok=True)
source = Path(sys.argv[1]) if len(sys.argv) > 1 else ASSETS / 'seoul-history-archive.xlsx'
destination = ASSETS / 'seoul-history-archive.xlsx'
if source.resolve() != destination.resolve():
    shutil.copyfile(source, destination)
workbook = openpyxl.load_workbook(destination, read_only=True, data_only=True)
legacy = json.loads((ROOT / 'data/photo-research/bundle.json').read_text())
integrated = json.loads((ROOT / 'data/integrated-research/photo-items.json').read_text())
base = legacy['items'] + integrated
original_meta = json.loads((ROOT / 'data/photo-research/combined-summary.json').read_text())['meta']
files_by_id = {f['id']: f for f in original_meta['files']}
known = json.loads((ROOT / 'data/seoul-regions.json').read_text())
known_places = {(d['name'], name) for d in known['districts'] for name in d['dongs']}
dong_batches = dict(zip(
    ['SINSEOLDONG','YONGDUDONG','JEGIDONG','JEONNONGDONG','DAPSIMNIDONG','JANGANDONG','CHEONGNYANGNIDONG','HOEGIDONG','HWIGYEONGDONG','IMUNDONG'],
    ['신설동','용두동','제기동','전농동','답십리동','장안동','청량리동','회기동','휘경동','이문동']))

def text(v):
    return '' if v is None else str(v)

def fingerprint(values, keys):
    return hashlib.sha256(json.dumps({k: text(values.get(k)).strip() for k in keys}, ensure_ascii=False, sort_keys=True).encode()).hexdigest()

def url(v):
    match = re.match(r'https?://[^\s<>]+', v or '')
    if not match:
        return None
    u = urlsplit(match[0])
    return match[0] if u.hostname and not u.username and not u.password else None

items, mapping, batches = [], [], {}
used_ids = {r['id'] for r in base}
video_records = list(json.loads((ROOT / 'data/video-workbooks/records.json').read_text())['records'].values())
video_by_id = collections.defaultdict(list)
for row in video_records:
    video_by_id[row['originalId']].append(row)
video_count = 0
sheet_counts = {}
for sheet_number, sheet in enumerate(workbook.worksheets[1:], 1):
    iterator = sheet.iter_rows(values_only=True)
    headers = list(next(iterator))
    rows = [dict(zip(headers, map(text, row))) for row in iterator if any(row)]
    sheet_counts[sheet.title] = len(rows)
    asset_name = ['videos.csv', 'photos-master.csv', 'photos-observations.csv'][sheet_number - 1]
    with (ASSETS / asset_name).open('w', encoding='utf-8-sig', newline='') as stream:
        writer = csv.DictWriter(stream, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)
    if sheet_number == 1:
        for r in rows:
            candidates = video_by_id[r['자료ID']]
            match = next((c for c in candidates if c['title'] == r['자료명'] and c['rawUrl'] == r['영상URL·원문링크']), None)
            assert match, ('Unmatched video', r['자료ID'])
            video_count += 1
        continue
    keys = [k for k in headers if k not in ('연번', '원본조사파일')]
    by_fingerprint = {fingerprint(r['values'], keys): r for r in base + items}
    for row_number, r in enumerate(rows, 2):
        digest = fingerprint(r, keys)
        existing = by_fingerprint.get(digest)
        if existing:
            mapping.append(dict(sheet=sheet.title, row=row_number, sourceId=r['자료ID'], recordId=existing['id'], fingerprint=digest))
            continue
        batch = r['조사묶음ID']
        district = r['자치구'].strip()
        prior = files_by_id.get(batch) or files_by_id.get(batch.replace('-002', '-001'))
        dong = prior['dong'] if prior else dong_batches.get(batch.split('-')[0], '')
        assert (district, dong) in known_places, ('Unresolved region', batch, district, dong)
        batch_id = 'WORKBOOK-20261108-' + batch
        batches[batch_id] = dict(district=district, dong=dong, sourceBatch=batch)
        rid = r['자료ID']
        conflict = rid in used_ids
        if conflict:
            rid += '~workbook-' + digest[:12]
        assert rid not in used_ids
        used_ids.add(rid)
        source_url, preview = url(r['원문URL']), url(r.get('미리보기URL'))
        parsed = urlsplit(source_url) if source_url else None
        kind = 'portal' if parsed and (parsed.hostname == 'map.ngii.go.kr' or parsed.path in ['/', '/next/viewMainNew.do']) else 'collection' if parsed and parsed.path.endswith('/folderView.do') else 'record' if source_url else 'missing'
        item = dict(id=rid, batchId=batch_id, district=district, dong=dong, dataRow=row_number - 1,
            collectionScope='dong', recordType='visual', mediaType=r['매체유형'] or '사진',
            correctionOf=None, correctionIds=[], sourceUrl=source_url,
            sourceKey=hashlib.sha256(source_url.encode()).hexdigest()[:16] if source_url else 'missing-' + rid,
            sourceLinkType=kind, previewUrl=preview, provider=parsed.hostname if parsed else '원문 URL 미확인',
            reviewStatus=r['검토상태'], relation=r['주소관계상태'] or '미확인', scope=r['공간범위'],
            candidate='원문 미확인 후보' in r['검토상태'], conflictMentioned='상충' in (r['추가확인사항'] + r['주소관계근거']),
            sameSourceCount=0, samePreviewCount=0, values={k:v for k,v in r.items() if k != '연번'},
            previousIds=[r['자료ID']] if conflict else [],
            importWarnings=['통합본의 자료 ID가 기존 기록과 같지만 내용이 달라 별도 관찰본으로 보존했습니다.'] if conflict else [],
            workbookProvenance=dict(path='/research/archive-workbook-20261108/seoul-history-archive.xlsx', sheet=sheet.title, row=row_number, sourceId=r['자료ID'], fingerprint=digest))
        items.append(item)
        by_fingerprint[digest] = item
        mapping.append(dict(sheet=sheet.title, row=row_number, sourceId=r['자료ID'], recordId=rid, fingerprint=digest))

all_items = base + items
source_counts = collections.Counter(r['sourceKey'] for r in all_items if r['sourceUrl'])
preview_counts = collections.Counter(r['previewUrl'] for r in all_items if r['previewUrl'])
for row in items:
    row['sameSourceCount'] = source_counts.get(row['sourceKey'], 0)
    row['samePreviewCount'] = preview_counts.get(row['previewUrl'], 0)
files = []
for batch_id, location in batches.items():
    subset = [r for r in items if r['batchId'] == batch_id]
    csv_path = ASSETS / (batch_id.lower() + '.csv')
    with csv_path.open('w', encoding='utf-8-sig', newline='') as stream:
        columns = list(subset[0]['values'])
        writer = csv.DictWriter(stream, fieldnames=columns)
        writer.writeheader()
        writer.writerows(r['values'] for r in subset)
    files.append(dict(id=batch_id, district=location['district'], dong=location['dong'], filename=csv_path.name,
        count=len(subset), columns=columns, path='/research/archive-workbook-20261108/' + csv_path.name,
        sha256=hashlib.sha256(csv_path.read_bytes()).hexdigest(), sizeBytes=csv_path.stat().st_size,
        sourceUrlCount=len({r['sourceUrl'] for r in subset if r['sourceUrl']}), candidateCount=sum(r['candidate'] for r in subset),
        previewLinkCount=sum(bool(r['previewUrl']) for r in subset), collectionScope='dong',
        sourceNote='통합본 추가·상이 관찰 기록. 원본 시트·행·자료 ID를 보존하며 같은 원문과 사진은 화면에서 묶습니다.', headerLine=1,
        visualRecordCount=len(subset), buildingRecordCount=0, correctionCount=0))
meta = copy.deepcopy(original_meta)
meta.update(importedOn='2026-11-08', recordCount=len(all_items), files=meta['files'] + files,
    visualRecordCount=sum(r['recordType'] == 'visual' for r in all_items),
    sourceUrlCount=len(source_counts), missingSourceUrlCount=sum(not r['sourceUrl'] for r in all_items),
    repeatedSourceGroupCount=sum(n > 1 for n in source_counts.values()), repeatedPreviewGroupCount=sum(n > 1 for n in preview_counts.values()),
    previewLinkCount=sum(bool(r['previewUrl']) for r in all_items), candidateCount=sum(r['candidate'] for r in all_items),
    portalLinkCount=sum(r['sourceLinkType'] == 'portal' for r in all_items),
    relationCounts=dict(collections.Counter(r['relation'] for r in all_items)), scopeCounts=dict(collections.Counter(r['scope'] for r in all_items)),
    providers=sorted({r['provider'] for r in all_items if r['sourceUrl']}), mediaTypes=sorted({r['mediaType'] for r in all_items}))
meta.update(batchCount=len(meta['files']), districtCount=len({f['district'] for f in meta['files'] if f['district']}),
    dongCount=len({(f['district'],f['dong']) for f in meta['files'] if f['dong']}))
audit = dict(version=1, date='2026-11-08', workbookPath='/research/archive-workbook-20261108/seoul-history-archive.xlsx',
    workbookSha256=hashlib.sha256(destination.read_bytes()).hexdigest(), sheetCounts=sheet_counts,
    videosMatched=video_count, photoRowsMapped=len(mapping), addedRecords=len(items),
    newSourceIds=len({r['values']['자료ID'] for r in items} - {r['id'] for r in base}),
    preservedVariants=sum(bool(r['previousIds']) for r in items), mappings=mapping)
for path, data in [(OUT / 'photos.json', items), (OUT / 'summary.json', dict(meta=meta)), (OUT / 'audit.json', audit)]:
    path.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')
print(json.dumps({k:v for k,v in audit.items() if k != 'mappings'}, ensure_ascii=False))
