import { describe, expect, it } from "vitest";
import {
  mockRecordSourceLabels,
  recordCategoryLabels,
} from "../../data/mockContent";
import { createCalendarMockRecordDraft } from "./createCalendarMockRecordDraft";
import type { EditableCalendarEntry } from "./calendarImportTypes";

describe("createCalendarMockRecordDraft", () => {
  it("keeps raw calendar titles out of saved MockRecord drafts", () => {
    const item = {
      category: "future",
      dateLabel: "5/12",
      rawTitle: "株式会社A 面談 10:00",
      shortLabel: "予定を確認した",
    } as Pick<
      EditableCalendarEntry,
      "category" | "dateLabel" | "rawTitle" | "shortLabel"
    >;

    const draft = createCalendarMockRecordDraft(item, recordCategoryLabels);

    expect(draft).toEqual({
      label: "予定を確認した",
      category: "future",
      categoryLabel: "未来に向き合った日の証拠",
      source: "calendarFile",
      dateLabel: "5/12",
    });
    expect(draft).not.toHaveProperty("rawTitle");
    expect(draft).not.toHaveProperty("originalTitle");
    expect(draft).not.toHaveProperty("sourceTitle");
  });

  it("does not create saved drafts from unclassified items", () => {
    const item = {
      category: "unclassified",
      dateLabel: "日付なし",
      shortLabel: "なななな",
    } as Pick<EditableCalendarEntry, "category" | "dateLabel" | "shortLabel">;

    expect(createCalendarMockRecordDraft(item, recordCategoryLabels)).toBeNull();
  });

  it("saves Google mock entries without raw Google fields", () => {
    const item = {
      calendarId: "career",
      category: "build",
      dateLabel: "5/17",
      eventId: "mock-event-lecture-design",
      rawTitle: "N805 講義 コミュニケーションデザインシステム",
      recordSource: "googleCalendarMock",
      shortLabel: "コミュニケーションデザインシステム",
      summary: "N805 講義 コミュニケーションデザインシステム",
    } as Pick<
      EditableCalendarEntry,
      "category" | "dateLabel" | "rawTitle" | "recordSource" | "shortLabel"
    > & {
      calendarId: string;
      eventId: string;
      summary: string;
    };

    const draft = createCalendarMockRecordDraft(item, recordCategoryLabels);

    expect(draft).toEqual({
      label: "コミュニケーションデザインシステム",
      category: "build",
      categoryLabel: "積み上げた日の証拠",
      source: "googleCalendarMock",
      dateLabel: "5/17",
    });
    expect(mockRecordSourceLabels.googleCalendarMock).toBe("Google予定（検証）");
    expect(draft).not.toHaveProperty("rawTitle");
    expect(draft).not.toHaveProperty("summary");
    expect(draft).not.toHaveProperty("eventId");
    expect(draft).not.toHaveProperty("calendarId");
  });

  it("saves live Google Calendar entries without raw Google fields", () => {
    const item = {
      calendarId: "primary-user@example.com",
      category: "future",
      dateLabel: "5/18",
      eventId: "google-event-interview-1",
      rawTitle: "株式会社A 面談 10:00",
      recordSource: "googleCalendar",
      shortLabel: "予定を確認した",
      summary: "株式会社A 面談 10:00",
    } as Pick<
      EditableCalendarEntry,
      "category" | "dateLabel" | "rawTitle" | "recordSource" | "shortLabel"
    > & {
      calendarId: string;
      eventId: string;
      summary: string;
    };

    const draft = createCalendarMockRecordDraft(item, recordCategoryLabels);

    expect(draft).toEqual({
      label: "予定を確認した",
      category: "future",
      categoryLabel: "未来に向き合った日の証拠",
      source: "googleCalendar",
      dateLabel: "5/18",
    });
    expect(mockRecordSourceLabels.googleCalendar).toBe("Googleカレンダー");
    expect(draft).not.toHaveProperty("rawTitle");
    expect(draft).not.toHaveProperty("summary");
    expect(draft).not.toHaveProperty("eventId");
    expect(draft).not.toHaveProperty("calendarId");
  });
});
