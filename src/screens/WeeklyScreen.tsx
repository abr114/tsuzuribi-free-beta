import { MailPlus, Sparkles } from "lucide-react";
import { ActionList } from "../components/ActionList";
import { CountGrid } from "../components/CountGrid";
import { EvidenceStrip } from "../components/EvidenceStrip";
import { LetterHero } from "../components/LetterHero";
import { ScreenStack } from "../components/ScreenStack";
import { weeklyCopy } from "../data/mockContent";
import type { CtaHandler } from "../types/content";

type WeeklyScreenProps = {
  onAction: CtaHandler;
};

export function WeeklyScreen({ onAction }: WeeklyScreenProps) {
  return (
    <ScreenStack>
      <div className="flex items-center gap-2 rounded-lg border border-sage-soft bg-white/65 px-3 py-2 text-xs font-medium text-sage">
        <Sparkles size={15} strokeWidth={1.8} />
        Plusで受け取れる週はじめの見え方
      </div>
      <LetterHero
        eyebrow="Plus preview"
        icon={MailPlus}
        title={weeklyCopy.title}
        body={weeklyCopy.body}
      />
      <CountGrid counts={weeklyCopy.counts} />
      <EvidenceStrip labels={weeklyCopy.evidenceLabels} />
      <div className="rounded-lg border border-paper-line bg-paper-soft p-4">
        <p className="text-sm leading-6 text-ink-muted">{weeklyCopy.note}</p>
      </div>
      <ActionList ctas={weeklyCopy.ctas} onAction={onAction} />
    </ScreenStack>
  );
}
