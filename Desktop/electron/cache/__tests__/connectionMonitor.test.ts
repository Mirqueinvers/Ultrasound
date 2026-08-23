// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConnectionMonitor, HEALTH_TIMEOUT_MS } from "../connectionMonitor";
import { setServerUrl, clearToken } from "../../apiClient";

const mockFetch = vi.fn();

function mockOnline(): void {
  mockFetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ status: "ok" }),
  } as unknown as Response);
}

function mockOffline(): void {
  mockFetch.mockRejectedValue(new TypeError("fetch failed"));
}

beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal("fetch", mockFetch);
  setServerUrl("http://192.168.1.10:4000");
  clearToken();
  ConnectionMonitor.reset();
});

afterEach(() => {
  vi.unstubAllGlobals();
  ConnectionMonitor.reset();
});

describe("ConnectionMonitor: health-check (этап 2.3)", () => {
  it("возвращает not-configured если адрес не настроен", async () => {
    setServerUrl("");
    const monitor = ConnectionMonitor.getInstance();
    await monitor.check();
    expect(monitor.getStatus().status).toBe("not-configured");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("переходит в online при успешном health-check", async () => {
    mockOnline();
    const monitor = ConnectionMonitor.getInstance();
    await monitor.check();
    expect(monitor.getStatus().status).toBe("online");
    expect(mockFetch).toHaveBeenCalledWith(
      "http://192.168.1.10:4000/api/health",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("переходит в offline при ошибке сети", async () => {
    mockOffline();
    const monitor = ConnectionMonitor.getInstance();
    await monitor.check();
    expect(monitor.getStatus().status).toBe("offline");
  });

  it("переходит в offline если сервер вернул не-ok", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({}),
    } as unknown as Response);
    const monitor = ConnectionMonitor.getInstance();
    await monitor.check();
    expect(monitor.getStatus().status).toBe("offline");
  });

  it("сообщает подписчикам о смене статуса", async () => {
    const monitor = ConnectionMonitor.getInstance();
    const changes: string[] = [];
    monitor.onStatusChange((status) => changes.push(status));

    mockOffline();
    await monitor.check();
    mockOnline();
    await monitor.check();

    expect(changes).toEqual(["offline", "online"]);
  });

  it("не публикует событие, если статус не изменился", async () => {
    const monitor = ConnectionMonitor.getInstance();
    const changes: string[] = [];
    monitor.onStatusChange((status) => changes.push(status));

    mockOffline();
    await monitor.check();
    await monitor.check();

    expect(changes).toEqual(["offline"]);
  });

  it("таймаут health-check завершается статусом offline", async () => {
    vi.useFakeTimers();
    // fetch никогда не резолвится → abort по HEALTH_TIMEOUT_MS.
    mockFetch.mockImplementation(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(new Error("aborted")),
          );
        }),
    );

    const monitor = ConnectionMonitor.getInstance();
    const checkPromise = monitor.check();
    vi.advanceTimersByTime(HEALTH_TIMEOUT_MS);
    await checkPromise;

    expect(monitor.getStatus().status).toBe("offline");
    vi.useRealTimers();
  });
});