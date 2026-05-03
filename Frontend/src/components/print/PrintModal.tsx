import React from "react";
import PrintableProtocol from "@/components/print/PrintableProtocol";

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoPrintToken?: string | null;
}

const buildPrintableHtml = (root: HTMLElement, title: string) => {
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

  return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
${styleChunks.join("\n\n")}

body {
  margin: 0;
  background: #ffffff;
  font-family: Arial, sans-serif;
}

.export-shell {
  padding: 0;
}
    </style>
  </head>
  <body>
    <div class="export-shell">${root.outerHTML}</div>
  </body>
</html>`;
};

const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  autoPrintToken,
}) => {
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [printers, setPrinters] = React.useState<Array<{ name: string; isDefault: boolean }>>([]);
  const [selectedPrinter, setSelectedPrinter] = React.useState<string>("");
  const [loadingPrinters, setLoadingPrinters] = React.useState(false);
  const [printerError, setPrinterError] = React.useState<string | null>(null);
  const [isPrintableReady, setIsPrintableReady] = React.useState(false);
  const handledAutoPrintTokenRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    let cancelled = false;

    const loadPrinters = async () => {
      setLoadingPrinters(true);
      setPrinterError(null);

      try {
        const result = await window.protocolAPI.getPrinters();

        if (cancelled) {
          return;
        }

        if (!result.success || result.printers.length === 0) {
          setPrinters([]);
          setSelectedPrinter("");
          setPrinterError(result.message || "Не удалось получить список принтеров");
          return;
        }

        setPrinters(result.printers);
        const defaultPrinter = result.printers.find((printer) => printer.isDefault) ?? result.printers[0];
        setSelectedPrinter(defaultPrinter?.name ?? "");
      } catch {
        if (!cancelled) {
          setPrinters([]);
          setSelectedPrinter("");
          setPrinterError("Не удалось получить список принтеров");
        }
      } finally {
        if (!cancelled) {
          setLoadingPrinters(false);
        }
      }
    };

    void loadPrinters();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) {
      setIsPrintableReady(false);
      return;
    }

    let cancelled = false;
    setIsPrintableReady(false);

    const checkReady = () => {
      if (cancelled) {
        return;
      }

      const root = contentRef.current;
      const ready = Boolean(root?.querySelector(".print-page"));
      if (ready) {
        setIsPrintableReady(true);
        return;
      }

      requestAnimationFrame(checkReady);
    };

    requestAnimationFrame(checkReady);

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const handlePrint = React.useCallback(async () => {
    const root = contentRef.current;
    if (!root || !isPrintableReady) {
      return;
    }

    const html = buildPrintableHtml(root, "УЗИ-протокол");
    const result = await window.protocolAPI.printHtml({
      content: html,
      title: "УЗИ-протокол",
      printerName: selectedPrinter || undefined,
    });

    if (!result.success) {
      throw new Error(result.message || "Не удалось отправить документ на печать");
    }
  }, [isPrintableReady, selectedPrinter]);

  React.useEffect(() => {
    if (!isOpen || !autoPrintToken) {
      return;
    }

    if (
      loadingPrinters ||
      !isPrintableReady ||
      (!selectedPrinter && printers.length > 0)
    ) {
      return;
    }

    if (handledAutoPrintTokenRef.current === autoPrintToken) {
      return;
    }

    handledAutoPrintTokenRef.current = autoPrintToken;
    void handlePrint();
  }, [
    autoPrintToken,
    handlePrint,
    isOpen,
    isPrintableReady,
    loadingPrinters,
    printers.length,
    selectedPrinter,
  ]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center bg-black/50 py-[90px] pb-[50px]"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-xl shadow-2xl w-[230mm] max-h-full flex flex-col overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="min-w-[260px] flex-1">
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
              Принтер
            </label>
            <select
              value={selectedPrinter}
              onChange={(event) => setSelectedPrinter(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              {printers.length === 0 ? (
                <option value="">
                  {loadingPrinters ? "Загружаю принтеры..." : "Принтеры не найдены"}
                </option>
              ) : (
                printers.map((printer) => (
                  <option key={printer.name} value={printer.name}>
                    {printer.name}
                    {printer.isDefault ? " (по умолчанию)" : ""}
                  </option>
                ))
              )}
            </select>
            {printerError ? (
              <p className="mt-1 text-xs text-rose-500">{printerError}</p>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => void handlePrint()}
              disabled={
                loadingPrinters ||
                !isPrintableReady ||
                (!selectedPrinter && printers.length > 0)
              }
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm ring-1 ring-emerald-500/70 transition-all hover:-translate-y-[1px] hover:bg-emerald-500 hover:shadow-md active:translate-y-0 active:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="i-ph-printer-duotone text-base" />
              <span>{isPrintableReady ? "Печать" : "Подготовка..."}</span>
            </button>

            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-[1px] hover:bg-slate-100 hover:shadow-md active:translate-y-0 active:shadow-sm"
            >
              <span className="i-ph-x-circle-duotone text-base" />
              <span>Закрыть</span>
            </button>
          </div>
        </div>

        <div className="overflow-auto p-4 bg-slate-100">
          <PrintableProtocol ref={contentRef} />
        </div>
      </div>
    </div>
  );
};

export default PrintModal;
