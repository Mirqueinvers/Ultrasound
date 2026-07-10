import { useCallback, useRef } from "react";
import type { LayoutChangeEvent } from "react-native";
import { View } from "react-native";

import { InlineNumpad } from "../../components/InlineNumpad";
import { FieldEditorModal } from "../../components/FieldEditorModal";
import { ConclusionSamples } from "../../components/ConclusionSamples";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { ProtocolOrganHeader } from "../../components/protocol/ProtocolHeaders";
import type { ThyroidStudyDraft } from "../../shared/thyroidDraft";
import type { AppStyles } from "../../styles/appStyles";
import type { FieldVisibility } from "../../settings/fieldVisibility";
import { useInlineNumpad } from "../../hooks/useInlineNumpad";
import {
  THYROID_CONCLUSION_SAMPLES,
  THYROID_CONTOUR_OPTIONS,
  THYROID_ECHOGENICITY_OPTIONS,
  THYROID_ECHOSTRUCTURE_OPTIONS,
  THYROID_POSITION_OPTIONS,
  THYROID_SECTION_IDS,
  THYROID_SYMMETRY_OPTIONS,
  resolveActiveThyroidSection,
} from "./thyroidFieldConfigs";
import { useThyroidDraft } from "./useThyroidDraft";
import { ThyroidLobePanel } from "./ThyroidLobePanel";
import { ThyroidConclusionPanel } from "./ThyroidConclusionPanel";
import { ThyroidAutoIndicators } from "./ThyroidAutoIndicators";

type ThyroidProtocolBlockProps = {
  styles: AppStyles;
  fieldVisibility: FieldVisibility;
  value: ThyroidStudyDraft;
  onChange: (value: ThyroidStudyDraft) => void;
  activeSectionId?: string | null;
  isLandscape?: boolean;
};

export function ThyroidProtocolBlock({
  styles,
  fieldVisibility,
  value,
  onChange,
  activeSectionId,
  isLandscape,
}: ThyroidProtocolBlockProps) {
  const draftApi = useThyroidDraft(value, onChange);
  const thyroid = draftApi.form.thyroid;
  const fv = fieldVisibility as Record<string, boolean>;
  const resolvedActiveSectionId = resolveActiveThyroidSection(activeSectionId);
  const showAllSections = resolvedActiveSectionId === null;

  const isConclusionEditor = draftApi.editorState?.title === "Заключение щитовидной железы";

  // ---- Landscape: numpad для перешейка ----
  const isthmusRef = useRef<View>(null);
  const isthmusFieldRefs = useRef<Record<string, View | null>>({});
  const isthmusNumpad = useInlineNumpad(isthmusRef);

  const handleIsthmusNumpadChange = useCallback(
    (nextValue: string) => {
      draftApi.updateThyroidField("isthmusSize", nextValue);
    },
    [draftApi],
  );

  const openIsthmusNumpad = useCallback(() => {
    if (isLandscape) {
      const fieldView = isthmusFieldRefs.current["isthmusSize"] ?? null;
      isthmusNumpad.openNumpad("isthmusSize", fieldView);
    } else {
      draftApi.openEditor({
        title: "Перешеек: размер",
        mode: "number",
        value: thyroid.isthmusSize,
        placeholder: "мм",
        onSave: (nextValue) => draftApi.updateThyroidField("isthmusSize", nextValue),
      });
    }
  }, [isLandscape, isthmusNumpad, draftApi, thyroid.isthmusSize]);

  return (
    <>
      <FieldEditorModal
        visible={Boolean(draftApi.editorState)}
        title={draftApi.editorState?.title ?? ""}
        mode={draftApi.editorState?.mode ?? "text"}
        value={draftApi.editorState?.value ?? ""}
        options={draftApi.editorState?.options}
        placeholder={draftApi.editorState?.placeholder}
        multiline={draftApi.editorState?.multiline}
        footerContent={
          isConclusionEditor
            ? ({ value, setValue, close }) => (
                <ConclusionSamples
                  currentValue={value}
                  setValue={setValue}
                  close={close}
                  styles={styles}
                  samples={THYROID_CONCLUSION_SAMPLES}
                />
              )
            : undefined
        }
        onCancel={draftApi.closeEditor}
        onSave={draftApi.saveEditor}
      />

      {(showAllSections || resolvedActiveSectionId === THYROID_SECTION_IDS.rightLobe || resolvedActiveSectionId === THYROID_SECTION_IDS.leftLobe) && (
        <View style={styles.kidneyPlainSection} ref={isthmusRef}>
          <ThyroidLobePanel
            styles={styles}
            side="right"
            lobe={thyroid.rightLobe}
            isVisible={showAllSections || resolvedActiveSectionId === THYROID_SECTION_IDS.rightLobe}
            fv={fv}
            isLandscape={isLandscape}
            openEditor={draftApi.openEditor}
            onUpdateLobeField={draftApi.updateLobeField}
            onAddNode={draftApi.addNode}
            onUpdateNodeField={draftApi.updateNodeField}
            onRemoveNode={draftApi.removeNode}
          />
          <ThyroidLobePanel
            styles={styles}
            side="left"
            lobe={thyroid.leftLobe}
            isVisible={showAllSections || resolvedActiveSectionId === THYROID_SECTION_IDS.leftLobe}
            fv={fv}
            isLandscape={isLandscape}
            openEditor={draftApi.openEditor}
            onUpdateLobeField={draftApi.updateLobeField}
            onAddNode={draftApi.addNode}
            onUpdateNodeField={draftApi.updateNodeField}
            onRemoveNode={draftApi.removeNode}
          />

          {fv["thyroid.isthmusSize"] !== false && (
            <View style={styles.obpFieldList}>
              <ProtocolOrganHeader title="Перешеек" />
              <View
                ref={(el) => { isthmusFieldRefs.current["isthmusSize"] = el; }}
                onLayout={(event) => isthmusNumpad.handleFieldLayout("isthmusSize", event)}
              >
                <ProtocolFieldRow
                  label="Размер перешейка (мм)"
                  value={thyroid.isthmusSize || "Нажмите для ввода"}
                  typeLabel="numpad"
                  filled={Boolean(thyroid.isthmusSize)}
                  compact={isLandscape}
                  onPress={openIsthmusNumpad}
                />
              </View>
            </View>
          )}

          {/* InlineNumpad для перешейка */}
          {isthmusNumpad.activeNumpadField != null && isthmusNumpad.numpadPosition && (
            <View
              style={{
                position: "absolute",
                top: isthmusNumpad.numpadPosition.top,
                left: isthmusNumpad.numpadPosition.left,
                width: isthmusNumpad.numpadPosition.width,
                zIndex: 100,
              }}
            >
              <InlineNumpad
                value={thyroid.isthmusSize}
                onValueChange={handleIsthmusNumpadChange}
                onClose={isthmusNumpad.closeNumpad}
              />
            </View>
          )}
        </View>
      )}

      {(showAllSections || resolvedActiveSectionId === THYROID_SECTION_IDS.commonIndicators) && (
        <View style={styles.kidneyPlainSection}>
          <ProtocolOrganHeader title="Общие показатели" />
          <View style={styles.obpFieldList}>
            <ThyroidAutoIndicators
              styles={styles}
              totalVolume={thyroid.totalVolume}
              rightToLeftRatio={thyroid.rightToLeftRatio}
            />
            {fv["thyroid.echogenicity"] !== false && (
              <ProtocolFieldRow
                label="Эхогенность железы"
                value={thyroid.echogenicity || "Нажмите для ввода"}
                typeLabel="select"
                filled={Boolean(thyroid.echogenicity)}
                compact={isLandscape}
                options={THYROID_ECHOGENICITY_OPTIONS}
                onSelectOption={(nextValue) => draftApi.updateThyroidField("echogenicity", nextValue)}
              />
            )}
            {fv["thyroid.echostructure"] !== false && (
              <ProtocolFieldRow
                label="Эхоструктура"
                value={thyroid.echostructure || "Нажмите для ввода"}
                typeLabel="select"
                filled={Boolean(thyroid.echostructure)}
                compact={isLandscape}
                options={THYROID_ECHOSTRUCTURE_OPTIONS}
                onSelectOption={(nextValue) => draftApi.updateThyroidField("echostructure", nextValue)}
              />
            )}
            {fv["thyroid.contour"] !== false && (
              <ProtocolFieldRow
                label="Контур"
                value={thyroid.contour || "Нажмите для ввода"}
                typeLabel="select"
                filled={Boolean(thyroid.contour)}
                compact={isLandscape}
                options={THYROID_CONTOUR_OPTIONS}
                onSelectOption={(nextValue) => draftApi.updateThyroidField("contour", nextValue)}
              />
            )}
            {fv["thyroid.symmetry"] !== false && (
              <ProtocolFieldRow
                label="Симметричность"
                value={thyroid.symmetry || "Нажмите для ввода"}
                typeLabel="select"
                filled={Boolean(thyroid.symmetry)}
                compact={isLandscape}
                options={THYROID_SYMMETRY_OPTIONS}
                onSelectOption={(nextValue) => draftApi.updateThyroidField("symmetry", nextValue)}
              />
            )}
            {fv["thyroid.position"] !== false && (
              <ProtocolFieldRow
                label="Положение"
                value={thyroid.position || "Нажмите для ввода"}
                typeLabel="select"
                filled={Boolean(thyroid.position)}
                compact={isLandscape}
                options={THYROID_POSITION_OPTIONS}
                onSelectOption={(nextValue) => draftApi.updateThyroidField("position", nextValue)}
              />
            )}
          </View>
        </View>
      )}

      {(showAllSections || resolvedActiveSectionId === THYROID_SECTION_IDS.conclusion) &&
        fv["thyroid.conclusion"] !== false && (
          <ThyroidConclusionPanel
            styles={styles}
            conclusion={draftApi.form.conclusion}
            recommendations={draftApi.form.recommendations}
            isLandscape={isLandscape}
            openEditor={draftApi.openEditor}
            onUpdateForm={draftApi.updateForm}
          />
        )}
    </>
  );
}

export default ThyroidProtocolBlock;