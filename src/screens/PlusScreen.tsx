import { Check, Sparkles } from "lucide-react";
import { ActionList } from "../components/ActionList";
import { PlainSection } from "../components/PlainSection";
import { ScreenStack } from "../components/ScreenStack";
import { plusCopy } from "../data/mockContent";
import type { CtaHandler } from "../types/content";

type PlusScreenProps = {
  onAction: CtaHandler;
};

export function PlusScreen({ onAction }: PlusScreenProps) {
  return (
    <ScreenStack>
      <PlainSection icon={Sparkles} title={plusCopy.title} body={plusCopy.body} />
      <div className="rounded-lg border border-ink bg-ink p-4 text-paper-soft">
        <p className="text-sm text-paper-line">価格について</p>
        <p className="mt-1 text-2xl font-semibold">{plusCopy.price}</p>
      </div>
      <div className="rounded-lg border border-paper-line bg-white/70 p-4">
        <p className="text-sm leading-6 text-ink-muted">
          {plusCopy.timingNote}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {plusCopy.features.map((feature) => (
          <div
            className="flex items-center gap-3 rounded-lg border border-paper-line bg-paper-soft p-3 text-sm text-ink"
            key={feature}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sage-soft text-sage">
              <Check size={15} strokeWidth={2.2} />
            </span>
            {feature}
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-paper-line bg-white/70 p-4">
        <p className="text-sm leading-6 text-ink-muted">{plusCopy.note}</p>
      </div>
      <ActionList ctas={plusCopy.ctas} onAction={onAction} />
    </ScreenStack>
  );
}
