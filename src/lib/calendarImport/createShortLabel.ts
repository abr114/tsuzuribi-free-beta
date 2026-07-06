import type { ClassificationConfidence } from "./calendarImportTypes";

type CreateShortLabelOptions = {
  confidence?: ClassificationConfidence;
  matchedKeywords?: string[];
};

const fallbackLabelLength = 22;
const educationLabelWords = [
  "授業",
  "講義",
  "講座",
  "履修",
  "ゼミ",
  "演習",
  "輪講",
  "レッスン",
  "セミナー",
];
const trailingEducationLabelWords = ["授業", "講義", "講座"];

export function createShortLabel(
  title: string,
  options: CreateShortLabelOptions = {},
) {
  const normalizedTitle = normalizeTitle(title);
  const titleWithoutClassroom = createCourseLabelCandidate(normalizedTitle);
  const matchedKeywords = options.matchedKeywords ?? [];
  const confidence = options.confidence ?? "low";

  if (confidence === "medium" && matchedKeywords.length >= 2) {
    return matchedKeywords.slice(0, 2).join(" / ");
  }

  if (
    matchedKeywords.includes("面接") ||
    matchedKeywords.includes("面談") ||
    titleWithoutClassroom.includes("面接") ||
    titleWithoutClassroom.includes("面談")
  ) {
    return "予定を確認した";
  }

  if (
    matchedKeywords.includes("説明会") ||
    titleWithoutClassroom.includes("説明会")
  ) {
    return "予定を確認した";
  }

  if (matchedKeywords.includes("ES") || titleWithoutClassroom.includes("ES")) {
    if (titleWithoutClassroom.includes("提出")) {
      return "提出準備";
    }

    if (titleWithoutClassroom.includes("修正")) {
      return "作業を少し進めた";
    }

    if (titleWithoutClassroom.includes("詳細")) {
      return "資料を読んだ";
    }

    return "提出準備";
  }

  if (
    matchedKeywords.includes("資格") ||
    matchedKeywords.includes("勉強") ||
    (titleWithoutClassroom.includes("資格") &&
      titleWithoutClassroom.includes("勉強"))
  ) {
    return "学習メモを整理";
  }

  if (titleWithoutClassroom.includes("修正")) {
    return "作業を少し進めた";
  }

  if (
    matchedKeywords.includes("応募") ||
    matchedKeywords.includes("提出") ||
    titleWithoutClassroom.includes("応募") ||
    titleWithoutClassroom.includes("提出")
  ) {
    return "提出準備";
  }

  if (
    matchedKeywords.includes("連絡") ||
    titleWithoutClassroom.includes("連絡")
  ) {
    return "人に連絡した";
  }

  if (
    matchedKeywords.includes("資料") ||
    titleWithoutClassroom.includes("資料")
  ) {
    return "資料を読んだ";
  }

  if (
    matchedKeywords.includes("メモ") ||
    (titleWithoutClassroom.includes("メモ") &&
      !educationLabelWords.some((word) => titleWithoutClassroom.includes(word)))
  ) {
    return "メモを整理した";
  }

  if (
    matchedKeywords.includes("調査") ||
    titleWithoutClassroom.includes("調査")
  ) {
    return "調べものをした";
  }

  if (
    matchedKeywords.includes("作業") ||
    titleWithoutClassroom.includes("作業")
  ) {
    return "作業を少し進めた";
  }

  if (
    matchedKeywords.includes("買い物") ||
    titleWithoutClassroom.includes("買い物")
  ) {
    return "買い物";
  }

  if (
    matchedKeywords.includes("筋トレ") ||
    titleWithoutClassroom.includes("筋トレ")
  ) {
    return "筋トレ";
  }

  if (
    matchedKeywords.includes("振り返り") ||
    titleWithoutClassroom.includes("振り返り")
  ) {
    return "振り返り";
  }

  if (titleWithoutClassroom !== normalizedTitle && titleWithoutClassroom) {
    return createFallbackLabel(titleWithoutClassroom);
  }

  if (confidence === "high" && matchedKeywords[0]) {
    return matchedKeywords[0];
  }

  return createFallbackLabel(titleWithoutClassroom);
}

function normalizeTitle(title: string) {
  return title.replace(/\s+/g, " ").trim();
}

export function stripClassroomPrefix(title: string) {
  return title
    .replace(/^(?:[A-Z]\d{3,4}|\d+-\d{3,4}|第\d+教室)\s*/i, "")
    .trim();
}

function createCourseLabelCandidate(title: string) {
  const previousTitle = title;
  const withoutLeadingEducation = stripLeadingEducationWord(title);
  const withoutClassroom = stripClassroomPrefix(withoutLeadingEducation);
  const withoutEducationAgain = stripLeadingEducationWord(withoutClassroom);
  const withoutTrailingEducation =
    stripTrailingEducationWord(withoutEducationAgain);

  return withoutTrailingEducation || previousTitle;
}

function stripLeadingEducationWord(title: string) {
  const educationPattern = educationLabelWords.join("|");

  return title
    .replace(
      new RegExp(
        `^(?:${educationPattern})(?=\\s|[A-Z]\\d{3,4}|\\d+-\\d{3,4}|第\\d+教室)\\s*`,
        "i",
      ),
      "",
    )
    .trim();
}

function stripTrailingEducationWord(title: string) {
  const educationPattern = trailingEducationLabelWords.join("|");

  return title
    .replace(new RegExp(`\\s*(?:${educationPattern})$`, "i"), "")
    .trim();
}

function createFallbackLabel(title: string) {
  const withoutTime = title
    .replace(/\b\d{1,2}:\d{2}\b/g, "")
    .replace(/\d+(?:時間|h)/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  const chars = [...withoutTime];

  if (chars.length <= fallbackLabelLength) {
    return withoutTime;
  }

  return chars.slice(0, fallbackLabelLength).join("");
}
