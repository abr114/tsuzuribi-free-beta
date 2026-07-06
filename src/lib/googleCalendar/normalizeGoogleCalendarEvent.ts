import type { ParsedCalendarEntry } from "../calendarImport/calendarImportTypes";
import { formatCalendarDateLabel } from "../calendarImport/formatCalendarDateLabel";

export type GoogleCalendarEventLike = {
  calendarId: string;
  calendarName: string;
  end?: {
    date?: string;
    dateTime?: string;
  };
  eventId: string;
  start: {
    date?: string;
    dateTime?: string;
  };
  status?: string;
  summary?: string;
};

export type NormalizedGoogleCalendarEntry = ParsedCalendarEntry & {
  calendarName: string;
};

export function normalizeGoogleCalendarEvent(
  event: GoogleCalendarEventLike,
): NormalizedGoogleCalendarEntry | null {
  if (event.status === "cancelled") {
    return null;
  }

  const rawTitle = event.summary?.trim() || "タイトルなし";
  const startValue = event.start.dateTime ?? event.start.date ?? "";

  return {
    calendarName: event.calendarName,
    dateLabel: formatCalendarDateLabel(startValue),
    rawTitle,
    sourceLabel: event.calendarName,
  };
}

export function normalizeGoogleCalendarEvents(
  events: GoogleCalendarEventLike[],
): NormalizedGoogleCalendarEntry[] {
  return events.flatMap((event) => {
    const normalized = normalizeGoogleCalendarEvent(event);

    return normalized ? [normalized] : [];
  });
}
