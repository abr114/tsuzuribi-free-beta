import type { MockLetter, MockLetterSource } from "../../types/content";

export function getLetterSourceLabel(source?: MockLetterSource) {
  if (source === "hard-time") {
    return "つらい時から残した";
  }

  if (source === "self" || source === "one-tap") {
    return "今日のことから残した";
  }

  if (source === "memo-paste") {
    return "メモ貼り付けから残した";
  }

  if (source === "google-calendar") {
    return "Googleカレンダーから残した";
  }

  if (source === "reflection") {
    return "この7日間から残した";
  }

  return "手紙から残した";
}

export function formatLetterDateTime(letter: MockLetter, now = new Date()) {
  const compact = formatLetterDateTimeCompact(letter, now);

  return compact === "保存日時不明" ? compact : `${compact} に残しました`;
}

export function formatLetterDateTimeCompact(
  letter: MockLetter,
  now = new Date(),
) {
  const createdAt = getLetterCreatedAtDate(letter);

  if (!createdAt) {
    const createdAtLabel = letter.createdAtLabel.trim();

    return createdAtLabel || "保存日時不明";
  }

  const time = createdAt.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
  });

  if (isSameLocalDate(createdAt, now)) {
    return `今日 ${time}`;
  }

  const date = createdAt.toLocaleDateString("ja-JP", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return `${date} ${time}`;
}

export function formatLetterMonthEntryDateTime(letter: MockLetter) {
  const createdAt = getLetterCreatedAtDate(letter);

  if (!createdAt) {
    return letter.createdAtLabel.trim() || "保存日時不明";
  }

  const date = createdAt.toLocaleDateString("ja-JP", {
    day: "2-digit",
    month: "2-digit",
  });
  const time = createdAt.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
  });

  return `${date} ${time}`;
}

export type LetterMonthGroup = {
  count: number;
  id: string;
  isCurrentMonth: boolean;
  label: string;
  letters: MockLetter[];
};

export function buildLetterMonthGroups(
  letters: MockLetter[],
  now = new Date(),
): LetterMonthGroup[] {
  const groups = new Map<
    string,
    LetterMonthGroup & { sortTime: number }
  >();

  for (const letter of sortLettersLatestFirst(letters)) {
    const createdAt = getLetterCreatedAtDate(letter);
    const id = createdAt
      ? `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`
      : "unknown";
    const sortTime = createdAt
      ? new Date(createdAt.getFullYear(), createdAt.getMonth(), 1).getTime()
      : -1;
    const isCurrentMonth = Boolean(
      createdAt &&
        createdAt.getFullYear() === now.getFullYear() &&
        createdAt.getMonth() === now.getMonth(),
    );
    const label = createdAt
      ? `${createdAt.getFullYear()}年${createdAt.getMonth() + 1}月`
      : "保存日時が分からない一文";
    const group =
      groups.get(id) ??
      {
        count: 0,
        id,
        isCurrentMonth,
        label,
        letters: [],
        sortTime,
      };

    group.count += 1;
    group.letters.push(letter);
    groups.set(id, group);
  }

  return Array.from(groups.values())
    .sort((left, right) => right.sortTime - left.sortTime)
    .map(({ sortTime: _sortTime, ...group }) => group);
}

export function pickLetterToReceive(letters: MockLetter[], mood?: string) {
  const latestFirst = sortLettersLatestFirst(letters);

  if (mood) {
    return latestFirst.find((letter) => letter.mood === mood) ?? latestFirst[0] ?? null;
  }

  return latestFirst[0] ?? null;
}

export function sortLettersLatestFirst(letters: MockLetter[]) {
  return letters
    .map((letter, index) => ({ index, letter }))
    .sort(
      (left, right) =>
        getLetterSortTime(right.letter, right.index) -
        getLetterSortTime(left.letter, left.index),
    )
    .map(({ letter }) => letter);
}

export function trimLetterPreview(body: string, maxLength = 80) {
  const normalizedBody = body.trim();

  return normalizedBody.length > maxLength
    ? `${normalizedBody.slice(0, maxLength)}...`
    : normalizedBody;
}

export function getLetterCreatedAtDate(
  letter: Pick<MockLetter, "createdAt">,
) {
  if (typeof letter.createdAt === "number") {
    return toValidDate(letter.createdAt);
  }

  if (typeof letter.createdAt === "string" && letter.createdAt.trim()) {
    const trimmedCreatedAt = letter.createdAt.trim();
    const numericTimestamp = Number(trimmedCreatedAt);

    if (/^\d+$/.test(trimmedCreatedAt) && Number.isFinite(numericTimestamp)) {
      return toValidDate(numericTimestamp);
    }

    return toValidDate(trimmedCreatedAt);
  }

  return null;
}

function getLetterSortTime(letter: MockLetter, fallbackIndex: number) {
  return getLetterCreatedAtDate(letter)?.getTime() ?? fallbackIndex;
}

function isSameLocalDate(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function toValidDate(value: number | string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}
