// Frontend/src/components/print/PrintModal.tsx
import React from "react";
import { useReactToPrint } from "react-to-print";
import PrintableProtocol from "@/components/print/PrintableProtocol";

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrintModal: React.FC<PrintModalProps> = ({ isOpen, onClose }) => {
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: "УЗИ-протокол",
    // НИЧЕГО больше не передаём: без onBeforePrint/print/onAfterPrint
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center bg-black/50 py-[90px] pb-[50px]"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-xl shadow-2xl w-[230mm] max-h-full flex flex-col overflow-hidden">
        {/* Верхняя панель с кнопками */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm ring-1 ring-emerald-500/70 hover:bg-emerald-500 hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 active:shadow-sm transition-all"
          >
            <span className="i-ph-printer-duotone text-base" />
            <span>Печать</span>
          </button>

          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 shadow-sm hover:bg-slate-100 hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 active:shadow-sm transition-all"
          >
            <span className="i-ph-x-circle-duotone text-base" />
            <span>Закрыть</span>
          </button>
        </div>

        {/* Предпросмотр */}
        <div className="overflow-auto p-4 bg-slate-100">
          <PrintableProtocol ref={contentRef} />
        </div>
      </div>
    </div>
  );
};

export default PrintModal;
