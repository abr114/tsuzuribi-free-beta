import { useState } from "react";
import {
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Heart,
  LetterText,
  PenLine,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ActionList } from "../components/ActionList";
import { CountGrid } from "../components/CountGrid";
import { EvidenceStrip } from "../components/EvidenceStrip";
import { LetterHero } from "../components/LetterHero";
import { ScreenStack } from "../components/ScreenStack";
import { SectionLabel } from "../components/SectionLabel";
import { brandName, homeCopy, mockRecordSourceLabels } from "../data/mockContent";
import {
  formatLetterDateTime,
  getLetterSourceLabel,
  pickLetterToReceive,
  trimLetterPreview,
} from "../lib/letters/letterDisplay";
import type {
  CtaHandler,
  EvidenceCount,
  LastAddedEvidence,
  MockLetter,
  MockRecord,
  RecordCategory,
  UiMode,
} from "../types/content";

type HomeScreenProps = {
  focusedEvidenceId?: string | null;
  hasCheckedEvidence: boolean;
  lastAddedEvidence?: LastAddedEvidence | null;
  mockLetters: MockLetter[];
  mockRecords: MockRecord[];
  onClearPrototypeData: () => void;
  onAction: CtaHandler;
  uiMode: UiMode;
};

export function HomeScreen({
  focusedEvidenceId = null,
  hasCheckedEvidence,
  lastAddedEvidence = null,
  mockLetters,
  mockRecords,
  onClearPrototypeData,
  onAction,
  uiMode,
}: HomeScreenProps) {
  const [showMoreEvidence, setShowMoreEvidence] = useState(false);
  const MoreEvidenceIcon = showMoreEvidence ? ChevronUp : ChevronDown;
  const productEvidenceState = getProductEvidenceState(
    mockRecords.length,
    hasCheckedEvidence,
  );
  const productCounts = buildProductHomeCounts(
    mockRecords,
    productEvidenceState,
  );
  const reviewCounts = buildReviewHomeCounts(mockRecords);
  const reviewExtraEvidenceGroups = buildExtraEvidenceGroups(mockRecords);
  const todayAddedRecordGroups = buildTodayAddedRecordGroups(mockRecords);
  const hasPrototypeData = mockRecords.length > 0 || mockLetters.length > 0;
  const reviewLetter = pickLetterToReceive(mockLetters);

  if (uiMode === "product") {
    return (
      <ProductHomeView
        counts={productCounts}
        evidenceState={productEvidenceState}
        focusedEvidenceId={focusedEvidenceId}
        hasPrototypeData={hasPrototypeData}
        lastAddedEvidence={lastAddedEvidence}
        mockLetters={mockLetters}
        mockRecords={mockRecords}
        onAction={onAction}
        onClearPrototypeData={onClearPrototypeData}
        todayAddedRecordGroups={todayAddedRecordGroups}
      />
    );
  }

  return (
    <ScreenStack>
      <LetterHero
        eyebrow={brandName}
        icon={LetterText}
        title={homeCopy.title}
        body={homeCopy.body}
      />
      <CountGrid
        counts={reviewCounts}
        focusedEvidenceId={focusedEvidenceId}
        lastAddedEvidence={lastAddedEvidence}
        variant="product"
      />
      {hasPrototypeData && (
        <div className="rounded-lg border border-paper-line bg-paper-soft p-3">
          <p className="text-xs leading-5 text-ink-muted">
            この端末のブラウザ内に保存されています。別の端末やブラウザには移りません。
          </p>
          <button
            className="mt-2 rounded-md border border-paper-line bg-white/70 px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
            onClick={onClearPrototypeData}
            type="button"
          >
            この端末の記録を消す
          </button>
        </div>
      )}
      {reviewLetter && (
        <div className="rounded-lg border border-paper-line bg-white/75 p-4">
          <SectionLabel>前の自分からの一文</SectionLabel>
          <div className="rounded-lg border border-paper-line bg-paper-soft px-3 py-2 text-sm leading-6 text-ink-muted">
            <p className="font-medium leading-6 text-ink">
              {trimLetterPreview(reviewLetter.body, 70)}
            </p>
            <p className="mt-1 text-xs leading-5">
              {formatLetterDateTime(reviewLetter)}
            </p>
            <p className="mt-0.5 text-xs leading-5">
              {getLetterSourceLabel(reviewLetter.source)}
            </p>
          </div>
          <p className="mt-3 text-xs leading-5 text-ink-muted">
            この一文は、この端末のブラウザ内に保存されています。
          </p>
        </div>
      )}
      {mockRecords.length > 0 && (
        <div className="rounded-lg border border-sage-soft bg-white/75 p-4">
          <SectionLabel>今回追加したこと</SectionLabel>
          <ul className="space-y-2 text-sm leading-6 text-ink-muted">
            {todayAddedRecordGroups.map((record) => (
              <li
                className="rounded-lg border border-paper-line bg-paper-soft px-3 py-2"
                key={record.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-medium text-ink">
                    {record.label}
                    {record.count > 1 && (
                      <span className="ml-2 text-xs text-ink-muted">
                        {record.count}件
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-xs text-ink-muted">
                    {mockRecordSourceLabels[record.source]}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5">{record.categoryLabel}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-5 text-ink-muted">
            今回追加した記録は、この端末のブラウザ内に保存されています。
          </p>
        </div>
      )}
      <div>
        <EvidenceStrip labels={homeCopy.evidenceLabels} />
        <button
          className="mt-3 flex min-h-10 w-full items-center justify-between rounded-lg border border-paper-line bg-white/75 px-3 py-2 text-left text-sm text-ink-muted transition hover:bg-paper-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
          onClick={() => setShowMoreEvidence((current) => !current)}
          type="button"
        >
          <span>
            {showMoreEvidence
              ? "ほかに残っていたことを閉じる"
              : "ほかに残っていたことを見る"}
          </span>
          <MoreEvidenceIcon size={16} strokeWidth={1.8} />
        </button>
        {showMoreEvidence && (
          <div className="mt-3">
            <SectionLabel>ほかに残っていたこと</SectionLabel>
            <div className="space-y-3 rounded-lg border border-paper-line bg-white/70 p-4">
              {reviewExtraEvidenceGroups.map((group) => (
                <section key={group.title}>
                  <h3 className="text-sm font-semibold text-ink">
                    {group.title}
                  </h3>
                  <ul className="mt-2 space-y-1.5 text-sm leading-6 text-ink-muted">
                    {group.items.map((item) => (
                      <li
                        className="flex items-center justify-between border-b border-paper-line/70 pb-1 last:border-b-0 last:pb-0"
                        key={item.label}
                      >
                        <span>{item.label}</span>
                        <span className="text-xs font-medium text-ink">
                          {item.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        )}
      </div>
      <ActionList ctas={homeCopy.ctas} onAction={onAction} />
      <div className="rounded-lg border border-paper-line bg-white/70 p-4 text-sm leading-6 text-ink-muted">
        {homeCopy.closingLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </ScreenStack>
  );
}

type ProductHomeViewProps = {
  counts: EvidenceCount[];
  evidenceState: ProductEvidenceState;
  focusedEvidenceId: string | null;
  hasPrototypeData: boolean;
  lastAddedEvidence: LastAddedEvidence | null;
  mockLetters: MockLetter[];
  mockRecords: MockRecord[];
  onAction: CtaHandler;
  onClearPrototypeData: () => void;
  todayAddedRecordGroups: TodayAddedRecordGroup[];
};

function ProductHomeView({
  counts,
  evidenceState,
  focusedEvidenceId,
  hasPrototypeData,
  lastAddedEvidence,
  mockLetters,
  mockRecords,
  onAction,
  onClearPrototypeData,
  todayAddedRecordGroups,
}: ProductHomeViewProps) {
  return (
    <div className="space-y-6">
      <ProductIntroCard evidenceState={evidenceState} onAction={onAction} />

      <CountGrid
        counts={counts}
        focusedEvidenceId={focusedEvidenceId}
        lastAddedEvidence={lastAddedEvidence}
        productDescription={getProductCountDescription(evidenceState)}
        variant="product"
      />

      {evidenceState !== "hasRecords" && (
        <ProductEvidenceCtas onAction={onAction} />
      )}

      <ProductTodayAdded
        lastAddedEvidence={lastAddedEvidence}
        records={todayAddedRecordGroups}
      />

      <ProductLetterCard letters={mockLetters} onAction={onAction} />

      {hasPrototypeData && (
        <div className="rounded-[18px] border border-paper-line bg-paper-soft/85 p-4">
          <p className="text-sm leading-6 text-ink-muted">
            記録と手紙は、この端末に残っています。
          </p>
          <button
            className="mt-3 min-h-11 rounded-full border border-paper-line bg-white/75 px-4 py-2 text-sm font-semibold text-ink-muted transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
            onClick={onClearPrototypeData}
            type="button"
          >
            この端末の記録を消す
          </button>
        </div>
      )}

      <div className="rounded-[18px] border border-paper-line bg-white/75 p-5 text-base leading-8 text-ink-muted">
        {homeCopy.closingLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}

export type ProductEvidenceState =
  | "unchecked"
  | "checkedEmpty"
  | "hasRecords";

function ProductIntroCard({
  evidenceState,
  onAction,
}: {
  evidenceState: ProductEvidenceState;
  onAction: CtaHandler;
}) {
  return (
    <section className="overflow-hidden rounded-[22px] border border-white/80 bg-paper-soft p-5 shadow-paper">
      <div>
        <p className="text-sm font-semibold text-sage">{brandName}</p>
        <h2 className="mt-3 text-[1.85rem] font-semibold leading-[1.35] tracking-normal text-ink min-[1100px]:text-[2.05rem]">
          {getProductIntroTitle(evidenceState)}
        </h2>
        <p className="mt-3 text-base leading-8 text-ink-muted">
          今日は見るだけでも大丈夫です。
          <br />
          残せそうなら、ひとつだけ置いていけます。
        </p>
        <div className="mt-5 space-y-3">
          <button
            className="inline-flex min-h-12 max-w-full items-center justify-center gap-2 rounded-full bg-deep-green px-5 py-3 text-base font-semibold leading-tight text-white shadow-soft transition hover:bg-[#345d49] focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
            onClick={() =>
              onAction({
                action: "navigate",
                label: "今日のことをひとつ残す",
                target: "productAdd",
                variant: "primary",
              })
            }
            type="button"
          >
            <PenLine className="h-4 w-4" strokeWidth={1.9} />
            今日のことをひとつ残す
          </button>
          <div className="flex flex-wrap gap-2">
            <ProductIntroSubLink
              icon={CalendarCheck}
              label="予定から見つける"
              onClick={() =>
                onAction({
                  action: "navigate",
                  label: "予定から見つける",
                  target: "googleExplain",
                  variant: "quiet",
                })
              }
            />
            <ProductIntroSubLink
              icon={Heart}
              label="少しつらい時"
              onClick={() =>
                onAction({
                  action: "navigate",
                  label: "少しつらい時",
                  target: "hardTime",
                  variant: "secondary",
                })
              }
              tone="clay"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductEvidenceCtas({ onAction }: { onAction: CtaHandler }) {
  return (
    <section className="rounded-[18px] border border-paper-line bg-white/70 p-4">
      <div className="grid gap-2 min-[520px]:grid-cols-2">
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
          <CalendarCheck className="h-4 w-4" strokeWidth={1.85} />
          予定から見つける
        </button>
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-deep-green px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-[#345d49] focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
          onClick={() =>
            onAction({
              action: "navigate",
              label: "今日のことをひとつ残す",
              target: "productAdd",
              variant: "primary",
            })
          }
          type="button"
        >
          <PenLine className="h-4 w-4" strokeWidth={1.9} />
          今日のことをひとつ残す
        </button>
      </div>
    </section>
  );
}

function getProductIntroTitle(evidenceState: ProductEvidenceState) {
  if (evidenceState === "unchecked") {
    return "まだ見つけている途中です。";
  }

  if (evidenceState === "checkedEmpty") {
    return "今回確認した範囲では、まだ見つかりませんでした。";
  }

  return "ここまでに、残っていたことがあります。";
}

function getProductCountDescription(evidenceState: ProductEvidenceState) {
  if (evidenceState === "unchecked") {
    return "まだこの端末では確認していません。予定からさかのぼって見つけられます。";
  }

  if (evidenceState === "checkedEmpty") {
    return "今回確認した範囲では、まだ見つかりませんでした。予定には残っていないだけかもしれません。";
  }

  return "保存済みの記録から、残っていた跡を見返します。";
}

function getProductEvidenceState(
  recordCount: number,
  hasCheckedEvidence: boolean,
): ProductEvidenceState {
  if (recordCount > 0) {
    return "hasRecords";
  }

  return hasCheckedEvidence ? "checkedEmpty" : "unchecked";
}

function ProductIntroSubLink({
  icon: Icon,
  label,
  onClick,
  tone = "sage",
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  tone?: "clay" | "sage";
}) {
  const iconClass =
    tone === "clay"
      ? "border-clay/30 bg-[#fff7ef] text-clay"
      : "border-sage-soft bg-[#edf3ea] text-sage";

  return (
    <button
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-paper-line bg-white/70 px-4 py-2 text-sm font-semibold text-ink-muted transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
      onClick={onClick}
      type="button"
    >
      <span
        className={[
          "grid h-7 w-7 shrink-0 place-items-center rounded-[9px] border",
          iconClass,
        ].join(" ")}
      >
        <Icon className="h-4 w-4" strokeWidth={1.85} />
      </span>
      {label}
    </button>
  );
}

function ProductFootprintList({
  MoreEvidenceIcon,
  extraEvidenceGroups,
  footprints,
  setShowMoreEvidence,
  showMoreEvidence,
}: {
  MoreEvidenceIcon: typeof ChevronDown;
  extraEvidenceGroups: ExtraEvidenceGroup[];
  footprints: ProductFootprint[];
  setShowMoreEvidence: (value: (current: boolean) => boolean) => void;
  showMoreEvidence: boolean;
}) {
  return (
    <section className="rounded-[20px] border border-white/80 bg-paper-soft p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <SectionLabel>直近7日のあしあと</SectionLabel>
          <p className="text-base leading-8 text-ink-muted">
            大きな成果ではなくても、残っていた行動を日付順に見られます。
          </p>
        </div>
        <span className="inline-flex h-8 shrink-0 items-center rounded-full border border-paper-line bg-white/75 px-3 text-sm font-semibold text-ink-muted">
          7日間
        </span>
      </div>
      <ul className="mt-4 divide-y divide-paper-line/80 rounded-[16px] border border-paper-line bg-white/70">
        {footprints.map((item) => (
          <li
            className="grid grid-cols-[74px_1fr] gap-3 px-4 py-4 text-base min-[1100px]:grid-cols-[86px_1fr_auto]"
            key={`${item.date}-${item.label}-${item.sourceLabel}`}
          >
            <span className="text-sm font-semibold leading-7 text-ink-muted">
              {item.date}
            </span>
            <div>
              <p className="font-semibold leading-7 text-ink">{item.label}</p>
              <p className="text-sm leading-6 text-ink-muted">
                {item.sourceLabel}
              </p>
            </div>
            <span className="col-start-2 inline-flex h-8 min-w-[7.5rem] items-center justify-center rounded-full bg-sage-soft/80 px-3.5 text-sm font-semibold leading-none text-sage min-[1100px]:col-start-auto min-[1100px]:justify-self-end">
              {item.categoryLabel}
            </span>
          </li>
        ))}
      </ul>
      <button
        className="mt-3 flex min-h-12 w-full items-center justify-between rounded-full border border-paper-line bg-white/75 px-5 py-2.5 text-left text-base font-semibold text-ink-muted transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
        onClick={() => setShowMoreEvidence((current) => !current)}
        type="button"
      >
        <span>
          {showMoreEvidence
            ? "ほかに残っていたことを閉じる"
            : "ほかに残っていたことを見る"}
        </span>
        <MoreEvidenceIcon size={16} strokeWidth={1.8} />
      </button>
      {showMoreEvidence && extraEvidenceGroups.length > 0 && (
        <div className="mt-3 space-y-3 rounded-[16px] border border-paper-line bg-white/75 p-4">
          {extraEvidenceGroups.map((group) => (
            <section key={group.title}>
              <h3 className="text-base font-semibold text-ink">{group.title}</h3>
              <ul className="mt-2 space-y-2 text-base leading-7 text-ink-muted">
                {group.items.map((item) => (
                  <li
                    className="flex items-center justify-between border-b border-paper-line/70 pb-1 last:border-b-0 last:pb-0"
                    key={item.label}
                  >
                    <span>{item.label}</span>
                    <span className="text-sm font-semibold text-ink">
                      {item.count}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}

function ProductTodayAdded({
  lastAddedEvidence,
  records,
}: {
  lastAddedEvidence: LastAddedEvidence | null;
  records: TodayAddedRecordGroup[];
}) {
  return (
    <section className="rounded-[20px] border border-white/80 bg-paper-soft p-5 shadow-soft">
      <SectionLabel>最近見つかった証拠</SectionLabel>
      {records.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {records.slice(0, 3).map((record) => {
            const isNew = lastAddedEvidence?.items.some(
              (item) => item.id === record.id,
            );

            return (
              <li
                className={[
                  "rounded-[16px] border px-3 py-3",
                  isNew
                    ? "border-sage-soft bg-[#edf3ea] shadow-soft"
                    : "border-paper-line bg-white/70",
                ].join(" ")}
                key={record.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {isNew && (
                      <p className="mb-1 text-xs font-semibold leading-5 text-sage">
                        今回追加
                      </p>
                    )}
                    <p className="text-base font-semibold leading-7 text-ink">
                      {record.label}
                    </p>
                    <p className="text-sm leading-6 text-ink-muted">
                      {compactCategoryLabel(record.categoryLabel)}
                    </p>
                    <p className="text-xs leading-5 text-ink-muted">
                      {record.dateLabel}
                    </p>
                  </div>
                  <span className="inline-flex h-8 shrink-0 items-center rounded-full border border-paper-line bg-white/75 px-3 text-sm font-semibold text-ink-muted">
                    {mockRecordSourceLabels[record.source]}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-3 rounded-[16px] border border-paper-line bg-white/70 p-4">
          <p className="text-base font-semibold leading-7 text-ink">
            まだ見つかっていません。
          </p>
          <p className="mt-1 text-base leading-8 text-ink-muted">
            予定から見つけるか、今日のことをひとつ残すと、ここに表示されます。
          </p>
        </div>
      )}
    </section>
  );
}

function ProductLetterCard({
  letters,
  onAction,
}: {
  letters: MockLetter[];
  onAction: CtaHandler;
}) {
  const letter = pickLetterToReceive(letters);

  return (
    <section className="rounded-[20px] border border-white/80 bg-paper-soft p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <SectionLabel>前の自分からの一文</SectionLabel>
          <p className="mt-2 text-base font-semibold leading-8 text-ink">
            {letter
              ? trimLetterPreview(letter.body, 70)
              : "ここに来たことも、残っていたことのひとつです。"}
          </p>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            {letter
              ? formatLetterDateTime(letter)
              : "まだ一文がない時は、ここから短く残せます。"}
          </p>
          {letter && (
            <p className="mt-1 text-sm leading-6 text-ink-muted">
              {getLetterSourceLabel(letter.source)}
            </p>
          )}
          {letters.length > 1 && (
            <p className="mt-1 text-sm leading-6 text-ink-muted">
              履歴は{letters.length}件あります。
            </p>
          )}
        </div>
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[16px] border border-paper-line bg-[#fff7ef] text-clay">
          <LetterText className="h-6 w-6" strokeWidth={1.8} />
        </div>
      </div>
      <button
        className="mt-4 flex min-h-12 w-full items-center justify-center rounded-full border border-paper-line bg-white/75 px-5 py-2.5 text-base font-semibold text-sage transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
        onClick={() =>
          onAction({
            action: "navigate",
            label: "未来の自分へ手紙を書く",
            target: "letter",
            variant: "quiet",
          })
        }
        type="button"
      >
        {letter ? "一文を見返す" : "一文を残す"}
      </button>
    </section>
  );
}

function ProductPrimaryActions({ onAction }: { onAction: CtaHandler }) {
  return (
    <section className="grid gap-3 min-[1100px]:grid-cols-2">
      <ProductActionButton
        icon={PenLine}
        label="今日のことをひとつ残す"
        onClick={() =>
          onAction({
            action: "navigate",
            label: "今日のことをひとつ残す",
            target: "oneTap",
            variant: "primary",
          })
        }
        primary
      />
      <ProductActionButton
        icon={CalendarCheck}
        label="この7日間から拾う"
        onClick={() =>
          onAction({
            action: "navigate",
            label: "この7日間から拾う",
            target: "reflection",
            variant: "quiet",
          })
        }
      />
    </section>
  );
}

function ProductDetailActions({ onAction }: { onAction: CtaHandler }) {
  return (
    <section className="rounded-[20px] border border-white/80 bg-paper-soft p-5 shadow-soft">
      <SectionLabel>必要な時だけ確認する</SectionLabel>
      <div className="mt-3 grid gap-2">
        <ProductDetailLink
          label="予定から見つける"
          onClick={() =>
            onAction({
              action: "navigate",
              label: "予定から見つける",
              target: "googleExplain",
              variant: "quiet",
            })
          }
        />
      </div>
    </section>
  );
}

function ProductActionButton({
  icon: Icon,
  label,
  onClick,
  primary = false,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      className={[
        "flex min-h-16 items-center justify-between rounded-[18px] border px-5 py-4 text-left text-base font-semibold shadow-soft transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sage",
        primary
          ? "border-deep-green bg-deep-green text-white hover:bg-[#345d49]"
          : "border-paper-line bg-white/75 text-ink hover:bg-white",
      ].join(" ")}
      onClick={onClick}
      type="button"
    >
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4" strokeWidth={1.9} />
        {label}
      </span>
      <ChevronRight className="h-4 w-4" strokeWidth={1.9} />
    </button>
  );
}

function ProductDetailLink({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="flex min-h-12 items-center justify-between rounded-[14px] border border-paper-line bg-white/75 px-4 py-2.5 text-left text-base font-semibold text-ink-muted transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
      onClick={onClick}
      type="button"
    >
      {label}
      <ChevronRight className="h-4 w-4" strokeWidth={1.9} />
    </button>
  );
}

type ProductFootprint = {
  categoryLabel: string;
  date: string;
  label: string;
  sourceLabel: string;
};

function buildRecentFootprints(mockRecords: MockRecord[]): ProductFootprint[] {
  const records = [...mockRecords].reverse().slice(0, 5).map((record) => ({
    categoryLabel: compactCategoryLabel(record.categoryLabel),
    date: record.dateLabel,
    label: record.label,
    sourceLabel: mockRecordSourceLabels[record.source],
  }));

  return records;
}

function compactCategoryLabel(label: string) {
  return label.replace("日の証拠", "こと");
}

type TodayAddedRecordGroup = MockRecord & {
  count: number;
};

export function buildTodayAddedRecordGroups(
  mockRecords: MockRecord[],
): TodayAddedRecordGroup[] {
  const groups = new Map<string, TodayAddedRecordGroup>();

  for (const record of mockRecords) {
    const key = [
      record.dateLabel,
      record.label.trim(),
      record.category,
      record.source,
    ].join("\u001F");
    const existingGroup = groups.get(key);

    if (existingGroup) {
      existingGroup.count += 1;
      continue;
    }

    groups.set(key, {
      ...record,
      count: 1,
    });
  }

  return Array.from(groups.values());
}

export function buildProductHomeCounts(
  mockRecords: MockRecord[],
  evidenceState: ProductEvidenceState = getProductEvidenceState(
    mockRecords.length,
    false,
  ),
): EvidenceCount[] {
  return homeCopy.counts.flatMap((count): EvidenceCount[] => {
    if (!count.category) {
      return [];
    }

    if (evidenceState === "unchecked") {
      return [
        {
          ...count,
          basis: undefined,
          value: "—",
          valueAssistiveLabel: "未確認",
        },
      ];
    }

    const categoryRecords = mockRecords.filter(
      (record) => record.category === count.category,
    );

    if (evidenceState === "checkedEmpty" || categoryRecords.length === 0) {
      return [
        {
          ...count,
          addedDays: 0,
          basis: undefined,
          value: "0日",
        },
      ];
    }

    const uniqueDays = new Set(categoryRecords.map((record) => record.dateLabel));
    const sourceLabels = Array.from(
      new Set(
        categoryRecords.map((record) => mockRecordSourceLabels[record.source]),
      ),
    );

    return [
      {
        ...count,
        addedDays: uniqueDays.size,
        basis: {
          countingRule: "同じ日に複数あっても1日として数えます",
          examples: [],
          mockRecords: categoryRecords,
          period: "保存済みの記録",
          reason:
            "この端末に保存された短いラベルとカテゴリから数えています。",
          sources: sourceLabels,
        },
        value: `${uniqueDays.size}日`,
      },
    ];
  });
}

function buildReviewHomeCounts(mockRecords: MockRecord[]): EvidenceCount[] {
  return homeCopy.counts.map((count) => {
    if (!count.category) {
      return count;
    }

    const categoryRecords = mockRecords.filter(
      (record) => record.category === count.category,
    );
    const addedDays = categoryRecords.length > 0 ? 1 : 0;
    const baseValue = Number.parseInt(count.value, 10);
    const value =
      addedDays > 0 && Number.isFinite(baseValue)
        ? `${baseValue + addedDays}日`
        : count.value;

    return {
      ...count,
      addedDays,
      value,
      basis: count.basis
        ? {
            ...count.basis,
            mockRecords: categoryRecords,
            sources: Array.from(
              new Set([
                ...count.basis.sources,
                ...categoryRecords.map(
                  (record) => mockRecordSourceLabels[record.source],
                ),
              ]),
            ),
          }
        : count.basis,
    };
  });
}

type ExtraEvidenceGroup = {
  items: Array<{ count: string; label: string }>;
  title: string;
};

const extraEvidenceGroupCategories: Record<string, RecordCategory> = {
  "未来に向き合ったこと": "future",
  "積み上げたこと": "build",
  "自分を整えたこと": "care",
};

const extraEvidenceGroupTitles = {
  future: "未来に向き合ったこと",
  build: "積み上げたこと",
  care: "自分を整えたこと",
  return: "戻ってきたこと",
} satisfies Record<RecordCategory, string>;

export function buildExtraEvidenceGroups(mockRecords: MockRecord[]) {
  const groups = homeCopy.extraEvidenceGroups.map((group) => ({
    ...group,
    category: extraEvidenceGroupCategories[group.title],
    items: group.items.map((item) => ({
      label: item.label,
      value: parseEvidenceCount(item.count),
    })),
  }));

  for (const record of mockRecords) {
    if (record.source === "app") {
      continue;
    }

    const group =
      groups.find((item) => item.category === record.category) ??
      createExtraEvidenceGroup(record.category);

    if (!groups.includes(group)) {
      groups.push(group);
    }

    const existingItem = group.items.find((item) => item.label === record.label);

    if (existingItem) {
      existingItem.value += 1;
      continue;
    }

    group.items.push({
      label: record.label,
      value: 1,
    });
  }

  return groups.map(({ category: _category, items, ...group }) => ({
    ...group,
    items: items.map((item) => ({
      label: item.label,
      count: `${item.value}件`,
    })),
  }));
}

export function buildProductExtraEvidenceGroups(
  mockRecords: MockRecord[],
): ExtraEvidenceGroup[] {
  const groups: Array<{
    category: RecordCategory;
    items: Array<{ label: string; value: number }>;
    title: string;
  }> = [];

  for (const record of mockRecords) {
    if (record.source === "app") {
      continue;
    }

    let group = groups.find((item) => item.category === record.category);

    if (!group) {
      group = createExtraEvidenceGroup(record.category);
      groups.push(group);
    }

    const existingItem = group.items.find((item) => item.label === record.label);

    if (existingItem) {
      existingItem.value += 1;
      continue;
    }

    group.items.push({
      label: record.label,
      value: 1,
    });
  }

  return groups.map(({ category: _category, items, ...group }) => ({
    ...group,
    items: items.map((item) => ({
      label: item.label,
      count: `${item.value}件`,
    })),
  }));
}

function createExtraEvidenceGroup(category: RecordCategory) {
  return {
    category,
    items: [] as Array<{ label: string; value: number }>,
    title: extraEvidenceGroupTitles[category],
  };
}

function parseEvidenceCount(value: string) {
  const count = Number.parseInt(value, 10);

  return Number.isFinite(count) ? count : 0;
}
