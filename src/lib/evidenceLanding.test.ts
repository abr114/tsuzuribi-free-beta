import { describe, expect, it } from "vitest";
import {
  createEvidenceLandingPayload,
  getEvidenceDestinationLabel,
} from "./evidenceLanding";
import type { MockRecord } from "../types/content";

describe("evidence landing", () => {
  it("creates the shared landing payload used by one-tap saves", () => {
    const payload = createEvidenceLandingPayload(
      [
        createRecord({
          category: "build",
          categoryLabel: "積み上げた日の証拠",
          id: "manual-1",
          label: "少し進めた",
          source: "manual",
        }),
      ],
      100,
    );

    expect(payload).toEqual({
      createdAt: 100,
      id: "100-manual-1",
      items: [
        {
          category: "build",
          categoryLabel: "積み上げた日の証拠",
          createdAt: 100,
          date: "今日",
          id: "manual-1",
          label: "少し進めた",
          source: "manual",
          sourceLabel: "手動追加",
        },
      ],
    });
    expect(getEvidenceDestinationLabel(payload.items[0])).toBe(
      "ここまで > 積み上げた日",
    );
  });

  it("uses one payload shape for every add source", () => {
    const records = [
      createRecord({ id: "manual", label: "調べた", source: "manual" }),
      createRecord({ id: "memo", label: "研究メモ整理", source: "memoPaste" }),
      createRecord({
        id: "google",
        label: "予定を確認した",
        source: "googleCalendar",
      }),
      createRecord({ id: "letter", label: "手紙を残した", source: "letter" }),
      createRecord({
        id: "reflection",
        label: "人に連絡した",
        source: "reflection",
      }),
    ];

    const payload = createEvidenceLandingPayload(records, 200);

    expect(payload.items.map((item) => item.sourceLabel)).toEqual([
      "手動追加",
      "メモ貼り付け",
      "Googleカレンダー",
      "手紙",
      "この7日間から拾う",
    ]);
    expect(payload.items.map((item) => item.label)).toEqual([
      "調べた",
      "研究メモ整理",
      "予定を確認した",
      "手紙を残した",
      "人に連絡した",
    ]);
  });
});

function createRecord({
  category = "build",
  categoryLabel = "積み上げた日の証拠",
  id,
  label,
  source,
}: Pick<MockRecord, "id" | "label" | "source"> &
  Partial<Pick<MockRecord, "category" | "categoryLabel">>): MockRecord {
  return {
    category,
    categoryLabel,
    dateLabel: "今日",
    id,
    label,
    source,
  };
}
