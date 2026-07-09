import { Pressable, Text, View } from "react-native";
import type { LayoutChangeEvent } from "react-native";

import { ProtocolActionButton } from "../../components/protocol/ProtocolActionButton";
import { ProtocolCard } from "../../components/protocol/ProtocolCard";
import type { KidneyConcrementDraft } from "../../shared/kidneyDraft";
import type { AppStyles } from "../../styles/appStyles";
import { KIDNEY_LOCATION_OPTIONS, type EditorState } from "./kidneysFieldConfigs";

export type NumpadApi = {
  isLandscape: boolean;
  fieldRefs: React.MutableRefObject<Record<string, View | null>>;
  openNumpad: (fieldKey: string, fieldView: View | null, initialValue?: string, onChange?: (value: string) => void) => void;
  handleFieldLayout: (fieldKey: string, event: LayoutChangeEvent) => void;
};

type KidneyConcrementSectionProps = {
  styles: AppStyles;
  sectionTitle: string;
  items: KidneyConcrementDraft[];
  listKey: "parenchymaConcrementslist" | "pcsConcrementslist";
  emptyText: string;
  side: "rightKidney" | "leftKidney";
  openEditor: (config: NonNullable<EditorState>) => void;
  onAdd: (side: "rightKidney" | "leftKidney", listKey: "parenchymaConcrementslist" | "pcsConcrementslist") => void;
  onRemove: (
    side: "rightKidney" | "leftKidney",
    listKey: "parenchymaConcrementslist" | "pcsConcrementslist",
    index: number,
  ) => void;
  onUpdateItem: (
    side: "rightKidney" | "leftKidney",
    listKey: "parenchymaConcrementslist" | "pcsConcrementslist",
    index: number,
    field: keyof KidneyConcrementDraft,
    value: string,
  ) => void;
  numpadApi?: NumpadApi;
};

export function KidneyConcrementSection({
  styles,
  sectionTitle,
  items,
  listKey,
  emptyText,
  side,
  openEditor,
  onAdd,
  onRemove,
  onUpdateItem,
  numpadApi,
}: KidneyConcrementSectionProps) {
  const isLandscape = numpadApi?.isLandscape ?? false;

  return (
    <ProtocolCard title={sectionTitle} countText={`${items.length} items`}>
      <ProtocolActionButton
        label="+ Конкремент"
        onPress={() => onAdd(side, listKey)}
      />

      <View style={styles.obpFieldList}>
        {items.length === 0 ? (
          <Text style={styles.helperText}>{emptyText}</Text>
        ) : (
          items.map((item, index) => (
            <ProtocolCard
              key={`${listKey}-${index}`}
              title={`Конкремент #${index + 1}`}
              subtitle="Нажмите для редактирования"
              actionLabel="Удалить"
              actionVariant="danger"
              onActionPress={() => onRemove(side, listKey, index)}
              variant="item"
            >
              <View style={styles.obpFieldList}>
                {(["size", "location"] as const).map((itemField) => {
                  const fieldKey = `${listKey}-${index}-${itemField}`;

                  if (itemField === "size" && isLandscape && numpadApi) {
                    return (
                      <View
                        key={fieldKey}
                        ref={(el) => { numpadApi.fieldRefs.current[fieldKey] = el; }}
                        onLayout={(event) => numpadApi.handleFieldLayout(fieldKey, event)}
                      >
                        <Pressable
                          onPress={() => {
                            const fieldView = numpadApi.fieldRefs.current[fieldKey] ?? null;
                            numpadApi.openNumpad(
                              fieldKey,
                              fieldView,
                              item[itemField],
                              (nextValue) => onUpdateItem(side, listKey, index, itemField, nextValue),
                            );
                          }}
                          style={({ pressed }) => [
                            styles.obpFieldRow,
                            item[itemField].trim().length > 0 && styles.obpFieldRowFilled,
                            pressed && styles.obpFieldRowPressed,
                          ]}
                        >
                          <View style={styles.obpFieldRowContent}>
                            <Text style={styles.obpFieldLabel}>Размер</Text>
                            <Text style={styles.obpFieldValue}>
                              {item[itemField] || "Нажмите для ввода"}
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
                      onPress={() =>
                        openEditor({
                          title: `${itemField === "size" ? "Размер" : "Локализация"} #${index + 1}`,
                          mode: itemField === "size" ? "number" : "select",
                          value: item[itemField],
                          placeholder: itemField === "size" ? "мм" : undefined,
                          options:
                            itemField === "location" ? KIDNEY_LOCATION_OPTIONS : undefined,
                          onSave: (nextValue) =>
                            onUpdateItem(side, listKey, index, itemField, nextValue),
                        })
                      }
                      style={({ pressed }) => [
                        styles.obpFieldRow,
                        item[itemField].trim().length > 0 && styles.obpFieldRowFilled,
                        pressed && styles.obpFieldRowPressed,
                      ]}
                    >
                      <View style={styles.obpFieldRowContent}>
                        <Text style={styles.obpFieldLabel}>
                          {itemField === "size" ? "Размер" : "Локализация"}
                        </Text>
                        <Text style={styles.obpFieldValue}>
                          {item[itemField] || "Нажмите для ввода"}
                        </Text>
                      </View>
                      <Text style={styles.obpFieldType}>
                        {itemField === "size" ? "numpad" : "select"}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ProtocolCard>
          ))
        )}
      </View>
    </ProtocolCard>
  );
}