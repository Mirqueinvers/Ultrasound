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
    port: Number(process.env.VITE_PORT ?? 5174),
    watch: {
      usePolling: true, // важно для Docker
      // 👇 ДОБАВЬТЕ ЭТУ СТРОКУ, ЧТОБЫ VITE НЕ ПЕРЕЗАПУСКАЛСЯ ПРИ СОХРАНЕНИИ ФАЙЛОВ
      ignored: [
        '**/node_modules/**', 
        '**/dist/**', 
        '**/*.json', // если протоколы сохраняются в формате JSON
        '**/storage/**', // или укажите имя вашей папки с сохранениями
      ],
    },
  },
});
