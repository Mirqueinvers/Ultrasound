// Отслеживание доступности центрального сервера (этап 2.3).
// Периодический health-check GET /api/health + подписка на смену статуса.
// Модуль НЕ зависит от `electron`, чтобы тестироваться в vitest (node-окружение).
import { getServerUrl, isConfigured } from "../apiClient";

export type ConnectionStatus = "online" | "offline" | "not-configured";

export interface ConnectionStatusInfo {
  status: ConnectionStatus;
  lastCheckedAt: string | null;
}

export const CHECK_INTERVAL_MS = 15_000;
export const HEALTH_TIMEOUT_MS = 5_000;

/**
 * Синглтон. При старте приложения — вызов start().
 * Каждые CHECK_INTERVAL_MS опрашивает GET {serverUrl}/api/health.
 * Смена статуса публикуется подписчикам (main рассылает в renderer).
 */
export class ConnectionMonitor {
  private static instance: ConnectionMonitor | null = null;
  private timer: NodeJS.Timeout | null = null;
  private status: ConnectionStatus = "not-configured";
  private lastCheckedAt: string | null = null;
  private listeners = new Set<(status: ConnectionStatus) => void>();
  private checking = false;

  static getInstance(): ConnectionMonitor {
    if (!ConnectionMonitor.instance) {
      ConnectionMonitor.instance = new ConnectionMonitor();
    }
    return ConnectionMonitor.instance;
  }

  /** Сбрасывает синглтон (для тестов). */
  static reset(): void {
    ConnectionMonitor.instance?.stop();
    ConnectionMonitor.instance = null;
  }

  start(): void {
    if (this.timer) return;
    void this.check();
    this.timer = setInterval(() => void this.check(), CHECK_INTERVAL_MS);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  getStatus(): ConnectionStatusInfo {
    return {
      status: this.status,
      lastCheckedAt: this.lastCheckedAt,
    };
  }

  /** Подписка на смену статуса. Возвращает функцию отписки. */
  onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /** Немедленно запускает проверку (например, после сохранения адреса сервера). */
  notifyConfigChanged(): void {
    void this.check();
  }

  get checkingInProgress(): boolean {
    return this.checking;
  }

  async check(): Promise<void> {
    if (this.checking) return;

    if (!isConfigured()) {
      this.lastCheckedAt = new Date().toISOString();
      this.setStatus("not-configured");
      return;
    }

    this.checking = true;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
      let online = false;
      try {
        const response = await fetch(`${getServerUrl()}/api/health`, {
          signal: controller.signal,
        });
        online = response.ok;
      } catch {
        online = false;
      } finally {
        clearTimeout(timeout);
      }
      this.lastCheckedAt = new Date().toISOString();
      this.setStatus(online ? "online" : "offline");
    } finally {
      this.checking = false;
    }
  }

  private setStatus(status: ConnectionStatus): void {
    if (this.status === status) return;
    this.status = status;
    for (const callback of this.listeners) {
      try {
        callback(status);
      } catch (err) {
        console.error("ConnectionMonitor listener error:", err);
      }
    }
  }
}