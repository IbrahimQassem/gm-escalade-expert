import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn (className merger)", () => {
  it("returns empty string for no arguments", () => {
    expect(cn()).toBe("");
  });

  it("returns a single class unchanged", () => {
    expect(cn("text-red-500")).toBe("text-red-500");
  });

  it("merges multiple classes", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("deduplicates conflicting Tailwind classes (last one wins)", () => {
    // tailwind-merge resolves conflicts: p-4 overrides px-2
    expect(cn("px-2", "p-4")).toBe("p-4");
  });

  it("handles conditional classes with falsy values", () => {
    expect(cn("base", false && "hidden", null, undefined)).toBe("base");
  });

  it("handles object syntax for conditional classes", () => {
    expect(cn({ "font-bold": true, italic: false })).toBe("font-bold");
  });

  it("handles arrays of classes", () => {
    expect(cn(["flex", "items-center"])).toBe("flex items-center");
  });

  it("handles deeply nested arrays and objects", () => {
    expect(cn(["flex", { hidden: false }], "gap-2")).toBe("flex gap-2");
  });
});
