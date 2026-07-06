import { formatCalendarDateLabel } from "./formatCalendarDateLabel";
import type { ParsedCalendarEntry } from "./calendarImportTypes";

export function parseIcsCalendar(text: string): ParsedCalendarEntry[] {
  const lines = unfoldIcsLines(text.replace(/^\uFEFF/, ""));
  const events: ParsedCalendarEntry[] = [];
  let currentEvent: Partial<ParsedCalendarEntry> | null = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      currentEvent = {};
      continue;
    }

    if (line === "END:VEVENT") {
      if (currentEvent?.rawTitle) {
        events.push({
          dateLabel: currentEvent.dateLabel ?? "",
          rawTitle: currentEvent.rawTitle,
        });
      }

      currentEvent = null;
      continue;
    }

    if (!currentEvent) {
      continue;
    }

    const separatorIndex = line.indexOf(":");

    if (separatorIndex < 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).split(";")[0].toUpperCase();
    const value = line.slice(separatorIndex + 1);

    if (key === "SUMMARY") {
      currentEvent.rawTitle = decodeIcsText(value);
    }

    if (key === "DTSTART") {
      currentEvent.dateLabel = formatCalendarDateLabel(value);
    }
  }

  return events;
}

function unfoldIcsLines(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .reduce<string[]>((lines, line) => {
      if (/^[ \t]/.test(line) && lines.length > 0) {
        lines[lines.length - 1] += line.slice(1);
        return lines;
      }

      lines.push(line.trim());
      return lines;
    }, []);
}

function decodeIcsText(value: string) {
  return value
    .replace(/\\n/gi, " ")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
    .trim();
}
