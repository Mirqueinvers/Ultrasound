import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { PROTOCOL_MANIFESTS, type ProtocolId } from "../shared/protocols";

const STORAGE_KEY = "ultrasound-mobile:protocol-order";

export function useProtocolOrder() {
  const [order, setOrder] = useState<ProtocolId[]>(() =>
    PROTOCOL_MANIFESTS.map((m) => m.id),
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (cancelled) return;

        if (stored) {
          const parsed = JSON.parse(stored) as ProtocolId[];
          // Проверяем, что все id валидны, добавляем недостающие
          const allIds = PROTOCOL_MANIFESTS.map((m) => m.id);
          const validIds = parsed.filter((id) => allIds.includes(id));
          const missingIds = allIds.filter((id) => !validIds.includes(id));
          const merged = [...validIds, ...missingIds];
          setOrder(merged);
        }
      } catch {
        // дефолтный порядок
      } finally {
        if (!cancelled) setLoaded(true);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((newOrder: ProtocolId[]) => {
    setOrder(newOrder);
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder));
  }, []);

  const moveUp = useCallback(
    (id: ProtocolId) => {
      const idx = order.indexOf(id);
      if (idx <= 0) return;
      const next = [...order];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      persist(next);
    },
    [order, persist],
  );

  const moveDown = useCallback(
    (id: ProtocolId) => {
      const idx = order.indexOf(id);
      if (idx === -1 || idx >= order.length - 1) return;
      const next = [...order];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      persist(next);
    },
    [order, persist],
  );

  return { order, loaded, moveUp, moveDown };
}