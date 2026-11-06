import type {Metadata} from 'next';
import report from '@/data/uploaded-city-history-report-2026-10-20.json';
import VideoResearch from './video-research';
import VideoResearchPanel from '@/app/components/VideoResearchPanel';
import './video-research.css';

export const metadata: Metadata = {
  title: '영상 조사자료 | 서울 장소 도슨트',
  description: '역사 영상 204개와 장면 155개, 원문 링크와 후보·제외 분류를 함께 살펴봅니다.',
};

export default function VideoResearchPage() {
  return <main><a href="/">서울 장소 도슨트로 돌아가기</a><VideoResearchPanel archive/><details className="legacy-video-report"><summary>이전 PDF 조사 항목 215개 보기</summary><VideoResearch report={report}/></details></main>;
}
