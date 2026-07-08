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
  isVisible: boolean;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateBladderField: (field: keyof UrinaryBladderDraft, value: string) => void;
};

export function OmtMaleBladderPanel({
  styles,
  bladder,
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
        <ProtocolSectionHeader title="Размеры" />
        {["length", "width", "depth"].map((key) => {
          const labels: Record<string, string> = { length: "Длина", width: "Ширина", depth: "Передне-задний" };
          return (
            <ProtocolFieldRow
              key={key}
              label={labels[key]} value={(bladder as any)[key] || "Нажмите для ввода"}
              typeLabel="numpad" filled={Boolean((bladder as any)[key])}
              onPress={() => openEditor({ title: `Мочевой пузырь: ${labels[key]}`, mode: "number", value: (bladder as any)[key], placeholder: "мм", onSave: (v) => onUpdateBladderField(key as keyof UrinaryBladderDraft, v) })}
            />
          );
        })}
        <ProtocolFieldRow label="Объем" value={bladder.volume || "Рассчитывается автоматически"}
          typeLabel="auto" filled={Boolean(bladder.volume)} readonly
        />
        <ProtocolFieldRow label="Толщина стенки" value={bladder.wallThickness || "Нажмите для ввода"}
          typeLabel="numpad" filled={Boolean(bladder.wallThickness)}
          onPress={() => openEditor({ title: "Мочевой пузырь: толщина стенки", mode: "number", value: bladder.wallThickness, placeholder: "мм", onSave: (v) => onUpdateBladderField("wallThickness", v) })}
        />

        <ProtocolSectionHeader title="Объем остаточной мочи" />
        <ProtocolFieldRow label="Определение" value={bladder.residualStatus || "Нажмите для ввода"}
          typeLabel="select" filled={Boolean(bladder.residualStatus)} options={BLADDER_RESIDUAL_OPTIONS}
          onSelectOption={(v) => onUpdateBladderField("residualStatus", v)}
        />
        {showResidualBlock && (
          <>
            {(["residualLength", "residualWidth", "residualDepth"] as const).map((key, i) => {
              const labels = ["Длина", "Ширина", "Передне-задний"];
              return (
                <ProtocolFieldRow key={key} label={labels[i]} value={bladder[key] || "Нажмите для ввода"}
                  typeLabel="numpad" filled={Boolean(bladder[key])}
                  onPress={() => openEditor({ title: `Остаточная моча: ${labels[i]}`, mode: "number", value: bladder[key], placeholder: "мм", onSave: (v) => onUpdateBladderField(key, v) })}
                />
              );
            })}
            <ProtocolFieldRow label="Объем остаточной мочи" value={bladder.residualVolume || "Рассчитывается автоматически"}
              typeLabel="auto" filled={Boolean(bladder.residualVolume)} readonly
            />
          </>
        )}

        <ProtocolSectionHeader title="Содержимое" />
        <ProtocolFieldRow label="Характер содержимого" value={bladder.contents || "Нажмите для ввода"}
          typeLabel="select" filled={Boolean(bladder.contents)} options={BLADDER_CONTENT_OPTIONS}
          onSelectOption={(v) => onUpdateBladderField("contents", v)}
        />
        {showContentsText && (
          <ProtocolFieldRow label="Описание содержимого" value={bladder.contentsText || "Нажмите для ввода"}
            typeLabel="text" filled={Boolean(bladder.contentsText)}
            onPress={() => openEditor({ title: "Описание содержимого", mode: "text", value: bladder.contentsText, placeholder: "Введите описание", multiline: true, onSave: (v) => onUpdateBladderField("contentsText", v) })}
          />
        )}

        <ProtocolSectionHeader title="Дополнительно" />
        <ProtocolFieldRow label="Дополнительно" value={bladder.additional || "Нажмите для ввода"}
          typeLabel="text" filled={Boolean(bladder.additional)}
          onPress={() => openEditor({ title: "Мочевой пузырь: дополнительно", mode: "text", value: bladder.additional, placeholder: "Введите дополнительное описание", multiline: true, onSave: (v) => onUpdateBladderField("additional", v) })}
        />
      </View>
    </View>
  );
}
