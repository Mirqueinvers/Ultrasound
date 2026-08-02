/**
 * Типизированный доступ к значениям по умолчанию органов.
 *
 * DefaultValuesContext хранит значения как Record<string, unknown>.
 * Этот модуль предоставляет типизированные геттеры, чтобы код исследований
 * не использовал `(defaults["..."] || {}) as any`.
 */
import { useDefaultValues } from "@/hooks";

/**
 * Хук, возвращающий типизированный доступ к дефолтам органов.
 * Безопасен для использования только после isLoaded === true.
 *
 * @example
 * const { getOrgan, hasOrgan, isLoaded } = useDefaultOrganValues();
 * const liver = getOrgan<LiverProtocol>("ОБП:печень");
 */
export function useDefaultOrganValues() {
  const { defaults, isLoaded } = useDefaultValues();

  /**
   * Возвращает типизированное значение дефолта секции или null.
   * @deprecated Используйте специализированные геттеры ниже.
   */
  const getOrgan = <T,>(desktopKey: string): T | null => {
    const value = defaults[desktopKey];
    if (value == null) return null;
    return value as T;
  };

  /** Возвращает типизированное значение дефолта секции или fallback. */
  const getOrganOrDefault = <T,>(desktopKey: string, fallback: T): T => {
    const value = defaults[desktopKey];
    if (value == null) return fallback;
    return value as T;
  };

  /** Проверяет, задан ли дефолт для секции. */
  const hasOrgan = (desktopKey: string): boolean => {
    return Boolean(defaults[desktopKey]);
  };

  return { defaults, isLoaded, getOrgan, getOrganOrDefault, hasOrgan };
}