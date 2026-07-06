import { afterEach, describe, expect, it, vi } from "vitest";
import {
  listGoogleCalendarEvents,
  listGoogleCalendars,
} from "./googleCalendarApi";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("listGoogleCalendars", () => {
  it("fetches calendarList and returns only display fields needed by the UI", async () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) =>
      new Response(
        JSON.stringify({
          items: [
            {
              id: "primary-user@example.com",
              primary: true,
              selected: true,
              summary: "メインカレンダー",
            },
            {
              id: "study-calendar",
              selected: false,
              summary: "勉強",
              summaryOverride: "勉強・制作",
            },
            {
              id: "no-summary",
            },
          ],
        }),
        { status: 200 },
      ),
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const result = await listGoogleCalendars("token-for-test");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/calendar/v3/users/me/calendarList");
    expect(String(url)).not.toContain("/events");
    expect(options).toMatchObject({
      headers: {
        Authorization: "Bearer token-for-test",
      },
    });
    expect(result).toEqual({
      calendars: [
        {
          id: "primary-user@example.com",
          primary: true,
          selected: true,
          summary: "メインカレンダー",
        },
        {
          id: "study-calendar",
          primary: false,
          selected: false,
          summary: "勉強・制作",
        },
      ],
      ok: true,
    });
  });

  it("returns unauthorized for 401 and 403 responses", async () => {
    globalThis.fetch = vi.fn(
      async () => new Response(null, { status: 401 }),
    ) as unknown as typeof fetch;

    await expect(listGoogleCalendars("expired-token")).resolves.toEqual({
      ok: false,
      reason: "unauthorized",
    });

    globalThis.fetch = vi.fn(
      async () => new Response(null, { status: 403 }),
    ) as unknown as typeof fetch;

    await expect(listGoogleCalendars("missing-scope")).resolves.toEqual({
      ok: false,
      reason: "unauthorized",
    });
  });

  it("returns requestFailed for non-auth failures", async () => {
    globalThis.fetch = vi.fn(
      async () => new Response(null, { status: 500 }),
    ) as unknown as typeof fetch;

    await expect(listGoogleCalendars("token")).resolves.toEqual({
      ok: false,
      reason: "requestFailed",
    });
  });
});

describe("listGoogleCalendarEvents", () => {
  it("fetches events.list for each selected calendar with the minimum query shape", async () => {
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, _init?: RequestInit) => {
        const url = String(input);

        if (url.includes("career%40example.com")) {
          return new Response(
            JSON.stringify({
              items: [
                {
                  end: { dateTime: "2026-05-12T11:00:00+09:00" },
                  id: "event-interview",
                  start: { dateTime: "2026-05-12T10:00:00+09:00" },
                  status: "confirmed",
                  summary: "予定を確認した",
                },
                {
                  id: "event-cancelled",
                  start: { dateTime: "2026-05-13T10:00:00+09:00" },
                  status: "cancelled",
                  summary: "キャンセル済み予定",
                },
              ],
            }),
            { status: 200 },
          );
        }

        return new Response(
          JSON.stringify({
            items: [
              {
                id: "event-no-summary",
                start: { date: "2026-05-14" },
                status: "confirmed",
              },
            ],
          }),
          { status: 200 },
        );
      },
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const result = await listGoogleCalendarEvents({
      accessToken: "token-for-test",
      calendarNamesById: {
        "career@example.com": "確認用カレンダー",
        study: "学習・作業",
      },
      maxResultsPerCalendar: 20,
      selectedCalendarIds: ["career@example.com", "study"],
      timeMax: "2026-05-18T00:00:00.000Z",
      timeMin: "2026-05-01T00:00:00.000Z",
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const urls = fetchMock.mock.calls.map(([url]) => String(url));
    expect(urls.every((url) => url.includes("/events"))).toBe(true);
    expect(urls.some((url) => url.includes("calendarList"))).toBe(false);
    for (const url of urls) {
      const parsedUrl = new URL(url);
      expect(parsedUrl.searchParams.get("timeMin")).toBe(
        "2026-05-01T00:00:00.000Z",
      );
      expect(parsedUrl.searchParams.get("timeMax")).toBe(
        "2026-05-18T00:00:00.000Z",
      );
      expect(parsedUrl.searchParams.get("singleEvents")).toBe("true");
      expect(parsedUrl.searchParams.get("orderBy")).toBe("startTime");
      expect(parsedUrl.searchParams.get("maxResults")).toBe("20");
      expect(parsedUrl.searchParams.get("fields")).toBe(
        "items(id,summary,start,end,status),nextPageToken",
      );
    }
    expect(result).toEqual({
      events: [
        {
          calendarId: "career@example.com",
          calendarName: "確認用カレンダー",
          end: { dateTime: "2026-05-12T11:00:00+09:00" },
          eventId: "event-interview",
          start: { dateTime: "2026-05-12T10:00:00+09:00" },
          status: "confirmed",
          summary: "予定を確認した",
        },
        {
          calendarId: "study",
          calendarName: "学習・作業",
          end: undefined,
          eventId: "event-no-summary",
          start: { date: "2026-05-14" },
          status: "confirmed",
          summary: undefined,
        },
      ],
      ok: true,
      reachedLimit: false,
    });
  });

  it("keeps summaryless events as confirmation targets and reports pagination limits", async () => {
    globalThis.fetch = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            items: [
              {
                id: "event-no-summary",
                start: { date: "2026-05-18" },
                status: "confirmed",
              },
            ],
            nextPageToken: "next-page",
          }),
          { status: 200 },
        ),
    ) as unknown as typeof fetch;

    const result = await listGoogleCalendarEvents({
      accessToken: "token-for-test",
      selectedCalendarIds: ["primary"],
      timeMax: "2026-05-18T00:00:00.000Z",
      timeMin: "2026-05-01T00:00:00.000Z",
    });

    expect(result).toMatchObject({
      events: [
        {
          calendarId: "primary",
          calendarName: "Googleカレンダー",
          eventId: "event-no-summary",
          start: { date: "2026-05-18" },
        },
      ],
      ok: true,
      reachedLimit: true,
    });
    expect(result.ok && result.events[0]).not.toHaveProperty("summary");
  });

  it("returns unauthorized for 401 and 403 event responses", async () => {
    globalThis.fetch = vi.fn(
      async () => new Response(null, { status: 403 }),
    ) as unknown as typeof fetch;

    await expect(
      listGoogleCalendarEvents({
        accessToken: "expired-token",
        selectedCalendarIds: ["primary"],
        timeMax: "2026-05-18T00:00:00.000Z",
        timeMin: "2026-05-01T00:00:00.000Z",
      }),
    ).resolves.toEqual({
      ok: false,
      reason: "unauthorized",
    });
  });

  it("does not write access tokens to localStorage or sessionStorage", async () => {
    const localStorageSetItem = vi.fn();
    const sessionStorageSetItem = vi.fn();
    vi.stubGlobal("localStorage", { setItem: localStorageSetItem });
    vi.stubGlobal("sessionStorage", { setItem: sessionStorageSetItem });
    globalThis.fetch = vi.fn(
      async () => new Response(JSON.stringify({ items: [] }), { status: 200 }),
    ) as unknown as typeof fetch;

    await listGoogleCalendarEvents({
      accessToken: "token-for-test",
      selectedCalendarIds: ["primary"],
      timeMax: "2026-05-18T00:00:00.000Z",
      timeMin: "2026-05-01T00:00:00.000Z",
    });

    expect(localStorageSetItem).not.toHaveBeenCalled();
    expect(sessionStorageSetItem).not.toHaveBeenCalled();
  });
});
