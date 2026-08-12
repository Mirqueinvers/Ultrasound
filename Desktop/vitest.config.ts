// vitest.config.ts — конфигурация тестового стека (Шаг 2 рефакторинга).
// Наследует алиасы и плагины из vite.config.ts.
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      "@services": fileURLToPath(new URL("./src/services/electron/index.ts", import.meta.url)),
      "@services/*": fileURLToPath(new URL("./src/services/electron/*", import.meta.url)),
      // Изолированная копия better-sqlite3 под системный Node ABI (для тестов репозиториев).
      // Основная копия в node_modules собрана под Electron ABI и не загружается в vitest.
      "better-sqlite3": fileURLToPath(new URL("./.testdeps/node_modules/better-sqlite3/lib/index.js", import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ["better-sqlite3"],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "electron/**/*.test.{ts,tsx}"],
    css: false,
    server: {
      deps: {
        inline: ["better-sqlite3"],
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/utils/deepMerge.ts",
        "src/utils/normalizeSelectValue.ts",
        "src/utils/printHelpers.ts",
        "src/utils/defaultsAccess.ts",
        "src/utils/volume.ts",
        "src/sync/medisonXmlParser.ts",
        "src/components/print/organs/Kidney/kidneyHelpers.ts",
        "src/hooks/useSaveResearch.ts",
        "src/hooks/useOrganForm.ts",
        "src/hooks/useFormState.ts",
        "src/hooks/useFieldUpdate.ts",
        "src/hooks/useListManager.ts",
        "src/hooks/usePrintableOverrides.ts",
        "electron/database/*.ts",
      ],
      exclude: [
        "electron/database/schema.ts",
        "electron/database/database.ts",
        "electron/database/initDatabase.ts",
        "src/test/**",
        "**/*.test.{ts,tsx}",
      ],
    },
  },
});