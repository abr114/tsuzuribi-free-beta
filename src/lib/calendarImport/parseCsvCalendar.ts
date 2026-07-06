import { formatCalendarDateLabel } from "./formatCalendarDateLabel";
import type { ParsedCalendarEntry } from "./calendarImportTypes";

const titleHeaders = [
  "title",
  "summary",
  "subject",
  "name",
  "件名",
  "タイトル",
  "予定",
  "内容",
];

const dateHeaders = [
  "date",
  "start",
  "startdate",
  "starttime",
  "dtstart",
  "begin",
  "開始日",
  "開始日時",
  "日付",
  "開始",
];

export function parseCsvCalendar(text: string): ParsedCalendarEntry[] {
  const normalizedText = text.replace(/^\uFEFF/, "");
  const rows = parseCsvRows(normalizedText);

  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0].map(normalizeHeader);
  const titleIndex = findHeaderIndex(headers, titleHeaders);
  const dateIndex = findHeaderIndex(headers, dateHeaders);

  if (titleIndex < 0) {
    return [];
  }

  return rows
    .slice(1)
    .map((row) => ({
      dateLabel: formatCalendarDateLabel(row[dateIndex] ?? ""),
      rawTitle: (row[titleIndex] ?? "").trim(),
    }))
    .filter((event) => event.rawTitle.length > 0);
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      currentCell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }

      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = "";
      continue;
    }

    currentCell += char;
  }

  currentRow.push(currentCell);
  rows.push(currentRow);

  return rows.filter((row) => row.some((cell) => cell.trim().length > 0));
}

function normalizeHeader(value: string) {
  return value
    .trim()
    .replace(/^\uFEFF/, "")
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function findHeaderIndex(headers: string[], candidates: string[]) {
  const normalizedCandidates = candidates.map(normalizeHeader);

  return headers.findIndex((header) => normalizedCandidates.includes(header));
}
