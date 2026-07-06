import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { ArrowLeft, CheckCircle2, FileText, Info, RotateCcw } from "lucide-react";
import { ActionList } from "../components/ActionList";
import { PlainSection } from "../components/PlainSection";
import { ScreenStack } from "../components/ScreenStack";
import { SectionLabel } from "../components/SectionLabel";
import { classifyCalendarEntries } from "../lib/calendarImport/classifyCalendarEntry";
import { createCalendarMockRecordDraft } from "../lib/calendarImport/createCalendarMockRecordDraft";
import { createEditableCalendarEntry } from "../lib/calendarImport/createEditableCalendarEntry";
import {
  decodeCsvCalendarBuffer,
  decodeIcsCalendarBuffer,
} from "../lib/calendarImport/decodeCalendarText";
import { parseCsvCalendar } from "../lib/calendarImport/parseCsvCalendar";
import { parseIcsCalendar } from "../lib/calendarImport/parseIcsCalendar";
import { normalizeGoogleCalendarEvents } from "../lib/googleCalendar/normalizeGoogleCalendarEvent";
import {
  calendarImportCopy,
  mockRecordSourceLabels,
  recordCategoryLabels,
} from "../data/mockContent";
import { mockGoogleCalendarEvents } from "../data/mockGoogleCalendarEvents";
import {
  getEvidenceDestinationLabel,
  getEvidenceSourceLabel,
} from "../lib/evidenceLanding";
import type { AddMockRecordsResult } from "../storage/mockRecordDeduplication";
import type {
  CalendarEntrySourceType,
  CalendarFileSource,
  CalendarImportInitialEntries,
  CalendarImportCategory,
  CalendarTextEncoding,
  ClassificationConfidence,
  EditableCalendarEntry,
  ParsedCalendarEntry,
} from "../lib/calendarImport/calendarImportTypes";
import type {
  CtaHandler,
  MockRecord,
  MockRecordDraft,
  UiMode,
} from "../types/content";

type CalendarImportScreenProps = {
  initialEntries?: CalendarImportInitialEntries | null;
  onAction: CtaHandler;
  onAddRecords: (records: MockRecordDraft[]) => AddMockRecordsResult;
  onEvidenceChecked: () => void;
  onInitialEntriesConsumed?: (
    entries: CalendarImportInitialEntries | null,
  ) => void;
  onViewLastAddedEvidence: () => void;
  uiMode: UiMode;
};

type CalendarImportSource =
  | {
      kind: "file";
      file: File;
      name: string;
      sourceType: CalendarFileSource;
      rangeLabel?: string;
    }
  | {
      kind: "sample";
      name: string;
      path: string;
      sourceType: CalendarFileSource;
      rangeLabel?: string;
    }
  | {
      kind: "googleMock";
      name: string;
      sourceType: Extract<CalendarEntrySourceType, "GoogleCalendarMock">;
      rangeLabel?: string;
    }
  | {
      kind: "googleApi";
      name: string;
      rangeLabel?: string;
      sourceType: Extract<CalendarEntrySourceType, "GoogleCalendar">;
    };

type CalendarLoadSummary = {
  confidenceCounts: Record<ClassificationConfidence, number>;
  loadedAtLabel: string;
  methodLabel: string;
  rangeLabel: string;
  sourceKindLabel: string;
  sourceName: string;
  totalCount: number;
};

const confidenceLabels: Record<ClassificationConfidence, string> = {
  high: "高",
  medium: "中",
  low: "低",
};

const categoryOptions = [
  { label: "未分類 / 確認してください", value: "unclassified" },
  { label: "未来に向き合ったこと", value: "future" },
  { label: "積み上げたこと", value: "build" },
  { label: "自分を整えたこと", value: "care" },
  { label: "戻ってきたこと", value: "return" },
  { label: "保存しない", value: "ignore" },
] satisfies Array<{ label: string; value: CalendarImportCategory }>;

export function CalendarImportScreen({
  initialEntries,
  onAction,
  onAddRecords,
  onEvidenceChecked,
  onInitialEntriesConsumed,
  onViewLastAddedEvidence,
  uiMode,
}: CalendarImportScreenProps) {
  const lastInitialEntriesIdRef = useRef<string | null>(null);
  const reviewTopRef = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<EditableCalendarEntry[]>([]);
  const [message, setMessage] = useState(calendarImportCopy.emptyMessage);
  const [csvEncoding, setCsvEncoding] =
    useState<CalendarTextEncoding>("auto");
  const [calendarSource, setCalendarSource] =
    useState<CalendarImportSource | null>(null);
  const [loadSummary, setLoadSummary] =
    useState<CalendarLoadSummary | null>(null);
  const [addResult, setAddResult] = useState<AddMockRecordsResult | null>(null);
  const selectedCount = items.filter(
    (item) => item.selected && canSaveItem(item),
  ).length;
  const hasSavableItems = items.some(canSaveItem);
  const loadedCount = loadSummary?.totalCount ?? items.length;

  const handleFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) {
      setItems([]);
      setMessage(calendarImportCopy.emptyMessage);
      setCalendarSource(null);
      setLoadSummary(null);
      setAddResult(null);
      input.value = "";
      return;
    }

    const sourceType = getSourceType(file);

    if (!sourceType) {
      setItems([]);
      setMessage("CSVまたはICSファイルで試せます。");
      setCalendarSource(null);
      setLoadSummary(null);
      setAddResult(null);
      input.value = "";
      return;
    }

    const source = {
      file,
      kind: "file",
      name: file.name,
      rangeLabel: "ファイル内の予定",
      sourceType,
    } satisfies CalendarImportSource;
    setCalendarSource(source);
    await processCalendarSource(source, csvEncoding);
    input.value = "";
  };

  const loadSample = async (path: string, sourceType: CalendarFileSource) => {
    const source = {
      kind: "sample",
      name: getSampleName(path),
      path,
      rangeLabel: "サンプル全体",
      sourceType,
    } satisfies CalendarImportSource;
    setCalendarSource(source);
    await processCalendarSource(source, csvEncoding);
  };

  const loadGoogleCalendarSample = () => {
    const source = {
      kind: "googleMock",
      name: "Google予定風サンプル",
      rangeLabel: "サンプル全体",
      sourceType: "GoogleCalendarMock",
    } satisfies CalendarImportSource;
    const events = normalizeGoogleCalendarEvents(mockGoogleCalendarEvents);

    setCalendarSource(source);
    processCalendarEntries(events, source);
  };

  const handleEncodingChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextEncoding = event.target.value as CalendarTextEncoding;
    setCsvEncoding(nextEncoding);

    if (calendarSource?.sourceType === "CSV") {
      void processCalendarSource(calendarSource, nextEncoding);
    }
  };

  const processCalendarSource = async (
    source: CalendarImportSource,
    encoding: CalendarTextEncoding,
  ) => {
    if (source.kind === "googleMock") {
      processCalendarEntries(normalizeGoogleCalendarEvents(mockGoogleCalendarEvents), source);
      return;
    }

    if (source.kind === "googleApi") {
      return;
    }

    try {
      const buffer =
        source.kind === "file"
          ? await source.file.arrayBuffer()
          : await fetchSampleBuffer(source.path);
      const decoded =
        source.sourceType === "CSV"
          ? decodeCsvCalendarBuffer(buffer, encoding)
          : decodeIcsCalendarBuffer(buffer);

      processCalendarText(decoded.text, source);
    } catch {
      setItems([]);
      setLoadSummary(null);
      setAddResult(null);
      setMessage(calendarImportCopy.readErrorMessage);
    }
  };

  const processCalendarText = (text: string, source: CalendarImportSource) => {
    const events =
      source.sourceType === "CSV" ? parseCsvCalendar(text) : parseIcsCalendar(text);

    processCalendarEntries(events, source);
  };

  const processCalendarEntries = (
    events: ParsedCalendarEntry[],
    source: CalendarImportSource,
  ) => {
    onEvidenceChecked();

    if (events.length === 0) {
      setItems([]);
      setLoadSummary(createLoadSummary(source, []));
      setMessage(calendarImportCopy.noEventsMessage);
      setAddResult(null);
      return;
    }

    const classifiedItems = classifyCalendarEntries(events, source.sourceType).map(
      createEditableCalendarEntry,
    );

    setItems(classifiedItems);
    setLoadSummary(createLoadSummary(source, classifiedItems));
    setAddResult(null);
    setMessage(
      classifiedItems.some((item) => item.confidence !== "low")
        ? "保存前に短いラベルと分類を確認できます。"
        : calendarImportCopy.noClassifiedMessage,
    );
  };

  useEffect(() => {
    if (
      !initialEntries ||
      lastInitialEntriesIdRef.current === initialEntries.id
    ) {
      return;
    }

    const source = {
      kind: "googleApi",
      name: initialEntries.sourceName,
      rangeLabel: initialEntries.rangeLabel ?? "過去7日",
      sourceType: "GoogleCalendar",
    } satisfies CalendarImportSource;

    lastInitialEntriesIdRef.current = initialEntries.id;
    setCalendarSource(source);
    processCalendarEntries(initialEntries.entries, source);
    onInitialEntriesConsumed?.(null);

    window.setTimeout(() => {
      const reduceMotion = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      reviewTopRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    }, 0);
  }, [initialEntries, onInitialEntriesConsumed]);

  const toggleSelected = (id: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id && canSaveItem(item)
          ? { ...item, selected: !item.selected }
          : item,
      ),
    );
  };

  const updateCategory = (id: string, category: CalendarImportCategory) => {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const updatedItem = {
          ...item,
          category,
          selected: category === "ignore" ? false : item.selected,
        };

        return canSaveItem(updatedItem)
          ? updatedItem
          : { ...updatedItem, selected: false };
      }),
    );
  };

  const updateShortLabel = (id: string, shortLabel: string) => {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const updatedItem = { ...item, shortLabel };

        return canSaveItem(updatedItem)
          ? updatedItem
          : { ...updatedItem, selected: false };
      }),
    );
  };

  const toggleRawTitle = (id: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, showRawTitle: !item.showRawTitle } : item,
      ),
    );
  };

  const addSelectedRecords = () => {
    onEvidenceChecked();

    const selectedRecords = items
      .filter((item) => item.selected && canSaveItem(item))
      .map((item) => createCalendarMockRecordDraft(item, recordCategoryLabels))
      .filter((record): record is MockRecordDraft => record !== null);

    if (selectedRecords.length > 0) {
      setAddResult(onAddRecords(selectedRecords));
      return;
    }

    setMessage("保存したい予定にチェックを入れると、ここまでに追加できます。");
  };

  const handleAction: CtaHandler = (cta) => {
    if (cta.action === "navigate" && cta.target === "home") {
      addSelectedRecords();
      return;
    }

    onAction(cta);
  };

  return (
    <ScreenStack>
      <PlainSection
        icon={FileText}
        title={calendarImportCopy.title}
        body={calendarImportCopy.body}
      />

      <div ref={reviewTopRef} />

      {calendarSource && loadSummary && (
        <LoadSourceNotice
          onAction={onAction}
          source={calendarSource}
          summary={loadSummary}
        />
      )}

      {items.length > 0 && (
        <AddSelectedRecordsPanel
          loadedCount={loadedCount}
          onAdd={addSelectedRecords}
          selectedCount={selectedCount}
        />
      )}

      <details className="rounded-lg border border-sage-soft bg-sage-soft/30 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-ink">
          保存される/されない情報を見る
        </summary>
        <p className="mt-3 text-sm leading-6 text-ink-muted">
          {calendarImportCopy.note}
        </p>
        <p className="mt-2 text-xs leading-5 text-ink-muted">
          保存されるのは、確認した短いラベル・カテゴリ・日付だけです。
          元の予定タイトルはそのまま保存しません。
        </p>
      </details>

      <div className="rounded-lg border border-white/75 bg-paper-soft/90 p-4 shadow-soft">
        <label className="text-sm font-semibold text-ink" htmlFor="calendar-file">
          CSV / ICSファイル
        </label>
        <input
          accept=".csv,.ics,text/csv,text/calendar"
          className="mt-3 block w-full text-sm text-ink-muted file:mr-3 file:rounded-md file:border-0 file:bg-sage file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
          id="calendar-file"
          onChange={handleFileChange}
          type="file"
        />
        <p className="mt-2 text-xs leading-5 text-ink-muted">
          {uiMode === "review"
            ? "手元のCSV/ICSを選ぶ時に使います。サンプルを読み込んだ場合は、下の読み込み元に表示されます。"
            : "手元のCSV/ICSを選ぶ時に使います。選んだファイル名は、下の読み込み元に表示されます。"}
        </p>
        <div className="mt-3 flex items-start gap-2 text-xs leading-5 text-ink-muted">
          <Info className="mt-0.5 shrink-0" size={14} strokeWidth={1.8} />
          <p>ファイルはブラウザ内だけで読みます。外部には送信しません。</p>
        </div>
        <div className="mt-3 rounded-md border border-paper-line bg-white/75 p-3">
          <label
            className="block text-xs font-semibold text-ink"
            htmlFor="calendar-csv-encoding"
          >
            CSVの文字コード
          </label>
          <select
            className="mt-2 w-full rounded-md border border-paper-line bg-white/80 px-3 py-2 text-sm text-ink outline-none transition focus:border-sage focus:ring-2 focus:ring-sage-soft"
            id="calendar-csv-encoding"
            onChange={handleEncodingChange}
            value={csvEncoding}
          >
            <option value="auto">自動</option>
            <option value="utf-8">UTF-8</option>
            <option value="shift_jis">Shift_JIS</option>
          </select>
          <p className="mt-2 text-xs leading-5 text-ink-muted">
            文字化けする場合は、Shift_JISで読み直してください。
          </p>
        </div>
        {uiMode === "review" ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="rounded-md border border-paper-line bg-white/70 px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
              onClick={() => loadSample("/samples/sample-calendar.csv", "CSV")}
              type="button"
            >
              サンプルCSVで試す
            </button>
            <button
              className="rounded-md border border-paper-line bg-white/70 px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
              onClick={() => loadSample("/samples/sample-calendar.ics", "ICS")}
              type="button"
            >
              サンプルICSで試す
            </button>
            <button
              className="rounded-md border border-paper-line bg-white/70 px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
              onClick={loadGoogleCalendarSample}
              type="button"
            >
              Google予定風サンプルで試す
            </button>
          </div>
        ) : (
          <p className="mt-3 rounded-md border border-paper-line bg-white/75 p-3 text-xs leading-5 text-ink-muted">
            無償βの通常画面では、必要な時だけ手元のファイルを選んで確認します。
          </p>
        )}
      </div>

      <div className="rounded-lg border border-white/75 bg-paper-soft/90 p-4 shadow-soft">
        <SectionLabel>分類プレビュー</SectionLabel>
        <p className="text-sm leading-6 text-ink-muted">{message}</p>
        {items.length > 0 && (
          <div className="mt-3 space-y-3">
            <details className="rounded-lg border border-sage-soft bg-sage-soft/35 p-3">
              <summary className="cursor-pointer text-sm font-semibold leading-6 text-ink">
                保存前確認の流れを見る
              </summary>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs leading-5 text-ink-muted">
                <li>保存する短いラベルを確認する</li>
                <li>分類カテゴリを確認する</li>
                <li>残したい予定にチェックを入れる</li>
                <li>「選んで保存する」を押す</li>
              </ol>
              <p className="mt-2 text-xs leading-5 text-ink-muted">
                まだ保存されていません。
              </p>
            </details>
            <details className="rounded-lg border border-paper-line bg-white/75 p-3">
              <summary className="cursor-pointer text-xs font-semibold text-ink">
                確信度の見方
              </summary>
              <dl className="mt-2 space-y-2 text-xs leading-5 text-ink-muted">
                <div>
                  <dt className="font-semibold text-sage">確信度 高</dt>
                  <dd>そのまま追加候補です。</dd>
                </div>
                <div>
                  <dt className="font-semibold text-clay">確信度 中</dt>
                  <dd>内容を確認してから追加してください。</dd>
                </div>
                <div>
                  <dt className="font-semibold text-ink-muted">確信度 低</dt>
                  <dd>ラベルか分類を直すと追加できます。</dd>
                </div>
              </dl>
            </details>
          </div>
        )}
        {loadSummary && (
          <LoadSummaryCard summary={loadSummary} />
        )}
        {items.length > 0 && (
          <div className="mt-4 space-y-3">
            {items.map((item) => {
              const isSaveable = canSaveItem(item);
              const isLowBlocked =
                item.confidence === "low" && !isItemModified(item);

              return (
                <div
                  className="rounded-lg border border-paper-line bg-white/80 p-3 shadow-soft"
                  key={item.id}
                >
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
                      onChange={(event) =>
                        updateShortLabel(item.id, event.target.value)
                      }
                      value={item.shortLabel}
                    />
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
                        updateCategory(
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
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={confidenceClass(item.confidence)}>
                        確信度 {confidenceLabels[item.confidence]}
                      </span>
                      <span className="rounded-md bg-paper-soft px-2 py-1 text-xs text-ink-muted">
                        {item.dateLabel}
                      </span>
                      <span className="rounded-md bg-paper-soft px-2 py-1 text-xs text-ink-muted">
                        {item.sourceLabel ?? item.sourceType}
                      </span>
                    </div>
                    <label className="flex min-h-11 items-center gap-3 rounded-lg border border-sage-soft bg-sage-soft/35 px-3 py-2 text-sm font-semibold text-ink">
                      <input
                        checked={item.selected}
                        className="h-4 w-4 rounded border-paper-line text-sage focus:ring-sage"
                        disabled={!isSaveable}
                        onChange={() => toggleSelected(item.id)}
                        type="checkbox"
                      />
                      保存する
                    </label>
                    <p className="text-xs leading-5 text-ink-muted">
                      {item.reason}
                    </p>
                    {isLowBlocked && (
                      <p className="rounded-md border border-paper-line bg-white/75 p-2 text-xs leading-5 text-ink-muted">
                        この予定はまだ追加対象ではありません。
                        保存する短いラベルまたは分類カテゴリを確認・修正すると追加できます。
                      </p>
                    )}
                    {item.confidence === "low" && isSaveable && (
                      <p className="rounded-md border border-sage-soft bg-white/75 p-2 text-xs leading-5 text-ink-muted">
                        修正済みです。チェックを入れると追加できます。
                      </p>
                    )}
                    <details
                      className="rounded-md border border-paper-line bg-white/70 p-2"
                      open={item.showRawTitle}
                    >
                      <summary
                        className="cursor-pointer text-xs font-medium text-sage"
                        onClick={(event) => {
                          event.preventDefault();
                          toggleRawTitle(item.id);
                        }}
                      >
                        {item.showRawTitle
                          ? "元の予定タイトルを閉じる"
                          : "元の予定タイトルを見る"}
                      </summary>
                      {item.showRawTitle && (
                        <p className="mt-2 text-xs leading-5 text-ink-muted">
                          {item.rawTitle}
                        </p>
                      )}
                    </details>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {items.length > 0 && !hasSavableItems && (
          <p className="mt-3 text-xs leading-5 text-ink-muted">
            低確信度の予定は、自動では保存しません。
          </p>
        )}
        {items.length > 0 && selectedCount === 0 && hasSavableItems && (
          <p className="mt-3 text-xs leading-5 text-ink-muted">
            保存したい予定にチェックを入れると、短いラベルとして保存できます。
          </p>
        )}
      </div>

      <details className="rounded-lg border border-sage-soft bg-sage-soft/30 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-ink">
          保存される内容をもう一度見る
        </summary>
        <p className="mt-3 text-sm leading-6 text-ink-muted">
          保存されるのは、確認した短いラベル・カテゴリ・日付だけです。
          元の予定タイトルはそのまま保存しません。
        </p>
      </details>

      <ActionList
        ctas={calendarImportCopy.ctas.map((cta) =>
          cta.action === "navigate" && cta.target === "home"
            ? {
                ...cta,
                label:
                  selectedCount > 0
                    ? "選んで保存する"
                    : "保存する候補を選んでください",
              }
            : cta,
        )}
        onAction={handleAction}
      />
      {addResult && (
        <CalendarAddCompleteCard
          addedRecords={addResult.addedRecords}
          duplicateCount={addResult.duplicateCount}
          landingRecords={addResult.landingRecords}
          onReset={() => setAddResult(null)}
          onViewDestination={onViewLastAddedEvidence}
        />
      )}
    </ScreenStack>
  );
}

function AddSelectedRecordsPanel({
  loadedCount,
  onAdd,
  selectedCount,
}: {
  loadedCount: number;
  onAdd: () => void;
  selectedCount: number;
}) {
  const hasSelectedItems = selectedCount > 0;

  return (
    <section className="rounded-lg border border-white/75 bg-paper-soft/90 p-4 shadow-soft">
      <div className="grid grid-cols-2 gap-2 text-sm leading-6">
        <div className="rounded-lg border border-paper-line bg-white/75 p-3">
          <p className="text-xs font-semibold text-ink-muted">読み込み</p>
          <p className="mt-1 font-semibold text-ink">{loadedCount}件</p>
        </div>
        <div className="rounded-lg border border-sage-soft bg-sage-soft/35 p-3">
          <p className="text-xs font-semibold text-ink-muted">保存候補</p>
          <p className="mt-1 font-semibold text-ink">
            {hasSelectedItems
              ? `${selectedCount}件が保存候補です`
              : "まだ選ばれていません"}
          </p>
        </div>
      </div>
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs leading-5 text-ink-muted">
        <li>保存する短いラベルを確認する</li>
        <li>分類カテゴリを確認する</li>
        <li>残したい予定にチェックを入れる</li>
        <li>「選んで保存する」を押す</li>
      </ol>
      <p className="mt-3 text-xs leading-5 text-ink-muted">
        チェックが入っている予定だけ保存されます。
        保存前に、保存する短いラベルと分類カテゴリを確認できます。
      </p>
      <button
        className="mt-3 flex min-h-11 w-full items-center justify-center rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-[#627760] focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-55"
        disabled={!hasSelectedItems}
        onClick={onAdd}
        type="button"
      >
        {hasSelectedItems
          ? "選んで保存する"
          : "保存する候補を選んでください"}
      </button>
    </section>
  );
}

function LoadSourceNotice({
  onAction,
  source,
  summary,
}: {
  onAction: CtaHandler;
  source: CalendarImportSource;
  summary: CalendarLoadSummary;
}) {
  const isGoogleApi = source.kind === "googleApi";

  return (
    <section className="rounded-lg border border-sage-soft bg-sage-soft/35 p-4 shadow-soft">
      <p className="text-sm font-semibold leading-6 text-ink">
        {getLoadNoticeTitle(source, summary.rangeLabel)}
      </p>
      <p className="mt-2 text-sm leading-6 text-ink-muted">
        まだ保存されていません。保存する短いラベルと分類を確認してください。
        残したい予定だけ追加できます。
      </p>
      {isGoogleApi && (
        <button
          className="mt-3 flex min-h-10 items-center gap-2 rounded-lg border border-sage-soft bg-white/80 px-3 py-2 text-sm font-medium text-sage transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
          onClick={() =>
            onAction({
              action: "navigate",
              label: "Google連携画面に戻る",
              target: "googleExplain",
              variant: "quiet",
            })
          }
          type="button"
        >
          <ArrowLeft size={15} strokeWidth={1.8} />
          Google連携画面に戻る
        </button>
      )}
    </section>
  );
}

function LoadSummaryCard({ summary }: { summary: CalendarLoadSummary }) {
  return (
    <div className="mt-3 rounded-md border border-paper-line bg-paper-soft/80 p-3 text-xs leading-5 text-ink-muted">
      <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-ink">読み込み元</dt>
          <dd>
            {summary.sourceKindLabel}
            {summary.sourceName !== summary.sourceKindLabel
              ? `（${summary.sourceName}）`
              : ""}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">読み込み方法</dt>
          <dd>{summary.methodLabel}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">取得範囲</dt>
          <dd>{summary.rangeLabel}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">件数</dt>
          <dd>{summary.totalCount}件</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-semibold text-ink">確信度</dt>
          <dd>
            高：{summary.confidenceCounts.high}件 / 中：
            {summary.confidenceCounts.medium}件 / 低：
            {summary.confidenceCounts.low}件
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-semibold text-ink">最終読み込み</dt>
          <dd>{summary.loadedAtLabel}</dd>
        </div>
      </dl>
    </div>
  );
}

function CalendarAddCompleteCard({
  addedRecords,
  duplicateCount,
  landingRecords,
  onReset,
  onViewDestination,
}: {
  addedRecords: MockRecord[];
  duplicateCount: number;
  landingRecords: MockRecord[];
  onReset: () => void;
  onViewDestination: () => void;
}) {
  const displayRecords = addedRecords.length > 0 ? addedRecords : landingRecords;
  const firstSource = displayRecords[0]?.source;
  const sourceLabel =
    firstSource && displayRecords.every((record) => record.source === firstSource)
      ? `${mockRecordSourceLabels[firstSource]}から`
      : "";
  const isDuplicateOnly = addedRecords.length === 0 && duplicateCount > 0;

  return (
    <div className="rounded-lg border border-sage bg-sage-soft/80 p-4 shadow-soft">
      <div className="flex items-center gap-2 text-sm font-semibold text-sage">
        <CheckCircle2 className="h-4 w-4" strokeWidth={1.9} />
        {isDuplicateOnly
          ? "すでに追加済みです"
          : `${sourceLabel}${addedRecords.length}件をここまでに追加しました`}
      </div>
      {displayRecords.length > 0 && (
        <>
          <p className="mt-3 text-sm leading-6 text-ink-muted">
            「{displayRecords[0].label}」を{displayRecords[0].categoryLabel}
            として残しました。
          </p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-ink-muted">
            {displayRecords.slice(0, 5).map((record) => (
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
      {displayRecords.length > 5 && (
        <p className="mt-2 text-xs leading-5 text-ink-muted">
          ほか{displayRecords.length - 5}件もここまでに入りました。
        </p>
      )}
      {duplicateCount > 0 && (
        <p className="mt-2 text-xs leading-5 text-ink-muted">
          すでに追加済みの{duplicateCount}件は除きました。
        </p>
      )}
      <p className="mt-3 text-sm leading-6 text-ink-muted">
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
          続けて確認する
        </button>
      </div>
    </div>
  );
}

function getSourceType(file: File): CalendarFileSource | null {
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith(".csv") || file.type === "text/csv") {
    return "CSV";
  }

  if (
    lowerName.endsWith(".ics") ||
    file.type === "text/calendar" ||
    file.type === "application/ics"
  ) {
    return "ICS";
  }

  return null;
}

async function fetchSampleBuffer(path: string) {
  const cacheBustedPath = `${path}${path.includes("?") ? "&" : "?"}t=${Date.now()}`;
  const response = await fetch(cacheBustedPath, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("sample not found");
  }

  return response.arrayBuffer();
}

function getSampleName(path: string) {
  const segments = path.split("/").filter(Boolean);

  return segments[segments.length - 1] ?? path;
}

function createLoadSummary(
  source: CalendarImportSource,
  items: Array<Pick<EditableCalendarEntry, "confidence">>,
): CalendarLoadSummary {
  return {
    confidenceCounts: {
      high: items.filter((item) => item.confidence === "high").length,
      medium: items.filter((item) => item.confidence === "medium").length,
      low: items.filter((item) => item.confidence === "low").length,
    },
    loadedAtLabel: new Date().toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    methodLabel: getLoadMethodLabel(source),
    rangeLabel: getLoadRangeLabel(source),
    sourceKindLabel: getLoadSourceKindLabel(source),
    sourceName: source.name,
    totalCount: items.length,
  };
}

function getLoadMethodLabel(source: CalendarImportSource) {
  if (source.kind === "file") {
    return source.sourceType === "CSV" ? "CSVファイル" : "ICSファイル";
  }

  if (source.kind === "googleMock") {
    return "Google予定風データ";
  }

  if (source.kind === "googleApi") {
    return "Googleカレンダー連携";
  }

  return source.sourceType === "CSV" ? "サンプルCSV" : "サンプルICS";
}

function getLoadSourceKindLabel(source: CalendarImportSource) {
  if (source.kind === "file") {
    return source.sourceType === "CSV" ? "CSV" : "ICS";
  }

  if (source.kind === "sample") {
    return source.sourceType === "CSV" ? "サンプルCSV" : "サンプルICS";
  }

  if (source.kind === "googleMock") {
    return "Google予定風サンプル";
  }

  return "Googleカレンダー";
}

function getLoadRangeLabel(source: CalendarImportSource) {
  return source.rangeLabel ?? "読み込んだ予定";
}

function getLoadNoticeTitle(
  source: CalendarImportSource,
  rangeLabel: string,
) {
  if (source.kind === "googleApi") {
    return `Googleカレンダーから${rangeLabel}分を読み込みました`;
  }

  if (source.kind === "file") {
    return source.sourceType === "CSV"
      ? "CSVファイルから予定を読み込みました"
      : "ICSファイルから予定を読み込みました";
  }

  if (source.kind === "sample") {
    return source.sourceType === "CSV"
      ? "サンプルCSVから予定を読み込みました"
      : "サンプルICSから予定を読み込みました";
  }

  return "Google予定風サンプルから予定を読み込みました";
}

function isItemModified(item: EditableCalendarEntry) {
  return (
    item.category !== item.originalCategory ||
    item.shortLabel.trim() !== item.originalShortLabel.trim()
  );
}

function canSaveItem(item: EditableCalendarEntry) {
  if (
    item.category === "ignore" ||
    item.category === "unclassified" ||
    item.shortLabel.trim().length === 0
  ) {
    return false;
  }

  if (item.confidence === "low") {
    return isItemModified(item);
  }

  return true;
}

function confidenceClass(confidence: ClassificationConfidence) {
  const baseClass = "rounded-md px-2 py-1 text-xs";

  if (confidence === "high") {
    return `${baseClass} bg-sage-soft text-sage`;
  }

  if (confidence === "medium") {
    return `${baseClass} bg-orange-50 text-clay`;
  }

  return `${baseClass} bg-warm-gray text-ink-muted`;
}
