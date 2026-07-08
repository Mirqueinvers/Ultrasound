import { View } from "react-native";

import { ProtocolCard } from "../../components/protocol/ProtocolCard";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import type { LymphNodeDraft } from "../../shared/lymphNodesDraft";
import type { AppStyles } from "../../styles/appStyles";
import {
  LYMPH_NODE_BLOOD_FLOW_OPTIONS,
  LYMPH_NODE_CONTOUR_OPTIONS,
  LYMPH_NODE_ECHOGENICITY_OPTIONS,
  LYMPH_NODE_ECHOSTRUCTURE_OPTIONS,
  LYMPH_NODE_SHAPE_OPTIONS,
  type EditorState,
} from "./lymphNodesFieldConfigs";

import type { LymphNodesDraft } from "../../shared/lymphNodesDraft";

type LymphNodeCardProps = {
  styles: AppStyles;
  regionKey: keyof LymphNodesDraft;
  node: LymphNodeDraft;
  index: number;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateNodeField: (regionKey: keyof LymphNodesDraft, index: number, field: keyof LymphNodeDraft, value: string) => void;
  onRemoveNode: (regionKey: keyof LymphNodesDraft, index: number) => void;
};

export function LymphNodeCard({
  styles,
  regionKey,
  node,
  index,
  openEditor,
  onUpdateNodeField,
  onRemoveNode,
}: LymphNodeCardProps) {
  return (
    <ProtocolCard
      key={`${regionKey}-node-${node.id || index}`}
      title={`Узел ${node.side === "right" ? "правый" : "левый"}`}
      actionLabel="Удалить"
      actionVariant="danger"
      onActionPress={() => onRemoveNode(regionKey, index)}
      variant="item"
    >
      <View style={styles.obpFieldList}>
        <View style={styles.dualRow}>
          <View style={styles.dualCol}>
            <ProtocolFieldRow
              label="Размер 1 (мм)"
              value={node.size1 || "Введите размер"}
              typeLabel="numpad"
              filled={Boolean(node.size1)}
              onPress={() =>
                openEditor({
                  title: `Узел #${index + 1}: Размер 1`,
                  mode: "number",
                  value: node.size1,
                  placeholder: "мм",
                  onSave: (nextValue) => onUpdateNodeField(regionKey, index, "size1", nextValue),
                })
              }
            />
          </View>
          <View style={styles.dualCol}>
            <ProtocolFieldRow
              label="Размер 2 (мм)"
              value={node.size2 || "Введите размер"}
              typeLabel="numpad"
              filled={Boolean(node.size2)}
              onPress={() =>
                openEditor({
                  title: `Узел #${index + 1}: Размер 2`,
                  mode: "number",
                  value: node.size2,
                  placeholder: "мм",
                  onSave: (nextValue) => onUpdateNodeField(regionKey, index, "size2", nextValue),
                })
              }
            />
          </View>
        </View>

        <ProtocolFieldRow
          label="Эхогенность"
          value={node.echogenicity || "Введите значение"}
          typeLabel="select"
          filled={Boolean(node.echogenicity)}
          options={LYMPH_NODE_ECHOGENICITY_OPTIONS}
          onSelectOption={(nextValue) => onUpdateNodeField(regionKey, index, "echogenicity", nextValue)}
        />

        <ProtocolFieldRow
          label="Эхоструктура"
          value={node.echostructure || "Введите значение"}
          typeLabel="select"
          filled={Boolean(node.echostructure)}
          options={LYMPH_NODE_ECHOSTRUCTURE_OPTIONS}
          onSelectOption={(nextValue) => onUpdateNodeField(regionKey, index, "echostructure", nextValue)}
        />

        <ProtocolFieldRow
          label="Форма"
          value={node.shape || "Введите значение"}
          typeLabel="select"
          filled={Boolean(node.shape)}
          options={LYMPH_NODE_SHAPE_OPTIONS}
          onSelectOption={(nextValue) => onUpdateNodeField(regionKey, index, "shape", nextValue)}
        />

        <ProtocolFieldRow
          label="Контур"
          value={node.contour || "Введите значение"}
          typeLabel="select"
          filled={Boolean(node.contour)}
          options={LYMPH_NODE_CONTOUR_OPTIONS}
          onSelectOption={(nextValue) => onUpdateNodeField(regionKey, index, "contour", nextValue)}
        />

        <ProtocolFieldRow
          label="Кровоток"
          value={node.bloodFlow || "Введите значение"}
          typeLabel="select"
          filled={Boolean(node.bloodFlow)}
          options={LYMPH_NODE_BLOOD_FLOW_OPTIONS}
          onSelectOption={(nextValue) => onUpdateNodeField(regionKey, index, "bloodFlow", nextValue)}
        />
      </View>
    </ProtocolCard>
  );
}
