import type {
  CalendarImportCategory,
  ClassificationConfidence,
  MockRecordDraft,
  RecordCategory,
} from "../../types/content";

export type MemoPasteDateChoice = "known" | "today" | "none" | "ignore";

export type MemoPasteCandidate = {
  category: RecordCategory;
  categoryLabel: string;
  confidence: ClassificationConfidence;
  dateChoice: MemoPasteDateChoice;
  dateIso?: string;
  dateLabel: string;
  dateWasAssumed: boolean;
  id: string;
  note?: string;
  rawLine: string;
  reason: string;
  shortLabel: string;
  sourceLabel: "メモ貼り付け";
};

export type EditableMemoPasteCandidate = Omit<
  MemoPasteCandidate,
  "category"
> & {
  category: CalendarImportCategory;
  originalCategory: CalendarImportCategory;
  originalShortLabel: string;
  selected: boolean;
};

export type MemoPasteRecordDraftSource = Pick<
  EditableMemoPasteCandidate,
  "category" | "categoryLabel" | "dateChoice" | "dateLabel" | "shortLabel"
>;

export type MemoPasteRecordDraft = MockRecordDraft & {
  source: "memoPaste";
};
