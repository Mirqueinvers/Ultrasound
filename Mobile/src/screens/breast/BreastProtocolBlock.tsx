import { useEffect, useState } from "react";
import { Keyboard, Text, View } from "react-native";

import {
  FieldEditorModal,
  type FieldEditorOption,
} from "../../components/FieldEditorModal";
import { ProtocolActionButton } from "../../components/protocol/ProtocolActionButton";
import { ProtocolCard } from "../../components/protocol/ProtocolCard";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import {
  ProtocolOrganHeader,
  ProtocolSectionHeader,
} from "../../components/protocol/ProtocolHeaders";
import { isNormalizedMatch } from "../../shared/normalizeSelectValue";
import {
  createEmptyBreastNodeDraft,
  type BreastNodeDraft,
  type BreastProtocolDraft,
  type BreastSideDraft,
  type BreastStudyDraft,
} from "../../shared/breastDraft";
import { formatDateForMobileDisplay } from "../../shared/formatDate";
import type { AppStyles } from "../../styles/appStyles";
import type { FieldVisibility } from "../../settings/fieldVisibility";

type EditorState = {
  title: string;
  mode: "number" | "select" | "text";
  value: string;
  placeholder?: string;
  multiline?: boolean;
  options?: FieldEditorOption[];
  onSave: (value: string) => void;
} | null;

type BreastProtocolBlockProps = {
  styles: AppStyles;
  fieldVisibility: FieldVisibility;
  value: BreastStudyDraft;
  onChange: (value: BreastStudyDraft) => void;
  activeSectionId?: string | null;
};

const BREAST_SKIN_OPTIONS: FieldEditorOption[] = [
  { value: "не изменена", label: "Не изменена" },
  { value: "изменена", label: "Изменена" },
];

const BREAST_NIPPLES_OPTIONS: FieldEditorOption[] = [
  { value: "не изменены", label: "Не изменены" },
  { value: "изменены", label: "Изменены" },
];

const BREAST_MILK_DUCTS_OPTIONS: FieldEditorOption[] = [
  { value: "не расширены", label: "Не расширены" },
  { value: "расширены", label: "Расширены" },
];

const BREAST_VOLUME_FORMATIONS_OPTIONS: FieldEditorOption[] = [
  { value: "не определяются", label: "Не определяются" },
  { value: "определяются", label: "Определяются" },
];

const BREAST_STRUCTURE_OPTIONS: FieldEditorOption[] = [
  { value: "преимущественно жировая ткань", label: "Преимущественно жировая ткань" },
  { value: "преимущественно железистая ткань", label: "Преимущественно железистая ткань" },
  { value: "жировая и железистая", label: "Жировая и железистая" },
  { value: "жировая и фиброзная", label: "Жировая и фиброзная" },
  { value: "жировая железистая и фиброзная", label: "Жировая железистая и фиброзная" },
];

const BREAST_NODE_ECHOGENICITY_OPTIONS: FieldEditorOption[] = [
  { value: "средняя", label: "Средняя" },
  { value: "повышенная", label: "Повышенная" },
  { value: "пониженная", label: "Пониженная" },
  { value: "анэхогенный", label: "Анэхогенный" },
  { value: "смешанная", label: "Смешанная" },
];

const BREAST_NODE_ECHOSTRUCTURE_OPTIONS: FieldEditorOption[] = [
  { value: "однородная", label: "Однородная" },
  { value: "неоднородная", label: "Неоднородная" },
];

const BREAST_NODE_CONTOUR_OPTIONS: FieldEditorOption[] = [
  { value: "четкий ровный", label: "Четкий ровный" },
  { value: "четкий неровный", label: "Четкий неровный" },
  { value: "нечеткий", label: "Нечеткий" },
];

const BREAST_NODE_ORIENTATION_OPTIONS: FieldEditorOption[] = [
  { value: "горизонтальная", label: "Горизонтальная" },
  { value: "вертикальная", label: "Вертикальная" },
];

const BREAST_NODE_BLOOD_FLOW_OPTIONS: FieldEditorOption[] = [
  { value: "не изменен", label: "Не изменен" },
  { value: "усилен", label: "Усилен" },
  { value: "усилен периферический", label: "Усилен периферический" },
];

function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}

function parseDateInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length !== 8) {
    return value.trim();
  }

  return `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
}

function getDateEditorValue(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return `${isoMatch[3]}${isoMatch[2]}${isoMatch[1]}`;
  }

  return trimmed.replace(/\D/g, "").slice(0, 8);
}

function computeCycleDay(dateValue: string): string {
  if (!dateValue.trim()) {
    return "";
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const diffTime = Date.now() - parsed.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? String(diffDays) : "";
}

export function BreastProtocolBlock({
  styles,
  fieldVisibility,
  value,
  onChange,
  activeSectionId,
}: BreastProtocolBlockProps) {
  const [form, setForm] = useState<BreastStudyDraft>(value);
  const [editorState, setEditorState] = useState<EditorState>(null);

  useEffect(() => {
    setForm(value);
  }, [value]);

  const updateForm = (updater: (current: BreastStudyDraft) => BreastStudyDraft) => {
    setForm((current) => {
      const next = updater(current);
      onChange(next);
      return next;
    });
  };

  const openEditor = (config: NonNullable<EditorState>) => {
    Keyboard.dismiss();
    setTimeout(() => {
      setEditorState(config);
    }, 0);
  };

  const closeEditor = () => setEditorState(null);

  const saveEditor = (nextValue: string) => {
    editorState?.onSave(nextValue);
    closeEditor();
  };

  const breast = form.breast;
  const activeBreastSide =
    activeSectionId === "breast.right"
      ? "right"
      : activeSectionId === "breast.left"
        ? "left"
        : null;
  const fv = fieldVisibility as Record<string, boolean>;

  const updateBreastField = <K extends keyof BreastProtocolDraft>(
    field: K,
    nextValue: BreastProtocolDraft[K],
  ) => {
    updateForm((current) => {
      const nextBreast: BreastProtocolDraft = {
        ...current.breast,
        [field]: nextValue,
      };

      if (field === "lastMenstruationDate") {
        nextBreast.cycleDay = computeCycleDay(String(nextValue));
      }

      return {
        ...current,
        breast: nextBreast,
      };
    });
  };

  const updateSideField = (
    side: "right" | "left",
    field: keyof BreastSideDraft,
    nextValue: string,
  ) => {
    updateForm((current) => {
      const sourceSide = side === "right" ? current.breast.rightBreast : current.breast.leftBreast;
      const nextSide: BreastSideDraft = {
        ...sourceSide,
        [field]: nextValue,
      };

      if (field === "volumeFormations" && isNormalizedMatch(nextValue, "не определяются")) {
        nextSide.nodesList = [];
      }

      return {
        ...current,
        breast: {
          ...current.breast,
          [side === "right" ? "rightBreast" : "leftBreast"]: nextSide,
        },
      };
    });
  };

  const addNode = (side: "right" | "left") => {
    updateForm((current) => {
      const sourceSide = side === "right" ? current.breast.rightBreast : current.breast.leftBreast;
      const nextNode = {
        ...createEmptyBreastNodeDraft(),
        number: sourceSide.nodesList.length + 1,
      };

      return {
        ...current,
        breast: {
          ...current.breast,
          [side === "right" ? "rightBreast" : "leftBreast"]: {
            ...sourceSide,
            nodesList: [...sourceSide.nodesList, nextNode],
          },
        },
      };
    });
  };

  const updateNodeField = (
    side: "right" | "left",
    index: number,
    field: keyof BreastNodeDraft,
    nextValue: string,
  ) => {
    updateForm((current) => {
      const sourceSide = side === "right" ? current.breast.rightBreast : current.breast.leftBreast;
      const nextNodes = sourceSide.nodesList.map((node, nodeIndex) =>
        nodeIndex === index ? { ...node, [field]: nextValue } : node,
      );

      return {
        ...current,
        breast: {
          ...current.breast,
          [side === "right" ? "rightBreast" : "leftBreast"]: {
            ...sourceSide,
            nodesList: nextNodes,
          },
        },
      };
    });
  };

  const removeNode = (side: "right" | "left", index: number) => {
    updateForm((current) => {
      const sourceSide = side === "right" ? current.breast.rightBreast : current.breast.leftBreast;
      const nextNodes = sourceSide.nodesList
        .filter((_, nodeIndex) => nodeIndex !== index)
        .map((node, nodeIndex) => ({ ...node, number: nodeIndex + 1 }));

      return {
        ...current,
        breast: {
          ...current.breast,
          [side === "right" ? "rightBreast" : "leftBreast"]: {
            ...sourceSide,
            nodesList: nextNodes,
          },
        },
      };
    });
  };

  const renderRow = (
    label: string,
    valueText: string,
    typeLabel: "numpad" | "select" | "text" | "auto",
    filled: boolean,
    onPress?: () => void,
    readonly?: boolean,
  options?: FieldEditorOption[],
    onSelectOption?: (value: string) => void,
  ) => (
    <ProtocolFieldRow
      label={label}
      value={valueText}
      typeLabel={typeLabel}
      filled={filled}
      readonly={readonly}
      onPress={onPress}
      options={options}
      onSelectOption={onSelectOption}
    />
  );

  const renderNode = (side: "right" | "left", node: BreastNodeDraft, index: number) => (
    <ProtocolCard
      key={`${side}-breast-node-${index}`}
      title={`Узел #${index + 1}`}
      actionLabel="Удалить"
      actionVariant="danger"
      onActionPress={() => removeNode(side, index)}
      variant="item"
    >
      <View style={styles.obpFieldList}>
        <View style={styles.dualRow}>
          <View style={styles.dualCol}>
            {renderRow(
              "Размер 1 (мм)",
              node.size1 || "Нажмите для ввода",
              "numpad",
              Boolean(node.size1),
              () =>
                openEditor({
                  title: `Узел #${index + 1}: размер 1`,
                  mode: "number",
                  value: node.size1,
                  placeholder: "мм",
                  onSave: (nextValue) => updateNodeField(side, index, "size1", nextValue),
                }),
            )}
          </View>
          <View style={styles.dualCol}>
            {renderRow(
              "Размер 2 (мм)",
              node.size2 || "Нажмите для ввода",
              "numpad",
              Boolean(node.size2),
              () =>
                openEditor({
                  title: `Узел #${index + 1}: размер 2`,
                  mode: "number",
                  value: node.size2,
                  placeholder: "мм",
                  onSave: (nextValue) => updateNodeField(side, index, "size2", nextValue),
                }),
            )}
          </View>
        </View>

        {renderRow(
          "Размер 3 (мм)",
          node.size3 || "Нажмите для ввода",
          "numpad",
          Boolean(node.size3),
          () =>
            openEditor({
              title: `Узел #${index + 1}: размер 3`,
              mode: "number",
              value: node.size3,
              placeholder: "мм",
              onSave: (nextValue) => updateNodeField(side, index, "size3", nextValue),
            }),
        )}

        {(() => {
          const a = parseFloat(node.size1);
          const b = parseFloat(node.size2);
          const c = parseFloat(node.size3);
          if (!isNaN(a) && !isNaN(b) && !isNaN(c)) {
            const vol = ((Math.PI * a * b * c) / 6 / 1000).toFixed(2);
            return (
              <View style={styles.obpFieldRow}>
                <Text style={[styles.obpFieldLabel, { fontWeight: "600" }]}>
                  Объём
                </Text>
                <Text style={[styles.obpFieldValue, { fontWeight: "600" }]}>
                  {vol} см³
                </Text>
              </View>
            );
          }
          return null;
        })()}

        {renderRow(
          "Глубина (мм)",
          node.depth || "Нажмите для ввода",
          "numpad",
          Boolean(node.depth),
          () =>
            openEditor({
              title: `Узел #${index + 1}: глубина`,
              mode: "number",
              value: node.depth,
              placeholder: "мм",
              onSave: (nextValue) => updateNodeField(side, index, "depth", nextValue),
            }),
        )}

        {renderRow(
          "Направление узла (часы)",
          node.direction || "Нажмите для ввода",
          "numpad",
          Boolean(node.direction),
          () =>
            openEditor({
              title: `Узел #${index + 1}: направление`,
              mode: "number",
              value: node.direction,
              placeholder: "1-12",
              onSave: (nextValue) => updateNodeField(side, index, "direction", nextValue),
            }),
        )}

        {renderRow(
          "Эхогенность",
          node.echogenicity || "Нажмите для ввода",
          "select",
          Boolean(node.echogenicity),
          undefined,
          undefined,
          BREAST_NODE_ECHOGENICITY_OPTIONS,
          (nextValue) => updateNodeField(side, index, "echogenicity", nextValue),
        )}

        {renderRow(
          "Эхоструктура",
          node.echostructure || "Нажмите для ввода",
          "select",
          Boolean(node.echostructure),
          undefined,
          undefined,
          BREAST_NODE_ECHOSTRUCTURE_OPTIONS,
          (nextValue) => updateNodeField(side, index, "echostructure", nextValue),
        )}

        {renderRow(
          "Контур",
          node.contour || "Нажмите для ввода",
          "select",
          Boolean(node.contour),
          undefined,
          undefined,
          BREAST_NODE_CONTOUR_OPTIONS,
          (nextValue) => updateNodeField(side, index, "contour", nextValue),
        )}

        {renderRow(
          "Ориентация",
          node.orientation || "Нажмите для ввода",
          "select",
          Boolean(node.orientation),
          undefined,
          undefined,
          BREAST_NODE_ORIENTATION_OPTIONS,
          (nextValue) => updateNodeField(side, index, "orientation", nextValue),
        )}

        {renderRow(
          "Кровоток",
          node.bloodFlow || "Нажмите для ввода",
          "select",
          Boolean(node.bloodFlow),
          undefined,
          undefined,
          BREAST_NODE_BLOOD_FLOW_OPTIONS,
          (nextValue) => updateNodeField(side, index, "bloodFlow", nextValue),
        )}

        {renderRow(
          "Комментарий",
          node.comment || "Нажмите для ввода",
          "text",
          Boolean(node.comment),
          () =>
            openEditor({
              title: `Узел #${index + 1}: комментарий`,
              mode: "text",
              value: node.comment,
              placeholder: "Введите комментарий",
              multiline: true,
              onSave: (nextValue) => updateNodeField(side, index, "comment", nextValue),
            }),
        )}
      </View>
    </ProtocolCard>
  );

  const renderSide = (side: "right" | "left") => {
    const breastSide = side === "right" ? breast.rightBreast : breast.leftBreast;
    const title = side === "right" ? "Правая молочная железа" : "Левая молочная железа";
    const showNodeList = isNormalizedMatch(breastSide.volumeFormations, "определяются");

    const sideKey = side === "right" ? "right" : "left";
    const showSkin = fv[`breast.${sideKey}.skin`] !== false;
    const showParenchyma = fv[`breast.${sideKey}.parenchyma`] !== false;
    const showAdditional = fv[`breast.${sideKey}.additional`] !== false;

    return (
      <View style={styles.kidneyPlainSection} key={side}>
        <ProtocolOrganHeader title={title} />

        <View style={styles.obpFieldList}>
          {showSkin && (
            <>
          <ProtocolSectionHeader title="Общие характеристики" />
          {renderRow(
          "Кожа",
          breastSide.skin || "Нажмите для ввода",
          "select",
          Boolean(breastSide.skin),
          undefined,
          undefined,
          BREAST_SKIN_OPTIONS,
          (nextValue) => updateSideField(side, "skin", nextValue),
        )}
          {isNormalizedMatch(breastSide.skin, "изменена") &&
            renderRow(
              "Описание изменений кожи",
              breastSide.skinComment || "Нажмите для ввода",
              "text",
              Boolean(breastSide.skinComment),
              () =>
                openEditor({
                  title: `${title}: описание изменений кожи`,
                  mode: "text",
                  value: breastSide.skinComment,
                  placeholder: "Введите описание",
                  multiline: true,
                  onSave: (nextValue) => updateSideField(side, "skinComment", nextValue),
                }),
            )}

          {renderRow(
          "Соски и ареолы",
          breastSide.nipples || "Нажмите для ввода",
          "select",
          Boolean(breastSide.nipples),
          undefined,
          undefined,
          BREAST_NIPPLES_OPTIONS,
          (nextValue) => updateSideField(side, "nipples", nextValue),
        )}
          {isNormalizedMatch(breastSide.nipples, "изменены") &&
            renderRow(
              "Описание изменений сосков и ареол",
              breastSide.nipplesComment || "Нажмите для ввода",
              "text",
              Boolean(breastSide.nipplesComment),
              () =>
                openEditor({
                  title: `${title}: описание изменений сосков и ареол`,
                  mode: "text",
                  value: breastSide.nipplesComment,
                  placeholder: "Введите описание",
                  multiline: true,
                  onSave: (nextValue) => updateSideField(side, "nipplesComment", nextValue),
                }),
            )}

          {renderRow(
          "Млечные протоки",
          breastSide.milkDucts || "Нажмите для ввода",
          "select",
          Boolean(breastSide.milkDucts),
          undefined,
          undefined,
          BREAST_MILK_DUCTS_OPTIONS,
          (nextValue) => updateSideField(side, "milkDucts", nextValue),
        )}
            </>
          )}

          {showParenchyma && (
            <>
          <ProtocolSectionHeader title="Объемные образования" />
          {renderRow(
          "Определение",
          breastSide.volumeFormations || "Нажмите для ввода",
          "select",
          Boolean(breastSide.volumeFormations),
          undefined,
          undefined,
          BREAST_VOLUME_FORMATIONS_OPTIONS,
          (nextValue) => updateSideField(side, "volumeFormations", nextValue),
        )}

          {showNodeList && (
            <View style={styles.obpFieldList}>
              <ProtocolSectionHeader title="Узлы" />
              {breastSide.nodesList.length === 0 ? (
                <Text style={styles.helperText}>Добавьте хотя бы один узел.</Text>
              ) : (
                breastSide.nodesList.map((node, index) => renderNode(side, node, index))
              )}

              <ProtocolActionButton
                label="+ Узел"
                onPress={() => addNode(side)}
              />
            </View>
          )}
            </>
          )}

          {showAdditional && (
            <>
          <ProtocolSectionHeader title="Дополнительно" />
          {renderRow(
            "Дополнительно",
            breastSide.additional || "Нажмите для ввода",
            "text",
            Boolean(breastSide.additional),
            () =>
              openEditor({
                title: `${title}: дополнительно`,
                mode: "text",
                value: breastSide.additional,
                placeholder: "Введите дополнительное описание",
                multiline: true,
                onSave: (nextValue) => updateSideField(side, "additional", nextValue),
              }),
          )}
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <>
      <FieldEditorModal
        visible={Boolean(editorState)}
        title={editorState?.title ?? ""}
        mode={editorState?.mode ?? "text"}
        value={editorState?.value ?? ""}
        options={editorState?.options}
        placeholder={editorState?.placeholder}
        multiline={editorState?.multiline}
        onCancel={closeEditor}
        onSave={saveEditor}
      />

      <View style={styles.kidneyPlainSection}>
        <ProtocolSectionHeader title="Общая информация" />
        {renderRow(
          "Дата последней менструации",
          formatDateForMobileDisplay(breast.lastMenstruationDate) || "Нажмите для ввода",
          "numpad",
          Boolean(breast.lastMenstruationDate),
          () =>
            openEditor({
              title: "Дата последней менструации",
              mode: "number",
              value: getDateEditorValue(breast.lastMenstruationDate),
              placeholder: "дд.мм.гггг",
              onSave: (nextValue) =>
                updateBreastField("lastMenstruationDate", parseDateInput(nextValue)),
            }),
        )}
        {renderRow(
          "День цикла",
          breast.cycleDay || "Рассчитывается автоматически",
          "auto",
          Boolean(breast.cycleDay),
          undefined,
          true,
        )}
      </View>

      {activeSectionId === "breast.conclusion" ? null : activeBreastSide ? (
        renderSide(activeBreastSide)
      ) : activeSectionId ? (
        renderSide("right")
      ) : (
        <>
          {renderSide("right")}
          {renderSide("left")}
        </>
      )}

      {activeSectionId === "breast.conclusion" ? null : (
      <View style={styles.kidneyPlainSection}>
        <ProtocolSectionHeader title="Структура молочных желез" />
        {renderRow(
          "Структура",
          breast.structure || "Нажмите для ввода",
          "select",
          Boolean(breast.structure),
          undefined,
          undefined,
          BREAST_STRUCTURE_OPTIONS,
          (nextValue) => updateBreastField("structure", nextValue),
        )}
      </View>
      )}

      {(!activeSectionId || activeSectionId === "breast.conclusion") && fv["breast.conclusion"] !== false && (
      <View style={styles.kidneyPlainSection}>
        <ProtocolOrganHeader title="Заключение" />
        <View style={styles.obpFieldList}>
          {renderRow(
            "Заключение",
            form.conclusion || "Нажмите для ввода",
            "text",
            Boolean(form.conclusion),
            () =>
              openEditor({
                title: "Заключение молочных желез",
                mode: "text",
                value: form.conclusion,
                placeholder: "Введите заключение",
                multiline: true,
                onSave: (nextValue) =>
                  updateForm((current) => ({
                    ...current,
                    conclusion: nextValue,
                  })),
              }),
          )}
          {renderRow(
            "Рекомендации",
            form.recommendations || "Нажмите для ввода",
            "text",
            Boolean(form.recommendations),
            () =>
              openEditor({
                title: "Рекомендации молочных желез",
                mode: "text",
                value: form.recommendations,
                placeholder: "Введите рекомендации",
                multiline: true,
                onSave: (nextValue) =>
                  updateForm((current) => ({
                    ...current,
                    recommendations: nextValue,
                  })),
              }),
          )}
        </View>
      </View>
      )}
    </>
  );
}

export default BreastProtocolBlock;