import { Fragment, useMemo } from "react";
import { Text, View } from "react-native";
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
  isLandscape?: boolean;
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
  isLandscape,
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

  // Group main fields (excluding concretions/polyps) by headers for 2-column grid
  const groupedFields = useMemo(() => {
    const groups: Array<{ header?: string; fields: typeof GALLBLADDER_FIELDS }> = [];
    let currentGroup: typeof GALLBLADDER_FIELDS = [];

    GALLBLADDER_FIELDS.forEach((field) => {
      if (field.hiddenWhenCholecystectomy && isCholecystectomy) return;
      if (!isFieldVisible(field, fieldVisibility)) return;
      if (field.key === "concretions" || field.key === "polyps") {
        // flush current group before special fields
        if (currentGroup.length > 0) {
          groups.push({ fields: currentGroup });
          currentGroup = [];
        }
        // add concretions/polyps as special groups later
        return;
      }

      if (GALLBLADDER_SECTION_HEADERS[field.key]) {
        if (currentGroup.length > 0) {
          groups.push({ fields: currentGroup });
        }
        groups.push({ header: GALLBLADDER_SECTION_HEADERS[field.key], fields: [] });
        currentGroup = [];
      }
      currentGroup.push(field);
    });
    if (currentGroup.length > 0) {
      groups.push({ fields: currentGroup });
    }
    return groups;
  }, [isCholecystectomy, fieldVisibility]);

  const renderFieldRow = (field: typeof GALLBLADDER_FIELDS[0], compact = false) => {
    const currentValue = gallbladder[field.key];
    const displayValue = currentValue || "Нажмите для ввода";

    return (
      <ProtocolFieldRow
        key={field.key}
        label={field.label}
        value={displayValue}
        typeLabel={field.kind === "number" ? "numpad" : field.kind}
        filled={hasValue(currentValue)}
        compact={compact}
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
  };

  const renderConcretionField = (item: GallbladderConcretionDraft, field: typeof GALLBLADDER_CONCRETION_FIELDS[0], index: number) => {
    const currentItemValue = item[field.key];
    const itemDisplayValue = currentItemValue || "Нажмите для ввода";
    return (
      <ProtocolFieldRow
        key={field.key}
        label={field.label}
        value={itemDisplayValue}
        typeLabel={field.kind === "number" ? "numpad" : field.kind}
        filled={hasValue(currentItemValue)}
        compact={isLandscape}
        onPress={field.kind === "select" ? undefined : () => {
          openEditor({
            title: `${field.label} #${index + 1}`,
            mode: field.kind,
            value: currentItemValue,
            placeholder: field.placeholder,
            options: field.options,
            onSave: (nextValue) =>
              onUpdateConcretionItem(index, field.key, nextValue),
          });
        }}
        options={field.kind === "select" ? field.options : undefined}
        onSelectOption={field.kind === "select"
          ? (nextValue) => onUpdateConcretionItem(index, field.key, nextValue)
          : undefined}
      />
    );
  };

  const renderPolypField = (item: GallbladderPolypDraft, field: typeof GALLBLADDER_POLYP_FIELDS[0], index: number) => {
    const currentItemValue = item[field.key];
    const itemDisplayValue = currentItemValue || "Нажмите для ввода";
    return (
      <ProtocolFieldRow
        key={field.key}
        label={field.label}
        value={itemDisplayValue}
        typeLabel={field.kind === "number" ? "numpad" : field.kind}
        filled={hasValue(currentItemValue)}
        compact={isLandscape}
        onPress={field.kind === "select" ? undefined : () => {
          openEditor({
            title: `${field.label} #${index + 1}`,
            mode: field.kind,
            value: currentItemValue,
            placeholder: field.placeholder,
            options: field.options,
            onSave: (nextValue) =>
              onUpdatePolypItem(index, field.key, nextValue),
          });
        }}
        options={field.kind === "select" ? field.options : undefined}
        onSelectOption={field.kind === "select"
          ? (nextValue) => onUpdatePolypItem(index, field.key, nextValue)
          : undefined}
      />
    );
  };

  // Find concretions field config
  const concretionsField = GALLBLADDER_FIELDS.find((f) => f.key === "concretions");
  const polypsField = GALLBLADDER_FIELDS.find((f) => f.key === "polyps");

  return (
    <>
      <ProtocolOrganHeader title="Желчный пузырь" />
      {isLandscape ? (
        <View style={{ gap: 8 }}>
          {groupedFields.map((group, gi) => (
            <Fragment key={gi}>
              {group.header && <ProtocolSectionHeader title={group.header} />}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {group.fields.map((field) => (
                  <View key={field.key} style={{ width: "48.5%" }}>
                    {renderFieldRow(field, true)}
                  </View>
                ))}
              </View>
            </Fragment>
          ))}

          {/* Concretions field */}
          {concretionsField && !isCholecystectomy && isFieldVisible(concretionsField, fieldVisibility) && (
            <Fragment>
              {renderFieldRow(concretionsField, true)}
              {hasConcretions && (
                <View style={{ gap: 8 }}>
                  <ProtocolSectionHeader
                    title="Конкременты"
                    note={`${gallbladder.concretionsList.length} items`}
                  />
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
                        <View style={{ gap: 6 }}>
                          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                            {GALLBLADDER_CONCRETION_FIELDS.map((itemField) => (
                              <View key={itemField.key} style={{ width: "48.5%" }}>
                                {renderConcretionField(item, itemField, index)}
                              </View>
                            ))}
                          </View>
                        </View>
                      </ProtocolCard>
                    ))
                  )}
                  <ProtocolActionButton label="+ Конкремент" onPress={onAddConcretion} />
                </View>
              )}
            </Fragment>
          )}

          {/* Polyps field */}
          {polypsField && !isCholecystectomy && isFieldVisible(polypsField, fieldVisibility) && (
            <Fragment>
              {renderFieldRow(polypsField, true)}
              {hasPolyps && (
                <View style={{ gap: 8 }}>
                  <ProtocolSectionHeader
                    title="Полипы"
                    note={`${gallbladder.polypsList.length} items`}
                  />
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
                        <View style={{ gap: 6 }}>
                          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                            {GALLBLADDER_POLYP_FIELDS.map((itemField) => (
                              <View key={itemField.key} style={{ width: "48.5%" }}>
                                {renderPolypField(item, itemField, index)}
                              </View>
                            ))}
                          </View>
                        </View>
                      </ProtocolCard>
                    ))
                  )}
                  <ProtocolActionButton label="+ Полип" onPress={onAddPolyp} />
                </View>
              )}
            </Fragment>
          )}
        </View>
      ) : (
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
      )}
    </>
  );
}
