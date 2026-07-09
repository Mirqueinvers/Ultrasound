import { Fragment, useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { ProtocolOrganHeader, ProtocolSectionHeader } from "../../components/protocol/ProtocolHeaders";
import { ProtocolCard } from "../../components/protocol/ProtocolCard";
import { ProtocolActionButton } from "../../components/protocol/ProtocolActionButton";
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
  splitPairSize,
  joinPairSize,
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
  compact?: boolean,
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
      compact={compact ?? isLandscape}
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

  // Group main fields (excluding trigger fields) by headers for 2-column grid (landscape only)
  const groupedFields = useMemo(() => {
    const groups: Array<{ header?: string; fields: typeof kidneyFields }> = [];
    let currentGroup: typeof kidneyFields = [];

    visibleFields.forEach((field) => {
      // Пропускаем триггер-поля — они будут выведены отдельно
      if (KIDNEY_TRIGGER_FIELDS.has(field.key)) {
        if (currentGroup.length > 0) {
          groups.push({ fields: currentGroup });
          currentGroup = [];
        }
        return;
      }

      if (KIDNEY_SECTION_HEADERS[field.key]) {
        if (currentGroup.length > 0) {
          groups.push({ fields: currentGroup });
        }
        groups.push({ header: KIDNEY_SECTION_HEADERS[field.key], fields: [] });
        currentGroup = [];
      }
      currentGroup.push(field);
    });
    if (currentGroup.length > 0) {
      groups.push({ fields: currentGroup });
    }
    return groups;
  }, [visibleFields]);

  /** Рендерит зависимое содержимое после поля-селекта (портретный режим) */
  const renderDependentContent = (fieldKey: string) => {
    switch (fieldKey) {
      case "parenchymaConcrements":
        return showParenchymaConcrements ? (
          <View key="parenchymaConcrementsSection" style={styles.obpFieldList}>
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
        ) : null;
      case "parenchymaCysts":
        return showParenchymaCysts ? (
          <KidneyCystPanel
            key="parenchymaCystsSection"
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
        ) : null;
      case "parenchymaPathologicalFormations":
        return showParenchymaPathology ? (
          <Pressable
            key="parenchymaPathologyText"
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
        ) : null;
      case "pcsConcrements":
        return showPcsConcrements ? (
          <View key="pcsConcrementsSection" style={styles.obpFieldList}>
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
        ) : null;
      case "pcsCysts":
        return showPcsCysts ? (
          <KidneyCystPanel
            key="pcsCystsSection"
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
        ) : null;
      case "pcsPathologicalFormations":
        return showPcsPathology ? (
          <Pressable
            key="pcsPathologyText"
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
        ) : null;
      default:
        return null;
    }
  };

  /** Рендерит триггер-поля с их содержимым в одну колонку (портретный режим) */
  const renderTriggerSections = () => {
    return visibleFields
      .filter((f) => KIDNEY_TRIGGER_FIELDS.has(f.key))
      .map((field) => (
        <Fragment key={field.key}>
          {renderKidneyFieldRow(field, kidney, styles, title, side, isLandscape, openEditor, onUpdateKidneyField)}
          {renderDependentContent(field.key)}
        </Fragment>
      ));
  };

  /** Рендерит триггер-поля с их содержимым для ландшафтного режима (за пределами сетки) */
  const renderLandscapeTriggerSections = () => {
    return visibleFields
      .filter((f) => KIDNEY_TRIGGER_FIELDS.has(f.key))
      .map((field) => (
        <Fragment key={field.key}>
          {renderKidneyFieldRow(field, kidney, styles, title, side, isLandscape, openEditor, onUpdateKidneyField, false)}
          {renderDependentContent(field.key)}
        </Fragment>
      ));
  };

  /** Рендерит остаточные поля (надпочечники, позиция), которые зависят от значений, а не от kidneyFields */
  const renderRemainingFields = () => {
    const remaining: React.ReactNode[] = [];

    if (showAdrenalText) {
      remaining.push(
        <Pressable
          key="adrenalAreaText"
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
        </Pressable>,
      );
    }

    if (fv["kidneys.position"] !== false && showPositionText) {
      remaining.push(
        <Pressable
          key="positionText"
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
        </Pressable>,
      );
    }

    return remaining;
  };

  return (
    <View style={styles.kidneyPlainSection}>
      <ProtocolOrganHeader title={title} />

      {isLandscape ? (
        <View style={{ gap: 8 }}>
          {groupedFields.map((group, gi) => (
            <Fragment key={gi}>
              {group.header && <ProtocolSectionHeader title={group.header} />}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {group.fields.map((field) => (
                  <View key={field.key} style={{ width: "48.5%" }}>
                    {renderKidneyFieldRow(field, kidney, styles, title, side, isLandscape, openEditor, onUpdateKidneyField, true)}
                  </View>
                ))}
              </View>
            </Fragment>
          ))}

          {/* Триггер-поля (конкременты, кисты, патологии) — за пределами сетки */}
          {renderLandscapeTriggerSections()}

          {/* Остаточные поля */}
          {renderRemainingFields()}
        </View>
      ) : (
        <View style={styles.obpFieldList}>
          {visibleFields.map((field) => {
            // Если это триггер-поле — рендерим его с содержимым в одном Fragment
            if (KIDNEY_TRIGGER_FIELDS.has(field.key)) {
              return (
                <Fragment key={field.key}>
                  {KIDNEY_SECTION_HEADERS[field.key] && (
                    <ProtocolSectionHeader title={KIDNEY_SECTION_HEADERS[field.key]!} />
                  )}
                  {renderKidneyFieldRow(field, kidney, styles, title, side, isLandscape, openEditor, onUpdateKidneyField)}
                  {renderDependentContent(field.key)}
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

          {renderRemainingFields()}
        </View>
      )}
    </View>
  );
}