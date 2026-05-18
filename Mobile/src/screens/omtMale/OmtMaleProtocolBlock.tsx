import { useEffect, useState, type ReactNode } from "react";
import { Keyboard, Pressable, Text, View } from "react-native";

import { FieldEditorModal, type FieldEditorOption } from "../../components/FieldEditorModal";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { ProtocolOrganHeader, ProtocolSectionHeader } from "../../components/protocol/ProtocolHeaders";
import {
  createEmptyOmtMaleDraft,
  type OmtMaleDraft,
  type ProstateDraft,
} from "../../shared/omtMaleDraft";
import { type UrinaryBladderDraft } from "../../shared/omtFemaleDraft";
import { isNormalizedMatch } from "../../shared/normalizeSelectValue";
import type { AppStyles } from "../../styles/appStyles";

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

type OmtMaleProtocolBlockProps = {
  styles: AppStyles;
  value: OmtMaleDraft;
  onChange: (value: OmtMaleDraft) => void;
};

const PROSTATE_STUDY_TYPE_OPTIONS: FieldEditorOption[] = [
  { value: "трансабдоминальное", label: "трансабдоминальное" },
  { value: "трансректальное", label: "трансректальное" },
];

const PROSTATE_POSITION_OPTIONS: FieldEditorOption[] = [
  { value: "обычное", label: "обычное" },
  { value: "простатэктомия", label: "простатэктомия" },
];

const PROSTATE_CONTOUR_OPTIONS: FieldEditorOption[] = [
  { value: "четкий ровный", label: "четкий ровный" },
  { value: "четкий неровный", label: "четкий неровный" },
  { value: "нечеткий", label: "нечеткий" },
];

const PROSTATE_SYMMETRY_OPTIONS: FieldEditorOption[] = [
  { value: "сохранена", label: "сохранена" },
  { value: "ассиметрична", label: "ассиметрична" },
];

const PROSTATE_SHAPE_OPTIONS: FieldEditorOption[] = [
  { value: "овальная", label: "овальная" },
  { value: "треугольная", label: "треугольная" },
];

const PROSTATE_ECHOGENICITY_OPTIONS: FieldEditorOption[] = [
  { value: "средняя", label: "средняя" },
  { value: "повышенная", label: "повышенная" },
  { value: "пониженная", label: "пониженная" },
];

const PROSTATE_ECHOTEXTURE_OPTIONS: FieldEditorOption[] = [
  { value: "однородная", label: "однородная" },
  { value: "неоднородная", label: "неоднородная" },
  { value: "диффузно-неоднородная", label: "диффузно-неоднородная" },
];

const YES_NO_OPTIONS: FieldEditorOption[] = [
  { value: "не определяются", label: "не определяются" },
  { value: "определяются", label: "определяются" },
];
const PROSTATE_BLAADDER_PROTRUSION_OPTIONS: FieldEditorOption[] = [
  { value: "не выступает", label: "не выступает" },
  { value: "выступает", label: "выступает" },
];

const BLADDER_RESIDUAL_OPTIONS: FieldEditorOption[] = [
  { value: "не определяется", label: "не определяется" },
  { value: "определяется", label: "определяется" },
];

const BLADDER_CONTENT_OPTIONS: FieldEditorOption[] = [
  { value: "однородное", label: "однородное" },
  { value: "неоднородное", label: "неоднородное" },
];

const OMT_MALE_CONCLUSION_SAMPLES: ConclusionSample[] = [
  {
    title: "Норма",
    value: "УЗ-признаков патологии органов малого таза не выявлено.",
  },
  {
    title: "Аденома простаты",
    value: "Эхографические признаки аденомы предстательной железы.",
  },
  {
    title: "Хронический простатит",
    value: "Эхографические признаки хронического простатита.",
  },
];

function renderPairSize(first: string, second: string): string {
  const trimmedFirst = first.trim();
  const trimmedSecond = second.trim();

  if (!trimmedFirst && !trimmedSecond) {
    return "";
  }

  if (!trimmedSecond) {
    return trimmedFirst;
  }

  if (!trimmedFirst) {
    return trimmedSecond;
  }

  return `${trimmedFirst}x${trimmedSecond}`;
}

export function OmtMaleProtocolBlock({ styles, value, onChange }: OmtMaleProtocolBlockProps) {
  const [form, setForm] = useState<OmtMaleDraft>(value ?? createEmptyOmtMaleDraft());
  const [editorState, setEditorState] = useState<EditorState>(null);

  useEffect(() => {
    setForm(value ?? createEmptyOmtMaleDraft());
  }, [value]);

  const updateForm = (updater: (current: OmtMaleDraft) => OmtMaleDraft) => {
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

  const isConclusionEditor = editorState?.title === "Заключение ОМТ (М)";

  const saveEditor = (nextValue: string) => {
    editorState?.onSave(nextValue);
    closeEditor();
  };

  const prostate = form.prostate;
  const urinaryBladder = form.urinaryBladder;

  const isOrdinaryPosition = isNormalizedMatch(prostate.position, "обычное");
  const showEchotextureText = isNormalizedMatch(prostate.echotexture, "неоднородная");
  const showPathologicLesionsText = isNormalizedMatch(prostate.pathologicLesions, "определяются");
  const showProtrusionMm = isNormalizedMatch(prostate.bladderProtrusion, "выступает");
  const showResidualBlock = isNormalizedMatch(urinaryBladder.residualStatus, "определяется");
  const showContentsText = isNormalizedMatch(urinaryBladder.contents, "неоднородное");

  const renderRow = (
    label: string,
    valueText: string,
    typeLabel: "numpad" | "select" | "text" | "auto",
    filled: boolean,
    onPress?: () => void,
    readonly?: boolean,
  ) => (
    <ProtocolFieldRow
      label={label}
      value={valueText}
      typeLabel={typeLabel}
      filled={filled}
      readonly={readonly}
      onPress={onPress}
    />
  );

  const updateProstateField = <K extends keyof ProstateDraft>(field: K, nextValue: string) => {
    updateForm((current) => {
      const nextProstate: ProstateDraft = {
        ...current.prostate,
        [field]: nextValue,
      };

      if (field === "length" || field === "width" || field === "apDimension") {
        const length = parseFloat(field === "length" ? nextValue : nextProstate.length || "0");
        const width = parseFloat(field === "width" ? nextValue : nextProstate.width || "0");
        const apDimension = parseFloat(field === "apDimension" ? nextValue : nextProstate.apDimension || "0");

        if (length > 0 && width > 0 && apDimension > 0) {
          nextProstate.volume = ((length * width * apDimension * 0.523) / 1000).toFixed(2);
        } else {
          nextProstate.volume = "";
        }
      }

      if (field === "echotexture" && nextValue !== "неоднородная") {
        nextProstate.echotextureText = "";
      }

      if (field === "bladderProtrusion" && nextValue !== "выступает") {
        nextProstate.bladderProtrusionMm = "";
      }
      if (field === "pathologicLesions" && nextValue !== "определяются") {
        nextProstate.pathologicLesionsText = "";
      }

      return {
        ...current,
        prostate: nextProstate,
      };
    });
  };

  const updateBladderField = <K extends keyof UrinaryBladderDraft>(field: K, nextValue: string) => {
    updateForm((current) => {
      const nextBladder: UrinaryBladderDraft = {
        ...current.urinaryBladder,
        [field]: nextValue,
      };

      if (field === "length" || field === "width" || field === "depth") {
        const length = parseFloat(field === "length" ? nextValue : nextBladder.length || "0");
        const width = parseFloat(field === "width" ? nextValue : nextBladder.width || "0");
        const depth = parseFloat(field === "depth" ? nextValue : nextBladder.depth || "0");

        if (length > 0 && width > 0 && depth > 0) {
          nextBladder.volume = ((length * width * depth * 0.523) / 1000).toFixed(0);
        } else {
          nextBladder.volume = "";
        }
      }

      if (field === "residualLength" || field === "residualWidth" || field === "residualDepth") {
        const length = parseFloat(field === "residualLength" ? nextValue : nextBladder.residualLength || "0");
        const width = parseFloat(field === "residualWidth" ? nextValue : nextBladder.residualWidth || "0");
        const depth = parseFloat(field === "residualDepth" ? nextValue : nextBladder.residualDepth || "0");

        if (length > 0 && width > 0 && depth > 0) {
          nextBladder.residualVolume = ((length * width * depth * 0.523) / 1000).toFixed(0);
        } else {
          nextBladder.residualVolume = "";
        }
      }

      if (field === "residualStatus" && nextValue !== "определяется") {
        nextBladder.residualLength = "";
        nextBladder.residualWidth = "";
        nextBladder.residualDepth = "";
        nextBladder.residualVolume = "";
      }

      if (field === "contents" && nextValue !== "неоднородное") {
        nextBladder.contentsText = "";
      }

      return {
        ...current,
        urinaryBladder: nextBladder,
      };
    });
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
        footerContent={
          isConclusionEditor
            ? ({ value, setValue, close }) => (
                <View style={styles.obpSampleList}>
                  {OMT_MALE_CONCLUSION_SAMPLES.map((sample) => (
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
        <ProtocolOrganHeader title="Простата" />
        <View style={styles.obpFieldList}>
          <ProtocolSectionHeader title="Информация об исследовании" />
          {renderRow(
            "Вид исследования",
            prostate.studyType || "Нажмите для ввода",
            "select",
            Boolean(prostate.studyType),
            () =>
              openEditor({
                title: "Вид исследования",
                mode: "select",
                value: prostate.studyType,
                options: PROSTATE_STUDY_TYPE_OPTIONS,
                onSave: (nextValue) => updateProstateField("studyType", nextValue),
              }),
          )}

          <ProtocolSectionHeader title="Положение" />
          {renderRow(
            "Положение",
            prostate.position || "Нажмите для ввода",
            "select",
            Boolean(prostate.position),
            () =>
              openEditor({
                title: "Положение простаты",
                mode: "select",
                value: prostate.position,
                options: PROSTATE_POSITION_OPTIONS,
                onSave: (nextValue) => updateProstateField("position", nextValue),
              }),
          )}

          {isOrdinaryPosition && (
            <>
              <ProtocolSectionHeader title="Размеры" />
              {renderRow(
                "Длина (мм)",
                prostate.length || "Нажмите для ввода",
                "numpad",
                Boolean(prostate.length),
                () =>
                  openEditor({
                    title: "Простата: длина",
                    mode: "number",
                    value: prostate.length,
                    placeholder: "мм",
                    onSave: (nextValue) => updateProstateField("length", nextValue),
                  }),
              )}
              {renderRow(
                "Ширина (мм)",
                prostate.width || "Нажмите для ввода",
                "numpad",
                Boolean(prostate.width),
                () =>
                  openEditor({
                    title: "Простата: ширина",
                    mode: "number",
                    value: prostate.width,
                    placeholder: "мм",
                    onSave: (nextValue) => updateProstateField("width", nextValue),
                  }),
              )}
              {renderRow(
                "ПЗР (мм)",
                prostate.apDimension || "Нажмите для ввода",
                "numpad",
                Boolean(prostate.apDimension),
                () =>
                  openEditor({
                    title: "Простата: ПЗР",
                    mode: "number",
                    value: prostate.apDimension,
                    placeholder: "мм",
                    onSave: (nextValue) => updateProstateField("apDimension", nextValue),
                  }),
              )}
              {renderRow(
                "Объем (см³)",
                prostate.volume || "Рассчитывается автоматически",
                "auto",
                Boolean(prostate.volume),
                undefined,
                true,
              )}

              <ProtocolSectionHeader title="Контур" />
              {renderRow(
                "Контур",
                prostate.contour || "Нажмите для ввода",
                "select",
                Boolean(prostate.contour),
                () =>
                  openEditor({
                    title: "Простата: контур",
                    mode: "select",
                    value: prostate.contour,
                    options: PROSTATE_CONTOUR_OPTIONS,
                    onSave: (nextValue) => updateProstateField("contour", nextValue),
                  }),
              )}

              <ProtocolSectionHeader title="Симметричность" />
              {renderRow(
                "Симметричность",
                prostate.symmetry || "Нажмите для ввода",
                "select",
                Boolean(prostate.symmetry),
                () =>
                  openEditor({
                    title: "Простата: симметричность",
                    mode: "select",
                    value: prostate.symmetry,
                    options: PROSTATE_SYMMETRY_OPTIONS,
                    onSave: (nextValue) => updateProstateField("symmetry", nextValue),
                  }),
              )}

              <ProtocolSectionHeader title="Форма" />
              {renderRow(
                "Форма",
                prostate.shape || "Нажмите для ввода",
                "select",
                Boolean(prostate.shape),
                () =>
                  openEditor({
                    title: "Простата: форма",
                    mode: "select",
                    value: prostate.shape,
                    options: PROSTATE_SHAPE_OPTIONS,
                    onSave: (nextValue) => updateProstateField("shape", nextValue),
                  }),
              )}

              <ProtocolSectionHeader title="Эхогенность" />
              {renderRow(
                "Эхогенность",
                prostate.echogenicity || "Нажмите для ввода",
                "select",
                Boolean(prostate.echogenicity),
                () =>
                  openEditor({
                    title: "Простата: эхогенность",
                    mode: "select",
                    value: prostate.echogenicity,
                    options: PROSTATE_ECHOGENICITY_OPTIONS,
                    onSave: (nextValue) => updateProstateField("echogenicity", nextValue),
                  }),
              )}

              <ProtocolSectionHeader title="Эхоструктура" />
              {renderRow(
                "Эхоструктура",
                prostate.echotexture || "Нажмите для ввода",
                "select",
                Boolean(prostate.echotexture),
                () =>
                  openEditor({
                    title: "Простата: эхоструктура",
                    mode: "select",
                    value: prostate.echotexture,
                    options: PROSTATE_ECHOTEXTURE_OPTIONS,
                    onSave: (nextValue) => updateProstateField("echotexture", nextValue),
                  }),
              )}
              {showEchotextureText &&
                renderRow(
                  "Описание",
                  prostate.echotextureText || "Нажмите для ввода",
                  "text",
                  Boolean(prostate.echotextureText),
                  () =>
                    openEditor({
                      title: "Простата: описание эхоструктуры",
                      mode: "text",
                      value: prostate.echotextureText,
                      placeholder: "Введите описание",
                      multiline: true,
                      onSave: (nextValue) => updateProstateField("echotextureText", nextValue),
                    }),
                )}

              <ProtocolSectionHeader title="В просвет мочевого пузыря" />
              {renderRow(
                "Выпячивание",
                prostate.bladderProtrusion || "Нажмите для ввода",
                "select",
                Boolean(prostate.bladderProtrusion),
                () =>
                  openEditor({
                    title: "Простата: выпячивание в просвет мочевого пузыря",
                    mode: "select",
                    value: prostate.bladderProtrusion,
                    options: PROSTATE_BLAADDER_PROTRUSION_OPTIONS,
                    onSave: (nextValue) => updateProstateField("bladderProtrusion", nextValue),
                  }),
              )}
              {showProtrusionMm &&
                renderRow(
                  "Выпячивание на (мм)",
                  prostate.bladderProtrusionMm || "Нажмите для ввода",
                  "numpad",
                  Boolean(prostate.bladderProtrusionMm),
                  () =>
                    openEditor({
                      title: "Простата: выпячивание на (мм)",
                      mode: "number",
                      value: prostate.bladderProtrusionMm,
                      placeholder: "мм",
                      onSave: (nextValue) => updateProstateField("bladderProtrusionMm", nextValue),
                    }),
                )}

              <ProtocolSectionHeader title="Патологические образования" />
              {renderRow(
                "Определение",
                prostate.pathologicLesions || "Нажмите для ввода",
                "select",
                Boolean(prostate.pathologicLesions),
                () =>
                  openEditor({
                    title: "Простата: патологические образования",
                    mode: "select",
                    value: prostate.pathologicLesions,
                    options: YES_NO_OPTIONS,
                    onSave: (nextValue) => updateProstateField("pathologicLesions", nextValue),
                  }),
              )}
              {showPathologicLesionsText &&
                renderRow(
                  "Описание",
                  prostate.pathologicLesionsText || "Нажмите для ввода",
                  "text",
                  Boolean(prostate.pathologicLesionsText),
                  () =>
                    openEditor({
                      title: "Простата: описание патологических образований",
                      mode: "text",
                      value: prostate.pathologicLesionsText,
                      placeholder: "Введите описание",
                      multiline: true,
                      onSave: (nextValue) => updateProstateField("pathologicLesionsText", nextValue),
                    }),
                )}
            </>
          )}

          <ProtocolSectionHeader title="Дополнительно" />
          {renderRow(
            "Дополнительно",
            prostate.additional || "Нажмите для ввода",
            "text",
            Boolean(prostate.additional),
            () =>
              openEditor({
                title: "Простата: дополнительно",
                mode: "text",
                value: prostate.additional,
                placeholder: "Введите дополнительное описание",
                multiline: true,
                onSave: (nextValue) => updateProstateField("additional", nextValue),
              }),
          )}
        </View>
      </View>

      <View style={styles.kidneyPlainSection}>
        <ProtocolOrganHeader title="Мочевой пузырь" />
        <View style={styles.obpFieldList}>
          <ProtocolSectionHeader title="Размеры" />
          {renderRow(
            "Длина",
            urinaryBladder.length || "Нажмите для ввода",
            "numpad",
            Boolean(urinaryBladder.length),
            () =>
              openEditor({
                title: "Мочевой пузырь: длина",
                mode: "number",
                value: urinaryBladder.length,
                placeholder: "мм",
                onSave: (nextValue) => updateBladderField("length", nextValue),
              }),
          )}
          {renderRow(
            "Ширина",
            urinaryBladder.width || "Нажмите для ввода",
            "numpad",
            Boolean(urinaryBladder.width),
            () =>
              openEditor({
                title: "Мочевой пузырь: ширина",
                mode: "number",
                value: urinaryBladder.width,
                placeholder: "мм",
                onSave: (nextValue) => updateBladderField("width", nextValue),
              }),
          )}
          {renderRow(
            "Передне-задний",
            urinaryBladder.depth || "Нажмите для ввода",
            "numpad",
            Boolean(urinaryBladder.depth),
            () =>
              openEditor({
                title: "Мочевой пузырь: передне-задний размер",
                mode: "number",
                value: urinaryBladder.depth,
                placeholder: "мм",
                onSave: (nextValue) => updateBladderField("depth", nextValue),
              }),
          )}
          {renderRow(
            "Объем",
            urinaryBladder.volume || "Рассчитывается автоматически",
            "auto",
            Boolean(urinaryBladder.volume),
            undefined,
            true,
          )}
          {renderRow(
            "Толщина стенки",
            urinaryBladder.wallThickness || "Нажмите для ввода",
            "numpad",
            Boolean(urinaryBladder.wallThickness),
            () =>
              openEditor({
                title: "Мочевой пузырь: толщина стенки",
                mode: "number",
                value: urinaryBladder.wallThickness,
                placeholder: "мм",
                onSave: (nextValue) => updateBladderField("wallThickness", nextValue),
              }),
          )}

          <ProtocolSectionHeader title="Объем остаточной мочи" />
          {renderRow(
            "Определение",
            urinaryBladder.residualStatus || "Нажмите для ввода",
            "select",
            Boolean(urinaryBladder.residualStatus),
            () =>
              openEditor({
                title: "Объем остаточной мочи",
                mode: "select",
                value: urinaryBladder.residualStatus,
                options: BLADDER_RESIDUAL_OPTIONS,
                onSave: (nextValue) => updateBladderField("residualStatus", nextValue),
              }),
          )}

          {showResidualBlock && (
            <>
              {renderRow(
                "Длина",
                urinaryBladder.residualLength || "Нажмите для ввода",
                "numpad",
                Boolean(urinaryBladder.residualLength),
                () =>
                  openEditor({
                    title: "Остаточная моча: длина",
                    mode: "number",
                    value: urinaryBladder.residualLength,
                    placeholder: "мм",
                    onSave: (nextValue) => updateBladderField("residualLength", nextValue),
                  }),
              )}
              {renderRow(
                "Ширина",
                urinaryBladder.residualWidth || "Нажмите для ввода",
                "numpad",
                Boolean(urinaryBladder.residualWidth),
                () =>
                  openEditor({
                    title: "Остаточная моча: ширина",
                    mode: "number",
                    value: urinaryBladder.residualWidth,
                    placeholder: "мм",
                    onSave: (nextValue) => updateBladderField("residualWidth", nextValue),
                  }),
              )}
              {renderRow(
                "Передне-задний",
                urinaryBladder.residualDepth || "Нажмите для ввода",
                "numpad",
                Boolean(urinaryBladder.residualDepth),
                () =>
                  openEditor({
                    title: "Остаточная моча: передне-задний размер",
                    mode: "number",
                    value: urinaryBladder.residualDepth,
                    placeholder: "мм",
                    onSave: (nextValue) => updateBladderField("residualDepth", nextValue),
                  }),
              )}
              {renderRow(
                "Объем остаточной мочи",
                urinaryBladder.residualVolume || "Рассчитывается автоматически",
                "auto",
                Boolean(urinaryBladder.residualVolume),
                undefined,
                true,
              )}
            </>
          )}

          <ProtocolSectionHeader title="Содержимое" />
          {renderRow(
            "Характер содержимого",
            urinaryBladder.contents || "Нажмите для ввода",
            "select",
            Boolean(urinaryBladder.contents),
            () =>
              openEditor({
                title: "Характер содержимого",
                mode: "select",
                value: urinaryBladder.contents,
                options: BLADDER_CONTENT_OPTIONS,
                onSave: (nextValue) => updateBladderField("contents", nextValue),
              }),
          )}
          {showContentsText &&
            renderRow(
              "Описание содержимого",
              urinaryBladder.contentsText || "Нажмите для ввода",
              "text",
              Boolean(urinaryBladder.contentsText),
              () =>
                openEditor({
                  title: "Описание содержимого",
                  mode: "text",
                  value: urinaryBladder.contentsText,
                  placeholder: "Введите описание",
                  multiline: true,
                  onSave: (nextValue) => updateBladderField("contentsText", nextValue),
                }),
            )}

          <ProtocolSectionHeader title="Дополнительно" />
          {renderRow(
            "Дополнительно",
            urinaryBladder.additional || "Нажмите для ввода",
            "text",
            Boolean(urinaryBladder.additional),
            () =>
              openEditor({
                title: "Мочевой пузырь: дополнительно",
                mode: "text",
                value: urinaryBladder.additional,
                placeholder: "Введите дополнительное описание",
                multiline: true,
                onSave: (nextValue) => updateBladderField("additional", nextValue),
              }),
          )}
        </View>
      </View>

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
                title: "Заключение ОМТ (М)",
                mode: "text",
                value: form.conclusion,
                placeholder: "Введите заключение",
                multiline: true,
                footerContent: ({ value, setValue, close }) => (
                  <View style={styles.obpSampleList}>
                    {OMT_MALE_CONCLUSION_SAMPLES.map((sample) => (
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
                ),
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
                title: "Рекомендации ОМТ (М)",
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

export default OmtMaleProtocolBlock;
