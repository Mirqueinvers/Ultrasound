import { View } from "react-native";

import { FieldEditorModal } from "../../components/FieldEditorModal";
import type { AppStyles } from "../../styles/appStyles";
import type { FieldVisibility } from "../../settings/fieldVisibility";
import type {
  GallbladderConcretionDraft,
  GallbladderDraft,
  GallbladderPolypDraft,
  LiverDraft,
  ObpDraft,
  PancreasDraft,
  SpleenDraft,
} from "../../shared/obpDraft";
import { OBP_SECTION_IDS } from "./obpFieldConfigs";
import { useObpEditor } from "./useObpEditor";
import { useObpDraft } from "./useObpDraft";
import { useOrientation } from "../../hooks/useOrientation";
import { LiverSection } from "./LiverSection";
import { GallbladderSection } from "./GallbladderSection";
import { PancreasSection } from "./PancreasSection";
import { SpleenSection } from "./SpleenSection";
import { ConclusionSection } from "./ConclusionSection";

type ObpProtocolBlockProps = {
  styles: AppStyles;
  fieldVisibility: FieldVisibility;
  obpDraft: ObpDraft;
  activeSectionId?: string | null;
  onUpdateLiverField: (field: keyof LiverDraft, value: string) => void;
  onUpdateGallbladderField: (field: keyof GallbladderDraft, value: string) => void;
  onUpdateGallbladderConcretionsList: (
    nextList: GallbladderConcretionDraft[],
  ) => void;
  onUpdateGallbladderPolypsList: (nextList: GallbladderPolypDraft[]) => void;
  onAddGallbladderConcretion: () => void;
  onAddGallbladderPolyp: () => void;
  onUpdatePancreasField: (field: keyof PancreasDraft, value: string) => void;
  onUpdateSpleenField: (field: keyof SpleenDraft, value: string) => void;
  onUpdateFreeFluidField: (
    field: "freeFluid" | "freeFluidDetails",
    value: string,
  ) => void;
  onUpdateConclusionField: (value: string) => void;
  onUpdateRecommendationsField: (value: string) => void;
};

function resolveActiveObpSection(sectionId: string | null | undefined) {
  if (!sectionId) {
    return null;
  }

  switch (sectionId) {
    case OBP_SECTION_IDS.liver:
      return OBP_SECTION_IDS.liver;
    case OBP_SECTION_IDS.gallbladder:
      return OBP_SECTION_IDS.gallbladder;
    case OBP_SECTION_IDS.pancreas:
      return OBP_SECTION_IDS.pancreas;
    case OBP_SECTION_IDS.spleen:
      return OBP_SECTION_IDS.spleen;
    case OBP_SECTION_IDS.conclusion:
      return OBP_SECTION_IDS.conclusion;
    default:
      return OBP_SECTION_IDS.liver;
  }
}

export function ObpProtocolBlock({
  styles,
  fieldVisibility,
  obpDraft: incomingObpDraft,
  activeSectionId,
  onUpdateLiverField,
  onUpdateGallbladderField,
  onUpdateGallbladderConcretionsList,
  onUpdateGallbladderPolypsList,
  onAddGallbladderConcretion,
  onAddGallbladderPolyp,
  onUpdatePancreasField,
  onUpdateSpleenField,
  onUpdateFreeFluidField,
  onUpdateConclusionField,
  onUpdateRecommendationsField,
}: ObpProtocolBlockProps) {
  const { isLandscape } = useOrientation();
  const { editorState, openEditor, saveEditor, cancelEditor } = useObpEditor();

  const draftApi = useObpDraft(
    incomingObpDraft,
    onUpdateLiverField,
    onUpdateGallbladderField,
    onUpdateGallbladderConcretionsList,
    onUpdateGallbladderPolypsList,
    onAddGallbladderConcretion,
    onAddGallbladderPolyp,
    onUpdatePancreasField,
    onUpdateSpleenField,
    onUpdateFreeFluidField,
    onUpdateConclusionField,
    onUpdateRecommendationsField,
  );

  const resolvedActiveSectionId = resolveActiveObpSection(activeSectionId);
  const showAllSections = resolvedActiveSectionId === null;
  const showLiverSection = showAllSections || resolvedActiveSectionId === OBP_SECTION_IDS.liver;
  const showGallbladderSection =
    showAllSections || resolvedActiveSectionId === OBP_SECTION_IDS.gallbladder;
  const showPancreasSection = showAllSections || resolvedActiveSectionId === OBP_SECTION_IDS.pancreas;
  const showSpleenSection = showAllSections || resolvedActiveSectionId === OBP_SECTION_IDS.spleen;
  const showConclusionSection = showAllSections || resolvedActiveSectionId === OBP_SECTION_IDS.conclusion;

  const isReadOnlyField = (key: keyof LiverDraft) =>
    key === "rightLobeTotal" || key === "leftLobeTotal";

  return (
    <View style={styles.activeProtocolBlock}>
      <FieldEditorModal
        visible={Boolean(editorState)}
        title={editorState?.title ?? ""}
        mode={editorState?.mode ?? "text"}
        value={editorState?.value ?? ""}
        options={editorState?.options}
        placeholder={editorState?.placeholder}
        multiline={editorState?.multiline}
        footerContent={editorState?.footerContent}
        onCancel={cancelEditor}
        onSave={saveEditor}
      />

      {showLiverSection && (
        <LiverSection
          styles={styles}
          fieldVisibility={fieldVisibility}
          liver={draftApi.draft.liver}
          hasFocalLesions={draftApi.hasLiverFocalLesions}
          isReadOnlyField={isReadOnlyField}
          isLandscape={isLandscape}
          openEditor={openEditor}
          onUpdateField={draftApi.updateLiverFieldValue}
        />
      )}

      {showGallbladderSection && (
        <GallbladderSection
          styles={styles}
          fieldVisibility={fieldVisibility}
          gallbladder={draftApi.activeGallbladder}
          isCholecystectomy={draftApi.isCholecystectomy}
          hasConcretions={draftApi.hasGallbladderConcretions}
          hasPolyps={draftApi.hasGallbladderPolyps}
          isLandscape={isLandscape}
          openEditor={openEditor}
          onUpdateField={draftApi.updateGallbladderFieldValue}
          onUpdateConcretionItem={draftApi.updateGallbladderConcretionItem}
          onUpdatePolypItem={draftApi.updateGallbladderPolypItem}
          onDeleteConcretion={(index) =>
            draftApi.updateGallbladderConcretions(
              draftApi.activeGallbladder.concretionsList.filter((_, i) => i !== index),
            )
          }
          onDeletePolyp={(index) =>
            draftApi.updateGallbladderPolyps(
              draftApi.activeGallbladder.polypsList.filter((_, i) => i !== index),
            )
          }
          onAddConcretion={draftApi.handleAddGallbladderConcretion}
          onAddPolyp={draftApi.handleAddGallbladderPolyp}
        />
      )}

      {showPancreasSection && (
        <PancreasSection
          styles={styles}
          fieldVisibility={fieldVisibility}
          pancreas={draftApi.activePancreas}
          hasPathologicalFormations={draftApi.hasPancreasPathologicalFormations}
          isLandscape={isLandscape}
          openEditor={openEditor}
          onUpdateField={draftApi.updatePancreasFieldValue}
        />
      )}

      {showSpleenSection && (
        <SpleenSection
          styles={styles}
          fieldVisibility={fieldVisibility}
          spleen={draftApi.activeSpleen}
          hasPathologicalFormations={draftApi.hasSpleenPathologicalFormations}
          isLandscape={isLandscape}
          openEditor={openEditor}
          onUpdateField={draftApi.updateSpleenFieldValue}
        />
      )}

      {showConclusionSection && (
        <ConclusionSection
          styles={styles}
          freeFluid={draftApi.draft.freeFluid}
          freeFluidDetails={draftApi.draft.freeFluidDetails}
          conclusion={draftApi.draft.conclusion}
          recommendations={draftApi.draft.recommendations}
          openEditor={openEditor}
          onUpdateFreeFluid={draftApi.updateFreeFluidFieldValue}
          onUpdateConclusion={draftApi.updateConclusionFieldValue}
          onUpdateRecommendations={draftApi.updateRecommendationsFieldValue}
        />
      )}
    </View>
  );
}