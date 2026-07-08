import type { FieldEditorOption } from "../../components/FieldEditorModal";
import type {
  KidneyDraft,
  UrinaryBladderDraft,
} from "../../shared/kidneyDraft";

export type { EditorState } from "../../hooks/useFieldEditor";

export type KidneyRenderableFieldKey =
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

export type KidneyFieldSpec = {
  key: KidneyRenderableFieldKey;
  label: string;
  kind: "number" | "select" | "text";
  placeholder?: string;
  multiline?: boolean;
  options?: FieldEditorOption[];
  visibilityGroup?: string;
};

export type UrinaryBladderFieldSpec = {
  key: keyof UrinaryBladderDraft;
  label: string;
  kind: "number" | "select" | "text";
  placeholder?: string;
  multiline?: boolean;
  options?: FieldEditorOption[];
  visibilityGroup?: string;
};

// ---- Опции полей ----

export const KIDNEY_CONTOUR_OPTIONS: FieldEditorOption[] = [
  { value: "чёткий ровный", label: "Чёткий ровный" },
  { value: "чёткий неровный", label: "Чёткий неровный" },
  { value: "нечёткий", label: "Нечёткий" },
];

export const KIDNEY_LOCATION_OPTIONS: FieldEditorOption[] = [
  { value: "верхнего полюса", label: "верхний полюс" },
  { value: "нижнего полюса", label: "нижний полюс" },
  { value: "центральной части", label: "в центре" },
];

export const KIDNEY_POSITION_OPTIONS: FieldEditorOption[] = [
  { value: "обычное", label: "Обычное" },
  { value: "опущение", label: "Опущение" },
  { value: "нефроптоз", label: "Нефроптоз" },
  { value: "нефрэктомия", label: "Нефрэктомия" },
];

export const KIDNEY_PARRENCHYMA_ECHOGENICITY_OPTIONS: FieldEditorOption[] = [
  { value: "средняя", label: "Средняя" },
  { value: "повышена", label: "Повышена" },
  { value: "понижена", label: "Понижена" },
];

export const KIDNEY_PARRENCHYMA_STRUCTURE_OPTIONS: FieldEditorOption[] = [
  { value: "однородная", label: "Однородная" },
  { value: "диффузно-неоднородная", label: "Диффузно-неоднородная" },
];

export const KIDNEY_YES_NO_OPTIONS: FieldEditorOption[] = [
  { value: "не определяются", label: "Не определяются" },
  { value: "определяются", label: "Определяются" },
];

export const KIDNEY_ADRENAL_OPTIONS: FieldEditorOption[] = [
  { value: "не изменена", label: "Не изменена" },
  { value: "изменена", label: "Изменена" },
];

export const BLADDER_CONTENT_OPTIONS: FieldEditorOption[] = [
  { value: "однородное", label: "Однородное" },
  { value: "неоднородное", label: "Неоднородное" },
];

export const RESIDUAL_STATUS_OPTIONS: FieldEditorOption[] = [
  { value: "определяется", label: "Определяется" },
  { value: "не определяется", label: "Не определяется" },
];

// ---- Константы ----

export const KIDNEY_SECTION_IDS = {
  right: "kidneys.right",
  left: "kidneys.left",
  bladder: "kidneys.bladder",
  conclusion: "kidneys.conclusion",
} as const;

export const KIDNEY_CONCLUSION_SAMPLES: Array<{ title: string; value: string }> = [
  { title: "Норма", value: "УЗ-признаков патологии почек не выявлено." },
  { title: "МКБ", value: "Эхографические признаки мочекаменной болезни." },
  { title: "Нефролитиаз", value: "Эхографические признаки нефролитиаза." },
  { title: "Пиелонефрит", value: "Эхографические признаки пиелонефрита." },
  { title: "Киста(ы) правой почки", value: "Эхографические признаки кисты(т) правой почки." },
  { title: "Киста(ы) левой почки", value: "Эхографические признаки кисты(т) левой почки." },
  { title: "Гидронефроз", value: "Эхографические признаки гидронефроза." },
];

export const KIDNEY_NUMERIC_FIELDS = new Set<keyof KidneyDraft>([
  "length",
  "width",
  "thickness",
  "parenchymaSize",
  "pcsMicrolithsSize",
]);

export const BLADDER_NUMERIC_FIELDS = new Set<keyof UrinaryBladderDraft>([
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

// ---- Field specs ----

export const kidneyFields: KidneyFieldSpec[] = [
  { key: "position", label: "Положение", kind: "select", options: KIDNEY_POSITION_OPTIONS, visibilityGroup: "kidneys.position" },
  { key: "length", label: "Длина", kind: "number", placeholder: "мм", visibilityGroup: "kidneys.sizes" },
  { key: "width", label: "Ширина", kind: "number", placeholder: "мм", visibilityGroup: "kidneys.sizes" },
  { key: "thickness", label: "Толщина", kind: "number", placeholder: "мм", visibilityGroup: "kidneys.sizes" },
  { key: "contour", label: "Контур почки", kind: "select", options: KIDNEY_CONTOUR_OPTIONS, visibilityGroup: "kidneys.contour" },
  { key: "parenchymaSize", label: "Размер паренхимы", kind: "number", placeholder: "мм", visibilityGroup: "kidneys.parenchyma" },
  { key: "parenchymaEchogenicity", label: "Эхогенность", kind: "select", options: KIDNEY_PARRENCHYMA_ECHOGENICITY_OPTIONS, visibilityGroup: "kidneys.parenchyma" },
  { key: "parenchymaStructure", label: "Структура", kind: "select", options: KIDNEY_PARRENCHYMA_STRUCTURE_OPTIONS, visibilityGroup: "kidneys.parenchyma" },
  { key: "parenchymaConcrements", label: "Конкременты паренхимы", kind: "select", options: KIDNEY_YES_NO_OPTIONS, visibilityGroup: "kidneys.parenchyma.concrements" },
  { key: "parenchymaCysts", label: "Кисты паренхимы", kind: "select", options: KIDNEY_YES_NO_OPTIONS, visibilityGroup: "kidneys.parenchyma.cysts" },
  { key: "parenchymaPathologicalFormations", label: "Патологические образования паренхимы", kind: "select", options: KIDNEY_YES_NO_OPTIONS, visibilityGroup: "kidneys.parenchyma.pathology" },
  {
    key: "pcsSize",
    label: "Размер ЧЛС",
    kind: "select",
    options: [
      { value: "не расширена", label: "Не расширена" },
      { value: "расширена", label: "Расширена" },
    ],
    visibilityGroup: "kidneys.pcs",
  },
  { key: "pcsMicroliths", label: "Микролиты", kind: "select", options: KIDNEY_YES_NO_OPTIONS, visibilityGroup: "kidneys.pcs.microliths" },
  { key: "pcsMicrolithsSize", label: "Размером до", kind: "number", placeholder: "мм", visibilityGroup: "kidneys.pcs.microliths" },
  { key: "pcsConcrements", label: "Конкременты ЧЛС", kind: "select", options: KIDNEY_YES_NO_OPTIONS, visibilityGroup: "kidneys.pcs.concrements" },
  { key: "pcsCysts", label: "Кисты ЧЛС", kind: "select", options: KIDNEY_YES_NO_OPTIONS, visibilityGroup: "kidneys.pcs.cysts" },
  { key: "pcsPathologicalFormations", label: "Патологические образования ЧЛС", kind: "select", options: KIDNEY_YES_NO_OPTIONS, visibilityGroup: "kidneys.pcs.pathology" },
  { key: "sinus", label: "Почечный синус", kind: "select", options: [
    { value: "без включений", label: "Без включений" },
    { value: "с включениями", label: "С включениями" },
  ], visibilityGroup: "kidneys.sinus" },
  { key: "adrenalArea", label: "Область надпочечников", kind: "select", options: KIDNEY_ADRENAL_OPTIONS, visibilityGroup: "kidneys.adrenal" },
  { key: "additional", label: "Дополнительно", kind: "text", placeholder: "Введите дополнительное описание", multiline: true, visibilityGroup: "kidneys.additional" },
];

// ---- Утилиты ----

export function resolveActiveKidneySection(activeSectionId: string | null | undefined) {
  if (!activeSectionId) {
    return null;
  }

  switch (activeSectionId) {
    case KIDNEY_SECTION_IDS.right:
      return KIDNEY_SECTION_IDS.right;
    case KIDNEY_SECTION_IDS.left:
      return KIDNEY_SECTION_IDS.left;
    case KIDNEY_SECTION_IDS.bladder:
      return KIDNEY_SECTION_IDS.bladder;
    case KIDNEY_SECTION_IDS.conclusion:
      return KIDNEY_SECTION_IDS.conclusion;
    default:
      return KIDNEY_SECTION_IDS.right;
  }
}

export { splitPairSize, joinPairSize, formatNumberInput } from "../../utils/stringUtils";
