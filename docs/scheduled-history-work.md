# 서울 역사자료 작업 실행 지침

실행 계획의 기준 파일은 `data/history-maintenance-plan.json`이다. 각 단계는 한 번의 실행으로 끝내는 것이 아니라 운영 상태와 checkpoint를 읽어 미완료 묶음을 이어서 처리한다. 사용자가 작업 우선순위나 범위를 바꾸면 계획에 반영한다.

## 사이트 접근

기존 Site ID와 소유자 전용 공개 범위를 유지한다. 이 사이트는 현재 소유자 한 사람만 접근하는 custom 정책이다. Sites get_site에서 현재 정책과 운영 주소를 먼저 확인한다. 공개되거나 다른 접근자가 추가되면 아래 서비스 쓰기를 사용하지 말고 별도 권한 체계를 먼저 구성한다. 공개 범위를 예약 실행을 위해 변경하지 않는다.

소스는 Sites 스킬의 기존 사이트 열기 절차로 현재 저장소를 복구한다. 소스 인증값은 세션 메모리에만 두고 stdin으로 전달한다. 새 실행은 현재 세션의 파일·토큰에 의존하지 않는다.

소유자 전용 운영 사이트에는 Sites가 발급하는 서비스 접근을 사용한다. get_site가 반환한 siwc_bypass_bearer_token을 해당 사이트에만 `OAI-Sites-Authorization: Bearer <token>`으로 전달한다. 플랫폼이 이 헤더를 검증·소비한다. 방문자 신원이나 연결 앱 동의를 공급하는 토큰이 아니다. 별도 ARCHIVE_ADMIN_TOKEN을 조회·교체하거나 예약 프롬프트에 넣지 않는다.

## 운영 API

- `GET /api/archive/task`: 현재 계획, 마지막 checkpoint, 운영 통계. 시작 및 종료 시 읽는다.
- `POST /api/archive/task`, `{action:"capture",payload:{batchId,items}}`: 기존 capture 검증·버전·중복 방지 절차로 1~10개 자료를 반영한다. 기존 API와 동일한 CaptureInput 형식이다.
- `POST /api/archive/task`, `{action:"checkpoint",progress:{phase,status,processed,summary,nextCursor}}`: 단계 ID, 상태(ready/running/completed/blocked), 이번 처리량, 근거·검증·문제 요약, 다음 작업 커서를 저장한다. cursor는 비밀정보를 포함하지 않는다.
- 기존 `GET /api/archive/coverage`, `/regions`, `/sources`, `/sources/:id`로 표본을 대조한다. 전체 현황이 필요하면 Sites의 DB 읽기 도구를 사용한다.

### 지역 코드 대조 (2026-10-20 추가)

- `GET /api/archive/task?view=regions`: 법정동 ID, 기존 코드, `review_revision`, 최근 근거와 집계. 기존 코드가 있어도 검토 기록이 없으면 미대조 상태다.
- `POST /api/archive/task`, `{action:"verify-region-address",payload:{regionId,expectedRevision,expectedCode}}`: 서버가 직접 `주소기반산업지원서비스`에 `서울특별시 + 구 + 법정동명`을 조회한다. 자치구와 법정동명이 완전히 일치하고 코드가 하나인 경우에만 코드를 입력한다. 응답의 `siNm·sggNm·emdNm·admCd`가 법정동 정보라는 제공기관 안내 URL도 보존한다.
- `address_observed`는 **현재 주소 응답에서 명칭·코드를 관측**했다는 상태다. 행정표준코드의 현존·폐지 여부를 직접 확인한 `verified_current` 상태로 간주하지 않는다. `officialLifecycle:not_checked`를 기록하며 법정동 코드 입력률과 공식 상태 확인률을 구분한다.
- 명칭 불일치·복수 코드 결과는 `unconfirmed`, 기존 코드·다른 지역과의 상충은 `code_conflict`다. 이때 기존 코드를 덮어쓰지 않는다. 상위기관의 일시 장애는 오류로 반환하고 검토 완료로 기록하지 않는다.
- 새 `archive_region_reviews`에 변경 전후 값·근거 위치·조회시각·검토자·리비전을 저장하고 `archive_audit`에도 남긴다. 기존 자료·본문의 ID나 버전은 바뀌지 않는다. 이전 리비전과 코드가 다른 요청은 충돌로 거절한다. 성공한 요청의 같은 재시도는 기존 결과를 반환한다.
- 1회에 25~50개를 처리하고 각 결과를 `view=regions`와 coverage에서 재조회한다. 주소 관측만 끝난 항목의 공식 현존·폐지 상태는 후속 원문 조사 대상으로 유지한다. 공식 코드 사이트 일시 오류를 이유로 다음 단계의 본문 검토에 먼저 넘어가지 않는다.

### 공식 현존·폐지 상태 대조 (2026-10-20 추가)

- 공식 코드 사이트의 공개 서울 검색자료를 확보했다. `data/official-code-lifecycle-2026-10-20.json`은 `https://www.code.go.kr/stdcode/regCodeFileDown.do?cPage=1&pageSize=2000`에 POST한 조회 결과의 식별 사실이다. 요청 필터, ZIP/엑셀 해시, 시트와 원본 행 번호, 확인 시각을 보존했다. 원문은 서울 1,112행(현존 493·폐지 619)이며, 현존 493개 중 시·구 단위를 제외한 467개 법정동 명칭이 DB 목록과 정확히 일치한다. 이 일괄 대조와 운영 개별 검토 완료는 구분한다.
- `POST /api/archive/task`, `{action:"verify-region-lifecycle",payload:{regionId,expectedRevision,expectedCode}}`: 배포된 불변 스냅샷에서 ID·자치구·전체 명칭이 유일하게 일치하는 행을 사용한다. 호출자가 코드·상태·출처를 임의로 공급할 수 없다. 먼저 주소 응답 대조가 있어야 하며, 현재 리비전과 코드를 맞춰 호출한다.
- 코드가 같고 원문 상태가 현존이면 `verified_current`, 폐지이면 `verified_abolished`로 저장한다. 코드가 다르면 `lifecycle_conflict`로 남기고 기존 코드는 덮어쓰지 않는다. 명칭 불일치·중복·잘못된 원문은 저장하지 않는다. 모든 결과는 기존 검토 테이블에 새 리비전으로 추가하고 감사 이력을 남긴다. 기존 주소 대조 기록과 자료·본문·분류의 ID와 버전은 유지한다.
- 엑셀의 `Sheet0!A행:E행`과 원문 값, `fileSha256`, `retrievedAt`, 조회 방법·필터, 앞선 주소 검토 ID를 재조회한다. 생성일·폐지일이 빈칸이면 null로 보존한다. 이 자료는 **2026-10-20 조회 시점** 기준이고 전체 데이터 갱신일은 원문에 없으므로 `sourceAsOf:null`이다. 확인일을 법령 시행일·개별 생성일로 대체하지 않는다. 새 스냅샷은 별도로 수집·검토하고 코드 변경 절차로 배포한 후 사용한다.
- 주소 응답 대조 수와 공식 현존·폐지 확인 수는 방법별 최신 검토로 독립 집계한다. `GET ...?view=regions`와 coverage 통계의 `lifecycleChecked`, `verifiedCurrent`, `verifiedAbolished`를 확인한다.
- 다음 실행은 주소 미대조 25~50개를 먼저 처리하고 같은 대상의 공식 상태를 대조한다. 주소 대조가 끝난 기존 항목의 공식 상태 확인 공백도 후속 묶음으로 처리한다. 운영 최신 검토 방법이 `official_code_snapshot`인지, 근거에 실제 스냅샷 해시가 있는지 확인한다. 단순히 코드가 있거나 파일에서 명칭을 찾았다는 이유로 운영 검토 완료로 집계하지 않는다.
- 테스트 실행은 `node --experimental-transform-types --import ./tests/ts-resolver.mjs --test --experimental-test-isolation=none tests/*.test.mjs`를 사용한다. 격리된 실행에서 파일 9개 통과만 보이는 결과를 개별 검증문항 수로 보고하지 않는다.

### 주소 검색 첫 페이지에 정확한 명칭이 없는 법정동 (2026-10-21 추가)

- **배포 완료(2026-10-21):** 기능 커밋 `b891cc41e83ca81c66d63590fbf59af27768a879`을 포함한 소스 `3d37d31371fc761f7241aebc036e8f4d86f3781e`를 테스트 114개·타입 검사·빌드 후 기존 소유자 전용 사이트 version 19로 배포했다. 배포 ID `appgdep_6ad7affa275481918f1c809d4ddb5e4e`, 결과 succeeded다. 보류됐던 당산동·양평동·영등포동 3개를 revision 2 / verified_current로 운영 반영·재조회했다. 주소 응답 미확인 3개는 별도로 보존하며 주소 일치로 집계하지 않는다. 이전 실행에서 완료한 47개를 포함해 이미 검토한 항목을 재적재하지 않는다. 이전 배포 오류는 이번에 재현되지 않았고 원인은 확정하지 않는다.
- 당산동·양평동·영등포동처럼 ‘○가’ 없는 법정동이 ‘○동1가’ 등과 함께 검색될 수 있다. 첫 페이지의 정확 명칭 미일치는 주소 부재나 법정동 폐지를 뜻하지 않는다. 주소 검색 결과를 근거 없이 해당 법정동으로 확대하거나 코드가 다른 ‘○가’ 지역을 대신 연결하지 않는다.
- `POST /api/archive/task`, `{action:"verify-region-official-code",payload:{regionId,expectedRevision,expectedCode:null}}`: 기존 코드가 비어 있고, 가장 최근 검토가 공식 주소 응답의 `unconfirmed`이며 완전일치 후보가 0개인 경우에만 허용한다. 복수 코드가 일치한 경우, 기존 코드, 중복 코드, 버전 상충, 원문 명칭·현존 상태 불일치는 거절한다. 코드·상태·출처는 호출자가 공급할 수 없다.
- 같은 검증된 공식 스냅샷의 ID·자치구·전체 명칭이 유일하게 일치하는 현존 행에서 빈 코드만 입력한다. 검토·코드 변경·감사 이력을 한 트랜잭션으로 저장한다. 주소 미확인 기록은 삭제하거나 성공으로 고치지 않는다.
- 공식 상태 근거에 `verificationBasis:official_snapshot_only`, 주소 미확인 검토 ID, `addressObservationStatus:unconfirmed`, 첫 페이지 관측 한계와 원문 행·해시·확인일을 남긴다. 주소 응답 일치 수에는 포함하지 않는다. `addressUnconfirmed`와 `officialCodeOnly`를 별도 집계해 화면에도 표시한다.
- 같은 25~50개 묶음에서 주소 일치 항목은 기존 `verify-region-lifecycle`, 정확명칭 미관측 항목은 위 별도 경로를 사용한다. 원문을 충분히 확인하지 못했으면 미확인 사유와 후속 커서를 남기고 다음 단계로 성급히 이동하지 않는다.

작업 시작 시 running 상태를 기록한다. 최근 실행이 아직 running이면 중복 실행하지 말고 상태를 확인한다. 90분 이상 지난 중단 기록은 실제 반영 결과부터 확인하고 재개한다. 동시에 다른 사용자의 수정이 있으면 버전 충돌을 존중한다.

지역 코드의 주소 응답 대조와 공식 현존·폐지 상태 API는 위 절차로 사용할 수 있다. 주소 관계를 수정하는 API는 아직 없다. 단계별로 필요한 검증과 감사 기록을 갖춘 작은 기능을 먼저 개발하고 테스트·배포한 다음 사용한다. 비공개 서비스 API는 임의 SQL이나 삭제 동작을 받지 않는다.

### 본문 원문 대조 검토 (2026-10-21 추가)

- 법정동 단계는 2026-10-21의 14번 묶음에서 467/467개 공식 상태 근거를 운영 재조회해 완료했다. 주소 응답 일치는 464개이며 주소 미확인 3개는 공식 원문 단독 확인 상태로 보존한다. 근거는 2026-10-20 조회 원본이지 법령 시행일이 아니다. 초기 147개의 구형 검토에는 verificationBasis 필드가 없으나 실제 addressReviewId·addressCode와 원문 행·해시를 전수 확인했으며 기존 이력을 다시 쓰지 않았다.
- `GET /api/archive/task?view=passages&limit=20&unreviewed=true&after=`는 현재 본문과 원문 URL·본문 버전·자료 버전·지문·검토 리비전·명칭 분류를 반환한다. `sourceId`와 `textKind=paraphrase|transcription|quotation`을 선택할 수 있다. 현재 본문은 자료의 본문이 있는 마지막 버전 기준이며 목록 메타데이터 수정만으로 본문이 사라지지 않는다. 최대 30개, ID 커서를 사용한다.
- `POST /api/archive/task`, `{action:"review-passage",payload:{passageId,expectedRevision,expectedFingerprint,status,evidence}}`를 사용한다. status는 content_checked 또는 needs_review다. evidence는 sourceUrl(등록된 원문과 동일), sourceLocator, observedAt(실제 확인시각), sourceHash(직접 확보한 원문 SHA-256 또는 null), classification(factual/tradition/mixed/inference/conflict/unconfirmed), spatialScope:"neighborhood"|"district", scopeNote, summary, checks를 포함한다.
- checks의 names·chronology·tradition·consistency·rights·spatial 각각에 `{result:"checked"|"unresolved"|"not_applicable",note}`를 남긴다. content_checked는 미해결 항목·상충·미확인 분류를 허용하지 않으며 명칭·상충·권리·범위를 실제 대조해야 한다. 전승·추정의 한정이 보존됐는지도 확인한다. 새 권리 허락을 입력하거나 원문을 다시 적재하지 않는다. 권리 불명확을 원문 보관·재사용 허용으로 승격하지 않는다.
- 원문을 실제 열람하고 URL·정확한 문단·확인일과 항목별 판단을 기록한다. 지명이 같은 다른 지역, 연대가 다른 자료, 전승·가설의 사실 승격을 확인한다. 확인하지 못한 원문은 content_checked로 저장하지 않는다. needs_review는 검토 기록 수에는 포함되지만 완료 수에는 포함되지 않는다.
- archive_passage_reviews는 본문·버전·원문·권리·지역 분류의 상태 지문과 검토자를 추가 이력으로 저장하고 archive_audit에 남긴다. 본문 자체·기존 ID·자료 버전·권리·지역 연결·연표는 바꾸지 않고 본문의 행정적 review_status만 갱신한다. 같은 요청의 재시도는 같은 검토 ID를 반환하며 동시 수정은 충돌로 거절한다. 변경된 본문·자료·분류는 기존 검토를 오래된 기록으로 표시하고 다시 검토 대기에 포함한다.
- 운영 반영 후 같은 목록을 재조회하고 검토 ID·리비전·지문·근거·상태와 중복 방지를 확인한다. `GET /api/archive/passage-reviews?sourceId=...` 및 자료 상세의 본문 검토 기록에서 최신 이력과 원문 위치를 볼 수 있다. DB 백업에 새 검토 테이블을 포함한다.
- `/api/archive/task`의 passageVerification은 currentPassages·reviewed·contentChecked·needsReview·unreviewed·remaining을 별도 집계한다. 미검토 15~30개를 처리한 후 다음 미검토 ID를 저장한다. 미해결 항목은 사유를 남기고 독립적으로 처리할 다음 항목을 진행한다. 한 필터를 끝낸 뒤에는 전체 유형의 미검토·재검토 공백을 다시 확인한다.

일반 데이터 적재는 재배포하지 않는다. 코드 변경 시 Sites 절차로 테스트·타입 검사·빌드·소스 동기화·배포를 완료하고 운영 결과를 확인한다. 원문 전체를 무단 보관하지 않는다. 작업 결과를 checkpoint와 소스의 비밀정보 없는 작업 기록에 남긴다.

모든 단계 완료 후 최종 결과를 보고하고 연결된 예약을 일시 중지한다. 예약 저장 자체를 작업 완료로 보고하지 않는다.

### 등록 원문의 제한된 서버 열람 (2026-10-24 추가)

- 로컬·웹 열람 경로가 반복 실패할 때 사용할 작은 기능이다. **테스트·타입 검사·빌드·기존 소유자 전용 사이트 배포를 확인한 후에만 사용한다.** `POST /api/archive/task`, `{action:"observe-original",payload:{passageId,expectedFingerprint,requestId,searchText}}`는 현재 등록 본문의 제공기관 원문만 요청한다. 호출자가 URL·SQL·헤더를 입력할 수 없다. 요청당 검색 문자열은80자, 본문은1MB, 시간은15초, 이동은3회, 반환 발췌는6,000자로 제한한다.
- 허용된 강서구·성동구·종로문화플랫폼·용산구·서울역사박물관의 명시적 HTTPS 호스트만 사용한다. 이동도 같은 기관의 www 별칭만 허용한다. 서비스 토큰·방문자 신원·쿠키는 외부 원문에 전달하지 않는다. 새 기관 추가는 별도 코드 검증·배포로 처리한다.
- 응답의 `observation`은 요청/최종URL·HTTP상태·실제 시작/완료시각·바이트수·응답 본문 해시·인코딩·검색어 발견 여부·발췌 위치/해시·행위자를 담는다. `htmlHashKind:response_body_bytes`와 `excerptKind:normalized_html_text_window`를 구별한다. HTML의 스크립트·스타일·태그 제거와 공백 정규화는 열람용 보조 변환이며 원문 전사·인용의 동일성 검증을 대신하지 않는다. 문자열을 발견하지 못하면 발췌는null이며 실제 해당 문단을 다시 확인해야 한다.
- 원문·발췌는 감사 DB에 저장하지 않고 `archive_audit`에 `passage_original_observation` 메타데이터만 추가한다. 본문·검토 상태·기존ID·버전·이용조건·지역 연결·연표·자산은 바꾸지 않는다. 등록상태가 열람 중 바뀌면 감사 저장을 거절한다. HTTP성공·문자열 발견만으로 대조 완료 또는 복제·재사용 허락을 부여하지 않는다. 후속 `review-passage`/`correct-passage`는 실제 문단·권리·공간 범위를 별도로 검토하고 기존 절차로 수행한다.
- 동일 행위자·requestId의 재시도는 같은 감사ID와 메타데이터만 반환하며 다시 요청하지 않는다. 발췌는null이고 `unchanged:true`다. 같은ID로 대상·지문·검색어를 바꾸면409로 거절한다. 실패도 HTTP/시간초과/크기/매체/이동/디코딩 사유를 기록하며 원문이 사라졌다고 단정하지 않는다.
- `GET /api/archive/task?view=original-observations&sourceId=...`는 최근30개와 잘림 여부를 반환한다. 실제 운영 호출·재전송·감사 재조회와 자료/본문 상태 불변을 확인하고 실행 기록에 남긴다. 기존 `archive_audit`를 사용하므로 새 스키마·임의SQL·원문 복제 저장 경로는 만들지 않는다.

### 짧은 재서술의 편집 교정 (2026-10-24 추가)

- `POST /api/archive/task`, `{action:"correct-passage",payload:{passageId,expectedReviewRevision,expectedCorrectionRevision,expectedFingerprint,text,reason,evidence}}`는 원문 대조에서 문제가 확인된 **짧은 재서술**만 교정한다. 현재 본문의 활성 `needs_review` 검토가 있어야 하며, 등록 URL의 최근 원문 위치·확인시각·직접 확보한 SHA-256과 모든 검사 결과를 제출한다. 새 문장은 최대 1,200자다. 인용·전사·연표가 연결된 구간·자치구 맥락의 교정이나 지역 연결 변경은 이 API로 처리하지 않는다.
- 본문 ID·자료/본문 버전·원문 URL·원문 메타데이터·이용조건·지역 연결을 유지한다. `archive_passage_corrections`에 변경 전후 전체 상태·지문·이전 검토 ID·사유·근거·행위자를 새 리비전으로 보존하고 감사도 같은 트랜잭션에 추가한다. 이전 문장과 검토를 삭제하거나 덮어쓰지 않는다. 교정은 자동 승인이 아니며, 변경된 본문은 기존 검토가 오래된 상태로 표시되므로 새 지문으로 `review-passage`를 별도 수행한다.
- 동시 본문·자료·권리·검토·교정 변경은 원자적 상태 검사로 거절한다. 같은 교정 요청의 재전송은 같은 교정 ID를 반환하고 감사·본문을 중복 생성하지 않는다. 최신 교정 뒤 자료가 다시 변경됐으면 과거 요청으로 덮어쓰지 않는다.
- `GET /api/archive/passage-corrections?sourceId=...`와 자료 상세의 ‘재서술 교정 이력’에서 이전/이후 문장·원문 위치·사유·확인일을 읽는다. DB 백업 schemaVersion 6에 새 테이블을 포함한다. 교정 테이블은 배포 마이그레이션으로만 만들며 요청 처리 중 임의 SQL·스키마 생성 경로는 두지 않는다.
- 기능을 테스트·타입 검사·빌드·기존 소유자 전용 사이트 배포한 **후** 운영 교정에 사용한다. 실제 배포 버전·처리 ID·변경 전후 지문·재검토 및 재전송 결과는 해당 묶음 기록에 남긴다. 공식 원문 자체의 오류를 임의로 고치는 기능이 아니다.

### 자치구 본문 검토 범위 (2026-10-22 추가)

- 자치구 전체의 연혁은 `spatialScope:"district"`로 기록한다. 이 값은 본문의 기존 지역 연결이 모두 `district_context`이고 연결된 지역의 실제 level이 `district`인 경우에만 허용한다. 법정동·빈 연결·혼합 연결을 자치구로 바꾸는 요청은 거절한다.
- 자치구 맥락만 연결된 본문은 `neighborhood`로 대조 완료 처리할 수 없다. 기존 검토의 같은 요청 재시도는 기존 ID로 반환하고, 과거 이력·지역 연결·본문 지문은 변경하지 않는다.
- 공간 연결·본문·목록 동시 수정은 기존 지문과 원자적 저장 검사로 거절한다. 자치구 범위를 화면의 검토 기록에도 표시하며 별도 스키마 변경이나 기존 자료 재적재는 없다.
- 이 기능은 테스트·타입 검사·빌드 및 기존 소유자 전용 Site 배포 완료 후에 운영 입력으로 사용한다. 실제 배포·재조회 결과는 해당 실행 기록에 남긴다.
