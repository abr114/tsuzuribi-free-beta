import { useState } from "react";
import { CheckCircle2, LetterText, Trash2 } from "lucide-react";
import { ActionList } from "../components/ActionList";
import { PlainSection } from "../components/PlainSection";
import { ScreenStack } from "../components/ScreenStack";
import { SectionLabel } from "../components/SectionLabel";
import { letterCopy } from "../data/mockContent";
import {
  getEvidenceDestinationLabel,
  getEvidenceSourceLabel,
} from "../lib/evidenceLanding";
import {
  buildLetterMonthGroups,
  formatLetterDateTime,
  formatLetterDateTimeCompact,
  formatLetterMonthEntryDateTime,
  getLetterSourceLabel,
  pickLetterToReceive,
  sortLettersLatestFirst,
  trimLetterPreview,
} from "../lib/letters/letterDisplay";
import type { AddMockRecordsResult } from "../storage/mockRecordDeduplication";
import type {
  CtaHandler,
  CtaItem,
  MockLetter,
  MockLetterDraft,
  MockRecordDraft,
  UiMode,
} from "../types/content";

const maxLetterLength = 500;

type LetterScreenProps = {
  entrySource: Extract<MockLetter["source"], "letter" | "hard-time">;
  mockLetters: MockLetter[];
  onAction: CtaHandler;
  onDeleteLetter: (id: string) => void;
  onSaveLetter: (
    letter: MockLetterDraft,
    record: MockRecordDraft,
  ) => AddMockRecordsResult;
  onViewLastAddedEvidence: () => void;
  uiMode: UiMode;
};

export function LetterScreen({
  entrySource,
  mockLetters,
  onAction,
  onDeleteLetter,
  onSaveLetter,
  onViewLastAddedEvidence,
  uiMode,
}: LetterScreenProps) {
  const [body, setBody] = useState("");
  const [saveResult, setSaveResult] = useState<AddMockRecordsResult | null>(
    null,
  );
  const trimmedBody = body.trim();
  const showEmptyHint = trimmedBody.length === 0;
  const primaryCtaLabel =
    uiMode === "product"
      ? "一文だけ置いておく"
      : "手紙を残す";
  const letterBody =
    uiMode === "product"
      ? `${letterCopy.body} あとで見返すこともできます。`
      : letterCopy.body;
  const ctas = createLetterCtas(primaryCtaLabel);
  const savedRecord =
    saveResult?.addedRecords[0] ?? saveResult?.landingRecords[0] ?? null;

  const handleAction: CtaHandler = (cta) => {
    if (cta.action === "navigate" && cta.target === "home") {
      if (cta.label === primaryCtaLabel && trimmedBody.length === 0) {
        return;
      }

      if (cta.label === primaryCtaLabel) {
        const result = onSaveLetter(
          {
            body: trimmedBody,
            createdAt: Date.now(),
            createdAtLabel: "",
            isPinned: false,
            source: entrySource,
            visibility: "private",
          },
          {
            label: letterCopy.savedRecordLabel,
            category: "care",
            categoryLabel: "自分を整えた日の証拠",
            source: "letter",
            dateLabel: "今日",
          },
        );

        setSaveResult(result);
        setBody("");
        return;
      }

      onAction(cta);
      return;
    }

    onAction(cta);
  };

  return (
    <ScreenStack>
      <PlainSection
        icon={LetterText}
        title={letterCopy.title}
        body={letterBody}
      />

      <div className="rounded-lg border border-white/75 bg-paper-soft/90 p-4 shadow-soft">
        <SectionLabel>書く前の小さな問いかけ</SectionLabel>
        <ul className="space-y-2 text-sm leading-6 text-ink-muted">
          {letterCopy.prompts.map((prompt) => (
            <li key={prompt}>・{prompt}</li>
          ))}
        </ul>
      </div>

      <div>
        <label className="text-sm font-semibold text-ink" htmlFor="letter-body">
          今の自分から、あとで読む自分へ
        </label>
        <textarea
          className="mt-2 min-h-40 w-full resize-none rounded-lg border border-paper-line bg-white/80 p-3 text-sm leading-6 text-ink outline-none transition placeholder:text-ink-muted/70 focus:border-sage focus:ring-2 focus:ring-sage-soft"
          id="letter-body"
          maxLength={maxLetterLength}
          onChange={(event) => {
            setBody(event.target.value);
            setSaveResult(null);
          }}
          placeholder={letterCopy.placeholder}
          value={body}
        />
        <div className="mt-2 flex items-center justify-between gap-3 text-xs leading-5 text-ink-muted">
          <span>{showEmptyHint ? letterCopy.emptyHint : "このまま残せます。"}</span>
          <span>
            {body.length} / {maxLetterLength}
          </span>
        </div>
      </div>

      <ActionList ctas={ctas} onAction={handleAction} />
      {saveResult && (
        <div className="rounded-lg border border-sage bg-sage-soft/80 p-4 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-semibold text-sage">
            <CheckCircle2 className="h-4 w-4" strokeWidth={1.9} />
            ここまでに残しました
          </div>
          <p className="mt-3 text-sm leading-6 text-ink-muted">
            手紙は上書きせず、あとで読み返せる一文としてこの端末に残しました。
          </p>
          {savedRecord && (
            <div className="mt-2 rounded-lg border border-white/75 bg-white/85 px-3 py-2 text-sm leading-6 text-ink-muted">
              <p className="font-medium text-ink">
                「{savedRecord.label}」を
                {savedRecord.categoryLabel}として残しました。
              </p>
              <p className="mt-1 text-xs leading-5">
                追加元：{getEvidenceSourceLabel(savedRecord.source)}
              </p>
              <p className="text-xs leading-5">
                見返す場所：{getEvidenceDestinationLabel(savedRecord)}
              </p>
            </div>
          )}
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            追加先を見ると、手紙と該当カテゴリの根拠一覧を確認できます。
          </p>
          <button
            className="mt-3 flex min-h-11 w-full items-center justify-center rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-[#627760] focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-sage-soft"
            onClick={onViewLastAddedEvidence}
            type="button"
          >
            追加先を見る
          </button>
        </div>
      )}

      <LetterHistory letters={mockLetters} onDeleteLetter={onDeleteLetter} />
    </ScreenStack>
  );
}

function createLetterCtas(primaryLabel: string) {
  return [
    {
      action: "navigate",
      label: primaryLabel,
      target: "home",
      variant: "primary",
    },
    letterCopy.ctas[1],
  ] satisfies CtaItem[];
}

function LetterHistory({
  letters,
  onDeleteLetter,
}: {
  letters: MockLetter[];
  onDeleteLetter: (id: string) => void;
}) {
  const featuredLetter = pickLetterToReceive(letters);
  const latestFive = sortLettersLatestFirst(letters).slice(0, 5);
  const monthGroups = buildLetterMonthGroups(letters);

  return (
    <section className="rounded-lg border border-white/75 bg-paper-soft/90 p-4 shadow-soft">
      <SectionLabel>前の自分からの一文</SectionLabel>
      {featuredLetter ? (
        <div className="mt-3 space-y-5">
          <section className="rounded-lg border border-sage-soft bg-white/85 px-3 py-3">
            <p className="text-xs font-semibold leading-5 text-sage">
              今日受け取る一文
            </p>
            <p className="mt-2 text-base font-semibold leading-7 text-ink">
              {trimLetterPreview(featuredLetter.body, 120)}
            </p>
            <p className="mt-2 text-xs leading-5 text-ink-muted">
              {formatLetterDateTime(featuredLetter)}
            </p>
            <p className="mt-0.5 text-xs leading-5 text-ink-muted">
              {getLetterSourceLabel(featuredLetter.source)}
            </p>
          </section>

          <section>
            <h3 className="text-sm font-semibold leading-6 text-ink">
              最近の一文
            </h3>
            <ul className="mt-2 space-y-2">
              {latestFive.map((letter) => (
                <li
                  className="rounded-lg border border-paper-line bg-white/80 px-3 py-3"
                  key={letter.id}
                >
                  <p className="text-sm font-semibold leading-6 text-ink">
                    {trimLetterPreview(letter.body, 86)}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-ink-muted">
                    {formatLetterDateTimeCompact(letter)}
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-ink-muted">
                    {getLetterSourceLabel(letter.source)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-semibold leading-6 text-ink">
              月ごとの一文
            </h3>
            <div className="mt-2 space-y-2">
              {monthGroups.map((group, index) => (
                <details
                  className="rounded-lg border border-paper-line bg-white/80 px-3 py-2"
                  key={group.id}
                  open={group.isCurrentMonth || index === 0}
                >
                  <summary className="cursor-pointer select-none py-1 text-sm font-semibold leading-6 text-ink">
                    {group.label}
                    <span className="ml-2 text-xs font-medium text-ink-muted">
                      {group.count}件
                    </span>
                  </summary>
                  <ul className="mt-2 divide-y divide-paper-line/70">
                    {group.letters.map((letter) => (
                      <li
                        className="flex items-start justify-between gap-3 py-3"
                        key={letter.id}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold leading-6 text-ink">
                            {trimLetterPreview(letter.body, 92)}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-ink-muted">
                            {formatLetterMonthEntryDateTime(letter)}
                          </p>
                          <p className="mt-0.5 text-xs leading-5 text-ink-muted">
                            {getLetterSourceLabel(letter.source)}
                          </p>
                        </div>
                        <button
                          aria-label="この一文を削除する"
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-transparent bg-transparent text-ink-muted/70 transition hover:border-paper-line hover:bg-[#fff7ef] hover:text-clay focus:outline-none focus-visible:ring-2 focus-visible:ring-clay"
                          onClick={() => onDeleteLetter(letter.id)}
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="mt-3 rounded-lg border border-paper-line bg-white/75 px-3 py-3">
          <p className="text-sm font-semibold leading-6 text-ink">
            まだ一文は残っていません。
          </p>
          <p className="mt-1 text-sm leading-6 text-ink-muted">
            書ける時だけ、あとで読む自分へ短く置いておけます。
          </p>
        </div>
      )}
    </section>
  );
}
