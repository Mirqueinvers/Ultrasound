import { type ReactNode, useCallback, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { getProtocolManifestByLabel } from "../shared/protocols";
import type { ProtocolManifest } from "../shared/protocols";

type SwipeableDraftAreaProps = {
  children: ReactNode;
  activeProtocolManifest: ProtocolManifest | null;
  activeSectionId: string | null;
  selectedStudies: string[];
  onSelectSection: (sectionId: string) => void;
  onSelectProtocol: (manifest: ProtocolManifest) => void;
};

const SWIPE_THRESHOLD = 60;

/**
 * Оборачивает содержимое протокола и ловит горизонтальный свайп.
 * Использует react-native-gesture-handler (не конфликтует с ScrollView).
 */
export function SwipeableDraftArea({
  children,
  activeProtocolManifest,
  activeSectionId,
  selectedStudies,
  onSelectSection,
  onSelectProtocol,
}: SwipeableDraftAreaProps) {
  const startXRef = useRef(0);

  const handleSwipe = useCallback((direction: "left" | "right") => {
    if (!activeProtocolManifest || !activeSectionId) return;

    const sections = activeProtocolManifest.sections;
    const currentIndex = sections.findIndex((s) => s.id === activeSectionId);
    if (currentIndex === -1) return;

    const currentLabel = activeProtocolManifest.selectionLabel;

    if (direction === "left") {
      // → следующий раздел / протокол
      if (currentIndex + 1 < sections.length) {
        onSelectSection(sections[currentIndex + 1].id);
        return;
      }
      const labelIndex = selectedStudies.indexOf(currentLabel);
      if (labelIndex === -1 || labelIndex + 1 >= selectedStudies.length) return;
      const nextLabel = selectedStudies[labelIndex + 1];
      const nextManifest = getProtocolManifestByLabel(nextLabel);
      if (!nextManifest) return;
      onSelectProtocol(nextManifest);
      if (nextManifest.sections.length > 0) {
        onSelectSection(nextManifest.sections[0].id);
      }
    } else {
      // ← предыдущий раздел / протокол
      if (currentIndex > 0) {
        onSelectSection(sections[currentIndex - 1].id);
        return;
      }
      const labelIndex = selectedStudies.indexOf(currentLabel);
      if (labelIndex <= 0) return;
      const prevLabel = selectedStudies[labelIndex - 1];
      const prevManifest = getProtocolManifestByLabel(prevLabel);
      if (!prevManifest) return;
      onSelectProtocol(prevManifest);
      if (prevManifest.sections.length > 0) {
        onSelectSection(prevManifest.sections[prevManifest.sections.length - 1].id);
      }
    }
  }, [activeProtocolManifest, activeSectionId, selectedStudies, onSelectSection, onSelectProtocol]);

  const panGesture = Gesture.Pan()
    .minDistance(SWIPE_THRESHOLD)
    .onStart(() => {
      // не нужно
    })
    .onEnd((event) => {
      // Только если горизонтальное движение значительно больше вертикального
      if (Math.abs(event.translationX) < SWIPE_THRESHOLD) return;
      if (Math.abs(event.translationX) < Math.abs(event.translationY) * 1.5) return;

      if (event.translationX < 0) {
        handleSwipe("left");
      } else {
        handleSwipe("right");
      }
    });

  // Плашка с названием раздела
  const sectionLabel = activeProtocolManifest?.sections.find(s => s.id === activeSectionId)?.label;
  const protocolLabel = activeProtocolManifest?.selectionLabel;

  return (
    <GestureDetector gesture={panGesture}>
      <View style={{ flex: 1 }}>
        {children}
        <View style={styles.indicator} pointerEvents="none">
          <Text style={styles.indicatorText}>
            {protocolLabel ? `${protocolLabel} → ${sectionLabel ?? ""}` : ""}
          </Text>
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  indicator: {
    position: "absolute",
    top: 4,
    alignSelf: "center",
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.1)",
  },
  indicatorText: {
    color: "#cbd5e1",
    fontSize: 10,
    fontWeight: "700",
  },
});