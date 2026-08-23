// Персистентная конфигурация подключения к центральному серверу.
// Файл: {userData}/server-config.json → { serverUrl, lastLoginUsername, token }
import { app } from "electron";
import { promises as fs } from "node:fs";
import path from "node:path";

export interface ServerConfig {
  serverUrl: string;
  /** Логин последнего вошедшего пользователя (для удобного предзаполнения на экране входа). */
  lastLoginUsername?: string;
  /** JWT-токен для восстановления сессии после перезапуска приложения. */
  token?: string;
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
      token: typeof parsed.token === "string" ? parsed.token : undefined,
    };
  } catch {
    return { serverUrl: "" };
  }
}

/** Сохраняет конфиг, сохраняя не переданные поля из уже существующего файла. */
export async function saveServerConfig(config: Partial<ServerConfig>): Promise<void> {
  const existing = await loadServerConfig();
  const merged: ServerConfig = {
    serverUrl: (config.serverUrl ?? existing.serverUrl).trim(),
    ...(config.lastLoginUsername !== undefined
      ? { lastLoginUsername: config.lastLoginUsername }
      : existing.lastLoginUsername
        ? { lastLoginUsername: existing.lastLoginUsername }
        : {}),
    ...(config.token !== undefined
      ? { token: config.token }
      : existing.token
        ? { token: existing.token }
        : {}),
  };
  await fs.writeFile(configFilePath(), JSON.stringify(merged, null, 2), "utf8");
}

/** Сохраняет (или очищает) JWT-токен. */
export async function saveAuthToken(token: string | null): Promise<void> {
  if (token !== null) {
    await saveServerConfig({ token });
    return;
  }
  // Очистка: убираем поле token, сохраняя остальной конфиг.
  // saveServerConfig({ token: undefined }) нельзя — он сохранил бы прежний токен.
  const existing = await loadServerConfig();
  const cleared: ServerConfig = {
    serverUrl: existing.serverUrl,
    ...(existing.lastLoginUsername
      ? { lastLoginUsername: existing.lastLoginUsername }
      : {}),
  };
  await fs.writeFile(
    configFilePath(),
    JSON.stringify(cleared, null, 2),
    "utf8",
  );
}