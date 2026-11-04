import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import report from '../data/uploaded-city-history-report-2026-10-20.json';
import {filterHistoryReport} from '../lib/history-report.ts';
import {GET} from '../app/api/archive/reports/city-history/route.ts';

test('uploaded report preserves its actual 215 rows separately from the unverified cumulative claim', () => {
  assert.equal(report.items.length, 215);
  assert.equal(new Set(report.items.map(item => item.id)).size, 215);
  assert.equal(new Set(report.items.map(item => item.recordId)).size, 215);
  assert.equal(report.batches.reduce((sum, batch) => sum + batch.count, 0), 215);
  assert.deepEqual(report.batches.map(batch => batch.number), Array.from({length: 14}, (_, i) => 120 + i));
  assert.equal(report.document.reportedCumulativeCount, 2000);
  assert.ok(report.items.every(item => item.recordPage >= 1 && item.recordPage <= 15 && item.claimPage >= 1 && item.claimPage <= 15));
  assert.ok(report.items.some(item => item.recordPage !== item.claimPage));
});

test('clipped URLs and claims cannot become verified videos or complete statements', () => {
  for (const item of report.items) {
    assert.equal(item.videoUrl, null);
    assert.equal(item.statementComplete, false);
    assert.equal(item.reviewStatus, 'unverified');
    assert.ok(!item.recordLine.endsWith('}'));
    assert.ok(!item.claimLine.endsWith('}'));
    assert.ok(item.claimLine.endsWith(item.claimExcerpt) || item.claimLine.trimEnd().endsWith(item.claimExcerpt));
  }
  assert.equal(report.document.completeVideoUrlCount, 0);
  assert.equal(report.document.independentlyVerifiedVideoCount, 0);
});

test('the source ID discrepancy remains visible and searchable under either original ID', () => {
  const result = filterHistoryReport(report.items, {issuesOnly: true});
  assert.equal(result.length, 1);
  assert.equal(result[0].recordId, 'REC_YT_1709');
  assert.equal(result[0].claimRecordId, 'REC_YT_1809');
  assert.equal(result[0].batch, 121);
  for (const query of ['REC_YT_1709', 'REC_YT_1809']) assert.equal(filterHistoryReport(report.items, {query})[0].id, result[0].id);
  assert.equal(report.items.filter(item => item.recordId === item.claimRecordId).length, 214);
});

test('research filters combine without silently mixing document event year and publication date', () => {
  assert.equal(filterHistoryReport(report.items, {batch: '133'}).length, 20);
  const result = filterHistoryReport(report.items, {query: '국립중앙박물관 2005', channel: 'MBC 옛날테레비'});
  assert.ok(result.length > 0);
  assert.ok(result.every(item => item.claimExcerpt.includes('2005') && item.channelName === 'MBC 옛날테레비'));
  assert.equal(filterHistoryReport(report.items, {query: '없는시설테스트'}).length, 0);
  const before = filterHistoryReport(report.items, {period: 'before2000'});
  const after = filterHistoryReport(report.items, {period: 'from2000'});
  assert.ok(before.length > 0 && after.length > 0);
  assert.equal(before.length + after.length, report.items.length);
  assert.equal(filterHistoryReport([{...report.items[0], year: null}], {period: 'before2000'}).length, 0);
});

test('the published original PDF matches the provenance fingerprint byte for byte', () => {
  const pdf = readFileSync(new URL('../public' + report.document.pdfPath, import.meta.url));
  assert.equal(pdf.length, report.document.sizeBytes);
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
  assert.equal(createHash('sha256').update(pdf).digest('hex'), report.document.sha256);
});

test('the download includes original provenance and keeps an attachment distinct from viewing', async () => {
  const view = GET(new Request('https://example.test/api/archive/reports/city-history'));
  const download = GET(new Request('https://example.test/api/archive/reports/city-history?download=1'));
  assert.equal(view.headers.get('content-disposition'), null);
  assert.match(download.headers.get('content-disposition'), /^attachment;/);
  assert.match(download.headers.get('cache-control'), /private/);
  assert.equal((await download.json()).items.length, 215);
});
