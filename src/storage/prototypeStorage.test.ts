import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearStoredPrototypeState,
  createStoredPrototypeState,
  LEGACY_STORAGE_KEY,
  readStoredPrototypeState,
  STORAGE_KEY,
  writeStoredPrototypeState,
} from "./prototypeStorage";
import type { MockLetter, MockRecord } from "../types/content";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("createStoredPrototypeState", () => {
  it("strips raw title fields before creating the localStorage payload", () => {
    const recordWithRawTitle = {
      id: "calendar-1",
      label: "予定を確認した",
      category: "future",
      categoryLabel: "未来に向き合った日の証拠",
      source: "calendarFile",
      dateLabel: "5/12",
      rawTitle: "株式会社A 面談 10:00",
      originalTitle: "株式会社A 面談 10:00",
      sourceTitle: "株式会社A 面談 10:00",
    } as MockRecord & {
      originalTitle: string;
      rawTitle: string;
      sourceTitle: string;
    };

    const state = createStoredPrototypeState([recordWithRawTitle], []);

    expect(state.mockRecords[0]).toEqual({
      id: "calendar-1",
      label: "予定を確認した",
      category: "future",
      categoryLabel: "未来に向き合った日の証拠",
      source: "calendarFile",
      dateLabel: "5/12",
    });
  });

  it("strips raw Google fields from Google mock records", () => {
    const recordWithGoogleFields = {
      id: "google-mock-1",
      label: "予定を確認した",
      category: "future",
      categoryLabel: "未来に向き合った日の証拠",
      source: "googleCalendarMock",
      dateLabel: "5/12",
      calendarId: "career",
      eventId: "mock-event-interview-1",
      summary: "株式会社A 面談 10:00",
    } as MockRecord & {
      calendarId: string;
      eventId: string;
      summary: string;
    };

    const state = createStoredPrototypeState([recordWithGoogleFields], []);

    expect(state.mockRecords[0]).toEqual({
      id: "google-mock-1",
      label: "予定を確認した",
      category: "future",
      categoryLabel: "未来に向き合った日の証拠",
      source: "googleCalendarMock",
      dateLabel: "5/12",
    });
  });

  it("strips raw Google fields from live Google Calendar records", () => {
    const recordWithGoogleFields = {
      id: "google-calendar-1",
      label: "予定を確認した",
      category: "future",
      categoryLabel: "未来に向き合った日の証拠",
      source: "googleCalendar",
      dateLabel: "5/18",
      apiResponse: { kind: "calendar-event" },
      calendarId: "primary-user@example.com",
      eventId: "google-event-interview-1",
      summary: "株式会社A 面談 10:00",
    } as MockRecord & {
      apiResponse: unknown;
      calendarId: string;
      eventId: string;
      summary: string;
    };

    const state = createStoredPrototypeState([recordWithGoogleFields], []);

    expect(state.mockRecords[0]).toEqual({
      id: "google-calendar-1",
      label: "予定を確認した",
      category: "future",
      categoryLabel: "未来に向き合った日の証拠",
      source: "googleCalendar",
      dateLabel: "5/18",
    });
  });

  it("keeps memo paste records without pasted original text", () => {
    const recordWithPastedText = {
      id: "memo-1",
      label: "研究メモ整理",
      category: "build",
      categoryLabel: "積み上げた日の証拠",
      source: "memoPaste",
      dateLabel: "6/12",
      attendees: ["tester@example.com"],
      calendarId: "primary",
      description: "貼り付けた本文の詳細",
      eventId: "memo-event",
      location: "教室",
      pastedText: "6/12 研究メモ整理",
      rawLine: "6/12 研究メモ整理",
      rawText: "6/12 研究メモ整理\nそのまま保存しない本文",
      rawTitle: "6/12 研究メモ整理",
    } as MockRecord & {
      attendees: string[];
      calendarId: string;
      description: string;
      eventId: string;
      location: string;
      pastedText: string;
      rawLine: string;
      rawText: string;
      rawTitle: string;
    };

    const state = createStoredPrototypeState([recordWithPastedText], []);

    expect(state.mockRecords[0]).toEqual({
      id: "memo-1",
      label: "研究メモ整理",
      category: "build",
      categoryLabel: "積み上げた日の証拠",
      source: "memoPaste",
      dateLabel: "6/12",
    });
  });

  it("keeps letter history fields in the localStorage payload", () => {
    const letter: MockLetter = {
      id: "letter-1",
      body: "今日は少し休む。",
      createdAt: 1_783_000_000_000,
      createdAtLabel: "6/12",
      isPinned: false,
      source: "letter",
      visibility: "private",
    };

    const state = createStoredPrototypeState([], [letter]);

    expect(state.mockLetters).toEqual([letter]);
  });
});

describe("prototype localStorage keys", () => {
  it("writes prototype data to the tsuzuribi key", () => {
    const storage = createMemoryStorage();
    vi.stubGlobal("window", { localStorage: storage });
    const state = createStoredPrototypeState(
      [createStoredRecord("manual-1", "manual")],
      [],
    );

    writeStoredPrototypeState(state);

    expect(storage.getItem(STORAGE_KEY)).toBe(JSON.stringify(state));
    expect(storage.getItem(LEGACY_STORAGE_KEY)).toBeNull();
  });

  it("prefers the tsuzuribi key when both new and legacy data exist", () => {
    const storage = createMemoryStorage();
    vi.stubGlobal("window", { localStorage: storage });
    const legacyState = createStoredPrototypeState(
      [createStoredRecord("legacy", "manual")],
      [],
    );
    const currentState = createStoredPrototypeState(
      [createStoredRecord("current", "reflection")],
      [],
    );

    storage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(legacyState));
    storage.setItem(STORAGE_KEY, JSON.stringify(currentState));

    expect(readStoredPrototypeState()).toEqual(currentState);
    expect(storage.getItem(LEGACY_STORAGE_KEY)).toBe(
      JSON.stringify(legacyState),
    );
  });

  it("migrates valid legacy data to the tsuzuribi key", () => {
    const storage = createMemoryStorage();
    vi.stubGlobal("window", { localStorage: storage });
    const legacyState = createStoredPrototypeState(
      [createStoredRecord("legacy", "manual")],
      [],
    );

    storage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(legacyState));

    expect(readStoredPrototypeState()).toEqual(legacyState);
    expect(storage.getItem(STORAGE_KEY)).toBe(JSON.stringify(legacyState));
    expect(storage.getItem(LEGACY_STORAGE_KEY)).toBeNull();
  });

  it("clears both current and legacy prototype keys", () => {
    const storage = createMemoryStorage();
    vi.stubGlobal("window", { localStorage: storage });

    storage.setItem(STORAGE_KEY, "{}");
    storage.setItem(LEGACY_STORAGE_KEY, "{}");

    clearStoredPrototypeState();

    expect(storage.getItem(STORAGE_KEY)).toBeNull();
    expect(storage.getItem(LEGACY_STORAGE_KEY)).toBeNull();
  });

  it("reads memo paste records from localStorage", () => {
    const storage = createMemoryStorage();
    vi.stubGlobal("window", { localStorage: storage });
    const state = createStoredPrototypeState(
      [createStoredRecord("memo-1", "memoPaste")],
      [],
    );

    storage.setItem(STORAGE_KEY, JSON.stringify(state));

    expect(readStoredPrototypeState()).toEqual(state);
  });

  it("reads old letter data without createdAt or source", () => {
    const storage = createMemoryStorage();
    vi.stubGlobal("window", { localStorage: storage });
    const state = {
      schemaVersion: 1,
      mockRecords: [],
      mockLetters: [
        {
          body: "昔の形の一文",
          createdAtLabel: "6/12",
          id: "legacy-letter",
          isPinned: false,
          visibility: "private",
        },
      ],
    };

    storage.setItem(STORAGE_KEY, JSON.stringify(state));

    expect(readStoredPrototypeState()).toEqual(state);
  });
});

function createStoredRecord(
  id: string,
  source: MockRecord["source"],
): MockRecord {
  return {
    id,
    label: "予定を確認した",
    category: "future",
    categoryLabel: "未来に向き合った日の証拠",
    dateLabel: "5/12",
    source,
  };
}

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    removeItem: (key: string) => {
      values.delete(key);
    },
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}
