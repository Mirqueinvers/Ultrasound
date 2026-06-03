// Frontend/src/UI/StartResearch.tsx
import React from "react";

interface StartResearchProps {
  onStart: () => void;
}

export const StartResearch: React.FC<StartResearchProps> = ({ onStart }) => (
  <div className="content">
    <div className="mt-6">
      <div className="flex flex-col items-center justify-center py-16">
        <button
          onClick={onStart}
          className="group relative inline-flex items-center justify-center rounded-full bg-sky-600 px-10 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all hover:bg-sky-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
        >
          <span className="absolute inset-0 rounded-full bg-sky-500 opacity-0 blur-sm transition-opacity group-hover:opacity-40" />
          <span className="relative">
            Начать новое исследование
          </span>
        </button>
      </div>
    </div>
  </div>
);
