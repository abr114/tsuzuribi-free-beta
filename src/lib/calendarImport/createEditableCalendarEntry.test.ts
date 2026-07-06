import { describe, expect, it } from "vitest";
import { classifyCalendarEntry } from "./classifyCalendarEntry";
import { createEditableCalendarEntry } from "./createEditableCalendarEntry";

describe("createEditableCalendarEntry", () => {
  it("shows unmatched low-confidence entries as unclassified drafts", () => {
    const classified = classifyCalendarEntry(
      {
        dateLabel: "日付なし",
        rawTitle: "なななな",
      },
      "CSV",
      0,
    );
    const editable = createEditableCalendarEntry(classified);

    expect(editable).toMatchObject({
      category: "unclassified",
      confidence: "low",
      originalCategory: "unclassified",
      selected: false,
    });
  });
});
