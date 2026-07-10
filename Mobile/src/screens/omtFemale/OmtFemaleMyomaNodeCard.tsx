import type { LayoutChangeEvent } from "react-native";
import { View } from "react-native";

import { ProtocolCard } from "../../components/protocol/ProtocolCard";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import type { UterusNodeDraft } from "../../shared/omtFemaleDraft";
import type { AppStyles } from "../../styles/appStyles";
import { type EditorState } from "./omtFemaleFieldConfigs";

import type { NumpadApi } from "../../components/InlineNumpad";

type OmtFemaleMyomaNodeCardProps = {
  styles: AppStyles;
  node: UterusNodeDraft;
  index: number;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateNode: (index: number, field: keyof UterusNodeDraft, value: string) => void;
  onRemoveNode: (index: number) => void;
  numpadApi: NumpadApi;
};

const WALL_OPTIONS = [
  { value: "передняя", label: "передняя" },
  { value: "задняя", label: "задняя" },
  { value: "дно", label: "дно" },
  { value: "шеечная локализация", label: "шеечная локализация" },
];

const LAYER_OPTIONS = [
  { value: "субсерозный", label: "субсерозный" },
  { value: "интрамуральный", label: "интрамуральный" },
  { value: "субмукозный", label: "субмукозный" },
];

const CLARITY_OPTIONS = [
  { value: "чёткий", label: "чёткий" },
  { value: "нечёткий", label: "нечёткий" },
];

const EVENNESS_OPTIONS = [
  { value: "ровный", label: "ровный" },
  { value: "неровный", label: "неровный" },
];

const ECHOGENICITY_OPTIONS = [
  { value: "средняя", label: "средняя" },
  { value: "повышенная", label: "повышенная" },
  { value: "пониженная", label: "пониженная" },
];

const STRUCTURE_OPTIONS = [
  { value: "однородная", label: "однородная" },
  { value: "неоднородная", label: "неоднородная" },
];

const CAVITY_OPTIONS = [
  { value: "не деформирует", label: "не деформирует" },
  { value: "деформирует", label: "деформирует" },
];

const BLOOD_FLOW_OPTIONS = [
  { value: "не изменен", label: "не изменен" },
  { value: "усилен", label: "усилен" },
];

// Поля-селекты, которые нужно отобразить в 2 колонки
const SELECT_FIELDS: Array<{ key: keyof UterusNodeDraft; label: string; options: { value: string; label: string }[] }> = [
  { key: "wallLocation", label: "Локализация по стенке", options: WALL_OPTIONS },
  { key: "layerType", label: "Слой залегания", options: LAYER_OPTIONS },
  { key: "contourClarity", label: "Четкость контура", options: CLARITY_OPTIONS },
  { key: "contourEvenness", label: "Ровность контура", options: EVENNESS_OPTIONS },
  { key: "echogenicity", label: "Эхогенность", options: ECHOGENICITY_OPTIONS },
  { key: "structure", label: "Структура", options: STRUCTURE_OPTIONS },
  { key: "cavityImpact", label: "Деформация полости", options: CAVITY_OPTIONS },
  { key: "bloodFlow", label: "Кровоток", options: BLOOD_FLOW_OPTIONS },
];

export function OmtFemaleMyomaNodeCard({
  styles, node, index, openEditor, onUpdateNode, onRemoveNode, numpadApi,
}: OmtFemaleMyomaNodeCardProps) {
  const isLandscape = numpadApi.isLandscape;

  const handleSizePress = (fieldKey: "size1" | "size2") => {
    if (!isLandscape) {
      const label = fieldKey === "size1" ? "Размер 1" : "Размер 2";
      openEditor({ title: `Узел #${index + 1}: ${label}`, mode: "number", value: node[fieldKey], placeholder: "мм", onSave: (v) => onUpdateNode(index, fieldKey, v) });
      return;
    }
    return () => {
      const fieldView = numpadApi.fieldRefs.current[`myoma-${index}-${fieldKey}`] ?? null;
      numpadApi.openNumpad(
        `myoma-${index}-${fieldKey}`,
        fieldView,
        node[fieldKey],
        (nextValue) => onUpdateNode(index, fieldKey, nextValue),
      );
    };
  };

  return (
    <ProtocolCard title={`Миоматозный узел #${index + 1}`}
      actionLabel="Удалить" actionVariant="danger" onActionPress={() => onRemoveNode(index)} variant="item">
      <View style={{ gap: 8 }}>
        {/* Размеры — 2 колонки */}
        <View style={styles.dualRow}>
          <View style={styles.dualCol}>
            <View
              ref={(el) => { if (isLandscape) numpadApi.fieldRefs.current[`myoma-${index}-size1`] = el; }}
              onLayout={isLandscape ? (e) => numpadApi.handleFieldLayout(`myoma-${index}-size1`, e) : undefined}
            >
              <ProtocolFieldRow label="Размер 1 (мм)" value={node.size1 || "Нажмите для ввода"}
                typeLabel="numpad" filled={Boolean(node.size1)}
                onPress={isLandscape ? handleSizePress("size1") : () => openEditor({ title: `Узел #${index + 1}: размер 1`, mode: "number", value: node.size1, placeholder: "мм", onSave: (v) => onUpdateNode(index, "size1", v) })} />
            </View>
          </View>
          <View style={styles.dualCol}>
            <View
              ref={(el) => { if (isLandscape) numpadApi.fieldRefs.current[`myoma-${index}-size2`] = el; }}
              onLayout={isLandscape ? (e) => numpadApi.handleFieldLayout(`myoma-${index}-size2`, e) : undefined}
            >
              <ProtocolFieldRow label="Размер 2 (мм)" value={node.size2 || "Нажмите для ввода"}
                typeLabel="numpad" filled={Boolean(node.size2)}
                onPress={isLandscape ? handleSizePress("size2") : () => openEditor({ title: `Узел #${index + 1}: размер 2`, mode: "number", value: node.size2, placeholder: "мм", onSave: (v) => onUpdateNode(index, "size2", v) })} />
            </View>
          </View>
        </View>

        {/* Селекты — 2 колонки */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {SELECT_FIELDS.map((field) => (
            <View key={field.key} style={{ width: "48%" }}>
              <ProtocolFieldRow
                label={field.label}
                value={(node[field.key] as string) || "Нажмите для ввода"}
                typeLabel="select"
                filled={Boolean(node[field.key])}
                options={field.options}
                onSelectOption={(v) => onUpdateNode(index, field.key, v)}
              />
            </View>
          ))}
        </View>

        {/* Комментарий — на всю ширину */}
        <ProtocolFieldRow label="Комментарий" value={node.comment || "Нажмите для ввода"}
          typeLabel="text" filled={Boolean(node.comment)}
          onPress={() => openEditor({ title: `Узел #${index + 1}: комментарий`, mode: "text", value: node.comment, placeholder: "Введите комментарий", multiline: true, onSave: (v) => onUpdateNode(index, "comment", v) })} />
      </View>
    </ProtocolCard>
  );
}