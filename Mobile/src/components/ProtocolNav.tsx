import { memo } from "react";
import { Pressable, Text, View } from "react-native";

import { getProtocolManifestByLabel } from "../shared/protocols";
import type { ProtocolManifest } from "../shared/protocols";
import type { AppStyles } from "../styles/appStyles";

type ProtocolNavProps = {
  styles: AppStyles;
  selectedStudies: string[];
  activeProtocolManifest: ProtocolManifest | null;
  activeSectionId: string | null;
  onSelectProtocol: (manifest: ProtocolManifest) => void;
  onSelectSection: (sectionId: string) => void;
};

function ProtocolNavComponent({
  styles,
  selectedStudies,
  activeProtocolManifest,
  activeSectionId,
  onSelectProtocol,
  onSelectSection,
}: ProtocolNavProps) {
  const selectedManifests = selectedStudies
    .map((label) => getProtocolManifestByLabel(label))
    .filter((manifest): manifest is ProtocolManifest => Boolean(manifest));

  if (selectedManifests.length === 0) {
    return (
      <View style={styles.protocolNav}>
        <Text style={styles.protocolNavEmptyText}>Протоколы не выбраны</Text>
      </View>
    );
  }

  return (
    <View style={styles.protocolNav}>
      <View style={styles.protocolNavGroup}>
        <Text style={styles.protocolNavGroupTitle}>Протоколы</Text>
        <View style={styles.protocolNavChipWrap}>
          {selectedManifests.map((manifest) => {
            const active = activeProtocolManifest?.id === manifest.id;

            return (
              <Pressable
                key={manifest.id}
                onPress={() => onSelectProtocol(manifest)}
                style={({ pressed }) => [
                  styles.protocolNavChip,
                  active && styles.protocolNavChipActive,
                  pressed && styles.protocolNavChipPressed,
                ]}
              >
                <Text style={[styles.protocolNavChipText, active && styles.protocolNavChipTextActive]}>
                  {manifest.selectionLabel}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {activeProtocolManifest ? (
        <View style={styles.protocolNavGroup}>
          <Text style={styles.protocolNavGroupTitle}>Разделы</Text>
          <View style={styles.protocolNavChipWrap}>
            {activeProtocolManifest.sections.map((section) => (
              <Pressable
                key={section.id}
                onPress={() => onSelectSection(section.id)}
                style={({ pressed }) => [
                  styles.protocolNavChip,
                  activeSectionId === section.id && styles.protocolNavChipActive,
                  pressed && styles.protocolNavChipPressed,
                ]}
              >
                <Text
                  style={[
                    styles.protocolNavChipText,
                    activeSectionId === section.id && styles.protocolNavChipTextActive,
                  ]}
                >
                  {section.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

export const ProtocolNav = memo(ProtocolNavComponent);
