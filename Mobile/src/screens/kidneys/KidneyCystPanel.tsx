import { Pressable, Text, View } from "react-native";

import { ProtocolActionButton } from "../../components/protocol/ProtocolActionButton";
import { ProtocolCard } from "../../components/protocol/ProtocolCard";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import type { KidneyCystDraft, KidneyDraft } from "../../shared/kidneyDraft";
import type { AppStyles } from "../../styles/appStyles";
import {
  KIDNEY_LOCATION_OPTIONS,
  type EditorState,
  splitPairSize,
  joinPairSize,
} from "./kidneysFieldConfigs";

type KidneyCystPanelProps = {
  styles: AppStyles;
  title: string;
  cysts: KidneyCystDraft[];
  multiple: boolean;
  multipleSize: string;
  side: "rightKidney" | "leftKidney";
  cystListKey: "pcsCystslist" | "parenchymaCystslist";
  multipleKey: "pcsMultipleCysts" | "parenchymaMultipleCysts";
  openEditor: (config: NonNullable<EditorState>) => void;
  onToggleMultiple: (
    side: "rightKidney" | "leftKidney",
    key: "parenchymaMultipleCysts" | "pcsMultipleCysts",
  ) => void;
  onAdd: (
    side: "rightKidney" | "leftKidney",
    listKey: "parenchymaCystslist" | "pcsCystslist",
  ) => void;
  onRemove: (
    side: "rightKidney" | "leftKidney",
    listKey: "parenchymaCystslist" | "pcsCystslist",
    index: number,
  ) => void;
  onUpdateCystSize: (
    side: "rightKidney" | "leftKidney",
    listKey: "parenchymaCystslist" | "pcsCystslist",
    index: number,
    nextFirst?: string,
    nextSecond?: string,
  ) => void;
  onUpdateField: (
    side: "rightKidney" | "leftKidney",
    field: keyof KidneyDraft,
    value: string,
  ) => void;
  onUpdateListItem: (
    side: "rightKidney" | "leftKidney",
    listKey: "parenchymaCystslist" | "pcsCystslist",
    index: number,
    field: keyof KidneyCystDraft,
    value: string,
  ) => void;
};

export function KidneyCystPanel({
  styles,
  title,
  cysts,
  multiple,
  multipleSize,
  side,
  cystListKey,
  multipleKey,
  openEditor,
  onToggleMultiple,
  onAdd,
  onRemove,
  onUpdateCystSize,
  onUpdateField,
  onUpdateListItem,
}: KidneyCystPanelProps) {
  const multipleSizeField =
    multipleKey === "pcsMultipleCysts" ? "pcsMultipleCystsSize" : "parenchymaMultipleCystsSize";

  return (
    <ProtocolCard title={title} countText={`${cysts.length} items`}>
      <View style={styles.obpFieldList}>
        <ProtocolActionButton
          label={multiple ? "Множественные кисты: да" : "Множественные кисты: нет"}
          variant="secondary"
          compact
          onPress={() => onToggleMultiple(side, multipleKey)}
        />

        {multiple && (() => {
          const [multipleSize1 = "", multipleSize2 = ""] = splitPairSize(multipleSize);

          return (
            <View style={styles.obpFieldList}>
              <Pressable
                onPress={() =>
                  openEditor({
                    title: `Размер 1 множественных кист${title === "Кисты ЧЛС" ? " ЧЛС" : ""}`,
                    mode: "number",
                    value: multipleSize1,
                    placeholder: "мм",
                    onSave: (nextValue) =>
                      onUpdateField(
                        side,
                        multipleSizeField as keyof import("../../shared/kidneyDraft").KidneyDraft,
                        joinPairSize(nextValue, multipleSize2),
                      ),
                  })
                }
                style={({ pressed }) => [
                  styles.obpFieldRow,
                  multipleSize1.trim().length > 0 && styles.obpFieldRowFilled,
                  pressed && styles.obpFieldRowPressed,
                ]}
              >
                <View style={styles.obpFieldRowContent}>
                  <Text style={styles.obpFieldLabel}>Размер 1</Text>
                  <Text style={styles.obpFieldValue}>
                    {multipleSize1 || "Нажмите для ввода"}
                  </Text>
                </View>
                <Text style={styles.obpFieldType}>numpad</Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  openEditor({
                    title: `Размер 2 множественных кист${title === "Кисты ЧЛС" ? " ЧЛС" : ""}`,
                    mode: "number",
                    value: multipleSize2,
                    placeholder: "мм",
                    onSave: (nextValue) =>
                      onUpdateField(
                        side,
                        multipleSizeField as keyof import("../../shared/kidneyDraft").KidneyDraft,
                        joinPairSize(multipleSize1, nextValue),
                      ),
                  })
                }
                style={({ pressed }) => [
                  styles.obpFieldRow,
                  multipleSize2.trim().length > 0 && styles.obpFieldRowFilled,
                  pressed && styles.obpFieldRowPressed,
                ]}
              >
                <View style={styles.obpFieldRowContent}>
                  <Text style={styles.obpFieldLabel}>Размер 2</Text>
                  <Text style={styles.obpFieldValue}>
                    {multipleSize2 || "Нажмите для ввода"}
                  </Text>
                </View>
                <Text style={styles.obpFieldType}>numpad</Text>
              </Pressable>
            </View>
          );
        })()}

        {cysts.length === 0 ? (
          <Text style={styles.helperText}>Добавьте хотя бы одну кисту.</Text>
        ) : (
          cysts.map((item, index) => {
            const [size1 = "", size2 = ""] = splitPairSize(item.size);

            return (
              <ProtocolCard
                key={`${cystListKey}-${index}`}
                title={`Киста #${index + 1}`}
                subtitle="Нажмите для редактирования"
                actionLabel="Удалить"
                actionVariant="danger"
                onActionPress={() => onRemove(side, cystListKey, index)}
                variant="item"
              >
                <View style={styles.obpFieldList}>
                  <Pressable
                    onPress={() =>
                      openEditor({
                        title: `Размер 1 #${index + 1}`,
                        mode: "number",
                        value: size1,
                        placeholder: "мм",
                        onSave: (nextValue) =>
                          onUpdateCystSize(side, cystListKey, index, nextValue),
                      })
                    }
                    style={({ pressed }) => [
                      styles.obpFieldRow,
                      size1.trim().length > 0 && styles.obpFieldRowFilled,
                      pressed && styles.obpFieldRowPressed,
                    ]}
                  >
                    <View style={styles.obpFieldRowContent}>
                      <Text style={styles.obpFieldLabel}>Размер 1</Text>
                      <Text style={styles.obpFieldValue}>
                        {size1 || "Нажмите для ввода"}
                      </Text>
                    </View>
                    <Text style={styles.obpFieldType}>numpad</Text>
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      openEditor({
                        title: `Размер 2 #${index + 1}`,
                        mode: "number",
                        value: size2,
                        placeholder: "мм",
                        onSave: (nextValue) =>
                          onUpdateCystSize(side, cystListKey, index, undefined, nextValue),
                      })
                    }
                    style={({ pressed }) => [
                      styles.obpFieldRow,
                      size2.trim().length > 0 && styles.obpFieldRowFilled,
                      pressed && styles.obpFieldRowPressed,
                    ]}
                  >
                    <View style={styles.obpFieldRowContent}>
                      <Text style={styles.obpFieldLabel}>Размер 2</Text>
                      <Text style={styles.obpFieldValue}>
                        {size2 || "Нажмите для ввода"}
                      </Text>
                    </View>
                    <Text style={styles.obpFieldType}>numpad</Text>
                  </Pressable>

                  <ProtocolFieldRow
                    label="Локализация"
                    value={item.location || "Нажмите для ввода"}
                    typeLabel="select"
                    filled={item.location.trim().length > 0}
                    options={KIDNEY_LOCATION_OPTIONS}
                    onSelectOption={(nextValue) =>
                      onUpdateListItem(side, cystListKey, index, "location", nextValue)
                    }
                  />
                </View>
              </ProtocolCard>
            );
          })
        )}

        <ProtocolActionButton
          label="+ Киста"
          onPress={() => onAdd(side, cystListKey)}
        />
      </View>
    </ProtocolCard>
  );
}
