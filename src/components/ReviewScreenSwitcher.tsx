import { reviewScreenNav } from "../data/mockContent";
import type { ScreenId } from "../types/content";
import { getScreenIcon } from "./screenIcons";

type ReviewScreenSwitcherProps = {
  active: ScreenId;
  onChange: (screen: ScreenId) => void;
};

export function ReviewScreenSwitcher({
  active,
  onChange,
}: ReviewScreenSwitcherProps) {
  return (
    <nav
      aria-label="レビュー用画面切り替え"
      className="-mx-1 overflow-x-auto pb-1"
    >
      <div className="flex min-w-max gap-2 px-1">
        {reviewScreenNav.map((item, index) => {
          const isActive = active === item.id;
          const Icon = getScreenIcon(item.id);

          return (
            <button
              aria-current={isActive ? "page" : undefined}
              className={[
                "flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
                isActive
                  ? "border-ink bg-ink text-paper-soft"
                  : "border-paper-line bg-paper-soft text-ink-muted hover:bg-warm-gray",
              ].join(" ")}
              key={item.id}
              onClick={() => onChange(item.id)}
              type="button"
            >
              <span className="text-[0.68rem] opacity-70">{index + 1}</span>
              <Icon size={15} strokeWidth={1.8} />
              {item.shortLabel}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
