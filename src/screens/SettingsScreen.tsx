import {
  CalendarCheck,
  ChevronRight,
  Database,
  Eye,
  FlaskConical,
  Mail,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { ScreenStack } from "../components/ScreenStack";
import type { CtaHandler, MockLetter, MockRecord, UiMode } from "../types/content";

type SettingsScreenProps = {
  canAccessReviewMode: boolean;
  mockLetters: MockLetter[];
  mockRecords: MockRecord[];
  onAction: CtaHandler;
  onClearPrototypeData: () => void;
  onUiModeChange: (mode: UiMode) => void;
};

export function SettingsScreen({
  canAccessReviewMode,
  mockLetters,
  mockRecords,
  onAction,
  onClearPrototypeData,
  onUiModeChange,
}: SettingsScreenProps) {
  const savedItemCount = mockLetters.length + mockRecords.length;
  const hasSavedItems = savedItemCount > 0;
  const contactFormUrl = getContactFormUrl();

  return (
    <ScreenStack>
      <section className="rounded-[22px] border border-white/80 bg-[#fffaf2] p-5 shadow-soft sm:p-6">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[14px] border border-sage-soft bg-[#edf3ea] text-sage">
          <ShieldCheck size={21} strokeWidth={1.8} />
        </div>
        <h2 className="text-[1.45rem] font-semibold leading-[1.42] tracking-normal text-ink sm:text-[1.62rem]">
          つづりびを安心して使うための設定です。
        </h2>
        <p className="mt-3 text-[1rem] leading-7 text-ink-muted">
          連携状態、端末に残っている記録、無償βの表示範囲をここで確認できます。
        </p>
      </section>

      <section className="rounded-[22px] border border-sage-soft bg-[#f6fbf1] p-5 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-deep-green text-white shadow-soft">
            <CalendarCheck className="h-5 w-5" strokeWidth={1.9} />
          </div>
          <div>
            <h3 className="text-[1.12rem] font-semibold leading-7 text-ink">
              Google連携
            </h3>
            <p className="mt-1 text-[1rem] leading-7 text-ink-muted">
              未連携でも、手動追加、メモ貼り付け、この7日間から拾う流れは使えます。必要な時だけ、予定を確認できます。
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-[16px] border border-sage-soft bg-white/70 px-4 py-3">
          <p className="text-[0.95rem] font-semibold leading-6 text-sage">
            連携状態
          </p>
          <p className="mt-1 text-[0.95rem] leading-7 text-ink-muted">
            この画面では、Google連携へ進む入口だけを表示しています。
          </p>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 min-[520px]:grid-cols-2">
          <SettingsActionButton
            label="Google連携画面へ"
            onClick={() =>
              onAction({
                action: "navigate",
                label: "Google連携画面へ",
                target: "googleExplain",
                variant: "primary",
              })
            }
            tone="primary"
          />
          <SettingsActionButton
            label="CSV / ICSで確認"
            onClick={() =>
              onAction({
                action: "navigate",
                label: "CSV / ICSで確認",
                target: "calendarImport",
                variant: "quiet",
              })
            }
          />
        </div>
      </section>

      <section className="rounded-[22px] border border-sage-soft bg-[#f6fbf1] p-5 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-deep-green text-white shadow-soft">
            <ShieldCheck className="h-5 w-5" strokeWidth={1.9} />
          </div>
          <div>
            <h3 className="text-[1.12rem] font-semibold leading-7 text-ink">
              無償βの範囲
            </h3>
            <p className="mt-1 text-[1rem] leading-7 text-ink-muted">
              Googleカレンダー、今日のこと、メモ貼り付け、手紙から、短い証拠ラベルを残せます。
            </p>
          </div>
        </div>
        <ul className="mt-4 space-y-2 text-[0.95rem] leading-7 text-ink-muted">
          <li>保存前に短いラベルとカテゴリを確認できます。</li>
          <li>
            Google予定タイトルの生データ、場所、参加者、詳細本文、eventId、calendarIdは保存しません。
          </li>
          <li>現在はこの端末のブラウザ内に保存します。</li>
          <li>保存したデータは、この設定画面から削除できます。</li>
          <li>
            AI、通知、課金、Google裏側定期取得、GitHub/Notion連携はまだありません。
          </li>
        </ul>
      </section>

      {contactFormUrl && (
        <section className="rounded-[22px] border border-paper-line bg-white/75 p-5 shadow-soft">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] border border-sage-soft bg-[#edf3ea] text-sage">
              <Mail className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="text-[1.12rem] font-semibold leading-7 text-ink">
                お問い合わせフォーム
              </h3>
              <p className="mt-1 text-[1rem] leading-7 text-ink-muted">
                改善点、不具合、使ってみた感想、連絡したいことを送れます。実名、企業名、予定名などは書かなくて大丈夫です。
              </p>
            </div>
          </div>
          <a
            className="mt-4 flex min-h-12 w-full items-center justify-between rounded-full border border-sage-soft bg-white/85 px-4 py-3 text-left text-[0.98rem] font-semibold text-sage shadow-soft transition hover:bg-paper-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
            href={contactFormUrl}
            rel="noreferrer"
            target="_blank"
          >
            <span>お問い合わせフォームを開く</span>
            <ChevronRight className="h-5 w-5 shrink-0" strokeWidth={1.9} />
          </a>
        </section>
      )}

      <section className="rounded-[22px] border border-white/80 bg-white/75 p-5 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] border border-sage-soft bg-[#edf3ea] text-sage">
            <Database className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div>
            <h3 className="text-[1.12rem] font-semibold leading-7 text-ink">
              端末内の記録
            </h3>
            <p className="mt-1 text-[1rem] leading-7 text-ink-muted">
              {hasSavedItems
                ? `${savedItemCount}件がこの端末に残っています。`
                : "この端末に残っている記録はまだありません。"}
            </p>
          </div>
        </div>
        <p className="mt-4 rounded-[16px] border border-paper-line bg-paper-soft/80 px-4 py-3 text-[0.95rem] leading-7 text-ink-muted">
          無償βでは、記録と手紙をこの端末のブラウザ内に残します。別の端末やブラウザには移りません。
        </p>
        <button
          className="mt-4 flex min-h-12 w-full items-center justify-between rounded-[16px] border border-clay/35 bg-[#fff7ef] px-4 py-3 text-left text-[0.98rem] font-semibold text-clay transition hover:bg-[#fff1e6] focus:outline-none focus-visible:ring-2 focus-visible:ring-clay disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!hasSavedItems}
          onClick={onClearPrototypeData}
          type="button"
        >
          <span>この端末の記録を消す</span>
          <Trash2 className="h-5 w-5 shrink-0" strokeWidth={1.8} />
        </button>
      </section>

      <section className="rounded-[22px] border border-paper-line bg-white/70 p-5 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] border border-paper-line bg-paper-soft text-sage">
            <Eye className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div>
            <h3 className="text-[1.12rem] font-semibold leading-7 text-ink">
              表示とβ版の範囲
            </h3>
            <p className="mt-1 text-[1rem] leading-7 text-ink-muted">
              現在の表示は無償β準備版です。通常の公開URLでは、このβユーザー向け表示で使います。
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-paper-line bg-paper-soft px-3 py-1.5 text-[0.9rem] font-semibold text-ink-muted">
            β準備版
          </span>
          {canAccessReviewMode && (
            <button
              className="rounded-full border border-paper-line bg-white/75 px-3 py-1.5 text-[0.9rem] font-medium text-ink-muted transition hover:bg-paper-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
              onClick={() => onUiModeChange("review")}
              type="button"
            >
              レビュー表示を開く
            </button>
          )}
        </div>
      </section>

      <div className="flex gap-3 rounded-[18px] border border-paper-line bg-paper-soft/80 px-4 py-3 text-[0.95rem] leading-7 text-ink-muted">
        <FlaskConical className="mt-1 h-4 w-4 shrink-0 text-sage" strokeWidth={1.8} />
        <p>
          無償βでは、記録と手紙はこの端末のブラウザ内に残ります。別の端末へ自動同期されません。
        </p>
      </div>
    </ScreenStack>
  );
}

type ContactFormEnv = Pick<
  ImportMetaEnv,
  "VITE_CONTACT_URL" | "VITE_FEEDBACK_URL"
>;

export function getContactFormUrl(env: ContactFormEnv = import.meta.env) {
  return env.VITE_CONTACT_URL?.trim() || env.VITE_FEEDBACK_URL?.trim() || "";
}

function SettingsActionButton({
  label,
  onClick,
  tone = "quiet",
}: {
  label: string;
  onClick: () => void;
  tone?: "primary" | "quiet";
}) {
  const className =
    tone === "primary"
      ? "bg-deep-green text-white shadow-soft hover:bg-[#345d49] focus-visible:ring-sage"
      : "border border-paper-line bg-white/75 text-ink-muted hover:bg-paper-soft focus-visible:ring-sage";

  return (
    <button
      className={[
        "flex min-h-12 items-center justify-between rounded-full px-4 py-3 text-left text-[0.98rem] font-semibold transition focus:outline-none focus-visible:ring-2",
        className,
      ].join(" ")}
      onClick={onClick}
      type="button"
    >
      <span>{label}</span>
      <ChevronRight className="h-5 w-5 shrink-0" strokeWidth={1.9} />
    </button>
  );
}
