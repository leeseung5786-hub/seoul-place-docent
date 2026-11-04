import legacy from '../data/photo-research/bundle.json';
import additional from '../data/integrated-research/photo-items.json';
import summary from '../data/photo-research/combined-summary.json';
import type {PhotoResearchBundle, PhotoResearchItem, PhotoResearchMeta} from './photo-research';

const items = [...legacy.items, ...additional] as unknown as PhotoResearchItem[];
const counts = new Map<string, number>();
for (const row of items) if (row.sourceUrl) counts.set(row.sourceKey, (counts.get(row.sourceKey) || 0) + 1);
const meta = summary.meta as unknown as PhotoResearchMeta;
const aliases = meta.integratedResearch?.idAliases || {};
// Derived counts can change across collections; supplied IDs and original values cannot.
export const photoResearchBundle: PhotoResearchBundle = {meta, items: items.map(row => ({...row,
  sameSourceCount: counts.get(row.sourceKey) || 0,
  previousIds: Object.keys(aliases).filter(id => aliases[id] === row.id),
}))};
