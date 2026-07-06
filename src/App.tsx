import { useEffect, useState } from "react";
import { AppShell } from "./components/AppShell";
import { CalendarImportScreen } from "./screens/CalendarImportScreen";
import { GoogleExplainScreen } from "./screens/GoogleExplainScreen";
import { HardTimeScreen } from "./screens/HardTimeScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { LetterScreen } from "./screens/LetterScreen";
import { LowCountScreen } from "./screens/LowCountScreen";
import { MemoPasteScreen } from "./screens/MemoPasteScreen";
import { OneTapScreen } from "./screens/OneTapScreen";
import { PlusScreen } from "./screens/PlusScreen";
import { ProductAddScreen } from "./screens/ProductAddScreen";
import { ReflectionScreen } from "./screens/ReflectionScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { WeeklyScreen } from "./screens/WeeklyScreen";
import { reviewScreenNav } from "./data/mockContent";
import { createEvidenceLandingPayload } from "./lib/evidenceLanding";
import { createStoredPrototypeState } from "./storage/prototypeStorage";
import { localStorageAdapter } from "./storage/storageRepository";
import {
  addUniqueMockRecordDrafts,
  type AddMockRecordsResult,
} from "./storage/mockRecordDeduplication";
import type { CalendarImportInitialEntries } from "./lib/calendarImport/calendarImportTypes";
import type {
  CtaHandler,
  CtaItem,
  LastAddedEvidence,
  MockLetter,
  MockLetterDraft,
  MockLetterSource,
  MockRecord,
  MockRecordDraft,
  ScreenId,
  UiMode,
} from "./types/content";

type LetterEntrySource = Extract<MockLetterSource, "letter" | "hard-time">;

const reviewScreenIds = new Set<ScreenId>(
  reviewScreenNav.map((item) => item.id),
);

const productScreenIds = new Set<ScreenId>([
  "home",
  "productAdd",
  "oneTap",
  "reflection",
  "letter",
  "hardTime",
  "settings",
  "googleExplain",
  "calendarImport",
  "memoPaste",
  "plus",
]);

const storageRepository = localStorageAdapter;

function App() {
  const [storedState] = useState(() => storageRepository.read());
  const [canAccessReviewMode] = useState(() => hasReviewModeQuery());
  const [activeScreen, setActiveScreen] = useState<ScreenId>("home");
  const [uiMode, setUiMode] = useState<UiMode>(() =>
    canAccessReviewMode ? "review" : "product",
  );
  const [toast, setToast] = useState("");
  const [mockRecords, setMockRecords] = useState<MockRecord[]>(
    () => storedState?.mockRecords ?? [],
  );
  const [mockLetters, setMockLetters] = useState<MockLetter[]>(
    () => storedState?.mockLetters ?? [],
  );
  const [calendarImportInitialEntries, setCalendarImportInitialEntries] =
    useState<CalendarImportInitialEntries | null>(null);
  const [lastAddedEvidence, setLastAddedEvidence] =
    useState<LastAddedEvidence | null>(null);
  const [homeFocusEvidenceId, setHomeFocusEvidenceId] = useState<string | null>(
    null,
  );
  const [hasCheckedEvidence, setHasCheckedEvidence] = useState(
    () => storedState !== null,
  );
  const [letterEntrySource, setLetterEntrySource] =
    useState<LetterEntrySource>("letter");

  useEffect(() => {
    if (
      mockRecords.length === 0 &&
      mockLetters.length === 0 &&
      !hasCheckedEvidence
    ) {
      storageRepository.clear();
      return;
    }

    storageRepository.write(createStoredPrototypeState(mockRecords, mockLetters));
  }, [hasCheckedEvidence, mockRecords, mockLetters]);

  useEffect(() => {
    window.scrollTo({ left: 0, top: 0 });
  }, [activeScreen]);

  const addMockRecords = (records: MockRecordDraft[]) => {
    setHasCheckedEvidence(true);

    const result = addUniqueMockRecordDrafts(mockRecords, records);

    if (result.addedCount > 0) {
      setMockRecords(result.records);
    }

    if (result.landingRecords.length > 0) {
      setLastAddedEvidence(createEvidenceLandingPayload(result.landingRecords));
    }

    return result;
  };

  const changeScreen = (screen: ScreenId) => {
    if (screen === "letter") {
      setLetterEntrySource(getLetterEntrySource(activeScreen));
    }

    setActiveScreen(screen);
    setToast("");
  };

  const changeUiMode = (mode: UiMode) => {
    if (mode === "review" && !canAccessReviewMode) {
      return;
    }

    setUiMode(mode);
    setToast("");

    if (mode === "review" && !reviewScreenIds.has(activeScreen)) {
      setActiveScreen("home");
      return;
    }

    if (mode === "product" && !productScreenIds.has(activeScreen)) {
      setActiveScreen("home");
    }
  };

  const showLastAddedEvidenceInHome = () => {
    setActiveScreen("home");
    setHomeFocusEvidenceId(lastAddedEvidence?.id ?? null);
    setToast("");
  };

  const addMockLetter = (draft: MockLetterDraft) => {
    const now = Date.now();
    const createdAt = normalizeLetterCreatedAt(draft.createdAt, now);

    setMockLetters((current) => [
      ...current,
      {
        ...draft,
        createdAt,
        createdAtLabel: formatLetterCreatedAtLabel(createdAt),
        id: `${now}-${current.length}-letter`,
      },
    ]);
  };

  const deleteMockLetter = (id: string) => {
    setMockLetters((current) => current.filter((letter) => letter.id !== id));
  };

  const saveLetter = (
    letter: MockLetterDraft,
    record: MockRecordDraft,
  ) => {
    addMockLetter(letter);
    return addMockRecords([record]);
  };

  const showCalendarImportWithGoogleEntries = (
    entries: CalendarImportInitialEntries["entries"],
    rangeLabel = "過去7日",
  ) => {
    setHasCheckedEvidence(true);
    setCalendarImportInitialEntries({
      entries,
      id: `${Date.now()}-google-calendar-import`,
      rangeLabel,
      sourceName: "Googleカレンダー",
      sourceType: "GoogleCalendar",
    });
    setActiveScreen("calendarImport");
    setToast("");
  };

  const clearPrototypeData = () => {
    const confirmed =
      typeof window === "undefined" ||
      window.confirm("この端末に保存された記録と手紙を消しますか？");

    if (!confirmed) {
      return;
    }

    setMockRecords([]);
    setMockLetters([]);
    setLastAddedEvidence(null);
    setHomeFocusEvidenceId(null);
    setHasCheckedEvidence(false);
    storageRepository.clear();
    setToast("この端末の記録を消しました");
  };

  const handleAction: CtaHandler = (cta) => {
    if (cta.action === "navigate") {
      if (cta.target === "letter") {
        setLetterEntrySource(getLetterEntrySource(activeScreen));
      }

      setActiveScreen(cta.target);
      setToast("");
      return;
    }

    setToast(
      cta.mockMessage ??
        `「${cta.label}」を押した状態の確認です。実連携や送信はありません。`,
    );
  };

  return (
    <AppShell
      activeScreen={activeScreen}
      canAccessReviewMode={canAccessReviewMode}
      mockLetters={mockLetters}
      mockRecords={mockRecords}
      homeFocusEvidenceId={homeFocusEvidenceId}
      lastAddedEvidence={lastAddedEvidence}
      onScreenChange={changeScreen}
      onUiModeChange={changeUiMode}
      onViewLastAddedEvidence={showLastAddedEvidenceInHome}
      toast={toast}
      uiMode={uiMode}
    >
      {renderScreen(
        activeScreen,
        uiMode,
        handleAction,
        mockRecords,
        mockLetters,
        letterEntrySource,
        addMockRecords,
        saveLetter,
        deleteMockLetter,
        clearPrototypeData,
        hasCheckedEvidence,
        () => setHasCheckedEvidence(true),
        calendarImportInitialEntries,
        setCalendarImportInitialEntries,
        showCalendarImportWithGoogleEntries,
        showLastAddedEvidenceInHome,
        lastAddedEvidence,
        homeFocusEvidenceId,
        canAccessReviewMode,
        changeUiMode,
      )}
    </AppShell>
  );
}

function hasReviewModeQuery() {
  if (typeof window === "undefined") {
    return false;
  }

  return new URLSearchParams(window.location.search).get("review") === "1";
}

function renderScreen(
  activeScreen: ScreenId,
  uiMode: UiMode,
  onAction: (cta: CtaItem) => void,
  mockRecords: MockRecord[],
  mockLetters: MockLetter[],
  letterEntrySource: LetterEntrySource,
  onAddRecords: (records: MockRecordDraft[]) => AddMockRecordsResult,
  onSaveLetter: (
    letter: MockLetterDraft,
    record: MockRecordDraft,
  ) => AddMockRecordsResult,
  onDeleteLetter: (id: string) => void,
  onClearPrototypeData: () => void,
  hasCheckedEvidence: boolean,
  onEvidenceChecked: () => void,
  calendarImportInitialEntries: CalendarImportInitialEntries | null,
  onCalendarImportInitialEntriesConsumed: (
    entries: CalendarImportInitialEntries | null,
  ) => void,
  onGoogleCalendarEntriesLoaded: (
    entries: CalendarImportInitialEntries["entries"],
    rangeLabel?: string,
  ) => void,
  onViewLastAddedEvidence: () => void,
  lastAddedEvidence: LastAddedEvidence | null,
  homeFocusEvidenceId: string | null,
  canAccessReviewMode: boolean,
  onUiModeChange: (mode: UiMode) => void,
) {
  switch (activeScreen) {
    case "home":
      return (
        <HomeScreen
          mockLetters={mockLetters}
          mockRecords={mockRecords}
          focusedEvidenceId={homeFocusEvidenceId}
          hasCheckedEvidence={hasCheckedEvidence}
          lastAddedEvidence={lastAddedEvidence}
          onClearPrototypeData={onClearPrototypeData}
          onAction={onAction}
          uiMode={uiMode}
        />
      );
    case "lowCount":
      return <LowCountScreen onAction={onAction} />;
    case "reflection":
      return (
        <ReflectionScreen
          onAction={onAction}
          onAddRecords={onAddRecords}
          onViewLastAddedEvidence={onViewLastAddedEvidence}
        />
      );
    case "googleExplain":
      return (
        <GoogleExplainScreen
          onAction={onAction}
          onGoogleCalendarChecked={onEvidenceChecked}
          onGoogleCalendarEntriesLoaded={onGoogleCalendarEntriesLoaded}
          uiMode={uiMode}
        />
      );
    case "calendarImport":
      return (
        <CalendarImportScreen
          initialEntries={calendarImportInitialEntries}
          onAction={onAction}
          onAddRecords={onAddRecords}
          onEvidenceChecked={onEvidenceChecked}
          onInitialEntriesConsumed={onCalendarImportInitialEntriesConsumed}
          onViewLastAddedEvidence={onViewLastAddedEvidence}
          uiMode={uiMode}
        />
      );
    case "memoPaste":
      return (
        <MemoPasteScreen
          onAddRecords={onAddRecords}
          onViewLastAddedEvidence={onViewLastAddedEvidence}
          uiMode={uiMode}
        />
      );
    case "hardTime":
      return (
        <HardTimeScreen
          mockLetters={mockLetters}
          mockRecords={mockRecords}
          onAction={onAction}
          uiMode={uiMode}
        />
      );
    case "letter":
      return (
        <LetterScreen
          mockLetters={mockLetters}
          entrySource={letterEntrySource}
          onAction={onAction}
          onDeleteLetter={onDeleteLetter}
          onSaveLetter={onSaveLetter}
          onViewLastAddedEvidence={onViewLastAddedEvidence}
          uiMode={uiMode}
        />
      );
    case "oneTap":
      return (
        <OneTapScreen
          onAction={onAction}
          onAddRecords={onAddRecords}
          onViewLastAddedEvidence={onViewLastAddedEvidence}
        />
      );
    case "productAdd":
      return <ProductAddScreen onAction={onAction} />;
    case "settings":
      return (
        <SettingsScreen
          canAccessReviewMode={canAccessReviewMode}
          mockLetters={mockLetters}
          mockRecords={mockRecords}
          onAction={onAction}
          onClearPrototypeData={onClearPrototypeData}
          onUiModeChange={onUiModeChange}
        />
      );
    case "weekly":
      return <WeeklyScreen onAction={onAction} />;
    case "plus":
      return <PlusScreen onAction={onAction} />;
    default:
      return (
        <HomeScreen
          mockLetters={mockLetters}
          mockRecords={mockRecords}
          focusedEvidenceId={homeFocusEvidenceId}
          hasCheckedEvidence={hasCheckedEvidence}
          lastAddedEvidence={lastAddedEvidence}
          onClearPrototypeData={onClearPrototypeData}
          onAction={onAction}
          uiMode={uiMode}
        />
      );
  }
}

function formatLetterCreatedAtLabel(time: number) {
  const createdAt = new Date(time);
  const date = createdAt.toLocaleDateString("ja-JP", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const clock = createdAt.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
  });

  return `${date} ${clock}`;
}

function normalizeLetterCreatedAt(
  createdAt: MockLetterDraft["createdAt"],
  fallback: number,
) {
  if (typeof createdAt === "number" && Number.isFinite(createdAt)) {
    return createdAt;
  }

  if (typeof createdAt === "string" && createdAt.trim()) {
    const parsed = Number(createdAt);
    const time = /^\d+$/.test(createdAt.trim())
      ? parsed
      : new Date(createdAt).getTime();

    if (Number.isFinite(time)) {
      return time;
    }
  }

  return fallback;
}

function getLetterEntrySource(activeScreen: ScreenId): LetterEntrySource {
  return activeScreen === "hardTime" ? "hard-time" : "letter";
}

export default App;
