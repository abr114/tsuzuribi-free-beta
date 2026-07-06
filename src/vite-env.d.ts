/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTACT_URL?: string;
  readonly VITE_FEEDBACK_URL?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
};

type GoogleTokenClientConfig = {
  callback: (response: GoogleTokenResponse) => void;
  client_id: string;
  error_callback?: (error: { message?: string; type?: string }) => void;
  scope: string;
};

type GoogleTokenClient = {
  requestAccessToken: (overrideConfig?: { prompt?: string; scope?: string }) => void;
};

interface Window {
  google?: {
    accounts?: {
      oauth2?: {
        initTokenClient: (config: GoogleTokenClientConfig) => GoogleTokenClient;
      };
    };
  };
}
