export type IntegratedResearchFile = {id: string; filename: string; path: string; sizeBytes: number; sha256: string; count: number | null};
export type IntegratedTargetOption = {id: string; district: string; dong: string; code: string; level: string; status: string; count: number};
export type IntegratedResearchSummary = {
  datasetId: string; recordCount: number; linkCount: number; targetCount: number; districtCount: number;
  dongTargetCount: number; completedTargetCount: number; completedDongCount: number; heldTargetCount: number;
  linkedDongCount: number; logCount: number; excludedCount: number; changeCount: number; idChangeCount: number;
  incrementalRecordCount: number; overlappingRecordCount: number; historicalNameCount: number;
  mediaCounts: Record<string, number>; visualCheckCounts: Record<string, number>; date: string; note: string;
  files: IntegratedResearchFile[]; targetOptions: IntegratedTargetOption[]; idAliases: Record<string, string>;
};
export type IntegratedTable = 'targets' | 'links' | 'logs' | 'excluded' | 'idChanges' | 'changes';
export type IntegratedSupport = Record<IntegratedTable, Record<string, string>[]>;
export function filterIntegratedResearch(tables: IntegratedSupport, table: IntegratedTable, filters: {query?: string; district?: string; target?: string; source?: string; status?: string} = {}) {
  const targets = new Map(tables.targets.map(row => [row['대상ID'], row]));
  const terms = (filters.query || '').normalize('NFKC').toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return tables[table].filter(row => {
    const targetId = row['대상ID'] || row['관련대상ID'] || '';
    const target = targets.get(targetId);
    if (filters.target && targetId !== filters.target) return false;
    if (filters.source && row['자료ID'] !== filters.source && row['수정ID'] !== filters.source && row['중복대표자료ID'] !== filters.source) return false;
    if (filters.district && (row['자치구'] || target?.['자치구']) !== filters.district) return false;
    if (filters.status && row['처리상태'] !== filters.status) return false;
    const text = Object.values(row).join(' ').normalize('NFKC').toLocaleLowerCase();
    return terms.every(term => text.includes(term));
  });
}
