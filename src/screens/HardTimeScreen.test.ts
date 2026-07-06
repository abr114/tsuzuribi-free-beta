import { describe, expect, it } from "vitest";
import { buildRecentHardTimeEvidenceLabels } from "./HardTimeScreen";
import type { MockRecord } from "../types/content";

describe("buildRecentHardTimeEvidenceLabels", () => {
  it("does not show review sample labels when product has no saved records", () => {
    expect(buildRecentHardTimeEvidenceLabels([])).toEqual([]);
  });

  it("uses only recent saved record labels", () => {
    expect(
      buildRecentHardTimeEvidenceLabels([
        createRecord("予定を確認した", "future", "calendarFile", "昨日", "1"),
        createRecord("運動習慣", "care", "manual", "今日", "2"),
        createRecord("運動習慣", "care", "manual", "今日", "3"),
      ]),
    ).toEqual(["運動習慣", "予定を確認した"]);
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
