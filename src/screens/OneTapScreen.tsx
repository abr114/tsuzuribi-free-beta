import { useState, type ChangeEvent } from "react";
import { CheckCircle2, PenLine, RotateCcw } from "lucide-react";
import { PlainSection } from "../components/PlainSection";
import { ScreenStack } from "../components/ScreenStack";
import { SectionLabel } from "../components/SectionLabel";
import {
  createMockRecordDraft,
  evidenceCategoryByItem,
  oneTapCopy,
  recordCategoryByItem,
} from "../data/mockContent";
import {
  getEvidenceDestinationLabel,
  getEvidenceSourceLabel,
} from "../lib/evidenceLanding";
import type { AddMockRecordsResult } from "../storage/mockRecordDeduplication";
import type { CtaHandler, MockRecord, MockRecordDraft } from "../types/content";

type OneTapScreenProps = {
  onAddRecords: (records: MockRecordDraft[]) => AddMockRecordsResult;
  onAction: CtaHandler;
  onViewLastAddedEvidence: () => void;
};

export const ONE_TAP_NOTE_MAX_LENGTH = 80;
export const ONE_TAP_LABEL_MAX_LENGTH = 24;

export function OneTapScreen({
  onAddRecords,
  onAction,
  onViewLastAddedEvidence,
}: OneTapScreenProps) {
  const [picked, setPicked] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [evidenceLabel, setEvidenceLabel] = useState("");
  const [isLabelEdited, setIsLabelEdited] = useState(false);
  const [addResult, setAddResult] = useState<AddMockRecordsResult | null>(null);
  const pickedCategory = picked ? evidenceCategoryByItem[picked] : "";
  const confirmedLabel = picked
    ? sanitizeOneTapEvidenceLabel(evidenceLabel, picked)
    : "";

  const pickItem = (item: string) => {
    setPicked(item);
    setNoteText("");
    setEvidenceLabel(item);
    setIsLabelEdited(false);
    setAddResult(null);
  };

  const updateNoteText = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextNote = event.target.value;
    setNoteText(nextNote);
    setAddResult(null);

    if (picked && !isLabelEdited) {
      setEvidenceLabel(createOneTapEvidenceLabel(picked, nextNote));
    }
  };

  const updateEvidenceLabel = (event: ChangeEvent<HTMLInputElement>) => {
    setEvidenceLabel(event.target.value);
    setIsLabelEdited(true);
    setAddResult(null);
  };

  const addPickedItem = () => {
    if (!picked) {
      return;
    }

    const label = sanitizeOneTapEvidenceLabel(evidenceLabel, picked);
    const category = recordCategoryByItem[picked] ?? "build";
    setEvidenceLabel(label);
    setAddResult(onAddRecords([createMockRecordDraft(label, "manual", category)]));
  };

  const resetSelection = () => {
    setPicked(null);
    setNoteText("");
    setEvidenceLabel("");
    setIsLabelEdited(false);
    setAddResult(null);
  };

  return (
    <ScreenStack>
      <PlainSection
        icon={PenLine}
        title={oneTapCopy.title}
        body={oneTapCopy.body}
      />
      <div className="grid grid-cols-2 gap-2">
        {oneTapCopy.items.map((item) => (
          <button
            className={[
              "min-h-12 rounded-lg border px-3 py-2 text-left text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sage",
              picked === item
                ? "border-sage bg-sage-soft/80 text-ink shadow-soft"
                : "border-paper-line bg-white/75 text-ink-muted hover:bg-paper-soft",
            ].join(" ")}
            key={item}
            onClick={() => pickItem(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>
      {!picked && (
        <div className="rounded-lg border border-white/75 bg-paper-soft/90 p-4 shadow-soft">
          <SectionLabel>{oneTapCopy.pickedTitle}</SectionLabel>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            近いものを選ぶと、どこに残るかを確認してから追加できます。
          </p>
        </div>
      )}
      {picked && !addResult && (
        <div className="rounded-lg border border-sage-soft bg-paper-soft/90 p-4 shadow-soft">
          <SectionLabel>追加前の確認</SectionLabel>
          <p className="mt-3 text-lg font-semibold text-ink">「{picked}」</p>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            {pickedCategory}として残します。
          </p>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-1 text-sm font-medium text-ink">
              任意の一言
              <textarea
                className="min-h-20 w-full resize-none rounded-lg border border-paper-line bg-white/85 px-3 py-2 text-sm font-normal leading-6 text-ink shadow-inner outline-none transition placeholder:text-ink-subtle focus:border-sage focus:ring-2 focus:ring-sage/25"
                maxLength={ONE_TAP_NOTE_MAX_LENGTH}
                onChange={updateNoteText}
                placeholder="例：申請書を1段落直した"
                value={noteText}
              />
            </label>
            <p className="text-xs leading-5 text-ink-muted">
              空欄なら、選んだことだけを残します。
            </p>
            <label className="grid gap-1 text-sm font-medium text-ink">
              保存前の短いラベル
              <input
                className="h-11 w-full rounded-lg border border-paper-line bg-white/90 px-3 text-sm font-normal text-ink shadow-inner outline-none transition placeholder:text-ink-subtle focus:border-sage focus:ring-2 focus:ring-sage/25"
                maxLength={ONE_TAP_LABEL_MAX_LENGTH}
                onChange={updateEvidenceLabel}
                value={evidenceLabel}
              />
            </label>
            <p className="text-xs leading-5 text-ink-muted">
              ここで確認した短いラベルだけを残します。
            </p>
          </div>
          <button
            className="mt-3 flex min-h-11 w-full items-center justify-center rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-[#627760] focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            onClick={addPickedItem}
            type="button"
          >
            この内容で追加する
          </button>
        </div>
      )}
      {addResult && (
        <AddCompleteCard
          addedRecords={addResult.addedRecords}
          duplicateCount={addResult.duplicateCount}
          fallbackLabel={confirmedLabel}
          fallbackCategory={pickedCategory}
          landingRecords={addResult.landingRecords}
          onReset={resetSelection}
          onViewDestination={onViewLastAddedEvidence}
        />
      )}
      <button
        className="rounded-lg border border-paper-line bg-white/75 px-4 py-2 text-sm font-medium text-ink-muted transition hover:bg-paper-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
        onClick={() =>
          onAction({
            action: "navigate",
            label: "追加しないで戻る",
            target: "productAdd",
            variant: "quiet",
          })
        }
        type="button"
      >
        追加しないで戻る
      </button>
    </ScreenStack>
  );
}

export function createOneTapEvidenceLabel(picked: string, note: string) {
  const normalized = normalizeOneTapText(note);

  if (!normalized) {
    return picked;
  }

  return truncateOneTapLabel(normalized);
}

export function sanitizeOneTapEvidenceLabel(label: string, picked: string) {
  return truncateOneTapLabel(normalizeOneTapText(label)) || picked;
}

function normalizeOneTapText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function truncateOneTapLabel(value: string) {
  return Array.from(value).slice(0, ONE_TAP_LABEL_MAX_LENGTH).join("");
}

function AddCompleteCard({
  addedRecords,
  duplicateCount,
  fallbackCategory,
  fallbackLabel,
  landingRecords,
  onReset,
  onViewDestination,
}: {
  addedRecords: MockRecord[];
  duplicateCount: number;
  fallbackCategory: string;
  fallbackLabel: string;
  landingRecords: MockRecord[];
  onReset: () => void;
  onViewDestination: () => void;
}) {
  const addedRecord = addedRecords[0];
  const landingRecord = addedRecord ?? landingRecords[0];
  const label = addedRecord?.label ?? fallbackLabel;
  const categoryLabel = addedRecord?.categoryLabel ?? fallbackCategory;
  const isDuplicateOnly = addedRecords.length === 0 && duplicateCount > 0;

  return (
    <div className="rounded-lg border border-sage bg-sage-soft/80 p-4 shadow-soft">
      <div className="flex items-center gap-2 text-sm font-semibold text-sage">
        <CheckCircle2 className="h-4 w-4" strokeWidth={1.9} />
        {isDuplicateOnly ? "すでにここまでにあります" : "ここまでに追加しました"}
      </div>
      <p className="mt-3 text-lg font-semibold leading-7 text-ink">
        「{label}」
      </p>
      <p className="mt-1 text-sm leading-6 text-ink-muted">
        「{label}」を{categoryLabel}として残しました。
      </p>
      {landingRecord && (
        <div className="mt-3 rounded-lg border border-white/75 bg-white/85 px-3 py-2 text-sm leading-6 text-ink-muted">
          <p>追加元：{getEvidenceSourceLabel(landingRecord.source)}</p>
          <p>見返す場所：{getEvidenceDestinationLabel(landingRecord)}</p>
        </div>
      )}
      <p className="mt-2 text-sm leading-6 text-ink-muted">
        {isDuplicateOnly
          ? "同じ内容は増やさず、ここまでにある記録として扱います。"
          : "この画面に留まったまま追加しました。追加先を見ると、該当カテゴリと根拠一覧を確認できます。"}
      </p>
      <div className="mt-3 grid gap-2">
        <button
          className="flex min-h-11 items-center justify-center rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-[#627760] focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-sage-soft"
          onClick={onViewDestination}
          type="button"
        >
          追加先を見る
        </button>
        <button
          className="flex min-h-10 items-center justify-center gap-2 rounded-lg border border-sage-soft bg-white/80 px-4 py-2 text-sm font-medium text-sage transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
          onClick={onReset}
          type="button"
        >
          <RotateCcw size={15} strokeWidth={1.8} />
          もうひとつ残す
        </button>
      </div>
    </div>
  );
}
