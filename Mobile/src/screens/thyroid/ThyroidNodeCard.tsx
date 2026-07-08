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
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateNodeField: (side: "right" | "left", index: number, field: keyof ThyroidNodeDraft, value: string) => void;
  onRemoveNode: (side: "right" | "left", index: number) => void;
};

export function ThyroidNodeCard({
  styles,
  node,
  index,
  side,
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
      <View style={styles.obpFieldList}>
        <View style={styles.dualRow}>
          <View style={styles.dualCol}>
            <ProtocolFieldRow
              label="Размер 1 (мм)"
              value={node.size1 || "Нажмите для ввода"}
              typeLabel="numpad"
              filled={Boolean(node.size1)}
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

        <ProtocolFieldRow
          label="Эхогенность"
          value={node.echogenicity || "Нажмите для ввода"}
          typeLabel="select"
          filled={Boolean(node.echogenicity)}
          options={THYROID_NODE_ECHOGENICITY_OPTIONS}
          onSelectOption={(nextValue) => onUpdateNodeField(side, index, "echogenicity", nextValue)}
        />

        <ProtocolFieldRow
          label="Эхоструктура"
          value={node.echostructure || "Нажмите для ввода"}
          typeLabel="select"
          filled={Boolean(node.echostructure)}
          options={THYROID_NODE_ECHOSTRUCTURE_OPTIONS}
          onSelectOption={(nextValue) => onUpdateNodeField(side, index, "echostructure", nextValue)}
        />

        <ProtocolFieldRow
          label="Контур"
          value={node.contour || "Нажмите для ввода"}
          typeLabel="select"
          filled={Boolean(node.contour)}
          options={THYROID_NODE_CONTOUR_OPTIONS}
          onSelectOption={(nextValue) => onUpdateNodeField(side, index, "contour", nextValue)}
        />

        <ProtocolFieldRow
          label="Эхогенные фокусы"
          value={node.echogenicFoci || "Нажмите для ввода"}
          typeLabel="select"
          filled={Boolean(node.echogenicFoci)}
          options={THYROID_NODE_ECHOGENIC_FOCI_OPTIONS}
          onSelectOption={(nextValue) => onUpdateNodeField(side, index, "echogenicFoci", nextValue)}
        />

        <ProtocolFieldRow
          label="Ориентация"
          value={node.orientation || "Нажмите для ввода"}
          typeLabel="select"
          filled={Boolean(node.orientation)}
          options={THYROID_NODE_ORIENTATION_OPTIONS}
          onSelectOption={(nextValue) => onUpdateNodeField(side, index, "orientation", nextValue)}
        />

        <ProtocolFieldRow
          label="Кровоток"
          value={node.bloodFlow || "Нажмите для ввода"}
          typeLabel="select"
          filled={Boolean(node.bloodFlow)}
          options={THYROID_NODE_BLOOD_FLOW_OPTIONS}
          onSelectOption={(nextValue) => onUpdateNodeField(side, index, "bloodFlow", nextValue)}
        />

        <ProtocolFieldRow
          label="Комментарий"
          value={node.comment || "Нажмите для ввода"}
          typeLabel="text"
          filled={Boolean(node.comment)}
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
