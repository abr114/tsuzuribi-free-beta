import type { StoredPrototypeState } from "../types/content";
import {
  clearStoredPrototypeState,
  readStoredPrototypeState,
  writeStoredPrototypeState,
} from "./prototypeStorage";

export type StorageRepository = {
  clear: () => void;
  read: () => StoredPrototypeState | null;
  write: (state: StoredPrototypeState) => void;
};

export const localStorageAdapter: StorageRepository = {
  clear: clearStoredPrototypeState,
  read: readStoredPrototypeState,
  write: writeStoredPrototypeState,
};

// TODO: Implement after user auth, consent records, and DB schema are settled.
// The beta app is intentionally wired only to localStorageAdapter.
export type RemoteDbAdapter = StorageRepository;
export const remoteDbAdapter: RemoteDbAdapter | null = null;
