"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DatasetId } from "@/lib/sql/types";
import { safeJsonStorage } from "./storage";

export interface HistoryEntry {
  id: string;
  sql: string;
  dataset: DatasetId;
  status: "success" | "error";
  timeMs: number;
  rowCount: number | null;
  error?: string;
  at: number;
}

export interface FavoriteQuery {
  id: string;
  title: string;
  sql: string;
  dataset: DatasetId;
  createdAt: number;
}

export interface ChallengeCompletion {
  completedAt: number;
  hintsUsed: number;
}

interface PersistedState {
  completedLessons: string[];
  completedChallenges: Record<number, ChallengeCompletion>;
  /** How many hints the user has revealed per challenge. */
  hintsRevealed: Record<number, number>;
  challengeDrafts: Record<number, string>;
  lastLesson: string | null;
  lastChallenge: number | null;
  queriesExecuted: number;
  history: HistoryEntry[];
  favorites: FavoriteQuery[];
  playground: { sql: string; dataset: DatasetId };
  settings: { pageSize: number; sidebarCollapsed: boolean };
}

interface Actions {
  completeLesson: (slug: string) => void;
  uncompleteLesson: (slug: string) => void;
  visitLesson: (slug: string) => void;
  visitChallenge: (id: number) => void;
  completeChallenge: (id: number) => void;
  revealHint: (id: number) => void;
  saveChallengeDraft: (id: number, sql: string) => void;
  recordQuery: (entry: Omit<HistoryEntry, "id" | "at">) => void;
  removeHistory: (id: string) => void;
  clearHistory: () => void;
  addFavorite: (title: string, sql: string, dataset: DatasetId) => void;
  removeFavorite: (id: string) => void;
  setPlaygroundSql: (sql: string) => void;
  setPlaygroundDataset: (dataset: DatasetId) => void;
  openInPlayground: (sql: string, dataset: DatasetId) => void;
  setPageSize: (size: number) => void;
  toggleSidebar: () => void;
  resetProgress: () => void;
}

const MAX_HISTORY = 200;

const initialState: PersistedState = {
  completedLessons: [],
  completedChallenges: {},
  hintsRevealed: {},
  challengeDrafts: {},
  lastLesson: null,
  lastChallenge: null,
  queriesExecuted: 0,
  history: [],
  favorites: [],
  playground: { sql: "SELECT *\nFROM products\nLIMIT 10;", dataset: "ecommerce" },
  settings: { pageSize: 50, sidebarCollapsed: false },
};

const baseStorage = safeJsonStorage<PersistedState>();

// persist writes on every set(). Until saved data has been loaded, the store
// only holds defaults — writing them would wipe the user's progress. So block
// writes until rehydration finishes.
const guardedStorage: typeof baseStorage = {
  ...baseStorage,
  setItem: (name, value) => {
    if (useAppStore.persist.hasHydrated()) baseStorage.setItem(name, value);
  },
};

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const useAppStore = create<PersistedState & Actions>()(
  persist(
    (set) => ({
      ...initialState,

      completeLesson: (slug) =>
        set((s) => (s.completedLessons.includes(slug) ? s : { completedLessons: [...s.completedLessons, slug] })),
      uncompleteLesson: (slug) => set((s) => ({ completedLessons: s.completedLessons.filter((l) => l !== slug) })),
      visitLesson: (slug) => set({ lastLesson: slug }),
      visitChallenge: (id) => set({ lastChallenge: id }),
      completeChallenge: (id) =>
        set((s) =>
          s.completedChallenges[id]
            ? s
            : {
                completedChallenges: {
                  ...s.completedChallenges,
                  [id]: { completedAt: Date.now(), hintsUsed: s.hintsRevealed[id] ?? 0 },
                },
              },
        ),
      revealHint: (id) =>
        set((s) => ({ hintsRevealed: { ...s.hintsRevealed, [id]: Math.min(3, (s.hintsRevealed[id] ?? 0) + 1) } })),
      saveChallengeDraft: (id, sql) => set((s) => ({ challengeDrafts: { ...s.challengeDrafts, [id]: sql } })),

      recordQuery: (entry) =>
        set((s) => ({
          queriesExecuted: s.queriesExecuted + 1,
          history: [{ ...entry, id: uid(), at: Date.now() }, ...s.history].slice(0, MAX_HISTORY),
        })),
      removeHistory: (id) => set((s) => ({ history: s.history.filter((h) => h.id !== id) })),
      clearHistory: () => set({ history: [] }),

      addFavorite: (title, sql, dataset) =>
        set((s) => ({ favorites: [{ id: uid(), title, sql, dataset, createdAt: Date.now() }, ...s.favorites] })),
      removeFavorite: (id) => set((s) => ({ favorites: s.favorites.filter((f) => f.id !== id) })),

      setPlaygroundSql: (sql) => set((s) => ({ playground: { ...s.playground, sql } })),
      setPlaygroundDataset: (dataset) => set((s) => ({ playground: { ...s.playground, dataset } })),
      openInPlayground: (sql, dataset) => set({ playground: { sql, dataset } }),

      setPageSize: (pageSize) => set((s) => ({ settings: { ...s.settings, pageSize } })),
      toggleSidebar: () => set((s) => ({ settings: { ...s.settings, sidebarCollapsed: !s.settings.sidebarCollapsed } })),
      // Keeps UI preferences; only learning data is wiped.
      resetProgress: () => set((s) => ({ ...initialState, settings: s.settings })),
    }),
    {
      name: "sql-playground",
      version: 1,
      storage: guardedStorage,
      // Rehydrated manually after mount (see AppShell) to avoid SSR hydration mismatches.
      skipHydration: true,
      partialize: (s): PersistedState => ({
        completedLessons: s.completedLessons,
        completedChallenges: s.completedChallenges,
        hintsRevealed: s.hintsRevealed,
        challengeDrafts: s.challengeDrafts,
        lastLesson: s.lastLesson,
        lastChallenge: s.lastChallenge,
        queriesExecuted: s.queriesExecuted,
        history: s.history,
        favorites: s.favorites,
        playground: s.playground,
        settings: s.settings,
      }),
      // Fill in defaults for anything missing from older or partially corrupted data.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<PersistedState>;
        return {
          ...current,
          ...p,
          playground: { ...initialState.playground, ...p.playground },
          settings: { ...initialState.settings, ...p.settings },
          completedLessons: Array.isArray(p.completedLessons) ? p.completedLessons : [],
          history: Array.isArray(p.history) ? p.history : [],
          favorites: Array.isArray(p.favorites) ? p.favorites : [],
        };
      },
    },
  ),
);

interface HydrationState {
  hydrated: boolean;
  setHydrated: () => void;
}

export const useHydration = create<HydrationState>((set) => ({
  hydrated: false,
  setHydrated: () => set({ hydrated: true }),
}));
