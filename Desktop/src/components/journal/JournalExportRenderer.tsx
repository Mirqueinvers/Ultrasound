import React from "react";
import PrintableSavedProtocol from "@/components/print/PrintableSavedProtocol";
import { ResearchProvider } from "@contexts/ResearchContext";

interface JournalExportRendererProps {
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

export function JournalExportRenderer({
  researchIds,
  fileName,
  researchMeta,
  onComplete,
}: JournalExportRendererProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [statuses, setStatuses] = React.useState<Record<number, ExportStatus>>(
    {},
  );
  const [hasTimedOut, setHasTimedOut] = React.useState(false);
  const [targetIp, setTargetIp] = React.useState("");
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

  if (researchIds.length === 0) {
    return null;
  }

  const isReady = resolvedCount === researchIds.length && researchIds.length > 0 && !isSaving;
  const allResolved = resolvedCount === researchIds.length;

  return (
    <div>
      {/* UI-панель экспорта: видна когда все протоколы отрисовались */}
      {allResolved ? (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white p-3 shadow-lg">
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">
                {researchIds.length}
              </span>
              <span>
                {isReady
                  ? "Протоколы готовы к экспорту"
                  : "Подготовка протоколов..."}
              </span>
            </div>

            <div className="flex flex-1 items-center gap-2">
              <input
                type="text"
                value={targetIp}
                onChange={(event) => setTargetIp(event.target.value)}
                placeholder="IP MyWorkSpace (192.168.1.100)"
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                disabled={networkStatus === "sending"}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void handleSaveToFile()}
                disabled={!isReady}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Сохранить</span>
              </button>

              <button
                type="button"
                onClick={() => void handleSendOverNetwork()}
                disabled={!isReady || !targetIp.trim() || networkStatus === "sending"}
                className="inline-flex items-center gap-1.5 rounded-full bg-sky-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm ring-1 ring-sky-500/70 transition-all hover:-translate-y-[1px] hover:bg-sky-500 hover:shadow-md active:translate-y-0 active:shadow-sm disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {networkStatus === "sending" ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Отправка...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span>Отправить</span>
                  </>
                )}
              </button>
            </div>

            {networkMessage ? (
              <span
                className={`text-xs ${
                  networkStatus === "error"
                    ? "text-red-600"
                    : networkStatus === "sent"
                      ? "text-green-600"
                      : "text-slate-500"
                }`}
              >
                {networkMessage}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

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
}