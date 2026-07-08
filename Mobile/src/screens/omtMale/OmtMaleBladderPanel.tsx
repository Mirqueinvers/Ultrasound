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
} from "./omtMaleFieldConfigs";

type OmtMaleBladderPanelProps = {
  styles: AppStyles;
  bladder: UrinaryBladderDraft;
  fv: Record<string, boolean>;
  isVisible: boolean;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateBladderField: (field: keyof UrinaryBladderDraft, value: string) => void;
};

export function OmtMaleBladderPanel({
  styles,
  bladder,
  fv,
  isVisible,
  openEditor,
  onUpdateBladderField,
}: OmtMaleBladderPanelProps) {
  if (!isVisible) return null;

  const showResidualBlock = isNormalizedMatch(bladder.residualStatus, "определяется");
  const showContentsText = isNormalizedMatch(bladder.contents, "неоднородное");

  return (
    <View style={styles.kidneyPlainSection}>
      <ProtocolOrganHeader title="Мочевой пузырь" />
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
    </View>
  );
}
