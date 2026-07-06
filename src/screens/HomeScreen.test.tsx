import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  HomeScreen,
  buildExtraEvidenceGroups,
  buildProductExtraEvidenceGroups,
  buildProductHomeCounts,
  buildTodayAddedRecordGroups,
} from "./HomeScreen";
import { addUniqueMockRecordDrafts } from "../storage/mockRecordDeduplication";
import type { MockLetter, MockRecord } from "../types/content";

describe("buildExtraEvidenceGroups", () => {
  it("adds mock record counts to existing labels", () => {
    const groups = buildExtraEvidenceGroups([
      createRecord("人に連絡した", "future", "calendarFile"),
    ]);
    const futureGroup = groups.find(
      (group) => group.title === "未来に向き合ったこと",
    );

    expect(
      futureGroup?.items.find((item) => item.label === "人に連絡した"),
    ).toMatchObject({
      count: "2件",
    });
  });

  it("adds new labels to the matching category", () => {
    const groups = buildExtraEvidenceGroups([
      createRecord(
        "コミュニケーションデザインシステム",
        "build",
        "calendarFile",
      ),
    ]);
    const buildGroup = groups.find(
      (group) => group.title === "積み上げたこと",
    );

    expect(
      buildGroup?.items.find(
        (item) => item.label === "コミュニケーションデザインシステム",
      ),
    ).toMatchObject({
      count: "1件",
    });
  });

  it("does not add app source records", () => {
    const groups = buildExtraEvidenceGroups([
      createRecord("ここを開いた", "return", "app"),
    ]);

    expect(
      groups.some((group) =>
        group.items.some((item) => item.label === "ここを開いた"),
      ),
    ).toBe(false);
  });

  it("only adds deduplicated mock records to evidence counts", () => {
    const deduped = addUniqueMockRecordDrafts(
      [],
      [
        createDraft("人に連絡した", "future", "calendarFile"),
        createDraft("人に連絡した", "future", "calendarFile"),
      ],
      100,
    );
    const groups = buildExtraEvidenceGroups(deduped.records);
    const futureGroup = groups.find(
      (group) => group.title === "未来に向き合ったこと",
    );

    expect(
      futureGroup?.items.find((item) => item.label === "人に連絡した"),
    ).toMatchObject({
      count: "2件",
    });
  });

  it("does not double the count when the same CSV is saved twice", () => {
    const firstSave = addUniqueMockRecordDrafts(
      [],
      [createDraft("人に連絡した", "future", "calendarFile")],
      100,
    );
    const secondSave = addUniqueMockRecordDrafts(
      firstSave.records,
      [createDraft("人に連絡した", "future", "calendarFile")],
      200,
    );
    const groups = buildExtraEvidenceGroups(secondSave.records);
    const futureGroup = groups.find(
      (group) => group.title === "未来に向き合ったこと",
    );

    expect(secondSave.duplicateCount).toBe(1);
    expect(
      futureGroup?.items.find((item) => item.label === "人に連絡した"),
    ).toMatchObject({
      count: "2件",
    });
  });

  it("does not double the count when the same Google mock sample is saved twice", () => {
    const firstSave = addUniqueMockRecordDrafts(
      [],
      [createDraft("人に連絡した", "future", "googleCalendarMock")],
      100,
    );
    const secondSave = addUniqueMockRecordDrafts(
      firstSave.records,
      [createDraft("人に連絡した", "future", "googleCalendarMock")],
      200,
    );
    const groups = buildExtraEvidenceGroups(secondSave.records);
    const futureGroup = groups.find(
      (group) => group.title === "未来に向き合ったこと",
    );

    expect(secondSave.duplicateCount).toBe(1);
    expect(
      futureGroup?.items.find((item) => item.label === "人に連絡した"),
    ).toMatchObject({
      count: "2件",
    });
  });
});

describe("buildProductHomeCounts", () => {
  it("shows unchecked placeholders before any saved records or checks", () => {
    const counts = buildProductHomeCounts([], "unchecked");

    expect(counts.map((count) => [count.label, count.value])).toEqual([
      ["未来に向き合った日", "—"],
      ["積み上げた日", "—"],
      ["自分を整えた日", "—"],
      ["戻ってきた日", "—"],
    ]);
    expect(counts.every((count) => count.valueAssistiveLabel === "未確認"))
      .toBe(true);
  });

  it("shows soft zero counts after checking without saved records", () => {
    const counts = buildProductHomeCounts([], "checkedEmpty");

    expect(counts.map((count) => count.value)).toEqual([
      "0日",
      "0日",
      "0日",
      "0日",
    ]);
    expect(counts.some((count) => count.value === "6日")).toBe(false);
  });

  it("counts only saved records by category and day", () => {
    const counts = buildProductHomeCounts([
      createRecord("予定を確認した", "future", "calendarFile", "今日"),
      createRecord("人に連絡した", "future", "manual", "今日"),
      createRecord("資料を読んだ", "build", "manual", "昨日"),
    ], "hasRecords");

    expect(counts.map((count) => [count.label, count.value])).toEqual([
      ["未来に向き合った日", "1日"],
      ["積み上げた日", "1日"],
      ["自分を整えた日", "0日"],
      ["戻ってきた日", "0日"],
    ]);
    expect(counts.some((count) => count.value === "6日")).toBe(false);
    expect(counts.some((count) => count.value === "9日")).toBe(false);
    expect(counts.some((count) => count.value === "4日")).toBe(false);
    expect(counts.some((count) => count.value === "2日")).toBe(false);
  });

  it("keeps memo paste records as real recent evidence data", () => {
    const groups = buildTodayAddedRecordGroups([
      createRecord("研究メモ整理", "build", "memoPaste", "6/12"),
    ]);

    expect(groups).toMatchObject([
      {
        label: "研究メモ整理",
        source: "memoPaste",
        dateLabel: "6/12",
        count: 1,
      },
    ]);
  });

  it("includes saved memo sources in product count bases", () => {
    const buildCount = buildProductHomeCounts(
      [createRecord("研究メモ整理", "build", "memoPaste", "6/12")],
      "hasRecords",
    ).find((count) => count.category === "build");

    expect(buildCount?.basis?.sources).toEqual(["メモ貼り付け"]);
    expect(buildCount?.basis?.mockRecords?.[0]).toMatchObject({
      label: "研究メモ整理",
      source: "memoPaste",
    });
  });
});

describe("buildProductExtraEvidenceGroups", () => {
  it("does not include fixed sample evidence labels", () => {
    const groups = buildProductExtraEvidenceGroups([
      createRecord("資料を読んだ", "build", "calendarFile"),
    ]);

    expect(groups).toEqual([
      {
        title: "積み上げたこと",
        items: [{ label: "資料を読んだ", count: "1件" }],
      },
    ]);
  });
});

describe("HomeScreen letters", () => {
  it("shows one latest letter on the product home", () => {
    const html = renderToStaticMarkup(
      <HomeScreen
        hasCheckedEvidence={false}
        mockLetters={[
          createLetter("old", "古い一文", new Date(2026, 5, 10, 20, 0).getTime()),
          createLetter("new", "新しい一文", new Date(2026, 5, 12, 20, 0).getTime()),
        ]}
        mockRecords={[]}
        onAction={() => undefined}
        onClearPrototypeData={() => undefined}
        uiMode="product"
      />,
    );

    expect(html).toContain("新しい一文");
    expect(html).not.toContain("古い一文");
    expect(html).toContain("一文を見返す");
  });

  it("shows one latest letter on the review home", () => {
    const html = renderToStaticMarkup(
      <HomeScreen
        hasCheckedEvidence={false}
        mockLetters={[
          createLetter("old", "前の一文", new Date(2026, 5, 9, 20, 0).getTime()),
          createLetter("new", "今の一文", new Date(2026, 5, 12, 20, 0).getTime()),
        ]}
        mockRecords={[]}
        onAction={() => undefined}
        onClearPrototypeData={() => undefined}
        uiMode="review"
      />,
    );

    expect(html).toContain("今の一文");
    expect(html).not.toContain("前の一文");
  });
});

function createRecord(
  label: string,
  category: MockRecord["category"],
  source: MockRecord["source"],
  dateLabel = "今日",
): MockRecord {
  return {
    ...createDraft(label, category, source, dateLabel),
    id: `${source}-${label}`,
  };
}

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

function createDraft(
  label: string,
  category: MockRecord["category"],
  source: MockRecord["source"],
  dateLabel = "今日",
) {
  return {
    category,
    categoryLabel: "",
    dateLabel,
    label,
    source,
  };
}
