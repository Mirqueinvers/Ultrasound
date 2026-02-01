// src/components/layout/RightSidePanel.tsx
import React from "react";

import { useRightPanel } from "@contexts/RightPanelContext";
import NormalValuesPanel from "@components/hints/NormalValuesPanel";
import ObpHints from "@components/hints/ObpHints";
import KidneysHints from "@components/hints/KidneysHints";
import BreastHints from "@components/hints/BreastHints";
import ThyroidHints from "@components/hints/ThyroidHints";
import ScrotumHints from "@components/hints/ScrotumHints";
import UrinaryBladderHints from "@components/hints/UrinaryBladderHints";
import OmtFemaleHints from "@components/hints/OmtFemaleHints";
import OmtMaleHints from "@components/hints/OmtMaleHints";

const RightSidePanel: React.FC = () => {
  const { panelData, addText } = useRightPanel();

  return (
    <aside className="w-[15%] bg-white border border-slate-300 px-4 py-4 shadow-lg rounded-lg sticky top-[56px] z-10 max-h-[calc(100vh-56px)] overflow-y-auto">
      <div className="content">
        {panelData.mode === "none" ? (
          <>
            <h3 className="mt-0 text-slate-800 text-sm">Правая панель</h3>
            <p className="text-slate-500 text-xs mt-2">
              Выберите поле для просмотра подсказок
            </p>
          </>
        ) : (
          <>
            <h3 className="mt-0 text-slate-800 text-sm">{panelData.title}</h3>
            <div className="mt-4">
              {panelData.mode === "normal-values" && (
                <NormalValuesPanel
                  organ={panelData.organ!}
                  field={panelData.field}
                />
              )}
              {panelData.mode === "conclusion-samples" && (
                <>
                  {panelData.organ === "obp" && (
                    <ObpHints onAddText={addText} />
                  )}
                  {panelData.organ === "kidneys" && (
                    <KidneysHints onAddText={addText} />
                  )}
                  {panelData.organ === "breast" && (
                    <BreastHints onAddText={addText} />
                  )}
                  {panelData.organ === "thyroid" && (
                    <ThyroidHints onAddText={addText} />
                  )}
                  {panelData.organ === "scrotum" && (
                    <ScrotumHints onAddText={addText} />
                  )}
                  {panelData.organ === "urinary_bladder" && (
                    <UrinaryBladderHints onAddText={addText} />
                  )}
                  {panelData.organ === "omt_female" && (
                    <OmtFemaleHints onAddText={addText} />
                  )}
                  {panelData.organ === "omt_male" && (
                    <OmtMaleHints onAddText={addText} />
                  )}
                </>
              )}
              {panelData.mode === "custom-text" && panelData.content}
            </div>
          </>
        )}
      </div>
    </aside>
  );
};





export default RightSidePanel;
