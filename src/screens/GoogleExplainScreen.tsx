import { useRef, useState, type ReactNode } from "react";
import {
  CircleAlert,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Eye,
  Info,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ActionList } from "../components/ActionList";
import { PlainSection } from "../components/PlainSection";
import { ScreenStack } from "../components/ScreenStack";
import { SectionLabel } from "../components/SectionLabel";
import { googleExplainCopy } from "../data/mockContent";
import {
  listGoogleCalendarEvents,
  listGoogleCalendars,
  type GoogleCalendarListItem,
} from "../lib/googleCalendar/googleCalendarApi";
import { requestGoogleCalendarAccessToken } from "../lib/googleCalendar/googleOAuth";
import { normalizeGoogleCalendarEvents } from "../lib/googleCalendar/normalizeGoogleCalendarEvent";
import type { CtaHandler, UiMode } from "../types/content";
import type { ParsedCalendarEntry } from "../lib/calendarImport/calendarImportTypes";

type GoogleExplainScreenProps = {
  onAction: CtaHandler;
  onGoogleCalendarChecked: () => void;
  onGoogleCalendarEntriesLoaded: (
    entries: ParsedCalendarEntry[],
    rangeLabel: string,
  ) => void;
  uiMode: UiMode;
};

type GoogleAuthStatus =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "missingClientId"
  | "libraryUnavailable";

type GoogleCalendarListStatus =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "unauthorized";

type GoogleCalendarEventsStatus =
  | "idle"
  | "loading"
  | "error"
  | "empty"
  | "tooMany"
  | "unauthorized"
  | "noSelection";

type GoogleAuthStatusTone = "info" | "success" | "warning";

type GoogleAuthStatusView = {
  body: string;
  icon: LucideIcon;
  title: string;
  tone: GoogleAuthStatusTone;
};

const defaultPeriodOption = "過去7日";
const periodOptions = ["過去7日", "過去30日", "過去90日", "任意期間"] as const;
type PeriodOption = (typeof periodOptions)[number];
type FetchablePeriodOption = Exclude<PeriodOption, "任意期間">;
const advancedPeriodOptions = periodOptions.filter(
  (option) => option !== defaultPeriodOption,
);

const previewItems = [
  {
    category: "未来に向き合ったこと",
    confidence: "高",
    label: "予定を確認した",
  },
  {
    category: "積み上げたこと",
    confidence: "高",
    label: "資料を読んだ",
  },
  {
    category: "確認が必要",
    confidence: "中",
    label: "作業を少し進めた",
  },
];

const readableItems = ["予定タイトル", "日時"];
const savedItems = ["確認した短いラベル", "カテゴリ", "日付"];
const unsavedItems = [
  "予定本文",
  "場所",
  "参加者",
  "元の予定タイトル",
  "Google予定ID",
];

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? "";

export function GoogleExplainScreen({
  onAction,
  onGoogleCalendarChecked,
  onGoogleCalendarEntriesLoaded,
  uiMode,
}: GoogleExplainScreenProps) {
  const accessTokenRef = useRef<string | null>(null);
  const [period, setPeriod] = useState<PeriodOption>(defaultPeriodOption);
  const [showAdvancedPeriodOptions, setShowAdvancedPeriodOptions] =
    useState(false);
  const [googleAuthStatus, setGoogleAuthStatus] =
    useState<GoogleAuthStatus>("idle");
  const [isGoogleAuthorized, setIsGoogleAuthorized] = useState(false);
  const [accessTokenPresent, setAccessTokenPresent] = useState(false);
  const [googleCalendarListStatus, setGoogleCalendarListStatus] =
    useState<GoogleCalendarListStatus>("idle");
  const [googleCalendars, setGoogleCalendars] = useState<
    GoogleCalendarListItem[]
  >([]);
  const [googleCalendarEventsStatus, setGoogleCalendarEventsStatus] =
    useState<GoogleCalendarEventsStatus>("idle");
  const isGoogleClientConfigured = googleClientId.length > 0;
  const googleAuthView = getGoogleAuthView({
    accessTokenPresent,
    isGoogleAuthorized,
    isGoogleClientConfigured,
    status: googleAuthStatus,
  });
  const googleCalendarListView = getGoogleCalendarListView({
    count: googleCalendars.length,
    status: googleCalendarListStatus,
  });
  const googleCalendarEventsView = getGoogleCalendarEventsView(
    googleCalendarEventsStatus,
  );
  const selectedGoogleCalendars = googleCalendars.filter(
    (calendar) => calendar.selected,
  );
  const isCustomPeriodSelected = period === "任意期間";

  const handleGoogleAuthTest = async () => {
    accessTokenRef.current = null;
    setIsGoogleAuthorized(false);
    setAccessTokenPresent(false);
    setGoogleCalendars([]);
    setGoogleCalendarListStatus("idle");
    setGoogleCalendarEventsStatus("idle");

    if (!isGoogleClientConfigured) {
      setGoogleAuthStatus("missingClientId");
      return;
    }

    setGoogleAuthStatus("loading");

    const result = await requestGoogleCalendarAccessToken(googleClientId);

    if (result.ok) {
      accessTokenRef.current = result.accessToken;
      setAccessTokenPresent(true);
      setIsGoogleAuthorized(true);
      setGoogleAuthStatus("success");
      return;
    }

    setGoogleAuthStatus(
      result.reason === "libraryUnavailable" ? "libraryUnavailable" : "error",
    );
  };

  const handleCalendarListFetch = async () => {
    const accessToken = accessTokenRef.current;

    if (!accessToken) {
      setGoogleCalendarListStatus("unauthorized");
      return;
    }

    setGoogleCalendarListStatus("loading");

    const result = await listGoogleCalendars(accessToken);

    if (result.ok) {
      setGoogleCalendars(result.calendars);
      setGoogleCalendarListStatus("success");
      setGoogleCalendarEventsStatus("idle");
      return;
    }

    setGoogleCalendars([]);
    setGoogleCalendarListStatus(
      result.reason === "unauthorized" ? "unauthorized" : "error",
    );
  };

  const toggleGoogleCalendar = (id: string) => {
    setGoogleCalendars((current) =>
      current.map((calendar) =>
        calendar.id === id
          ? { ...calendar, selected: !calendar.selected }
          : calendar,
      ),
    );
    setGoogleCalendarEventsStatus("idle");
  };

  const handleGoogleCalendarEventsFetch = async () => {
    const accessToken = accessTokenRef.current;

    if (!accessToken) {
      setGoogleCalendarEventsStatus("unauthorized");
      return;
    }

    if (selectedGoogleCalendars.length === 0) {
      setGoogleCalendarEventsStatus("noSelection");
      return;
    }

    if (period === "任意期間") {
      return;
    }

    const timeRange = createGoogleCalendarTimeRange(period);
    const calendarNamesById = Object.fromEntries(
      selectedGoogleCalendars.map((calendar) => [calendar.id, calendar.summary]),
    );

    setGoogleCalendarEventsStatus("loading");

    const result = await listGoogleCalendarEvents({
      accessToken,
      calendarNamesById,
      selectedCalendarIds: selectedGoogleCalendars.map((calendar) => calendar.id),
      timeMax: timeRange.timeMax,
      timeMin: timeRange.timeMin,
    });

    if (!result.ok) {
      setGoogleCalendarEventsStatus(
        result.reason === "unauthorized" ? "unauthorized" : "error",
      );
      return;
    }

    onGoogleCalendarChecked();
    const normalizedEvents = normalizeGoogleCalendarEvents(result.events);

    if (normalizedEvents.length === 0) {
      setGoogleCalendarEventsStatus("empty");
      return;
    }

    if (result.reachedLimit) {
      setGoogleCalendarEventsStatus("tooMany");
      return;
    }

    onGoogleCalendarEntriesLoaded(normalizedEvents, period);
  };

  return (
    <ScreenStack>
      <PlainSection
        icon={LockKeyhole}
        title={googleExplainCopy.title}
        body={googleExplainCopy.body}
      />

      <section className="rounded-lg border border-white/75 bg-paper-soft/90 p-4 shadow-soft">
        <p className="text-base font-semibold leading-7 text-ink">
          Googleカレンダーから、残っていたことを見つけます。
        </p>
        <div className="mt-3 grid gap-2 text-sm leading-6">
          <GoogleQuickFact title="読むもの" value="予定タイトルと日時" />
          <GoogleQuickFact
            title="保存するもの"
            value="確認した短いラベル、カテゴリ、日付"
          />
          <GoogleQuickFact
            title="保存しないもの"
            value="本文・場所・参加者・元の予定タイトル"
          />
        </div>
        <p className="mt-3 rounded-lg border border-sage-soft bg-white/75 px-3 py-2 text-sm font-semibold leading-6 text-sage">
          勝手に保存しません。保存前に確認できます。
        </p>
        <button
          className="mt-4 flex min-h-11 w-full items-center justify-center rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-[#627760] focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-55"
          disabled={googleAuthStatus === "loading" || !isGoogleClientConfigured}
          onClick={handleGoogleAuthTest}
          type="button"
        >
          {googleAuthStatus === "loading"
            ? "Google連携を確認中"
            : "Google連携を確認する"}
        </button>
        <GoogleAuthStatusCard view={googleAuthView} />
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <button
            className="rounded-md border border-paper-line bg-white/70 px-2.5 py-1.5 text-ink-muted transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
            onClick={() =>
              onAction({
                action: "navigate",
                label: "この7日間から拾う",
                target: "reflection",
                variant: "quiet",
              })
            }
            type="button"
          >
            この7日間から拾う
          </button>
          <button
            className="rounded-md border border-paper-line bg-white/70 px-2.5 py-1.5 text-ink-muted transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
            onClick={() =>
              onAction({
                action: "navigate",
                label: "今回のことをひとつ残す",
                target: "oneTap",
                variant: "quiet",
              })
            }
            type="button"
          >
            今回のことをひとつ残す
          </button>
        </div>
      </section>

      <CollapsibleSection title="読み込むカレンダーと範囲">
      <FlowStep number={1} title="読むカレンダーと範囲">
        <div className="space-y-4">
          <div>
            <SectionLabel>読むカレンダー</SectionLabel>
            <div className="mt-3 rounded-lg border border-paper-line bg-white/75 p-3">
              <p className="text-sm leading-6 text-ink-muted">
                連携後にGoogleから実際のカレンダー一覧を読み込み、そこで読むカレンダーを選べます。
              </p>
              <p className="mt-2 text-xs leading-5 text-ink-muted">
                連携後に、今回読み取るカレンダーだけを選べます。
              </p>
            </div>
          </div>

          <div>
            <SectionLabel>今回確認する範囲</SectionLabel>
            <div className="mt-3 rounded-lg border border-sage-soft bg-sage-soft/35 p-4">
              <p className="text-sm font-semibold leading-6 text-ink">
                現在：{period}
              </p>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                {isCustomPeriodSelected
                  ? "無償βでは、まず7日間・14日間・30日間から選んで予定を確認できます。"
                  : `${period}分の予定を取得し、保存前に分類を確認します。`}
              </p>
            </div>
            <p className="mt-2 text-xs leading-5 text-ink-muted">
              ここで選ぶのは、今回Googleカレンダーから読み込んで確認する範囲です。
              保存済みの記録をどこまで見返せるかとは別です。
              未来の予定は通常の「ここまで」には含めません。
            </p>
            <button
              className="mt-3 flex min-h-10 w-full items-center justify-between rounded-lg border border-paper-line bg-white/75 px-3 py-2 text-left text-sm font-medium text-ink-muted transition hover:bg-paper-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
              onClick={() =>
                setShowAdvancedPeriodOptions((current) => !current)
              }
              type="button"
            >
              <span>過去の予定をまとめて確認する</span>
              {showAdvancedPeriodOptions ? (
                <ChevronUp size={16} strokeWidth={1.8} />
              ) : (
                <ChevronDown size={16} strokeWidth={1.8} />
              )}
            </button>
            {showAdvancedPeriodOptions && (
              <div className="mt-3 rounded-lg border border-paper-line bg-white/75 p-3">
                <p className="text-xs leading-5 text-ink-muted">
                  まとめて確認すると、分類確認の量が多くなる場合があります。
                  まずは過去7日から試すのがおすすめです。
                </p>
                <div className="mt-3 grid grid-cols-1 gap-2">
                  {advancedPeriodOptions.map((option) => (
                    <label
                      className={[
                        "flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-sm transition",
                        period === option
                          ? "border-sage bg-sage-soft text-sage"
                          : "border-paper-line bg-white/75 text-ink-muted hover:bg-paper-soft",
                      ].join(" ")}
                      key={option}
                    >
                      <input
                        checked={period === option}
                        className="sr-only"
                        onChange={() => setPeriod(option)}
                        type="radio"
                      />
                      <Clock3 size={14} strokeWidth={1.8} />
                      {option}
                    </label>
                  ))}
                </div>
                {period === "任意期間" && (
                  <p className="mt-2 rounded-md border border-paper-line bg-paper-soft p-2 text-xs leading-5 text-ink-muted">
                    無償βでは、まず7日間・14日間・30日間から選んで確認できます。
                  </p>
                )}
              </div>
            )}
          </div>

          <section className="rounded-lg border border-paper-line bg-white/75 p-4">
            <SectionLabel>今後の更新について</SectionLabel>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              現在の検証版では、毎日自動で裏側取得する機能は入れていません。
              アプリを開いた時、または手動で確認した時に予定を取得します。
              将来、明示的に同意したユーザーだけ、定期的な自動取得を検討します。
            </p>
          </section>
        </div>
      </FlowStep>
      </CollapsibleSection>

      <CollapsibleSection title="保存前確認の流れ">
      <FlowStep number={2} title="保存前に確認すること">
        <SectionLabel>保存前に確認できます</SectionLabel>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          読み取った予定は、すぐ保存しません。短いラベル・カテゴリ・確信度を確認してから、残すものだけ選べます。
        </p>
        <div className="mt-3 space-y-2">
          {previewItems.map((item) => (
            <div
              className="rounded-lg border border-paper-line bg-paper-soft p-3"
              key={item.label}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-ink">{item.label}</p>
                <span className="shrink-0 rounded-md bg-white/80 px-2 py-1 text-xs text-ink-muted">
                  確信度 {item.confidence}
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-ink-muted">
                {item.category}
              </p>
            </div>
          ))}
        </div>
        {uiMode === "review" ? (
          <div className="mt-3">
            <ActionList
              ctas={[
                {
                  action: "navigate",
                  label: "CSV / ICSで先に試す",
                  target: "calendarImport",
                  variant: "quiet",
                },
                {
                  action: "navigate",
                  label: "Google予定風サンプルで流れを確認する",
                  target: "calendarImport",
                  variant: "quiet",
                },
              ]}
              onAction={onAction}
            />
          </div>
        ) : (
          <p className="mt-3 rounded-lg border border-paper-line bg-white/70 px-3 py-3 text-sm leading-6 text-ink-muted">
            CSV / ICS分類確認は、設定から必要な時だけ開けます。
          </p>
        )}
      </FlowStep>
      </CollapsibleSection>

      <CollapsibleSection title="保存される情報/保存されない情報">
      <FlowStep number={3} title="読み取る情報と保存する情報">
        <div className="space-y-3">
          <InfoList
            icon={Eye}
            items={readableItems}
            title="読み取る情報"
          />
          <InfoList
            icon={Check}
            items={savedItems}
            title="保存するもの"
          />
          <InfoList
            icon={ShieldCheck}
            items={unsavedItems}
            title="保存しないもの"
          />
        </div>
        <p className="mt-2 rounded-md border border-paper-line bg-white/75 p-2 text-xs leading-5 text-ink-muted">
          確認して保存した短いラベル・カテゴリ・日付は残ります。
          ただし、今回の「確認する予定の範囲」と、Free/Plusの「見返せる期間」は別です。
        </p>
      </FlowStep>
      </CollapsibleSection>

      <CollapsibleSection
        open={isGoogleAuthorized && accessTokenPresent}
        title="連携後に読むカレンダーを選ぶ"
      >
      <FlowStep number={4} title="Google連携と予定取得を進める">
        <div className="mt-4 rounded-lg border border-paper-line bg-white/75 p-3">
          <SectionLabel>連携後の予定取得</SectionLabel>
          <p className="mt-2 text-xs leading-5 text-ink-muted">
            連携は上の主ボタンで確認します。成功後に、読むカレンダーの選択と予定確認をここから順番に進めます。
          </p>
          {googleAuthStatus !== "idle" && (
            <GoogleAuthStatusCard view={googleAuthView} />
          )}
          <p className="mt-3 rounded-md border border-paper-line bg-white/80 p-2 text-xs leading-5 text-ink-muted">
            認可のための一時情報は、証拠ラベルや手紙として保存しません。
          </p>
          {isGoogleAuthorized && accessTokenPresent && (
            <div className="mt-3 rounded-lg border border-paper-line bg-white/80 p-3">
              <SectionLabel>読むカレンダー</SectionLabel>
              <p className="mt-2 text-xs leading-5 text-ink-muted">
                Googleから実際のカレンダー一覧を読み込みます。予定の取得はまだ行いません。
              </p>
              <button
                className="mt-3 flex min-h-11 w-full items-center justify-center rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-[#627760] focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-55"
                disabled={googleCalendarListStatus === "loading"}
                onClick={handleCalendarListFetch}
                type="button"
              >
                {googleCalendarListStatus === "loading"
                  ? "カレンダーを読み込み中"
                  : "カレンダーを読み込む"}
              </button>
              {googleCalendarListStatus !== "idle" && (
                <GoogleAuthStatusCard view={googleCalendarListView} />
              )}
              {googleCalendars.length > 0 && (
                <div className="mt-3 space-y-2">
                  {googleCalendars.map((calendar) => (
                    <label
                      className="flex min-h-11 items-center gap-3 rounded-lg border border-paper-line bg-paper-soft px-3 py-2 text-sm text-ink"
                      key={calendar.id}
                    >
                      <input
                        checked={calendar.selected}
                        className="h-4 w-4 rounded border-paper-line text-sage focus:ring-sage"
                        onChange={() => toggleGoogleCalendar(calendar.id)}
                        type="checkbox"
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {calendar.summary}
                      </span>
                      {calendar.primary && (
                        <span className="shrink-0 rounded-md bg-white/80 px-2 py-1 text-xs text-ink-muted">
                          メイン
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}
              {googleCalendarListStatus === "success" &&
                selectedGoogleCalendars.length > 0 && (
                  <div className="mt-3 rounded-lg border border-paper-line bg-paper-soft p-3">
                    <SectionLabel>予定取得</SectionLabel>
                    {isCustomPeriodSelected ? (
                      <p className="mt-2 text-xs leading-5 text-ink-muted">
                        無償βでは、まず7日間・14日間・30日間から選んで予定を確認できます。
                      </p>
                    ) : (
                      <p className="mt-2 text-xs leading-5 text-ink-muted">
                        選択中の{selectedGoogleCalendars.length}
                        件のカレンダーから、今回確認する範囲として{period}
                        分の予定だけを取得します。取得後もすぐ保存せず、保存前確認で確認します。
                      </p>
                    )}
                    <button
                      className="mt-3 flex min-h-11 w-full items-center justify-center rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-[#627760] focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-55"
                      disabled={
                        googleCalendarEventsStatus === "loading" ||
                        isCustomPeriodSelected
                      }
                      onClick={handleGoogleCalendarEventsFetch}
                      type="button"
                    >
                      {googleCalendarEventsStatus === "loading"
                        ? "予定を取得中"
                        : isCustomPeriodSelected
                          ? "任意期間はまだ選べません"
                          : `${period}分の予定を確認する`}
                    </button>
                    {googleCalendarEventsStatus !== "idle" && (
                      <GoogleAuthStatusCard view={googleCalendarEventsView} />
                    )}
                  </div>
                )}
            </div>
          )}
        </div>
      </FlowStep>
      </CollapsibleSection>

      <CollapsibleSection title="連携しない場合">
      <section className="rounded-lg border border-paper-line bg-paper-soft/75 p-3">
        <p className="text-xs font-semibold text-ink">
          連携しなくても使えます
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <button
            className="rounded-md border border-paper-line bg-white/70 px-2.5 py-1.5 text-ink-muted transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
            onClick={() =>
              onAction({
                action: "navigate",
                label: "この7日間から拾う",
                target: "reflection",
                variant: "quiet",
              })
            }
            type="button"
          >
            この7日間から拾う
          </button>
          <button
            className="rounded-md border border-paper-line bg-white/70 px-2.5 py-1.5 text-ink-muted transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
            onClick={() =>
              onAction({
                action: "navigate",
                label: "今回のことをひとつ残す",
                target: "oneTap",
                variant: "quiet",
              })
            }
            type="button"
          >
            今回のことをひとつ残す
          </button>
          {uiMode === "review" && (
            <button
              className="rounded-md border border-paper-line bg-white/70 px-2.5 py-1.5 text-ink-muted transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
              onClick={() =>
                onAction({
                  action: "navigate",
                  label: "CSV・ICSで試す",
                  target: "calendarImport",
                  variant: "quiet",
                })
              }
              type="button"
            >
              CSV・ICSで試す
            </button>
          )}
        </div>
      </section>
      </CollapsibleSection>
    </ScreenStack>
  );
}

function GoogleQuickFact({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-paper-line bg-white/75 px-3 py-2">
      <p className="text-xs font-semibold leading-5 text-ink-muted">
        {title}
      </p>
      <p className="text-sm font-semibold leading-6 text-ink">{value}</p>
    </div>
  );
}

function CollapsibleSection({
  children,
  open = false,
  title,
}: {
  children: ReactNode;
  open?: boolean;
  title: string;
}) {
  return (
    <details className="rounded-lg border border-paper-line bg-white/70 p-3" open={open}>
      <summary className="cursor-pointer text-sm font-semibold text-ink">
        {title}
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

function getGoogleAuthView({
  accessTokenPresent,
  isGoogleAuthorized,
  isGoogleClientConfigured,
  status,
}: {
  accessTokenPresent: boolean;
  isGoogleAuthorized: boolean;
  isGoogleClientConfigured: boolean;
  status: GoogleAuthStatus;
}): GoogleAuthStatusView {
  if (!isGoogleClientConfigured || status === "missingClientId") {
    return {
      body: "Google連携はこの環境では未設定です。VITE_GOOGLE_CLIENT_ID を設定するとGoogle連携を確認できます。連携しなくても、手動追加、メモ貼り付け、この7日間から拾う流れは使えます。",
      icon: CircleAlert,
      title: "Google連携は未設定です",
      tone: "warning",
    };
  }

  if (status === "loading") {
    return {
      body: "Googleの確認画面を開いています。表示された内容を確認してください。",
      icon: Info,
      title: "Google連携を確認しています",
      tone: "info",
    };
  }

  if (status === "libraryUnavailable") {
    return {
      body: "Google連携に必要な読み込みが完了しませんでした。通信環境やブラウザ設定を確認してください。",
      icon: CircleAlert,
      title: "Google連携を読み込めませんでした",
      tone: "warning",
    };
  }

  if (status === "success" && isGoogleAuthorized && accessTokenPresent) {
    return {
      body: "連携の準備ができました。下のボタンで読むカレンダーを選び、予定確認へ進めます。",
      icon: CheckCircle2,
      title: "Google連携を確認できました",
      tone: "success",
    };
  }

  if (status === "error") {
    return {
      body: "Google連携は完了しませんでした。連携しなくても、メモ貼り付けやこの7日間から拾う流れは使えます。",
      icon: CircleAlert,
      title: "Google連携は完了しませんでした",
      tone: "warning",
    };
  }

  return {
    body: "準備ができたら、Googleアカウントで連携を確認できます。",
    icon: Info,
    title: "Google連携はまだ始まっていません",
    tone: "info",
  };
}

function getGoogleCalendarListView({
  count,
  status,
}: {
  count: number;
  status: GoogleCalendarListStatus;
}): GoogleAuthStatusView {
  if (status === "loading") {
    return {
      body: "Googleからカレンダー一覧だけを取得しています。予定は取得していません。",
      icon: Info,
      title: "カレンダーを読み込んでいます",
      tone: "info",
    };
  }

  if (status === "success") {
    return {
      body:
        count > 0
          ? "Googleから取得したカレンダー一覧です。まだ予定は取得していません。"
          : "Googleから取得できるカレンダーがありませんでした。まだ予定は取得していません。",
      icon: CheckCircle2,
      title: count > 0 ? `${count}件のカレンダーを読み込みました` : "カレンダーは0件でした",
      tone: "success",
    };
  }

  if (status === "unauthorized") {
    return {
      body: "Google連携の有効期限が切れた可能性があります。もう一度Google連携を確認してください。",
      icon: CircleAlert,
      title: "もう一度Google連携を確認してください",
      tone: "warning",
    };
  }

  if (status === "error") {
    return {
      body: "カレンダー一覧を取得できませんでした。連携しなくても、メモ貼り付けやこの7日間から拾う流れは使えます。",
      icon: CircleAlert,
      title: "カレンダー一覧を取得できませんでした",
      tone: "warning",
    };
  }

  return {
    body: "Google連携後に、カレンダー一覧だけを取得できます。",
    icon: Info,
    title: "カレンダー一覧はまだ取得していません",
    tone: "info",
  };
}

function getGoogleCalendarEventsView(
  status: GoogleCalendarEventsStatus,
): GoogleAuthStatusView {
  if (status === "loading") {
    return {
      body: "選択したカレンダーから予定一覧だけを取得しています。取得後もすぐ保存しません。",
      icon: Info,
      title: "予定を取得しています",
      tone: "info",
    };
  }

  if (status === "unauthorized") {
    return {
      body: "Google連携の有効期限が切れた可能性があります。もう一度Google連携を確認してください。",
      icon: CircleAlert,
      title: "もう一度Google連携を確認してください",
      tone: "warning",
    };
  }

  if (status === "error") {
    return {
      body: "予定を取得できませんでした。連携しなくても、メモ貼り付けやこの7日間から拾う流れは使えます。",
      icon: CircleAlert,
      title: "予定を取得できませんでした",
      tone: "warning",
    };
  }

  if (status === "empty") {
    return {
      body: "今回確認する範囲には、分類できる予定が見つかりませんでした。範囲やカレンダーを変えて試せます。",
      icon: Info,
      title: "予定は見つかりませんでした",
      tone: "info",
    };
  }

  if (status === "tooMany") {
    return {
      body: "まずは過去7日など短い範囲で確認するのがおすすめです。",
      icon: CircleAlert,
      title: "取得件数が多い可能性があります",
      tone: "warning",
    };
  }

  if (status === "noSelection") {
    return {
      body: "予定を確認するカレンダーを1つ以上選んでください。",
      icon: Info,
      title: "カレンダーを選んでください",
      tone: "info",
    };
  }

  return {
    body: "カレンダー一覧を取得した後、選択したカレンダーの予定を確認できます。",
    icon: Info,
    title: "予定取得はまだ始まっていません",
    tone: "info",
  };
}

export function createGoogleCalendarTimeRange(period: FetchablePeriodOption) {
  const now = new Date();
  const start = new Date(now);
  const daysByPeriod = {
    "過去7日": 7,
    "過去30日": 30,
    "過去90日": 90,
  } satisfies Record<FetchablePeriodOption, number>;

  start.setDate(start.getDate() - (daysByPeriod[period] - 1));
  start.setHours(0, 0, 0, 0);

  return {
    timeMax: now.toISOString(),
    timeMin: start.toISOString(),
  };
}

function GoogleAuthStatusCard({ view }: { view: GoogleAuthStatusView }) {
  const toneClass = getGoogleAuthToneClass(view.tone);
  const Icon = view.icon;

  return (
    <div
      aria-live="polite"
      className={`mt-3 rounded-lg border p-3 ${toneClass.container}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${toneClass.icon}`}
        >
          <Icon size={16} strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className={`text-sm font-semibold leading-6 ${toneClass.title}`}>
            {view.title}
          </p>
          <p className={`mt-1 text-xs leading-5 ${toneClass.body}`}>
            {view.body}
          </p>
        </div>
      </div>
    </div>
  );
}

function getGoogleAuthToneClass(tone: GoogleAuthStatusTone) {
  if (tone === "success") {
    return {
      body: "text-ink-muted",
      container: "border-sage bg-sage-soft/80",
      icon: "bg-white/75 text-sage",
      title: "text-sage",
    };
  }

  if (tone === "warning") {
    return {
      body: "text-ink-muted",
      container: "border-clay/50 bg-orange-50",
      icon: "bg-white/75 text-clay",
      title: "text-clay",
    };
  }

  return {
    body: "text-ink-muted",
    container: "border-paper-line bg-white/70",
    icon: "bg-sage-soft text-sage",
    title: "text-ink",
  };
}

type FlowStepProps = {
  children: ReactNode;
  number: number;
  title: string;
};

function FlowStep({ children, number, title }: FlowStepProps) {
  return (
    <section className="rounded-lg border border-white/75 bg-paper-soft/90 p-4 shadow-soft">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sage-soft text-xs font-semibold text-sage">
          {number}
        </span>
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}

type InfoListProps = {
  icon: LucideIcon;
  items: string[];
  title: string;
};

function InfoList({ icon: Icon, items, title }: InfoListProps) {
  return (
    <section className="rounded-lg border border-paper-line bg-white/75 p-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        <Icon className="text-sage" size={15} strokeWidth={1.8} />
        {title}
      </div>
      <ul className="mt-2 space-y-1 text-xs leading-5 text-ink-muted">
        {items.map((item) => (
          <li key={item}>・{item}</li>
        ))}
      </ul>
    </section>
  );
}
