// Frontend/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
  ],
  base: "./", // критично для сборки под Electron (file://)
  server: {
    host: "0.0.0.0",
    port: 5173,
    watch: {
      usePolling: true, // важно для Docker
    },
  },
});
