import { useContext } from "react";
import { RightPanelContext } from "./RightPanelContext";

export const useRightPanel = () => {
  const context = useContext(RightPanelContext);
  if (!context) {
    throw new Error("useRightPanel must be used within RightPanelProvider");
  }
  return context;
};