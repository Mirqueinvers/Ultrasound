// Frontend/src/components/print/PrintSavedModal.tsx
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

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: "УЗИ-протокол",
  });

  if (!isOpen || researchId == null) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center bg-black/50 py-[90px] pb-[50px]"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-md shadow-lg w-[230mm] max-h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200">
          <span className="text-sm text-slate-600">
            Печатная версия сохранённого протокола
          </span>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Печать
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm rounded bg-slate-200 text-slate-800 hover:bg-slate-300 transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>

        <div className="overflow-auto p-4 bg-slate-100">
          <PrintableSavedProtocol ref={contentRef} researchId={researchId} />
        </div>
      </div>
    </div>
  );
};

export default PrintSavedModal;
