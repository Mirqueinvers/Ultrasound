// @vitest-environment node
// Этап 2.7: тесты персистентной конфигурации сервера (этап 2.5).
// apiConfig.ts хранит { serverUrl, lastLoginUsername, token } в
// {userData}/server-config.json.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  loadServerConfig,
  saveAuthToken,
  saveServerConfig,
} from "../apiConfig";

const m = vi.hoisted(() => {
  const userDataPath = { current: "" };
  return { userDataPath };
});

vi.mock("electron", () => ({
  app: {
    getPath: () => m.userDataPath.current,
  },
}));

beforeEach(async () => {
  m.userDataPath.current = await fs.mkdtemp(
    path.join(os.tmpdir(), "ultrasound-cfg-"),
  );
});

afterEach(async () => {
  if (m.userDataPath.current) {
    await fs
      .rm(m.userDataPath.current, { recursive: true, force: true })
      .catch(() => undefined);
  }
});

describe("apiConfig: конфигурация сервера (этап 2.5)", () => {
  it("loadServerConfig — возвращает пустой конфиг, если файла нет", async () => {
    expect(await loadServerConfig()).toEqual({ serverUrl: "" });
  });

  it("saveServerConfig — создаёт файл и сохраняет поля", async () => {
    await saveServerConfig({
      serverUrl: "http://192.168.1.10:4000",
      lastLoginUsername: "doc",
    });
    expect(await loadServerConfig()).toEqual({
      serverUrl: "http://192.168.1.10:4000",
      lastLoginUsername: "doc",
    });
  });

  it("saveServerConfig — не затирает не переданные поля", async () => {
    await saveServerConfig({
      serverUrl: "http://192.168.1.10:4000",
      lastLoginUsername: "doc",
    });
    await saveServerConfig({ serverUrl: "http://192.168.1.11:4000" });
    expect(await loadServerConfig()).toEqual({
      serverUrl: "http://192.168.1.11:4000",
      lastLoginUsername: "doc",
    });
  });

  it("saveServerConfig — обрезает пробелы в адресе", async () => {
    await saveServerConfig({ serverUrl: "  http://192.168.1.10:4000  " });
    expect((await loadServerConfig()).serverUrl).toBe(
      "http://192.168.1.10:4000",
    );
  });

  it("saveAuthToken — сохраняет и очищает JWT-токен", async () => {
    await saveAuthToken("jwt-123");
    expect((await loadServerConfig()).token).toBe("jwt-123");

    await saveAuthToken(null);
    expect((await loadServerConfig()).token).toBeUndefined();
  });
});
