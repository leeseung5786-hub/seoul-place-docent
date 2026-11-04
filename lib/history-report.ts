export type HistoryReportItem = {
  id: string;
  batch: number;
  recordId: string;
  platform: string;
  channelName: string;
  videoUrlFragment: string;
  recordLine: string;
  recordPage: number;
  claimId: string;
  claimRecordId: string;
  claimExcerpt: string;
  claimLine: string;
  claimPage: number;
  year: number | null;
  dateLabel: string | null;
  topic: string;
  videoUrl: string | null;
  statementComplete: boolean;
  idMismatch: boolean;
  reviewStatus: string;
};

export type HistoryReportFilters = {query?: string; batch?: string; channel?: string; topic?: string; period?: string; issuesOnly?: boolean};

export function filterHistoryReport(items: HistoryReportItem[], filters: HistoryReportFilters) {
  const terms = (filters.query || '').trim().toLocaleLowerCase('ko-KR').split(/\s+/).filter(Boolean);
  return items.filter(item => {
    if (filters.batch && item.batch !== Number(filters.batch)) return false;
    if (filters.channel && item.channelName !== filters.channel) return false;
    if (filters.topic && item.topic !== filters.topic) return false;
    if (filters.period === 'before2000' && (item.year === null || item.year >= 2000)) return false;
    if (filters.period === 'from2000' && (item.year === null || item.year < 2000)) return false;
    if (filters.issuesOnly && !item.idMismatch) return false;
    const text = [item.recordId, item.claimId, item.claimRecordId, item.claimExcerpt, item.channelName, item.topic, item.batch].join(' ').toLocaleLowerCase('ko-KR');
    return terms.every(term => text.includes(term));
  });
}
