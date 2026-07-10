import { Fragment, useCallback, useMemo, useRef } from "react";
import { Text, View } from "react-native";

import { InlineNumpad } from "../../components/InlineNumpad";
import { ProtocolActionButton } from "../../components/protocol/ProtocolActionButton";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { ProtocolOrganHeader, ProtocolSectionHeader } from "../../components/protocol/ProtocolHeaders";
import type { ThyroidLobeDraft } from "../../shared/thyroidDraft";
import { isNormalizedMatch } from "../../shared/normalizeSelectValue";
import type { AppStyles } from "../../styles/appStyles";
import { useInlineNumpad } from "../../hooks/useInlineNumpad";
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

  // ---- Landscape: numpad ----
  const landscapeRef = useRef<View>(null);
  const fieldRefs = useRef<Record<string, View | null>>({});
  const numpad = useInlineNumpad(landscapeRef);
  const hasValue = (v: string) => v.trim().length > 0;

  const handleNumpadChange = useCallback(
    (fieldKey: keyof ThyroidLobeDraft, nextValue: string) => {
      onUpdateLobeField(side, fieldKey, nextValue);
    },
    [onUpdateLobeField, side],
  );

  const openFieldEditor = useCallback(
    (fieldKey: keyof ThyroidLobeDraft, label: string, placeholder: string) => {
      const currentValue = lobe[fieldKey];
      const stringValue = typeof currentValue === "string" ? currentValue : "";
      openEditor({
        title: `${title}: ${label}`,
        mode: "number",
        value: stringValue,
        placeholder,
        onSave: (nextValue) => onUpdateLobeField(side, fieldKey, nextValue),
      });
    },
    [lobe, title, openEditor, onUpdateLobeField, side],
  );

  const openLandscapeNumpad = useCallback(
    (fieldKey: keyof ThyroidLobeDraft) => {
      const fieldView = fieldRefs.current[fieldKey] ?? null;
      numpad.openNumpad(fieldKey, fieldView);
    },
    [numpad],
  );

  // Размерные поля для сетки
  const sizeFields = useMemo(() => {
    const fields: Array<{ key: keyof ThyroidLobeDraft; label: string; value: string; filled: boolean; readonly?: boolean; onPress?: () => void }> = [];
    if (fv["thyroid.length"] !== false) {
      fields.push({
        key: "length",
        label: "Длина (мм)",
        value: lobe.length || "Нажмите для ввода",
        filled: Boolean(lobe.length),
        onPress: () => isLandscape ? openLandscapeNumpad("length") : openFieldEditor("length", "длина", "мм"),
      });
    }
    if (fv["thyroid.width"] !== false) {
      fields.push({
        key: "width",
        label: "Ширина (мм)",
        value: lobe.width || "Нажмите для ввода",
        filled: Boolean(lobe.width),
        onPress: () => isLandscape ? openLandscapeNumpad("width") : openFieldEditor("width", "ширина", "мм"),
      });
    }
    if (fv["thyroid.depth"] !== false) {
      fields.push({
        key: "depth",
        label: "Глубина (мм)",
        value: lobe.depth || "Нажмите для ввода",
        filled: Boolean(lobe.depth),
        onPress: () => isLandscape ? openLandscapeNumpad("depth") : openFieldEditor("depth", "глубина", "мм"),
      });
    }
    if (fv["thyroid.volume"] !== false) {
      fields.push({
        key: "volume" as keyof ThyroidLobeDraft,
        label: "Объем (мл)",
        value: lobe.volume || "Рассчитывается автоматически",
        filled: Boolean(lobe.volume),
        readonly: true,
      });
    }
    return fields;
  }, [lobe, fv, isLandscape, openLandscapeNumpad, openFieldEditor]);

  if (!isVisible) return null;

  const renderCompactRow = (
    fieldKey: keyof ThyroidLobeDraft,
    label: string,
    value: string,
    filled: boolean,
    readonly?: boolean,
    onPress?: () => void,
  ) => (
    <View
      key={fieldKey}
      ref={(el) => { fieldRefs.current[fieldKey] = el; }}
      onLayout={(event) => numpad.handleFieldLayout(fieldKey, event)}
      style={{ width: "48.5%" }}
    >
      <ProtocolFieldRow
        label={label}
        value={value}
        typeLabel={readonly ? "auto" : "numpad"}
        filled={filled}
        readonly={readonly}
        compact={isLandscape}
        onPress={readonly ? undefined : onPress}
      />
    </View>
  );

  return (
    <View style={styles.kidneyPlainSection} key={side}>
      <ProtocolOrganHeader title={title} />

      {isLandscape ? (
        <View ref={landscapeRef} style={{ gap: 8, position: "relative" }}>
          {(fv["thyroid.length"] !== false || fv["thyroid.width"] !== false || fv["thyroid.depth"] !== false || fv["thyroid.volume"] !== false) && (
            <ProtocolSectionHeader title="Размеры" />
          )}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {sizeFields.map((f) =>
              renderCompactRow(f.key, f.label, f.value, f.filled, f.readonly, f.onPress),
            )}
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
                      isLandscape={isLandscape}
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

          {/* InlineNumpad */}
          {numpad.activeNumpadField != null && numpad.numpadPosition && (() => {
            const activeFieldKey = numpad.activeNumpadField as keyof ThyroidLobeDraft;
            const activeValue = typeof lobe[activeFieldKey] === "string" ? lobe[activeFieldKey] as string : "";
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
                  value={activeValue}
                  onValueChange={(nextValue) => handleNumpadChange(activeFieldKey, nextValue)}
                  onClose={numpad.closeNumpad}
                />
              </View>
            );
          })()}
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