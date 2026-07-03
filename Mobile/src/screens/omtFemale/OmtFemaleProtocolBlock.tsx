import { Fragment, useEffect, useState } from "react";
import { Keyboard, Pressable, Text, View } from "react-native";

import { FieldEditorModal, type FieldEditorOption } from "../../components/FieldEditorModal";
import { ProtocolActionButton } from "../../components/protocol/ProtocolActionButton";
import { ProtocolCard } from "../../components/protocol/ProtocolCard";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import {
  ProtocolOrganHeader,
  ProtocolSectionHeader,
} from "../../components/protocol/ProtocolHeaders";
import {
  createEmptyOvaryCystDraft,
  createEmptyOvaryDraft,
  createEmptyUterusDraft,
  createEmptyUterusNodeDraft,
  createEmptyUrinaryBladderDraft,
  type OmtFemaleDraft,
  type OvaryCystDraft,
  type OvaryDraft,
  type UterusDraft,
  type UterusNodeDraft,
  type UrinaryBladderDraft,
} from "../../shared/omtFemaleDraft";
import { isNormalizedMatch } from "../../shared/normalizeSelectValue";
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

type ConclusionSample = {
  title: string;
  value: string;
};

type OmtFemaleProtocolBlockProps = {
  styles: AppStyles;
  fieldVisibility: FieldVisibility;
  value: OmtFemaleDraft;
  onChange: (value: OmtFemaleDraft) => void;
  activeSectionId?: string | null;
};

const UTERUS_STATUS_OPTIONS: FieldEditorOption[] = [
  { value: "обычное", label: "Обычное" },
  { value: "субтотальная гистерэктомия", label: "Субтотальная гистерэктомия" },
  { value: "тотальная гистерэктомия", label: "Тотальная гистерэктомия" },
  { value: "гистеросальпингоовариэктомия", label: "Гистеросальпингоовариэктомия" },
  { value: "радикальная гистерэктомия", label: "Радикальная гистерэктомия" },
];

const UTERUS_STUDY_TYPE_OPTIONS: FieldEditorOption[] = [
  { value: "трансабдоминальное", label: "Трансабдоминальное" },
  { value: "трансвагинальное", label: "Трансвагинальное" },
];

const MENOPAUSE_OPTIONS: FieldEditorOption[] = [
  { value: "пременопауза", label: "Пременопауза" },
  { value: "менопауза", label: "Менопауза" },
  { value: "постменопауза", label: "Постменопауза" },
];

const UTERUS_SHAPE_OPTIONS: FieldEditorOption[] = [
  { value: "грушевидная", label: "Грушевидная" },
  { value: "округлая", label: "Округлая" },
];

const UTERUS_POSITION_OPTIONS: FieldEditorOption[] = [
  { value: "антефлексио", label: "Антефлексио" },
  { value: "ретрофлексио", label: "Ретрофлексио" },
  { value: "антеверзия", label: "Антеверзия" },
  { value: "ретроверзия", label: "Ретроверзия" },
];

const UTERUS_STRUCTURE_OPTIONS: FieldEditorOption[] = [
  { value: "однородная", label: "Однородная" },
  { value: "неоднородная", label: "Неоднородная" },
];

const UTERUS_ECHOGENICITY_OPTIONS: FieldEditorOption[] = [
  { value: "средняя", label: "Средняя" },
  { value: "повышенная", label: "Повышенная" },
  { value: "пониженная", label: "Пониженная" },
];

const YES_NO_OPTIONS: FieldEditorOption[] = [
  { value: "не определяются", label: "Не определяются" },
  { value: "определяются", label: "Определяются" },
];

const UTERINE_CAVITY_OPTIONS: FieldEditorOption[] = [
  { value: "не расширена", label: "Не расширена" },
  { value: "расширена", label: "Расширена" },
];

const ENDOMETRIUM_STRUCTURE_OPTIONS: FieldEditorOption[] = [
  { value: "однородная", label: "Однородная" },
  { value: "неоднородная", label: "Неоднородная" },
  { value: "диффузно-неоднородная", label: "Диффузно-неоднородная" },
];

const CERVIX_ECHOSTRUCTURE_OPTIONS: FieldEditorOption[] = [
  { value: "однородная", label: "Однородная" },
  { value: "неоднородная", label: "Неоднородная" },
];

const CERVICAL_CANAL_OPTIONS: FieldEditorOption[] = [
  { value: "сомкнут", label: "Сомкнут" },
  { value: "расширен", label: "Расширен" },
];

const FREE_FLUID_OPTIONS: FieldEditorOption[] = [
  { value: "не определяется", label: "Не определяется" },
  { value: "определяется", label: "Определяется" },
];

const OVARY_POSITION_OPTIONS: FieldEditorOption[] = [
  { value: "обычное", label: "Обычное" },
  { value: "не визуализируется", label: "Не визуализируется" },
];

const OVARY_SHAPE_OPTIONS: FieldEditorOption[] = [
  { value: "овальная", label: "Овальная" },
  { value: "округлая", label: "Округлая" },
  { value: "неправильная", label: "Неправильная" },
];

const OVARY_CONTOUR_OPTIONS: FieldEditorOption[] = [
  { value: "чёткий, ровный", label: "Чёткий, ровный" },
  { value: "чёткий, не ровный", label: "Чёткий, не ровный" },
  { value: "нечёткий", label: "Нечёткий" },
];

const OVARY_CYST_OPTIONS: FieldEditorOption[] = YES_NO_OPTIONS;
const OVARY_FORMATION_OPTIONS: FieldEditorOption[] = YES_NO_OPTIONS;

const OMT_FEMALE_SECTION_IDS = {
  uterus: "omt_female.uterus",
  rightOvary: "omt_female.right_ovary",
  leftOvary: "omt_female.left_ovary",
  bladder: "omt_female.bladder",
  conclusion: "omt_female.conclusion",
} as const;

function resolveActiveOmtFemaleSection(activeSectionId: string | null | undefined) {
  if (!activeSectionId) {
    return null;
  }

  switch (activeSectionId) {
    case OMT_FEMALE_SECTION_IDS.uterus:
      return OMT_FEMALE_SECTION_IDS.uterus;
    case OMT_FEMALE_SECTION_IDS.rightOvary:
      return OMT_FEMALE_SECTION_IDS.rightOvary;
    case OMT_FEMALE_SECTION_IDS.leftOvary:
      return OMT_FEMALE_SECTION_IDS.leftOvary;
    case OMT_FEMALE_SECTION_IDS.bladder:
      return OMT_FEMALE_SECTION_IDS.bladder;
    case OMT_FEMALE_SECTION_IDS.conclusion:
      return OMT_FEMALE_SECTION_IDS.conclusion;
    default:
      return OMT_FEMALE_SECTION_IDS.uterus;
  }
}

const BLADDER_RESIDUAL_OPTIONS: FieldEditorOption[] = [
  { value: "не определяется", label: "Не определяется" },
  { value: "определяется", label: "Определяется" },
];

const BLADDER_CONTENT_OPTIONS: FieldEditorOption[] = [
  { value: "однородное", label: "Однородное" },
  { value: "неоднородное", label: "Неоднородное" },
];

const OMT_FEMALE_CONCLUSION_SAMPLES: ConclusionSample[] = [
  {
    title: "Норма",
    value: "УЗ-признаков патологии органов малого таза не выявлено.",
  },
  {
    title: "Миома матки",
    value: "Эхографические признаки миомы матки.",
  },
  {
    title: "Киста правого яичника",
    value: "Эхографические признаки кисты правого яичника.",
  },
  {
    title: "Киста левого яичника",
    value: "Эхографические признаки кисты левого яичника.",
  },
  {
    title: "Эндометриоз",
    value: "Эхографические признаки эндометриоз.",
  },
];

function splitPairSize(value: string): [string, string] {
  const [first = "", second = ""] = value.split("x");
  return [first, second];
}

function joinPairSize(first: string, second: string): string {
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

function formatDateDisplay(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return `${isoMatch[3]}.${isoMatch[2]}.${isoMatch[1]}`;
  }

  const dottedMatch = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dottedMatch) {
    return trimmed;
  }

  const digits = trimmed.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
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
  if (!trimmed) return "";

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return `${isoMatch[3]}${isoMatch[2]}${isoMatch[1]}`;
  }

  return trimmed.replace(/\D/g, "").slice(0, 8);
}

function computeCycleDay(status: string, dateValue: string): string {
  if (status !== "обычное" || !dateValue.trim()) {
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

function ensurePeriod(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  return /[.!?]$/u.test(trimmed) ? trimmed : `${trimmed}.`;
}

export function OmtFemaleProtocolBlock({
  styles,
  fieldVisibility,
  value,
  onChange,
  activeSectionId,
}: OmtFemaleProtocolBlockProps) {
  const [form, setForm] = useState<OmtFemaleDraft>(value);
  const [editorState, setEditorState] = useState<EditorState>(null);

  useEffect(() => {
    setForm(value);
  }, [value]);

  const updateForm = (updater: (current: OmtFemaleDraft) => OmtFemaleDraft) => {
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

  const isOmtFemaleConclusionEditor = editorState?.title === "Заключение ОМТ (Ж)";

  const saveEditor = (nextValue: string) => {
    editorState?.onSave(nextValue);
    closeEditor();
  };

  const uterus = form.uterus;
  const rightOvary = form.rightOvary;
  const leftOvary = form.leftOvary;
  const urinaryBladder = form.urinaryBladder;

  const showMyomaNodes = isNormalizedMatch(uterus.myomaNodesPresence, "определяются");
  const showUterineCavityText = isNormalizedMatch(uterus.uterineCavity, "расширена");
  const showCervixEchostructureText = isNormalizedMatch(uterus.cervixEchostructure, "неоднородная");
  const showCervicalCanalText = isNormalizedMatch(uterus.cervicalCanal, "расширен");
  const showFreeFluidText = isNormalizedMatch(uterus.freeFluid, "определяется");
  const showContentsText = isNormalizedMatch(urinaryBladder.contents, "неоднородное");
  const fv = fieldVisibility as Record<string, boolean>;

  const resolvedActiveSectionId = resolveActiveOmtFemaleSection(activeSectionId);
  const showAllSections = resolvedActiveSectionId === null;
  const showUterusSection =
    showAllSections || resolvedActiveSectionId === OMT_FEMALE_SECTION_IDS.uterus;
  const showBladderSection =
    showAllSections || resolvedActiveSectionId === OMT_FEMALE_SECTION_IDS.bladder;
  const showConclusionSection =
    showAllSections || resolvedActiveSectionId === OMT_FEMALE_SECTION_IDS.conclusion;
  const activeOvarySides = showAllSections
    ? (["right", "left"] as const)
    : resolvedActiveSectionId === OMT_FEMALE_SECTION_IDS.leftOvary
      ? (["left"] as const)
      : (["right"] as const);

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

  const updateUterusField = <K extends keyof UterusDraft>(field: K, nextValue: string) => {
    updateForm((current) => {
      const nextUterus: UterusDraft = {
        ...current.uterus,
        [field]: nextValue,
      };

      if (field === "lastMenstruationDate" || field === "uterusStatus") {
        nextUterus.cycleDay = computeCycleDay(
          field === "uterusStatus" ? nextValue : nextUterus.uterusStatus,
          field === "lastMenstruationDate" ? nextValue : nextUterus.lastMenstruationDate,
        );
      }

      if (field === "myomaNodesPresence" && nextValue === "не определяются") {
        nextUterus.myomaNodesList = [];
      }

      if (field === "uterineCavity" && nextValue === "не расширена") {
        nextUterus.uterineCavityText = "";
      }

      if (field === "cervixEchostructure" && nextValue !== "неоднородная") {
        nextUterus.cervixEchostructureText = "";
      }

      if (field === "cervicalCanal" && nextValue !== "расширен") {
        nextUterus.cervicalCanalText = "";
      }

      if (field === "freeFluid" && nextValue !== "определяется") {
        nextUterus.freeFluidText = "";
      }

      return {
        ...current,
        uterus: nextUterus,
      };
    });
  };

  const updateOvaryField = (
    side: "left" | "right",
    field: keyof OvaryDraft,
    nextValue: string,
  ) => {
    updateForm((current) => {
      const target = side === "left" ? current.leftOvary : current.rightOvary;
      const nextOvary: OvaryDraft = {
        ...target,
        [field]: nextValue,
      };

      if (field === "cysts" && nextValue === "не определяются") {
        nextOvary.cystsList = [];
      }

      if (field === "formations" && nextValue !== "определяются") {
        nextOvary.formationsText = "";
      }

      const next = {
        ...current,
        [side === "left" ? "leftOvary" : "rightOvary"]: nextOvary,
      } as OmtFemaleDraft;

      return next;
    });
  };

  const updateBladderField = <K extends keyof UrinaryBladderDraft>(field: K, nextValue: string) => {
    updateForm((current) => {
      const nextBladder: UrinaryBladderDraft = {
        ...current.urinaryBladder,
        [field]: nextValue,
      };

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

  const addMyomaNode = () => {
    updateForm((current) => ({
      ...current,
      uterus: {
        ...current.uterus,
        myomaNodesList: [
          ...current.uterus.myomaNodesList,
          {
            ...createEmptyUterusNodeDraft(),
            number: current.uterus.myomaNodesList.length + 1,
          },
        ],
      },
    }));
  };

  const updateMyomaNode = (
    index: number,
    field: keyof UterusNodeDraft,
    nextValue: string,
  ) => {
    updateForm((current) => {
      const nextNodes = current.uterus.myomaNodesList.map((node, nodeIndex) =>
        nodeIndex === index ? { ...node, [field]: nextValue } : node,
      );

      return {
        ...current,
        uterus: {
          ...current.uterus,
          myomaNodesList: nextNodes,
        },
      };
    });
  };

  const removeMyomaNode = (index: number) => {
    updateForm((current) => ({
      ...current,
      uterus: {
        ...current.uterus,
        myomaNodesList: current.uterus.myomaNodesList
          .filter((_, nodeIndex) => nodeIndex !== index)
          .map((node, nodeIndex) => ({ ...node, number: nodeIndex + 1 })),
      },
    }));
  };

  const addOvaryCyst = (side: "left" | "right") => {
    updateForm((current) => {
      const target = side === "left" ? current.leftOvary : current.rightOvary;
      const next = {
        ...target,
        cystsList: [...target.cystsList, createEmptyOvaryCystDraft()],
      };

      return {
        ...current,
        [side === "left" ? "leftOvary" : "rightOvary"]: next,
      } as OmtFemaleDraft;
    });
  };

  const updateOvaryCyst = (
    side: "left" | "right",
    index: number,
    nextValue: string,
  ) => {
    updateForm((current) => {
      const target = side === "left" ? current.leftOvary : current.rightOvary;
      const nextCysts = target.cystsList.map((cyst, cystIndex) =>
        cystIndex === index ? { ...cyst, size: nextValue } : cyst,
      );

      return {
        ...current,
        [side === "left" ? "leftOvary" : "rightOvary"]: {
          ...target,
          cystsList: nextCysts,
        },
      } as OmtFemaleDraft;
    });
  };

  const removeOvaryCyst = (side: "left" | "right", index: number) => {
    updateForm((current) => {
      const target = side === "left" ? current.leftOvary : current.rightOvary;
      return {
        ...current,
        [side === "left" ? "leftOvary" : "rightOvary"]: {
          ...target,
          cystsList: target.cystsList.filter((_, cystIndex) => cystIndex !== index),
        },
      } as OmtFemaleDraft;
    });
  };

  const splitOvaryCystSize = (size: string): [string, string] => {
    const [size1 = "", size2 = ""] = size.split("x");
    return [size1, size2];
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
          isOmtFemaleConclusionEditor
            ? ({ value, setValue, close }) => (
                <View style={styles.obpSampleList}>
                  {OMT_FEMALE_CONCLUSION_SAMPLES.map((sample) => (
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

      {showUterusSection && (
        <View style={styles.kidneyPlainSection}>
        <ProtocolOrganHeader title="Матка" />
        <View style={styles.obpFieldList}>
          <ProtocolSectionHeader title="Положение" />
          {renderRow(
          "Положение",
          uterus.uterusStatus || "Нажмите для ввода",
          "select",
          Boolean(uterus.uterusStatus),
          undefined,
          undefined,
          UTERUS_STATUS_OPTIONS,
          (nextValue) => updateUterusField("uterusStatus", nextValue),
        )}

          <ProtocolSectionHeader title="Информация об исследовании" />
          {renderRow(
          "Вид исследования",
          uterus.studyType || "Нажмите для ввода",
          "select",
          Boolean(uterus.studyType),
          undefined,
          undefined,
          UTERUS_STUDY_TYPE_OPTIONS,
          (nextValue) => updateUterusField("studyType", nextValue),
        )}
          {renderRow(
            "Дата последней менструации",
            formatDateDisplay(uterus.lastMenstruationDate) || "Нажмите для ввода",
            "numpad",
            Boolean(uterus.lastMenstruationDate),
            () =>
              openEditor({
                title: "Дата последней менструации",
                mode: "number",
                value: getDateEditorValue(uterus.lastMenstruationDate),
                placeholder: "dd.mm.yyyy",
                onSave: (nextValue) => updateUterusField("lastMenstruationDate", parseDateInput(nextValue)),
              }),
          )}
          {renderRow(
            "День цикла",
            uterus.cycleDay || "Расчитывается автоматически",
            "auto",
            Boolean(uterus.cycleDay),
            undefined,
            true,
          )}
          {renderRow(
          "Менопауза",
          uterus.menopause || "Нажмите для ввода",
          "select",
          Boolean(uterus.menopause),
          undefined,
          undefined,
          MENOPAUSE_OPTIONS,
          (nextValue) => updateUterusField("menopause", nextValue),
        )}

          {isNormalizedMatch(uterus.uterusStatus, "обычное") && (
            <>
              <ProtocolSectionHeader title="Размеры" />
              {renderRow(
                "Длина",
                uterus.length || "Нажмите для ввода",
                "numpad",
                Boolean(uterus.length),
                () =>
                  openEditor({
                    title: "Длина матки",
                    mode: "number",
                    value: uterus.length,
                    placeholder: "мм",
                    onSave: (nextValue) => updateUterusField("length", nextValue),
                  }),
              )}
              {renderRow(
                "Ширина",
                uterus.width || "Нажмите для ввода",
                "numpad",
                Boolean(uterus.width),
                () =>
                  openEditor({
                    title: "Ширина матки",
                    mode: "number",
                    value: uterus.width,
                    placeholder: "мм",
                    onSave: (nextValue) => updateUterusField("width", nextValue),
                  }),
              )}
              {renderRow(
                "ПЗР",
                uterus.apDimension || "Нажмите для ввода",
                "numpad",
                Boolean(uterus.apDimension),
                () =>
                  openEditor({
                    title: "ПЗР матки",
                    mode: "number",
                    value: uterus.apDimension,
                    placeholder: "мм",
                    onSave: (nextValue) => updateUterusField("apDimension", nextValue),
                  }),
              )}
              {renderRow(
                "Объем",
                uterus.volume || "Расчитывается автоматически",
                "auto",
                Boolean(uterus.volume),
                undefined,
                true,
              )}

              <ProtocolSectionHeader title="Форма матки" />
              {renderRow(
          "Форма",
          uterus.shape || "Нажмите для ввода",
          "select",
          Boolean(uterus.shape),
          undefined,
          undefined,
          UTERUS_SHAPE_OPTIONS,
          (nextValue) => updateUterusField("shape", nextValue),
        )}
              <ProtocolSectionHeader title="Положение матки" />
              {renderRow(
          "Положение",
          uterus.position || "Нажмите для ввода",
          "select",
          Boolean(uterus.position),
          undefined,
          undefined,
          UTERUS_POSITION_OPTIONS,
          (nextValue) => updateUterusField("position", nextValue),
        )}

              <ProtocolSectionHeader title="Строение миометрия" />
              {renderRow(
          "Структура",
          uterus.myometriumStructure || "Нажмите для ввода",
          "select",
          Boolean(uterus.myometriumStructure),
          undefined,
          undefined,
          UTERUS_STRUCTURE_OPTIONS,
          (nextValue) => updateUterusField("myometriumStructure", nextValue),
        )}
              {uterus.myometriumStructure === "неоднородная" && renderRow(
                "Описание",
                uterus.myometriumStructureText || "Нажмите для ввода",
                "text",
                Boolean(uterus.myometriumStructureText),
                () =>
                  openEditor({
                    title: "Описание структуры миометрия",
                    mode: "text",
                    value: uterus.myometriumStructureText,
                    placeholder: "Опишите характер неоднородности",
                    multiline: true,
                    onSave: (nextValue) => updateUterusField("myometriumStructureText", nextValue),
                  }),
              )}
              {renderRow(
          "Эхогенность",
          uterus.myometriumEchogenicity || "Нажмите для ввода",
          "select",
          Boolean(uterus.myometriumEchogenicity),
          undefined,
          undefined,
          UTERUS_ECHOGENICITY_OPTIONS,
          (nextValue) => updateUterusField("myometriumEchogenicity", nextValue),
        )}
              {renderRow(
          "Полость матки",
          uterus.uterineCavity || "Нажмите для ввода",
          "select",
          Boolean(uterus.uterineCavity),
          undefined,
          undefined,
          UTERINE_CAVITY_OPTIONS,
          (nextValue) => updateUterusField("uterineCavity", nextValue),
        )}
              {showUterineCavityText && renderRow(
                "Описание расширения",
                uterus.uterineCavityText || "Нажмите для ввода",
                "text",
                Boolean(uterus.uterineCavityText),
                () =>
                  openEditor({
                    title: "Описание расширения полости матки",
                    mode: "text",
                    value: uterus.uterineCavityText,
                    placeholder: "Введите описание",
                    multiline: true,
                    onSave: (nextValue) => updateUterusField("uterineCavityText", nextValue),
                  }),
              )}

              <ProtocolSectionHeader title="Объемные образования" />
              {renderRow(
          "Определяются",
          uterus.myomaNodesPresence || "Нажмите для ввода",
          "select",
          Boolean(uterus.myomaNodesPresence),
          undefined,
          undefined,
          YES_NO_OPTIONS,
          (nextValue) => updateUterusField("myomaNodesPresence", nextValue),
        )}

              {showMyomaNodes && (
                <View style={styles.obpFieldList}>
                  <ProtocolCard title="Миоматозные узлы" countText={`${uterus.myomaNodesList.length} items`}>
                    <View style={styles.obpFieldList}>
                      {uterus.myomaNodesList.length === 0 ? (
                        <Text style={styles.helperText}>Добавьте хотя бы один узел.</Text>
                      ) : (
                        uterus.myomaNodesList.map((node, index) => (
                          <ProtocolCard
                            key={`myoma-node-${index}`}
                            title={`Узел #${index + 1}`}
                            actionLabel="Удалить"
                            actionVariant="danger"
                            onActionPress={() => removeMyomaNode(index)}
                            variant="item"
                          >
                            <View style={styles.obpFieldList}>
                              {renderRow(
                                "Размер 1",
                                node.size1 || "Нажмите для ввода",
                                "numpad",
                                Boolean(node.size1),
                                () =>
                                  openEditor({
                                    title: `Размер 1 узла #${index + 1}`,
                                    mode: "number",
                                    value: node.size1,
                                    placeholder: "мм",
                                    onSave: (nextValue) => updateMyomaNode(index, "size1", nextValue),
                                  }),
                              )}
                              {renderRow(
                                "Размер 2",
                                node.size2 || "Нажмите для ввода",
                                "numpad",
                                Boolean(node.size2),
                                () =>
                                  openEditor({
                                    title: `Размер 2 узла #${index + 1}`,
                                    mode: "number",
                                    value: node.size2,
                                    placeholder: "мм",
                                    onSave: (nextValue) => updateMyomaNode(index, "size2", nextValue),
                                  }),
                              )}
                              {renderRow(
          "По стенке матки",
          node.wallLocation || "Нажмите для ввода",
          "select",
          Boolean(node.wallLocation),
          undefined,
          undefined,
          [
                                      { value: "передняя", label: "Передняя" },
                                      { value: "задняя", label: "Задняя" },
                                      { value: "правая боковая", label: "Правая боковая" },
                                      { value: "левая боковая", label: "Левая боковая" },
                                      { value: "дно", label: "Дно" },
                                    ],
          (nextValue) => updateMyomaNode(index, "wallLocation", nextValue),
        )}
                              {renderRow(
          "По слою матки",
          node.layerType || "Нажмите для ввода",
          "select",
          Boolean(node.layerType),
          undefined,
          undefined,
          [
                                      { value: "интрамуральная", label: "Интрамуральная" },
                                      { value: "субсерозная", label: "Субсерозная" },
                                      { value: "субмукозная", label: "Субмукозная" },
                                      { value: "интралигаментарная", label: "Интралигаментарная" },
                                      { value: "на ножке", label: "На ножке" },
                                    ],
          (nextValue) => updateMyomaNode(index, "layerType", nextValue),
        )}
                              {renderRow(
          "Четкость контура",
          node.contourClarity || "Нажмите для ввода",
          "select",
          Boolean(node.contourClarity),
          undefined,
          undefined,
          [
                                      { value: "четкие", label: "Четкие" },
                                      { value: "нечеткие", label: "Нечеткие" },
                                    ],
          (nextValue) => updateMyomaNode(index, "contourClarity", nextValue),
        )}
                              {renderRow(
          "Ровность контура",
          node.contourEvenness || "Нажмите для ввода",
          "select",
          Boolean(node.contourEvenness),
          undefined,
          undefined,
          [
                                      { value: "ровные", label: "Ровные" },
                                      { value: "неровные", label: "Неровные" },
                                    ],
          (nextValue) => updateMyomaNode(index, "contourEvenness", nextValue),
        )}
                              {renderRow(
          "Эхогенность",
          node.echogenicity || "Нажмите для ввода",
          "select",
          Boolean(node.echogenicity),
          undefined,
          undefined,
          [
                                      { value: "гипоэхогенный", label: "Гипоэхогенный" },
                                      { value: "гиперэхогенный", label: "Гиперэхогенный" },
                                      { value: "изоэхогенный", label: "Изоэхогенный" },
                                      { value: "гетерогенный", label: "Гетерогенный" },
                                    ],
          (nextValue) => updateMyomaNode(index, "echogenicity", nextValue),
        )}
                              {renderRow(
          "Структура",
          node.structure || "Нажмите для ввода",
          "select",
          Boolean(node.structure),
          undefined,
          undefined,
          UTERUS_STRUCTURE_OPTIONS,
          (nextValue) => updateMyomaNode(index, "structure", nextValue),
        )}
                              {renderRow(
          "Влияние на полость",
          node.cavityImpact || "Нажмите для ввода",
          "select",
          Boolean(node.cavityImpact),
          undefined,
          undefined,
          [
                                      { value: "не деформирует", label: "Не деформирует" },
                                      { value: "деформирует полость", label: "Деформирует полость" },
                                      { value: "смещает эндометрий", label: "Смещает эндометрий" },
                                    ],
          (nextValue) => updateMyomaNode(index, "cavityImpact", nextValue),
        )}
                              {renderRow(
          "Кровоток",
          node.bloodFlow || "Нажмите для ввода",
          "select",
          Boolean(node.bloodFlow),
          undefined,
          undefined,
          [
                                      { value: "не изменен", label: "Не изменен" },
                                      { value: "усилен", label: "Усилен" },
                                      { value: "обеднен", label: "Обеднен" },
                                    ],
          (nextValue) => updateMyomaNode(index, "bloodFlow", nextValue),
        )}
                              {renderRow(
                                "Комментарий",
                                node.comment || "Нажмите для ввода",
                                "text",
                                Boolean(node.comment),
                                () =>
                                  openEditor({
                                    title: `Комментарий #${index + 1}`,
                                    mode: "text",
                                    value: node.comment,
                                    placeholder: "Дополнительные заметки...",
                                    multiline: true,
                                    onSave: (nextValue) => updateMyomaNode(index, "comment", nextValue),
                                  }),
                              )}
                            </View>
                          </ProtocolCard>
                        ))
                      )}

                      <ProtocolActionButton label="+ Узел" onPress={addMyomaNode} />
                    </View>
                  </ProtocolCard>
                </View>
              )}

              <ProtocolSectionHeader title="Эндометрий" />
              {renderRow(
                "Размер",
                uterus.endometriumSize || "Нажмите для ввода",
                "numpad",
                Boolean(uterus.endometriumSize),
                () =>
                  openEditor({
                    title: "Размер эндометрия",
                    mode: "number",
                    value: uterus.endometriumSize,
                    placeholder: "мм",
                    onSave: (nextValue) => updateUterusField("endometriumSize", nextValue),
                  }),
              )}
              {renderRow(
          "Структура",
          uterus.endometriumStructure || "Нажмите для ввода",
          "select",
          Boolean(uterus.endometriumStructure),
          undefined,
          undefined,
          ENDOMETRIUM_STRUCTURE_OPTIONS,
          (nextValue) => updateUterusField("endometriumStructure", nextValue),
        )}

              <ProtocolSectionHeader title="Шейка матки" />
              {renderRow(
                "Размер",
                uterus.cervixSize || "Нажмите для ввода",
                "numpad",
                Boolean(uterus.cervixSize),
                () =>
                  openEditor({
                    title: "Размер шейки матки",
                    mode: "number",
                    value: uterus.cervixSize,
                    placeholder: "мм",
                    onSave: (nextValue) => updateUterusField("cervixSize", nextValue),
                  }),
              )}
              {renderRow(
          "Эхоструктура",
          uterus.cervixEchostructure || "Нажмите для ввода",
          "select",
          Boolean(uterus.cervixEchostructure),
          undefined,
          undefined,
          CERVIX_ECHOSTRUCTURE_OPTIONS,
          (nextValue) => updateUterusField("cervixEchostructure", nextValue),
        )}
              {showCervixEchostructureText && renderRow(
                "Описание эхоструктуры",
                uterus.cervixEchostructureText || "Нажмите для ввода",
                "text",
                Boolean(uterus.cervixEchostructureText),
                () =>
                  openEditor({
                    title: "Описание эхоструктуры шейки матки",
                    mode: "text",
                    value: uterus.cervixEchostructureText,
                    placeholder: "Введите описание",
                    multiline: true,
                    onSave: (nextValue) => updateUterusField("cervixEchostructureText", nextValue),
                  }),
              )}
              {renderRow(
          "Цервикальный канал",
          uterus.cervicalCanal || "Нажмите для ввода",
          "select",
          Boolean(uterus.cervicalCanal),
          undefined,
          undefined,
          CERVICAL_CANAL_OPTIONS,
          (nextValue) => updateUterusField("cervicalCanal", nextValue),
        )}
              {showCervicalCanalText && renderRow(
                "Описание канала",
                uterus.cervicalCanalText || "Нажмите для ввода",
                "text",
                Boolean(uterus.cervicalCanalText),
                () =>
                  openEditor({
                    title: "Описание цервикального канала",
                    mode: "text",
                    value: uterus.cervicalCanalText,
                    placeholder: "Введите описание",
                    multiline: true,
                    onSave: (nextValue) => updateUterusField("cervicalCanalText", nextValue),
                  }),
              )}

          <ProtocolSectionHeader title="Свободная жидкость в малом тазу" />
              {renderRow(
          "Определение",
          uterus.freeFluid || "Нажмите для ввода",
          "select",
          Boolean(uterus.freeFluid),
          undefined,
          undefined,
          FREE_FLUID_OPTIONS,
          (nextValue) => updateUterusField("freeFluid", nextValue),
        )}
              {showFreeFluidText && renderRow(
                "Описание",
                uterus.freeFluidText || "Нажмите для ввода",
                "text",
                Boolean(uterus.freeFluidText),
                () =>
                  openEditor({
                    title: "Описание свободной жидкости",
                    mode: "text",
                    value: uterus.freeFluidText,
                    placeholder: "Введите описание",
                    multiline: true,
                    onSave: (nextValue) => updateUterusField("freeFluidText", nextValue),
                  }),
              )}
            </>
          )}

          <ProtocolSectionHeader title="Дополнительно" />
          {renderRow(
            "Дополнительно",
            uterus.additional || "Нажмите для ввода",
            "text",
            Boolean(uterus.additional),
            () =>
              openEditor({
                title: "Дополнительно: матка",
                mode: "text",
                value: uterus.additional,
                placeholder: "Введите дополнительное описание",
                multiline: true,
                onSave: (nextValue) => updateUterusField("additional", nextValue),
              }),
          )}
        </View>
      </View>
      )}

      {activeOvarySides.map((side) => {
        const ovary = side === "left" ? leftOvary : rightOvary;
        const title = side === "left" ? "Левый яичник" : "Правый яичник";
        const isVisible = isNormalizedMatch(ovary.position, "обычное");

        return (
          <View key={side} style={styles.kidneyPlainSection}>
            <ProtocolOrganHeader title={title} />
            <View style={styles.obpFieldList}>
              {renderRow(
          "Положение",
          ovary.position || "Нажмите для ввода",
          "select",
          Boolean(ovary.position),
          undefined,
          undefined,
          OVARY_POSITION_OPTIONS,
          (nextValue) => updateOvaryField(side, "position", nextValue),
        )}

              {isVisible && (
                <>
                  <ProtocolSectionHeader title="Размеры" />
                  {renderRow(
                    "Длина",
                    ovary.length || "Нажмите для ввода",
                    "numpad",
                    Boolean(ovary.length),
                    () =>
                      openEditor({
                        title: `${title}: длина`,
                        mode: "number",
                        value: ovary.length,
                        placeholder: "мм",
                        onSave: (nextValue) => updateOvaryField(side, "length", nextValue),
                      }),
                  )}
                  {renderRow(
                    "Ширина",
                    ovary.width || "Нажмите для ввода",
                    "numpad",
                    Boolean(ovary.width),
                    () =>
                      openEditor({
                        title: `${title}: ширина`,
                        mode: "number",
                        value: ovary.width,
                        placeholder: "мм",
                        onSave: (nextValue) => updateOvaryField(side, "width", nextValue),
                      }),
                  )}
                  {renderRow(
                    "Толщина",
                    ovary.thickness || "Нажмите для ввода",
                    "numpad",
                    Boolean(ovary.thickness),
                    () =>
                      openEditor({
                        title: `${title}: толщина`,
                        mode: "number",
                        value: ovary.thickness,
                        placeholder: "мм",
                        onSave: (nextValue) => updateOvaryField(side, "thickness", nextValue),
                      }),
                  )}
                  {renderRow(
                    "Объем",
                    ovary.volume || "Расчитывается автоматически",
                    "auto",
                    Boolean(ovary.volume),
                    undefined,
                    true,
                  )}

                  <ProtocolSectionHeader title="Форма" />
                  {renderRow(
          "Форма",
          ovary.shape || "Нажмите для ввода",
          "select",
          Boolean(ovary.shape),
          undefined,
          undefined,
          OVARY_SHAPE_OPTIONS,
          (nextValue) => updateOvaryField(side, "shape", nextValue),
        )}

                  <ProtocolSectionHeader title="Контур" />
                  {renderRow(
          "Контур",
          ovary.contour || "Нажмите для ввода",
          "select",
          Boolean(ovary.contour),
          undefined,
          undefined,
          OVARY_CONTOUR_OPTIONS,
          (nextValue) => updateOvaryField(side, "contour", nextValue),
        )}

                  <ProtocolSectionHeader title="Кисты" />
                  {renderRow(
          "Определение",
          ovary.cysts || "Нажмите для ввода",
          "select",
          Boolean(ovary.cysts),
          undefined,
          undefined,
          OVARY_CYST_OPTIONS,
          (nextValue) => updateOvaryField(side, "cysts", nextValue),
        )}

                  {isNormalizedMatch(ovary.cysts, "определяются") && (
                    <View style={styles.obpFieldList}>
                      <ProtocolCard
                        title="Кисты"
                        countText={`${ovary.cystsList.length} items`}
                      >
                        <View style={styles.obpFieldList}>
                          {ovary.cystsList.length === 0 ? (
                            <Text style={styles.helperText}>Добавьте хотя бы одну кисту.</Text>
                          ) : (
                            ovary.cystsList.map((cyst, index) => (
                              (() => {
                                const [size1, size2] = splitOvaryCystSize(cyst.size);

                                return (
                              <ProtocolCard
                                key={`${side}-ovary-cyst-${index}`}
                                title={`Киста #${index + 1}`}
                                actionLabel="Удалить"
                                actionVariant="danger"
                                onActionPress={() => removeOvaryCyst(side, index)}
                                variant="item"
                              >
                                <View style={styles.obpFieldList}>
                                  {renderRow(
                                    "Размер 1",
                                    size1 || "Нажмите для ввода",
                                    "numpad",
                                    Boolean(size1),
                                    () =>
                                      openEditor({
                                        title: `Киста #${index + 1}: размер 1`,
                                        mode: "number",
                                        value: size1,
                                        placeholder: "мм",
                                        onSave: (nextValue) =>
                                          updateOvaryCyst(
                                            side,
                                            index,
                                            nextValue + (size2 ? `x${size2}` : ""),
                                          ),
                                      }),
                                  )}
                                  {renderRow(
                                    "Размер 2",
                                    size2 || "Нажмите для ввода",
                                    "numpad",
                                    Boolean(size2),
                                    () =>
                                      openEditor({
                                        title: `Киста #${index + 1}: размер 2`,
                                        mode: "number",
                                        value: size2,
                                        placeholder: "мм",
                                        onSave: (nextValue) =>
                                          updateOvaryCyst(
                                            side,
                                            index,
                                            size1 + (nextValue ? `x${nextValue}` : ""),
                                          ),
                                      }),
                                  )}
                                </View>
                              </ProtocolCard>
                                );
                              })()
                            ))
                          )}

                          <ProtocolActionButton
                            label="+ Киста"
                            onPress={() => addOvaryCyst(side)}
                          />
                        </View>
                      </ProtocolCard>
                    </View>
                  )}

                  <ProtocolSectionHeader title="Образования" />
                  {renderRow(
          "Определение",
          ovary.formations || "Нажмите для ввода",
          "select",
          Boolean(ovary.formations),
          undefined,
          undefined,
          OVARY_FORMATION_OPTIONS,
          (nextValue) => updateOvaryField(side, "formations", nextValue),
        )}
                  {isNormalizedMatch(ovary.formations, "определяются") && renderRow(
                    "Описание",
                    ovary.formationsText || "Нажмите для ввода",
                    "text",
                    Boolean(ovary.formationsText),
                    () =>
                      openEditor({
                        title: `${title}: описание образований`,
                        mode: "text",
                        value: ovary.formationsText,
                        placeholder: "Введите описание",
                        multiline: true,
                        onSave: (nextValue) => updateOvaryField(side, "formationsText", nextValue),
                      }),
                  )}
                </>
              )}

              <ProtocolSectionHeader title="Дополнительно" />
              {renderRow(
                "Дополнительно",
                ovary.additional || "Нажмите для ввода",
                "text",
                Boolean(ovary.additional),
                () =>
                  openEditor({
                    title: `${title}: дополнительно`,
                    mode: "text",
                    value: ovary.additional,
                    placeholder: "Введите дополнительное описание",
                    multiline: true,
                    onSave: (nextValue) => updateOvaryField(side, "additional", nextValue),
                  }),
              )}
            </View>
          </View>
        );
      })}

      {showBladderSection && (
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
            urinaryBladder.volume || "Расчитывается автоматически",
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
                title: "Толщина стенки",
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
          undefined,
          undefined,
          BLADDER_RESIDUAL_OPTIONS,
          (nextValue) => updateBladderField("residualStatus", nextValue),
        )}
          {isNormalizedMatch(urinaryBladder.residualStatus, "определяется") && (
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
                urinaryBladder.residualVolume || "Расчитывается автоматически",
                "auto",
                Boolean(urinaryBladder.residualVolume),
                undefined,
                true,
              )}
            </>
          )}

          <ProtocolSectionHeader title="Содержимое" />
          {renderRow(
          "Характер",
          urinaryBladder.contents || "Нажмите для ввода",
          "select",
          Boolean(urinaryBladder.contents),
          undefined,
          undefined,
          BLADDER_CONTENT_OPTIONS,
          (nextValue) => updateBladderField("contents", nextValue),
        )}
          {showContentsText && renderRow(
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
      )}

      {showConclusionSection && fv["omt_female.conclusion"] !== false && (
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
                title: "Заключение ОМТ (Ж)",
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
                title: "Рекомендации ОМТ (Ж)",
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

export default OmtFemaleProtocolBlock;
