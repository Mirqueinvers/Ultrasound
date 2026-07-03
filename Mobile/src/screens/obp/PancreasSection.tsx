import { Fragment } from "react";
import { View } from "react-native";
import type { AppStyles } from "../../styles/appStyles";
import type { FieldVisibility } from "../../settings/fieldVisibility";
import type { PancreasDraft } from "../../shared/obpDraft";
import { ProtocolOrganHeader, ProtocolSectionHeader } from "../../components/protocol/ProtocolHeaders";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { PANCREAS_FIELDS } from "./obpFieldConfigs";
import { isFieldVisible } from "./isFieldVisible";
import type { EditorState } from "./useObpEditor";

const PANCREAS_SECTION_HEADERS: Record<string, string> = {
  head: "Размеры",
  echogenicity: "Структура",
  wirsungDuct: "Вирсунгов проток",
  additional: "Дополнительно",
};

type PancreasSectionProps = {
  styles: AppStyles;
  fieldVisibility: FieldVisibility;
  pancreas: PancreasDraft;
  hasPathologicalFormations: boolean;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateField: (field: keyof PancreasDraft, value: string) => void;
};

export function PancreasSection({
  styles,
  fieldVisibility,
  pancreas,
  hasPathologicalFormations,
  openEditor,
  onUpdateField,
}: PancreasSectionProps) {
  const hasValue = (v: string) => v.trim().length > 0;

  return (
    <>
      <ProtocolOrganHeader title="Поджелудочная железа" />
      <View style={styles.obpFieldList}>
        {PANCREAS_FIELDS.map((field) => {
          if (field.key === "pathologicalFormationsText" && !hasPathologicalFormations) {
            return null;
          }
          if (!isFieldVisible(field, fieldVisibility)) {
            return null;
          }

          const currentValue = pancreas[field.key];
          const displayValue = currentValue || "Нажмите для ввода";

          return (
            <Fragment key={field.key}>
              {PANCREAS_SECTION_HEADERS[field.key] && (
                <ProtocolSectionHeader title={PANCREAS_SECTION_HEADERS[field.key]} />
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