import { describe, expect, it } from "vitest";
import { createMockRecordDraft } from "../data/mockContent";
import { addUniqueMockRecordDrafts } from "../storage/mockRecordDeduplication";
import {
  createOneTapEvidenceLabel,
  ONE_TAP_LABEL_MAX_LENGTH,
  sanitizeOneTapEvidenceLabel,
} from "./OneTapScreen";

describe("one-tap optional note label", () => {
  it("uses the picked item when the optional note is empty", () => {
    expect(createOneTapEvidenceLabel("少し進めた", "   ")).toBe("少し進めた");
    expect(sanitizeOneTapEvidenceLabel("", "少し進めた")).toBe("少し進めた");
  });

  it("turns a short optional note into the editable evidence label candidate", () => {
    expect(
      createOneTapEvidenceLabel("少し進めた", "  申請書を\n1段落直した  "),
    ).toBe("申請書を 1段落直した");
  });

  it("keeps the evidence label short", () => {
    const label = createOneTapEvidenceLabel("書いた・作った", "あ".repeat(40));

    expect(Array.from(label)).toHaveLength(ONE_TAP_LABEL_MAX_LENGTH);
  });

  it("saves only the confirmed label and existing record fields", () => {
    const label = createOneTapEvidenceLabel("生活を守った", "洗濯物を片付けた");
    const draft = createMockRecordDraft(label, "manual", "care");
    const result = addUniqueMockRecordDrafts([], [draft]);
    const saved = result.addedRecords[0];

    expect(saved).toMatchObject({
      category: "care",
      categoryLabel: "自分を整えた日の証拠",
      dateLabel: "今日",
      label: "洗濯物を片付けた",
      source: "manual",
    });
    expect(saved).not.toHaveProperty("noteText");
    expect(saved).not.toHaveProperty("rawTitle");
    expect(saved).not.toHaveProperty("eventId");
    expect(saved).not.toHaveProperty("calendarId");
  });
});
