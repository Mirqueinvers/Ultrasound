import { Fragment } from "react";
import { View } from "react-native";
import type { AppStyles } from "../../styles/appStyles";
import type { FieldVisibility } from "../../settings/fieldVisibility";
import type { SpleenDraft } from "../../shared/obpDraft";
import { ProtocolOrganHeader, ProtocolSectionHeader } from "../../components/protocol/ProtocolHeaders";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { SPLEEN_FIELDS } from "./obpFieldConfigs";
import { isFieldVisible } from "./isFieldVisible";
import type { EditorState } from "./useObpEditor";

const SPLEEN_SECTION_HEADERS: Record<string, string> = {
  position: "Положение",
  length: "Размеры",
  echogenicity: "Структура",
  splenicVein: "Сосуды",
  additional: "Дополнительно",
};

type SpleenSectionProps = {
  styles: AppStyles;
  fieldVisibility: FieldVisibility;
  spleen: SpleenDraft;
  hasPathologicalFormations: boolean;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateField: (field: keyof SpleenDraft, value: string) => void;
};

export function SpleenSection({
  styles,
  fieldVisibility,
  spleen,
  hasPathologicalFormations,
  openEditor,
  onUpdateField,
}: SpleenSectionProps) {
  const hasValue = (v: string) => v.trim().length > 0;

  return (
    <>
      <ProtocolOrganHeader title="Селезёнка" />
      <View style={styles.obpFieldList}>
        {SPLEEN_FIELDS.map((field) => {
          if (field.key === "pathologicalFormationsText" && !hasPathologicalFormations) {
            return null;
          }
          if (!isFieldVisible(field, fieldVisibility)) {
            return null;
          }

          const currentValue = spleen[field.key];
          const displayValue = currentValue || "Нажмите для ввода";

          return (
            <Fragment key={field.key}>
              {SPLEEN_SECTION_HEADERS[field.key] && (
                <ProtocolSectionHeader title={SPLEEN_SECTION_HEADERS[field.key]} />
              )}
              <ProtocolFieldRow
                label={field.label}
                value={displayValue}
                typeLabel={field.kind === "number" ? "numpad" : field.kind}
                filled={hasValue(currentValue)}
                onPress={field.kind === "select" ? undefined : () => {
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