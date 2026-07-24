import React from "react";
import PrintableSavedProtocol from "@/components/print/PrintableSavedProtocol";
import { ResearchProvider } from "@contexts/ResearchContext";

export interface JournalExportRendererApi {
  handleSaveToFile: () => Promise<void>;
  handleSendOverNetwork: () => Promise<void>;
  isReady: boolean;
  targetIp: string;
  setTargetIp: (ip: string) => void;
  networkStatus: "idle" | "sending" | "sent" | "error";
  networkMessage: string;
}

export interface JournalExportRendererProps {
  researchIds: number[];
  fileName: string;
  researchMeta: Record<
    number,
    {
      patientName: string;
      researchDate: string;
    }
  >;
  onComplete: (result?: {
    failedResearches: Array<{
      researchId: number;
      patientName: string;
      researchDate: string;
    }>;
  }) => void;
}

type ExportStatus = "pending" | "ready" | "failed";
type NetworkStatus = "idle" | "sending" | "sent" | "error";

interface ExportProtocolBoundaryProps {
  researchId: number;
  onFail: (researchId: number, reason: string) => void;
  children: React.ReactNode;
}

interface ExportProtocolBoundaryState {
  hasError: boolean;
}

class ExportProtocolBoundary extends React.Component<
  ExportProtocolBoundaryProps,
  ExportProtocolBoundaryState
> {
  state: ExportProtocolBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ExportProtocolBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown export render error";
    this.props.onFail(this.props.researchId, message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "12px",
            border: "1px solid #fecaca",
            background: "#fff1f2",
            color: "#9f1239",
            fontSize: "14px",
          }}
        >
          Протокол исследования #{this.props.researchId} не удалось отрисовать
          для экспорта.
        </div>
      );
    }

    return this.props.children;
  }
}

export const JournalExportRenderer = React.forwardRef<
  JournalExportRendererApi,
  JournalExportRendererProps
>(function JournalExportRenderer(
  { researchIds, fileName, researchMeta, onComplete },
  ref,
) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [statuses, setStatuses] = React.useState<Record<number, ExportStatus>>(
    {},
  );
  const [hasTimedOut, setHasTimedOut] = React.useState(false);
  const [targetIp, setTargetIp] = React.useState(() => {
    return localStorage.getItem("exportTargetIp") || "";
  });
  const [networkStatus, setNetworkStatus] = React.useState<NetworkStatus>("idle");
  const [networkMessage, setNetworkMessage] = React.useState("");
  const htmlRef = React.useRef<string>("");

  const readyCount = React.useMemo(
    () => Object.values(statuses).filter((status) => status === "ready").length,
    [statuses],
  );
  const failedIds = React.useMemo(
    () =>
      Object.entries(statuses)
        .filter(([, status]) => status === "failed")
        .map(([researchId]) => Number(researchId)),
    [statuses],
  );
  const resolvedCount = readyCount + failedIds.length;

  const isReady = resolvedCount === researchIds.length && researchIds.length > 0 && !isSaving;

  const markStatus = React.useCallback(
    (researchId: number, status: ExportStatus) => {
      setStatuses((currentStatuses) => {
        if (currentStatuses[researchId] === status) {
          return currentStatuses;
        }

        return {
          ...currentStatuses,
          [researchId]: status,
        };
      });
    },
    [],
  );

  const handleReady = React.useCallback(
    (researchId: number) => {
      markStatus(researchId, "ready");
    },
    [markStatus],
  );

  const handleFail = React.useCallback(
    (researchId: number, reason: string) => {
      console.error(
        `[JournalExport] Failed to render research ${researchId}: ${reason}`,
      );
      markStatus(researchId, "failed");
    },
    [markStatus],
  );

  React.useEffect(() => {
    setIsSaving(false);
    setHasTimedOut(false);
    setStatuses(
      Object.fromEntries(researchIds.map((researchId) => [researchId, "pending"])),
    );
    htmlRef.current = "";
    setNetworkStatus("idle");
    setNetworkMessage("");
  }, [researchIds]);

  React.useEffect(() => {
    if (researchIds.length === 0 || resolvedCount === researchIds.length) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const pendingIds = researchIds.filter(
        (researchId) => statuses[researchId] === "pending",
      );

      if (pendingIds.length === 0) {
        return;
      }

      console.error(
        `[JournalExport] Timeout while rendering researches: ${pendingIds.join(", ")}`,
      );

      setHasTimedOut(true);
      setStatuses((currentStatuses) => {
        const nextStatuses = { ...currentStatuses };

        pendingIds.forEach((researchId) => {
          nextStatuses[researchId] = "failed";
        });

        return nextStatuses;
      });
    }, 15000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [researchIds, resolvedCount, statuses]);

  const buildHtml = React.useCallback((): string | null => {
    if (!containerRef.current) return null;

    const styleChunks: string[] = [];

    for (const styleSheet of Array.from(document.styleSheets)) {
      try {
        const rules = Array.from(styleSheet.cssRules)
          .map((rule) => rule.cssText)
          .join("\n");

        if (rules) {
          styleChunks.push(rules);
        }
      } catch {
        if (styleSheet.href) {
          styleChunks.push(`@import url("${styleSheet.href}");`);
        }
      }
    }

    const exportRoot = containerRef.current.cloneNode(true) as HTMLElement;
    exportRoot.querySelectorAll("[data-print-editor]").forEach((element) => element.remove());
    exportRoot.querySelectorAll("[data-print-source]").forEach((element) => element.remove());
    exportRoot.querySelectorAll("[data-print-measure]").forEach((element) => element.remove());

    return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>УЗИ-протоколы</title>
    <style>
${styleChunks.join("\n\n")}

body {
  margin: 0;
  background: #e2e8f0;
  font-family: Arial, sans-serif;
}

.export-shell {
  padding: 16px;
}

.export-protocol + .export-protocol {
  margin-top: 24px;
}
    </style>
  </head>
  <body>
    <div class="export-shell">${exportRoot.innerHTML}</div>
  </body>
</html>`;
  }, []);

  const handleSaveToFile = React.useCallback(async () => {
    const html = htmlRef.current;
    if (!html) return;

    setIsSaving(true);

    try {
      if (hasTimedOut || failedIds.length > 0) {
        window.alert(
          "Часть протоколов не удалось экспортировать. После сохранения файла их список появится в журнале.",
        );
      }

      const result = await window.fileAPI.saveHtml({
        content: html,
        defaultPath: fileName,
      });

      if (!result.success && !result.canceled) {
        window.alert(result.message || "Не удалось сохранить файл.");
      }
    } catch {
      window.alert("Не удалось сохранить файл.");
    } finally {
      onComplete({
        failedResearches: failedIds.map((researchId) => ({
          researchId,
          patientName:
            researchMeta[researchId]?.patientName || "Неизвестный пациент",
          researchDate: researchMeta[researchId]?.researchDate || "",
        })),
      });
    }
  }, [failedIds, fileName, hasTimedOut, onComplete, researchMeta]);

  const handleSendOverNetwork = React.useCallback(async () => {
    const html = htmlRef.current;
    if (!html) return;

    const normalizedIp = targetIp.trim();
    if (!normalizedIp) {
      window.alert("Введите IP-адрес компьютера MyWorkSpace.");
      return;
    }

    setNetworkStatus("sending");
    setNetworkMessage("");

    try {
      const result = await window.networkAPI.sendExport({
        targetIp: normalizedIp,
        html,
        fileName,
      });

      if (result.success) {
        setNetworkStatus("sent");
        setNetworkMessage(
          `Импортировано: ${result.imported ?? 0}, пропущено дублей: ${result.skipped ?? 0}`,
        );
      } else {
        setNetworkStatus("error");
        setNetworkMessage(result.message || "Не удалось отправить по сети.");
      }
    } catch (error) {
      setNetworkStatus("error");
      setNetworkMessage(
        error instanceof Error ? error.message : "Не удалось отправить по сети.",
      );
    }
  }, [fileName, targetIp]);

  React.useEffect(() => {
    if (
      isSaving ||
      researchIds.length === 0 ||
      resolvedCount !== researchIds.length ||
      !containerRef.current
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      const html = buildHtml();
      if (html) {
        htmlRef.current = html;
      }
    }, 150);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    buildHtml,
    isSaving,
    researchIds.length,
    resolvedCount,
  ]);

  React.useImperativeHandle(
    ref,
    () => ({
      handleSaveToFile,
      handleSendOverNetwork,
      isReady,
      targetIp,
      setTargetIp,
      networkStatus,
      networkMessage,
    }),
    [
      handleSaveToFile,
      handleSendOverNetwork,
      isReady,
      targetIp,
      setTargetIp,
      networkStatus,
      networkMessage,
    ],
  );

  if (researchIds.length === 0) {
    return null;
  }

  return (
    <div>
      {/* Скрытый контейнер для рендеринга протоколов */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          left: "-100000px",
          top: 0,
          width: "230mm",
          pointerEvents: "none",
          opacity: 0,
        }}
      >
        <div ref={containerRef}>
          {researchIds.map((researchId) => (
            <div
              key={researchId}
              className="export-protocol"
              style={{ breakAfter: "page", pageBreakAfter: "always" }}
            >
              {statuses[researchId] === "failed" ? (
                <div
                  style={{
                    padding: "12px",
                    border: "1px solid #fecaca",
                    background: "#fff1f2",
                    color: "#9f1239",
                    fontSize: "14px",
                  }}
                >
                  Протокол исследования #{researchId} пропущен из-за ошибки
                  экспорта.
                </div>
              ) : (
                <ResearchProvider>
                  <ExportProtocolBoundary
                    researchId={researchId}
                    onFail={handleFail}
                  >
                    <PrintableSavedProtocol
                      researchId={researchId}
                      onReady={handleReady}
                    />
                  </ExportProtocolBoundary>
                </ResearchProvider>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});