import type { LucideIcon } from "lucide-react";

type PlainSectionProps = {
  body: string;
  icon: LucideIcon;
  title: string;
};

export function PlainSection({ body, icon: Icon, title }: PlainSectionProps) {
  return (
    <section className="rounded-lg border border-white/75 bg-paper-soft/90 p-5 shadow-soft">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-paper-line bg-white/70 text-sage">
        <Icon size={20} strokeWidth={1.8} />
      </div>
      <h2 className="text-[1.55rem] font-semibold leading-tight tracking-normal text-ink">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-ink-muted">{body}</p>
    </section>
  );
}
