# 2026-10-23 본문 검토 21: 30개

운영 `/api/archive/task` 계획 version 2·마지막 review/ready 기록과 소스의 `data/history-maintenance-plan.json`, `docs/scheduled-history-work.md`, 직전 review-20 기록을 먼저 읽었다. Sites 절차로 소스 `0c78c6e9747944573d2bb6afea31f954e4228c1e`을 열었다. 소유자 한 명 전용 custom 정책 revision 1, 외부 방문자·편집자·그룹 0, 운영 version 36을 시작과 저장 직전에 확인했다. 실행 중인 다른 기록이 없었고 선택한 30개 ID를 review/running으로 저장한 뒤, 실제 쓰기 직전에 자신의 checkpoint·전체 대상·리비전·지문·집계를 다시 확인했다.

법정동 467개 공식 상태 확인은 완료 상태로 유지된다. 주소 관측 464개와 공식 원문 단독 3개를 구분한다. 공식 코드 자료는 2026-10-20 조회 기준이며 오늘 새 법령 상태를 조회한 것으로 보고하지 않는다. 최초 미완료인 본문 단계에서 다음 30개를 처리했다.

| 지표 | 이전 | 이후 |
|---|---:|---:|
| 현재 본문 | 638 | 638 |
| 최신 검토가 있는 본문 | 584 | 614 |
| 원문 대조 완료 | 478 | 505 |
| 재확인 필요 | 106 | 109 |
| 미검토 | 54 | 24 |
| 미완료 합계 | 160 | 133 |

## 이번 결과와 검토 한계

27개 원문 대조 완료·3개 보류를 운영 DB에 저장하고 재조회했다. 용산동2가·효창동·원효로3가는 등록 용산구 URL 직접 GET 2회 모두 503, 같은 URL의 웹 열람 2회도 접근 실패였다. 실제 해당 문단과 이용조건을 대조하지 못해 6개 검사는 unresolved, 분류는 unconfirmed로 남겼다. 원효로3가의 기존 명칭·연대 불일치 결론 보류도 유지했다. 과거 수집문으로 완료를 대신하거나 일시 장애를 원문 폐지로 단정하지 않았다.

공식 URL 27개 중 24개에서 응답 바이트·SHA-256·확인시각을 확보하고 저장 바이트의 해시를 다시 확인했다. 박물관 설명문 전사 9개는 공백 정규화 후 개별 내용 필드와 모두 일치했다. 원사진·지도·책·그래프 이미지의 세부 판독이나 인용 사료 원본의 독립 대조로 집계하지 않는다.

북촌 소개의 div.dong-txt와 같은 URL 웹 338~340행을 대조하여 기존 요약과 연표 재서술 4개를 검토했다. 두 궁 사이·율곡로 경계의 역사 권역을 단일 법정동·개별 필지로 환산하지 않았다. 1863~1962년 조사 집중 기간, 조선시대 종친·경화세족 집터, 일제강점기 근대시설·도시한옥, 광복·전쟁 이후 주거 재편을 구분했다. 소개의 목록 407건을 전수 열람·주소 연결 완료로 집계하지 않았다.

동대문구 인구 그래프의 옛 행정구역과 현재 중랑구 장소 메타, 1963~1972년 대상과 2022년 책을 구별했다. 전답지구라는 원문 표기를 임의로 고치지 않았다. 구 정신여학교의 정동 창립·연지동 촬영·잠실 이전, 치성기의 1965년 자료·1994년 이후 방식 변화·2008년 책, 2009년 왕십리 공장과 현재 영업 여부도 구분했다.

적산가옥 거주계층 인식·광장시장 최초 표현과 품목 비중·101경비단 주변 철거와 풍치지구 해석은 당시 제공기관의 서술이다. 2026년의 주민 특성·시장 통계·시설 현황·현행 규제 판정으로 올리지 않았다. 노량진 원문의 지금의 동작구청도 현재 청사 위치의 새 확인으로 취급하지 않았다. 방배동 페이지의 정조 일화는 전승으로 남기고, 요약 밖의 춘향전 기년 언급은 별도 원전 대조 없이 명명 연대의 근거로 채택하지 않았다.

박물관 개별 상세 9개에서 공공누리 제1유형 링크와 이미지를 재확인했다. 기존 권리 URL·보관·재사용 설정을 유지했다. 북촌 소개 목록과 나머지 지명 페이지에는 개별 추가 허락이 확인되지 않아 unknown·보관 0·재사용 0을 유지했고, 다른 사진 상세의 제1유형을 소개 전체에 확대하지 않았다. 원문 HTML은 내부 대조용으로만 사용하며 최종 소스에는 해시·위치·시각·판단을 남긴다.

## 운영 검증

기존 validatePassageReview로 최종 입력 30개를 검증했다. 운영 저장 오류·충돌·중복은 0건이다. 본문 638개의 ID·본문·본문/자료 버전·URL·권리·지역 연결 지문이 동일하며 비대상 608개 전체 응답과 이전 최신 검토 584개를 보존했다. 대상 자료 27개의 메타데이터·버전·연표·자산·지역·수집 이력도 동일하다.

신규 검토 30개는 전체 목록과 자료별 검토 API에서 검토 ID·revision 1·상태·활성 여부·행위자·전체 근거를 재조회했다. 감사 30개가 검토 ID와 대응한다. 이전에 응답된 감사 100개의 순서를 확인했고 응답 한도 밖으로 밀린 기존 행은 0개다. API에서 반환되지 않는 과거 전체 감사의 전수 검증을 주장하지 않는다. 설명문 전사·접속 보류·북촌 재서술의 동일 요청 3개를 재시도해 같은 ID·unchanged:true와 집계 불변을 확인했다.

coverage의 법정동 연결 대조 완료가 14개 증가했다. 자료·버전 593개, 본문 638개, 연표 21개, 자산 20개와 지역 코드 현황은 유지된다. 애플리케이션 변경 없이 운영 데이터만 갱신하여 코드 테스트·타입 검사·빌드·재배포를 반복하지 않았다. 입력 검증·저장·재조회·감사·멱등성 검사로 이번 변경을 확인했다. 작업 기록은 Git 소스에 동기화하고 커밋과 파일 해시를 최종 checkpoint에 남긴다.

## 처리 ID·출처·결과

- **1963~1972년 동대문구 지구별 인구동태 변화 · 원문 대조 완료**
  - 본문 `f2f34ef4-6608-40cd-ae7e-567cc480a258` · 자료 `13af8645-1e02-4374-ad35-87aa295d8b1c` · 검토 `4eed95ae-1605-433e-8bd4-e15466b131cf` / revision 1
  - 감사: passage_content_review / 2026-10-23T11:15:20.867Z
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY1077&fileId=d7bc6aa8-1cfd-4a14-bdb4-25356eba9878&fileSn=861&type=A&upperNodeId=CTGRY1081
  - 위치: 상세 자료 > 내용 항목 · 『망우동(2022)』, p. 254. / 개별내용필드·공백정규화전사일치
  - 확인: 2026-10-23T11:09:40.163418+00:00 · 범위: neighborhood · 분류: inference
  - 판단: 1963~1972년 동대문구 인구동태 설명문 전사는 일치했다. 도로·구획정리와 인구증가의 관계는 2022년 제공기관의 재구성 해석으로 구별했다.

- **용산동2가 · 재확인 필요**
  - 본문 `f2fa7626-5246-4173-b3df-7b3bc714c3dc` · 자료 `a5e681d2-8717-4685-baf8-840d4191f465` · 검토 `ad6c078a-7fef-453d-b5c7-eb7ff06e5111` / revision 1
  - 감사: passage_content_review / 2026-10-23T11:15:24.076Z
  - 원문: https://www.yongsan.go.kr/dong/main/contents.do?dongCd=02&menuNo=600204
  - 위치: 동 연혁 > 1914년·1941년·1946년 / 등록원문접근실패
  - 확인: 2026-10-23T11:15:11.175822+00:00 · 범위: neighborhood · 분류: unconfirmed
  - 판단: 용산동2가의 등록 용산구 원문은 직접GET2회503·같은URL 웹2회접근실패로 실제 해당문단과이용조건을대조하지못했다. 과거수집문으로완료를대신하지않고일시적장애를원문영구폐지로단정하지않았다.

- **태평로1가 · 원문 대조 완료**
  - 본문 `f3f52ffd-c552-4a2d-afad-1ca090362f0e` · 자료 `e979f930-56dc-4cfe-b273-4bf4ada10642` · 검토 `d6a2bee4-77cc-4b3c-9766-e23ab5f59882` / revision 1
  - 감사: passage_content_review / 2026-10-23T11:15:27.355Z
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%ED%83%9C%ED%8F%89%EB%A1%9C1%EA%B0%80
  - 위치: 법정동 태평로1가 > p.txt-box0 > 1914.4.1 각일부 통합·태평통1정목 및1946.10.1 개칭 문장
  - 확인: 2026-10-23T11:09:40.164514+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 태평로1가의1914년 일부지역 통합·태평통1정목 명명과1946년 개칭을 대조했다.

- **당인동 · 원문 대조 완료**
  - 본문 `f40de3b4-d5c3-4431-9038-ae688f234ae8` · 자료 `ba92c965-a182-47a2-9da6-30595b9b10a2` · 검토 `8ff3da2b-4bec-433d-ae66-b840c72c677e` / revision 1
  - 감사: passage_content_review / 2026-10-23T11:15:29.720Z
  - 원문: https://www.mapo.go.kr/site/culture/content/culture0302
  - 위치: 동이름의 유래 > 중부 > 당인동 > 왜군·명군 주둔/댕말 명명 첫 단락
  - 확인: 2026-10-23T11:09:40.166541+00:00 · 범위: neighborhood · 분류: tradition
  - 판단: 당인동의 임진왜란 당시 군대 주둔·댕말 명명 이야기를 공식 지명 유래 단락과 대조했다.

- **삼선동5가 · 원문 대조 완료**
  - 본문 `f498a44a-fbe7-47b9-9630-324602983134` · 자료 `7fdbf04d-ab78-4698-a0b2-caab7b6d28ac` · 검토 `cdf9d6d2-4d3a-4e96-882b-a09c04c7b555` / revision 1
  - 감사: passage_content_review / 2026-10-23T11:15:32.581Z
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%82%BC%EC%84%A0%EB%8F%995%EA%B0%80
  - 위치: 법정동 삼선동5가 > p.txt-box0 > 1955행정동/1963법정동 및말미 구청·경찰서 중심 동쪽
  - 확인: 2026-10-23T11:09:44.268509+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 삼선동5가의1963년 법정동 신설·구청과 경찰서 동쪽 구분 설명을 대조했다.

- **효창동 · 재확인 필요**
  - 본문 `f5286d95-4c96-4a55-8a72-e1e949e41029` · 자료 `4fc96103-61f1-4a14-9fac-73b2b86a5249` · 검토 `a3a58241-683b-44b6-ab7a-4c14437d7df2` / revision 1
  - 감사: passage_content_review / 2026-10-23T11:15:35.298Z
  - 원문: https://www.yongsan.go.kr/dong/main/contents.do?dongCd=07&menuNo=600704
  - 위치: 동유래 > 효창원·하마비계 / 등록원문접근실패
  - 확인: 2026-10-23T11:15:11.175822+00:00 · 범위: neighborhood · 분류: unconfirmed
  - 판단: 효창동의 등록 용산구 원문은 직접GET2회503·같은URL 웹2회접근실패로 실제 해당문단과이용조건을대조하지못했다. 과거수집문으로완료를대신하지않고일시적장애를원문영구폐지로단정하지않았다.

- **방배동 · 원문 대조 완료**
  - 본문 `f52b62f8-b3d1-49ff-8cf4-134407f681c2` · 자료 `cb6b2f60-e279-4b85-9650-ccd6d66e8af5` · 검토 `e64410ad-75d5-45c4-a566-bacb3836e6c9` / revision 1
  - 감사: passage_content_review / 2026-10-23T11:15:37.971Z
  - 원문: https://www.seocho.go.kr/site/seocho/05/10502040500002015070810.jsp
  - 위치: 방배동 지명유래 > 방배동 첫두문단(과천군·1914·1963) 및남태령 일화·말미 정조이전 언급
  - 확인: 2026-10-23T11:09:45.008048+00:00 · 범위: neighborhood · 분류: mixed
  - 판단: 방배동의 우면산을 등진 마을 어원과1914·1963년 연혁, 남태령의 정조 일화를 구별해 대조했다.

- **'일본집'이라 불리는 적산가옥 · 원문 대조 완료**
  - 본문 `f679f16e-92a1-443a-9cc3-cc269558b0e3` · 자료 `c8155179-753a-4082-9adc-639cae82cbf0` · 검토 `bd468711-922d-4822-aef2-d1f847a8fee3` / revision 1
  - 감사: passage_content_review / 2026-10-23T11:15:41.448Z
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY365&fileId=H-TRNS-84992-367&fileSn=300&type=A&upperNodeId=CTGRY367
  - 위치: 상세 자료 > 내용 항목 · 『청파·서계; 서울역 뒷동네』(2017), 96쪽 / 개별내용필드·공백정규화전사일치
  - 확인: 2026-10-23T11:09:48.212490+00:00 · 범위: neighborhood · 분류: inference
  - 판단: 적산가옥 설명문 전사는 일치했다. 노후와 거주계층의 평가는2016년 사진·2017년 조사서의 당시 인식으로 한정했다.

- **18세기 돈암지역 · 원문 대조 완료**
  - 본문 `f72e2d9c-37f8-46c2-8c27-1340e11dc99f` · 자료 `ad609057-4401-45de-b898-eb33d3e3d46a` · 검토 `3339853a-2341-4558-979f-1061ea39b70a` / revision 1
  - 감사: passage_content_review / 2026-10-23T11:15:44.466Z
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY1024&fileId=b9d035e0-d52e-4e07-9e41-6ca6e0aa2989&fileSn=596&type=A&upperNodeId=CTGRY1026
  - 위치: 상세 자료 > 내용 항목 · 『돈암(2021)』, p. 32. / 개별내용필드·공백정규화전사일치
  - 확인: 2026-10-23T11:09:48.652322+00:00 · 범위: neighborhood · 분류: inference
  - 판단: 18세기 돈암지역의 도성대지도 부분도 설명문은 일치했다. 산지·성북천·휴식처 해석을 현대 경계와 구분했다.

- **인현동2가 · 원문 대조 완료**
  - 본문 `f76f01a7-90a5-4c76-992e-e3604e175d28` · 자료 `2bae7871-26d0-48d3-b74a-9b83ddd645d6` · 검토 `1efb7267-ef33-46b2-8aaa-7c5e9529f650` / revision 1
  - 감사: passage_content_review / 2026-10-23T11:15:47.480Z
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%9D%B8%ED%98%84%EB%8F%992%EA%B0%80
  - 위치: 법정동 인현동2가 > p.txt-box0 > 1914.4.1 소인현동 병합·앵정정2정목 및1946.10.1 개칭
  - 확인: 2026-10-23T11:09:51.093704+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 인현동2가의1914년 소인현동 등 병합·앵정정2정목과1946년 개칭을 대조했다.

- **봉원동 · 원문 대조 완료**
  - 본문 `f78a4c51-bca8-45dc-9c2a-4faf8c14c907` · 자료 `ec1a4623-4bda-4030-9b89-99253b3b09fb` · 검토 `cbca7583-9e60-46d3-b990-6d8c1b193eb6` / revision 1
  - 감사: passage_content_review / 2026-10-23T11:15:50.226Z
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%B4%89%EC%9B%90%EB%8F%99
  - 위치: 법정동 봉원동 > p.txt-box0 > 첫봉원사 유래 및1914.4.1/1936.4.1/1946.10.1 변천
  - 확인: 2026-10-23T11:09:51.866647+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 봉원동의 봉원사 유래·1914년 봉원리·1936년 봉원정·1946년 개칭을 대조했다.

- **(구)정신여학교 전경 · 원문 대조 완료**
  - 본문 `f88c3d12-7309-4c87-a2c4-1a306dca1e8a` · 자료 `c3bc08c0-f0a6-4f8e-aa9d-b134b0abe180` · 검토 `869759f9-089a-45a1-a824-1983a369e73a` / revision 1
  - 감사: passage_content_review / 2026-10-23T11:15:52.794Z
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY304&fileId=H-TRNS-103666-310&fileSn=300&type=A&upperNodeId=CTGRY310
  - 위치: 상세 자료 > 내용 항목 · 원문 상세 페이지 / 개별내용필드·공백정규화전사일치
  - 확인: 2026-10-23T11:09:52.619641+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 구 정신여학교 설명문 전사는 일치했다. 정동 창립·연지동 이전·잠실 이전은 서로 다른 장소·시점으로 구별했다.

- **보문동5가 · 원문 대조 완료**
  - 본문 `f92555e6-9d2f-4cda-9c78-41597cc12842` · 자료 `fd375e78-911b-4f39-8ec6-9af5bb8acf59` · 검토 `ea13183a-2dc5-45e4-8c6d-173d0914b870` / revision 1
  - 감사: passage_content_review / 2026-10-23T11:15:55.753Z
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%B3%B4%EB%AC%B8%EB%8F%995%EA%B0%80
  - 위치: 법정동 보문동5가 > p.txt-box0 > 1955.4.18 행정동제·말미 난계로 서쪽/4가 반대편/6가 사이
  - 확인: 2026-10-23T11:09:53.402580+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 보문동5가의1955년 보문동 분리와난계로 서쪽·4가 반대편·6가 사이 위치 설명을 대조했다.

- **묵정동 · 원문 대조 완료**
  - 본문 `f9590640-88d3-49d6-a3b7-d5437c60c846` · 자료 `d5e719ae-7120-45c0-9149-bcb96102fb5d` · 검토 `8b775414-148e-4bb1-8e7a-98e332bfeadd` / revision 1
  - 감사: passage_content_review / 2026-10-23T11:15:58.038Z
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%AC%B5%EC%A0%95%EB%8F%99
  - 위치: 법정동 묵정동 > p.txt-box0 > 첫먹절골 감정우물 및1914.4.1 新町/1946.10.1 개칭
  - 확인: 2026-10-23T11:09:54.257896+00:00 · 범위: neighborhood · 분류: mixed
  - 판단: 묵정동의 먹절골 감정우물 어원과1914년 신정·1946년 묵정동 개칭을 대조했다.

- **동선동4가 · 원문 대조 완료**
  - 본문 `f9cbf52d-d070-4074-9789-271dcc99ac14` · 자료 `424cc60d-a21e-4e03-bbf9-efbbf1cf390a` · 검토 `457364d0-fc0c-49c5-ab43-4ea8cb4198d2` / revision 1
  - 감사: passage_content_review / 2026-10-23T11:16:01.671Z
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%8F%99%EC%84%A0%EB%8F%994%EA%B0%80
  - 위치: 법정동 동선동4가 > p.txt-box0 > 1949행정동 분리·말미1963.1.1 법정동/4가 신설
  - 확인: 2026-10-23T11:09:54.450209+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 동선동4가의1949년 행정동 분리와1963년 법정동 신설 설명을 대조했다.

- **104마을 가옥 대문 · 원문 대조 완료**
  - 본문 `f9ea4240-810f-49f0-a6d5-1e1f0507e2f6` · 자료 `429ddd78-9010-4d97-87ea-d2f79ceea5bc` · 검토 `1812ffcc-f745-4031-8ea2-71d0a8395dd7` / revision 1
  - 감사: passage_content_review / 2026-10-23T11:16:05.149Z
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY410&fileId=H-TRNS-56145-412&fileSn=300&type=A&upperNodeId=CTGRY412
  - 위치: 상세 자료 > 내용 항목 · 『104마을; 중계본동 산 104번지』(2012), 101쪽 / 개별내용필드·공백정규화전사일치
  - 확인: 2026-10-23T11:09:55.867489+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 104마을 가옥 대문 설명문 전사는 일치했다. 개별 가옥을 특정하지 않은 당시 사진 설명으로 유지했다.

- **노량진동 · 원문 대조 완료**
  - 본문 `fa217ac1-07e2-42d9-b716-8f1918b99950` · 자료 `6d853e5d-84f8-4de8-993d-e1ac3263a66f` · 검토 `7aad2e9a-50a9-4015-b419-b87076264d03` / revision 1
  - 감사: passage_content_review / 2026-10-23T11:16:07.714Z
  - 원문: https://www.dongjak.go.kr/portal/main/contents.do?menuNo=200752
  - 위치: 지명유래 > 노량진동 첫노들나루 문단 및독막(점말) 첫문단(옹기·노들나루·1950년대말)
  - 확인: 2026-10-23T11:09:56.316550+00:00 · 범위: neighborhood · 분류: mixed
  - 판단: 노량진동 첫문단의노들나루 교통과독막(점말)의옹기 제작·나루 반입 설명을 대조했다.

- **3층에서 내려다 본 만남의 광장 · 원문 대조 완료**
  - 본문 `fb76f576-3cd3-495d-8bab-27489fd4d2ec` · 자료 `0ce17c1f-d714-481a-9902-c1e3895e047b` · 검토 `f85e69de-bffe-426d-bddf-7f32eb33dd5a` / revision 1
  - 감사: passage_content_review / 2026-10-23T11:16:09.972Z
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY311&fileId=H-TRNS-57672-315&fileSn=300&type=A&upperNodeId=CTGRY315
  - 위치: 상세 자료 > 내용 항목 · 『동대문시장; 광장·중부·방산』(2012), 376-377쪽 / 개별내용필드·공백정규화전사일치
  - 확인: 2026-10-23T11:09:56.475919+00:00 · 범위: neighborhood · 분류: inference
  - 판단: 광장시장 만남의광장 설명문 전사는 일치했다.1905년 개장과품목별 비중·최초 표현은 제공기관 당시 서술로 한정했다.

- **101경비단 · 원문 대조 완료**
  - 본문 `fba1e1ed-1eb6-4bf6-b67e-2a462af8d164` · 자료 `41256ab7-c5d3-4464-87b4-c09b3f9826ba` · 검토 `526abf14-4175-42a9-91db-1cbaa2e39ff6` / revision 1
  - 감사: passage_content_review / 2026-10-23T11:16:12.452Z
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY267&fileId=H-TRNS-8771-285&fileSn=300&type=A&upperNodeId=CTGRY285
  - 위치: 상세 자료 > 내용 항목 · 『서촌; 사람들의 삶과 일상』(2010), 255쪽 / 개별내용필드·공백정규화전사일치
  - 확인: 2026-10-23T11:09:56.544942+00:00 · 범위: neighborhood · 분류: inference
  - 판단: 101경비단 설명문 전사는 일치했다.1989년 학교 이전과2010년의경비·철거·풍치지구 해석을 현재 규제·시설 현황과 구분했다.

- **통의동 · 원문 대조 완료**
  - 본문 `fbe7b829-a033-472a-bdf6-cd81d636111a` · 자료 `7a0207c6-2d00-4ea9-855f-f7d46497cc96` · 검토 `34a4dacf-386f-4c1e-ae4d-3a5398684957` / revision 1
  - 감사: passage_content_review / 2026-10-23T11:16:15.751Z
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%ED%86%B5%EC%9D%98%EB%8F%99
  - 위치: 법정동 통의동 > p.txt-box0 > 첫의통방/통의방 어원 및의통방·순화방 연혁
  - 확인: 2026-10-23T11:09:59.088512+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 통의동의 의통방에서통의방으로이어진 명명과의통방·순화방의지역변천 설명을 대조했다.

- **불광동 · 원문 대조 완료**
  - 본문 `fc363846-b23f-4376-a10d-23d892a8fd0b` · 자료 `027663f9-96c6-4462-9559-a1ac6c46e174` · 검토 `d71b9e9a-63ff-43a9-9c02-31ffef9d7ab4` / revision 1
  - 감사: passage_content_review / 2026-10-23T11:16:18.221Z
  - 원문: https://www.ep.go.kr/dong/contents.do?key=3916
  - 위치: 불광1동 > 우리동이야기 > 동유래 첫사찰/바위·서광 전승 및동역사1914/1949/1950 문장
  - 확인: 2026-10-23T11:09:59.210556+00:00 · 범위: neighborhood · 분류: mixed
  - 판단: 불광동의 사찰·바위 어원전승과1914년 불광리·1950년 불광동 개칭을 대조했다.

- **원효로3가 · 재확인 필요**
  - 본문 `fd0b8fe0-2520-46f8-b529-39112efb519a` · 자료 `e0cb943c-c164-49e2-9206-e90582053b66` · 검토 `c70fe603-3246-4bfe-8b67-2ede0de45766` / revision 1
  - 감사: passage_content_review / 2026-10-23T11:16:20.721Z
  - 원문: https://www.yongsan.go.kr/dong/main/contents.do?dongCd=06&menuNo=600604
  - 위치: 동유래 > 원효로3가 / 등록원문접근실패
  - 확인: 2026-10-23T11:15:11.175822+00:00 · 범위: neighborhood · 분류: unconfirmed
  - 판단: 원효로3가의 등록 용산구 원문은 직접GET2회503·같은URL 웹2회접근실패로 실제 해당문단과이용조건을대조하지못했다. 과거수집문으로완료를대신하지않고일시적장애를원문영구폐지로단정하지않았다. 기존요약에있는동명변천연대·명칭불일치의결론보류도유지한다.

- **봉래동2가 · 원문 대조 완료**
  - 본문 `fd7a6324-a041-4906-add5-9247d658e69e` · 자료 `061d9d61-13a5-485b-bea6-dfefb0e2adc2` · 검토 `01cc1314-f6ee-4473-ac3e-e5fb44bbf610` / revision 1
  - 감사: passage_content_review / 2026-10-23T11:16:23.279Z
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%B4%89%EB%9E%98%EB%8F%992%EA%B0%80
  - 위치: 법정동 봉래동2가 > p.txt-box0 > 1914.4.1 약전계중동일부·봉래정2정목 및1946.10.1 개칭
  - 확인: 2026-10-23T11:10:02.298561+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 봉래동2가의1914년약전계 중동일부·봉래정2정목과1946년개칭을대조했다.

- **신길동 · 원문 대조 완료**
  - 본문 `fdde79db-834d-4f6e-a065-9f513b8b23f5` · 자료 `49bfa954-ee68-4046-bb46-23b1bd573aca` · 검토 `6d51b327-cd6d-4bfd-add9-b72d68f9813d` / revision 1
  - 감사: passage_content_review / 2026-10-23T11:16:26.042Z
  - 원문: https://www.ydp.go.kr/www/contents.do?key=2887
  - 위치: 동명칭및지명유래 > 신길동 > 첫신기리추정·가마골·밤동산(대림동항목이전)
  - 확인: 2026-10-23T11:10:03.354830+00:00 · 범위: neighborhood · 분류: tradition
  - 판단: 신길동의 좋은일을기원하는명명추정과가마골·밤동산 옛마을 설명을대조했다.

- **『치성기(致誠記)』(1965) · 원문 대조 완료**
  - 본문 `ff064c12-eed1-4bb8-b613-54a21027d8a6` · 자료 `7cafa2b6-48b9-414d-abe4-2545bf001eaf` · 검토 `ccd5b9ec-3514-4453-946b-775f566137a4` / revision 1
  - 감사: passage_content_review / 2026-10-23T11:16:28.747Z
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY344&fileId=H-TRNS-4222-351&fileSn=300&type=A&upperNodeId=CTGRY351
  - 위치: 상세 자료 > 내용 항목 · 『보광동 사람들, 보광동』(2008), 1권, 183쪽 / 개별내용필드·공백정규화전사일치
  - 확인: 2026-10-23T11:10:04.130844+00:00 · 범위: neighborhood · 분류: mixed
  - 판단: 치성기 설명문 전사는일치했다.1965년자료와1994년이후기록방식변화·당주/화주역할고정의해석을구별했다.

- **'큰길(이문께길)' 일대 금형공장들 · 원문 대조 완료**
  - 본문 `ff80cbf5-9736-40f0-b364-f7da1425f563` · 자료 `89fa9f2e-3264-4080-b49c-6eb95f7f6881` · 검토 `30dd547f-39d2-4601-b9ee-09b66ca52ac2` / revision 1
  - 감사: passage_content_review / 2026-10-23T11:16:31.898Z
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY385&fileId=H-TRNS-6509-395&fileSn=300&type=A&upperNodeId=CTGRY395
  - 위치: 상세 자료 > 내용 항목 · 『왕십리; 사람들의 삶과 이야기』(2009), 152쪽 / 개별내용필드·공백정규화전사일치
  - 확인: 2026-10-23T11:10:05.013715+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 왕십리뉴타운3구역 큰길(이문께길) 금형공장 설명문 전사는일치했다.

- **서울생활문화자료조사 · 북촌 · 원문 대조 완료**
  - 본문 `legacy-bukchon` · 자료 `36860126-40c8-41e5-b0bd-16b82fc0d960` · 검토 `5266735e-3824-401e-8561-79855df62d5d` / revision 1
  - 감사: passage_content_review / 2026-10-23T11:16:34.410Z
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveList.do?ctgryId=CTGRY298&type=A
  - 위치: 서울생활문화자료조사 > 북촌 > 소개첫3문단(웹338~340행) / div.dong-txt
  - 확인: 2026-10-23T11:10:06.314985+00:00 · 범위: neighborhood · 분류: inference
  - 판단: 북촌소개와1863~1962년조사집중기간·근대시설/도시한옥/전후주거재편을대조했다. 단일법정동이아닌역사권역으로한정했다.

- **서울생활문화자료조사 · 북촌 · 원문 대조 완료**
  - 본문 `legacy-bukchon-event-0` · 자료 `36860126-40c8-41e5-b0bd-16b82fc0d960` · 검토 `bd151299-97d8-4b6a-a621-fe1df20b7e2a` / revision 1
  - 감사: passage_content_review / 2026-10-23T11:16:37.385Z
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveList.do?ctgryId=CTGRY298&type=A
  - 위치: 서울생활문화자료조사 > 북촌 > 소개3문단첫문장(웹340행) / div.dong-txt
  - 확인: 2026-10-23T11:10:06.314985+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 북촌소개3문단의조선시대왕실종친·경화세족집터서술이선택요약과일치했다.

- **서울생활문화자료조사 · 북촌 · 원문 대조 완료**
  - 본문 `legacy-bukchon-event-1` · 자료 `36860126-40c8-41e5-b0bd-16b82fc0d960` · 검토 `0410fad8-707d-4516-a6e7-bfeec96c4859` / revision 1
  - 감사: passage_content_review / 2026-10-23T11:16:40.257Z
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveList.do?ctgryId=CTGRY298&type=A
  - 위치: 서울생활문화자료조사 > 북촌 > 소개3문단중간 학교/교회·대형필지/도시한옥(웹340행) / div.dong-txt
  - 확인: 2026-10-23T11:10:06.314985+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 북촌소개3문단의학교·교회유입과주인바뀐대형필지에도시한옥조성서술을대조했다.

- **서울생활문화자료조사 · 북촌 · 원문 대조 완료**
  - 본문 `legacy-bukchon-event-2` · 자료 `36860126-40c8-41e5-b0bd-16b82fc0d960` · 검토 `feadfa94-5d64-4083-abf2-cc552c684e65` / revision 1
  - 감사: passage_content_review / 2026-10-23T11:16:42.720Z
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveList.do?ctgryId=CTGRY298&type=A
  - 위치: 서울생활문화자료조사 > 북촌 > 소개3문단말미 광복/한국전쟁·주민유출입/판잣집(웹340행) / div.dong-txt
  - 확인: 2026-10-23T11:10:06.314985+00:00 · 범위: neighborhood · 분류: inference
  - 판단: 북촌소개3문단말미의광복·한국전쟁시기주민유출입과판잣집주거지재편을대조했다.

## 다음 작업

다음 첫 미검토는 **서울생활문화자료조사 · 창신동** (`legacy-changsin`, `지역 소개 본문에 근거한 기존 재서술 · 원문 직접 인용 아님`)다. 커서는 `/api/archive/task?view=passages&unreviewed=true&limit=30&after=`다. 미검토 24개·보류 109개·미완료 133개로 review/ready를 기록하고 본문 단계에서 이어간다. 전체 계획의 완료 기준을 충족하지 않아 다음 단계로 넘어가거나 예약을 일시 중지하지 않는다.
