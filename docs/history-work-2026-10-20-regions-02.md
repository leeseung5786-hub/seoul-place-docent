# 2026-10-20 지역 코드 정비: 종로구 잔여 37개

## 시작·범위

- 운영 `/api/archive/task`의 계획 version 1과 마지막 `regions / ready` 기록을 읽었다. 진행 중인 다른 실행은 없었으며, 시작 시 `running`을 저장했다.
- Sites에서 기존 프로젝트와 소유자 한 사람만 허용하는 custom 정책을 재확인했다. 공개 범위·비밀값·기존 자료 ID·자료 버전은 변경하지 않았다.
- 직전 커서대로 종로구 운니동부터 훈정동까지 `review_revision=0`인 37개를 선택했다. 이 묶음으로 종로구 87개 명칭의 주소 응답 대조를 마쳤으나, 지역 정비 단계 전체를 완료하지 않았다.

## 운영 처리·재조회

- 기존 `verify-region-address` API가 공식 주소 서버를 직접 조회했다. 자치구·법정동명의 완전일치와 단일 코드를 확인한 37개 모두 revision 1 / `address_observed`로 저장했다. 미확인·상충·적재 실패는 0개다.
- 공식 근거: https://business.juso.go.kr/addrlink/addrLinkApi.do / `results.juso[].siNm·sggNm·emdNm·admCd`, `roadAddr·jibunAddr`. 확인일 2026-10-20. 항목별 정확한 조회시각과 응답은 운영 `archive_region_reviews.evidence`, 변경 전후와 감사 이력은 해당 검토 테이블 및 `archive_audit`에 남겼다.
- 코드 입력 52 → 89, 주소 응답 대조 50 → 87, 전체 명칭 467. 미대조 380개. 기존 코드 2개는 대조 기록이 없다면 여전히 미대조에 포함한다.
- 37개 전부의 코드·리비전·근거 위치·조회시각을 운영 재조회했다. 운니동·원남동·원서동을 원래 요청으로 다시 호출하여 동일 검토 ID와 `unchanged:true`를 확인했다.
- 전체 467개 지역의 ID·부모·명칭·종류·별칭·원출처·분류근거·기준일·생성일이 유지됐다. 이번 대상이 아닌 지역의 전체 응답도 변하지 않았다.
- 자료 524, 본문 638, 파일 20, 연표 21, 자료 버전 524가 유지됐다. coverage 재조회에서 본문이 연결된 명칭 467개, 빈 항목 0개, 종로구 대조 87개를 확인했다.
- 처리 ID·코드·리비전·조회시각과 검증 영수증은 `data/region-code-observations-2026-10-20-jongno-02.json`에 기록했다. 원문 전체·API 인증값·주소 선택 토큰은 새로 보관하지 않았다.

## 공식 상태 조사·한계

- https://www.code.go.kr/stdcode/regCodeL.do 및 https://code.go.kr/stdcode/regCodeL.do 직접 연결에서 HTTP 503을 확인했다. 웹으로 공식 목록 첫 화면은 열람했지만 개별 37개 또는 전체 87개의 현존·폐지 결과를 직접 확인하지 못했다.
- 따라서 `officialLifecycle:not_checked`를 유지한다. 주소 응답 관측을 `verified_current`, 역사본문 내용 검토, 개별 건물·부지의 동일성 검증으로 승격하지 않는다.
- 최초 로컬 네트워크 프록시 연결 오류와 직접 요청 DNS 오류는 기존 서비스 접근 및 표준 프록시 클라이언트로 복구했다. 권한 변경이나 토큰 재발급은 하지 않았다.

## 검사·후속 커서

- 전체 테스트 94개 및 `tsc --noEmit` 통과. 최초 테스트 명령의 TypeScript 변환 옵션 누락은 실행 명령을 바로잡은 뒤 재검사했다. 권장 명령: `node --experimental-transform-types --import ./tests/ts-resolver.mjs --test --test-isolation=none --test-reporter=spec tests/*.test.mjs`.
- 애플리케이션 코드·스키마·운영 계획은 변경하지 않았다. 문서와 처리 영수증만 소스에 보존한다. 이번 데이터 변경에는 빌드·운영 재배포나 브라우저 시각검사를 수행하지 않는다.
- 다음 커서: `review_revision=0` 중 강남구 개포동부터 정렬된 다음 25~50개. 공식 현존·폐지 상태 확인은 별도 미완료 과제로 유지한다. 지역 정비 단계가 끝나기 전에는 본문 검토 단계로 넘어가지 않는다.
- 최종 진행 기록에는 이 묶음 ID·처리 ID 37개·전후 지표·검사·실패 사유·다음 커서를 저장하고 재조회한다.
