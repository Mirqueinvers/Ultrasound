import { Pressable, Text, View } from "react-native";

import { FieldEditorModal } from "../../components/FieldEditorModal";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { ProtocolOrganHeader, ProtocolSectionHeader } from "../../components/protocol/ProtocolHeaders";
import type { ThyroidStudyDraft } from "../../shared/thyroidDraft";
import type { AppStyles } from "../../styles/appStyles";
import type { FieldVisibility } from "../../settings/fieldVisibility";
import {
  THYROID_CONCLUSION_SAMPLES,
  THYROID_CONTOUR_OPTIONS,
  THYROID_ECHOGENICITY_OPTIONS,
  THYROID_ECHOSTRUCTURE_OPTIONS,
  THYROID_POSITION_OPTIONS,
  THYROID_SYMMETRY_OPTIONS,
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
};

function ConclusionSamples({
  currentValue,
  setValue,
  close,
  styles,
}: {
  currentValue: string;
  setValue: (v: string) => void;
  close: () => void;
  styles: AppStyles;
}) {
  return (
    <View style={styles.obpSampleList}>
      {THYROID_CONCLUSION_SAMPLES.map((sample) => (
        <Pressable
          key={sample.title}
          onPress={() => {
            const nextValue = currentValue
              ? `${currentValue}${currentValue.endsWith("\n") ? "" : "\n"}${sample.value}`
              : sample.value;
            setValue(nextValue);
          }}
          style={({ pressed }) => [
            styles.obpSampleButton,
            pressed && styles.obpSampleButtonPressed,
          ]}
        >
          <Text style={styles.obpSampleButtonTitle}>{sample.title}</Text>
          <Text style={styles.obpSampleButtonText}>{sample.value}</Text>
        </Pressable>
      ))}

      <Pressable
        onPress={close}
        style={({ pressed }) => [
          styles.secondaryButton,
          {
            alignSelf: "flex-start",
            paddingVertical: 10,
            paddingHorizontal: 14,
          },
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={styles.secondaryButtonText}>Закрыть</Text>
      </Pressable>
    </View>
  );
}

export function ThyroidProtocolBlock({
  styles,
  fieldVisibility,
  value,
  onChange,
  activeSectionId,
}: ThyroidProtocolBlockProps) {
  const draftApi = useThyroidDraft(value, onChange);
  const thyroid = draftApi.form.thyroid;
  const fv = fieldVisibility as Record<string, boolean>;

  const isConclusionEditor = draftApi.editorState?.title === "Заключение щитовидной железы";

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
                />
              )
            : undefined
        }
        onCancel={draftApi.closeEditor}
        onSave={draftApi.saveEditor}
      />

      <View style={styles.kidneyPlainSection}>
        <ThyroidLobePanel
          styles={styles}
          side="right"
          lobe={thyroid.rightLobe}
          activeSectionId={activeSectionId}
          fv={fv}
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
          activeSectionId={activeSectionId}
          fv={fv}
          openEditor={draftApi.openEditor}
          onUpdateLobeField={draftApi.updateLobeField}
          onAddNode={draftApi.addNode}
          onUpdateNodeField={draftApi.updateNodeField}
          onRemoveNode={draftApi.removeNode}
        />
      </View>

      {fv["thyroid.isthmus"] !== false && (
        <View style={styles.kidneyPlainSection}>
          <ProtocolOrganHeader title="Перешеек" />
          <View style={styles.obpFieldList}>
            <ProtocolFieldRow
              label="Размер перешейка (мм)"
              value={thyroid.isthmusSize || "Нажмите для ввода"}
              typeLabel="numpad"
              filled={Boolean(thyroid.isthmusSize)}
              onPress={() =>
                draftApi.openEditor({
                  title: "Перешеек: размер",
                  mode: "number",
                  value: thyroid.isthmusSize,
                  placeholder: "мм",
                  onSave: (nextValue) => draftApi.updateThyroidField("isthmusSize", nextValue),
                })
              }
            />
          </View>
        </View>
      )}

      <View style={styles.kidneyPlainSection}>
        <ProtocolOrganHeader title="Общие показатели" />
        <View style={styles.obpFieldList}>
          <ThyroidAutoIndicators
            styles={styles}
            totalVolume={thyroid.totalVolume}
            rightToLeftRatio={thyroid.rightToLeftRatio}
          />
          {fv["thyroid.echogenicity"] !== false && (
            <>
              <ProtocolFieldRow
                label="Эхогенность железы"
                value={thyroid.echogenicity || "Нажмите для ввода"}
                typeLabel="select"
                filled={Boolean(thyroid.echogenicity)}
                options={THYROID_ECHOGENICITY_OPTIONS}
                onSelectOption={(nextValue) => draftApi.updateThyroidField("echogenicity", nextValue)}
              />
              <ProtocolFieldRow
                label="Эхоструктура"
                value={thyroid.echostructure || "Нажмите для ввода"}
                typeLabel="select"
                filled={Boolean(thyroid.echostructure)}
                options={THYROID_ECHOSTRUCTURE_OPTIONS}
                onSelectOption={(nextValue) => draftApi.updateThyroidField("echostructure", nextValue)}
              />
              <ProtocolFieldRow
                label="Контур"
                value={thyroid.contour || "Нажмите для ввода"}
                typeLabel="select"
                filled={Boolean(thyroid.contour)}
                options={THYROID_CONTOUR_OPTIONS}
                onSelectOption={(nextValue) => draftApi.updateThyroidField("contour", nextValue)}
              />
              <ProtocolFieldRow
                label="Симметричность"
                value={thyroid.symmetry || "Нажмите для ввода"}
                typeLabel="select"
                filled={Boolean(thyroid.symmetry)}
                options={THYROID_SYMMETRY_OPTIONS}
                onSelectOption={(nextValue) => draftApi.updateThyroidField("symmetry", nextValue)}
              />
              <ProtocolFieldRow
                label="Положение"
                value={thyroid.position || "Нажмите для ввода"}
                typeLabel="select"
                filled={Boolean(thyroid.position)}
                options={THYROID_POSITION_OPTIONS}
                onSelectOption={(nextValue) => draftApi.updateThyroidField("position", nextValue)}
              />
            </>
          )}
        </View>
      </View>

      {(!activeSectionId || activeSectionId === "thyroid.conclusion") &&
        fv["thyroid.conclusion"] !== false && (
          <ThyroidConclusionPanel
            styles={styles}
            conclusion={draftApi.form.conclusion}
            recommendations={draftApi.form.recommendations}
            openEditor={draftApi.openEditor}
            onUpdateForm={draftApi.updateForm}
          />
        )}
    </>
  );
}

export default ThyroidProtocolBlock;
