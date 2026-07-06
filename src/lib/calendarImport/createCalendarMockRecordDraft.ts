import type {
  EditableCalendarEntry,
  CalendarImportCategory,
} from "./calendarImportTypes";
import type { MockRecordDraft, RecordCategory } from "../../types/content";

type CalendarRecordDraftSource = Pick<
  EditableCalendarEntry,
  "category" | "dateLabel" | "shortLabel"
> &
  Partial<Pick<EditableCalendarEntry, "recordSource">>;

export function createCalendarMockRecordDraft(
  item: CalendarRecordDraftSource,
  categoryLabels: Record<RecordCategory, string>,
): MockRecordDraft | null {
  if (!isRecordCategory(item.category)) {
    return null;
  }

  const label = item.shortLabel.trim();

  if (!label) {
    return null;
  }

  return {
    label,
    category: item.category,
    categoryLabel: categoryLabels[item.category],
    source: item.recordSource ?? "calendarFile",
    dateLabel: item.dateLabel,
  };
}

function isRecordCategory(
  category: CalendarImportCategory,
): category is RecordCategory {
  return category !== "ignore" && category !== "unclassified";
}
