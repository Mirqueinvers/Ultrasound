// src/components/layout/RightSidePanel.tsx
import React from "react";

import { useRightPanel } from "@contexts/RightPanelContext";
import { useAvailableSectionKeys } from "@hooks";
import { ORG_LABELS } from "@components/common/OrgNavigation";
import NormalValuesPanel from "@components/hints/NormalValuesPanel";
import ObpHints from "@components/hints/ObpHints";
import KidneysHints from "@components/hints/KidneysHints";
import BreastHints from "@components/hints/BreastHints";
import ThyroidHints from "@components/hints/ThyroidHints";
import ScrotumHints from "@components/hints/ScrotumHints";
import UrinaryBladderHints from "@components/hints/UrinaryBladderHints";
import OmtFemaleHints from "@components/hints/OmtFemaleHints";
import OmtMaleHints from "@components/hints/OmtMaleHints";

import type { SectionKey } from "@/protocols";

interface RightSidePanelProps {
  selectedStudies?: string[];
  sectionRefs: React.MutableRefObject<
    Record<SectionKey, React.RefObject<HTMLDivElement | null>>
  >;
}

const RightSidePanel: React.FC<RightSidePanelProps> = ({ selectedStudies = [], sectionRefs }) => {
  const { panelData, addText } = useRightPanel();
  const availableSectionKeys = useAvailableSectionKeys(selectedStudies);

  const scrollToSection = (key: SectionKey) => {
    const ref = sectionRefs.current[key];
    const element =
      ref?.current ??
      (document.querySelector(
        `[data-section-key="${key}"]`
      ) as HTMLElement | null);
    if (!element) return;
    const offset = 300;

    const rect = element.getBoundingClientRect();
    const absoluteTop = rect.top + window.pageYOffset;
    const targetY = absoluteTop - offset;

    window.scrollTo({
      top: targetY,
      behavior: "smooth",
    });
  };

  return (
    <aside className="w-[15%] rounded-lg sticky top-[104px] max-h-[calc(100vh-104px)] overflow-y-auto flex flex-col bg-slate-50">
      {/* Верхняя часть — подсказки (фиксированная высота, прокрутка) */}
      <div className="h-[50vh] overflow-y-auto px-4 py-4">
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
      </div>

      {/* Нижняя часть — навигация по разделам */}
      {availableSectionKeys.length > 0 && (
        <div className="shrink-0 px-4 pt-2 pb-4 border-t border-slate-200">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Навигация
          </h4>
          <div className="space-y-0.5">
            {availableSectionKeys.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => scrollToSection(key)}
                className="block w-full text-left px-2 py-1 text-[11px] rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              >
                {ORG_LABELS[key]}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

export default RightSidePanel;
