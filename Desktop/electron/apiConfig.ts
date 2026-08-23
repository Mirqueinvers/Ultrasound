// Персистентная конфигурация подключения к центральному серверу.
// Файл: {userData}/server-config.json → { serverUrl }
import { app } from "electron";
import { promises as fs } from "node:fs";
import path from "node:path";

export interface ServerConfig {
  serverUrl: string;
  /** Логин последнего вошедшего пользователя (для удобного предзаполнения на экране входа). */
  lastLoginUsername?: string;
}

function configFilePath(): string {
  return path.join(app.getPath("userData"), "server-config.json");
}

export async function loadServerConfig(): Promise<ServerConfig> {
  try {
    const data = await fs.readFile(configFilePath(), "utf8");
    const parsed = JSON.parse(data) as Partial<ServerConfig>;
    return {
      serverUrl: typeof parsed.serverUrl === "string" ? parsed.serverUrl : "",
      lastLoginUsername:
        typeof parsed.lastLoginUsername === "string"
          ? parsed.lastLoginUsername
          : undefined,
    };
  } catch {
    return { serverUrl: "" };
  }
}

export async function saveServerConfig(config: ServerConfig): Promise<void> {
  const normalized = {
    serverUrl: (config.serverUrl ?? "").trim(),
    ...(config.lastLoginUsername
      ? { lastLoginUsername: config.lastLoginUsername }
      : {}),
  };
  await fs.writeFile(
    configFilePath(),
    JSON.stringify(normalized, null, 2),
    "utf8",
  );
}