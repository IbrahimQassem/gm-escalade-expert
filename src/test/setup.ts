import "@testing-library/jest-dom";

// jsdom does not implement window.matchMedia — provide a minimal mock that
// satisfies hooks relying on matchMedia listeners.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: (_: string, cb: EventListenerOrEventListenerObject) => {
      // Store callback so resize-based tests can trigger it
      window.__mqlListeners ??= [];
      (window.__mqlListeners as ((e: Event) => void)[]).push(
        typeof cb === "function" ? cb : (e) => cb.handleEvent(e),
      );
    },
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
