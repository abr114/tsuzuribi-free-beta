import type { ReactNode } from "react";

type SectionLabelProps = {
  children: ReactNode;
};

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <p className="mb-2 text-xs font-semibold text-sage">
      {children}
    </p>
  );
}
