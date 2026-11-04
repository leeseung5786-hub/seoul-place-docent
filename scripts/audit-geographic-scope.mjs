// Run with Node's TypeScript transformer and the repository's test resolver.
// This audit is read-only: classifications do not delete uncertain records.
import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {classifyRecordGeography, archiveGeographicScope} from '../lib/archive-geography.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const option = key => args.includes(key) ? args[args.indexOf(key) + 1] : undefined;
const read = path => JSON.parse(readFileSync(path, 'utf8'));
const photo = read(resolve(root, 'data/photo-research/bundle.json'));
const documents = read(resolve(root, 'data/document-research/bundle.json'));
const video = read(resolve(root, 'data/uploaded-city-history-report-2026-10-20.json'));
function audit(name, rows) {
  const counts = {seoul: 0, gyeonggi: 0, outside_scope: 0, unconfirmed: 0};
  const outside = [], unconfirmedIds = [];
  for (const row of rows) {
    const classification = classifyRecordGeography(row);
    counts[classification]++;
    if (classification === 'outside_scope') outside.push({dataset: name, ...row});
    if (classification === 'unconfirmed') unconfirmedIds.push(row.id);
  }
  return {records: rows.length, counts, confirmedOutsideScope: outside, unconfirmedIds};
}
const report = {
  checkedAt: new Date().toISOString(), geographicScope: archiveGeographicScope,
  method: 'Source metadata and explicit subject/photograph location screening. Not a new original-content verification. Batch labels and holding-institution addresses are not location evidence. Mixed-area routes are not classified as exclusively outside the scope.',
  datasets: {
    photoResearch: audit('photoResearch', photo.items.map(r => ({id: r.id, title: r.values['자료명'] || '', location: r.values['원문장소표기'], description: r.values['내용설명']}))),
    documentSources: audit('documentSources', documents.tables.sources.map(r => ({id: r.id, title: r.values['자료명'] || '', location: r.values['원문장소표기'] || r.values['공간범위'], description: r.values['내용설명']}))),
    videoResearch: audit('videoResearch', video.items.map(r => ({id: r.id, title: r.claimExcerpt}))),
  },
  documentTableRecords: Object.fromEntries(Object.entries(documents.tables).map(([key, rows]) => [key, rows.length])),
  retainedExamples: [
    {ids: ['JNR-HIST-001-P346', 'JNR-HIST-001-P349', 'JNR-HIST-001-P350', 'JNR-HIST-001-P351'], reason: 'Photographs of relief sculptures installed at Seoul Tapgol Park, depicting events in other provinces. The explicit photograph location is Seoul.'},
    {ids: ['pdf-city-history-121-01', 'pdf-city-history-121-05', 'pdf-city-history-123-01', 'pdf-city-history-123-08', 'pdf-city-history-131-08', 'pdf-city-history-133-16'], reason: 'Truncated source-report excerpts about routes with Seoul endpoints. References to Incheon/Busan are mixed-route context, not proof that the source concerns only an outside place.'},
  ],
  deletedStoredRecords: 0,
  limitations: ['Unconfirmed stored metadata is retained for review; unconfirmed external search candidates are omitted.', 'This geographic audit does not complete the separate original-content review queue.'],
};
const live = option('--live-directory');
if (live) {
  const sources = read(resolve(live, 'native-sources.json')).rows;
  const passages = read(resolve(live, 'native-passages-full.json')).rows;
  if (passages.some(row => row.text.includes('[truncated for model]'))) throw new Error('Full passage text required');
  const sourceIds = new Set(sources.map(r => r.id));
  if (sourceIds.size !== sources.length || new Set(passages.map(r => r.id)).size !== passages.length || passages.some(r => !sourceIds.has(r.source_id))) throw new Error('Duplicate IDs or orphan passages');
  report.datasets.liveSources = audit('liveSources', sources.map(r => ({id: r.id, title: r.title, description: r.summary})));
  report.datasets.livePassages = audit('livePassages', passages.map(r => ({id: r.id, title: r.text})));
  report.liveContentFingerprint = createHash('sha256').update(JSON.stringify({sources, passages})).digest('hex');
  report.liveReadMethod = 'Native Sites database pagination followed returned next_offset to null. Two truncated passage cells replaced with full public source-detail API responses.';
}
report.confirmedOutsideScope = Object.values(report.datasets).flatMap(result => result.confirmedOutsideScope);
const output = option('--output');
if (output) writeFileSync(resolve(output), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({datasets: Object.fromEntries(Object.entries(report.datasets).map(([name, r]) => [name, {records: r.records, ...r.counts}])), confirmedOutsideScope: report.confirmedOutsideScope, output: output || null}, null, 2));
if (report.confirmedOutsideScope.length) process.exitCode = 1;
