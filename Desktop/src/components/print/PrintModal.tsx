 import React from "react";
import PrintableProtocol, { type PrintableProtocolHandle } from "@/components/print/PrintableProtocol";

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoPrintToken?: string | null;
  initialEditMode?: boolean;
  researchId?: number | null;
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

/* Убираем принудительную высоту — контент сам определяет количество страниц */
#print-root {
  padding: 0 !important;
  background: #ffffff !important;
  border-radius: 0 !important;
  width: 210mm !important;
  min-height: auto !important;
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
  initialEditMode,
  researchId,
}) => {
  const protocolRef = React.useRef<PrintableProtocolHandle | null>(null);
  const [printers, setPrinters] = React.useState<Array<{ name: string; isDefault: boolean }>>([]);
  const [selectedPrinter, setSelectedPrinter] = React.useState<string>("");
  const [loadingPrinters, setLoadingPrinters] = React.useState(false);
  const [printerError, setPrinterError] = React.useState<string | null>(null);
  const [isPrintableReady, setIsPrintableReady] = React.useState(false);
  const [printerDropdownOpen, setPrinterDropdownOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(initialEditMode ?? false);
  const handledAutoPrintTokenRef = React.useRef<string | null>(null);
  const printerDropdownRef = React.useRef<HTMLDivElement | null>(null);

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
    }
  }, [isOpen]);

  const handlePrint = React.useCallback(async () => {
    const root = protocolRef.current?.getPrintRoot();
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
      <div className="bg-slate-100 rounded-xl w-[230mm] max-h-full flex flex-col overflow-hidden">
        <div className="flex items-center gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex-1 relative" ref={printerDropdownRef}>
            <button
              type="button"
              onClick={() => setPrinterDropdownOpen(!printerDropdownOpen)}
              className="w-full flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[#e0f2f7] focus:ring-1 focus:ring-[#e0f2f7]"
            >
              <span className={selectedPrinter ? "text-slate-800" : "text-slate-400"}>
                {selectedPrinter || (loadingPrinters ? "Загружаю принтеры..." : "Выберите принтер")}
              </span>
              <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {printerDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 z-10 rounded-md border border-slate-200 bg-white shadow-lg overflow-hidden">
                {printers.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-slate-400">
                    {loadingPrinters ? "Загружаю принтеры..." : "Принтеры не найдены"}
                  </div>
                ) : (
                  printers.map((printer) => {
                    const isActive = selectedPrinter === printer.name;
                    return (
                      <button
                        key={printer.name}
                        type="button"
                        onClick={() => {
                          setSelectedPrinter(printer.name);
                          setPrinterDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? "bg-[#e0f2f7] text-[#0e7490] font-medium"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {printer.name}
                        {printer.isDefault ? (
                          <span className="ml-2 text-xs text-slate-400">(по умолчанию)</span>
                        ) : null}
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {printerError ? (
              <p className="mt-1 text-xs text-rose-500">{printerError}</p>
            ) : null}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (isEditing) {
                  protocolRef.current?.saveOverrides();
                } else {
                  setIsEditing(true);
                }
              }}
              className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                isEditing
                  ? "bg-[#e0f2f7] text-[#0e7490]"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <span className="i-ph-pencil-simple-line-duotone text-base" />
              <span>{isEditing ? "Сохранить правки" : "Редактировать протокол"}</span>
            </button>

            {!isEditing && (
              <button
                onClick={() => void handlePrint()}
                disabled={
                  loadingPrinters ||
                  !isPrintableReady ||
                  (!selectedPrinter && printers.length > 0)
                }
                className="inline-flex items-center gap-2 rounded-md bg-[#e0f2f7] px-4 py-2 text-sm font-medium text-[#0e7490] transition-all hover:bg-[#c8e6f0] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="i-ph-printer-duotone text-base" />
                <span>{isPrintableReady ? "Печать" : "Подготовка..."}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-200"
            >
              <span className="i-ph-x-circle-duotone text-base" />
              <span>Закрыть</span>
            </button>
          </div>
        </div>

        <div className="overflow-auto bg-slate-100 p-4">
          <PrintableProtocol ref={protocolRef} editMode={isEditing} onSave={() => setIsEditing(false)} onReady={() => setIsPrintableReady(true)} researchId={researchId} />
        </div>
      </div>
    </div>
  );
};

export default PrintModal;
