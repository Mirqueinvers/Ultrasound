import { Fragment, useState } from "react";
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
  createEmptyGallbladderConcretionDraft,
  createEmptyGallbladderPolypDraft,
} from "../../shared/obpDraft";
import type {
  GallbladderConcretionDraft,
  GallbladderDraft,
  GallbladderPolypDraft,
  LiverDraft,
  ObpDraft,
  PancreasDraft,
  SpleenDraft,
} from "../../shared/obpDraft";
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

type LiverFieldSpec = {
  key: keyof LiverDraft;
  label: string;
  kind: "number" | "select" | "text";
  placeholder?: string;
  multiline?: boolean;
  options?: FieldEditorOption[];
  visibilityGroup?: string;
};

type GallbladderFieldKey = Exclude<
  keyof GallbladderDraft,
  "concretionsList" | "polypsList"
>;

type GallbladderFieldSpec = {
  key: GallbladderFieldKey;
  label: string;
  kind: "number" | "select" | "text";
  placeholder?: string;
  multiline?: boolean;
  options?: FieldEditorOption[];
  hiddenWhenCholecystectomy?: boolean;
  visibilityGroup?: string;
};

type GallbladderConcretionFieldSpec = {
  key: keyof GallbladderConcretionDraft;
  label: string;
  kind: "number" | "select" | "text";
  placeholder?: string;
  options?: FieldEditorOption[];
};

type GallbladderPolypFieldSpec = {
  key: keyof GallbladderPolypDraft;
  label: string;
  kind: "number" | "select" | "text";
  placeholder?: string;
  options?: FieldEditorOption[];
};

type PancreasFieldSpec = {
  key: keyof PancreasDraft;
  label: string;
  kind: "number" | "select" | "text";
  placeholder?: string;
  multiline?: boolean;
  options?: FieldEditorOption[];
  visibilityGroup?: string;
};

type SpleenFieldSpec = {
  key: keyof SpleenDraft;
  label: string;
  kind: "number" | "select" | "text";
  placeholder?: string;
  multiline?: boolean;
  options?: FieldEditorOption[];
  visibilityGroup?: string;
};

type ObpFinalFieldSpec = {
  key: "freeFluid" | "freeFluidDetails" | "conclusion" | "recommendations";
  label: string;
  kind: "select" | "text";
  placeholder?: string;
  multiline?: boolean;
  options?: FieldEditorOption[];
  visibilityGroup?: string;
};

type ObpProtocolBlockProps = {
  styles: AppStyles;
  fieldVisibility: FieldVisibility;
  obpDraft: ObpDraft;
  activeSectionId?: string | null;
  onUpdateLiverField: (field: keyof LiverDraft, value: string) => void;
  onUpdateGallbladderField: (field: keyof GallbladderDraft, value: string) => void;
  onUpdateGallbladderConcretionsList: (
    nextList: GallbladderConcretionDraft[],
  ) => void;
  onUpdateGallbladderPolypsList: (nextList: GallbladderPolypDraft[]) => void;
  onAddGallbladderConcretion: () => void;
  onAddGallbladderPolyp: () => void;
  onUpdatePancreasField: (field: keyof PancreasDraft, value: string) => void;
  onUpdateSpleenField: (field: keyof SpleenDraft, value: string) => void;
  onUpdateFreeFluidField: (
    field: "freeFluid" | "freeFluidDetails",
    value: string,
  ) => void;
  onUpdateConclusionField: (value: string) => void;
  onUpdateRecommendationsField: (value: string) => void;
};

const ECHOGENICITY_OPTIONS: FieldEditorOption[] = [
  { value: "средняя", label: "Средняя" },
  { value: "повышена", label: "Повышена" },
  { value: "снижена", label: "Снижена" },
];

const HOMOGENEITY_OPTIONS: FieldEditorOption[] = [
  { value: "однородная", label: "Однородная" },
  { value: "неоднородная", label: "Неоднородная" },
  { value: "диффузно-неоднородная", label: "Диффузно-неоднородная" },
];

const CONTOURS_OPTIONS: FieldEditorOption[] = [
  { value: "четкий, ровный", label: "четкий, ровный" },
  { value: "четкий, неровный", label: "четкий, неровный" },
  { value: "бугристый", label: "бугристый" },
];
const LOWER_EDGE_OPTIONS: FieldEditorOption[] = [
  { value: "заострён", label: "заострён" },
  { value: "закруглён", label: "закруглён" },
];
const FOCAL_OPTIONS: FieldEditorOption[] = [
  { value: "не определяются", label: "Не определяются" },
  { value: "определяются", label: "Определяются" },
];

const VASCULAR_OPTIONS: FieldEditorOption[] = [
  { value: "не изменен", label: "Не изменен" },
  { value: "обеднен", label: "Обеднен" },
  { value: "усилен", label: "Усилен" },
];

const GALLBLADDER_POSITION_OPTIONS: FieldEditorOption[] = [
  { value: "обычное", label: "Обычное" },
  { value: "холецистэктомия", label: "Холецистэктомия" },
];

const GALLBLADDER_SHAPE_OPTIONS: FieldEditorOption[] = [
  { value: "Правильная", label: "Правильная" },
  { value: "S-образная", label: "S-образная" },
  { value: "С загибом", label: "С загибом" },
];

const GALLBLADDER_CONSTRICTION_OPTIONS: FieldEditorOption[] = [
  { value: "шейки", label: "Шейка" },
  { value: "тела", label: "Тело" },
  { value: "дна", label: "Дно" },
];

const GALLBLADDER_CONTENT_OPTIONS: FieldEditorOption[] = [
  { value: "Однородное", label: "Однородное" },
  { value: "Взвесь", label: "Взвесь" },
  { value: "Сладж", label: "Сладж" },
];

const GALLBLADDER_YES_NO_OPTIONS: FieldEditorOption[] = [
  { value: "Не определяются", label: "Не определяются" },
  { value: "Определяются", label: "Определяются" },
];

const GALLBLADDER_CONCRETION_POSITION_OPTIONS: FieldEditorOption[] = [
  { value: "шейки", label: "Шейка" },
  { value: "тела", label: "Тело" },
  { value: "дна", label: "Дно" },
];

const GALLBLADDER_POLYP_POSITION_OPTIONS: FieldEditorOption[] = [
  { value: "шейке", label: "Шейка" },
  { value: "теле", label: "Тело" },
  { value: "дне", label: "Дно" },
];

const GALLBLADDER_POLYP_WALL_OPTIONS: FieldEditorOption[] = [
  { value: "по передней", label: "Передняя" },
  { value: "по задней", label: "Задняя" },
];

const PANCREAS_ECHOGENICITY_OPTIONS: FieldEditorOption[] = [
  { value: "средняя", label: "Средняя" },
  { value: "повышена", label: "Повышена" },
  { value: "снижена", label: "Снижена" },
];

const PANCREAS_ECHOSTRUCTURE_OPTIONS: FieldEditorOption[] = [
  { value: "однородная", label: "Однородная" },
  { value: "неоднородная", label: "Неоднородная" },
  { value: "диффузно-неоднородная", label: "Диффузно-неоднородная" },
];

const PANCREAS_CONTOUR_OPTIONS: FieldEditorOption[] = [
  { value: "чёткий, ровный", label: "Чёткий, ровный" },
  { value: "чёткий, не ровный", label: "Чёткий, не ровный" },
  { value: "не чёткий", label: "Не чёткий" },
  { value: "бугристый", label: "Бугристый" },
];

const YES_NO_OPTIONS: FieldEditorOption[] = [
  { value: "не определяются", label: "Не определяются" },
  { value: "определяются", label: "Определяются" },
];

const SPLEEN_POSITION_OPTIONS: FieldEditorOption[] = [
  { value: "обычное", label: "Обычное" },
  { value: "спленэктомия", label: "Спленэктомия" },
];

const SPLEEN_ECHOGENICITY_OPTIONS: FieldEditorOption[] = [
  { value: "средняя", label: "Средняя" },
  { value: "повышена", label: "Повышена" },
  { value: "снижена", label: "Снижена" },
];

const SPLEEN_ECHOSTRUCTURE_OPTIONS: FieldEditorOption[] = [
  { value: "однородная", label: "Однородная" },
  { value: "неоднородная", label: "Неоднородная" },
  { value: "диффузно-неоднородная", label: "Диффузно-неоднородная" },
];

const SPLEEN_CONTOUR_OPTIONS: FieldEditorOption[] = [
  { value: "ровные", label: "четкий, ровный" },
  { value: "неровные", label: "четкий, неровный" },
  { value: "бугристые", label: "бугристый" },
];

const OBP_FREE_FLUID_OPTIONS: FieldEditorOption[] = [
  { value: "не определяется", label: "Не определяется" },
  { value: "определяется", label: "Определяется" },
];

const OBP_CONCLUSION_SAMPLES: Array<{ title: string; value: string }> = [
  {
    title: "Норма",
    value: "УЗИ-признаков патологии органов брюшной полости не выявлено.",
  },
  {
    title: "Диффузные изменения поджелудочной железы",
    value: "Эхографические признаки диффузных изменений поджелудочной железы.",
  },
  {
    title: "Хр. панкреатит",
    value: "Эхографические признаки хронического панкреатита.",
  },
  {
    title: "О. панкреатит",
    value: "Эхографические признаки острого панкреатита.",
  },
  {
    title: "Хр. холецистит",
    value: "Эхографические признаки хронического холецистита.",
  },
  {
    title: "О. холецистит",
    value: "Эхографические признаки острого холецистита.",
  },
  {
    title: "Калькулезный холецистит",
    value: "Эхографические признаки калькулезного холецистита.",
  },
  {
    title: "Полип желчного пузыря",
    value: "Эхографические признаки полипа(ов) желчного пузыря.",
  },
  {
    title: "Стеатоз",
    value: "Эхографические признаки стеатоза.",
  },
  {
    title: "Гепатомегалия",
    value: "Эхографические признаки гепатомегалии.",
  },
  {
    title: "Цирроз",
    value: "Эхографические признаки цирроза печени.",
  },
  {
    title: "Спленомегалия",
    value: "Эхографические признаки спленомегалии.",
  },
  {
    title: "Диффузные изменения селезенки",
    value: "Эхографические признаки диффузных изменений селезенки.",
  },
];

export function ObpProtocolBlock({
  styles,
  fieldVisibility,
  obpDraft: incomingObpDraft,
  activeSectionId,
  onUpdateLiverField,
  onUpdateGallbladderField,
  onUpdateGallbladderConcretionsList,
  onUpdateGallbladderPolypsList,
  onAddGallbladderConcretion,
  onAddGallbladderPolyp,
  onUpdatePancreasField,
  onUpdateSpleenField,
  onUpdateFreeFluidField,
  onUpdateConclusionField,
  onUpdateRecommendationsField,
}: ObpProtocolBlockProps) {
  const [editorState, setEditorState] = useState<EditorState>(null);
  const [draft, setDraft] = useState<ObpDraft>(incomingObpDraft);

  const activeGallbladder = draft.gallbladder;
  const isCholecystectomy = isNormalizedMatch(activeGallbladder.position, "холецистэктомия");
  const activePancreas = draft.pancreas;
  const activeSpleen = draft.spleen;
  const hasLiverFocalLesions = isNormalizedMatch(draft.liver.focalLesionsPresence, "определяются");
  const hasGallbladderConcretions = isNormalizedMatch(activeGallbladder.concretions, "определяются");
  const hasGallbladderPolyps = isNormalizedMatch(activeGallbladder.polyps, "определяются");
  const hasPancreasPathologicalFormations =
    isNormalizedMatch(activePancreas.pathologicalFormations, "определяются");
  const hasSpleenPathologicalFormations =
    isNormalizedMatch(activeSpleen.pathologicalFormations, "определяются");

  const liverFields: LiverFieldSpec[] = [
    { key: "rightLobeAP", label: "Правая доля, ПЗР", kind: "number", placeholder: "мм", visibilityGroup: "obp.liver.sizes" },
    { key: "leftLobeAP", label: "Левая доля, ПЗР", kind: "number", placeholder: "мм", visibilityGroup: "obp.liver.sizes" },
    { key: "rightLobeCCR", label: "Правая доля, ККР", kind: "number", placeholder: "мм", visibilityGroup: "obp.liver.sizes" },
    { key: "rightLobeCVR", label: "Правая доля, КВР", kind: "number", placeholder: "мм", visibilityGroup: "obp.liver.sizes" },
    { key: "leftLobeCCR", label: "Левая доля, ККР", kind: "number", placeholder: "мм", visibilityGroup: "obp.liver.sizes" },
    { key: "rightLobeTotal", label: "Правая доля, ККР + ПЗР", kind: "number", placeholder: "Авторасчёт", visibilityGroup: "obp.liver.sizes" },
    { key: "leftLobeTotal", label: "Левая доля, ККР + ПЗР", kind: "number", placeholder: "Авторасчёт", visibilityGroup: "obp.liver.sizes" },
    { key: "echogenicity", label: "Эхогенность", kind: "select", options: ECHOGENICITY_OPTIONS, visibilityGroup: "obp.liver.structure" },
    { key: "homogeneity", label: "Эхоструктура", kind: "select", options: HOMOGENEITY_OPTIONS, visibilityGroup: "obp.liver.structure" },
    { key: "contours", label: "Контуры", kind: "select", options: CONTOURS_OPTIONS, visibilityGroup: "obp.liver.structure" },
    { key: "lowerEdgeAngle", label: "Угол нижнего края", kind: "select", options: LOWER_EDGE_OPTIONS, visibilityGroup: "obp.liver.structure" },
    { key: "focalLesionsPresence", label: "Патологические образования", kind: "select", options: FOCAL_OPTIONS, visibilityGroup: "obp.liver.focal" },
    { key: "focalLesions", label: "Описание патологических образований", kind: "text", placeholder: "Введите описание", multiline: true, visibilityGroup: "obp.liver.focal" },
    { key: "vascularPattern", label: "Сосудистый рисунок", kind: "select", options: VASCULAR_OPTIONS, visibilityGroup: "obp.liver.vessels" },
    { key: "portalVeinDiameter", label: "Воротная вена", kind: "number", placeholder: "мм", visibilityGroup: "obp.liver.vessels" },
    { key: "ivc", label: "Нижняя полая вена", kind: "number", placeholder: "мм", visibilityGroup: "obp.liver.vessels" },
    { key: "additional", label: "Дополнительно", kind: "text", placeholder: "Введите дополнительное описание", multiline: true, visibilityGroup: "obp.liver.additional" },
  ];

  const gallbladderFields: GallbladderFieldSpec[] = [
    { key: "position", label: "Положение", kind: "select", options: GALLBLADDER_POSITION_OPTIONS, visibilityGroup: "obp.gallbladder.position" },
    { key: "length", label: "Длина", kind: "number", placeholder: "мм", hiddenWhenCholecystectomy: true, visibilityGroup: "obp.gallbladder.sizes" },
    { key: "width", label: "Ширина", kind: "number", placeholder: "мм", hiddenWhenCholecystectomy: true, visibilityGroup: "obp.gallbladder.sizes" },
    { key: "wallThickness", label: "Толщина стенки", kind: "number", placeholder: "мм", hiddenWhenCholecystectomy: true, visibilityGroup: "obp.gallbladder.sizes" },
    { key: "shape", label: "Форма", kind: "select", options: GALLBLADDER_SHAPE_OPTIONS, hiddenWhenCholecystectomy: true, visibilityGroup: "obp.gallbladder.shape" },
    { key: "constriction", label: "Перетяжка", kind: "select", options: GALLBLADDER_CONSTRICTION_OPTIONS, hiddenWhenCholecystectomy: true, visibilityGroup: "obp.gallbladder.shape" },
    { key: "contentType", label: "Тип содержимого", kind: "select", options: GALLBLADDER_CONTENT_OPTIONS, hiddenWhenCholecystectomy: true, visibilityGroup: "obp.gallbladder.content" },
    { key: "concretions", label: "Конкременты", kind: "select", options: GALLBLADDER_YES_NO_OPTIONS, hiddenWhenCholecystectomy: true, visibilityGroup: "obp.gallbladder.content" },
    { key: "polyps", label: "Полипы", kind: "select", options: GALLBLADDER_YES_NO_OPTIONS, hiddenWhenCholecystectomy: true, visibilityGroup: "obp.gallbladder.content" },
    { key: "content", label: "Дополнительно по содержимому", kind: "text", placeholder: "Введите описание содержимого", multiline: true, hiddenWhenCholecystectomy: true, visibilityGroup: "obp.gallbladder.content" },
    { key: "cysticDuct", label: "Пузырный проток", kind: "number", placeholder: "мм", hiddenWhenCholecystectomy: true, visibilityGroup: "obp.gallbladder.ducts" },
    { key: "commonBileDuct", label: "Общий желчный проток", kind: "number", placeholder: "мм", hiddenWhenCholecystectomy: true, visibilityGroup: "obp.gallbladder.ducts" },
    { key: "additional", label: "Дополнительно", kind: "text", placeholder: "Введите дополнительное описание", multiline: true, visibilityGroup: "obp.gallbladder.additional" },
  ];

  const gallbladderConcretionFields: GallbladderConcretionFieldSpec[] = [
    { key: "size", label: "Размер", kind: "number", placeholder: "мм" },
    { key: "position", label: "Положение", kind: "select", options: GALLBLADDER_CONCRETION_POSITION_OPTIONS },
  ];

  const gallbladderPolypFields: GallbladderPolypFieldSpec[] = [
    { key: "size", label: "Размер", kind: "number", placeholder: "мм" },
    { key: "position", label: "Положение", kind: "select", options: GALLBLADDER_POLYP_POSITION_OPTIONS },
    { key: "wall", label: "Стенка", kind: "select", options: GALLBLADDER_POLYP_WALL_OPTIONS },
  ];

  const pancreasFields: PancreasFieldSpec[] = [
    { key: "head", label: "Головка", kind: "number", placeholder: "мм", visibilityGroup: "obp.pancreas.sizes" },
    { key: "body", label: "Тело", kind: "number", placeholder: "мм", visibilityGroup: "obp.pancreas.sizes" },
    { key: "tail", label: "Хвост", kind: "number", placeholder: "мм", visibilityGroup: "obp.pancreas.sizes" },
    { key: "echogenicity", label: "Эхогенность", kind: "select", options: PANCREAS_ECHOGENICITY_OPTIONS, visibilityGroup: "obp.pancreas.structure" },
    { key: "echostructure", label: "Эхоструктура", kind: "select", options: PANCREAS_ECHOSTRUCTURE_OPTIONS, visibilityGroup: "obp.pancreas.structure" },
    { key: "contour", label: "Контур", kind: "select", options: PANCREAS_CONTOUR_OPTIONS, visibilityGroup: "obp.pancreas.structure" },
    { key: "pathologicalFormations", label: "Патологические образования", kind: "select", options: YES_NO_OPTIONS, visibilityGroup: "obp.pancreas.structure" },
    { key: "pathologicalFormationsText", label: "Описание патологических образований", kind: "text", placeholder: "Введите описание", multiline: true, visibilityGroup: "obp.pancreas.structure" },
    { key: "wirsungDuct", label: "Вирсунгов проток", kind: "number", placeholder: "мм", visibilityGroup: "obp.pancreas.duct" },
    { key: "additional", label: "Дополнительно", kind: "text", placeholder: "Введите дополнительное описание", multiline: true, visibilityGroup: "obp.pancreas.additional" },
  ];

  const spleenFields: SpleenFieldSpec[] = [
    { key: "position", label: "Положение", kind: "select", options: SPLEEN_POSITION_OPTIONS, visibilityGroup: "obp.spleen.sizes" },
    { key: "length", label: "Длина", kind: "number", placeholder: "мм", visibilityGroup: "obp.spleen.sizes" },
    { key: "width", label: "Ширина", kind: "number", placeholder: "мм", visibilityGroup: "obp.spleen.sizes" },
    { key: "echogenicity", label: "Эхогенность", kind: "select", options: SPLEEN_ECHOGENICITY_OPTIONS, visibilityGroup: "obp.spleen.structure" },
    { key: "echostructure", label: "Эхоструктура", kind: "select", options: SPLEEN_ECHOSTRUCTURE_OPTIONS, visibilityGroup: "obp.spleen.structure" },
    { key: "contours", label: "Контур", kind: "select", options: SPLEEN_CONTOUR_OPTIONS, visibilityGroup: "obp.spleen.structure" },
    { key: "pathologicalFormations", label: "Патологические образования", kind: "select", options: YES_NO_OPTIONS, visibilityGroup: "obp.spleen.structure" },
    { key: "pathologicalFormationsText", label: "Описание патологических образований", kind: "text", placeholder: "Введите описание", multiline: true, visibilityGroup: "obp.spleen.structure" },
    { key: "splenicVein", label: "Селезёночная вена", kind: "number", placeholder: "мм", visibilityGroup: "obp.spleen.vessels" },
    { key: "splenicArtery", label: "Селезёночная артерия", kind: "number", placeholder: "мм", visibilityGroup: "obp.spleen.vessels" },
    { key: "additional", label: "Дополнительно", kind: "text", placeholder: "Введите дополнительное описание", multiline: true, visibilityGroup: "obp.spleen.additional" },
  ];

  const obpFinalFields: ObpFinalFieldSpec[] = [
    { key: "freeFluid", label: "Свободная жидкость в брюшной полости", kind: "select", options: OBP_FREE_FLUID_OPTIONS, visibilityGroup: "obp.final.freeFluid" },
    { key: "freeFluidDetails", label: "Описание свободной жидкости", kind: "text", placeholder: "Введите описание", multiline: true, visibilityGroup: "obp.final.freeFluid" },
    { key: "conclusion", label: "Заключение ОБП", kind: "text", placeholder: "Введите общее заключение", multiline: true, visibilityGroup: "obp.final.conclusion" },
    { key: "recommendations", label: "Рекомендации", kind: "text", placeholder: "Введите рекомендации", multiline: true, visibilityGroup: "obp.final.conclusion" },
  ];

  const OBP_SECTION_IDS = {
    liver: "obp.liver",
    gallbladder: "obp.gallbladder",
    pancreas: "obp.pancreas",
    spleen: "obp.spleen",
    conclusion: "obp.conclusion",
  } as const;

  function resolveActiveObpSection(sectionId: string | null | undefined) {
    if (!sectionId) {
      return null;
    }

    switch (sectionId) {
      case OBP_SECTION_IDS.liver:
        return OBP_SECTION_IDS.liver;
      case OBP_SECTION_IDS.gallbladder:
        return OBP_SECTION_IDS.gallbladder;
      case OBP_SECTION_IDS.pancreas:
        return OBP_SECTION_IDS.pancreas;
      case OBP_SECTION_IDS.spleen:
        return OBP_SECTION_IDS.spleen;
      case OBP_SECTION_IDS.conclusion:
        return OBP_SECTION_IDS.conclusion;
      default:
        return OBP_SECTION_IDS.liver;
    }
  }

  const resolvedActiveSectionId = resolveActiveObpSection(activeSectionId);
  const showAllSections = resolvedActiveSectionId === null;
  const showLiverSection = showAllSections || resolvedActiveSectionId === OBP_SECTION_IDS.liver;
  const showGallbladderSection =
    showAllSections || resolvedActiveSectionId === OBP_SECTION_IDS.gallbladder;
  const showPancreasSection = showAllSections || resolvedActiveSectionId === OBP_SECTION_IDS.pancreas;
  const showSpleenSection = showAllSections || resolvedActiveSectionId === OBP_SECTION_IDS.spleen;
  const showConclusionSection = showAllSections || resolvedActiveSectionId === OBP_SECTION_IDS.conclusion;

  const hasValue = (currentValue: string) => currentValue.trim().length > 0;

  const renderObpFieldRow = ({
    itemKey,
    label,
    value,
    kind,
    filled,
    readonly,
    onPress,
    options,
    onSelectOption,
  }: {
    itemKey: string;
    label: string;
    value: string;
    kind: "number" | "select" | "text" | "auto";
    filled: boolean;
    readonly?: boolean;
    onPress?: () => void;
    options?: FieldEditorOption[];
    onSelectOption?: (value: string) => void;
  }) => (
    <ProtocolFieldRow
      key={itemKey}
      label={label}
      value={value}
      typeLabel={readonly ? "auto" : kind === "number" ? "numpad" : kind}
      filled={filled}
      readonly={readonly}
      onPress={kind === "select" ? undefined : onPress}
      options={kind === "select" ? options : undefined}
      onSelectOption={kind === "select" ? onSelectOption : undefined}
    />
  );

  const updateDraft = (producer: (current: ObpDraft) => ObpDraft) => {
    setDraft((current) => {
      const next = producer(current);
      return next;
    });
  };

  const updateLiverFieldValue = (field: keyof LiverDraft, value: string) => {
    updateDraft((current) => ({
      ...current,
      liver: {
        ...current.liver,
        [field]: value,
      },
    }));
    onUpdateLiverField(field, value);
  };

  const updateGallbladderFieldValue = (field: keyof GallbladderDraft, value: string) => {
    updateDraft((current) => ({
      ...current,
      gallbladder: {
        ...current.gallbladder,
        [field]: value,
      },
    }));
    onUpdateGallbladderField(field, value);
  };

  const updateGallbladderConcretions = (nextList: GallbladderConcretionDraft[]) => {
    updateDraft((current) => ({
      ...current,
      gallbladder: {
        ...current.gallbladder,
        concretionsList: nextList,
      },
    }));
    onUpdateGallbladderConcretionsList(nextList);
  };

  const updateGallbladderPolyps = (nextList: GallbladderPolypDraft[]) => {
    updateDraft((current) => ({
      ...current,
      gallbladder: {
        ...current.gallbladder,
        polypsList: nextList,
      },
    }));
    onUpdateGallbladderPolypsList(nextList);
  };

  const handleAddGallbladderConcretion = () => {
    updateGallbladderConcretions([
      ...activeGallbladder.concretionsList,
      createEmptyGallbladderConcretionDraft(),
    ]);
    onAddGallbladderConcretion();
  };

  const handleAddGallbladderPolyp = () => {
    updateGallbladderPolyps([
      ...activeGallbladder.polypsList,
      createEmptyGallbladderPolypDraft(),
    ]);
    onAddGallbladderPolyp();
  };

  const updatePancreasFieldValue = (field: keyof PancreasDraft, value: string) => {
    updateDraft((current) => ({
      ...current,
      pancreas: {
        ...current.pancreas,
        [field]: value,
      },
    }));
    onUpdatePancreasField(field, value);
  };

  const updateSpleenFieldValue = (field: keyof SpleenDraft, value: string) => {
    updateDraft((current) => ({
      ...current,
      spleen: {
        ...current.spleen,
        [field]: value,
      },
    }));
    onUpdateSpleenField(field, value);
  };

  const updateFreeFluidFieldValue = (field: "freeFluid" | "freeFluidDetails", value: string) => {
    updateDraft((current) => ({
      ...current,
      [field]: value,
    }));
    onUpdateFreeFluidField(field, value);
  };

  const updateConclusionFieldValue = (value: string) => {
    updateDraft((current) => ({
      ...current,
      conclusion: value,
    }));
    onUpdateConclusionField(value);
  };

  const updateRecommendationsFieldValue = (value: string) => {
    updateDraft((current) => ({
      ...current,
      recommendations: value,
    }));
    onUpdateRecommendationsField(value);
  };

  const renderInlineSectionHeader = (label: string, note?: string) => (
    <ProtocolSectionHeader title={label} note={note} />
  );

  const saveEditor = (value: string) => {
    Keyboard.dismiss();
    editorState?.onSave(value);
    setEditorState(null);
  };

  const openEditor = (config: NonNullable<EditorState>) => {
    Keyboard.dismiss();
    requestAnimationFrame(() => {
      setEditorState(config);
    });
  };

  const updateGallbladderConcretionItem = (
    index: number,
    field: keyof GallbladderConcretionDraft,
    value: string,
  ) => {
    const nextList = activeGallbladder.concretionsList.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item,
    );
    updateGallbladderConcretions(nextList);
  };

  const updateGallbladderPolypItem = (
    index: number,
    field: keyof GallbladderPolypDraft,
    value: string,
  ) => {
    const nextList = activeGallbladder.polypsList.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item,
    );
    updateGallbladderPolyps(nextList);
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
          editorState?.title === obpFinalFields[2].label
            ? ({ value, setValue, close }) => (
                <View style={styles.obpSampleList}>
                  {OBP_CONCLUSION_SAMPLES.map((sample) => (
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
        onCancel={() => setEditorState(null)}
        onSave={saveEditor}
      />

      {showLiverSection && (
        <>
      <ProtocolOrganHeader title="Печень" />

      <View style={styles.obpFieldList}>
        {liverFields.map((field) => {
          if (field.key === "focalLesions" && !hasLiverFocalLesions) {
            return null;
          }

          if (field.visibilityGroup && (fieldVisibility as Record<string, boolean>)[field.visibilityGroup] === false) {
            return null;
          }

          const currentValue = draft.liver[field.key];
          const displayValue = currentValue || "Нажмите для ввода";
          const isReadOnly = field.key === "rightLobeTotal" || field.key === "leftLobeTotal";

          if (field.key === "rightLobeAP") {
            return (
              <Fragment key={field.key}>
                {renderInlineSectionHeader("Размеры")}
                {renderObpFieldRow({
  itemKey: field.key,
  label: field.label,
  value: displayValue,
  kind: field.kind,
  filled: hasValue(currentValue),
  readonly: isReadOnly,
  onPress: () => {
                    if (isReadOnly) {
                      return;
                    }

                    openEditor({
                      title: field.label,
                      mode: field.kind,
                      value: currentValue,
                      placeholder: field.placeholder,
                      multiline: field.multiline,
                      options: field.options,
                      onSave: (nextValue) => updateLiverFieldValue(field.key, nextValue),
                    });
                  },
  options: field.options,
  onSelectOption: (nextValue) => updateLiverFieldValue(field.key, nextValue),
})}
              </Fragment>
            );
          }

          if (field.key === "echogenicity") {
            return (
              <Fragment key={field.key}>
                {renderInlineSectionHeader("Структура")}
                {renderObpFieldRow({
  itemKey: field.key,
  label: field.label,
  value: displayValue,
  kind: field.kind,
  filled: hasValue(currentValue),
  readonly: isReadOnly,
  onPress: () => {
                    if (isReadOnly) {
                      return;
                    }

                    openEditor({
                      title: field.label,
                      mode: field.kind,
                      value: currentValue,
                      placeholder: field.placeholder,
                      multiline: field.multiline,
                      options: field.options,
                      onSave: (nextValue) => updateLiverFieldValue(field.key, nextValue),
                    });
                  },
  options: field.options,
  onSelectOption: (nextValue) => updateLiverFieldValue(field.key, nextValue),
})}
              </Fragment>
            );
          }

          if (field.key === "vascularPattern") {
            return (
              <Fragment key={field.key}>
                {renderInlineSectionHeader("Сосуды")}
                {renderObpFieldRow({
  itemKey: field.key,
  label: field.label,
  value: displayValue,
  kind: field.kind,
  filled: hasValue(currentValue),
  readonly: isReadOnly,
  onPress: () => {
                    if (isReadOnly) {
                      return;
                    }

                    openEditor({
                      title: field.label,
                      mode: field.kind,
                      value: currentValue,
                      placeholder: field.placeholder,
                      multiline: field.multiline,
                      options: field.options,
                      onSave: (nextValue) => updateLiverFieldValue(field.key, nextValue),
                    });
                  },
  options: field.options,
  onSelectOption: (nextValue) => updateLiverFieldValue(field.key, nextValue),
})}
              </Fragment>
            );
          }

          if (field.key === "additional") {
            return (
              <Fragment key={field.key}>
                {renderInlineSectionHeader("Дополнительно")}
                {renderObpFieldRow({
  itemKey: field.key,
  label: field.label,
  value: displayValue,
  kind: field.kind,
  filled: hasValue(currentValue),
  readonly: isReadOnly,
  onPress: () => {
                    if (isReadOnly) {
                      return;
                    }

                    openEditor({
                      title: field.label,
                      mode: field.kind,
                      value: currentValue,
                      placeholder: field.placeholder,
                      multiline: field.multiline,
                      options: field.options,
                      onSave: (nextValue) => updateLiverFieldValue(field.key, nextValue),
                    });
                  },
  options: field.options,
  onSelectOption: (nextValue) => updateLiverFieldValue(field.key, nextValue),
})}
              </Fragment>
            );
          }

          return renderObpFieldRow({
  itemKey: field.key,
  label: field.label,
  value: displayValue,
  kind: field.kind,
  filled: hasValue(currentValue),
  readonly: isReadOnly,
  onPress: () => {
                if (isReadOnly) {
                  return;
                }

                openEditor({
                  title: field.label,
                  mode: field.kind,
                  value: currentValue,
                  placeholder: field.placeholder,
                  multiline: field.multiline,
                  options: field.options,
                  onSave: (nextValue) => updateLiverFieldValue(field.key, nextValue),
                });
              },
  options: field.options,
  onSelectOption: (nextValue) => updateLiverFieldValue(field.key, nextValue),
});
        })}
      </View>
        </>
      )}

      {showGallbladderSection && (
        <>
      <ProtocolOrganHeader title="Желчный пузырь" />

      <View style={styles.obpFieldList}>
        {gallbladderFields.map((field) => {
          if (field.hiddenWhenCholecystectomy && isCholecystectomy) {
            return null;
          }

          if (field.visibilityGroup && (fieldVisibility as Record<string, boolean>)[field.visibilityGroup] === false) {
            return null;
          }

          const currentValue = activeGallbladder[field.key];
          const displayValue = currentValue || 'Нажмите для ввода';

          const fieldRow = renderObpFieldRow({
  itemKey: field.key,
  label: field.label,
  value: displayValue,
  kind: field.kind,
  filled: hasValue(currentValue),
  onPress: () => {
                openEditor({
                  title: field.label,
                  mode: field.kind,
                  value: currentValue,
                  placeholder: field.placeholder,
                  multiline: field.multiline,
                  options: field.options,
                  onSave: (nextValue) => updateGallbladderFieldValue(field.key, nextValue),
                });
              },
  options: field.options,
  onSelectOption: (nextValue) => updateGallbladderFieldValue(field.key, nextValue),
});

          if (field.key === "position") {
            return (
              <Fragment key={field.key}>
                {renderInlineSectionHeader("Положение")}
                {fieldRow}
              </Fragment>
            );
          }

          if (field.key === "length") {
            return (
              <Fragment key={field.key}>
                {renderInlineSectionHeader("Размеры")}
                {fieldRow}
              </Fragment>
            );
          }

          if (field.key === "shape") {
            return (
              <Fragment key={field.key}>
                {renderInlineSectionHeader("Форма")}
                {fieldRow}
              </Fragment>
            );
          }

          if (field.key === "contentType") {
            return (
              <Fragment key={field.key}>
                {renderInlineSectionHeader("Содержимое")}
                {fieldRow}
              </Fragment>
            );
          }

          if (field.key === 'concretions') {
            return (
              <Fragment key={field.key}>
                {fieldRow}
                {!isCholecystectomy && hasGallbladderConcretions && (
                  <View style={styles.obpFieldList}>
                    {renderInlineSectionHeader(
                      "Конкременты",
                      `${activeGallbladder.concretionsList.length} items`,
                    )}

                    <View style={styles.obpFieldList}>
                      {activeGallbladder.concretionsList.length === 0 ? (
                        <Text style={styles.helperText}>Добавьте хотя бы один конкремент.</Text>
                      ) : (
                        activeGallbladder.concretionsList.map((item, index) => (
                          <ProtocolCard
                            key={`concretion-${index}`}
                            title={`Конкремент #${index + 1}`}
                            subtitle="Нажмите для редактирования"
                            actionLabel="Удалить"
                            actionVariant="danger"
                            onActionPress={() =>
                              updateGallbladderConcretions(
                                activeGallbladder.concretionsList.filter(
                                  (_, itemIndex) => itemIndex !== index,
                                ),
                              )
                            }
                            variant="item"
                          >
                            <View style={styles.obpFieldList}>
                              {gallbladderConcretionFields.map((itemField) => {
                                const currentItemValue = item[itemField.key];
                                const itemDisplayValue = currentItemValue || 'Нажмите для ввода';

                                return renderObpFieldRow({
  itemKey: itemField.key,
  label: itemField.label,
  value: itemDisplayValue,
  kind: itemField.kind,
  filled: hasValue(currentItemValue),
  onPress: () => {
                                      openEditor({
                                        title: `${itemField.label} #${index + 1}`,
                                        mode: itemField.kind,
                                        value: currentItemValue,
                                        placeholder: itemField.placeholder,
                                        options: itemField.options,
                                        onSave: (nextValue) =>
                                          updateGallbladderConcretionItem(
                                            index,
                                            itemField.key,
                                            nextValue,
                                          ),
                                      });
                                    },
  options: itemField.options,
  onSelectOption: (nextValue) =>
                                          updateGallbladderConcretionItem(
                                            index,
                                            itemField.key,
                                            nextValue,
                                          ),
});
                              })}
                            </View>
                          </ProtocolCard>
                        ))
                      )}

                      <ProtocolActionButton
                        label="+ Конкремент"
                        onPress={handleAddGallbladderConcretion}
                      />
                    </View>
                  </View>
                )}
              </Fragment>
            );
          }

          if (field.key === 'polyps') {
            return (
              <Fragment key={field.key}>
                {fieldRow}
                {!isCholecystectomy && hasGallbladderPolyps && (
                  <View style={styles.obpFieldList}>
                    {renderInlineSectionHeader(
                      "Полипы",
                      `${activeGallbladder.polypsList.length} items`,
                    )}

                    <View style={styles.obpFieldList}>
                      {activeGallbladder.polypsList.length === 0 ? (
                        <Text style={styles.helperText}>Добавьте хотя бы один полип.</Text>
                      ) : (
                        activeGallbladder.polypsList.map((item, index) => (
                          <ProtocolCard
                            key={`polyp-${index}`}
                            title={`Полип #${index + 1}`}
                            subtitle="Нажмите для редактирования"
                            actionLabel="Удалить"
                            actionVariant="danger"
                            onActionPress={() =>
                              updateGallbladderPolyps(
                                activeGallbladder.polypsList.filter(
                                  (_, itemIndex) => itemIndex !== index,
                                ),
                              )
                            }
                            variant="item"
                          >
                            <View style={styles.obpFieldList}>
                              {gallbladderPolypFields.map((itemField) => {
                                const currentItemValue = item[itemField.key];
                                const itemDisplayValue = currentItemValue || 'Нажмите для ввода';

                                return renderObpFieldRow({
  itemKey: itemField.key,
  label: itemField.label,
  value: itemDisplayValue,
  kind: itemField.kind,
  filled: hasValue(currentItemValue),
  onPress: () => {
                                      openEditor({
                                        title: `${itemField.label} #${index + 1}`,
                                        mode: itemField.kind,
                                        value: currentItemValue,
                                        placeholder: itemField.placeholder,
                                        options: itemField.options,
                                        onSave: (nextValue) =>
                                          updateGallbladderPolypItem(index, itemField.key, nextValue),
                                      });
                                    },
  options: itemField.options,
  onSelectOption: (nextValue) =>
                                          updateGallbladderPolypItem(index, itemField.key, nextValue),
});
                              })}
                            </View>
                          </ProtocolCard>
                        ))
                      )}

                      <ProtocolActionButton label="+ Полип" onPress={handleAddGallbladderPolyp} />
                    </View>
                  </View>
                )}
              </Fragment>
            );
          }

          return fieldRow;
        })}
      </View>
        </>
      )}
      {showPancreasSection && (
        <>
      <ProtocolOrganHeader title="Поджелудочная железа" />

      <View style={styles.obpFieldList}>
        {pancreasFields.map((field) => {
          if (field.key === "pathologicalFormationsText" && !hasPancreasPathologicalFormations) {
            return null;
          }

          if (field.visibilityGroup && (fieldVisibility as Record<string, boolean>)[field.visibilityGroup] === false) {
            return null;
          }

          const currentValue = draft.pancreas[field.key];
          const displayValue = currentValue || "Нажмите для ввода";

          return (
            <Fragment key={field.key}>
              {field.key === "head" && renderInlineSectionHeader("Размеры")}
              {field.key === "echogenicity" && renderInlineSectionHeader("Структура")}
              {field.key === "wirsungDuct" && renderInlineSectionHeader("Вирсунгов проток")}
              {field.key === "additional" && renderInlineSectionHeader("Дополнительно")}

              {renderObpFieldRow({
  itemKey: field.key,
  label: field.label,
  value: displayValue,
  kind: field.kind,
  filled: hasValue(currentValue),
  onPress: () => {
                  openEditor({
                    title: field.label,
                    mode: field.kind,
                    value: currentValue,
                    placeholder: field.placeholder,
                    multiline: field.multiline,
                    options: field.options,
                    onSave: (nextValue) => updatePancreasFieldValue(field.key, nextValue),
                  });
                },
  options: field.options,
  onSelectOption: (nextValue) => updatePancreasFieldValue(field.key, nextValue),
})}
            </Fragment>
          );
        })}
      </View>
        </>
      )}

      {showSpleenSection && (
        <>
      <ProtocolOrganHeader title="Селезёнка" />

      <View style={styles.obpFieldList}>
        {spleenFields.map((field) => {
          if (field.key === "pathologicalFormationsText" && !hasSpleenPathologicalFormations) {
            return null;
          }

          if (field.visibilityGroup && (fieldVisibility as Record<string, boolean>)[field.visibilityGroup] === false) {
            return null;
          }

          const currentValue = draft.spleen[field.key];
          const displayValue = currentValue || "Нажмите для ввода";

          return (
            <Fragment key={field.key}>
              {field.key === "position" && renderInlineSectionHeader("Положение")}
              {field.key === "length" && renderInlineSectionHeader("Размеры")}
              {field.key === "echogenicity" && renderInlineSectionHeader("Структура")}
              {field.key === "splenicVein" && renderInlineSectionHeader("Сосуды")}
              {field.key === "additional" && renderInlineSectionHeader("Дополнительно")}

              {renderObpFieldRow({
  itemKey: field.key,
  label: field.label,
  value: displayValue,
  kind: field.kind,
  filled: hasValue(currentValue),
  onPress: () => {
                  openEditor({
                    title: field.label,
                    mode: field.kind,
                    value: currentValue,
                    placeholder: field.placeholder,
                    multiline: field.multiline,
                    options: field.options,
                    onSave: (nextValue) => updateSpleenFieldValue(field.key, nextValue),
                  });
                },
  options: field.options,
  onSelectOption: (nextValue) => updateSpleenFieldValue(field.key, nextValue),
})}
            </Fragment>
          );
        })}
      </View>
        </>
      )}

      {showConclusionSection && (
        <><ProtocolOrganHeader title="Свободная жидкость" />

      <View style={styles.obpFieldList}>
        {renderObpFieldRow({
  itemKey: obpFinalFields[0].key,
  label: obpFinalFields[0].label,
  value: draft.freeFluid || "Нажмите для ввода",
  kind: "select",
  filled: hasValue(draft.freeFluid),
  onPress: () => {
            openEditor({
              title: obpFinalFields[0].label,
              mode: "select",
              value: draft.freeFluid,
              options: obpFinalFields[0].options,
              onSave: (nextValue) => updateFreeFluidFieldValue("freeFluid", nextValue),
            });
          },
  options: obpFinalFields[0].options,
  onSelectOption: (nextValue) => updateFreeFluidFieldValue("freeFluid", nextValue),
})}

        {isNormalizedMatch(draft.freeFluid, "определяется") && (
          <Pressable
            onPress={() => {
              openEditor({
                title: obpFinalFields[1].label,
                mode: "text",
                value: draft.freeFluidDetails,
                placeholder: obpFinalFields[1].placeholder,
                multiline: true,
                onSave: (nextValue) => updateFreeFluidFieldValue("freeFluidDetails", nextValue),
              });
            }}
            style={({ pressed }) => [
              styles.obpFieldRow,
              hasValue(draft.freeFluidDetails) && styles.obpFieldRowFilled,
              pressed && styles.obpFieldRowPressed,
            ]}
          >
            <View style={styles.obpFieldRowContent}>
              <Text style={styles.obpFieldLabel}>{obpFinalFields[1].label}</Text>
              <Text style={styles.obpFieldValue}>
                {draft.freeFluidDetails || "Нажмите для ввода"}
              </Text>
            </View>
            <Text style={styles.obpFieldType}>text</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.obpFieldList}>
        <ProtocolOrganHeader title="Заключение" />

        <ProtocolFieldRow
          label={obpFinalFields[2].label}
          value={draft.conclusion || "Нажмите для ввода"}
          typeLabel="text"
          filled={hasValue(draft.conclusion)}
          onPress={() => {
            openEditor({
              title: obpFinalFields[2].label,
              mode: "text",
              value: draft.conclusion,
              placeholder: obpFinalFields[2].placeholder,
              multiline: true,
              onSave: updateConclusionFieldValue,
            });
          }}
        />

        <ProtocolFieldRow
          label={obpFinalFields[3].label}
          value={draft.recommendations || "Нажмите для ввода"}
          typeLabel="text"
          filled={hasValue(draft.recommendations)}
          onPress={() => {
            openEditor({
              title: obpFinalFields[3].label,
              mode: "text",
              value: draft.recommendations,
              placeholder: obpFinalFields[3].placeholder,
              multiline: true,
              onSave: updateRecommendationsFieldValue,
            });
          }}
        />
      </View></>
      )}
    </View>
  );
}


