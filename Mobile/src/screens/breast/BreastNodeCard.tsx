import { useCallback, useRef } from "react";
import { View } from "react-native";

import { InlineNumpad } from "../../components/InlineNumpad";
import { ProtocolCard } from "../../components/protocol/ProtocolCard";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { useInlineNumpad } from "../../hooks/useInlineNumpad";
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
  // ---- Landscape: numpad ----
  const landscapeRef = useRef<View>(null);
  const fieldRefs = useRef<Record<string, View | null>>({});
  const numpad = useInlineNumpad(landscapeRef);

  const handleNumpadChange = useCallback(
    (fieldKey: keyof BreastNodeDraft, nextValue: string) => {
      onUpdateNodeField(side, index, fieldKey, nextValue);
    },
    [onUpdateNodeField, side, index],
  );

  const openLandscapeNumpad = useCallback(
    (fieldKey: keyof BreastNodeDraft) => {
      const fieldView = fieldRefs.current[fieldKey] ?? null;
      numpad.openNumpad(fieldKey, fieldView);
    },
    [numpad],
  );

  const getNumpadRef = (fieldKey: string) => (el: View | null) => {
    fieldRefs.current[fieldKey] = el;
  };

  const getNumpadLayout = (fieldKey: string) => (event: any) => {
    numpad.handleFieldLayout(fieldKey, event);
  };

  const renderCompactNumpadField = (fieldKey: keyof BreastNodeDraft, label: string) => {
    const value = (node[fieldKey] as string) || "";
    return (
      <View
        key={fieldKey}
        ref={getNumpadRef(fieldKey)}
        onLayout={getNumpadLayout(fieldKey)}
        style={{ width: "48.5%" }}
      >
        {renderRow(label, value || "Нажмите для ввода", "numpad", Boolean(value),
          () => openLandscapeNumpad(fieldKey),
          undefined, isLandscape)}
      </View>
    );
  };

  // Расчёт объёма
  const renderVolume = () => {
    const a = parseFloat(node.size1);
    const b = parseFloat(node.size2);
    const c = parseFloat(node.size3);
    if (!isNaN(a) && !isNaN(b) && !isNaN(c)) {
      const vol = ((Math.PI * a * b * c) / 6 / 1000).toFixed(2);
      return (
        <View style={styles.obpFieldRow}>
          <ProtocolFieldRow
            label="Объём"
            value={`${vol} см³`}
            typeLabel="auto"
            filled={true}
            readonly
            compact={isLandscape}
          />
        </View>
      );
    }
    return null;
  };

  return (
    <ProtocolCard
      key={`${side}-breast-node-${index}`}
      title={`Узел #${index + 1}`}
      actionLabel="Удалить"
      actionVariant="danger"
      onActionPress={() => onRemoveNode(side, index)}
      variant="item"
    >
      <View ref={isLandscape ? landscapeRef : undefined} style={{ gap: 8, position: isLandscape ? "relative" : undefined }}>
        {isLandscape ? (
          <>
            {/* Размеры в 2 колонки */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {renderCompactNumpadField("size1", "Размер 1 (мм)")}
              {renderCompactNumpadField("size2", "Размер 2 (мм)")}
            </View>
            {renderCompactNumpadField("size3", "Размер 3 (мм)")}

            {renderVolume()}

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {renderCompactNumpadField("depth", "Глубина (мм)")}
              {renderCompactNumpadField("direction", "Направление (часы)")}
            </View>

            {/* Селекты в 2 колонки */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {SELECT_FIELDS.map((field) => (
                <View key={field.key} style={{ width: "48.5%" }}>
                  {renderRow(field.label, (node[field.key] as string) || "Нажмите для ввода", "select", Boolean(node[field.key]),
                    undefined, undefined, isLandscape, field.options, (nextValue) => onUpdateNodeField(side, index, field.key, nextValue))}
                </View>
              ))}
            </View>

            {renderRow("Комментарий", node.comment || "Нажмите для ввода", "text", Boolean(node.comment),
              () => openEditor({ title: `Узел #${index + 1}: комментарий`, mode: "text", value: node.comment, placeholder: "Введите комментарий", multiline: true, onSave: (nextValue) => onUpdateNodeField(side, index, "comment", nextValue) }),
              undefined, isLandscape)}

            {/* InlineNumpad */}
            {numpad.activeNumpadField != null && numpad.numpadPosition && (() => {
              const activeFieldKey = numpad.activeNumpadField as keyof BreastNodeDraft;
              const currentValue = typeof node[activeFieldKey] === "string" ? node[activeFieldKey] as string : "";
              return (
                <View
                  style={{
                    position: "absolute",
                    top: numpad.numpadPosition.top,
                    left: numpad.numpadPosition.left,
                    width: numpad.numpadPosition.width,
                    zIndex: 100,
                  }}
                >
                  <InlineNumpad
                    value={currentValue}
                    onValueChange={(nextValue) => handleNumpadChange(activeFieldKey, nextValue)}
                    onClose={numpad.closeNumpad}
                  />
                </View>
              );
            })()}
          </>
        ) : (
          <>
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

            {renderVolume()}

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
          </>
        )}
      </View>
    </ProtocolCard>
  );
}