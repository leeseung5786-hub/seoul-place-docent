"""Prepare curated factual abstracts from the checked official pages.
No original text is emitted and no reuse permission is inferred from paraphrasing.
Input: local research cache from collect-dong-pages.py and the separately checked seed pages.
"""
from pathlib import Path
from lxml import html
import json,hashlib,datetime,sys
ROOT=Path(__file__).resolve().parents[1];C=Path(sys.argv[1]);master={g['name']:g['dongs'] for g in json.loads((ROOT/'data/seoul-regions.json').read_text())['districts']};rows=[]

def add(gu,title,url,file,summaries,locator='동명 유래',evidence=None):
 p=C/file if file else None;b=p.read_bytes() if p else None
 captured=datetime.datetime.fromtimestamp(p.stat().st_mtime,datetime.timezone.utc).isoformat() if p else datetime.datetime.now(datetime.timezone.utc).isoformat()
 if b:
  d=html.fromstring(b);[x.drop_tree() for x in d.xpath('//script|//style')];body=' '.join(d.text_content().split())
  for name in summaries:assert name in body,(gu,name,'name missing in retrieved source')
 else:body=''
 sections=[]
 for name,abstract in summaries.items():
  exact=name in master[gu];sections.append({'text':abstract,'locator':locator+' > '+name,'textKind':'paraphrase','regionIds':['dong-'+gu+'-'+name] if exact else ['gu-'+gu],'regionLabel':name,'relation':'exact_name' if exact else 'district_context','basis':('공식 본문의 지역명 '+name+' 확인. 법정동 명칭과 일치하나 경계·개별 부지 일치는 미검증.' if exact else '공식자료의 공통 동명 표기. 세부 법정동별 서술로 확대하지 않음.')})
 note='개별 자료의 원문 복제·변형 허락 미확인. 원문·이미지 보관과 재사용 허용은 설정하지 않음. 확인한 지명·연혁 사실을 짧게 새 문장으로 정리했으며, 전승·추정은 확정 사실과 구분. AI 작성만으로 원자료 이용조건이 소멸하지 않음.'
 rows.append({'source':{'title':title,'institution':gu+'청','providerId':'','url':url,'kind':'web','summary':gu+'의 동명 유래·연혁 확인 자료. 본문 '+str(len(sections))+'개를 사실 요약으로 분리했으며 원문 전사는 포함하지 않음.','publicationDate':'','subjectPeriod':'여러 시기 · 동명 유래와 지역 연혁','rights':'unknown','rightsUrl':'','rightsNote':note,'storageAllowed':False,'reuseAllowed':False,'reviewStatus':'needs_review','regionIds':['gu-'+gu]},'metadata':{'자료유형':'구청 동명 유래·지역 연혁','대상지역':gu,'확인방법':evidence or '공식 웹페이지 직접 조회 · HTML 지문 기록','시기':'','원문보관':'미허용 · 전사·이미지 미적재','작성범위':'지명·연혁의 짧은 사실 요약 · 전승은 전승으로 표기','원문대조':'추가 내용 검토 대기'},'description':'','sections':sections,'sourceLocator':locator,'attribution':gu+'청 · '+title+' · '+url+' · 2026-10-16 확인 · 원문과 별도로 작성한 사실 요약','rightsEvidence':note,'capturedAt':captured,'pageHash':hashlib.sha256(b).hexdigest() if b else ''})

add('금천구','금천구 동명의 유래','https://www.geumcheon.go.kr/portal/contents.do?key=442','geumcheon.html',{
'가산동':'가산이라는 이름은 가리봉·독산의 한 글자씩을 결합한 것이다. 1995년 금천구가 신설될 때 이전 행정동 명칭을 다시 사용했다는 설명이다.',
'독산동':'구청은 나무가 없는 산의 모습을 독산이라는 지명과 연결한다. 지명 설명과 당시의 산림 상태에 관한 해석은 원전 대조가 필요하다.',
'시흥동':'구청은 시흥의 뜻을 지역의 옛 이름인 잉벌노와 관련지어 해석한다. 옛 지명의 어원에 관한 설명으로, 현재 건물의 연혁을 뜻하지 않는다.'})
add('노원구','노원구 동명유래','https://www.nowon.kr/www/intrcn/intrcn1/intrcn1_05.jsp','nowon.html',{
'월계동':'지명은 하천으로 둘러싸인 지역의 반달 같은 모습 및 물에 비친 달과 관련된 것으로 설명된다.',
'공릉동':'공덕리와 태릉에서 각각 글자를 가져온 이름이라는 설명이다. 서울 편입 당시의 동명 협의 과정도 소개한다.',
'하계동':'한천의 하류 쪽에 놓인 데서 이름을 설명한다. 1914년에는 양주군 노해면 하계리로 편제되었다고 기록한다.',
'중계동':'한천의 중간에 자리한 위치가 이름의 배경으로 제시된다. 1914년 행정구역 개편 뒤 노해면 중계리가 되었다는 설명이다.',
'상계동':'하천 상류 쪽 여러 마을의 위치를 이름과 연결한다. 원터·간촌·당고개 등 자연마을을 함께 소개한다.'})
add('도봉구','도봉구 동명유래','https://tour.dobong.go.kr/Contents.asp?code=10001578','dobong.html',{
'쌍문동':'구청은 두 효자문 등에서 이름을 찾는 여러 전승을 소개한다. 하나의 유래로 단정하지 않는다.',
'방학동':'학과 지세에 관한 이야기, 방아골의 음을 한자로 옮겼다는 설명 등이 함께 실려 있다. 1963년 서울에 편입되었다.',
'창동':'조선시대 곡물 저장시설과 관련된 이름으로 설명된다. 창골·유만 등 자연마을이 지역 형성의 배경으로 소개된다.',
'도봉동':'도봉산에서 가져온 지명이다. 1914년 여러 마을을 합쳐 도봉리를 설치했고, 1963년 서울 편입 뒤 도봉동이 되었다는 설명이다.'})
add('성북구','성북구 동명유래','https://www.sb.go.kr/www/contents.do?key=5964','seongbuk.html',{
'성북동':'1765년 어영청 북둔 설치가 지명 설명의 근거로 제시된다.',
'삼선동':'삼선평에서 이름을 찾는다. 세 신선과 옥녀 이야기는 지명 전승으로 소개된다.',
'동선동':'1949년 지역을 나누면서 동소문·삼선의 첫 글자를 결합한 이름이다.',
'돈암동':'되너미고개와 돈암현이라는 고개 이름이 동명의 배경으로 제시된다.',
'보문동':'1949년 성북구 신설 당시 보문사의 이름을 동명으로 삼았다는 설명이다.',
'안암동':'사람들이 앉아 쉬던 큰 바위에 관한 이야기가 지명 유래로 전해진다.',
'정릉동':'신덕왕후의 정릉에서 가져온 이름이다.',
'길음동':'기리묵골이라는 골짜기 지명 및 맑은 물소리에 관한 설명을 함께 소개한다.',
'종암동':'북 모양의 큰 바위가 이름의 배경으로 제시된다.',
'월곡동':'반달 같은 산세와 달밤의 소 거래 이야기가 함께 전한다. 어느 하나로 확정하지 않는다.',
'장위동':'옛 인물 또는 산 이름에 연결하는 해석이 소개된다. 1960년경 토지 매각과 주택지 전환도 설명한다.',
'석관동':'돌곶이라는 옛 지명을 한자로 옮긴 이름으로 설명한다.'})
add('송파구','송파구 동명유래','https://www.songpa.go.kr/www/contents.do?key=2367','songpa.html',{
'가락동':'가락골과 1925년 홍수 뒤 이주에 관한 설명이 함께 전한다. 어원은 확실하지 않다고 명시한다.',
'거여동':'거암리라는 옛 이름의 변화에서 유래를 설명한다. 1963년 서울에 편입되었다.',
'마천동':'마산이라는 산 이름 및 백마에 관한 전승을 함께 소개한다.',
'문정동':'문씨 주민과 우물에 관한 이야기가 동명 유래로 전한다.',
'방이동':'병자호란 관련 전승 및 1914년 무렵 한자 표기를 바꾸었다는 이야기를 소개한다. 전승의 사실 여부는 별도 검토 대상이다.',
'삼전동':'세 밭에 관한 지명 설명과 옛 삼전도 나루의 역할을 함께 소개한다.',
'석촌동':'돌마리라는 이름에서 한자 지명이 형성되었다는 설명이다.',
'송파동':'나루 이름의 음 변화와 소나무 언덕 등 여러 유래를 소개한다.',
'신천동':'새내라는 하천 이름을 한자로 옮긴 지명이다. 1925년 홍수와 강줄기 변화도 설명한다.',
'오금동':'나무·악기 또는 인조의 피란에 연결한 여러 전승이 있다.',
'잠실동':'조선의 양잠 시설이 지명 배경이다. 1971년 물막이 공사로 섬이 육지와 이어졌다고 설명한다.',
'장지동':'길게 뻗은 마을 또는 버드나무에 연결하는 유래를 함께 전한다.',
'풍납동':'바람드리라는 옛 이름과 토성의 관계를 설명한다.'})
add('양천구','양천구 변천사 · 법정동 이름의 유래','https://archives.yangcheon.go.kr/mokdong-history/ch1-yangcheon.html','yangcheon.html',{
'목동':'목장으로 사용되던 곳이라는 설명과 함께 牧洞에서 木洞으로 표기가 달라졌으리라는 추정을 제시한다.',
'신월동':'마을의 반달 모양과 관련지어 이름을 설명하는 전승을 소개한다.',
'신정동':'신기와 은행정에서 한 글자씩을 취한 이름이다. 신트리라는 옛 마을 이름도 함께 설명한다.'},locator='양천구 동의 변화 > 법정동 이름의 유래')
add('강서구','강서구 동이름 유래','https://www.gangseo.seoul.kr/kids/kids010501',None,{
'염창동':'소금 저장시설이 지명의 배경으로 소개된다.',
'등촌동':'옛 등촌리에서 이어진 이름으로 설명된다.',
'화곡동':'벼농사가 잘되던 골짜기의 모습과 관련된 이름이다.',
'가양동':'양천현의 관아와 향교가 있던 행정 중심 지역으로 소개된다.',
'마곡동':'삼 재배 및 옛 나루 마을과 관련된 지명으로 설명된다.',
'내발산동':'밥그릇 모양에 빗댄 발산의 안쪽 마을이라는 설명이다.',
'외발산동':'같은 발산의 바깥쪽 마을을 구분한 이름으로 설명된다.',
'공항동':'송정리였던 지역에 비행장이 들어선 이후의 명칭이다.',
'방화동':'개화산 곁에 있다는 위치가 이름의 배경이다.',
'개화동':'개화산 아래 형성된 마을의 이름이다.',
'과해동':'바다로 길게 뻗은 오이 모양의 지세에 연결하는 설명이 전한다.',
'오곡동':'다섯 골짜기 사이 마을이라는 뜻으로 소개된다.',
'오쇠동':'쇠뇌 제작자 다섯 사람에 관한 전승이 실려 있다.'},evidence='공식 페이지의 검색 색인 본문 확인. 직접 조회 HTTP 502로 페이지 지문은 미기록 · 원문 재조회 필요')

guro={
'신도림동':'기존 도림리와 구분하면서 신도림이라는 이름을 사용하게 되었다. 1949년 서울 편입과 1950년 동명 변경 과정을 소개한다.',
'구로동':'아홉 노인 이야기는 지명 전승이다. 이 지역은 1949년 서울에 편입되었고 이듬해 구로동이라는 명칭을 사용했다.',
'가리봉동':'작은 봉우리 또는 갈라진 지형에서 이름을 찾는 설명이 함께 있다. 1995년 분구로 일부 지역이 금천구에 들어갔다.',
'고척동':'높은 마을인 고좌리 또는 긴 자를 이용한 물물교환에서 이름을 찾는 두 해석이 소개된다. 1963년 서울에 편입되었다.',
'개봉동':'개웅산과 매봉산의 한 글자씩을 결합한 이름으로 설명된다. 1963년 서울 편입 뒤 개봉동이라는 명칭을 사용했다.',
'오류동':'1963년 서울에 편입될 때 오류출장소의 관할 지역에 포함되었다. 출장소가 폐지된 1968년에는 영등포구가 직접 관할했다.',
'천왕동':'천왕사라는 절 아래 마을이라는 설명에서 이름을 찾는다. 1963년 서울에 편입되었다.',
'항동':'배 모양 지세에 관한 해석과 물에 관련된 전승이 소개된다. 1963년 서울에 편입되었다.',
'온수동':'따뜻한 물과 관련된 온수골이라는 옛 이름이 배경이다. 구청도 전승의 불확실성을 언급한다.',
'궁동':'정선옹주가 살았던 큰집과 관련된 이름이다. 1963년 서울 편입 뒤 오류출장소가 관할했다.'}
# Resolve only links actually captured from the official navigation.
pages=json.loads((C/'dong-pages.json').read_text())
for x in pages:
 if x['gu']=='구로구' and x['status']=='ok':add('구로구','구로구 동별역사 · '+x['name'],x['url'],Path(x['path']).name,{x['name']:guro[x['name']]},locator='연혁 및 동명의 유래')
ep={
'녹번동':('3880','녹을 나누던 고개 이야기와 푸른 광물에서 이름을 찾는 해석이 함께 소개된다. 1949년 서울에 편입되었다.'),
'불광동':('3916','북한산 자락의 사찰과 바위 풍경에 연결하는 지명 설명이다. 1914년 불광리, 1950년 불광동으로 명칭이 바뀌는 과정을 소개한다.'),
'갈현동':('3988','칡과 고개에 연결된 갈고개가 이름의 배경으로 설명된다. 구산동과의 분동 및 1989년 행정동 분리도 소개한다.'),
'구산동':('4060','거북 같은 산 모양과 인조별서유기비의 받침을 지명에 연결한다. 1914년 구산리와 1949년 서울 편입 과정을 기록한다.'),
'대조동':('4096','큰 마을과 대추나무에 연결하는 어원 설명이 함께 실려 있다. 1950년 대조동으로 이름을 고쳤다는 연혁을 제시한다.'),
'응암동':('4168','백련산의 매처럼 생긴 바위와 관련된 지명이다. 포수발·와산동 등 옛 이름과 1949년 서울 편입을 소개한다.'),
'역촌동':('4240','여행 중 말을 쉬게 하던 역이 있어 역말이라 불렸다는 설명이다. 1970년대 토지구획정리 이후 주거지 조성도 소개한다.'),
'신사동':('4276','새절과 관련된 이름으로 설명하되 절의 정확한 시기·위치는 알 수 없다고 명시한다. 옛 지도의 신사동계 표기도 근거로 든다.'),
'증산동':('4348','시루뫼라는 옛 이름을 산의 모양 또는 물 빠짐에 연결하는 이야기가 전한다. 한자 표기 변화도 전승으로 소개한다.'),
'수색동':('4384','물치·무르치라는 이름의 변화와 한자 표기에서 유래를 설명한다. 1949년 서울 편입 및 1950년 동명 변경을 소개한다.'),
'진관동':('4420','진관사에서 지명을 가져왔다. 1973년 서울 편입과 2007년 구파발동·진관내동·진관외동의 통합을 설명한다.')}
for name,(key,abstract) in ep.items():
 p=C/('ep-'+key+'.html')
 if p.exists():add('은평구','은평구 지명유래 · '+name,'https://www.ep.go.kr/dong/contents.do?key='+key,p.name,{name:abstract},locator='우리동이야기 > 동 유래·동 역사')
 else:print('SKIP',name,'not retrieved')
out=ROOT/'data/dong-history-captures-2026-10-16.json';out.write_text(json.dumps(rows,ensure_ascii=False,indent=2));report={'sources':len(rows),'sections':sum(len(x['sections']) for x in rows),'exactDongs':len({r for x in rows for s in x['sections'] if s['relation']=='exact_name' for r in s['regionIds']}),'sharedNeighborhoods':sum(s['relation']=='district_context' for x in rows for s in x['sections']),'districts':len({x['source']['institution'] for x in rows})};print(json.dumps(report,ensure_ascii=False))
