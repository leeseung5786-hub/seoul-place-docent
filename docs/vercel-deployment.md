# Vercel 배포

## 사용자 AI MCP 추가 운영 설정

`/mcp`는 로그인 없는 공개 자료 조회용입니다. 외부 AI에서 접근할 HTTPS URL을 연결하고 배포 보호가 로그인 HTML을 반환하지 않는지 확인하세요. 새 연결 UI가 현재 호스트의 `/mcp` URL을 표시합니다. `ARCHIVE_ADMIN_TOKEN`으로 `/admin/mcp`의 비공개 통계를 조회합니다. 관리자 키는 MCP 클라이언트에 입력하지 않습니다.

D1 연결 시 `mcp_tool_call_log`와 시간 인덱스를 자동으로 추가합니다(CREATE IF NOT EXISTS, 기존 데이터 변경 없음). D1 API 토큰은 읽기/쓰기 및 초기 테이블 생성 권한이 필요합니다. 연결이 없거나 저장이 실패하면 도구 결과에 `auditPersisted:false`가 표시되고 개인정보 없는 호스팅 로그가 기록됩니다. 영구 통계 저장 성공과 혼동하지 마세요. `/mcp` 속도 제한은 인스턴스 단위이므로 Vercel WAF에도 배포 전체 제한을 구성하세요. [구현·검증 보고서](user-ai-implementation.md)에 서비스별 연결 조건, 테스트, 비용 범위가 있습니다.

## 이번 오류의 원인

`NEXT_NO_ROUTES_MANIFEST`는 Vercel이 Next.js 산출물 `.next/routes-manifest.json`을 찾는데 기존 `pnpm build`가 Vinext/Cloudflare Worker 산출물을 `dist/`에 만들었기 때문에 발생했다. `dist/`를 Vercel 출력 폴더로 지정하거나 빈 manifest를 만들어서는 API가 동작하지 않는다.

`vercel.json`은 Next.js 프레임워크, `pnpm run build:vercel`, `.next` 출력을 명시한다. 이 명령은 `next build --webpack`을 실행하며 실제 Next.js manifest와 서버 라우트를 생성한다. Vercel이 기본 `pnpm build`를 호출하는 경우에도 `VERCEL=1`이면 Next.js를 선택한다. Cloudflare 빌드는 기존 Vinext 경로와 네이티브 바인딩을 유지한다.

## 적용 순서

1. 이 변경 사항을 Vercel에 연결된 GitHub 저장소/브랜치에 반영한다. `vercel.json`, `package.json`, `pnpm-lock.yaml`과 `lib/runtime*`를 포함한 변경 파일이 모두 필요하다.
2. Vercel 프로젝트의 Root Directory를 이 프로젝트의 `package.json`이 있는 폴더로 설정한다. Node.js는 `package.json`과 동일하게 22.x를 사용한다. 새 메이저 버전으로 자동 변경되지 않도록 범위를 고정했다.
3. 저장소의 `vercel.json` 설정을 사용한다. 대시보드에 과거 명령/출력 폴더 override가 있다면 제거하거나 Build Command를 `pnpm run build:vercel`, Output Directory를 `.next`로 맞춘다. `dist`나 정적 export를 사용하지 않는다.
4. 필요한 서버 환경변수를 Production/Preview 환경에 설정한다. 설정 이름은 `.env.vercel.example`을 참고한다. 값은 Git에 올리지 않는다.
5. 새 커밋으로 배포한다. 오래된 커밋의 기존 배포를 다시 실행하면 수정 코드가 포함되지 않는다. 빌드 로그에서 `next build --webpack` 실행과 성공 여부를 확인한다.

## Turborepo 캐시 설정을 사용하는 경우

현재 저장소에는 Turborepo 의존성이나 `turbo.json`이 없으며 Vercel은 빌드를 직접 실행한다. 따라서 아래 설정은 현재 실행 경로에는 적용되지 않는다. 상위 모노레포에서 `turbo run build`로 이 프로젝트를 빌드한다면 해당 모노레포의 `turbo.json`에 적용한다.

```json
{
  "tasks": {
    "build": {
      "outputs": [".next/**", "!.next/cache/**"]
    }
  }
}
```

이는 Next.js 산출물을 Turbo 캐시에 저장하고 복원하되 내부 캐시 폴더는 제외하는 설정이다. `routes-manifest.json`을 생성하는 설정은 아니므로 실제 빌드는 여전히 `next build`여야 한다. 기존 산출물 누락이 캐시되어 있다면 최초 수정 배포는 기존 빌드 캐시 없이 실행한다. JSON 파일에는 예시 전달 중 생긴 `&#x20;`이나 이스케이프된 별표를 넣지 않는다.

## 외부 서비스와 저장소

- 기존 주소·지도·건축물·AI 등의 키 이름은 그대로다. 새 Vercel 프로젝트로 자동 복사되지는 않는다.
- D1은 `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_D1_DATABASE_ID`, `CLOUDFLARE_D1_API_TOKEN`을 설정하면 기존 데이터베이스를 HTTP API로 읽고 쓴다. 데이터 복사나 자동 마이그레이션은 하지 않는다. 현재 D1의 테이블과 마이그레이션 상태는 그대로 유지된다. 여러 준비된 쿼리는 순서를 보존하는 한 번의 공식 `batch` 요청으로 전달한다.
- R2는 `CLOUDFLARE_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`로 기존 버킷을 연결한다. AWS SigV4로 서버에서 서명한다. 파일 다운로드·업로드·삭제와 AI 캐시에서 사용하는 바인딩 API를 제공한다.
- D1 설정이 없으면 DB 관련 API는 기존의 `ARCHIVE_NOT_READY` 응답을 반환한다. R2가 없으면 보관 파일 기능은 사용할 수 없으며 AI 캐시는 기존 메모리 캐시로 동작한다. 데이터가 없는 상태를 성공 응답으로 꾸미지 않는다.
- Cloudflare API 자체의 D1 호출 한도가 적용된다. HTTP 어댑터는 이 앱에서 사용하는 준비문·배치·exec를 제공하며 D1 세션과 덤프는 제공하지 않는다.

공식 API 형식: [D1 Query API](https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/query/), [R2 S3 호환 API](https://developers.cloudflare.com/r2/api/s3/api/).

## 인증과 플랫폼 차이

Vercel은 Sites의 `oai-authenticated-user-*` 헤더를 검증하지 않는다. 따라서 Vercel에서는 헤더/이메일만으로 관리자 권한을 부여하지 않으며 `ARCHIVE_ADMIN_TOKEN`과 `x-archive-admin` 요청 헤더를 사용한다. 기존 ChatGPT 로그인 보조 함수도 Vercel에서는 헤더로 사용자를 인증하지 않는다. Sites 로그인 URL은 Vercel에서 제공되지 않는다.

기존 `/api/archive/task`는 원래 owner-only Sites 호스트를 전제로 하므로 Vercel에서 계속 거부된다. 이 변경에서 Vercel Cron이나 새로운 예약 작업은 등록하지 않았다.

Vercel Functions의 요청 본문 크기 제한이 적용된다. 기존 업로드 화면의 10MB 제한보다 플랫폼 제한이 작을 수 있으므로 큰 원본 파일은 기존 저장소 경로 또는 별도 직접 업로드 구성이 필요하다.

## 로컬 확인

```sh
pnpm install --frozen-lockfile
pnpm run build:vercel
pnpm run start:vercel
pnpm test
pnpm typecheck
```

개발 시에는 `pnpm run dev:vercel`을 사용한다. 빌드 후 `.next/routes-manifest.json`, `.next/BUILD_ID`, `.next/server/app-paths-manifest.json`이 생성되어야 한다. `/api/status`는 키의 설정 여부만 표시하며 실제 제공기관의 응답 성공은 해당 조회에서 확인한다.

검증 결과: Node.js 22.23.4에서 최신 원본(`adef1bd`)에 변경을 적용한 Next.js 빌드와 타입 검사가 성공했다. 전체 테스트 266개 중 255개가 통과했으며, 실패한 11개는 같은 Node 22 환경의 수정 전 원본에서도 동일하게 실패한다(과거 데이터 건수 기대값, 원본 CSV 줄바꿈/해시, 사진 표시 조건). 이번 변경에 추가한 환경·저장소 어댑터 테스트 7개는 모두 통과했다. 기존 조사 데이터와 위키미디어 검색 로직은 변경하지 않았다. 실제 Vercel 배포와 외부 자격증명을 사용한 D1/R2 연결은 이 환경에서 수행하지 않았다.
