import { useCallback, useRef } from "react";
import { View } from "react-native";

import { InlineNumpad } from "../../components/InlineNumpad";
import { ProtocolCard } from "../../components/protocol/ProtocolCard";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { useInlineNumpad } from "../../hooks/useInlineNumpad";
import type { LymphNodeDraft } from "../../shared/lymphNodesDraft";
import type { LymphNodesDraft } from "../../shared/lymphNodesDraft";
import type { AppStyles } from "../../styles/appStyles";
import {
  LYMPH_NODE_BLOOD_FLOW_OPTIONS,
  LYMPH_NODE_CONTOUR_OPTIONS,
  LYMPH_NODE_ECHOGENICITY_OPTIONS,
  LYMPH_NODE_ECHOSTRUCTURE_OPTIONS,
  LYMPH_NODE_SHAPE_OPTIONS,
  type EditorState,
} from "./lymphNodesFieldConfigs";

type LymphNodeCardProps = {
  styles: AppStyles;
  regionKey: keyof LymphNodesDraft;
  node: LymphNodeDraft;
  index: number;
  fv: Record<string, boolean>;
  isLandscape?: boolean;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateNodeField: (regionKey: keyof LymphNodesDraft, index: number, field: keyof LymphNodeDraft, value: string) => void;
  onRemoveNode: (regionKey: keyof LymphNodesDraft, index: number) => void;
};

/** Поля-селекты для лимфоузла */
const SELECT_FIELDS: Array<{ key: keyof LymphNodeDraft; label: string; fvKey: string; options: any[] }> = [
  { key: "echogenicity", label: "Эхогенность", fvKey: "lymph_nodes.echogenicity", options: LYMPH_NODE_ECHOGENICITY_OPTIONS },
  { key: "echostructure", label: "Эхоструктура", fvKey: "lymph_nodes.echostructure", options: LYMPH_NODE_ECHOSTRUCTURE_OPTIONS },
  { key: "shape", label: "Форма", fvKey: "lymph_nodes.shape", options: LYMPH_NODE_SHAPE_OPTIONS },
  { key: "contour", label: "Контур", fvKey: "lymph_nodes.contour", options: LYMPH_NODE_CONTOUR_OPTIONS },
  { key: "bloodFlow", label: "Кровоток", fvKey: "lymph_nodes.bloodFlow", options: LYMPH_NODE_BLOOD_FLOW_OPTIONS },
];

export function LymphNodeCard({
  styles,
  regionKey,
  node,
  index,
  fv,
  isLandscape,
  openEditor,
  onUpdateNodeField,
  onRemoveNode,
}: LymphNodeCardProps) {
  // ---- Landscape: numpad ----
  const landscapeRef = useRef<View>(null);
  const fieldRefs = useRef<Record<string, View | null>>({});
  const numpad = useInlineNumpad(landscapeRef);

  const handleNumpadChange = useCallback(
    (fieldKey: keyof LymphNodeDraft, nextValue: string) => {
      onUpdateNodeField(regionKey, index, fieldKey, nextValue);
    },
    [onUpdateNodeField, regionKey, index],
  );

  const openLandscapeNumpad = useCallback(
    (fieldKey: keyof LymphNodeDraft) => {
      const fieldView = fieldRefs.current[fieldKey] ?? null;
      numpad.openNumpad(fieldKey, fieldView);
    },
    [numpad],
  );

  const renderCompactNumpadField = (fieldKey: keyof LymphNodeDraft, label: string) => {
    const value = (node[fieldKey] as string) || "";
    return (
      <View
        key={fieldKey}
        ref={(el) => { fieldRefs.current[fieldKey] = el; }}
        onLayout={(event) => numpad.handleFieldLayout(fieldKey, event)}
        style={{ width: "48.5%" }}
      >
        <ProtocolFieldRow
          label={label}
          value={value || "Введите размер"}
          typeLabel="numpad"
          filled={Boolean(value)}
          compact={isLandscape}
          onPress={() => openLandscapeNumpad(fieldKey)}
        />
      </View>
    );
  };

  const renderCompactSelectField = (
    fieldKey: keyof LymphNodeDraft,
    label: string,
    options: any[],
    onSelectOption: (v: string) => void,
  ) => {
    const value = (node[fieldKey] as string) || "";
    return (
      <View key={fieldKey} style={{ width: "48.5%" }}>
        <ProtocolFieldRow
          label={label}
          value={value || "Введите значение"}
          typeLabel="select"
          filled={Boolean(value)}
          compact={isLandscape}
          options={options}
          onSelectOption={onSelectOption}
        />
      </View>
    );
  };

  return (
    <ProtocolCard
      key={`${regionKey}-node-${node.id || index}`}
      title={`Узел ${node.side === "right" ? "правый" : "левый"}`}
      actionLabel="Удалить"
      actionVariant="danger"
      onActionPress={() => onRemoveNode(regionKey, index)}
      variant="item"
    >
      <View ref={isLandscape ? landscapeRef : undefined} style={{ gap: 8, position: isLandscape ? "relative" : undefined }}>
        {isLandscape ? (
          <>
            {/* Размеры в 2 колонки */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {fv["lymph_nodes.size1"] !== false && renderCompactNumpadField("size1", "Размер 1 (мм)")}
              {fv["lymph_nodes.size2"] !== false && renderCompactNumpadField("size2", "Размер 2 (мм)")}
            </View>

            {/* Селекты в 2 колонки */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {SELECT_FIELDS.map((field) =>
                fv[field.fvKey] !== false && renderCompactSelectField(
                  field.key, field.label, field.options,
                  (nextValue) => onUpdateNodeField(regionKey, index, field.key, nextValue),
                )
              )}
            </View>

            {/* InlineNumpad */}
            {numpad.activeNumpadField != null && numpad.numpadPosition && (() => {
              const activeFieldKey = numpad.activeNumpadField as keyof LymphNodeDraft;
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
          <View style={styles.obpFieldList}>
            {(fv["lymph_nodes.size1"] !== false || fv["lymph_nodes.size2"] !== false) && (
              <View style={styles.dualRow}>
                {fv["lymph_nodes.size1"] !== false && (
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
                )}
                {fv["lymph_nodes.size2"] !== false && (
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
                )}
              </View>
            )}

            {(fv["lymph_nodes.echogenicity"] !== false || fv["lymph_nodes.echostructure"] !== false) && (
              <>
                {fv["lymph_nodes.echogenicity"] !== false && (
                  <ProtocolFieldRow
                    label="Эхогенность"
                    value={node.echogenicity || "Введите значение"}
                    typeLabel="select"
                    filled={Boolean(node.echogenicity)}
                    options={LYMPH_NODE_ECHOGENICITY_OPTIONS}
                    onSelectOption={(nextValue) => onUpdateNodeField(regionKey, index, "echogenicity", nextValue)}
                  />
                )}

                {fv["lymph_nodes.echostructure"] !== false && (
                  <ProtocolFieldRow
                    label="Эхоструктура"
                    value={node.echostructure || "Введите значение"}
                    typeLabel="select"
                    filled={Boolean(node.echostructure)}
                    options={LYMPH_NODE_ECHOSTRUCTURE_OPTIONS}
                    onSelectOption={(nextValue) => onUpdateNodeField(regionKey, index, "echostructure", nextValue)}
                  />
                )}
              </>
            )}

            {fv["lymph_nodes.shape"] !== false && (
              <ProtocolFieldRow
                label="Форма"
                value={node.shape || "Введите значение"}
                typeLabel="select"
                filled={Boolean(node.shape)}
                options={LYMPH_NODE_SHAPE_OPTIONS}
                onSelectOption={(nextValue) => onUpdateNodeField(regionKey, index, "shape", nextValue)}
              />
            )}

            {fv["lymph_nodes.contour"] !== false && (
              <ProtocolFieldRow
                label="Контур"
                value={node.contour || "Введите значение"}
                typeLabel="select"
                filled={Boolean(node.contour)}
                options={LYMPH_NODE_CONTOUR_OPTIONS}
                onSelectOption={(nextValue) => onUpdateNodeField(regionKey, index, "contour", nextValue)}
              />
            )}

            {fv["lymph_nodes.bloodFlow"] !== false && (
              <ProtocolFieldRow
                label="Кровоток"
                value={node.bloodFlow || "Введите значение"}
                typeLabel="select"
                filled={Boolean(node.bloodFlow)}
                options={LYMPH_NODE_BLOOD_FLOW_OPTIONS}
                onSelectOption={(nextValue) => onUpdateNodeField(regionKey, index, "bloodFlow", nextValue)}
              />
            )}
          </View>
        )}
      </View>
    </ProtocolCard>
  );
}