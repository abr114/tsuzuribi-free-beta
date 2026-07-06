import { useState } from "react";
import {
  CalendarCheck,
  Check,
  ChevronRight,
  Heart,
  Home,
  LetterText,
  Sprout,
} from "lucide-react";
import { EvidenceStrip } from "../components/EvidenceStrip";
import { ScreenStack } from "../components/ScreenStack";
import { hardTimeCopy, homeCopy } from "../data/mockContent";
import {
  formatLetterDateTime,
  getLetterSourceLabel,
  pickLetterToReceive,
  trimLetterPreview,
} from "../lib/letters/letterDisplay";
import type { CtaHandler, MockLetter, MockRecord, UiMode } from "../types/content";

type HardTimeScreenProps = {
  mockLetters: MockLetter[];
  mockRecords: MockRecord[];
  onAction: CtaHandler;
  uiMode: UiMode;
};

export function HardTimeScreen({
  mockLetters,
  mockRecords,
  onAction,
  uiMode,
}: HardTimeScreenProps) {
  const [emotion, setEmotion] = useState("");
  const receivedLetter = pickLetterToReceive(mockLetters, emotion);
  const recentEvidenceLabels = buildRecentHardTimeEvidenceLabels(mockRecords);
  const selectedSecondLine = emotion
    ? hardTimeCopy.secondLinesByEmotion[emotion] ?? hardTimeCopy.secondLine
    : hardTimeCopy.secondLine;

  return (
    <ScreenStack>
      <section className="relative overflow-hidden rounded-[24px] border border-clay/20 bg-[#fff7ef] p-5 shadow-soft sm:p-6">
        <div className="paper-corner" aria-hidden="true" />
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-white/75 text-clay shadow-soft">
          <Heart size={21} strokeWidth={1.8} />
        </div>
        <h2 className="text-[1.45rem] font-semibold leading-[1.45] tracking-normal text-ink sm:text-[1.62rem]">
          今は、少し立ち止まっても大丈夫です。
        </h2>
        <p className="mt-3 text-[1rem] leading-7 text-ink-muted">
          ここに来たことも、残っていたことのひとつです。言葉にできるところだけ、そっと選べます。
        </p>
      </section>

      <button
        className="flex min-h-12 w-full items-center justify-between rounded-[18px] border border-paper-line bg-white/80 px-4 py-3 text-left text-[0.96rem] font-medium leading-6 text-ink-muted transition hover:bg-paper-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
        onClick={() =>
          onAction({
            action: "navigate",
            label: "今日は見るだけでも大丈夫",
            target: "home",
            variant: "quiet",
          })
        }
        type="button"
      >
        <span>今日は見るだけでも大丈夫</span>
        <Home className="h-4 w-4 shrink-0" strokeWidth={1.8} />
      </button>

      <section className="rounded-[22px] border border-paper-line bg-white/75 p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-sage-soft bg-[#edf3ea] text-sage">
            <Sprout className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div>
            <h3 className="text-[1.1rem] font-semibold leading-7 text-ink">
              今の気持ちに近いものを選ぶ
            </h3>
            <p className="text-[0.95rem] leading-6 text-ink-muted">
              近くなければ、選ばずに見るだけでも大丈夫です。
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 min-[430px]:grid-cols-2">
          {hardTimeCopy.emotions.map((item) => (
            <button
              className={[
                "flex min-h-12 items-center justify-between rounded-full border px-4 py-2.5 text-left text-[0.96rem] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-clay",
                emotion === item
                  ? "border-clay/40 bg-[#f8e8dd] text-ink shadow-soft"
                  : "border-paper-line bg-paper-soft/80 text-ink-muted hover:bg-white",
              ].join(" ")}
              key={item}
              onClick={() => setEmotion(item)}
              type="button"
            >
              <span>{item}</span>
              {emotion === item && (
                <Check className="h-4 w-4 shrink-0 text-clay" strokeWidth={2.2} />
              )}
            </button>
          ))}
        </div>
      </section>

      {emotion && (
        <section className="rounded-[22px] border border-white/80 bg-paper-soft/95 p-5 shadow-soft">
          <p className="text-[1.08rem] font-semibold leading-7 text-ink">
            今は「{emotion}」に近いんですね。
          </p>
          <p className="mt-2 text-[1rem] leading-7 text-ink-muted">
            {selectedSecondLine}
          </p>
          {uiMode === "product" ? (
            <ProductHardTimeEvidence
              labels={recentEvidenceLabels}
              onAction={onAction}
            />
          ) : (
            <div className="mt-5 border-t border-paper-line/80 pt-4">
              <p className="text-[0.98rem] font-semibold leading-7 text-sage">
                {hardTimeCopy.evidenceIntro}
              </p>
              <p className="mt-1 text-[0.95rem] leading-7 text-ink-muted">
                {hardTimeCopy.evidenceBridge}
              </p>
              <div className="mt-3">
                <EvidenceStrip labels={homeCopy.evidenceLabels.slice(0, 3)} compact />
              </div>
            </div>
          )}
        </section>
      )}

      {uiMode === "product" && receivedLetter && (
        <ProductHardTimeLetterCard
          letter={receivedLetter}
          onAction={onAction}
        />
      )}

      <section className="rounded-[22px] border border-sage-soft bg-[#f6fbf1] p-5 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-deep-green text-white shadow-soft">
            <LetterText className="h-5 w-5" strokeWidth={1.9} />
          </div>
          <div>
            <h3 className="text-[1.1rem] font-semibold leading-7 text-ink">
              未来の自分へ一文だけ残す
            </h3>
            <p className="mt-2 text-[1rem] leading-7 text-ink-muted">
              書けたら一文だけ。無理に整えなくても、今日のことを少しだけ置いておけます。
            </p>
          </div>
        </div>
        <button
          className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-deep-green px-5 py-3 text-[1rem] font-semibold text-white shadow-soft transition hover:bg-[#345d49] focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6fbf1]"
          onClick={() =>
            onAction({
              action: "navigate",
              label: "一文だけ残す",
              target: "letter",
              variant: "primary",
            })
          }
          type="button"
        >
          一文だけ残す
          <ChevronRight className="h-5 w-5" strokeWidth={1.9} />
        </button>
      </section>
    </ScreenStack>
  );
}

function ProductHardTimeEvidence({
  labels,
  onAction,
}: {
  labels: string[];
  onAction: CtaHandler;
}) {
  if (labels.length > 0) {
    return (
      <div className="mt-5 border-t border-paper-line/80 pt-4">
        <p className="text-[0.98rem] font-semibold leading-7 text-sage">
          ここまでに残っていたこと
        </p>
        <p className="mt-1 text-[0.95rem] leading-7 text-ink-muted">
          今日のつらさとは別に、ここまで残っていた跡もあります。
        </p>
        <div className="mt-3">
          <EvidenceStrip labels={labels} compact />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 border-t border-paper-line/80 pt-4">
      <p className="text-[0.98rem] font-semibold leading-7 text-sage">
        ここまでに残っていたこと
      </p>
      <p className="mt-1 text-[0.95rem] leading-7 text-ink-muted">
        まだ見つけている途中です。予定から見つけるか、一文だけ残すこともできます。
      </p>
      <div className="mt-3 grid gap-2 min-[430px]:grid-cols-2">
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-deep-green px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-[#345d49] focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
          onClick={() =>
            onAction({
              action: "navigate",
              label: "一文だけ残す",
              target: "letter",
              variant: "primary",
            })
          }
          type="button"
        >
          一文だけ残す
        </button>
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-paper-line bg-white/80 px-4 py-2 text-sm font-semibold text-ink-muted transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
          onClick={() =>
            onAction({
              action: "navigate",
              label: "予定から見つける",
              target: "googleExplain",
              variant: "quiet",
            })
          }
          type="button"
        >
          <CalendarCheck className="h-4 w-4" strokeWidth={1.8} />
          予定から見つける
        </button>
      </div>
    </div>
  );
}

function ProductHardTimeLetterCard({
  letter,
  onAction,
}: {
  letter: MockLetter;
  onAction: CtaHandler;
}) {
  return (
    <section className="rounded-[22px] border border-white/80 bg-paper-soft/95 p-5 shadow-soft">
      <p className="text-[0.98rem] font-semibold leading-7 text-sage">
        前の自分からの一文
      </p>
      <p className="mt-2 rounded-[16px] border border-paper-line bg-white/80 px-3 py-3 text-[0.95rem] font-medium leading-7 text-ink">
        {trimLetterPreview(letter.body, 90)}
      </p>
      <p className="mt-2 text-sm leading-6 text-ink-muted">
        {formatLetterDateTime(letter)}
      </p>
      <p className="mt-1 text-sm leading-6 text-ink-muted">
        {getLetterSourceLabel(letter.source)}
      </p>
      <div className="mt-3 grid gap-2 min-[430px]:grid-cols-2">
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-paper-line bg-white/80 px-4 py-2 text-sm font-semibold text-sage transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
          onClick={() =>
            onAction({
              action: "navigate",
              label: "別の一文を見る",
              target: "letter",
              variant: "quiet",
            })
          }
          type="button"
        >
          別の一文を見る
        </button>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-deep-green px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-[#345d49] focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
          onClick={() =>
            onAction({
              action: "navigate",
              label: "一文を残す",
              target: "letter",
              variant: "primary",
            })
          }
          type="button"
        >
          一文を残す
        </button>
      </div>
    </section>
  );
}

export function buildRecentHardTimeEvidenceLabels(mockRecords: MockRecord[]) {
  const seen = new Set<string>();
  const labels: string[] = [];

  for (const record of [...mockRecords].reverse()) {
    if (seen.has(record.label)) {
      continue;
    }

    seen.add(record.label);
    labels.push(record.label);

    if (labels.length >= 3) {
      break;
    }
  }

  return labels;
}
