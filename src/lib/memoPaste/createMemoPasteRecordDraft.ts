import type { CalendarImportCategory, RecordCategory } from "../../types/content";
import type {
  MemoPasteRecordDraft,
  MemoPasteRecordDraftSource,
} from "./memoPasteTypes";

export function createMemoPasteRecordDraft(
  item: MemoPasteRecordDraftSource,
): MemoPasteRecordDraft | null {
  if (!isRecordCategory(item.category)) {
    return null;
  }

  if (item.dateChoice === "ignore") {
    return null;
  }

  const label = item.shortLabel.trim();

  if (!label) {
    return null;
  }

  return {
    category: item.category,
    categoryLabel: item.categoryLabel,
    dateLabel: item.dateLabel,
    label,
    source: "memoPaste",
  };
}

function isRecordCategory(
  category: CalendarImportCategory,
): category is RecordCategory {
  return category !== "ignore" && category !== "unclassified";
}
