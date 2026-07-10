import { useCallback, useMemo, useRef } from "react";
import type { LayoutChangeEvent } from "react-native";
import { View } from "react-native";

import type { NumpadApi } from "../components/InlineNumpad";
import { InlineNumpad } from "../components/InlineNumpad";
import { useInlineNumpad } from "./useInlineNumpad";

type UseNumpadApiOptions = {
  isLandscape: boolean;
};

/**
 * Централизованный хук для управления InlineNumpad в landscape-режиме.
 * Заменяет дублирующийся boilerplate в каждом ProtocolBlock.
 *
 * Использование:
 *   const { numpadApi, renderInlineNumpad, landscapeRef } = useNumpadApi({ isLandscape });
 */
export function useNumpadApi({ isLandscape }: UseNumpadApiOptions) {
  const landscapeRef = useRef<View>(null);
  const fieldRefs = useRef<Record<string, View | null>>({});
  const numpad = useInlineNumpad(landscapeRef);
  const nestedNumpadValue = useRef<string>("");
  const nestedNumpadOnChange = useRef<((value: string) => void) | null>(null);

  const numpadApi: NumpadApi = useMemo(
    () => ({
      isLandscape,
      fieldRefs,
      openNumpad: (fieldKey: string, fieldView: View | null, initialValue?: string, onChange?: (value: string) => void) => {
        nestedNumpadValue.current = initialValue ?? "";
        nestedNumpadOnChange.current = onChange ?? null;
        numpad.openNumpad(fieldKey, fieldView);
      },
      handleFieldLayout: (fieldKey: string, event: LayoutChangeEvent) => {
        numpad.handleFieldLayout(fieldKey, event);
      },
    }),
    [isLandscape, numpad],
  );

  const renderInlineNumpad = useCallback(() => {
    if (!isLandscape || numpad.activeNumpadField == null || !numpad.numpadPosition) {
      return null;
    }
    return (
      <View
        style={{
          position: "absolute",
          top: numpad.numpadPosition.top,
          left: numpad.numpadPosition.left,
          width: numpad.numpadPosition.width,
          zIndex: 100,
        }}
      >
        <InlineNumpad
          value={nestedNumpadValue.current}
          onValueChange={(nextValue) => {
            if (nestedNumpadOnChange.current) {
              nestedNumpadOnChange.current(nextValue);
            }
          }}
          onClose={numpad.closeNumpad}
        />
      </View>
    );
  }, [isLandscape, numpad]);

  return {
    numpadApi,
    renderInlineNumpad,
    landscapeRef,
  };
}