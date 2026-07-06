import { describe, expect, it } from "vitest";
import { addUniqueMockRecordDrafts } from "./mockRecordDeduplication";
import type { MockRecord, MockRecordDraft } from "../types/content";

describe("addUniqueMockRecordDrafts", () => {
  it("does not add a draft already present in existing records", () => {
    const existing = [createRecord("予定を確認した", "future", "calendarFile")];
    const result = addUniqueMockRecordDrafts(
      existing,
      [createDraft("予定を確認した", "future", "calendarFile")],
      100,
    );

    expect(result.records).toHaveLength(1);
    expect(result.addedCount).toBe(0);
    expect(result.duplicateCount).toBe(1);
    expect(result.landingRecords).toEqual(existing);
  });

  it("deduplicates records inside the same save operation", () => {
    const result = addUniqueMockRecordDrafts(
      [],
      [
        createDraft("予定を確認した", "future", "calendarFile"),
        createDraft("予定を確認した", "future", "calendarFile"),
      ],
      100,
    );

    expect(result.records).toHaveLength(1);
    expect(result.addedCount).toBe(1);
    expect(result.duplicateCount).toBe(1);
    expect(result.landingRecords).toEqual(result.addedRecords);
  });

  it("keeps records with different sources separate", () => {
    const result = addUniqueMockRecordDrafts(
      [createRecord("予定を確認した", "future", "calendarFile")],
      [createDraft("予定を確認した", "future", "manual")],
      100,
    );

    expect(result.records).toHaveLength(2);
    expect(result.addedCount).toBe(1);
    expect(result.duplicateCount).toBe(0);
    expect(result.landingRecords).toEqual(result.addedRecords);
  });

  it("does not add an already saved Google mock record", () => {
    const existing = [
      createRecord("予定を確認した", "future", "googleCalendarMock"),
    ];
    const result = addUniqueMockRecordDrafts(
      existing,
      [createDraft("予定を確認した", "future", "googleCalendarMock")],
      100,
    );

    expect(result.records).toHaveLength(1);
    expect(result.addedCount).toBe(0);
    expect(result.duplicateCount).toBe(1);
    expect(result.landingRecords).toEqual(existing);
  });

  it("deduplicates Google mock records inside the same save operation", () => {
    const result = addUniqueMockRecordDrafts(
      [],
      [
        createDraft("予定を確認した", "future", "googleCalendarMock"),
        createDraft("予定を確認した", "future", "googleCalendarMock"),
      ],
      100,
    );

    expect(result.records).toHaveLength(1);
    expect(result.addedCount).toBe(1);
    expect(result.duplicateCount).toBe(1);
    expect(result.records[0].source).toBe("googleCalendarMock");
    expect(result.landingRecords).toEqual(result.addedRecords);
  });

  it("deduplicates live Google Calendar records by date label, label, category, and source", () => {
    const result = addUniqueMockRecordDrafts(
      [createRecord("予定を確認した", "future", "googleCalendar")],
      [createDraft("予定を確認した", "future", "googleCalendar")],
      100,
    );

    expect(result.records).toHaveLength(1);
    expect(result.addedCount).toBe(0);
    expect(result.duplicateCount).toBe(1);
    expect(result.landingRecords).toEqual([
      createRecord("予定を確認した", "future", "googleCalendar"),
    ]);
  });
});

function createRecord(
  label: string,
  category: MockRecord["category"],
  source: MockRecord["source"],
): MockRecord {
  return {
    ...createDraft(label, category, source),
    id: `${source}-${label}`,
  };
}

function createDraft(
  label: string,
  category: MockRecordDraft["category"],
  source: MockRecordDraft["source"],
): MockRecordDraft {
  return {
    category,
    categoryLabel: "",
    dateLabel: "5/12",
    label,
    source,
  };
}
