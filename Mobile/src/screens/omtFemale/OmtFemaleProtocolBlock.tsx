import { useCallback, useMemo, useRef } from "react";
import type { LayoutChangeEvent } from "react-native";
import { View } from "react-native";

import { InlineNumpad } from "../../components/InlineNumpad";
import { FieldEditorModal } from "../../components/FieldEditorModal";
import { ConclusionSamples } from "../../components/ConclusionSamples";
import type { OmtFemaleDraft } from "../../shared/omtFemaleDraft";
import type { AppStyles } from "../../styles/appStyles";
import type { FieldVisibility } from "../../settings/fieldVisibility";
import { useInlineNumpad } from "../obp/useInlineNumpad";
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
  isLandscape?: boolean;
};

export function OmtFemaleProtocolBlock({
  styles, fieldVisibility, value, onChange, activeSectionId, isLandscape,
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

  // ---- Landscape: numpad ----
  const landscapeRef = useRef<View>(null);
  const fieldRefs = useRef<Record<string, View | null>>({});
  const numpad = useInlineNumpad(landscapeRef);
  const nestedNumpadValue = useRef<string>("");
  const nestedNumpadOnChange = useRef<((value: string) => void) | null>(null);

  const numpadApi = useMemo(
    () => ({
      isLandscape: isLandscape ?? false,
      fieldRefs,
      openNumpad: (fieldKey: string, fieldView: View | null, initialValue?: string, onChange?: (value: string) => void) => {
        nestedNumpadValue.current = initialValue ?? "";
        nestedNumpadOnChange.current = onChange ?? null;
        numpad.openNumpad(fieldKey, fieldView);
      },
      handleFieldLayout: (fieldKey: string, event: LayoutChangeEvent) => {
        numpad.handleFieldLayout(fieldKey, event);
      },
    }),
    [isLandscape, numpad],
  );

  // ---- Render InlineNumpad in landscape ----
  const renderInlineNumpad = useCallback(() => {
    if (!isLandscape || numpad.activeNumpadField == null || !numpad.numpadPosition) {
      return null;
    }
    return (
      <View
        style={{
          position: "absolute",
          top: numpad.numpadPosition.top,
          left: numpad.numpadPosition.left,
          width: numpad.numpadPosition.width,
          zIndex: 100,
        }}
      >
        <InlineNumpad
          value={nestedNumpadValue.current}
          onValueChange={(nextValue) => {
            if (nestedNumpadOnChange.current) {
              nestedNumpadOnChange.current(nextValue);
            }
          }}
          onClose={numpad.closeNumpad}
        />
      </View>
    );
  }, [isLandscape, numpad]);

  return (
    <View ref={landscapeRef} style={isLandscape ? { position: "relative", gap: 8 } : undefined}>
      <FieldEditorModal
        visible={Boolean(draftApi.editorState)} title={draftApi.editorState?.title ?? ""}
        mode={draftApi.editorState?.mode ?? "text"} value={draftApi.editorState?.value ?? ""}
        options={draftApi.editorState?.options} placeholder={draftApi.editorState?.placeholder}
        multiline={draftApi.editorState?.multiline}
        footerContent={isConclusionEditor ? ({ value: editorValue, setValue, close }) => (
          <ConclusionSamples currentValue={editorValue} setValue={setValue} close={close} styles={styles} samples={OMT_FEMALE_CONCLUSION_SAMPLES} />
        ) : undefined}
        onCancel={draftApi.closeEditor} onSave={draftApi.saveEditor}
      />

      <OmtFemaleUterusPanel
        styles={styles} uterus={draftApi.form.uterus} fv={fv}
        isVisible={showAllSections || resolvedActiveSectionId === OMT_FEMALE_SECTION_IDS.uterus}
        isLandscape={isLandscape}
        openEditor={draftApi.openEditor}
        onUpdateUterusField={draftApi.updateUterusField}
        onAddMyomaNode={draftApi.addMyomaNode}
        onUpdateMyomaNode={draftApi.updateMyomaNode}
        onRemoveMyomaNode={draftApi.removeMyomaNode}
        numpadApi={numpadApi}
      />

      {activeOvarySides.map((side) => {
        const ovaryData = side === "right" ? draftApi.form.rightOvary : draftApi.form.leftOvary;
        const sectionId = side === "right" ? OMT_FEMALE_SECTION_IDS.rightOvary : OMT_FEMALE_SECTION_IDS.leftOvary;
        return (
          <OmtFemaleOvaryPanel
            key={side}
            styles={styles} side={side}
            ovary={ovaryData ?? { position: "", length: "", width: "", thickness: "", volume: "", shape: "", contour: "", cysts: "", cystsList: [], formations: "", formationsText: "", additional: "" }}
            fv={fv}
            isVisible={showAllSections || resolvedActiveSectionId === sectionId}
            isLandscape={isLandscape}
            openEditor={draftApi.openEditor}
            onUpdateOvaryField={draftApi.updateOvaryField}
            onAddCyst={draftApi.addOvaryCyst}
            onUpdateCyst={draftApi.updateOvaryCyst}
            onRemoveCyst={draftApi.removeOvaryCyst}
            numpadApi={numpadApi}
          />
        );
      })}

      <OmtFemaleBladderPanel
        styles={styles}
        bladder={draftApi.form.urinaryBladder ?? { length: "", width: "", depth: "", volume: "", wallThickness: "", residualStatus: "", residualLength: "", residualWidth: "", residualDepth: "", residualVolume: "", contents: "", contentsText: "", additional: "" }}
        fv={fv}
        isVisible={showAllSections || resolvedActiveSectionId === OMT_FEMALE_SECTION_IDS.bladder}
        isLandscape={isLandscape}
        openEditor={draftApi.openEditor}
        onUpdateBladderField={draftApi.updateBladderField}
        numpadApi={numpadApi}
      />

      {(showAllSections || resolvedActiveSectionId === OMT_FEMALE_SECTION_IDS.conclusion) &&
        fv["omt_female.conclusion"] !== false && (
          <OmtFemaleConclusionPanel
            styles={styles}
            conclusion={draftApi.form.conclusion} recommendations={draftApi.form.recommendations}
            isLandscape={isLandscape}
            openEditor={draftApi.openEditor} onUpdateForm={draftApi.updateForm}
          />
        )}

      {renderInlineNumpad()}
    </View>
  );
}

export default OmtFemaleProtocolBlock;