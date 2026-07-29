import { useCallback, useRef, useState } from "react";
import type { LayoutChangeEvent, View } from "react-native";
import { useWindowDimensions } from "react-native";

export type NumpadPosition = {
  top: number;
  left: number;
  width: number;
};

const NUMPAD_HEIGHT = 280;

export function useInlineNumpad(containerRef: React.RefObject<View | null>) {
  const { height: windowHeight } = useWindowDimensions();
  const [activeNumpadField, setActiveNumpadField] = useState<string | null>(null);
  const [numpadPosition, setNumpadPosition] = useState<NumpadPosition | null>(null);
  const [bottomPadding, setBottomPadding] = useState(0);
  const fieldWidthsRef = useRef<Record<string, number>>({});

  const handleCloseNumpad = useCallback(() => {
    setActiveNumpadField(null);
    setBottomPadding(0);
  }, []);

  const openNumpad = useCallback(
    (fieldKey: string, fieldView: View | null) => {
      setActiveNumpadField(fieldKey);

      if (!fieldView || !containerRef.current) return;

      fieldView.measureLayout(
        containerRef.current,
        (left, top, width, height) => {
          const fieldHeight = height;
          const fieldWidth = fieldWidthsRef.current[fieldKey] ?? width ?? 200;

          // Всегда под полем
          const numpadTop = top + fieldHeight + 4;

          // Если numpad не влезает — считаем нужный отступ снизу
          const neededBottom = numpadTop + NUMPAD_HEIGHT - windowHeight + 16;
          setBottomPadding(Math.max(0, neededBottom));

          setNumpadPosition({ top: numpadTop, left, width: fieldWidth });
        },
        () => {
          // fallback
        },
      );
    },
    [containerRef, windowHeight],
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
    bottomPadding,
    openNumpad,
    closeNumpad: handleCloseNumpad,
    handleFieldLayout,
  };
}