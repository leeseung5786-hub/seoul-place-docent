"""Check curated legal-dong facts against target names and cached source receipts.

Usage: python scripts/audit-legal-dong-corpus.py /absolute/research-cache
Temporary HTML is not copied into the repository or production storage.
Checks establish capture/selection integrity, not historical truth or parcel identity.
"""
from pathlib import Path
from lxml import html
from urllib.parse import urlsplit,parse_qs,urlencode,urlunsplit
import json,hashlib,re,sys,collections

ROOT=Path(__file__).resolve().parents[1]
CACHE=Path(sys.argv[1])
INPUT=ROOT/'data/legal-dong-completion-2026-10-17.json'
TARGETS=json.loads((ROOT/'data/legal-dong-gap-targets-2026-10-17.json').read_text())['targets']
rows=json.loads(INPUT.read_text())
expected={t['id']:t for t in TARGETS}
assert len(rows)==len(expected)==258
receipts={hashlib.sha256(p.read_bytes()).hexdigest():p for p in CACHE.rglob('*.html')}
def norm(s):return re.sub(r'\s','',s).split('(')[0]
def canonical(url):
 u=urlsplit(url);q=parse_qs(u.query,keep_blank_values=True)
 return urlunsplit((u.scheme,u.netloc,u.path,urlencode(sorted((k,v) for k,vs in q.items() if not k.startswith('utm_') for v in vs)) ,''))
seen=set();evidence=[]
for row in rows:
 assert row['description']==''
 assert row['source']['reviewStatus']=='needs_review'
 assert row['source']['publicationDate']=='' and row['metadata'].get('시기','')==''
 assert len(row['sections'])==1
 section=row['sections'][0]
 assert section['textKind']=='paraphrase' and section['relation']=='exact_name'
 assert len(section['regionIds'])==1
 rid=section['regionIds'][0];assert rid in expected and rid not in seen,rid;seen.add(rid)
 assert section['regionLabel']==expected[rid]['name']
 assert len(section['text'].split())<=30 and section['locator'] and section['basis']
 assert row['source']['institution'] in ['서울역사편찬원','종로구청','동작구청']
 assert '\ufffd' not in json.dumps(row,ensure_ascii=False)
 if row['source']['rights']=='unknown':assert not row['source']['storageAllowed'] and not row['source']['reuseAllowed']
 else:assert row['source']['rights']=='KOGL1' and section['regionLabel']=='도렴동'
 item={'regionId':rid,'sourceUrl':row['source']['url'],'sourceHash':row['pageHash'],'sourceHeading':row['metadata'].get('원문표제',''),'reviewStatus':'pending','captureCheck':'','sourceBlock':''}
 if row['pageHash']:
  path=receipts.get(row['pageHash']);assert path,(rid,'missing raw receipt')
  d=html.fromstring(path.read_bytes().decode('utf-8'))
  for el in d.xpath('//script|//style'):el.drop_tree()
  entries=[]
  for li in d.xpath('//ul[contains(@class,"searched-list")]/li'):
   h=li.xpath('.//strong[contains(@class,"year")]');p=li.xpath('.//p[contains(@class,"txt-box")]')
   if h and p:entries.append({'heading':' '.join(h[0].text_content().split()),'text':' '.join(p[0].text_content().split()),'id':p[0].get('id')})
  label=section['regionLabel']
  if entries:
   alias=label.replace('명륜','명륜동') if label in ['명륜1가','명륜2가','명륜3가','명륜4가'] else label
   matching=[e for e in entries if norm(e['heading'])==alias]
   assert matching,(rid,'no matching named entry')
   # Same-name legal/administrative entries can share a heading. The selected
   # source locator keeps the legal entry, reviewed independently in research.
   if label=='신사동':matching=[e for e in matching if '강남구' in e['text']]
   chosen=matching[0]
   years=re.findall(r'(?<!\d)(?:1\d{3}|20\d{2})(?!\d)',section['text'])
   assert all(y in chosen['text'] for y in years),(rid,'year absent from selected source',years)
   item.update(sourceHeading=chosen['heading'],sourceBlock=chosen['id'],captureCheck='raw HTML hash + exact named entry + numerical-year occurrence')
   if len(matching)>1:
    row['metadata']['본문구간구분']='동일 표제 중 첫 번째 법정동 항목 / '+chosen['id']+' · 행정동 항목과 구분'
    suffix=' / 첫 번째 법정동 항목 ('+chosen['id']+')'
    if not section['locator'].endswith(suffix):section['locator']+=suffix
    row['sourceLocator']=section['locator']
   else:
    suffix=' / 본문 구간 ('+chosen['id']+')'
    if not section['locator'].endswith(suffix):section['locator']+=suffix
    row['sourceLocator']=section['locator']
   if alias!=label:
    proofs=json.loads((ROOT/'data/legal-dong-name-crosschecks-2026-10-17.json').read_text())
    proof=next(p for p in proofs if p['regionId']==rid)
    assert proof['currentName']==label and proof['dictionaryName']==alias
    item['nameCrosscheck']={'dictionaryName':alias,'addressName':label,'officialCode':proof['officialCode'],'method':'주소기반산업지원서비스 주소 후보의 emdNm·admCd 대조 및 종로문화플랫폼 주소 표기 보완'}
  else:
   assert label=='상도1동' and row['source']['institution']=='동작구청'
   body=' '.join(d.text_content().split());assert '1980' in body and '상도제1동' in body
   item['captureCheck']='raw HTML hash + Dongjak 1980 legal-dong list containing 상도제1동'
 else:
  assert section['regionLabel']=='도렴동' and row['source']['institution']=='종로구청'
  item['captureCheck']='official detail page read with web tool; no raw HTML fingerprint claimed'
 evidence.append(item)
assert seen==set(expected)
assert len({canonical(r['source']['url']) for r in rows})==258
assert len([e for e in evidence if e['sourceHash']])==257
for row in rows:
 assert len(row['metadata'])<=30
 assert all(len(k)<=100 and isinstance(v,str) and len(v)<=4000 for k,v in row['metadata'].items())
INPUT.write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
report={'scope':'258개 미확보 명칭의 수집·표제 선택 검사. 역사적 사실 전체 검증·현행 법정동 목록 확정·필지 동일성 검증이 아님.','targetCount':258,'sources':258,'passages':258,'directHtmlReceipts':257,'webOnlyReceipts':1,'unknownRights':257,'kogl1':1,'originalTextAdded':0,'expectedTotals':{'sources':524,'passages':638,'scopes':492,'captures':479,'legalNamesWithText':467,'legalNamesWithoutText':0,'guWithText':25,'assets':20,'facts':21,'originalSources':123,'rightsChecked':136},'byDistrict':dict(sorted(collections.Counter(expected[r]['parent_id'] for r in seen).items())),'evidence':sorted(evidence,key=lambda e:e['regionId'])}
(ROOT/'data/legal-dong-completion-audit-2026-10-17.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='evidence'},ensure_ascii=False))
