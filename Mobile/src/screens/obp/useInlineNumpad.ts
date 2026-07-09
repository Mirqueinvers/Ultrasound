import { useCallback, useRef, useState } from "react";
import type { LayoutChangeEvent, View } from "react-native";
import { useWindowDimensions } from "react-native";

export type NumpadPosition = {
  top: number;
  left: number;
  width: number;
};

const NUMPAD_HEIGHT = 280; // примерная высота нампада (4 строки кнопок + кнопка Готово + дисплей + отступы)

export function useInlineNumpad(containerRef: React.RefObject<View | null>) {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const [activeNumpadField, setActiveNumpadField] = useState<string | null>(null);
  const [numpadPosition, setNumpadPosition] = useState<NumpadPosition | null>(null);
  const [showAbove, setShowAbove] = useState(false);
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
          const width = Math.min(fieldWidthsRef.current[fieldKey] ?? 200, windowWidth / 2);

          // Определяем, помещается ли нампад снизу
          const fitsBelow = top + NUMPAD_HEIGHT < windowHeight - 16;
          const adjustedTop = fitsBelow ? top + 4 : Math.max(top - NUMPAD_HEIGHT - 4, 4);

          setShowAbove(!fitsBelow);
          setNumpadPosition({ top: adjustedTop, left, width });
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
    showAbove,
    openNumpad,
    closeNumpad: handleCloseNumpad,
    handleFieldLayout,
  };
}