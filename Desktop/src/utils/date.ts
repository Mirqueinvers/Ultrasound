/**
 * Утилиты работы с датами.
 */

/**
 * Возвращает сегодняшнюю дату в ЛОКАЛЬНОМ времени в формате "гггг-мм-дд".
 *
 * ВАЖНО: `new Date().toISOString().slice(0, 10)` возвращает дату в UTC,
 * которая в зависимости от часового пояса может отличаться от локальной.
 * Этот метод учитывает смещение таймзоны и всегда возвращает правильную
 * локальную дату.
 */
export function getTodayIso(): string {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  const y = localDate.getFullYear();
  const m = String(localDate.getMonth() + 1).padStart(2, "0");
  const d = String(localDate.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
