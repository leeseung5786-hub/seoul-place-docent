# 2026-10-23 본문 검토 14: 30개

운영 `/api/archive/task`의 version 2 계획·직전 review/ready 기록과 `data/history-maintenance-plan.json`, `docs/scheduled-history-work.md`, `docs/history-work-2026-10-23-review-13.md`를 먼저 읽었다. 법정동 467/467 공식 현존 확인을 재조회하고 기존 본문 검토 단계에서 하중동부터 미검토 30개를 선택했다. 다른 running 기록은 없었고 이번 배치의 review/running을 저장했다. 쓰기 직전 자신의 checkpoint·집계·대상 30개의 전체 응답과 지문·버전을 다시 대조했다.

Sites 소스 열기로 초기 `5f334c5d5a15c72f44d161b21bc194040b59e636`을 확인했다. 같은 시각 사진 CSV 반영 작업이 별도로 있어 이를 변경하지 않도록 전용 소스 복사본을 사용했고, 사진 작업 완료 후 원격 소스 `4cf454c5ce87f8eebf0a8d16b58e7ea4cee97467`로 다시 열었다. 시작 시 배포 version 31, 쓰기 전 version 32는 별도 사진 업데이트의 배포이며 이번 묶음은 애플리케이션 코드 변경이나 배포를 하지 않았다. 소유자 1명 전용 custom 정책 revision 1, 외부 방문자·편집자·그룹 0을 확인하고 그대로 유지했다.

| 지표 | 이전 | 이후 |
|---|---:|---:|
| 현재 본문 | 638 | 638 |
| 최신 검토 기록이 있는 본문 | 374 | 404 |
| 원문 대조 완료 | 290 | 317 |
| 재확인 필요 | 84 | 87 |
| 아직 검토하지 않음 | 264 | 234 |
| 미완료 합계 | 348 | 321 |

## 보류 사유와 대조의 한계

27개를 원문 대조 완료, 3개를 재확인 필요로 기록했다. 갈월동·응봉동은 등록 원문의 직접 공개 GET 두 차례가 모두 HTTP 503이었다. 갈월동의 웹 원문 두 차례 접근도 실패했고 응봉동 두 차례는 시간 초과였다. 원문을 열람하지 못한 두 본문의 여섯 검사를 모두 unresolved로 남겼으며, 접속 실패를 원문 폐지나 영구 장애로 진단하지 않았다.

북아현동의 구청 원문은 아이 시체가 넘는 고개라는 어원이 정확하지 않다고 명시한다. 연혁은 1964년 편입 설명 뒤 1955년 분동을 서술한다. 서로 다른 행위의 나열일 수도 있어 잘못된 연도라고 단정하지 않았고, 추가 원문 없이 인과·선후를 확정하지 못하므로 chronology·consistency를 unresolved, classification을 unconfirmed로 남겼다. 본문에 있던 추가 대조 안내와 기존 ID·문장을 보존했다.

등촌동은 직접 공개 GET 두 차례 503과 별개로 정확한 등록 웹 원문의 등촌동 333~335행 및 저작권정책 378행·저작권 390행을 읽었다. 해시는 직접 응답 바이트를 확보하지 않았으므로 null이다. 다른 URL·과거 수집문을 성공한 등록 원문의 대조로 대체하지 않았다. 이번 묶음 밖의 기존 보류 84개는 재처리하지 않았다.

## 명칭·연대·전승·공간

효제동의 두 설, 팔판동의 이름이 전하지 않는 여덟 판서, 마천동의 백마 이야기, 고척동의 두 어원, 반포동의 두 해석을 구별했다. 와룡동의 용·봉황 상징은 사전의 해석에 귀속했다. 상암동의 물길·바위 설명에 원문의 풍수·난꽃 이야기를 새 사실로 붙이지 않았고, 서교동/동교동 공동 문단의 윗잔다리를 서교동의 다른 이름으로 전용하지 않았다.

개포4동 HWP를 직접 열어 OLE FAT/miniFAT와 압축 BodyText/Section0의 HWPTAG_PARA_TEXT 레코드 54·61에서 1983.1.1 및 1988.7.1 분동을 대조했다. 이는 행정동 개포4동 연혁이며 법정동 개포동 신설·전체 경계로 확대하지 않는다. 상월곡동의 1949년 편입과 1950년 개칭, 삼성동의 1963년 편입과 1975년 강남구 소속, 충정로2·3가의 1975년 관할과 2008년 충현동 행정동 명명, 동소문동의 1949년 행정 맥락과 1963년 법정동 신설을 구별했다.

태평로2가 원문의 별도 1943년 문장에는 6월 10월이라는 표기가 있으나 선택 본문은 1914년·1946년만 다룬다. 그 별도 표기를 날짜 근거로 사용하지 않았다. 남산동3가의 도입부 방향 설명도 저장 요약의 대상이 아니며 현재 지형 검증으로 승격하지 않았다. 문래동2가의 문익점·물레 어원과 신교동 교량 조성 추정도 선택 연혁과 구별했다. 실록·법령·고시·지적 원장을 새로 직접 확인한 것으로 기록하지 않았다.

동재기나루는 기존 `gu-동작구`의 `district_context`만 연결되어 있으므로 district로 검토했다. 1728년 변장 파견·1746년 나룻배 3척 이관과 도강 교통을 대조하되 원문의 위치 추정을 특정 법정동·동작역 개별 부지의 확정 위치로 좁히지 않았다. 나머지 29개는 neighborhood이며 현재 경계·주소·건물·부지 동일성 검증이 아니다.

## 전사·시기·이용조건

박물관 개별 설명문 2개는 공백 정규화 후 전사가 모두 일치한다. 수유동 자료는 지도 시기 1856~1872·책 발행 2024·설명 속 1481·1751·1865를 구분했다. 북아현 경관 재구성은 자료/책 2009와 재구성 대상인 20세기 이전·일제 후반 도시화 이전을 구분했다. 추측된다·구술과 문헌·전해진다 표현을 보존하고 시장·유기전·묘소 설명을 실측·현존 사실로 올리지 않았다. 두 항목의 기존 빈 지역 연결을 유지했다.

박물관 2개 및 서대문구 동명 유래의 개별 공공누리 제1유형 표시·링크를 다시 확인하고 기존 KOGL1·권리 URL·보관 1·재사용 1을 보존했다. 송파구 페이지의 공공누리 표기 지정안됨과 일반 아이콘을 구분했다. 나머지 자료의 unknown·보관 0·재사용 0은 그대로 유지했다. HWP 파일 본문에는 개별 이용허락 표시를 확인하지 못했으며 원파일을 운영에 적재하지 않았다. 원사진·지도·책 이미지·영상의 추가 승인이나 적재는 없다. 내부 대조용 임시 전체 응답은 확인 후 제거하고, 출처 URL·위치·SHA-256·확인시각과 검토 판단만 남긴다.

## 운영 반영과 검증

입력 30개를 기존 validatePassageReview로 검사한 뒤 검토 API에 순서대로 반영했다. 실패·리비전 충돌·중복 저장은 0건이다. 전후 현재 본문 638개를 각각 22페이지로 읽고 상태 지문·ID·본문·버전·원문 URL·권리·지역 분류가 유지됐음을 확인했다. 비대상 608개 응답은 전체 동일하다. 자료 26건의 메타데이터·버전·연표·지역·파일·수집 이력을 대조했으며 신규 감사 이력 30개를 확인했다. 공통 과거 감사 항목 95개가 동일하며, 최근 일부만 반환하는 API의 잘린 꼬리를 삭제로 간주하지 않았다.

자료별 검토 API에서 30개 전체 근거·검토 ID·revision 1·상태·활성 지문·검토자를 대조했다. 완료·보류·자치구 항목 3개를 같은 요청으로 재전송해 동일 검토 ID와 unchanged:true를 확인했다. 네이티브 DB 읽기는 반환된 next_offset만 따라 null까지 조회했다. 전 95페이지 375개와 후 103페이지 405개에서 기존 375개의 ID·본문/자료 버전·리비전·상태·지문·검토자·시각이 모두 같으며, 새 행은 정확히 30개다. 현재 본문 최신 검토는 404개이며 전체 이력 405개와 구별한다. 네이티브 출력의 긴 근거·스냅샷 일부 잘림은 운영 API의 전체 근거와 지문으로 별도 검증했다.

법정동 공식 상태 467개와 주소 관측 464·공식 원문 단독 3개를 유지했다. 지역별 대조 완료 본문은 법정동 명칭 연결 24개, 자치구 맥락 1개가 증가했다. 자료 525·자료 버전 525·본문 638·연표 21·자산 20은 유지됐다. 코드 변경이 없으므로 코드 테스트·타입 검사·빌드는 반복하지 않았고, 데이터 입력 검증과 운영 재조회·감사·멱등성 검증으로 확인했다. 별도 사진자료 반영의 검사 수나 배포를 이번 작업의 검증 실적으로 보고하지 않는다.

## 처리 ID와 근거

- **하중동 · 원문 대조 완료**
  - 본문 `9b605bcc-3937-470f-8e97-110fe32754c4` · 자료 `ba92c965-a182-47a2-9da6-30595b9b10a2` · 검토 `f6e1f7dc-cc1a-483e-a565-0032fb7d6722` / revision 1
  - 원문: https://www.mapo.go.kr/site/culture/content/culture0302
  - 위치: 동이름의 유래 > 하중동
  - 확인: 2026-10-22T17:43:28.663014+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 하중리에서 이어진 동명과 1946년 하중동 개칭이 해당 하중동 문단과 일치한다.

- **효제동 · 원문 대조 완료**
  - 본문 `9b98a120-d3d9-4a17-abac-c36b0df3714c` · 자료 `06418eb8-b067-4b8f-bf88-c36cf0ac76b8` · 검토 `c564c08b-9b71-4d15-ba5f-35021f1b6f29` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%ED%9A%A8%EC%A0%9C%EB%8F%99
  - 위치: 서울 지명사전 > 법정동 > 효제동(孝悌洞) > 동명 유래·행정 변천 문단 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T17:43:28.663899+00:00 · 범위: neighborhood · 분류: tradition
  - 판단: 효제의 유학 덕목 유래설과 효종 잠저 어의궁 관련설을 원문에서 모두 확인했다.

- **태평로2가 · 원문 대조 완료**
  - 본문 `9c5fd9c9-8f2d-4583-b733-6099c70cc2ea` · 자료 `d074dd5e-e63b-43d7-b264-b82ef918ce6a` · 검토 `9e487b4e-643c-4ae8-853f-031e73b66326` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%ED%83%9C%ED%8F%89%EB%A1%9C2%EA%B0%80
  - 위치: 법정동 명칭검색 «태평로2가» > 태평로2가(太平路2街) > 연혁 문단 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T17:43:28.664365+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 태평로2가의 1914년 통합 대상과 태평통2정목·1946년 태평로2가 개칭을 대조했다.

- **마천동 · 원문 대조 완료**
  - 본문 `9cd53284-4f74-4d70-a450-ae5f04d242c7` · 자료 `536fc3d5-87bb-4b2e-bfb3-6e33860ab479` · 검토 `1a1dfea6-81b0-482b-b54f-819c420c4432` / revision 1
  - 원문: https://www.songpa.go.kr/www/contents.do?key=2367
  - 위치: 동명 유래 > 마천동
  - 확인: 2026-10-22T17:43:28.665207+00:00 · 범위: neighborhood · 분류: tradition
  - 판단: 마천동 개별 문단에서 마산 지명과 임경업 백마·백마물 전승이 함께 제시됨을 확인했다.

- **팔판동 · 원문 대조 완료**
  - 본문 `9d58543d-f6d5-41ea-a222-8d98a73ba4f4` · 자료 `5ab078f0-129a-49f8-bff9-f36ed42a445f` · 검토 `e8a88fe4-c17a-43be-8511-f48af5ace4eb` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%ED%8C%94%ED%8C%90%EB%8F%99
  - 위치: 서울 지명사전 > 법정동 > 팔판동(八判洞) > 동명 유래·행정 변천 문단 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T17:43:28.665738+00:00 · 범위: neighborhood · 분류: tradition
  - 판단: 팔판동의 여덟 판서 유래와 그들의 이름은 전하지 않는다는 문구가 함께 있다.

- **개포동 · 원문 대조 완료**
  - 본문 `9e77471f-c3a1-46a9-a019-2d2b224de741` · 자료 `9784bb8b-ecf4-44d1-976c-7f45a4a30560` · 검토 `3ea15d04-10ab-4294-b625-56cddd1b2694` / revision 1
  - 원문: https://www.gangnam.go.kr/file/2/get/FILE_000000000122575/download.do
  - 위치: 첨부 HWP > BodyText/Section0 > HWPTAG_PARA_TEXT 레코드 54(1983.1.1)·61(1988.7.1) / DEFLATE 해제 후 원문 연혁
  - 확인: 2026-10-22T17:43:28.666459+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 직접 연 HWP의 연혁에서 1983년 도곡동·개포동 분동과 1988년 개포1동·개포4동 분동을 확인했다.

- **상월곡동 · 원문 대조 완료**
  - 본문 `9ec3857c-99bb-477c-9134-edac81a13ad9` · 자료 `accdce6a-29ed-41b8-b85b-1c72aad71e05` · 검토 `05624ca3-801e-407c-b68c-dc5d4c453b41` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%83%81%EC%9B%94%EA%B3%A1%EB%8F%99
  - 위치: 서울지명사전 > 법정동 > 상월곡동(上月谷洞) > 초반 웃다리골·말미 서울 편입과 개칭 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T17:43:32.589630+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 상월곡동 본문의 웃다리골·상월곡리 설명과 1949년 서울 편입·1950년 개칭이 일치한다.

- **삼성동 · 원문 대조 완료**
  - 본문 `9ee2642b-32bf-41ec-89a7-d1131b88e2ed` · 자료 `ecba4fab-5cb1-4b01-99e5-0361205bd211` · 검토 `ca636f6d-755e-478d-9fb4-037025a91a4c` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%82%BC%EC%84%B1%EB%8F%99
  - 위치: 법정동 분류 > 삼성동(三成洞) > 동명 유래·행정 변천 본문 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T17:43:32.592977+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 강남구 삼성동 본문에 봉은사·무동도·닥점 통합, 1914년 삼성리와 1963년 편입 설명이 있다.

- **상암동 · 원문 대조 완료**
  - 본문 `9fc1a0bc-14d2-463b-9893-9d36ce86a30a` · 자료 `ba92c965-a182-47a2-9da6-30595b9b10a2` · 검토 `1fd7b7d8-ee75-4724-a31d-9507a9722663` / revision 1
  - 원문: https://www.mapo.go.kr/site/culture/content/culture0302
  - 위치: 동이름의 유래 > 상암동
  - 확인: 2026-10-22T17:43:28.663014+00:00 · 범위: neighborhood · 분류: mixed
  - 판단: 상암동 문단에서 수상리·휴암리 합성명과 물길·부엉바위 설명을 대조했다.

- **서교동 · 원문 대조 완료**
  - 본문 `9ffb90c9-d986-4b50-aa2e-27be7df28e14` · 자료 `ba92c965-a182-47a2-9da6-30595b9b10a2` · 검토 `cb68ed38-403b-40f7-a100-766077739a76` / revision 1
  - 원문: https://www.mapo.go.kr/site/culture/content/culture0302
  - 위치: 동이름의 유래 > 서교동/동교동
  - 확인: 2026-10-22T17:43:28.663014+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 서교동/동교동 공동 문단에서 아랫잔다리·서세교리와 서교동으로의 변화를 확인했다.

- **문래동2가 · 원문 대조 완료**
  - 본문 `a00ae006-b787-45ae-a93d-0ea823f230a6` · 자료 `1c2c70a9-d991-428c-a6fe-db9af1889b81` · 검토 `0eee3736-6725-41c8-acb9-6fcde56c910f` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%AC%B8%EB%9E%98%EB%8F%992%EA%B0%80
  - 위치: 법정동 분류 > 문래동2가(文來洞2街) > 동명 유래·행정 변천 본문 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T17:43:32.989598+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 문래동2가 개별 본문의 문래동 분리·구획정리·광복과 전쟁 이후 인구 증가가 저장 요약과 일치한다.

- **갈월동 · 재확인 필요**
  - 본문 `a0148a79-6a89-496f-9de1-b5188c47490b` · 자료 `b5dace38-1dc2-4446-96c1-41105684ab7c` · 검토 `e87c587b-32c8-4bf1-adb6-4f010751e5f3` / revision 1
  - 원문: https://www.yongsan.go.kr/dong/main/contents.do?dongCd=03&menuNo=600304
  - 위치: 동 유래 > 갈월동 / 등록 원문 접근 실패
  - 확인: 2026-10-22T17:45:22.629085+00:00 · 범위: neighborhood · 분류: unconfirmed
  - 판단: 등록 원문의 공개 GET 두 번이 503이고 웹 열람도 실패해 갈월동 본문을 대조하지 못했다.

- **와룡동 · 원문 대조 완료**
  - 본문 `a0954745-584e-4756-924a-385ad1976af8` · 자료 `73853ead-bd0b-4b26-8c0e-87c3e4d50f81` · 검토 `c7378121-a907-4107-8614-5c62482b74d3` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%99%80%EB%A3%A1%EB%8F%99
  - 위치: 서울 지명사전 > 법정동 > 와룡동(臥龍洞) > 동명 유래·행정 변천 문단 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T17:43:34.685252+00:00 · 범위: neighborhood · 분류: inference
  - 판단: 와룡동 원문은 임금의 상징인 용·창덕궁과 봉익동 대비를 동명 설명으로 든다.

- **1800년대의 수유동 · 원문 대조 완료**
  - 본문 `a145f9f3-69d2-4afe-b939-319656084952` · 자료 `95c8bdcb-1698-4b7c-b662-ca1b1eef9616` · 검토 `b1db585a-22af-497f-b4e8-e923e82122d6` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY1171&fileId=bea0cee6-75f0-4d8d-8911-0b55cbc07b81&fileSn=1637&type=A&upperNodeId=CTGRY1174
  - 위치: 상세 자료 > 내용 항목 · 『수유동』(2024), p. 35. / 개별 내용 항목의 공백 정규화 전사 일치
  - 확인: 2026-10-22T17:43:35.545116+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 수유동 지도 개별 설명문 전사는 공백 정규화 후 현재 내용 항목과 일치한다.

- **고척동 · 원문 대조 완료**
  - 본문 `a23bc8f5-bd2f-4365-bc9b-155d3bcab83b` · 자료 `f112a14f-8fbf-4e5f-b06a-7bdf060ec0fb` · 검토 `f195cc86-ced1-41d5-b51e-c614617606d8` / revision 1
  - 원문: https://www.guro.go.kr/www/contents.do?key=2130
  - 위치: 연혁 및 동명의 유래 > 고척동
  - 확인: 2026-10-22T17:43:35.802241+00:00 · 범위: neighborhood · 분류: mixed
  - 판단: 고척동 본문에서 고좌리·높은 마을설과 긴 자를 이용한 교환설, 1963년 서울 편입을 확인했다.

- **북아현동 · 재확인 필요**
  - 본문 `a27e245e-e24e-4f82-b0dc-f21cbf8a26b7` · 자료 `b6839001-bbcf-435f-bdf2-2c9f65e8f3f8` · 검토 `d3af1883-e814-4ada-87af-db2d7e01e8b4` / revision 1
  - 원문: https://www.sdm.go.kr/wesdm/history/origin.do
  - 위치: 동명 유래 > 북아현동 / 1964년 편입·1955년 분동 서술 순서 추가 확인
  - 확인: 2026-10-22T17:43:35.950104+00:00 · 범위: neighborhood · 분류: unconfirmed
  - 판단: 북아현동 원문은 아이 시체 고개 어원이 정확하지 않다고 하며 1964년 편입 설명 뒤 1955년 분동을 서술한다. 두 사건의 관계는 추가 대조 대상으로 남긴다.

- **20세기 이전 북아현의 경관 재구성 · 원문 대조 완료**
  - 본문 `a29b7816-038c-4d1b-be3f-2b265e32ac95` · 자료 `2077bbb8-4325-48e9-9db8-c69f239d3259` · 검토 `0ff0a567-8649-4fba-9ba9-3617d727e309` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY424&fileId=H-TRNS-4972-426&fileSn=300&type=A&upperNodeId=CTGRY426
  - 위치: 상세 자료 > 내용 항목 · 『안산자락, 고갯마을 북아현; 북아현의 역사, 경관, 주거』(2009), 60쪽 / 개별 내용 항목의 공백 정규화 전사 일치
  - 확인: 2026-10-22T17:43:36.148862+00:00 · 범위: neighborhood · 분류: mixed
  - 판단: 북아현 경관 재구성 설명문 전사는 공백 정규화 후 개별 내용 항목과 일치한다.

- **석촌동 · 원문 대조 완료**
  - 본문 `a422e87e-1ae2-40a6-8da2-5e5cfa022267` · 자료 `536fc3d5-87bb-4b2e-bfb3-6e33860ab479` · 검토 `001fb21c-ce97-409e-bace-7a8649c22581` / revision 1
  - 원문: https://www.songpa.go.kr/www/contents.do?key=2367
  - 위치: 동명 유래 > 석촌동
  - 확인: 2026-10-22T17:43:28.665207+00:00 · 범위: neighborhood · 분류: tradition
  - 판단: 석촌동 문단에서 돌마리라는 우리말 지명을 한자로 옮겼다는 설명을 확인했다.

- **필동3가 · 원문 대조 완료**
  - 본문 `a442c4a9-a2c5-45d1-9b1d-8a04b636c47a` · 자료 `c8b08734-50eb-4e6e-bdd2-fdf36262f9d0` · 검토 `2e40ea8b-834d-46b4-ac93-0fb17ee4a12f` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%ED%95%84%EB%8F%993%EA%B0%80
  - 위치: 법정동 명칭검색 «필동3가» > 필동3가(筆洞3街) > 연혁 문단 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T17:43:36.206674+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 필동3가 개별 항목의 1914년 묵동 일부→대화정3정목과 1946년 개칭이 요약과 일치한다.

- **충정로2가 · 원문 대조 완료**
  - 본문 `a4b64677-3050-406f-af5c-11a80e647c37` · 자료 `b6839001-bbcf-435f-bdf2-2c9f65e8f3f8` · 검토 `e91cdeb5-b3d1-4366-93a4-7caf1eec059e` / revision 1
  - 원문: https://www.sdm.go.kr/wesdm/history/origin.do
  - 위치: 동명 유래 > 충현동 > 1975년 관할 조정
  - 확인: 2026-10-22T17:43:35.950104+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 충현동 문단이 1975년 관할 조정에서 충정로2·3가를 서대문구로 설명함을 확인했다.

- **안국동 · 원문 대조 완료**
  - 본문 `a5489fdc-f4fd-4e45-ad9c-56b799d36a61` · 자료 `6eb9c761-2b1c-4b2e-8375-4b6f7def3529` · 검토 `c24753ca-853c-4022-bbcd-82f303414b8c` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%95%88%EA%B5%AD%EB%8F%99
  - 위치: 서울지명사전 > 법정동 > 안국동(安國洞) > 동명 유래·행정구역 연혁 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T17:43:38.277518+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 안국방에서 비롯된 동명과 1914년 안현·소안동·홍현·재동 일부 통합이 일치한다.

- **등촌동 · 원문 대조 완료**
  - 본문 `a56c5872-1587-44d8-91ce-4911ea20b45d` · 자료 `ddfe760f-2268-4658-babe-b03164983086` · 검토 `be3591cf-4890-4164-9ba7-8602cf044f8c` / revision 1
  - 원문: https://www.gangseo.seoul.kr/kids/kids010501
  - 위치: 동명 유래 > 등촌동 / 등록 웹 원문 333~335행·저작권정책 378행·저작권 390행
  - 확인: 2026-10-22T17:45:22+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 등록된 강서구 원문의 등촌동 개별 항목에서 등촌리에서 이어진 동명 설명을 확인했다.

- **남산동3가 · 원문 대조 완료**
  - 본문 `a659b015-7384-4232-83c2-b702c32ba6dc` · 자료 `8bfea7f6-611a-419e-ac83-297c0e9f674b` · 검토 `532ed901-a818-480a-b4fb-c54dd673b84a` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%82%A8%EC%82%B0%EB%8F%993%EA%B0%80
  - 위치: 법정동 명칭검색 «남산동3가» > 남산동3가(南山洞3街) > 연혁 문단 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T17:43:39.402758+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 남산동3가의 1914년 남산정3정목·1943년 중구 소속·1946년 개칭이 요약과 일치한다.

- **반포동 · 원문 대조 완료**
  - 본문 `a6add808-edda-4062-b026-62d7cda089eb` · 자료 `5342b0d3-3520-41ba-b2d4-ce6b80851bff` · 검토 `5d42b361-31d6-47f2-adea-9bde940f125d` / revision 1
  - 원문: https://www.seocho.go.kr/site/seocho/05/10502040400002015070810.jsp
  - 위치: 반포동 지명유래 > 첫 문단·서래마을
  - 확인: 2026-10-22T17:43:40.677403+00:00 · 범위: neighborhood · 분류: mixed
  - 판단: 반포동 서릿개·침수의 두 해석과 1963년 서울 편입·서래마을의 1925년 홍수 이주 설명이 요약과 일치한다.

- **동재기나루 · 원문 대조 완료**
  - 본문 `a6b518d3-68e0-4cce-9a0a-b1961d170bfa` · 자료 `520d5b68-65f7-448f-af80-c93ad5353dd9` · 검토 `58a1d958-bf60-4c2a-b44a-b6b8902b3020` / revision 1
  - 원문: https://www.dongjak.go.kr/portal/main/contents.do?menuNo=201199
  - 위치: 동작(동재기) > 동재기나루·관리·교량 건설
  - 확인: 2026-10-22T17:43:40.859298+00:00 · 범위: district · 분류: factual
  - 판단: 동재기나루의 과천·수원·호남 도강 교통과 1728년 변장 파견·1746년 배 이관·교량 뒤 기능 약화를 대조했다.

- **종로5가 · 원문 대조 완료**
  - 본문 `a6b80ba4-81ef-4e64-b0f6-886d8c2be748` · 자료 `2c28c03c-7fc3-407c-9981-f53a756c91bb` · 검토 `3cb5b686-1cc5-45fe-ac20-12c9d118f92a` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%A2%85%EB%A1%9C5%EA%B0%80
  - 위치: 서울 지명사전 > 법정동 > 종로5가(鐘路5街) > 동명 유래·행정 변천 문단 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T17:43:40.920923+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 종로5가 원문이 종로의 다섯 번째 구획과 조선 창선방·건덕방 일부의 연혁을 명시한다.

- **동소문동4가 · 원문 대조 완료**
  - 본문 `a825cbb3-f374-4b31-b929-9c48ac0a8fd6` · 자료 `e019175e-0792-463e-b960-f1f488b2605d` · 검토 `6bf75e55-2557-405e-955f-3cdef2c2966e` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%8F%99%EC%86%8C%EB%AC%B8%EB%8F%994%EA%B0%80
  - 위치: 서울지명사전 > 법정동 > 동소문동4가(東小門洞4街) > 말미 동소문동4가 신설 위치 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T17:43:42.649147+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 동소문동4가 말미에서 1963년 법정동 신설·미아로 기준 동소문동1가 동쪽 구분을 확인했다.

- **응봉동 · 재확인 필요**
  - 본문 `a8b1cda7-e896-414f-a3b4-3a921e563b88` · 자료 `11ad709e-e01f-4418-807c-2e31c483014d` · 검토 `b0efd0b1-bb68-4824-9cf7-139029d1efa0` / revision 1
  - 원문: https://sd.go.kr/tour/contents.do?key=1926
  - 위치: 지명유래 > 응봉동 / 등록 원문 접근 실패
  - 확인: 2026-10-22T17:45:22.631011+00:00 · 범위: neighborhood · 분류: unconfirmed
  - 판단: 응봉동의 등록 원문 GET 두 번이 503이고 웹 열람 두 번도 시간 초과여서 본문을 직접 대조하지 못했다.

- **장교동 · 원문 대조 완료**
  - 본문 `a8c2f35c-3bbb-4e46-96e5-962f7db52dc3` · 자료 `abb03ef1-4c56-455a-b3de-5d91b0558ddb` · 검토 `a7a585bb-dfe9-4048-b24c-138ffa809f20` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%9E%A5%EA%B5%90%EB%8F%99
  - 위치: 법정동 명칭검색 «장교동» > 장교동(長橋洞) > 연혁 문단 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T17:43:43.263246+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 장교동 개별 항목의 청계천 장교 유래·장교정과 1946년 장교동 개칭을 대조했다.

- **신교동 · 원문 대조 완료**
  - 본문 `a913405c-4a05-4cbb-82be-1ccec877c6cc` · 자료 `64853a7c-2ab0-48a9-825a-7437add03a77` · 검토 `375ba66f-1845-4a9a-b9e8-3044ad3a93b8` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%8B%A0%EA%B5%90%EB%8F%99
  - 위치: 서울지명사전 > 법정동 > 신교동(新橋洞) > 동명 유래·행정구역 연혁 / 본문 구간 (txt-box0)
  - 확인: 2026-10-22T17:43:46.006774+00:00 · 범위: neighborhood · 분류: factual
  - 판단: 신교동의 새 다리·새다릿골 한자 명명과 1914년 순화방 신교 지역 획정이 요약과 일치한다.

## 다음 작업

다음 첫 미검토는 **1976년 구매한 재단용 손칼** (`a9c8a3d3-bfae-47f8-8317-e385d4d65cc6`, `상세 자료 > 내용 항목 · 『동대문시장; 불이 꺼지지 않는 패션아이콘』(2011), 223쪽`)이다. 커서는 `/api/archive/task?view=passages&unreviewed=true&limit=30&after=`를 사용한다. 미검토 234개·보류 87개·미완료 321개를 남기고 review/ready로 기록한다. 본문 완료 기준을 충족하지 않아 다음 단계로 이동하지 않으며 기존 예약을 유지한다.
