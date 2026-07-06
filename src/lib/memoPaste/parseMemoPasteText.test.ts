import { describe, expect, it } from "vitest";
import { addUniqueMockRecordDrafts } from "../../storage/mockRecordDeduplication";
import { createStoredPrototypeState } from "../../storage/prototypeStorage";
import { createMemoPasteRecordDraft } from "./createMemoPasteRecordDraft";
import type { MemoPasteRecordDraft } from "./memoPasteTypes";
import { parseMemoPasteText } from "./parseMemoPasteText";

const now = new Date(2026, 5, 12, 21, 0);

describe("parseMemoPasteText", () => {
  it("reads slash dates and labels", () => {
    expect(parseMemoPasteText("6/10 面談", now)[0]).toMatchObject({
      dateIso: "2026-06-10",
      dateLabel: "6/10",
      shortLabel: "面談",
    });
    expect(parseMemoPasteText("2026/06/10 面談", now)[0]).toMatchObject({
      dateIso: "2026-06-10",
      dateLabel: "6/10",
      shortLabel: "面談",
    });
  });

  it("reads Japanese dates", () => {
    expect(parseMemoPasteText("6月12日 研究メモ整理", now)[0]).toMatchObject({
      dateIso: "2026-06-12",
      dateLabel: "6/12",
      shortLabel: "研究メモ整理",
    });
  });

  it("reads relative dates", () => {
    expect(parseMemoPasteText("今日 人に連絡した", now)[0]).toMatchObject({
      dateIso: "2026-06-12",
      dateLabel: "今日",
      shortLabel: "人に連絡した",
    });
    expect(parseMemoPasteText("明日 資料を読む", now)[0]).toMatchObject({
      dateIso: "2026-06-13",
      dateLabel: "明日",
      shortLabel: "資料を読む",
    });
  });

  it("removes leading list markers and ignores empty lines", () => {
    const candidates = parseMemoPasteText(
      ["", "- 6/10 面談", "✅ 資料を読んだ"].join("\n"),
      now,
    );

    expect(candidates).toHaveLength(2);
    expect(candidates.map((candidate) => candidate.shortLabel)).toEqual([
      "面談",
      "資料を読んだ",
    ]);
  });

  it("turns ambiguous one-word memos into useful short evidence labels", () => {
    const candidates = parseMemoPasteText("確認\n連絡\n作業\n読んだ\nジム", now);

    expect(candidates.map((candidate) => candidate.shortLabel)).toEqual([
      "予定を確認した",
      "人に連絡した",
      "作業を少し進めた",
      "資料を読んだ",
      "ジムに行った",
    ]);
    expect(candidates.map((candidate) => candidate.confidence)).toEqual([
      "medium",
      "medium",
      "medium",
      "medium",
      "medium",
    ]);
  });

  it("keeps already-useful short labels as memo paste candidates", () => {
    expect(parseMemoPasteText("✅ 資料を読んだ", now)[0]).toMatchObject({
      category: "build",
      dateChoice: "ignore",
      dateLabel: "日付なし",
      dateWasAssumed: true,
      shortLabel: "資料を読んだ",
      sourceLabel: "メモ貼り付け",
    });
  });

  it("classifies memo candidates", () => {
    const candidates = parseMemoPasteText(
      [
        "ジム",
        "運動習慣",
        "研究メモ整理",
        "人に連絡した",
        "少し休んだ",
        "生活を守った",
      ].join("\n"),
      now,
    );

    expect(candidates.map((candidate) => candidate.categoryLabel)).toEqual([
      "自分を整えた日の証拠",
      "自分を整えた日の証拠",
      "積み上げた日の証拠",
      "外とつながった日の証拠",
      "休むことを選べた日の証拠",
      "生活を守った日の証拠",
    ]);
  });

  it("creates record drafts without storing the pasted original text", () => {
    const candidate = parseMemoPasteText("6/12 研究メモ整理", now)[0];
    const draft = createMemoPasteRecordDraft({
      category: candidate.category,
      categoryLabel: candidate.categoryLabel,
      dateChoice: candidate.dateChoice,
      dateLabel: candidate.dateLabel,
      shortLabel: candidate.shortLabel,
    });

    expect(draft).toEqual({
      category: "build",
      categoryLabel: "積み上げた日の証拠",
      dateLabel: "6/12",
      label: "研究メモ整理",
      source: "memoPaste",
    });
    expect(JSON.stringify(draft)).not.toContain("6/12 研究メモ整理");
  });

  it("saves only selected memo candidates", () => {
    const candidates = parseMemoPasteText("6/12 研究メモ整理\n6/14 ジム", now);
    const selectedDraft = createMemoPasteRecordDraft({
      category: candidates[1].category,
      categoryLabel: candidates[1].categoryLabel,
      dateChoice: candidates[1].dateChoice,
      dateLabel: candidates[1].dateLabel,
      shortLabel: candidates[1].shortLabel,
    });

    expect(selectedDraft).not.toBeNull();

    const result = addUniqueMockRecordDrafts([], [selectedDraft!], 100);

    expect(result.records).toHaveLength(1);
    expect(result.records[0]).toMatchObject({
      label: "ジムに行った",
      source: "memoPaste",
    });
    expect(result.records.some((record) => record.label === "研究メモ整理"))
      .toBe(false);
  });

  it("keeps the pasted full text out of the localStorage payload", () => {
    const pastedText = "確認\n連絡\n✅ 資料を読んだ";
    const records = parseMemoPasteText(pastedText, now)
      .map((candidate) =>
        createMemoPasteRecordDraft({
          ...candidate,
          dateChoice: "none",
          dateLabel: "日付なし",
        }),
      )
      .filter((record): record is MemoPasteRecordDraft => record !== null);
    const state = createStoredPrototypeState(
      addUniqueMockRecordDrafts([], records, 100).records,
      [],
    );
    const serialized = JSON.stringify(state);

    expect(serialized).not.toContain(pastedText);
    expect(serialized).not.toContain('"label":"確認"');
    expect(serialized).not.toContain('"label":"連絡"');
    expect(serialized).toContain("予定を確認した");
    expect(serialized).toContain("人に連絡した");
  });

  it("keeps undated rows out of saved drafts until the user chooses a date handling", () => {
    const candidate = parseMemoPasteText("資料を読んだ", now)[0];

    expect(candidate).toMatchObject({
      dateChoice: "ignore",
      dateLabel: "日付なし",
      dateWasAssumed: true,
      shortLabel: "資料を読んだ",
    });
    expect(createMemoPasteRecordDraft(candidate)).toBeNull();

    expect(
      createMemoPasteRecordDraft({
        ...candidate,
        dateChoice: "today",
        dateLabel: "今日",
      }),
    ).toMatchObject({
      dateLabel: "今日",
      label: "資料を読んだ",
      source: "memoPaste",
    });
    expect(
      createMemoPasteRecordDraft({
        ...candidate,
        dateChoice: "none",
        dateLabel: "日付なし",
      }),
    ).toMatchObject({
      dateLabel: "日付なし",
      label: "資料を読んだ",
      source: "memoPaste",
    });
  });

  it("keeps long or conversation-like undated rows low confidence", () => {
    const candidates = parseMemoPasteText(
      [
        "ありがとう、昨日の資料を確認しておきました。また必要なら連絡します",
        "来週までに研究メモ整理と面談確認と提出準備をまとめて進めるための細かい作業メモ",
      ].join("\n"),
      now,
    );

    expect(candidates).toHaveLength(2);
    expect(candidates.map((candidate) => candidate.confidence)).toEqual([
      "low",
      "low",
    ]);
    expect(candidates.map((candidate) => candidate.dateChoice)).toEqual([
      "ignore",
      "ignore",
    ]);
  });
});
