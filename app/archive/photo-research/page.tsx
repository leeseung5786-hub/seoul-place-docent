import type {Metadata} from 'next';
import summary from '@/data/photo-research/combined-summary.json';
import PhotoResearch from './photo-research';
import type {PhotoResearchMeta} from '@/lib/photo-research';
import './photo-research.css';
import './integrated-research.css';
export const metadata: Metadata = {
  title: '사진·지도·영상·건물 조사자료 | 서울 장소 도슨트',
  description: `${summary.meta.districtCount}개 자치구·${summary.meta.dongCount}개 동의 자료와 서울 전역 통합조사, 총 ${summary.meta.recordCount}행. 시각자료와 건물 역사 카드의 시기·장소 관계·이용조건과 제공기관 원문을 탐색합니다.`,
};
export default function PhotoResearchPage() {return <PhotoResearch meta={summary.meta as unknown as PhotoResearchMeta}/>;}
