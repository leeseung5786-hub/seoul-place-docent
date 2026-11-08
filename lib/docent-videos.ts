import {filterVideoCatalog, videoCatalog, videoRelation} from './video-catalog';
import {relationLabels} from './video-catalog-types';
import {loadVideoRecords} from './video-records';

/** Reuse the archive ranking and provenance. Keep these separate from historical claims. */
export async function getDocentVideoCandidates(district: string, dong: string) {
 const candidates = filterVideoCatalog(videoCatalog.items, {district, dong, place: true})
  .filter(item => item.url && videoRelation(item, district, dong) !== 'seoul_background')
  .slice(0, 3);
 const records = await Promise.all(candidates.map(async item => {
  const relation = videoRelation(item, district, dong)!;
  // A missing provenance asset does not prevent photo/history retrieval.
  const detail = await loadVideoRecords(item.id).catch(() => null);
  const segments = item.refs.flatMap(ref => {
   const record = detail?.records[ref];
   return (record?.segments ?? []).map(segment => ({
    startLabel: segment.startLabel,
    endLabel: segment.endLabel,
    place: segment.place,
    description: segment.description,
    sourceUrl: record?.sourceUrl || null,
    validTime: segment.validTime,
    verifiedTime: segment.verifiedTime,
   }));
  }).slice(0, 4);
  return {
   id: item.id, title: item.title, url: item.url, provider: item.provider,
   historicalPeriods: item.historicalPeriods, relation, relationLabel: relationLabels[relation],
   independentlyVerified: item.independentlyVerified,
   segmentStatus: detail ? (segments.length ? 'available' : 'not_recorded') : 'unavailable',
   segments,
  };
 }));
 return {records, note: '영상은 지역 관련 조사 후보입니다. 시간 표기는 원자료를 따르며, 촬영 장소·재생 가능 여부·이용조건은 영상 원문에서 확인하세요.'};
}
