import type { TagItem } from "../types/content";

type TagRowProps = {
  labels: TagItem[];
};

export function TagRow({ labels }: TagRowProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((label) => (
        <span
          className="rounded-lg border border-paper-line bg-white/75 px-3 py-2 text-sm font-medium text-ink"
          key={label}
        >
          {label}
        </span>
      ))}
    </div>
  );
}
