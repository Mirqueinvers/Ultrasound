export const normalizeSelectValue = (value: string): string =>
  value.trim().toLowerCase().replaceAll("ё", "е").replace(/[\s,]+/g, "");

export const isNormalizedMatch = (
  currentValue: string,
  expectedValue: string,
): boolean =>
  normalizeSelectValue(currentValue) === normalizeSelectValue(expectedValue);
