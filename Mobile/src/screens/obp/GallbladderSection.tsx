import { Fragment } from "react";
import { Pressable, Text, View } from "react-native";
import type { AppStyles } from "../../styles/appStyles";
import type { FieldVisibility } from "../../settings/fieldVisibility";
import type { GallbladderConcretionDraft, GallbladderDraft, GallbladderPolypDraft } from "../../shared/obpDraft";
import { ProtocolOrganHeader, ProtocolSectionHeader } from "../../components/protocol/ProtocolHeaders";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { ProtocolCard } from "../../components/protocol/ProtocolCard";
import { ProtocolActionButton } from "../../components/protocol/ProtocolActionButton";
import { GALLBLADDER_FIELDS, GALLBLADDER_CONCRETION_FIELDS, GALLBLADDER_POLYP_FIELDS } from "./obpFieldConfigs";
import { isFieldVisible } from "../../shared/isFieldVisible";
import type { EditorState } from "./useObpEditor";

const GALLBLADDER_SECTION_HEADERS: Record<string, string> = {
  position: "Положение",
  length: "Размеры",
  shape: "Форма",
  contentType: "Содержимое",
};

type GallbladderSectionProps = {
  styles: AppStyles;
  fieldVisibility: FieldVisibility;
  gallbladder: GallbladderDraft;
  isCholecystectomy: boolean;
  hasConcretions: boolean;
  hasPolyps: boolean;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateField: (field: keyof GallbladderDraft, value: string) => void;
  onUpdateConcretionItem: (index: number, field: keyof GallbladderConcretionDraft, value: string) => void;
  onUpdatePolypItem: (index: number, field: keyof GallbladderPolypDraft, value: string) => void;
  onDeleteConcretion: (index: number) => void;
  onDeletePolyp: (index: number) => void;
  onAddConcretion: () => void;
  onAddPolyp: () => void;
};

export function GallbladderSection({
  styles,
  fieldVisibility,
  gallbladder,
  isCholecystectomy,
  hasConcretions,
  hasPolyps,
  openEditor,
  onUpdateField,
  onUpdateConcretionItem,
  onUpdatePolypItem,
  onDeleteConcretion,
  onDeletePolyp,
  onAddConcretion,
  onAddPolyp,
}: GallbladderSectionProps) {
  const hasValue = (v: string) => v.trim().length > 0;

  return (
    <>
      <ProtocolOrganHeader title="Желчный пузырь" />
      <View style={styles.obpFieldList}>
        {GALLBLADDER_FIELDS.map((field) => {
          if (field.hiddenWhenCholecystectomy && isCholecystectomy) {
            return null;
          }
          if (!isFieldVisible(field, fieldVisibility)) {
            return null;
          }

          const currentValue = gallbladder[field.key];
          const displayValue = currentValue || "Нажмите для ввода";

          const fieldRow = (
            <ProtocolFieldRow
              key={field.key}
              label={field.label}
              value={displayValue}
              typeLabel={field.kind === "number" ? "numpad" : field.kind}
              filled={hasValue(currentValue)}
              onPress={field.kind === "select" ? undefined : () => {
                openEditor({
                  title: field.label,
                  mode: field.kind,
                  value: currentValue,
                  placeholder: field.placeholder,
                  multiline: field.multiline,
                  options: field.options,
                  onSave: (nextValue) => onUpdateField(field.key, nextValue),
                });
              }}
              options={field.kind === "select" ? field.options : undefined}
              onSelectOption={field.kind === "select" ? (nextValue) => onUpdateField(field.key, nextValue) : undefined}
            />
          );

          if (field.key === "concretions") {
            return (
              <Fragment key={field.key}>
                {fieldRow}
                {!isCholecystectomy && hasConcretions && (
                  <View style={styles.obpFieldList}>
                    <ProtocolSectionHeader
                      title="Конкременты"
                      note={`${gallbladder.concretionsList.length} items`}
                    />
                    <View style={styles.obpFieldList}>
                      {gallbladder.concretionsList.length === 0 ? (
                        <Text style={styles.helperText}>Добавьте хотя бы один конкремент.</Text>
                      ) : (
                        gallbladder.concretionsList.map((item, index) => (
                          <ProtocolCard
                            key={`concretion-${index}`}
                            title={`Конкремент #${index + 1}`}
                            subtitle="Нажмите для редактирования"
                            actionLabel="Удалить"
                            actionVariant="danger"
                            onActionPress={() => onDeleteConcretion(index)}
                            variant="item"
                          >
                            <View style={styles.obpFieldList}>
                              {GALLBLADDER_CONCRETION_FIELDS.map((itemField) => {
                                const currentItemValue = item[itemField.key];
                                const itemDisplayValue = currentItemValue || "Нажмите для ввода";
                                return (
                                  <ProtocolFieldRow
                                    key={itemField.key}
                                    label={itemField.label}
                                    value={itemDisplayValue}
                                    typeLabel={itemField.kind === "number" ? "numpad" : itemField.kind}
                                    filled={hasValue(currentItemValue)}
                                    onPress={itemField.kind === "select" ? undefined : () => {
                                      openEditor({
                                        title: `${itemField.label} #${index + 1}`,
                                        mode: itemField.kind,
                                        value: currentItemValue,
                                        placeholder: itemField.placeholder,
                                        options: itemField.options,
                                        onSave: (nextValue) =>
                                          onUpdateConcretionItem(index, itemField.key, nextValue),
                                      });
                                    }}
                                    options={itemField.kind === "select" ? itemField.options : undefined}
                                    onSelectOption={itemField.kind === "select"
                                      ? (nextValue) => onUpdateConcretionItem(index, itemField.key, nextValue)
                                      : undefined}
                                  />
                                );
                              })}
                            </View>
                          </ProtocolCard>
                        ))
                      )}
                      <ProtocolActionButton label="+ Конкремент" onPress={onAddConcretion} />
                    </View>
                  </View>
                )}
              </Fragment>
            );
          }

          if (field.key === "polyps") {
            return (
              <Fragment key={field.key}>
                {fieldRow}
                {!isCholecystectomy && hasPolyps && (
                  <View style={styles.obpFieldList}>
                    <ProtocolSectionHeader
                      title="Полипы"
                      note={`${gallbladder.polypsList.length} items`}
                    />
                    <View style={styles.obpFieldList}>
                      {gallbladder.polypsList.length === 0 ? (
                        <Text style={styles.helperText}>Добавьте хотя бы один полип.</Text>
                      ) : (
                        gallbladder.polypsList.map((item, index) => (
                          <ProtocolCard
                            key={`polyp-${index}`}
                            title={`Полип #${index + 1}`}
                            subtitle="Нажмите для редактирования"
                            actionLabel="Удалить"
                            actionVariant="danger"
                            onActionPress={() => onDeletePolyp(index)}
                            variant="item"
                          >
                            <View style={styles.obpFieldList}>
                              {GALLBLADDER_POLYP_FIELDS.map((itemField) => {
                                const currentItemValue = item[itemField.key];
                                const itemDisplayValue = currentItemValue || "Нажмите для ввода";
                                return (
                                  <ProtocolFieldRow
                                    key={itemField.key}
                                    label={itemField.label}
                                    value={itemDisplayValue}
                                    typeLabel={itemField.kind === "number" ? "numpad" : itemField.kind}
                                    filled={hasValue(currentItemValue)}
                                    onPress={itemField.kind === "select" ? undefined : () => {
                                      openEditor({
                                        title: `${itemField.label} #${index + 1}`,
                                        mode: itemField.kind,
                                        value: currentItemValue,
                                        placeholder: itemField.placeholder,
                                        options: itemField.options,
                                        onSave: (nextValue) =>
                                          onUpdatePolypItem(index, itemField.key, nextValue),
                                      });
                                    }}
                                    options={itemField.kind === "select" ? itemField.options : undefined}
                                    onSelectOption={itemField.kind === "select"
                                      ? (nextValue) => onUpdatePolypItem(index, itemField.key, nextValue)
                                      : undefined}
                                  />
                                );
                              })}
                            </View>
                          </ProtocolCard>
                        ))
                      )}
                      <ProtocolActionButton label="+ Полип" onPress={onAddPolyp} />
                    </View>
                  </View>
                )}
              </Fragment>
            );
          }

          return (
            <Fragment key={field.key}>
              {GALLBLADDER_SECTION_HEADERS[field.key] && (
                <ProtocolSectionHeader title={GALLBLADDER_SECTION_HEADERS[field.key]} />
              )}
              {fieldRow}
            </Fragment>
          );
        })}
      </View>
    </>
  );
}