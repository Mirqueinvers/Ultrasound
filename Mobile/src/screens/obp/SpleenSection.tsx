import { Fragment, useCallback, useMemo } from "react";
import { View } from "react-native";
import type { AppStyles } from "../../styles/appStyles";
import type { FieldVisibility } from "../../settings/fieldVisibility";
import type { SpleenDraft } from "../../shared/obpDraft";
import { ProtocolOrganHeader, ProtocolSectionHeader } from "../../components/protocol/ProtocolHeaders";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { InlineNumpad } from "../../components/InlineNumpad";
import { SPLEEN_FIELDS } from "./obpFieldConfigs";
import { isFieldVisible } from "../../shared/isFieldVisible";
import type { EditorState } from "./useObpEditor";
import { useInlineNumpad } from "./useInlineNumpad";

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
  const numpad = useInlineNumpad();
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

  const handleNumpadChange = useCallback(
    (fieldKey: keyof SpleenDraft, nextValue: string) => {
      onUpdateField(fieldKey, nextValue);
    },
    [onUpdateField],
  );

  const handleFieldPress = useCallback(
    (field: typeof SPLEEN_FIELDS[0]) => {
      if (isLandscape && field.kind === "number") {
        numpad.openNumpad(field.key as string);
      } else {
        openEditor({
          title: field.label,
          mode: field.kind,
          value: spleen[field.key],
          placeholder: field.placeholder,
          multiline: field.multiline,
          options: field.options,
          onSave: (nextValue) => onUpdateField(field.key, nextValue),
        });
      }
    },
    [isLandscape, openEditor, spleen, onUpdateField, numpad],
  );

  const renderFieldRow = (field: typeof SPLEEN_FIELDS[0]) => {
    const currentValue = spleen[field.key];
    const displayValue = currentValue || "Нажмите для ввода";
    const fieldKey = field.key as string;

    return (
      <View
        key={fieldKey}
        onLayout={(event) => numpad.handleFieldLayout(fieldKey, event)}
      >
        <ProtocolFieldRow
          label={field.label}
          value={displayValue}
          typeLabel={field.kind === "number" ? "numpad" : field.kind}
          filled={hasValue(currentValue)}
          compact={isLandscape}
          onPress={field.kind === "select" ? undefined : () => handleFieldPress(field)}
          options={field.kind === "select" ? field.options : undefined}
          onSelectOption={field.kind === "select" ? (nextValue) => onUpdateField(field.key, nextValue) : undefined}
        />
      </View>
    );
  };

  return (
    <>
      <ProtocolOrganHeader title="Селезёнка" />
      {isLandscape ? (
        <View style={{ gap: 8, position: "relative" }}>
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
          {numpad.activeNumpadField != null && numpad.numpadPosition && (() => {
            const activeField = SPLEEN_FIELDS.find((f) => f.key === numpad.activeNumpadField);
            if (!activeField) return null;
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
                  value={spleen[activeField.key]}
                  onValueChange={(nextValue) => handleNumpadChange(activeField.key, nextValue)}
                  onClose={numpad.closeNumpad}
                />
              </View>
            );
          })()}
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