import { Fragment, useMemo } from "react";
import { Text, View } from "react-native";

import { ProtocolActionButton } from "../../components/protocol/ProtocolActionButton";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { ProtocolOrganHeader, ProtocolSectionHeader } from "../../components/protocol/ProtocolHeaders";
import type { ThyroidLobeDraft } from "../../shared/thyroidDraft";
import { isNormalizedMatch } from "../../shared/normalizeSelectValue";
import type { AppStyles } from "../../styles/appStyles";
import {
  THYROID_VOLUME_FORMATIONS_OPTIONS,
  type EditorState,
} from "./thyroidFieldConfigs";
import { ThyroidNodeCard } from "./ThyroidNodeCard";
import type { ThyroidNodeDraft } from "../../shared/thyroidDraft";

type ThyroidLobePanelProps = {
  styles: AppStyles;
  side: "right" | "left";
  lobe: ThyroidLobeDraft;
  isVisible: boolean;
  fv: Record<string, boolean>;
  isLandscape?: boolean;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateLobeField: (side: "right" | "left", field: keyof ThyroidLobeDraft, value: string) => void;
  onAddNode: (side: "right" | "left") => void;
  onUpdateNodeField: (side: "right" | "left", index: number, field: keyof ThyroidNodeDraft, value: string) => void;
  onRemoveNode: (side: "right" | "left", index: number) => void;
};

export function ThyroidLobePanel({
  styles,
  side,
  lobe,
  isVisible,
  fv,
  isLandscape,
  openEditor,
  onUpdateLobeField,
  onAddNode,
  onUpdateNodeField,
  onRemoveNode,
}: ThyroidLobePanelProps) {
  const title = side === "right" ? "Правая доля" : "Левая доля";
  const showNodes = isNormalizedMatch(lobe.volumeFormations, "определяются");

  if (!isVisible) return null;

  // Размерные поля для сетки
  const sizeFields = useMemo(() => {
    const fields: Array<{ label: string; value: string; filled: boolean; onPress: () => void; readonly?: boolean }> = [];
    if (fv["thyroid.length"] !== false) {
      fields.push({
        label: "Длина (мм)",
        value: lobe.length || "Нажмите для ввода",
        filled: Boolean(lobe.length),
        onPress: () => openEditor({ title: `${title}: длина`, mode: "number", value: lobe.length, placeholder: "мм", onSave: (nextValue) => onUpdateLobeField(side, "length", nextValue) }),
      });
    }
    if (fv["thyroid.width"] !== false) {
      fields.push({
        label: "Ширина (мм)",
        value: lobe.width || "Нажмите для ввода",
        filled: Boolean(lobe.width),
        onPress: () => openEditor({ title: `${title}: ширина`, mode: "number", value: lobe.width, placeholder: "мм", onSave: (nextValue) => onUpdateLobeField(side, "width", nextValue) }),
      });
    }
    if (fv["thyroid.depth"] !== false) {
      fields.push({
        label: "Глубина (мм)",
        value: lobe.depth || "Нажмите для ввода",
        filled: Boolean(lobe.depth),
        onPress: () => openEditor({ title: `${title}: глубина`, mode: "number", value: lobe.depth, placeholder: "мм", onSave: (nextValue) => onUpdateLobeField(side, "depth", nextValue) }),
      });
    }
    if (fv["thyroid.volume"] !== false) {
      fields.push({
        label: "Объем (мл)",
        value: lobe.volume || "Рассчитывается автоматически",
        filled: Boolean(lobe.volume),
        onPress: () => {},
        readonly: true,
      });
    }
    return fields;
  }, [lobe, fv, title, side, openEditor, onUpdateLobeField]);

  const renderCompactRow = (label: string, value: string, filled: boolean, onPress: () => void, readonly?: boolean) => (
    <View style={{ width: "48.5%" }}>
      <ProtocolFieldRow
        label={label}
        value={value}
        typeLabel={readonly ? "auto" : "numpad"}
        filled={filled}
        readonly={readonly}
        compact={isLandscape}
        onPress={onPress}
      />
    </View>
  );

  return (
    <View style={styles.kidneyPlainSection} key={side}>
      <ProtocolOrganHeader title={title} />

      {isLandscape ? (
        <View style={{ gap: 8 }}>
          {(fv["thyroid.length"] !== false || fv["thyroid.width"] !== false || fv["thyroid.depth"] !== false || fv["thyroid.volume"] !== false) && (
            <ProtocolSectionHeader title="Размеры" />
          )}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {sizeFields.map((f, i) => renderCompactRow(f.label, f.value, f.filled, f.onPress, f.readonly))}
          </View>

          {fv["thyroid.volumeFormations"] !== false && (
            <>
              <ProtocolSectionHeader title="Объемные образования" />
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                <View style={{ width: "48.5%" }}>
                  <ProtocolFieldRow
                    label="Определение"
                    value={lobe.volumeFormations || "Нажмите для ввода"}
                    typeLabel="select"
                    filled={Boolean(lobe.volumeFormations)}
                    compact={isLandscape}
                    options={THYROID_VOLUME_FORMATIONS_OPTIONS}
                    onSelectOption={(nextValue) => onUpdateLobeField(side, "volumeFormations", nextValue)}
                  />
                </View>
              </View>

              {showNodes && (
                <View style={{ gap: 6 }}>
                  {lobe.nodesList.length === 0 ? (
                    <Text style={styles.helperText}>Добавьте хотя бы один узел.</Text>
                  ) : (
                    lobe.nodesList.map((node, index) => (
                      <ThyroidNodeCard
                        key={`${side}-thyroid-node-${index}`}
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

          {fv["thyroid.additional"] !== false && (
            <>
              <ProtocolSectionHeader title="Дополнительно" />
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                <View style={{ width: "48.5%" }}>
                  <ProtocolFieldRow
                    label="Дополнительно"
                    value={lobe.additional || "Нажмите для ввода"}
                    typeLabel="text"
                    filled={Boolean(lobe.additional)}
                    compact={isLandscape}
                    onPress={() =>
                      openEditor({
                        title: `${title}: дополнительно`,
                        mode: "text",
                        value: lobe.additional,
                        placeholder: "Введите дополнительное описание",
                        multiline: true,
                        onSave: (nextValue) => onUpdateLobeField(side, "additional", nextValue),
                      })
                    }
                  />
                </View>
              </View>
            </>
          )}
        </View>
      ) : (
        <View style={styles.obpFieldList}>
          <>
            {(fv["thyroid.length"] !== false || fv["thyroid.width"] !== false || fv["thyroid.depth"] !== false || fv["thyroid.volume"] !== false) && (
              <ProtocolSectionHeader title="Размеры" />
            )}
            {fv["thyroid.length"] !== false && (
              <ProtocolFieldRow
                label="Длина (мм)"
                value={lobe.length || "Нажмите для ввода"}
                typeLabel="numpad"
                filled={Boolean(lobe.length)}
                compact={isLandscape}
                onPress={() =>
                  openEditor({
                    title: `${title}: длина`,
                    mode: "number",
                    value: lobe.length,
                    placeholder: "мм",
                    onSave: (nextValue) => onUpdateLobeField(side, "length", nextValue),
                  })
                }
              />
            )}
            {fv["thyroid.width"] !== false && (
              <ProtocolFieldRow
                label="Ширина (мм)"
                value={lobe.width || "Нажмите для ввода"}
                typeLabel="numpad"
                filled={Boolean(lobe.width)}
                compact={isLandscape}
                onPress={() =>
                  openEditor({
                    title: `${title}: ширина`,
                    mode: "number",
                    value: lobe.width,
                    placeholder: "мм",
                    onSave: (nextValue) => onUpdateLobeField(side, "width", nextValue),
                  })
                }
              />
            )}
            {fv["thyroid.depth"] !== false && (
              <ProtocolFieldRow
                label="Глубина (мм)"
                value={lobe.depth || "Нажмите для ввода"}
                typeLabel="numpad"
                filled={Boolean(lobe.depth)}
                compact={isLandscape}
                onPress={() =>
                  openEditor({
                    title: `${title}: глубина`,
                    mode: "number",
                    value: lobe.depth,
                    placeholder: "мм",
                    onSave: (nextValue) => onUpdateLobeField(side, "depth", nextValue),
                  })
                }
              />
            )}
            {fv["thyroid.volume"] !== false && (
              <ProtocolFieldRow
                label="Объем (мл)"
                value={lobe.volume || "Рассчитывается автоматически"}
                typeLabel="auto"
                filled={Boolean(lobe.volume)}
                readonly
                compact={isLandscape}
              />
            )}
          </>

          {fv["thyroid.volumeFormations"] !== false && (
            <>
              <ProtocolSectionHeader title="Объемные образования" />
              <ProtocolFieldRow
                label="Определение"
                value={lobe.volumeFormations || "Нажмите для ввода"}
                typeLabel="select"
                filled={Boolean(lobe.volumeFormations)}
                compact={isLandscape}
                options={THYROID_VOLUME_FORMATIONS_OPTIONS}
                onSelectOption={(nextValue) => onUpdateLobeField(side, "volumeFormations", nextValue)}
              />

              {showNodes && (
                <View style={styles.obpFieldList}>
                  {lobe.nodesList.length === 0 ? (
                    <Text style={styles.helperText}>Добавьте хотя бы один узел.</Text>
                  ) : (
                    lobe.nodesList.map((node, index) => (
                      <ThyroidNodeCard
                        key={`${side}-thyroid-node-${index}`}
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

          {fv["thyroid.additional"] !== false && (
            <>
              <ProtocolSectionHeader title="Дополнительно" />
              <ProtocolFieldRow
                label="Дополнительно"
                value={lobe.additional || "Нажмите для ввода"}
                typeLabel="text"
                filled={Boolean(lobe.additional)}
                compact={isLandscape}
                onPress={() =>
                  openEditor({
                    title: `${title}: дополнительно`,
                    mode: "text",
                    value: lobe.additional,
                    placeholder: "Введите дополнительное описание",
                    multiline: true,
                    onSave: (nextValue) => onUpdateLobeField(side, "additional", nextValue),
                  })
                }
              />
            </>
          )}
        </View>
      )}
    </View>
  );
}
