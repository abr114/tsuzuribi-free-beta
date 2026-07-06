import { afterEach, describe, expect, it, vi } from "vitest";
import {
  requestGoogleCalendarAccessToken,
  resetGoogleIdentityServicesLoaderForTest,
} from "./googleOAuth";

afterEach(() => {
  vi.unstubAllGlobals();
  resetGoogleIdentityServicesLoaderForTest();
});

describe("requestGoogleCalendarAccessToken", () => {
  it("returns a clear unavailable result when GIS cannot be loaded", async () => {
    vi.stubGlobal("window", {
      clearInterval,
      clearTimeout,
      google: undefined,
      setInterval,
      setTimeout,
    });
    vi.stubGlobal("document", undefined);

    await expect(requestGoogleCalendarAccessToken("client-id")).resolves.toEqual({
      ok: false,
      reason: "libraryUnavailable",
    });
  });

  it("uses an already loaded Google Identity Services token client", async () => {
    const initTokenClient = vi.fn(
      (config: { callback: (response: { access_token?: string }) => void }) =>
        ({
          requestAccessToken: () =>
            config.callback({ access_token: "test-token" }),
        }),
    );

    vi.stubGlobal("window", {
      clearInterval,
      clearTimeout,
      google: {
        accounts: {
          oauth2: {
            initTokenClient,
          },
        },
      },
      setInterval,
      setTimeout,
    });

    await expect(requestGoogleCalendarAccessToken("client-id")).resolves.toEqual({
      accessToken: "test-token",
      ok: true,
    });
    expect(initTokenClient).toHaveBeenCalledWith(
      expect.objectContaining({
        client_id: "client-id",
      }),
    );
  });
});
