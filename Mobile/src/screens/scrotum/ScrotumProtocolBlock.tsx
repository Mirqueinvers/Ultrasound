import { useEffect, useState, type ReactNode } from "react";
import { Keyboard, Pressable, Text, View } from "react-native";

import { FieldEditorModal, type FieldEditorOption } from "../../components/FieldEditorModal";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { ProtocolOrganHeader, ProtocolSectionHeader } from "../../components/protocol/ProtocolHeaders";
import {
  createEmptyScrotumDraft,
  createEmptySingleTestisDraft,
  type ScrotumDraft,
  type SingleTestisDraft,
} from "../../shared/scrotumDraft";
import { isNormalizedMatch } from "../../shared/normalizeSelectValue";

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

type ScrotumProtocolBlockProps = {
  styles: any;
  value: ScrotumDraft;
  onChange: (value: ScrotumDraft) => void;
};

const LOCATION_OPTIONS: FieldEditorOption[] = [
  { value: "в мошонке", label: "в мошонке" },
  { value: "не в мошонке", label: "не в мошонке" },
];

const CONTOUR_OPTIONS: FieldEditorOption[] = [
  { value: "четкий ровный", label: "четкий ровный" },
  { value: "четкий неровный", label: "четкий неровный" },
  { value: "нечеткий", label: "нечеткий" },
];

const CAPSULE_OPTIONS: FieldEditorOption[] = [
  { value: "не изменена", label: "не изменена" },
  { value: "изменена", label: "изменена" },
];

const ECHOGENICITY_OPTIONS: FieldEditorOption[] = [
  { value: "средняя", label: "средняя" },
  { value: "повышена", label: "повышена" },
  { value: "понижена", label: "понижена" },
];

const ECHOTEXTURE_OPTIONS: FieldEditorOption[] = [
  { value: "однородная", label: "однородная" },
  { value: "неоднородная", label: "неоднородная" },
  { value: "диффузно-неоднородная", label: "диффузно-неоднородная" },
];

const MEDIASTINUM_OPTIONS: FieldEditorOption[] = [
  { value: "не изменена", label: "не изменена" },
  { value: "изменена", label: "изменена" },
];

const BLOOD_FLOW_OPTIONS: FieldEditorOption[] = [
  { value: "не изменен", label: "не изменен" },
  { value: "усилен", label: "усилен" },
  { value: "ослаблен", label: "ослаблен" },
];

const APPENDAGE_OPTIONS: FieldEditorOption[] = [
  { value: "не изменен", label: "не изменен" },
  { value: "изменен", label: "изменен" },
];

const FLUID_AMOUNT_OPTIONS: FieldEditorOption[] = [
  { value: "не изменено", label: "не изменено" },
  { value: "увеличено", label: "увеличено" },
];

const CONCLUSION_SAMPLES: ConclusionSample[] = [
  {
    title: "Норма",
    value: "УЗ-признаков патологии органов мошонки не выявлено.",
  },
  {
    title: "Варикоцеле",
    value: "Эхографические признаки варикоцеле.",
  },
  {
    title: "Гидроцеле",
    value: "Эхографические признаки гидроцеле.",
  },
];

function computeVolume(length: string, width: string, depth: string): string {
  const l = parseFloat(length);
  const w = parseFloat(width);
  const d = parseFloat(depth);

  if ([l, w, d].some((part) => Number.isNaN(part) || part <= 0)) {
    return "";
  }

  return ((l * w * d * 0.523) / 1000).toFixed(2);
}

export function ScrotumProtocolBlock({ styles, value, onChange }: ScrotumProtocolBlockProps) {
  const [form, setForm] = useState<ScrotumDraft>(value ?? createEmptyScrotumDraft());
  const [editorState, setEditorState] = useState<EditorState>(null);

  useEffect(() => {
    setForm(value ?? createEmptyScrotumDraft());
  }, [value]);

  const updateForm = (updater: (current: ScrotumDraft) => ScrotumDraft) => {
    setForm((current) => {
      const next = updater(current);
      onChange(next);
      return next;
    });
  };

  const openEditor = (config: NonNullable<EditorState>) => {
    Keyboard.dismiss();
    setTimeout(() => setEditorState(config), 0);
  };

  const closeEditor = () => setEditorState(null);

  const saveEditor = (nextValue: string) => {
    editorState?.onSave(nextValue);
    closeEditor();
  };

  const isConclusionEditor = editorState?.title === "Заключение органов мошонки";

  const updateTestisField = (
    side: "right" | "left",
    field: keyof SingleTestisDraft,
    nextValue: string,
  ) => {
    updateForm((current) => {
      const currentPair = current.testis;
      const target = side === "right" ? currentPair.rightTestis : currentPair.leftTestis;
      const base = target ?? createEmptySingleTestisDraft();
      const nextTestis: SingleTestisDraft = {
        ...base,
        [field]: nextValue,
      };

      if (field === "length" || field === "width" || field === "depth") {
        nextTestis.volume = computeVolume(
          field === "length" ? nextValue : nextTestis.length,
          field === "width" ? nextValue : nextTestis.width,
          field === "depth" ? nextValue : nextTestis.depth,
        );
      }

      if (field === "capsule" && nextValue !== "изменена") {
        nextTestis.capsuleText = "";
      }

      if (field === "echotexture" && nextValue !== "неоднородная") {
        nextTestis.echotextureText = "";
      }

      if (field === "mediastinum" && nextValue !== "изменена") {
        nextTestis.mediastinumText = "";
      }

      if (field === "appendage" && nextValue !== "изменен") {
        nextTestis.appendageText = "";
      }

      if (field === "fluidAmount" && nextValue !== "увеличено") {
        nextTestis.fluidAmountText = "";
      }

      return {
        ...current,
        testis: {
          ...currentPair,
          [side === "right" ? "rightTestis" : "leftTestis"]: nextTestis,
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

  const renderTestis = (side: "right" | "left") => {
    const pair = form.testis;
    const testis = side === "right" ? pair.rightTestis : pair.leftTestis;
    const title = side === "right" ? "Правое яичко" : "Левое яичко";
    const sideKey = side;

    const showCapsuleText = isNormalizedMatch(testis.capsule, "изменена");
    const showEchotextureText = isNormalizedMatch(testis.echotexture, "неоднородная");
    const showMediastinumText = isNormalizedMatch(testis.mediastinum, "изменена");
    const showAppendageText = isNormalizedMatch(testis.appendage, "изменен");
    const showFluidAmountText = isNormalizedMatch(testis.fluidAmount, "увеличено");

    return (
      <View key={sideKey} style={styles.kidneyPlainSection}>
        <ProtocolOrganHeader title={title} />
        <View style={styles.obpFieldList}>
          <ProtocolSectionHeader title="Размеры" />
          {renderRow(
            "Длина (мм)",
            testis.length || "Нажмите для ввода",
            "numpad",
            Boolean(testis.length),
            () =>
              openEditor({
                title: `${title}: длина`,
                mode: "number",
                value: testis.length,
                placeholder: "мм",
                onSave: (nextValue) => updateTestisField(side, "length", nextValue),
              }),
          )}
          {renderRow(
            "Ширина (мм)",
            testis.width || "Нажмите для ввода",
            "numpad",
            Boolean(testis.width),
            () =>
              openEditor({
                title: `${title}: ширина`,
                mode: "number",
                value: testis.width,
                placeholder: "мм",
                onSave: (nextValue) => updateTestisField(side, "width", nextValue),
              }),
          )}
          {renderRow(
            "Глубина (мм)",
            testis.depth || "Нажмите для ввода",
            "numpad",
            Boolean(testis.depth),
            () =>
              openEditor({
                title: `${title}: глубина`,
                mode: "number",
                value: testis.depth,
                placeholder: "мм",
                onSave: (nextValue) => updateTestisField(side, "depth", nextValue),
              }),
          )}
          {renderRow(
            "Объем (см³)",
            testis.volume || "Рассчитывается автоматически",
            "auto",
            Boolean(testis.volume),
            undefined,
            true,
          )}

          <ProtocolSectionHeader title="Расположение" />
          {renderRow(
            "Расположение",
            testis.location || "Нажмите для ввода",
            "select",
            Boolean(testis.location),
            () =>
              openEditor({
                title: `${title}: расположение`,
                mode: "select",
                value: testis.location,
                options: LOCATION_OPTIONS,
                onSave: (nextValue) => updateTestisField(side, "location", nextValue),
              }),
          )}

          <ProtocolSectionHeader title="Контур" />
          {renderRow(
            "Контур",
            testis.contour || "Нажмите для ввода",
            "select",
            Boolean(testis.contour),
            () =>
              openEditor({
                title: `${title}: контур`,
                mode: "select",
                value: testis.contour,
                options: CONTOUR_OPTIONS,
                onSave: (nextValue) => updateTestisField(side, "contour", nextValue),
              }),
          )}

          <ProtocolSectionHeader title="Капсула" />
          {renderRow(
            "Капсула",
            testis.capsule || "Нажмите для ввода",
            "select",
            Boolean(testis.capsule),
            () =>
              openEditor({
                title: `${title}: капсула`,
                mode: "select",
                value: testis.capsule,
                options: CAPSULE_OPTIONS,
                onSave: (nextValue) => updateTestisField(side, "capsule", nextValue),
              }),
          )}
          {showCapsuleText &&
            renderRow(
              "Описание",
              testis.capsuleText || "Нажмите для ввода",
              "text",
              Boolean(testis.capsuleText),
              () =>
                openEditor({
                  title: `${title}: описание капсулы`,
                  mode: "text",
                  value: testis.capsuleText,
                  placeholder: "Введите описание",
                  multiline: true,
                  onSave: (nextValue) => updateTestisField(side, "capsuleText", nextValue),
                }),
            )}

          <ProtocolSectionHeader title="Эхогенность" />
          {renderRow(
            "Эхогенность",
            testis.echogenicity || "Нажмите для ввода",
            "select",
            Boolean(testis.echogenicity),
            () =>
              openEditor({
                title: `${title}: эхогенность`,
                mode: "select",
                value: testis.echogenicity,
                options: ECHOGENICITY_OPTIONS,
                onSave: (nextValue) => updateTestisField(side, "echogenicity", nextValue),
              }),
          )}

          <ProtocolSectionHeader title="Эхоструктура" />
          {renderRow(
            "Эхоструктура",
            testis.echotexture || "Нажмите для ввода",
            "select",
            Boolean(testis.echotexture),
            () =>
              openEditor({
                title: `${title}: эхоструктура`,
                mode: "select",
                value: testis.echotexture,
                options: ECHOTEXTURE_OPTIONS,
                onSave: (nextValue) => updateTestisField(side, "echotexture", nextValue),
              }),
          )}
          {showEchotextureText &&
            renderRow(
              "Описание",
              testis.echotextureText || "Нажмите для ввода",
              "text",
              Boolean(testis.echotextureText),
              () =>
                openEditor({
                  title: `${title}: описание эхоструктуры`,
                  mode: "text",
                  value: testis.echotextureText,
                  placeholder: "Введите описание",
                  multiline: true,
                  onSave: (nextValue) => updateTestisField(side, "echotextureText", nextValue),
                }),
            )}

          <ProtocolSectionHeader title="Структура средостения" />
          {renderRow(
            "Структура средостения",
            testis.mediastinum || "Нажмите для ввода",
            "select",
            Boolean(testis.mediastinum),
            () =>
              openEditor({
                title: `${title}: структура средостения`,
                mode: "select",
                value: testis.mediastinum,
                options: MEDIASTINUM_OPTIONS,
                onSave: (nextValue) => updateTestisField(side, "mediastinum", nextValue),
              }),
          )}
          {showMediastinumText &&
            renderRow(
              "Описание",
              testis.mediastinumText || "Нажмите для ввода",
              "text",
              Boolean(testis.mediastinumText),
              () =>
                openEditor({
                  title: `${title}: описание средостения`,
                  mode: "text",
                  value: testis.mediastinumText,
                  placeholder: "Введите описание",
                  multiline: true,
                  onSave: (nextValue) => updateTestisField(side, "mediastinumText", nextValue),
                }),
            )}

          <ProtocolSectionHeader title="Кровоток в яичке" />
          {renderRow(
            "Кровоток",
            testis.bloodFlow || "Нажмите для ввода",
            "select",
            Boolean(testis.bloodFlow),
            () =>
              openEditor({
                title: `${title}: кровоток`,
                mode: "select",
                value: testis.bloodFlow,
                options: BLOOD_FLOW_OPTIONS,
                onSave: (nextValue) => updateTestisField(side, "bloodFlow", nextValue),
              }),
          )}

          <ProtocolSectionHeader title="Придаток яичка" />
          {renderRow(
            "Придаток",
            testis.appendage || "Нажмите для ввода",
            "select",
            Boolean(testis.appendage),
            () =>
              openEditor({
                title: `${title}: придаток`,
                mode: "select",
                value: testis.appendage,
                options: APPENDAGE_OPTIONS,
                onSave: (nextValue) => updateTestisField(side, "appendage", nextValue),
              }),
          )}
          {showAppendageText &&
            renderRow(
              "Описание",
              testis.appendageText || "Нажмите для ввода",
              "text",
              Boolean(testis.appendageText),
              () =>
                openEditor({
                  title: `${title}: описание придатка`,
                  mode: "text",
                  value: testis.appendageText,
                  placeholder: "Введите описание",
                  multiline: true,
                  onSave: (nextValue) => updateTestisField(side, "appendageText", nextValue),
                }),
            )}

          <ProtocolSectionHeader title="Количество жидкости в оболочках" />
          {renderRow(
            "Количество жидкости",
            testis.fluidAmount || "Нажмите для ввода",
            "select",
            Boolean(testis.fluidAmount),
            () =>
              openEditor({
                title: `${title}: количество жидкости`,
                mode: "select",
                value: testis.fluidAmount,
                options: FLUID_AMOUNT_OPTIONS,
                onSave: (nextValue) => updateTestisField(side, "fluidAmount", nextValue),
              }),
          )}
          {showFluidAmountText &&
            renderRow(
              "Описание",
              testis.fluidAmountText || "Нажмите для ввода",
              "text",
              Boolean(testis.fluidAmountText),
              () =>
                openEditor({
                  title: `${title}: описание жидкости`,
                  mode: "text",
                  value: testis.fluidAmountText,
                  placeholder: "Введите описание",
                  multiline: true,
                  onSave: (nextValue) => updateTestisField(side, "fluidAmountText", nextValue),
                }),
            )}

          <ProtocolSectionHeader title="Дополнительно" />
          {renderRow(
            "Дополнительно",
            testis.additional || "Нажмите для ввода",
            "text",
            Boolean(testis.additional),
            () =>
              openEditor({
                title: `${title}: дополнительно`,
                mode: "text",
                value: testis.additional,
                placeholder: "Введите дополнительное описание",
                multiline: true,
                onSave: (nextValue) => updateTestisField(side, "additional", nextValue),
              }),
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
        footerContent={
          isConclusionEditor
            ? ({ value, setValue, close }) => (
                <View style={styles.obpSampleList}>
                  {CONCLUSION_SAMPLES.map((sample) => (
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

      {renderTestis("right")}
      {renderTestis("left")}

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
                title: "Заключение органов мошонки",
                mode: "text",
                value: form.conclusion,
                placeholder: "Введите заключение",
                multiline: true,
                footerContent: ({ value, setValue, close }) => (
                  <View style={styles.obpSampleList}>
                    {CONCLUSION_SAMPLES.map((sample) => (
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
                title: "Рекомендации органов мошонки",
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

export default ScrotumProtocolBlock;
