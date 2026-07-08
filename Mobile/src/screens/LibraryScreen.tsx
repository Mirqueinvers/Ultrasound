import { Pressable, Text, View } from "react-native";

import { SectionPanel } from "../components/SectionPanel";
import { useOrientation } from "../hooks/useOrientation";
import type { ProtocolManifest } from "../shared/protocols";
import type { AppStyles } from "../styles/appStyles";

type LibraryScreenProps = {
  styles: AppStyles;
  manifests: ProtocolManifest[];
  selectedStudies: string[];
  focusedProtocolId: string | null;
  onToggleProtocol: (manifest: ProtocolManifest) => void;
};

export function LibraryScreen({
  styles,
  manifests,
  selectedStudies,
  focusedProtocolId,
  onToggleProtocol,
}: LibraryScreenProps) {
  const { isLandscape } = useOrientation();

  return (
    <SectionPanel
      styles={styles}
      title="Протоколы"
      subtitle="Выберите исследование, которое хотите редактировать на телефоне."
    >
      <View
        style={[
          styles.libraryGrid,
          isLandscape && { flexDirection: "row", flexWrap: "wrap", gap: 8 },
        ]}
      >
        {manifests.map((manifest) => {
          const selected = selectedStudies.includes(manifest.selectionLabel);
          const focus = focusedProtocolId === manifest.id;

          return (
            <Pressable
              key={manifest.id}
              onPress={() => onToggleProtocol(manifest)}
              style={({ pressed }) => [
                styles.protocolCard,
                selected && styles.protocolCardSelected,
                focus && styles.protocolCardFocused,
                pressed && styles.protocolCardPressed,
                isLandscape && { width: "48.5%" },
              ]}
            >
              <View style={styles.protocolCardHeader}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.protocolTitle}>{manifest.selectionLabel}</Text>
                  <Text style={styles.protocolDescription}>{manifest.title}</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </SectionPanel>
  );
}