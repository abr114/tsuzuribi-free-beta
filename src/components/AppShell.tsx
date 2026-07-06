import { useMemo } from "react";
import type { ReactNode } from "react";
import { FlameKindling } from "lucide-react";
import { brandName, reviewScreenNav } from "../data/mockContent";
import type {
  LastAddedEvidence,
  MockLetter,
  MockRecord,
  ScreenId,
  UiMode,
} from "../types/content";
import { ProductShell } from "./ProductShell";
import { ReviewScreenSwitcher } from "./ReviewScreenSwitcher";
import { UiModeToggle } from "./UiModeToggle";
import { getScreenIcon } from "./screenIcons";

type AppShellProps = {
  activeScreen: ScreenId;
  canAccessReviewMode: boolean;
  children: ReactNode;
  homeFocusEvidenceId: string | null;
  lastAddedEvidence: LastAddedEvidence | null;
  mockLetters: MockLetter[];
  mockRecords: MockRecord[];
  onScreenChange: (screen: ScreenId) => void;
  onUiModeChange: (mode: UiMode) => void;
  onViewLastAddedEvidence: () => void;
  toast: string;
  uiMode: UiMode;
};

export function AppShell({
  activeScreen,
  canAccessReviewMode,
  children,
  homeFocusEvidenceId: _homeFocusEvidenceId,
  lastAddedEvidence,
  mockLetters,
  mockRecords,
  onScreenChange,
  onUiModeChange,
  onViewLastAddedEvidence,
  toast,
  uiMode,
}: AppShellProps) {
  const activeReviewScreen = useMemo(
    () =>
      reviewScreenNav.find((item) => item.id === activeScreen) ??
      reviewScreenNav[0],
    [activeScreen],
  );
  const activeReviewIndex = reviewScreenNav.findIndex(
    (item) => item.id === activeReviewScreen.id,
  );
  const ActiveIcon = getScreenIcon(activeReviewScreen.id);

  if (uiMode === "product") {
    return (
      <ProductShell
        activeScreen={activeScreen}
        canAccessReviewMode={canAccessReviewMode}
        mockLetters={mockLetters}
        mockRecords={mockRecords}
        lastAddedEvidence={lastAddedEvidence}
        onScreenChange={onScreenChange}
        onUiModeChange={onUiModeChange}
        onViewLastAddedEvidence={onViewLastAddedEvidence}
        toast={toast}
      >
        {children}
      </ProductShell>
    );
  }

  return (
    <div className="min-h-screen bg-app px-0 text-ink sm:flex sm:items-center sm:justify-center sm:px-8 sm:py-8">
      <div className="w-full sm:max-w-[520px] sm:rounded-[32px] sm:border sm:border-white/60 sm:bg-paper-soft/60 sm:p-4 sm:shadow-soft">
        <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-paper shadow-paper sm:min-h-[calc(100vh-8rem)] sm:overflow-hidden sm:rounded-[24px] sm:border sm:border-white/70">
          <header className="sticky top-0 z-20 border-b border-paper-line/80 bg-paper/95 px-5 pb-3 pt-4 backdrop-blur">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="brand-mark" aria-hidden="true">
                  <FlameKindling size={18} strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-xs text-ink-muted">
                    レビュー確認表示
                  </p>
                  <h1 className="text-lg font-semibold tracking-normal text-ink">
                    {brandName}
                  </h1>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <div className="rounded-lg border border-paper-line bg-paper-soft px-2.5 py-1.5 text-xs text-ink-muted">
                  {reviewScreenNav.length}画面確認
                </div>
                <div className="w-[158px]">
                  <UiModeToggle onChange={onUiModeChange} uiMode={uiMode} />
                </div>
              </div>
            </div>
            <ReviewScreenSwitcher
              active={activeScreen}
              onChange={onScreenChange}
            />
          </header>

          <main className="flex-1 px-5 pb-7 pt-5">
            <div className="mb-4 flex items-center justify-between gap-3 text-sm text-ink-muted">
              <div className="flex items-center gap-2">
                <ActiveIcon className="h-4 w-4" strokeWidth={1.8} />
                <span>{activeReviewScreen.label}</span>
              </div>
              <span className="shrink-0 rounded-md border border-paper-line bg-paper-soft px-2 py-1 text-xs">
                {activeReviewIndex + 1} / {reviewScreenNav.length}
              </span>
            </div>

            {children}

            {toast && (
              <div className="mt-4 rounded-lg border border-paper-line bg-paper-soft p-3 text-sm leading-6 text-ink-muted">
                {toast}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
