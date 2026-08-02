import { useContext } from "react";
import { ResearchContext } from "./ResearchContext";

export const useResearch = () => {
  const context = useContext(ResearchContext);
  if (!context) {
    throw new Error("useResearch must be used within ResearchProvider");
  }
  return context;
};