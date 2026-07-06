export type MockGoogleCalendar = {
  id: string;
  selected: boolean;
  summary: string;
};

export type MockGoogleCalendarEvent = {
  calendarId: string;
  calendarName: string;
  end?: {
    date?: string;
    dateTime?: string;
  };
  eventId: string;
  start: {
    date?: string;
    dateTime?: string;
  };
  status?: "confirmed" | "cancelled";
  summary?: string;
};

export const mockGoogleCalendars = [
  { id: "main", selected: true, summary: "メインカレンダー" },
  { id: "career", selected: true, summary: "確認用カレンダー" },
  { id: "study", selected: true, summary: "学習・作業" },
  { id: "private", selected: false, summary: "プライベート" },
] satisfies MockGoogleCalendar[];

export const mockGoogleCalendarEvents = [
  {
    calendarId: "career",
    calendarName: "確認用カレンダー",
    eventId: "mock-event-check-plan",
    start: { dateTime: "2026-05-12T10:00:00+09:00" },
    end: { dateTime: "2026-05-12T11:00:00+09:00" },
    status: "confirmed",
    summary: "予定を確認した",
  },
  {
    calendarId: "career",
    calendarName: "確認用カレンダー",
    eventId: "mock-event-contact",
    start: { dateTime: "2026-05-13T18:00:00+09:00" },
    end: { dateTime: "2026-05-13T18:30:00+09:00" },
    status: "confirmed",
    summary: "人に連絡した",
  },
  {
    calendarId: "study",
    calendarName: "学習・作業",
    eventId: "mock-event-study",
    start: { dateTime: "2026-05-14T20:00:00+09:00" },
    end: { dateTime: "2026-05-14T22:00:00+09:00" },
    status: "confirmed",
    summary: "資料を読んだ",
  },
  {
    calendarId: "private",
    calendarName: "プライベート",
    eventId: "mock-event-workout",
    start: { dateTime: "2026-05-15T07:30:00+09:00" },
    end: { dateTime: "2026-05-15T08:15:00+09:00" },
    status: "confirmed",
    summary: "筋トレ",
  },
  {
    calendarId: "career",
    calendarName: "確認用カレンダー",
    eventId: "mock-event-work-note",
    start: { dateTime: "2026-05-16T16:00:00+09:00" },
    end: { dateTime: "2026-05-16T17:30:00+09:00" },
    status: "confirmed",
    summary: "作業を少し進めた",
  },
  {
    calendarId: "study",
    calendarName: "学習・作業",
    eventId: "mock-event-lecture-design",
    start: { dateTime: "2026-05-17T13:00:00+09:00" },
    end: { dateTime: "2026-05-17T14:30:00+09:00" },
    status: "confirmed",
    summary: "N805 講義 コミュニケーションデザインシステム",
  },
  {
    calendarId: "private",
    calendarName: "プライベート",
    eventId: "mock-event-park",
    start: { dateTime: "2026-05-18T15:30:00+09:00" },
    end: { dateTime: "2026-05-18T17:00:00+09:00" },
    status: "confirmed",
    summary: "子供の迎えの後 公園に連れていく",
  },
  {
    calendarId: "main",
    calendarName: "メインカレンダー",
    eventId: "mock-event-chat",
    start: { dateTime: "2026-05-19T12:00:00+09:00" },
    end: { dateTime: "2026-05-19T13:00:00+09:00" },
    status: "confirmed",
    summary: "雑談",
  },
  {
    calendarId: "main",
    calendarName: "メインカレンダー",
    eventId: "mock-event-no-summary",
    start: { dateTime: "2026-05-20T09:00:00+09:00" },
    end: { dateTime: "2026-05-20T09:30:00+09:00" },
    status: "confirmed",
  },
  {
    calendarId: "main",
    calendarName: "メインカレンダー",
    eventId: "mock-event-cancelled",
    start: { dateTime: "2026-05-21T10:00:00+09:00" },
    end: { dateTime: "2026-05-21T11:00:00+09:00" },
    status: "cancelled",
    summary: "キャンセル済み予定",
  },
  {
    calendarId: "main",
    calendarName: "メインカレンダー",
    eventId: "mock-event-all-day",
    start: { date: "2026-05-22" },
    end: { date: "2026-05-23" },
    status: "confirmed",
    summary: "終日予定",
  },
  {
    calendarId: "study",
    calendarName: "勉強・制作",
    eventId: "mock-event-long-title",
    start: { dateTime: "2026-05-23T19:00:00+09:00" },
    end: { dateTime: "2026-05-23T20:00:00+09:00" },
    status: "confirmed",
    summary:
      "資料とメモをまとめて見直すための長いタイトルの予定",
  },
] satisfies MockGoogleCalendarEvent[];
