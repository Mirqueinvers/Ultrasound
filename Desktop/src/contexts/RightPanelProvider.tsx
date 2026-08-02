import { useState } from "react";
import { RightPanelContext, type PanelData } from "./RightPanelContext";

interface RightPanelProviderProps {
  children: React.ReactNode;
}

function getOrganDisplayName(organ: string): string {
  const displayNames: Record<string, string> = {
    liver: "Печень",
    gallbladder: "Желчный пузырь",
    pancreas: "Поджелудочная железа",
    spleen: "Селезенка",
    kidneys: "Почки",
    obp: "ОБП",
  };
  return displayNames[organ] || organ;
}

export const RightPanelProvider: React.FC<RightPanelProviderProps> = ({
  children,
}) => {
  const [panelData, setPanelData] = useState<PanelData>({ mode: "none" });
  const [currentOrgan, setCurrentOrgan] = useState<string | undefined>();

  const showNormalValues = (organ: string, field?: string) => {
    setPanelData({
      mode: "normal-values",
      organ,
      field,
      title: `Нормальные значения: ${getOrganDisplayName(organ)}`,
    });
    setCurrentOrgan(undefined);
  };

  const showConclusionSamples = (organ: string) => {
    setPanelData({
      mode: "conclusion-samples",
      organ,
      title: `Образцы заключений: ${getOrganDisplayName(organ)}`,
    });
    setCurrentOrgan(organ);
  };

  const showCustomText = (title: string, content: React.ReactNode) => {
    setPanelData({
      mode: "custom-text",
      title,
      content,
    });
    setCurrentOrgan(undefined);
  };

  const hidePanel = () => {
    setPanelData({ mode: "none" });
    setCurrentOrgan(undefined);
  };

  const addText = (text: string) => {
    const studyId = currentOrgan ? `study-${currentOrgan}` : undefined;

    const event = new CustomEvent("add-conclusion-text", {
      detail: {
        text,
        organ: currentOrgan,
        studyId,
      },
    });
    window.dispatchEvent(event);
  };

  const setCurrentOrganHandler = (organ: string | undefined) => {
    setCurrentOrgan(organ);
  };

  return (
    <RightPanelContext.Provider
      value={{
        panelData,
        showNormalValues,
        showConclusionSamples,
        showCustomText,
        hidePanel,
        addText,
        setCurrentOrgan: setCurrentOrganHandler,
      }}
    >
      {children}
    </RightPanelContext.Provider>
  );
};