import { Text, View } from "react-native";

import { ProtocolCard } from "../../components/protocol/ProtocolCard";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import type { ThyroidNodeDraft } from "../../shared/thyroidDraft";
import type { AppStyles } from "../../styles/appStyles";
import {
  THYROID_NODE_BLOOD_FLOW_OPTIONS,
  THYROID_NODE_CONTOUR_OPTIONS,
  THYROID_NODE_ECHOGENICITY_OPTIONS,
  THYROID_NODE_ECHOGENIC_FOCI_OPTIONS,
  THYROID_NODE_ECHOSTRUCTURE_OPTIONS,
  THYROID_NODE_ORIENTATION_OPTIONS,
  type EditorState,
} from "./thyroidFieldConfigs";

type ThyroidNodeCardProps = {
  styles: AppStyles;
  node: ThyroidNodeDraft;
  index: number;
  side: "right" | "left";
  isLandscape?: boolean;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateNodeField: (side: "right" | "left", index: number, field: keyof ThyroidNodeDraft, value: string) => void;
  onRemoveNode: (side: "right" | "left", index: number) => void;
};

// Селекты, которые нужно расположить в 2 колонки
const SELECT_FIELDS: Array<{ key: keyof ThyroidNodeDraft; label: string; options: any[] }> = [
  { key: "echogenicity", label: "Эхогенность", options: THYROID_NODE_ECHOGENICITY_OPTIONS },
  { key: "echostructure", label: "Эхоструктура", options: THYROID_NODE_ECHOSTRUCTURE_OPTIONS },
  { key: "contour", label: "Контур", options: THYROID_NODE_CONTOUR_OPTIONS },
  { key: "echogenicFoci", label: "Эхогенные фокусы", options: THYROID_NODE_ECHOGENIC_FOCI_OPTIONS },
  { key: "orientation", label: "Ориентация", options: THYROID_NODE_ORIENTATION_OPTIONS },
  { key: "bloodFlow", label: "Кровоток", options: THYROID_NODE_BLOOD_FLOW_OPTIONS },
];

export function ThyroidNodeCard({
  styles,
  node,
  index,
  side,
  isLandscape,
  openEditor,
  onUpdateNodeField,
  onRemoveNode,
}: ThyroidNodeCardProps) {
  return (
    <ProtocolCard
      key={`${side}-thyroid-node-${index}`}
      title={`Узел #${index + 1}`}
      actionLabel="Удалить"
      actionVariant="danger"
      onActionPress={() => onRemoveNode(side, index)}
      variant="item"
    >
      <View style={{ gap: 8 }}>
        <View style={styles.dualRow}>
          <View style={styles.dualCol}>
            <ProtocolFieldRow
              label="Размер 1 (мм)"
              value={node.size1 || "Нажмите для ввода"}
              typeLabel="numpad"
              filled={Boolean(node.size1)}
              compact={isLandscape}
              onPress={() =>
                openEditor({
                  title: `Узел #${index + 1}: размер 1`,
                  mode: "number",
                  value: node.size1,
                  placeholder: "мм",
                  onSave: (nextValue) => onUpdateNodeField(side, index, "size1", nextValue),
                })
              }
            />
          </View>
          <View style={styles.dualCol}>
            <ProtocolFieldRow
              label="Размер 2 (мм)"
              value={node.size2 || "Нажмите для ввода"}
              typeLabel="numpad"
              filled={Boolean(node.size2)}
              compact={isLandscape}
              onPress={() =>
                openEditor({
                  title: `Узел #${index + 1}: размер 2`,
                  mode: "number",
                  value: node.size2,
                  placeholder: "мм",
                  onSave: (nextValue) => onUpdateNodeField(side, index, "size2", nextValue),
                })
              }
            />
          </View>
        </View>

        {/* Select-поля в 2 колонки в landscape */}
        <View style={{ flexDirection: isLandscape ? "row" : "column", flexWrap: "wrap", gap: 6 }}>
          {SELECT_FIELDS.map((field) => (
            <View key={field.key} style={isLandscape ? { width: "48.5%" } : {}}>
              <ProtocolFieldRow
                label={field.label}
                value={(node[field.key] as string) || "Нажмите для ввода"}
                typeLabel="select"
                filled={Boolean(node[field.key])}
                compact={isLandscape}
                options={field.options}
                onSelectOption={(nextValue) => onUpdateNodeField(side, index, field.key, nextValue)}
              />
            </View>
          ))}
        </View>

        <ProtocolFieldRow
          label="Комментарий"
          value={node.comment || "Нажмите для ввода"}
          typeLabel="text"
          filled={Boolean(node.comment)}
          compact={isLandscape}
          onPress={() =>
            openEditor({
              title: `Узел #${index + 1}: комментарий`,
              mode: "text",
              value: node.comment,
              placeholder: "Введите комментарий",
              multiline: true,
              onSave: (nextValue) => onUpdateNodeField(side, index, "comment", nextValue),
            })
          }
        />

        {node.tiradsCategory ? (
          <Text style={styles.helperText}>Класс {node.tiradsCategory}</Text>
        ) : null}
      </View>
    </ProtocolCard>
  );
}