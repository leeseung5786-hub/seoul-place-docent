# 2026-10-22 본문 검토 07: 30개

운영 `/api/archive/task`의 계획 version 2와 마지막 review/ready 기록, `data/history-maintenance-plan.json`, `docs/scheduled-history-work.md`, 직전 검토 06의 결과·다음 커서를 먼저 읽었다. Sites 절차로 소스 `50ab1464a664c1f6d3b0e95f91b9198627858e49`를 열고 계획 일치 및 다른 running 작업 부재를 확인했다. review/running 저장 후 반영 직전 같은 checkpoint·계획·집계와 대상 상태 지문을 재조회했다.

Sites 소유자 1명 전용 custom 정책 revision 1(편집자·그룹·외부 방문자 0) 및 운영 version 24를 유지했다. 확인일은 실제 UTC ISO 시각으로 기록하며 이번 확인은 한국 시간 2026-10-22에 이루어졌다. 과거 임시 파일·인증값에 의존하지 않고 새로 발급한 서비스 접근을 사용했다.

다음 미검토 본문 30개, 자료 29건을 처리했다. 요약 20개와 박물관 설명문 전사 4개를 원문 대조 완료로, 인용 1개와 요약 5개를 보류로 기록했다. 기존 보류 57개를 재처리하거나 완료로 올리지 않았다.

| 지표 | 이전 | 이후 |
|---|---:|---:|
| 현재 본문 | 638 | 638 |
| 최신 검토 기록이 있는 본문 | 164 | 194 |
| 원문 대조 완료 | 107 | 131 |
| 재확인 필요 | 57 | 63 |
| 아직 검토하지 않음 | 474 | 444 |
| 미완료 합계 | 531 | 507 |

## 보류와 한정

내자동 인용·정릉동·공통 성수동·염창동은 정확한 등록 URL의 공개 GET을 두 번 시도했으나 각각 503이었고 웹 원문도 502 또는 시간 초과였다. 저장된 인용·요약이나 이전 확인 기록만으로 이번 검토를 승인하지 않았다. 기존 KOGL1이나 unknown 및 보관·재사용 값은 그대로 두고 원문 위치·접근 시각·실패 사유를 남겼다. 공통 성수동의 기존 성동구 district_context 연결은 보존하되 새 공간 확인으로 세지 않았다.

영등포동4가·5가의 개별 사전은 분리 관할과 구획정리된 경부선 북쪽 지역 일부를 명시하지만, 저장 요약이 대비하는 경부선 남쪽 영등포동은 그 원문에 명시되지 않는다. 독립 공간 근거가 없어 consistency·spatial을 unresolved로 남겼다. 원문 첫 문장의 영등포4가동/5가동 표기와 제목·말미 영등포동4가/5가도 구분했으며 기존 공식 명칭·ID·본문을 수정하지 않았다. 정확한 분리 시행일의 유보도 유지했다.

내수동은 직접 GET 503과 별개로 정확한 등록 웹 원문의 상세정보 (1)·(2), 이용조건을 읽었다. 1914년 수창동과 1936년 내수정, 누정동·북문골을 대조했다. 선택 요약 밖의 도깨비골 전승·관청 소속 기관·상세 위치 표기를 새로운 사실이나 부지 동일성으로 승인하지 않았다. 직접 받은 원문 파일이 없어 sourceHash:null로 기록했다.

재동은 txt-box1의 재동(齋洞)을 골라 읽고 계유정난의 재를 덮었다는 이야기를 전승으로 보존했다. 원서동은 어원에 대한 원문의 추정을 유지했다. 누하동은 누각동 아래쪽·1914년 통합 설명만 대조했으며 연산군 누각설과 인경궁 누각 추정을 새 확정 사건으로 채택하지 않았다. 가락동은 어원 미상과 1925년 홍수 뒤 이주설을, 영등포동은 영등굿·포 결합설과 어원 불확실성을 함께 보존했다. 남현동의 정조 행차 이야기도 전승으로 구분했다.

양평동4가·당산동6가는 원문의 구획정리와 광복·전쟁 후 인구 증가 배경을 대조한 것으로 정확한 분리 시행일·현재 필지 경계를 독립 복원한 결과가 아니다. 충정로1가·서소문동·숭인동의 1975년 관할 변경과 1946년 개칭은 서로 다른 사건으로 대조했다. 양화동·창전동은 각각 영등포구·마포구의 개별 문단 맥락으로 한정했다. 생산기관이나 동명 일치만으로 타지역을 연결하지 않았다.

## 전사·시각자료·이용조건

박물관 4개의 개별 내용 항목과 저장 전사는 공백 정규화 후 모두 일치했고 각 제목 뒤의 공공누리 제1유형 표시를 실제 읽었다. 기존 KOGL1·권리 URL·보관/재사용 값을 유지했다. 외부 원지적도·항공사진·소유자 표·의례 기록을 새로 복제하지 않았고 원전 책 쪽을 직접 확인했다고 주장하지 않는다. 원문 HTML 전체·이미지·영상의 신규 운영 적재는 없다. 검토용 임시 추출문은 검증 후 제거한다.

곡교리 지목별 분포는 표제·설명문의 1911년과 메타데이터 시기 2022·책 천호동(2022)을 구분했다. 개별 장소 서울시 강동구와 출처 맥락을 확인했으며 원지적도의 지목 개수를 독립 집계하지 않았다. 1966년 이태원 항공사진은 사진 시기와 책 2010년을 나누고 원문의 현재까지 남아 있다는 표현을 2026년 현황으로 다시 확정하지 않았다. 당시 건물과 필지·도로의 존속을 구분한 원문 표현을 유지했다.

1912년 시흥동 소유자 자료는 개별 장소 서울시 금천구와 시흥동(2023) 출처를 확인해 경기도 시흥시 자료와 구별했다. 면적·비율·인명·친족 관계는 제공기관 설명의 전사 일치이며 원소유권 장부·당시 기사·인물 평가를 독립 검증한 결과가 아니다. 거주 추정·연고로 보인다는 한정을 남기고 당시 시흥리 범위를 현재 법정동 전체·개별 필지와 동일시하지 않았다.

치성기는 자료의 1965년, 설명문의 1994년 이후 기록 방식 변화, 책 2008년을 구별했다. 기록 변화와 당주·화주 역할의 연관은 원문의 해석으로 보존했다. 보광동·둔지미 부군당제 맥락을 확인했지만 당집·창고의 현황·주소·건물 동일성이나 의례 효험을 확정하지 않았다. 박물관 4개의 기존 빈 지역 연결도 유지했다.

내수동은 원문에서 확인한 공공누리 제1유형을 검토 근거에 기록하면서 기존 unknown·보관 0·재사용 0은 바꾸지 않았다. 송파구 페이지의 공공누리 표기 지정안됨, 다른 원문의 일반 저작권정책 링크 역시 새 개별 복제·변형 허락으로 간주하지 않았다.

## 운영 반영과 검증

기존 검증 함수로 입력 30개를 확인한 뒤 운영 API에 반영·재조회했다. 전체 본문 638개의 ID·본문·위치·자료 및 본문 버전·원문 URL·권리·지역 연결 지문은 그대로이고 비대상 608개 응답은 완전히 같다. 선택 자료 29건의 자료·버전·연표·지역·파일·수집 이력과 기존 감사 이력이 유지됐다. 자료별 검토 API 29개에서 최신 검토 ID·revision 1·상태·전체 근거를 대조하고 신규 감사 이력 30개를 확인했다.

빈 연결의 전사 4개를 제외해 법정동 대조 완료 집계는 20개 증가했다. 성수동의 자치구 맥락 보류는 완료 집계에 포함하지 않았다. Sites 독립 D1 읽기는 제공된 next_offset만 따라 마지막 null까지 확인했다. 기존 검토 165행이 보존되고 새 30행만 추가돼 195행이다. 긴 evidence·snapshot 셀은 운영 API의 전체 값으로 대조했다. 웹 원문 완료·박물관 전사 완료·공간 보류 각 1개를 같은 요청으로 재시도해 동일 검토 ID·revision·unchanged:true를 확인하고 그 뒤 독립 D1 읽기에서도 중복 행이 없음을 확인했다. 쓰기 실패·revision 충돌·중복 적재는 0건이다.

자료 525건·본문 638개·자료 버전 525개·연표 21개·파일 20개, 공식 현존 법정동 467개·주소 응답 일치 464개·미확인 3개는 유지했다. 애플리케이션 코드 변경이 없고 운영 데이터만 반영했으므로 재배포하지 않았다. 코드 테스트·타입 검사·빌드를 새로 실행한 것으로 보고하지 않는다. 실제 검증은 입력 검사와 운영 API/DB 전후 대조이며 화면 시각 검증과 전체 서비스 동작 검증은 후속 단계다.

검증 완료 시각: 2026-10-22T00:24:43.060658+00:00. 각 항목의 여섯 검사·정확한 원문 위치·실제 확인일·직접 GET 해시·검토 ID는 `data/passage-review-observations-2026-10-22-07.json`에 보존했다.

## 처리 항목

- **내자동 인용 · 재확인 필요**
  - 본문 `4819d2b0-bfac-4239-a9ec-54034486315d` · 자료 `50bb6f7b-a5b5-4468-9132-66a662630dd2` · 검토 `89a1d9fa-f489-44d2-94a9-cef3f0d7acce` / revision 1
  - 원문: https://culture.jongno.go.kr/media/ko/bbs/44/detail.do?pstSn=187
  - 위치: 상세정보 > (1) 동 유래 및 변천 > 첫 문장
  - 확인: 2026-10-22T00:16:17.226298+00:00 · 범위: neighborhood · 분류: unconfirmed
  - 판단: 정확한 등록 원문의 공개 GET 두 차례가 HTTP 503, 웹 열람도 실패하여 선택 본문을 실제 대조하지 못했다. 기존 저장문이나 과거 열람만으로 완료 처리하지 않는다.
- **양평동4가 · 원문 대조 완료**
  - 본문 `48977dc4-356f-43b6-97c4-305870371330` · 자료 `bd6804d1-7e28-48e8-8600-ab15b4885f83` · 검토 `3a01026a-056b-4eb7-8ab3-ef3cf3f2df14` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%96%91%ED%8F%89%EB%8F%994%EA%B0%80
  - 위치: 법정동 분류 > 양평동4가(楊坪洞4街) > 동명 유래·행정 변천 본문 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T00:13:30.434988+00:00 · 범위: neighborhood · 분류: inference
  - 판단: 양평동 일부 분리와 안양천변 둔치 일부를 남긴 구획정리 지역의 분화를 대조했다.
- **남현동 · 원문 대조 완료**
  - 본문 `48a3fa94-7186-4f8f-9996-2748c0bd29e1` · 자료 `10552854-b8dc-4a67-89c9-1be1d5e0dec1` · 검토 `c19042b5-4f82-459f-838c-584d3578220a` / revision 1
  - 원문: https://www.gwanak.go.kr/site/gwanak/11/11101020000002016051207.jsp
  - 위치: 지역특성 > 남현동 > 지명유래
  - 확인: 2026-10-22T00:13:30.435387+00:00 · 범위: neighborhood · 분류: mixed
  - 판단: 남태령을 가리키는 남쪽 고개마을이라는 이름과 정조 행차 이야기를 전승으로 나눈 요약이 원문과 일치한다.
- **재동 · 원문 대조 완료**
  - 본문 `48fc0664-8ca5-454a-9086-ae17608dac93` · 자료 `ba35d4ad-e8c9-4e22-9dc3-d23b31c272fa` · 검토 `5045c73e-e9fc-4b2c-94f9-ce3f17aa96c7` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%9E%AC%EB%8F%99
  - 위치: 서울 지명사전 > 법정동 > 재동(齋洞) > 동명 유래·행정 변천 문단 / 본문 구간 (txt-box1)
  - 확인: 2026-10-22T00:13:35.329327+00:00 · 범위: neighborhood · 분류: tradition
  - 판단: 계유정난 때 길을 재로 덮어 잿골이라 불렀다는 전승과 이를 부지 이력으로 확정하지 않는 요약을 대조했다.
- **정릉동 · 재확인 필요**
  - 본문 `499ff8f6-cdd7-4302-a0aa-c1188a0c4f6b` · 자료 `ceb355e1-3e2e-41cb-8833-625ca7f9390b` · 검토 `74d18c0a-f425-4aa2-aee7-6246729d6d25` / revision 1
  - 원문: https://www.sb.go.kr/www/contents.do?key=5964
  - 위치: 동명 유래 > 정릉동
  - 확인: 2026-10-22T00:16:17.227372+00:00 · 범위: neighborhood · 분류: unconfirmed
  - 판단: 정확한 등록 원문의 공개 GET 두 차례가 HTTP 503, 웹 열람도 실패하여 선택 본문을 실제 대조하지 못했다. 기존 저장문이나 과거 열람만으로 완료 처리하지 않는다.
- **충정로1가 · 원문 대조 완료**
  - 본문 `49fc5910-50c5-45c8-a6b6-232e27c55aae` · 자료 `000b1e72-3cf7-42d2-a999-4fe714e4068c` · 검토 `9b462306-4ea2-4861-94e4-cd7c8400475e` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%B6%A9%EC%A0%95%EB%A1%9C1%EA%B0%80
  - 위치: 법정동 명칭검색 «충정로1가» > 충정로1가(忠正路1街) > 연혁 문단 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T00:13:35.552708+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 죽첨정1정목→1946년 충정로1가 개칭과 1975년 서대문구에서 중구로 관할 변경이 일치한다.
- **서소문동 · 원문 대조 완료**
  - 본문 `4a211b35-8c43-4c8d-9c2e-76249cf9626a` · 자료 `54323957-f384-41eb-a20b-f577eb0f2667` · 검토 `d6203d69-72c6-4fd5-bc5c-9e2601244129` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%84%9C%EC%86%8C%EB%AC%B8%EB%8F%99
  - 위치: 법정동 명칭검색 «서소문동» > 서소문동(西小門洞) > 연혁 문단 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T00:13:38.931114+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 서소문에서 온 동명, 서소문정의 1946년 개칭·1975년 중구 편입이 일치한다.
- **내수동 · 원문 대조 완료**
  - 본문 `4a2931e2-9d9e-4dd9-812f-fd543bd0759f` · 자료 `08584dba-8baf-435c-b3b4-5c5deae9b73f` · 검토 `ac38b942-b846-4b21-a614-8d7e8a46b547` / revision 1
  - 원문: https://culture.jongno.go.kr/media/ko/bbs/44/detail.do?pstSn=188
  - 위치: 상세정보 > (1) 동 유래 및 변천 / (2) 동네 지명 유래 / 웹 원문 101~119행 및 124행 이용조건
  - 확인: 2026-10-22T00:15:28Z · 범위: neighborhood · 분류: factual
  - 판단: 등록 웹 원문에서 내수사 관련 이름과 1914년 수창동·1936년 내수정, 누정동·북문골을 대조했다.
- **북창동 · 원문 대조 완료**
  - 본문 `4a50c04b-3112-420d-8c81-51586bea68e1` · 자료 `26c64d31-9697-4ba3-ae0f-e432b313517d` · 검토 `52c18673-67cd-474e-bd94-68232afe3d33` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%B6%81%EC%B0%BD%EB%8F%99
  - 위치: 법정동 명칭검색 «북창동» > 북창동(北倉洞) > 연혁 문단 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T00:13:41.656416+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 선혜청 북쪽 창고의 동명과 북미창정→1946년 북창동 개칭이 요약과 일치한다.
- **원서동 · 원문 대조 완료**
  - 본문 `4a8e3f9f-4c1f-4d4c-be82-d933d64fda1f` · 자료 `50db92a8-0b32-4df0-bbe9-432cfed2305f` · 검토 `1f70330d-c2f4-4b8d-a5ba-54819bce6237` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%9B%90%EC%84%9C%EB%8F%99
  - 위치: 서울 지명사전 > 법정동 > 원서동(苑西洞) > 동명 유래·행정 변천 문단 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T00:13:43.615299+00:00 · 범위: neighborhood · 분류: inference
  - 판단: 원동 이름을 바탕으로 창덕궁 후원 서쪽의 위치를 원서정 명칭에 반영했다는 추정이 요약과 일치한다.
- **1911년 곡교리의 지목별 분포 · 원문 대조 완료**
  - 본문 `4aca4f0b-e811-4396-b5cf-524eeb3add92` · 자료 `d09b8d69-e8a5-4bf3-aea3-c7a89e6a8acf` · 검토 `fc3bd5e3-e6eb-4256-9a89-d2d84af5258b` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY1064&fileId=7113b155-16de-49a6-a967-88de8b57796b&fileSn=801&type=A&upperNodeId=CTGRY1066
  - 위치: 상세 자료 > 내용 항목 · 『천호동(2022)』, p. 40.
  - 확인: 2026-10-22T00:13:44.104769+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 개별 내용 항목과 기존 전사가 공백 정규화 후 일치한다. 지목별 개수는 제공기관 설명의 전사로 확인했다.
- **누하동 · 원문 대조 완료**
  - 본문 `4b1c6dd6-a703-49da-8efb-bb0692699950` · 자료 `13eefe62-88e2-443f-b92a-597307f93bb9` · 검토 `20be0977-4c8a-44eb-941a-794c72409ba6` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%88%84%ED%95%98%EB%8F%99
  - 위치: 서울지명사전 > 법정동 > 누하동(樓下洞) > 동명 유래·행정구역 연혁 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T00:13:44.967113+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 누각동 아래쪽이라는 이름과 1914년 여섯 마을·누각동 일부의 통합을 대조했다.
- **성수동 공통 지명 · 재확인 필요**
  - 본문 `4b6ae1cc-be5c-4b7f-847b-02b0b5c5da0f` · 자료 `11ad709e-e01f-4418-807c-2e31c483014d` · 검토 `6f3e739f-6ef3-4d5b-9682-7fb8fc35a758` / revision 1
  - 원문: https://sd.go.kr/tour/contents.do?key=1926
  - 위치: 지명유래 > 성수동(1·2동)
  - 확인: 2026-10-22T00:16:20.286934+00:00 · 범위: district · 분류: unconfirmed
  - 판단: 정확한 등록 원문의 공개 GET 두 차례가 HTTP 503, 웹 열람도 실패하여 선택 본문을 실제 대조하지 못했다. 기존 저장문이나 과거 열람만으로 완료 처리하지 않는다.
- **염창동 · 재확인 필요**
  - 본문 `4c36a04d-d5df-4fc4-9ecd-4daa29566673` · 자료 `ddfe760f-2268-4658-babe-b03164983086` · 검토 `280be922-7dfe-4a77-ace9-31e9f014d1a8` / revision 1
  - 원문: https://www.gangseo.seoul.kr/kids/kids010501
  - 위치: 동명 유래 > 염창동
  - 확인: 2026-10-22T00:16:23.363080+00:00 · 범위: neighborhood · 분류: unconfirmed
  - 판단: 정확한 등록 원문의 공개 GET 두 차례가 HTTP 503, 웹 열람도 실패하여 선택 본문을 실제 대조하지 못했다. 기존 저장문이나 과거 열람만으로 완료 처리하지 않는다.
- **가락동 · 원문 대조 완료**
  - 본문 `4c5595a0-d447-43ae-80a7-136b4901c76b` · 자료 `536fc3d5-87bb-4b2e-bfb3-6e33860ab479` · 검토 `f4cc3a94-e7fd-4f4a-b0bc-d3bc57796020` / revision 1
  - 원문: https://www.songpa.go.kr/www/contents.do?key=2367
  - 위치: 동명 유래 > 가락동
  - 확인: 2026-10-22T00:13:48.808731+00:00 · 범위: neighborhood · 분류: tradition
  - 판단: 가락골·1925년 홍수 뒤 이주 설명을 함께 전하고 어원은 확실하지 않다고 한 요약이 일치한다.
- **1966년 항공사진 · 원문 대조 완료**
  - 본문 `4c684bd7-243b-4b2a-aedf-c9e220bc4d99` · 자료 `b1c65237-e2bc-4250-972a-6f6c1b1d76c0` · 검토 `ccdf39d7-3c11-4265-9369-7651fccd7050` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY354&fileId=H-TRNS-5492-358&fileSn=300&type=A&upperNodeId=CTGRY358
  - 위치: 상세 자료 > 내용 항목 · 『이태원; 공간과 삶』(2010), 222쪽
  - 확인: 2026-10-22T00:13:49.785104+00:00 · 범위: neighborhood · 분류: inference
  - 판단: 개별 원문의 내용과 전사가 공백 정규화 후 일치한다. 필지·도로가 남고 당시 건물은 아니라는 구분을 그대로 보존했다.
- **영등포동 · 원문 대조 완료**
  - 본문 `4ccad403-8bf1-475a-85ff-9e30232d133f` · 자료 `49bfa954-ee68-4046-bb46-23b1bd573aca` · 검토 `31f7e54e-fcc7-4308-be44-ba2f317bf1d6` / revision 1
  - 원문: https://www.ydp.go.kr/www/contents.do?key=2887
  - 위치: 동 명칭 및 지명 유래 > 영등포동
  - 확인: 2026-10-22T00:13:51.810613+00:00 · 범위: neighborhood · 분류: tradition
  - 판단: 영등굿의 변형 표기와 물가 포를 결합한 설명, 어원이 확실하지 않다는 한정이 요약과 일치한다.
- **영등포동4가 · 재확인 필요**
  - 본문 `4da0734b-c920-4146-88e3-c657504a81c5` · 자료 `2aec6113-07a0-44ae-ade9-49ea34ac067e` · 검토 `a50c0f53-24d9-4c70-b51e-68e57410f777` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%98%81%EB%93%B1%ED%8F%AC%EB%8F%994%EA%B0%80
  - 위치: 법정동 분류 > 영등포동4가(永登浦洞4街) > 동명 유래·행정 변천 본문 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T00:13:54.081078+00:00 · 범위: neighborhood · 분류: inference
  - 판단: 분리·구획정리·경부선 북쪽 설명은 원문과 맞지만 기존 요약의 경부선 남쪽 영등포동 대비는 등록 원문에 명시되지 않는다.
- **을지로4가 · 원문 대조 완료**
  - 본문 `4da66234-17ff-4281-8d7b-6dfb27542efb` · 자료 `66949f34-1e3b-461e-b9f5-6153141b322a` · 검토 `b4afb239-f92f-4a63-91bd-d7723b257fd2` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%9D%84%EC%A7%80%EB%A1%9C4%EA%B0%80
  - 위치: 법정동 명칭검색 «을지로4가» > 을지로4가(乙支路4街) > 연혁 문단 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T00:13:56.154535+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 1914년 낙선방·성명방 일부 및 직정동 병합과 황금정4정목→1946년 을지로4가 개칭이 일치한다.
- **1912년 시흥동의 토지 소유자와 소유 규모 · 원문 대조 완료**
  - 본문 `4e0ac47d-7a21-4941-8cf0-1cdb9bab3a7c` · 자료 `ab45b862-03c1-4585-abb3-1450d8b869b7` · 검토 `074ea7e3-abc2-4b61-875f-74b3de91708e` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY1113&fileId=bfb6d5af-6d7b-4826-b84e-7da5e35fed1b&fileSn=1030&type=A&upperNodeId=CTGRY1118
  - 위치: 상세 자료 > 내용 항목 · 『시흥동(2023)』, p. 34.
  - 확인: 2026-10-22T00:13:58.311913+00:00 · 범위: neighborhood · 분류: inference
  - 판단: 개별 내용 항목과 긴 전사가 공백 정규화 후 일치한다. 면적·비율·인명과 관계 설명은 제공기관의 해설 전사로 확인했다.
- **치성기(1965) · 원문 대조 완료**
  - 본문 `4e5182fb-c8c7-4a1e-b4a7-d078d503ca92` · 자료 `db9b00f7-b425-4c6d-981f-6ea4aeeffb5c` · 검토 `3ac7ee3f-44df-4a57-810c-fab7b9f55b9a` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY344&fileId=H-TRNS-4221-351&fileSn=300&type=A&upperNodeId=CTGRY351
  - 위치: 상세 자료 > 내용 항목 · 『보광동 사람들, 보광동』(2008), 1권, 183쪽
  - 확인: 2026-10-22T00:13:58.542168+00:00 · 범위: neighborhood · 분류: inference
  - 판단: 개별 설명문과 전사가 공백 정규화 후 일치한다. 위원 명단 자료와 뒤 시기의 기록 방식 변화 설명을 구분해 보존했다.
- **신문로1가 · 원문 대조 완료**
  - 본문 `4e5d4814-8179-4712-a548-ce8224a4ce32` · 자료 `46a4dfc4-8d3d-442f-93ba-8c6e6516488a` · 검토 `293eb1f4-805a-4700-b734-c23e18e7dbc5` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%8B%A0%EB%AC%B8%EB%A1%9C1%EA%B0%80
  - 위치: 서울지명사전 > 법정동 > 신문로1가(新門路1街) > 동명 유래·행정구역 연혁 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T00:13:59.456951+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 1914년 서대문정1정목 통합과 1946년 신문로1가 개칭이 요약과 일치한다.
- **영등포동5가 · 재확인 필요**
  - 본문 `4ea1049c-6421-4f98-b67b-48f18a2a29ef` · 자료 `fe479325-34d3-4c9a-9571-3a344449b58e` · 검토 `d284eb42-c66e-455c-80ef-94bc684c8748` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%98%81%EB%93%B1%ED%8F%AC%EB%8F%995%EA%B0%80
  - 위치: 법정동 분류 > 영등포동5가(永登浦洞5街) > 동명 유래·행정 변천 본문 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T00:14:02.766124+00:00 · 범위: neighborhood · 분류: inference
  - 판단: 분리·구획정리·경부선 북쪽 설명은 원문과 맞지만 기존 요약의 경부선 남쪽 영등포동 대비는 등록 원문에 명시되지 않는다.
- **용문동 · 원문 대조 완료**
  - 본문 `4f29b6f4-16b3-4857-b7da-50e31cb63697` · 자료 `55925abd-39ee-4e41-8a1b-2099d774eb5c` · 검토 `0a377ff4-8278-4ad5-93ca-3798b8307572` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%9A%A9%EB%AC%B8%EB%8F%99
  - 위치: 서울지명사전 > 법정동 > 용문동(龍門洞) > 첫 문장·말미 대도정과 1946년 개칭 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T00:14:02.829681+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 용머리의 용과 동문외의 문을 합친 이름, 대도정과 1946년 용문동 개칭이 일치한다.
- **숭인동 · 원문 대조 완료**
  - 본문 `4f55b770-d0e0-4391-b499-4787f41feb3f` · 자료 `6c52f740-9f81-4adc-8c8c-39e3a66c46a5` · 검토 `a4885f94-5343-427f-98c0-28ec023055c0` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%88%AD%EC%9D%B8%EB%8F%99
  - 위치: 서울지명사전 > 법정동 > 숭인동(崇仁洞) > 동명 유래·행정구역 연혁 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T00:14:04.783939+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 숭신방·인창방의 첫 글자 합성과 1975년 동대문구에서 종로구로 관할 변경이 일치한다.
- **송현동 · 원문 대조 완료**
  - 본문 `4f787ff2-d670-4d3f-a200-2295f5e544e1` · 자료 `d9b12c71-26a3-41e1-b955-79f4cd32cd03` · 검토 `d5885601-b511-4795-951d-ef5fb38eff79` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%86%A1%ED%98%84%EB%8F%99
  - 위치: 서울지명사전 > 법정동 > 송현동(松峴洞) > 동명 유래·행정구역 연혁 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T00:14:04.822677+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 솔고개 이름과 1914년 송현·벽동·고리정동·대안동 통합이 요약과 일치한다.
- **양화동 · 원문 대조 완료**
  - 본문 `4f7bd52b-c2c5-48b0-bc00-30542f933dc9` · 자료 `49bfa954-ee68-4046-bb46-23b1bd573aca` · 검토 `1bf132eb-1b61-4eac-aa0b-ddfbd3d02274` / revision 1
  - 원문: https://www.ydp.go.kr/www/contents.do?key=2887
  - 위치: 동 명칭 및 지명 유래 > 양화동
  - 확인: 2026-10-22T00:13:51.810613+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 옛 양화도나루 주변에 버드나무가 많았다는 동명 설명을 원문과 대조했다.
- **창전동 · 원문 대조 완료**
  - 본문 `502669ed-4400-43fd-9934-8633b357f820` · 자료 `ba92c965-a182-47a2-9da6-30595b9b10a2` · 검토 `88a90770-47d3-4197-a635-492a56a2c17e` / revision 1
  - 원문: https://www.mapo.go.kr/site/culture/content/culture0302
  - 위치: 동이름의 유래 > 창전동
  - 확인: 2026-10-22T00:14:05.190774+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 광흥창 앞마을이라는 위치에서 창전 이름을 얻었다는 요약이 원문과 일치한다.
- **당산동6가 · 원문 대조 완료**
  - 본문 `516e0646-61a6-44b5-b77d-bf623892267b` · 자료 `5c4da810-8ba0-41e9-8092-e3e331d990ef` · 검토 `eeb31a65-f043-4b5a-8414-b90c55595299` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%8B%B9%EC%82%B0%EB%8F%996%EA%B0%80
  - 위치: 법정동 분류 > 당산동6가(堂山洞6街) > 동명 유래·행정 변천 본문 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T00:14:07.412518+00:00 · 범위: neighborhood · 분류: inference
  - 판단: 구획정리·광복과 전쟁 후 인구 증가를 배경으로 당산동 일부를 나눈 설명이 요약과 일치한다.
- **충무로2가 · 원문 대조 완료**
  - 본문 `535854a1-973f-4761-855a-2df6487dc761` · 자료 `d7f63249-3961-48c6-9bc3-c5f06e37bccb` · 검토 `1ff09cf8-9692-4315-9274-ff6f68b82016` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%B6%A9%EB%AC%B4%EB%A1%9C2%EA%B0%80
  - 위치: 법정동 명칭검색 «충무로2가» > 충무로2가(忠武路2街) > 연혁 문단 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T00:14:07.572171+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 1914년 저동·명동·종현동·주동 일부의 본정2정목 병합과 1946년 충무로2가 개칭이 일치한다.

## 다음 작업

다음 첫 미검토 본문은 `53c20a26-5ce3-4b36-a8ca-b609cd1bd5a3`다. 다음 커서는 `/api/archive/task?view=passages&unreviewed=true&limit=30&after=`다. 미검토 444개와 보류 63개, 합계 507개를 남기고 review/ready로 계속한다. 아직 본문 완료 기준에 미달하므로 보강·대표 주소·화면·전체 검증 단계로 이동하지 않는다. 전체 계획이 미완료여서 기존 예약을 유지한다. 최종 감사 소스 커밋은 운영 checkpoint의 auditSourceCommit에 기록한다.
