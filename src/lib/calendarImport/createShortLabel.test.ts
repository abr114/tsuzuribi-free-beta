import { describe, expect, it } from "vitest";
import { createShortLabel } from "./createShortLabel";

describe("createShortLabel", () => {
  it("turns a sensitive schedule into a neutral short label", () => {
    expect(createShortLabel("株式会社A 面談 10:00")).toBe("予定を確認した");
  });

  it("turns a study schedule into a neutral short label", () => {
    expect(createShortLabel("学習 2時間")).toBe("学習");
  });

  it("keeps long titles useful for pre-save review", () => {
    const label = createShortLabel(
      "これはとても長いタイトルの予定で内容がいくつも混ざっていて分類を確認したい",
    );

    expect([...label].length).toBeGreaterThanOrEqual(12);
    expect([...label].length).toBeLessThanOrEqual(22);
    expect(label).toContain("長いタイトル");
  });

  it("removes classroom-like prefixes from labels", () => {
    expect(createShortLabel("N805 コミュニケーションデザインシステム")).toBe(
      "コミュニケーションデザインシステム",
    );
    expect(createShortLabel("A101 社会学")).toBe("社会学");
    expect(createShortLabel("3-201 デザイン演習")).toBe("デザイン演習");
    expect(createShortLabel("第2教室 コミュニケーションデザインシステム")).toBe(
      "コミュニケーションデザインシステム",
    );
  });

  it("keeps the course name for lecture and class labels", () => {
    expect(createShortLabel("N805 講義 コミュニケーションデザインシステム")).toBe(
      "コミュニケーションデザインシステム",
    );
    expect(createShortLabel("コミュニケーションデザインシステム 授業")).toBe(
      "コミュニケーションデザインシステム",
    );
    expect(createShortLabel("授業N805コミュニケーションデザインシステム")).toBe(
      "コミュニケーションデザインシステム",
    );
    expect(createShortLabel("A101 社会学")).toBe("社会学");
  });

  it("does not over-trim meaningful class-related words", () => {
    expect(createShortLabel("講義メモ")).toBe("講義メモ");
    expect(createShortLabel("授業準備")).toBe("授業準備");
  });

  it("keeps useful submit and revision labels", () => {
    expect(createShortLabel("提出物")).toBe("提出準備");
    expect(createShortLabel("提出物 修正")).toBe("作業を少し進めた");
  });
});
