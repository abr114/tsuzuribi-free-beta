import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { buildRecentEvidence } from "./ProductShell";
import type { LastAddedEvidence, MockRecord } from "../types/content";

describe("buildRecentEvidence", () => {
  it("does not fall back to review sample evidence in product mode", () => {
    expect(buildRecentEvidence([], null)).toEqual([]);
  });

  it("returns only saved records and marks newly added rows", () => {
    const records = [
      createRecord("予定を確認した", "future", "calendarFile", "昨日", "1"),
      createRecord("運動習慣", "care", "manual", "今日", "2"),
    ];
    const evidence: LastAddedEvidence = {
      createdAt: 1,
      id: "added",
      items: [
        {
          category: "care",
          categoryLabel: "自分を整えた日の証拠",
          createdAt: 1,
          date: "今日",
          id: "2",
          label: "運動習慣",
          source: "manual",
          sourceLabel: "手動追加",
        },
      ],
    };

    expect(buildRecentEvidence(records, evidence)).toEqual([
      {
        id: "2",
        isNew: true,
        label: "運動習慣",
        meta: "今日 / 手動追加",
      },
      {
        id: "1",
        isNew: false,
        label: "予定を確認した",
        meta: "昨日 / カレンダーファイル",
      },
    ]);
  });

  it("shows memo paste as the source in recent evidence", () => {
    expect(
      buildRecentEvidence(
        [createRecord("研究メモ整理", "build", "memoPaste", "6/12", "1")],
        null,
      ),
    ).toEqual([
      {
        id: "1",
        isNew: false,
        label: "研究メモ整理",
        meta: "6/12 / メモ貼り付け",
      },
    ]);
  });

  it("keeps the landing motion as abstract light with reduced-motion fallback", () => {
    const css = readFileSync(new URL("../index.css", import.meta.url), "utf8");

    expect(css).toContain(".evidence-orb-flight");
    expect(css).toContain(".evidence-orb-one");
    expect(css).toContain(".evidence-orb-track-one");
    expect(css).toContain(".evidence-orb-track-two");
    expect(css).toContain(".evidence-orb-track-three");
    expect(css).toContain(".evidence-orb-track-four");
    expect(css).toContain("@keyframes evidence-orb-path-mobile-one");
    expect(css).toContain("@keyframes evidence-orb-path-mobile-two");
    expect(css).toContain("@keyframes evidence-orb-path-mobile-three");
    expect(css).toContain("@keyframes evidence-orb-path-desktop-one");
    expect(css).toContain("animation-duration: 1.95s");
    expect(css).toContain("animation-duration: 2.28s");
    expect(css).toContain(
      "animation: product-home-nav-glow 0.95s ease-out 1 1.55s",
    );
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toMatch(/\.evidence-orb-flight\s*{\s*display: none;/);
    expect(css).toMatch(/\.product-home-nav-glow\s*{\s*animation: none;/);
    expect(css).toContain("box-shadow:");
    expect(css).not.toContain(".evidence-orb-paper");
  });
});

function createRecord(
  label: string,
  category: MockRecord["category"],
  source: MockRecord["source"],
  dateLabel: string,
  id: string,
): MockRecord {
  return {
    category,
    categoryLabel: "",
    dateLabel,
    id,
    label,
    source,
  };
}
