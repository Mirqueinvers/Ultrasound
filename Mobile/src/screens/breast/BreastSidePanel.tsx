import { Text, View } from "react-native";

import { ProtocolActionButton } from "../../components/protocol/ProtocolActionButton";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { ProtocolOrganHeader, ProtocolSectionHeader } from "../../components/protocol/ProtocolHeaders";
import type { BreastNodeDraft, BreastSideDraft } from "../../shared/breastDraft";
import { isNormalizedMatch } from "../../shared/normalizeSelectValue";
import type { AppStyles } from "../../styles/appStyles";
import {
  BREAST_MILK_DUCTS_OPTIONS,
  BREAST_NIPPLES_OPTIONS,
  BREAST_SKIN_OPTIONS,
  BREAST_VOLUME_FORMATIONS_OPTIONS,
  type EditorState,
} from "./breastFieldConfigs";
import { BreastNodeCard } from "./BreastNodeCard";

type BreastSidePanelProps = {
  styles: AppStyles;
  side: "right" | "left";
  breastSide: BreastSideDraft;
  fv: Record<string, boolean>;
  isLandscape?: boolean;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateSideField: (side: "right" | "left", field: keyof BreastSideDraft, value: string) => void;
  onAddNode: (side: "right" | "left") => void;
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

export function BreastSidePanel({
  styles,
  side,
  breastSide,
  fv,
  openEditor,
  onUpdateSideField,
  onAddNode,
  onUpdateNodeField,
  onRemoveNode,
  isLandscape,
}: BreastSidePanelProps) {
  const title = side === "right" ? "Правая молочная железа" : "Левая молочная железа";
  const showNodeList = isNormalizedMatch(breastSide.volumeFormations, "определяются");

  const sideKey = side === "right" ? "right" : "left";

  return (
    <View style={styles.kidneyPlainSection}>
      <ProtocolOrganHeader title={title} />

      {isLandscape ? (
        <View style={{ gap: 8 }}>
          {(fv[`breast.${sideKey}.skin`] !== false || fv[`breast.${sideKey}.skinComment`] !== false || fv[`breast.${sideKey}.nipples`] !== false || fv[`breast.${sideKey}.nipplesComment`] !== false || fv[`breast.${sideKey}.milkDucts`] !== false) && (
            <ProtocolSectionHeader title="Общие характеристики" />
          )}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {fv[`breast.${sideKey}.skin`] !== false && (
              <View style={{ width: "48.5%" }}>
                {renderRow("Кожа", breastSide.skin || "Нажмите для ввода", "select", Boolean(breastSide.skin), undefined, undefined, isLandscape, BREAST_SKIN_OPTIONS, (nextValue) => onUpdateSideField(side, "skin", nextValue))}
              </View>
            )}
            {isNormalizedMatch(breastSide.skin, "изменена") && fv[`breast.${sideKey}.skinComment`] !== false && (
              <View style={{ width: "48.5%" }}>
                {renderRow("Описание изменений кожи", breastSide.skinComment || "Нажмите для ввода", "text", Boolean(breastSide.skinComment), () => openEditor({title: `${title}: описание изменений кожи`, mode: "text", value: breastSide.skinComment, placeholder: "Введите описание", multiline: true, onSave: (nextValue) => onUpdateSideField(side, "skinComment", nextValue)}), undefined, isLandscape)}
              </View>
            )}
            {fv[`breast.${sideKey}.nipples`] !== false && (
              <View style={{ width: "48.5%" }}>
                {renderRow("Соски и ареолы", breastSide.nipples || "Нажмите для ввода", "select", Boolean(breastSide.nipples), undefined, undefined, isLandscape, BREAST_NIPPLES_OPTIONS, (nextValue) => onUpdateSideField(side, "nipples", nextValue))}
              </View>
            )}
            {isNormalizedMatch(breastSide.nipples, "изменены") && fv[`breast.${sideKey}.nipplesComment`] !== false && (
              <View style={{ width: "48.5%" }}>
                {renderRow("Описание изменений сосков и ареол", breastSide.nipplesComment || "Нажмите для ввода", "text", Boolean(breastSide.nipplesComment), () => openEditor({title: `${title}: описание изменений сосков и ареол`, mode: "text", value: breastSide.nipplesComment, placeholder: "Введите описание", multiline: true, onSave: (nextValue) => onUpdateSideField(side, "nipplesComment", nextValue)}), undefined, isLandscape)}
              </View>
            )}
            {fv[`breast.${sideKey}.milkDucts`] !== false && (
              <View style={{ width: "48.5%" }}>
                {renderRow("Млечные протоки", breastSide.milkDucts || "Нажмите для ввода", "select", Boolean(breastSide.milkDucts), undefined, undefined, isLandscape, BREAST_MILK_DUCTS_OPTIONS, (nextValue) => onUpdateSideField(side, "milkDucts", nextValue))}
              </View>
            )}
          </View>

          {fv[`breast.${sideKey}.volumeFormations`] !== false && (
            <>
              <ProtocolSectionHeader title="Объемные образования" />
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                <View style={{ width: "48.5%" }}>
                  {renderRow("Определение", breastSide.volumeFormations || "Нажмите для ввода", "select", Boolean(breastSide.volumeFormations), undefined, undefined, isLandscape, BREAST_VOLUME_FORMATIONS_OPTIONS, (nextValue) => onUpdateSideField(side, "volumeFormations", nextValue))}
                </View>
              </View>

              {showNodeList && (
                <View style={{ gap: 6 }}>
                  <ProtocolSectionHeader title="Узлы" />
                  {breastSide.nodesList.length === 0 ? (
                    <Text style={styles.helperText}>Добавьте хотя бы один узел.</Text>
                  ) : (
                    breastSide.nodesList.map((node, index) => (
                      <BreastNodeCard
                        key={`${side}-breast-node-${index}`}
                        styles={styles}
                        node={node}
                        index={index}
                        side={side}
                        openEditor={openEditor}
                        onUpdateNodeField={onUpdateNodeField}
                        onRemoveNode={onRemoveNode}
                      />
                    ))
                  )}
                  <ProtocolActionButton label="+ Узел" onPress={() => onAddNode(side)} />
                </View>
              )}
            </>
          )}

          {fv[`breast.${sideKey}.additional`] !== false && (
            <>
              <ProtocolSectionHeader title="Дополнительно" />
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                <View style={{ width: "48.5%" }}>
                  {renderRow("Дополнительно", breastSide.additional || "Нажмите для ввода", "text", Boolean(breastSide.additional), () => openEditor({title: `${title}: дополнительно`, mode: "text", value: breastSide.additional, placeholder: "Введите дополнительное описание", multiline: true, onSave: (nextValue) => onUpdateSideField(side, "additional", nextValue)}), undefined, isLandscape)}
                </View>
              </View>
            </>
          )}
        </View>
      ) : (
        <View style={styles.obpFieldList}>
          <>
            {(fv[`breast.${sideKey}.skin`] !== false || fv[`breast.${sideKey}.skinComment`] !== false || fv[`breast.${sideKey}.nipples`] !== false || fv[`breast.${sideKey}.nipplesComment`] !== false || fv[`breast.${sideKey}.milkDucts`] !== false) && (
              <ProtocolSectionHeader title="Общие характеристики" />
            )}
            {fv[`breast.${sideKey}.skin`] !== false &&
              renderRow("Кожа", breastSide.skin || "Нажмите для ввода", "select", Boolean(breastSide.skin), undefined, undefined, isLandscape, BREAST_SKIN_OPTIONS, (nextValue) => onUpdateSideField(side, "skin", nextValue))}
            {isNormalizedMatch(breastSide.skin, "изменена") && fv[`breast.${sideKey}.skinComment`] !== false &&
              renderRow("Описание изменений кожи", breastSide.skinComment || "Нажмите для ввода", "text", Boolean(breastSide.skinComment), () => openEditor({title: `${title}: описание изменений кожи`, mode: "text", value: breastSide.skinComment, placeholder: "Введите описание", multiline: true, onSave: (nextValue) => onUpdateSideField(side, "skinComment", nextValue)}), undefined, isLandscape)}
            {fv[`breast.${sideKey}.nipples`] !== false &&
              renderRow("Соски и ареолы", breastSide.nipples || "Нажмите для ввода", "select", Boolean(breastSide.nipples), undefined, undefined, isLandscape, BREAST_NIPPLES_OPTIONS, (nextValue) => onUpdateSideField(side, "nipples", nextValue))}
            {isNormalizedMatch(breastSide.nipples, "изменены") && fv[`breast.${sideKey}.nipplesComment`] !== false &&
              renderRow("Описание изменений сосков и ареол", breastSide.nipplesComment || "Нажмите для ввода", "text", Boolean(breastSide.nipplesComment), () => openEditor({title: `${title}: описание изменений сосков и ареол`, mode: "text", value: breastSide.nipplesComment, placeholder: "Введите описание", multiline: true, onSave: (nextValue) => onUpdateSideField(side, "nipplesComment", nextValue)}), undefined, isLandscape)}
            {fv[`breast.${sideKey}.milkDucts`] !== false &&
              renderRow("Млечные протоки", breastSide.milkDucts || "Нажмите для ввода", "select", Boolean(breastSide.milkDucts), undefined, undefined, isLandscape, BREAST_MILK_DUCTS_OPTIONS, (nextValue) => onUpdateSideField(side, "milkDucts", nextValue))}
          </>

          {fv[`breast.${sideKey}.volumeFormations`] !== false && (
            <>
              <ProtocolSectionHeader title="Объемные образования" />
              {renderRow("Определение", breastSide.volumeFormations || "Нажмите для ввода", "select", Boolean(breastSide.volumeFormations), undefined, undefined, isLandscape, BREAST_VOLUME_FORMATIONS_OPTIONS, (nextValue) => onUpdateSideField(side, "volumeFormations", nextValue))}

              {showNodeList && (
                <View style={styles.obpFieldList}>
                  <ProtocolSectionHeader title="Узлы" />
                  {breastSide.nodesList.length === 0 ? (
                    <Text style={styles.helperText}>Добавьте хотя бы один узел.</Text>
                  ) : (
                    breastSide.nodesList.map((node, index) => (
                      <BreastNodeCard key={`${side}-breast-node-${index}`} styles={styles} node={node} index={index} side={side} openEditor={openEditor} onUpdateNodeField={onUpdateNodeField} onRemoveNode={onRemoveNode} />
                    ))
                  )}
                  <ProtocolActionButton label="+ Узел" onPress={() => onAddNode(side)} />
                </View>
              )}
            </>
          )}

          {fv[`breast.${sideKey}.additional`] !== false && (
            <>
              <ProtocolSectionHeader title="Дополнительно" />
              {renderRow("Дополнительно", breastSide.additional || "Нажмите для ввода", "text", Boolean(breastSide.additional), () => openEditor({title: `${title}: дополнительно`, mode: "text", value: breastSide.additional, placeholder: "Введите дополнительное описание", multiline: true, onSave: (nextValue) => onUpdateSideField(side, "additional", nextValue)}), undefined, isLandscape)}
            </>
          )}
        </View>
      )}
    </View>
  );
}
