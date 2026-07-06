import type { ReactNode } from "react";

type ScreenStackProps = {
  children: ReactNode;
};

export function ScreenStack({ children }: ScreenStackProps) {
  return <div className="space-y-5">{children}</div>;
}
