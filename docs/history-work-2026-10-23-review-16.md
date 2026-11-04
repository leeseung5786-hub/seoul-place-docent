# 2026-10-23 본문 검토 16: 30개

운영 `/api/archive/task`의 version 2 계획과 마지막 review/ready 기록, 최신 소스의 `data/history-maintenance-plan.json`, `docs/scheduled-history-work.md`, `docs/history-work-2026-10-23-review-15.md`를 먼저 읽었다. 법정동 467/467개 공식 상태 확인과 주소 관측 464개·공식 원문 단독 3개가 유지되고 다른 running 실행이 없음을 확인했다. Sites 절차로 소스를 열어 `de01abb6d6bdd0d54184aae197d9edeceae5b09b`를 확보했다. 소유자 한 명만 허용하는 custom 정책 revision 1, 외부 방문자·편집자·그룹 0, 운영 version 34를 시작 및 쓰기 직전에 확인했다.

중학동부터 미검토 30개를 선택해 review/running을 저장했다. 실제 쓰기 직전 자신의 checkpoint·운영 집계·대상 30개 전체 응답·리비전·지문이 유지됨을 재확인했다. 최근 별도 옛 지명 조사로 자료 목록은 593건이지만 본문은 기존 638개다. 이번 실행에서 그 신규 목록을 재적재하거나 기존 검토를 다시 처리하지 않았다.

| 지표 | 이전 | 이후 |
|---|---:|---:|
| 현재 본문 | 638 | 638 |
| 최신 검토가 있는 본문 | 434 | 464 |
| 원문 대조 완료 | 344 | 372 |
| 재확인 필요 | 90 | 92 |
| 아직 검토하지 않음 | 204 | 174 |
| 미완료 합계 | 294 | 266 |

## 검토 결과와 보류

28개를 원문 대조 완료, 2개를 재확인 필요로 운영 반영했다. 접속 실패만으로 보류한 항목은 없다. 사채업무상담 자료의 설명문 전사는 정확하지만 본문은 명동 사채시장을 설명하고 장소 필드는 여의동이다. 촬영지·주제지·컬렉션 분류의 차이인지 원문만으로 확정할 수 없어 conflict로 남겼다. 인의동은 원문의 성균관 아래쪽이라는 상대 위치를 기존 요약의 성균관과 동학이 있던 지역이라는 표현이 모호하게 옮겨 unconfirmed로 보류했다. 두 본문의 공간·상충 검사는 unresolved이며 ID·본문·버전·기존 빈/명의 분류를 수정하지 않았다.

## 원문 열람과 이용조건

등록된 공식 URL 29개를 직접 조회했다. 27개에서 응답 바이트·SHA-256·시각을 확보했다. 강동문화포털과 소격동 URL은 각각 직접 GET 두 차례가 503이었다. 동일 등록 URL을 웹 열람해 길동·천호동·소격동 세 본문과 이용조건을 확인했다. 길동·천호동 웹 표시는 today, 소격동은 last week 크롤링이다. 웹 열람을 직접 서버 200이나 새 원문 바이트 확보로 기록하지 않았으며 sourceHash는 null이다.

강동문화포털의 제4유형(출처표시·비상업·변경금지)과 소격동 웹 표현의 제1유형을 확인했지만 기존 unknown·보관 0·재사용 0은 바꾸지 않았다. 박물관 9개는 개별 페이지 제1유형 링크를 다시 대조했다. 지명사전과 노원구·마포구의 개별 항목 이용허락 미확인은 제한으로 보존했고 공개 열람을 원문·사진·책·영상의 추가 복제 허락으로 올리지 않았다. 전체 원문 응답과 HTML은 내부 대조용으로만 쓰고 최종 작업 자료에는 메타데이터·해시·위치·판단만 남긴다.

## 명칭·연대·공간 범위

동소문동1가·5가와 동선동5가의 행정동 분리·1963년 법정동 신설을 구분했다. 의주로2가의 1946년 개칭·1975년 관할 변경, 충무로1가·저동1가의 1914년 명명·1946년 개칭도 분리했다. 당산동4가·영등포동3가·양평동1가의 구획정리 배경을 개별 가의 정확한 신설일로 대체하지 않았다. 합동과 합정동, 영등포구 양평동과 경기도 양평군의 동명 혼동을 피했다.

원남동·길동의 복수 유래와 월계동의 어원 설명은 제공기관 유래설로 귀속했다. 천호동 풍수 예측은 실제 가구 수나 개발계획이 아니다. 서강동은 기존 gu-마포구 district_context에 따라 district 범위를 적용했으며 옛 수역을 현행 법정동·행정동의 정밀 경계로 삼지 않았다. 인의동의 공간 표현 보류와 별개로 성균관의 개별 소재지를 새로 연결하지 않았다.

저동1가 원문의 1984년 갑오개혁과 합동 원문의 1943.4.1 구제도 서술은 선택 요약에 없는 연대 오기·정정 조사 후보다. 현재 요약이 실제 다루는 1914년·1946년·1975년 사실과 분리해 기록했다. 원문의 위 연대 표기를 1894년·1943.6.10으로 임의 보정하거나 이번 대조를 해당 원문 전체의 오류 없음으로 확대하지 않았다.

박물관 설명문 전사 9개는 UTF-8로 해석한 원문의 내용 필드와 공백 정규화 후 모두 일치했다. 제목·설명 속 사건 시기와 메타데이터 시기·책 발행연도를 구분했다. 성수역 설명의 최근을 2026년 현황으로 읽지 않았고, 신문로2가 1-109번지의 2005년 준공과 1-105번지 옛 관사의 1993년 소실을 구별했다. 치성기의 기록 관행·원인 해석, 관사의 원 거주자 인터뷰, 한성부 거주 계층 서술도 전사·해석과 독립 사료 검증을 구분했다. 사진·도면 원파일이나 인용 책·법령·조약·인터뷰를 새로 검증·적재하지 않았다.

## 운영 검증과 보존

기존 validatePassageReview로 입력 30개를 검증하고 운영 API로 순서대로 저장했다. 저장 오류·충돌·중복은 0건이다. 전후 현재 본문 638개의 ID·본문·위치·본문/자료 버전·URL·권리·지역 연결 지문이 동일하고 비대상 608개 전체 응답이 그대로다. 선택 자료 29개의 메타데이터·버전·연표·지역·자산·수집 이력도 동일하다. 새 검토 30개의 전체 근거·ID·revision 1·활성 상태·검토자를 자료별 검토 API와 전체 목록으로 재조회했다.

신규 감사 30건이 각각 검토 ID와 대응한다. 이전 감사 86건은 순서까지 같으며, 이번에는 응답 한도 밖으로 밀려난 항목이 없다. API에 보이지 않는 과거 전체 이력의 전수 검증으로 과장하지 않는다. 완료·보류·자치구 3개 요청 재시도는 같은 검토 ID·unchanged:true를 반환했고 집계 변화가 없다.

coverage에서 법정동 연결의 대조 완료 본문이 19개, 자치구 맥락이 1개 증가했다. 법정동 공식 상태 467개와 주소 관측 464개·단독 원문 3개는 유지됐다. 자료 593·버전 593·본문 638·연표 21·자산 20은 전후 동일하다. 애플리케이션 코드 변경이 없어 코드 테스트·타입 검사·빌드·재배포를 반복하지 않았다. 실제 입력 검증과 운영 읽기·쓰기·감사·멱등성 확인을 수행했다.

## 처리 ID와 근거

- **중학동 · 원문 대조 완료**
  - 본문 `b6022b87-ff3b-4758-b4c2-32f7f83e07a6` · 자료 `6ad6718b-dd44-42f2-9a71-21c56c1a88c2` · 검토 `22d6cd95-7d1a-4ea4-be37-5ea2734eb877` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%A4%91%ED%95%99%EB%8F%99
  - 위치: 법정동 중학동(中學洞) > p.txt-box0 > 첫 문장 중학 유래·1396년 소속 문장
  - 확인: 2026-10-22T22:36:33.002154+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 중학동 독립 항목에서 중부학당인 중학 유래와 관광방·가회방 일부 연혁을 대조했다.

- **1-1000번지 일대 입체 항공사진 · 원문 대조 완료**
  - 본문 `b6137144-1b3d-4015-bc47-04fd31565093` · 자료 `67696a02-f176-43e0-8235-0210352406d9` · 검토 `6944d7b4-ece0-40e6-9836-c28aadb704e5` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY424&fileId=H-TRNS-1979-426&fileSn=300&type=A&upperNodeId=CTGRY426
  - 위치: 상세 자료 > 내용 항목 · 『안산자락, 고갯마을 북아현; 북아현의 역사, 경관, 주거』(2009), 94쪽 / 개별 내용 항목, 공백 정규화 전사 일치
  - 확인: 2026-10-22T22:36:33.002763+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 북아현동 항공사진의 박물관 개별 설명문 전사가 공백 정규화 후 일치한다.

- **의주로2가 · 원문 대조 완료**
  - 본문 `b69a2053-62d7-4814-aa98-193a2f8092ef` · 자료 `05880bc7-acc3-497d-9920-e1ed7babb9a6` · 검토 `7936432c-7c76-4e17-8350-15aeee99615e` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%9D%98%EC%A3%BC%EB%A1%9C2%EA%B0%80
  - 위치: 법정동 의주로2가(義州路2街) > p.txt-box0 > 1946.10.1·1975.10.1 문장
  - 확인: 2026-10-22T22:36:33.003190+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 의주로2가 원문 말미의 1946년 개칭·1975년 중구 관할 변경이 요약과 일치한다.

- **1970년 초 사채업무상담 모습(1972.8.5.) · 재확인 필요**
  - 본문 `b76bf83d-0379-4bae-adb5-a8d2f100fd11` · 자료 `c7a15dd4-c686-49ac-b24a-cd089d23de84` · 검토 `ed0b53e1-c46d-45d5-bd35-678181112fb0` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY489&fileId=H-TRNS-102699-493&fileSn=300&type=A&upperNodeId=CTGRY493
  - 위치: 상세 자료 > 내용 항목 · 『여의도: 방송과 금융의 중심지』(2020) / 개별 내용 항목, 공백 정규화 전사 일치
  - 확인: 2026-10-22T22:36:33.004302+00:00 · 범위: neighborhood · 분류: conflict
  - 판단: 사채업무상담 설명문 전사는 일치한다. 제목의 1972.8.5, 시기 필드 2020, 본문 명동과 장소 메타 여의동을 구분해 공간 재검토로 남겼다.

- **2호선 성수역의 스크린 도어 · 원문 대조 완료**
  - 본문 `b76e29d6-f226-4fef-a3d4-a15cb4fd6f4d` · 자료 `0ae54de3-9590-4d96-9100-67caa6c25cab` · 검토 `07398b06-21b8-4d7e-953b-0565388058e2` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY378&fileId=H-TRNS-49563-382&fileSn=300&type=A&upperNodeId=CTGRY382
  - 위치: 상세 자료 > 내용 항목 · 『성수동; 장인, 천 번의 두들김』(2015), 267쪽 / 개별 내용 항목, 공백 정규화 전사 일치
  - 확인: 2026-10-22T22:36:37.635743+00:00 · 범위: neighborhood · 분류: inference
  - 판단: 성수역 스크린 도어 개별 설명문 전사가 일치하며 수제화 기능을 보여준다는 해석을 제공기관 진술로 구분했다.

- **원남동 · 원문 대조 완료**
  - 본문 `b883be0e-dc1f-421e-bbfd-f3f41b8790a1` · 자료 `9499ae52-9df3-4fd0-9fa3-6ad6983f5567` · 검토 `11d50ecd-1624-4545-8aa3-4321b9d6fff0` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%9B%90%EB%82%A8%EB%8F%99
  - 위치: 법정동 원남동(苑南洞) > p.txt-box0 > 첫 두 문장
  - 확인: 2026-10-22T22:36:38.097801+00:00 · 범위: neighborhood · 분류: tradition
  - 판단: 원남동 첫 문단의 창경원 남쪽 설명과 함춘원 남쪽 유래설을 모두 확인하고 어느 하나를 확정하지 않았다.

- **길동 · 원문 대조 완료**
  - 본문 `b8919dce-0a95-4e2b-9a97-1e254903a1a0` · 자료 `3916bc4a-8f99-43ee-8cd8-53617baaa697` · 검토 `befb67f8-1e59-4a0c-93a0-870700f0b69a` / revision 1
  - 원문: https://www.gangdong.go.kr/web/culture/contents/gdc020_020_020
  - 위치: 지명유래 > 길동 > 유래 415~422행·옛지명 기리울 431행·제4유형 465행 (웹 열람)
  - 확인: 2026-10-22T22:39:01+00:00 · 범위: neighborhood · 분류: tradition
  - 판단: 길동 유래의 길한 곳 설명과 기리울 유래설을 웹 열람에서 함께 확인했다. 직접 GET 503과 구분하며 원문 해시는 없다.

- **1-109번지 주택 · 원문 대조 완료**
  - 본문 `b91895db-0111-427e-9103-f7ad3e9a58e8` · 자료 `af5fa797-458a-4927-b99e-1d7225da51e1` · 검토 `81ac7105-3aca-453c-99a7-631dca41934c` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY933&fileId=62f4d295-1771-4993-8516-84ab497a4eac&fileSn=265&type=A&upperNodeId=CTGRY938
  - 위치: 상세 자료 > 내용 항목 · 『신문로2가』(2020), p. 272. / 개별 내용 항목, 공백 정규화 전사 일치
  - 확인: 2026-10-22T22:36:39.721444+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 신문로2가 1-109번지 주택의 개별 설명문 전사가 일치하고 2005년 준공·2020년 자료 시기를 구분했다.

- **안암동4가 · 원문 대조 완료**
  - 본문 `b932596d-a2b8-4011-8f40-14070045d9c7` · 자료 `2ddfd6cb-c126-487b-a9a6-adab665aad3f` · 검토 `c16f2ecf-9315-4e3f-b038-d93ad34b4e2b` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%95%88%EC%95%94%EB%8F%994%EA%B0%80
  - 위치: 법정동 안암동4가(安岩洞4街) > p.txt-box0 > 1949.8.13 문장·마지막 위치 문장
  - 확인: 2026-10-22T22:36:40.293294+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 안암동4가 원문에서 1949년 성북구 신설 때의 분할과 안암천·안암로 사이 남쪽 위치를 대조했다.

- **『치성기(致誠記)』 표지 (1965) · 원문 대조 완료**
  - 본문 `b9454aa8-942f-4e1a-90c6-11ce133cf7f2` · 자료 `ad1de572-606a-422e-b75a-b9b3ee9338f0` · 검토 `7314ca0b-89eb-4772-8e11-34df636542ee` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY344&fileId=H-TRNS-4220-351&fileSn=300&type=A&upperNodeId=CTGRY351
  - 위치: 상세 자료 > 내용 항목 · 『보광동 사람들, 보광동』(2008), 1권, 183쪽 / 개별 내용 항목, 공백 정규화 전사 일치
  - 확인: 2026-10-22T22:36:41.425049+00:00 · 범위: neighborhood · 분류: mixed
  - 판단: 치성기 표지 설명문의 전사는 일치하며 1965년 표지·1994년 이후 기록 변화·2008년 책을 구별했다.

- **동소문동5가 · 원문 대조 완료**
  - 본문 `b9c6eb4a-9c4c-4a9a-a8a6-ff022b034985` · 자료 `aecf1dd0-0854-4341-b22d-735e19d44a6a` · 검토 `4ac021c0-68f2-4007-9f48-9f16980f8024` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%8F%99%EC%86%8C%EB%AC%B8%EB%8F%995%EA%B0%80
  - 위치: 법정동 동소문동5가(東小門洞5街) > p.txt-box0 > 1963.1.1·마지막 신설 위치 문장
  - 확인: 2026-10-22T22:36:42.105278+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 동소문동5가 말미에서 1963년 법정동 신설과 동소문동3가 동쪽 구분을 확인했다.

- **소격동 · 원문 대조 완료**
  - 본문 `b9ea174a-db28-40ff-b933-ebe4a09c51dc` · 자료 `d1e2833c-cf29-4002-aba2-2b24021ff8a4` · 검토 `0e2fdf7f-27ea-499a-92dc-fa9127947d6b` / revision 1
  - 원문: https://culture.jongno.go.kr/media/ko/bbs/44/detail.do?pstSn=167
  - 위치: 상세정보 > (1) 동 유래 및 변천 101~109행 (특히 102·106행)·제1유형 118~120행 (웹 열람)
  - 확인: 2026-10-22T22:39:01+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 소격동 웹 원문의 소격서 명명 배경과 1914년 소격동·화개동·대안동 일부 병합을 대조했다. 직접 GET 503은 별도로 기록한다.

- **월계동 · 원문 대조 완료**
  - 본문 `ba4f21ba-639d-42c1-9fdb-ac8b31e75d05` · 자료 `670f5041-cf69-4599-aba7-a002966f3fd3` · 검토 `91ea74b6-226e-4aaa-b901-9f975639d50e` / revision 1
  - 원문: https://www.nowon.kr/www/intrcn/intrcn1/intrcn1_05.jsp
  - 위치: 노원역사 > 동명유래 > 월계동 첫 문단 (웹 표현 735~739행과 직접 원문 대조)
  - 확인: 2026-10-22T22:36:43.658647+00:00 · 범위: neighborhood · 분류: tradition
  - 판단: 월계동 개별 문단의 하천에 둘러싸인 반달 모양과 물에 비친 달의 명명 설명을 대조했다.

- **천호동 · 원문 대조 완료**
  - 본문 `ba8ef784-6a4e-47b2-a0e9-0c48c1209bbe` · 자료 `3916bc4a-8f99-43ee-8cd8-53617baaa697` · 검토 `75f4573f-1f0a-47c9-9f53-9ad1c6a7c7b7` / revision 1
  - 원문: https://www.gangdong.go.kr/web/culture/contents/gdc020_020_020
  - 위치: 지명유래 > 천호동 > 유래 374~380행·옛지명 곡교리 387행·제4유형 465행 (웹 열람)
  - 확인: 2026-10-22T22:39:01+00:00 · 범위: neighborhood · 분류: mixed
  - 판단: 천호동 원문 웹 열람에서 1963년 곡교리 개칭 설명과 풍수지리설을 구분해 확인했다.

- **동선동5가 · 원문 대조 완료**
  - 본문 `baa28fe3-2860-4733-b4ed-2118adc78314` · 자료 `a2c800a0-c4be-4ab3-a70e-78df671f8fc8` · 검토 `1cbe54c9-963c-4c7a-982e-9c4ca8e89479` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%8F%99%EC%84%A0%EB%8F%995%EA%B0%80
  - 위치: 법정동 동선동5가(東仙洞5街) > p.txt-box0 > 1949년 분리·말미 1963.1.1 신설
  - 확인: 2026-10-22T22:36:44.941092+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 동선동5가 항목의 1949년 돈암동 분리와 1963년 법정동 신설 설명을 대조했다.

- **당산동4가 · 원문 대조 완료**
  - 본문 `bb8b2523-39aa-4c6f-ba39-e790065b223f` · 자료 `fec2a430-e731-4cd1-b9a0-c0db540eb013` · 검토 `65c139f2-571c-4c6d-9abb-b36705289bb0` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%8B%B9%EC%82%B0%EB%8F%994%EA%B0%80
  - 위치: 법정동 당산동4가(堂山洞4街) > p.txt-box0 > 구획정리·광복과 6·25전쟁 이후 분리 문장
  - 확인: 2026-10-22T22:36:49.706645+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 당산동4가 개별 원문에서 토지구획정리·전후 인구 증가에 따른 분리 설명을 확인했다.

- **1895년 개화기 한성부 행정구역 · 원문 대조 완료**
  - 본문 `bc1cac4b-2038-434b-afd6-46e4790d3227` · 자료 `addec937-391d-4458-838e-8483d02e96fa` · 검토 `279c76ba-195a-4021-862a-5f6b1311d4e4` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY333&fileId=H-TRNS-71083-334&fileSn=300&type=A&upperNodeId=CTGRY334
  - 위치: 상세 자료 > 내용 항목 · 『인현동; 세상을 찍어내는 인쇄골목』(2016), 52쪽 / 개별 내용 항목, 공백 정규화 전사 일치
  - 확인: 2026-10-22T22:36:49.748499+00:00 · 범위: neighborhood · 분류: mixed
  - 판단: 1895년 한성부 행정구역의 박물관 설명문 전사가 일치한다. 19세기 사건과 2015년 시기 필드·2016년 책을 구별했다.

- **충무로1가 · 원문 대조 완료**
  - 본문 `bc486eb4-20f1-4cc6-b09a-81bc0d65147d` · 자료 `4be6904b-e119-48db-be0a-de678b4ca679` · 검토 `8e602821-98dd-4806-9315-0e0c55115136` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%B6%A9%EB%AC%B4%EB%A1%9C1%EA%B0%80
  - 위치: 법정동 충무로1가(忠武路1街) > p.txt-box0 > 1914.4.1 병합·1946.10.1 개칭 문장
  - 확인: 2026-10-22T22:36:51.239410+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 충무로1가 원문의 1914년 일부 지역 병합·본정1정목 명명과 1946년 개칭을 대조했다.

- **동소문동1가 · 원문 대조 완료**
  - 본문 `bc4fbbe8-4945-4461-8fdc-0f985f5107d3` · 자료 `c6b5c5bb-5564-48c8-aeb3-69f6eeb75369` · 검토 `71bd31db-03eb-4fce-b3fc-faa417860c22` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%8F%99%EC%86%8C%EB%AC%B8%EB%8F%991%EA%B0%80
  - 위치: 법정동 동소문동1가(東小門洞1街) > p.txt-box0 > 마지막 1963.1.1·미아로 북쪽과 서쪽 문장
  - 확인: 2026-10-22T22:36:52.058631+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 동소문동1가 말미의 1963년 법정동 신설과 미아로 북쪽·서쪽 구분을 대조했다.

- **남학동 · 원문 대조 완료**
  - 본문 `bd9a38dc-bdbd-4e32-8692-7b8a8592ba56` · 자료 `812d2371-2bbf-4900-8d80-07a6997a3661` · 검토 `da5ed376-7db8-4cad-8046-9a2b9e379117` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%82%A8%ED%95%99%EB%8F%99
  - 위치: 법정동 남학동(南學洞) > p.txt-box0 > 첫 문장·1914년 및 1946년 명칭 변천
  - 확인: 2026-10-22T22:36:52.489909+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 남학동 항목의 남부학당 명명 배경·일지출정과 1946년 개칭을 대조했다.

- **'자수마을' 공장 간판 · 원문 대조 완료**
  - 본문 `bdf0ed29-1f6d-44db-9310-0f1b713d00c4` · 자료 `b09f67ac-ec91-4aa6-babe-a2e010acf50e` · 검토 `2bce2fe0-a618-42fe-94c3-2b2fb03e43e2` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY293&fileId=H-TRNS-3001-295&fileSn=300&type=A&upperNodeId=CTGRY295
  - 위치: 상세 자료 > 내용 항목 · 『창신동; 공간과 일상』(2011), 158쪽 / 개별 내용 항목, 공백 정규화 전사 일치
  - 확인: 2026-10-22T22:36:52.943113+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 자수마을 공장 간판의 박물관 설명문 전사가 일치하며 당시 특수재봉 분업 설명으로 한정했다.

- **저동1가 · 원문 대조 완료**
  - 본문 `be139541-d853-4218-bb59-2842266a632a` · 자료 `f54099cc-62f0-4484-aa36-aebbe379f184` · 검토 `bf44c1a7-a832-4c3e-b8ce-8392f54ef199` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%A0%80%EB%8F%991%EA%B0%80
  - 위치: 법정동 저동1가(苧洞1街) > p.txt-box0 > 1914년·영락 합성·1946년 문장; 앞선 갑오개혁 연대 표기는 별도 주의
  - 확인: 2026-10-22T22:36:53.464936+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 저동1가의 1914년 영락정1정목 명명·영희전과 장악원 합성·1946년 개칭이 요약과 일치한다. 원문 별도 연대 오기 후보는 주의사항으로 남겼다.

- **1-105번지 소재 관사 해방 후 사용 상황 · 원문 대조 완료**
  - 본문 `be330d3e-7130-4910-8802-1d500f706323` · 자료 `fb2f6a5f-f1ae-4cb4-9ed3-95980ed8c89b` · 검토 `539ab6a3-013d-4058-9a2f-3569a0206f4c` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY933&fileId=4086f6ee-ae4f-406d-9f9d-81d9666433b3&fileSn=276&type=A&upperNodeId=CTGRY937
  - 위치: 상세 자료 > 내용 항목 · 『신문로2가』(2020), p. 201. / 개별 내용 항목, 공백 정규화 전사 일치
  - 확인: 2026-10-22T22:36:54.847639+00:00 · 범위: neighborhood · 분류: mixed
  - 판단: 신문로2가 1-105번지 관사 해방 후 사용 설명문의 전사는 일치하며 1993년 소실·인터뷰 근거를 구별했다.

- **청운동 · 원문 대조 완료**
  - 본문 `be58cbe1-b5b3-43ac-9154-5293f64a0859` · 자료 `2e5db78d-f0cb-4594-b2d9-7c278968e3ce` · 검토 `1def22ed-b416-4459-92ef-fabfd135a04a` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%B2%AD%EC%9A%B4%EB%8F%99
  - 위치: 법정동 청운동(淸雲洞) > p.txt-box0 > 첫 문장·1396년 순화방 문장
  - 확인: 2026-10-22T22:36:54.994184+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 청운동 첫 문장의 청풍계·백운동 합성명과 북부 순화방 연혁을 대조했다.

- **2층 병원 및 서비스시설 복도 · 원문 대조 완료**
  - 본문 `bf31c421-9aed-4ce2-aa80-453c23bee303` · 자료 `8cfc8d14-656c-41d2-9318-b07265a7d1dc` · 검토 `c50c2dad-7d90-4601-80df-441e975d9af9` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY475&fileId=H-TRNS-85656-477&fileSn=300&type=A&upperNodeId=CTGRY477
  - 위치: 상세 자료 > 내용 항목 · 『대치동; 사교육 1번지』(2018), 143쪽 / 개별 내용 항목, 공백 정규화 전사 일치
  - 확인: 2026-10-22T22:36:55.071523+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 대치동 은마종합상가 2층 복도의 개별 설명문 전사가 일치하고 현재 입점 상태와 구별했다.

- **영등포동3가 · 원문 대조 완료**
  - 본문 `c0a9fcf7-0a1b-4588-b3ce-ac37af8eba94` · 자료 `cef7d92b-e692-4936-ada3-accdd095c47c` · 검토 `51e60ea2-b1a6-4087-b1b6-2af52bdee406` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%98%81%EB%93%B1%ED%8F%AC%EB%8F%993%EA%B0%80
  - 위치: 법정동 영등포동3가(永登浦洞3街) > p.txt-box0 > 표제·말미 경부선 북쪽 분리 문장
  - 확인: 2026-10-22T22:36:56.393279+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 영등포동3가 원문의 경부선 북쪽 구획정리 지역 분리 설명과 분할 시기 유보를 확인했다.

- **합동 · 원문 대조 완료**
  - 본문 `c0e1720c-74ae-4a80-b773-408e71e2733f` · 자료 `592f656c-26e4-4672-bfe6-5c060db630ce` · 검토 `d05167f5-4cf9-4857-8a4a-d11a6b02282b` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%ED%95%A9%EB%8F%99
  - 위치: 법정동 합동(蛤洞) > p.txt-box0 > 첫 어원·1914.4.1·말미 1975.10.1 문장; 미인용 1943년 날짜는 별도 주의
  - 확인: 2026-10-22T22:36:56.538463+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 합동의 조개전 어원·1914년 병합·1975년 중림동 일부 편입이 요약과 일치한다. 원문 미인용 1943년 표기는 별도 주의사항으로 남겼다.

- **인의동 · 재확인 필요**
  - 본문 `c186869d-595a-4e53-84c9-e28e10dddf78` · 자료 `ac0a06e1-9b4e-44e8-b2fc-2ff848d03634` · 검토 `6113b239-0dd2-461e-ac3b-8e8a84db12be` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%9D%B8%EC%9D%98%EB%8F%99
  - 위치: 법정동 인의동(仁義洞) > p.txt-box0 > 첫 문장 성균관 아래쪽·동학·인의 명명 관계
  - 확인: 2026-10-22T22:36:57.384131+00:00 · 범위: neighborhood · 분류: unconfirmed
  - 판단: 원문은 성균관 아래쪽에 있고 동학이 있었다는 위치 관계다. 기존 요약의 성균관과 동학이 있던 지역이라는 표현은 두 시설이 인의동 안에 있었다고 읽힐 여지가 있어 보류한다. 후속 교정은 성균관 아래쪽·동학 존재를 구별하고 기존 버전·감사를 갖춘 수정 절차로 처리해야 한다.

- **서강동 · 원문 대조 완료**
  - 본문 `c18cd820-6948-4ad3-b680-74f9853cbaa5` · 자료 `ba92c965-a182-47a2-9da6-30595b9b10a2` · 검토 `0568d84d-890c-4629-b4c1-65a3d6e63de3` / revision 1
  - 원문: https://www.mapo.go.kr/site/culture/content/culture0302
  - 위치: 동이름의 유래 > 중부 > 서강동 > 첫 문단 (마포나루~양화나루·서강/서호)
  - 확인: 2026-10-22T22:36:57.387578+00:00 · 범위: district · 분류: factual
  - 판단: 마포구 원문의 서강동 개별 문단에서 마포나루~양화나루의 서강·서호 명칭을 확인했다. 기존 자치구 맥락만 보존했다.

- **양평동1가 · 원문 대조 완료**
  - 본문 `c208518b-47f8-461b-9152-7a0623b63c72` · 자료 `cc375c43-f484-44a4-a2bc-6dd707129fb6` · 검토 `0ab32b95-1ed3-4a39-b725-4fcdd2b37f29` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%96%91%ED%8F%89%EB%8F%991%EA%B0%80
  - 위치: 법정동 양평동1가(楊坪洞1街) > p.txt-box0 > 후반 1955년 안양천 동쪽 둔치 잔존·남쪽부터 분할 문장
  - 확인: 2026-10-22T22:36:57.502399+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 양평동1가 독립 항목에서 안양천 동쪽 둔치 일부를 남기고 남쪽부터 법정동을 분할한 설명을 대조했다.

## 다음 작업

다음 첫 미검토는 **쌍림동** (`c222a5f8-fde9-4154-a8c4-daa8a3dc9985`, `법정동 명칭검색 «쌍림동» > 쌍림동(雙林洞) > 연혁 문단 / 본문 구간 (txt-box0)`)다. 다음 커서는 `/api/archive/task?view=passages&unreviewed=true&limit=30&after=`다. 미검토 174개·보류 92개·미완료 합계 266개이므로 review/ready로 기록하고 다음 단계로 이동하지 않는다. 전체 계획 완료 기준 미달이므로 기존 예약을 유지한다. 처리 ID·전후 지표·근거·실패 사유·다음 항목은 JSON 작업 자료와 운영 checkpoint에 함께 남긴다.
