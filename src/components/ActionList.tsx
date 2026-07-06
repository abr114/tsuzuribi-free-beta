import { ChevronRight } from "lucide-react";
import type { ActionVariant, CtaHandler, CtaItem } from "../types/content";

const buttonClasses: Record<ActionVariant, string> = {
  primary:
    "bg-sage text-white shadow-soft hover:bg-[#627760] focus-visible:ring-sage",
  secondary:
    "border border-clay/35 bg-[#fff7ef] text-clay shadow-soft hover:bg-[#fff1e6] focus-visible:ring-clay",
  quiet:
    "border border-paper-line bg-white/75 text-ink hover:bg-paper-soft focus-visible:ring-sage",
};

type ActionListProps = {
  ctas: CtaItem[];
  onAction: CtaHandler;
};

export function ActionList({ ctas, onAction }: ActionListProps) {
  return (
    <div className="space-y-2">
      {ctas.map((cta) => (
        <button
          className={[
            "flex min-h-12 w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
            buttonClasses[cta.variant ?? "secondary"],
          ].join(" ")}
          key={cta.label}
          onClick={() => onAction(cta)}
          type="button"
        >
          <span className="min-w-0">
            <span className="block leading-5">{cta.label}</span>
            {cta.description && (
              <span className="mt-1 block text-xs font-normal leading-5 opacity-75">
                {cta.description}
              </span>
            )}
          </span>
          <ChevronRight className="ml-3 shrink-0" size={16} strokeWidth={1.8} />
        </button>
      ))}
    </div>
  );
}
