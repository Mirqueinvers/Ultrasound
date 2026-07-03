import { Pressable, Text, View } from "react-native";
import type { AppStyles } from "../../styles/appStyles";
import { ProtocolOrganHeader } from "../../components/protocol/ProtocolHeaders";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { OBP_FINAL_FIELDS, OBP_CONCLUSION_SAMPLES } from "./obpFieldConfigs";
import { isNormalizedMatch } from "../../shared/normalizeSelectValue";
import type { EditorState } from "./useObpEditor";
import { useCallback } from "react";

type ConclusionSectionProps = {
  styles: AppStyles;
  freeFluid: string;
  freeFluidDetails: string;
  conclusion: string;
  recommendations: string;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateFreeFluid: (field: "freeFluid" | "freeFluidDetails", value: string) => void;
  onUpdateConclusion: (value: string) => void;
  onUpdateRecommendations: (value: string) => void;
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
      {OBP_CONCLUSION_SAMPLES.map((sample) => (
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

export function ConclusionSection({
  styles,
  freeFluid,
  freeFluidDetails,
  conclusion,
  recommendations,
  openEditor,
  onUpdateFreeFluid,
  onUpdateConclusion,
  onUpdateRecommendations,
}: ConclusionSectionProps) {
  const hasValue = (v: string) => v.trim().length > 0;
  const freeFluidDetected = isNormalizedMatch(freeFluid, "определяется");

  return (
    <>
      <ProtocolOrganHeader title="Свободная жидкость" />
      <View style={styles.obpFieldList}>
        <ProtocolFieldRow
          label={OBP_FINAL_FIELDS[0].label}
          value={freeFluid || "Нажмите для ввода"}
          typeLabel="select"
          filled={hasValue(freeFluid)}
          options={OBP_FINAL_FIELDS[0].options}
          onSelectOption={(nextValue) => onUpdateFreeFluid("freeFluid", nextValue)}
        />
        {freeFluidDetected && (
          <Pressable
            onPress={() => {
              openEditor({
                title: OBP_FINAL_FIELDS[1].label,
                mode: "text",
                value: freeFluidDetails,
                placeholder: OBP_FINAL_FIELDS[1].placeholder,
                multiline: true,
                onSave: (nextValue) => onUpdateFreeFluid("freeFluidDetails", nextValue),
              });
            }}
            style={({ pressed }) => [
              styles.obpFieldRow,
              hasValue(freeFluidDetails) && styles.obpFieldRowFilled,
              pressed && styles.obpFieldRowPressed,
            ]}
          >
            <View style={styles.obpFieldRowContent}>
              <Text style={styles.obpFieldLabel}>{OBP_FINAL_FIELDS[1].label}</Text>
              <Text style={styles.obpFieldValue}>
                {freeFluidDetails || "Нажмите для ввода"}
              </Text>
            </View>
            <Text style={styles.obpFieldType}>text</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.obpFieldList}>
        <ProtocolOrganHeader title="Заключение" />
        <ProtocolFieldRow
          label={OBP_FINAL_FIELDS[2].label}
          value={conclusion || "Нажмите для ввода"}
          typeLabel="text"
          filled={hasValue(conclusion)}
          onPress={() => {
            openEditor({
              title: OBP_FINAL_FIELDS[2].label,
              mode: "text",
              value: conclusion,
              placeholder: OBP_FINAL_FIELDS[2].placeholder,
              multiline: true,
              onSave: onUpdateConclusion,
              footerContent: ({ value, setValue, close }) => (
                <ConclusionSamples
                  currentValue={value}
                  setValue={setValue}
                  close={close}
                  styles={styles}
                />
              ),
            });
          }}
        />
        <ProtocolFieldRow
          label={OBP_FINAL_FIELDS[3].label}
          value={recommendations || "Нажмите для ввода"}
          typeLabel="text"
          filled={hasValue(recommendations)}
          onPress={() => {
            openEditor({
              title: OBP_FINAL_FIELDS[3].label,
              mode: "text",
              value: recommendations,
              placeholder: OBP_FINAL_FIELDS[3].placeholder,
              multiline: true,
              onSave: onUpdateRecommendations,
            });
          }}
        />
      </View>
    </>
  );
}