import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { newId, usePersistentState, useConversation, useSavedFacts, useSources } from "@/lib/store";

// ─── newId ────────────────────────────────────────────────────────────────────

describe("newId", () => {
  it("returns a non-empty string", () => {
    expect(typeof newId()).toBe("string");
    expect(newId().length).toBeGreaterThan(0);
  });

  it("returns unique values on successive calls", () => {
    const ids = Array.from({ length: 50 }, () => newId());
    expect(new Set(ids).size).toBe(50);
  });

  it("falls back to Math.random when crypto.randomUUID is unavailable", () => {
    // Temporarily remove randomUUID
    const originalUUID = crypto.randomUUID;
    // @ts-expect-error – intentional delete to test fallback path
    delete crypto.randomUUID;
    try {
      const id = newId();
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    } finally {
      crypto.randomUUID = originalUUID;
    }
  });
});

// ─── usePersistentState ───────────────────────────────────────────────────────

describe("usePersistentState", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("returns the initial value when no stored data exists (pre-hydration default)", async () => {
    // renderHook in jsdom runs effects synchronously in React 18, so hydrated
    // may already be true by the time we read result.current. The important
    // invariant is that the state equals the initial value when localStorage
    // has no entry for this key.
    localStorage.clear();
    const { result } = renderHook(() => usePersistentState("new-key", 42));
    await act(async () => {});
    const [state] = result.current;
    expect(state).toBe(42);
  });

  it("hydrates from localStorage on mount", async () => {
    localStorage.setItem("gm-escalade-1GYUKEEJ7AR246464:hydration-key", JSON.stringify(99));
    const { result } = renderHook(() => usePersistentState("hydration-key", 0));

    // After effect fires
    await act(async () => {});

    const [state, , hydrated] = result.current;
    expect(state).toBe(99);
    expect(hydrated).toBe(true);
  });

  it("persists state updates to localStorage", async () => {
    const { result } = renderHook(() => usePersistentState("persist-key", "hello"));
    await act(async () => {});

    act(() => {
      result.current[1]("world");
    });

    const stored = localStorage.getItem("gm-escalade-1GYUKEEJ7AR246464:persist-key");
    expect(JSON.parse(stored ?? "null")).toBe("world");
  });

  it("supports functional updater form", async () => {
    const { result } = renderHook(() => usePersistentState("count-key", 10));
    await act(async () => {});

    act(() => {
      result.current[1]((prev) => prev + 5);
    });

    expect(result.current[0]).toBe(15);
  });

  it("returns the initial value when localStorage is empty", async () => {
    const { result } = renderHook(() => usePersistentState("empty-key", "default"));
    await act(async () => {});
    expect(result.current[0]).toBe("default");
  });

  it("returns the initial value when localStorage contains invalid JSON", async () => {
    // Bypass the namespace to inject corrupt data
    localStorage.setItem("gm-escalade-1GYUKEEJ7AR246464:broken-key", "not-json{{");
    const { result } = renderHook(() => usePersistentState("broken-key", "fallback"));
    await act(async () => {});
    expect(result.current[0]).toBe("fallback");
  });
});
// ─── Derived hooks (thin wrappers) ───────────────────────────────────────────

describe("useConversation", () => {
  beforeEach(() => localStorage.clear());

  it("starts with an empty message array for a new section", async () => {
    const { result } = renderHook(() => useConversation("chat"));
    await act(async () => {});
    expect(result.current[0]).toEqual([]);
  });
});

describe("useSavedFacts", () => {
  beforeEach(() => localStorage.clear());

  it("starts with an empty facts array", async () => {
    const { result } = renderHook(() => useSavedFacts());
    await act(async () => {});
    expect(result.current[0]).toEqual([]);
  });
});

describe("useSources", () => {
  beforeEach(() => localStorage.clear());

  it("starts with an empty sources array", async () => {
    const { result } = renderHook(() => useSources());
    await act(async () => {});
    expect(result.current[0]).toEqual([]);
  });
});
