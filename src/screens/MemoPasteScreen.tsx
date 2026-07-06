import { useRef, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  FileText,
} from "lucide-react";
import { PlainSection } from "../components/PlainSection";
import { ScreenStack } from "../components/ScreenStack";
import { SectionLabel } from "../components/SectionLabel";
import { recordCategoryLabels } from "../data/mockContent";
import {
  getEvidenceDestinationLabel,
  getEvidenceSourceLabel,
} from "../lib/evidenceLanding";
import { createMemoPasteRecordDraft } from "../lib/memoPaste/createMemoPasteRecordDraft";
import { parseMemoPasteText } from "../lib/memoPaste/parseMemoPasteText";
import type {
  EditableMemoPasteCandidate,
  MemoPasteRecordDraft,
  MemoPasteCandidate,
  MemoPasteDateChoice,
} from "../lib/memoPaste/memoPasteTypes";
import type { AddMockRecordsResult } from "../storage/mockRecordDeduplication";
import type {
  CalendarImportCategory,
  MockRecord,
  MockRecordDraft,
  RecordCategory,
  UiMode,
} from "../types/content";

type MemoPasteScreenProps = {
  onAddRecords: (records: MockRecordDraft[]) => AddMockRecordsResult;
  onViewLastAddedEvidence: () => void;
  uiMode: UiMode;
};

const memoPastePlaceholder = [
  "6/10 予定確認",
  "6/12 研究メモ整理",
  "6/14 ジム",
  "今日 人に連絡した",
].join("\n");

const reviewSample = [
  "6/10 予定確認",
  "6月12日 研究メモ整理",
  "✅ 資料を読んだ",
  "今日 人に連絡した",
  "ジム",
  "少し休んだ",
].join("\n");

const confidenceLabels = {
  high: "高",
  low: "低",
  medium: "中",
} satisfies Record<MemoPasteCandidate["confidence"], string>;

const categoryOptions = [
  { label: "未来に向き合ったこと", value: "future" },
  { label: "積み上げたこと", value: "build" },
  { label: "自分を整えたこと", value: "care" },
  { label: "戻ってきたこと", value: "return" },
  { label: "保存しない", value: "ignore" },
] satisfies Array<{ label: string; value: CalendarImportCategory }>;

const undatedDateChoiceOptions = [
  { label: "今日として残す", value: "today" },
  { label: "日付なしで残す", value: "none" },
  { label: "保存しない", value: "ignore" },
] satisfies Array<{ label: string; value: MemoPasteDateChoice }>;

export function MemoPasteScreen({
  onAddRecords,
  onViewLastAddedEvidence,
  uiMode,
}: MemoPasteScreenProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [text, setText] = useState("");
  const [items, setItems] = useState<EditableMemoPasteCandidate[]>([]);
  const [message, setMessage] = useState(
    "メモを貼り付けると、保存前の候補をここに表示します。",
  );
  const [addResult, setAddResult] = useState<AddMockRecordsResult | null>(null);
  const selectedCount = items.filter((item) => item.selected && canSaveItem(item))
    .length;
  const hasItems = items.length > 0;

  const reviewCandidates = () => {
    const candidates = parseMemoPasteText(text);
    const editableCandidates = candidates.map(createEditableMemoPasteCandidate);

    setItems(editableCandidates);
    setAddResult(null);
    setMessage(
      editableCandidates.length > 0
        ? `${editableCandidates.length}件の候補を見つけました。保存前に選べます。`
        : "候補にできる行が見つかりませんでした。1行ずつ、残したい予定や行動だけを貼ってください。",
    );
  };

  const updateShortLabel = (id: string, shortLabel: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              shortLabel,
            }
          : item,
      ),
    );
  };

  const updateCategory = (id: string, category: CalendarImportCategory) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              category,
              categoryLabel: isRecordCategory(category)
                ? recordCategoryLabels[category]
                : item.categoryLabel,
              selected: category === "ignore" ? false : item.selected,
            }
          : item,
      ),
    );
  };

  const updateDateChoice = (id: string, dateChoice: MemoPasteDateChoice) => {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id || !item.dateWasAssumed) {
          return item;
        }

        const nextItem = {
          ...item,
          dateChoice,
          dateLabel: getDateLabelForChoice(dateChoice),
        };

        return {
          ...nextItem,
          selected: dateChoice === "ignore" ? false : canSaveItem(nextItem),
        };
      }),
    );
  };

  const toggleSelected = (id: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item,
      ),
    );
  };

  const selectAll = () => {
    setItems((current) =>
      current.map((item) => ({
        ...item,
        selected: canSaveItem(item),
      })),
    );
  };

  const clearSelection = () => {
    setItems((current) => current.map((item) => ({ ...item, selected: false })));
  };

  const focusTextarea = () => {
    textareaRef.current?.focus();
    textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const addAnotherMemo = () => {
    setAddResult(null);
    setItems([]);
    setText("");
    setMessage("メモを貼り付けると、保存前の候補をここに表示します。");
    window.setTimeout(focusTextarea, 0);
  };

  const saveSelected = () => {
    const records = items
      .filter((item) => item.selected && canSaveItem(item))
      .map(createMemoPasteRecordDraft)
      .filter((record): record is MemoPasteRecordDraft => record !== null);

    if (records.length === 0) {
      setMessage("保存する候補を選んでください。");
      return;
    }

    setAddResult(onAddRecords(records));
  };

  return (
    <ScreenStack>
      <PlainSection
        icon={ClipboardList}
        title="メモから見つける"
        body="メモ帳などに書いた予定を貼り付けて、残っていたことの候補にします。貼り付けた原文は保存しません。"
      />

      <section className="rounded-lg border border-white/75 bg-paper-soft/90 p-4 shadow-soft">
        <label className="text-sm font-semibold text-ink" htmlFor="memo-paste">
          予定や行動メモを貼り付ける
        </label>
        <textarea
          className="mt-3 min-h-44 w-full resize-none rounded-lg border border-paper-line bg-white/85 p-3 text-sm leading-6 text-ink outline-none transition placeholder:text-ink-muted/70 focus:border-sage focus:ring-2 focus:ring-sage-soft"
          id="memo-paste"
          onChange={(event) => {
            setText(event.target.value);
            setAddResult(null);
          }}
          placeholder={memoPastePlaceholder}
          ref={textareaRef}
          value={text}
        />
        <p className="mt-2 text-xs leading-5 text-ink-muted">
          1行ずつ候補にします。日付が分からない行は、保存前に確認できます。
        </p>
        <p className="mt-1 text-xs leading-5 text-ink-muted">
          会話ログをそのまま貼ると、関係ない行も混ざることがあります。必要な予定だけ貼ると、見つけやすくなります。
        </p>
        {uiMode === "review" && (
          <button
            className="mt-3 rounded-md border border-paper-line bg-white/75 px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
            onClick={() => setText(reviewSample)}
            type="button"
          >
            サンプルメモを入れる
          </button>
        )}
        <button
          className="mt-4 flex min-h-11 w-full items-center justify-center rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-[#627760] focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-55"
          disabled={text.trim().length === 0}
          onClick={reviewCandidates}
          type="button"
        >
          候補を確認する
        </button>
      </section>

      <section className="rounded-lg border border-white/75 bg-paper-soft/90 p-4 shadow-soft">
        <SectionLabel>保存前確認</SectionLabel>
        <p className="mt-2 text-sm leading-6 text-ink-muted">{message}</p>
        {hasItems && (
          <>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="rounded-md border border-paper-line bg-white/75 px-3 py-1.5 text-xs font-semibold text-ink-muted transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
                onClick={selectAll}
                type="button"
              >
                すべて選ぶ
              </button>
              <button
                className="rounded-md border border-paper-line bg-white/75 px-3 py-1.5 text-xs font-semibold text-ink-muted transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
                onClick={clearSelection}
                type="button"
              >
                すべて外す
              </button>
              <button
                className="rounded-md border border-paper-line bg-white/75 px-3 py-1.5 text-xs font-semibold text-ink-muted transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
                onClick={focusTextarea}
                type="button"
              >
                貼り付け内容を編集する
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <MemoCandidateCard
                  item={item}
                  key={item.id}
                  onCategoryChange={updateCategory}
                  onDateChoiceChange={updateDateChoice}
                  onLabelChange={updateShortLabel}
                  onToggleSelected={toggleSelected}
                />
              ))}
            </div>

            <button
              className="mt-4 flex min-h-11 w-full items-center justify-center rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-[#627760] focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-55"
              disabled={selectedCount === 0}
              onClick={saveSelected}
              type="button"
            >
              選んで保存する
            </button>
          </>
        )}
      </section>

      <section className="rounded-lg border border-sage-soft bg-sage-soft/30 p-4">
        <p className="text-sm font-semibold leading-6 text-ink">
          保存するもの / 保存しないもの
        </p>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          保存するのは、選んだ短いラベル・カテゴリ・日付・追加元だけです。
          貼り付けた原文全体、会話ログ、相手名、場所、元メモ全文は保存しません。
        </p>
      </section>

      {addResult && (
        <MemoPasteCompleteCard
          addedRecords={addResult.addedRecords}
          duplicateCount={addResult.duplicateCount}
          landingRecords={addResult.landingRecords}
          onAddAnother={addAnotherMemo}
          onViewDestination={onViewLastAddedEvidence}
        />
      )}
    </ScreenStack>
  );
}

function MemoCandidateCard({
  item,
  onCategoryChange,
  onDateChoiceChange,
  onLabelChange,
  onToggleSelected,
}: {
  item: EditableMemoPasteCandidate;
  onCategoryChange: (id: string, category: CalendarImportCategory) => void;
  onDateChoiceChange: (id: string, dateChoice: MemoPasteDateChoice) => void;
  onLabelChange: (id: string, shortLabel: string) => void;
  onToggleSelected: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border border-paper-line bg-white/80 p-3 shadow-soft">
      <div className="space-y-3">
        <label
          className="block text-xs font-semibold text-ink"
          htmlFor={`${item.id}-label`}
        >
          保存する候補
        </label>
        <input
          className="w-full rounded-md border border-paper-line bg-white/90 px-3 py-2 text-base font-semibold leading-7 text-ink outline-none transition focus:border-sage focus:ring-2 focus:ring-sage-soft"
          id={`${item.id}-label`}
          onChange={(event) => onLabelChange(item.id, event.target.value)}
          value={item.shortLabel}
        />
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-paper-soft px-2 py-1 text-xs text-ink-muted">
            日付：{item.dateLabel}
          </span>
          <span className={confidenceClass(item.confidence)}>
            確信度 {confidenceLabels[item.confidence]}
          </span>
          <span className="rounded-md bg-paper-soft px-2 py-1 text-xs text-ink-muted">
            追加元：{item.sourceLabel}
          </span>
        </div>
        {item.dateWasAssumed && (
          <fieldset className="rounded-lg border border-paper-line bg-paper-soft/60 p-3">
            <legend className="px-1 text-xs font-semibold text-ink">
              日付がない行の扱い
            </legend>
            <div className="mt-2 grid gap-2">
              {undatedDateChoiceOptions.map((option) => (
                <label
                  className={[
                    "flex min-h-10 items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition",
                    item.dateChoice === option.value
                      ? "border-sage bg-sage-soft/70 text-ink"
                      : "border-paper-line bg-white/75 text-ink-muted",
                  ].join(" ")}
                  key={option.value}
                >
                  <input
                    checked={item.dateChoice === option.value}
                    className="h-4 w-4 shrink-0 border-paper-line text-sage focus:ring-sage"
                    onChange={() => onDateChoiceChange(item.id, option.value)}
                    type="radio"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <label
          className="block text-xs font-semibold text-ink"
          htmlFor={`${item.id}-category`}
        >
          カテゴリ
        </label>
        <select
          className="w-full rounded-md border border-paper-line bg-white/90 px-3 py-2 text-sm text-ink outline-none transition focus:border-sage focus:ring-2 focus:ring-sage-soft"
          id={`${item.id}-category`}
          onChange={(event) =>
            onCategoryChange(
              item.id,
              event.target.value as CalendarImportCategory,
            )
          }
          value={item.category}
        >
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <label className="flex min-h-11 items-center gap-3 rounded-lg border border-sage-soft bg-sage-soft/35 px-3 py-2 text-sm font-semibold text-ink">
          <input
            checked={item.selected}
            className="h-4 w-4 rounded border-paper-line text-sage focus:ring-sage"
            disabled={!canSaveItem(item)}
            onChange={() => onToggleSelected(item.id)}
            type="checkbox"
          />
          保存する
        </label>
        <p className="text-xs leading-5 text-ink-muted">{item.reason}</p>
        {item.note && (
          <p className="rounded-md border border-paper-line bg-white/75 p-2 text-xs leading-5 text-ink-muted">
            {item.note}
          </p>
        )}
      </div>
    </div>
  );
}

function MemoPasteCompleteCard({
  addedRecords,
  duplicateCount,
  landingRecords,
  onAddAnother,
  onViewDestination,
}: {
  addedRecords: MockRecord[];
  duplicateCount: number;
  landingRecords: MockRecord[];
  onAddAnother: () => void;
  onViewDestination: () => void;
}) {
  const displayRecords = addedRecords.length > 0 ? addedRecords : landingRecords;

  return (
    <section className="rounded-lg border border-sage bg-sage-soft/80 p-4 shadow-soft">
      <div className="flex items-center gap-2 text-sm font-semibold text-sage">
        <CheckCircle2 className="h-4 w-4" strokeWidth={1.9} />
        メモから見つけたことを残しました
      </div>
      {displayRecords.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {displayRecords.slice(0, 3).map((record) => (
            <li
              className="rounded-lg border border-white/75 bg-white/85 px-3 py-2 text-sm leading-6 text-ink-muted"
              key={record.id}
            >
              <p className="font-medium text-ink">
                「{record.label}」を{record.categoryLabel}として残しました。
              </p>
              <p className="mt-1 text-xs leading-5">
                追加元：{getEvidenceSourceLabel(record.source)}
              </p>
              <p className="text-xs leading-5">
                見返す場所：{getEvidenceDestinationLabel(record)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-6 text-ink-muted">
          同じ内容がすでに残っていたため、重複追加はしませんでした。
        </p>
      )}
      {duplicateCount > 0 && (
        <p className="mt-2 text-xs leading-5 text-ink-muted">
          重複していた{duplicateCount}件は追加しませんでした。
        </p>
      )}
      <div className="mt-3 grid gap-2">
        <button
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-[#627760] focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-sage-soft"
          onClick={onViewDestination}
          type="button"
        >
          追加先を見る
          <FileText className="h-4 w-4" strokeWidth={1.8} />
        </button>
        <button
          className="flex min-h-10 w-full items-center justify-center rounded-lg border border-sage-soft bg-white/80 px-4 py-2 text-sm font-medium text-sage transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
          onClick={onAddAnother}
          type="button"
        >
          もうひとつ残す
        </button>
      </div>
    </section>
  );
}

function createEditableMemoPasteCandidate(
  candidate: MemoPasteCandidate,
): EditableMemoPasteCandidate {
  return {
    ...candidate,
    originalCategory: candidate.category,
    originalShortLabel: candidate.shortLabel,
    selected: candidate.confidence === "high" && candidate.dateChoice !== "ignore",
  };
}

function canSaveItem(item: EditableMemoPasteCandidate) {
  return (
    item.category !== "ignore" &&
    item.dateChoice !== "ignore" &&
    item.shortLabel.trim().length > 0
  );
}

function getDateLabelForChoice(dateChoice: MemoPasteDateChoice) {
  if (dateChoice === "today") {
    return "今日";
  }

  return "日付なし";
}

function isRecordCategory(category: CalendarImportCategory): category is RecordCategory {
  return category !== "ignore" && category !== "unclassified";
}

function confidenceClass(confidence: EditableMemoPasteCandidate["confidence"]) {
  if (confidence === "high") {
    return "rounded-md bg-sage-soft px-2 py-1 text-xs font-semibold text-sage";
  }

  if (confidence === "medium") {
    return "rounded-md bg-[#fff7ef] px-2 py-1 text-xs font-semibold text-clay";
  }

  return "rounded-md bg-paper-soft px-2 py-1 text-xs font-semibold text-ink-muted";
}
