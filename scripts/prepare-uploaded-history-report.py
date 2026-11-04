"""Extract the visible contents of a user-supplied PDF, without repairing clipped text."""
import argparse
import hashlib
import json
import re
from pathlib import Path

import fitz

parser = argparse.ArgumentParser()
parser.add_argument('pdf', type=Path)
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
document = fitz.open(args.pdf)
batches = {}
batch = None
for page_number, page in enumerate(document, 1):
    for line in page.get_text().splitlines():
        heading = re.search(r'탐색한 유튜브 채널 목록 및 검색 방법 \((\d+)차', line)
        if heading:
            batch = int(heading[1])
            batches.setdefault(batch, {'records': [], 'claims': []})
        if not batch:
            continue
        record = re.match(r'\{"record_id": "([^"]+)", "source_platform": "([^"]+)", "channel_name": "([^"]+)", "video_url": "(.*)', line)
        claim = re.match(r'\{"claim_id": "([^"]+)", "record_id": "([^"]+)", "statement": "(.*)', line)
        if record:
            batches[batch]['records'].append({'recordId': record[1], 'platform': record[2], 'channelName': record[3], 'videoUrlFragment': record[4], 'recordLine': line, 'recordPage': page_number})
        if claim:
            batches[batch]['claims'].append({'claimId': claim[1], 'claimRecordId': claim[2], 'claimExcerpt': claim[3].rstrip(), 'claimLine': line, 'claimPage': page_number})

items = []
for number, rows in batches.items():
    assert len(rows['records']) == len(rows['claims']), (number, len(rows['records']), len(rows['claims']))
    for index, (record, claim) in enumerate(zip(rows['records'], rows['claims']), 1):
        excerpt = claim['claimExcerpt']
        year = re.match(r'(\d{4})년', excerpt)
        date = re.match(r'\d{4}년(?:\s*\d{1,2}월)?(?:\s*\d{1,2}일)?', excerpt)
        topic = '교통·도로·교량' if re.search(r'지하철|대교|철교|고가|도로|철도|버스|차로|경전철|교차로|터널|전철|분당선|잠수교|신분당선|고속화', excerpt) else '도시개발·생활'
        if re.search(r'박물관|문화회관|예술의전당|극장|경기장|운동장|올림픽|광장|공원|동상|체육관|서울로', excerpt):
            topic = '문화·체육·공공공간'
        elif re.search(r'청사|의사당|대학교|대법원|대검찰청|증권거래소', excerpt):
            topic = '행정·교육·업무시설'
        items.append({
            'id': f'pdf-city-history-{number}-{index:02d}', 'batch': number,
            **record, **claim, 'year': int(year[1]) if year else None,
            'dateLabel': date[0] if date else None, 'topic': topic,
            'videoUrl': None, 'statementComplete': False,
            'idMismatch': record['recordId'] != claim['claimRecordId'],
            'reviewStatus': 'unverified',
        })

assert len(items) == 215
assert len({item['recordId'] for item in items}) == 215
assert sum(item['idMismatch'] for item in items) == 1
assert all(not item['claimLine'].endswith('}') and not item['recordLine'].endswith('}') for item in items)
payload = {
    'schemaVersion': 1,
    'document': {
        'id': 'seoul-city-history-report-2026-10-20',
        'title': '서울 도시 역사자료 아카이브 구축 보고',
        'filename': args.pdf.name,
        'pdfPath': '/documents/seoul-city-history-report-2026-10-20.pdf',
        'pageCount': len(document),
        'sha256': hashlib.sha256(args.pdf.read_bytes()).hexdigest(),
        'sizeBytes': args.pdf.stat().st_size,
        'printedAt': '2026-10-20T21:05:00+09:00',
        'importedOn': '2026-10-21',
        'origin': '사용자가 제공한 Gemini 대화 출력 PDF',
        'conversationUrl': 'https://gemini.google.com/app/d0d3bb9e07790e25',
        'reportedCumulativeCount': 2000,
        'visibleRecordCount': len(items),
        'visibleClaimCount': len(items),
        'completeVideoUrlCount': 0,
        'independentlyVerifiedVideoCount': 0,
        'idMismatchCount': 1,
        'rightsNote': '사용자의 사이트 반영 요청에 따라 제공된 보고서를 기존 소유자 전용 사이트에 수록합니다. 보고서에 언급된 영상·사진의 보관·재사용 허락은 별도로 확인해야 합니다.',
    },
    'batches': [{'number': number, 'count': len(rows['records'])} for number, rows in batches.items()],
    'items': items,
}
args.output.parent.mkdir(parents=True, exist_ok=True)
args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'records': len(items), 'batches': len(batches), 'idMismatches': 1, 'pdfSha256': payload['document']['sha256']}, ensure_ascii=False))
