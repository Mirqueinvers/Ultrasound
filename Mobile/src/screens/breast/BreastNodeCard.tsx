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
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateNodeField: (side: "right" | "left", index: number, field: keyof BreastNodeDraft, value: string) => void;
  onRemoveNode: (side: "right" | "left", index: number) => void;
};

function renderRow(
  label: string,
  valueText: string,
  typeLabel: "numpad" | "select" | "text" | "auto",
  filled: boolean,
  onPress?: () => void,
  readonly?: boolean,
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
      <View style={styles.obpFieldList}>
        <View style={styles.dualRow}>
          <View style={styles.dualCol}>
            {renderRow(
              "Размер 1 (мм)",
              node.size1 || "Нажмите для ввода",
              "numpad",
              Boolean(node.size1),
              () =>
                openEditor({
                  title: `Узел #${index + 1}: размер 1`,
                  mode: "number",
                  value: node.size1,
                  placeholder: "мм",
                  onSave: (nextValue) => onUpdateNodeField(side, index, "size1", nextValue),
                }),
            )}
          </View>
          <View style={styles.dualCol}>
            {renderRow(
              "Размер 2 (мм)",
              node.size2 || "Нажмите для ввода",
              "numpad",
              Boolean(node.size2),
              () =>
                openEditor({
                  title: `Узел #${index + 1}: размер 2`,
                  mode: "number",
                  value: node.size2,
                  placeholder: "мм",
                  onSave: (nextValue) => onUpdateNodeField(side, index, "size2", nextValue),
                }),
            )}
          </View>
        </View>

        {renderRow(
          "Размер 3 (мм)",
          node.size3 || "Нажмите для ввода",
          "numpad",
          Boolean(node.size3),
          () =>
            openEditor({
              title: `Узел #${index + 1}: размер 3`,
              mode: "number",
              value: node.size3,
              placeholder: "мм",
              onSave: (nextValue) => onUpdateNodeField(side, index, "size3", nextValue),
            }),
        )}

        {(() => {
          const a = parseFloat(node.size1);
          const b = parseFloat(node.size2);
          const c = parseFloat(node.size3);
          if (!isNaN(a) && !isNaN(b) && !isNaN(c)) {
            const vol = ((Math.PI * a * b * c) / 6 / 1000).toFixed(2);
            return (
              <View style={styles.obpFieldRow}>
                <Text style={[styles.obpFieldLabel, { fontWeight: "600" }]}>
                  Объём
                </Text>
                <Text style={[styles.obpFieldValue, { fontWeight: "600" }]}>
                  {vol} см³
                </Text>
              </View>
            );
          }
          return null;
        })()}

        {renderRow(
          "Глубина (мм)",
          node.depth || "Нажмите для ввода",
          "numpad",
          Boolean(node.depth),
          () =>
            openEditor({
              title: `Узел #${index + 1}: глубина`,
              mode: "number",
              value: node.depth,
              placeholder: "мм",
              onSave: (nextValue) => onUpdateNodeField(side, index, "depth", nextValue),
            }),
        )}

        {renderRow(
          "Направление узла (часы)",
          node.direction || "Нажмите для ввода",
          "numpad",
          Boolean(node.direction),
          () =>
            openEditor({
              title: `Узел #${index + 1}: направление`,
              mode: "number",
              value: node.direction,
              placeholder: "1-12",
              onSave: (nextValue) => onUpdateNodeField(side, index, "direction", nextValue),
            }),
        )}

        {renderRow(
          "Эхогенность",
          node.echogenicity || "Нажмите для ввода",
          "select",
          Boolean(node.echogenicity),
          undefined,
          undefined,
          BREAST_NODE_ECHOGENICITY_OPTIONS,
          (nextValue) => onUpdateNodeField(side, index, "echogenicity", nextValue),
        )}

        {renderRow(
          "Эхоструктура",
          node.echostructure || "Нажмите для ввода",
          "select",
          Boolean(node.echostructure),
          undefined,
          undefined,
          BREAST_NODE_ECHOSTRUCTURE_OPTIONS,
          (nextValue) => onUpdateNodeField(side, index, "echostructure", nextValue),
        )}

        {renderRow(
          "Контур",
          node.contour || "Нажмите для ввода",
          "select",
          Boolean(node.contour),
          undefined,
          undefined,
          BREAST_NODE_CONTOUR_OPTIONS,
          (nextValue) => onUpdateNodeField(side, index, "contour", nextValue),
        )}

        {renderRow(
          "Ориентация",
          node.orientation || "Нажмите для ввода",
          "select",
          Boolean(node.orientation),
          undefined,
          undefined,
          BREAST_NODE_ORIENTATION_OPTIONS,
          (nextValue) => onUpdateNodeField(side, index, "orientation", nextValue),
        )}

        {renderRow(
          "Кровоток",
          node.bloodFlow || "Нажмите для ввода",
          "select",
          Boolean(node.bloodFlow),
          undefined,
          undefined,
          BREAST_NODE_BLOOD_FLOW_OPTIONS,
          (nextValue) => onUpdateNodeField(side, index, "bloodFlow", nextValue),
        )}

        {renderRow(
          "Комментарий",
          node.comment || "Нажмите для ввода",
          "text",
          Boolean(node.comment),
          () =>
            openEditor({
              title: `Узел #${index + 1}: комментарий`,
              mode: "text",
              value: node.comment,
              placeholder: "Введите комментарий",
              multiline: true,
              onSave: (nextValue) => onUpdateNodeField(side, index, "comment", nextValue),
            }),
        )}
      </View>
    </ProtocolCard>
  );
}
