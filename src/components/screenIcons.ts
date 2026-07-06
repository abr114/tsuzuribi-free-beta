import {
  CalendarDays,
  Check,
  FileText,
  FlameKindling,
  Heart,
  LetterText,
  Plus,
  Settings,
  ShieldCheck,
  Sparkles,
  Sprout,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ScreenId } from "../types/content";

const screenIcons: Record<ScreenId, LucideIcon> = {
  home: FlameKindling,
  lowCount: Sprout,
  reflection: Check,
  googleExplain: ShieldCheck,
  calendarImport: FileText,
  memoPaste: FileText,
  hardTime: Heart,
  letter: LetterText,
  oneTap: Plus,
  productAdd: Plus,
  settings: Settings,
  weekly: CalendarDays,
  plus: Sparkles,
};

export function getScreenIcon(screen: ScreenId) {
  return screenIcons[screen];
}
