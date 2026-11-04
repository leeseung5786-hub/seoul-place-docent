import seoulRegions from '../data/seoul-regions.json';

export const archiveGeographicScope = ['서울특별시', '경기도'] as const;
export type RecordGeography = 'seoul' | 'gyeonggi' | 'outside_scope' | 'unconfirmed';
export type LocatedRecord = {title: string; description?: string; location?: string};
const normalize = (value: string) => value.normalize('NFKC').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const compact = (value: string) => normalize(value).replace(/[^가-힣a-zA-Z0-9一-龥]/g, '');
// Current municipalities: Gyeonggi-do's official 시군별 조직도 (checked 2026-10-23).
// https://www.gg.go.kr/contents/contents.do?ciIdx=458&menuId=1809
export const gyeonggiMunicipalities = ['가평군', '고양시', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시', '남양주시', '동두천시', '부천시', '성남시', '수원시', '시흥시', '안산시', '안성시', '안양시', '양주시', '양평군', '여주시', '연천군', '오산시', '용인시', '의왕시', '의정부시', '이천시', '파주시', '평택시', '포천시', '하남시', '화성시'];
const historicalGyeonggi = ['고양군', '양주군', '광주군', '시흥군', '김포군', '부천군', '파주군', '포천군', '여주군', '양평군', '가평군', '연천군'];
// 중구 and 강서구 occur in several cities. Neither a query, a dong alone,
// nor the holding institution establishes the location of a record.
const distinctDistricts = seoulRegions.districts.filter(d => !['중구', '강서구'].includes(d.name));
const outsideFull = /(?:경상북도|경상남도|전라북도|전라남도|전북특별자치도|강원특별자치도|강원도|충청북도|충청남도|제주특별자치도|제주도|황해도|황해북도|황해남도|평안북도|평안남도|함경북도|함경남도|부산(?:광역시|직할시|부|시)|대구(?:광역시|직할시|부|시)|인천(?:광역시|직할시|부|시)|대전(?:광역시|직할시|부|시)|울산(?:광역시|시)|광주(?:광역시|직할시)|세종(?:특별자치시|시)|慶尙北道|慶尙南道|全羅北道|全羅南道|江原道|忠[淸清]北道|忠[淸清]南道|濟州道|仁川)/;
// Boundaries prevent false positives in 일대 전경, 문화대전 and 밤섬경남아너스빌.
const outsideShort = /(?:^|[^가-힣])(?:경북|경남|전북|전남|충북|충남|강원|제주|부산|대구|인천|대전|울산)(?=[^가-힣]|$|국제공항|공항|역|시|도|에서|의|을|과)/;
const outsideEnglish = /\b(?:Busan|Daegu|Incheon|Daejeon|Ulsan|Sejong(?:-si|\s+city)|Gangwon(?:-do)?|Jeju(?:-do)?|Gyeongsang(?:buk|nam)(?:-do)?|Jeolla(?:buk|nam)(?:-do)?|Chungcheong(?:buk|nam)(?:-do)?)\b/i;
const seoul = /(?:^|[^가-힣a-zA-Z])(?:서울(?:특별시|시|역|의|에서|에|을|과|지역|지구|\s|[·,:(（\-]|$)|경성부|경성시|한성부|京城府|漢城府|Seoul\b)/i;
const gyeonggi = /경기도|京畿道|\bGyeonggi(?:-do)?\b|(?:^|[^가-힣])경기(?=\s|[·,:(（\-]|$)/i;
// 김포공항 is in Seoul; the airport's name must not imply today's Gimpo city.
// These named facilities also identify the Seoul endpoint of mixed-area routes.
const seoulFacility = /김포(?:국제)?공항|제2한강교|양화대교|탑골공원/;
const seoulBanghwa = /강서구\s*방화동/;
const municipality = /(?:^|[^가-힣])([가-힣]{2,8}(?:특례시|시|군))(?=\s|[-(:\d]|$)/g;
const canonicalMunicipality = (value: string) => value.replace('특례시', '시');
function municipalityNames(value: string) {return [...value.matchAll(municipality)].map(m => canonicalMunicipality(m[1]));}
function hasGyeonggiLocation(value: string) {
  if (gyeonggi.test(value) || gyeonggi.test(compact(value))) return true;
  // Bare 광주시 is historically ambiguous with today's 광주광역시.
  return municipalityNames(value).some(name => name !== '광주시' && (gyeonggiMunicipalities.includes(name) || historicalGyeonggi.includes(name)));
}
function hasOutsideLocation(value: string) {
  if (outsideFull.test(compact(value)) || outsideShort.test(value) || outsideEnglish.test(value)) return true;
  const addresses = value.matchAll(/(?:^|[^가-힣])([가-힣]{2,8}(?:시|군))\s+([가-힣0-9]{1,20}(?:구|읍|면|동|리|가))(?=\s|[-(:\d]|$)/g);
  return [...addresses].some(m => !['서울특별시', '서울시', '경성시', ...gyeonggiMunicipalities, ...historicalGyeonggi].includes(canonicalMunicipality(m[1])));
}
function classifyLocation(value: string): RecordGeography {
  const key = compact(value);
  const inSeoul = seoul.test(value) || seoulFacility.test(value) || seoulBanghwa.test(value) || distinctDistricts.some(d => key.includes(d.name) && d.dongs.some(dong => key.includes(dong)));
  const inGyeonggi = hasGyeonggiLocation(value);
  if (hasOutsideLocation(value)) return inSeoul || inGyeonggi ? 'unconfirmed' : 'outside_scope';
  return inSeoul ? 'seoul' : inGyeonggi ? 'gyeonggi' : 'unconfirmed';
}

/** Metadata screening, not parcel verification. Explicit location must be the
 * source's subject/photograph location, never a batch label or storage address.
 * A Seoul monument can depict an event elsewhere; Busan storage cannot move a
 * historical Gyeonggi map to Busan.
 */
export function classifyRecordGeography(record: LocatedRecord): RecordGeography {
  if (record.location) {
    const location = normalize(record.location), located = classifyLocation(location);
    if (located !== 'unconfirmed' || hasOutsideLocation(location)) return located;
  }
  const title = normalize(record.title).replace(/(?:경상북도|경상남도|전라북도|전라남도|충청북도|충청남도|강원도|경기도|부산|대구|인천|대전|울산)\s*출신(?:\s*주민)?/g, '');
  const classified = classifyLocation(title);
  if (classified !== 'unconfirmed' || hasOutsideLocation(title)) return classified;
  const description = normalize(record.description || '').replace(/(?:국가기록원\s*)?(?:부산|대전)\s*(?:분원|기록관|서고)(?:\s*(?:소장|보관|보존))?/g, '');
  return classifyLocation(description);
}

export function filterArchiveRecords<T extends LocatedRecord>(items: T[]) {
  const kept: T[] = [];
  let outsideScopeCount = 0, unconfirmedLocationCount = 0;
  for (const item of items) {
    const location = classifyRecordGeography(item);
    if (location === 'seoul' || location === 'gyeonggi') kept.push(item);
    else if (location === 'outside_scope') outsideScopeCount++;
    else unconfirmedLocationCount++;
  }
  return {items: kept, geographicScope: archiveGeographicScope, excludedCount: outsideScopeCount + unconfirmedLocationCount, outsideScopeCount, unconfirmedLocationCount};
}
