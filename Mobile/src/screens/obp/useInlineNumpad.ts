import { useCallback, useRef, useState } from "react";
import type { LayoutChangeEvent, View } from "react-native";

export type NumpadPosition = {
  top: number;
  left: number;
  width: number;
};

export function useInlineNumpad(containerRef: React.RefObject<View | null>) {
  const [activeNumpadField, setActiveNumpadField] = useState<string | null>(null);
  const [numpadPosition, setNumpadPosition] = useState<NumpadPosition | null>(null);
  const fieldWidthsRef = useRef<Record<string, number>>({});

  const handleCloseNumpad = useCallback(() => {
    setActiveNumpadField(null);
  }, []);

  const openNumpad = useCallback(
    (fieldKey: string, fieldView: View | null) => {
      setActiveNumpadField(fieldKey);

      if (!fieldView || !containerRef.current) return;

      fieldView.measureLayout(
        containerRef.current,
        (left, top) => {
          const width = fieldWidthsRef.current[fieldKey] ?? 200;
          setNumpadPosition({ top: top + 4, left, width });
        },
        () => {
          // fallback: оставляем предыдущую позицию
        },
      );
    },
    [containerRef],
  );

  const handleFieldLayout = useCallback(
    (fieldKey: string, event: LayoutChangeEvent) => {
      const { width } = event.nativeEvent.layout;
      fieldWidthsRef.current[fieldKey] = width;
    },
    [],
  );

  return {
    activeNumpadField,
    numpadPosition,
    openNumpad,
    closeNumpad: handleCloseNumpad,
    handleFieldLayout,
  };
}