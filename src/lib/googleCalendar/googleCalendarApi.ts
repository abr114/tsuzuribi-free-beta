export type GoogleCalendarListItem = {
  id: string;
  primary: boolean;
  selected: boolean;
  summary: string;
};

export type ListGoogleCalendarsResult =
  | {
      calendars: GoogleCalendarListItem[];
      ok: true;
    }
  | {
      ok: false;
      reason: "requestFailed" | "unauthorized";
    };

export type GoogleCalendarEventItem = {
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
  status?: string;
  summary?: string;
};

export type ListGoogleCalendarEventsParams = {
  accessToken: string;
  calendarNamesById?: Record<string, string>;
  maxResultsPerCalendar?: number;
  selectedCalendarIds: string[];
  timeMax: string;
  timeMin: string;
};

export type ListGoogleCalendarEventsResult =
  | {
      events: GoogleCalendarEventItem[];
      ok: true;
      reachedLimit: boolean;
    }
  | {
      ok: false;
      reason: "requestFailed" | "unauthorized";
    };

type GoogleCalendarListResponse = {
  items?: Array<{
    id?: string;
    primary?: boolean;
    selected?: boolean;
    summary?: string;
    summaryOverride?: string;
  }>;
};

type GoogleCalendarEventsResponse = {
  items?: Array<{
    end?: {
      date?: string;
      dateTime?: string;
    };
    id?: string;
    start?: {
      date?: string;
      dateTime?: string;
    };
    status?: string;
    summary?: string;
  }>;
  nextPageToken?: string;
};

const calendarListEndpoint =
  "https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=100";
const eventsListFields =
  "items(id,summary,start,end,status),nextPageToken";
const defaultMaxResultsPerCalendar = 50;

export async function listGoogleCalendars(
  accessToken: string,
): Promise<ListGoogleCalendarsResult> {
  try {
    const response = await fetch(calendarListEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401 || response.status === 403) {
      return { ok: false, reason: "unauthorized" };
    }

    if (!response.ok) {
      return { ok: false, reason: "requestFailed" };
    }

    const payload = (await response.json()) as GoogleCalendarListResponse;
    const calendars = (payload.items ?? [])
      .map((item) => {
        const summary = (item.summaryOverride ?? item.summary ?? "").trim();

        if (!item.id || summary.length === 0) {
          return null;
        }

        return {
          id: item.id,
          primary: item.primary === true,
          selected: item.selected !== false,
          summary,
        } satisfies GoogleCalendarListItem;
      })
      .filter((item): item is GoogleCalendarListItem => item !== null);

    return { calendars, ok: true };
  } catch {
    return { ok: false, reason: "requestFailed" };
  }
}

export async function listGoogleCalendarEvents({
  accessToken,
  calendarNamesById = {},
  maxResultsPerCalendar = defaultMaxResultsPerCalendar,
  selectedCalendarIds,
  timeMax,
  timeMin,
}: ListGoogleCalendarEventsParams): Promise<ListGoogleCalendarEventsResult> {
  try {
    const results = await Promise.all(
      selectedCalendarIds.map((calendarId) =>
        fetchEventsForCalendar({
          accessToken,
          calendarId,
          calendarName: calendarNamesById[calendarId] ?? "Googleカレンダー",
          maxResults: maxResultsPerCalendar,
          timeMax,
          timeMin,
        }),
      ),
    );

    const failedResult = results.find((result) => !result.ok);

    if (failedResult && !failedResult.ok) {
      return { ok: false, reason: failedResult.reason };
    }

    return {
      events: results.flatMap((result) => (result.ok ? result.events : [])),
      ok: true,
      reachedLimit: results.some((result) => result.ok && result.reachedLimit),
    };
  } catch {
    return { ok: false, reason: "requestFailed" };
  }
}

type FetchEventsForCalendarParams = {
  accessToken: string;
  calendarId: string;
  calendarName: string;
  maxResults: number;
  timeMax: string;
  timeMin: string;
};

type FetchEventsForCalendarResult =
  | {
      events: GoogleCalendarEventItem[];
      ok: true;
      reachedLimit: boolean;
    }
  | {
      ok: false;
      reason: "requestFailed" | "unauthorized";
    };

async function fetchEventsForCalendar({
  accessToken,
  calendarId,
  calendarName,
  maxResults,
  timeMax,
  timeMin,
}: FetchEventsForCalendarParams): Promise<FetchEventsForCalendarResult> {
  const endpoint = createEventsListEndpoint({
    calendarId,
    maxResults,
    timeMax,
    timeMin,
  });
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401 || response.status === 403) {
    return { ok: false, reason: "unauthorized" };
  }

  if (!response.ok) {
    return { ok: false, reason: "requestFailed" };
  }

  const payload = (await response.json()) as GoogleCalendarEventsResponse;
  const events = (payload.items ?? [])
    .filter((item) => item.status !== "cancelled")
    .flatMap((item) => {
      if (!item.id || !item.start) {
        return [];
      }

      const event: GoogleCalendarEventItem = {
        calendarId,
        calendarName,
        eventId: item.id,
        start: item.start,
      };

      if (item.end) {
        event.end = item.end;
      }

      if (item.status) {
        event.status = item.status;
      }

      if (item.summary) {
        event.summary = item.summary;
      }

      return [event];
    });

  return {
    events,
    ok: true,
    reachedLimit: typeof payload.nextPageToken === "string",
  };
}

function createEventsListEndpoint({
  calendarId,
  maxResults,
  timeMax,
  timeMin,
}: {
  calendarId: string;
  maxResults: number;
  timeMax: string;
  timeMin: string;
}) {
  const params = new URLSearchParams({
    fields: eventsListFields,
    maxResults: String(maxResults),
    orderBy: "startTime",
    singleEvents: "true",
    timeMax,
    timeMin,
  });

  // events.list requires a calendarId path segment. Keep it URL encoded and
  // avoid persisting the raw id beyond this request/selection flow.
  return `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
    calendarId,
  )}/events?${params.toString()}`;
}
