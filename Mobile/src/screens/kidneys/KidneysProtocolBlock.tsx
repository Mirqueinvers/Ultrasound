import { View } from "react-native";

import { FieldEditorModal } from "../../components/FieldEditorModal";
import { ConclusionSamples } from "../../components/ConclusionSamples";
import type { AppStyles } from "../../styles/appStyles";
import type { FieldVisibility } from "../../settings/fieldVisibility";
import type { KidneyStudyDraft } from "../../shared/kidneyDraft";
import {
  KIDNEY_CONCLUSION_SAMPLES,
  KIDNEY_SECTION_IDS,
  resolveActiveKidneySection,
} from "./kidneysFieldConfigs";
import { useKidneysDraft } from "./useKidneysDraft";
import { KidneySidePanel } from "./KidneySidePanel";
import { UrinaryBladderPanel } from "./UrinaryBladderPanel";
import { KidneysConclusionPanel } from "./KidneysConclusionPanel";

type KidneysProtocolBlockProps = {
  styles: AppStyles;
  fieldVisibility: FieldVisibility;
  value: KidneyStudyDraft;
  onChange: (value: KidneyStudyDraft) => void;
  activeSectionId?: string | null;
};

export function KidneysProtocolBlock({
  styles,
  fieldVisibility,
  value,
  onChange,
  activeSectionId,
}: KidneysProtocolBlockProps) {
  const draftApi = useKidneysDraft(value, onChange);
  const resolvedActiveSectionId = resolveActiveKidneySection(activeSectionId);
  const fv = fieldVisibility as Record<string, boolean>;

  return (
    <View style={styles.activeProtocolBlock}>
      <FieldEditorModal
        visible={Boolean(draftApi.editorState)}
        title={draftApi.editorState?.title ?? ""}
        mode={draftApi.editorState?.mode ?? "text"}
        value={draftApi.editorState?.value ?? ""}
        options={draftApi.editorState?.options}
        placeholder={draftApi.editorState?.placeholder}
        multiline={draftApi.editorState?.multiline}
        footerContent={
          draftApi.editorState?.title === "Заключение почек"
            ? ({ value, setValue, close }) => (
                <ConclusionSamples
                  currentValue={value}
                  setValue={setValue}
                  close={close}
                  styles={styles}
                  samples={KIDNEY_CONCLUSION_SAMPLES}
                />
              )
            : undefined
        }
        onCancel={draftApi.closeEditor}
        onSave={draftApi.saveEditor}
      />

      <KidneySidePanel
        styles={styles}
        fieldVisibility={fieldVisibility}
        title="Правая почка"
        side="rightKidney"
        kidney={draftApi.form.rightKidney}
        resolvedActiveSectionId={resolvedActiveSectionId}
        fv={fv}
        openEditor={draftApi.openEditor}
        onUpdateKidneyField={draftApi.updateKidneyField}
        onUpdateKidneyListItem={draftApi.updateKidneyListItem}
        onUpdateKidneyCystSize={draftApi.updateKidneyCystSize}
        onAddKidneyListItem={draftApi.addKidneyListItem}
        onRemoveKidneyListItem={draftApi.removeKidneyListItem}
        onToggleMultipleCysts={draftApi.toggleMultipleCysts}
        onUpdateStudy={draftApi.updateStudy}
      />

      <KidneySidePanel
        styles={styles}
        fieldVisibility={fieldVisibility}
        title="Левая почка"
        side="leftKidney"
        kidney={draftApi.form.leftKidney}
        resolvedActiveSectionId={resolvedActiveSectionId}
        fv={fv}
        openEditor={draftApi.openEditor}
        onUpdateKidneyField={draftApi.updateKidneyField}
        onUpdateKidneyListItem={draftApi.updateKidneyListItem}
        onUpdateKidneyCystSize={draftApi.updateKidneyCystSize}
        onAddKidneyListItem={draftApi.addKidneyListItem}
        onRemoveKidneyListItem={draftApi.removeKidneyListItem}
        onToggleMultipleCysts={draftApi.toggleMultipleCysts}
        onUpdateStudy={draftApi.updateStudy}
      />

      <UrinaryBladderPanel
        styles={styles}
        fieldVisibility={fieldVisibility}
        bladder={draftApi.form.urinaryBladder}
        resolvedActiveSectionId={resolvedActiveSectionId}
        fv={fv}
        openEditor={draftApi.openEditor}
        onUpdateBladderField={draftApi.updateBladderField}
        onUpdateStudy={draftApi.updateStudy}
      />

      {(!resolvedActiveSectionId || resolvedActiveSectionId === KIDNEY_SECTION_IDS.conclusion) && (
        <KidneysConclusionPanel
          styles={styles}
          conclusion={draftApi.form.conclusion}
          recommendations={draftApi.form.recommendations}
          openEditor={draftApi.openEditor}
          onUpdateStudy={draftApi.updateStudy}
        />
      )}
    </View>
  );
}

export default KidneysProtocolBlock;
