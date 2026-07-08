import { useWindowDimensions } from "react-native";

/**
 * Returns `isLandscape: true` when the device is in landscape orientation
 * (width > height).
 */
export function useOrientation() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  return { isLandscape, width, height };
}