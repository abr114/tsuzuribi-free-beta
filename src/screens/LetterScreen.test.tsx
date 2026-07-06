import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LetterScreen } from "./LetterScreen";
import type { AddMockRecordsResult } from "../storage/mockRecordDeduplication";
import type { MockLetter } from "../types/content";

const emptySaveResult: AddMockRecordsResult = {
  addedCount: 0,
  addedRecords: [],
  duplicateCount: 0,
  landingRecords: [],
  records: [],
};

describe("LetterScreen history", () => {
  it("shows a featured letter, recent letters, and monthly groups", () => {
    const html = renderToStaticMarkup(
      <LetterScreen
        entrySource="letter"
        mockLetters={[
          createLetter("may", "5月の一文", new Date(2026, 4, 30, 21, 0).getTime()),
          createLetter("june-old", "6月の一文", new Date(2026, 5, 10, 21, 0).getTime()),
          createLetter(
            "june-new",
            "最新の一文",
            new Date(2026, 5, 12, 21, 0).getTime(),
          ),
        ]}
        onAction={() => undefined}
        onDeleteLetter={() => undefined}
        onSaveLetter={() => emptySaveResult}
        onViewLastAddedEvidence={() => undefined}
        uiMode="product"
      />,
    );

    expect(html).toContain("今日受け取る一文");
    expect(html).toContain("最近の一文");
    expect(html).toContain("月ごとの一文");
    expect(html).toContain("最新の一文");
    expect(html).toContain("2026年6月");
    expect(html).toContain("2026年5月");
    expect(html).toContain("手紙から残した");
    expect(html).not.toContain("一文一覧");
    expect(html).not.toContain("ログ一覧");
    expect(html).not.toContain("管理");
  });

  it("does not crash with old letter data missing createdAt and source", () => {
    const html = renderToStaticMarkup(
      <LetterScreen
        entrySource="letter"
        mockLetters={[
          {
            body: "昔の形の一文",
            createdAtLabel: "",
            id: "legacy",
            isPinned: false,
            visibility: "private",
          },
        ]}
        onAction={() => undefined}
        onDeleteLetter={() => undefined}
        onSaveLetter={() => emptySaveResult}
        onViewLastAddedEvidence={() => undefined}
        uiMode="product"
      />,
    );

    expect(html).toContain("昔の形の一文");
    expect(html).toContain("保存日時不明");
    expect(html).toContain("手紙から残した");
  });
});

function createLetter(
  id: string,
  body: string,
  createdAt: number,
): MockLetter {
  return {
    body,
    createdAt,
    createdAtLabel: "",
    id,
    isPinned: false,
    source: "letter",
    visibility: "private",
  };
}
