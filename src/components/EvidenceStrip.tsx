import type { TagItem } from "../types/content";
import { SectionLabel } from "./SectionLabel";
import { TagRow } from "./TagRow";

type EvidenceStripProps = {
  compact?: boolean;
  labels: TagItem[];
};

export function EvidenceStrip({ compact = false, labels }: EvidenceStripProps) {
  return (
    <div>
      {!compact && <SectionLabel>短く残っていたこと</SectionLabel>}
      <TagRow labels={labels} />
    </div>
  );
}
