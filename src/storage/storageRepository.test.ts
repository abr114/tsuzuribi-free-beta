import { afterEach, describe, expect, it, vi } from "vitest";
import { createStoredPrototypeState, STORAGE_KEY } from "./prototypeStorage";
import { localStorageAdapter } from "./storageRepository";
import type { MockRecord } from "../types/content";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("localStorageAdapter", () => {
  it("keeps the current prototype storage key readable through the repository", () => {
    const storage = createMemoryStorage();
    vi.stubGlobal("window", { localStorage: storage });
    const state = createStoredPrototypeState(
      [createStoredRecord("memo-1", "memoPaste")],
      [],
    );

    storage.setItem(STORAGE_KEY, JSON.stringify(state));

    expect(localStorageAdapter.read()).toEqual(state);
    expect(storage.getItem(STORAGE_KEY)).toBe(JSON.stringify(state));
  });

  it("writes and clears through the same localStorage key", () => {
    const storage = createMemoryStorage();
    vi.stubGlobal("window", { localStorage: storage });
    const state = createStoredPrototypeState(
      [createStoredRecord("manual-1", "manual")],
      [],
    );

    localStorageAdapter.write(state);
    expect(storage.getItem(STORAGE_KEY)).toBe(JSON.stringify(state));

    localStorageAdapter.clear();
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
  });
});

function createStoredRecord(
  id: string,
  source: MockRecord["source"],
): MockRecord {
  return {
    category: "build",
    categoryLabel: "積み上げた日の証拠",
    dateLabel: "今日",
    id,
    label: "資料を読んだ",
    source,
  };
}

function createMemoryStorage(): Storage {
  const data = new Map<string, string>();

  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key: string) => data.get(key) ?? null,
    key: (index: number) => Array.from(data.keys())[index] ?? null,
    removeItem: (key: string) => {
      data.delete(key);
    },
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}
