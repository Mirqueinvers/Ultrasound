// src/hooks/useDefaultValues.ts

import { useCallback, useEffect, useState } from "react";

type DefaultValuesMap = Record<string, Record<string, unknown>>;

export function useDefaultValues() {
  const [defaults, setDefaults] = useState<DefaultValuesMap>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await window.defaultsAPI.load();
      if (result.success && result.data) {
        setDefaults(result.data as DefaultValuesMap);
      }
      setIsLoaded(true);
      setError(null);
    } catch (err) {
      console.error("Failed to load defaults:", err);
      setError("Не удалось загрузить значения по умолчанию");
      setIsLoaded(true);
    }
  }, []);

  const saveDefaults = useCallback(async (desktopKey: string, values: Record<string, unknown>) => {
    try {
      const update = { [desktopKey]: values };
      const result = await window.defaultsAPI.save(update);
      if (result.success) {
        setDefaults((prev) => ({ ...prev, [desktopKey]: values }));
        setError(null);
      } else {
        setError(result.message ?? "Ошибка сохранения");
      }
    } catch (err) {
      console.error("Failed to save defaults:", err);
      setError("Не удалось сохранить значения по умолчанию");
    }
  }, []);

  const resetDefaults = useCallback(async (desktopKey?: string) => {
    if (desktopKey) {
      try {
        const newDefaults = { ...defaults };
        delete newDefaults[desktopKey];
        const result = await window.defaultsAPI.save(newDefaults);
        if (result.success) {
          setDefaults(newDefaults);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to reset defaults:", err);
        setError("Не удалось сбросить значения");
      }
    } else {
      try {
        const result = await window.defaultsAPI.reset();
        if (result.success) {
          setDefaults({});
          setError(null);
        }
      } catch (err) {
        console.error("Failed to reset all defaults:", err);
        setError("Не удалось сбросить все значения");
      }
    }
  }, [defaults]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    defaults,
    isLoaded,
    error,
    load,
    saveDefaults,
    resetDefaults,
  };
}