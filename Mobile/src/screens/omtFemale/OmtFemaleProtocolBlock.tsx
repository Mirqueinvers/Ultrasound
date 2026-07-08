import { Pressable, Text, View } from "react-native";

import { FieldEditorModal } from "../../components/FieldEditorModal";
import type { OmtFemaleDraft } from "../../shared/omtFemaleDraft";
import type { AppStyles } from "../../styles/appStyles";
import type { FieldVisibility } from "../../settings/fieldVisibility";
import {
  OMT_FEMALE_CONCLUSION_SAMPLES,
  OMT_FEMALE_SECTION_IDS,
  resolveActiveOmtFemaleSection,
} from "./omtFemaleFieldConfigs";
import { useOmtFemaleDraft } from "./useOmtFemaleDraft";
import { OmtFemaleUterusPanel } from "./OmtFemaleUterusPanel";
import { OmtFemaleOvaryPanel } from "./OmtFemaleOvaryPanel";
import { OmtFemaleBladderPanel } from "./OmtFemaleBladderPanel";
import { OmtFemaleConclusionPanel } from "./OmtFemaleConclusionPanel";

type OmtFemaleProtocolBlockProps = {
  styles: AppStyles;
  fieldVisibility: FieldVisibility;
  value: OmtFemaleDraft;
  onChange: (value: OmtFemaleDraft) => void;
  activeSectionId?: string | null;
};

function ConclusionSamples({
  currentValue, setValue, close, styles,
}: {
  currentValue: string; setValue: (v: string) => void; close: () => void; styles: AppStyles;
}) {
  return (
    <View style={styles.obpSampleList}>
      {OMT_FEMALE_CONCLUSION_SAMPLES.map((sample) => (
        <Pressable key={sample.title}
          onPress={() => {
            const nextValue = currentValue ? `${currentValue}${currentValue.endsWith("\n") ? "" : "\n"}${sample.value}` : sample.value;
            setValue(nextValue);
          }}
          style={({ pressed }) => [styles.obpSampleButton, pressed && styles.obpSampleButtonPressed]}>
          <Text style={styles.obpSampleButtonTitle}>{sample.title}</Text>
          <Text style={styles.obpSampleButtonText}>{sample.value}</Text>
        </Pressable>
      ))}
      <Pressable onPress={close}
        style={({ pressed }) => [styles.secondaryButton, { alignSelf: "flex-start", paddingVertical: 10, paddingHorizontal: 14 }, pressed && styles.buttonPressed]}>
        <Text style={styles.secondaryButtonText}>Закрыть</Text>
      </Pressable>
    </View>
  );
}

export function OmtFemaleProtocolBlock({
  styles, fieldVisibility, value, onChange, activeSectionId,
}: OmtFemaleProtocolBlockProps) {
  const draftApi = useOmtFemaleDraft(value, onChange);
  const fv = fieldVisibility as Record<string, boolean>;
  const resolvedActiveSectionId = resolveActiveOmtFemaleSection(activeSectionId);
  const showAllSections = resolvedActiveSectionId === null;

  const activeOvarySides = showAllSections
    ? (["right", "left"] as const)
    : resolvedActiveSectionId === OMT_FEMALE_SECTION_IDS.leftOvary
      ? (["left"] as const)
      : (["right"] as const);

  const isConclusionEditor = draftApi.editorState?.title === "Заключение ОМТ (Ж)";

  return (
    <>
      <FieldEditorModal
        visible={Boolean(draftApi.editorState)} title={draftApi.editorState?.title ?? ""}
        mode={draftApi.editorState?.mode ?? "text"} value={draftApi.editorState?.value ?? ""}
        options={draftApi.editorState?.options} placeholder={draftApi.editorState?.placeholder}
        multiline={draftApi.editorState?.multiline}
        footerContent={isConclusionEditor ? ({ value, setValue, close }) => (
          <ConclusionSamples currentValue={value} setValue={setValue} close={close} styles={styles} />
        ) : undefined}
        onCancel={draftApi.closeEditor} onSave={draftApi.saveEditor}
      />

      <OmtFemaleUterusPanel
        styles={styles} uterus={draftApi.form.uterus} fv={fv}
        isVisible={showAllSections || resolvedActiveSectionId === OMT_FEMALE_SECTION_IDS.uterus}
        openEditor={draftApi.openEditor}
        onUpdateUterusField={draftApi.updateUterusField}
        onAddMyomaNode={draftApi.addMyomaNode}
        onUpdateMyomaNode={draftApi.updateMyomaNode}
        onRemoveMyomaNode={draftApi.removeMyomaNode}
      />

      {activeOvarySides.map((side) => {
        const ovaryData = side === "right" ? draftApi.form.rightOvary : draftApi.form.leftOvary;
        return (
          <OmtFemaleOvaryPanel
            key={side}
            styles={styles} side={side}
            ovary={ovaryData ?? { position: "", length: "", width: "", thickness: "", volume: "", shape: "", contour: "", cysts: "", cystsList: [], formations: "", formationsText: "", additional: "" }}
            openEditor={draftApi.openEditor}
            onUpdateOvaryField={draftApi.updateOvaryField}
            onAddCyst={draftApi.addOvaryCyst}
            onUpdateCyst={draftApi.updateOvaryCyst}
            onRemoveCyst={draftApi.removeOvaryCyst}
          />
        );
      })}

      <OmtFemaleBladderPanel
        styles={styles}
        bladder={draftApi.form.urinaryBladder ?? { length: "", width: "", depth: "", volume: "", wallThickness: "", residualStatus: "", residualLength: "", residualWidth: "", residualDepth: "", residualVolume: "", contents: "", contentsText: "", additional: "" }}
        isVisible={showAllSections || resolvedActiveSectionId === OMT_FEMALE_SECTION_IDS.bladder}
        openEditor={draftApi.openEditor}
        onUpdateBladderField={draftApi.updateBladderField}
      />

      {(showAllSections || resolvedActiveSectionId === OMT_FEMALE_SECTION_IDS.conclusion) &&
        fv["omt_female.conclusion"] !== false && (
          <OmtFemaleConclusionPanel
            styles={styles}
            conclusion={draftApi.form.conclusion} recommendations={draftApi.form.recommendations}
            openEditor={draftApi.openEditor} onUpdateForm={draftApi.updateForm}
          />
        )}
    </>
  );
}

export default OmtFemaleProtocolBlock;
