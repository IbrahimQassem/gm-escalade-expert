import { describe, it, expect, vi, beforeEach } from "vitest";

// Import the module fresh for each relevant test — side effects at module level
// (console.error wrapping, globalThis listeners) fire on import.
// We import individually to test the exported functions.
import { describeError, consumeLastCapturedError } from "@/lib/error-capture";

describe("describeError", () => {
  it("handles a plain Error with message and stack", () => {
    const err = new Error("something went wrong");
    const result = describeError(err);
    expect(result).toContain("something went wrong");
  });

  it("handles a string input", () => {
    expect(describeError("plain string")).toBe("plain string");
  });

  it("handles null/undefined gracefully", () => {
    expect(describeError(null)).toBe("");
    expect(describeError(undefined)).toBe("");
  });

  it("handles a plain object by JSON-stringifying it", () => {
    const result = describeError({ code: 42 });
    expect(result).toContain("42");
  });

  it("traverses the cause chain up to CAUSE_DEPTH_LIMIT", () => {
    const inner = new Error("root cause");
    const outer = new Error("outer error", { cause: inner });
    const result = describeError(outer);
    expect(result).toContain("outer error");
    expect(result).toContain("root cause");
    expect(result).toContain("caused by:");
  });

  it("includes the HTTP status when the error has a status field", () => {
    const err = Object.assign(new Error("not found"), { status: 404 });
    const result = describeError(err);
    expect(result).toContain("status 404");
  });

  it("prefers statusCode over status when both exist", () => {
    const err = Object.assign(new Error("server error"), { statusCode: 500 });
    const result = describeError(err);
    expect(result).toContain("status 500");
  });

  it("truncates extremely long output to 8000 characters", () => {
    const longMessage = "x".repeat(10_000);
    const err = new Error(longMessage);
    expect(describeError(err).length).toBeLessThanOrEqual(8_000);
  });
});

describe("consumeLastCapturedError", () => {
  beforeEach(() => {
    // Drain any previously captured error so tests are isolated
    consumeLastCapturedError();
  });

  it("returns undefined when no error has been captured", () => {
    expect(consumeLastCapturedError()).toBeUndefined();
  });

  it("returns undefined on a second call (error is consumed once)", () => {
    // Trigger capture via the patched console.error
    console.error(new Error("once"));
    consumeLastCapturedError(); // first call consumes it
    expect(consumeLastCapturedError()).toBeUndefined();
  });

  it("captures errors logged through console.error", () => {
    const err = new Error("captured via console");
    console.error(err);
    const captured = consumeLastCapturedError();
    expect(captured).toBe(err);
  });

  it("returns undefined when the captured error is stale (> 5s old)", () => {
    // Manipulate Date.now to simulate staleness
    const err = new Error("stale");
    console.error(err);

    const originalNow = Date.now;
    try {
      // Advance time by 6 seconds
      vi.spyOn(Date, "now").mockReturnValue(originalNow() + 6_000);
      expect(consumeLastCapturedError()).toBeUndefined();
    } finally {
      vi.restoreAllMocks();
    }
  });
});
