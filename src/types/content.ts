export type ScreenId =
  | "home"
  | "lowCount"
  | "reflection"
  | "googleExplain"
  | "calendarImport"
  | "memoPaste"
  | "hardTime"
  | "letter"
  | "oneTap"
  | "productAdd"
  | "settings"
  | "weekly"
  | "plus";

export type UiMode = "review" | "product";

export type CountTone = "sage" | "clay" | "blue" | "gray";

export type ActionVariant = "primary" | "secondary" | "quiet";

export type RecordCategory = "future" | "build" | "care" | "return";

export type MockRecordSource =
  | "manual"
  | "reflection"
  | "app"
  | "calendarFile"
  | "memoPaste"
  | "letter"
  | "googleCalendarMock"
  | "googleCalendar";

export type ClassificationConfidence = "high" | "medium" | "low";

export type CalendarFileSource = "CSV" | "ICS";

export type CalendarImportCategory = RecordCategory | "unclassified" | "ignore";

export type MockRecord = {
  id: string;
  label: string;
  category: RecordCategory;
  categoryLabel: string;
  source: MockRecordSource;
  dateLabel: string;
};

export type MockRecordDraft = Omit<MockRecord, "id">;

export type LastAddedEvidenceItem = {
  id: string;
  label: string;
  category: RecordCategory;
  categoryLabel: string;
  source: MockRecordSource;
  sourceLabel: string;
  date: string;
  createdAt: number;
};

export type LastAddedEvidence = {
  id: string;
  createdAt: number;
  items: LastAddedEvidenceItem[];
};

export type MockLetterSource =
  | "self"
  | "letter"
  | "hard-time"
  | "one-tap"
  | "memo-paste"
  | "google-calendar"
  | "reflection";

export type MockLetter = {
  id: string;
  body: string;
  createdAt?: number | string;
  createdAtLabel: string;
  evidenceCategory?: string;
  isArchived?: boolean;
  isPinned?: boolean;
  mood?: string;
  source?: MockLetterSource;
  visibility?: "private";
};

export type MockLetterDraft = Omit<MockLetter, "id">;

export type StoredPrototypeState = {
  schemaVersion: 1;
  mockRecords: MockRecord[];
  mockLetters: MockLetter[];
};

export type EvidenceCount = {
  basis?: {
    countingRule: string;
    examples: string[];
    mockRecords?: MockRecord[];
    period: string;
    reason: string;
    sources: string[];
  };
  category?: RecordCategory;
  addedDays?: number;
  label: string;
  value: string;
  valueAssistiveLabel?: string;
  tone: CountTone;
};

export type TagItem = string;

export type ScreenNavItem = {
  id: ScreenId;
  label: string;
  shortLabel: string;
};

type BaseCtaItem = {
  description?: string;
  label: string;
  variant?: ActionVariant;
};

export type NavigationCtaItem = BaseCtaItem & {
  action: "navigate";
  target: ScreenId;
};

export type MockCtaItem = BaseCtaItem & {
  action: "mock";
  mockMessage?: string;
};

export type CtaItem = NavigationCtaItem | MockCtaItem;

export type CtaHandler = (cta: CtaItem) => void;

export type ScreenCopy = {
  title: string;
  body: string;
  ctas: CtaItem[];
};
