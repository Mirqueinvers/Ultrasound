import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { MobileField } from "../components/MobileField";
import { SectionPanel } from "../components/SectionPanel";
import { StatusPill } from "../components/StatusPill";
import { ObpProtocolBlock } from "./obp/ObpProtocolBlock";
import { KidneysProtocolBlock } from "./kidneys/KidneysProtocolBlock";
import { OmtFemaleProtocolBlock } from "./omtFemale/OmtFemaleProtocolBlock";
import { getProtocolManifestByLabel } from "../shared/protocols";
import {
  createEmptyObpDraft,
  type ObpDraft,
} from "../shared/obpDraft";
import {
  createEmptyKidneyStudyDraft,
  type KidneyStudyDraft,
} from "../shared/kidneyDraft";
import {
  createEmptyOmtFemaleDraft,
  type OmtFemaleDraft,
} from "../shared/omtFemaleDraft";
import { formatDateForMobileDisplay } from "../shared/formatDate";
import type { MobileSyncSnapshot } from "../shared/mobileSync";
import type { ProtocolManifest } from "../shared/protocols";
import { createEmptyStudyDraft, type StudyDraft } from "../shared/syncHelpers";

type DraftScreenProps = {
  styles: any;
  snapshot: MobileSyncSnapshot;
  studiesData: Record<string, StudyDraft | ObpDraft | KidneyStudyDraft | OmtFemaleDraft>;
  activeProtocolManifest: ProtocolManifest | null;
  onSelectProtocol: (manifest: ProtocolManifest) => void;
  onUpdateHeaderField: (
    key: keyof MobileSyncSnapshot["header"],
    value: string,
  ) => void;
  onUpdateGeneralNote: (protocolLabel: string, value: string) => void;
  onUpdateSectionNote: (
    protocolLabel: string,
    sectionDesktopKey: string,
    value: string,
  ) => void;
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
  onUpdateObpFreeFluidField: (
    field: "freeFluid" | "freeFluidDetails",
    value: string,
  ) => void;
  onUpdateObpConclusionField: (value: string) => void;
  onUpdateObpRecommendationsField: (value: string) => void;
  onUpdateKidneyStudy: (value: KidneyStudyDraft) => void;
  onUpdateOmtFemaleStudy: (value: OmtFemaleDraft) => void;
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

function isObpDraft(value: unknown): value is ObpDraft {
  return Boolean(value && typeof value === "object" && "liver" in value && "gallbladder" in value);
}

function isKidneyStudyDraft(value: unknown): value is KidneyStudyDraft {
  return Boolean(
    value &&
      typeof value === "object" &&
      "rightKidney" in value &&
      "leftKidney" in value &&
      "urinaryBladder" in value,
  );
}

function isOmtFemaleDraft(value: unknown): value is OmtFemaleDraft {
  return Boolean(
    value &&
      typeof value === "object" &&
      "uterus" in value &&
      "leftOvary" in value &&
      "rightOvary" in value &&
      "urinaryBladder" in value,
  );
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
  onUpdateOmtFemaleStudy,
}: DraftScreenProps) {
  const activeProtocolLabel = activeProtocolManifest?.selectionLabel ?? "";
  const currentStudyDraft = useMemo<StudyDraft>(
    () =>
      (studiesData[activeProtocolLabel] as StudyDraft | undefined) ?? createEmptyStudyDraft(),
    [activeProtocolLabel, studiesData],
  );

  const activeObpDraft = useMemo(
    () => (isObpDraft(studiesData["РћР‘Рџ"]) ? studiesData["РћР‘Рџ"] : createEmptyObpDraft()),
    [studiesData],
  );

  const activeKidneyDraft = useMemo(
    () =>
      isKidneyStudyDraft(studiesData["РџРѕС‡РєРё"])
        ? studiesData["РџРѕС‡РєРё"]
        : createEmptyKidneyStudyDraft(),
    [studiesData],
  );

  const activeOmtFemaleDraft = useMemo(
    () => (isOmtFemaleDraft(studiesData["ОМТ (Ж)"]) ? studiesData["ОМТ (Ж)"] : createEmptyOmtFemaleDraft()),
    [studiesData],
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
        <View style={styles.activeProtocolBlock}>
          <View style={styles.activeProtocolHeader}>
            <View>
              <Text style={styles.blockLabel}>Active protocol</Text>
              <Text style={styles.blockTitle}>
                {activeProtocolManifest.selectionLabel}
              </Text>
            </View>
            <StatusPill styles={styles} tone="accent">
              {activeProtocolManifest.sections.length} sections
            </StatusPill>
          </View>

          {activeProtocolManifest.id === "obp" ? (
            <ObpProtocolBlock
              styles={styles}
              obpDraft={activeObpDraft}
              onUpdateLiverField={onUpdateObpLiverField}
              onUpdateGallbladderField={onUpdateObpGallbladderField}
              onUpdateGallbladderConcretionsList={
                onUpdateObpGallbladderConcretionsList
              }
              onUpdateGallbladderPolypsList={onUpdateObpGallbladderPolypsList}
              onAddGallbladderConcretion={onAddObpGallbladderConcretion}
              onAddGallbladderPolyp={onAddObpGallbladderPolyp}
              onUpdatePancreasField={onUpdateObpPancreasField}
              onUpdateSpleenField={onUpdateObpSpleenField}
              onUpdateFreeFluidField={onUpdateObpFreeFluidField}
              onUpdateConclusionField={onUpdateObpConclusionField}
              onUpdateRecommendationsField={onUpdateObpRecommendationsField}
            />
          ) : activeProtocolManifest.id === "kidneys" ? (
            <KidneysProtocolBlock
              styles={styles}
              value={activeKidneyDraft}
              onChange={onUpdateKidneyStudy}
            />
          ) : activeProtocolManifest.id === "omt_female" ? (
            <OmtFemaleProtocolBlock
              styles={styles}
              value={activeOmtFemaleDraft}
              onChange={onUpdateOmtFemaleStudy}
            />
          ) : (
            <>
              <MobileField
                styles={styles}
                label="General note"
                value={currentStudyDraft.general}
                onChangeText={(value) =>
                  onUpdateGeneralNote(activeProtocolManifest.selectionLabel, value)
                }
                placeholder="Enter a general note"
                multiline
                minHeight={96}
              />

              {activeProtocolManifest.sections.map((section) => (
                <View key={section.id} style={styles.sectionCard}>
                  <View style={styles.sectionCardHeader}>
                    <View>
                      <Text style={styles.sectionLabel}>{section.label}</Text>
                      <Text style={styles.sectionDesktopKey}>
                        {section.desktopKey}
                      </Text>
                    </View>
                    <StatusPill styles={styles} tone="neutral">
                      section
                    </StatusPill>
                  </View>

                  <MobileField
                    styles={styles}
                    label="Section note"
                    value={currentStudyDraft.sections?.[section.desktopKey] ?? ""}
                    onChangeText={(value) =>
                      onUpdateSectionNote(
                        activeProtocolManifest.selectionLabel,
                        section.desktopKey,
                        value,
                      )
                    }
                    placeholder={`Enter ${section.label.toLowerCase()} note`}
                    multiline
                    minHeight={110}
                  />
                </View>
              ))}
            </>
          )}
        </View>
      ) : (
        <View style={styles.emptyProtocolState}>
          <Text style={styles.emptyProtocolTitle}>No active protocol selected</Text>
          <Text style={styles.emptyProtocolText}>
            Pick a protocol from the library to start editing it on your phone.
          </Text>
        </View>
      )}
    </SectionPanel>
  );
}


