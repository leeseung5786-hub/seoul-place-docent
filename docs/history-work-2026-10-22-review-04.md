# 2026-10-22 본문 검토 04: 30개 및 자치구 범위 지원

운영 `/api/archive/task`의 계획 version 2, 마지막 review/ready checkpoint, `data/history-maintenance-plan.json`, `docs/scheduled-history-work.md`, 직전 본문 검토 03 기록을 먼저 읽었다. source commit `df03032ebb31b270c6cdc21ece0bb91ee2f125f6`를 Sites 절차로 열었고 계획의 일치 및 다른 running 기록이 없음을 확인했다. review/running 저장 후 작업했으며 기존 소유자 1명 전용 custom 정책 revision 1(편집자·그룹·외부 방문자 0)을 유지했다. 확인시각은 JSON에 UTC ISO 형식으로 보존하며, 이번 확인은 한국 시간 2026-10-22에 이뤄졌다.

미검토 ID 순서의 다음 30개(자료 30건)를 처리했다. 요약 20개를 원문 대조 완료로 기록하고, 박물관 전사 9개는 HTTP 503, 체부동 요약 1개는 이용조건 재확인 실패로 보류했다. 원문 내용이 잘못됐다는 판정과 접근·이용조건 확인 실패를 구분했다. 기존 보류를 해소하거나 이미 검토한 본문을 다시 적재하지 않았다.

| 지표 | 이전 | 이후 |
|---|---:|---:|
| 현재 본문 | 638 | 638 |
| 최신 검토 기록이 있는 본문 | 74 | 104 |
| 원문 대조 완료 | 33 | 53 |
| 재확인 필요 | 41 | 51 |
| 아직 검토하지 않음 | 564 | 534 |
| 미완료 합계 | 605 | 585 |

자치구 전체 연혁을 `neighborhood`로만 기록하던 검토 API의 제약을 보완했다. `district`는 기존 연결이 모두 district_context이고 실제 지역 level이 district일 때만 허용하며, 빈 연결·법정동·혼합 연결은 거절한다. 자치구 전용 본문을 동네 범위로 완료 처리하는 요청도 거절한다. 검토 기록 화면에 자치구 전체 맥락을 표시하고, 과거 이력·본문 지문·지역 연결과 기존 요청 재시도 동작을 보존했다. 스키마 변경이나 임의 SQL 경로는 추가하지 않았다.

경계·법정동 관계·동시 지역 연결 수정·감사 이력·재시도 검증을 추가한 자동 검사 145개와 타입 검사·빌드를 통과했다. 기능 커밋 `4a51344860ec707201293aff463f914913f2c92b`를 기존 Site version 24로 먼저 배포했다(배포 ID `appgdep_6ad8ecfb8cc8819185c23bb632e27480`, succeeded). 이후 운영 API가 잘못된 자치구 범위 요청을 PASSAGE_REVIEW_SCOPE / 400으로 거절하고 아무 검토도 생성하지 않는 것을 확인한 뒤 실제 쓰기에 사용했다. 서초구 전체 맥락 1개는 district로, 다른 항목은 기존 동네 맥락으로 저장했다.

신사동은 동일 URL의 txt-box0(은평구 새절·1949년 편입)과 txt-box1(강남구 세 마을·1963년 편입)을 나누어 후자만 대조했다. 보문동2가는 1955년 행정동 분리와 가 구분 서술을 혼동하지 않았다. 하계동의 양주군 노해면, 논현동·신사동의 광주군 언주면은 현재 서울 지역의 편입 전 연혁으로 확인했으며 타지역 기록으로 확대하지 않았다. 과거 명칭이 같은 다른 현재 동·필지로 새 연결을 만들지 않았다.

도림동은 두 어원설을 병기하고, 구로동의 아홉 노인은 전설로 남겼다. 염곡동의 우물 약효·전쟁 피해 이야기는 사실로 채택하지 않았다. 원지동의 원터·삼남도로·여의천 설명은 동네 맥락이며 원터의 현재 건물·필지 역사로 승격하지 않았다. 구로동 페이지의 서로 다른 행정동 수, 천연동 페이지의 행정동·법정동 혼용 등 선택 요약 밖 표현은 이번 대조 완료의 범위에 포함하지 않았다.

체부동은 최초 웹 원문 열람에서 체찰사부 설치 기록 부재와 구곡동 유래를 대조했다. 이후 하단 이용조건 재조회는 502, 일반 공개 GET은 503으로 실패했다. 기존 2026-10-17의 KOGL1·보관·재사용 값은 유지하지만 이번 이용조건 확인을 완료로 올리지 않았고 rights만 unresolved로 남겼다. 이문동은 공개 GET 503과 별도로 웹 도구에서 정확한 등록 URL의 이문 시설·훼손 문단을 열람했다. 두 웹 열람에는 직접 확보한 파일 해시가 없어 sourceHash:null로 기록했다.

박물관 9개 등록 URL은 각각 일반 공개 GET에서 503을 반환했다. 원사진·원도면·원전 쪽을 확인하지 못했으므로 저장 전사만으로 자기 검증하지 않았다. 대양건재 부흥주택 두 자료는 전사 내용이 같지만 원본 fileId가 다른 자료이므로 기존 ID와 버전을 보존하고 임의 병합·삭제하지 않았다. 원문 URL·기존 책 쪽수·확인시각·이름·연대·전승·상충·권리·공간 판단을 항목마다 기록했다.

원문 보관·재사용 unknown 제한은 그대로 두었고 새 허락을 부여하지 않았다. 천연동은 현행 원문 하단 공공누리 제1유형 표시를 확인했다. 원문 HTML·이미지·동영상은 저장소나 운영 DB에 추가 적재하지 않았으며 일시 열람용 추출 본문은 검증 뒤 제거한다. 운영 및 소스에는 자체 검토 메모·위치·시각·직접 GET 해시만 남긴다.

입력 30개 사전 검증과 운영 쓰기를 모두 통과했다. 운영 전체 본문 638개를 다시 읽어 ID·본문·위치·자료 및 본문 버전·원문 URL·권리·지역 연결 지문의 불변과 비대상 608개 응답의 동일성을 확인했다. 선택 자료 상세 30개 및 자료별 검토 API 30개에서 상태·revision 1·검토 ID·전체 근거·감사 이력 30개를 대조했다. 자치구 대조 완료는 동네 완료로 세지 않으며 법정동 완료 집계는 19개 증가했다.

Sites의 독립 D1 읽기는 제공된 next_offset만 따라 마지막 null까지 조회했다. 기존 검토 75행의 짧은 필드가 그대로 남고 신규 30행을 더해 105행임을 확인했다. 도구가 자른 긴 evidence·snapshot 셀은 비교에 쓰지 않고 운영 API의 전체 값으로 검증했다. 자치구 완료·박물관 보류·체부동 권리 보류의 같은 요청을 각각 다시 호출해 기존 ID·revision·unchanged:true를 확인했다. 쓰기 실패·충돌·중복 적재는 0건이다.

자료 525건·본문 638개·자료 버전 525개·연표 21개·파일 20개, 법정동 공식 현존 확인 467개·주소 응답 관측 464개·미확인 3개는 유지했다. 코드 기능은 version 24로 배포했고, 그 뒤의 데이터 검토 반영은 재배포하지 않았다.

전체 본문의 첫 순차 재조회는 도중 시간 초과가 났다. 읽기만 다시 수행하고 기존 본문 ID의 커서별 결과를 대조해 22쪽 전체를 확보했으며, 새 본문 추가·삭제나 검토 재쓰기는 하지 않았다. 화면 시각 검증과 전체 서비스 시나리오는 미수행이다. 현행 확인일 표시는 ISO UTC 날짜 부분을 사용하므로 서울 자정 경계의 표시 개선은 이후 화면 단계의 확인 대상으로 남긴다. 저장된 ISO 확인시각은 유지된다.

검증 완료 시각: 2026-10-21T16:59:26.482169+00:00. 세부 근거와 영수증은 `data/passage-review-observations-2026-10-22-04.json`에 보존했다.

- **1091-5 실측평면도 · 재확인 필요**
  - 본문 `1e9c689e-5ee3-4edd-a442-5de8209abb6f` · 자료 `f9439e7c-bb86-4b5d-97eb-4175c54bf168` · 검토 `1390423b-dfda-4d68-9028-4e5f3cffa67c` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY404&fileId=H-TRNS-4892-407&fileSn=300&type=A&upperNodeId=CTGRY407
  - 위치: 상세 자료 > 내용 항목 · 『길음동』(2010), 224쪽
  - 확인: 2026-10-21T16:40:21.236424+00:00 · 범위: neighborhood
  - 판단: 등록 박물관 상세 URL이 HTTP 503을 반환했다. 상세 자료 > 내용 항목 · 『길음동』(2010), 224쪽의 전사·명칭·연대·공간과 이용조건을 이번에 원문 대조하지 못했다.
- **서초구 · 원문 대조 완료**
  - 본문 `1ec91d52-21e4-4df9-a73e-f372b93df1de` · 자료 `df340d6a-c879-4c24-ac74-c0ad04d1b61f` · 검토 `fb37094b-bc71-4a7c-b44a-73a033665e98` / revision 1
  - 원문: https://www.seocho.go.kr/site/seocho/05/10502040100002015070810.jsp
  - 위치: 구이름의 역사와 유래 > 1963·1975·1980·1988년 행정구역 문단 및 마지막 도시개발 문단
  - 확인: 2026-10-21T16:40:22.472238+00:00 · 범위: district
  - 판단: 1963년 서울 편입 이후 관할 변천과 1988년 서초구 분리, 1965년 계획·1968년 영동토지구획정리사업의 설명이 요약과 일치한다.
- **'민주화의 길' 안내판 · 재확인 필요**
  - 본문 `1f615542-adb4-45e0-9248-bec481a1c302` · 자료 `cd502d6c-e965-4bb5-9b80-77fd138a937b` · 검토 `b880f9c0-109a-448d-9d86-e3682c9077b9` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY446&fileId=H-TRNS-48692-447&fileSn=300&type=A&upperNodeId=CTGRY447
  - 위치: 상세 자료 > 내용 항목 · 『신림동; 대학동, 청운의 꿈을 품은 사람들』(2015), 66쪽
  - 확인: 2026-10-21T16:40:21.188058+00:00 · 범위: neighborhood
  - 판단: 등록 박물관 상세 URL이 HTTP 503을 반환했다. 상세 자료 > 내용 항목 · 『신림동; 대학동, 청운의 꿈을 품은 사람들』(2015), 66쪽의 전사·명칭·연대·공간과 이용조건을 이번에 원문 대조하지 못했다.
- **1900~1950년대 돈암지역에 설립된 개신교 교회당 · 재확인 필요**
  - 본문 `1f6af1f6-e908-4bbe-aa40-bd7487357ec2` · 자료 `06b9fb1e-fc6c-4ab6-9888-28b34d514e04` · 검토 `c20236c2-d0f8-47db-837a-6c64deee2a0f` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY1024&fileId=da6be35c-051a-4435-8b1f-22654957698e&fileSn=674&type=A&upperNodeId=CTGRY1028
  - 위치: 상세 자료 > 내용 항목 · 『돈암(2021)』, p. 206.
  - 확인: 2026-10-21T16:40:24.846779+00:00 · 범위: neighborhood
  - 판단: 등록 박물관 상세 URL이 HTTP 503을 반환했다. 상세 자료 > 내용 항목 · 『돈암(2021)』, p. 206.의 전사·명칭·연대·공간과 이용조건을 이번에 원문 대조하지 못했다.
- **18세기 중엽 신촌 주변 지역의 도로망 · 재확인 필요**
  - 본문 `1f76254b-8a48-43f0-83ef-ebe3f619714e` · 자료 `9abf1feb-c884-4559-bae0-4972671fd7f6` · 검토 `6510ef07-ca57-4dc7-90af-293f816c5230` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY433&fileId=H-TRNS-84417-434&fileSn=300&type=A&upperNodeId=CTGRY434
  - 위치: 상세 자료 > 내용 항목 · 『신촌; 청년문화를 품은 개척지』(2017), 37쪽
  - 확인: 2026-10-21T16:40:24.846062+00:00 · 범위: neighborhood
  - 판단: 등록 박물관 상세 URL이 HTTP 503을 반환했다. 상세 자료 > 내용 항목 · 『신촌; 청년문화를 품은 개척지』(2017), 37쪽의 전사·명칭·연대·공간과 이용조건을 이번에 원문 대조하지 못했다.
- **예지동 · 원문 대조 완료**
  - 본문 `1f947d9e-663a-4022-b401-f907594b7adc` · 자료 `54057dbe-b0e6-4397-b69e-711d7dc55b88` · 검토 `3d6287cd-b22c-4f80-9125-4bafd39a79bc` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%98%88%EC%A7%80%EB%8F%99
  - 위치: 서울지명사전 > 법정동 > 예지동(禮智洞) > txt-box0 첫 문장
  - 확인: 2026-10-21T16:40:26.547534+00:00 · 범위: neighborhood
  - 판단: 동부학당과 유학의 네 쌍 덕목 중 예지를 고른 동명 설명이 원문과 일치한다.
- **양평동5가 · 원문 대조 완료**
  - 본문 `1fb5484f-25c5-4654-8cd9-e4e34761f6ec` · 자료 `56784464-1a91-4cfe-932a-da401bdf63a0` · 검토 `d51029ce-e3a5-4b6f-b240-61ec1a8bb9a8` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%96%91%ED%8F%89%EB%8F%995%EA%B0%80
  - 위치: 서울지명사전 > 법정동 > 양평동5가(楊坪洞5街) > txt-box0 마지막 문장
  - 확인: 2026-10-21T16:40:26.991163+00:00 · 범위: neighborhood
  - 판단: 안양천 둔치 일부를 양평동으로 남기고 구획정리 지역 일부를 나눈 설명이 요약과 일치한다.
- **1960~1970년대 공공시설로의 필지 변화 · 재확인 필요**
  - 본문 `1fe6f01f-39cf-4a84-a200-a9a11281f19b` · 자료 `bca1a1de-19dd-4ea3-a3a5-f4910736e065` · 검토 `49e84d98-5ba1-43e9-a2f2-c0194d808f5f` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY1171&fileId=41cdac5f-5a22-4bd7-bad4-4f2e3263cdbb&fileSn=1639&type=A&upperNodeId=CTGRY1175
  - 위치: 상세 자료 > 내용 항목 · 『수유동』(2024), p. 89.
  - 확인: 2026-10-21T16:40:28.323016+00:00 · 범위: neighborhood
  - 판단: 등록 박물관 상세 URL이 HTTP 503을 반환했다. 상세 자료 > 내용 항목 · 『수유동』(2024), p. 89.의 전사·명칭·연대·공간과 이용조건을 이번에 원문 대조하지 못했다.
- **천연동 · 원문 대조 완료**
  - 본문 `200743c5-6bd0-40a5-96ee-c782b7b63a11` · 자료 `b6839001-bbcf-435f-bdf2-2c9f65e8f3f8` · 검토 `009527f8-f295-49af-8ee8-f85b5a3699fa` / revision 1
  - 원문: https://www.sdm.go.kr/wesdm/history/origin.do
  - 위치: 동명 유래 > 천연동(天然洞) > 첫 문장(천연정 유래) 및 페이지 하단 이용표시
  - 확인: 2026-10-21T16:40:30.530867+00:00 · 범위: neighborhood
  - 판단: 천연정에서 이름이 유래했다는 설명과 다른 인접 법정동까지 확대하지 않은 요약을 대조했다.
- **논현동 · 원문 대조 완료**
  - 본문 `20286fdf-62f9-4277-9f3a-5060ff069391` · 자료 `514b0481-15ac-4f45-a742-f34116db6f7a` · 검토 `a6ea71ff-29aa-4b61-ba97-3a420068ada5` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%85%BC%ED%98%84%EB%8F%99
  - 위치: 서울지명사전 > 법정동 > 논현동(論峴洞) > txt-box0 첫 문장·1963년·마지막 학동 편입 문장
  - 확인: 2026-10-21T16:40:31.254021+00:00 · 범위: neighborhood
  - 판단: 논고개 어원과 1963년 서울 편입, 1985년 법정동 학동의 완전 편입이 원문과 일치한다.
- **명동2가 · 원문 대조 완료**
  - 본문 `20afc738-a582-43f4-b4c8-d71c5c07132b` · 자료 `fe797f82-de18-4e43-acfb-17d34174693a` · 검토 `093e8e5a-592f-4ac4-9e1f-d6d9827b90bf` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%AA%85%EB%8F%992%EA%B0%80
  - 위치: 서울지명사전 > 법정동 > 명동2가(明洞2街) > txt-box0 1914년 병합·말미 1946년 개칭 문장
  - 확인: 2026-10-21T16:40:30.427490+00:00 · 범위: neighborhood
  - 판단: 명동·종현동·저동·낙동 등의 일부를 병합한 명치정2정목과 명동2가 개칭이 일치한다.
- **1963~1980년 망우동의 인구 증가 · 재확인 필요**
  - 본문 `20bbd788-e864-4718-9576-dbb166498f40` · 자료 `3acf6626-0557-4182-9c98-1db6fe29ab07` · 검토 `9b5cccb4-d182-4f58-adbd-a4dc11562403` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY1077&fileId=8f511382-af57-4b13-ae90-e2857dbea091&fileSn=865&type=A&upperNodeId=CTGRY1082
  - 위치: 상세 자료 > 내용 항목 · 『망우동(2022)』, p. 305.
  - 확인: 2026-10-21T16:40:34.201333+00:00 · 범위: neighborhood
  - 판단: 등록 박물관 상세 URL이 HTTP 503을 반환했다. 상세 자료 > 내용 항목 · 『망우동(2022)』, p. 305.의 전사·명칭·연대·공간과 이용조건을 이번에 원문 대조하지 못했다.
- **보문동2가 · 원문 대조 완료**
  - 본문 `21188931-ee8f-4790-98a2-783d279a0de3` · 자료 `9d386693-32dc-459a-8a83-fc7975b4e535` · 검토 `c04847bd-902c-4cb8-a0a9-f4a3af0541f0` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%B3%B4%EB%AC%B8%EB%8F%992%EA%B0%80
  - 위치: 서울지명사전 > 법정동 > 보문동2가(普門洞2街) > txt-box0 1955년 분리 및 마지막 위치 문장
  - 확인: 2026-10-21T16:40:33.763186+00:00 · 범위: neighborhood
  - 판단: 난계로를 중심으로 1가 맞은편 서쪽과 3가 사이를 2가로 설명한 요약이 일치한다.
- **을지로1가 · 원문 대조 완료**
  - 본문 `217f21ce-13a8-44ea-90f8-27f7488b4d1e` · 자료 `df738eb9-4b3b-4e8d-a166-47545dee790a` · 검토 `daee726b-e987-40af-99d2-a2d78204c3ce` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%9D%84%EC%A7%80%EB%A1%9C1%EA%B0%80
  - 위치: 서울지명사전 > 법정동 > 을지로1가(乙支路1街) > txt-box0 1914년 병합·1946년 개칭 문장
  - 확인: 2026-10-21T16:40:33.890103+00:00 · 범위: neighborhood
  - 판단: 유동·남천변동 등 여러 마을의 병합과 황금정1정목→을지로1가 개칭이 일치한다.
- **도림동 · 원문 대조 완료**
  - 본문 `21b3c35a-6249-471a-ace1-d9112542ea66` · 자료 `49bfa954-ee68-4046-bb46-23b1bd573aca` · 검토 `22f06f77-1d39-475c-8041-b54a3198e7d7` / revision 1
  - 원문: https://www.ydp.go.kr/www/contents.do?key=2887
  - 위치: 동 명칭 및 지명 유래 > 도림동(道林洞 / Dorim-dong) > 첫 두 문장
  - 확인: 2026-10-21T16:40:37.007677+00:00 · 범위: neighborhood
  - 판단: 도야미리 변형설과 억새·숲 유래설 두 가지를 병기한 요약이 원문과 일치한다.
- **염곡동 · 원문 대조 완료**
  - 본문 `21c70212-6313-4524-a002-6804ff0be74e` · 자료 `7b5dd78c-b3e8-4ea0-9ebb-c604d7c1dbeb` · 검토 `de3334c2-e650-4f25-b7f5-f87ded4789a5` / revision 1
  - 원문: https://www.seocho.go.kr/site/seocho/05/10502041000002015070810.jsp
  - 위치: 염곡동 지명유래 > 첫 행정연혁 문단·집성촌·옛날 옻우물·1978년 취락구조 개선 문단
  - 확인: 2026-10-21T16:40:38.376970+00:00 · 범위: neighborhood
  - 판단: 염통 모양 지형에 연결한 동명과 1963·1988년 관할 변천, 집성촌·우물·취락구조개선 소개를 대조했다.
- **이문동 · 원문 대조 완료**
  - 본문 `224166ff-c5c6-4033-ab99-cb3e279b9596` · 자료 `32dac673-e481-4acc-95b1-1c867a3f92db` · 검토 `030ee688-c270-4fb0-b074-94c5cbf1acdb` / revision 1
  - 원문: https://www.ddm.go.kr/tour/contents.do?key=2084
  - 위치: 동대문의 동명유래 > 이문동 > 이문 시설 및 명종 이후 훼손 문단(웹 열람 294~300행)
  - 확인: 2026-10-21T16:42:07Z · 범위: neighborhood
  - 판단: 이문의 방어 기능과 훼손 뒤 지명으로 남은 설명이 일치하며 현대 시설은 별도 현황 확인 대상으로 둔다.
- **청파동2가 · 원문 대조 완료**
  - 본문 `22473ad5-bc06-41b7-834a-ea15b225e63c` · 자료 `43f86a90-1125-45c0-9eab-604a06a59de5` · 검토 `37c712c9-8216-4fba-b200-df5f3d350d1b` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%B2%AD%ED%8C%8C%EB%8F%992%EA%B0%80
  - 위치: 서울지명사전 > 법정동 > 청파동2가(靑坡洞2街) > txt-box0 청파3·4계·1914년·1946년 문장
  - 확인: 2026-10-21T16:40:41.342264+00:00 · 범위: neighborhood
  - 판단: 청파3·4계 지역, 청엽정2정목 및 청파동2가로의 개칭이 일치한다.
- **하계동 · 원문 대조 완료**
  - 본문 `22880548-387e-494c-b131-a59691f3d1c7` · 자료 `670f5041-cf69-4599-aba7-a002966f3fd3` · 검토 `bb4d8964-3c31-4dee-9516-92de131f2656` / revision 1
  - 원문: https://www.nowon.kr/www/intrcn/intrcn1/intrcn1_05.jsp
  - 위치: 동명유래 > 하계동 > 단일 문단(한천 위치·1914년 하계리)
  - 확인: 2026-10-21T16:40:43.251104+00:00 · 범위: neighborhood
  - 판단: 한천 하류의 위치와 양주군 노해면 하계리 편제 설명이 일치한다.
- **봉익동 · 원문 대조 완료**
  - 본문 `22c264ec-8fc1-4ea6-960c-e9563f8f4a35` · 자료 `99c473f3-6131-4a47-bfbe-9f0b4ae2dcc1` · 검토 `7ded7fc4-6e75-494e-b3d8-b333c32b88b5` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%B4%89%EC%9D%B5%EB%8F%99
  - 위치: 서울지명사전 > 법정동 > 봉익동(鳳翼洞) > txt-box0 첫 문장·1914년 통합 문장
  - 확인: 2026-10-21T16:40:44.401582+00:00 · 범위: neighborhood
  - 판단: 창덕궁·종묘와 봉황 상징에 연결한 풀이 및 마동·태정동·묘동 일부 통합이 일치한다.
- **연지동 · 원문 대조 완료**
  - 본문 `22d86fad-d710-47e9-8135-55d666f86690` · 자료 `0e9e2b63-1502-4fa2-8264-5eae67fc988e` · 검토 `d01de7b9-bd32-49f0-ba6c-db1d211da5b2` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%97%B0%EC%A7%80%EB%8F%99
  - 위치: 서울지명사전 > 법정동 > 연지동(蓮池洞) > txt-box0 첫 문장·1914년 통합 문장
  - 확인: 2026-10-21T16:40:45.025469+00:00 · 범위: neighborhood
  - 판단: 도성 동지에 해당하는 연못과 냉정동·연지동 일부 통합이라는 설명이 일치한다.
- **남대문로5가 · 원문 대조 완료**
  - 본문 `22d92fa9-4fa2-4ba2-b43c-947aaf9742a5` · 자료 `f06b870c-4d80-4c8a-868f-48a469321b58` · 검토 `734f541a-37e7-42fd-99a8-4582040c2b91` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%82%A8%EB%8C%80%EB%AC%B8%EB%A1%9C5%EA%B0%80
  - 위치: 서울지명사전 > 법정동 > 남대문로5가(南大門路5街) > txt-box0 말미 두 문장
  - 확인: 2026-10-21T16:40:45.251309+00:00 · 범위: neighborhood
  - 판단: 남대문로5가·양동으로의 개편과 양동 폐지 뒤 합병 설명이 일치한다.
- **'왕타이' 실내 전경 · 재확인 필요**
  - 본문 `23e1a9dc-44ae-45ff-89e2-28ba37b181b2` · 자료 `59d4352e-343e-43ec-a8ef-cfc7f6bdf136` · 검토 `d18cb081-80fa-450a-8f33-cce185700783` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY354&fileId=H-TRNS-3504-359&fileSn=300&type=A&upperNodeId=CTGRY359
  - 위치: 상세 자료 > 내용 항목 · 『이태원; 공간과 삶』(2010), 380쪽
  - 확인: 2026-10-21T16:40:47.061268+00:00 · 범위: neighborhood
  - 판단: 등록 박물관 상세 URL이 HTTP 503을 반환했다. 상세 자료 > 내용 항목 · 『이태원; 공간과 삶』(2010), 380쪽의 전사·명칭·연대·공간과 이용조건을 이번에 원문 대조하지 못했다.
- **'대양건재'가 있는 부흥주택 · 재확인 필요**
  - 본문 `2570d734-c981-43af-aebd-2309260dfea2` · 자료 `0b427cd2-e9c1-4dab-acbb-f68882574b07` · 검토 `fa9b80f2-6060-4c29-b862-319d76cb4691` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY59&fileId=H-TRNS-3704-61&fileSn=300&type=A&upperNodeId=CTGRY61
  - 위치: 상세 자료 > 내용 항목 · 『돈의문 밖, 성벽 아랫마을; 역사·공간·주거』(2009), 124쪽
  - 확인: 2026-10-21T16:40:47.071445+00:00 · 범위: neighborhood
  - 판단: 등록 박물관 상세 URL이 HTTP 503을 반환했다. 상세 자료 > 내용 항목 · 『돈의문 밖, 성벽 아랫마을; 역사·공간·주거』(2009), 124쪽의 전사·명칭·연대·공간과 이용조건을 이번에 원문 대조하지 못했다.
- **원지동 · 원문 대조 완료**
  - 본문 `2699f077-4d1e-4e57-b59c-5549b02a7cf3` · 자료 `3b836bbd-9554-48b7-b702-6c5be5d18aa3` · 검토 `d8e0184a-8341-453b-bb0d-78366424db59` / revision 1
  - 원문: https://www.seocho.go.kr/site/seocho/05/10502040800002015070810.jsp
  - 위치: 원지동 지명유래 > 첫 문단·바람굴·삼남도로·원터마을 항목
  - 확인: 2026-10-21T16:40:48.668564+00:00 · 범위: neighborhood
  - 판단: 원터 유래, 1963년 세 자연마을의 묶음, 삼남도로·여의천·고속도로에 따른 마을 변화가 요약과 일치한다.
- **구로동 · 원문 대조 완료**
  - 본문 `2886b754-944b-49e7-b858-bca85f4a31cb` · 자료 `a127a802-d461-48cd-bdb0-1417c874066a` · 검토 `eecfef9c-ee3f-4013-9e40-7c5493da155d` / revision 1
  - 원문: https://www.guro.go.kr/www/contents.do?key=2128
  - 위치: 연혁 및 동명의 유래 > 첫 문장·1949년 서울 편입 및 1950년 리→동 문단
  - 확인: 2026-10-21T16:40:52.533776+00:00 · 범위: neighborhood
  - 판단: 아홉 노인 이야기의 전설 한정과 1949년 편입·1950년 동명 변경 설명이 일치한다.
- **체부동 · 재확인 필요**
  - 본문 `28a27c01-0174-4a50-a64c-6d98348e1574` · 자료 `bce19c0c-52c2-410b-8d7a-4e179d6fc70f` · 검토 `82ec26ab-6d5f-426c-8fe1-31b9baadd53f` / revision 1
  - 원문: https://culture.jongno.go.kr/media/ko/bbs/44/detail.do?pstSn=130
  - 위치: 상세정보 > (1) 동 유래 및 변천·(2) 동네 지명 유래(최초 웹 열람 101~114행); 이용조건 하단 재조회 실패
  - 확인: 2026-10-21T16:42:07Z · 범위: neighborhood
  - 판단: 최초 웹 열람에서 체찰사부 설치 기록의 부재와 굽은 골목 유래는 요약과 일치했다. 다만 이후 페이지 502·공개 GET 503으로 공공누리 표시를 이번에 재확인하지 못해 완료 처리하지 않는다.
- **신사동(강남구) · 원문 대조 완료**
  - 본문 `28f659ad-dc49-4396-8847-4332ef1ffc89` · 자료 `9ee3f1dc-5a54-4858-bdea-6a701480d348` · 검토 `043b0602-6b0c-4753-86a7-7c080d9c4fde` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EC%8B%A0%EC%82%AC%EB%8F%99
  - 위치: 서울지명사전 > 법정동 > 신사동(新沙洞) > txt-box1(강남구 항목), txt-box0 은평구 항목 제외
  - 확인: 2026-10-21T16:40:51.831323+00:00 · 범위: neighborhood
  - 판단: 새말·동산말·사평리 통합과 1963년 서울 편입, 1975년 강남구 소속이라는 요약이 두 번째 원문 항목과 일치한다.
- **남대문로3가 · 원문 대조 완료**
  - 본문 `2a579cec-5eda-465c-b63c-ffb0b90d0a13` · 자료 `617850d0-700c-4f2a-8f83-e1ab1524ce26` · 검토 `1f5f157d-d25c-4e6f-9943-76b7bceb98bd` / revision 1
  - 원문: https://history.seoul.go.kr/archive/ggdic/list.do?key=2211220002&pageIndex=1&sc=sc_nameKor&sc_alphabet=&sc_cate=1&sc_scndcode=1&sw=%EB%82%A8%EB%8C%80%EB%AC%B8%EB%A1%9C3%EA%B0%80
  - 위치: 서울지명사전 > 법정동 > 남대문로3가(南大門路3街) > txt-box0 1914년 병합·1946년 개칭 문장
  - 확인: 2026-10-21T16:40:55.274320+00:00 · 범위: neighborhood
  - 판단: 수교동·송현동·장동 및 상동 일부 병합과 남대문통3정목→남대문로3가 개칭이 일치한다.
- **'대양건재'가 있는 부흥주택 · 재확인 필요**
  - 본문 `2aa74d13-44ee-474a-8411-bfcbc5dc3fe1` · 자료 `3028cfd5-c2e3-492f-9898-cbd91b542696` · 검토 `90746e80-c8be-473f-af31-ba72c419dcb4` / revision 1
  - 원문: https://museum.seoul.go.kr/archive/archiveNew/NR_archiveView.do?ctgryId=CTGRY59&fileId=H-TRNS-4067-61&fileSn=300&type=A&upperNodeId=CTGRY61
  - 위치: 상세 자료 > 내용 항목 · 『돈의문 밖, 성벽 아랫마을; 역사·공간·주거』(2009), 124쪽
  - 확인: 2026-10-21T16:40:56.498692+00:00 · 범위: neighborhood
  - 판단: 등록 박물관 상세 URL이 HTTP 503을 반환했다. 상세 자료 > 내용 항목 · 『돈의문 밖, 성벽 아랫마을; 역사·공간·주거』(2009), 124쪽의 전사·명칭·연대·공간과 이용조건을 이번에 원문 대조하지 못했다.

다음 첫 미검토 본문은 `2b8ac548-81a1-4d20-ab90-c7bbe0b89d7d`(종로문화플랫폼 내자동)이다. 다음 커서는 `/api/archive/task?view=passages&unreviewed=true&limit=30&after=`이며 아직 미검토 534개·보류 51개, 합계 미완료 585개가 남아 review/ready로 계속한다. 후속 보강·주소·화면·전체 검증 단계의 완료를 주장하지 않는다. 전체 계획이 미완료이므로 기존 예약을 유지한다. 최종 감사 소스 커밋은 운영 checkpoint의 auditSourceCommit에 기록한다.
