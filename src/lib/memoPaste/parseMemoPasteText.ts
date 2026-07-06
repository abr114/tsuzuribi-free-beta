import { recordCategoryLabels } from "../../data/mockContent";
import { classifyCalendarTitle } from "../calendarImport/classifyCalendarEntry";
import type { ClassificationConfidence, RecordCategory } from "../../types/content";
import type { MemoPasteCandidate, MemoPasteDateChoice } from "./memoPasteTypes";

type ParsedMemoDate = {
  dateChoice: MemoPasteDateChoice;
  dateIso?: string;
  dateLabel: string;
  dateWasAssumed: boolean;
  rest: string;
};

const longLineLength = 34;
const ignoredConversationLines = new Set(["既読", "スタンプ"]);
const ambiguousMemoLabelMap = {
  確認: "予定を確認した",
  予定確認: "予定を確認した",
  チェック: "予定を確認した",
  連絡: "人に連絡した",
  作業: "作業を少し進めた",
  読んだ: "資料を読んだ",
  資料: "資料を読んだ",
  ジム: "ジムに行った",
  休憩: "少し休んだ",
  休む: "少し休んだ",
  休んだ: "少し休んだ",
  メモ整理: "メモを整理した",
} satisfies Record<string, string>;

export function parseMemoPasteText(
  text: string,
  now = new Date(),
): MemoPasteCandidate[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(cleanLeadingMarker)
    .filter((line) => line.length > 0 && !shouldIgnoreLine(line))
    .map((line, index) => createCandidate(line, index, now))
    .filter((candidate): candidate is MemoPasteCandidate => candidate !== null);
}

function createCandidate(
  line: string,
  index: number,
  now: Date,
): MemoPasteCandidate | null {
  const parsedDate = parseDatePrefix(line, now);
  const labelSource = stripTimePrefix(parsedDate.rest).trim();

  if (!labelSource || shouldIgnoreLine(labelSource)) {
    return null;
  }

  const classification = classifyCalendarTitle(labelSource);
  const isLongLine = [...labelSource].length >= longLineLength;
  const isConversationLike = looksLikeConversationLine(labelSource);
  const confidence = adjustConfidence({
    baseConfidence: classification.confidence,
    isConversationLike,
    isLongLine,
    labelSource,
  });
  const shortLabel = createMemoShortLabel(labelSource);
  const categoryLabel = getMemoPasteCategoryLabel(shortLabel, classification.category);
  const note = createNote({
    dateWasAssumed: parsedDate.dateWasAssumed,
    isConversationLike,
    isLongLine,
  });

  return {
    category: classification.category,
    categoryLabel,
    confidence,
    dateChoice: parsedDate.dateChoice,
    dateIso: parsedDate.dateIso,
    dateLabel: parsedDate.dateLabel,
    dateWasAssumed: parsedDate.dateWasAssumed,
    id: `memoPaste-${index}-${parsedDate.dateLabel}-${shortLabel}`,
    note,
    rawLine: line,
    reason: createReason(confidence, classification.reason, isConversationLike, isLongLine),
    shortLabel,
    sourceLabel: "メモ貼り付け",
  };
}

function cleanLeadingMarker(line: string) {
  return line
    .replace(/^\s*(?:[-*・•□■☐☑✅✔️]+|\d+[.)])\s*/u, "")
    .trim();
}

function shouldIgnoreLine(line: string) {
  const normalized = line.normalize("NFKC").trim();

  if (ignoredConversationLines.has(normalized)) {
    return true;
  }

  if (/^\d{1,2}:\d{2}$/.test(normalized)) {
    return true;
  }

  return /^[^\s\d]{1,12}\s+\d{1,2}:\d{2}$/.test(normalized);
}

function parseDatePrefix(line: string, now: Date): ParsedMemoDate {
  const relativeMatch = line.match(/^(今日|明日|昨日)\s*(.+)$/);

  if (relativeMatch) {
    const relativeDate = createRelativeDate(now, relativeMatch[1]);

    return {
      dateChoice: "known",
      dateIso: formatDateIso(relativeDate),
      dateLabel: relativeMatch[1],
      dateWasAssumed: false,
      rest: relativeMatch[2],
    };
  }

  const yearSlashMatch = line.match(
    /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})(?:\([^)]+\))?\s*(.+)$/,
  );

  if (yearSlashMatch) {
    return createAbsoluteDateResult({
      day: Number(yearSlashMatch[3]),
      month: Number(yearSlashMatch[2]),
      rest: yearSlashMatch[4],
      year: Number(yearSlashMatch[1]),
    });
  }

  const slashMatch = line.match(
    /^(\d{1,2})[/-](\d{1,2})(?:\([^)]+\))?\s*(.+)$/,
  );

  if (slashMatch) {
    return createAbsoluteDateResult({
      day: Number(slashMatch[2]),
      month: Number(slashMatch[1]),
      rest: slashMatch[3],
      year: now.getFullYear(),
    });
  }

  const japaneseDateMatch = line.match(
    /^(?:(\d{4})年)?(\d{1,2})月(\d{1,2})日(?:\([^)]+\))?\s*(.+)$/,
  );

  if (japaneseDateMatch) {
    return createAbsoluteDateResult({
      day: Number(japaneseDateMatch[3]),
      month: Number(japaneseDateMatch[2]),
      rest: japaneseDateMatch[4],
      year: japaneseDateMatch[1] ? Number(japaneseDateMatch[1]) : now.getFullYear(),
    });
  }

  return {
    dateChoice: "ignore",
    dateLabel: "日付なし",
    dateWasAssumed: true,
    rest: line,
  };
}

function createAbsoluteDateResult({
  day,
  month,
  rest,
  year,
}: {
  day: number;
  month: number;
  rest: string;
  year: number;
}): ParsedMemoDate {
  const date = new Date(year, month - 1, day);

  return {
    dateChoice: "known",
    dateIso: formatDateIso(date),
    dateLabel: `${month}/${day}`,
    dateWasAssumed: false,
    rest,
  };
}

function createRelativeDate(now: Date, label: string) {
  const date = new Date(now);

  if (label === "明日") {
    date.setDate(date.getDate() + 1);
  }

  if (label === "昨日") {
    date.setDate(date.getDate() - 1);
  }

  return date;
}

function formatDateIso(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function stripTimePrefix(value: string) {
  return value
    .replace(/^\s*\d{1,2}:\d{2}\s*/, "")
    .replace(/^\s*\d{1,2}時(?:\d{1,2}分)?\s*/, "");
}

function adjustConfidence({
  baseConfidence,
  isConversationLike,
  isLongLine,
  labelSource,
}: {
  baseConfidence: ClassificationConfidence;
  isConversationLike: boolean;
  isLongLine: boolean;
  labelSource: string;
}): ClassificationConfidence {
  if (isConversationLike || isLongLine) {
    return "low";
  }

  if (/^(面談|面接)$/.test(labelSource.trim())) {
    return "medium";
  }

  if (isAmbiguousMemoLabel(labelSource)) {
    return "medium";
  }

  return baseConfidence;
}

function createMemoShortLabel(labelSource: string) {
  const normalized = labelSource.replace(/\s+/g, " ").trim();
  const actionLabel = normalizeAmbiguousMemoLabel(normalized);
  const chars = [...actionLabel];

  if (chars.length <= 18) {
    return actionLabel;
  }

  return chars.slice(0, 18).join("");
}

function normalizeAmbiguousMemoLabel(value: string) {
  const normalized = value.normalize("NFKC").replace(/\s+/g, "").trim();
  const mappedLabel =
    ambiguousMemoLabelMap[
      normalized as keyof typeof ambiguousMemoLabelMap
    ];

  if (mappedLabel) {
    return mappedLabel;
  }

  return value;
}

function isAmbiguousMemoLabel(value: string) {
  const normalized = value.normalize("NFKC").replace(/\s+/g, "").trim();

  if (normalized in ambiguousMemoLabelMap) {
    return true;
  }

  const chars = [...normalized];

  return chars.length <= 2;
}

function getMemoPasteCategoryLabel(label: string, category: RecordCategory) {
  const normalized = label.normalize("NFKC");

  if (category === "future" && /連絡|面談|面接/.test(normalized)) {
    return "外とつながった日の証拠";
  }

  if (category === "care" && /休/.test(normalized)) {
    return "休むことを選べた日の証拠";
  }

  if (category === "care" && /生活/.test(normalized)) {
    return "生活を守った日の証拠";
  }

  return recordCategoryLabels[category];
}

function looksLikeConversationLine(value: string) {
  const normalized = value.normalize("NFKC");

  return /ありがとう|だね|ですか|ましたか|了解|よろしく/.test(normalized);
}

function createNote({
  dateWasAssumed,
  isConversationLike,
  isLongLine,
}: {
  dateWasAssumed: boolean;
  isConversationLike: boolean;
  isLongLine: boolean;
}) {
  if (isLongLine) {
    return "短く分けて貼ると、見つけやすくなります。";
  }

  if (isConversationLike) {
    return "会話ログらしい行です。必要な予定だけ貼ると、見つけやすくなります。";
  }

  if (dateWasAssumed) {
    return "日付が見つからない行です。保存前に扱いを選べます。";
  }

  return undefined;
}

function createReason(
  confidence: ClassificationConfidence,
  baseReason: string,
  isConversationLike: boolean,
  isLongLine: boolean,
) {
  if (isLongLine) {
    return "1行に複数の内容がある可能性があるため、確認してから保存できます。";
  }

  if (isConversationLike) {
    return "会話文らしいため、確認してから保存できます。";
  }

  if (confidence === "low") {
    return "一致する言葉が少ないため、確認してから保存できます。";
  }

  return baseReason;
}
