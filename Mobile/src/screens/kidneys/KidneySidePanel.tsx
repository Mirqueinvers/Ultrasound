import { Fragment, useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { ProtocolOrganHeader, ProtocolSectionHeader } from "../../components/protocol/ProtocolHeaders";
import { createEmptyKidneyDraft, type KidneyConcrementDraft, type KidneyCystDraft, type KidneyDraft, type KidneyStudyDraft } from "../../shared/kidneyDraft";
import { isNormalizedMatch } from "../../shared/normalizeSelectValue";
import { isFieldVisible } from "../../shared/isFieldVisible";
import type { AppStyles } from "../../styles/appStyles";
import type { FieldVisibility } from "../../settings/fieldVisibility";
import {
  KIDNEY_YES_NO_OPTIONS,
  KIDNEY_ADRENAL_OPTIONS,
  KIDNEY_CONTOUR_OPTIONS,
  KIDNEY_LOCATION_OPTIONS,
  KIDNEY_PARRENCHYMA_ECHOGENICITY_OPTIONS,
  KIDNEY_PARRENCHYMA_STRUCTURE_OPTIONS,
  KIDNEY_POSITION_OPTIONS,
  KIDNEY_SECTION_IDS,
  type EditorState,
  kidneyFields,
  type KidneyFieldSpec,
} from "./kidneysFieldConfigs";
import { KidneyConcrementSection } from "./KidneyConcrementSection";
import { KidneyCystPanel } from "./KidneyCystPanel";

/** Заголовки секций для kidneyFields — появляются перед первым полем группы */
const KIDNEY_SECTION_HEADERS: Partial<Record<string, string>> = {
  length: "Размеры",
  parenchymaSize: "Паренхима",
  pcsSize: "ЧЛС",
  sinus: "Почечный синус",
  adrenalArea: "Область надпочечников",
  additional: "Дополнительно",
};

/** Ключи полей-селектов, после которых идёт зависимое содержимое */
const KIDNEY_TRIGGER_FIELDS = new Set([
  "parenchymaConcrements",
  "parenchymaCysts",
  "parenchymaPathologicalFormations",
  "pcsConcrements",
  "pcsCysts",
  "pcsPathologicalFormations",
]);

type KidneySidePanelProps = {
  styles: AppStyles;
  fieldVisibility: FieldVisibility;
  title: string;
  side: "rightKidney" | "leftKidney";
  kidney: KidneyDraft | null;
  resolvedActiveSectionId: string | null;
  fv: Record<string, boolean>;
  isLandscape?: boolean;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateKidneyField: (side: "rightKidney" | "leftKidney", field: keyof KidneyDraft, value: string) => void;
  onUpdateKidneyListItem: (
    side: "rightKidney" | "leftKidney",
    listKey: "parenchymaConcrementslist" | "parenchymaCystslist" | "pcsConcrementslist" | "pcsCystslist",
    index: number,
    field: keyof KidneyConcrementDraft | keyof KidneyCystDraft,
    value: string,
  ) => void;
  onUpdateKidneyCystSize: (
    side: "rightKidney" | "leftKidney",
    listKey: "parenchymaCystslist" | "pcsCystslist",
    index: number,
    nextFirst?: string,
    nextSecond?: string,
  ) => void;
  onAddKidneyListItem: (
    side: "rightKidney" | "leftKidney",
    listKey: "parenchymaConcrementslist" | "parenchymaCystslist" | "pcsConcrementslist" | "pcsCystslist",
  ) => void;
  onRemoveKidneyListItem: (
    side: "rightKidney" | "leftKidney",
    listKey: "parenchymaConcrementslist" | "parenchymaCystslist" | "pcsConcrementslist" | "pcsCystslist",
    index: number,
  ) => void;
  onToggleMultipleCysts: (
    side: "rightKidney" | "leftKidney",
    key: "parenchymaMultipleCysts" | "pcsMultipleCysts",
  ) => void;
  onUpdateStudy: (producer: (current: KidneyStudyDraft) => KidneyStudyDraft) => void;
};

function renderKidneyFieldRow(
  field: KidneyFieldSpec,
  kidney: KidneyDraft,
  styles: AppStyles,
  title: string,
  side: "rightKidney" | "leftKidney",
  isLandscape: boolean | undefined,
  openEditor: (config: NonNullable<EditorState>) => void,
  onUpdateKidneyField: (side: "rightKidney" | "leftKidney", field: keyof KidneyDraft, value: string) => void,
) {
  const currentValue = kidney[field.key];
  const filled = Boolean(currentValue && currentValue.trim().length > 0);
  const currentDisplay = currentValue || "Нажмите для ввода";

  return (
    <ProtocolFieldRow
      label={field.label}
      value={currentDisplay}
      typeLabel={field.kind === "number" ? "numpad" : field.kind === "select" ? "select" : "text"}
      filled={filled}
      compact={isLandscape}
      onPress={
        field.kind === "select"
          ? undefined
          : () => {
              openEditor({
                title: `${title}: ${field.label}`,
                mode: field.kind,
                value: currentValue,
                placeholder: field.placeholder,
                multiline: field.multiline,
                options: field.options,
                onSave: (nextValue) => onUpdateKidneyField(side, field.key, nextValue),
              });
            }
      }
      options={field.kind === "select" ? field.options : undefined}
      onSelectOption={
        field.kind === "select"
          ? (nextValue) => onUpdateKidneyField(side, field.key, nextValue)
          : undefined
      }
    />
  );
}

/** Фильтрует поля, пропуская те, что не видны или скрыты при нефрэктомии */
function filterFields(
  fields: typeof kidneyFields,
  isNephrectomy: boolean,
  showPcsMicrolithsSize: boolean,
  fieldVisibility: FieldVisibility,
) {
  return fields.filter((field) => {
    if (field.key === "length" || field.key === "width" || field.key === "thickness") {
      if (isNephrectomy) return false;
    }
    if (field.key === "pcsMicrolithsSize" && !showPcsMicrolithsSize) return false;
    if (!isFieldVisible(field, fieldVisibility)) return false;
    return true;
  });
}

export function KidneySidePanel({
  styles,
  fieldVisibility,
  title,
  side,
  kidney: rawKidney,
  resolvedActiveSectionId,
  fv,
  isLandscape,
  openEditor,
  onUpdateKidneyField,
  onUpdateKidneyListItem,
  onUpdateKidneyCystSize,
  onAddKidneyListItem,
  onRemoveKidneyListItem,
  onToggleMultipleCysts,
  onUpdateStudy,
}: KidneySidePanelProps) {
  if (
    resolvedActiveSectionId &&
    !(
      (side === "rightKidney" && resolvedActiveSectionId === KIDNEY_SECTION_IDS.right) ||
      (side === "leftKidney" && resolvedActiveSectionId === KIDNEY_SECTION_IDS.left)
    )
  ) {
    return null;
  }

  const kidney = rawKidney ?? createEmptyKidneyDraft();

  const isNephrectomy = isNormalizedMatch(kidney.position, "нефрэктомия");
  const showPositionText = ["опущение", "нефроптоз", "нефрэктомия"].some((option) =>
    isNormalizedMatch(kidney.position, option),
  );
  const showParenchymaConcrements = isNormalizedMatch(kidney.parenchymaConcrements, "определяются");
  const showParenchymaCysts = isNormalizedMatch(kidney.parenchymaCysts, "определяются");
  const showParenchymaPathology = isNormalizedMatch(kidney.parenchymaPathologicalFormations, "определяются");
  const showPcsMicrolithsSize = isNormalizedMatch(kidney.pcsMicroliths, "определяются");
  const showPcsConcrements = isNormalizedMatch(kidney.pcsConcrements, "определяются");
  const showPcsCysts = isNormalizedMatch(kidney.pcsCysts, "определяются");
  const showPcsPathology = isNormalizedMatch(kidney.pcsPathologicalFormations, "определяются");
  const showAdrenalText = isNormalizedMatch(kidney.adrenalArea, "изменена");

  const visibleFields = useMemo(
    () => filterFields(kidneyFields, isNephrectomy, showPcsMicrolithsSize, fieldVisibility),
    [isNephrectomy, showPcsMicrolithsSize, fieldVisibility],
  );

  return (
    <View style={styles.kidneyPlainSection}>
      <ProtocolOrganHeader title={title} />

      <View style={styles.obpFieldList}>
        {visibleFields.map((field) => {
          // Если это триггер-поле — рендерим его с содержимым в одном Fragment
          if (KIDNEY_TRIGGER_FIELDS.has(field.key)) {
            let dependentContent: React.ReactNode = null;

            if (field.key === "parenchymaConcrements" && showParenchymaConcrements) {
              dependentContent = (
                <View style={styles.obpFieldList}>
                  <KidneyConcrementSection
                    styles={styles}
                    sectionTitle="Конкременты паренхимы"
                    items={kidney.parenchymaConcrementslist}
                    listKey="parenchymaConcrementslist"
                    emptyText="Добавьте хотя бы один конкремент."
                    side={side}
                    openEditor={openEditor}
                    onAdd={onAddKidneyListItem}
                    onRemove={onRemoveKidneyListItem}
                    onUpdateItem={onUpdateKidneyListItem}
                  />
                </View>
              );
            } else if (field.key === "parenchymaCysts" && showParenchymaCysts) {
              dependentContent = (
                <KidneyCystPanel
                  styles={styles}
                  title="Кисты паренхимы"
                  cysts={kidney.parenchymaCystslist}
                  multiple={kidney.parenchymaMultipleCysts}
                  multipleSize={kidney.parenchymaMultipleCystsSize}
                  side={side}
                  cystListKey="parenchymaCystslist"
                  multipleKey="parenchymaMultipleCysts"
                  openEditor={openEditor}
                  onToggleMultiple={onToggleMultipleCysts}
                  onAdd={onAddKidneyListItem}
                  onRemove={onRemoveKidneyListItem}
                  onUpdateCystSize={onUpdateKidneyCystSize}
                  onUpdateField={(_, field, value) =>
                    onUpdateKidneyField(side, field as keyof KidneyDraft, value)
                  }
                  onUpdateListItem={onUpdateKidneyListItem}
                />
              );
            } else if (field.key === "parenchymaPathologicalFormations" && showParenchymaPathology) {
              dependentContent = (
                <Pressable
                  onPress={() =>
                    openEditor({
                      title: `${title}: Описание патологических образований паренхимы`,
                      mode: "text",
                      value: kidney.parenchymaPathologicalFormationsText,
                      placeholder: "Введите описание",
                      multiline: true,
                      onSave: (nextValue) => onUpdateKidneyField(side, "parenchymaPathologicalFormationsText", nextValue),
                    })
                  }
                  style={({ pressed }) => [
                    styles.obpFieldRow,
                    kidney.parenchymaPathologicalFormationsText.trim().length > 0 && styles.obpFieldRowFilled,
                    pressed && styles.obpFieldRowPressed,
                  ]}
                >
                  <View style={styles.obpFieldRowContent}>
                    <Text style={styles.obpFieldLabel}>Описание патологических образований паренхимы</Text>
                    <Text style={styles.obpFieldValue}>
                      {kidney.parenchymaPathologicalFormationsText || "Нажмите для ввода"}
                    </Text>
                  </View>
                  <Text style={styles.obpFieldType}>text</Text>
                </Pressable>
              );
            } else if (field.key === "pcsConcrements" && showPcsConcrements) {
              dependentContent = (
                <View style={styles.obpFieldList}>
                  <KidneyConcrementSection
                    styles={styles}
                    sectionTitle="Конкременты ЧЛС"
                    items={kidney.pcsConcrementslist}
                    listKey="pcsConcrementslist"
                    emptyText="Добавьте хотя бы один конкремент."
                    side={side}
                    openEditor={openEditor}
                    onAdd={onAddKidneyListItem}
                    onRemove={onRemoveKidneyListItem}
                    onUpdateItem={onUpdateKidneyListItem}
                  />
                </View>
              );
            } else if (field.key === "pcsCysts" && showPcsCysts) {
              dependentContent = (
                <KidneyCystPanel
                  styles={styles}
                  title="Кисты ЧЛС"
                  cysts={kidney.pcsCystslist}
                  multiple={kidney.pcsMultipleCysts}
                  multipleSize={kidney.pcsMultipleCystsSize}
                  side={side}
                  cystListKey="pcsCystslist"
                  multipleKey="pcsMultipleCysts"
                  openEditor={openEditor}
                  onToggleMultiple={onToggleMultipleCysts}
                  onAdd={onAddKidneyListItem}
                  onRemove={onRemoveKidneyListItem}
                  onUpdateCystSize={onUpdateKidneyCystSize}
                  onUpdateField={(_, field, value) =>
                    onUpdateKidneyField(side, field as keyof KidneyDraft, value)
                  }
                  onUpdateListItem={onUpdateKidneyListItem}
                />
              );
            } else if (field.key === "pcsPathologicalFormations" && showPcsPathology) {
              dependentContent = (
                <Pressable
                  onPress={() =>
                    openEditor({
                      title: "Описание патологических образований ЧЛС",
                      mode: "text",
                      value: kidney.pcsPathologicalFormationsText,
                      placeholder: "Введите описание",
                      multiline: true,
                      onSave: (nextValue) =>
                        onUpdateKidneyField(side, "pcsPathologicalFormationsText", nextValue),
                    })
                  }
                  style={({ pressed }) => [
                    styles.obpFieldRow,
                    kidney.pcsPathologicalFormationsText.trim().length > 0 && styles.obpFieldRowFilled,
                    pressed && styles.obpFieldRowPressed,
                  ]}
                >
                  <View style={styles.obpFieldRowContent}>
                    <Text style={styles.obpFieldLabel}>Описание патологических образований ЧЛС</Text>
                    <Text style={styles.obpFieldValue}>
                      {kidney.pcsPathologicalFormationsText || "Нажмите для ввода"}
                    </Text>
                  </View>
                  <Text style={styles.obpFieldType}>text</Text>
                </Pressable>
              );
            }

            return (
              <Fragment key={field.key}>
                {KIDNEY_SECTION_HEADERS[field.key] && (
                  <ProtocolSectionHeader title={KIDNEY_SECTION_HEADERS[field.key]!} />
                )}
                {renderKidneyFieldRow(field, kidney, styles, title, side, isLandscape, openEditor, onUpdateKidneyField)}
                {dependentContent}
              </Fragment>
            );
          }

          return (
            <Fragment key={field.key}>
              {KIDNEY_SECTION_HEADERS[field.key] && (
                <ProtocolSectionHeader title={KIDNEY_SECTION_HEADERS[field.key]!} />
              )}
              {renderKidneyFieldRow(field, kidney, styles, title, side, isLandscape, openEditor, onUpdateKidneyField)}
            </Fragment>
          );
        })}

        {showAdrenalText && (
          <Pressable
            onPress={() =>
              openEditor({
                title: "Область надпочечников: Описание изменений",
                mode: "text",
                value: kidney.adrenalAreaText,
                placeholder: "Введите описание",
                multiline: true,
                onSave: (nextValue) => onUpdateKidneyField(side, "adrenalAreaText", nextValue),
              })
            }
            style={({ pressed }) => [
              styles.obpFieldRow,
              kidney.adrenalAreaText.trim().length > 0 && styles.obpFieldRowFilled,
              pressed && styles.obpFieldRowPressed,
            ]}
          >
            <View style={styles.obpFieldRowContent}>
              <Text style={styles.obpFieldLabel}>Описание изменений</Text>
              <Text style={styles.obpFieldValue}>
                {kidney.adrenalAreaText || "Нажмите для ввода"}
              </Text>
            </View>
            <Text style={styles.obpFieldType}>text</Text>
          </Pressable>
        )}
        {fv["kidneys.position"] !== false && showPositionText && (
          <Pressable
            onPress={() =>
              openEditor({
                title: `${title}: Описание положения`,
                mode: "text",
                value: kidney.positionText,
                placeholder: "Введите описание",
                multiline: true,
                onSave: (nextValue) => onUpdateKidneyField(side, "positionText", nextValue),
              })
            }
            style={({ pressed }) => [
              styles.obpFieldRow,
              kidney.positionText.trim().length > 0 && styles.obpFieldRowFilled,
              pressed && styles.obpFieldRowPressed,
            ]}
          >
            <View style={styles.obpFieldRowContent}>
              <Text style={styles.obpFieldLabel}>Описание положения</Text>
              <Text style={styles.obpFieldValue}>
                {kidney.positionText || "Нажмите для ввода"}
              </Text>
            </View>
            <Text style={styles.obpFieldType}>text</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}