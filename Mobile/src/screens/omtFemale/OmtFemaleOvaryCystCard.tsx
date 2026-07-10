import type { LayoutChangeEvent } from "react-native";
import { Pressable, Text, View } from "react-native";

import type { OvaryCystDraft } from "../../shared/omtFemaleDraft";
import type { AppStyles } from "../../styles/appStyles";
import { type EditorState, splitPairSize } from "./omtFemaleFieldConfigs";

import type { NumpadApi } from "../../components/InlineNumpad";

type OmtFemaleOvaryCystCardProps = {
  styles: AppStyles;
  cyst: OvaryCystDraft;
  index: number;
  side: "left" | "right";
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateCyst: (side: "left" | "right", index: number, first?: string, second?: string) => void;
  onRemoveCyst: (side: "left" | "right", index: number) => void;
  numpadApi: NumpadApi;
};

export function OmtFemaleOvaryCystCard({
  styles, cyst, index, side, openEditor, onUpdateCyst, onRemoveCyst, numpadApi,
}: OmtFemaleOvaryCystCardProps) {
  const [size1 = "", size2 = ""] = splitPairSize(cyst.size);
  const isLandscape = numpadApi.isLandscape;

  const handleSizePress = (fieldLabel: string, sizeIndex: 1 | 2) => {
    if (!isLandscape) {
      openEditor({ title: `Киста #${index + 1}: ${fieldLabel}`, mode: "number", value: sizeIndex === 1 ? size1 : size2, placeholder: "мм", onSave: (v) => onUpdateCyst(side, index, sizeIndex === 1 ? v : undefined, sizeIndex === 2 ? v : undefined) });
      return;
    }
    const key = `ovary-${side}-cyst-${index}-size${sizeIndex}`;
    return () => {
      const fieldView = numpadApi.fieldRefs.current[key] ?? null;
      numpadApi.openNumpad(
        key,
        fieldView,
        sizeIndex === 1 ? size1 : size2,
        (nextValue) => onUpdateCyst(side, index, sizeIndex === 1 ? nextValue : undefined, sizeIndex === 2 ? nextValue : undefined),
      );
    };
  };

  return (
    <View style={styles.obpFieldList}>
      <View style={styles.dualRow}>
        <View style={styles.dualCol}>
          <View
            ref={(el) => { if (isLandscape) numpadApi.fieldRefs.current[`ovary-${side}-cyst-${index}-size1`] = el; }}
            onLayout={isLandscape ? (e) => numpadApi.handleFieldLayout(`ovary-${side}-cyst-${index}-size1`, e) : undefined}
          >
            <Pressable onPress={isLandscape ? handleSizePress("Размер 1", 1) as any : () => openEditor({ title: `Киста #${index + 1}: размер 1`, mode: "number", value: size1, placeholder: "мм", onSave: (v) => onUpdateCyst(side, index, v) })}
              style={({ pressed }) => [styles.obpFieldRow, size1.trim().length > 0 && styles.obpFieldRowFilled, pressed && styles.obpFieldRowPressed]}>
              <View style={styles.obpFieldRowContent}>
                <Text style={styles.obpFieldLabel}>Размер 1</Text>
                <Text style={styles.obpFieldValue}>{size1 || "Нажмите для ввода"}</Text>
              </View>
              <Text style={styles.obpFieldType}>numpad</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.dualCol}>
          <View
            ref={(el) => { if (isLandscape) numpadApi.fieldRefs.current[`ovary-${side}-cyst-${index}-size2`] = el; }}
            onLayout={isLandscape ? (e) => numpadApi.handleFieldLayout(`ovary-${side}-cyst-${index}-size2`, e) : undefined}
          >
            <Pressable onPress={isLandscape ? handleSizePress("Размер 2", 2) as any : () => openEditor({ title: `Киста #${index + 1}: размер 2`, mode: "number", value: size2, placeholder: "мм", onSave: (v) => onUpdateCyst(side, index, undefined, v) })}
              style={({ pressed }) => [styles.obpFieldRow, size2.trim().length > 0 && styles.obpFieldRowFilled, pressed && styles.obpFieldRowPressed]}>
              <View style={styles.obpFieldRowContent}>
                <Text style={styles.obpFieldLabel}>Размер 2</Text>
                <Text style={styles.obpFieldValue}>{size2 || "Нажмите для ввода"}</Text>
              </View>
              <Text style={styles.obpFieldType}>numpad</Text>
            </Pressable>
          </View>
        </View>
      </View>
      <Pressable onPress={() => onRemoveCyst(side, index)}
        style={({ pressed }) => [styles.obpFieldRow, pressed && styles.obpFieldRowPressed]}>
        <Text style={[styles.obpFieldLabel, { color: "#e74c3c" }]}>Удалить кисту</Text>
      </Pressable>
    </View>
  );
}