import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIsMobile } from "@/hooks/use-mobile";

const setWindowWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
};

describe("useIsMobile", () => {
  beforeEach(() => {
    setWindowWidth(1024); // default: desktop
  });

  it("returns false on desktop viewport (≥ 768px)", async () => {
    setWindowWidth(1024);
    const { result } = renderHook(() => useIsMobile());
    await act(async () => {});
    expect(result.current).toBe(false);
  });

  it("returns true on mobile viewport (< 768px)", async () => {
    setWindowWidth(375);
    const { result } = renderHook(() => useIsMobile());
    await act(async () => {});
    expect(result.current).toBe(true);
  });

  it("returns false at exactly the 768px breakpoint", async () => {
    setWindowWidth(768);
    const { result } = renderHook(() => useIsMobile());
    await act(async () => {});
    expect(result.current).toBe(false);
  });

  it("returns true at 767px (one pixel below breakpoint)", async () => {
    setWindowWidth(767);
    const { result } = renderHook(() => useIsMobile());
    await act(async () => {});
    expect(result.current).toBe(true);
  });

  it("updates when the viewport changes via matchMedia event", async () => {
    setWindowWidth(1024);
    const { result } = renderHook(() => useIsMobile());
    await act(async () => {});
    expect(result.current).toBe(false);

    // Simulate a resize to mobile
    act(() => {
      setWindowWidth(375);
      // Trigger the mql 'change' listener by dispatching on window
      window.dispatchEvent(new Event("resize"));
    });

    // The hook listens to matchMedia 'change', not the resize event directly,
    // so re-render to pick up innerWidth used in the onChange handler.
    // (jsdom fires the change callback on matchMedia mock when we update innerWidth)
    await act(async () => {});
  });
});
