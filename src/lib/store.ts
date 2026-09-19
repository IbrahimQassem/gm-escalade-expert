import { useCallback, useEffect, useState } from "react";

import { VEHICLE, type SectionId } from "./vehicle";

export type SourceRef = { url: string; title: string; addedAt: number; topic?: string };

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  deep?: boolean;
  searches?: string[];
  sources?: { url: string; title: string }[];
  createdAt: number;
};

export type SavedFact = {
  id: string;
  topic: string;
  content: string;
  status: string;
  sources: { url: string; title: string }[];
  createdAt: number;
};

const NS = `gm-escalade-${VEHICLE.vin}`;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(`${NS}:${key}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${NS}:${key}`, JSON.stringify(value));
  } catch {
    /* quota */
  }
}

export function usePersistentState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(read<T>(key, initial));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setState((prev) => {
        const value = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        write(key, value);
        return value;
      });
    },
    [key],
  );

  return [state, update, hydrated] as const;
}

export function useConversation(section: SectionId) {
  return usePersistentState<ChatMessage[]>(`chat:${section}`, []);
}

export function useSavedFacts() {
  return usePersistentState<SavedFact[]>("facts", []);
}

export function useSources() {
  return usePersistentState<SourceRef[]>("sources", []);
}

export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
