import React, { createContext, useContext, useState } from 'react';

export type PanelMode = 'none' | 'normal-values' | 'conclusion-samples';

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
  hidePanel: () => void;
  addText: (text: string) => void;
  setAddTextCallback: (callback: ((text: string) => void) | undefined) => void;
}

const RightPanelContext = createContext<RightPanelContextType | undefined>(undefined);

export const useRightPanel = () => {
  const context = useContext(RightPanelContext);
  if (!context) {
    throw new Error('useRightPanel must be used within RightPanelProvider');
  }
  return context;
};

interface RightPanelProviderProps {
  children: React.ReactNode;
}

export const RightPanelProvider: React.FC<RightPanelProviderProps> = ({ children }) => {
  const [panelData, setPanelData] = useState<PanelData>({ mode: 'none' });
  const [onAddTextCallback, setOnAddTextCallback] = useState<((text: string) => void) | undefined>();

  const showNormalValues = (organ: string, field?: string) => {
    setPanelData({
      mode: 'normal-values',
      organ,
      field,
      title: `Нормальные значения: ${getOrganDisplayName(organ)}`,
    });
    setOnAddTextCallback(undefined);
  };

  const showConclusionSamples = (organ: string) => {
    setPanelData({
      mode: 'conclusion-samples',
      organ,
      title: `Образцы заключений: ${getOrganDisplayName(organ)}`,
    });
  };

  const hidePanel = () => {
    setPanelData({ mode: 'none' });
    setOnAddTextCallback(undefined);
  };

  const addText = (text: string) => {
    if (onAddTextCallback) {
      onAddTextCallback(text);
    }
  };

  const setAddTextCallback = (callback: ((text: string) => void) | undefined) => {
    setOnAddTextCallback(callback);
  };

  return (
    <RightPanelContext.Provider value={{
      panelData,
      showNormalValues,
      showConclusionSamples,
      hidePanel,
      addText,
      setAddTextCallback,
    }}>
      {children}
    </RightPanelContext.Provider>
  );
};

function getOrganDisplayName(organ: string): string {
  const displayNames: Record<string, string> = {
    'liver': 'Печень',
    'gallbladder': 'Желчный пузырь',
    'pancreas': 'Поджелудочная железа',
    'spleen': 'Селезенка',
    'kidneys': 'Почки',
  };
  return displayNames[organ] || organ;
}