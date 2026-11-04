import type {Metadata} from 'next';
import report from '@/data/uploaded-city-history-report-2026-10-20.json';
import VideoResearch from './video-research';
import './video-research.css';

export const metadata: Metadata = {
  title: '영상 조사자료 | 서울 장소 도슨트',
  description: '첨부 보고서에서 확인한 서울 도시사 조사 항목 215개와 PDF 원본, 출처 확인 상태를 함께 살펴봅니다.',
};

export default function VideoResearchPage() {
  return <VideoResearch report={report}/>;
}
