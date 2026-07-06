import type { LucideIcon } from "lucide-react";

type LetterHeroProps = {
  body: string;
  eyebrow: string;
  icon: LucideIcon;
  title: string;
};

export function LetterHero({ body, eyebrow, icon: Icon, title }: LetterHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-lg border border-white/75 bg-paper-soft p-5 shadow-soft">
      <div className="paper-corner" aria-hidden="true" />
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-sage">
          <Icon size={16} strokeWidth={1.8} />
          {eyebrow}
        </div>
        <div className="h-7 w-12 rounded-md border border-paper-line bg-white/70" />
      </div>
      <h2 className="text-[1.55rem] font-semibold leading-tight tracking-normal text-ink">
        {title}
      </h2>
      <p className="mt-4 text-[0.95rem] leading-7 text-ink-muted">{body}</p>
    </section>
  );
}
