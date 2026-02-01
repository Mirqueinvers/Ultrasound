// src/contexts/RightPanelContext.tsx
import React, { createContext, useContext, useState } from "react";

export type PanelMode = "none" | "normal-values" | "conclusion-samples" | "custom-text";

export interface PanelData {
  mode: PanelMode;
  organ?: string;
  field?: string;
  title?: string;
  content?: React.ReactNode;
}

interface RightPanelContextType {
  panelData: PanelData;
  showNormalValues: (organ: string, field?: string) => void;
  showConclusionSamples: (organ: string) => void;
  showCustomText: (title: string, content: React.ReactNode) => void;
  hidePanel: () => void;
  addText: (text: string) => void;
  setCurrentOrgan: (organ: string | undefined) => void;
}

export const RightPanelContext = createContext<RightPanelContextType | undefined>(
  undefined
);

export const useRightPanel = () => {
  const context = useContext(RightPanelContext);
  if (!context) {
    throw new Error("useRightPanel must be used within RightPanelProvider");
  }
  return context;
};

interface RightPanelProviderProps {
  children: React.ReactNode;
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
        studyId 
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
