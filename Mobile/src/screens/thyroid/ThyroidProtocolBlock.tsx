import { Fragment, useState, type ReactNode } from "react";
import { Keyboard, Pressable, Text, View } from "react-native";

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
  createEmptyThyroidNodeDraft,
  createEmptyThyroidStudyDraft,
  type ThyroidDraft,
  type ThyroidLobeDraft,
  type ThyroidNodeDraft,
  type ThyroidStudyDraft,
} from "../../shared/thyroidDraft";

type EditorState = {
  title: string;
  mode: "number" | "select" | "text";
  value: string;
  placeholder?: string;
  multiline?: boolean;
  options?: FieldEditorOption[];
  footerContent?: (context: {
    value: string;
    setValue: (nextValue: string) => void;
    close: () => void;
  }) => ReactNode;
  onSave: (value: string) => void;
} | null;

type ConclusionSample = {
  title: string;
  value: string;
};

type ThyroidProtocolBlockProps = {
  styles: any;
  value: ThyroidStudyDraft;
  onChange: (value: ThyroidStudyDraft) => void;
};

const THYROID_ECHOGENICITY_OPTIONS: FieldEditorOption[] = [
  { value: "средняя", label: "Средняя" },
  { value: "повышенная", label: "Повышенная" },
  { value: "пониженная", label: "Пониженная" },
];

const THYROID_ECHOSTRUCTURE_OPTIONS: FieldEditorOption[] = [
  { value: "однородная", label: "Однородная" },
  { value: "диффузно-неоднородная", label: "Диффузно-неоднородная" },
];

const THYROID_CONTOUR_OPTIONS: FieldEditorOption[] = [
  { value: "четкий ровный", label: "Четкий ровный" },
  { value: "четкий не ровный", label: "Четкий не ровный" },
  { value: "не четкий", label: "Не четкий" },
];

const THYROID_SYMMETRY_OPTIONS: FieldEditorOption[] = [
  { value: "сохранена", label: "Сохранена" },
  { value: "ассиметричная", label: "Ассиметричная" },
];

const THYROID_POSITION_OPTIONS: FieldEditorOption[] = [
  { value: "обычное", label: "Обычное" },
  { value: "правосторонняя гемитиреоидэктомия", label: "Правосторонняя гемитиреоидэктомия" },
  { value: "левосторонняя гемитиреоидэктомия", label: "Левосторонняя гемитиреоидэктомия" },
  { value: "резекция щитовидной железы", label: "Резекция щитовидной железы" },
];

const THYROID_VOLUME_FORMATIONS_OPTIONS: FieldEditorOption[] = [
  { value: "не определяются", label: "Не определяются" },
  { value: "определяются", label: "Определяются" },
];

const THYROID_NODE_ECHOGENICITY_OPTIONS: FieldEditorOption[] = [
  { value: "анэхогенный", label: "Анэхогенный" },
  { value: "гиперэхогенный", label: "Гиперэхогенный" },
  { value: "изоэхогенный", label: "Изоэхогенный" },
  { value: "гипоэхогенный", label: "Гипоэхогенный" },
  { value: "выраженно гипоэхогенный", label: "Выраженно гипоэхогенный" },
];

const THYROID_NODE_ECHOSTRUCTURE_OPTIONS: FieldEditorOption[] = [
  { value: "кистозный", label: "Кистозный" },
  { value: "спонгиозный", label: "Спонгиозный" },
  { value: "кистозно-солидная", label: "Кистозно-солидная" },
  { value: "преимущественно солидный", label: "Преимущественно солидный" },
  { value: "солидный", label: "Солидный" },
];

const THYROID_NODE_CONTOUR_OPTIONS: FieldEditorOption[] = [
  { value: "четкий ровный", label: "Четкий ровный" },
  { value: "не четкий", label: "Не четкий" },
  { value: "не ровный", label: "Не ровный" },
  {
    value: "экстра-тиреоидальное распространение",
    label: "Экстра-тиреоидальное распространение",
  },
];

const THYROID_NODE_ECHOGENIC_FOCI_OPTIONS: FieldEditorOption[] = [
  { value: "нет", label: "Нет" },
  { value: "артефакт хвоста кометы", label: "Артефакт хвоста кометы" },
  { value: "макрокальцинаты", label: "Макрокальцинаты" },
  { value: "периферические кальцинаты", label: "Периферические кальцинаты" },
  { value: "микрокальцинаты", label: "Микрокальцинаты" },
];

const THYROID_NODE_ORIENTATION_OPTIONS: FieldEditorOption[] = [
  { value: "горизонтальная", label: "Горизонтальная" },
  { value: "вертикальная", label: "Вертикальная" },
];

const THYROID_NODE_BLOOD_FLOW_OPTIONS: FieldEditorOption[] = [
  { value: "не изменен", label: "Не изменен" },
  { value: "усилен", label: "Усилен" },
  { value: "обеднен", label: "Обеднен" },
];

const THYROID_CONCLUSION_SAMPLES: ConclusionSample[] = [
  {
    title: "Норма",
    value: "УЗ-признаков патологии щитовидной железы не выявлено.",
  },
  {
    title: "Узловой зоб",
    value: "УЗ-признаки узловых образований щитовидной железы.",
  },
  {
    title: "Диффузные изменения",
    value: "УЗ-признаки диффузных изменений щитовидной железы.",
  },
  {
    title: "Тиреоидит",
    value: "УЗ-признаки диффузных изменений по типу тиреоидита.",
  },
];

function computeVolume(length: string, width: string, depth: string): string {
  const l = parseFloat(length);
  const w = parseFloat(width);
  const d = parseFloat(depth);

  if ([l, w, d].some((part) => Number.isNaN(part) || part <= 0)) {
    return "";
  }

  return ((l * w * d * 0.479) / 1000).toFixed(2);
}

function getTiradsCategory(points: number): string {
  if (points === 0) return "TI-RADS 2";
  if (points === 1) return "TI-RADS 2";
  if (points === 2) return "TI-RADS 2";
  if (points === 3) return "TI-RADS 3";
  if (points === 4) return "TI-RADS 4a";
  if (points === 5) return "TI-RADS 4b";
  if (points === 6) return "TI-RADS 4c";
  if (points >= 7) return "TI-RADS 5";
  return "TI-RADS";
}

const ECHOGENICITY_POINTS: Record<string, number> = {
  "анэхогенный": 0,
  "гиперэхогенный": 1,
  "изоэхогенный": 1,
  "гипоэхогенный": 2,
  "выраженно гипоэхогенный": 3,
};

const ECHOSTRUCTURE_POINTS: Record<string, number> = {
  "кистозный": 0,
  "спонгиозный": 0,
  "кистозно-солидная": 1,
  "преимущественно солидный": 2,
  "солидный": 2,
};

const CONTOUR_POINTS: Record<string, number> = {
  "четкий ровный": 0,
  "не четкий": 0,
  "не ровный": 2,
  "экстра-тиреоидальное распространение": 3,
};

const ECHOGENIC_FOCI_POINTS: Record<string, number> = {
  "нет": 0,
  "артефакт хвоста кометы": 0,
  "макрокальцинаты": 1,
  "периферические кальцинаты": 2,
  "микрокальцинаты": 3,
};

const ORIENTATION_POINTS: Record<string, number> = {
  "горизонтальная": 0,
  "вертикальная": 3,
};

function computeNodeTiradsCategory(node: ThyroidNodeDraft): string {
  const allSelected =
    node.echogenicity &&
    node.echostructure &&
    node.contour &&
    node.echogenicFoci &&
    node.orientation;

  if (!allSelected) {
    return "";
  }

  const points =
    (ECHOGENICITY_POINTS[node.echogenicity] ?? 0) +
    (ECHOSTRUCTURE_POINTS[node.echostructure] ?? 0) +
    (CONTOUR_POINTS[node.contour] ?? 0) +
    (ECHOGENIC_FOCI_POINTS[node.echogenicFoci] ?? 0) +
    (ORIENTATION_POINTS[node.orientation] ?? 0);

  return getTiradsCategory(points);
}

export function ThyroidProtocolBlock({
  styles,
  value,
  onChange,
}: ThyroidProtocolBlockProps) {
  const [form, setForm] = useState<ThyroidStudyDraft>(
    value ?? createEmptyThyroidStudyDraft(),
  );
  const [editorState, setEditorState] = useState<EditorState>(null);

  const thyroid = form.thyroid;

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

  const updateForm = (updater: (current: ThyroidStudyDraft) => ThyroidStudyDraft) => {
    setForm((current) => {
      const next = updater(current);
      onChange(next);
      return next;
    });
  };

  const updateThyroidField = <K extends keyof ThyroidDraft>(field: K, nextValue: string) => {
    updateForm((current) => ({
      ...current,
      thyroid: {
        ...current.thyroid,
        [field]: nextValue,
      },
    }));
  };

  const updateLobeField = (
    side: "right" | "left",
    field: keyof ThyroidLobeDraft,
    nextValue: string,
  ) => {
    updateForm((current) => {
      const sourceLobe = side === "right" ? current.thyroid.rightLobe : current.thyroid.leftLobe;
      const nextLobe: ThyroidLobeDraft = {
        ...sourceLobe,
        [field]: nextValue,
      };

      if (field === "length" || field === "width" || field === "depth") {
        nextLobe.volume = computeVolume(
          field === "length" ? nextValue : nextLobe.length,
          field === "width" ? nextValue : nextLobe.width,
          field === "depth" ? nextValue : nextLobe.depth,
        );
      }

      if (field === "volumeFormations" && isNormalizedMatch(nextValue, "не определяются")) {
        nextLobe.nodesList = [];
      }

      return {
        ...current,
        thyroid: {
          ...current.thyroid,
          [side === "right" ? "rightLobe" : "leftLobe"]: nextLobe,
        },
      };
    });
  };

  const addNode = (side: "right" | "left") => {
    updateForm((current) => {
      const sourceLobe = side === "right" ? current.thyroid.rightLobe : current.thyroid.leftLobe;
      const nextNode = {
        ...createEmptyThyroidNodeDraft(),
        number: sourceLobe.nodesList.length + 1,
      };

      return {
        ...current,
        thyroid: {
          ...current.thyroid,
          [side === "right" ? "rightLobe" : "leftLobe"]: {
            ...sourceLobe,
            nodesList: [...sourceLobe.nodesList, nextNode],
          },
        },
      };
    });
  };

  const updateNodeField = (
    side: "right" | "left",
    index: number,
    field: keyof ThyroidNodeDraft,
    nextValue: string,
  ) => {
    updateForm((current) => {
      const sourceLobe = side === "right" ? current.thyroid.rightLobe : current.thyroid.leftLobe;
      const nextNodes = sourceLobe.nodesList.map((node, nodeIndex) => {
        if (nodeIndex !== index) {
          return node;
        }

        const nextNode: ThyroidNodeDraft = {
          ...node,
          [field]: nextValue,
        };

        return {
          ...nextNode,
          tiradsCategory: computeNodeTiradsCategory(nextNode),
        };
      });

      return {
        ...current,
        thyroid: {
          ...current.thyroid,
          [side === "right" ? "rightLobe" : "leftLobe"]: {
            ...sourceLobe,
            nodesList: nextNodes,
          },
        },
      };
    });
  };

  const removeNode = (side: "right" | "left", index: number) => {
    updateForm((current) => {
      const sourceLobe = side === "right" ? current.thyroid.rightLobe : current.thyroid.leftLobe;
      const nextNodes = sourceLobe.nodesList
        .filter((_, nodeIndex) => nodeIndex !== index)
        .map((node, nodeIndex) => ({ ...node, number: nodeIndex + 1 }));

      return {
        ...current,
        thyroid: {
          ...current.thyroid,
          [side === "right" ? "rightLobe" : "leftLobe"]: {
            ...sourceLobe,
            nodesList: nextNodes,
          },
        },
      };
    });
  };

  const renderField = (
    label: string,
    displayValue: string,
    typeLabel: "numpad" | "select" | "text" | "auto",
    filled: boolean,
    onPress?: () => void,
    readonly?: boolean,
  ) => (
    <ProtocolFieldRow
      label={label}
      value={displayValue}
      typeLabel={typeLabel}
      filled={filled}
      readonly={readonly}
      onPress={onPress}
    />
  );

  const renderLobe = (side: "right" | "left") => {
    const lobe = side === "right" ? thyroid.rightLobe : thyroid.leftLobe;
    const title = side === "right" ? "Правая доля" : "Левая доля";
    const showNodes = isNormalizedMatch(lobe.volumeFormations, "определяются");

    return (
      <View style={styles.kidneyPlainSection} key={side}>
        <ProtocolOrganHeader title={title} />

        <View style={styles.obpFieldList}>
          <ProtocolSectionHeader title="Размеры" />
          {renderField(
            "Длина (мм)",
            lobe.length || "Нажмите для ввода",
            "numpad",
            Boolean(lobe.length),
            () =>
              openEditor({
                title: `${title}: длина`,
                mode: "number",
                value: lobe.length,
                placeholder: "мм",
                onSave: (nextValue) => updateLobeField(side, "length", nextValue),
              }),
          )}
          {renderField(
            "Ширина (мм)",
            lobe.width || "Нажмите для ввода",
            "numpad",
            Boolean(lobe.width),
            () =>
              openEditor({
                title: `${title}: ширина`,
                mode: "number",
                value: lobe.width,
                placeholder: "мм",
                onSave: (nextValue) => updateLobeField(side, "width", nextValue),
              }),
          )}
          {renderField(
            "Глубина (мм)",
            lobe.depth || "Нажмите для ввода",
            "numpad",
            Boolean(lobe.depth),
            () =>
              openEditor({
                title: `${title}: глубина`,
                mode: "number",
                value: lobe.depth,
                placeholder: "мм",
                onSave: (nextValue) => updateLobeField(side, "depth", nextValue),
              }),
          )}
          {renderField(
            "Объем (мл)",
            lobe.volume || "Рассчитывается автоматически",
            "auto",
            Boolean(lobe.volume),
            undefined,
            true,
          )}

          <ProtocolSectionHeader title="Объемные образования" />
          {renderField(
            "Определение",
            lobe.volumeFormations || "Нажмите для ввода",
            "select",
            Boolean(lobe.volumeFormations),
            () =>
              openEditor({
                title: `${title}: объемные образования`,
                mode: "select",
                value: lobe.volumeFormations,
                options: THYROID_VOLUME_FORMATIONS_OPTIONS,
                onSave: (nextValue) => updateLobeField(side, "volumeFormations", nextValue),
              }),
          )}

          {showNodes && (
            <View style={styles.obpFieldList}>
              {lobe.nodesList.length === 0 ? (
                <Text style={styles.helperText}>Добавьте хотя бы один узел.</Text>
              ) : (
                lobe.nodesList.map((node, index) => (
                  <ProtocolCard
                    key={`${side}-thyroid-node-${index}`}
                    title={`Узел #${index + 1}`}
                    actionLabel="Удалить"
                    actionVariant="danger"
                    onActionPress={() => removeNode(side, index)}
                    variant="item"
                  >
                    <View style={styles.obpFieldList}>
                      <View style={styles.dualRow}>
                        <View style={styles.dualCol}>
                          {renderField(
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
                                onSave: (nextValue) =>
                                  updateNodeField(side, index, "size1", nextValue),
                              }),
                          )}
                        </View>
                        <View style={styles.dualCol}>
                          {renderField(
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
                                onSave: (nextValue) =>
                                  updateNodeField(side, index, "size2", nextValue),
                              }),
                          )}
                        </View>
                      </View>

                      {renderField(
                        "Эхогенность",
                        node.echogenicity || "Нажмите для ввода",
                        "select",
                        Boolean(node.echogenicity),
                        () =>
                          openEditor({
                            title: `Узел #${index + 1}: эхогенность`,
                            mode: "select",
                            value: node.echogenicity,
                            options: THYROID_NODE_ECHOGENICITY_OPTIONS,
                            onSave: (nextValue) =>
                              updateNodeField(side, index, "echogenicity", nextValue),
                          }),
                      )}

                      {renderField(
                        "Эхоструктура",
                        node.echostructure || "Нажмите для ввода",
                        "select",
                        Boolean(node.echostructure),
                        () =>
                          openEditor({
                            title: `Узел #${index + 1}: эхоструктура`,
                            mode: "select",
                            value: node.echostructure,
                            options: THYROID_NODE_ECHOSTRUCTURE_OPTIONS,
                            onSave: (nextValue) =>
                              updateNodeField(side, index, "echostructure", nextValue),
                          }),
                      )}

                      {renderField(
                        "Контур",
                        node.contour || "Нажмите для ввода",
                        "select",
                        Boolean(node.contour),
                        () =>
                          openEditor({
                            title: `Узел #${index + 1}: контур`,
                            mode: "select",
                            value: node.contour,
                            options: THYROID_NODE_CONTOUR_OPTIONS,
                            onSave: (nextValue) => updateNodeField(side, index, "contour", nextValue),
                          }),
                      )}

                      {renderField(
                        "Эхогенные фокусы",
                        node.echogenicFoci || "Нажмите для ввода",
                        "select",
                        Boolean(node.echogenicFoci),
                        () =>
                          openEditor({
                            title: `Узел #${index + 1}: эхогенные фокусы`,
                            mode: "select",
                            value: node.echogenicFoci,
                            options: THYROID_NODE_ECHOGENIC_FOCI_OPTIONS,
                            onSave: (nextValue) =>
                              updateNodeField(side, index, "echogenicFoci", nextValue),
                          }),
                      )}

                      {renderField(
                        "Ориентация",
                        node.orientation || "Нажмите для ввода",
                        "select",
                        Boolean(node.orientation),
                        () =>
                          openEditor({
                            title: `Узел #${index + 1}: ориентация`,
                            mode: "select",
                            value: node.orientation,
                            options: THYROID_NODE_ORIENTATION_OPTIONS,
                            onSave: (nextValue) =>
                              updateNodeField(side, index, "orientation", nextValue),
                          }),
                      )}

                      {renderField(
                        "Кровоток",
                        node.bloodFlow || "Нажмите для ввода",
                        "select",
                        Boolean(node.bloodFlow),
                        () =>
                          openEditor({
                            title: `Узел #${index + 1}: кровоток`,
                            mode: "select",
                            value: node.bloodFlow,
                            options: THYROID_NODE_BLOOD_FLOW_OPTIONS,
                            onSave: (nextValue) =>
                              updateNodeField(side, index, "bloodFlow", nextValue),
                          }),
                      )}

                      {renderField(
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
                            onSave: (nextValue) =>
                              updateNodeField(side, index, "comment", nextValue),
                          }),
                      )}

                      {node.tiradsCategory ? (
                        <Text style={styles.helperText}>Класс {node.tiradsCategory}</Text>
                      ) : null}
                    </View>
                  </ProtocolCard>
                ))
              )}

              <ProtocolActionButton
                label="+ Узел"
                onPress={() => addNode(side)}
              />
            </View>
          )}

          <ProtocolSectionHeader title="Дополнительно" />
          {renderField(
            "Дополнительно",
            lobe.additional || "Нажмите для ввода",
            "text",
            Boolean(lobe.additional),
            () =>
              openEditor({
                title: `${title}: дополнительно`,
                mode: "text",
                value: lobe.additional,
                placeholder: "Введите дополнительное описание",
                multiline: true,
                onSave: (nextValue) => updateLobeField(side, "additional", nextValue),
              }),
          )}
        </View>
      </View>
    );
  };

  const isConclusionEditor = editorState?.title === "Заключение щитовидной железы";

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
        footerContent={
          isConclusionEditor
            ? ({ value, setValue, close }) => (
                <View style={styles.obpSampleList}>
                  {THYROID_CONCLUSION_SAMPLES.map((sample) => (
                    <Pressable
                      key={sample.title}
                      onPress={() => {
                        const nextValue = value
                          ? `${value}${value.endsWith("\n") ? "" : "\n"}${sample.value}`
                          : sample.value;
                        setValue(nextValue);
                      }}
                      style={({ pressed }) => [
                        styles.obpSampleButton,
                        pressed && styles.obpSampleButtonPressed,
                      ]}
                    >
                      <Text style={styles.obpSampleButtonTitle}>{sample.title}</Text>
                      <Text style={styles.obpSampleButtonText}>{sample.value}</Text>
                    </Pressable>
                  ))}

                  <Pressable
                    onPress={close}
                    style={({ pressed }) => [
                      styles.secondaryButton,
                      {
                        alignSelf: "flex-start",
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                      },
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <Text style={styles.secondaryButtonText}>Закрыть</Text>
                  </Pressable>
                </View>
              )
            : undefined
        }
        onCancel={closeEditor}
        onSave={saveEditor}
      />

      <View style={styles.kidneyPlainSection}>
        {renderLobe("right")}
        {renderLobe("left")}
      </View>

      <View style={styles.kidneyPlainSection}>
        <ProtocolOrganHeader title="Перешеек" />
        <View style={styles.obpFieldList}>
          {renderField(
            "Размер перешейка (мм)",
            thyroid.isthmusSize || "Нажмите для ввода",
            "numpad",
            Boolean(thyroid.isthmusSize),
            () =>
              openEditor({
                title: "Перешеек: размер",
                mode: "number",
                value: thyroid.isthmusSize,
                placeholder: "мм",
                onSave: (nextValue) => updateThyroidField("isthmusSize", nextValue),
              }),
          )}
        </View>
      </View>

      <View style={styles.kidneyPlainSection}>
        <ProtocolOrganHeader title="Общие показатели" />
        <View style={styles.obpFieldList}>
          {renderField(
            "Общий объем (мл)",
            thyroid.totalVolume || "Рассчитывается автоматически",
            "auto",
            Boolean(thyroid.totalVolume),
            undefined,
            true,
          )}
          {renderField(
            "Соотношение правой к левой",
            thyroid.rightToLeftRatio || "Рассчитывается автоматически",
            "auto",
            Boolean(thyroid.rightToLeftRatio),
            undefined,
            true,
          )}
          {renderField(
            "Эхогенность железы",
            thyroid.echogenicity || "Нажмите для ввода",
            "select",
            Boolean(thyroid.echogenicity),
            () =>
              openEditor({
                title: "Эхогенность железы",
                mode: "select",
                value: thyroid.echogenicity,
                options: THYROID_ECHOGENICITY_OPTIONS,
                onSave: (nextValue) => updateThyroidField("echogenicity", nextValue),
              }),
          )}
          {renderField(
            "Эхоструктура",
            thyroid.echostructure || "Нажмите для ввода",
            "select",
            Boolean(thyroid.echostructure),
            () =>
              openEditor({
                title: "Эхоструктура",
                mode: "select",
                value: thyroid.echostructure,
                options: THYROID_ECHOSTRUCTURE_OPTIONS,
                onSave: (nextValue) => updateThyroidField("echostructure", nextValue),
              }),
          )}
          {renderField(
            "Контур",
            thyroid.contour || "Нажмите для ввода",
            "select",
            Boolean(thyroid.contour),
            () =>
              openEditor({
                title: "Контур железы",
                mode: "select",
                value: thyroid.contour,
                options: THYROID_CONTOUR_OPTIONS,
                onSave: (nextValue) => updateThyroidField("contour", nextValue),
              }),
          )}
          {renderField(
            "Симметричность",
            thyroid.symmetry || "Нажмите для ввода",
            "select",
            Boolean(thyroid.symmetry),
            () =>
              openEditor({
                title: "Симметричность",
                mode: "select",
                value: thyroid.symmetry,
                options: THYROID_SYMMETRY_OPTIONS,
                onSave: (nextValue) => updateThyroidField("symmetry", nextValue),
              }),
          )}
          {renderField(
            "Положение",
            thyroid.position || "Нажмите для ввода",
            "select",
            Boolean(thyroid.position),
            () =>
              openEditor({
                title: "Положение железы",
                mode: "select",
                value: thyroid.position,
                options: THYROID_POSITION_OPTIONS,
                onSave: (nextValue) => updateThyroidField("position", nextValue),
              }),
          )}
        </View>
      </View>

      <View style={styles.kidneyPlainSection}>
        <ProtocolOrganHeader title="Заключение" />
        <View style={styles.obpFieldList}>
          {renderField(
            "Заключение",
            form.conclusion || "Нажмите для ввода",
            "text",
            Boolean(form.conclusion),
            () =>
              openEditor({
                title: "Заключение щитовидной железы",
                mode: "text",
                value: form.conclusion,
                placeholder: "Введите заключение",
                multiline: true,
                footerContent: ({ value, setValue }) => (
                  <View style={styles.obpSampleList}>
                    {THYROID_CONCLUSION_SAMPLES.map((sample) => (
                      <Pressable
                        key={sample.title}
                        onPress={() => {
                          const nextValue = value
                            ? `${value}${value.endsWith("\n") ? "" : "\n"}${sample.value}`
                            : sample.value;
                          setValue(nextValue);
                        }}
                        style={({ pressed }) => [
                          styles.obpSampleButton,
                          pressed && styles.obpSampleButtonPressed,
                        ]}
                      >
                        <Text style={styles.obpSampleButtonTitle}>{sample.title}</Text>
                        <Text style={styles.obpSampleButtonText}>{sample.value}</Text>
                      </Pressable>
                    ))}
                  </View>
                ),
                onSave: (nextValue) =>
                  updateForm((current) => ({
                    ...current,
                    conclusion: nextValue,
                  })),
              }),
          )}
          {renderField(
            "Рекомендации",
            form.recommendations || "Нажмите для ввода",
            "text",
            Boolean(form.recommendations),
            () =>
              openEditor({
                title: "Рекомендации щитовидной железы",
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
    </>
  );
}

export default ThyroidProtocolBlock;
