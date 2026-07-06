import { Sprout } from "lucide-react";
import { ActionList } from "../components/ActionList";
import { PlainSection } from "../components/PlainSection";
import { ScreenStack } from "../components/ScreenStack";
import { SectionLabel } from "../components/SectionLabel";
import { TagRow } from "../components/TagRow";
import { lowCountCopy } from "../data/mockContent";
import type { CtaHandler } from "../types/content";

type LowCountScreenProps = {
  onAction: CtaHandler;
};

export function LowCountScreen({ onAction }: LowCountScreenProps) {
  return (
    <ScreenStack>
      <PlainSection
        icon={Sprout}
        title={lowCountCopy.title}
        body={lowCountCopy.body}
      />
      <div className="rounded-lg border border-paper-line bg-paper-soft p-4">
        <p className="text-sm leading-6 text-ink-muted">{lowCountCopy.note}</p>
      </div>
      <div>
        <SectionLabel>いま見てもいい小さなこと</SectionLabel>
        <TagRow labels={lowCountCopy.labels} />
      </div>
      <ActionList ctas={lowCountCopy.ctas} onAction={onAction} />
      <div className="rounded-lg border border-paper-line bg-white/70 p-4 text-sm leading-6 text-ink-muted">
        {lowCountCopy.closingLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </ScreenStack>
  );
}
