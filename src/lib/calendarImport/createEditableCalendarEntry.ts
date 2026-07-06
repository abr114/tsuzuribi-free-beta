import type {
  ClassifiedCalendarEntry,
  EditableCalendarEntry,
} from "./calendarImportTypes";

export function createEditableCalendarEntry(
  entry: ClassifiedCalendarEntry,
): EditableCalendarEntry {
  const initialCategory =
    entry.confidence === "low" && entry.matchedKeywords.length === 0
      ? "unclassified"
      : entry.category;

  return {
    ...entry,
    category: initialCategory,
    originalCategory: initialCategory,
    originalShortLabel: entry.shortLabel,
    selected: entry.confidence === "high",
    showRawTitle: false,
  };
}
