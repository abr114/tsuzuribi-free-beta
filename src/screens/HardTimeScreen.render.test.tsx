import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HardTimeScreen } from "./HardTimeScreen";
import type { MockLetter } from "../types/content";

describe("HardTimeScreen letters", () => {
  it("shows one received letter with date and source", () => {
    const html = renderToStaticMarkup(
      <HardTimeScreen
        mockLetters={[
          createLetter("old", "前の一文", new Date(2026, 5, 9, 19, 0).getTime()),
          createLetter(
            "new",
            "今日は少し休む。",
            new Date(2026, 5, 12, 19, 42).getTime(),
          ),
        ]}
        mockRecords={[]}
        onAction={() => undefined}
        uiMode="product"
      />,
    );

    expect(html).toContain("今日は少し休む。");
    expect(html).not.toContain("前の一文");
    expect(html).toContain("2026/06/12 19:42 に残しました");
    expect(html).toContain("手紙から残した");
    expect(html).toContain("別の一文を見る");
    expect(html).toContain("一文を残す");
  });
});

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
