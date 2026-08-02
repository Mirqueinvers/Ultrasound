import { createContext } from "react";

export type PanelMode = "none" | "normal-values" | "conclusion-samples" | "custom-text";

export interface PanelData {
  mode: PanelMode;
  organ?: string;
  field?: string;
  title?: string;
  content?: React.ReactNode;
}

export interface RightPanelContextType {
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