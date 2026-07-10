import { useCallback } from "react";
import type { LayoutChangeEvent } from "react-native";
import { View } from "react-native";

import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { ProtocolOrganHeader, ProtocolSectionHeader } from "../../components/protocol/ProtocolHeaders";
import type { UrinaryBladderDraft } from "../../shared/omtFemaleDraft";
import { isNormalizedMatch } from "../../shared/normalizeSelectValue";
import type { AppStyles } from "../../styles/appStyles";
import {
  BLADDER_CONTENT_OPTIONS,
  BLADDER_RESIDUAL_OPTIONS,
  type EditorState,
} from "./omtFemaleFieldConfigs";

type NumpadApi = {
  isLandscape: boolean;
  fieldRefs: React.MutableRefObject<Record<string, View | null>>;
  openNumpad: (fieldKey: string, fieldView: View | null, initialValue?: string, onChange?: (value: string) => void) => void;
  handleFieldLayout: (fieldKey: string, event: LayoutChangeEvent) => void;
};

type OmtFemaleBladderPanelProps = {
  styles: AppStyles;
  bladder: UrinaryBladderDraft;
  fv: Record<string, boolean>;
  isVisible: boolean;
  isLandscape?: boolean;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateBladderField: (field: keyof UrinaryBladderDraft, value: string) => void;
  numpadApi: NumpadApi;
};

const NUMBER_FIELDS = new Set(["length", "width", "depth", "wallThickness", "residualLength", "residualWidth", "residualDepth"]);

export function OmtFemaleBladderPanel({
  styles, bladder, fv, isVisible, isLandscape, openEditor, onUpdateBladderField, numpadApi,
}: OmtFemaleBladderPanelProps) {
  if (!isVisible) return null;

  const showResidual = isNormalizedMatch(bladder.residualStatus, "определяется");
  const showContentsText = isNormalizedMatch(bladder.contents, "неоднородное");

  const getNumberFieldPress = useCallback(
    (fieldKey: string, label: string) => {
      if (!isLandscape) return undefined;
      return () => {
        const fieldView = numpadApi.fieldRefs.current[`bladder-${fieldKey}`] ?? null;
        const value = bladder[fieldKey as keyof UrinaryBladderDraft] as string;
        numpadApi.openNumpad(
          `bladder-${fieldKey}`,
          fieldView,
          value,
          (nextValue) => onUpdateBladderField(fieldKey as keyof UrinaryBladderDraft, nextValue),
        );
      };
    },
    [isLandscape, numpadApi, bladder, onUpdateBladderField],
  );

  const getNumberFieldLayout = useCallback(
    (fieldKey: string) => {
      if (!isLandscape) return undefined;
      return (event: LayoutChangeEvent) => numpadApi.handleFieldLayout(`bladder-${fieldKey}`, event);
    },
    [isLandscape, numpadApi],
  );

  const renderNumberField = (label: string, fieldKey: string, value: string, filled: boolean) => {
    if (isLandscape) {
      return (
        <View
          key={fieldKey}
          ref={(el) => { numpadApi.fieldRefs.current[`bladder-${fieldKey}`] = el; }}
          onLayout={getNumberFieldLayout(fieldKey)}
          style={{ width: "48.5%" }}
        >
          <ProtocolFieldRow
            label={label}
            value={value || "Нажмите для ввода"}
            typeLabel="numpad"
            filled={filled}
            compact={true}
            onPress={getNumberFieldPress(fieldKey, label)}
          />
        </View>
      );
    }
    return (
      <ProtocolFieldRow key={fieldKey} label={label} value={value || "Нажмите для ввода"}
        typeLabel="numpad" filled={filled}
        onPress={() => openEditor({ title: label, mode: "number", value, placeholder: "мм", onSave: (v) => onUpdateBladderField(fieldKey as keyof UrinaryBladderDraft, v) })} />
    );
  };

  return (
    <View style={styles.kidneyPlainSection}>
      <ProtocolOrganHeader title="Мочевой пузырь" />
      <View style={isLandscape ? undefined : styles.obpFieldList}>
        {(fv["omt_female.bladderLength"] !== false || fv["omt_female.bladderWidth"] !== false || fv["omt_female.bladderDepth"] !== false || fv["omt_female.bladderVolume"] !== false || fv["omt_female.bladderWallThickness"] !== false) && (
          <>
            <ProtocolSectionHeader title="Размеры" />
            <View style={isLandscape ? { flexDirection: "row", flexWrap: "wrap", gap: 6 } : undefined}>
              {(["length", "width", "depth"] as const).map((key) => {
                const labels: Record<string, string> = { length: "Длина", width: "Ширина", depth: "Передне-задний" };
                const fvKey = `omt_female.bladder${key.charAt(0).toUpperCase() + key.slice(1)}`;
                if (fv[fvKey] === false) return null;
                const val = bladder[key] || "";
                return renderNumberField(labels[key], key, val, Boolean(val));
              })}
              {fv["omt_female.bladderVolume"] !== false && (
                <ProtocolFieldRow label="Объем" value={bladder.volume || "Рассчитывается автоматически"} typeLabel="auto" filled={Boolean(bladder.volume)} readonly compact={isLandscape} />
              )}
              {fv["omt_female.bladderWallThickness"] !== false && renderNumberField("Толщина стенки", "wallThickness", bladder.wallThickness || "", Boolean(bladder.wallThickness))}
            </View>
          </>
        )}

        {(fv["omt_female.bladderResidualStatus"] !== false || fv["omt_female.bladderResidualLength"] !== false || fv["omt_female.bladderResidualWidth"] !== false || fv["omt_female.bladderResidualDepth"] !== false || fv["omt_female.bladderResidualVolume"] !== false) && (
          <>
            <ProtocolSectionHeader title="Объем остаточной мочи" />
            <View style={isLandscape ? { flexDirection: "row", flexWrap: "wrap", gap: 6 } : undefined}>
              {fv["omt_female.bladderResidualStatus"] !== false && (
                <ProtocolFieldRow label="Определение" value={bladder.residualStatus || "Нажмите для ввода"} typeLabel="select" filled={Boolean(bladder.residualStatus)} compact={isLandscape} options={BLADDER_RESIDUAL_OPTIONS}
                  onSelectOption={(v) => onUpdateBladderField("residualStatus", v)} />
              )}
              {showResidual && (
                <>
                  {(["residualLength", "residualWidth", "residualDepth"] as const).map((key, i) => {
                    const labels = ["Длина", "Ширина", "Передне-задний"];
                    const fvKey = `omt_female.bladder${key.charAt(0).toUpperCase() + key.slice(1)}`;
                    if (fv[fvKey] === false) return null;
                    const val = bladder[key] || "";
                    return renderNumberField(labels[i], key, val, Boolean(val));
                  })}
                  {fv["omt_female.bladderResidualVolume"] !== false && (
                    <ProtocolFieldRow label="Объем остаточной мочи" value={bladder.residualVolume || "Рассчитывается автоматически"} typeLabel="auto" filled={Boolean(bladder.residualVolume)} readonly compact={isLandscape} />
                  )}
                </>
              )}
            </View>
          </>
        )}

        {(fv["omt_female.bladderContents"] !== false || fv["omt_female.bladderContentsText"] !== false) && (
          <>
            <ProtocolSectionHeader title="Содержимое" />
            {fv["omt_female.bladderContents"] !== false && (
              <ProtocolFieldRow label="Характер содержимого" value={bladder.contents || "Нажмите для ввода"} typeLabel="select" filled={Boolean(bladder.contents)} compact={isLandscape} options={BLADDER_CONTENT_OPTIONS}
                onSelectOption={(v) => onUpdateBladderField("contents", v)} />
            )}
            {showContentsText && fv["omt_female.bladderContentsText"] !== false && (
              <ProtocolFieldRow label="Описание содержимого" value={bladder.contentsText || "Нажмите для ввода"} typeLabel="text" filled={Boolean(bladder.contentsText)} compact={isLandscape}
                onPress={() => openEditor({ title: "Описание содержимого", mode: "text", value: bladder.contentsText, placeholder: "Введите описание", multiline: true, onSave: (v) => onUpdateBladderField("contentsText", v) })} />
            )}
          </>
        )}

        {fv["omt_female.bladderAdditional"] !== false && (
          <>
            <ProtocolSectionHeader title="Дополнительно" />
            <ProtocolFieldRow label="Дополнительно" value={bladder.additional || "Нажмите для ввода"} typeLabel="text" filled={Boolean(bladder.additional)} compact={isLandscape}
              onPress={() => openEditor({ title: "Мочевой пузырь: дополнительно", mode: "text", value: bladder.additional, placeholder: "Введите дополнительное описание", multiline: true, onSave: (v) => onUpdateBladderField("additional", v) })} />
          </>
        )}
      </View>
    </View>
  );
}