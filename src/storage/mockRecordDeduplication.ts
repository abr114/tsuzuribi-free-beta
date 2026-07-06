import type { MockRecord, MockRecordDraft } from "../types/content";

export type AddMockRecordsResult = {
  addedCount: number;
  addedRecords: MockRecord[];
  duplicateCount: number;
  landingRecords: MockRecord[];
  records: MockRecord[];
};

export function addUniqueMockRecordDrafts(
  currentRecords: MockRecord[],
  drafts: MockRecordDraft[],
  now = Date.now(),
): AddMockRecordsResult {
  const recordsByKey = new Map(
    currentRecords.map((record) => [createMockRecordKey(record), record]),
  );
  const addedRecords: MockRecord[] = [];
  const landingRecords: MockRecord[] = [];
  const landedRecordIds = new Set<string>();
  let duplicateCount = 0;

  for (const draft of drafts) {
    const key = createMockRecordKey(draft);
    const existingRecord = recordsByKey.get(key);

    if (existingRecord) {
      duplicateCount += 1;
      pushLandingRecord(landingRecords, landedRecordIds, existingRecord);
      continue;
    }

    const addedRecord = {
      ...draft,
      id: `${now}-${currentRecords.length + addedRecords.length}-${draft.source}`,
    };

    recordsByKey.set(key, addedRecord);
    addedRecords.push(addedRecord);
    pushLandingRecord(landingRecords, landedRecordIds, addedRecord);
  }

  return {
    addedCount: addedRecords.length,
    addedRecords,
    duplicateCount,
    landingRecords,
    records: [...currentRecords, ...addedRecords],
  };
}

function pushLandingRecord(
  landingRecords: MockRecord[],
  landedRecordIds: Set<string>,
  record: MockRecord,
) {
  if (landedRecordIds.has(record.id)) {
    return;
  }

  landedRecordIds.add(record.id);
  landingRecords.push(record);
}

function createMockRecordKey(record: MockRecord | MockRecordDraft) {
  return [
    record.dateLabel,
    record.label.trim(),
    record.category,
    record.source,
  ].join("\u001F");
}
