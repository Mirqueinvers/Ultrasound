import { Fragment } from "react";
import { View } from "react-native";
import type { AppStyles } from "../../styles/appStyles";
import type { FieldVisibility } from "../../settings/fieldVisibility";
import type { LiverDraft } from "../../shared/obpDraft";
import { ProtocolOrganHeader, ProtocolSectionHeader } from "../../components/protocol/ProtocolHeaders";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { LIVER_FIELDS } from "./obpFieldConfigs";
import { isFieldVisible } from "../../shared/isFieldVisible";
import type { EditorState } from "./useObpEditor";

// Ключи полей, перед которыми нужно показать заголовок группы
const LIVER_SECTION_HEADERS: Record<string, string> = {
  rightLobeAP: "Размеры",
  echogenicity: "Структура",
  vascularPattern: "Сосуды",
  additional: "Дополнительно",
};

type LiverSectionProps = {
  styles: AppStyles;
  fieldVisibility: FieldVisibility;
  liver: LiverDraft;
  hasFocalLesions: boolean;
  isReadOnlyField: (key: keyof LiverDraft) => boolean;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateField: (field: keyof LiverDraft, value: string) => void;
};

export function LiverSection({
  styles,
  fieldVisibility,
  liver,
  hasFocalLesions,
  isReadOnlyField,
  openEditor,
  onUpdateField,
}: LiverSectionProps) {
  const hasValue = (v: string) => v.trim().length > 0;

  return (
    <>
      <ProtocolOrganHeader title="Печень" />
      <View style={styles.obpFieldList}>
        {LIVER_FIELDS.map((field) => {
          if (field.key === "focalLesions" && !hasFocalLesions) {
            return null;
          }
          if (!isFieldVisible(field, fieldVisibility)) {
            return null;
          }

          const readonly = isReadOnlyField(field.key);
          const currentValue = liver[field.key];
          const displayValue = currentValue || "Нажмите для ввода";

          return (
            <Fragment key={field.key}>
              {LIVER_SECTION_HEADERS[field.key] && (
                <ProtocolSectionHeader title={LIVER_SECTION_HEADERS[field.key]} />
              )}
              <ProtocolFieldRow
                label={field.label}
                value={displayValue}
                typeLabel={readonly ? "auto" : field.kind === "number" ? "numpad" : field.kind}
                filled={hasValue(currentValue)}
                readonly={readonly}
                onPress={field.kind === "select" ? undefined : () => {
                  if (readonly) return;
                  openEditor({
                    title: field.label,
                    mode: field.kind,
                    value: currentValue,
                    placeholder: field.placeholder,
                    multiline: field.multiline,
                    options: field.options,
                    onSave: (nextValue) => onUpdateField(field.key, nextValue),
                  });
                }}
                options={field.kind === "select" ? field.options : undefined}
                onSelectOption={field.kind === "select" ? (nextValue) => onUpdateField(field.key, nextValue) : undefined}
              />
            </Fragment>
          );
        })}
      </View>
    </>
  );
}