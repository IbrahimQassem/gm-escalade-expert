/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Native tsconfig paths resolution — avoids the vite-tsconfig-paths deprecation warning
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    typecheck: { tsconfig: "./tsconfig.test.json" },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.{test,spec}.{ts,tsx}",
        "src/test/**",
        "src/routeTree.gen.ts",
        "src/router.tsx",
        "src/start.ts",
        "src/styles.css",
        // shadcn/ui — generated, third-party wrappers; not directly unit-tested
        "src/components/ui/**",
        // chat-panel — streams SSE/AI responses; requires integration test infra
        "src/components/chat-panel.tsx",
        "src/lib/*.server.ts",
        "src/lib/lovable-error-reporting.ts",
        "src/lib/error-page.ts",
        "src/server.ts",
        "src/routes/**",
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});
