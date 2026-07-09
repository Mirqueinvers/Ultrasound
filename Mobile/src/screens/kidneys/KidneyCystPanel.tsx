import { Pressable, Text, View } from "react-native";
import type { LayoutChangeEvent } from "react-native";
import type { NumpadApi } from "./KidneyConcrementSection";

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
  numpadApi?: NumpadApi;
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
  numpadApi,
}: KidneyCystPanelProps) {
  const multipleSizeField =
    multipleKey === "pcsMultipleCysts" ? "pcsMultipleCystsSize" : "parenchymaMultipleCystsSize";
  const isLandscape = numpadApi?.isLandscape ?? false;

  const renderNumpadField = (
    fieldKey: string,
    label: string,
    currentValue: string,
    onPress: () => void,
    onChange?: (nextValue: string) => void,
  ) => {
    if (isLandscape && numpadApi) {
      return (
        <View
          key={fieldKey}
          ref={(el) => { numpadApi.fieldRefs.current[fieldKey] = el; }}
          onLayout={(event) => numpadApi.handleFieldLayout(fieldKey, event)}
        >
          <Pressable
            onPress={() => {
              const fieldView = numpadApi.fieldRefs.current[fieldKey] ?? null;
              numpadApi.openNumpad(fieldKey, fieldView, currentValue, onChange);
            }}
            style={({ pressed }) => [
              styles.obpFieldRow,
              currentValue.trim().length > 0 && styles.obpFieldRowFilled,
              pressed && styles.obpFieldRowPressed,
            ]}
          >
            <View style={styles.obpFieldRowContent}>
              <Text style={styles.obpFieldLabel}>{label}</Text>
              <Text style={styles.obpFieldValue}>
                {currentValue || "Нажмите для ввода"}
              </Text>
            </View>
            <Text style={styles.obpFieldType}>numpad</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <Pressable
        key={fieldKey}
        onPress={onPress}
        style={({ pressed }) => [
          styles.obpFieldRow,
          currentValue.trim().length > 0 && styles.obpFieldRowFilled,
          pressed && styles.obpFieldRowPressed,
        ]}
      >
        <View style={styles.obpFieldRowContent}>
          <Text style={styles.obpFieldLabel}>{label}</Text>
          <Text style={styles.obpFieldValue}>
            {currentValue || "Нажмите для ввода"}
          </Text>
        </View>
        <Text style={styles.obpFieldType}>numpad</Text>
      </Pressable>
    );
  };

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
          const multipleSize1Key = `${multipleKey}-multipleSize1`;
          const multipleSize2Key = `${multipleKey}-multipleSize2`;

          return (
            <View style={styles.obpFieldList}>
              {renderNumpadField(
                multipleSize1Key,
                "Размер 1",
                multipleSize1,
                () =>
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
                  }),
                (nextValue) =>
                  onUpdateField(
                    side,
                    multipleSizeField as keyof import("../../shared/kidneyDraft").KidneyDraft,
                    joinPairSize(nextValue, multipleSize2),
                  ),
              )}

              {renderNumpadField(
                multipleSize2Key,
                "Размер 2",
                multipleSize2,
                () =>
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
                  }),
                (nextValue) =>
                  onUpdateField(
                    side,
                    multipleSizeField as keyof import("../../shared/kidneyDraft").KidneyDraft,
                    joinPairSize(multipleSize1, nextValue),
                  ),
              )}
            </View>
          );
        })()}

        {cysts.length === 0 ? (
          <Text style={styles.helperText}>Добавьте хотя бы одну кисту.</Text>
        ) : (
          cysts.map((item, index) => {
            const [size1 = "", size2 = ""] = splitPairSize(item.size);
            const size1Key = `${cystListKey}-${index}-size1`;
            const size2Key = `${cystListKey}-${index}-size2`;

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
                  {renderNumpadField(
                    size1Key,
                    "Размер 1",
                    size1,
                    () =>
                      openEditor({
                        title: `Размер 1 #${index + 1}`,
                        mode: "number",
                        value: size1,
                        placeholder: "мм",
                        onSave: (nextValue) =>
                          onUpdateCystSize(side, cystListKey, index, nextValue),
                      }),
                    (nextValue) =>
                      onUpdateCystSize(side, cystListKey, index, nextValue),
                  )}

                  {renderNumpadField(
                    size2Key,
                    "Размер 2",
                    size2,
                    () =>
                      openEditor({
                        title: `Размер 2 #${index + 1}`,
                        mode: "number",
                        value: size2,
                        placeholder: "мм",
                        onSave: (nextValue) =>
                          onUpdateCystSize(side, cystListKey, index, undefined, nextValue),
                      }),
                    (nextValue) =>
                      onUpdateCystSize(side, cystListKey, index, undefined, nextValue),
                  )}

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