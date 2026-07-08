import { Fragment } from "react";
import { Pressable, Text, View } from "react-native";

import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { ProtocolOrganHeader, ProtocolSectionHeader } from "../../components/protocol/ProtocolHeaders";
import { createEmptyUrinaryBladderDraft, type UrinaryBladderDraft } from "../../shared/kidneyDraft";
import { isNormalizedMatch } from "../../shared/normalizeSelectValue";
import { isFieldVisible } from "../../shared/isFieldVisible";
import type { AppStyles } from "../../styles/appStyles";
import type { FieldVisibility } from "../../settings/fieldVisibility";
import {
  BLADDER_CONTENT_OPTIONS,
  RESIDUAL_STATUS_OPTIONS,
  KIDNEY_SECTION_IDS,
  type EditorState,
  type UrinaryBladderFieldSpec,
} from "./kidneysFieldConfigs";
import type { KidneysProducer } from "./useKidneysDraft";

type UrinaryBladderPanelProps = {
  styles: AppStyles;
  fieldVisibility: FieldVisibility;
  bladder: UrinaryBladderDraft | null;
  resolvedActiveSectionId: string | null;
  fv: Record<string, boolean>;
  isLandscape?: boolean;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateBladderField: (field: keyof UrinaryBladderDraft, value: string) => void;
  onUpdateStudy: (producer: KidneysProducer) => void;
};

const bladderFields: UrinaryBladderFieldSpec[] = [
  { key: "length", label: "Длина", kind: "number", placeholder: "мм", visibilityGroup: "kidneys.bladder.sizes" },
  { key: "width", label: "Ширина", kind: "number", placeholder: "мм", visibilityGroup: "kidneys.bladder.sizes" },
  { key: "depth", label: "Передне-задний", kind: "number", placeholder: "мм", visibilityGroup: "kidneys.bladder.sizes" },
  { key: "volume", label: "Объём", kind: "number", placeholder: "мл", visibilityGroup: "kidneys.bladder.sizes" },
  { key: "wallThickness", label: "Толщина стенки", kind: "number", placeholder: "мм", visibilityGroup: "kidneys.bladder.wall" },
  { key: "residualStatus", label: "Объём остаточной мочи", kind: "select", options: RESIDUAL_STATUS_OPTIONS, visibilityGroup: "kidneys.bladder.residual" },
  { key: "contents", label: "Характер содержимого", kind: "select", options: BLADDER_CONTENT_OPTIONS, visibilityGroup: "kidneys.bladder.contents" },
  { key: "additional", label: "Дополнительно", kind: "text", placeholder: "Введите дополнительное описание", multiline: true, visibilityGroup: "kidneys.bladder.additional" },
];

/** Заголовки секций для полей мочевого пузыря */
const BLADDER_SECTION_HEADERS: Partial<Record<string, string>> = {
  length: "Размеры",
  wallThickness: "Стенка",
  residualStatus: "Объем остаточной мочи",
  contents: "Содержимое",
  additional: "Дополнительно",
};

export function UrinaryBladderPanel({
  styles,
  fieldVisibility,
  bladder: rawBladder,
  resolvedActiveSectionId,
  fv,
  isLandscape,
  openEditor,
  onUpdateBladderField,
  onUpdateStudy,
}: UrinaryBladderPanelProps) {
  const bladder = rawBladder ?? createEmptyUrinaryBladderDraft();

  if (resolvedActiveSectionId && resolvedActiveSectionId !== KIDNEY_SECTION_IDS.bladder) {
    return null;
  }

  const showResidualFields = isNormalizedMatch(bladder.residualStatus, "определяется");
  const showContentsText = isNormalizedMatch(bladder.contents, "неоднородное");

  return (
    <View style={styles.kidneyPlainSection}>
      <ProtocolOrganHeader title="Мочевой пузырь" />

      <View style={styles.obpFieldList}>
        {bladderFields.map((field) => {
          if (!isFieldVisible(field, fieldVisibility)) {
            return null;
          }

          const currentValue = bladder[field.key];
          const filled = Boolean(currentValue && currentValue.trim().length > 0);
          const currentDisplay = currentValue || "Нажмите для ввода";

          return (
            <Fragment key={field.key}>
              {BLADDER_SECTION_HEADERS[field.key] && (
                <ProtocolSectionHeader title={BLADDER_SECTION_HEADERS[field.key]!} />
              )}

              {field.key === "residualStatus" && showResidualFields && (
                <View style={styles.obpFieldList}>
                  {(["residualLength", "residualWidth", "residualDepth", "residualVolume"] as const).map(
                    (fieldKey, index) => {
                      const labels = ["Длина", "Ширина", "Передне-задний", "Объём"];
                      const values = [
                        bladder.residualLength,
                        bladder.residualWidth,
                        bladder.residualDepth,
                        bladder.residualVolume,
                      ];
                      const readOnly = fieldKey === "residualVolume";

                      return (
                        <Pressable
                          key={fieldKey}
                          onPress={() => {
                            if (readOnly) {
                              return;
                            }

                            openEditor({
                              title: `Мочевой пузырь: ${labels[index]}`,
                              mode: "number",
                              value: values[index],
                              placeholder: "мм",
                              onSave: (nextValue) => onUpdateBladderField(fieldKey, nextValue),
                            });
                          }}
                          style={({ pressed }) => [
                            styles.obpFieldRow,
                            values[index].trim().length > 0 && styles.obpFieldRowFilled,
                            pressed && styles.obpFieldRowPressed,
                            readOnly && styles.obpFieldRowReadonly,
                          ]}
                        >
                          <View style={styles.obpFieldRowContent}>
                            <Text style={styles.obpFieldLabel}>{labels[index]}</Text>
                            <Text style={styles.obpFieldValue}>
                              {values[index] || "Нажмите для ввода"}
                            </Text>
                          </View>
                          <Text style={styles.obpFieldType}>{readOnly ? "auto" : "numpad"}</Text>
                        </Pressable>
                      );
                    },
                  )}
                </View>
              )}

              {field.key === "contents" && showContentsText && (
                <Pressable
                  onPress={() =>
                    openEditor({
                      title: "Мочевой пузырь: Описание содержимого",
                      mode: "text",
                      value: bladder.contentsText,
                      placeholder: "Введите описание",
                      multiline: true,
                      onSave: (nextValue) => onUpdateBladderField("contentsText", nextValue),
                    })
                  }
                  style={({ pressed }) => [
                    styles.obpFieldRow,
                    bladder.contentsText.trim().length > 0 && styles.obpFieldRowFilled,
                    pressed && styles.obpFieldRowPressed,
                  ]}
                >
                  <View style={styles.obpFieldRowContent}>
                    <Text style={styles.obpFieldLabel}>Описание содержимого</Text>
                    <Text style={styles.obpFieldValue}>
                      {bladder.contentsText || "Нажмите для ввода"}
                    </Text>
                  </View>
                  <Text style={styles.obpFieldType}>text</Text>
                </Pressable>
              )}

              <ProtocolFieldRow
                label={field.label}
                value={currentDisplay}
                typeLabel={field.kind === "number" ? "numpad" : field.kind === "select" ? "select" : "text"}
                filled={filled}
                compact={isLandscape}
                onPress={
                  field.kind === "select"
                    ? undefined
                    : () => {
                        openEditor({
                          title: `Мочевой пузырь: ${field.label}`,
                          mode: field.kind,
                          value: currentValue,
                          placeholder: field.placeholder,
                          multiline: field.multiline,
                          options: field.options,
                          onSave: (nextValue) => onUpdateBladderField(field.key, nextValue),
                        });
                      }
                }
                options={field.kind === "select" ? field.options : undefined}
                onSelectOption={
                  field.kind === "select"
                    ? (nextValue) => onUpdateBladderField(field.key, nextValue)
                    : undefined
                }
              />
            </Fragment>
          );
        })}
      </View>
    </View>
  );
}
