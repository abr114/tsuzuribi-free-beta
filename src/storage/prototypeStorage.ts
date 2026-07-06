import type {
  MockLetter,
  MockRecord,
  MockRecordSource,
  RecordCategory,
  StoredPrototypeState,
} from "../types/content";

export const STORAGE_KEY = "tsuzuribi:prototype:v1";
// Kept only to migrate old prototype data from the previous romaji spelling.
export const LEGACY_STORAGE_KEY = "tuzuribi:prototype:v1";

const schemaVersion = 1;
const recordCategories = ["future", "build", "care", "return"] as const;
const recordSources = [
  "manual",
  "reflection",
  "app",
  "calendarFile",
  "memoPaste",
  "letter",
  "googleCalendarMock",
  "googleCalendar",
] as const;

export function readStoredPrototypeState(): StoredPrototypeState | null {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  try {
    const rawValue =
      storage.getItem(STORAGE_KEY) ?? storage.getItem(LEGACY_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsedValue: unknown = JSON.parse(rawValue);

    if (!isStoredPrototypeState(parsedValue)) {
      return null;
    }

    if (!storage.getItem(STORAGE_KEY)) {
      storage.setItem(STORAGE_KEY, JSON.stringify(parsedValue));
      storage.removeItem(LEGACY_STORAGE_KEY);
    }

    return parsedValue;
  } catch {
    return null;
  }
}

export function writeStoredPrototypeState(state: StoredPrototypeState) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage may be unavailable or full. The prototype keeps working in state.
  }
}

export function clearStoredPrototypeState() {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.removeItem(STORAGE_KEY);
    storage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Ignore storage failures in the prototype.
  }
}

export function createStoredPrototypeState(
  mockRecords: MockRecord[],
  mockLetters: MockLetter[],
): StoredPrototypeState {
  return {
    schemaVersion,
    mockRecords: mockRecords.map(toStoredMockRecord),
    mockLetters: mockLetters.map(toStoredMockLetter),
  };
}

function toStoredMockRecord(record: MockRecord): MockRecord {
  // Calendar raw titles are only for pre-save review; localStorage keeps approved fields only.
  return {
    id: record.id,
    label: record.label,
    category: record.category,
    categoryLabel: record.categoryLabel,
    source: record.source,
    dateLabel: record.dateLabel,
  };
}

function toStoredMockLetter(letter: MockLetter): MockLetter {
  return {
    id: letter.id,
    body: letter.body,
    createdAt: letter.createdAt,
    createdAtLabel: letter.createdAtLabel,
    evidenceCategory: letter.evidenceCategory,
    isArchived: letter.isArchived,
    isPinned: letter.isPinned,
    mood: letter.mood,
    source: letter.source,
    visibility: letter.visibility,
  };
}

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isStoredPrototypeState(value: unknown): value is StoredPrototypeState {
  if (!isRecordObject(value)) {
    return false;
  }

  if (value.schemaVersion !== schemaVersion) {
    return false;
  }

  if (!Array.isArray(value.mockRecords) || !Array.isArray(value.mockLetters)) {
    return false;
  }

  return (
    value.mockRecords.every(isMockRecord) &&
    value.mockLetters.every(isMockLetter)
  );
}

function isMockRecord(value: unknown): value is MockRecord {
  if (!isRecordObject(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.label === "string" &&
    isRecordCategory(value.category) &&
    typeof value.categoryLabel === "string" &&
    isMockRecordSource(value.source) &&
    typeof value.dateLabel === "string"
  );
}

function isMockLetter(value: unknown): value is MockLetter {
  if (!isRecordObject(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.body === "string" &&
    typeof value.createdAtLabel === "string" &&
    (typeof value.createdAt === "undefined" ||
      typeof value.createdAt === "number" ||
      typeof value.createdAt === "string") &&
    (typeof value.evidenceCategory === "undefined" ||
      typeof value.evidenceCategory === "string") &&
    (typeof value.isArchived === "undefined" ||
      typeof value.isArchived === "boolean") &&
    (typeof value.mood === "undefined" || typeof value.mood === "string") &&
    (typeof value.isPinned === "undefined" ||
      typeof value.isPinned === "boolean") &&
    (typeof value.visibility === "undefined" || value.visibility === "private") &&
    (typeof value.source === "undefined" || isMockLetterSource(value.source))
  );
}

function isRecordCategory(value: unknown): value is RecordCategory {
  return recordCategories.includes(value as RecordCategory);
}

function isMockRecordSource(value: unknown): value is MockRecordSource {
  return recordSources.includes(value as MockRecordSource);
}

function isMockLetterSource(value: unknown) {
  return (
    value === "self" ||
    value === "letter" ||
    value === "hard-time" ||
    value === "one-tap" ||
    value === "memo-paste" ||
    value === "google-calendar" ||
    value === "reflection"
  );
}

function isRecordObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
