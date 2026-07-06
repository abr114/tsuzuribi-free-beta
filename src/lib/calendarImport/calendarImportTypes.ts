import type {
  CalendarFileSource,
  CalendarImportCategory,
  ClassificationConfidence,
  MockRecordSource,
  RecordCategory,
} from "../../types/content";

export type {
  CalendarFileSource,
  CalendarImportCategory,
  ClassificationConfidence,
};

export type ParsedCalendarEntry = {
  dateLabel: string;
  rawTitle: string;
  sourceLabel?: string;
};

export type CalendarTextEncoding = "auto" | "utf-8" | "shift_jis";

export type ResolvedCalendarTextEncoding = Exclude<
  CalendarTextEncoding,
  "auto"
>;

export type CalendarTitleClassification = {
  category: RecordCategory;
  confidence: ClassificationConfidence;
  matchedKeywords: string[];
  reason: string;
  shortLabel: string;
};

export type CalendarEntrySourceType =
  | CalendarFileSource
  | "GoogleCalendarMock"
  | "GoogleCalendar";

export type CalendarImportInitialEntries = {
  entries: ParsedCalendarEntry[];
  id: string;
  rangeLabel?: string;
  sourceName: string;
  sourceType: CalendarEntrySourceType;
};

export type ClassifiedCalendarEntry = ParsedCalendarEntry &
  CalendarTitleClassification & {
    id: string;
    recordSource: MockRecordSource;
    sourceType: CalendarEntrySourceType;
  };

export type EditableCalendarEntry = Omit<ClassifiedCalendarEntry, "category"> & {
  category: CalendarImportCategory;
  originalCategory: CalendarImportCategory;
  originalShortLabel: string;
  selected: boolean;
  showRawTitle: boolean;
};
