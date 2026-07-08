import { Fragment, useMemo } from "react";
import { View } from "react-native";
import type { AppStyles } from "../../styles/appStyles";
import type { FieldVisibility } from "../../settings/fieldVisibility";
import type { SpleenDraft } from "../../shared/obpDraft";
import { ProtocolOrganHeader, ProtocolSectionHeader } from "../../components/protocol/ProtocolHeaders";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { SPLEEN_FIELDS } from "./obpFieldConfigs";
import { isFieldVisible } from "../../shared/isFieldVisible";
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
  isLandscape?: boolean;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateField: (field: keyof SpleenDraft, value: string) => void;
};

export function SpleenSection({
  styles,
  fieldVisibility,
  spleen,
  hasPathologicalFormations,
  isLandscape,
  openEditor,
  onUpdateField,
}: SpleenSectionProps) {
  const hasValue = (v: string) => v.trim().length > 0;

  const groupedFields = useMemo(() => {
    const groups: Array<{ header?: string; fields: typeof SPLEEN_FIELDS }> = [];
    let currentGroup: typeof SPLEEN_FIELDS = [];

    SPLEEN_FIELDS.forEach((field) => {
      if (field.key === "pathologicalFormationsText" && !hasPathologicalFormations) return;
      if (!isFieldVisible(field, fieldVisibility)) return;

      if (SPLEEN_SECTION_HEADERS[field.key]) {
        if (currentGroup.length > 0) {
          groups.push({ fields: currentGroup });
        }
        groups.push({ header: SPLEEN_SECTION_HEADERS[field.key], fields: [] });
        currentGroup = [];
      }
      currentGroup.push(field);
    });
    if (currentGroup.length > 0) {
      groups.push({ fields: currentGroup });
    }
    return groups;
  }, [hasPathologicalFormations, fieldVisibility]);

  const renderFieldRow = (field: typeof SPLEEN_FIELDS[0]) => {
    const currentValue = spleen[field.key];
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
      <ProtocolOrganHeader title="Селезёнка" />
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
      )}
    </>
  );
}