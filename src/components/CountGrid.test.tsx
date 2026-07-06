import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CountGrid } from "./CountGrid";
import type { EvidenceCount, LastAddedEvidence } from "../types/content";

describe("CountGrid", () => {
  it("marks the target category with 今回追加", () => {
    const counts: EvidenceCount[] = [
      {
        basis: {
          countingRule: "同じ日に複数あっても1日として数えます",
          examples: [],
          period: "保存済みの記録",
          reason: "保存済みの短いラベルから数えています。",
          sources: ["メモ貼り付け"],
        },
        category: "build",
        label: "積み上げた日",
        tone: "clay",
        value: "1日",
      },
    ];
    const lastAddedEvidence: LastAddedEvidence = {
      createdAt: 100,
      id: "added",
      items: [
        {
          category: "build",
          categoryLabel: "積み上げた日の証拠",
          createdAt: 100,
          date: "6/12",
          id: "memo-1",
          label: "研究メモ整理",
          source: "memoPaste",
          sourceLabel: "メモ貼り付け",
        },
      ],
    };

    const html = renderToStaticMarkup(
      <CountGrid
        counts={counts}
        lastAddedEvidence={lastAddedEvidence}
        variant="product"
      />,
    );

    expect(html).toContain("今回追加");
    expect(html).toContain("研究メモ整理");
    expect(html).toContain("根拠を見る");
  });
});
