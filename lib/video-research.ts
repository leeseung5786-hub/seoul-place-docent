export type VideoSegment = {start: number | null; end: number | null; startLabel: string; endLabel: string; place: string; description: string; basis: string; validTime: boolean};
export type ResearchVideo = {
  id: string; videoId: string; group: string; title: string; channel: string; date: string;
  districtLabel: string; place: string; duration: string; reason: string; url: string | null;
  segments: VideoSegment[]; regionLinks: {district: string; dong: string; scope: string}[];
  reviewStatus: string; aliases: string[]; urlNormalized: boolean; invalidTimeCount: number;
};
export function filterResearchVideos(items: ResearchVideo[], filters: {query?: string; district?: string; dong?: string; group?: string}) {
  const terms = (filters.query || '').normalize('NFKC').toLowerCase().trim().split(/\s+/).filter(Boolean);
  return items.filter(item => {
    if (filters.group && item.group !== filters.group) return false;
    if (filters.district && !item.regionLinks.some(link => link.district === filters.district && (!filters.dong || link.dong === filters.dong))) return false;
    const text = [item.title, item.place, item.id, item.channel, item.date, ...item.segments.map(segment => segment.description)].join(' ').normalize('NFKC').toLowerCase();
    return terms.every(term => text.includes(term));
  });
}
