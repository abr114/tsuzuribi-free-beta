import { useEffect, useRef, type ReactNode } from "react";
import {
  CalendarCheck,
  FlameKindling,
  Heart,
  LetterText,
  Plus,
  Settings,
  UserCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  brandName,
  mockRecordSourceLabels,
} from "../data/mockContent";
import {
  getEvidenceDestinationLabel,
  getEvidenceSourceLabel,
} from "../lib/evidenceLanding";
import {
  formatLetterDateTime,
  getLetterSourceLabel,
  pickLetterToReceive,
  trimLetterPreview,
} from "../lib/letters/letterDisplay";
import type {
  LastAddedEvidence,
  MockLetter,
  MockRecord,
  ScreenId,
  UiMode,
} from "../types/content";

type ProductShellProps = {
  activeScreen: ScreenId;
  canAccessReviewMode: boolean;
  children: ReactNode;
  lastAddedEvidence: LastAddedEvidence | null;
  mockLetters: MockLetter[];
  mockRecords: MockRecord[];
  onScreenChange: (screen: ScreenId) => void;
  onUiModeChange: (mode: UiMode) => void;
  onViewLastAddedEvidence: () => void;
  toast: string;
};

type ProductNavId = "home" | "add" | "hardTime" | "settings";

type ProductNavItem = {
  id: ProductNavId;
  icon: LucideIcon;
  label: string;
  target: ScreenId;
};

const productNavItems = [
  { id: "home", icon: FlameKindling, label: "ここまで", target: "home" },
  { id: "add", icon: Plus, label: "追加する", target: "productAdd" },
  { id: "hardTime", icon: Heart, label: "つらい時", target: "hardTime" },
  { id: "settings", icon: Settings, label: "設定", target: "settings" },
] satisfies ProductNavItem[];

const productScreenGroups: Record<ProductNavId, readonly ScreenId[]> = {
  add: ["productAdd", "oneTap", "reflection", "memoPaste", "letter"],
  hardTime: ["hardTime"],
  home: ["home"],
  settings: ["settings", "googleExplain", "calendarImport", "plus"],
};

const supportCardClass =
  "rounded-[18px] border border-paper-line/80 bg-paper-soft/95 p-4 shadow-soft";

export function ProductShell({
  activeScreen,
  canAccessReviewMode,
  children,
  lastAddedEvidence,
  mockLetters,
  mockRecords,
  onScreenChange,
  onUiModeChange,
  onViewLastAddedEvidence,
  toast,
}: ProductShellProps) {
  const activeNavId = getActiveProductNavId(activeScreen);
  const hasNewHomeEvidence = (lastAddedEvidence?.items.length ?? 0) > 0;
  const mainRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    mainRef.current?.scrollTo({ left: 0, top: 0 });
  }, [activeScreen]);

  return (
    <div className="product-mode min-h-screen bg-product-app text-ink">
      <FlyingEvidenceChip
        evidence={lastAddedEvidence}
        key={lastAddedEvidence?.id ?? "empty"}
      />
      <div className="mx-auto min-h-screen w-full sm:px-6 sm:py-8 min-[1100px]:max-w-[1360px] min-[1100px]:px-8">
        <div className="min-h-screen w-full min-[1100px]:grid min-[1100px]:min-h-[calc(100vh-4rem)] min-[1100px]:grid-cols-[204px_minmax(0,1fr)_332px] min-[1100px]:rounded-[26px] min-[1100px]:border min-[1100px]:border-white/70 min-[1100px]:bg-[#fbf7ef] min-[1100px]:shadow-paper">
          <aside className="hidden bg-[#3f584a] px-4 py-6 text-paper-soft min-[1100px]:flex min-[1100px]:flex-col min-[1100px]:rounded-l-[26px]">
            <ProductBrandBlock tone="dark" />
            <div className="mt-8">
              <ProductNav
                activeNavId={activeNavId}
                hasNewHomeEvidence={hasNewHomeEvidence}
                homeGlowKey={lastAddedEvidence?.id ?? "empty"}
                layout="side"
                onScreenChange={onScreenChange}
              />
            </div>

            <div className="mt-auto space-y-3">
              <div className="rounded-[16px] border border-white/[0.15] bg-white/[0.08] px-3 py-3">
                <div className="flex items-center gap-2 text-[0.95rem] font-semibold">
                  <UserCircle2 className="h-4 w-4" strokeWidth={1.8} />
                  ユーザー名
                </div>
                <p className="mt-1 text-sm leading-6 text-paper-soft/70">
                  この端末に静かに保存中
                </p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <ProductVersionBadge tone="dark" />
                {canAccessReviewMode && (
                  <button
                    className="rounded-full border border-white/[0.15] px-3 py-1.5 text-xs text-paper-soft/[0.65] transition hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                    onClick={() => onUiModeChange("review")}
                    type="button"
                  >
                    レビュー表示
                  </button>
                )}
              </div>
            </div>
          </aside>

          <section className="mx-auto flex h-screen min-h-screen w-full max-w-[500px] flex-col overflow-hidden bg-[#fbf7ef] pb-32 shadow-paper sm:h-auto sm:min-h-[calc(100vh-4rem)] sm:overflow-hidden sm:rounded-[28px] sm:border sm:border-white/75 sm:pb-0 min-[1100px]:mx-0 min-[1100px]:min-h-[calc(100vh-4rem)] min-[1100px]:max-w-none min-[1100px]:rounded-none min-[1100px]:border-0 min-[1100px]:shadow-none">
          <header className="sticky top-0 z-20 border-b border-paper-line/70 bg-[#fbf7ef]/96 px-5 pb-3 pt-4 backdrop-blur sm:px-6 min-[1100px]:hidden">
            <div className="flex items-center justify-between gap-3">
              <ProductBrandBlock compact />
              <div className="flex items-center gap-2">
                <ProductVersionBadge />
                {canAccessReviewMode && (
                  <button
                    className="rounded-full border border-paper-line bg-paper-soft/80 px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
                    onClick={() => onUiModeChange("review")}
                    type="button"
                  >
                    レビュー表示
                  </button>
                )}
              </div>
            </div>
            <div className="mt-4 hidden sm:block min-[1100px]:hidden">
              <ProductNav
                activeNavId={activeNavId}
                hasNewHomeEvidence={hasNewHomeEvidence}
                homeGlowKey={lastAddedEvidence?.id ?? "empty"}
                layout="top"
                onScreenChange={onScreenChange}
              />
            </div>
          </header>

          <main
            className="flex-1 overflow-y-auto px-5 pb-32 pt-5 sm:px-6 sm:pb-8 min-[1100px]:px-7 min-[1100px]:py-7"
            ref={mainRef}
          >
            {children}
          </main>

          {toast && (
            <div className="mx-5 mb-24 rounded-lg border border-paper-line bg-paper-soft p-3 text-sm leading-6 text-ink-muted shadow-soft sm:mx-6 sm:mb-5">
              {toast}
            </div>
          )}
          </section>

          <aside className="hidden border-l border-paper-line/70 bg-[#f7f1e8] min-[1100px]:sticky min-[1100px]:top-8 min-[1100px]:block min-[1100px]:max-h-[calc(100vh-4rem)] min-[1100px]:self-start min-[1100px]:overflow-y-auto min-[1100px]:rounded-r-[26px]">
            <ProductSupportPanel
              activeScreen={activeScreen}
              lastAddedEvidence={lastAddedEvidence}
              mockLetters={mockLetters}
              mockRecords={mockRecords}
              onScreenChange={onScreenChange}
              onViewLastAddedEvidence={onViewLastAddedEvidence}
            />
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-paper-line/80 bg-[#fffaf2]/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_30px_rgba(58,48,36,0.10)] backdrop-blur sm:hidden">
        <ProductNav
          activeNavId={activeNavId}
          hasNewHomeEvidence={hasNewHomeEvidence}
          homeGlowKey={lastAddedEvidence?.id ?? "empty"}
          layout="bottom"
          onScreenChange={onScreenChange}
        />
      </div>
    </div>
  );
}

function ProductVersionBadge({ tone = "light" }: { tone?: "dark" | "light" }) {
  const className =
    tone === "dark"
      ? "rounded-full border border-white/[0.15] px-3 py-1.5 text-xs font-medium text-paper-soft/[0.65]"
      : "rounded-full border border-paper-line bg-paper-soft/80 px-3 py-1.5 text-xs font-medium text-ink-muted";

  return <span className={className}>β準備版</span>;
}

function ProductBrandBlock({
  compact = false,
  tone = "light",
}: {
  compact?: boolean;
  tone?: "dark" | "light";
}) {
  const isDark = tone === "dark";

  return (
    <div className="flex items-center gap-3">
      <div
        className={isDark ? "brand-mark brand-mark-dark" : "brand-mark"}
        aria-hidden="true"
      >
        <FlameKindling size={18} strokeWidth={1.8} />
      </div>
      <div>
        {!compact && (
          <p
            className={[
              "text-sm",
              isDark ? "text-paper-soft/70" : "text-ink-muted",
            ].join(" ")}
          >
            tsuzuribi
          </p>
        )}
        <h1
          className={[
            "font-semibold tracking-normal text-ink",
            compact ? "text-lg" : "text-xl",
            isDark ? "text-paper-soft" : "text-ink",
          ].join(" ")}
        >
          {brandName}
        </h1>
      </div>
    </div>
  );
}

function ProductNav({
  activeNavId,
  hasNewHomeEvidence,
  homeGlowKey,
  layout,
  onScreenChange,
}: {
  activeNavId: ProductNavId;
  hasNewHomeEvidence: boolean;
  homeGlowKey: string;
  layout: "bottom" | "side" | "top";
  onScreenChange: (screen: ScreenId) => void;
}) {
  const containerClass =
    layout === "side"
      ? "space-y-2"
      : layout === "top"
        ? "grid grid-cols-4 gap-2"
        : "grid grid-cols-4 items-end gap-2";

  return (
    <nav aria-label="メインナビ" className={containerClass}>
      {productNavItems.map((item) => {
        const isActive = activeNavId === item.id;
        const Icon = item.icon;

        return (
          <button
            aria-current={isActive ? "page" : undefined}
            className={getProductNavButtonClass(
              item.id,
              isActive,
              layout,
              item.id === "home" && hasNewHomeEvidence,
            )}
            key={item.id === "home" ? `${item.id}-${homeGlowKey}` : item.id}
            onClick={() => onScreenChange(item.target)}
            type="button"
          >
            {layout === "bottom" && item.id === "add" ? (
              <>
                <span className="grid h-16 w-16 place-items-center rounded-full bg-deep-green text-white shadow-paper">
                  <Icon className="h-6 w-6" strokeWidth={1.9} />
                </span>
                <span className="mt-1 text-sm text-ink-muted">
                  追加
                </span>
              </>
            ) : (
              <>
                <Icon
                  className={layout === "bottom" ? "h-5 w-5" : "h-5 w-5"}
                  strokeWidth={1.8}
                />
                <span>{layout === "bottom" && item.id === "add" ? "追加" : item.label}</span>
              </>
            )}
          </button>
        );
      })}
    </nav>
  );
}

function getProductNavButtonClass(
  navId: ProductNavId,
  isActive: boolean,
  layout: "bottom" | "side" | "top",
  shouldGlow = false,
) {
  const base =
    layout === "side"
      ? "relative flex min-h-[3.25rem] w-full items-center gap-3 rounded-[13px] border border-transparent px-3 py-2.5 text-left text-[0.95rem] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
      : layout === "bottom"
        ? "relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-[14px] px-2 py-1.5 text-center text-sm font-semibold leading-tight transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
        : "relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-[14px] border px-2 py-2.5 text-center text-sm font-semibold leading-tight transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sage";

  const glowClass = shouldGlow ? " product-home-nav-glow" : "";

  if (layout === "bottom" && navId === "add") {
    return isActive
      ? `${base} -mt-5 text-deep-green${glowClass}`
      : `${base} -mt-5 text-sage${glowClass}`;
  }

  if (isActive) {
    return layout === "side"
      ? `${base} border-white/[0.15] bg-white/[0.12] text-paper-soft${glowClass}`
      : `${base} border-deep-green bg-deep-green text-paper-soft shadow-soft${glowClass}`;
  }

  if (navId === "hardTime") {
    return layout === "side"
      ? `${base} text-paper-soft/75 hover:bg-white/[0.08]${glowClass}`
      : `${base} border-clay/35 bg-[#fff7ef] text-clay hover:bg-[#fff1e6]${glowClass}`;
  }

  return layout === "side"
    ? `${base} text-paper-soft/75 hover:bg-white/[0.08]${glowClass}`
    : `${base} border-paper-line bg-white/60 text-ink-muted hover:bg-paper-soft${glowClass}`;
}

function ProductSupportPanel({
  activeScreen,
  lastAddedEvidence,
  mockLetters,
  mockRecords,
  onScreenChange,
  onViewLastAddedEvidence,
}: {
  activeScreen: ScreenId;
  lastAddedEvidence: LastAddedEvidence | null;
  mockLetters: MockLetter[];
  mockRecords: MockRecord[];
  onScreenChange: (screen: ScreenId) => void;
  onViewLastAddedEvidence: () => void;
}) {
  const recentEvidence = buildRecentEvidence(mockRecords, lastAddedEvidence);
  const savedItemCount = mockRecords.length + mockLetters.length;
  const latestLetter = pickLetterToReceive(mockLetters) ?? undefined;
  const isAddContext = productScreenGroups.add.includes(activeScreen);
  const isHardTimeContext = activeScreen === "hardTime";
  const isHomeContext = activeScreen === "home";
  const isSettingsContext = productScreenGroups.settings.includes(activeScreen);
  const cards: ReactNode[] = [];

  if (isHomeContext) {
    cards.push(
      <SupportLetterCard
        key="letter"
        latestLetter={latestLetter}
        letterCount={mockLetters.length}
        onScreenChange={onScreenChange}
      />,
      <SupportRecentEvidence key="recent" recentEvidence={recentEvidence} />,
    );

    if (lastAddedEvidence && lastAddedEvidence.items.length > 0) {
      cards.push(
        <SupportLastAddedCard
          key="last-added"
          lastAddedEvidence={lastAddedEvidence}
          onViewLastAddedEvidence={onViewLastAddedEvidence}
        />,
      );
    }
  } else if (isAddContext) {
    cards.push(
      <SupportContextCard
        body="今回残したことは、「ここまで」の今回追加や根拠に入ります。"
        icon={Plus}
        key="add-context"
        note="まずはひとつだけで大丈夫です。"
        title="追加先"
      >
        <button
          className="mt-3 min-h-11 rounded-full bg-deep-green px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-[#345d49] focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
          onClick={() => onScreenChange("oneTap")}
          type="button"
        >
          ひとつ残す
        </button>
      </SupportContextCard>,
    );

    if (lastAddedEvidence && lastAddedEvidence.items.length > 0) {
      cards.push(
        <SupportLastAddedCard
          key="last-added"
          lastAddedEvidence={lastAddedEvidence}
          onViewLastAddedEvidence={onViewLastAddedEvidence}
        />,
      );
    }

    cards.push(
      <SupportRecentEvidence key="recent" recentEvidence={recentEvidence} />,
    );
  } else if (isHardTimeContext) {
    cards.push(
      <SupportContextCard
        body="書けたら一文だけ。書かずに見るだけでも大丈夫です。"
        icon={Heart}
        key="hard-time-context"
        note="今は増やすより、残っていたことを見つける場所です。"
        tone="clay"
        title="一文だけでいい"
      >
        <button
          className="mt-3 min-h-11 rounded-full bg-deep-green px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-[#345d49] focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
          onClick={() => onScreenChange("letter")}
          type="button"
        >
          手紙を書く
        </button>
      </SupportContextCard>,
      <SupportLetterCard
        key="letter"
        latestLetter={latestLetter}
        letterCount={mockLetters.length}
        onScreenChange={onScreenChange}
      />,
    );
  } else if (isSettingsContext) {
    cards.push(
      <SupportContextCard
        body="仮記録はこの端末内に保存されています。"
        icon={Settings}
        key="settings-state"
        note={
          savedItemCount > 0
            ? `${savedItemCount}件が残っています。Google連携は必要な時だけ使います。`
            : "まだ保存済み記録はありません。Google連携は必要な時だけ使います。"
        }
        title="保存状態"
      />,
      <SupportGoogleCard
        isSettingsContext={isSettingsContext}
        key="google"
        onScreenChange={onScreenChange}
      />,
      <SupportStorageCard
        key="storage"
        onScreenChange={onScreenChange}
        savedItemCount={savedItemCount}
      />,
    );
  } else {
    cards.push(
      <SupportGoogleCard
        isSettingsContext={isSettingsContext}
        key="google"
        onScreenChange={onScreenChange}
      />,
      <SupportRecentEvidence key="recent" recentEvidence={recentEvidence} />,
      <SupportStorageCard
        key="storage"
        onScreenChange={onScreenChange}
        savedItemCount={savedItemCount}
      />,
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] space-y-4 p-5">
      {cards.slice(0, 3)}
    </div>
  );
}

function SupportLetterCard({
  latestLetter,
  letterCount,
  onScreenChange,
}: {
  latestLetter: MockLetter | undefined;
  letterCount: number;
  onScreenChange: (screen: ScreenId) => void;
}) {
  return (
    <section className={supportCardClass}>
      <div className="flex items-center gap-2 text-base font-semibold text-sage">
        <LetterText className="h-4 w-4" strokeWidth={1.8} />
        前の自分からの一文
      </div>
      <p className="mt-3 text-[0.95rem] font-semibold leading-7 text-ink">
        {latestLetter
          ? trimLetterPreview(latestLetter.body, 46)
          : "まだ一文は残っていません。"}
      </p>
      <p className="mt-2 text-sm leading-6 text-ink-muted">
        {latestLetter
          ? `${formatLetterDateTime(latestLetter)}。${getLetterSourceLabel(latestLetter.source)}。履歴は${letterCount}件あります。`
          : "書ける時だけ、あとで読む自分へ短く置いておけます。"}
      </p>
      <button
        className="mt-3 min-h-11 rounded-full border border-paper-line bg-white/75 px-4 py-2 text-sm font-semibold text-sage transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
        onClick={() => onScreenChange("letter")}
        type="button"
      >
        {latestLetter ? "一文を見返す" : "一文を残す"}
      </button>
    </section>
  );
}

function SupportGoogleCard({
  isSettingsContext,
  onScreenChange,
}: {
  isSettingsContext: boolean;
  onScreenChange: (screen: ScreenId) => void;
}) {
  return (
    <section className={supportCardClass}>
      <div className="flex items-center gap-2 text-base font-semibold text-sage">
        <CalendarCheck className="h-4 w-4" strokeWidth={1.8} />
        {isSettingsContext ? "Google連携状態" : "予定から見つける"}
      </div>
      <p className="mt-2 text-sm leading-6 text-ink-muted">
        {isSettingsContext
          ? "未連携でも使えます。必要な時だけ予定を確認できます。"
          : "過去7日間の予定から、残すものだけを選べます。"}
      </p>
      <button
        className="mt-3 flex min-h-11 w-full items-center justify-center rounded-full bg-deep-green px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-[#345d49] focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
        onClick={() => onScreenChange("googleExplain")}
        type="button"
      >
        {isSettingsContext ? "Google連携を見る" : "予定を確認する"}
      </button>
    </section>
  );
}

function SupportRecentEvidence({
  recentEvidence,
}: {
  recentEvidence: ReturnType<typeof buildRecentEvidence>;
}) {
  return (
    <section className={supportCardClass}>
      <p className="text-base font-semibold text-ink">最近見つかった証拠</p>
      {recentEvidence.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {recentEvidence.map((item) => (
            <li
              className={[
                "rounded-lg border px-3 py-2",
                item.isNew
                  ? "border-sage-soft bg-[#edf3ea]"
                  : "border-paper-line bg-white/75",
              ].join(" ")}
              key={item.id}
            >
              {item.isNew && (
                <p className="mb-1 text-xs font-semibold leading-5 text-sage">
                  今回追加
                </p>
              )}
              <p className="text-[0.95rem] font-medium leading-6 text-ink">
                {item.label}
              </p>
              <p className="mt-1 text-sm leading-6 text-ink-muted">
                {item.meta}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-3 rounded-lg border border-paper-line bg-white/75 px-3 py-3">
          <p className="text-[0.95rem] font-semibold leading-6 text-ink">
            まだ見つかっていません。
          </p>
          <p className="mt-1 text-sm leading-6 text-ink-muted">
            予定から見つけるか、今日のことをひとつ残すと、ここに表示されます。
          </p>
        </div>
      )}
    </section>
  );
}

function SupportLastAddedCard({
  lastAddedEvidence,
  onViewLastAddedEvidence,
}: {
  lastAddedEvidence: LastAddedEvidence;
  onViewLastAddedEvidence: () => void;
}) {
  return (
    <section className="rounded-[18px] border border-sage-soft bg-[#edf3ea] p-4 shadow-soft">
      <p className="text-base font-semibold text-sage">今回追加したこと</p>
      <p className="mt-2 text-[0.95rem] font-semibold leading-7 text-ink">
        {lastAddedEvidence.items[0].label}
      </p>
      <p className="mt-1 text-sm leading-6 text-ink-muted">
        {lastAddedEvidence.items.length}件がここまでに入りました。
      </p>
      <p className="mt-1 text-sm leading-6 text-ink-muted">
        追加元：{getEvidenceSourceLabel(lastAddedEvidence.items[0].source)}
      </p>
      <p className="text-sm leading-6 text-ink-muted">
        見返す場所：{getEvidenceDestinationLabel(lastAddedEvidence.items[0])}
      </p>
      <button
        className="mt-3 min-h-11 rounded-full border border-sage-soft bg-white/80 px-4 py-2 text-sm font-semibold text-sage transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
        onClick={onViewLastAddedEvidence}
        type="button"
      >
        追加先を見る
      </button>
    </section>
  );
}

function SupportStorageCard({
  onScreenChange,
  savedItemCount,
}: {
  onScreenChange: (screen: ScreenId) => void;
  savedItemCount: number;
}) {
  return (
    <section className={supportCardClass}>
      <p className="text-base font-semibold text-sage">端末内保存状態</p>
      <p className="mt-2 text-sm leading-6 text-ink-muted">
        {savedItemCount > 0
          ? `${savedItemCount}件がこの端末に残っています。`
          : "保存済み記録はまだありません。"}
      </p>
      <button
        className="mt-3 min-h-11 rounded-full border border-paper-line bg-white/75 px-4 py-2 text-sm font-semibold text-ink-muted transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
        onClick={() => onScreenChange("settings")}
        type="button"
      >
        設定を見る
      </button>
    </section>
  );
}


function SupportContextCard({
  body,
  children,
  icon: Icon,
  note,
  title,
  tone = "sage",
}: {
  body: string;
  children?: ReactNode;
  icon: LucideIcon;
  note?: string;
  title: string;
  tone?: "clay" | "sage";
}) {
  const iconClass =
    tone === "clay"
      ? "border-clay/30 bg-[#fff7ef] text-clay"
      : "border-sage-soft bg-[#edf3ea] text-sage";

  return (
    <section className="rounded-[18px] border border-white/80 bg-white/75 p-4 shadow-soft">
      <div className="flex items-start gap-3">
        <div
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border",
            iconClass,
          ].join(" ")}
        >
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-base font-semibold leading-6 text-ink">{title}</p>
          <p className="mt-1 text-sm leading-6 text-ink-muted">{body}</p>
          {note && (
            <p className="mt-2 text-sm font-medium leading-6 text-sage">
              {note}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

function FlyingEvidenceChip({
  evidence,
}: {
  evidence: LastAddedEvidence | null;
}) {
  if (!evidence || evidence.items.length === 0) {
    return null;
  }

  const flightClass = [
    "evidence-orb-flight",
    evidence.items.length > 1 ? "evidence-orb-flight-many" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={flightClass} key={evidence.id} aria-hidden="true">
      <span className="evidence-orb-track evidence-orb-track-one">
        <span className="evidence-orb-glow" />
        <span className="evidence-orb evidence-orb-one" />
      </span>
      <span className="evidence-orb-track evidence-orb-track-two">
        <span className="evidence-orb evidence-orb-two" />
      </span>
      <span className="evidence-orb-track evidence-orb-track-three">
        <span className="evidence-orb evidence-orb-three" />
      </span>
      {evidence.items.length > 1 && (
        <span className="evidence-orb-track evidence-orb-track-four">
          <span className="evidence-orb evidence-orb-four" />
        </span>
      )}
    </div>
  );
}

function getActiveProductNavId(activeScreen: ScreenId): ProductNavId {
  const found = productNavItems.find((item) =>
    productScreenGroups[item.id].includes(activeScreen),
  );

  return found?.id ?? "home";
}

export function buildRecentEvidence(
  mockRecords: MockRecord[],
  lastAddedEvidence: LastAddedEvidence | null,
) {
  const recent = [...mockRecords].reverse();
  const seen = new Set<string>();
  const newRecordIds = new Set(
    lastAddedEvidence?.items.map((item) => item.id) ?? [],
  );
  const items: Array<{
    id: string;
    isNew: boolean;
    label: string;
    meta: string;
  }> = [];

  for (const record of recent) {
    if (seen.has(record.label)) {
      continue;
    }

    seen.add(record.label);
    items.push({
      id: record.id,
      isNew: newRecordIds.has(record.id),
      label: record.label,
      meta: `${record.dateLabel} / ${mockRecordSourceLabels[record.source]}`,
    });

    if (items.length >= 3) {
      return items;
    }
  }

  return items;
}
