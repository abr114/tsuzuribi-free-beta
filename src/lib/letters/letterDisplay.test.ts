import { describe, expect, it } from "vitest";
import type { MockLetter } from "../../types/content";
import {
  buildLetterMonthGroups,
  formatLetterDateTime,
  formatLetterDateTimeCompact,
  getLetterSourceLabel,
  pickLetterToReceive,
  sortLettersLatestFirst,
} from "./letterDisplay";

const baseLetter = {
  body: "今日は少し休む。",
  createdAtLabel: "2026/06/12 19:42",
  id: "letter-1",
  isPinned: false,
  source: "letter",
  visibility: "private",
} satisfies Omit<MockLetter, "createdAt">;

describe("letterDisplay", () => {
  it("formats today's letter with time", () => {
    const letter = {
      ...baseLetter,
      createdAt: new Date(2026, 5, 12, 19, 42).getTime(),
    };

    expect(
      formatLetterDateTimeCompact(
        letter,
        new Date(2026, 5, 12, 21, 0),
      ),
    ).toBe("今日 19:42");
    expect(
      formatLetterDateTime(letter, new Date(2026, 5, 12, 21, 0)),
    ).toBe("今日 19:42 に残しました");
  });

  it("formats older letters with date and time", () => {
    const letter = {
      ...baseLetter,
      createdAt: new Date(2026, 5, 9, 22, 15).getTime(),
    };

    expect(
      formatLetterDateTimeCompact(
        letter,
        new Date(2026, 5, 12, 21, 0),
      ),
    ).toBe("2026/06/09 22:15");
  });

  it("formats string timestamps and falls back for old data", () => {
    expect(
      formatLetterDateTimeCompact({
        ...baseLetter,
        createdAt: "2026-06-12T19:42:00+09:00",
      }),
    ).toBe("2026/06/12 19:42");

    expect(
      formatLetterDateTime({
        ...baseLetter,
        createdAtLabel: "",
      }),
    ).toBe("保存日時不明");
  });

  it("labels the place where the letter was saved from", () => {
    expect(getLetterSourceLabel("hard-time")).toBe("つらい時から残した");
    expect(getLetterSourceLabel("letter")).toBe("手紙から残した");
    expect(getLetterSourceLabel("self")).toBe("今日のことから残した");
    expect(getLetterSourceLabel("one-tap")).toBe("今日のことから残した");
    expect(getLetterSourceLabel("memo-paste")).toBe(
      "メモ貼り付けから残した",
    );
    expect(getLetterSourceLabel("google-calendar")).toBe(
      "Googleカレンダーから残した",
    );
    expect(getLetterSourceLabel("reflection")).toBe("この7日間から残した");
    expect(getLetterSourceLabel(undefined)).toBe("手紙から残した");
  });

  it("sorts letters by latest created time and keeps old data stable", () => {
    const oldest = createLetter("old", "古い一文", undefined, "2026/06/01");
    const newest = createLetter(
      "new",
      "新しい一文",
      new Date(2026, 5, 12, 20, 0).getTime(),
    );
    const middle = createLetter(
      "middle",
      "途中の一文",
      new Date(2026, 5, 11, 20, 0).getTime(),
    );

    expect(sortLettersLatestFirst([oldest, newest, middle]).map((item) => item.id))
      .toEqual(["new", "middle", "old"]);
  });

  it("groups letters by month with the current month opened first", () => {
    const groups = buildLetterMonthGroups(
      [
        createLetter("may", "5月の一文", new Date(2026, 4, 30, 21, 0).getTime()),
        createLetter("june-1", "6月の一文", new Date(2026, 5, 10, 21, 0).getTime()),
        createLetter("june-2", "6月の新しい一文", new Date(2026, 5, 12, 21, 0).getTime()),
      ],
      new Date(2026, 5, 13, 12, 0),
    );

    expect(groups.map((group) => [group.label, group.count])).toEqual([
      ["2026年6月", 2],
      ["2026年5月", 1],
    ]);
    expect(groups[0].isCurrentMonth).toBe(true);
    expect(groups[0].letters.map((letter) => letter.id)).toEqual([
      "june-2",
      "june-1",
    ]);
  });

  it("picks one letter to receive, preferring matching mood when present", () => {
    const calm = createLetter(
      "calm",
      "少し休む。",
      new Date(2026, 5, 11, 19, 0).getTime(),
      "",
      "不安",
    );
    const latest = createLetter(
      "latest",
      "今日はここまで。",
      new Date(2026, 5, 12, 19, 0).getTime(),
    );

    expect(pickLetterToReceive([calm, latest])?.id).toBe("latest");
    expect(pickLetterToReceive([calm, latest], "不安")?.id).toBe("calm");
  });
});

function createLetter(
  id: string,
  body: string,
  createdAt?: number | string,
  createdAtLabel = "",
  mood?: string,
): MockLetter {
  return {
    body,
    createdAt,
    createdAtLabel,
    id,
    isPinned: false,
    mood,
    source: "letter",
    visibility: "private",
  };
}
