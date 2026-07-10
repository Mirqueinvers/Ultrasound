import type { LayoutChangeEvent } from "react-native";
import { View } from "react-native";

import { ProtocolCard } from "../../components/protocol/ProtocolCard";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import type { UterusNodeDraft } from "../../shared/omtFemaleDraft";
import type { AppStyles } from "../../styles/appStyles";
import { type EditorState } from "./omtFemaleFieldConfigs";

type NumpadApi = {
  isLandscape: boolean;
  fieldRefs: React.MutableRefObject<Record<string, View | null>>;
  openNumpad: (fieldKey: string, fieldView: View | null, initialValue?: string, onChange?: (value: string) => void) => void;
  handleFieldLayout: (fieldKey: string, event: LayoutChangeEvent) => void;
};

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

const CAVITY_OPTIONS = [
  { value: "не деформирует", label: "не деформирует" },
  { value: "деформирует", label: "деформирует" },
];

const BLOOD_FLOW_OPTIONS = [
  { value: "не изменен", label: "не изменен" },
  { value: "усилен", label: "усилен" },
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
      <View style={styles.obpFieldList}>
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

        <ProtocolFieldRow label="Локализация по стенке" value={node.wallLocation || "Нажмите для ввода"}
          typeLabel="select" filled={Boolean(node.wallLocation)} options={WALL_OPTIONS}
          onSelectOption={(v) => onUpdateNode(index, "wallLocation", v)} />
        <ProtocolFieldRow label="Слой залегания" value={node.layerType || "Нажмите для ввода"}
          typeLabel="select" filled={Boolean(node.layerType)} options={LAYER_OPTIONS}
          onSelectOption={(v) => onUpdateNode(index, "layerType", v)} />
        <ProtocolFieldRow label="Четкость контура" value={node.contourClarity || "Нажмите для ввода"}
          typeLabel="select" filled={Boolean(node.contourClarity)} options={CLARITY_OPTIONS}
          onSelectOption={(v) => onUpdateNode(index, "contourClarity", v)} />
        <ProtocolFieldRow label="Ровность контура" value={node.contourEvenness || "Нажмите для ввода"}
          typeLabel="select" filled={Boolean(node.contourEvenness)} options={EVENNESS_OPTIONS}
          onSelectOption={(v) => onUpdateNode(index, "contourEvenness", v)} />
        <ProtocolFieldRow label="Эхогенность" value={node.echogenicity || "Нажмите для ввода"}
          typeLabel="select" filled={Boolean(node.echogenicity)} options={ECHOGENICITY_OPTIONS}
          onSelectOption={(v) => onUpdateNode(index, "echogenicity", v)} />
        <ProtocolFieldRow label="Структура" value={node.structure || "Нажмите для ввода"}
          typeLabel="select" filled={Boolean(node.structure)} options={[{ value: "однородная", label: "однородная" }, { value: "неоднородная", label: "неоднородная" }]}
          onSelectOption={(v) => onUpdateNode(index, "structure", v)} />
        <ProtocolFieldRow label="Деформация полости" value={node.cavityImpact || "Нажмите для ввода"}
          typeLabel="select" filled={Boolean(node.cavityImpact)} options={CAVITY_OPTIONS}
          onSelectOption={(v) => onUpdateNode(index, "cavityImpact", v)} />
        <ProtocolFieldRow label="Кровоток" value={node.bloodFlow || "Нажмите для ввода"}
          typeLabel="select" filled={Boolean(node.bloodFlow)} options={BLOOD_FLOW_OPTIONS}
          onSelectOption={(v) => onUpdateNode(index, "bloodFlow", v)} />
        <ProtocolFieldRow label="Комментарий" value={node.comment || "Нажмите для ввода"}
          typeLabel="text" filled={Boolean(node.comment)}
          onPress={() => openEditor({ title: `Узел #${index + 1}: комментарий`, mode: "text", value: node.comment, placeholder: "Введите комментарий", multiline: true, onSave: (v) => onUpdateNode(index, "comment", v) })} />
      </View>
    </ProtocolCard>
  );
}