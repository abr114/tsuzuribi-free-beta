export const GOOGLE_CALENDAR_READONLY_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events.readonly",
  "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
] as const;

type GoogleCalendarAccessTokenResult =
  | {
      accessToken: string;
      ok: true;
    }
  | {
      ok: false;
      reason: "libraryUnavailable" | "notCompleted";
    };

type GoogleIdentityServicesLoadResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      reason: "libraryUnavailable";
    };

const authTimeoutMs = 120_000;
const gisScriptId = "google-identity-services-client";
const gisScriptSrc = "https://accounts.google.com/gsi/client";
const gisLoadTimeoutMs = 10_000;
const gisPollIntervalMs = 100;

let gisLoadPromise: Promise<GoogleIdentityServicesLoadResult> | null = null;

export async function requestGoogleCalendarAccessToken(
  clientId: string,
): Promise<GoogleCalendarAccessTokenResult> {
  if (typeof window === "undefined") {
    return {
      ok: false,
      reason: "libraryUnavailable",
    };
  }

  const loadResult = await ensureGoogleIdentityServices();

  if (!loadResult.ok) {
    return {
      ok: false,
      reason: "libraryUnavailable",
    };
  }

  const oauth2 = window.google?.accounts?.oauth2;

  if (!oauth2) {
    return {
      ok: false,
      reason: "libraryUnavailable",
    };
  }

  return new Promise((resolve) => {
    let settled = false;
    let timeoutId: number | undefined;

    const settle = (result: GoogleCalendarAccessTokenResult) => {
      if (settled) {
        return;
      }

      settled = true;

      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }

      resolve(result);
    };

    timeoutId = window.setTimeout(() => {
      settle({
        ok: false,
        reason: "notCompleted",
      });
    }, authTimeoutMs);

    try {
      const client = oauth2.initTokenClient({
        callback: (response) => {
          if (response.access_token) {
            settle({
              accessToken: response.access_token,
              ok: true,
            });
            return;
          }

          settle({
            ok: false,
            reason: "notCompleted",
          });
        },
        client_id: clientId,
        error_callback: () => {
          settle({
            ok: false,
            reason: "notCompleted",
          });
        },
        scope: GOOGLE_CALENDAR_READONLY_SCOPES.join(" "),
      });

      client.requestAccessToken();
    } catch {
      settle({
        ok: false,
        reason: "notCompleted",
      });
    }
  });
}

export function ensureGoogleIdentityServices(): Promise<GoogleIdentityServicesLoadResult> {
  if (typeof window === "undefined") {
    return Promise.resolve({ ok: false, reason: "libraryUnavailable" });
  }

  if (window.google?.accounts?.oauth2) {
    return Promise.resolve({ ok: true });
  }

  if (gisLoadPromise) {
    return gisLoadPromise;
  }

  gisLoadPromise = new Promise((resolve) => {
    if (typeof document === "undefined") {
      resolve({ ok: false, reason: "libraryUnavailable" });
      return;
    }

    let settled = false;
    let timeoutId: number | undefined;
    let pollId: number | undefined;

    const cleanup = () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }

      if (pollId !== undefined) {
        window.clearInterval(pollId);
      }
    };

    const settle = (result: GoogleIdentityServicesLoadResult) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      resolve(result);
    };

    const checkReady = () => {
      if (window.google?.accounts?.oauth2) {
        settle({ ok: true });
      }
    };

    const existingScript =
      document.getElementById(gisScriptId) ??
      Array.from(document.scripts).find((script) => script.src === gisScriptSrc);

    const script =
      existingScript instanceof HTMLScriptElement
        ? existingScript
        : document.createElement("script");

    if (!existingScript) {
      script.id = gisScriptId;
      script.src = gisScriptSrc;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    script.addEventListener("load", checkReady, { once: true });
    script.addEventListener(
      "error",
      () => settle({ ok: false, reason: "libraryUnavailable" }),
      { once: true },
    );

    pollId = window.setInterval(checkReady, gisPollIntervalMs);
    timeoutId = window.setTimeout(() => {
      settle({ ok: false, reason: "libraryUnavailable" });
      gisLoadPromise = null;
    }, gisLoadTimeoutMs);

    checkReady();
  });

  return gisLoadPromise;
}

export function resetGoogleIdentityServicesLoaderForTest() {
  gisLoadPromise = null;
}
