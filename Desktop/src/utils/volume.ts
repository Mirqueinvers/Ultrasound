/**
 * Чистая функция расчёта объёма эллипсоида: (L × W × D × coefficient) / 1000.
 * Вынесена из useOrganVolume, чтобы формулу можно было тестировать отдельно.
 */

export const calculateEllipsoidVolume = (
  length: string,
  width: string,
  depth: string,
  coefficient = 0.523,
  precision = 2,
): string => {
  const l = parseFloat(length);
  const w = parseFloat(width);
  const d = parseFloat(depth);

  if (isNaN(l) || isNaN(w) || isNaN(d) || l <= 0 || w <= 0 || d <= 0) {
    return "";
  }

  return ((l * w * d * coefficient) / 1000).toFixed(precision);
};