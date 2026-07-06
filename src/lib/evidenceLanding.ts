import { mockRecordSourceLabels } from "../data/mockContent";
import type {
  LastAddedEvidence,
  MockRecord,
  MockRecordSource,
  RecordCategory,
} from "../types/content";

export const recordCategoryDestinationLabels = {
  future: "未来に向き合った日",
  build: "積み上げた日",
  care: "自分を整えた日",
  return: "戻ってきた日",
} satisfies Record<RecordCategory, string>;

export function getEvidenceSourceLabel(source: MockRecordSource) {
  return mockRecordSourceLabels[source];
}

export function getEvidenceDestinationLabel(
  record: Pick<MockRecord, "category">,
) {
  return `ここまで > ${recordCategoryDestinationLabels[record.category]}`;
}

export function createEvidenceLandingPayload(
  addedRecords: MockRecord[],
  createdAt = Date.now(),
): LastAddedEvidence {
  return {
    createdAt,
    id: `${createdAt}-${addedRecords.map((record) => record.id).join("-")}`,
    items: addedRecords.map((record) => ({
      category: record.category,
      categoryLabel: record.categoryLabel,
      createdAt,
      date: record.dateLabel,
      id: record.id,
      label: record.label,
      source: record.source,
      sourceLabel: getEvidenceSourceLabel(record.source),
    })),
  };
}
