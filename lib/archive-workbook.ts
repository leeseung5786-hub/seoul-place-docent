import audit from '../data/archive-workbook/audit.json';

/** Content identity for comparing the same imported dataset across deployments. */
export const archiveWorkbookStatus = {
  importedOn: audit.date,
  workbookSha256: audit.workbookSha256,
  workbookUrl: audit.workbookPath,
  videoRows: audit.videosMatched,
  photoMasterRows: audit.sheetCounts['02_통합_역사사진(고유1115건)'],
  photoObservationRows: audit.sheetCounts['03_역사사진_전체관찰본(1153건)'],
  mappedPhotoRows: audit.photoRowsMapped,
  additionalPhotoRecords: audit.addedRecords,
  newPhotoIds: audit.newSourceIds,
  preservedVariants: audit.preservedVariants,
};
