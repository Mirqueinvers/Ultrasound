import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import { MobileField } from "../components/MobileField";
import { SectionPanel } from "../components/SectionPanel";
import { StatusPill } from "../components/StatusPill";
import { ProtocolDraftRenderer } from "./ProtocolDraftRenderer";
import { getProtocolManifestByLabel } from "../shared/protocols";
import { formatDateForMobileDisplay } from "../shared/formatDate";
import type { MobileSyncSnapshot } from "../shared/mobileSync";
import type { ProtocolManifest } from "../shared/protocols";
import type { ObpDraft } from "../shared/obpDraft";
import type { KidneyStudyDraft } from "../shared/kidneyDraft";
import type { ScrotumDraft } from "../shared/scrotumDraft";
import type { OmtFemaleDraft } from "../shared/omtFemaleDraft";
import type { OmtMaleDraft } from "../shared/omtMaleDraft";
import type { ThyroidStudyDraft } from "../shared/thyroidDraft";
import type { BreastStudyDraft } from "../shared/breastDraft";
import type { LymphNodesStudyDraft } from "../shared/lymphNodesDraft";
import type { StudyDraft } from "../shared/syncHelpers";
import { getDesktopStudyKey } from "../sync/adapters";

type DraftScreenProps = {
  styles: any;
  snapshot: MobileSyncSnapshot;
  studiesData: Record<
    string,
    | StudyDraft
    | ObpDraft
    | KidneyStudyDraft
    | ScrotumDraft
    | OmtFemaleDraft
    | OmtMaleDraft
    | ThyroidStudyDraft
    | BreastStudyDraft
    | LymphNodesStudyDraft
  >;
  activeProtocolManifest: ProtocolManifest | null;
  onSelectProtocol: (manifest: ProtocolManifest) => void;
  onUpdateHeaderField: (key: keyof MobileSyncSnapshot["header"], value: string) => void;
  onUpdateGeneralNote: (protocolLabel: string, value: string) => void;
  onUpdateSectionNote: (protocolLabel: string, sectionDesktopKey: string, value: string) => void;
  onUpdateObpLiverField: (field: keyof import("../shared/obpDraft").LiverDraft, value: string) => void;
  onUpdateObpGallbladderField: (
    field: keyof import("../shared/obpDraft").GallbladderDraft,
    value: string,
  ) => void;
  onUpdateObpGallbladderConcretionsList: (
    nextList: import("../shared/obpDraft").GallbladderConcretionDraft[],
  ) => void;
  onUpdateObpGallbladderPolypsList: (
    nextList: import("../shared/obpDraft").GallbladderPolypDraft[],
  ) => void;
  onAddObpGallbladderConcretion: () => void;
  onAddObpGallbladderPolyp: () => void;
  onUpdateObpPancreasField: (
    field: keyof import("../shared/obpDraft").PancreasDraft,
    value: string,
  ) => void;
  onUpdateObpSpleenField: (
    field: keyof import("../shared/obpDraft").SpleenDraft,
    value: string,
  ) => void;
  onUpdateObpFreeFluidField: (field: "freeFluid" | "freeFluidDetails", value: string) => void;
  onUpdateObpConclusionField: (value: string) => void;
  onUpdateObpRecommendationsField: (value: string) => void;
  onUpdateKidneyStudy: (value: KidneyStudyDraft) => void;
  onUpdateScrotumStudy: (value: ScrotumDraft) => void;
  onUpdateOmtFemaleStudy: (value: OmtFemaleDraft) => void;
  onUpdateOmtMaleStudy: (value: OmtMaleDraft) => void;
  onUpdateThyroidStudy: (value: ThyroidStudyDraft) => void;
  onUpdateBreastStudy: (value: BreastStudyDraft) => void;
  onUpdateLymphNodesStudy: (value: LymphNodesStudyDraft) => void;
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
  onSelectProtocol,
  onUpdateHeaderField,
  onUpdateGeneralNote,
  onUpdateSectionNote,
  onUpdateObpLiverField,
  onUpdateObpGallbladderField,
  onUpdateObpGallbladderConcretionsList,
  onUpdateObpGallbladderPolypsList,
  onAddObpGallbladderConcretion,
  onAddObpGallbladderPolyp,
  onUpdateObpPancreasField,
  onUpdateObpSpleenField,
  onUpdateObpFreeFluidField,
  onUpdateObpConclusionField,
  onUpdateObpRecommendationsField,
  onUpdateKidneyStudy,
  onUpdateScrotumStudy,
  onUpdateOmtFemaleStudy,
  onUpdateOmtMaleStudy,
  onUpdateThyroidStudy,
  onUpdateBreastStudy,
  onUpdateLymphNodesStudy,
}: DraftScreenProps) {
  const activeProtocolLabel = activeProtocolManifest ? getDesktopStudyKey(activeProtocolManifest.id) : "";
  const currentStudyDraft = useMemo<StudyDraft>(
    () =>
      (studiesData[activeProtocolLabel] as StudyDraft | undefined) ?? {
        general: "",
        sections: {},
      },
    [activeProtocolLabel, studiesData],
  );

  return (
    <SectionPanel styles={styles} title="Draft Editor" subtitle="Draft Editor">
      <View style={styles.formGrid}>
        <MobileField
          styles={styles}
          label="Patient full name"
          value={snapshot.header.patientFullName}
          onChangeText={(value) => onUpdateHeaderField("patientFullName", value)}
          placeholder="Enter patient full name"
        />
        <View style={styles.dualRow}>
          <View style={styles.dualCol}>
            <MobileField
              styles={styles}
              label="Date of birth"
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
              label="Study date"
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
          label="Organization"
          value={snapshot.header.organization}
          onChangeText={(value) => onUpdateHeaderField("organization", value)}
          placeholder="Enter organization"
          editable={false}
        />
      </View>

      <View style={styles.selectionChips}>
        {snapshot.selection.selectedStudies.length === 0 ? (
          <Text style={styles.emptyState}>No studies selected yet.</Text>
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
            <Text style={styles.blockLabel}>Active protocol</Text>
            <Text style={styles.blockTitle}>{activeProtocolManifest.selectionLabel}</Text>
          </View>
          <StatusPill styles={styles} tone="accent">
            {activeProtocolManifest.sections.length} sections
          </StatusPill>
        </View>
      ) : null}

      <ProtocolDraftRenderer
        activeProtocolManifest={activeProtocolManifest}
        studiesData={studiesData}
        styles={styles}
        onUpdateGeneralNote={onUpdateGeneralNote}
        onUpdateSectionNote={onUpdateSectionNote}
        onUpdateObpLiverField={onUpdateObpLiverField}
        onUpdateObpGallbladderField={onUpdateObpGallbladderField}
        onUpdateObpGallbladderConcretionsList={onUpdateObpGallbladderConcretionsList}
        onUpdateObpGallbladderPolypsList={onUpdateObpGallbladderPolypsList}
        onAddObpGallbladderConcretion={onAddObpGallbladderConcretion}
        onAddObpGallbladderPolyp={onAddObpGallbladderPolyp}
        onUpdateObpPancreasField={onUpdateObpPancreasField}
        onUpdateObpSpleenField={onUpdateObpSpleenField}
        onUpdateObpFreeFluidField={onUpdateObpFreeFluidField}
        onUpdateObpConclusionField={onUpdateObpConclusionField}
        onUpdateObpRecommendationsField={onUpdateObpRecommendationsField}
        onUpdateKidneyStudy={onUpdateKidneyStudy}
        onUpdateScrotumStudy={onUpdateScrotumStudy}
        onUpdateOmtFemaleStudy={onUpdateOmtFemaleStudy}
        onUpdateOmtMaleStudy={onUpdateOmtMaleStudy}
        onUpdateThyroidStudy={onUpdateThyroidStudy}
        onUpdateBreastStudy={onUpdateBreastStudy}
        onUpdateLymphNodesStudy={onUpdateLymphNodesStudy}
      />
    </SectionPanel>
  );
}
