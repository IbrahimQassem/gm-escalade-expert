import { describe, it, expect } from "vitest";
import { VEHICLE, SECTIONS, CHAT_SECTIONS, SEED_TOPIC, type SectionId } from "@/lib/vehicle";

describe("VEHICLE constant", () => {
  it("has the correct VIN", () => {
    expect(VEHICLE.vin).toBe("1GYUKEEJ7AR246464");
  });

  it("has year 2010", () => {
    expect(VEHICLE.year).toBe(2010);
  });

  it("identifies as Cadillac Escalade Hybrid", () => {
    expect(VEHICLE.make).toBe("Cadillac");
    expect(VEHICLE.model).toBe("Escalade Hybrid");
  });

  it("specifies 4WD drivetrain", () => {
    expect(VEHICLE.drivetrain).toBe("4WD");
  });

  it("has Arabic translation fields", () => {
    expect(VEHICLE.arabic.title).toContain("إسكاليد");
    expect(VEHICLE.arabic.subtitle).toBeDefined();
  });
});

describe("SECTIONS array", () => {
  it("contains at least 7 sections", () => {
    expect(SECTIONS.length).toBeGreaterThanOrEqual(7);
  });

  it("every section has required fields", () => {
    for (const section of SECTIONS) {
      expect(section.id).toBeTruthy();
      expect(section.label).toBeTruthy();
      expect(section.hint).toBeTruthy();
      expect(section.icon).toBeTruthy();
    }
  });

  it("contains a 'chat' section", () => {
    expect(SECTIONS.find((s) => s.id === "chat")).toBeDefined();
  });

  it("contains a 'hybrid' section", () => {
    expect(SECTIONS.find((s) => s.id === "hybrid")).toBeDefined();
  });

  it("all section IDs are unique", () => {
    const ids = SECTIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("each section with suggestions has at least one suggestion", () => {
    for (const section of SECTIONS) {
      if (section.suggestions !== undefined) {
        expect(section.suggestions.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("CHAT_SECTIONS", () => {
  it("matches the section IDs from SECTIONS", () => {
    const expected = SECTIONS.map((s) => s.id);
    expect(CHAT_SECTIONS).toEqual(expected);
  });

  it("includes all expected section IDs", () => {
    const required: SectionId[] = ["chat", "parts", "diagnostics", "maintenance", "hybrid"];
    for (const id of required) {
      expect(CHAT_SECTIONS).toContain(id);
    }
  });
});

describe("SEED_TOPIC", () => {
  it("mentions the vehicle make and year", () => {
    expect(SEED_TOPIC).toContain("Cadillac");
    expect(SEED_TOPIC).toContain("2010");
  });

  it("references the hub bearing assembly topic", () => {
    expect(SEED_TOPIC.toLowerCase()).toContain("hub");
  });
});
