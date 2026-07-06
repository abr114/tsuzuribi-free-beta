import { afterEach, describe, expect, it, vi } from "vitest";
import { createGoogleCalendarTimeRange } from "./GoogleExplainScreen";

afterEach(() => {
  vi.useRealTimers();
});

describe("createGoogleCalendarTimeRange", () => {
  it("uses today-including past 7 days for the normal Google Calendar CTA", () => {
    const now = new Date(2026, 4, 22, 15, 30, 45, 123);
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const range = createGoogleCalendarTimeRange("過去7日");
    const expectedStart = new Date(now);
    expectedStart.setDate(expectedStart.getDate() - 6);
    expectedStart.setHours(0, 0, 0, 0);

    expect(range).toEqual({
      timeMax: now.toISOString(),
      timeMin: expectedStart.toISOString(),
    });
  });

  it("only expands to 30 or 90 days when those detail settings are selected", () => {
    const now = new Date(2026, 4, 22, 15, 30, 45, 123);
    vi.useFakeTimers();
    vi.setSystemTime(now);

    expect(createGoogleCalendarTimeRange("過去30日").timeMin).toBe(
      createExpectedStart(now, 30).toISOString(),
    );
    expect(createGoogleCalendarTimeRange("過去90日").timeMin).toBe(
      createExpectedStart(now, 90).toISOString(),
    );
  });
});

function createExpectedStart(now: Date, daysIncludingToday: number) {
  const expectedStart = new Date(now);
  expectedStart.setDate(expectedStart.getDate() - (daysIncludingToday - 1));
  expectedStart.setHours(0, 0, 0, 0);
  return expectedStart;
}
