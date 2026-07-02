import { useEffect, useMemo, useRef, useState, type RefObject, type SetStateAction } from "react";
import { useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { createSyncTimestamp, type MobileSyncWireMessage } from "../shared/mobileSync";
import { type TabKey } from "../components/TabBar";

const initialHostUrl = "http://192.168.1.10:38241";
const lastHostStorageKey = "ultrasound-mobile:last-host-url";
const lastCodeStorageKey = "ultrasound-mobile:last-pairing-code";

type ConnectionState = "idle" | "checking" | "connecting" | "connected" | "error";
type SocketStatus = "closed" | "open";
type SaveState = "idle" | "requested" | "saved";

type UseMobileConnectionOptions = {
  setActiveTab: (value: SetStateAction<TabKey>) => void;
  setSaveState: (value: SetStateAction<SaveState>) => void;
  wireMessageHandlerRef: RefObject<((message: MobileSyncWireMessage) => void) | null>;
};

export function useMobileConnection({
  setActiveTab,
  setSaveState,
  wireMessageHandlerRef,
}: UseMobileConnectionOptions) {
  const [hostUrlInput, setHostUrlInput] = useState(initialHostUrl);
  const [pairingCode, setPairingCode] = useState("");
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const [connectionError, setConnectionError] = useState("");
  const [socketStatus, setSocketStatus] = useState<SocketStatus>("closed");
  const [scannerVisible, setScannerVisible] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const socketRef = useRef<WebSocket | null>(null);
  const qrScanHandledRef = useRef(false);

  const hostUrl = useMemo(() => normalizeHostUrl(hostUrlInput), [hostUrlInput]);
  const connected = connectionState === "connected" && socketStatus === "open";

  useEffect(() => {
    let cancelled = false;

    const hydrateConnection = async () => {
      try {
        const [storedHostUrl, storedPairingCode] = await Promise.all([
          AsyncStorage.getItem(lastHostStorageKey),
          AsyncStorage.getItem(lastCodeStorageKey),
        ]);

        if (cancelled) {
          return;
        }

        if (storedHostUrl) {
          setHostUrlInput(storedHostUrl);
        }

        if (storedPairingCode) {
          setPairingCode(storedPairingCode);
        }

        if (storedHostUrl && storedPairingCode) {
          await connectToHost({
            hostUrl: storedHostUrl,
            pairingCode: storedPairingCode,
          });
        }
      } catch {
        // Best-effort hydration only.
      }
    };

    void hydrateConnection();

    return () => {
      cancelled = true;
    };
    // The hydration pass only runs on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      socketRef.current?.close();
    };
  }, []);

  function normalizeHostUrl(value: string): string {
    const trimmed = value.trim().replace(/\/+$/, "");
    if (!trimmed) {
      return "";
    }

    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }

    return `http://${trimmed}`;
  }

  function toWsUrl(httpUrl: string): string {
    return httpUrl.replace(/^http/i, "ws");
  }

  function parseMobileSyncPayload(raw: string): { host: string; code: string } | null {
    try {
      const url = new URL(raw);

      if (url.protocol !== "ultrasound-mobile:" || url.hostname !== "connect") {
        return null;
      }

      const host = url.searchParams.get("host") ?? "";
      const code = url.searchParams.get("code") ?? "";

      if (!host || !code) {
        return null;
      }

      return { host, code };
    } catch {
      return null;
    }
  }

  const emitWireMessage = (message: MobileSyncWireMessage) => {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    socket.send(JSON.stringify(message));
  };

  const connectToHost = async (override?: {
    hostUrl?: string;
    pairingCode?: string;
  }) => {
    const resolvedHostUrl = normalizeHostUrl(override?.hostUrl ?? hostUrlInput);
    const resolvedPairingCode = (override?.pairingCode ?? pairingCode).trim();

    if (!resolvedHostUrl || !resolvedPairingCode) {
      setConnectionError("Не удалось разобрать URL рабочего места.");
      return;
    }

    setConnectionState("checking");
    setConnectionError("");

    try {
      const healthResponse = await fetch(`${resolvedHostUrl}/health`);
      const healthJson = (await healthResponse.json()) as {
        success?: boolean;
        status?: { sessionId?: string | null };
        message?: string;
      };

      if (!healthJson.success) {
        throw new Error(healthJson.message || "Проверка рабочего места не удалась.");
      }

      const pairResponse = await fetch(`${resolvedHostUrl}/pair`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: resolvedPairingCode }),
      });

      const pairJson = (await pairResponse.json()) as {
        success?: boolean;
        sessionId?: string;
        message?: string;
      };

      if (!pairJson.success) {
        throw new Error(pairJson.message || "Сопряжение не удалось.");
      }

      setConnectionState("connecting");

      const wsUrl = `${toWsUrl(resolvedHostUrl)}/ws?code=${encodeURIComponent(
        resolvedPairingCode,
      )}`;
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      setHostUrlInput(resolvedHostUrl);
      setPairingCode(resolvedPairingCode);

      socket.onopen = () => {
        setSocketStatus("open");
        setConnectionState("connected");
        setActiveTab("library");

        void Promise.all([
          AsyncStorage.setItem(lastHostStorageKey, resolvedHostUrl),
          AsyncStorage.setItem(lastCodeStorageKey, resolvedPairingCode),
        ]);

        setSaveState("idle");

        socket.send(
          JSON.stringify({
            type: "sync:requestState",
            origin: "mobile",
            updatedAt: createSyncTimestamp(),
          }),
        );
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(String(event.data)) as MobileSyncWireMessage;
          wireMessageHandlerRef.current?.(message);
        } catch {
          // Ignore malformed payloads for now.
        }
      };

      socket.onerror = () => {
        setConnectionState("error");
        setConnectionError("Не удалось подключиться к рабочему месту.");
      };

      socket.onclose = () => {
        setSocketStatus("closed");
        setConnectionState((current) => (current === "connected" ? "idle" : current));
      };
    } catch (error) {
      setConnectionState("error");
      setSocketStatus("closed");
      setConnectionError(
        error instanceof Error ? error.message : "Не удалось подключиться к рабочему месту.",
      );
    }
  };

  const disconnect = () => {
    socketRef.current?.close();
    socketRef.current = null;
    setSocketStatus("closed");
    setConnectionState("idle");
    setSaveState("idle");
  };

  const openScanner = async () => {
    setConnectionError("");
    setActiveTab("settings");
    qrScanHandledRef.current = false;

    if (!cameraPermission?.granted) {
      const permission = await requestCameraPermission();
      if (!permission.granted) {
        setConnectionError("Разрешите доступ к камере, чтобы сканировать QR-код.");
        return;
      }
    }

    setScannerVisible(true);
  };

  const closeScanner = () => {
    setScannerVisible(false);
    qrScanHandledRef.current = false;
  };

  const handleQrScanned = async (payload: string) => {
    if (qrScanHandledRef.current) {
      return;
    }

    const parsed = parseMobileSyncPayload(payload);

    if (!parsed) {
      setConnectionError("Этот QR-код не похож на Ultrasound Mobile.");
      return;
    }

    qrScanHandledRef.current = true;
    setScannerVisible(false);
    setHostUrlInput(parsed.host);
    setPairingCode(parsed.code);
    await connectToHost({
      hostUrl: parsed.host,
      pairingCode: parsed.code,
    });
  };

  return {
    pairingCode,
    connectionState,
    connectionError,
    socketStatus,
    scannerVisible,
    cameraPermission,
    requestCameraPermission,
    hostUrl,
    connected,
    toWsUrl,
    connectToHost,
    disconnect,
    openScanner,
    closeScanner,
    handleQrScanned,
    setHostUrlInput,
    setPairingCode,
    setConnectionError,
    emitWireMessage,
  };
}
