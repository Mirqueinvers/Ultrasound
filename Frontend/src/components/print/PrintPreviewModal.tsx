// path: src/components/print/PrintPreviewModal.tsx

import React from "react";

interface PrintPreviewModalProps {
  children: React.ReactNode;      // что показываем в предпросмотре
  onClose: () => void;            // закрыть модалку
}

const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60">
      <div className="bg-white w-[210mm] min-h-[297mm] max-h-[95vh] overflow-auto shadow-xl border">
        {/* Шапка модалки */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-slate-50">
          <span className="text-sm text-slate-600">Предпросмотр печати</span>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Печать
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
            >
              Закрыть
            </button>
          </div>
        </div>

        {/* Область, которая уйдёт на печать */}
        <div id="print-area" className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PrintPreviewModal;
