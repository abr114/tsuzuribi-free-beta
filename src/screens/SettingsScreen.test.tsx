import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getContactFormUrl, SettingsScreen } from "./SettingsScreen";

afterEach(() => {
  vi.unstubAllEnvs();
});

const legacyFeedbackFormText = "感" + "想フォーム";
const legacyFeedbackHeadingText = "感" + "想を送る";

describe("SettingsScreen beta pack", () => {
  it("hides the contact form link when form URLs are empty", () => {
    vi.stubEnv("VITE_CONTACT_URL", "");
    vi.stubEnv("VITE_FEEDBACK_URL", "");

    const html = renderSettings();

    expect(html).toContain("無償βの範囲");
    expect(html).toContain("Google予定タイトルの生データ");
    expect(html).not.toContain(`${legacyFeedbackFormText}を開く`);
    expect(html).not.toContain(legacyFeedbackHeadingText);
    expect(html).not.toContain("お問い合わせフォームを開く");
  });

  it("shows a single contact form link and prefers VITE_CONTACT_URL", () => {
    vi.stubEnv("VITE_CONTACT_URL", "https://example.com/contact");
    vi.stubEnv("VITE_FEEDBACK_URL", "https://example.com/form");

    const html = renderSettings();

    expect(html).toContain("お問い合わせフォーム");
    expect(html).toContain("お問い合わせフォームを開く");
    expect(html).toContain("https://example.com/contact");
    expect(html).not.toContain("https://example.com/form");
    expect(html).not.toContain(legacyFeedbackHeadingText);
    expect(html).not.toContain(legacyFeedbackFormText);
    expect(html).toContain("実名、企業名、予定名");
  });

  it("falls back to VITE_FEEDBACK_URL for existing environments", () => {
    vi.stubEnv("VITE_CONTACT_URL", "");
    vi.stubEnv("VITE_FEEDBACK_URL", "https://example.com/form");

    const html = renderSettings();

    expect(html).toContain("お問い合わせフォーム");
    expect(html).toContain("お問い合わせフォームを開く");
    expect(html).toContain("https://example.com/form");
    expect(html).not.toContain(legacyFeedbackFormText);
  });

  it("trims the configured contact form URL", () => {
    expect(
      getContactFormUrl({
        VITE_CONTACT_URL: "  https://example.com/contact  ",
        VITE_FEEDBACK_URL: "https://example.com/form",
      }),
    ).toBe("https://example.com/contact");
  });

  it("trims the fallback feedback URL", () => {
    expect(
      getContactFormUrl({
        VITE_CONTACT_URL: "",
        VITE_FEEDBACK_URL: "  https://example.com/form  ",
      }),
    ).toBe("https://example.com/form");
  });
});

function renderSettings() {
  return renderToStaticMarkup(
    <SettingsScreen
      canAccessReviewMode={false}
      mockLetters={[]}
      mockRecords={[]}
      onAction={() => undefined}
      onClearPrototypeData={() => undefined}
      onUiModeChange={() => undefined}
    />,
  );
}
