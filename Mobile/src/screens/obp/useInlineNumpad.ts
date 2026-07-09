import { useCallback, useRef, useState } from "react";
import type { LayoutChangeEvent } from "react-native";

export type NumpadPosition = {
  top: number;
  left: number;
  width: number;
};

export function useInlineNumpad() {
  const [activeNumpadField, setActiveNumpadField] = useState<string | null>(null);
  const [numpadPosition, setNumpadPosition] = useState<NumpadPosition | null>(null);
  const fieldLayoutsRef = useRef<Record<string, NumpadPosition>>({});

  const handleCloseNumpad = useCallback(() => {
    setActiveNumpadField(null);
  }, []);

  const openNumpad = useCallback((fieldKey: string) => {
    setActiveNumpadField(fieldKey);
    const storedLayout = fieldLayoutsRef.current[fieldKey];
    if (storedLayout) {
      setNumpadPosition(storedLayout);
    }
  }, []);

  const handleFieldLayout = useCallback(
    (fieldKey: string, event: LayoutChangeEvent) => {
      const { y, height, x, width } = event.nativeEvent.layout;
      fieldLayoutsRef.current[fieldKey] = { top: y + height, left: x, width };
    },
    [],
  );

  const isNumpadActiveFor = useCallback(
    (fieldKey: string) => activeNumpadField === fieldKey,
    [activeNumpadField],
  );

  return {
    activeNumpadField,
    numpadPosition,
    openNumpad,
    closeNumpad: handleCloseNumpad,
    handleFieldLayout,
    isNumpadActiveFor,
  };
}