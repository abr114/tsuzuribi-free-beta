import {
  CalendarCheck,
  ChevronRight,
  Clock3,
  FileText,
  PenLine,
  Plus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ScreenStack } from "../components/ScreenStack";
import type { CtaHandler, ScreenId } from "../types/content";

type ProductAddScreenProps = {
  onAction: CtaHandler;
};

export function ProductAddScreen({ onAction }: ProductAddScreenProps) {
  const goTo = (target: ScreenId, label: string) => {
    onAction({
      action: "navigate",
      label,
      target,
      variant: "quiet",
    });
  };

  return (
    <ScreenStack>
      <section className="relative overflow-hidden rounded-[22px] border border-white/80 bg-[#fffaf2] p-5 shadow-soft sm:p-6">
        <div className="paper-corner" aria-hidden="true" />
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[14px] border border-sage-soft bg-[#edf3ea] text-sage">
          <Plus size={21} strokeWidth={1.9} />
        </div>
        <p className="text-[1.45rem] font-semibold leading-[1.42] tracking-normal text-ink sm:text-[1.62rem]">
          今日のことを、
          <br />
          ひとつ残す。
        </p>
        <p className="mt-3 max-w-[32rem] text-[1rem] leading-7 text-ink-muted">
          予定に残らないことも、ここまでに残せます。思い出せるものを、ひとつだけ選んで残します。
        </p>
      </section>

      <section className="rounded-[22px] border border-sage-soft bg-[#f6fbf1] p-5 shadow-paper sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-deep-green text-white shadow-soft">
            <PenLine className="h-5 w-5" strokeWidth={1.9} />
          </div>
          <div>
            <h2 className="text-[1.18rem] font-semibold leading-7 text-ink">
              今日のことをひとつ残す
            </h2>
            <p className="mt-2 text-[1rem] leading-7 text-ink-muted">
              いま思い出せることを、ひとつだけ残します。日記にしなくても大丈夫です。
            </p>
          </div>
        </div>
        <button
          className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-deep-green px-5 py-3 text-[1rem] font-semibold text-white shadow-soft transition hover:bg-[#345d49] focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6fbf1]"
          onClick={() => goTo("oneTap", "ひとつ残す")}
          type="button"
        >
          ひとつ残す
          <ChevronRight className="h-5 w-5" strokeWidth={1.9} />
        </button>
      </section>

      <section className="space-y-3">
        <div>
          <p className="text-[1.08rem] font-semibold leading-7 text-ink">
            ほかの残し方
          </p>
          <p className="text-[0.95rem] leading-7 text-ink-muted">
            あとからまとめて、残っていたことを拾えます。
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 min-[680px]:grid-cols-2">
          <SupportChoice
            body="Googleカレンダーから、保存前に確認して残します。"
            icon={CalendarCheck}
            label="予定から見つける"
            onClick={() => goTo("googleExplain", "予定から見つける")}
          />
          <SupportChoice
            body="メモ帳などに書いた予定を貼り付けて、残っていたことを見つけます。"
            icon={FileText}
            label="メモから見つける"
            onClick={() => goTo("memoPaste", "メモから見つける")}
          />
          <SupportChoice
            body="カレンダーやメモに残っていないことを、短い質問から拾います。"
            icon={Clock3}
            label="この7日間から拾う"
            onClick={() => goTo("reflection", "この7日間から拾う")}
          />
        </div>
      </section>

      <div className="rounded-[18px] border border-paper-line bg-white/70 px-4 py-3 text-[0.95rem] leading-7 text-ink-muted">
        すぐに全部を埋めなくても大丈夫です。残した後は、その場で完了と追加先を確認できます。
      </div>
    </ScreenStack>
  );
}

function SupportChoice({
  body,
  icon: Icon,
  label,
  onClick,
}: {
  body: string;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="group flex min-h-[9.5rem] flex-col rounded-[18px] border border-paper-line bg-white/75 p-4 text-left shadow-soft transition hover:-translate-y-0.5 hover:bg-paper-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
      onClick={onClick}
      type="button"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-sage-soft bg-[#edf3ea] text-sage">
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </span>
      <span className="mt-3 block text-[1rem] font-semibold leading-6 text-ink">
        {label}
      </span>
      <span className="mt-2 block text-[0.93rem] font-normal leading-6 text-ink-muted">
        {body}
      </span>
      <span className="mt-auto flex items-center gap-1 pt-3 text-[0.92rem] font-semibold text-sage">
        開く
        <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}
