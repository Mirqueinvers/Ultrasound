import { View } from "react-native";

import { FieldEditorModal } from "../../components/FieldEditorModal";
import { ConclusionSamples } from "../../components/ConclusionSamples";
import type { OmtMaleDraft } from "../../shared/omtMaleDraft";
import type { AppStyles } from "../../styles/appStyles";
import type { FieldVisibility } from "../../settings/fieldVisibility";
import {
  OMT_MALE_CONCLUSION_SAMPLES,
  OMT_MALE_SECTION_IDS,
  resolveActiveOmtMaleSection,
} from "./omtMaleFieldConfigs";
import { useOmtMaleDraft } from "./useOmtMaleDraft";
import { OmtMaleProstatePanel } from "./OmtMaleProstatePanel";
import { OmtMaleBladderPanel } from "./OmtMaleBladderPanel";
import { OmtMaleConclusionPanel } from "./OmtMaleConclusionPanel";

type OmtMaleProtocolBlockProps = {
  styles: AppStyles;
  fieldVisibility: FieldVisibility;
  value: OmtMaleDraft;
  activeSectionId?: string | null;
  onChange: (value: OmtMaleDraft) => void;
};

export function OmtMaleProtocolBlock({
  styles, fieldVisibility, value, onChange, activeSectionId,
}: OmtMaleProtocolBlockProps) {
  const draftApi = useOmtMaleDraft(value, onChange);
  const fv = fieldVisibility as Record<string, boolean>;
  const resolvedActiveSectionId = resolveActiveOmtMaleSection(activeSectionId);
  const showAllSections = resolvedActiveSectionId === null;

  const isConclusionEditor = draftApi.editorState?.title === "Заключение ОМТ (М)";

  return (
    <>
      <FieldEditorModal
        visible={Boolean(draftApi.editorState)}
        title={draftApi.editorState?.title ?? ""} mode={draftApi.editorState?.mode ?? "text"}
        value={draftApi.editorState?.value ?? ""} options={draftApi.editorState?.options}
        placeholder={draftApi.editorState?.placeholder} multiline={draftApi.editorState?.multiline}
        footerContent={isConclusionEditor ? ({ value, setValue, close }) => (
          <ConclusionSamples currentValue={value} setValue={setValue} close={close} styles={styles} samples={OMT_MALE_CONCLUSION_SAMPLES} />
        ) : undefined}
        onCancel={draftApi.closeEditor} onSave={draftApi.saveEditor}
      />

      <OmtMaleProstatePanel
        styles={styles} prostate={draftApi.form.prostate} fv={fv}
        isVisible={showAllSections || resolvedActiveSectionId === OMT_MALE_SECTION_IDS.prostate}
        openEditor={draftApi.openEditor}
        onUpdateProstateField={draftApi.updateProstateField}
      />

      <OmtMaleBladderPanel
        styles={styles} bladder={draftApi.form.urinaryBladder}
        fv={fv}
        isVisible={showAllSections || resolvedActiveSectionId === OMT_MALE_SECTION_IDS.bladder}
        openEditor={draftApi.openEditor}
        onUpdateBladderField={draftApi.updateBladderField}
      />

      {(showAllSections || resolvedActiveSectionId === OMT_MALE_SECTION_IDS.conclusion) &&
        fv["omt_male.conclusion"] !== false && (
        <OmtMaleConclusionPanel
          styles={styles}
          conclusion={draftApi.form.conclusion} recommendations={draftApi.form.recommendations}
          openEditor={draftApi.openEditor} onUpdateForm={draftApi.updateForm}
        />
      )}
    </>
  );
}

export default OmtMaleProtocolBlock;
