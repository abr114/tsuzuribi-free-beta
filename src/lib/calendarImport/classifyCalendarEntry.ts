import { createShortLabel, stripClassroomPrefix } from "./createShortLabel";
import type {
  CalendarEntrySourceType,
  CalendarTitleClassification,
  ClassifiedCalendarEntry,
  ClassificationConfidence,
  ParsedCalendarEntry,
} from "./calendarImportTypes";
import type { MockRecordSource, RecordCategory } from "../../types/content";

export const classificationRules = {
  future: [
    "面接",
    "ES",
    "エントリー",
    "応募",
    "提出",
    "説明会",
    "選考",
    "面談",
    "連絡",
    "確認",
    "申込",
    "申し込み",
  ],
  build: [
    "勉強",
    "資格",
    "課題",
    "研究",
    "制作",
    "開発",
    "作成",
    "練習",
    "復習",
    "読書",
    "調査",
    "調べ",
    "調べもの",
    "資料",
    "メモ",
    "作業",
    "授業",
    "講義",
    "講座",
    "履修",
    "ゼミ",
    "演習",
    "輪講",
    "レッスン",
    "セミナー",
  ],
  care: [
    "休む",
    "休んだ",
    "休み",
    "通院",
    "病院",
    "健康診断",
    "散歩",
    "筋トレ",
    "運動",
    "ジム",
    "ランニング",
    "ウォーキング",
    "ストレッチ",
    "ヨガ",
    "買い物",
    "家事",
    "睡眠",
    "片付け",
    "食事",
    "生活",
  ],
  return: ["つづりび", "ここに戻る", "振り返り", "見返す"],
} satisfies Record<RecordCategory, string[]>;

const categoryOrder: RecordCategory[] = ["future", "build", "care", "return"];

const categoryDisplayLabels = {
  future: "未来に向き合ったこと",
  build: "積み上げたこと",
  care: "自分を整えたこと",
  return: "戻ってきたこと",
} satisfies Record<RecordCategory, string>;

export function classifyCalendarTitle(
  rawTitle: string,
): CalendarTitleClassification {
  const title = rawTitle.trim();
  const normalizedTitle = normalizeForMatching(title);
  const matches = categoryOrder
    .map((category) => ({
      category,
      keywords: classificationRules[category].filter((keyword) =>
        normalizedTitle.includes(normalizeForMatching(keyword)),
      ),
    }))
    .map((match) => ({
      ...match,
      score: match.keywords.reduce(
        (total, keyword) => total + getKeywordScore(keyword),
        0,
      ),
    }))
    .filter((match) => match.score > 0);
  const matchedCategories = matches.map((match) => match.category);
  const matchedKeywords = matches.flatMap((match) => match.keywords);
  const isLongTitle = [...title].length >= 40;

  if (matches.length === 0 && hasClassroomPrefix(title)) {
    return {
      category: "build",
      confidence: "medium",
      matchedKeywords,
      reason:
        "教室名のような文字があるため、授業・講義の候補として確認できます。",
      shortLabel: createShortLabel(stripClassroomPrefix(title), {
        confidence: "medium",
        matchedKeywords,
      }),
    };
  }

  const category = matches[0]?.category ?? "build";
  const confidence = getConfidence(matchedCategories.length, isLongTitle);

  return {
    category,
    confidence,
    matchedKeywords,
    reason: createClassificationReason(
      matches.length,
      matchedKeywords,
      category,
      isLongTitle,
    ),
    shortLabel: createShortLabel(title, { confidence, matchedKeywords }),
  };
}

function normalizeForMatching(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/\s+/g, "");
}

function getKeywordScore(keyword: string) {
  return Math.max(1, Math.min([...keyword].length, 4));
}

function hasClassroomPrefix(title: string) {
  return stripClassroomPrefix(title) !== title;
}

export function classifyCalendarEntries(
  entries: ParsedCalendarEntry[],
  sourceType: CalendarEntrySourceType,
): ClassifiedCalendarEntry[] {
  return entries.map((entry, index) =>
    classifyCalendarEntry(entry, sourceType, index),
  );
}

export function classifyCalendarEntry(
  entry: ParsedCalendarEntry,
  sourceType: CalendarEntrySourceType,
  index: number,
): ClassifiedCalendarEntry {
  const classification = classifyCalendarTitle(entry.rawTitle);
  const recordSource = getRecordSource(sourceType);

  return {
    ...entry,
    ...classification,
    id: `${sourceType}-${index}-${entry.dateLabel}-${classification.shortLabel}`,
    recordSource,
    sourceType,
  };
}

function getRecordSource(sourceType: CalendarEntrySourceType): MockRecordSource {
  if (sourceType === "GoogleCalendarMock") {
    return "googleCalendarMock";
  }

  if (sourceType === "GoogleCalendar") {
    return "googleCalendar";
  }

  return "calendarFile";
}

function getConfidence(
  matchedCategoryCount: number,
  isLongTitle: boolean,
): ClassificationConfidence {
  if (matchedCategoryCount === 0) {
    return "low";
  }

  if (isLongTitle) {
    return matchedCategoryCount === 1 ? "medium" : "low";
  }

  if (matchedCategoryCount === 1) {
    return "high";
  }

  return "medium";
}

function createClassificationReason(
  matchedCategoryCount: number,
  matchedKeywords: string[],
  category: RecordCategory,
  isLongTitle: boolean,
) {
  if (matchedCategoryCount === 0) {
    return "一致する言葉が見つからなかったため、確認が必要です。";
  }

  if (matchedCategoryCount > 1) {
    return "複数カテゴリにまたがるため、確認が必要です。";
  }

  if (isLongTitle) {
    return "タイトルが長めのため、確認してから保存できます。";
  }

  return `${matchedKeywords
    .map((keyword) => `「${keyword}」`)
    .join("、")}が含まれるため、${categoryDisplayLabels[category]}に分類しました。`;
}
