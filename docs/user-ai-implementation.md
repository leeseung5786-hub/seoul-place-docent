# 사용자 AI 연동 구현 및 운영 검증

기준: xeonica/seoul-place-docent main `d21667960a1fd8905a9daebfcee847f4b9666574`. 공식 문서 확인일: 2026-11-07 (서울).

## A. 구현 기능

- 기존 8개 MCP 도구, 근거 묶음, 기계적 검증, generate_place_answer 호환 이름을 재사용한다. 홈페이지 AI 설명·번역·내레이션·캐시는 유지한다.
- 메인 화면의 AI 안내 메뉴와 주소 선택 결과에서 별도 `/ai-guide` 페이지로 이동한다. 해당 페이지에서 사용자 AI 연결 안내를 제공한다. ChatGPT·Claude·Gemini 선택, 계정 조건, 공식 안내, URL/질문 복사, 서비스 열기, 호출 확인 방법을 제공한다. 자동 로그인/연결 성공을 표시하지 않는다.
- 주소 문자열만 질문에 포함한다. 서명 token, API 키, GPS, 질문을 외부 열기 URL에 넣지 않는다. 브라우저 클립보드 실패 시 읽기 전용 입력에서 직접 복사할 수 있다.
- `/mcp`는 공개 읽기 도구를 제공한다. stateless JSON 응답을 사용하며 세션이나 OAuth를 새로 요구하지 않는다. 배포 호스트가 로그인을 강제하면 그 호스트의 인증 연동을 별도 검증해야 한다.
- HTTP Origin(있을 때 동일 origin만 허용), Accept 두 미디어 형식, JSON Content-Type, 32KiB 스트리밍 본문 제한, 프로토콜 버전/헤더 일치, JSON-RPC 오류, GET/DELETE 405, notification 202를 처리한다. Origin 없는 서버 간 호출은 허용한다. 외부 브라우저용 CORS는 열지 않는다.
- 인스턴스 전체 분당 120개 POST 제한(429/Retry-After)을 둔다. 사용자 IP/헤더를 신뢰해 제한을 우회할 수 있게 하지 않는다. 다중 인스턴스 전체 한도는 아니므로 배포 플랫폼의 WAF/속도 제한도 설정한다.
- 실제 실행한 모든 도구에 서버 UUID, 시각, 도구, 성공, 반환 자료 수, 실행 ms, 고정 오류 분류, 미인증 클라이언트 종류, 검증 실행 여부를 기록한다. 잘못된 JSON/알 수 없는 도구처럼 실행 전 거절한 요청은 도구 실행 로그에 포함하지 않는다.
- 요청 ID는 도구 결과의 `serverReceipt` 텍스트와 `_meta`로 전달한다. 클라이언트가 보낸 JSON-RPC id/사용자 이름은 증명 ID로 사용하지 않는다. 클라이언트 종류는 User-Agent에서 고정된 분류만 추출하며 인증된 공급자 정보가 아니다.
- `/admin/mcp` → `/api/admin/mcp-stats`에서 서울 기준 오늘 전체 호출·성공·오류·자료 반환·평균/P95·도구별 빈도·검증 요청/실행·최근 50개 요청 ID를 확인한다. 기존 관리자 인증과 Origin 검사를 사용한다. 키는 페이지 메모리에만 보관한다. 응답은 no-store이다.

## B. 변경 파일

| 파일 | 변경 |
|---|---|
| app/mcp/route.ts | HTTP 검증 및 전체 도구 실행 감사 연결 |
| lib/mcp-http.ts | Origin/Accept/버전·헤더 검사, 인스턴스 제한 |
| lib/mcp-protocol.ts | 감사 결과 타입, discovery 작성 지침 |
| lib/mcp-audit.ts | 개인정보 없는 감사 저장과 SQL 통계 |
| app/api/admin/mcp-stats/route.ts | 인증된 통계 조회 |
| app/admin/mcp/page.tsx | 관리자 통계 화면 |
| lib/user-ai.ts | 서비스별 연결 안내와 주소 질문 |
| app/components/UserAIConnect.tsx, app/ai-guide/page.tsx | 별도 AI 연결 안내 페이지와 UI |
| app/components/DocentHome.tsx, app/docent.css | 메인/선택 주소 연결 및 스타일 |
| tests/mcp-http-audit.test.mjs, tests/ts-resolver.mjs | 실제 라우트·SQLite 감사·인증·LLM 차단 검증 |
| .github/workflows/mcp-client-kpi.yml | 새 테스트 실행 및 의존성 설치 |
| docs/mcp.md, docs/vercel-deployment.md, 이 문서 | 연결·운영·검증 안내 |

## C. 검증 범위

테스트는 주소 제공기관 응답과 D1 HTTP를 로컬 fixture로 대체한다. 실제 라우트→공급자 코드, 실제 HMAC 주소 서명/검증, SQLite SQL 저장/집계, D1 HTTP 어댑터→관리자 API를 실행한다. 외부 유료 API나 운영 DB에는 쓰지 않는다.

새 테스트: initialize/list, 알림, JSON 오류, GET/DELETE, Origin/Accept/Content-Type, 선언/실제 본문 크기, 최신 버전 헤더·Base64 이름, 알 수 없는 버전/도구, 8개 도구 경로, 잘못된 주소·서울 외 주소·복수 후보·결과 없음·GPS 없음/범위 오류, 개인정보 없는 로그, 저장 실패, UUID 대조, 서울 자정/P95, 관리자 위조 헤더·교차 Origin 차단, 주소 질문을 검증한다. 자료 없음은 기존 place-answer.test.mjs의 no_records 테스트도 유지한다.

운영자 모델 호출 방지 테스트는 가짜 OPENAI_API_KEY를 설정하고, 실제 도구 호출 중 주소 제공기관 외 모든 fetch를 감시한다. 예상 밖 호출을 도구 오류가 삼켜도 기록된 호출 목록으로 테스트를 실패시킨다. D1 경로는 별도 HTTP fixture로 검증한다.

수정 전후 전체 테스트 결과와 빌드 결과는 아래 최종 실행 기록을 참고한다. 운영 HTTPS, MCP Inspector 및 AI 로그인 계정의 실제 도구 호출/최종 답변 완료는 로컬 단위 테스트와 구분한다.

## D. 서비스별 연결 결과

| 서비스 | 공식 지원/조건 | 본 서버 실제 계정 연결 |
|---|---|---|
| ChatGPT | 웹 Plugins에서 사용자 MCP 추가, 서버 URL과 No authentication 선택, 설치 후 @로 사용. 워크스페이스 권한/보안 정책 적용. 공식 페이지에서 전체 요금제별 제공 범위를 확인하지 못했으므로 계정 UI에서 확인 | 미검증 |
| Claude | Free(1개), Pro/Max/Ultra/Team/Enterprise. Customize → Connectors에서 웹 커넥터 추가. 조직은 관리자의 등록 권한 필요. 공개 서버는 No sign in | 미검증 |
| Gemini | 웹 Connected Apps → Custom apps. 미국, 만 18세 이상, 개인 계정, 영어, Keep Activity 활성화 조건. 한국·직장/학교 계정의 일반 연결을 지원한다고 표시하지 않음 | 미검증; 로그인 없는 이 서버의 연결 완료도 확인 필요 |

공식 출처: [OpenAI 사용자 MCP](https://developers.openai.com/api/docs/guides/custom-mcp-server), [Claude 원격 커넥터](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp), [Gemini 사용자 앱](https://support.google.com/gemini/answer/17209137?hl=en-VU), [Gemini 개발자 검사 화면](https://developers.google.com/connected-apps/mcp/dev-mode).

## E. 비용 및 모델 호출 경로

| 경로 | 실행 주체/비용 |
|---|---|
| /api/ai-summary → lib/ai-summary.ts → openaiFetch | 운영자 OpenAI Responses API. 기존 캐시 유지 |
| /api/docent/narration → lib/docent-narration.ts → openaiFetch | 운영자 OpenAI Responses API. 기존 캐시 유지 |
| /api/docent/translation → lib/docent-translation.ts → openaiFetch | 운영자 OpenAI Responses API. 기존 캐시 유지 |
| /mcp → searchAddresses/mapAddress/getFullDocentStory/preparePlaceAnswer/validateAnswer/통계 | 모델 호출 없음. 주소·지도 API, 호스팅, D1 저장/집계 비용은 남음 |
| 사용자 AI 대화 → MCP 근거 → 최종 작성 | 사용자가 선택한 AI의 계정·한도 적용. 본 서버는 사용자 토큰/과금/답변 완료를 관측하지 못함 |

기존 홈페이지는 주소 선택 후 AI 설명을 자동 요청할 수 있다. MCP 경로 0회는 홈페이지 전체 운영자 AI 비용 0원을 뜻하지 않는다. 기존 자동 실행 동작은 요구사항에 따라 보존했다.

## F. 운영 한계와 미검증

- 외부 AI 실제 로그인/도구 승인/답변 완료, 운영 HTTPS·D1 자격증명·Sites 인증은 미검증이다. 실제 연결 테스트를 성공으로 표시하지 않는다.
- 자료 반환 수는 후보 배열, 역사 records/scenes, 검증 결과 sources의 실제 길이다. 집계 도구는 역사 자료 반환 수 0으로 기록된다. 자료 0건/후보 선택 대기도 도구가 정상 응답했다면 실행 성공이다. 자료 반환 성공과 분리한다.
- 응답 ms는 도구 실행 시간이며 감사 저장과 네트워크 전송 시간은 제외한다. P95는 오늘 전체 도구 실행(오류 포함)에 대한 nearest-rank이며 표본 절단 없이 SQL로 계산한다.
- `mcp_client_docent_log`는 그대로 두고 독립 테이블 `mcp_tool_call_log`와 시간 인덱스를 CREATE IF NOT EXISTS로 추가한다. 기존 데이터 삭제/변경은 없다. 스키마 최초 초기화 후 인스턴스 내 재사용한다.
- D1 미설정/실패 시 자료 조회를 계속하고 개인정보 없는 구조화 호스팅 로그를 남긴다. 응답 `auditPersisted:false`를 보고 영구 DB 저장 성공으로 해석하면 안 된다. DB 미설정은 관리자 화면에서도 명시한다.
- 서버 UUID는 서버 로그와 대조해야 의미가 있다. AI가 임의로 출력한 UUID, User-Agent, JSON-RPC id만으로 정품 클라이언트/자료 사용/답변 완료를 입증할 수 없다.
- 로그 보존 기간 및 삭제는 운영자의 정책으로 별도 관리한다. 이번 변경은 기존/신규 기록을 자동 삭제하지 않는다. 플랫폼의 별도 HTTP 접근 로그 설정도 개인정보 정책에 맞춰 검토한다.

## G. 배포 후 필요한 작업

1. 변경 코드를 검토하고 승인한 저장소/브랜치에 반영한 뒤 배포한다. 2026-11-08 사용자가 이 채팅의 전체 변경 사항 반영을 승인했다. 배포 완료 여부는 실제 배포 결과로 별도 확인한다.
2. 주소 검색 JUSO_API_KEY, 필요시 KAKAO_REST_API_KEY를 설정한다. 기존 운영자 AI 키는 유지한다.
3. Vercel에서는 CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_D1_API_TOKEN(D1 읽기/쓰기)을 설정한다. Cloudflare에서는 기존 DB 바인딩을 사용한다. 새 감사 테이블 생성 권한이 필요하다.
4. 강한 ARCHIVE_ADMIN_TOKEN을 서버에 설정하고 /admin/mcp에서 사용한다. Vercel은 oai-authenticated-user-*를 인증하지 않으므로 기존 runtime-env가 owner 이메일 인증을 차단한다. Cloudflare Sites는 신뢰할 수 있는 ingress의 헤더 검증이 전제이다.
5. WAF에서 /mcp POST에 배포 전체 속도 제한을 설정하고, 외부 AI 서버에서 HTTPS에 접근 가능한지 확인한다. 브라우저 로그인 HTML을 MCP 응답으로 반환하면 안 된다.
6. 각 AI에서 이 서버를 등록하고 도구 상세의 search_place→prepare_place_answer→validate_place_answer 및 요청 ID를 관리자 로그와 대조한다. 주소 후보가 여러 개일 때 사용자 선택을 받는지, 출처/시기/미확인 사항이 최종 답변에 있는지 별도 확인한다.

## 최종 실행 기록

최종 정리일: 2026-11-08 (서울). 실행 환경: Windows, Node 22.21.1, pnpm 11.25.0.

| 검증 | 결과 |
|---|---|
| 원본 main, 같은 Node 22와 동일한 데이터 파일 바이트 | 270개 중 257 통과 / 13 실패 |
| 수정 후 pnpm test | 278개 중 265 통과 / 13 실패. 실패한 테스트 이름이 원본과 완전히 같음 |
| MCP·근거·GPS 집중 테스트 | 30/30 통과 (새 HTTP/감사 통합 테스트 8개 포함) |
| pnpm typecheck | 통과 |
| pnpm run build:vercel | 통과. /mcp, /admin/mcp, /api/admin/mcp-stats 포함 |
| git diff --check | 통과 |
| 실제 로컬 HTTP | initialize 200 / 버전 2025-11-25, tools/list 200 / 8개, resolve_photo_location({}) 200 / 서버 UUID 반환 |
| 관리자 HTTP | /admin/mcp 200, 비인증 /api/admin/mcp-stats 403 |
| 브라우저 | 연결 안내 펼침, ChatGPT→Gemini→Claude 전환, 질문 복사 성공, 관리자 인증 거부/로컬 테스트 키 인증/D1 미설정 안내/잠금 확인 |
| 최신 2026-07-28 규격 | 필수 clientCapabilities, 버전·메서드·이름 헤더, Base64 이름, resultType=complete, serverInfo 메타데이터를 자동 테스트/공식 사양과 대조 |
| 실제 외부 AI·운영 HTTPS·MCP Inspector·운영 D1 | 미검증 |

기존 실패는 다운로드 원본 해시/누적 조사 데이터 기대값/사진 미리보기 정책 등의 13개이다. 조사 데이터와 기존 기능을 변경하거나 테스트 기대값을 낮추지 않았다. 전체 테스트가 모두 통과한 상태라고 보고하지 않는다.

Windows 샌드박스에서 빌드 디렉터리 생성 EPERM과 localhost EACCES가 발생했다. 동일한 빌드를 허용된 확장 실행 권한으로 실행해 성공했다. 브라우저/HTTP 확인은 127.0.0.1에만 바인딩한 별도 검증 서버에서 수행했으며 운영자 OpenAI/JUSO 키와 D1 연결을 비워 운영 API 및 DB를 사용하지 않았다. 검증 서버는 종료했다. 위 실행 기록은 최초 로컬 검증 시점의 결과다.

로컬 증거는 `outputs/`에 보관한다(버전 관리 제외): 원본/수정 후 테스트 로그, MCP 집중 테스트 로그, 타입 검사·빌드 로그, 연결 안내 화면 `user-ai-connect.jpg`. 외부 AI용 계정 연결 증거와 혼동하지 않는다.
