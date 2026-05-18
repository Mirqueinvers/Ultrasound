import { useMemo } from "react";
import { Text, View } from "react-native";

import { MobileField } from "../components/MobileField";
import { StatusPill } from "../components/StatusPill";
import { type ProtocolManifest } from "../shared/protocols";
import {
  createEmptyObpDraft,
  type ObpDraft,
  type LiverDraft,
  type GallbladderDraft,
  type GallbladderConcretionDraft,
  type GallbladderPolypDraft,
  type PancreasDraft,
  type SpleenDraft,
} from "../shared/obpDraft";
import { createEmptyKidneyStudyDraft, type KidneyStudyDraft } from "../shared/kidneyDraft";
import { createEmptyScrotumDraft, type ScrotumDraft } from "../shared/scrotumDraft";
import { createEmptyOmtFemaleDraft, type OmtFemaleDraft } from "../shared/omtFemaleDraft";
import { createEmptyOmtMaleDraft, type OmtMaleDraft } from "../shared/omtMaleDraft";
import { createEmptyThyroidStudyDraft, type ThyroidStudyDraft } from "../shared/thyroidDraft";
import { createEmptyBreastStudyDraft, type BreastStudyDraft } from "../shared/breastDraft";
import { createEmptyLymphNodesStudyDraft, type LymphNodesStudyDraft } from "../shared/lymphNodesDraft";
import { createEmptyStudyDraft, type StudyDraft } from "../shared/syncHelpers";
import { getDesktopStudyKey } from "../sync/adapters";
import { ObpProtocolBlock } from "./obp/ObpProtocolBlock";
import { KidneysProtocolBlock } from "./kidneys/KidneysProtocolBlock";
import { ScrotumProtocolBlock } from "./scrotum/ScrotumProtocolBlock";
import { OmtMaleProtocolBlock } from "./omtMale/OmtMaleProtocolBlock";
import { OmtFemaleProtocolBlock } from "./omtFemale/OmtFemaleProtocolBlock";
import { ThyroidProtocolBlock } from "./thyroid/ThyroidProtocolBlock";
import { BreastProtocolBlock } from "./breast/BreastProtocolBlock";
import { LymphNodesProtocolBlock } from "./lymphNodes/LymphNodesProtocolBlock";

type DraftRendererStyles = any;

type ProtocolDraftRendererProps = {
  activeProtocolManifest: ProtocolManifest | null;
  studiesData: Record<string, unknown>;
  styles: DraftRendererStyles;
  onUpdateGeneralNote: (protocolLabel: string, value: string) => void;
  onUpdateSectionNote: (protocolLabel: string, sectionDesktopKey: string, value: string) => void;
  onUpdateObpLiverField: (field: keyof LiverDraft, value: string) => void;
  onUpdateObpGallbladderField: (field: keyof GallbladderDraft, value: string) => void;
  onUpdateObpGallbladderConcretionsList: (nextList: GallbladderConcretionDraft[]) => void;
  onUpdateObpGallbladderPolypsList: (nextList: GallbladderPolypDraft[]) => void;
  onAddObpGallbladderConcretion: () => void;
  onAddObpGallbladderPolyp: () => void;
  onUpdateObpPancreasField: (field: keyof PancreasDraft, value: string) => void;
  onUpdateObpSpleenField: (field: keyof SpleenDraft, value: string) => void;
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

function isOmtMaleDraft(value: unknown): value is OmtMaleDraft {
  return Boolean(
    value &&
      typeof value === "object" &&
      "prostate" in value &&
      "urinaryBladder" in value &&
      "conclusion" in value &&
      "recommendations" in value,
  );
}

function isThyroidStudyDraft(value: unknown): value is ThyroidStudyDraft {
  return Boolean(
    value &&
      typeof value === "object" &&
      "thyroid" in value &&
      "conclusion" in value &&
      "recommendations" in value,
  );
}

function isBreastStudyDraft(value: unknown): value is BreastStudyDraft {
  return Boolean(
    value &&
      typeof value === "object" &&
      "breast" in value &&
      "conclusion" in value &&
      "recommendations" in value,
  );
}

function isLymphNodesStudyDraft(value: unknown): value is LymphNodesStudyDraft {
  return Boolean(
    value &&
      typeof value === "object" &&
      "lymphNodes" in value &&
      "conclusion" in value &&
      "recommendations" in value,
  );
}

export function ProtocolDraftRenderer({
  activeProtocolManifest,
  studiesData,
  styles,
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
}: ProtocolDraftRendererProps) {
  const obpDesktopKey = getDesktopStudyKey("obp");
  const kidneysDesktopKey = getDesktopStudyKey("kidneys");
  const scrotumDesktopKey = getDesktopStudyKey("scrotum");
  const omtFemaleDesktopKey = getDesktopStudyKey("omt_female");
  const omtMaleDesktopKey = getDesktopStudyKey("omt_male");
  const thyroidDesktopKey = getDesktopStudyKey("thyroid");
  const breastDesktopKey = getDesktopStudyKey("breast");
  const lymphNodesDesktopKey = getDesktopStudyKey("lymph_nodes");
  const activeDesktopKey = activeProtocolManifest ? getDesktopStudyKey(activeProtocolManifest.id) : "";

  const currentStudyDraft = useMemo<StudyDraft>(
    () =>
      activeDesktopKey
        ? ((studiesData[activeDesktopKey] as StudyDraft | undefined) ?? createEmptyStudyDraft())
        : createEmptyStudyDraft(),
    [activeDesktopKey, studiesData],
  );

  const activeObpDraft = useMemo(
    () =>
      isObpDraft(studiesData[obpDesktopKey])
        ? (studiesData[obpDesktopKey] as ObpDraft)
        : createEmptyObpDraft(),
    [studiesData],
  );

  const activeKidneyDraft = useMemo(
    () =>
      isKidneyStudyDraft(studiesData[kidneysDesktopKey])
        ? (studiesData[kidneysDesktopKey] as KidneyStudyDraft)
        : createEmptyKidneyStudyDraft(),
    [studiesData],
  );

  const activeScrotumDraft = useMemo(
    () => (studiesData[scrotumDesktopKey] as ScrotumDraft | undefined) ?? createEmptyScrotumDraft(),
    [studiesData],
  );

  const activeOmtFemaleDraft = useMemo(
    () =>
      isOmtFemaleDraft(studiesData[omtFemaleDesktopKey])
        ? (studiesData[omtFemaleDesktopKey] as OmtFemaleDraft)
        : createEmptyOmtFemaleDraft(),
    [studiesData],
  );

  const activeOmtMaleDraft = useMemo(
    () =>
      isOmtMaleDraft(studiesData[omtMaleDesktopKey])
        ? (studiesData[omtMaleDesktopKey] as OmtMaleDraft)
        : createEmptyOmtMaleDraft(),
    [studiesData],
  );

  const activeThyroidDraft = useMemo(
    () =>
      isThyroidStudyDraft(studiesData[thyroidDesktopKey])
        ? (studiesData[thyroidDesktopKey] as ThyroidStudyDraft)
        : createEmptyThyroidStudyDraft(),
    [studiesData],
  );

  const activeBreastDraft = useMemo(
    () =>
      isBreastStudyDraft(studiesData[breastDesktopKey])
        ? (studiesData[breastDesktopKey] as BreastStudyDraft)
        : createEmptyBreastStudyDraft(),
    [studiesData],
  );

  const activeLymphNodesDraft = useMemo(
    () =>
      isLymphNodesStudyDraft(studiesData[lymphNodesDesktopKey])
        ? (studiesData[lymphNodesDesktopKey] as LymphNodesStudyDraft)
        : createEmptyLymphNodesStudyDraft(),
    [studiesData],
  );

  if (!activeProtocolManifest) {
    return (
      <View style={styles.emptyProtocolState}>
        <Text style={styles.emptyProtocolTitle}>No active protocol selected</Text>
        <Text style={styles.emptyProtocolText}>
          Pick a protocol from the library to start editing it on your phone.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.activeProtocolBlock}>
      <View style={styles.activeProtocolHeader}>
        <View>
          <Text style={styles.blockLabel}>Active protocol</Text>
          <Text style={styles.blockTitle}>{activeProtocolManifest.selectionLabel}</Text>
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
          onUpdateGallbladderConcretionsList={onUpdateObpGallbladderConcretionsList}
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
        <KidneysProtocolBlock styles={styles} value={activeKidneyDraft} onChange={onUpdateKidneyStudy} />
      ) : activeProtocolManifest.id === "scrotum" ? (
        <ScrotumProtocolBlock styles={styles} value={activeScrotumDraft} onChange={onUpdateScrotumStudy} />
      ) : activeProtocolManifest.id === "omt_female" ? (
        <OmtFemaleProtocolBlock styles={styles} value={activeOmtFemaleDraft} onChange={onUpdateOmtFemaleStudy} />
      ) : activeProtocolManifest.id === "omt_male" ? (
        <OmtMaleProtocolBlock styles={styles} value={activeOmtMaleDraft} onChange={onUpdateOmtMaleStudy} />
      ) : activeProtocolManifest.id === "thyroid" ? (
        <ThyroidProtocolBlock styles={styles} value={activeThyroidDraft} onChange={onUpdateThyroidStudy} />
      ) : activeProtocolManifest.id === "breast" ? (
        <BreastProtocolBlock styles={styles} value={activeBreastDraft} onChange={onUpdateBreastStudy} />
      ) : activeProtocolManifest.id === "lymph_nodes" ? (
        <LymphNodesProtocolBlock styles={styles} value={activeLymphNodesDraft} onChange={onUpdateLymphNodesStudy} />
      ) : (
        <>
          <MobileField
            styles={styles}
            label="General note"
            value={currentStudyDraft.general}
            onChangeText={(value) => onUpdateGeneralNote(activeProtocolManifest.selectionLabel, value)}
            placeholder="Enter a general note"
            multiline
            minHeight={96}
          />

          {activeProtocolManifest.sections.map((section) => (
            <View key={section.id} style={styles.sectionCard}>
              <View style={styles.sectionCardHeader}>
                <View>
                  <Text style={styles.sectionLabel}>{section.label}</Text>
                  <Text style={styles.sectionDesktopKey}>{section.desktopKey}</Text>
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
                  onUpdateSectionNote(activeProtocolManifest.selectionLabel, section.desktopKey, value)
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
  );
}
