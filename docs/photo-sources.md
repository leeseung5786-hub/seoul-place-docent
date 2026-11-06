# 사진 출처 연결 방식

## 1. 미리 모아 둔 서울기록원 사진 (주력)
서울기록원 서울사진아카이브 전체(약 9,300건)를 한 번에 모아 법정동별로 나눠 둡니다. 방문자가 주소를 고르면 기다림 없이 바로 이야기 카드와 사진 띠에 나옵니다.

- 수집: `node --experimental-transform-types --import ./tests/ts-resolver.mjs scripts/harvest-seoul-archives.mjs --refresh-list` → `data/seoul-archives/raw.jsonl` (이미 받은 기록은 건너뜀)
- 동별 정리: `node scripts/build-seoul-archives-photos.mjs` → `data/seoul-archives/photos.json`
- 자동 갱신: `.github/workflows/seoul-archives-photos.yml`이 매달 2일 새 사진을 받아 PR을 엽니다. 확인 후 합치고 재배포하면 됩니다.
- 표시 조건: 접근유형 **공개**, 이용유형 **제한없음**인 기록만.
- 동 매칭: 제목·설명·키워드·연관 장소에 동 이름이 나오면 그 동에 넣습니다(삼선동→삼선동1~5가, 여의도→여의도동). 두 구에 같은 이름이 있는 동(신사동·신정동)과 일반 단어와 겹치는 두 글자 동(합동·정동)은 구 이름도 함께 나와야 합니다. 동에 사진이 없으면 그 구의 사진 24장을 "자치구 배경"으로 보여 줍니다.

## 2. 실시간 검색 (보충)

주소를 고르면 `/api/place-photos`가 아래 출처를 함께 조회합니다. 하나가 실패해도 나머지는 그대로 보여 줍니다.

| 출처 | 방식 | 표시 조건 |
|---|---|---|
| Wikimedia Commons | 좌표 반경 검색, 근처 장소 분류, 동 이름 검색 | CC·퍼블릭도메인 등 공개 라이선스만 |
| 한국어 위키백과 | 근처 문서의 대표 사진 (Commons 라이선스 재확인) | 위와 같음 |

- 위키미디어 사진은 맨 위 사진 띠에만 나옵니다.
- 결과는 서버 메모리에 6시간 저장합니다.

## 새 기관 추가하기
미리 모을 수 있는 기관은 1번처럼 수집 스크립트 + `data/manual-photos.json` 형식의 결과 파일을 만들어 `lib/docent-data.ts`에 추가하는 방식이 가장 좋습니다. 실시간 검색이 필요하면 `PlacePhoto[]`를 돌려주는 함수를 만들고 `lib/place-photos.ts`의 `findPlacePhotos` 안 `named` 목록에 추가하면 됩니다. 이용조건을 페이지에서 확인할 수 없는 사진은 넣지 않습니다.
