import { useEffect, useRef, useState } from "react";
import { mockRecordSourceLabels } from "../data/mockContent";
import { getEvidenceDestinationLabel } from "../lib/evidenceLanding";
import type {
  CountTone,
  EvidenceCount,
  LastAddedEvidence,
  LastAddedEvidenceItem,
  MockRecord,
  RecordCategory,
} from "../types/content";
import { SectionLabel } from "./SectionLabel";

const reviewToneClasses: Record<CountTone, string> = {
  sage: "border-sage-soft bg-sage-soft/70 text-sage",
  clay: "border-orange-100 bg-orange-50 text-clay",
  blue: "border-mist-blue bg-mist-blue/80 text-slate-600",
  gray: "border-warm-gray bg-warm-gray/80 text-ink-muted",
};

const productToneClasses: Record<CountTone, string> = {
  sage: "border-[#b9d2af] bg-[#dbead4] text-[#415f45]",
  clay: "border-[#e7bfa9] bg-[#ffe7d4] text-[#83533f]",
  blue: "border-[#bdd6dc] bg-[#d9edf0] text-[#405f68]",
  gray: "border-[#d0c1ad] bg-[#e6ddcf] text-[#51483f]",
};

type CountGridProps = {
  counts: EvidenceCount[];
  focusedEvidenceId?: string | null;
  lastAddedEvidence?: LastAddedEvidence | null;
  productDescription?: string;
  variant?: "review" | "product";
};

export function CountGrid({
  counts,
  focusedEvidenceId = null,
  lastAddedEvidence = null,
  productDescription = "数字は目安として、残っていた跡を見返します。",
  variant = "review",
}: CountGridProps) {
  const [activeLabel, setActiveLabel] = useState("");
  const handledFocusIdRef = useRef<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isProduct = variant === "product";
  const toneClasses = isProduct ? productToneClasses : reviewToneClasses;
  const activeCount = counts.find((count) => count.label === activeLabel);
  const activeNewItems = activeCount
    ? getNewItemsForCategory(lastAddedEvidence, activeCount.category)
    : [];
  const newRecordIds = new Set(
    lastAddedEvidence?.items.map((item) => item.id) ?? [],
  );

  useEffect(() => {
    if (
      !focusedEvidenceId ||
      !lastAddedEvidence ||
      handledFocusIdRef.current === focusedEvidenceId
    ) {
      return;
    }

    const targetCategory = lastAddedEvidence.items[0]?.category;
    const targetCount = counts.find((count) => count.category === targetCategory);

    if (!targetCount) {
      return;
    }

    handledFocusIdRef.current = focusedEvidenceId;
    setActiveLabel(targetCount.label);

    window.setTimeout(() => {
      const target = cardRefs.current[targetCount.label];
      const reduceMotion = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      target?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
      });
    }, 0);
  }, [counts, focusedEvidenceId, lastAddedEvidence]);

  return (
    <section
      className={
        isProduct
          ? "rounded-[20px] border border-white/80 bg-paper-soft p-5 shadow-soft"
          : ""
      }
    >
      {isProduct ? (
        <div className="flex items-start justify-between gap-3">
          <div>
            <SectionLabel>ここまでに残っていたこと</SectionLabel>
            <p className="text-sm leading-6 text-ink-muted">
              {productDescription}
            </p>
          </div>
          <span className="shrink-0 rounded-md border border-paper-line bg-white/75 px-2.5 py-1 text-sm text-ink-muted">
            直近30日
          </span>
        </div>
      ) : (
        <SectionLabel>ここまでに残っていたこと</SectionLabel>
      )}
      <div
        className={
          isProduct
            ? "mt-4 grid grid-cols-2 gap-3 min-[1100px]:grid-cols-4"
            : "grid grid-cols-2 gap-3"
        }
      >
        {counts.map((count) => {
          const newItems = getNewItemsForCategory(
            lastAddedEvidence,
            count.category,
          );
          const isSoftProductValue =
            isProduct && (count.value === "—" || count.value === "0日");

          return (
            <div
              className={[
                isProduct
                  ? "min-h-[148px] rounded-[18px] border px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.76),0_12px_24px_rgba(58,48,36,0.06)]"
                  : "min-h-[124px] rounded-lg border p-3",
                toneClasses[count.tone],
                newItems.length > 0 ? "shadow-soft ring-1 ring-sage-soft" : "",
              ].join(" ")}
              key={count.label}
              ref={(node) => {
                cardRefs.current[count.label] = node;
              }}
            >
              <p
                className={
                  isProduct
                    ? "text-[0.92rem] font-bold leading-6"
                    : "text-xs leading-5"
                }
              >
                {count.label}
              </p>
              <p
                className={
                  isProduct
                    ? [
                        "mt-3 font-semibold leading-tight tracking-normal",
                        isSoftProductValue
                          ? "text-[2rem] text-ink-muted"
                          : "text-[2.25rem] text-ink",
                      ].join(" ")
                    : "mt-3 text-2xl font-semibold tracking-normal"
                }
              >
                <span aria-hidden={count.valueAssistiveLabel ? "true" : undefined}>
                  {count.value}
                </span>
                {count.valueAssistiveLabel && (
                  <span className="sr-only">{count.valueAssistiveLabel}</span>
                )}
              </p>
              {newItems.length > 0 && (
                <p className="mt-2 text-sm leading-6 text-ink">
                  <span className="mr-1 rounded-md border border-sage-soft bg-white/80 px-1.5 py-0.5 text-[0.62rem] font-semibold leading-none text-sage">
                    今回追加
                  </span>
                  {formatNewItemLabels(newItems)}
                </p>
              )}
              {count.basis && (
                <button
                  className={
                    isProduct
                      ? "mt-4 rounded-md border border-current/25 bg-white/60 px-3 py-1.5 text-sm font-semibold transition hover:bg-white/[0.85] focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
                      : "mt-3 rounded-md border border-current/20 bg-white/45 px-2 py-1 text-xs transition hover:bg-white/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
                  }
                  onClick={() =>
                    setActiveLabel((current) =>
                      current === count.label ? "" : count.label,
                    )
                  }
                  type="button"
                >
                  {getBasisButtonLabel(
                    activeLabel === count.label,
                    newItems.length,
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
      {activeCount?.basis && (
        <div
          className={
            isProduct
              ? "mt-4 rounded-[16px] border border-paper-line bg-white/85 p-4 text-[0.95rem] leading-7 text-ink-muted"
              : "mt-3 rounded-lg border border-paper-line bg-white/75 p-4 text-sm leading-6 text-ink-muted"
          }
        >
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-ink">{activeCount.label}の根拠</p>
            {activeNewItems.length > 0 && (
              <span className="rounded-md border border-sage-soft bg-sage-soft/45 px-2 py-0.5 text-sm font-semibold text-sage">
                今回追加
              </span>
            )}
          </div>
          {activeNewItems.length > 0 && (
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              追加先は「{activeCount.label}」。{formatNewItemLabels(activeNewItems)}
              がここに入りました。
            </p>
          )}
          {activeNewItems.length > 0 && (
            <div className="mt-3 rounded-lg border border-sage-soft bg-sage-soft/35 p-3">
              <p className="text-sm font-semibold text-sage">
                今回追加されたこと
              </p>
              <ul className="mt-2 space-y-2">
                {activeNewItems.map((item) => (
                  <li
                    className="rounded-lg border border-paper-line bg-white/80 px-3 py-2"
                    key={item.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-medium text-ink">
                        {item.date}　{item.label}
                      </span>
                      <span className="shrink-0 rounded-md border border-sage-soft bg-white/85 px-1.5 py-0.5 text-[0.62rem] font-semibold leading-none text-sage">
                        今回追加
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-ink-muted">
                      {item.sourceLabel}から追加
                    </p>
                    <p className="text-sm leading-6 text-ink-muted">
                      見返す場所：{getEvidenceDestinationLabel(item)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <dl className="mt-3 space-y-2">
            <div>
              <dt className="text-sm font-semibold text-ink">集計期間</dt>
              <dd>{activeCount.basis.period}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-ink">数え方</dt>
              <dd>{activeCount.basis.countingRule}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-ink">元データ</dt>
              <dd>{activeCount.basis.sources.join(" / ")}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-ink">
                {activeNewItems.length > 0 ? "これまでの根拠" : "例"}
              </dt>
              <dd>
                <ul className="space-y-1">
                  {activeCount.basis.examples.map((example) => (
                    <li key={example}>{example}</li>
                  ))}
                  {getExistingMockRecords(
                    activeCount.basis.mockRecords,
                    newRecordIds,
                  ).map((record) => (
                    <li key={record.id}>
                      {record.dateLabel}　{record.label}　
                      {mockRecordSourceLabels[record.source]}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-ink">分類理由</dt>
              <dd>{activeCount.basis.reason}</dd>
            </div>
          </dl>
        </div>
      )}
    </section>
  );
}

function getNewItemsForCategory(
  evidence: LastAddedEvidence | null,
  category?: RecordCategory,
) {
  if (!evidence || !category) {
    return [];
  }

  return evidence.items.filter((item) => item.category === category);
}

function formatNewItemLabels(items: LastAddedEvidenceItem[]) {
  const labels = items.map((item) => item.label);
  const visible = labels.slice(0, 2).join("、");

  return labels.length > 2 ? `${visible} ほか${labels.length - 2}件` : visible;
}

function getBasisButtonLabel(isActive: boolean, newItemCount: number) {
  if (isActive) {
    return "閉じる";
  }

  return newItemCount > 0
    ? `根拠を見る　今回追加${newItemCount}件`
    : "根拠を見る";
}

function getExistingMockRecords(
  records: MockRecord[] | undefined,
  newRecordIds: Set<string>,
) {
  return (records ?? []).filter((record) => !newRecordIds.has(record.id));
}
