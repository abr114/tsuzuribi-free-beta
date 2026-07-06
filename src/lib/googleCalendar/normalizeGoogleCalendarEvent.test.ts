import { describe, expect, it } from "vitest";
import { createEditableCalendarEntry } from "../calendarImport/createEditableCalendarEntry";
import { classifyCalendarEntry } from "../calendarImport/classifyCalendarEntry";
import {
  normalizeGoogleCalendarEvent,
  normalizeGoogleCalendarEvents,
} from "./normalizeGoogleCalendarEvent";
import type { MockGoogleCalendarEvent } from "../../data/mockGoogleCalendarEvents";

describe("normalizeGoogleCalendarEvent", () => {
  it("converts a Google-like event with summary to a parsed calendar entry", () => {
    const normalized = normalizeGoogleCalendarEvent(
      createEvent({
        summary: "予定を確認した",
      }),
    );

    expect(normalized).toMatchObject({
      calendarName: "確認用カレンダー",
      dateLabel: "5/12",
      rawTitle: "予定を確認した",
      sourceLabel: "確認用カレンダー",
    });
  });

  it("uses start.dateTime for timed event date labels", () => {
    const normalized = normalizeGoogleCalendarEvent(
      createEvent({
        start: { dateTime: "2026-05-13T18:00:00+09:00" },
        summary: "人に連絡した",
      }),
    );

    expect(normalized?.dateLabel).toBe("5/13");
  });

  it("uses start.date for all-day event date labels", () => {
    const normalized = normalizeGoogleCalendarEvent(
      createEvent({
        start: { date: "2026-05-22" },
        summary: "終日予定",
      }),
    );

    expect(normalized?.dateLabel).toBe("5/22");
  });

  it("excludes cancelled events", () => {
    expect(
      normalizeGoogleCalendarEvent(
        createEvent({
          status: "cancelled",
          summary: "キャンセル済み予定",
        }),
      ),
    ).toBeNull();
  });

  it("keeps events without summary as low-confidence confirmation targets", () => {
    const normalized = normalizeGoogleCalendarEvent(
      createEvent({
        summary: undefined,
      }),
    );
    const classified = classifyCalendarEntry(
      normalized!,
      "GoogleCalendarMock",
      0,
    );
    const editable = createEditableCalendarEntry(classified);

    expect(normalized).toMatchObject({
      rawTitle: "タイトルなし",
    });
    expect(editable).toMatchObject({
      category: "unclassified",
      confidence: "low",
      recordSource: "googleCalendarMock",
      selected: false,
    });
  });

  it("uses the live Google Calendar source when classifying API events", () => {
    const normalized = normalizeGoogleCalendarEvent(
      createEvent({
        calendarId: "primary-user@example.com",
        calendarName: "メインカレンダー",
        eventId: "google-event-interview",
        summary: "予定を確認した",
      }),
    );
    const classified = classifyCalendarEntry(normalized!, "GoogleCalendar", 0);
    const editable = createEditableCalendarEntry(classified);

    expect(editable).toMatchObject({
      category: "future",
      confidence: "high",
      dateLabel: "5/12",
      recordSource: "googleCalendar",
      selected: true,
      sourceLabel: "メインカレンダー",
    });
  });

  it("turns API summaryless events into low-confidence confirmation targets", () => {
    const normalized = normalizeGoogleCalendarEvent(
      createEvent({
        calendarId: "primary-user@example.com",
        calendarName: "メインカレンダー",
        eventId: "google-event-no-summary",
        summary: undefined,
      }),
    );
    const classified = classifyCalendarEntry(normalized!, "GoogleCalendar", 0);
    const editable = createEditableCalendarEntry(classified);

    expect(editable).toMatchObject({
      category: "unclassified",
      confidence: "low",
      rawTitle: "タイトルなし",
      recordSource: "googleCalendar",
      selected: false,
    });
  });

  it("normalizes multiple events while removing cancelled ones", () => {
    const normalized = normalizeGoogleCalendarEvents([
      createEvent({ eventId: "active", summary: "資料を読んだ" }),
      createEvent({
        eventId: "cancelled",
        status: "cancelled",
        summary: "キャンセル済み予定",
      }),
    ]);

    expect(normalized).toHaveLength(1);
    expect(normalized[0].rawTitle).toBe("資料を読んだ");
  });
});

function createEvent(
  overrides: Partial<MockGoogleCalendarEvent> = {},
): MockGoogleCalendarEvent {
  return {
    calendarId: "career",
    calendarName: "確認用カレンダー",
    eventId: "mock-event",
    start: { dateTime: "2026-05-12T10:00:00+09:00" },
    status: "confirmed",
    summary: "予定を確認した",
    ...overrides,
  };
}
