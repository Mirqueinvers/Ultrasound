import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import {
  createDefaultFieldVisibility,
  STORAGE_KEY,
  type FieldVisibility,
  type VisibilityGroupId,
} from "./fieldVisibility";

export function useFieldVisibility() {
  const [visibility, setVisibility] = useState<FieldVisibility>(createDefaultFieldVisibility);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (cancelled) {
          return;
        }

        if (stored) {
          const parsed = JSON.parse(stored) as Partial<FieldVisibility>;
          const merged = createDefaultFieldVisibility();
          // Применяем сохранённые настройки поверх дефолтных
          for (const key of Object.keys(merged) as VisibilityGroupId[]) {
            if (typeof parsed[key] === "boolean") {
              merged[key] = parsed[key];
            }
          }
          setVisibility(merged);
        }
      } catch {
        // Используем дефолтные
      } finally {
        if (!cancelled) {
          setLoaded(true);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const setGroupVisibility = useCallback(
    (groupId: VisibilityGroupId, visible: boolean) => {
      setVisibility((prev) => {
        const next = { ...prev, [groupId]: visible };
        // Сохраняем асинхронно
        void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const toggleGroup = useCallback(
    (groupId: VisibilityGroupId) => {
      setVisibility((prev) => {
        const next = { ...prev, [groupId]: !prev[groupId] };
        void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  return {
    visibility,
    loaded,
    setGroupVisibility,
    toggleGroup,
  };
}