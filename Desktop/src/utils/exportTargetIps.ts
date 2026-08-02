const STORAGE_KEY = "exportTargetIp";

const normalizeAddress = (value: string): string => value.trim();

/**
 * Возвращает список сохранённых IP-адресов MyWorkSpace.
 * Поддерживает миграцию старого формата (одиночная строка IP в localStorage)
 * к новому формату (JSON-массив).
 */
export const getExportTargetIps = (): string[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean);
    }
  } catch {
    // Старый формат: просто строка IP, не JSON
  }

  const single = normalizeAddress(stored);
  return single ? [single] : [];
};

/**
 * Сохраняет список IP-адресов MyWorkSpace (отфильтровывая пустые и дубликаты).
 */
export const setExportTargetIps = (ips: string[]): void => {
  const normalized = ips
    .map(normalizeAddress)
    .filter(Boolean)
    .filter((ip, index, array) => array.indexOf(ip) === index);

  if (normalized.length === 0) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  }
};

/**
 * Возвращает адрес по умолчанию (первый из сохранённого списка) или пустую строку.
 */
export const getDefaultExportTargetIp = (): string => {
  return getExportTargetIps()[0] ?? "";
};