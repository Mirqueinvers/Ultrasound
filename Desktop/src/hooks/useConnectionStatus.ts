import { useEffect, useState } from "react";
import type { ConnectionStatus, ConnectionStatusInfo } from "../../electron/contracts";
import { connectionService } from "@/services/electron/connection";

const INITIAL: ConnectionStatusInfo = {
  status: "not-configured",
  lastCheckedAt: null,
};

/**
 * Хук статуса подключения к центральному серверу (этап 2.3).
 * - При монтировании запрашивает текущий статус.
 * - Подписывается на push-события смены статуса из main-процесса.
 */
export function useConnectionStatus(): ConnectionStatusInfo {
  const [statusInfo, setStatusInfo] = useState<ConnectionStatusInfo>(INITIAL);

  useEffect(() => {
    if (!connectionService.isAvailable()) {
      // Сервис недоступен (например, запуск в браузере) — оставляем INITIAL.
      return;
    }

    connectionService.getStatus().then(setStatusInfo).catch(() => {
      // Игнорируем ошибки — статус останется прежним
    });

    const unsubscribe = connectionService.onStatusChange(
      (status: ConnectionStatus) => {
        setStatusInfo((prev) => ({
          ...prev,
          status,
          lastCheckedAt: new Date().toISOString(),
        }));
      },
    );

    return () => unsubscribe();
  }, []);

  return statusInfo;
}