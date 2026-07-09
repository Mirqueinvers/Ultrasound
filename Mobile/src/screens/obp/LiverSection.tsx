import { Fragment, useCallback, useMemo } from "react";
import { View } from "react-native";
import type { AppStyles } from "../../styles/appStyles";
import type { FieldVisibility } from "../../settings/fieldVisibility";
import type { LiverDraft } from "../../shared/obpDraft";
import { ProtocolOrganHeader, ProtocolSectionHeader } from "../../components/protocol/ProtocolHeaders";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { InlineNumpad } from "../../components/InlineNumpad";
import { LIVER_FIELDS } from "./obpFieldConfigs";
import { isFieldVisible } from "../../shared/isFieldVisible";
import type { EditorState } from "./useObpEditor";
import { useInlineNumpad } from "./useInlineNumpad";

// Ключи полей, перед которыми нужно показать заголовок группы
const LIVER_SECTION_HEADERS: Record<string, string> = {
  rightLobeAP: "Размеры",
  echogenicity: "Структура",
  portalVeinDiameter: "Сосуды",
  additional: "Дополнительно",
};

type LiverSectionProps = {
  styles: AppStyles;
  fieldVisibility: FieldVisibility;
  liver: LiverDraft;
  hasFocalLesions: boolean;
  isReadOnlyField: (key: keyof LiverDraft) => boolean;
  isLandscape?: boolean;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateField: (field: keyof LiverDraft, value: string) => void;
};

export function LiverSection({
  styles,
  fieldVisibility,
  liver,
  hasFocalLesions,
  isReadOnlyField,
  isLandscape,
  openEditor,
  onUpdateField,
}: LiverSectionProps) {
  const numpad = useInlineNumpad();
  const hasValue = (v: string) => v.trim().length > 0;

  // Group visible fields by headers for 2-column grid in landscape
  const groupedFields = useMemo(() => {
    const groups: Array<{ header?: string; fields: typeof LIVER_FIELDS }> = [];
    let currentGroup: typeof LIVER_FIELDS = [];

    LIVER_FIELDS.forEach((field) => {
      if (field.key === "focalLesions" && !hasFocalLesions) return;
      if (!isFieldVisible(field, fieldVisibility)) return;

      if (LIVER_SECTION_HEADERS[field.key]) {
        if (currentGroup.length > 0) {
          groups.push({ fields: currentGroup });
        }
        groups.push({ header: LIVER_SECTION_HEADERS[field.key], fields: [] });
        currentGroup = [];
      }
      currentGroup.push(field);
    });
    if (currentGroup.length > 0) {
      groups.push({ fields: currentGroup });
    }
    return groups;
  }, [hasFocalLesions, fieldVisibility]);

  const handleNumpadChange = useCallback(
    (fieldKey: keyof LiverDraft, nextValue: string) => {
      onUpdateField(fieldKey, nextValue);
    },
    [onUpdateField],
  );

  const handleFieldPress = useCallback(
    (field: typeof LIVER_FIELDS[0]) => {
      if (isReadOnlyField(field.key)) return;
      if (isLandscape && field.kind === "number") {
        numpad.openNumpad(field.key as string);
      } else {
        openEditor({
          title: field.label,
          mode: field.kind,
          value: liver[field.key],
          placeholder: field.placeholder,
          multiline: field.multiline,
          options: field.options,
          onSave: (nextValue) => onUpdateField(field.key, nextValue),
        });
      }
    },
    [isLandscape, isReadOnlyField, openEditor, liver, onUpdateField, numpad],
  );

  const renderFieldRow = (field: typeof LIVER_FIELDS[0]) => {
    const readonly = isReadOnlyField(field.key);
    const currentValue = liver[field.key];
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
          typeLabel={readonly ? "auto" : field.kind === "number" ? "numpad" : field.kind}
          filled={hasValue(currentValue)}
          readonly={readonly}
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
      <ProtocolOrganHeader title="Печень" />
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
            const activeField = LIVER_FIELDS.find((f) => f.key === numpad.activeNumpadField);
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
                  value={liver[activeField.key]}
                  onValueChange={(nextValue) => handleNumpadChange(activeField.key, nextValue)}
                  onClose={numpad.closeNumpad}
                />
              </View>
            );
          })()}
        </View>
      ) : (
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
      )}
    </>
  );
}