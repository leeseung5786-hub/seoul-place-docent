# 2026-10-22 본문 검토 05: 30개

운영 `/api/archive/task`의 계획 version 2와 마지막 review/ready 기록, `data/history-maintenance-plan.json`, `docs/scheduled-history-work.md`, 직전 본문 검토 04 기록을 먼저 읽었다. Sites 절차로 현재 소스 `d70cc5206e24bfb28fc14464864df691fae02973`를 열고 운영 계획과 파일의 일치 및 다른 running 기록이 없음을 확인했다. review/running 저장 후 작업했으며, 반영 직전 다시 확인한 checkpoint·계획·집계가 시작 상태와 같았다.

Sites의 소유자 1명 전용 custom 정책 revision 1을 유지했다. 편집자·그룹·외부 방문자는 0이며 기존 운영 URL과 version 24를 그대로 사용했다. 확인시각은 실제 UTC ISO 문자열로 보존한다. 이번 확인은 한국 시간 2026-10-22에 이루어졌다.

미검토 ID 순서의 다음 30개(서로 다른 자료 29건)를 처리했다. 25개를 등록 원문 대조 완료로, 5개를 보류로 기록했다. 25개는 요약 20개와 박물관 설명문 전사 5개다. 이미 처리한 본문이나 보류 이력을 다시 적재하지 않았다.

| 지표 | 이전 | 이후 |
|---|---:|---:|
| 현재 본문 | 638 | 638 |
| 최신 검토 기록이 있는 본문 | 104 | 134 |
| 원문 대조 완료 | 53 | 78 |
| 재확인 필요 | 51 | 56 |
| 아직 검토하지 않음 | 534 | 504 |
| 미완료 합계 | 585 | 560 |

## 보류와 한정

- 내자동·후암동은 등록된 공식 원문을 일반 공개 GET과 웹 열람에서 확보하지 못했다. 접근 실패와 내용 오류를 구분해 원문 내용·이용조건 검토를 미완료로 남겼다.
- 영등포동8가는 원문에 철도 북쪽 구획정리 구역의 분동이 나오지만 기존 요약의 철도 남쪽 영등포동과의 대비까지 명시되지는 않는다. 남쪽 관계의 공간 근거를 보강할 때까지 보류했다. 사전 첫 문장의 영등포8가동 표기와 제목·말미의 영등포동8가도 구분해 적었으며 공식 ID나 명칭을 고치지 않았다.
- 신림동 원문은 옛 지명 난곡의 강홍립 난초 재배 설명과 행정동 난곡동의 강서 호 설명을 함께 싣는다. 시기·공간·명명 단위가 다를 수 있으므로 한쪽이 틀렸다고 확정하지 않고 옛 지명과 행정동 어원 구분을 보류 사유로 기록했다.
- 흑석동 원문은 명수대의 1920년대 별장·유원지 설명에 전해지고 있다는 한정을 둔다. 기존 요약은 원문에 귀속시키지만 전승 한정이 충분히 명시되지 않아 전승·일관성 검사를 미해결로 남겼다. 기존 본문을 임의 수정하지 않았다.

부암동의 부침바위 아들 전승, 군자동의 왕실 관련 전승, 답십리동의 여러 어원설은 전승으로 보존했다. 연희동 연희궁 터와 북아현동 가옥의 유래는 원문의 추정 표현을 유지했다. 동소문동6가의 1949년 행정동 조정과 1963년 법정동 구분은 별개로 읽었다. 공릉동의 옛 공덕리와 현재 마포구 공덕동을 혼동하지 않았다. 우이동 원문의 옛 문헌 인용은 해당 문헌을 별도로 열람했다는 뜻으로 기록하지 않았다.

## 원문 접근·위치·권리

망우동은 등록 URL이 반환한 2025 제37회 중랑통계연보 PDF 330쪽의 인쇄 319쪽(PDF 319쪽), ⅩⅦ 기타 > 동명 유래(계속) > 망우동을 읽었다. PDF 쪽을 렌더링해 표의 제목·본문·쪽수를 눈으로 확인했다. 실제 받은 14,342,764바이트의 SHA-256은 `dfab269833ed18d17ca6d8de310fba3840a48978b5400adf925165107d5b2442`다. 확인일을 통계연도나 사건 연대로 대신하지 않았다. 원본 PDF나 쪽 이미지의 신규 운영 적재는 없다.

답십리동은 일반 공개 GET이 503이었으나 정확한 등록 URL의 웹 원문에서 여러 어원설과 원마을·너머말 문단을 열람했다. 이 접근에는 직접 받은 원문 파일 해시가 없으므로 sourceHash:null로 남겼다. 내자동·후암동은 원문 확인 성공으로 기록하지 않았다.

박물관 설명문 5개는 각각 등록 URL의 한국어 본문과 저장 전사를 공백 정규화 후 대조했다. 63빌딩은 표제의 1984년, 설명문의 1985년 완공, 2020년 발행 정보를 구별했다. 1912년 시흥리 지도는 제공기관의 서울시 금천구 표기와 설명문을 대조했으며, 현재 시흥시로 연결하거나 지도와 현재 필지의 일치를 주장하지 않았다. 원사진·원도면·원전 책 쪽을 독립 대조했다는 뜻으로 승격하지 않았다.

박물관 5개와 서대문구 원문에는 해당 페이지의 공공누리 제1유형 표시를 확인했다. 제3자 원자료의 권리 및 기존 unknown·보관 0·재사용 0 값은 그대로 두었다. 군자동 페이지의 일반 저작권 안내에 이용유형 값이 비어 있어 허용으로 승격하지 않았다. 외부 원문 전체·사진·영상은 새로 적재하지 않았고 열람용 임시 추출문과 렌더링은 검증 후 제거한다.

이번 항목은 모두 기존 동네 맥락(neighborhood) 범위다. 박물관 5개의 빈 지역 연결은 유지했다. 원문 장소명이 있어도 건물·부지·인근·법정동 관계를 임의로 만들지 않았고, 향후 대표 주소 단계에서 별도로 검증한다.

## 반영·검증

입력 30개를 기존 검증 함수로 확인한 후 운영 API로 반영하고 전부 재조회했다. 전체 본문 638개의 ID·본문·위치·자료 버전·본문 버전·원문 URL·권리·지역 연결 지문은 그대로이며 비대상 608개 응답은 완전히 같았다. 선택 자료 29건의 자료·버전·연표·지역·파일·수집 이력을 전후 대조했고, 자료별 검토 API 29건의 전체 근거·검토 ID·revision 1·최신 상태 및 추가 감사 이력 30개를 확인했다.

Sites의 독립 D1 읽기는 서버가 제공한 next_offset만 따라 마지막 null까지 확인했다. 기존 검토 105행의 짧은 필드가 그대로 남고 신규 30행을 더해 135행이다. 도구가 자를 수 있는 긴 evidence·snapshot 셀은 운영 API의 전체 값으로 대조했다. 요약 완료·박물관 전사 완료·명칭 범위 보류 각 1개를 같은 요청으로 재시도하여 동일 검토 ID·revision·unchanged:true를 확인했다. 쓰기 실패·충돌·중복 적재는 0건이다.

법정동 대조 완료 집계는 20개 증가했다. 빈 지역 연결의 박물관 5개는 법정동 검토 완료에 합산하지 않았다. 자료 525건·본문 638개·자료 버전 525개·연표 21개·파일 20개 및 공식 현존 법정동 467개·주소 응답 일치 464개·주소 미확인 3개는 유지했다.

이번에는 애플리케이션 코드 변경이 없고 운영 데이터만 반영했으므로 재배포하지 않았다. Site version 24와 기존 소유자 전용 정책을 유지했다. 코드 테스트·타입 검사·빌드를 새로 실행했다고 보고하지 않는다. 실제 검증은 입력 검사와 운영 DB/API 전후 대조다. 화면 시각 검증 및 주소·지도·건축물·AI 설명의 전체 동작 검증은 후속 단계로 남긴다.

검증 완료 시각: 2026-10-21T19:24:13.203341+00:00. 각 항목의 여섯 검사와 원문 해시·확인일·실제 검토 ID는 `data/passage-review-observations-2026-10-22-05.json`에 보존했다.

## 처리 항목

- **내자동 · 재확인 필요**
  - 본문 `2b8ac548-81a1-4d20-ab90-c7bbe0b89d7d` · 자료 `50bb6f7b-a5b5-4468-9132-66a662630dd2` · 검토 `e7367275-ab47-4f18-be86-5bb49017030f` / revision 1
  - 원문: https://culture.jongno.go.kr/media/ko/bbs/44/detail.do?pstSn=187
  - 위치: 상세정보 > (1) 동 유래 및 변천 / (2) 동네 지명 유래
  - 확인: 2026-10-21T19:06:01.380942+00:00 · 범위: neighborhood · 분류: unconfirmed
  - 판단: 등록 원문의 공개 GET이 HTTP 503, 웹 열람도 502로 실패해 명칭·연혁·전승·권리·공간을 대조하지 못했다. 기존 저장 요약만으로 내용을 승인하지 않는다.
- **동소문동6가 · 원문 대조 완료**
  - 본문 `2c991b2b-6b03-4996-9272-665f9eda76c2` · 자료 `84ee6be2-02c5-4ad7-a836-005607fa4ecc` · 검토 `6bb204c2-2025-4a75-b1cc-828426b6dd10` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%8F%99%EC%86%8C%EB%AC%B8%EB%8F%996%EA%B0%80
  - 위치: 서울지명사전 > 법정동 > 동소문동6가(東小門洞6街) > txt-box0 마지막 두 문장
  - 확인: 2026-10-21T19:06:01.470393+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 1963년 법정동 신설과 미아로 북쪽·동소문동4가 동쪽·아리랑고개 서쪽이라는 위치 설명이 요약과 일치한다.
- **부암동 · 원문 대조 완료**
  - 본문 `2caa183a-1f09-42e8-9647-054bbd6ab6d5` · 자료 `a8cac6aa-1921-4481-b497-d42d87ede608` · 검토 `43e7ba8d-d815-48cf-b906-f3b98f517174` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%B6%80%EC%95%94%EB%8F%99
  - 위치: 서울지명사전 > 법정동 > 부암동(付岩洞) > txt-box0 첫 두 문장·말미 1975년 관할 변경
  - 확인: 2026-10-21T19:06:02.050349+00:00 · 범위: neighborhood · 분류: mixed
  - 판단: 부침바위 어원과 득남 전설, 1975년 종로구 편입의 설명이 일치한다.
- **남대문로4가 · 원문 대조 완료**
  - 본문 `2d937a77-fbb7-4421-be4d-8e81f7304e92` · 자료 `31427c21-28b0-427f-902c-3dbe35a90f27` · 검토 `4061ad82-2595-4ef9-ba27-a712cdb8dced` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%82%A8%EB%8C%80%EB%AC%B8%EB%A1%9C4%EA%B0%80
  - 위치: 서울지명사전 > 법정동 > 남대문로4가(南大門路4街) > txt-box0 1914년 병합·1946년 개칭 문장
  - 확인: 2026-10-21T19:06:06.971401+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 수교동·태평동·생사동·창동·연지동 병합과 남대문통4정목→남대문로4가 개칭이 일치한다.
- **우이동 · 원문 대조 완료**
  - 본문 `2d9613ec-5dd8-4f0e-850b-b1c4a3291d98` · 자료 `ff665fdf-6780-43ea-a08f-65bc101f7940` · 검토 `3c48b2c9-89d7-4f21-abf2-d748ce77737c` / revision 1
  - 원문: https://child.gangbuk.go.kr/dong/main/contents.do?dongCd=12&menuNo=600205
  - 위치: 유래 및 연혁 > 동 유래 > 1751·1867년 문헌 소개·우이봉 설명·계곡 마을 문단
  - 확인: 2026-10-21T19:10:27.830718+00:00 · 범위: neighborhood · 분류: mixed
  - 판단: 소귀 모양 봉우리의 유래 전언과 두 옛 문헌의 우이동 표기, 계곡을 따른 마을 형성이라는 요약을 대조했다.
- **무학동 · 원문 대조 완료**
  - 본문 `2dcd0cdb-5985-43e0-aa46-e47c2c1f09ef` · 자료 `01fdd108-a428-4618-ae32-1e250c425d66` · 검토 `886f690d-041e-46d8-9322-9752390a64cc` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%AC%B4%ED%95%99%EB%8F%99
  - 위치: 서울지명사전 > 법정동 > 무학동(舞鶴洞) > txt-box0 첫 문장·1966·1975년 변천 문장
  - 확인: 2026-10-21T19:06:05.836674+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 무학봉에서 온 동명과 하왕십리동 일부의 무학동 개칭·중구 관할 변경이 일치한다.
- **종로1가 · 원문 대조 완료**
  - 본문 `2e8226f1-5532-4a79-98ba-76538092f5e6` · 자료 `31f98976-09db-4b35-a514-b5087e633ee0` · 검토 `62b85f42-e952-4774-bf57-0f33863c1d8b` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%A2%85%EB%A1%9C1%EA%B0%80
  - 위치: 서울지명사전 > 법정동 > 종로1가(鐘路1街) > txt-box0 첫 문장·1396년 소속 문장
  - 확인: 2026-10-21T19:06:10.279939+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 종루가 있는 거리의 첫머리라는 어원과 징청방·서린방 관계가 일치한다.
- **연희동 · 원문 대조 완료**
  - 본문 `2edc28d9-ab41-4c45-9414-073fc6c27efd` · 자료 `b6839001-bbcf-435f-bdf2-2c9f65e8f3f8` · 검토 `8f41c2ce-b196-436f-a6e6-25e66c9a8851` / revision 1
  - 원문: https://www.sdm.go.kr/wesdm/history/origin.do
  - 위치: 동명 유래 > 연희동(延禧洞) > 첫 문장(연희궁터 추정) 및 하단 이용표시
  - 확인: 2026-10-21T19:06:12.459339+00:00 · 범위: neighborhood · 분류: inference
  - 판단: 연희궁터와 연결한 이름 풀이와 궁터 위치를 추정으로 남긴 한정이 일치한다.
- **을지로5가 · 원문 대조 완료**
  - 본문 `2f591a9d-cf8b-4174-bc03-afb056f02d55` · 자료 `d94d2958-3996-4e49-9bbb-604f69d8f522` · 검토 `1413fd13-c4a1-4a4b-9b94-d7ebb6c0db88` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%9D%84%EC%A7%80%EB%A1%9C5%EA%B0%80
  - 위치: 서울지명사전 > 법정동 > 을지로5가(乙支路5街) > txt-box0 1914년 병합·1946년 개칭
  - 확인: 2026-10-21T19:06:10.133238+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 명철방 연방동·오교동 등 일부 병합과 황금정5정목→을지로5가 개칭이 일치한다.
- **망우동 · 원문 대조 완료**
  - 본문 `2f9c33a6-5ccb-42fe-a14f-4d46694bd6be` · 자료 `590916c3-6fbe-447c-b0fd-0f82cd36d98d` · 검토 `821fd843-994b-4db0-b078-e57fc9398aca` / revision 1
  - 원문: https://ecatalog.jungnang.go.kr/src/viewer/download.php?host=main&no=1&site=20260213_163819
  - 위치: 2025 제37회 중랑통계연보 > PDF 319쪽(0-based 318) / 인쇄 319쪽 > ⅩⅦ 기타 > 동명 유래(계속) > 중단 망우동 단락
  - 확인: 2026-10-21T19:06:57.824622+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 망우리고개 유래와 도로 확장·구획정리 뒤 주거지·교육지구 변화가 해당 쪽과 일치한다.
- **보문동7가 · 원문 대조 완료**
  - 본문 `2ff48298-dd45-4487-b0bb-e9df25d62a38` · 자료 `e04c6926-8118-46d7-988c-b60661eda52b` · 검토 `dc6d7055-4331-437d-829c-f66878fb9904` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%B3%B4%EB%AC%B8%EB%8F%997%EA%B0%80
  - 위치: 서울지명사전 > 법정동 > 보문동7가(普門洞7街) > txt-box0 마지막 문장
  - 확인: 2026-10-21T19:06:16.282539+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 남쪽 지역에서 북쪽의 4·5가, 서쪽의 6가와 맞닿은 구분 설명이 일치한다.
- **63빌딩 설명문 · 원문 대조 완료**
  - 본문 `30d8c975-f907-41f0-8300-4f96fd57e31c` · 자료 `33eec426-9f53-475f-a8a2-137ecb6e406a` · 검토 `1178be29-08db-4b9b-ba96-8328c45ce008` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY489&fileId=H-TRNS-102594-491&fileSn=300&type=A&upperNodeId=CTGRY491
  - 위치: 서울생활문화자료조사 > 여의도 > 1980년대 중반 63빌딩의 모습(1984) > 명칭·시기·장소·자료출처·내용·개별 공공누리 표시
  - 확인: 2026-10-21T19:08:09.407398+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 기존 전사와 제공기관 내용 필드가 공백을 정규화하면 일치한다. 2020년 간행물의 설명문 대조로 한정한다.
- **가리봉동 131번지 배치 설명 · 원문 대조 완료**
  - 본문 `3131e550-0baf-442c-93ae-2b5f340cd0cf` · 자료 `34e5b7bb-faa4-42ec-8ef4-94afeadde043` · 검토 `278fed5e-98a9-40ba-a13f-1a6b134852ae` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY439&fileId=H-TRNS-54096-442&fileSn=300&type=A&upperNodeId=CTGRY442
  - 위치: 서울생활문화자료조사 > 가리봉동 > 131번지 일대 건물 배치와 형태 > 내용·장소·자료출처(2013, 265쪽)·개별 공공누리 표시
  - 확인: 2026-10-21T19:08:08.556829+00:00 · 범위: neighborhood · 분류: inference
  - 판단: 중정형·중복도형·편복도형의 혼재를 서술한 내용 필드와 기존 전사가 공백 정규화 후 일치한다.
- **영등포동8가 · 재확인 필요**
  - 본문 `31e60dc1-e580-4bfb-9930-7fb6dca94bb5` · 자료 `327e72ae-5e10-4f83-873a-bda657cdb69d` · 검토 `091ed50b-7059-4fec-a5c6-b05971d9eb9c` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%98%81%EB%93%B1%ED%8F%AC%EB%8F%998%EA%B0%80
  - 위치: 서울지명사전 > 법정동 > 영등포동8가(永登浦洞8街) > txt-box0 마지막 문장
  - 확인: 2026-10-21T19:06:22.791716+00:00 · 범위: neighborhood · 분류: inference
  - 판단: 등록 원문은 경부선 북쪽 구획정리 지역 일부를 나눴다고 설명한다. 기존 요약의 경부선 남쪽 영등포동 대비는 이 항목에서 명시적으로 확인되지 않아 공간 근거 보강 대상으로 남긴다.
- **삼각동 · 원문 대조 완료**
  - 본문 `31f948cd-6101-4d29-b811-8e32256da053` · 자료 `5918ba54-3f95-4146-9d0e-a9b1e942eb6c` · 검토 `83d21ead-c046-4e8e-9256-f7287ae97add` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%82%BC%EA%B0%81%EB%8F%99
  - 위치: 서울지명사전 > 법정동 > 삼각동(三角洞) > txt-box0 첫 문장·말미 1946년 개칭
  - 확인: 2026-10-21T19:06:30.321841+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 서쪽이 넓고 동쪽이 좁아지는 지형의 동명 풀이와 삼각정→삼각동 변화가 일치한다.
- **군자동 · 원문 대조 완료**
  - 본문 `320e886d-6a7f-44e3-b2da-13d17442bcda` · 자료 `53f81f18-f030-4d51-90de-29e8019f0879` · 검토 `f2431ed2-69a7-45a0-8a4e-8389af32b4fc` / revision 1
  - 원문: https://www.gwangjin.go.kr/portal/main/contents.do?menuNo=200271
  - 위치: 동명유래 > 군자동(君子洞) > 단일 연혁·전승 문단
  - 확인: 2026-10-21T19:06:29.942189+00:00 · 범위: neighborhood · 분류: mixed
  - 판단: 군자리→서울 편입→군자동 순서와 임금의 아들 출생 전승을 구분한 요약이 일치한다.
- **양평동2가 · 원문 대조 완료**
  - 본문 `328dbdc3-9412-4974-9c5d-a016c4e3e4d2` · 자료 `8f3d3630-09d0-4bc2-a339-338c1d7a03c1` · 검토 `2b2208fe-0075-4fc1-baa4-f15beda73ccc` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%96%91%ED%8F%89%EB%8F%992%EA%B0%80
  - 위치: 서울지명사전 > 법정동 > 양평동2가(楊坪洞2街) > txt-box0 마지막 문장
  - 확인: 2026-10-21T19:06:37.449596+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 안양천 둔치 일부를 양평동으로 남기고 구획정리 지역 일부를 나눈 설명이 일치한다.
- **공릉동 · 원문 대조 완료**
  - 본문 `328f6961-e99d-444b-8fa9-fc5f644f9ae9` · 자료 `670f5041-cf69-4599-aba7-a002966f3fd3` · 검토 `3150308f-a959-416d-b3f6-9dc9aebc99f4` / revision 1
  - 원문: https://www.nowon.kr/www/intrcn/intrcn1/intrcn1_05.jsp
  - 위치: 동명유래 > 공릉동 > 단일 문단(태릉동 제안·두 마을 협의)
  - 확인: 2026-10-21T19:06:37.041083+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 공덕리와 태릉의 글자 결합 및 편입 당시 명칭 협의 설명이 요약과 일치한다.
- **답십리동 · 원문 대조 완료**
  - 본문 `343986f1-bbde-47fe-9b8c-241db3f9c41d` · 자료 `2201a91e-e249-42ff-b093-03cb64a5be27` · 검토 `5ae4d849-270b-46d7-a73c-5126b4b32a9f` / revision 1
  - 원문: https://www.ddm.go.kr/tour/contents.do?key=2079
  - 위치: 동대문의 동명유래 > 답십리동 > 동명 여러 설·원마을·너머마을 문단(웹 294~297행)
  - 확인: 2026-10-21T19:11:36Z · 범위: neighborhood · 분류: tradition
  - 판단: 무학대사·동대문과의 거리·넓은 논 등 여러 설과 어느 것이 맞는지 알 수 없다는 한정, 자연마을 소개가 요약과 일치한다.
- **남창동 · 원문 대조 완료**
  - 본문 `34d9d7cb-4c23-4e43-b1a3-ae8f49fac06b` · 자료 `f8d55818-edb2-4c11-b23a-9e0814036f0e` · 검토 `6779e298-d4ea-4c45-b62f-f63214f009a7` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%82%A8%EC%B0%BD%EB%8F%99
  - 위치: 서울지명사전 > 법정동 > 남창동(南倉洞) > txt-box0 첫 문장·1914·1946년 변천 문장
  - 확인: 2026-10-21T19:06:41.876729+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 선혜청 창고 남쪽의 위치 설명과 남미창정→남창동 개칭이 일치한다.
- **수송동 · 원문 대조 완료**
  - 본문 `34eebecb-9e94-487e-9e1d-cf5c264914d1` · 자료 `924efa03-1571-43d3-934d-bee25d1e2d20` · 검토 `d898b602-81d6-43a2-b36f-825bde504d75` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%88%98%EC%86%A1%EB%8F%99
  - 위치: 서울지명사전 > 법정동 > 수송동(壽松洞) > txt-box0 첫 문장·1914년 통합 문장
  - 확인: 2026-10-21T19:06:46.238904+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 수동·송현 첫 글자의 결합 및 수진동·박동·괴정동·사복동 등 통합 설명이 일치한다.
- **북아현 1-1000번지 설명문 · 원문 대조 완료**
  - 본문 `35ff8772-ef87-4522-b415-1d8e4cd996a8` · 자료 `a01c2feb-6887-440d-946b-b4fd65db507d` · 검토 `50419343-fc17-4989-983b-58db7e776af1` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY424&fileId=H-TRNS-1887-426&fileSn=300&type=A&upperNodeId=CTGRY426
  - 위치: 서울생활문화자료조사 > 북아현 > 1-1000번지 일대 전경사진 > 내용·장소·자료출처(2009, 95쪽)·개별 공공누리 표시
  - 확인: 2026-10-21T19:08:13.824785+00:00 · 범위: neighborhood · 분류: inference
  - 판단: 기존 전사와 제공기관 내용 필드가 공백 정규화 후 일치한다. 형성 시기 미상·일제시기 추측·전후 밀집 해석을 그대로 구분했다.
- **신림동 · 재확인 필요**
  - 본문 `3611d30d-0310-4431-afa1-b466d7842064` · 자료 `10552854-b8dc-4a67-89c9-1be1d5e0dec1` · 검토 `d8be2b48-3551-4117-b7f3-36ac76daeb6e` / revision 1
  - 원문: https://www.gwanak.go.kr/site/gwanak/11/11101020000002016051207.jsp
  - 위치: 지역특성 > 신림동 지명유래 > 난곡 행 및 행정동 명칭 표 > 난곡동·난향동 선정 유래
  - 확인: 2026-10-21T19:06:58.104573+00:00 · 범위: neighborhood · 분류: conflict
  - 판단: 숲 유래·1963년 편입·옛 마을 소개는 대조했다. 난곡 지명 표의 강홍립 재배설과 행정동 난곡동 표의 강서 호 설명은 시기·명명 단위가 다를 수 있어 같은 어원으로 합치지 않고 확인 대기로 남긴다.
- **용산동3가 · 원문 대조 완료**
  - 본문 `36dda4df-56b4-4f1a-adb6-6cc7d2d9069c` · 자료 `9d447b20-3c8a-4e63-a832-13ffa955a383` · 검토 `10cd2472-0418-4c37-9642-77440b8e0b0a` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%9A%A9%EC%82%B0%EB%8F%993%EA%B0%80
  - 위치: 서울지명사전 > 법정동 > 용산동3가(龍山洞3街) > txt-box0 말미 1936·1943·1946년 변천
  - 확인: 2026-10-21T19:07:01.526025+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 둔지리의 경성부 편입, 한강통 분할과 용산정3정목·용산동3가 개칭 순서가 일치한다.
- **시흥리 06번 지적원도 설명 · 원문 대조 완료**
  - 본문 `386c69f6-e53e-4894-ad70-e9f85c19c265` · 자료 `c2ae548b-9181-4935-b172-8c832a7f065a` · 검토 `06682072-778a-4650-bf66-1c2521102f18` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY1113&fileId=aeb73b66-6258-4353-ae35-d73ac51546b3&fileSn=1030&type=A&upperNodeId=CTGRY1118
  - 위치: 서울생활문화자료조사 > 시흥동 > 1912년 지적원도, 시흥리 06번 도엽(srd-409001) > 내용·장소·자료출처(2023, 35쪽)·개별 공공누리 표시
  - 확인: 2026-10-21T19:08:13.705667+00:00 · 범위: neighborhood · 분류: inference
  - 판단: 토지 소유와 220번지의 넓은 범위를 해석한 박물관 내용 필드가 기존 전사와 공백 정규화 후 일치한다.
- **104마을 골목 설명문 · 원문 대조 완료**
  - 본문 `38f8e4ce-c621-4ebd-aed0-51465117abd8` · 자료 `2a6b05e3-8dc2-4d8c-b855-eeeba8675a2a` · 검토 `19dbcc4e-16b2-4e5b-b934-b77879d876ab` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY410&fileId=H-TRNS-56138-412&fileSn=300&type=A&upperNodeId=CTGRY412
  - 위치: 서울생활문화자료조사 > 104마을 > 104마을 골목 > 내용·장소·자료출처(2012, 97쪽)·개별 공공누리 표시
  - 확인: 2026-10-21T19:08:21.819272+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 백사마을 골목이라는 박물관 내용 필드와 기존 짧은 전사가 공백 정규화 후 일치한다.
- **홍은동 · 원문 대조 완료**
  - 본문 `3917cf26-bf8a-4446-b043-71a3505b0495` · 자료 `b6839001-bbcf-435f-bdf2-2c9f65e8f3f8` · 검토 `169df623-cfda-4c9e-b52d-52509c518082` / revision 1
  - 원문: https://www.sdm.go.kr/wesdm/history/origin.do
  - 위치: 동명 유래 > 홍은동(弘恩洞) > 첫 두 문장 및 하단 이용표시
  - 확인: 2026-10-21T19:06:12.459339+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 홍제외리·은평면의 글자 결합과 1949년 서울 편입이 요약과 일치한다.
- **흑석동 · 재확인 필요**
  - 본문 `3964f69a-6616-44f6-84a1-2ce7c21919da` · 자료 `9b1ec1e3-bb2d-45d4-8bd6-3a7d2952bb13` · 검토 `d7d7896c-8df4-40ed-8cbf-fa586c37ca07` / revision 1
  - 원문: https://www.dongjak.go.kr/portal/main/contents.do?menuNo=200754
  - 위치: 지명유래 > 흑석동 첫 문단·흑석나루·명수대 항목
  - 확인: 2026-10-21T19:10:36.714787+00:00 · 범위: neighborhood · 분류: mixed
  - 판단: 검은 돌 어원과 나루의 운송·정박 기능은 원문과 대조했다. 명수대의 1920년 별장·놀이터 조성은 원문이 전해지는 설명으로 한정하므로 기존 요약의 전승 한정 보강을 검토 대상으로 남긴다.
- **후암동 · 재확인 필요**
  - 본문 `3a80d4a6-83f0-4f61-912b-7f96f0882141` · 자료 `f79cba4d-4d89-46ab-bc92-c8b005a8dca8` · 검토 `9f5f7749-c6ac-48d4-94f5-958772731036` / revision 1
  - 원문: https://www.yongsan.go.kr/dong/main/contents.do?dongCd=01&menuNo=600004
  - 위치: 동 유래·동 연혁 > 두텁바위·전생서·1946년·1985년
  - 확인: 2026-10-21T19:07:07.399091+00:00 · 범위: neighborhood · 분류: unconfirmed
  - 판단: 등록 원문의 공개 GET이 HTTP 503, 웹 열람도 502로 실패해 명칭·연혁·전승·권리·공간을 대조하지 못했다. 기존 저장 요약만으로 내용을 승인하지 않는다.
- **익선동 · 원문 대조 완료**
  - 본문 `3b01ce81-14f9-4803-89a1-0b03472d1354` · 자료 `02d6c1c5-97f6-42d7-acc7-247474515716` · 검토 `5e03405f-885b-4f04-8a9f-3b1d468b9229` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%9D%B5%EC%84%A0%EB%8F%99
  - 위치: 서울지명사전 > 법정동 > 익선동(益善洞) > txt-box0 첫 문장·1914년 통합 문장
  - 확인: 2026-10-21T19:07:08.477857+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 익동과 정선방의 글자 결합, 궁동·익동·돈녕동 등의 통합 연혁이 요약과 일치한다.

## 다음 작업

다음 첫 미검토 본문은 `3b2adc85-6692-4e5d-82c1-9cf17a93a497`다. 다음 커서는 `/api/archive/task?view=passages&unreviewed=true&limit=30&after=`다. 미검토 504개와 보류 56개, 합계 560개를 남기고 review/ready로 계속한다. 아직 본문 단계의 완료 기준에 미달하므로 보강·대표 주소·화면·전체 동작 단계로 이동하지 않는다. 기존 예약을 유지한다. 최종 감사 소스 커밋은 운영 checkpoint의 auditSourceCommit에 기록한다.
