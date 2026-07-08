import { memo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { getProtocolManifestByLabel } from "../shared/protocols";
import type { ProtocolManifest } from "../shared/protocols";
import type { AppStyles } from "../styles/appStyles";

type ProtocolNavProps = {
  styles: AppStyles;
  selectedStudies: string[];
  activeProtocolManifest: ProtocolManifest | null;
  activeSectionId: string | null;
  activeDraftMode: "patient" | "protocol";
  setActiveDraftMode: (mode: "patient" | "protocol") => void;
  onSelectProtocol: (manifest: ProtocolManifest) => void;
  onSelectSection: (sectionId: string) => void;
  visibility?: Record<string, boolean>;
};

function ProtocolNavComponent({
  styles,
  selectedStudies,
  activeProtocolManifest,
  activeSectionId,
  activeDraftMode,
  setActiveDraftMode,
  onSelectProtocol,
  onSelectSection,
  visibility = {},
}: ProtocolNavProps) {
  const selectedManifests = selectedStudies
    .map((label) => getProtocolManifestByLabel(label))
    .filter((manifest): manifest is ProtocolManifest => Boolean(manifest));

  const showPatientTab = visibility["_general.showPatientTab"] !== false;

  return (
    <View style={styles.protocolNav}>
      <View style={styles.protocolNavGroup}>
        <Text style={styles.protocolNavGroupTitle}>Протоколы</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces={false}
          alwaysBounceHorizontal={false}
          contentContainerStyle={styles.protocolNavChipRow}
        >
          {showPatientTab && (
            <Pressable
              onPress={() => setActiveDraftMode("patient")}
              style={({ pressed }) => [
                styles.protocolNavChip,
                activeDraftMode === "patient" && styles.protocolNavChipActive,
                pressed && styles.protocolNavChipPressed,
              ]}
            >
              <Text
                style={[
                  styles.protocolNavChipText,
                  activeDraftMode === "patient" && styles.protocolNavChipTextActive,
                ]}
              >
                Пациент
              </Text>
            </Pressable>
          )}

          {selectedManifests.map((manifest) => {
            const active = activeDraftMode === "protocol" && activeProtocolManifest?.id === manifest.id;

            return (
              <Pressable
                key={manifest.id}
                onPress={() => {
                  setActiveDraftMode("protocol");
                  onSelectProtocol(manifest);
                }}
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
        </ScrollView>
      </View>

      {activeDraftMode === "protocol" && activeProtocolManifest ? (
        <View style={styles.protocolNavGroup}>
          <Text style={styles.protocolNavGroupTitle}>Разделы</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            bounces={false}
            alwaysBounceHorizontal={false}
            contentContainerStyle={styles.protocolNavChipRow}
          >
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
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

export const ProtocolNav = memo(ProtocolNavComponent);