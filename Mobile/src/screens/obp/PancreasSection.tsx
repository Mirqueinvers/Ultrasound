import { Fragment, useMemo } from "react";
import { View } from "react-native";
import type { AppStyles } from "../../styles/appStyles";
import type { FieldVisibility } from "../../settings/fieldVisibility";
import type { PancreasDraft } from "../../shared/obpDraft";
import { ProtocolOrganHeader, ProtocolSectionHeader } from "../../components/protocol/ProtocolHeaders";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { PANCREAS_FIELDS } from "./obpFieldConfigs";
import { isFieldVisible } from "../../shared/isFieldVisible";
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
  isLandscape?: boolean;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateField: (field: keyof PancreasDraft, value: string) => void;
};

export function PancreasSection({
  styles,
  fieldVisibility,
  pancreas,
  hasPathologicalFormations,
  isLandscape,
  openEditor,
  onUpdateField,
}: PancreasSectionProps) {
  const hasValue = (v: string) => v.trim().length > 0;

  const groupedFields = useMemo(() => {
    const groups: Array<{ header?: string; fields: typeof PANCREAS_FIELDS }> = [];
    let currentGroup: typeof PANCREAS_FIELDS = [];

    PANCREAS_FIELDS.forEach((field) => {
      if (field.key === "pathologicalFormationsText" && !hasPathologicalFormations) return;
      if (!isFieldVisible(field, fieldVisibility)) return;

      if (PANCREAS_SECTION_HEADERS[field.key]) {
        if (currentGroup.length > 0) {
          groups.push({ fields: currentGroup });
        }
        groups.push({ header: PANCREAS_SECTION_HEADERS[field.key], fields: [] });
        currentGroup = [];
      }
      currentGroup.push(field);
    });
    if (currentGroup.length > 0) {
      groups.push({ fields: currentGroup });
    }
    return groups;
  }, [hasPathologicalFormations, fieldVisibility]);

  const renderFieldRow = (field: typeof PANCREAS_FIELDS[0]) => {
    const currentValue = pancreas[field.key];
    const displayValue = currentValue || "Нажмите для ввода";

    return (
      <ProtocolFieldRow
        key={field.key}
        label={field.label}
        value={displayValue}
        typeLabel={field.kind === "number" ? "numpad" : field.kind}
        filled={hasValue(currentValue)}
        compact={isLandscape}
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
    );
  };

  return (
    <>
      <ProtocolOrganHeader title="Поджелудочная железа" />
      {isLandscape ? (
        <View style={{ gap: 8 }}>
          {groupedFields.map((group, gi) => (
            <Fragment key={gi}>
              {group.header && <ProtocolSectionHeader title={group.header} />}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {group.fields.map((field) => (
                  <View key={field.key} style={{ width: "48.5%" }}>
                    {renderFieldRow(field)}
                  </View>
                ))}
              </View>
            </Fragment>
          ))}
        </View>
      ) : (
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
      )}
    </>
  );
}
