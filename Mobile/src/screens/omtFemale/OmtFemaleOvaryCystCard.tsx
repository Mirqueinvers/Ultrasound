import { Pressable, Text, View } from "react-native";

import type { OvaryCystDraft } from "../../shared/omtFemaleDraft";
import type { AppStyles } from "../../styles/appStyles";
import { type EditorState, splitPairSize } from "./omtFemaleFieldConfigs";

type OmtFemaleOvaryCystCardProps = {
  styles: AppStyles;
  cyst: OvaryCystDraft;
  index: number;
  side: "left" | "right";
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateCyst: (side: "left" | "right", index: number, first?: string, second?: string) => void;
  onRemoveCyst: (side: "left" | "right", index: number) => void;
};

export function OmtFemaleOvaryCystCard({
  styles, cyst, index, side, openEditor, onUpdateCyst, onRemoveCyst,
}: OmtFemaleOvaryCystCardProps) {
  const [size1 = "", size2 = ""] = splitPairSize(cyst.size);

  return (
    <View style={styles.obpFieldList}>
      <View style={styles.dualRow}>
        <View style={styles.dualCol}>
          <Pressable onPress={() => openEditor({ title: `Киста #${index + 1}: размер 1`, mode: "number", value: size1, placeholder: "мм", onSave: (v) => onUpdateCyst(side, index, v) })}
            style={({ pressed }) => [styles.obpFieldRow, size1.trim().length > 0 && styles.obpFieldRowFilled, pressed && styles.obpFieldRowPressed]}>
            <View style={styles.obpFieldRowContent}>
              <Text style={styles.obpFieldLabel}>Размер 1</Text>
              <Text style={styles.obpFieldValue}>{size1 || "Нажмите для ввода"}</Text>
            </View>
            <Text style={styles.obpFieldType}>numpad</Text>
          </Pressable>
        </View>
        <View style={styles.dualCol}>
          <Pressable onPress={() => openEditor({ title: `Киста #${index + 1}: размер 2`, mode: "number", value: size2, placeholder: "мм", onSave: (v) => onUpdateCyst(side, index, undefined, v) })}
            style={({ pressed }) => [styles.obpFieldRow, size2.trim().length > 0 && styles.obpFieldRowFilled, pressed && styles.obpFieldRowPressed]}>
            <View style={styles.obpFieldRowContent}>
              <Text style={styles.obpFieldLabel}>Размер 2</Text>
              <Text style={styles.obpFieldValue}>{size2 || "Нажмите для ввода"}</Text>
            </View>
            <Text style={styles.obpFieldType}>numpad</Text>
          </Pressable>
        </View>
      </View>
      <Pressable onPress={() => onRemoveCyst(side, index)}
        style={({ pressed }) => [styles.obpFieldRow, pressed && styles.obpFieldRowPressed]}>
        <Text style={[styles.obpFieldLabel, { color: "#e74c3c" }]}>Удалить кисту</Text>
      </Pressable>
    </View>
  );
}
