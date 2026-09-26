import { describe, it, expect } from "vitest";
import {
  DTC_CODES,
  searchDtcCodes,
  getDtcByCode,
  type DtcCode,
} from "@/lib/dtc-codes";

// ─── DTC_CODES data integrity ─────────────────────────────────────────────────

describe("DTC_CODES constant", () => {
  it("contains at least the four required 2-Mode Hybrid codes", () => {
    const codes = DTC_CODES.map((d) => d.code);
    expect(codes).toContain("P0A80");
    expect(codes).toContain("P0AC4");
    expect(codes).toContain("P0A7F");
    expect(codes).toContain("P0C05");
  });

  it("every entry has code, description, system, and severity", () => {
    for (const dtc of DTC_CODES) {
      expect(dtc.code).toMatch(/^P[0-9A-Z]{4}$/);
      expect(dtc.description).toBeTruthy();
      expect(dtc.system).toBeTruthy();
      expect(["low", "medium", "high", "critical"]).toContain(dtc.severity);
    }
  });

  it("all DTC codes are unique", () => {
    const codes = DTC_CODES.map((d) => d.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("P0A80 is related to the hybrid battery pack", () => {
    const entry = DTC_CODES.find((d) => d.code === "P0A80");
    expect(entry?.description.toLowerCase()).toMatch(/battery|pack|cell/);
  });
});

// ─── getDtcByCode ─────────────────────────────────────────────────────────────

describe("getDtcByCode", () => {
  it("returns the matching DTC for an exact code", () => {
    const result = getDtcByCode("P0A80");
    expect(result).not.toBeUndefined();
    expect(result!.code).toBe("P0A80");
  });

  it("is case-insensitive", () => {
    const upper = getDtcByCode("P0AC4");
    const lower = getDtcByCode("p0ac4");
    expect(upper).toEqual(lower);
  });

  it("returns undefined for an unknown code", () => {
    expect(getDtcByCode("P9999")).toBeUndefined();
  });

  it("returns undefined for an empty string", () => {
    expect(getDtcByCode("")).toBeUndefined();
  });
});

// ─── searchDtcCodes ───────────────────────────────────────────────────────────

describe("searchDtcCodes", () => {
  it("returns all codes when query is empty", () => {
    expect(searchDtcCodes("")).toEqual(DTC_CODES);
  });

  it("finds a code by exact match", () => {
    const results = searchDtcCodes("P0A7F");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]!.code).toBe("P0A7F");
  });

  it("finds codes by partial code prefix", () => {
    const results = searchDtcCodes("P0A");
    expect(results.every((r) => r.code.startsWith("P0A"))).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  it("finds codes by keyword in description (case-insensitive)", () => {
    const results = searchDtcCodes("battery");
    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every(
        (r) =>
          r.description.toLowerCase().includes("battery") ||
          r.code.toLowerCase().includes("battery") ||
          r.system.toLowerCase().includes("battery"),
      ),
    ).toBe(true);
  });

  it("finds codes by system name", () => {
    const results = searchDtcCodes("hybrid");
    expect(results.length).toBeGreaterThan(0);
  });

  it("returns empty array when no results match", () => {
    expect(searchDtcCodes("XYZZY_NO_MATCH_EVER")).toEqual([]);
  });

  it("exact code match is ranked first", () => {
    const results = searchDtcCodes("P0C05");
    expect(results[0]!.code).toBe("P0C05");
  });

  it("search is case-insensitive for descriptions", () => {
    const lower = searchDtcCodes("battery");
    const upper = searchDtcCodes("BATTERY");
    expect(lower.map((r) => r.code)).toEqual(upper.map((r) => r.code));
  });

  it("returns a DtcCode array (type shape)", () => {
    const results = searchDtcCodes("P0A80");
    const first = results[0] as DtcCode;
    expect(typeof first.code).toBe("string");
    expect(typeof first.description).toBe("string");
    expect(typeof first.system).toBe("string");
    expect(typeof first.severity).toBe("string");
  });
});
