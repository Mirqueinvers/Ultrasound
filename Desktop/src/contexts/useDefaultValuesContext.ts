import { useContext } from "react";
import { DefaultValuesContext } from "./DefaultValuesContext";

export const useDefaultValuesContext = () => {
  const context = useContext(DefaultValuesContext);
  if (!context) {
    throw new Error("useDefaultValuesContext must be used within DefaultValuesProvider");
  }
  return context;
};