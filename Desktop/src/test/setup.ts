// src/test/setup.ts — подключение @testing-library/jest-dom и авто-cleanup.
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Автоматическая очистка DOM между тестами.
afterEach(() => {
  cleanup();
});