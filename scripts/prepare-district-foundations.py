"""Prepare the fifth official-source corpus from manually checked passages.

Usage: python scripts/prepare-district-foundations.py /absolute/research-cache
The cache contains temporary research HTML/PDF/HWP; originals are not deployed.
Web-only and search-index evidence are explicitly distinguished from direct downloads.
"""
from pathlib import Path
from lxml import html
from datetime import datetime, timezone
import json, sys, hashlib, re

ROOT=Path(__file__).resolve().parents[1]
CACHE=Path(sys.argv[1])
MASTER={g['name']:g['dongs'] for g in json.loads((ROOT/'data/seoul-regions.json').read_text())['districts']}
ROWS=[]
UNKNOWN='개별 원문의 복제·변형 이용허락 미확인. 원문과 파일의 보관·재사용 허용은 설정하지 않으며 별도로 작성한 짧은 사실 요약만 등록. AI 작성만으로 원자료의 권리가 없어지는 것으로 취급하지 않음.'
CHECKED='2026-10-17'

def add(key,gu,title,url,sections,notes='',method='html',kind='web',rights='unknown',upstream=''):
    raw=None;body=''
    if method=='html':
        raw=(CACHE/(key+'.html')).read_bytes()
        doc=html.fromstring(raw.decode('utf-8'))
        for x in doc.xpath('//script|//style'):x.drop_tree()
        specific=doc.xpath('//*[@id="contentDiv"]')
        body=' '.join((specific[0] if specific else doc).text_content().split())
        verification='공식 페이지 직접 조회 · HTML SHA-256 기록'
    elif method in ['pdf','hwp']:
        raw=(CACHE/(key+('.pdf' if method=='pdf' else '.bin'))).read_bytes()
        body=(CACHE/(key+('-origins.txt' if method=='pdf' else '.txt'))).read_text()
        verification=('공식 PDF 직접 내려받아 인쇄 쪽수·PDF 페이지 대조, 해당 2쪽 렌더링 확인' if method=='pdf' else '공식 메뉴의 첨부 HWP 직접 조회 · BodyText 문단 추출 · 파일 SHA-256 기록')
    else:
        verification=('공식 상세 페이지 웹 열람 도구에서 본문 확인 · 원본 HTML 미확보, 지문 미기록' if method=='web' else '공식 페이지의 검색 색인 본문에서 항목별 내용 확인 · 직접 원문 조회 502, 원본 HTML 미확보 · 재조회 필요')
    prepared=[]
    for entry in sections:
        label,text,locator=entry[:3]
        anchor=entry[3] if len(entry)>3 else label
        quoted=len(entry)>4 and entry[4]=='quotation'
        if body:assert re.sub(r'\s','',anchor) in re.sub(r'\s','',body),(key,label,anchor)
        if quoted:assert rights=='KOGL1' and len(text.split())<=25,(key,'quote rights/length')
        exact=label in MASTER[gu]
        prepared.append({'text':text,'locator':locator,'textKind':'quotation' if quoted else 'paraphrase','regionIds':['dong-'+gu+'-'+label] if exact else ['gu-'+gu],'regionLabel':label,'relation':'exact_name' if exact else 'district_context','basis':('공식자료 본문의 '+anchor+' 표기와 해당 구의 법정동 명칭을 대조. 명칭 기준 지역 분류이며 경계·필지·건물 동일성은 미검증.' if exact else '여러 법정동의 공통 설명 또는 옛 지명·행정동·주변 맥락. 세부 법정동으로 자동 확대하지 않음.')})
    note=('2026-10-17 개별 상세 페이지 하단의 공공누리 제1유형 출처표시 문구 확인. 제공기관과 원전·원문 URL을 표시하며 짧은 발췌의 출처를 보존함. 내용 검토는 별도 대기.' if rights=='KOGL1' else UNKNOWN)
    timestamp=datetime.fromtimestamp((CACHE/(key+('.html' if method=='html' else '.pdf' if method=='pdf' else '.bin'))).stat().st_mtime,timezone.utc).isoformat() if raw else datetime.now(timezone.utc).isoformat()
    ROWS.append({'source':{'title':title,'institution':gu+'청','providerId':'','url':url,'kind':kind,'summary':gu+' 공식자료의 원문 위치를 지정한 지역사 구간 '+str(len(prepared))+'개. 내용 검토와 개별 주소 연결은 미완료.','publicationDate':'','subjectPeriod':'여러 시기 · 지명·마을·교통·행정 변화','rights':rights,'rightsUrl':url if rights=='KOGL1' else '', 'rightsNote':note,'storageAllowed':rights=='KOGL1','reuseAllowed':rights=='KOGL1','reviewStatus':'needs_review','regionIds':['gu-'+gu]},'metadata':{'원문표제':title,'제공기관':gu+'청','확인방법':verification,'원문위치목록':' / '.join(x['locator'] for x in prepared),'자료성격':'짧은 사실 요약'+(' 및 이용조건 확인 원문 발췌' if any(x['textKind']=='quotation' for x in prepared) else ''),'시기':'','인용원전':upstream,'원전대조상태':'추가 검토 대기','내용검토주의':notes or '전승·추정은 확정하지 않음. 원문의 현재·과거 시설 목록을 현재 정보로 전환하지 않음. 원문의 주소와 개별 검색 주소의 일치 미검증.','파일보관':'조사용 임시 파일은 배포·운영 파일 저장소에 포함하지 않음. 원본 파일 보관 건수 증가로 집계하지 않음.'},'description':'','sections':prepared,'sourceLocator':prepared[0]['locator'],'attribution':gu+'청 · '+title+' · '+url+' · '+CHECKED+' 확인'+(' · 원전 '+upstream if upstream else '')+(' · 공공누리 제1유형' if rights=='KOGL1' else '')+' · 요약과 원문 발췌 구분','rightsEvidence':note,'capturedAt':timestamp,'pageHash':hashlib.sha256(raw).hexdigest() if raw else ''})

# All Dongjak URLs below were observed in the official origin-page tabs.
dj={
'노량진동':('dongjak-origin','200752','노들나루를 통한 용산·수원 방면 이동을 지역 형성의 배경으로 설명한다. 독막은 옹기를 만들고 나루로 운반하던 마을로 소개한다.','노량진동 > 첫 문단·독막(점말)','노들나루'),
'상도동':('dj-상도동','200753','상도리와 성도화리라는 옛 마을을 소개한다. 상투굴·성대굴·살피재·빈수골의 어원은 구전 이야기로 구분한다.','상도동 > 첫 문단·살피재·성대굴·빈수골','성도화리'),
'흑석동':('dj-흑석동','200754','검은 돌과 관련된 지명을 설명하고, 흑석나루의 운송·정박 기능을 소개한다. 명수대는 1920년 별장과 놀이터가 조성된 곳으로 서술한다.','흑석동 > 첫 문단·흑석나루·명수대','명수대'),
'사당동':('dj-사당동','200755','사당과 관련된 이름으로 설명한다. 1914년 여러 마을을 합친 연혁과 1963년 서울 편입을 제시하며 도당터의 마을 제의를 소개한다.','사당동 > 첫 문단·도당터','1963'),
'대방동':('dj-대방동','200756','높은절이와 번댕이라는 옛 마을에서 번대방리·대방동으로 이어진 이름을 소개한다. 사찰·묘역·연못에 관한 이야기는 전승으로 다룬다.','대방동 > 첫 문단·높은절이·번댕이','높은절이'),
'신대방동':('dj-신대방동','200757','대방동에 이웃한 새 마을이라는 이름과 1970년 분동을 설명한다. 한국전쟁 이후 전쟁 미망인과 자녀를 위한 모자원 주거지가 있던 맥락을 소개한다.','신대방동 > 첫 문단·모자원','모자원')}
for name,(key,num,text,loc,anchor) in dj.items():
    add(key,'동작구','동작구 지명유래 · '+name,'https://www.dongjak.go.kr/portal/main/contents.do?menuNo='+num,[(name,text,loc,anchor)],notes='흑석나루의 왕대와 서기(태종 4년·1385), 장승배기 정조 즉위 연도 등은 대조가 필요해 요약에서 제외. 옛 청사·은행·학교의 현재 위치로 보정하지 않음. 동명과 행정동 번호는 구분.')
add('dj-동작동','동작구','동작구 지명유래 · 동작(동재기)','https://www.dongjak.go.kr/portal/main/contents.do?menuNo=201199',[
('동재기나루','서울에서 과천·수원·호남으로 이어지는 도강 교통을 설명한다. 1728년 변장 파견과 1746년 나룻배 이관을 기록하며 교량 건설 뒤 기능 약화를 소개한다.','동작(동재기) > 동재기나루·관리·교량 건설','동재기나루')],notes='원문은 동재기나루의 추정 위치와 주변 교통을 설명한다. 현 법정동 동작동의 경계·개별 필지와 일치한다고 보지 않아 구 맥락으로만 분류.')

add('junggu','중구','중구 중림동 유래 및 연혁','https://www.junggu.seoul.kr/dong/jungnim/content.do?cmsid=13732',[
('중림동','약전중동과 한림동에서 글자를 취한 이름으로 설명한다. 1946년 중림동 명칭과 1975년 중구 편입 연혁을 제시한다.','유래 및 연혁 > 첫 문단·1946년·1975년','약전중동')],upstream='서울특별시사편찬위원회, 서울지명사전(2009), 구청 페이지 재인용')
add('junggu-sindang','중구','중구 신당동 유래 및 연혁','https://www.junggu.seoul.kr/dong/sindang/content.do?cmsid=13568',[
('신당동','신령을 모신 신당과 관련된 이름으로 설명한다. 갑오개혁 때 한자 표기가 바뀌었다는 서술과 1946년 신당동 명칭을 소개한다.','유래 및 연혁 > 신당동 동명·1946년 문단','神堂')],notes='행정동 신당동 페이지의 법정동 신당동에 관한 동명 설명만 연결. 현 행정동 신당동의 경계를 법정동 전체로 해석하지 않음.',upstream='서울특별시사편찬위원회, 서울지명사전(2009), 구청 페이지 재인용')
add('junggu-hwanghak','중구','중구 황학동 유래 및 연혁','https://www.junggu.seoul.kr/dong/hwanghak/content.do?cmsid=13710',[
('황학동','논밭에 황학이 왔다는 어원을 전승으로 소개한다. 1751년 기록에 한성부 남부 두모방 신당리계로 나타난다고 설명한다.','유래 및 연혁 > 동명·1751년 문단','1751')],upstream='서울특별시사편찬위원회, 서울지명사전(2009), 구청 페이지 재인용')

# These detailed Yongsan pages were opened through the actual dong menu links.
ys='https://www.yongsan.go.kr/dong/main/contents.do?'
add('ys-namyeong','용산구','용산구 남영동 유래및연혁',ys+'dongCd=03&menuNo=600304',[
('남영동','도성 남쪽 군영과 관련된 이름으로 설명한다.','동 유래 > 남영동'),
('갈월동','칡과 도사의 이름에 관한 두 어원이 전한다. 불룩배기라는 옛 이름도 소개한다.','동 유래 > 갈월동'),
('동자동','이름의 유래는 확실하지 않으며 서계동 동쪽이라는 위치에 연결한 추정으로 소개한다.','동 유래 > 동자동')],method='web',notes='과거 주둔군을 현재 주둔 정보로 쓰지 않음. 법정동 용산동1가는 본문에 별도 설명이 없으므로 추가하지 않음.')
add('ys-huam','용산구','용산구 후암동 유래및연혁',ys+'dongCd=01&menuNo=600004',[
('후암동','두텁바위에서 이름을 설명하고 전생서와 관련된 옛 지명을 소개한다. 1946년 후암동 명칭과 1985년 도동2가 통합을 기록한다.','동 유래·동 연혁 > 두텁바위·전생서·1946년·1985년')],method='web',notes='본문의 옛 시설·도로 이름·군사기관 위치는 현재 사실로 전환하지 않음. 도동2가는 옛 지명으로만 기록.')
add('ys-yongsan2','용산구','용산구 용산2가동 유래및연혁',ys+'dongCd=02&menuNo=600204',[
('용산동2가','연혁표는 한지통·용산정2정목을 거쳐 1946년 용산동2가로 이름을 바꾼 과정을 제시한다.','동 연혁 > 1914년·1941년·1946년','용산동2가'),
('용산2가동','구릉과 산림이라는 옛 지역 환경을 설명한다. 행정동 용산2가동과 법정동 용산동2가·4가는 구분한다.','동 유래 > 관할 법정동·지역 환경','용산 2가동')],method='web',notes='행정동 관할에 용산동4가가 있다는 이유만으로 용산동2가 연혁을 용산동4가에 복제하지 않음. 연혁의 원전은 추가 대조.')
add('ys-wonhyo2','용산구','용산구 원효로2동 유래및연혁',ys+'dongCd=06&menuNo=600604',[
('원효로3가','원문은 구용산과 전자상가 형성 맥락을 소개한다. 동명 변천의 연대·명칭에는 불일치가 있어 결론을 보류한다.','동유래 > 원효로3가'),
('원효로4가','옛 용산항과 심원정·함벽정 등의 장소를 지역 배경으로 설명한다.','동유래 > 원효로4가'),
('산천동','산수정에서 광복 뒤 바뀐 이름으로 소개하며 어원은 미상이라고 밝힌다.','동유래 > 산천동'),
('청암동','암근정에서 광복 뒤 바뀐 이름으로 설명한다. 독서당과 마포장을 지역의 과거 장소로 소개한다.','동유래 > 청암동'),
('신창동','신창이라는 시설과 관련된 지명으로 설명하고 청수정에서 1946년 신창동으로 바뀐 연혁을 소개한다.','동유래 > 신창동')],method='web',notes='원효로3가의 정목·가 명칭과 1926년, 원효로4가의 1914년, 산천동의 1943·1946년 문장에 혼선이 있어 정확한 개칭 날짜는 확정하지 않음. 나열된 시설의 현재 운영 여부는 미검증.')
add('ys-hyochang','용산구','용산구 효창동 유래및연혁',ys+'dongCd=07&menuNo=600704',[
('효창동','왕실 묘역 효창원과 관련된 동네임을 설명한다. 하마비가 있어 하마비계라 부른 적이 있다는 내용을 소개한다.','동유래 > 효창원·하마비계')],method='web',notes='원문의 세자 이름 오자와 연령·승격 시점은 추가 대조가 필요해 요약에서 제외. 효창원의 옛 범위를 현재 법정동 경계로 쓰지 않음.')
add('ys-bogwang','용산구','용산구 보광동 유래및연혁',ys+'dongCd=16&menuNo=601604',[
('보광동','빨래터와 연결된 마전터, 이태원으로 이어진 장문고개라는 옛 지명을 소개한다. 1936년 경성부 편입 연혁도 제시한다.','동 유래 > 마전터·장문고개 / 동 연혁 > 1936년')],method='web',notes='보광국사와 신라 왕대에 관한 어원 설명은 원전 대조가 필요해 요약에서 제외. 인구·부군당의 현재 상태로 해석하지 않음.')

# Jongno OLD pages are retained as the actual observed canonical source URLs.
# Only five pages whose item-level KOGL1 statement was read enable original reuse.
jr={
'내자동':('187','내자시와 관련된 이름으로 설명한다. 1914년 여러 옛 마을을 합친 연혁과 벙거짓골·곡정동 등 지명을 소개한다.','내자동의 동명은 1914년 동명 제정 시 호조에 소속된 내자시가 이 지역에 있었던 데서 유래 한다.'),
'서린동':('169','옛 서린방의 이름을 이었다고 설명한다. 사기전동·백목전동·전옥동 같은 지명으로 상업과 관청의 지역 맥락을 소개한다.','서린동은 1914년 동명 제정 시 중부(中部) 8방(坊)의 하나인 서린방(瑞麟坊)의 방명을 그대로 사용한 것이다.'),
'계동':('199','제생원과 관련된 제생동·계생동의 이름 변화를 설명한다. 1914년 계동으로 줄인 배경과 1946년 명칭을 소개한다.','광복 후 1946년 서울시헌장과 미군정법령 제106호에 의해 일제식동명을 우리식으로 바꿀 때 계동이 되었다.'),
'낙원동':('189','탑골공원과 관련해 1914년 붙인 이름으로 설명한다. 탑동·탑골과 날라릿골 등 옛 지명을 소개한다.','낙원동은 1914년 동명 제정 시 고유의 지명을 따서 만든 것이 아니고 시내 중심지에 낙원이라고 할 만한 탑골공원이 있으므로 낙원동(樂園洞)이란 동명을 만든 것이다.'),
'적선동':('142','1914년 동명 제정에 앞서 있던 적선방의 이름을 이은 것으로 설명한다. 1946년 적선동으로 바뀐 연혁을 제시한다.',''),
'사간동':('172','사간원과 관련해 1946년 바꾼 이름으로 설명한다. 이전 간동·간정이라는 명칭도 소개한다.',''),
'교남동':('194','돌다리 남쪽이라는 위치에서 동명을 설명한다. 석교 주변 농산물 난전과 1975년 종로구 편입을 소개한다.',''),
'교북동':('193','돌다리 북쪽이라는 위치에서 동명을 설명한다. 모화관 앞 마을과 파발골의 교통 맥락을 소개한다.',''),
'체부동':('130','체찰사부와의 관계는 기록이 없어 확정하기 어렵다고 밝힌다. 구곡동은 굽은 골목과 관련된 옛 이름으로 소개한다.','체부동이란 동명은 1914년 동명 제정 시 갑오개혁(1894년) 이후 이곳에 있던 체부동에서 유래한다.'),
'내수동':('188','내수사와 관련된 이름으로 설명한다. 1914년 수창동, 1936년 내수정으로 이어진 연혁과 누정동·북문골 등의 옛 지명을 소개한다.',''),
'소격동':('167','제사를 맡던 관청 소격서에서 이름을 찾는다. 1914년 소격동·화개동·대안동 일부를 합친 연혁을 제시한다.','')}
for name,(num,text,quote) in jr.items():
    sections=[(name,text,'상세정보 > (1) 동 유래 및 변천 / (2) 동네 지명 유래')]
    if quote:sections.append((name,quote,'상세정보 > (1) 동 유래 및 변천 > '+('1946년 개칭 문단' if name=='계동' else '첫 문장'),name,'quotation'))
    add('jr-'+num,'종로구','종로문화플랫폼 동명유래 · '+name,'https://culture.jongno.go.kr/media/ko/bbs/44/detail.do?pstSn='+num,sections,method='web',rights='KOGL1' if quote else 'unknown',upstream='종로문화원, 종로의 역사·문화 유산(2016)',notes='구청이 제시한 위치 안내의 대표 주소를 역사적 시설의 정확한 부지로 사용하지 않음. 관광 화면의 운영시간·비용은 지역사 본문과 구분. 내수사 소속 등 기관 설명은 원전 대조 대기. 교북동 본문의 교복동 오자는 원문 메모로 남김.')

# This SD page was readable in the search index, while direct HTTP/web-open failed.
add('sd-origin','성동구','성동구 문화관광 지명유래','https://sd.go.kr/tour/contents.do?key=1926',[
('상왕십리동','왕십리의 위쪽이라는 동명과 1946년 상왕십리동 개칭을 소개한다.','지명유래 > 왕십리 1동','상왕십리동'),
('하왕십리동','왕십리의 아래쪽이라는 동명과 1946년 개칭을 소개한다.','지명유래 > 왕십리 2동','하왕십리동'),
('도선동','도선대사에 관한 어원은 전설이며 1963년 분동을 소개한다.','지명유래 > 도선동'),
('마장동','말 사육장과 관련된 이름으로 설명한다.','지명유래 > 마장동'),
('사근동','사근사와 관련된 동명으로 소개한다.','지명유래 > 사근동'),
('행당동','살구나무·은행나무에 연결한 어원을 소개한다.','지명유래 > 행당동(1·2동)'),
('응봉동','응봉산·매봉과 관련된 이름으로 설명한다.','지명유래 > 응봉동'),
('금호동','무쇠솥·농기구 주조와 무수막·수철리라는 지명을 소개한다.','지명유래 > 금호동(1·2·3·4가동)'),
('옥수동','옥정수라는 우물과 두모포라는 옛 지명을 소개한다.','지명유래 > 옥수동(1·2동)'),
('성수동','성덕정·뚝도수원지 등과 관련된 여러 어원을 전한다.','지명유래 > 성수동(1·2동)'),
('성수동1가','1914년 서독도리를 현재 성수동1가에 연결해 설명한다.','지명유래 > 성수동(1·2동) > 1914년 문단'),
('성수동2가','1914년 동독도리를 현재 성수동2가에 연결해 설명한다.','지명유래 > 성수동(1·2동) > 1914년 문단'),
('송정동','숫마장·솔마장과의 관계를 확정하지 않고 추정으로 소개한다.','지명유래 > 송정동'),
('용답동','1975년 용두동·답십리동 일부 통합에서 이름을 설명한다.','지명유래 > 용답동')],method='index',notes='검색 색인에 본문은 있으나 직접 원문 열람이 502·시간초과로 실패하여 재조회 필요. 왕십리 연대 순서·응봉동 오자·성수동 중복 항목의 표현 차이는 추가 대조. 금호동 공통 설명을 세부 가 단위로 확대하지 않음. 성수동1·2가는 원문의 동독도리·서독도리 명시적 구분만 연결.')

add('gangdong','강동구','강동문화포털 지명유래','https://www.gangdong.go.kr/web/culture/contents/gdc020_020_020',[
('강일동','하일동이라는 옛 이름과 2000년 강일동 개칭을 소개한다.','강일동 > 유래'),
('상일동','게내의 위쪽이라는 위치에서 동명을 설명한다.','상일동 > 유래'),
('명일동','여행자를 위한 명일원이라는 숙소에서 이름을 설명한다.','명일동 > 유래'),
('고덕동','이양중 전승과 고다지동의 음운 변화라는 두 설명을 제시한다.','고덕동 > 유래'),
('암사동','바위절과 관련된 이름, 나루의 상업·운송을 소개한다.','암사동 > 유래'),
('천호동','1963년 곡교리에서 천호동으로 바뀐 연혁과 풍수 전승을 소개한다.','천호동 > 유래'),
('성내동','성 안의 마을이라는 뜻과 성안말이라는 옛 이름을 소개한다.','성내동 > 유래·옛지명'),
('길동','길한 곳이라는 해석과 기리울에서 변했다는 전승을 함께 소개한다.','길동 > 유래'),
('둔촌동','일자산에 머물렀다는 이집의 호와 연결한 이름으로 설명한다.','둔촌동 > 유래')],method='web',upstream='강동구지(2002), 서울지명사전(2009)',notes='명일원 설명의 왕대와 서기(성종 11년·994)는 불일치 가능성이 있어 연도 미사용. 선사·백제·절 창건 시기와 전승은 원전 대조 대기. 성내동 설명으로 풍납토성 경계를 확정하지 않음.')

add('jungnang','중랑구','2025 제37회 중랑통계연보 · 동명 유래','https://ecatalog.jungnang.go.kr/src/viewer/download.php?host=main&no=1&site=20260213_163819',[
('면목동','목장과 관련된 이름의 변화를 전승으로 설명한다. 1949년 서울 편입을 기록한다.','인쇄 318쪽 / PDF 318쪽 > 면목동'),
('상봉동','상리와 봉화동·봉황동을 합친 지명으로 설명한다. 1963년 서울 편입을 기록한다.','인쇄 318쪽 / PDF 318쪽 > 상봉동'),
('중화동','중리·하리의 중하리에서 화목을 뜻하는 글자로 바꾼 이름이다. 1963년 편입과 개칭을 기록한다.','인쇄 318쪽 / PDF 318쪽 > 중화동'),
('묵동','먹골의 어원에는 먹 제조와 학문에 관한 두 설이 전한다. 1963년 서울 편입을 기록한다.','인쇄 319쪽 / PDF 319쪽 > 묵동'),
('망우동','망우리고개와 관련된 이름이다. 도로 확장·구획정리에 따른 주거지 변화를 설명한다.','인쇄 319쪽 / PDF 319쪽 > 망우동'),
('신내동','신현과 내곡에서 글자를 취한 이름이다. 1963년 서울 편입과 신내지구 택지개발을 설명한다.','인쇄 319쪽 / PDF 319쪽 > 신내동')],method='pdf',kind='publication',notes='자료명은 2025 통계연보이지만 발행일은 별도 확인하지 않아 비워 둠. PDF 추출 글자 일부의 깨짐은 렌더링으로 대조. 상봉동 본문에 봉화동·봉황동이 함께 나와 어느 하나로 통일하지 않음. 원본 14MB는 조사 캐시에만 두고 이용조건 확인 전 운영 파일로 올리지 않음.')

add('gangnam-gepo','강남구','개포4동 동 유래 및 연혁 · 첨부 HWP','https://www.gangnam.go.kr/file/2/get/FILE_000000000122575/download.do',[
('개포동','개포4동 연혁은 1983년 도곡동과 개포동 분동, 1988년 개포1동에서 개포4동 분동을 기록한다. 행정동 변화의 맥락으로 읽는다.','첨부 HWP BodyText > 연혁 > 1983년·1988년','개포동')],method='hwp',notes='공식 운영·현황 페이지 https://www.gangnam.go.kr/center/operate.do?mid=MC030503&office=3220060 의 유래 및 연혁 링크에서 첨부 파일을 확인. 현재 법정동 개포동 전체의 경계·모든 구간에 같은 연혁이 적용된다는 뜻은 아님. 현재 주거시설 목록·2020년 이후 내용은 요약에서 제외.')
add('gangnam-segok','강남구','세곡동복합문화센터 시설안내 · 지명 유래','https://life.gangnam.go.kr/fmcs/123',[
('율현동','밤나무·밤고개와 방죽마을에 연결한 지명을 소개한다. 1914년 밤고개와 방죽말을 합쳐 율현리로 정한 연혁을 제시한다.','지명 유래 > 율현동·밤고개·방죽마을','율현동'),
('세곡동','세천리와 은곡동의 글자를 취한 이름으로 설명한다. 1963년 서울 편입과 1970년 관할 조정을 소개한다.','지명 유래 > 세곡동 동명·1963년·1970년','세천리')],notes='자료 제공 사이트는 강남구 통합 예약·시설안내. 첫 문장의 법정동·행정동 관계 혼용과 은곡동 표기는 원전 대조 대기. 옛 지명 은곡동을 현 법정동으로 생성하지 않으며, 관할에 자곡동이 나온다는 이유로 별도 역사 본문을 복제하지 않음.')

out=ROOT/'data/district-foundations-2026-10-17.json'
out.write_text(json.dumps(ROWS,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'sources':len(ROWS),'sections':sum(len(r['sections']) for r in ROWS),'exactDongs':len({s['regionIds'][0] for r in ROWS for s in r['sections'] if s['relation']=='exact_name'}),'gu':len({r['source']['institution'] for r in ROWS}),'quotes':sum(s['textKind']=='quotation' for r in ROWS for s in r['sections']),'directFiles':sum(bool(r['pageHash']) for r in ROWS)},ensure_ascii=False))
