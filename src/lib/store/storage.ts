import type { PersistStorage, StorageValue } from "zustand/middleware";

/**
 * LocalStorage adapter that never throws: private mode, quota errors and
 * corrupted JSON all degrade to "no saved data" instead of crashing the app.
 */
export function safeJsonStorage<T>(): PersistStorage<T> {
  return {
    getItem(name) {
      try {
        const raw = window.localStorage.getItem(name);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as StorageValue<T>;
        return parsed && typeof parsed === "object" && "state" in parsed ? parsed : null;
      } catch {
        return null;
      }
    },
    setItem(name, value) {
      try {
        window.localStorage.setItem(name, JSON.stringify(value));
      } catch {
        // Storage full or unavailable; progress just won't persist this session.
      }
    },
    removeItem(name) {
      try {
        window.localStorage.removeItem(name);
      } catch {
        // ignore
      }
    },
  };
}
