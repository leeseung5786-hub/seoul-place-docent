# 2026-10-21 지역 정비 14: 법정동 단계 완료

운영 계획 version 1, 마지막 regions/ready 체크포인트, scheduled-history-work 지침과 13번 기록을 먼저 읽었다. 다른 running 기록이 없어 묶음 `regions-20261021-lifecycle-completion-14`를 running으로 저장·재조회했다. 기존 Site ID와 소유자 1명 전용 custom 정책 revision 1, 외부 방문자·편집자·그룹 0개, 이 단계의 운영 version 21을 확인했다.

종로구 운니동부터 훈정동까지 남은 37개의 명칭·코드·현존 상태를 원본과 대조하고 revision 2로 운영 DB에 추가했다. 공식 현존 확인은 430→467/467개, 미검토는 37→0개다. 코드 467개·주소 응답 일치 464개·주소 미확인 3개·공식 원문 단독 확인 3개는 유지됐다. 마지막 3개를 주소 응답 일치로 승격하지 않았다.

원문은 2026-10-20T10:41:31.000Z 확보한 공식 서울 조회 ZIP/XLSX와 배포된 불변 스냅샷이다. 공식 조회 화면 https://www.code.go.kr/stdcode/regCodeL.do 는 2026-10-21 재열람했다. 다운로드 URL https://www.code.go.kr/stdcode/regCodeFileDown.do?cPage=1&pageSize=2000 에 POST, 필터 sidoCd=11, disuseAt=ALL, chkWantCnt=2, chkCrtDt=0, chkClsDt=0을 사용한 원본이다. ZIP SHA-256 `d5dd60146799664f0ccd857704b6f597955673dc627c2e90d3b88c095866d774`, XLSX SHA-256 `00e482e0f2cc862a49a6d28ae511a81df70ac2f6e4935f8bc1142fb832271bf9`와 전체 467개 행·메타데이터가 재계산 결과와 같았다.

전체 467개의 공식 상태·원문 전체 명칭·코드·행·해시·확인시각·주소 검토 연결을 전수 확인했다. 초기 147개에는 나중에 추가된 verificationBasis 필드가 없지만 addressReviewId와 일치하는 addressCode, 공식 원본 행·해시가 있어 근거가 확인됐다. 기존 이력을 다시 쓰거나 재적재하지 않고 이 구형 형식의 차이를 영수증에 명시했다. sourceAsOf:null, 빈 생성일·폐지일을 보존했다. 수집일을 전체 갱신일·법령 시행일로 바꾸지 않았고 법정동 식별을 역사본문·개별 부지 검토나 원문·사진·영상 재사용 허락으로 확대하지 않았다.

대상 37개 전수 재조회, 비대상 430개 전체 응답 불변, 전체 467개 ID·명칭·코드·계층·별칭·원출처 불변을 확인했다. 운니동·창신동·훈정동 재시도 3개는 동일 검토 ID·revision 2·unchanged:true였고 재시도 전후 전체 응답이 같았다. 자료 525건·본문 638개·연표 21개·파일 20개·자료 버전 525개와 지역별 자료 수는 유지됐다. 이 데이터 묶음 시점의 테스트 123/123, 타입 검사와 diff 검사를 통과했다. 처리 실패·코드·상태 상충은 0개다.

법정동 단계의 완료 기준을 충족하여 다음 단계는 review다. 전체 계획은 미완료여서 예약은 유지한다. 본문 검토 API는 작은 검증·감사 기능으로 구현·테스트·배포한 다음 사용한다. 데이터 작업 자체는 재배포하지 않으며 뒤따르는 API 코드 변경만 별도 배포 대상으로 구분한다.

37개 처리 ID·원문 위치·검토 ID:

- `dong-종로구-운니동` · 법정동코드 조회자료.xlsx / Sheet0!A35:E35 · 245a8950-94fb-4dbc-b0db-d05b086e324b
- `dong-종로구-원남동` · 법정동코드 조회자료.xlsx / Sheet0!A62:E62 · 70725b51-7f26-4e4c-bd35-5c1198bb8786
- `dong-종로구-원서동` · 법정동코드 조회자료.xlsx / Sheet0!A52:E52 · 29936a51-ec3a-448c-88fe-89a0c1306c52
- `dong-종로구-이화동` · 법정동코드 조회자료.xlsx / Sheet0!A68:E68 · b110e19e-d384-4b58-8a97-388f0873eef0
- `dong-종로구-익선동` · 법정동코드 조회자료.xlsx / Sheet0!A36:E36 · bf721058-8834-4788-a189-52da92322d35
- `dong-종로구-인사동` · 법정동코드 조회자료.xlsx / Sheet0!A39:E39 · fcef149c-1c70-4cf5-906f-f8ebd0bf8e69
- `dong-종로구-인의동` · 법정동코드 조회자료.xlsx / Sheet0!A60:E60 · b44d7e7d-0d22-4abb-9d66-b4c45227b4bf
- `dong-종로구-장사동` · 법정동코드 조회자료.xlsx / Sheet0!A57:E57 · b1805031-b89f-4f11-b025-b4045922ecce
- `dong-종로구-재동` · 법정동코드 조회자료.xlsx / Sheet0!A50:E50 · a894984f-c7c2-48d7-b894-0498f76bda64
- `dong-종로구-적선동` · 법정동코드 조회자료.xlsx / Sheet0!A10:E10 · 3fdd25ba-1f94-4ee6-8279-6241a0389b71
- `dong-종로구-종로1가` · 법정동코드 조회자료.xlsx / Sheet0!A29:E29 · d8e77a08-74f1-414f-adef-c8c11703c34e
- `dong-종로구-종로2가` · 법정동코드 조회자료.xlsx / Sheet0!A41:E41 · 835d0ec9-a88d-42d4-b9a7-b5c18a1ca640
- `dong-종로구-종로3가` · 법정동코드 조회자료.xlsx / Sheet0!A59:E59 · d23fc565-2724-4ba4-bfd8-f3deaab0f576
- `dong-종로구-종로4가` · 법정동코드 조회자료.xlsx / Sheet0!A64:E64 · 22b4a9c3-8f69-4c48-971f-7f56d7b4b342
- `dong-종로구-종로5가` · 법정동코드 조회자료.xlsx / Sheet0!A66:E66 · b8597750-79d3-47ab-9f75-fcff1bdb009d
- `dong-종로구-종로6가` · 법정동코드 조회자료.xlsx / Sheet0!A67:E67 · 43d03905-4cef-4726-93fa-5d971bbe54cb
- `dong-종로구-중학동` · 법정동코드 조회자료.xlsx / Sheet0!A28:E28 · 2358aa52-47fa-4c25-9dfd-4c88fa6ddd8b
- `dong-종로구-창성동` · 법정동코드 조회자료.xlsx / Sheet0!A8:E8 · a5da296e-2646-42a0-bc7f-29b739389f18
- `dong-종로구-창신동` · 법정동코드 조회자료.xlsx / Sheet0!A77:E77 · 3ae4812b-1be2-41c4-8f88-38bec6defb33
- `dong-종로구-청운동` · 법정동코드 조회자료.xlsx / Sheet0!A4:E4 · 3bd794a9-5d06-452a-b43d-3b530f7b8d1e
- `dong-종로구-청진동` · 법정동코드 조회자료.xlsx / Sheet0!A25:E25 · e95183e8-d51e-4bbb-bef7-97da4a3b8597
- `dong-종로구-체부동` · 법정동코드 조회자료.xlsx / Sheet0!A15:E15 · 677b1cdb-ffcd-4cd9-9269-99687d7598fa
- `dong-종로구-충신동` · 법정동코드 조회자료.xlsx / Sheet0!A70:E70 · 35be05b0-8d76-4f78-935c-a16cb71d2ea3
- `dong-종로구-통의동` · 법정동코드 조회자료.xlsx / Sheet0!A9:E9 · 811ddf4a-b673-44e7-9142-e4a4300c9627
- `dong-종로구-통인동` · 법정동코드 조회자료.xlsx / Sheet0!A11:E11 · e81c127e-11eb-4bd7-8519-e29b88901a66
- `dong-종로구-팔판동` · 법정동코드 조회자료.xlsx / Sheet0!A42:E42 · 2f6a1e1e-49c5-43c8-b024-7e4e80f25bf3
- `dong-종로구-평동` · 법정동코드 조회자료.xlsx / Sheet0!A80:E80 · 4a5eef78-1803-4e09-a348-eaae83a5a3d7
- `dong-종로구-평창동` · 법정동코드 조회자료.xlsx / Sheet0!A86:E86 · 0345ed39-539a-49fc-ac3a-04d3a07460ce
- `dong-종로구-필운동` · 법정동코드 조회자료.xlsx / Sheet0!A16:E16 · 05e9fea5-3b96-4584-b003-9c8cd4052052
- `dong-종로구-행촌동` · 법정동코드 조회자료.xlsx / Sheet0!A84:E84 · 77c26e60-e626-4ca8-9865-184965971355
- `dong-종로구-혜화동` · 법정동코드 조회자료.xlsx / Sheet0!A72:E72 · f062060a-7a0f-40a7-80e9-6edaa577c5b9
- `dong-종로구-홍지동` · 법정동코드 조회자료.xlsx / Sheet0!A88:E88 · b8683095-d73a-4ff4-8628-ba748d7dace3
- `dong-종로구-홍파동` · 법정동코드 조회자료.xlsx / Sheet0!A82:E82 · e00a743a-ee3e-4df6-96a0-cde96eb2ff5e
- `dong-종로구-화동` · 법정동코드 조회자료.xlsx / Sheet0!A46:E46 · ae03e524-1445-4ad4-9b47-87996b182fba
- `dong-종로구-효자동` · 법정동코드 조회자료.xlsx / Sheet0!A7:E7 · 018aaa1a-9080-478c-8e40-2c296ab35d4f
- `dong-종로구-효제동` · 법정동코드 조회자료.xlsx / Sheet0!A65:E65 · a65abdfa-edfe-443f-b4ff-46a14a97cedd
- `dong-종로구-훈정동` · 법정동코드 조회자료.xlsx / Sheet0!A53:E53 · e5018fe2-36d5-408d-b8bf-f0fff600e602

전체 개별 근거·시각·행·해시는 data/region-code-observations-2026-10-21-lifecycle-completion-14.json에 보존했다.
