# 사진 기반 도슨트 구현·검증 보고서

2026-11-08 (Asia/Seoul). 기준 main: `2fd945bae1cc657d9e6c2d1bc352913757fec96d` (PR #26 포함).
작업 중 PR #26이 먼저 병합되어 그 구현을 재사용하고 필요한 보완만 추가했다. 운영 배포 완료 보고서가 아니다.

## 1. 구현 완료한 기능

**구현 완료 / 실기기 미검증**: 사진 선택 → 로컬 GPS 추출 → 기존 주소 변환 → 후보 주소 선택 → 기존 역사·사진·영상 패널 → AI 안내의 주소 질문 복사.

PR #26의 JPEG/HEIC 처리·후보 주소 확인·영상 근거를 유지했다. 이 PR은 실제 형식·빈 파일·손상/위치 없음·서울 범위 검사, 현재 위치 대체 입력, 건물 후보가 없는 경우 동네 확인을 보완한다. 사진/현재 위치 결과에서는 운영자 AI 자동 생성을 끄고 기존 수동 생성 버튼은 유지한다. 일반 주소 조회의 자동 AI 동작은 유지한다.

## 2. 재사용한 기능과 분석

| 영역 | 기존 구조와 재사용 |
|---|---|
| 사진 | `lib/photo-gps.ts`: JPEG APP1/TIFF 파서 및 PR #26의 `exifr@7.1.3` 동적 import를 통한 HEIC GPS. 두 TIFF 엔디언·유리수·방향 참조 |
| 주소 | `lib/map-address.ts`: WGS84 카카오 coord2address/coord2regioncode → 서울 법정동 코드 확인 → JUSO 같은 지번 후보. 행정동·도로명·지번·건물명·필지/동 수준 반환 |
| 후보 | `lib/providers.ts`: 공식 주소 정규화·서명 token·서버 재검증. 사진 후보는 하나여도 사용자 선택. 건물/피사체 동일성 보증 아님 |
| 웹 | `DocentHome`, `DocentStory`, `PhotoResearchPanel`, `VideoResearchPanel`, `/ai-guide`. 주소 결과에서 기존 자료를 자동 조회 |
| 역사 | `lib/docent-data.ts`, `lib/place-answer.ts`: 동네/자치구 장면, 대표 사진·기관·원문·이용조건, 문단 ID·숫자 기계 검사 |
| 영상 | `lib/video-catalog.ts`, 기존 압축 provenance 샤드·관련 범위 정렬·구간 검증 상태 |
| MCP | 기존 8개 도구·입력·버전 협상·읽기 권한·감사·인스턴스당 분당 120 POST 제한. 서버 모델 호출 없음 |
| 런타임 | Sites Cloudflare native D1/ASSETS와 Vercel D1 HTTP 어댑터 및 공개 MCP 전용 패키지 |
| 운영자 AI | 기존 홈페이지 AI·번역·내레이션·캐시 유지. 사진/현재 위치 조회의 설명 생성은 버튼으로 명시적 실행 |

## 3. 추가·수정 파일

- `lib/photo-gps.ts`: 실제 형식·20MiB·좌표 범위 검사. 첫 EXIF에 GPS가 없으면 다음 EXIF 탐색, 비정상 각도 거절.
- `app/components/DocentHome.tsx`, `app/docent.css`: 진행 상태·현재 위치 버튼·동네 확인·44px 버튼·사진 경로 자동 AI 방지.
- `lib/docent-videos.ts`, `app/mcp/route.ts`: 기존 영상 응답 보존, 검증 구간·원본 날짜·길이·출처·이용조건·건물 미검증 추가. 샤드 순차 로딩.
- `tests/photo-gps.test.mjs`, `tests/fixtures/photo-gps.mjs`, `tests/docent-videos.test.mjs`: 합성 EXIF·실제 카탈로그 검사.
- `tests/photo-flow.browser.mjs`: 선택/확인/대체 입력 브라우저 검사.
- `tests/public-mcp-package.integration.mjs`: 패키지 자체 디렉터리에서 GPS→주소→근거→검증. 저장소 루트의 샤드가 누락된 패키지를 가려주지 못하게 함.
- `docs/mcp.md`, 이 문서: 지원 범위·검증·환경변수·실기기 점검.

PR #26의 패키지·lockfile·빌드 복사 설정은 그대로 재사용한다. 새 의존성·새 MCP 도구·이미지 업로드 API는 추가하지 않았다.

## 4. 실제 사진 → GPS → 주소 코드 경로

`File.arrayBuffer()` → `inspectPhonePhotoLocation()` → 기존 `readPhonePhotoGps()` → JPEG는 `readPhotoGps()`, HEIC는 동적 exifr → `/api/map-address?x=경도&y=위도` → `mapAddress()` → 후보 선택 → `/api/place` 또는 확인 후 동네 기록.

20MiB 초과 파일은 읽기 전에 거절한다. 실제 바이트가 지원 형식인지 검사하고 GPS가 없거나 손상됐으면 주소·지도·현재 위치를 안내한다. 서울 사각형은 1차 검사이며 실제 행정 범위는 기존 공급자 법정동 코드로 확인한다.

원본 사진은 기기에 남는다. 새 원본 업로드/저장 경로는 없다. 서버에는 좌표만 기존 주소 요청으로 전달된다. 사진의 촬영 위치와 피사체 위치를 구분한다. 현재 위치 버튼은 클릭 후 브라우저 위치 권한 경로를 사용하며 사진 GPS로 표시하지 않는다.

## 5. MCP 역사·사진·영상 구조

기존 `prepare_place_answer`/`generate_place_answer`의 `neighborhood.records`, `source.photo`, `place`, `generation`, `instructions`, `videos.records`를 유지한다. 동네·자치구 근거를 개별 건물 역사로 승격하지 않는다.

영상은 기존 최대 3개 후보와 관련 범위를 유지한다. 이 PR은 각 영상에 다음 필드를 추가한다.

- `sources`: 조사 원문 URL·촬영/제작/게시일·이용조건. 미확인 값은 null 또는 미확인 안내.
- `date`, `dateType`, `duration`: 기존 수록값. 게시일과 역사적 대상 시기를 혼동하지 않음.
- `buildingMatch: unverified`: 개별 건물·필지 동일성은 미검증.
- `verifiedSegments`: 기존 DB의 `verifiedTime`/`validTime`이 참이고 유한한 양의 순서 구간일 때만 시작/종료 초와 링크 반환.
- `playbackStatus`: 검증 구간이 없으면 `재생구간 미검증`.

기존 `segments`의 원자료 시간 표기는 유지하되 검증된 링크와 구분한다. `segmentStatus: unavailable`이면 provenance 파일 읽기 실패다. 자료 반환 자체는 계속한다. 영상 후보는 문헌 근거 ID를 대체하지 않으며 기계 검증은 역사 사실 전체나 영상 재생을 보증하지 않는다. 서버는 모델 API를 호출하지 않는다.

## 6. ChatGPT·Claude·Gemini 직접 사진 첨부

**직접 첨부 자동 GPS: 미구현 / 계정 실증 미수행**. 사진 업로드, 모델의 이미지 이해, 원본 EXIF 접근, MCP 인자 전달은 별개다. 현재 `resolve_photo_location` 입력은 위도·경도이고 파일/파일 ID를 받지 않는다.

공식 문서 확인일 2026-11-08:

- [ChatGPT Image Inputs FAQ](https://help.openai.com/en/articles/8400551-chatgpt-image-inputs-faq): 이미지 이해는 원본 파일명·메타데이터를 처리하지 않는다고 안내한다. 별도 파일 분석 기능이 있더라도 MCP 자동 전달을 보장하지 않는다.
- [Claude Vision](https://platform.claude.com/docs/en/build-with-claude/vision), [MCP connector](https://platform.claude.com/docs/en/agents-and-tools/mcp-connector): 이미지 입력은 base64/URL/Files API이며 원격 MCP 호출과 별개다. 일반 채팅 첨부 EXIF 자동 전달 보장은 확인하지 못했다.
- [Gemini Image understanding](https://ai.google.dev/gemini-api/docs/image-understanding), [Files API](https://ai.google.dev/gemini-api/docs/files), [Function calling](https://ai.google.dev/gemini-api/docs/function-calling): API 미디어 입력 지원은 일반 Gemini 채팅 첨부 GPS 전달의 증명이 아니다.

우선 지원 경로는 웹에서 주소 확인 → `/ai-guide`의 질문 복사·서비스 열기 → 사용자의 AI가 MCP 호출이다. 자동 로그인·사용자 구독 토큰 접근·모델 자동 호출은 구현하지 않았다. 외관으로 주소를 추측하지 않는다.

## 7. iPhone / Android 지원

**부분 구현 / 실기기 미검증**: 원본 JPEG GPS와 HEIC/HEIF GPS를 로컬 파싱한다. HEIC 경로는 PR #26의 exifr 7.1.3을 재사용하며 기존 합성 ISO BMFF/EXIF 테스트에서 좌표 추출을 확인했다. 실제 아이폰·갤럭시 원본 파일은 확보하지 못했으므로 기종별 성공으로 보고하지 않는다. 브라우저·공유·촬영 설정에 따라 GPS가 제거될 수 있다. HEIF의 모든 변형을 지원한다고 보장하지 않는다.

## 8. 검증 결과와 한계

- `pnpm test`: 파일 38개 중 35개 통과. `integrated-research.test.mjs`, `photo-research.test.mjs`, `place-context.test.mjs` 기존 3개 실패. 최신 main 별도 worktree에서도 같은 실패를 재현했다. 이번 변경에서 원자료·집계 기대값을 바꾸지 않았다.
- 새 GPS·영상 및 기존 HEIC 합성 검사, MCP 계약·HTTP·감사·모델 호출 차단 검사 통과.
- `pnpm typecheck`, Vercel Next/Webpack 빌드, Sites/Vinext 빌드, 공개 MCP·Build Output 패키지를 검사한다. 두 프레임워크는 `.next/types`를 함께 생성하므로 동시에 빌드하면 생성 타입이 충돌한다. 최종 검사는 순차 실행한다.
- 공개 패키지 자체 디렉터리에서 GPS→주소 후보→자료 준비→답변 검증 통합 검사 통과. 카카오/JUSO 응답은 fixture이고 모델 API는 차단한다. 영상 provenance를 패키지 안에서 실제로 읽는다.
- Chromium 390×844: 합성 GPS JPEG·좌표 순서·단일 후보 확인 전 건물 조회 0회/확인 후 1회·복수 후보·동네 확인·GPS 없는 사진·원본 비전송·자동 운영자 AI 요청 없음. 외부 주소/건물 응답은 fixture, 역사·사진·영상은 로컬 실제 API 사용.
- 연결된 기존 운영 플러그인 `search_place`로 마장로42길 16 단일 후보, `prepare_place_answer`로 ready/근거 14개/serverAiCalls=0을 실제 확인했다. 요청 ID: `3f2bab37-6ab9-49d5-a9e3-d507412bda4c`, `b1302c93-b395-4e1b-a170-b0704634388e`. 당시 운영 응답에는 videos가 없었다. 이 확인은 **새 PR의 배포/EXIF 실증이 아니다**.
- 실기기 원본·운영 GPS 역지오코딩·실제 AI 최종 해설·영상 장면 재생은 미검증.

```sh
pnpm test
pnpm typecheck
pnpm build:vercel
# Vercel 빌드 종료 후 실행 (동시 실행 금지)
pnpm build
pnpm build:mcp-public:vercel
node --test tests/public-mcp-package.integration.mjs
# 운영 빌드 서버와 Playwright가 있는 개발 환경
PHOTO_TEST_URL=http://127.0.0.1:3011/ CHROMIUM_PATH=/usr/bin/chromium node tests/photo-flow.browser.mjs
```

## 9. 환경변수

새 필수 키는 없다. 기존 `KAKAO_REST_API_KEY`(역지오코딩), `JUSO_API_KEY`(공식 주소·서명), `MCP_PUBLIC_URL`(검증한 공개 서버)을 재사용한다. Sites D1/ASSETS 바인딩을 유지한다. Vercel D1은 기존 `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_D1_DATABASE_ID`, `CLOUDFLARE_D1_API_TOKEN`을 사용한다. 미설정 통계·감사 제한 표시와 주소 키 누락 안내를 유지한다.

호스팅의 서버 Secret에서 관리하며 값은 Git·브라우저·문서에 넣지 않는다. 공개 MCP 기본 조회에 `OPENAI_API_KEY`나 관리자 키는 필요 없다. 기존 홈페이지 운영자 AI 설정은 유지한다. 공개 MCP의 무인증 주소와 Sites의 인증된 `/mcp`는 별개다.

## 10. 배포 후 실기기 확인

아이폰 원본 JPEG/HEIC·갤럭시 JPEG·GPS 제거 사진·손상 파일·20MiB 초과 파일·서울 외 사진을 점검한다. 현재 위치 허용/거부, 주소 후보 1개/복수/없음, 지도·직접 주소, 동네 범위·사진 없음·영상 구간 미검증 표시를 확인한다. 수동 운영자 AI 버튼, 기존 일반 주소 검색의 자동 AI, AI 안내 주소 복사를 각각 확인한다.

공개 MCP 운영 패키지의 `videos.records`, 출처, `verifiedSegments`, 샤드 미연결 상태를 점검한다. 실제 AI 계정에서 도구 호출과 사진·영상 원문 포함 해설을 따로 확인한다.

## 11. 미구현·미검증

일반 AI 채팅 원본 자동 전달, 실제 기기·사진 확보, 운영 GPS 정확도, 영상 독립 재생 검증, 새 코드 배포와 최종 사용자 해설 실증은 완료하지 않았다. 연도·사진·영상 구간·건물 동일성을 추정해 생성하지 않는다.

## 12. 기존 기능 영향

기존 홈페이지 구조·주소 검색·지도·자료실·사진/영상/문헌/D1 자료·Wikimedia 공급자 코드는 보존한다. 기존 8개 MCP 도구 입력과 응답 필드를 유지하고 영상 필드만 추가한다. 운영자 API·캐시·번역·내레이션·관리 인증을 보존하며 사진/현재 위치 경로의 자동 생성만 수동 버튼으로 전환한다. 샤드 순차 읽기로 동시 메모리 사용을 줄인다. 코드 작성·PR 생성과 운영 배포는 별개다.
