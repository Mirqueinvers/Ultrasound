import React from "react";
import { useReactToPrint } from "react-to-print";
import PrintableSavedProtocol from "@/components/print/PrintableSavedProtocol";

interface PrintSavedModalProps {
  isOpen: boolean;
  onClose: () => void;
  researchId: number | null;
}

const PrintSavedModal: React.FC<PrintSavedModalProps> = ({
  isOpen,
  onClose,
  researchId,
}) => {
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = React.useState(false);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: "УЗИ-протокол",
  });

  const handleExport = React.useCallback(async () => {
    if (!contentRef.current || researchId == null) {
      return;
    }

    const exportRoot = contentRef.current.cloneNode(true) as HTMLElement;
    exportRoot.querySelectorAll("[data-print-editor]").forEach((element) => element.remove());
    exportRoot.querySelectorAll("[data-print-source]").forEach((element) => element.remove());
    exportRoot.querySelectorAll("[data-print-measure]").forEach((element) => element.remove());

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

    const html = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>УЗИ-протокол</title>
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
    </style>
  </head>
  <body>
    <div class="export-shell">${exportRoot.innerHTML}</div>
  </body>
</html>`;

    setIsExporting(true);

    try {
      const result = await window.fileAPI.saveHtml({
        content: html,
        defaultPath: `uzi-protocol-${researchId}.html`,
      });

      if (!result.success && !result.canceled) {
        window.alert(result.message || "Не удалось сохранить файл.");
      }
    } catch {
      window.alert("Не удалось сохранить файл.");
    } finally {
      setIsExporting(false);
    }
  }, [researchId]);

  if (!isOpen || researchId == null) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center bg-black/50 py-[90px] pb-[50px]"
      aria-modal="true"
      role="dialog"
    >
      <div className="flex max-h-full w-[230mm] flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-end gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <button
            onClick={() => void handleExport()}
            disabled={isExporting}
            className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm ring-1 ring-sky-500/70 transition-all hover:-translate-y-[1px] hover:bg-sky-500 hover:shadow-md active:translate-y-0 active:shadow-sm disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
          >
            <span className="i-ph-export-duotone text-base" />
            <span>{isExporting ? "Сохраняю..." : "Экспорт HTML"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm ring-1 ring-emerald-500/70 transition-all hover:-translate-y-[1px] hover:bg-emerald-500 hover:shadow-md active:translate-y-0 active:shadow-sm"
          >
            <span className="i-ph-printer-duotone text-base" />
            <span>Печать</span>
          </button>

          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-[1px] hover:bg-slate-100 hover:shadow-md active:translate-y-0 active:shadow-sm"
          >
            <span className="i-ph-x-circle-duotone text-base" />
            <span>Закрыть</span>
          </button>
        </div>

        <div className="overflow-auto bg-slate-100 p-4">
          <PrintableSavedProtocol ref={contentRef} researchId={researchId} />
        </div>
      </div>
    </div>
  );
};

export default PrintSavedModal;
