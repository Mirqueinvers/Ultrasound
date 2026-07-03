import { View } from "react-native";

import { MobileField } from "../components/MobileField";
import { formatDateForMobileDisplay } from "../shared/formatDate";
import type { MobileSyncSnapshot } from "../shared/mobileSync";
import type { ProtocolManifest } from "../shared/protocols";
import type { ObpDraftActions } from "../protocols/obp/useObpDraftActions";
import type { ProtocolUpdateHandlers } from "../hooks/useProtocolUpdateHandlers";
import type { AppStyles } from "../styles/appStyles";
import type { MobileStudiesDataMap } from "../protocols/types";
import type { FieldVisibility } from "../settings/fieldVisibility";
import { ProtocolDraftRenderer } from "./ProtocolDraftRenderer";

type DraftScreenProps = {
  styles: AppStyles;
  snapshot: MobileSyncSnapshot;
  studiesData: MobileStudiesDataMap;
  activeProtocolManifest: ProtocolManifest | null;
  activeSectionId: string | null;
  activeDraftMode: "patient" | "protocol";
  fieldVisibility: FieldVisibility;
  obpActions: ObpDraftActions;
  protocolUpdateHandlers: ProtocolUpdateHandlers;
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
    return digits.slice(0, 2) + "." + digits.slice(2);
  }

  return digits.slice(0, 2) + "." + digits.slice(2, 4) + "." + digits.slice(4);
}

function formatStudyDateInput(value: string): string {
  return formatBirthDateInput(value);
}

export function DraftScreen({
  styles,
  snapshot,
  studiesData,
  activeProtocolManifest,
  activeSectionId,
  activeDraftMode,
  fieldVisibility,
  obpActions,
  protocolUpdateHandlers,
  onUpdateHeaderField,
  onUpdateGeneralNote,
  onUpdateSectionNote,
}: DraftScreenProps) {
  return (
    <View style={styles.sectionPanel}>
      {activeDraftMode === "patient" ? (
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
      ) : (
        <ProtocolDraftRenderer
          activeProtocolManifest={activeProtocolManifest}
          activeSectionId={activeSectionId}
          studiesData={studiesData}
          styles={styles}
          fieldVisibility={fieldVisibility}
          obpActions={obpActions}
          protocolUpdateHandlers={protocolUpdateHandlers}
          onUpdateGeneralNote={onUpdateGeneralNote}
          onUpdateSectionNote={onUpdateSectionNote}
        />
      )}
    </View>
  );
}
