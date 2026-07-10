import { useCallback, useRef } from "react";
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

  const renderCompactRow = (
    fieldKey: keyof UrinaryBladderDraft,
    label: string,
    value: string,
    filled: boolean,
    readonly?: boolean,
  ) => (
    <View
      key={fieldKey}
      ref={(el) => { fieldRefs.current[fieldKey] = el; }}
      onLayout={(event) => numpad.handleFieldLayout(fieldKey, event)}
      style={{ width: "48.5%" }}
    >
      <ProtocolFieldRow
        label={label}
        value={value || "Нажмите для ввода"}
        typeLabel={readonly ? "auto" : "numpad"}
        filled={filled}
        readonly={readonly}
        compact={isLandscape}
        onPress={readonly ? undefined : () => openLandscapeNumpad(fieldKey)}
      />
    </View>
  );

  return (
    <View style={styles.kidneyPlainSection}>
      <ProtocolOrganHeader title="Мочевой пузырь" />

      {isLandscape ? (
        <View ref={landscapeRef} style={{ gap: 8, position: "relative" }}>
          {/* Размеры */}
          {(fv["omt_male.bladderLength"] !== false || fv["omt_male.bladderWidth"] !== false || fv["omt_male.bladderDepth"] !== false || fv["omt_male.bladderVolume"] !== false || fv["omt_male.bladderWallThickness"] !== false) && (
            <>
              <ProtocolSectionHeader title="Размеры" />
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {fv["omt_male.bladderLength"] !== false && renderCompactRow("length", "Длина", bladder.length, Boolean(bladder.length))}
                {fv["omt_male.bladderWidth"] !== false && renderCompactRow("width", "Ширина", bladder.width, Boolean(bladder.width))}
                {fv["omt_male.bladderDepth"] !== false && renderCompactRow("depth", "Передне-задний", bladder.depth, Boolean(bladder.depth))}
                {fv["omt_male.bladderVolume"] !== false && (
                  <View style={{ width: "48.5%" }}>
                    <ProtocolFieldRow label="Объем" value={bladder.volume || "Рассчитывается автоматически"}
                      typeLabel="auto" filled={Boolean(bladder.volume)} readonly compact={isLandscape}
                    />
                  </View>
                )}
                {fv["omt_male.bladderWallThickness"] !== false && renderCompactRow("wallThickness", "Толщина стенки", bladder.wallThickness, Boolean(bladder.wallThickness))}
              </View>
            </>
          )}

          {/* Объем остаточной мочи */}
          {(fv["omt_male.bladderResidualStatus"] !== false || fv["omt_male.bladderResidualLength"] !== false || fv["omt_male.bladderResidualWidth"] !== false || fv["omt_male.bladderResidualDepth"] !== false || fv["omt_male.bladderResidualVolume"] !== false) && (
            <>
              <ProtocolSectionHeader title="Объем остаточной мочи" />
              {fv["omt_male.bladderResidualStatus"] !== false && (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                  <View style={{ width: "48.5%" }}>
                    <ProtocolFieldRow label="Определение" value={bladder.residualStatus || "Нажмите для ввода"}
                      typeLabel="select" filled={Boolean(bladder.residualStatus)} compact={isLandscape} options={BLADDER_RESIDUAL_OPTIONS}
                      onSelectOption={(v) => onUpdateBladderField("residualStatus", v)}
                    />
                  </View>
                </View>
              )}
              {showResidualBlock && (
                <>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                    {fv["omt_male.bladderResidualLength"] !== false && renderCompactRow("residualLength", "Длина", bladder.residualLength, Boolean(bladder.residualLength))}
                    {fv["omt_male.bladderResidualWidth"] !== false && renderCompactRow("residualWidth", "Ширина", bladder.residualWidth, Boolean(bladder.residualWidth))}
                    {fv["omt_male.bladderResidualDepth"] !== false && renderCompactRow("residualDepth", "Передне-задний", bladder.residualDepth, Boolean(bladder.residualDepth))}
                    {fv["omt_male.bladderResidualVolume"] !== false && (
                      <View style={{ width: "48.5%" }}>
                        <ProtocolFieldRow label="Объем остаточной мочи" value={bladder.residualVolume || "Рассчитывается автоматически"}
                          typeLabel="auto" filled={Boolean(bladder.residualVolume)} readonly compact={isLandscape}
                        />
                      </View>
                    )}
                  </View>
                </>
              )}
            </>
          )}

          {/* Содержимое */}
          {(fv["omt_male.bladderContents"] !== false || fv["omt_male.bladderContentsText"] !== false) && (
            <>
              <ProtocolSectionHeader title="Содержимое" />
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {fv["omt_male.bladderContents"] !== false && (
                  <View style={{ width: "48.5%" }}>
                    <ProtocolFieldRow label="Характер содержимого" value={bladder.contents || "Нажмите для ввода"}
                      typeLabel="select" filled={Boolean(bladder.contents)} compact={isLandscape} options={BLADDER_CONTENT_OPTIONS}
                      onSelectOption={(v) => onUpdateBladderField("contents", v)}
                    />
                  </View>
                )}
                {showContentsText && fv["omt_male.bladderContentsText"] !== false && (
                  <View style={{ width: "48.5%" }}>
                    <ProtocolFieldRow label="Описание содержимого" value={bladder.contentsText || "Нажмите для ввода"}
                      typeLabel="text" filled={Boolean(bladder.contentsText)} compact={isLandscape}
                      onPress={() => openEditor({ title: "Описание содержимого", mode: "text", value: bladder.contentsText, placeholder: "Введите описание", multiline: true, onSave: (v) => onUpdateBladderField("contentsText", v) })}
                    />
                  </View>
                )}
              </View>
            </>
          )}

          {/* Дополнительно */}
          {fv["omt_male.bladderAdditional"] !== false && (
            <>
              <ProtocolSectionHeader title="Дополнительно" />
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                <View style={{ width: "48.5%" }}>
                  <ProtocolFieldRow label="Дополнительно" value={bladder.additional || "Нажмите для ввода"}
                    typeLabel="text" filled={Boolean(bladder.additional)} compact={isLandscape}
                    onPress={() => openEditor({ title: "Мочевой пузырь: дополнительно", mode: "text", value: bladder.additional, placeholder: "Введите дополнительное описание", multiline: true, onSave: (v) => onUpdateBladderField("additional", v) })}
                  />
                </View>
              </View>
            </>
          )}

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