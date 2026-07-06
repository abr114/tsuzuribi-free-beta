import type { UiMode } from "../types/content";

type UiModeToggleProps = {
  onChange: (mode: UiMode) => void;
  uiMode: UiMode;
};

const modeLabels = {
  review: "レビュー用",
  product: "本番想定",
} satisfies Record<UiMode, string>;

export function UiModeToggle({ onChange, uiMode }: UiModeToggleProps) {
  return (
    <div
      aria-label="UIモード切り替え"
      className="grid grid-cols-2 rounded-lg border border-paper-line bg-paper-soft p-1 text-xs"
      role="group"
    >
      {(Object.keys(modeLabels) as UiMode[]).map((mode) => {
        const isActive = uiMode === mode;

        return (
          <button
            aria-pressed={isActive}
            className={[
              "min-h-8 rounded-md px-2.5 font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sage",
              isActive
                ? "bg-ink text-paper-soft shadow-soft"
                : "text-ink-muted hover:bg-white/70",
            ].join(" ")}
            key={mode}
            onClick={() => onChange(mode)}
            type="button"
          >
            {modeLabels[mode]}
          </button>
        );
      })}
    </div>
  );
}
