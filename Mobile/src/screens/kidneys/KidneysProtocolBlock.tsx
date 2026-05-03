import { Fragment, useEffect, useMemo, useState } from "react";
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
import {
  createEmptyKidneyConcrementDraft,
  createEmptyKidneyCystDraft,
  createEmptyKidneyDraft,
  createEmptyUrinaryBladderDraft,
  type KidneyConcrementDraft,
  type KidneyCystDraft,
  type KidneyDraft,
  type KidneyStudyDraft,
  type UrinaryBladderDraft,
} from "../../shared/kidneyDraft";
import { isNormalizedMatch } from "../../shared/normalizeSelectValue";

type EditorState = {
  title: string;
  mode: "number" | "select" | "text";
  value: string;
  placeholder?: string;
  multiline?: boolean;
  options?: FieldEditorOption[];
  onSave: (value: string) => void;
} | null;

type KidneyRenderableFieldKey =
  | "position"
  | "positionText"
  | "length"
  | "width"
  | "thickness"
  | "parenchymaSize"
  | "parenchymaEchogenicity"
  | "parenchymaStructure"
  | "parenchymaConcrements"
  | "parenchymaCysts"
  | "parenchymaPathologicalFormations"
  | "pcsSize"
  | "pcsMicroliths"
  | "pcsMicrolithsSize"
  | "pcsConcrements"
  | "pcsCysts"
  | "pcsPathologicalFormations"
  | "sinus"
  | "adrenalArea"
  | "adrenalAreaText"
  | "contour"
  | "additional";

type KidneyFieldSpec = {
  key: KidneyRenderableFieldKey;
  label: string;
  kind: "number" | "select" | "text";
  placeholder?: string;
  multiline?: boolean;
  options?: FieldEditorOption[];
};

type UrinaryBladderFieldSpec = {
  key: keyof UrinaryBladderDraft;
  label: string;
  kind: "number" | "select" | "text";
  placeholder?: string;
  multiline?: boolean;
  options?: FieldEditorOption[];
};

type KidneysProtocolBlockProps = {
  styles: any;
  value: KidneyStudyDraft;
  onChange: (value: KidneyStudyDraft) => void;
};

const KIDNEY_CONTOUR_OPTIONS: FieldEditorOption[] = [
  { value: "чёткий ровный", label: "Чёткий ровный" },
  { value: "чёткий неровный", label: "Чёткий неровный" },
  { value: "нечёткий", label: "Нечёткий" },
];

const KIDNEY_LOCATION_OPTIONS: FieldEditorOption[] = [
  { value: "верхнего полюса", label: "верхний полюс" },
  { value: "нижнего полюса", label: "нижний полюс" },
  { value: "центральной части", label: "в центре" },
];

const KIDNEY_POSITION_OPTIONS: FieldEditorOption[] = [
  { value: "обычное", label: "Обычное" },
  { value: "опущение", label: "Опущение" },
  { value: "нефроптоз", label: "Нефроптоз" },
  { value: "нефрэктомия", label: "Нефрэктомия" },
];

const KIDNEY_PARRENCHYMA_ECHOGENICITY_OPTIONS: FieldEditorOption[] = [
  { value: "средняя", label: "Средняя" },
  { value: "повышена", label: "Повышена" },
  { value: "понижена", label: "Понижена" },
];

const KIDNEY_PARRENCHYMA_STRUCTURE_OPTIONS: FieldEditorOption[] = [
  { value: "однородная", label: "Однородная" },
  { value: "диффузно-неоднородная", label: "Диффузно-неоднородная" },
];

const KIDNEY_YES_NO_OPTIONS: FieldEditorOption[] = [
  { value: "не определяются", label: "Не определяются" },
  { value: "определяются", label: "Определяются" },
];

const KIDNEY_ADRENAL_OPTIONS: FieldEditorOption[] = [
  { value: "не изменена", label: "Не изменена" },
  { value: "изменена", label: "Изменена" },
];

const BLADDER_CONTENT_OPTIONS: FieldEditorOption[] = [
  { value: "однородное", label: "Однородное" },
  { value: "неоднородное", label: "Неоднородное" },
];

const RESIDUAL_STATUS_OPTIONS: FieldEditorOption[] = [
  { value: "определяется", label: "Определяется" },
  { value: "не определяется", label: "Не определяется" },
];

const KIDNEY_CONCLUSION_SAMPLES: Array<{ title: string; value: string }> = [
  { title: "Норма", value: "УЗ-признаков патологии почек не выявлено." },
  { title: "МКБ", value: "Эхографические признаки мочекаменной болезни." },
  { title: "Нефролитиаз", value: "Эхографические признаки нефролитиаза." },
  { title: "Пиелонефрит", value: "Эхографические признаки пиелонефрита." },
  { title: "Киста(ы) правой почки", value: "Эхографические признаки кисты(т) правой почки." },
  { title: "Киста(ы) левой почки", value: "Эхографические признаки кисты(т) левой почки." },
  { title: "Гидронефроз", value: "Эхографические признаки гидронефроза." },
];

function isObjectValue(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object");
}

function formatNumberInput(value: string): string {
  return value.replace(/[^0-9.,]/g, "");
}

const KIDNEY_NUMERIC_FIELDS = new Set<keyof KidneyDraft>([
  "length",
  "width",
  "thickness",
  "parenchymaSize",
  "pcsMicrolithsSize",
]);

const BLADDER_NUMERIC_FIELDS = new Set<keyof UrinaryBladderDraft>([
  "length",
  "width",
  "depth",
  "volume",
  "wallThickness",
  "residualLength",
  "residualWidth",
  "residualDepth",
  "residualVolume",
]);

export function KidneysProtocolBlock({
  styles,
  value,
  onChange,
}: KidneysProtocolBlockProps) {
  const [form, setForm] = useState<KidneyStudyDraft>(value);
  const [editorState, setEditorState] = useState<EditorState>(null);

  useEffect(() => {
    setForm(value);
  }, [value]);

  const hasAnyKidneyData = useMemo(
    () =>
      Boolean(
        form.rightKidney ||
          form.leftKidney ||
          form.urinaryBladder ||
          form.conclusion.trim() ||
          form.recommendations.trim(),
      ),
    [form],
  );

  const updateStudy = (
    producer: (current: KidneyStudyDraft) => KidneyStudyDraft,
  ) => {
    setForm((current) => {
      const next = producer(current);
      onChange(next);
      return next;
    });
  };

  const ensureKidney = (
    study: KidneyStudyDraft,
    side: "rightKidney" | "leftKidney",
  ): KidneyDraft => study[side] ?? createEmptyKidneyDraft();

  const ensureBladder = (study: KidneyStudyDraft): UrinaryBladderDraft =>
    study.urinaryBladder ?? createEmptyUrinaryBladderDraft();

  const updateKidneyField = (
    side: "rightKidney" | "leftKidney",
    field: keyof KidneyDraft,
    rawValue: string,
  ) => {
    updateStudy((current) => {
      const currentKidney = ensureKidney(current, side);
      const value = KIDNEY_NUMERIC_FIELDS.has(field)
        ? formatNumberInput(rawValue)
        : rawValue;
      const nextKidney: KidneyDraft = {
        ...currentKidney,
        [field]: value,
      };

      if (field === "position" && value === "обычное") {
        nextKidney.positionText = "";
      }

      if (field === "parenchymaConcrements" && value === "не определяются") {
        nextKidney.parenchymaConcrementslist = [];
      }

      if (field === "parenchymaCysts" && value === "не определяются") {
        nextKidney.parenchymaCystslist = [];
        nextKidney.parenchymaMultipleCysts = false;
        nextKidney.parenchymaMultipleCystsSize = "";
      }

      if (field === "parenchymaPathologicalFormations" && value === "не определяются") {
        nextKidney.parenchymaPathologicalFormationsText = "";
      }

      if (field === "pcsMicroliths" && value === "не определяются") {
        nextKidney.pcsMicrolithsSize = "";
      }

      if (field === "pcsConcrements" && value === "не определяются") {
        nextKidney.pcsConcrementslist = [];
      }

      if (field === "pcsCysts" && value === "не определяются") {
        nextKidney.pcsCystslist = [];
        nextKidney.pcsMultipleCysts = false;
        nextKidney.pcsMultipleCystsSize = "";
      }

      if (field === "pcsPathologicalFormations" && value === "не определяются") {
        nextKidney.pcsPathologicalFormationsText = "";
      }

      if (field === "adrenalArea" && value === "не изменена") {
        nextKidney.adrenalAreaText = "";
      }

      return {
        ...current,
        [side]: nextKidney,
      };
    });
  };

  const updateKidneyListItem = (
    side: "rightKidney" | "leftKidney",
    listKey:
      | "parenchymaConcrementslist"
      | "parenchymaCystslist"
      | "pcsConcrementslist"
      | "pcsCystslist",
    index: number,
    field: keyof KidneyConcrementDraft | keyof KidneyCystDraft,
    rawValue: string,
  ) => {
    updateStudy((current) => {
      const currentKidney = ensureKidney(current, side);
      const nextList = [...currentKidney[listKey]];
      const currentItem = nextList[index];
      if (!currentItem) {
        return current;
      }

      nextList[index] = {
        ...currentItem,
        [field]: rawValue,
      };

      return {
        ...current,
        [side]: {
          ...currentKidney,
          [listKey]: nextList,
        },
      };
    });
  };

  const updateKidneyCystSize = (
    side: "rightKidney" | "leftKidney",
    listKey: "parenchymaCystslist" | "pcsCystslist",
    index: number,
    nextFirst?: string,
    nextSecond?: string,
  ) => {
    updateStudy((current) => {
      const currentKidney = ensureKidney(current, side);
      const nextList = [...currentKidney[listKey]];
      const currentItem = nextList[index];
      if (!currentItem) {
        return current;
      }

      const [currentFirst = "", currentSecond = ""] = currentItem.size.split("x");
      const resolvedFirst = nextFirst ?? currentFirst;
      const resolvedSecond = nextSecond ?? currentSecond;
      nextList[index] = {
        ...currentItem,
        size: `${resolvedFirst}${resolvedSecond ? `x${resolvedSecond}` : ""}`,
      };

      return {
        ...current,
        [side]: {
          ...currentKidney,
          [listKey]: nextList,
        },
      };
    });
  };

  const addKidneyListItem = (
    side: "rightKidney" | "leftKidney",
    listKey:
      | "parenchymaConcrementslist"
      | "parenchymaCystslist"
      | "pcsConcrementslist"
      | "pcsCystslist",
  ) => {
    const nextItem =
      listKey === "parenchymaConcrementslist" ||
      listKey === "pcsConcrementslist"
        ? createEmptyKidneyConcrementDraft()
        : createEmptyKidneyCystDraft();

    updateStudy((current) => {
      const currentKidney = ensureKidney(current, side);
      return {
        ...current,
        [side]: {
          ...currentKidney,
          [listKey]: [...currentKidney[listKey], nextItem],
        },
      };
    });
  };

  const removeKidneyListItem = (
    side: "rightKidney" | "leftKidney",
    listKey:
      | "parenchymaConcrementslist"
      | "parenchymaCystslist"
      | "pcsConcrementslist"
      | "pcsCystslist",
    index: number,
  ) => {
    updateStudy((current) => {
      const currentKidney = ensureKidney(current, side);
      return {
        ...current,
        [side]: {
          ...currentKidney,
          [listKey]: currentKidney[listKey].filter((_, itemIndex) => itemIndex !== index),
        },
      };
    });
  };

  const toggleMultipleCysts = (
    side: "rightKidney" | "leftKidney",
    key: "parenchymaMultipleCysts" | "pcsMultipleCysts",
  ) => {
    updateStudy((current) => {
      const currentKidney = ensureKidney(current, side);
      const nextValue = !currentKidney[key];
      return {
        ...current,
        [side]: {
          ...currentKidney,
          [key]: nextValue,
          ...(nextValue
            ? {}
            : {
                [key === "parenchymaMultipleCysts"
                  ? "parenchymaMultipleCystsSize"
                  : "pcsMultipleCystsSize"]: "",
              }),
        },
      };
    });
  };

  const updateBladderField = (field: keyof UrinaryBladderDraft, rawValue: string) => {
    updateStudy((current) => {
      const currentBladder = ensureBladder(current);
      const value = BLADDER_NUMERIC_FIELDS.has(field)
        ? formatNumberInput(rawValue)
        : rawValue;
      const nextBladder: UrinaryBladderDraft = {
        ...currentBladder,
        [field]: value,
      };

      if (field === "length" || field === "width" || field === "depth") {
        const length = parseFloat(field === "length" ? value : currentBladder.length || "0");
        const width = parseFloat(field === "width" ? value : currentBladder.width || "0");
        const depth = parseFloat(field === "depth" ? value : currentBladder.depth || "0");
        nextBladder.volume =
          length > 0 && width > 0 && depth > 0
            ? ((length * width * depth * 0.523) / 1000).toFixed(0)
            : "";
      }

      if (field === "residualLength" || field === "residualWidth" || field === "residualDepth") {
        const length = parseFloat(field === "residualLength" ? value : currentBladder.residualLength || "0");
        const width = parseFloat(field === "residualWidth" ? value : currentBladder.residualWidth || "0");
        const depth = parseFloat(field === "residualDepth" ? value : currentBladder.residualDepth || "0");
        nextBladder.residualVolume =
          length > 0 && width > 0 && depth > 0
            ? ((length * width * depth * 0.523) / 1000).toFixed(0)
            : "";
      }

      if (field === "contents" && value === "однородное") {
        nextBladder.contentsText = "";
      }

      return {
        ...current,
        urinaryBladder: nextBladder,
      };
    });
  };

  const openEditor = (config: EditorState) => {
    Keyboard.dismiss();
    setEditorState(config);
  };

  const closeEditor = () => setEditorState(null);

  const saveEditor = (nextValue: string) => {
    if (!editorState) {
      return;
    }

    editorState.onSave(nextValue);
    setEditorState(null);
  };

  const renderInlineSectionHeader = (label: string, note?: string) => (
    <ProtocolSectionHeader title={label} note={note} />
  );

  const splitPairSize = (value: string): [string, string] => {
    const [first = "", second = ""] = value.split("x");
    return [first, second];
  };

  const joinPairSize = (first: string, second: string) =>
    `${first}${second ? `x${second}` : ""}`;

  const renderFieldRow = (
    label: string,
    valueText: string,
    filled: boolean,
    typeLabel: string,
    onPress: () => void,
  ) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.obpFieldRow,
        filled && styles.obpFieldRowFilled,
        pressed && styles.obpFieldRowPressed,
      ]}
    >
      <View style={styles.obpFieldRowContent}>
        <Text style={styles.obpFieldLabel}>{label}</Text>
        <Text style={styles.obpFieldValue}>{valueText || "Нажмите для ввода"}</Text>
      </View>
      <Text style={styles.obpFieldType}>{typeLabel}</Text>
    </Pressable>
  );

  const renderKidneySide = (title: string, side: "rightKidney" | "leftKidney") => {
    const kidney = ensureKidney(form, side);
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

  const renderConcrementSection = (
    sectionTitle: string,
    items: KidneyConcrementDraft[],
    listKey: "parenchymaConcrementslist" | "pcsConcrementslist",
    emptyText: string,
  ) => (
    <ProtocolCard title={sectionTitle} countText={`${items.length} items`}>
      <ProtocolActionButton
        label="+ Конкремент"
        onPress={() => addKidneyListItem(side, listKey)}
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
              onActionPress={() => removeKidneyListItem(side, listKey, index)}
              variant="item"
            >
              <View style={styles.obpFieldList}>
                {(["size", "location"] as const).map((itemField) => (
                  <Pressable
                    key={`${itemField}-${index}`}
                    onPress={() =>
                      openEditor({
                        title: `${itemField === "size" ? "Размер" : "Локализация"} #${index + 1}`,
                        mode: itemField === "size" ? "number" : "select",
                        value: item[itemField],
                        placeholder: itemField === "size" ? "мм" : undefined,
                        options:
                          itemField === "location" ? KIDNEY_LOCATION_OPTIONS : undefined,
                        onSave: (nextValue) =>
                          updateKidneyListItem(
                            side,
                            listKey,
                            index,
                            itemField,
                            nextValue,
                          ),
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
                ))}
              </View>
            </ProtocolCard>
          ))
        )}
      </View>
    </ProtocolCard>
  );

  const kidneyFields: KidneyFieldSpec[] = [
      { key: "position", label: "Положение", kind: "select", options: KIDNEY_POSITION_OPTIONS },
      { key: "length", label: "Длина", kind: "number", placeholder: "мм" },
      { key: "width", label: "Ширина", kind: "number", placeholder: "мм" },
      { key: "thickness", label: "Толщина", kind: "number", placeholder: "мм" },
      { key: "contour", label: "Контур почки", kind: "select", options: KIDNEY_CONTOUR_OPTIONS },
      { key: "parenchymaSize", label: "Размер паренхимы", kind: "number", placeholder: "мм" },
      { key: "parenchymaEchogenicity", label: "Эхогенность", kind: "select", options: KIDNEY_PARRENCHYMA_ECHOGENICITY_OPTIONS },
      { key: "parenchymaStructure", label: "Структура", kind: "select", options: KIDNEY_PARRENCHYMA_STRUCTURE_OPTIONS },
      { key: "parenchymaConcrements", label: "Конкременты паренхимы", kind: "select", options: KIDNEY_YES_NO_OPTIONS },
      { key: "parenchymaCysts", label: "Кисты паренхимы", kind: "select", options: KIDNEY_YES_NO_OPTIONS },
      { key: "parenchymaPathologicalFormations", label: "Патологические образования паренхимы", kind: "select", options: KIDNEY_YES_NO_OPTIONS },
      {
        key: "pcsSize",
        label: "Размер ЧЛС",
        kind: "select",
        options: [
          { value: "не расширена", label: "Не расширена" },
          { value: "расширена", label: "Расширена" },
        ],
      },
      { key: "pcsMicroliths", label: "Микролиты", kind: "select", options: KIDNEY_YES_NO_OPTIONS },
      { key: "pcsMicrolithsSize", label: "Размером до", kind: "number", placeholder: "мм" },
      { key: "pcsConcrements", label: "Конкременты ЧЛС", kind: "select", options: KIDNEY_YES_NO_OPTIONS },
      { key: "pcsCysts", label: "Кисты ЧЛС", kind: "select", options: KIDNEY_YES_NO_OPTIONS },
      { key: "pcsPathologicalFormations", label: "Патологические образования ЧЛС", kind: "select", options: KIDNEY_YES_NO_OPTIONS },
      { key: "sinus", label: "Почечный синус", kind: "select", options: [
        { value: "без включений", label: "Без включений" },
        { value: "с включениями", label: "С включениями" },
      ] },
      { key: "adrenalArea", label: "Область надпочечников", kind: "select", options: KIDNEY_ADRENAL_OPTIONS },
      { key: "additional", label: "Дополнительно", kind: "text", placeholder: "Введите дополнительное описание", multiline: true },
    ];

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
                  renderInlineSectionHeader("Размеры")
                )}

                {field.key === "parenchymaSize" && (
                  renderInlineSectionHeader("Паренхима")
                )}

                {field.key === "pcsSize" && (
                  renderInlineSectionHeader("ЧЛС")
                )}

                <Pressable
                  onPress={() => {
                    openEditor({
                      title: `${title}: ${field.label}`,
                      mode: field.kind,
                      value: currentValue,
                      placeholder: field.placeholder,
                      multiline: field.multiline,
                      options: field.options,
                      onSave: (nextValue) => updateKidneyField(side, field.key, nextValue),
                    });
                  }}
                  style={({ pressed }) => [
                    styles.obpFieldRow,
                    filled && styles.obpFieldRowFilled,
                    pressed && styles.obpFieldRowPressed,
                  ]}
                >
                  <View style={styles.obpFieldRowContent}>
                    <Text style={styles.obpFieldLabel}>{field.label}</Text>
                    <Text style={styles.obpFieldValue}>{currentDisplay}</Text>
                  </View>
                  <Text style={styles.obpFieldType}>
                    {field.kind === "number" ? "numpad" : field.kind === "select" ? "select" : "text"}
                  </Text>
                </Pressable>
                {field.key === "parenchymaConcrements" && showParenchymaConcrements && (
                  <View style={styles.obpFieldList}>
                    {renderConcrementSection(
                      "Конкременты паренхимы",
                      kidney.parenchymaConcrementslist,
                      "parenchymaConcrementslist",
                      "Добавьте хотя бы один конкремент.",
                    )}
                  </View>
                )}

                {field.key === "pcsConcrements" && showPcsConcrements && (
                  <View style={styles.obpFieldList}>
                    {renderConcrementSection(
                      "Конкременты ЧЛС",
                      kidney.pcsConcrementslist,
                      "pcsConcrementslist",
                      "Добавьте хотя бы один конкремент.",
                    )}
                  </View>
                )}


                {field.key === "pcsCysts" && showPcsCysts && (
                  <ProtocolCard
                    title="Кисты ЧЛС"
                    countText={`${kidney.pcsCystslist.length} items`}
                  >
                    <View style={styles.obpFieldList}>
                      <ProtocolActionButton
                        label={
                          kidney.pcsMultipleCysts
                            ? "Множественные кисты: да"
                            : "Множественные кисты: нет"
                        }
                        variant="secondary"
                        compact
                        onPress={() => toggleMultipleCysts(side, "pcsMultipleCysts")}
                      />

                      {kidney.pcsMultipleCysts && (() => {
                        const [multipleSize1 = "", multipleSize2 = ""] = splitPairSize(
                          kidney.pcsMultipleCystsSize,
                        );

                        return (
                          <View style={styles.obpFieldList}>
                            <Pressable
                              onPress={() =>
                                openEditor({
                                  title: "Размер 1 множественных кист ЧЛС",
                                  mode: "number",
                                  value: multipleSize1,
                                  placeholder: "мм",
                                  onSave: (nextValue) =>
                                    updateKidneyField(
                                      side,
                                      "pcsMultipleCystsSize",
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
                                  title: "Размер 2 множественных кист ЧЛС",
                                  mode: "number",
                                  value: multipleSize2,
                                  placeholder: "мм",
                                  onSave: (nextValue) =>
                                    updateKidneyField(
                                      side,
                                      "pcsMultipleCystsSize",
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

                      {kidney.pcsCystslist.length === 0 ? (
                        <Text style={styles.helperText}>Добавьте хотя бы одну кисту.</Text>
                      ) : (
                        kidney.pcsCystslist.map((item, index) => {
                          const [size1 = "", size2 = ""] = splitPairSize(item.size);

                          return (
                            <ProtocolCard
                              key={`pcs-cyst-${index}`}
                              title={`Киста #${index + 1}`}
                              subtitle="Нажмите для редактирования"
                              actionLabel="Удалить"
                              actionVariant="danger"
                              onActionPress={() => removeKidneyListItem(side, "pcsCystslist", index)}
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
                                        updateKidneyCystSize(side, "pcsCystslist", index, nextValue),
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
                                        updateKidneyCystSize(side, "pcsCystslist", index, undefined, nextValue),
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

                                <Pressable
                                  onPress={() =>
                                    openEditor({
                                      title: `Локализация #${index + 1}`,
                                      mode: "select",
                                      value: item.location,
                                      options: KIDNEY_LOCATION_OPTIONS,
                                      onSave: (nextValue) =>
                                        updateKidneyListItem(
                                          side,
                                          "pcsCystslist",
                                          index,
                                          "location",
                                          nextValue,
                                        ),
                                    })
                                  }
                                  style={({ pressed }) => [
                                    styles.obpFieldRow,
                                    item.location.trim().length > 0 && styles.obpFieldRowFilled,
                                    pressed && styles.obpFieldRowPressed,
                                  ]}
                                >
                                  <View style={styles.obpFieldRowContent}>
                                    <Text style={styles.obpFieldLabel}>Локализация</Text>
                                    <Text style={styles.obpFieldValue}>
                                      {item.location || "Нажмите для ввода"}
                                    </Text>
                                  </View>
                                  <Text style={styles.obpFieldType}>select</Text>
                                </Pressable>
                              </View>
                            </ProtocolCard>
                          );
                        })
                      )}

                      <ProtocolActionButton
                        label="+ Киста"
                        onPress={() => addKidneyListItem(side, "pcsCystslist")}
                      />
                    </View>
                  </ProtocolCard>
                )}

                {field.key === "parenchymaCysts" && showParenchymaCysts && (
                  <ProtocolCard
                    title="Кисты паренхимы"
                    countText={`${kidney.parenchymaCystslist.length} items`}
                  >
                    <View style={styles.obpFieldList}>
                      <ProtocolActionButton
                        label={
                          kidney.parenchymaMultipleCysts
                            ? "Множественные кисты: да"
                            : "Множественные кисты: нет"
                        }
                        variant="secondary"
                        compact
                        onPress={() => toggleMultipleCysts(side, "parenchymaMultipleCysts")}
                      />

                      {kidney.parenchymaMultipleCysts && (() => {
                        const [multipleSize1 = "", multipleSize2 = ""] = splitPairSize(
                          kidney.parenchymaMultipleCystsSize,
                        );

                        return (
                          <View style={styles.obpFieldList}>
                            <Pressable
                              onPress={() =>
                                openEditor({
                                  title: "Размер 1 множественных кист",
                                  mode: "number",
                                  value: multipleSize1,
                                  placeholder: "мм",
                                  onSave: (nextValue) =>
                                    updateKidneyField(
                                      side,
                                      "parenchymaMultipleCystsSize",
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
                                  title: "Размер 2 множественных кист",
                                  mode: "number",
                                  value: multipleSize2,
                                  placeholder: "мм",
                                  onSave: (nextValue) =>
                                    updateKidneyField(
                                      side,
                                      "parenchymaMultipleCystsSize",
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

                      {kidney.parenchymaCystslist.length === 0 ? (
                        <Text style={styles.helperText}>Добавьте хотя бы одну кисту.</Text>
                      ) : (
                        kidney.parenchymaCystslist.map((item, index) => {
                          const [size1 = "", size2 = ""] = splitPairSize(item.size);

                          return (
                            <ProtocolCard
                              key={`parenchyma-cyst-${index}`}
                              title={`Киста #${index + 1}`}
                              subtitle="Нажмите для редактирования"
                              actionLabel="Удалить"
                              actionVariant="danger"
                              onActionPress={() => removeKidneyListItem(side, "parenchymaCystslist", index)}
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
                                        updateKidneyCystSize(side, "parenchymaCystslist", index, nextValue),
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
                                        updateKidneyCystSize(side, "parenchymaCystslist", index, undefined, nextValue),
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

                                <Pressable
                                  onPress={() =>
                                    openEditor({
                                      title: `Локализация #${index + 1}`,
                                      mode: "select",
                                      value: item.location,
                                      options: KIDNEY_LOCATION_OPTIONS,
                                      onSave: (nextValue) =>
                                        updateKidneyListItem(
                                          side,
                                          "parenchymaCystslist",
                                          index,
                                          "location",
                                          nextValue,
                                        ),
                                    })
                                  }
                                  style={({ pressed }) => [
                                    styles.obpFieldRow,
                                    item.location.trim().length > 0 && styles.obpFieldRowFilled,
                                    pressed && styles.obpFieldRowPressed,
                                  ]}
                                >
                                  <View style={styles.obpFieldRowContent}>
                                    <Text style={styles.obpFieldLabel}>Локализация</Text>
                                    <Text style={styles.obpFieldValue}>
                                      {item.location || "Нажмите для ввода"}
                                    </Text>
                                  </View>
                                  <Text style={styles.obpFieldType}>select</Text>
                                </Pressable>
                              </View>
                            </ProtocolCard>
                          );
                        })
                      )}

                      <ProtocolActionButton
                        label="+ Киста"
                        onPress={() => addKidneyListItem(side, "parenchymaCystslist")}
                      />
                    </View>
                  </ProtocolCard>
                )}

                {showPcsPathology && (
                  <Pressable
                    onPress={() =>
                      openEditor({
                        title: "Описание патологических образований ЧЛС",
                        mode: "text",
                        value: kidney.pcsPathologicalFormationsText,
                        placeholder: "Введите описание",
                        multiline: true,
                        onSave: (nextValue) =>
                          updateKidneyField(side, "pcsPathologicalFormationsText", nextValue),
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

          {renderInlineSectionHeader("Синус")}
          <Pressable
            onPress={() =>
              openEditor({
                title: `${title}: Почечный синус`,
                mode: "select",
                value: kidney.sinus,
                options: [
                  { value: "без включений", label: "Без включений" },
                  { value: "с включениями", label: "С включениями" },
                ],
                onSave: (nextValue) => updateKidneyField(side, "sinus", nextValue),
              })
            }
            style={({ pressed }) => [
              styles.obpFieldRow,
              kidney.sinus.trim().length > 0 && styles.obpFieldRowFilled,
              pressed && styles.obpFieldRowPressed,
            ]}
          >
            <View style={styles.obpFieldRowContent}>
              <Text style={styles.obpFieldLabel}>Почечный синус</Text>
              <Text style={styles.obpFieldValue}>{kidney.sinus || "Нажмите для ввода"}</Text>
            </View>
            <Text style={styles.obpFieldType}>select</Text>
          </Pressable>

          {renderInlineSectionHeader("Область надпочечников")}
          <Pressable
            onPress={() =>
              openEditor({
                title: `${title}: Область надпочечников`,
                mode: "select",
                value: kidney.adrenalArea,
                options: KIDNEY_ADRENAL_OPTIONS,
                onSave: (nextValue) => updateKidneyField(side, "adrenalArea", nextValue),
              })
            }
            style={({ pressed }) => [
              styles.obpFieldRow,
              kidney.adrenalArea.trim().length > 0 && styles.obpFieldRowFilled,
              pressed && styles.obpFieldRowPressed,
            ]}
          >
            <View style={styles.obpFieldRowContent}>
              <Text style={styles.obpFieldLabel}>Область надпочечников</Text>
              <Text style={styles.obpFieldValue}>{kidney.adrenalArea || "Нажмите для ввода"}</Text>
            </View>
            <Text style={styles.obpFieldType}>select</Text>
          </Pressable>

          {showAdrenalText && (
            <Pressable
              onPress={() =>
                openEditor({
                  title: "Область надпочечников: Описание изменений",
                  mode: "text",
                  value: kidney.adrenalAreaText,
                  placeholder: "Введите описание",
                  multiline: true,
                  onSave: (nextValue) => updateKidneyField(side, "adrenalAreaText", nextValue),
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

          {renderInlineSectionHeader("Дополнительно", "Описание и замечания")}
          <Pressable
            onPress={() =>
              openEditor({
                title: `${title}: Дополнительно`,
                mode: "text",
                value: kidney.additional,
                placeholder: "Введите дополнительное описание",
                multiline: true,
                onSave: (nextValue) => updateKidneyField(side, "additional", nextValue),
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

          {showPositionText && (
            <Pressable
              onPress={() =>
                openEditor({
                  title: `${title}: Описание положения`,
                  mode: "text",
                  value: kidney.positionText,
                  placeholder: "Введите описание",
                  multiline: true,
                  onSave: (nextValue) => updateKidneyField(side, "positionText", nextValue),
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
  };

  const renderBladder = () => {
    const bladder = ensureBladder(form);
    const showResidualFields = isNormalizedMatch(bladder.residualStatus, "определяется");
    const showContentsText = isNormalizedMatch(bladder.contents, "неоднородное");

    const bladderFields: UrinaryBladderFieldSpec[] = [
      { key: "length", label: "Длина", kind: "number", placeholder: "мм" },
      { key: "width", label: "Ширина", kind: "number", placeholder: "мм" },
      { key: "depth", label: "Передне-задний", kind: "number", placeholder: "мм" },
      { key: "volume", label: "Объём", kind: "number", placeholder: "мл" },
      { key: "wallThickness", label: "Толщина стенки", kind: "number", placeholder: "мм" },
      { key: "residualStatus", label: "Объём остаточной мочи", kind: "select", options: RESIDUAL_STATUS_OPTIONS },
      { key: "contents", label: "Характер содержимого", kind: "select", options: BLADDER_CONTENT_OPTIONS },
      { key: "additional", label: "Дополнительно", kind: "text", placeholder: "Введите дополнительное описание", multiline: true },
    ];

    return (
    <View style={styles.kidneyPlainSection}>
      <ProtocolOrganHeader title="Мочевой пузырь" />

        <View style={styles.obpFieldList}>
          {bladderFields.map((field) => {
            if (field.key === "additional") {
              return null;
            }

            const currentValue = bladder[field.key];
            const filled = Boolean(currentValue && currentValue.trim().length > 0);
            const currentDisplay = currentValue || "Нажмите для ввода";

            return (
              <Fragment key={field.key}>
                {field.key === "length" && (
                  renderInlineSectionHeader("Размеры")
                )}

                {field.key === "residualStatus" && (
                  renderInlineSectionHeader("Объем остаточной мочи")
                )}

                {field.key === "contents" && (
                  renderInlineSectionHeader("Содержимое")
                )}

                {field.key === "residualStatus" && showResidualFields && (
                  <View style={styles.obpFieldList}>
                    {(["residualLength", "residualWidth", "residualDepth", "residualVolume"] as const).map((fieldKey, index) => {
                      const labels = ["Длина", "Ширина", "Передне-задний", "Объём"];
                      const values = [bladder.residualLength, bladder.residualWidth, bladder.residualDepth, bladder.residualVolume];
                      const readOnly = fieldKey === "residualVolume";

                      return (
                        <Pressable
                          key={fieldKey}
                          onPress={() => {
                            if (readOnly) {
                              return;
                            }

                            openEditor({
                              title: `Мочевой пузырь: ${labels[index]}`,
                              mode: "number",
                              value: values[index],
                              placeholder: "мм",
                              onSave: (nextValue) => updateBladderField(fieldKey, nextValue),
                            });
                          }}
                          style={({ pressed }) => [
                            styles.obpFieldRow,
                            values[index].trim().length > 0 && styles.obpFieldRowFilled,
                            pressed && styles.obpFieldRowPressed,
                            readOnly && styles.obpFieldRowReadonly,
                          ]}
                        >
                          <View style={styles.obpFieldRowContent}>
                            <Text style={styles.obpFieldLabel}>{labels[index]}</Text>
                            <Text style={styles.obpFieldValue}>{values[index] || "Нажмите для ввода"}</Text>
                          </View>
                          <Text style={styles.obpFieldType}>{readOnly ? "auto" : "numpad"}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}

                <Pressable
                  onPress={() => {
                    openEditor({
                      title: `Мочевой пузырь: ${field.label}`,
                      mode: field.kind,
                      value: currentValue,
                      placeholder: field.placeholder,
                      multiline: field.multiline,
                      options: field.options,
                      onSave: (nextValue) => updateBladderField(field.key, nextValue),
                    });
                  }}
                  style={({ pressed }) => [
                    styles.obpFieldRow,
                    filled && styles.obpFieldRowFilled,
                    pressed && styles.obpFieldRowPressed,
                  ]}
                >
                  <View style={styles.obpFieldRowContent}>
                    <Text style={styles.obpFieldLabel}>{field.label}</Text>
                    <Text style={styles.obpFieldValue}>{currentDisplay}</Text>
                  </View>
                  <Text style={styles.obpFieldType}>
                    {field.kind === "number" ? "numpad" : field.kind === "select" ? "select" : "text"}
                  </Text>
                </Pressable>
              </Fragment>
            );
          })}

          {showContentsText && (
            <Pressable
              onPress={() =>
                openEditor({
                  title: "Мочевой пузырь: Описание содержимого",
                  mode: "text",
                  value: bladder.contentsText,
                  placeholder: "Введите описание",
                  multiline: true,
                  onSave: (nextValue) => updateBladderField("contentsText", nextValue),
                })
              }
              style={({ pressed }) => [
                styles.obpFieldRow,
                bladder.contentsText.trim().length > 0 && styles.obpFieldRowFilled,
                pressed && styles.obpFieldRowPressed,
              ]}
            >
              <View style={styles.obpFieldRowContent}>
                <Text style={styles.obpFieldLabel}>Описание содержимого</Text>
                <Text style={styles.obpFieldValue}>
                  {bladder.contentsText || "Нажмите для ввода"}
                </Text>
              </View>
              <Text style={styles.obpFieldType}>text</Text>
            </Pressable>
          )}
        </View>

        {renderInlineSectionHeader("Дополнительно")}

        <Pressable
          onPress={() =>
            openEditor({
              title: "Мочевой пузырь: Дополнительно",
              mode: "text",
              value: bladder.additional,
              placeholder: "Введите дополнительное описание",
              multiline: true,
              onSave: (nextValue) => updateBladderField("additional", nextValue),
            })
          }
          style={({ pressed }) => [
            styles.obpFieldRow,
            bladder.additional.trim().length > 0 && styles.obpFieldRowFilled,
            pressed && styles.obpFieldRowPressed,
          ]}
        >
          <View style={styles.obpFieldRowContent}>
            <Text style={styles.obpFieldLabel}>Дополнительно</Text>
            <Text style={styles.obpFieldValue}>{bladder.additional || "Нажмите для ввода"}</Text>
          </View>
          <Text style={styles.obpFieldType}>text</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.activeProtocolBlock}>
      <FieldEditorModal
        visible={Boolean(editorState)}
        title={editorState?.title ?? ""}
        mode={editorState?.mode ?? "text"}
        value={editorState?.value ?? ""}
        options={editorState?.options}
        placeholder={editorState?.placeholder}
        multiline={editorState?.multiline}
        footerContent={
          editorState?.title === "Заключение почек"
            ? ({ value, setValue, close }) => (
                <View style={styles.obpSampleList}>
                  {KIDNEY_CONCLUSION_SAMPLES.map((sample) => (
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

      {renderKidneySide("Правая почка", "rightKidney")}
      {renderKidneySide("Левая почка", "leftKidney")}
      {renderBladder()}

      <View style={styles.obpFieldList}>
        <ProtocolOrganHeader title="Заключение почек" />

        <ProtocolFieldRow
          label="Заключение почек"
          value={form.conclusion || "Нажмите для ввода"}
          typeLabel="text"
          filled={form.conclusion.trim().length > 0}
          onPress={() =>
            openEditor({
              title: "Заключение почек",
              mode: "text",
              value: form.conclusion,
              placeholder: "Введите заключение",
              multiline: true,
              onSave: (nextValue) =>
                updateStudy((current) => ({
                  ...current,
                  conclusion: nextValue,
                })),
            })
          }
        />

        <ProtocolFieldRow
          label="Рекомендации"
          value={form.recommendations || "Нажмите для ввода"}
          typeLabel="text"
          filled={form.recommendations.trim().length > 0}
          onPress={() =>
            openEditor({
              title: "Рекомендации почек",
              mode: "text",
              value: form.recommendations,
              placeholder: "Введите рекомендации",
              multiline: true,
              onSave: (nextValue) =>
                updateStudy((current) => ({
                  ...current,
                  recommendations: nextValue,
                })),
            })
          }
        />
      </View>
    </View>
  );
}

export default KidneysProtocolBlock;
