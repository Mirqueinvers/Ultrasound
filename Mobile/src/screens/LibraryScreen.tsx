import { Pressable, Text, View } from "react-native";

import { SectionPanel } from "../components/SectionPanel";
import { StatusPill } from "../components/StatusPill";
import type { ProtocolManifest } from "../shared/protocols";

type LibraryScreenProps = {
  styles: any;
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
  return (
    <SectionPanel
      styles={styles}
      title="Library"
      subtitle="Pick the study you want to edit on your phone."
    >
      <View style={styles.libraryGrid}>
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
              ]}
            >
              <View style={styles.protocolCardHeader}>
                <Text style={styles.protocolTitle}>{manifest.selectionLabel}</Text>
                <StatusPill styles={styles} tone={selected ? "success" : "neutral"}>
                  {manifest.sections.length} sections
                </StatusPill>
              </View>

              <Text style={styles.protocolDescription}>{manifest.description}</Text>
              <View style={styles.cardFooterRow}>
                <Text style={styles.cardFooterText}>{manifest.title}</Text>
                <Text style={styles.cardFooterHint}>
                  {selected ? "In draft" : "Tap to add"}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </SectionPanel>
  );
}
