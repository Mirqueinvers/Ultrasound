// Офлайн-кэш чтения (этап 2.3, MVP по п. 4.3 плана).
// Хранилище — better-sqlite3 (файл cache.db в userData в проде, ":memory:" в тестах).
// Модуль НЕ зависит от `electron`, чтобы тестироваться в vitest (node-окружение).
import Database from "better-sqlite3";

export interface CacheSummary {
  patients: number;
  researches: number;
  journal: number;
  statistics: number;
  protocols: number;
}

/** Значение из кэша вместе с метаданными. */
export interface CacheEntry<T> {
  value: T;
  cachedAt: string;
}

interface CacheRow {
  payload: string;
  updated_at: number;
  expires_at: number | null;
}

/**
 * Синглтон: единая точка доступа к офлайн-кэшу чтения.
 * - getValue возвращает undefined, если записи нет или истёк TTL.
 * - setValue пишет payload (JSON) с опциональным TTL (null = вечная запись).
 * - deleteKeysByPrefix — инвалидация групп записей по префиксу ключа.
 * - getSummary — счётчики по доменам для страницы «Офлайн-режим».
 */
export class OfflineCache {
  private static instance: OfflineCache | null = null;
  private db: Database.Database | null = null;

  static getInstance(): OfflineCache {
    if (!OfflineCache.instance) {
      OfflineCache.instance = new OfflineCache();
    }
    return OfflineCache.instance;
  }

  isInitialized(): boolean {
    return this.db !== null;
  }

  /** Открывает (или пересоздаёт) БД кэша. Повторный вызов закрывает предыдущую БД. */
  init(dbPath: string): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS cache_meta (
        key        TEXT PRIMARY KEY,
        payload    TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        expires_at INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_cache_meta_key ON cache_meta(key);
    `);
  }

  getValue<T>(key: string): CacheEntry<T> | undefined {
    if (!this.db) return undefined;
    const row = this.db
      .prepare("SELECT payload, updated_at, expires_at FROM cache_meta WHERE key = ?")
      .get(key) as CacheRow | undefined;
    if (!row) return undefined;

    if (row.expires_at !== null && Date.now() > row.expires_at) {
      this.db.prepare("DELETE FROM cache_meta WHERE key = ?").run(key);
      return undefined;
    }

    try {
      return {
        value: JSON.parse(row.payload) as T,
        cachedAt: new Date(row.updated_at).toISOString(),
      };
    } catch {
      return undefined;
    }
  }

  /** Сохраняет значение. ttlMs — время жизни в мс; undefined/null — без TTL (вечная запись). */
  setValue(key: string, value: unknown, ttlMs?: number): void {
    if (!this.db) return;
    const now = Date.now();
    const expiresAt = ttlMs !== undefined ? now + ttlMs : null;
    this.db
      .prepare(
        `INSERT INTO cache_meta (key, payload, updated_at, expires_at)
         VALUES (@key, @payload, @updated_at, @expires_at)
         ON CONFLICT(key) DO UPDATE SET
           payload = excluded.payload,
           updated_at = excluded.updated_at,
           expires_at = excluded.expires_at`,
      )
      .run({
        key,
        payload: JSON.stringify(value),
        updated_at: now,
        expires_at: expiresAt,
      });
  }

  /** Удаляет все записи с ключом, начинающимся с prefix. Возвращает число удалённых. */
  deleteKeysByPrefix(prefix: string): number {
    if (!this.db) return 0;
    const result = this.db
      .prepare("DELETE FROM cache_meta WHERE key LIKE ?")
      .run(`${prefix}%`);
    return result.changes;
  }

  countByPrefix(prefix: string): number {
    if (!this.db) return 0;
    const row = this.db
      .prepare("SELECT COUNT(*) AS count FROM cache_meta WHERE key LIKE ?")
      .get(`${prefix}%`) as { count: number };
    return row.count;
  }

  clear(): void {
    if (!this.db) return;
    this.db.prepare("DELETE FROM cache_meta").run();
  }

  getSummary(): CacheSummary {
    return {
      patients: this.countByPrefix("patient:"),
      researches: this.countByPrefix("research:"),
      journal: this.countByPrefix("journal:"),
      statistics: this.countByPrefix("statistics:"),
      protocols: this.countByPrefix("protocol:"),
    };
  }

  /** Закрывает БД. Нужно в тестах (re-init с ":memory:"). */
  dispose(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}