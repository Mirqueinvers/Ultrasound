import { useCallback, useMemo, useRef } from "react";
import { View } from "react-native";

import { InlineNumpad } from "../../components/InlineNumpad";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { ProtocolOrganHeader, ProtocolSectionHeader } from "../../components/protocol/ProtocolHeaders";
import { useInlineNumpad } from "../../hooks/useInlineNumpad";
import type { UrinaryBladderDraft } from "../../shared/omtFemaleDraft";
import { isNormalizedMatch } from "../../shared/normalizeSelectValue";
import type { AppStyles } from "../../styles/appStyles";
import {
  BLADDER_CONTENT_OPTIONS,
  BLADDER_RESIDUAL_OPTIONS,
  type EditorState,
} from "./omtMaleFieldConfigs";

type OmtMaleBladderPanelProps = {
  styles: AppStyles;
  bladder: UrinaryBladderDraft;
  fv: Record<string, boolean>;
  isVisible: boolean;
  isLandscape?: boolean;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateBladderField: (field: keyof UrinaryBladderDraft, value: string) => void;
};

export function OmtMaleBladderPanel({
  styles,
  bladder,
  fv,
  isVisible,
  isLandscape,
  openEditor,
  onUpdateBladderField,
}: OmtMaleBladderPanelProps) {
  if (!isVisible) return null;

  const showResidualBlock = isNormalizedMatch(bladder.residualStatus, "определяется");
  const showContentsText = isNormalizedMatch(bladder.contents, "неоднородное");

  // ---- Landscape: numpad ----
  const landscapeRef = useRef<View>(null);
  const fieldRefs = useRef<Record<string, View | null>>({});
  const numpad = useInlineNumpad(landscapeRef);

  const handleNumpadChange = useCallback(
    (fieldKey: keyof UrinaryBladderDraft, nextValue: string) => {
      onUpdateBladderField(fieldKey, nextValue);
    },
    [onUpdateBladderField],
  );

  const openLandscapeNumpad = useCallback(
    (fieldKey: keyof UrinaryBladderDraft) => {
      const fieldView = fieldRefs.current[fieldKey] ?? null;
      numpad.openNumpad(fieldKey, fieldView);
    },
    [numpad],
  );

  const renderCompactField = (
    fieldKey: keyof UrinaryBladderDraft,
    label: string,
    value: string,
    filled: boolean,
    typeLabel: "numpad" | "select" | "text" | "auto",
    options?: { value: string; label: string }[],
    onSelectOption?: (v: string) => void,
    onPress?: () => void,
    readonly?: boolean,
  ) => (
    <View
      key={fieldKey}
      ref={(el) => {
        if (typeLabel === "numpad") {
          fieldRefs.current[fieldKey] = el;
        }
      }}
      onLayout={typeLabel === "numpad" ? (event) => numpad.handleFieldLayout(fieldKey, event) : undefined}
      style={{ width: "48.5%" }}
    >
      <ProtocolFieldRow
        label={label}
        value={value || "Нажмите для ввода"}
        typeLabel={typeLabel}
        filled={filled}
        readonly={readonly}
        compact={isLandscape}
        onPress={onPress}
        options={options}
        onSelectOption={onSelectOption}
      />
    </View>
  );

  // Собираем все поля в один плоский массив для landscape
  const landscapeFields = useMemo(() => {
    const fields: React.ReactNode[] = [];

    // Размеры
    if (fv["omt_male.bladderLength"] !== false) {
      fields.push(renderCompactField("length", "Длина", bladder.length, Boolean(bladder.length), "numpad", undefined, undefined, () => openLandscapeNumpad("length")));
    }
    if (fv["omt_male.bladderWidth"] !== false) {
      fields.push(renderCompactField("width", "Ширина", bladder.width, Boolean(bladder.width), "numpad", undefined, undefined, () => openLandscapeNumpad("width")));
    }
    if (fv["omt_male.bladderDepth"] !== false) {
      fields.push(renderCompactField("depth", "Передне-задний", bladder.depth, Boolean(bladder.depth), "numpad", undefined, undefined, () => openLandscapeNumpad("depth")));
    }
    if (fv["omt_male.bladderVolume"] !== false) {
      fields.push(renderCompactField("volume", "Объем", bladder.volume || "Рассчитывается автоматически", Boolean(bladder.volume), "auto", undefined, undefined, undefined, true));
    }
    if (fv["omt_male.bladderWallThickness"] !== false) {
      fields.push(renderCompactField("wallThickness", "Толщина стенки", bladder.wallThickness, Boolean(bladder.wallThickness), "numpad", undefined, undefined, () => openLandscapeNumpad("wallThickness")));
    }

    // Объем остаточной мочи
    if (fv["omt_male.bladderResidualStatus"] !== false) {
      fields.push(renderCompactField("residualStatus", "Ост. моча: определение", bladder.residualStatus, Boolean(bladder.residualStatus), "select", BLADDER_RESIDUAL_OPTIONS, (v) => onUpdateBladderField("residualStatus", v)));
    }
    if (showResidualBlock) {
      if (fv["omt_male.bladderResidualLength"] !== false) {
        fields.push(renderCompactField("residualLength", "Ост. моча: длина", bladder.residualLength, Boolean(bladder.residualLength), "numpad", undefined, undefined, () => openLandscapeNumpad("residualLength")));
      }
      if (fv["omt_male.bladderResidualWidth"] !== false) {
        fields.push(renderCompactField("residualWidth", "Ост. моча: ширина", bladder.residualWidth, Boolean(bladder.residualWidth), "numpad", undefined, undefined, () => openLandscapeNumpad("residualWidth")));
      }
      if (fv["omt_male.bladderResidualDepth"] !== false) {
        fields.push(renderCompactField("residualDepth", "Ост. моча: ПЗ", bladder.residualDepth, Boolean(bladder.residualDepth), "numpad", undefined, undefined, () => openLandscapeNumpad("residualDepth")));
      }
      if (fv["omt_male.bladderResidualVolume"] !== false) {
        fields.push(renderCompactField("residualVolume", "Ост. моча: объем", bladder.residualVolume || "Рассчитывается автоматически", Boolean(bladder.residualVolume), "auto", undefined, undefined, undefined, true));
      }
    }

    // Содержимое
    if (fv["omt_male.bladderContents"] !== false) {
      fields.push(renderCompactField("contents", "Характер содержимого", bladder.contents, Boolean(bladder.contents), "select", BLADDER_CONTENT_OPTIONS, (v) => onUpdateBladderField("contents", v)));
    }
    if (showContentsText && fv["omt_male.bladderContentsText"] !== false) {
      fields.push(renderCompactField("contentsText", "Описание содержимого", bladder.contentsText, Boolean(bladder.contentsText), "text", undefined, undefined, () => openEditor({ title: "Описание содержимого", mode: "text", value: bladder.contentsText, placeholder: "Введите описание", multiline: true, onSave: (v) => onUpdateBladderField("contentsText", v) })));
    }

    // Дополнительно
    if (fv["omt_male.bladderAdditional"] !== false) {
      fields.push(renderCompactField("additional", "Дополнительно", bladder.additional, Boolean(bladder.additional), "text", undefined, undefined, () => openEditor({ title: "Мочевой пузырь: дополнительно", mode: "text", value: bladder.additional, placeholder: "Введите дополнительное описание", multiline: true, onSave: (v) => onUpdateBladderField("additional", v) })));
    }

    return fields;
  }, [bladder, fv, showResidualBlock, showContentsText, openLandscapeNumpad, openEditor, onUpdateBladderField]);

  return (
    <View style={styles.kidneyPlainSection}>
      <ProtocolOrganHeader title="Мочевой пузырь" />

      {isLandscape ? (
        <View ref={landscapeRef} style={{ gap: 8, position: "relative" }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {landscapeFields}
          </View>

          {/* InlineNumpad */}
          {numpad.activeNumpadField != null && numpad.numpadPosition && (() => {
            const activeFieldKey = numpad.activeNumpadField as keyof UrinaryBladderDraft;
            const currentValue = typeof bladder[activeFieldKey] === "string" ? bladder[activeFieldKey] as string : "";
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
                  value={currentValue}
                  onValueChange={(nextValue) => handleNumpadChange(activeFieldKey, nextValue)}
                  onClose={numpad.closeNumpad}
                />
              </View>
            );
          })()}
        </View>
      ) : (
        <View style={styles.obpFieldList}>
          {(fv["omt_male.bladderLength"] !== false || fv["omt_male.bladderWidth"] !== false || fv["omt_male.bladderDepth"] !== false || fv["omt_male.bladderVolume"] !== false || fv["omt_male.bladderWallThickness"] !== false) && (
            <>
              <ProtocolSectionHeader title="Размеры" />
              {["length", "width", "depth"].map((key) => {
                const labels: Record<string, string> = { length: "Длина", width: "Ширина", depth: "Передне-задний" };
                const fvKey = `omt_male.bladder${key.charAt(0).toUpperCase() + key.slice(1)}`;
                if (fv[fvKey] === false) return null;
                return (
                  <ProtocolFieldRow
                    key={key}
                    label={labels[key]} value={(bladder as any)[key] || "Нажмите для ввода"}
                    typeLabel="numpad" filled={Boolean((bladder as any)[key])}
                    onPress={() => openEditor({ title: `Мочевой пузырь: ${labels[key]}`, mode: "number", value: (bladder as any)[key], placeholder: "мм", onSave: (v) => onUpdateBladderField(key as keyof UrinaryBladderDraft, v) })}
                  />
                );
              })}
              {fv["omt_male.bladderVolume"] !== false && (
                <ProtocolFieldRow label="Объем" value={bladder.volume || "Рассчитывается автоматически"}
                  typeLabel="auto" filled={Boolean(bladder.volume)} readonly
                />
              )}
              {fv["omt_male.bladderWallThickness"] !== false && (
                <ProtocolFieldRow label="Толщина стенки" value={bladder.wallThickness || "Нажмите для ввода"}
                  typeLabel="numpad" filled={Boolean(bladder.wallThickness)}
                  onPress={() => openEditor({ title: "Мочевой пузырь: толщина стенки", mode: "number", value: bladder.wallThickness, placeholder: "мм", onSave: (v) => onUpdateBladderField("wallThickness", v) })}
                />
              )}
            </>
          )}

          {(fv["omt_male.bladderResidualStatus"] !== false || fv["omt_male.bladderResidualLength"] !== false || fv["omt_male.bladderResidualWidth"] !== false || fv["omt_male.bladderResidualDepth"] !== false || fv["omt_male.bladderResidualVolume"] !== false) && (
            <>
              <ProtocolSectionHeader title="Объем остаточной мочи" />
              {fv["omt_male.bladderResidualStatus"] !== false && (
                <ProtocolFieldRow label="Определение" value={bladder.residualStatus || "Нажмите для ввода"}
                  typeLabel="select" filled={Boolean(bladder.residualStatus)} options={BLADDER_RESIDUAL_OPTIONS}
                  onSelectOption={(v) => onUpdateBladderField("residualStatus", v)}
                />
              )}
              {showResidualBlock && (
                <>
                  {(["residualLength", "residualWidth", "residualDepth"] as const).map((key, i) => {
                    const labels = ["Длина", "Ширина", "Передне-задний"];
                    const fvKey = `omt_male.bladder${key.charAt(0).toUpperCase() + key.slice(1)}`;
                    if (fv[fvKey] === false) return null;
                    return (
                      <ProtocolFieldRow key={key} label={labels[i]} value={bladder[key] || "Нажмите для ввода"}
                        typeLabel="numpad" filled={Boolean(bladder[key])}
                        onPress={() => openEditor({ title: `Остаточная моча: ${labels[i]}`, mode: "number", value: bladder[key], placeholder: "мм", onSave: (v) => onUpdateBladderField(key, v) })}
                      />
                    );
                  })}
                  {fv["omt_male.bladderResidualVolume"] !== false && (
                    <ProtocolFieldRow label="Объем остаточной мочи" value={bladder.residualVolume || "Рассчитывается автоматически"}
                      typeLabel="auto" filled={Boolean(bladder.residualVolume)} readonly
                    />
                  )}
                </>
              )}
            </>
          )}

          {(fv["omt_male.bladderContents"] !== false || fv["omt_male.bladderContentsText"] !== false) && (
            <>
              <ProtocolSectionHeader title="Содержимое" />
              {fv["omt_male.bladderContents"] !== false && (
                <ProtocolFieldRow label="Характер содержимого" value={bladder.contents || "Нажмите для ввода"}
                  typeLabel="select" filled={Boolean(bladder.contents)} options={BLADDER_CONTENT_OPTIONS}
                  onSelectOption={(v) => onUpdateBladderField("contents", v)}
                />
              )}
              {showContentsText && fv["omt_male.bladderContentsText"] !== false && (
                <ProtocolFieldRow label="Описание содержимого" value={bladder.contentsText || "Нажмите для ввода"}
                  typeLabel="text" filled={Boolean(bladder.contentsText)}
                  onPress={() => openEditor({ title: "Описание содержимого", mode: "text", value: bladder.contentsText, placeholder: "Введите описание", multiline: true, onSave: (v) => onUpdateBladderField("contentsText", v) })}
                />
              )}
            </>
          )}

          {fv["omt_male.bladderAdditional"] !== false && (
            <>
              <ProtocolSectionHeader title="Дополнительно" />
              <ProtocolFieldRow label="Дополнительно" value={bladder.additional || "Нажмите для ввода"}
                typeLabel="text" filled={Boolean(bladder.additional)}
                onPress={() => openEditor({ title: "Мочевой пузырь: дополнительно", mode: "text", value: bladder.additional, placeholder: "Введите дополнительное описание", multiline: true, onSave: (v) => onUpdateBladderField("additional", v) })}
              />
            </>
          )}
        </View>
      )}
    </View>
  );
}