// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OfflineCache } from "../offlineCache";

// Хелпер: полностью пересоздаём синглтон с новой in-memory БД.
function freshCache(): OfflineCache {
  OfflineCache.getInstance().dispose();
  const cache = OfflineCache.getInstance();
  cache.init(":memory:");
  return cache;
}

const JUST_AFTER_EPOCH = 1_000_000_000;

describe("OfflineCache: хранилище", () => {
  let cache: OfflineCache;

  beforeEach(() => {
    vi.spyOn(Date, "now").mockReturnValue(JUST_AFTER_EPOCH);
    cache = freshCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    OfflineCache.getInstance().dispose();
  });

  it("возвращает undefined для отсутствующего ключа", () => {
    expect(cache.getValue("missing")).toBeUndefined();
  });

  it("сохраняет и возвращает значение без TTL", () => {
    cache.setValue("patient:byId:1", { id: "1", name: "Иванов" });
    const entry = cache.getValue<{ id: string; name: string }>("patient:byId:1");
    expect(entry).toBeDefined();
    expect(entry?.value).toEqual({ id: "1", name: "Иванов" });
    expect(entry?.cachedAt).toBe(new Date(JUST_AFTER_EPOCH).toISOString());
  });

  it("перезаписывает существующий ключ", () => {
    cache.setValue("key", { v: 1 });
    cache.setValue("key", { v: 2 });
    expect(cache.getValue("key")?.value).toEqual({ v: 2 });
  });

  it("уважает TTL: до истечения отдаёт значение, после — undefined", () => {
    cache.setValue("statistics:all", { total: 42 }, 5000);

    // Прошло 3 секунды — значение живо.
    vi.spyOn(Date, "now").mockReturnValue(JUST_AFTER_EPOCH + 3000);
    expect(cache.getValue("statistics:all")).toBeDefined();

    // Прошло 6 секунд — истекло.
    vi.spyOn(Date, "now").mockReturnValue(JUST_AFTER_EPOCH + 6000);
    expect(cache.getValue("statistics:all")).toBeUndefined();
  });

  it("удаляет записи по префиксу", () => {
    cache.setValue("patient:byId:1", { id: "1" });
    cache.setValue("patient:byId:2", { id: "2" });
    cache.setValue("patient:list:10:0", [{ id: "1" }]);
    cache.setValue("journal:date:2026-08-23", []);

    const deleted = cache.deleteKeysByPrefix("patient:");
    expect(deleted).toBe(3);
    expect(cache.getValue("patient:byId:1")).toBeUndefined();
    expect(cache.getValue("journal:date:2026-08-23")).toBeDefined();
  });

  it("считает записи по префиксу и отдаёт summary", () => {
    cache.setValue("patient:byId:1", {});
    cache.setValue("patient:byId:2", {});
    cache.setValue("research:byId:1", {});
    cache.setValue("journal:date:2026-08-23", []);
    cache.setValue("statistics:all", {});
    cache.setValue("protocol:r1", {});

    expect(cache.getSummary()).toEqual({
      patients: 2,
      researches: 1,
      journal: 1,
      statistics: 1,
      protocols: 1,
    });
  });

  it("clear() очищает все записи", () => {
    cache.setValue("patient:byId:1", {});
    cache.setValue("research:byId:1", {});
    cache.clear();
    expect(cache.getSummary()).toEqual({
      patients: 0,
      researches: 0,
      journal: 0,
      statistics: 0,
      protocols: 0,
    });
  });
});

describe("OfflineCache: жизненный цикл", () => {
  afterEach(() => {
    OfflineCache.getInstance().dispose();
  });

  it("isInitialized false до init и true после", () => {
    const instance = OfflineCache.getInstance();
    instance.dispose();
    expect(instance.isInitialized()).toBe(false);
    instance.init(":memory:");
    expect(instance.isInitialized()).toBe(true);
  });
});
