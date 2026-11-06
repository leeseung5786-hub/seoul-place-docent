"""Import the supplied Markdown reports without inventing missing cumulative rows."""
import csv
import hashlib
import json
import re
import shutil
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOC, VIDEO = map(Path, sys.argv[1:3])
DATE = '2026-11-06'
ASSETS = ROOT / 'public/research/consolidated-20261106'
ASSETS.mkdir(parents=True, exist_ok=True)
NOTE = '첨부 조사자료의 서술입니다. 원문·연대·장소를 사이트에서 독립 대조한 결과와 구분합니다.'


def clean(value):
    value = re.sub(r'\[([^\]]+)\]\(https?://(?:[^\s()]|\([^)]*\))+\)', r'\1', value)
    return value.replace('**', '').replace('`', '').replace('\\]', ']').strip()


def urls(value):
    # Preserve balanced URL parentheses, e.g. a Wikipedia article title.
    found = []
    for value in re.findall(r'https?://[^\s|<>]+', value):
        while value.endswith(')') and value.count(')') > value.count('('):
            value = value[:-1]
        found.append(value.rstrip(',]'))
    return list(dict.fromkeys(found))


def sections(text):
    result = {}
    heading = ''
    for line in text.splitlines():
        if line.startswith('#'):
            heading = line
        elif line.startswith('|'):
            cells = [cell.strip() for cell in re.split(r'(?<!\\)\|', line)[1:-1]]
            if cells and not re.match(r'^:?-', cells[0]):
                result.setdefault(heading, []).append(cells)
    return result


def table(section_map, prefix):
    matches = [rows for title, rows in section_map.items() if title.startswith(prefix)]
    assert len(matches) == 1, prefix
    return matches[0][1:]


def evidence(value):
    value = value.replace('`', '')
    for first, last in re.findall(r'E(\d{6})\s*[~～–-]\s*E(\d{6})', value):
        value += ' ' + ' '.join(f'E{i:06}' for i in range(int(first), int(last) + 1))
    return list(dict.fromkeys(re.findall(r'E\d{6}', value)))


bundle_path = ROOT / 'data/document-research/bundle.json'
bundle = json.loads(bundle_path.read_text())
s = sections(DOC.read_text())
by_target = {row['id']: row for row in bundle['targets']}
target_names = {t['name']: t['id'] for t in bundle['targets'] if t['district'] == '성동구' and t['level'] == '법정동'}


def upsert(key, row):
    rows = bundle['tables'][key]
    old = next((i for i, item in enumerate(rows) if item['id'] == row['id']), None)
    if old is None:
        rows.append(row)
    else:
        # Existing independently supplied source descriptions remain authoritative.
        if key == 'sources' and rows[old]['values'].get('수록보고서') != '/research/consolidated-20261106/seoul_history_doc.md':
            return
        rows[old] = row


def row(key, rid, values, tids, sids=None, eids=None, issues=None):
    return dict(id=rid, targetIds=tids, sourceIds=sids or [], evidenceIds=eids or [], district='성동구',
                label=values.get('자료명') or values.get('주제') or values.get('시기표기') or values.get('동·권역명') or values.get('시설·사업명') or rid,
                status='제공자료 초안', issues=issues or [], values={**values, '검토상태': '제공자료 초안', '추가확인사항': NOTE, '수록보고서': '/research/consolidated-20261106/seoul_history_doc.md'})


for cells in table(s, '### 3.1.'):
    ids = re.findall(r'SEOUL-DOC-[A-Z0-9-]+', cells[0])
    if 'ALL-001-D005' in cells[0]:
        ids.append('SEOUL-DOC-ALL-001-D005')
    target_ids = re.findall(r'GU-\d{3}(?:-DONG-\d{3})?', cells[1])
    links = urls(cells[7])
    for i, sid in enumerate(ids):
        values = {'자료ID': sid, '자료명': clean(cells[3]), '자료유형': clean(cells[2]), '제공기관·채널': clean(cells[4]), '발행연도': clean(cells[5]), '원문열람범위': clean(cells[6]), '원문URL': links[min(i, len(links)-1)] if links else '', '보조출처URL': '\n'.join(links[1:]), '이용조건': clean(cells[8]), '확인일': DATE, '주소관계상태': '동네 자료 · 개별 건물·부지 미확인'}
        upsert('sources', row('sources', sid, values, [t for t in target_ids if t in by_target], [sid]))

source_ids = {r['id'] for r in bundle['tables']['sources']}
alias = {}
for sid in source_ids:
    m = re.search(r'GU-016-DONG-(\d{3})-B001-(D\d{3})$', sid)
    if m:
        alias[f'D{m[1]}-{m[2]}'] = sid
    m = re.search(r'GU-016-B001-(D\d{3})$', sid)
    if m:
        alias[f'GU-016-{m[1]}'] = sid
alias['ALL-D005'] = 'SEOUL-DOC-ALL-001-D005'

for c in table(s, '### 3.2.'):
    rid, sid, tid = [clean(v) for v in c[:3]]
    assert sid in source_ids and tid in by_target
    values = dict(zip(['연결ID', '자료ID', '대상ID', '자치구', '동·권역명', '관련장·절', '지역관련근거', '확인일'], map(clean, c)))
    upsert('links', row('links', rid, values, [tid], [sid]))

for c in table(s, '## 4.'):
    rid, gu, dong, topic, text, date, refs, status = map(clean, c)
    # Expand only explicit abbreviated source ranges, never infer missing sources.
    refs = re.sub(r'(D\d{3})-(D\d{3})\s*[~～]\s*(D\d{3})', lambda m: ' '.join(f'{m[1]}-D{i:03}' for i in range(int(m[2][1:]), int(m[3][1:])+1)), refs)
    refs = re.findall(r'GU-016-D\d{3}|ALL-D\d{3}|D\d{3}-D\d{3}', refs)
    missing = [ref for ref in refs if alias.get(ref) not in source_ids]
    sids = list(dict.fromkeys(alias[ref] for ref in refs if alias.get(ref) in source_ids))
    values = {'근거ID': rid, '자치구': gu, '동·권역명': dong, '지역구분': '법정동', '주제': topic, '역사적주장': '첨부 조사자료에 따르면, ' + text, '제공원문주장': text, '시기표기': date, '근거자료ID': ','.join(sids), '제공근거약칭': ','.join(refs), '근거유형': '제공자료 요약', '자료간상충여부': status, '원문위치': '첨부 문헌 보고서 제4절 ' + rid}
    upsert('claims', row('claims', rid, values, [target_names[dong]], sids, [rid], ['연결 문헌 미확보: '+','.join(missing)] if missing else []))

claims = {r['id']: r for r in bundle['tables']['claims']}
text = DOC.read_text()
for dong, tid in target_names.items():
    m = re.search(r'### 5\.\d+\. 성동구 '+dong+r'[^\n]*\n(.*?)(?=\n#|\Z)', text, re.S)
    if not m:
        continue
    draft = m[1].strip()
    eids = evidence(draft)
    assert all(e in claims for e in eids)
    values = {'대상ID': tid, '자치구': '성동구', '동·권역명': dong, '지역구분': '법정동', '본문초안': '첨부 조사자료가 정리한 동네 설명입니다. ' + draft, '사용근거ID': ','.join(eids), '작성일': '2026-11-03' if dong == '행당동' else '2026-11-02', '상충·주의사항': NOTE}
    upsert('drafts', row('drafts', tid, values, [tid], eids=eids))
    original = next(r for r in bundle['tables']['targets'] if r['id'] == tid)
    original['status'] = '제공자료 수록'
    original['values'].update({'처리상태': '제공자료 수록', '본문초안상태': '제공자료 초안', '마지막확인일': DATE})

for i, c in enumerate(table(s, '## 6.')):
    tid, dong, date, event, refs, status = map(clean, c)
    eids = evidence(refs)
    assert all(e in claims for e in eids)
    issues = list(dict.fromkeys(issue for eid in eids for issue in claims[eid]['issues']))
    values = {'대상ID': tid, '자치구': '성동구', '동·권역명': dong, '시기표기': date, '사건': event, '근거ID': ','.join(eids), '상충·주의사항': NOTE}
    upsert('timeline', row('timeline', f'MD20261106-T-{i+1:03}', values, [tid], eids=eids, issues=issues))
for i, c in enumerate(table(s, '## 7.')):
    gu, dong, names, scene, date, refs = map(clean, c)
    values = {'자치구': gu, '동·권역': dong, '옛지명·별칭': names, '시설·사업명': scene, '찾을장면': scene, '관련시기': date, '근거ID': ','.join(evidence(refs))}
    upsert('leads', row('leads', f'MD20261106-L-{i+1:03}', values, [target_names[dong]], eids=evidence(refs)))

# Rebuild linked source targets after adding the new region links.
for source in bundle['tables']['sources']:
    source['targetIds'] = sorted(set(source['targetIds']) | {tid for link in bundle['tables']['links'] if source['id'] in link['sourceIds'] for tid in link['targetIds']})
for spec in bundle['meta']['files']:
    key = spec['key']
    rows = bundle['tables'][key]
    columns = list(dict.fromkeys(k for item in rows for k in item['values']))
    spec.setdefault('originalPath', spec['path'])
    spec['path'] = '/research/consolidated-20261106/' + Path(spec['originalPath']).name
    spec['filename'] = '누적_' + Path(spec['originalPath']).name
    path = ROOT / 'public' / spec['path'].lstrip('/')
    with path.open('w', encoding='utf-8-sig', newline='') as stream:
        writer = csv.DictWriter(stream, columns, lineterminator='\n')
        writer.writeheader()
        writer.writerows(item['values'] for item in rows)
    spec.update(count=len(rows), columns=columns, sizeBytes=path.stat().st_size, sha256=hashlib.sha256(path.read_bytes()).hexdigest())
bundle['meta'].update(importedOn=DATE, counts={k: len(v) for k,v in bundle['tables'].items()}, totalRecords=sum(len(v) for v in bundle['tables'].values()))
bundle['meta']['scopeNote'] = '첨부 CSV와 Markdown 보고서의 조사자료입니다. 검토상태·이용조건은 제공 자료의 표기이며 사이트의 독립 원문 대조와 구분합니다. 2026-11-06 추가 본문은 응봉동·하왕십리동·행당동 3곳입니다. 누적 보고 수 전체가 실제 수록된 것은 아닙니다. 개별 건물·부지와의 일치는 미확인입니다.'
bundle['meta']['dateRange'][1] = '2026-11-03'
source_urls = Counter(r['values'].get('원문URL','') for r in bundle['tables']['sources'])
bundle['meta']['sourceUrlCount'] = len(source_urls)
bundle['meta']['repeatedUrlGroupCount'] = sum(n > 1 for n in source_urls.values())
bundle_path.write_text(json.dumps(bundle, ensure_ascii=False, separators=(',', ':'))+'\n')
(ROOT / 'data/document-research/summary.json').write_text(json.dumps({'meta':bundle['meta'],'targets':bundle['targets']},ensure_ascii=False,separators=(',',':'))+'\n')

# Videos are kept separate from the old PDF excerpts and from literature facts.
v = sections(VIDEO.read_text())
regions = json.loads((ROOT / 'data/seoul-regions.json').read_text())['districts']
known_gu = {g['name']:g['dongs'] for g in regions}
gu_pattern = '|'.join(sorted(known_gu, key=len, reverse=True))


def location_links(label):
    label = re.sub(r'성동구\s*\(현\s*광진구\)', '광진구', label)
    label = re.sub(r'성동구\s*세곡동', '강남구 세곡동', label)
    found = list(re.finditer(gu_pattern, label))
    links = []
    for i, m in enumerate(found):
        district = m[0]
        part = label[m.end():found[i+1].start() if i+1<len(found) else len(label)]
        dongs = [dong for dong in known_gu[district] if re.search(re.escape(dong)+r'(?![가-힣0-9])', part)]
        links.extend({'district':district,'dong':dong,'scope':'neighborhood'} for dong in dongs)
        if not dongs:
            links.append({'district':district,'dong':'','scope':'district'})
    return list({(x['district'],x['dong']):x for x in links}.values())


def video_id(value):
    ids = re.findall(r'(?:[?&]v=|youtu\.be/)([\w-]{11})(?![\w-])', value)
    return ids[-1] if ids else ''


def seconds(value):
    parts = clean(value).split(':')
    if len(parts) != 3 or not all(p.isdigit() for p in parts):
        return None
    h,m,s = map(int,parts)
    return h*3600+m*60+s if m<60 and s<60 else None


segments = {}
for c in table(v, '## 4.'):
    batch, record, start, end, place, description, basis = c
    rid = re.search(r'SEOUL-HIST-V-\d{3}-\d{3}', record)[0]
    a,b = seconds(start),seconds(end)
    segments.setdefault(rid,[]).append({'start':a,'end':b,'startLabel':clean(start),'endLabel':clean(end),'place':clean(place),'description':clean(description),'basis':clean(basis),'validTime':a is not None and b is not None and a<b})
items = []
for title, rows in v.items():
    if title.startswith('### 3.') and '회차' in title:
        for c in rows[1:]:
            rid, label, channel, date, district, place, duration = c
            rid = clean(rid)
            vid = video_id(label) or next((clean(cell) for cell in c if re.fullmatch(r'[A-Za-z0-9_-]{11}', clean(cell))), '')
            if not video_id(label):
                label = channel
                channel = '제공 보고서 채널 표기 불완전'
                date = '시기 표기 확인 필요'
            items.append({'id':rid,'videoId':vid,'group':'A','title':clean(label.split('](http')[0]).lstrip('['),'channel':clean(channel),'date':clean(date),'districtLabel':clean(district),'place':clean(place),'duration':clean(duration),'reason':'첨부 보고서 A군','rawUrl':urls(label)[0] if urls(label) else '', 'segments':segments.get(rid,[])})
for c in table(v, '## 5.'):
    batch,rid,vid,title,channel,date,duration,place,reason = c
    items.append({'id':clean(rid),'videoId':clean(vid),'group':'B','title':clean(title.split('](http')[0]).lstrip('['),'channel':clean(channel),'date':clean(date),'districtLabel':'','place':clean(place),'duration':clean(duration),'reason':clean(reason),'rawUrl':urls(title)[0] if urls(title) else '', 'segments':[]})
excluded = []
for c in table(v, '## 6.'):
    excluded.append(dict(zip(['batch','videoId','title','channel','reason'],map(clean,c))))
assert len(items) == 204 and len(excluded) == 17
by_video = {}
for item in items:
    if not re.fullmatch(r'[\w-]{11}',item['videoId']):
        item['videoId'] = ''
    item['url'] = 'https://www.youtube.com/watch?v='+item['videoId'] if item['videoId'] else None
    item['regionLinks'] = location_links(item['districtLabel']+' '+item['place'])
    item['reviewStatus'] = '제공 보고서 표기 · 영상 독립 대조 전'
    item['urlNormalized'] = item['url'] != item['rawUrl']
    item['invalidTimeCount'] = sum(not s['validTime'] for s in item['segments'])
    key = item['videoId'] or 'unresolved:'+item['id']
    old = by_video.get(key)
    if old:
        old['aliases'].append(item['id'])
        old['segments'].extend(s for s in item['segments'] if s not in old['segments'])
        old['regionLinks'] = list({(x['district'],x['dong']):x for x in old['regionLinks']+item['regionLinks']}.values())
        if item['group']=='A':old['group']='A'
    else:
        item['aliases']=[item['id']]
        by_video[key]=item
manifest = []
for source in [DOC,VIDEO]:
    shutil.copyfile(source,ASSETS/source.name)
    manifest.append({'filename':source.name,'path':'/research/consolidated-20261106/'+source.name,'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'sizeBytes':source.stat().st_size})
meta = {'importedOn':DATE,'reportedVideoCount':204,'videoRowCount':len(items),'uniqueVideoCount':len(by_video),'groupCounts':dict(Counter(i['group'] for i in by_video.values())),'segmentCount':sum(len(i['segments']) for i in by_video.values()),'excludedCount':len(excluded),'normalizedUrlCount':sum(i['urlNormalized'] for i in items),'invalidTimeCount':sum(i['invalidTimeCount'] for i in items),'files':manifest,'note':NOTE,'documentImportCounts':{'sourceRows':20,'links':30,'claims':45,'drafts':3,'timeline':24,'leads':15},'reportedDocumentCounts':{'sources':817,'claims':3110,'drafts':189,'timeline':2495},'actualDocumentExcerpt':{'claims':45,'drafts':3,'timeline':24,'links':30,'leads':15}}
(ROOT/'data/consolidated-video-research.json').write_text(json.dumps({'meta':meta,'items':list(by_video.values()),'excluded':excluded},ensure_ascii=False,separators=(',',':'))+'\n')
print(json.dumps(meta,ensure_ascii=False))
