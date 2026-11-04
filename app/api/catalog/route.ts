import {regions,sources} from '@/lib/history';
export function GET(){return Response.json({regions,sources,version:'2026-10-13',scope:'7개 권역의 지역 소개, 개별 부지 매칭 없음'});}
