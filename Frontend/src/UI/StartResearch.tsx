// Frontend/src/UI/StartResearch.tsx
import React from "react";

interface StartResearchProps {
  onStart: () => void;
}

export const StartResearch: React.FC<StartResearchProps> = ({ onStart }) => (
  <div className="content">
    <div className="mt-6">
      <div className="flex flex-col items-center justify-center py-12">
        <button
          onClick={onStart}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
        >
          Начать новое исследование
        </button>
      </div>
    </div>
  </div>
);
