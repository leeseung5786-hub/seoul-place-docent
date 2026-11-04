# 2026-10-22 본문 검토 12: 30개

운영 `/api/archive/task`의 계획 version 2·마지막 review/ready 기록, `data/history-maintenance-plan.json`, `docs/scheduled-history-work.md`, 직전 `docs/history-work-2026-10-22-review-11.md`를 먼저 읽었다. Sites 기존 사이트 열기 절차로 소스 `78fc34ea68199eecf1c2eda1dc4dae153d9e4fbe`를 열었다. 운영 계획과 파일의 일치, 다른 running 작업 부재를 확인하고 review/running을 저장했다. 반영 직전 자신의 checkpoint·집계·대상 30개 지문·본문/자료 버전을 다시 대조했다.

소유자 1명 전용 custom 정책 revision 1, 외부 방문자·편집자·그룹 0과 운영 version 31을 확인하고 유지했다. 최근 문헌·사진 조사자료 반영 소스를 유지했다. 기존 검토 API로 데이터만 반영했으며 애플리케이션 코드 변경·재배포는 없다.

기존 미검토 본문 30개·자료 30건 중 짧은 요약 22개 및 박물관 설명문 전사 7개를 대조 완료, 원문 접근이 실패한 요약 1개를 보류로 기록했다. 기존 보류 81개는 재적재하거나 근거 없이 완료로 올리지 않았다.

| 지표 | 이전 | 이후 |
|---|---:|---:|
| 현재 본문 | 638 | 638 |
| 최신 검토 기록이 있는 본문 | 314 | 344 |
| 원문 대조 완료 | 233 | 262 |
| 재확인 필요 | 81 | 82 |
| 아직 검토하지 않음 | 324 | 294 |
| 미완료 합계 | 405 | 376 |

## 보류·이용조건

용산구 용산2가동의 정확한 등록 URL은 직접 공개 GET 두 차례 HTTP 503이고 웹 원문 두 차례도 접근 불가였다. 이번 실행에서 여섯 검사를 실제 수행하지 못해 모두 unresolved로 남겼다. 이 관측을 삭제·폐지나 영구 장애의 증거로 보지 않는다. 기존 구릉·산림 설명이나 과거 수집 이력으로 새 대조 완료를 대신하지 않았다.

박물관 7개는 개별 상세 페이지의 공공누리 제1유형을 재확인하고 기존 KOGL1·권리 URL·보관 1·재사용 1을 보존했다. 원사진·도판·책 쪽·제3자 상표 권리를 추가 승인하거나 원사진 파일을 새 적재하지 않았다. 나머지 열람 가능한 웹 자료는 일반 Copyright·저작권정책·저작물 이용가이드와 기존 unknown·보관 0·재사용 0을 대조했다. 일반 정책 표시나 제공기관이라는 사실을 개별 복제·변형 허락으로 취급하지 않았다.

상봉동은 2025 제37회 중랑통계연보의 인쇄/PDF 318쪽(0-based 317)을 직접 추출하고 PNG 렌더링으로 확인했다. PDF 330쪽 전체 추출문에서 공공누리·저작권·copyright·이용조건·출처표시를 검색했으나 개별 이용허락은 확인하지 못했다. 기존 unknown·보관 0·재사용 0을 유지하며 PDF·추출문·렌더링은 임시 검증 뒤 제거하고 운영 파일로 저장하지 않는다. 표제 2025년·PDF 생성 메타데이터·1963년 사건·실제 확인일을 서로 구분했다.

회기동은 직접 GET 503과 별개로 정확한 등록 웹 원문의 292~300행, 하단 325~329행을 읽었다(참조 turn3view0). 직접 확보한 해시는 null로 남겼고 웹 열람을 직접 HTTP 200·파일 확보로 기록하지 않았다. 다른 공개 GET의 해시는 직접 읽은 응답 바이트 SHA-256이며 본문 일부의 해시나 독립 진위 증명은 아니다.

## 명칭·전승·공간·시기

종암동의 바위 유래, 서계동의 반석방 서쪽 추정, 누상동의 인경궁 누각설, 미아동의 미아리고개·미아사설을 제공기관의 설명·전승·추정으로 구분했다. 소공동의 경정공주 집과 도원동의 복숭아나무도 현재 부지의 실증으로 올리지 않았다. 상봉동 원문의 자연부락 나열 봉화동과 합성 설명 봉황동 표기는 둘 다 보존하고 독립 근거 없이 같은 마을이라고 추가 확정하지 않았다.

본동 검색에는 본동·본동리·본동정·중계본동 4개 문단이 함께 나오므로 동작구 본동의 첫 독립 항목만 선택했다. 다른 지역의 중계본동 문단을 혼합하지 않았다. 안암동1가·5가와 양평동3가·6가는 설명이 비슷해도 각각의 독립 표제와 분할·위치를 대조했다. 구획정리 완료일을 법정동 설치일로 옮기지 않았고 법령·환지 원장을 새로 검증한 것으로 표시하지 않았다.

용산2가동과 하수동은 기존 자치구 district_context 연결 및 district 범위를 유지했다. 전자는 행정동 용산2가동과 법정동 용산동2가·4가의 차이를 보존한 보류이며, 후자는 옛 하수동 설명의 대조 완료다. 이를 용산구·마포구 전역의 역사나 현행 개별 법정동·필지로 확대하지 않았다. 나머지도 명칭 대조를 현재 경계·건물·부지 동일성 검증으로 승격하지 않았다.

미아동의 삼양동 일대 이주 배경을 현 미아동 전체 가구의 이력으로 일반화하지 않았다. 진관동의 1973년 편입과 2007년 법정동 통합, 본문의 2017년 개발 예정 문구를 구분하고 전망을 현재 완료 실적으로 사용하지 않았다. 남현동의 1980년 신설일과 지하철 2·4호선 교통 설명을 구별했으며 노선별 개통일·개별 건물 연혁을 새로 확정하지 않았다.

## 박물관 설명문 전사

7개 개별 내용 항목은 저장 전사와 공백 정규화 후 일치했다. 잠원동 자료 시기 2008·책 2009, 합격의법학원 자료 2014·책 2015, 동원시장 자료/책 2013, 쇼핑백 변화 1998~2011·자료/책 2011, 104마을 자료/책 2012를 나누었다. 뚝섬 내용의 대상 시기 1960~70년대와 메타데이터 시기 2014·책 2015는 구분하고 2014를 원사진 촬영일로 확정하지 않았다. 군인용품 골목은 개별 시기 필드가 비어 있고 1977년 화재와 1970~80년대 표제·책 2013을 구분했다.

설명문의 현재·지금·사용하고 있다는 표현은 원자료 당시의 문맥이다. 2026년 상태로 갱신하지 않았다. 쇼핑백 항목의 장소 필드는 비어 있어 자료출처의 명동이라는 이름만으로 매장 주소를 새 연결하지 않았다. 모든 박물관 항목의 기존 빈 지역 연결을 유지했고 원사진의 도형·도로·건물·공장을 새로 판독한 것으로 표시하지 않았다.

## 운영 반영·재조회·보존 검증

기존 validatePassageReview로 입력 30개를 검증한 뒤 운영 API로 순서대로 반영했다. 쓰기 실패·리비전 충돌은 0건이다. 전체 현재 본문 638개를 전후 각각 22페이지로 읽어 ID·본문·원문 위치·자료/본문 버전·원문 URL·권리·공간 연결 지문이 모두 유지됨을 확인했다. 비대상 608개 응답은 전체 동일했다. 자료 30개의 원본 메타데이터·버전·연표·지역·파일·수집 이력도 유지됐고 자료별 검토 API에서 검토 ID·revision 1·전체 근거·상태·검토자를 대조했다. 신규 감사 이력 30개를 자료 상세에서 확인했다.

자료 상세 감사 목록은 최근 일부만 반환하므로 잘린 꼬리를 삭제로 취급하지 않았다. 기존 목록과 재조회 목록의 공통 과거 항목 및 신규 감사 30개를 확인했으며 감사 테이블 전체를 전수 열람했다고 주장하지 않는다. Sites 독립 D1 읽기는 반환된 next_offset만 따라 null까지 읽었다. 기존 검토 이력 315개의 ID·본문/자료 버전·리비전·상태·지문·검토자·시각은 유지됐고 신규 30개를 포함해 총 345개였다. 네이티브 투영의 긴 evidence·snapshot 일부는 잘리므로 신규 전체 근거·현재 상태는 운영 API로 별도 비교했다.

대조 완료 요약·접근 실패 보류·박물관 전사 각 1개를 같은 요청으로 재시도해 같은 검토 ID·revision·unchanged:true를 확인했다. 재시도 뒤 운영 집계와 독립 D1 행 수가 유지돼 중복 적재는 0건이다. 법정동 coverage의 완료 본문 집계 증가는 21개이며 그 외 법정동 필드·25개 구 집계·공식 코드 상태는 유지됐다.

자료 525건·본문 638개·자료 버전 525개·연표 21개·파일 20개·공식 현존 법정동 467개·주소 응답 일치 464개·주소 미확인 3개를 유지했다. 공식 코드의 근거는 2026-10-20 조회 스냅샷이며 법령 시행일로 바꾸지 않았다. 데이터 검토·입력 검사와 운영 재조회만 수행했으므로 새 코드 테스트·타입 검사·빌드 통과를 보고하지 않는다. 화면·주소·지도·건축물·AI 설명의 전체 검증은 계획 순서에 따른 후속 단계로 남겼다. 코드가 바뀌지 않아 운영 version 31을 재배포하지 않는다. 감사 JSON과 본 기록은 Git 소스로 동기화하고 소스 커밋·해시는 운영 checkpoint에 저장한다.

검증 시각: 2026-10-22T12:52:51.448675+00:00 (한국 2026-10-22T21:52:51.448675+09:00).
전체 근거·항목별 여섯 검사·반영/재조회 결과: `data/passage-review-observations-2026-10-22-12.json`.

## 처리한 본문


- **종암동 · 원문 대조 완료**
  - 본문 `827ccacf-f6d8-4708-b299-2ec6da533709` · 자료 `ceb355e1-3e2e-41cb-8833-625ca7f9390b` · 검토 `d0d7531f-b4ac-4b30-8b3b-694942e17c6e` / revision 1
  - 원문: https://www.sb.go.kr/www/contents.do?key=5964
  - 위치: 동명 유래 > 종암동
  - 확인: 2026-10-22T12:36:48.222037+00:00 · 범위: neighborhood · 분류: tradition
  - 판단: 종암동 문단의 북 모양 큰 바위라는 동명 설명이 선택 요약과 일치한다.

- **동산말이 있던 잠원동 일대(2008) · 원문 대조 완료**
  - 본문 `833ed24d-8fdf-4e55-8cdc-bcd854e05afe` · 자료 `a30abe6e-a1cc-4d9b-8849-0d0983a46114` · 검토 `df3c0e95-ff5b-4b32-9fc2-d803d4ab4003` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY469&fileId=H-TRNS-6162-470&fileSn=300&type=A&upperNodeId=CTGRY470
  - 위치: 상세 자료 > 내용 항목 · 『강남; 사진으로 읽다』(2009), 35쪽 / 공백 정규화 전사 대조
  - 확인: 2026-10-22T12:36:48.222978+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 개별 내용 항목과 저장 전사가 공백 정규화 후 일치한다. 잠원동 일대 전경이라는 설명문을 대조했다.

- **「합격의법학원」 게시판 · 원문 대조 완료**
  - 본문 `83fde7a3-3c8d-4949-8436-69eaa2a3fc93` · 자료 `c9df8dc3-807b-4c92-af9d-4ccc64f08e53` · 검토 `6c1a9877-8b1f-48ee-9527-85d4d1d9374a` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY446&fileId=H-TRNS-49053-450&fileSn=300&type=A&upperNodeId=CTGRY450
  - 위치: 상세 자료 > 내용 항목 · 『신림동; 대학동, 청운의 꿈을 품은 사람들』(2015), 341쪽 / 공백 정규화 전사 대조
  - 확인: 2026-10-22T12:36:48.223383+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 개별 내용 항목과 저장 전사가 공백 정규화 후 일치한다. 신림동 고시촌 법학원의 게시판이라는 설명을 대조했다.

- **상봉동 · 원문 대조 완료**
  - 본문 `84381686-fe75-4faf-b8f4-a6cc1c1224ad` · 자료 `590916c3-6fbe-447c-b0fd-0f82cd36d98d` · 검토 `a2f52fe9-5002-4f0c-ae1c-53c68dcb64f0` / revision 1
  - 원문: https://ecatalog.jungnang.go.kr/src/viewer/download.php?host=main&no=1&site=20260213_163819
  - 위치: 인쇄 318쪽 / PDF 318쪽 > 상봉동 / 추출문·렌더링 대조 (0-based 317)
  - 확인: 2026-10-22T12:39:16.923203+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 공식 통계연보 인쇄/PDF 318쪽 상봉동 문단에서 상리·봉화동/봉황동의 동명 설명과 1963년 서울 편입을 추출문 및 렌더링으로 대조했다.

- **안암동5가 · 원문 대조 완료**
  - 본문 `8499249a-7d28-46b8-b156-4c6f15378509` · 자료 `dcc99266-69b2-48f9-90da-b70e67bc4a09` · 검토 `8deb6e79-63d7-4ad5-83a8-f0786be94f2f` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%95%88%EC%95%94%EB%8F%995%EA%B0%80
  - 위치: 서울지명사전 > 법정동 > 안암동5가(安岩洞5街) > 1949년 분할 문장·말미 위치 설명 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T12:36:55.348520+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 개별 항목의 1949년 성북구 신설 때 분할 및 고려대학교를 포함한 안암동 동쪽 지역 설명이 요약과 일치한다.

- **옥인동 · 원문 대조 완료**
  - 본문 `84fe2102-7e63-4399-bc4c-66f60b5c00b8` · 자료 `ae240b4c-e337-4c60-a656-00d0e495249f` · 검토 `d7eecdfb-a4ae-447c-87e3-d0a0fcd1cea5` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%98%A5%EC%9D%B8%EB%8F%99
  - 위치: 서울 지명사전 > 법정동 > 옥인동(玉仁洞) > 동명 유래·행정 변천 문단 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T12:36:55.397230+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 옥동·인왕동의 첫 글자 합성과 옛 준수방 관련 행정 변천이 선택 요약과 일치한다.

- **용산2가동 · 재확인 필요**
  - 본문 `851f6e30-f56f-419d-ba18-20006ebb2c46` · 자료 `a5e681d2-8717-4685-baf8-840d4191f465` · 검토 `0c304957-63e3-4355-bc82-b6a35876abf1` / revision 1
  - 원문: https://www.yongsan.go.kr/dong/main/contents.do?dongCd=02&menuNo=600204
  - 위치: 동 유래 > 관할 법정동·지역 환경 / 등록 원문 접근 실패
  - 확인: 2026-10-22T12:39:49.060743+00:00 · 범위: district · 분류: unconfirmed
  - 판단: 정확한 등록 원문의 직접 공개 GET 두 차례가 HTTP 503이고 웹 원문 열람 두 차례도 접근 불가였다. 실제 본문·이용조건 대조를 수행하지 못해 보류한다.

- **1960~70년 뚝섬의 모습 · 원문 대조 완료**
  - 본문 `855661db-ee6c-4bda-ab56-224659f01b75` · 자료 `fde932ec-1bbe-452d-b61c-ef55f1c5cf02` · 검토 `d86748bc-bc71-4540-82ee-e8f4e1ed0e2e` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY378&fileId=H-TRNS-49719-384&fileSn=300&type=A&upperNodeId=CTGRY384
  - 위치: 상세 자료 > 내용 항목 · 『성수동; 장인, 천 번의 두들김』(2015), 345쪽 / 공백 정규화 전사 대조
  - 확인: 2026-10-22T12:37:00.845116+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 개별 내용 항목과 저장 전사가 공백 정규화 후 일치한다. 뚝섬의 자연부락·기반시설·공장·기동차길 설명을 대조했다.

- **장충동2가 · 원문 대조 완료**
  - 본문 `86d483c8-af72-4a2b-ba6a-4cda162cf440` · 자료 `81bff68a-80f1-4aad-a948-84e8b74ea83c` · 검토 `0493e2bb-7955-43f9-85c3-e3f018827ba0` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%9E%A5%EC%B6%A9%EB%8F%992%EA%B0%80
  - 위치: 법정동 명칭검색 «장충동2가» > 장충동2가(獎忠洞2街) > 연혁 문단 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T12:37:04.577156+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 1914년 야현동·남소문동 일부 통합에 의한 서사헌정과 1946년 장충동2가 개칭이 요약과 일치한다.

- **서계동 · 원문 대조 완료**
  - 본문 `87a3901b-b648-4085-a79b-01e088473ba9` · 자료 `b6dfa027-0fa8-4927-9d77-dd0fa69fa3c3` · 검토 `308851ae-e9a5-4ce8-b0b0-0e86d1be2b23` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%84%9C%EA%B3%84%EB%8F%99
  - 위치: 서울지명사전 > 법정동 > 서계동(西界洞) > 첫 문장·말미 1936년 및 1946년 개칭 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T12:37:08.345154+00:00 · 범위: neighborhood · 분류: inference
  - 판단: 반석방 서쪽에서 동명을 찾는 추정과 1936년 서계정·1946년 서계동 개칭이 선택 요약과 일치한다.

- **남현동 · 원문 대조 완료**
  - 본문 `87b987a6-eb07-40c9-ac45-3df768cf8bcc` · 자료 `43a0b309-a843-4f36-923c-e64407343bfb` · 검토 `85ee106b-8925-44f3-bd0e-c0fc3983c325` / revision 1
  - 원문: https://www.gwanak.go.kr/site/gwanak/12/11205010200002016051309.jsp
  - 위치: 남현동의 유래 및 연혁
  - 확인: 2026-10-22T12:37:09.324932+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 남현동의 유래 및 연혁 문단에서 1980년 4월 1일 명명·신설과 지하철 2·4호선 이후 교통 여건 설명을 대조했다.

- **누상동 · 원문 대조 완료**
  - 본문 `87ba3a0a-2efa-40b9-836f-304e6d31abcb` · 자료 `87b0c2b9-f5ca-4c0e-b253-d4245f989382` · 검토 `73b77e31-5aee-4ca1-ab37-1ff8f11cd382` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%88%84%EC%83%81%EB%8F%99
  - 위치: 서울지명사전 > 법정동 > 누상동(樓上洞) > 동명 유래·행정구역 연혁 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T12:37:13.726394+00:00 · 범위: neighborhood · 분류: inference
  - 판단: 누각동 위쪽이라는 동명 설명과 인경궁 누각설의 추정 한정이 요약과 일치한다.

- **하수동 · 원문 대조 완료**
  - 본문 `88186667-3496-4cb3-9bc2-db19beb2b45a` · 자료 `ba92c965-a182-47a2-9da6-30595b9b10a2` · 검토 `3cfff14e-0013-42ce-8a87-466d1df7954a` / revision 1
  - 원문: https://www.mapo.go.kr/site/culture/content/culture0302
  - 위치: 동이름의 유래 > 하수동
  - 확인: 2026-10-22T12:37:15.312899+00:00 · 범위: district · 분류: factual
  - 판단: 마포구 동이름의 유래에서 하수동의 한강변 아래쪽 마을이라는 설명을 대조했다. 현행 법정동 목록에 자동 대응하지 않는다는 한정을 유지한다.

- **(구) 동원시장의 오늘날 모습 · 원문 대조 완료**
  - 본문 `887c1414-18c1-484f-8f65-cc91de7e3f57` · 자료 `ed6c6da3-dcf2-44ac-81ba-7f9d88e4b815` · 검토 `023e9ef2-434e-4caa-ab49-ee1dffdd6228` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY372&fileId=H-TRNS-55318-376&fileSn=300&type=A&upperNodeId=CTGRY376
  - 위치: 상세 자료 > 내용 항목 · 『마장동; 세계 최대 축산물 단일 시장』(2013), 365쪽 / 공백 정규화 전사 대조
  - 확인: 2026-10-22T12:37:15.346476+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 개별 내용 항목과 저장 전사가 공백 정규화 후 일치한다. 마장동 축산물시장 북문 일대·새 상가 설명을 대조했다.

- **한강로2가 · 원문 대조 완료**
  - 본문 `893761b7-62cf-4b1d-8b9f-34500d8b7389` · 자료 `2e45763b-9045-4f34-99c1-0a5bb5248a9e` · 검토 `fb950486-ff02-4c75-9f56-206a1abcbc2c` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%ED%95%9C%EA%B0%95%EB%A1%9C2%EA%B0%80
  - 위치: 서울지명사전 > 법정동 > 한강로2가(漢江路2街) > 첫 문장·말미 한강통 분할과 개칭 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T12:37:19.262144+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 1943년 한강통 분할과 한강통2정목·1946년 한강로2가 개칭, 한강 길목이라는 설명이 요약과 일치한다.

- **미아동 · 원문 대조 완료**
  - 본문 `8aaa7181-b51e-497e-8c00-1d4d4e42b366` · 자료 `06f314ae-1890-4c71-aad5-b87d01e0611d` · 검토 `b71e14c4-a2e7-4ffe-8f8c-edf96e1b55c4` / revision 1
  - 원문: https://child.gangbuk.go.kr/dong/main/contents.do?dongCd=02&menuNo=600014
  - 위치: 유래 및 연혁 > 동 유래·삼양동 지역 형성
  - 확인: 2026-10-22T12:37:20.505958+00:00 · 범위: neighborhood · 분류: mixed
  - 판단: 두 동명 유래설의 불확실성·1949년 서울 편입·주택지 확대와 인구 증가 및 삼양동 일대 이주 배경이 요약과 일치한다.

- **'슈퍼마켓' 쇼핑백의 변화(1998~2011) · 원문 대조 완료**
  - 본문 `8b29d12b-c17c-4ee8-bfd8-92f3f8b5420d` · 자료 `08c06081-5ed0-48d5-bf9a-22beedca42b0` · 검토 `2453bbf4-67d4-42d0-a850-c512e2ee4d27` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY316&fileId=H-TRNS-69759-321&fileSn=300&type=A&upperNodeId=CTGRY321
  - 위치: 상세 자료 > 내용 항목 · 『명동; 공간의 형성과 변화』(2011), 388쪽 / 공백 정규화 전사 대조
  - 확인: 2026-10-22T12:37:22.938966+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 개별 내용 항목과 저장 전사가 공백 정규화 후 일치한다. 의류 브랜드의 쇼핑백 제작과 간접 홍보 설명을 대조했다.

- **본동 · 원문 대조 완료**
  - 본문 `8babb78e-ee90-427f-aeaf-b03847182cd9` · 자료 `a03d303c-2f95-41fb-8699-51bbe525b285` · 검토 `b4013125-555e-4c0f-ae07-394eba66fd33` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%B3%B8%EB%8F%99
  - 위치: 서울지명사전 > 법정동 > 본동(本洞) 항목 본문(p.txt-box) / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T12:37:24.744714+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 검색 결과 첫 번째 본동 독립 항목의 노량진 원 마을 설명과 1914년 시흥군 북면 본동리·1936년 경성부 편입이 요약과 일치한다.

- **안암동1가 · 원문 대조 완료**
  - 본문 `8bb0f34b-b21b-4b6e-8870-5ab806dbb1ab` · 자료 `51b261c9-ddda-44cf-b008-6e0f0eda4fd0` · 검토 `ea5b06e8-3aa9-408f-afa9-6fefb2dd94e2` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%95%88%EC%95%94%EB%8F%991%EA%B0%80
  - 위치: 서울지명사전 > 법정동 > 안암동1가(安岩洞1街) > 1949년 분할 문장·말미 위치 설명 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T12:37:27.323005+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 1949년 성북구 신설 때 분할 및 안암천을 경계로 한 보문동 접경·안암동 북쪽 위치가 요약과 일치한다.

- **1970~80년대 군인용품 골목 2 · 원문 대조 완료**
  - 본문 `8bd0cfa3-1b3a-49f4-88ec-ee055b4ef14c` · 자료 `8d0d74b6-e076-4748-87a0-6bafabe28983` · 검토 `5729a61e-db42-4ff6-8867-fca816cb186e` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY322&fileId=H-TRNS-47283-326&fileSn=300&type=A&upperNodeId=CTGRY326
  - 위치: 상세 자료 > 내용 항목 · 『남대문시장; 모든 물건이 모이고 흩어지는 시장백화점』(2013), 306쪽 / 공백 정규화 전사 대조
  - 확인: 2026-10-22T12:37:27.976813+00:00 · 범위: neighborhood · 분류: mixed
  - 판단: 개별 내용 항목과 저장 전사가 공백 정규화 후 일치한다. 동남상가 화재 이후 군인용품 골목 형성·특수 노점상 설명을 대조했다.

- **회기동 · 원문 대조 완료**
  - 본문 `8c31ff3b-5bc9-4f66-88c6-8d759f2bfcef` · 자료 `b1cc754a-3171-4f80-99a1-a53ec7590c7c` · 검토 `a84f514c-153d-4ae2-ac79-bf565dd2ce41` / revision 1
  - 원문: https://www.ddm.go.kr/tour/contents.do?key=2082
  - 위치: 회기동 > 회묘·회릉·지명 변화 / 웹 원문 292~300행·하단 325~329행
  - 확인: 2026-10-22T12:44:25.002595+00:00 · 범위: neighborhood · 분류: mixed
  - 판단: 정확한 등록 웹 원문에서 폐비 윤씨 회묘 유래와 1504년 회릉 승격·이름 변화·서삼릉 이장 설명을 대조했다.

- **양평동6가 · 원문 대조 완료**
  - 본문 `8c7bb01c-afe9-47e1-8494-8615f311b822` · 자료 `12fb02fa-2f05-4a9f-9a24-91205a9039c7` · 검토 `5c116a95-5e92-4337-9045-3f56a0b853b0` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%96%91%ED%8F%89%EB%8F%996%EA%B0%80
  - 위치: 법정동 분류 > 양평동6가(楊坪洞6街) > 동명 유래·행정 변천 본문 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T12:37:32.015845+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 개별 양평동6가 본문의 안양천변 둔치 일부를 양평동으로 남기고 구획정리 지역 일부를 분리한 설명이 요약과 일치한다.

- **진관동 · 원문 대조 완료**
  - 본문 `8d41986e-3344-4d1a-8a28-709bcccd74eb` · 자료 `7e3e5ceb-6d0f-4318-9cbc-3f9db603a952` · 검토 `0a6bf8e8-1780-4441-bee9-0012a00362b0` / revision 1
  - 원문: https://www.ep.go.kr/dong/contents.do?key=4420
  - 위치: 우리동이야기 > 동 유래·동 역사 > 진관동
  - 확인: 2026-10-22T12:37:34.719860+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 진관사 유래, 1973년 서울 편입과 2007년 구파발동·진관내외동의 법정동 통합이 요약과 일치한다.

- **도원동 · 원문 대조 완료**
  - 본문 `8db0cfc5-0288-42c9-92b5-dea9a2692605` · 자료 `4cb1e4fd-2a44-4f55-ae87-6395d1791d43` · 검토 `c1849faf-455f-4954-837a-192e82f31b5a` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%8F%84%EC%9B%90%EB%8F%99
  - 위치: 서울지명사전 > 법정동 > 도원동(桃園洞) > 첫 문장·말미 명칭 변경 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T12:37:37.348204+00:00 · 범위: neighborhood · 분류: mixed
  - 판단: 복숭아나무와 도산이라는 동명 설명 및 미생정을 거친 1946년 도원동 개칭이 요약과 일치한다.

- **104마을 가옥의 입구 · 원문 대조 완료**
  - 본문 `8e086549-89cf-4426-81e2-2630fc47cb4e` · 자료 `f854ec5c-c3f6-40a0-91af-cdbe6ddd3fae` · 검토 `246c8608-ec55-44ac-9e89-7249d8d6e5a4` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY410&fileId=H-TRNS-56142-412&fileSn=300&type=A&upperNodeId=CTGRY412
  - 위치: 상세 자료 > 내용 항목 · 『104마을; 중계본동 산 104번지』(2012), 101쪽 / 공백 정규화 전사 대조
  - 확인: 2026-10-22T12:37:39.677634+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 개별 내용 항목과 저장 전사가 공백 정규화 후 일치한다. 입구 옆 작은 공간의 화단 사용 설명을 대조했다.

- **동작동 · 원문 대조 완료**
  - 본문 `8e2af8a2-a664-43b7-b587-79593be2e5d4` · 자료 `e2ebd0bd-18d2-415c-a40f-17072d8fec03` · 검토 `5bd1a598-3914-4cc9-acce-3c077c6b2b65` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%8F%99%EC%9E%91%EB%8F%99
  - 위치: 서울지명사전 > 법정동 > 동작동(銅雀洞) 항목 본문(p.txt-box) / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T12:37:40.985434+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 동작진 나루에서 온 이름과 1936년 경성부 편입·1980년 동작구 소속이 선택 요약과 일치한다.

- **종로6가 · 원문 대조 완료**
  - 본문 `8e8d79e7-8f8a-42ca-80d5-773b350ff3bb` · 자료 `daf32200-5a13-43d5-b11f-90163bbc2220` · 검토 `42137857-3d2e-4751-9d54-61273ab90013` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%A2%85%EB%A1%9C6%EA%B0%80
  - 위치: 서울 지명사전 > 법정동 > 종로6가(鐘路6街) > 동명 유래·행정 변천 문단 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T12:37:41.253658+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 종로 여섯 번째 구획이라는 이름과 창선방·건덕방 일부·동학동계·동학내계 설명이 요약과 일치한다.

- **양평동3가 · 원문 대조 완료**
  - 본문 `8ed47235-db5e-453a-b108-f0eceebf650b` · 자료 `0f20a191-8f4d-44f4-a3ed-7a35174215ae` · 검토 `c0c6ac60-9320-4e88-9325-4e2c0e1a0449` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%96%91%ED%8F%89%EB%8F%993%EA%B0%80
  - 위치: 법정동 분류 > 양평동3가(楊坪洞3街) > 동명 유래·행정 변천 본문 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T12:37:43.833652+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 개별 양평동3가 원문의 둔치 일부를 양평동으로 남기고 구획정리 지역을 나눈 과정이 선택 요약과 일치한다.

- **소공동 · 원문 대조 완료**
  - 본문 `8ed81518-9675-4e88-88aa-db839619c237` · 자료 `53d68f7a-2e72-4a09-9345-ec81ef34b9f1` · 검토 `1a4b5de1-1ed9-44ee-a089-466ea14d61ec` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%86%8C%EA%B3%B5%EB%8F%99
  - 위치: 법정동 명칭검색 «소공동» > 소공동(小公洞) > 연혁 문단 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T12:37:44.081035+00:00 · 범위: neighborhood · 분류: mixed
  - 판단: 경정공주·작은공주골의 동명 설명과 장곡천정을 거친 1946년 소공동 개칭이 요약과 일치한다.

- **남산동2가 · 원문 대조 완료**
  - 본문 `8eebfa9d-7304-4a35-a533-3021a0c38cb5` · 자료 `50b646de-9611-433b-8ffa-322f5352b3a8` · 검토 `6c053c7e-deb9-427e-94cf-a7797a82d9df` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%82%A8%EC%82%B0%EB%8F%992%EA%B0%80
  - 위치: 법정동 명칭검색 «남산동2가» > 남산동2가(南山洞2街) > 연혁 문단 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T12:37:44.799358+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 1914년 남산동의 세 구역 분할·남산정2정목과 1946년 남산동2가 개칭이 요약과 일치한다.


## 다음 작업

다음 첫 미검토는 **서울지명사전 · 주교동** (`8f19a778-921b-45ce-ade9-0a259d863f44`, `법정동 명칭검색 «주교동» > 주교동(舟橋洞) > 연혁 문단 / 본문 구간 (txt-box0)`)이다.
커서는 `/api/archive/task?view=passages&unreviewed=true&limit=30&after=`를 사용한다. 미검토 294개·보류 82개·미완료 합계 376개가 남았다.
review/ready로 기록하며, 보류는 실제 원문 근거가 확보된 경우에만 해소한다. 본문 단계의 완료 기준을 충족하지 않아 보강·주소 표본·화면·전체 검증 단계로 넘어가지 않는다. 모든 계획이 완료되지 않았으므로 기존 예약을 유지한다.
