import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DefaultValuesContext,
  type DefaultValuesMap,
  type DefaultValuesContextType,
} from "./DefaultValuesContext";
import { defaultsService } from "@services";

export const DefaultValuesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [defaults, setDefaults] = useState<DefaultValuesMap>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await defaultsService.load();
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
      const result = await defaultsService.save(update);
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
        const result = await defaultsService.save(newDefaults);
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
        const result = await defaultsService.reset();
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
    let cancelled = false;
    (async () => {
      try {
        const result = await defaultsService.load();
        if (cancelled) return;
        if (result.success && result.data) {
          setDefaults(result.data as DefaultValuesMap);
        }
        setIsLoaded(true);
        setError(null);
      } catch (err) {
        console.error("Failed to load defaults:", err);
        if (cancelled) return;
        setError("Не удалось загрузить значения по умолчанию");
        setIsLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value: DefaultValuesContextType = useMemo(
    () => ({ defaults, isLoaded, error, saveDefaults, resetDefaults, reload: load }),
    [defaults, isLoaded, error, saveDefaults, resetDefaults, load],
  );

  return (
    <DefaultValuesContext.Provider value={value}>
      {children}
    </DefaultValuesContext.Provider>
  );
};