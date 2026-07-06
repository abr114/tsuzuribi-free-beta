import { describe, expect, it } from "vitest";
import { classifyCalendarTitle } from "./classifyCalendarEntry";

describe("classifyCalendarTitle", () => {
  it.each([
    ["予定を確認した", "future", "high"],
    ["人に連絡した", "future", "high"],
    ["資料を読んだ", "build", "high"],
    ["メモを整理した", "build", "high"],
    ["作業を少し進めた", "build", "high"],
    ["調べものをした", "build", "high"],
    ["筋トレ", "care", "high"],
    ["運動習慣", "care", "high"],
    ["睡眠メモ", "build", "medium"],
    ["面談メモ", "future", "medium"],
    ["子供の迎えの後 公園に連れていく", "build", "low"],
    ["雑談", "build", "low"],
    ["なななな", "build", "low"],
  ] as const)("%s -> %s / %s", (title, category, confidence) => {
    expect(classifyCalendarTitle(title)).toMatchObject({
      category,
      confidence,
    });
  });

  it.each(["講義", "授業", "ゼミ"] as const)(
    "%s is treated as build",
    (title) => {
      expect(classifyCalendarTitle(title)).toMatchObject({
        category: "build",
      });
    },
  );

  it.each([
    [
      "N805 コミュニケーションデザインシステム",
      "コミュニケーションデザインシステム",
    ],
    [
      "第2教室 コミュニケーションデザインシステム",
      "コミュニケーションデザインシステム",
    ],
  ] as const)(
    "%s is a medium build candidate with classroom prefix removed",
    (title, shortLabel) => {
      expect(classifyCalendarTitle(title)).toMatchObject({
        category: "build",
        confidence: "medium",
        reason:
          "教室名のような文字があるため、授業・講義の候補として確認できます。",
        shortLabel,
      });
    },
  );
});
