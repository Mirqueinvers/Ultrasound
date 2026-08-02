/**
 * Общие утилиты глубокого слияния данных исследований.
 *
 * Используются при импорте с флешки / мобильной синхронизации, чтобы
 * частично заполненные source-данные не затирали уже заполненные поля
 * в текущей форме исследования.
 */

/**
 * Мержит два массива узлов по индексу: source-значения имеют приоритет,
 * но только если поле в source не пустое. Это защищает селекты от затирания,
 * когда source содержит неполные узлы (например, только size1/size2 с флешки).
 */
export function mergeNodeArrays(
  target: unknown[],
  source: unknown[],
): unknown[] {
  return target
    .map((existingNode, i) => {
      const sourceNode = source[i];
      if (!sourceNode || typeof sourceNode !== "object") return existingNode;
      if (typeof existingNode !== "object") return sourceNode;
      const result = { ...(existingNode as Record<string, unknown>) };
      for (const key of Object.keys(sourceNode as Record<string, unknown>)) {
        const sourceVal = (sourceNode as Record<string, unknown>)[key];
        if (sourceVal !== undefined && sourceVal !== null && sourceVal !== "") {
          result[key] = sourceVal;
        }
      }
      return result;
    })
    .concat(
      source
        .slice(target.length)
        .map((n) =>
          typeof n === "object" ? { ...(n as Record<string, unknown>) } : n,
        ),
    );
}

/**
 * Глубокое рекурсивное слияние — мержит вложенные объекты, а не заменяет их.
 * - Если source === null/undefined — возвращает target.
 * - Если target === null/undefined — возвращает source.
 * - Если одно из значений не объект — возвращает source.
 * - Массивы без числового поля "number" — заменяются source целиком.
 * - Массивы с числовым полем "number" (nodesList, concretionsList и т.д.)
 *   сливаются по индексу через mergeNodeArrays.
 */
export function deepMerge(target: unknown, source: unknown): unknown {
  if (source === null || source === undefined) return target;
  if (target === null || target === undefined) return source;
  if (typeof target !== "object" || typeof source !== "object") return source;

  if (Array.isArray(target) || Array.isArray(source)) {
    if (
      Array.isArray(target) &&
      Array.isArray(source) &&
      source.length > 0 &&
      typeof source[0] === "object" &&
      "number" in (source[0] as Record<string, unknown>)
    ) {
      // Спецобработка для массивов с числовым полем "number"
      return mergeNodeArrays(target, source);
    }
    return source;
  }

  const result = { ...(target as Record<string, unknown>) };
  for (const key of Object.keys(source as Record<string, unknown>)) {
    const targetVal = (target as Record<string, unknown>)[key];
    const sourceVal = (source as Record<string, unknown>)[key];
    if (
      targetVal !== null &&
      targetVal !== undefined &&
      typeof targetVal === "object" &&
      !Array.isArray(targetVal) &&
      typeof sourceVal === "object" &&
      !Array.isArray(sourceVal)
    ) {
      result[key] = deepMerge(targetVal, sourceVal);
    } else if (sourceVal !== undefined) {
      result[key] = sourceVal;
    }
  }
  return result;
}