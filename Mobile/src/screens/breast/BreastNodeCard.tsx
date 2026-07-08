import { Text, View } from "react-native";

import { ProtocolCard } from "../../components/protocol/ProtocolCard";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import type { BreastNodeDraft } from "../../shared/breastDraft";
import type { AppStyles } from "../../styles/appStyles";
import {
  BREAST_NODE_BLOOD_FLOW_OPTIONS,
  BREAST_NODE_CONTOUR_OPTIONS,
  BREAST_NODE_ECHOGENICITY_OPTIONS,
  BREAST_NODE_ECHOSTRUCTURE_OPTIONS,
  BREAST_NODE_ORIENTATION_OPTIONS,
  type EditorState,
} from "./breastFieldConfigs";

type BreastNodeCardProps = {
  styles: AppStyles;
  node: BreastNodeDraft;
  index: number;
  side: "right" | "left";
  isLandscape?: boolean;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateNodeField: (side: "right" | "left", index: number, field: keyof BreastNodeDraft, value: string) => void;
  onRemoveNode: (side: "right" | "left", index: number) => void;
};

// Селекты для расположения в 2 колонки
const SELECT_FIELDS: Array<{ key: keyof BreastNodeDraft; label: string; options: any[] }> = [
  { key: "echogenicity", label: "Эхогенность", options: BREAST_NODE_ECHOGENICITY_OPTIONS },
  { key: "echostructure", label: "Эхоструктура", options: BREAST_NODE_ECHOSTRUCTURE_OPTIONS },
  { key: "contour", label: "Контур", options: BREAST_NODE_CONTOUR_OPTIONS },
  { key: "orientation", label: "Ориентация", options: BREAST_NODE_ORIENTATION_OPTIONS },
  { key: "bloodFlow", label: "Кровоток", options: BREAST_NODE_BLOOD_FLOW_OPTIONS },
];

function renderRow(
  label: string,
  valueText: string,
  typeLabel: "numpad" | "select" | "text" | "auto",
  filled: boolean,
  onPress?: () => void,
  readonly?: boolean,
  compact?: boolean,
  options?: { value: string; label: string }[],
  onSelectOption?: (value: string) => void,
) {
  return (
    <ProtocolFieldRow
      label={label}
      value={valueText}
      typeLabel={typeLabel}
      filled={filled}
      readonly={readonly}
      compact={compact}
      onPress={onPress}
      options={options}
      onSelectOption={onSelectOption}
    />
  );
}

export function BreastNodeCard({
  styles,
  node,
  index,
  side,
  isLandscape,
  openEditor,
  onUpdateNodeField,
  onRemoveNode,
}: BreastNodeCardProps) {
  return (
    <ProtocolCard
      key={`${side}-breast-node-${index}`}
      title={`Узел #${index + 1}`}
      actionLabel="Удалить"
      actionVariant="danger"
      onActionPress={() => onRemoveNode(side, index)}
      variant="item"
    >
      <View style={{ gap: 8 }}>
        <View style={styles.dualRow}>
          <View style={styles.dualCol}>
            {renderRow("Размер 1 (мм)", node.size1 || "Нажмите для ввода", "numpad", Boolean(node.size1),
              () => openEditor({ title: `Узел #${index + 1}: размер 1`, mode: "number", value: node.size1, placeholder: "мм", onSave: (nextValue) => onUpdateNodeField(side, index, "size1", nextValue) }),
              undefined, isLandscape)}
          </View>
          <View style={styles.dualCol}>
            {renderRow("Размер 2 (мм)", node.size2 || "Нажмите для ввода", "numpad", Boolean(node.size2),
              () => openEditor({ title: `Узел #${index + 1}: размер 2`, mode: "number", value: node.size2, placeholder: "мм", onSave: (nextValue) => onUpdateNodeField(side, index, "size2", nextValue) }),
              undefined, isLandscape)}
          </View>
        </View>

        {renderRow("Размер 3 (мм)", node.size3 || "Нажмите для ввода", "numpad", Boolean(node.size3),
          () => openEditor({ title: `Узел #${index + 1}: размер 3`, mode: "number", value: node.size3, placeholder: "мм", onSave: (nextValue) => onUpdateNodeField(side, index, "size3", nextValue) }),
          undefined, isLandscape)}

        {(() => {
          const a = parseFloat(node.size1);
          const b = parseFloat(node.size2);
          const c = parseFloat(node.size3);
          if (!isNaN(a) && !isNaN(b) && !isNaN(c)) {
            const vol = ((Math.PI * a * b * c) / 6 / 1000).toFixed(2);
            return (
              <View style={styles.obpFieldRow}>
                <Text style={[styles.obpFieldLabel, { fontWeight: "600" }]}>Объём</Text>
                <Text style={[styles.obpFieldValue, { fontWeight: "600" }]}>{vol} см³</Text>
              </View>
            );
          }
          return null;
        })()}

        {renderRow("Глубина (мм)", node.depth || "Нажмите для ввода", "numpad", Boolean(node.depth),
          () => openEditor({ title: `Узел #${index + 1}: глубина`, mode: "number", value: node.depth, placeholder: "мм", onSave: (nextValue) => onUpdateNodeField(side, index, "depth", nextValue) }),
          undefined, isLandscape)}

        {renderRow("Направление узла (часы)", node.direction || "Нажмите для ввода", "numpad", Boolean(node.direction),
          () => openEditor({ title: `Узел #${index + 1}: направление`, mode: "number", value: node.direction, placeholder: "1-12", onSave: (nextValue) => onUpdateNodeField(side, index, "direction", nextValue) }),
          undefined, isLandscape)}

        {/* Селекты в 2 колонки */}
        <View style={{ flexDirection: isLandscape ? "row" : "column", flexWrap: "wrap", gap: 6 }}>
          {SELECT_FIELDS.map((field) => (
            <View key={field.key} style={isLandscape ? { width: "48.5%" } : {}}>
              {renderRow(field.label, (node[field.key] as string) || "Нажмите для ввода", "select", Boolean(node[field.key]),
                undefined, undefined, isLandscape, field.options, (nextValue) => onUpdateNodeField(side, index, field.key, nextValue))}
            </View>
          ))}
        </View>

        {renderRow("Комментарий", node.comment || "Нажмите для ввода", "text", Boolean(node.comment),
          () => openEditor({ title: `Узел #${index + 1}: комментарий`, mode: "text", value: node.comment, placeholder: "Введите комментарий", multiline: true, onSave: (nextValue) => onUpdateNodeField(side, index, "comment", nextValue) }),
          undefined, isLandscape)}
      </View>
    </ProtocolCard>
  );
}