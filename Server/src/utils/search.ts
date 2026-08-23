/**
 * Нормализация строк для поиска (ё→е, нижний регистр, без лишних символов).
 * Совместимо с поведением Desktop (researchRepository.searchResearches).
 */

export function normalizeSearchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^0-9а-я]/g, "");
}

/** Экранирование спецсимволов для ILIKE */
export function escapeLike(value: string): string {
  return value.replace(/%/g, "\\%").replace(/_/g, "\\_");
}

/** Построение search_text пациента: нормализованное ФИО + ДР (код "кдю12101990") */
export function buildPatientSearchText(params: {
  lastName: string;
  firstName: string;
  middleName?: string | null;
  dateOfBirth: string;
}): string {
  const initials =
    String(params.lastName ?? "").charAt(0) +
    String(params.firstName ?? "").charAt(0) +
    String(params.middleName ?? "").charAt(0);

  const fullName = `${params.lastName} ${params.firstName} ${
    params.middleName || ""
  }`
    .trim()
    .toLowerCase()
    .replace(/ё/g, "е");

  const dobCode = String(params.dateOfBirth ?? "")
    .replace(/-/g, "")
    .replace(/ё/g, "е");

  return `${fullName} ${initials}${dobCode} ${dobCode}`.toLowerCase();
}