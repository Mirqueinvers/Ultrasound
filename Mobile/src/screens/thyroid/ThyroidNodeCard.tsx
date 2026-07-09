import { useCallback, useRef } from "react";
import type { LayoutChangeEvent } from "react-native";
import { Text, View } from "react-native";

import { InlineNumpad } from "../../components/InlineNumpad";
import { ProtocolCard } from "../../components/protocol/ProtocolCard";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import type { ThyroidNodeDraft } from "../../shared/thyroidDraft";
import type { AppStyles } from "../../styles/appStyles";
import { useInlineNumpad, type NumpadPosition } from "../obp/useInlineNumpad";
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
  landscapeRef?: React.RefObject<View | null>;
  numpad?: ReturnType<typeof useInlineNumpad>;
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

// Ключи для размерных полей узла
const NODE_SIZE_KEYS: Array<keyof ThyroidNodeDraft> = ["size1", "size2"];

export function ThyroidNodeCard({
  styles,
  node,
  index,
  side,
  isLandscape,
  openEditor,
  onUpdateNodeField,
  onRemoveNode,
  landscapeRef,
  numpad: parentNumpad,
}: ThyroidNodeCardProps) {
  // Если есть родительский numpad (ландшафт) — используем его, иначе свой собственный
  const ownLandscapeRef = useRef<View>(null);
  const ownFieldRefs = useRef<Record<string, View | null>>({});
  const ownNumpad = useInlineNumpad(ownLandscapeRef);
  const effectiveLandscapeRef = landscapeRef ?? ownLandscapeRef;
  const effectiveNumpad = parentNumpad ?? ownNumpad;

  const handleSizeFieldPress = useCallback(
    (fieldKey: keyof ThyroidNodeDraft) => {
      if (isLandscape) {
        const fieldView = ownFieldRefs.current[fieldKey] ?? null;
        effectiveNumpad.openNumpad(`${side}-node-${index}-${fieldKey}`, fieldView);
      } else {
        openEditor({
          title: `Узел #${index + 1}: поле`,
          mode: "number",
          value: node[fieldKey] as string,
          placeholder: "мм",
          onSave: (nextValue) => onUpdateNodeField(side, index, fieldKey, nextValue),
        });
      }
    },
    [isLandscape, node, index, side, openEditor, onUpdateNodeField, effectiveNumpad],
  );

  const renderSizeField = (fieldKey: keyof ThyroidNodeDraft, label: string) => {
    const value = node[fieldKey] as string;
    return (
      <View
        key={fieldKey}
        ref={(el) => { ownFieldRefs.current[fieldKey] = el; }}
        onLayout={(event) => effectiveNumpad.handleFieldLayout(`${side}-node-${index}-${fieldKey}`, event)}
        style={styles.dualCol}
      >
        <ProtocolFieldRow
          label={label}
          value={value || "Нажмите для ввода"}
          typeLabel="numpad"
          filled={Boolean(value)}
          compact={isLandscape}
          onPress={() => handleSizeFieldPress(fieldKey)}
        />
      </View>
    );
  };

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
          {renderSizeField("size1", "Размер 1 (мм)")}
          {renderSizeField("size2", "Размер 2 (мм)")}
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

      {/* InlineNumpad для размерных полей узла */}
      {isLandscape && effectiveNumpad.activeNumpadField != null && effectiveNumpad.numpadPosition && (() => {
        const activeFieldKey = NODE_SIZE_KEYS.find(
          (k) => effectiveNumpad.activeNumpadField === `${side}-node-${index}-${k}`,
        );
        if (!activeFieldKey) return null;
        return (
          <View
            style={{
              position: "absolute",
              top: effectiveNumpad.numpadPosition.top,
              left: effectiveNumpad.numpadPosition.left,
              width: effectiveNumpad.numpadPosition.width,
              zIndex: 100,
            }}
          >
            <InlineNumpad
              value={node[activeFieldKey] as string}
              onValueChange={(nextValue) => onUpdateNodeField(side, index, activeFieldKey, nextValue)}
              onClose={effectiveNumpad.closeNumpad}
            />
          </View>
        );
      })()}
    </ProtocolCard>
  );
}