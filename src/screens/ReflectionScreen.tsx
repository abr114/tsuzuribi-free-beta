import { useState } from "react";
import { CalendarDays, Check, CheckCircle2, RotateCcw } from "lucide-react";
import { ActionList } from "../components/ActionList";
import { PlainSection } from "../components/PlainSection";
import { ScreenStack } from "../components/ScreenStack";
import { SectionLabel } from "../components/SectionLabel";
import {
  createMockRecordDraft,
  evidenceCategoryByItem,
  reflectionCopy,
} from "../data/mockContent";
import {
  getEvidenceDestinationLabel,
  getEvidenceSourceLabel,
} from "../lib/evidenceLanding";
import type { AddMockRecordsResult } from "../storage/mockRecordDeduplication";
import type { CtaHandler, CtaItem, MockRecordDraft } from "../types/content";

type ReflectionScreenProps = {
  onAddRecords: (records: MockRecordDraft[]) => AddMockRecordsResult;
  onAction: CtaHandler;
  onViewLastAddedEvidence: () => void;
};

export function ReflectionScreen({
  onAddRecords,
  onAction,
  onViewLastAddedEvidence,
}: ReflectionScreenProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [addResult, setAddResult] = useState<AddMockRecordsResult | null>(null);
  const primaryLabel =
    selected.length > 0
      ? `${selected.length}つの記録でここまでを作る`
      : "ここまでを作る";
  const ctas = reflectionCopy.ctas.map((cta, index) =>
    index === 0 ? { ...cta, label: primaryLabel } : cta,
  ) satisfies CtaItem[];

  const toggleItem = (item: string) => {
    setAddResult(null);
    setSelected((current) =>
      current.includes(item)
        ? current.filter((value) => value !== item)
        : [...current, item],
    );
  };

  const handleAction: CtaHandler = (cta) => {
    if (cta.action === "navigate" && cta.target === "home") {
      if (selected.length === 0) {
        return;
      }

      setAddResult(
        onAddRecords(
          selected.map((item) => createMockRecordDraft(item, "reflection")),
        ),
      );
      return;
    }

    onAction(cta);
  };

  return (
    <ScreenStack>
      <PlainSection
        icon={CalendarDays}
        title={reflectionCopy.title}
        body={reflectionCopy.body}
      />
      <div className="grid grid-cols-2 gap-2">
        {reflectionCopy.items.map((item) => {
          const isSelected = selected.includes(item);

          return (
            <button
              className={[
              "flex min-h-12 items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sage",
              isSelected
                  ? "border-sage bg-sage-soft/80 text-ink shadow-soft"
                  : "border-paper-line bg-white/75 text-ink-muted hover:bg-paper-soft",
              ].join(" ")}
              key={item}
              onClick={() => toggleItem(item)}
              type="button"
            >
              <span
                className={[
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                  isSelected
                    ? "border-sage bg-sage text-white"
                    : "border-paper-line bg-white",
                ].join(" ")}
              >
                {isSelected && <Check size={13} strokeWidth={2.4} />}
              </span>
              {item}
            </button>
          );
        })}
      </div>
      <div className="rounded-lg border border-white/75 bg-paper-soft/90 p-4 shadow-soft">
        <SectionLabel>選んだこと</SectionLabel>
        {selected.length > 0 ? (
          <ul className="space-y-2 text-sm leading-6 text-ink-muted">
            {selected.map((item) => (
              <li
                className="rounded-lg border border-paper-line bg-white/75 px-3 py-2"
                key={item}
              >
                <span className="font-medium text-ink">{item}</span>
                <span className="mx-2 text-ink-muted">→</span>
                <span>{evidenceCategoryByItem[item]}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm leading-6 text-ink-muted">
            選ぶと、どの記録として扱うかここに表示されます。
          </p>
        )}
      </div>
      {addResult && (
        <div className="rounded-lg border border-sage bg-sage-soft/80 p-4 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-semibold text-sage">
            <CheckCircle2 className="h-4 w-4" strokeWidth={1.9} />
            {addResult.addedCount > 0
              ? `${addResult.addedCount}件をここまでに追加しました`
              : "すでにここまでにあります"}
          </div>
          {(addResult.addedRecords.length > 0 ||
            addResult.landingRecords.length > 0) && (
            <>
              <p className="mt-3 text-sm leading-6 text-ink-muted">
                「{getReflectionDisplayRecords(addResult)[0].label}」を
                {getReflectionDisplayRecords(addResult)[0].categoryLabel}として残しました。
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-ink-muted">
                {getReflectionDisplayRecords(addResult)
                  .slice(0, 4)
                  .map((record) => (
                  <li
                    className="rounded-lg border border-white/75 bg-white/85 px-3 py-2"
                    key={record.id}
                  >
                    <p className="font-medium text-ink">{record.label}</p>
                    <p className="mt-1 text-xs leading-5">
                      追加先：{record.categoryLabel}
                    </p>
                    <p className="text-xs leading-5">
                      追加元：{getEvidenceSourceLabel(record.source)}
                    </p>
                    <p className="text-xs leading-5">
                      見返す場所：{getEvidenceDestinationLabel(record)}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
          {addResult.duplicateCount > 0 && (
            <p className="mt-2 text-xs leading-5 text-ink-muted">
              すでにある{addResult.duplicateCount}件は増やさずに扱います。
            </p>
          )}
          <p className="mt-3 text-sm leading-6 text-ink-muted">
            {addResult.addedCount > 0
              ? "この画面に留まったまま追加しました。追加先を見ると、該当カテゴリと根拠一覧を確認できます。"
              : "同じ内容は増やさず、ここまでにある記録として扱います。"}
          </p>
          <div className="mt-3 grid gap-2">
            <button
              className="flex min-h-11 items-center justify-center rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-[#627760] focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-sage-soft"
              onClick={onViewLastAddedEvidence}
              type="button"
            >
              追加先を見る
            </button>
            <button
              className="flex min-h-10 items-center justify-center gap-2 rounded-lg border border-sage-soft bg-white/80 px-4 py-2 text-sm font-medium text-sage transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
              onClick={() => {
                setSelected([]);
                setAddResult(null);
              }}
              type="button"
            >
              <RotateCcw size={15} strokeWidth={1.8} />
              もう少し選び直す
            </button>
          </div>
        </div>
      )}
      <ActionList ctas={ctas} onAction={handleAction} />
    </ScreenStack>
  );
}

function getReflectionDisplayRecords(result: AddMockRecordsResult) {
  return result.addedRecords.length > 0
    ? result.addedRecords
    : result.landingRecords;
}
