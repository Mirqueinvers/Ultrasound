import { Pressable, Text, View } from "react-native";

import { MobileField } from "../components/MobileField";
import { SectionPanel } from "../components/SectionPanel";
import { StatusPill } from "../components/StatusPill";
import { ProtocolDraftRenderer } from "./ProtocolDraftRenderer";
import { getProtocolManifestByLabel } from "../shared/protocols";
import { formatDateForMobileDisplay } from "../shared/formatDate";
import type { MobileSyncSnapshot } from "../shared/mobileSync";
import type { ProtocolManifest } from "../shared/protocols";
import type { ObpDraftActions } from "../protocols/obp/useObpDraftActions";
import type { ProtocolUpdateHandlers } from "../hooks/useProtocolUpdateHandlers";
import type { AppStyles } from "../styles/appStyles";
import type { MobileStudiesDataMap } from "../protocols/types";

type DraftScreenProps = {
  styles: AppStyles;
  snapshot: MobileSyncSnapshot;
  studiesData: MobileStudiesDataMap;
  activeProtocolManifest: ProtocolManifest | null;
  obpActions: ObpDraftActions;
  protocolUpdateHandlers: ProtocolUpdateHandlers;
  onSelectProtocol: (manifest: ProtocolManifest) => void;
  onUpdateHeaderField: (key: keyof MobileSyncSnapshot["header"], value: string) => void;
  onUpdateGeneralNote: (protocolLabel: string, value: string) => void;
  onUpdateSectionNote: (protocolLabel: string, sectionDesktopKey: string, value: string) => void;
};

function formatBirthDateInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}

function formatStudyDateInput(value: string): string {
  return formatBirthDateInput(value);
}

export function DraftScreen({
  styles,
  snapshot,
  studiesData,
  activeProtocolManifest,
  obpActions,
  protocolUpdateHandlers,
  onSelectProtocol,
  onUpdateHeaderField,
  onUpdateGeneralNote,
  onUpdateSectionNote,
}: DraftScreenProps) {
  return (
    <SectionPanel styles={styles} title="Черновик" subtitle="Редактор черновика">
      <View style={styles.formGrid}>
        <MobileField
          styles={styles}
          label="ФИО пациента"
          value={snapshot.header.patientFullName}
          onChangeText={(value) => onUpdateHeaderField("patientFullName", value)}
          placeholder="Введите ФИО пациента"
        />
        <View style={styles.dualRow}>
          <View style={styles.dualCol}>
            <MobileField
              styles={styles}
              label="Дата рождения"
              value={formatDateForMobileDisplay(snapshot.header.patientDateOfBirth)}
              onChangeText={(value) =>
                onUpdateHeaderField("patientDateOfBirth", formatBirthDateInput(value))
              }
              placeholder="01.01.1980"
            />
          </View>
          <View style={styles.dualCol}>
            <MobileField
              styles={styles}
              label="Дата исследования"
              value={formatDateForMobileDisplay(snapshot.header.researchDate)}
              onChangeText={(value) =>
                onUpdateHeaderField("researchDate", formatStudyDateInput(value))
              }
              placeholder="01.01.2026"
            />
          </View>
        </View>
        <MobileField
          styles={styles}
          label="Организация"
          value={snapshot.header.organization}
          onChangeText={(value) => onUpdateHeaderField("organization", value)}
          placeholder="Введите организацию"
          editable={false}
        />
      </View>

      <View style={styles.selectionChips}>
        {snapshot.selection.selectedStudies.length === 0 ? (
          <Text style={styles.emptyState}>Исследования пока не выбраны</Text>
        ) : (
          snapshot.selection.selectedStudies.map((label) => (
            <Pressable
              key={label}
              onPress={() => {
                const manifest = getProtocolManifestByLabel(label);
                if (manifest) {
                  onSelectProtocol(manifest);
                }
              }}
              style={styles.selectionChip}
            >
              <Text style={styles.selectionChipText}>{label}</Text>
            </Pressable>
          ))
        )}
      </View>

      {activeProtocolManifest ? (
        <View style={styles.activeProtocolHeader}>
          <View>
            <Text style={styles.blockLabel}>Активный протокол</Text>
            <Text style={styles.blockTitle}>{activeProtocolManifest.selectionLabel}</Text>
          </View>
          <StatusPill styles={styles} tone="accent">
            {activeProtocolManifest.sections.length} разделов
          </StatusPill>
        </View>
      ) : null}

      <ProtocolDraftRenderer
        activeProtocolManifest={activeProtocolManifest}
        studiesData={studiesData}
        styles={styles}
        obpActions={obpActions}
        protocolUpdateHandlers={protocolUpdateHandlers}
        onUpdateGeneralNote={onUpdateGeneralNote}
        onUpdateSectionNote={onUpdateSectionNote}
      />
    </SectionPanel>
  );
}
