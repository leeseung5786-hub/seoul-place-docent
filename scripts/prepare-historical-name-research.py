"""Prepare a bounded, reproducible old-place-name metadata collection; no network or DB writes."""
import argparse, collections, datetime, hashlib, json, pathlib, re, unicodedata
from urllib.parse import urlencode, urlsplit, urlunsplit, parse_qsl

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATE = '2026-10-23'
p = argparse.ArgumentParser()
inputs=p.add_mutually_exclusive_group()
inputs.add_argument('--input-directory', type=pathlib.Path)
inputs.add_argument('--query-receipts', type=pathlib.Path, default=ROOT/'data/historical-name-query-receipts-2026-10-23.json')
p.add_argument('--existing-sources', type=pathlib.Path, default=ROOT/'data/historical-name-baseline-2026-10-23.json')
p.add_argument('--batch-directory',type=pathlib.Path,help='Optional directory for live import payloads; generation never sends them.')
p.add_argument('--per-alias', type=int, default=3)
args = p.parse_args()
assert 1 <= args.per_alias <= 10

def compact(value):
    return re.sub(r'[^가-힣A-Za-z0-9一-龥]', '', unicodedata.normalize('NFKC', value))

def canonical(url):
    u=urlsplit(url)
    return urlunsplit((u.scheme,u.netloc,u.path,urlencode(sorted((k,v) for k,v in parse_qsl(u.query) if not k.startswith('utm_'))),''))

def dictionary(name):
    return 'https://history.seoul.go.kr/archive/ggdic/list.do?' + urlencode(dict(key='2211220002',pageIndex=1,sc='sc_nameKor',sc_alphabet='',sc_cate=1,sc_scndcode=1,sw=name))

aliases=[]
def add(district,current,parent,locality,evidence_url,locator,period,variants=None,method='official_text_checked',note=''):
    aliases.append(dict(id=f'HPN-{len(aliases)+1:03}',district=district,currentDong=current,parent=parent,historicalName=locality,
        variants=variants or [locality],qualifiedQuery=parent+' '+locality,period=period,
        currentRegionId='dong-'+district+'-'+current,catalogRegionId='gu-'+district,
        spatialRelation='historical_area_candidate',evidence=dict(url=evidence_url,locator=locator,method=method,checkedOn=DATE if method!='existing_content_review' else '2026-10-22'),note=note))

sd='https://www.sd.go.kr/seongsu1ga1/contents.do?key=2763'
for current,old,modern in [('성수동1가','서독도리','서뚝도리'),('성수동2가','동독도리','동뚝도리')]:
    add('성동구',current,'경기도 고양군 독도면',old,sd,'동유래 > 1914년 편제 및 1949년 서울 편입·1950년 동명 개편','1914년 편제 · 1949년 서울 편입 · 1950년 동명 전환',[old,modern],note='독도면/뚝도면·독도리/뚝도리 표기를 함께 조사. 과거 경계와 현재 법정동 전체의 일치, 개별 지번은 미검증.')

sdm='https://www.sdm.go.kr/dong/sc/we/history.do'
for current,old in [('신촌동','신촌리'),('대현동','대현리'),('봉원동','봉원리'),('창천동','창천리')]:
    add('서대문구',current,'경기도 고양군 연희면',old,sdm,'동유래 > '+current,'1914년 편제 · 1936년 경성부 편입 · 1946년 동명 전환',note='행정동 신촌동의 통합 연혁과 법정동 연혁을 구분. 구청 페이지 간 1936년 월 표기가 달라 월·일은 확정하지 않음.')
add('서대문구','연희동','경기도 고양군 연희면','연희리','https://www.sdm.go.kr/wesdm/history/donghistory.do','연희동 연혁 > 1914·1936·1946','1914년 편제 · 1936년 경성부 편입 · 1946년 개명',method='official_index_checked',note='구청 검색 색인에 연혁이 확인됨. 상세 페이지의 해당 구간 재조회는 보완 대상.')
for current,old,sub,parent in [('홍제동','홍제내리','홍제동','은평면'),('홍은동','홍제외리','홍은동','은평면'),('남가좌동','남가좌리','남가좌동','연희면'),('북가좌동','북가좌리','북가좌동','연희면')]:
    add('서대문구',current,'경기도 고양군 '+parent,old,'https://www.sdm.go.kr/wesdm/history/origin.do','동명 유래 > '+sub,'1914년 편제 · 1936년 또는 1949년 서울 편입',note='서울 편입과 리→동 개칭은 서로 다른 사건. 항목별 정확한 시행일·옛 경계는 후속 대조 대상.')

nw='https://ebook.nowon.kr/src/viewer/download.php?host=main&no=2&site=20080225_094318'
for current,old in [('하계동','하계리'),('중계동','중계리'),('상계동','상계리'),('월계동','월계리')]:
    add('노원구',current,'경기도 양주군 노해면',old,nw,'노원구 연혁 및 지역특성 > 1914년 노해면 관할리','1914년 노해면 편제 · 1963년 서울 편입',method='official_index_checked',note='공식 PDF 검색 색인 및 기존 동명유래 검토 기록을 대조. PDF 해당 면의 추가 대조·과거 경계 검증 필요.')
for current,old,url in [('서초동','서초리','https://www.seocho.go.kr/site/seocho/05/10502040200002015070810.jsp'),('방배동','방배리','https://www.seocho.go.kr/site/seocho/05/10502040500002015070810.jsp')]:
    add('서초구',current,'경기도 시흥군 신동면',old,url,current+' > 동명 및 행정 변천 첫 문단','일제강점기 신동면 편제 · 1963년 서울 편입')
for district,current,old in [('중구','을지로1가','황금정1정목'),('중구','을지로2가','황금정2정목'),('중구','을지로6가','황금정6정목'),('중구','명동1가','명치정1정목'),('중구','명동2가','명치정2정목'),('중구','충무로2가','본정2정목'),('중구','충무로4가','본정4정목'),('용산구','청파동2가','청엽정2정목'),('용산구','청파동3가','청엽정3정목'),('용산구','원효로2가','원정2정목')]:
    number=re.search(r'\d+',old).group()
    numeral={'1':'일','2':'이','3':'삼','4':'사','6':'육'}[number]
    add(district,current,'경성부',old,dictionary(current),'서울 지명사전 > '+current+' > 행정 변천','1914년 정목 편제 · 1946년 개명',[old,old.replace(number,numeral)],method='existing_content_review',note='기존 공식 원문 대조 완료 본문의 대응을 사용. 정목 숫자를 생략하거나 다른 정 이름의 일부와 일치시켜 연결하지 않음.')

assert len(aliases)==27

def matches(title,a):
    s=compact(title)
    if a['parent']=='경성부':
        return any(parent+variant in s for parent in ['경성부','경성부남부','경성부중구','경성부용산면','경성부용산구'] for variant in a['variants'])
    prefixes=[compact(a['parent'])]
    if '독도면' in a['parent']: prefixes.append(prefixes[0].replace('독도면','뚝도면'))
    return any(prefix+variant in s for prefix in prefixes for variant in a['variants'])

raw=[];ledger=[];fingerprints={}
paths=sorted(args.input_directory.glob('*-searches.json')) if args.input_directory else [args.query_receipts]
for path in paths:
    for response in json.loads(path.read_text()):
        if not response['path'].startswith('/api/records?'): continue
        d=response.get('data',{})
        ids=[r['id'] for r in d.get('items',[])]
        params=dict(parse_qsl(urlsplit(response['path']).query))
        fp=hashlib.sha256(json.dumps(ids).encode()).hexdigest() if ids else None
        duplicate=fingerprints.get((params.get('q'),fp)) if fp else None
        ledger.append(dict(query=params.get('q'),page=int(params.get('page','1')),httpStatus=response['status'],providerTotal=d.get('providerTotal'),returned=len(ids),outsideOmitted=d.get('outsideScopeCount'),unknownOmitted=d.get('unconfirmedLocationCount'),duplicateOf=duplicate,queriedAt=d.get('queriedAt')))
        if fp: fingerprints.setdefault((params.get('q'),fp),dict(query=params.get('q'),page=int(params.get('page','1'))))
        if response['status']==200:
            raw.extend((r,params.get('q'),d.get('queriedAt')) for r in d.get('items',[]))

existing=json.loads(args.existing_sources.read_text())
if isinstance(existing,dict): existing=existing['rows']
existing_urls={canonical(r['url']) for r in existing}
unique={}
for row,query,at in raw:
    if row.get('url') and canonical(row['url']) not in unique: unique[canonical(row['url'])]=(row,query,at)

def priority(record):
    title=record[0]['title']
    return (-int(bool(re.search('지도|도면|조사도',title))),-int(bool(re.search('매수|양여|학교|공설시장|건물|대부',title))),title)

records=[];rejected=collections.Counter();counts=collections.Counter()
for url,(row,query,at) in sorted(unique.items(),key=lambda x:priority(x[1])):
    title=row['title']
    if url in existing_urls: rejected['alreadyStored']+=1;continue
    if re.search('징용|명부|호적|표지|합계표|총계표|색인',title): rejected['personalOrCoverIndex']+=1;continue
    matched=[a for a in aliases if matches(title,a)]
    if not matched: rejected['noQualifiedAliasMatch']+=1;continue
    if all(counts[a['id']]>=args.per_alias for a in matched): rejected['perAliasLimit']+=1;continue
    if row['openness']!='공개': rejected['notFullyPublic']+=1;continue
    if row.get('productionYear','').isdigit() and int(row['productionYear'])>=2000: rejected['producedFrom2000']+=1;continue
    if not urlsplit(url).hostname.endswith('.archives.go.kr'): raise ValueError('Unexpected provider URL')
    record=dict(id='HPNR-'+hashlib.sha256(url.encode()).hexdigest()[:16],providerId=row['id'],title=title,url=url,productionYear=row['productionYear'],producer=row['institution'],recordType=row['recordType'],openness=row['openness'],onlineReading=row['onlineReading'],aliasIds=[a['id'] for a in matched],districts=sorted({a['district'] for a in matched}),currentDongs=sorted({a['currentDong'] for a in matched}),query=query,queriedAt=at,verification='official_api_metadata_checked',originalFileRetrieved=False,parcelVerified=False)
    records.append(record)
    for a in matched:counts[a['id']]+=1
for a in aliases:a['selectedRecordCount']=counts[a['id']]

meta=dict(id='seoul-historical-place-names-20261023',title='서울 옛 지명 추가 조사',checkedOn=DATE,aliasCount=len(aliases),districtCount=len({a['district'] for a in aliases}),queryCount=len(ledger),returnedRows=len(raw),uniqueRetrievedRecords=len(unique),selectedRecords=len(records),originalFilesRetrieved=0,parcelVerifiedRecords=0,sourceBaselineCount=len(existing),rejections=dict(rejected),note='공식 행정 연혁·지명사전을 조사 검색어와 연결하고 국가기록원 공개목록을 확인한 조사다. 기록물 원문·도면 열람 완료나 현재 필지 동일성 검증을 뜻하지 않는다. 제공기관 검색 총수는 중복·타지역·미검토 항목을 포함하므로 확보량으로 합산하지 않는다.',pagingNote='일부 서로 다른 page 요청에서 동일한 관리번호 목록이 반환됨을 관측했다. 페이지를 새 확보량으로 합산하지 않고 정규화 URL로 전수 중복 제거했다. 이후 페이지 수집은 제공기관 페이지 연계를 별도 확인해야 한다.')
bundle=dict(meta=meta,aliases=aliases,records=records,queries=ledger)
(ROOT/'data/historical-place-name-research-2026-10-23.json').write_text(json.dumps(bundle,ensure_ascii=False,indent=2)+'\n')

payload=[]
for r in records:
    aa=[a for a in aliases if a['id'] in r['aliasIds']]
    current=' · '.join(a['district']+' '+a['currentDong'] for a in aa)
    source=dict(title=r['title'],institution='국가기록원',providerId=r['providerId'],url=r['url'],kind='map' if re.search('지도|조사도',r['title']) else 'document',summary='옛 지명 추가 조사 · 현재 관련 권역: '+current+'. 국가기록원 공개목록 확인. 옛 경계·현재 지번·개별 부지 동일성 및 기록물 원문 내용은 미검증.',publicationDate='',subjectPeriod=r['productionYear'] or '생산연도 미기재',rights='unknown',rightsUrl='',rightsNote='공개목록 메타데이터를 확인했다. 개별 기록물·도면·사진의 복제·보관·재사용 이용조건은 확인하지 않았으며 파일을 저장하지 않았다.',storageAllowed=False,reuseAllowed=False,reviewStatus='metadata_checked',regionIds=sorted({a['catalogRegionId'] for a in aa}),changeNote='옛 지명과 역사적 관할을 반영한 추가 목록 조사')
    metadata={'관리번호':r['providerId'],'자료명':r['title'],'시기':r['productionYear'] or '미기재','생산기관':r['producer'],'기록물단위':r['recordType'],'공개구분':r['openness'],'온라인원문안내':r['onlineReading'],'검색어':r['query'],'대응조사ID':', '.join(r['aliasIds']),'대응근거URL':'\n'.join(sorted({a['evidence']['url'] for a in aa})),'공간관계':'자치구 목록 태그만 등록. 현재 법정동·건물·필지와의 정확한 공간 연결은 등록하지 않음.','원문확인상태':'목록 확인 · 기록물 본문/도면 미열람 · 원본 파일 미확보'}
    payload.append(dict(source=source,metadata=metadata,sourceLocator='국가기록원 OpenAPI searcharc > '+r['providerId']+' > 공개목록 메타데이터',attribution='국가기록원, '+r['title']+', 관리번호 '+r['providerId'],rightsEvidence='목록을 출처와 함께 기록. 개별 기록물 파일 이용허락을 추정하지 않음.',capturedAt=r['queriedAt']))
(ROOT/'data/historical-name-captures-2026-10-23.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n')
if args.batch_directory:
    args.batch_directory.mkdir(parents=True,exist_ok=True)
    for i in range(0,len(payload),10):
        batch={'batchId':'historical-names-20261023-'+str(i//10+1).zfill(2),'items':payload[i:i+10]}
        (args.batch_directory/('capture-'+str(i//10+1).zfill(2)+'.json')).write_text(json.dumps(batch,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'meta':meta,'aliases':[{k:a[k] for k in ['id','district','currentDong','historicalName','selectedRecordCount']} for a in aliases]},ensure_ascii=False,indent=2))
