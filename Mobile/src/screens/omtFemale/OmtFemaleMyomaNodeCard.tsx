import { View } from "react-native";

import { ProtocolCard } from "../../components/protocol/ProtocolCard";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import type { UterusNodeDraft } from "../../shared/omtFemaleDraft";
import type { AppStyles } from "../../styles/appStyles";
import { type EditorState } from "./omtFemaleFieldConfigs";

type OmtFemaleMyomaNodeCardProps = {
  styles: AppStyles;
  node: UterusNodeDraft;
  index: number;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateNode: (index: number, field: keyof UterusNodeDraft, value: string) => void;
  onRemoveNode: (index: number) => void;
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
  styles, node, index, openEditor, onUpdateNode, onRemoveNode,
}: OmtFemaleMyomaNodeCardProps) {
  return (
    <ProtocolCard title={`Миоматозный узел #${index + 1}`}
      actionLabel="Удалить" actionVariant="danger" onActionPress={() => onRemoveNode(index)} variant="item">
      <View style={styles.obpFieldList}>
        <View style={styles.dualRow}>
          <View style={styles.dualCol}>
            <ProtocolFieldRow label="Размер 1 (мм)" value={node.size1 || "Нажмите для ввода"}
              typeLabel="numpad" filled={Boolean(node.size1)}
              onPress={() => openEditor({ title: `Узел #${index + 1}: размер 1`, mode: "number", value: node.size1, placeholder: "мм", onSave: (v) => onUpdateNode(index, "size1", v) })} />
          </View>
          <View style={styles.dualCol}>
            <ProtocolFieldRow label="Размер 2 (мм)" value={node.size2 || "Нажмите для ввода"}
              typeLabel="numpad" filled={Boolean(node.size2)}
              onPress={() => openEditor({ title: `Узел #${index + 1}: размер 2`, mode: "number", value: node.size2, placeholder: "мм", onSave: (v) => onUpdateNode(index, "size2", v) })} />
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
