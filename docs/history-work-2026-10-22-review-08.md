# 2026-10-22 본문 검토 08: 30개

운영 `/api/archive/task` 계획 version 2·직전 review/ready 기록, `data/history-maintenance-plan.json`, `docs/scheduled-history-work.md`, 직전 검토 07의 다음 커서를 먼저 읽었다. 현재 소스 `4c5d81825d50531c232d6ea629d89940107bdbb7`를 Sites 절차로 열고 계획 일치·다른 running 작업 부재를 확인했다. review/running 저장 후 반영 직전 checkpoint·계획·집계·30개 대상의 지문을 다시 대조했다.

소유자 1명 전용 custom 정책 revision 1, 편집자·그룹·외부 방문자 0과 운영 version 24를 확인했다. 새로 발급한 서비스 접근을 사용했고 기존 공개 범위는 유지했다. 확인 시각은 실제 UTC ISO이며 한국 날짜는 2026-10-22다.

미검토 본문 30개·자료 26건을 처리했다. 요약 25개와 박물관 설명문 전사 2개를 대조 완료로, 인용 1개와 요약 2개를 보류로 기록했다. 기존 보류 63개를 재처리하거나 완료로 올리지 않았다.

| 지표 | 이전 | 이후 |
|---|---:|---:|
| 현재 본문 | 638 | 638 |
| 최신 검토 기록이 있는 본문 | 194 | 224 |
| 원문 대조 완료 | 131 | 158 |
| 재확인 필요 | 63 | 66 |
| 아직 검토하지 않음 | 444 | 414 |
| 미완료 합계 | 507 | 480 |

## 보류와 접근 결과

체부동 인용은 정확한 등록 URL의 직접 공개 GET 두 차례가 503, 웹 열람도 502였다. 저장 인용문이나 기존 KOGL1만으로 완료 처리하지 않았다. 기존 권리·보관·재사용 값도 그대로 두었다.

휘경동은 원문을 웹에서 읽어 휘경원 동명 설명을 대조했지만 원문이 연결하는 여러 왕실 묘역의 연대·명칭을 독립 원문으로 해소하지 못했다. 저장 요약의 추가 대조 한정을 보존하고 chronology·consistency를 unresolved로 남겼다. 원문 오류라고 단정하지 않았다.

영등포동2가는 구획정리된 경부선 북쪽 일부의 분리를 원문에서 확인했지만 저장 요약의 경부선 남쪽 영등포동 대비가 명시되지 않는다. 독립 공간 근거가 없어 spatial·consistency를 unresolved로 남겼다. 첫 문장의 영등포2가동과 제목·말미 영등포동2가 표기도 구분하고 기존 공식 명칭·ID·본문을 유지했다.

청량리동·전농동·장안동·휘경동·계동의 직접 GET은 503이었으나 정확한 등록 URL의 웹 원문에서 내용을 읽었다. 직접 파일을 확보하지 못해 sourceHash:null이며 웹 열람 참조·정확한 행·확인일을 근거에 남겼다. 계동 후속 웹 요청은 실패했지만 최초 반환 원문의 (1)·(2)와 이용조건은 실제 확인했다. 접속 실패와 내용 보류를 구분했다.

## 명칭·연대·전승·공간 범위

을지로2가·충무로4가·필동2가·광희동1가 등은 개별 표제의 1914년 병합·1946년 개칭을 나누었다. 예장동은 선택 요약의 무예장·개칭에 한정하고 원문 속 왜성대의 복수 유래설을 추가 확정하지 않았다. 산림동은 글자만 보고 숲으로 해석하지 않고 하천변 자연마을 설명을 유지했다.

번동의 오얏나무·벌리사, 현석동의 박세채 호·검은 돌, 장안동의 두 어원, 노유동의 누런산·노룬산 이야기는 전승 또는 복수 설명으로 보존했다. 번1동 사이트의 공통 번동 연혁을 법정동 전체와 행정동 경계의 동일성으로 보지 않았다. 신공덕동의 김대감 정착설·성산동의 실제 성곽·염리동의 개별 소금거래는 이번 검토로 새 확정하지 않았다.

노유동은 1995년 행정동 설명과 2008년 자양동 편입을 구별했다. 기존 광진구 district_context 연결만 보존하며 현행 별도 법정동이나 자양동 전체로 올리지 않았다. 도봉동·금호동2가·용산동4가·신영동의 과거 양주군·고양군은 현재 서울 지역으로 이어지는 개별 원문 연혁임을 확인했다. 타지역 자료를 생산기관·동명 일치만으로 연결하지 않았다.

청량리동 원문 속 옛 기관 목록과 전농동의 청량리역 시설명은 현재 입지 검증으로 사용하지 않았다. 계동 상세주소는 제생원 터의 동일성 증거가 아니다. 동대문구 페이지 수정일 2026-04-20은 개별 역사 사건이나 기관별 현황 확인일과 구별했다.

## 전사·시각자료·이용조건

박물관 2개의 내용 항목과 저장 전사는 공백 정규화 후 일치했다. 각 제목 뒤 공공누리 제1유형 표시를 읽었고 기존 KOGL1·권리 URL·보관/재사용 값을 유지했다. 지도·표 이미지와 제3자 논문·원전 자체의 재사용 권리 또는 현재 부지 동일성까지 승인한 기록은 아니다.

구작로는 개별 장소 서울시 중랑구·망우동 출처, 시기 2022와 조선시대 노선 해석을 나누었다. 구작로·신작로로 여겨진다는 한정을 보존했고 의궤·논문·지도 동선을 독립 대조했다고 주장하지 않는다. 서울 안팎을 연결하는 노선 전체를 단일 서울 동의 경계로 보지 않았다. 수유동 필지 변화는 대상 1960~1970년대와 메타데이터·책 2024를 구별했으며 표의 각 행·필지·토지대장을 독립 검증하지 않았다. 두 전사의 기존 빈 지역 연결도 유지했다.

계동은 원문의 공공누리 제1유형을 확인했다. 광진구 페이지의 유형 값이 빈 이용조건 문구와 다른 기관의 일반 저작권 표기를 새 개별 이용허락으로 해석하지 않았다. unknown·보관 0·재사용 0은 그대로 두었다. 원문 HTML·사진·영상의 신규 운영 적재는 없으며 임시 추출문은 대조 후 제거한다.

## 운영 반영과 검증

기존 `validatePassageReview`로 입력 30개를 검사하고 운영 API에 반영했다. 전체 638개 본문의 ID·본문·원문 위치·자료 및 본문 버전·URL·권리·지역 연결 지문을 재조회해 유지됨을 확인했다. 비대상 608개 응답은 완전히 같고 대상에서는 검토 상태와 추가 검토 필드만 달라졌다. 선택 자료 26건의 자료·버전·연표·지역·파일·수집 이력과 기존 감사 이력도 보존됐다. 자료별 검토 API 26개에서 최신 ID·revision 1·전체 근거를 확인하고 신규 감사 이력 30개를 대조했다.

법정동 완료 집계 증가는 24개다. 빈 연결의 전사 2개와 광진구 맥락의 옛 노유동 1개는 법정동 완료 수에 포함하지 않았다. 웹 원문 완료·박물관 전사 완료·공간 보류 각 1개를 같은 입력으로 재시도해 같은 검토 ID·revision·unchanged:true를 확인했다. 이후 Sites 독립 D1 읽기는 제공된 next_offset만 따라 마지막 null까지 확인했고 이전 195행 전부 보존·신규 30행·합계 225행으로 중복이 없었다. 긴 evidence·snapshot 셀은 전체 값이 제공되는 운영 API로 검증했다. 쓰기 실패·revision 충돌·중복 적재는 0건이다.

자료 525건·본문 638개·자료 버전 525개·연표 21개·파일 20개, 공식 현존 법정동 467개·주소 응답 일치 464개·미확인 3개를 유지했다. 공식 코드 근거는 2026-10-20 스냅샷 기준이다. 애플리케이션 코드 변경이 없어 재배포하지 않았고 코드 테스트·타입 검사·빌드를 새 수행한 것으로 보고하지 않는다. 이번 검증은 입력·운영 API·DB 전후 대조이며 화면 시각·전체 서비스 검증은 후속 단계다.

검증 시각: 2026-10-22T02:58:11.396318+00:00. 항목별 여섯 검사·URL·정확한 위치·확인일·직접 원문 해시 또는 웹 열람 참조·검토 ID는 `data/passage-review-observations-2026-10-22-08.json`에 보존했다.

## 처리 항목

- **을지로2가 · 원문 대조 완료**
  - 본문 `53c20a26-5ce3-4b36-a8ca-b609cd1bd5a3` · 자료 `ce178fbf-0667-431d-89c1-7148b9f45016` · 검토 `91506542-9de0-46f8-9593-d1cc02ab5d63` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%9D%84%EC%A7%80%EB%A1%9C2%EA%B0%80
  - 위치: 법정동 명칭검색 «을지로2가» > 을지로2가(乙支路2街) > 연혁 문단 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T02:45:47.833613+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 1914년 죽동·저동·동현동 등 각 일부의 황금정2정목 병합과 1946년 을지로2가 개칭이 요약과 일치한다.
- **청량리동 · 원문 대조 완료**
  - 본문 `53e8e834-564a-411f-82be-6256da6d657f` · 자료 `3859feb3-c04d-4a08-9814-dda152195e6a` · 검토 `9e7d0f7c-2a44-4f14-afd6-a3276c66c647` / revision 1
  - 원문: https://www.ddm.go.kr/tour/contents.do?key=2081
  - 위치: 청량리동 > 청량사·홍릉 일대 / 웹 원문 청량리동 292~299행·수정일 305행·말미 저작물 이용가이드/저작권 표기
  - 확인: 2026-10-22T02:48:57Z · 범위: neighborhood · 분류: mixed
  - 판단: 정확한 등록 웹 원문에서 청량사·숲·샘물의 이름 설명, 홍릉 옛 능지와 영휘원·숭인원 소개를 대조했다.
- **광장동 · 원문 대조 완료**
  - 본문 `54937075-8b5a-4a28-a291-0193055adf67` · 자료 `53f81f18-f030-4d51-90de-29e8019f0879` · 검토 `776bd926-3967-4fb4-8a94-c4bf8676ca1c` / revision 1
  - 원문: https://www.gwangjin.go.kr/portal/main/contents.do?menuNo=200271
  - 위치: 동명유래 > 광장동
  - 확인: 2026-10-22T02:45:47.836214+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 광장리의 광과 장의동의 장을 결합했다는 요약이 광진구 개별 문단과 일치한다.
- **충무로4가 · 원문 대조 완료**
  - 본문 `54af04c9-fd0f-4f49-886c-9a22d77e344f` · 자료 `a068b4bd-cb49-4cc4-99a4-fd1d4fcb5cb2` · 검토 `a278d4cc-54a2-4cfe-9fc3-005678f51ae2` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%B6%A9%EB%AC%B4%EB%A1%9C4%EA%B0%80
  - 위치: 법정동 명칭검색 «충무로4가» > 충무로4가(忠武路4街) > 연혁 문단 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T02:45:52.015917+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 1914년 오궁동·예동·필동·회동·묵동 일부와 생민동의 본정4정목 병합 및 1946년 개칭이 일치한다.
- **체부동 인용 · 재확인 필요**
  - 본문 `54b23c66-0579-4604-bdf4-358a38b7af10` · 자료 `bce19c0c-52c2-410b-8d7a-4e179d6fc70f` · 검토 `b81f6f8e-1b2e-4008-bdb7-8bc8e430eb75` / revision 1
  - 원문: https://culture.jongno.go.kr/media/ko/bbs/44/detail.do?pstSn=130
  - 위치: 상세정보 > (1) 동 유래 및 변천 > 첫 문장
  - 확인: 2026-10-22T02:47:26.122463+00:00 · 범위: neighborhood · 분류: unconfirmed
  - 판단: 정확한 등록 URL의 공개 GET 두 차례가 HTTP 503이고 웹 열람도 502여서 선택 인용을 실제 원문과 대조하지 못했다. 저장된 문장·기존 KOGL1만으로 완료 처리하지 않는다.
- **번동 · 원문 대조 완료**
  - 본문 `54bb976b-34c4-4c5f-8ade-3fcae5d74c0b` · 자료 `8210fecc-228a-42ca-96e2-185fa5de8c6d` · 검토 `8b54e155-fef5-4bdb-b915-18688c8b4e45` / revision 1
  - 원문: https://child.gangbuk.go.kr/dong/main/contents.do?dongCd=06&menuNo=600103
  - 위치: 유래 및 연혁 > 동 유래·동 연혁
  - 확인: 2026-10-22T02:45:55.567260+00:00 · 범위: neighborhood · 분류: mixed
  - 판단: 오얏나무·벌리사 이야기를 전승으로, 1949년 서울 편입·1950년 번동 개칭·1995년 강북구 전환을 연혁으로 나눈 요약이 일치한다.
- **전농동 · 원문 대조 완료**
  - 본문 `54e3de2f-5681-486b-850d-b60c286535d6` · 자료 `aad727e0-7ff3-4092-97b0-590612acda3e` · 검토 `27bd7acd-b496-4d92-8605-52d71a851962` / revision 1
  - 원문: https://www.ddm.go.kr/tour/contents.do?key=2078
  - 위치: 전농동 > 적전·자연마을 / 웹 원문 전농동 292~300행·수정일 307행·말미 저작물 이용가이드/저작권 표기
  - 확인: 2026-10-22T02:48:57Z · 범위: neighborhood · 분류: factual
  - 판단: 등록 웹 원문의 친경지 적전·전농리 어원과 샛말·활터말·창마을 등 자연마을 소개가 요약과 일치한다.
- **예장동 · 원문 대조 완료**
  - 본문 `557b81b4-7872-4284-9251-b969cfadff28` · 자료 `4b4e846f-74ba-4b25-85d8-e93c47701efc` · 검토 `c21461e1-3b53-4a87-b839-92ab6eeec7d2` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%98%88%EC%9E%A5%EB%8F%99
  - 위치: 법정동 명칭검색 «예장동» > 예장동(藝場洞) > 연혁 문단 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T02:45:59.416347+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 무예를 연습하던 예장의 이름과 왜성대정→1946년 예장동 개칭이 요약과 일치한다.
- **방산동 · 원문 대조 완료**
  - 본문 `5654ae1b-eff8-42f2-afa2-2a0a59e5fe20` · 자료 `c614761c-83ed-45aa-b1b5-ab21da19386d` · 검토 `68c0a25c-ff5f-4cc9-9f2f-8ac2f87ac768` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%B0%A9%EC%82%B0%EB%8F%99
  - 위치: 법정동 명칭검색 «방산동» > 방산동(芳山洞) > 연혁 문단 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T02:45:59.816564+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 1914년 오교동·연방동 일부 병합으로 방산정이 된 뒤 1946년 방산동 개칭이 일치한다.
- **운니동 · 원문 대조 완료**
  - 본문 `56ad3b4b-65a4-4ca5-a196-e857ae94131a` · 자료 `166865ed-3ddc-40ac-8529-da38491cbe63` · 검토 `b0350f34-11c6-4f62-b4c0-1a97c59fd0e5` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%9A%B4%EB%8B%88%EB%8F%99
  - 위치: 서울 지명사전 > 법정동 > 운니동(雲泥洞) > 동명 유래·행정 변천 문단 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T02:46:03.343810+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 운현과 니동 첫 글자의 합성 및 구름재·질었던 땅 설명이 요약과 일치한다.
- **필동2가 · 원문 대조 완료**
  - 본문 `576cbfb9-25b7-4acb-a619-99a97496cb27` · 자료 `54f8240e-f247-467b-9323-d6931ad8400f` · 검토 `fbd00697-35bd-4099-8b1b-b86adf694b8d` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%ED%95%84%EB%8F%992%EA%B0%80
  - 위치: 법정동 명칭검색 «필동2가» > 필동2가(筆洞2街) > 연혁 문단 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T02:46:03.584210+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 1914년 낙선방 필동·묵동 각 일부의 대화정2정목 병합과 1946년 필동2가 개칭이 일치한다.
- **현석동 · 원문 대조 완료**
  - 본문 `57abcaf1-1d3f-4369-8ede-fec0a9646911` · 자료 `ba92c965-a182-47a2-9da6-30595b9b10a2` · 검토 `2de8d00b-6b4b-45f2-a0f3-372d5b88121c` / revision 1
  - 원문: https://www.mapo.go.kr/site/culture/content/culture0302
  - 위치: 동이름의 유래 > 현석동
  - 확인: 2026-10-22T02:46:04.345445+00:00 · 범위: neighborhood · 분류: tradition
  - 판단: 박세채의 호와 검은 돌이라는 두 어원설을 함께 전한 요약이 마포구 현석동 문단과 일치한다.
- **신공덕동 · 원문 대조 완료**
  - 본문 `57da89ed-bc4d-4eec-bcb7-cb9de30983df` · 자료 `ba92c965-a182-47a2-9da6-30595b9b10a2` · 검토 `513fb395-12b5-47b9-b03a-eeae53380a9e` / revision 1
  - 원문: https://www.mapo.go.kr/site/culture/content/culture0302
  - 위치: 동이름의 유래 > 신공덕동
  - 확인: 2026-10-22T02:46:04.345445+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 공덕리와 공덕동 인근 신동을 합친 이름이라는 요약이 개별 원문과 일치한다.
- **광희동1가 · 원문 대조 완료**
  - 본문 `58018e4c-79b9-4e05-ad57-6221ee9a9924` · 자료 `494e8040-5346-4c67-aca0-c523a573ed50` · 검토 `b16110f8-b6bd-43b5-ad7b-60c2d363ea35` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EA%B4%91%ED%9D%AC%EB%8F%991%EA%B0%80
  - 위치: 법정동 명칭검색 «광희동1가» > 광희동1가(光熙洞1街) > 연혁 문단 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T02:46:06.645455+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 1914년 광희정1정목 설치와 1946년 광희동1가 개칭이 원문 연혁과 일치한다.
- **성산동 · 원문 대조 완료**
  - 본문 `5a093cf9-9d5d-40b8-8542-b293a19952b4` · 자료 `ba92c965-a182-47a2-9da6-30595b9b10a2` · 검토 `be7e6929-202c-417c-b3a2-148f328382df` / revision 1
  - 원문: https://www.mapo.go.kr/site/culture/content/culture0302
  - 위치: 동이름의 유래 > 성산동
  - 확인: 2026-10-22T02:46:04.345445+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 성을 닮아 둘러 있는 산을 성메·성미로 부르던 이름의 한자화라는 요약이 일치한다.
- **무교동 · 원문 대조 완료**
  - 본문 `5a0d242d-e5d3-477c-bce7-3d913059245a` · 자료 `a9a1efbd-5a5e-4dc8-90dc-173b3e350b9d` · 검토 `8bfc64d7-94b7-49f4-be8c-4fd2a770f666` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%AC%B4%EA%B5%90%EB%8F%99
  - 위치: 법정동 명칭검색 «무교동» > 무교동(武橋洞) > 연혁 문단 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T02:46:06.658984+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 군기사 부근을 모교동과 구별한 이름과 무교정→1946년 무교동 개칭이 요약과 일치한다.
- **금호동2가 · 원문 대조 완료**
  - 본문 `5a0dfa72-6f48-4b49-9fd1-fd54fce9fad4` · 자료 `46a8a8c6-ce2e-45b5-a778-05d203ecdbef` · 검토 `b4f484c2-70a7-4de9-a4b1-8728edbbaf41` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EA%B8%88%ED%98%B8%EB%8F%992%EA%B0%80
  - 위치: 서울지명사전 > 법정동 > 금호동2가(金湖洞2街) 항목 본문(p.txt-box) / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T02:46:09.424552+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 1964년 네 법정동 분할과 수철리의 쇠·물 뜻을 통하는 금·호로 합성했다는 설명이 일치한다.
- **용산동4가 · 원문 대조 완료**
  - 본문 `5a6f3820-9ce2-4518-87d7-6e3da7e4c1ba` · 자료 `e4ee19b6-f525-47f9-aeb8-18abf0c6f017` · 검토 `a62b4179-32ac-449f-9d9b-12cf18f29efb` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%9A%A9%EC%82%B0%EB%8F%994%EA%B0%80
  - 위치: 서울지명사전 > 법정동 > 용산동4가(龍山洞4街) > 말미 둔지정 분할·1946년 개칭 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T02:46:09.428295+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 둔지정의 용산정4·6정목 편입과 1946년 용산동4가 개칭을 말미 원문에서 대조했다.
- **(구)능행로(구작로) · 원문 대조 완료**
  - 본문 `5a7a5b98-5882-4f3e-9e2f-2b15e3403746` · 자료 `4165960e-1970-4a5f-ac69-6d15edaecd25` · 검토 `347627f3-827e-4439-ad50-ab91e0eeeb91` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY1077&fileId=8d414c46-503e-4733-b42d-fac8a185d091&fileSn=857&type=A&upperNodeId=CTGRY1079
  - 위치: 상세 자료 > 내용 항목 · 『망우동(2022)』, p. 35.
  - 확인: 2026-10-22T02:46:10.580731+00:00 · 범위: neighborhood · 분류: inference
  - 판단: 개별 내용 항목과 저장 전사는 공백 정규화 후 일치한다. 구작로·신작로의 해석은 제공기관 설명의 전사로 확인했다.
- **산림동 · 원문 대조 완료**
  - 본문 `5ad27832-3792-412b-ae79-e085fba97a1b` · 자료 `8814d42d-78c3-4323-b977-d4edddae2100` · 검토 `05e8bc1f-935b-459d-83cd-416965f492af` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%82%B0%EB%A6%BC%EB%8F%99
  - 위치: 법정동 명칭검색 «산림동» > 산림동(山林洞) > 연혁 문단 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T02:46:11.980514+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 살리뭇골의 한자 표기, 하천변 평지 자연마을과 임정→1946년 산림동 개칭이 요약과 일치한다.
- **장안동 · 원문 대조 완료**
  - 본문 `5ba08797-e288-4564-92a4-d2eea6993940` · 자료 `b7390c5f-f125-44fd-b0ee-cc57dc4d3805` · 검토 `bb73a733-7e81-442f-9fc7-aab8235764e3` / revision 1
  - 원문: https://www.ddm.go.kr/tour/contents.do?key=2080
  - 위치: 장안동 > 장한평·마장안벌 / 웹 원문 장안동 292~299행·수정일 305행·말미 저작권 표기
  - 확인: 2026-10-22T02:48:57Z · 범위: neighborhood · 분류: tradition
  - 판단: 등록 웹 원문에서 장한평과 목마장 안쪽 벌판의 두 어원설 및 중랑천변 평야·말 사육 배경을 대조했다.
- **도봉동 · 원문 대조 완료**
  - 본문 `5bb4a7c5-3a41-4080-a581-b772db7a05c8` · 자료 `6548f05c-58f0-4c42-b8f7-1662198ce548` · 검토 `4cd0415f-084d-4a41-8a25-a9c06c531386` / revision 1
  - 원문: https://tour.dobong.go.kr/Contents.asp?code=10001578
  - 위치: 동명 유래 > 도봉동
  - 확인: 2026-10-22T02:46:14.620895+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 도봉산 유래·1914년 도봉리 통합·1963년 서울 편입 뒤 도봉동이라는 선택 요약이 원문과 일치한다.
- **염리동 · 원문 대조 완료**
  - 본문 `5bca9c3c-8c29-4e4a-91a9-337ae06a2ed6` · 자료 `ba92c965-a182-47a2-9da6-30595b9b10a2` · 검토 `adc7b2d2-0103-46fd-b05c-9b171de65964` / revision 1
  - 원문: https://www.mapo.go.kr/site/culture/content/culture0302
  - 위치: 동이름의 유래 > 염리동
  - 확인: 2026-10-22T02:46:04.345445+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 마포나루 소금 유통과 소금장수 거주라는 이름의 배경이 염리동 문단과 일치한다.
- **계동 · 원문 대조 완료**
  - 본문 `5be772dd-c7b3-4102-a337-1435c04d0513` · 자료 `dfaf9bfc-28e0-4752-8771-6a3bb1548ab4` · 검토 `7c93e254-c750-483b-b4a4-d6c730dd9c92` / revision 1
  - 원문: https://culture.jongno.go.kr/media/ko/bbs/44/detail.do?pstSn=199
  - 위치: 상세정보 > (1) 동 유래 및 변천 / (2) 동네 지명 유래 / 웹 원문 상세정보 (1)·(2) 101~117행·공공누리 제1유형 120~122행
  - 확인: 2026-10-22T02:48:57Z · 범위: neighborhood · 분류: factual
  - 판단: 정확한 등록 웹 원문에서 제생동·계생동·1914년 계동 축약과 1946년 계동 개칭을 대조했다.
- **신영동 · 원문 대조 완료**
  - 본문 `5c071784-b074-42a4-9a34-2cb122a1903a` · 자료 `fa2bd7ff-a755-4b54-a99b-3dba60771fcb` · 검토 `f9358172-b15e-4f8a-b1f9-c46367ce241d` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%8B%A0%EC%98%81%EB%8F%99
  - 위치: 서울지명사전 > 법정동 > 신영동(新營洞) > 동명 유래·행정구역 연혁 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T02:46:19.426223+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 총융청 청사 이전·새 군영의 동명과 1975년 종로구 편입이 요약과 일치한다.
- **1960~1970년대 그 외 시설로의 필지 변화 · 원문 대조 완료**
  - 본문 `5ce5daf6-e9f6-456d-821f-b3328e30e4c1` · 자료 `576f3bf6-3bd3-4702-981e-f004505a3d42` · 검토 `d1216b55-1994-446e-bd31-9a27e99a41a6` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY1171&fileId=bbee0253-6cd1-425a-9098-df3e1fe8dd45&fileSn=1639&type=A&upperNodeId=CTGRY1175
  - 위치: 상세 자료 > 내용 항목 · 『수유동』(2024), p. 89.
  - 확인: 2026-10-22T02:46:19.557500+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 개별 내용 항목과 저장 전사가 공백 정규화 후 일치한다. 필지 변화 표에 대한 제공기관 설명의 전사로 확인했다.
- **노유동 옛 지명 · 원문 대조 완료**
  - 본문 `5ced3560-28e9-4a54-ae1c-a1d75d7df696` · 자료 `53f81f18-f030-4d51-90de-29e8019f0879` · 검토 `3bcaf08d-9b75-4641-9ab5-3263b422352f` / revision 1
  - 원문: https://www.gwangjin.go.kr/portal/main/contents.do?menuNo=200271
  - 위치: 동명유래 > 노유동
  - 확인: 2026-10-22T02:45:47.836214+00:00 · 범위: district · 분류: mixed
  - 판단: 광진구 노유동 개별 문단의 누런산·노룬산 설명과 2008년 자양동 편입을 대조했다.
- **충신동 · 원문 대조 완료**
  - 본문 `5d6f13bc-53b3-4c47-a6a3-db57b53735fc` · 자료 `38f89a92-7fdc-4312-a7c1-554d91b369ad` · 검토 `84e518ee-ba2d-4d76-b730-1be069f43cb7` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%B6%A9%EC%8B%A0%EB%8F%99
  - 위치: 서울 지명사전 > 법정동 > 충신동(忠信洞) > 동명 유래·행정 변천 문단 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T02:46:20.419575+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 성균관·동학을 배경으로 충신을 이름으로 정했다는 설명과 옛 건덕방 연혁이 요약과 일치한다.
- **휘경동 · 재확인 필요**
  - 본문 `5da5d838-0909-4d68-98fa-5ede8138a09a` · 자료 `501011d3-46c1-4310-9f3b-a1f6a1935376` · 검토 `7195bc7c-8506-432d-bc28-54018b88b274` / revision 1
  - 원문: https://www.ddm.go.kr/tour/contents.do?key=2083
  - 위치: 휘경동 > 휘경원·배봉산 묘역 / 웹 원문 휘경동 292~299행·수정일 305행·말미 저작권 표기
  - 확인: 2026-10-22T02:48:57Z · 범위: neighborhood · 분류: mixed
  - 판단: 휘경원에서 온 동명은 등록 웹 원문과 맞지만, 저장 요약이 재확인 대상으로 둔 여러 왕실 묘역의 연대·명칭 관계는 아직 해소하지 못했다.
- **영등포동2가 · 재확인 필요**
  - 본문 `5db3e6e2-3f68-4518-bfdb-7b5256720d94` · 자료 `b1cef730-811d-4806-a48f-9cc484f29a21` · 검토 `49aa739f-7aee-4351-9cf4-78c05243f240` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%98%81%EB%93%B1%ED%8F%AC%EB%8F%992%EA%B0%80
  - 위치: 법정동 분류 > 영등포동2가(永登浦洞2街) > 동명 유래·행정 변천 본문 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T02:46:23.135656+00:00 · 범위: neighborhood · 분류: inference
  - 판단: 분리·구획정리된 경부선 북쪽 설명은 원문과 맞지만 저장 요약의 경부선 남쪽 영등포동 대비는 등록 원문에 명시되지 않는다.

## 다음 작업

다음 첫 미검토 본문은 `5def6c41-8fdf-4b88-849d-7a770ecd5c32`이며 커서는 `/api/archive/task?view=passages&unreviewed=true&limit=30&after=`다. 미검토 414개·보류 66개·합계 480개를 남기고 review/ready로 계속한다. 본문 완료 기준이 아직 충족되지 않아 다음 단계로 이동하지 않는다. 전체 계획 미완료이므로 기존 예약을 유지하며 최종 감사 소스 커밋은 운영 checkpoint의 auditSourceCommit에 기록한다.
