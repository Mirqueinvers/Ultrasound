import { Fragment } from "react";
import { Pressable, Text, View } from "react-native";

import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { ProtocolOrganHeader, ProtocolSectionHeader } from "../../components/protocol/ProtocolHeaders";
import { createEmptyKidneyDraft, type KidneyConcrementDraft, type KidneyCystDraft, type KidneyDraft, type KidneyStudyDraft } from "../../shared/kidneyDraft";
import { isNormalizedMatch } from "../../shared/normalizeSelectValue";
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
} from "./kidneysFieldConfigs";
import { KidneyConcrementSection } from "./KidneyConcrementSection";
import { KidneyCystPanel } from "./KidneyCystPanel";

type KidneySidePanelProps = {
  styles: AppStyles;
  fieldVisibility: FieldVisibility;
  title: string;
  side: "rightKidney" | "leftKidney";
  kidney: KidneyDraft | null;
  resolvedActiveSectionId: string | null;
  fv: Record<string, boolean>;
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

export function KidneySidePanel({
  styles,
  fieldVisibility,
  title,
  side,
  kidney: rawKidney,
  resolvedActiveSectionId,
  fv,
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

  return (
    <View style={styles.kidneyPlainSection}>
      <ProtocolOrganHeader title={title} />

      <View style={styles.obpFieldList}>
        {kidneyFields.map((field) => {
          if (field.key === "length" || field.key === "width" || field.key === "thickness") {
            if (isNephrectomy) {
              return null;
            }
          }
          if (field.key === "pcsMicrolithsSize" && !showPcsMicrolithsSize) {
            return null;
          }
          if (field.key === "sinus" || field.key === "adrenalArea" || field.key === "additional") {
            return null;
          }
          const currentValue = kidney[field.key];
          const filled = Boolean(currentValue && currentValue.trim().length > 0);
          const currentDisplay = currentValue || "Нажмите для ввода";

          return (
            <Fragment key={field.key}>
              {field.key === "length" && (
                <ProtocolSectionHeader title="Размеры" />
              )}

              {field.key === "parenchymaSize" && (
                <ProtocolSectionHeader title="Паренхима" />
              )}

              {field.key === "pcsSize" && (
                <ProtocolSectionHeader title="ЧЛС" />
              )}

              <ProtocolFieldRow
                label={field.label}
                value={currentDisplay}
                typeLabel={field.kind === "number" ? "numpad" : field.kind === "select" ? "select" : "text"}
                filled={filled}
                onPress={
                  field.kind === "select"
                    ? undefined
                    : () => {
                        openEditor({
                          title: `${title}: Описание патологических образований паренхимы`,
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
              {field.key === "parenchymaConcrements" && showParenchymaConcrements && (
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
              )}

              {field.key === "parenchymaPathologicalFormations" && showParenchymaPathology && (
                <Pressable
                  onPress={() =>
                    openEditor({
                      title: `${title}: Описание патологических образований паренхимы`,
                      mode: "text",
                      value: kidney.parenchymaPathologicalFormationsText,
                      placeholder: "Введите описание",
                      multiline: true,
                      onSave: (nextValue) =>
                        onUpdateKidneyField(side, "parenchymaPathologicalFormationsText", nextValue),
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
              )}

              {field.key === "pcsConcrements" && showPcsConcrements && (
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
              )}

              {field.key === "pcsCysts" && showPcsCysts && (
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
              )}

              {field.key === "parenchymaCysts" && showParenchymaCysts && (
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
              )}

              {field.key === "pcsPathologicalFormations" && showPcsPathology && (
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
              )}
            </Fragment>
          );
        })}

        {fv["kidneys.sinus"] !== false && (
          <>
            <ProtocolSectionHeader title="Синус" />
            <ProtocolFieldRow
              label="Почечный синус"
              value={kidney.sinus || "Нажмите для ввода"}
              typeLabel="select"
              filled={kidney.sinus.trim().length > 0}
              options={[
                { value: "без включений", label: "Без включений" },
                { value: "с включениями", label: "С включениями" },
              ]}
              onSelectOption={(nextValue) => onUpdateKidneyField(side, "sinus", nextValue)}
            />
          </>
        )}

        {fv["kidneys.adrenal"] !== false && (
          <>
            <ProtocolSectionHeader title="Область надпочечников" />
            <ProtocolFieldRow
              label="Область надпочечников"
              value={kidney.adrenalArea || "Нажмите для ввода"}
              typeLabel="select"
              filled={kidney.adrenalArea.trim().length > 0}
              options={KIDNEY_ADRENAL_OPTIONS}
              onSelectOption={(nextValue) => onUpdateKidneyField(side, "adrenalArea", nextValue)}
            />

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
          </>
        )}

        {fv["kidneys.additional"] !== false && (
          <>
            <ProtocolSectionHeader title="Дополнительно" note="Описание и замечания" />
            <Pressable
              onPress={() =>
                openEditor({
                  title: `${title}: Дополнительно`,
                  mode: "text",
                  value: kidney.additional,
                  placeholder: "Введите дополнительное описание",
                  multiline: true,
                  onSave: (nextValue) => onUpdateKidneyField(side, "additional", nextValue),
                })
              }
              style={({ pressed }) => [
                styles.obpFieldRow,
                kidney.additional.trim().length > 0 && styles.obpFieldRowFilled,
                pressed && styles.obpFieldRowPressed,
              ]}
            >
              <View style={styles.obpFieldRowContent}>
                <Text style={styles.obpFieldLabel}>Дополнительно</Text>
                <Text style={styles.obpFieldValue}>
                  {kidney.additional || "Нажмите для ввода"}
                </Text>
              </View>
              <Text style={styles.obpFieldType}>text</Text>
            </Pressable>
          </>
        )}

        {showPositionText && (
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
