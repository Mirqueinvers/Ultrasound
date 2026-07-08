import type { FieldEditorOption } from "../../components/FieldEditorModal";

export type { EditorState } from "../../hooks/useFieldEditor";

export const REGION_FIELDS = [
  { key: "submandibular" as const, title: "Поднижнечелюстные" },
  { key: "cervical" as const, title: "Шейные" },
  { key: "subclavian" as const, title: "Подключичные" },
  { key: "supraclavicular" as const, title: "Надключичные" },
  { key: "axillary" as const, title: "Подмышечные" },
  { key: "inguinal" as const, title: "Паховые" },
];

export const DETECTION_OPTIONS: FieldEditorOption[] = [
  { value: "not_detected", label: "Не определяются" },
  { value: "detected", label: "Определяются" },
];

export const LYMPH_NODE_ECHOGENICITY_OPTIONS: FieldEditorOption[] = [
  { value: "изоэхогенный", label: "изоэхогенный" },
  { value: "гипоэхогенный", label: "гипоэхогенный" },
];

export const LYMPH_NODE_ECHOSTRUCTURE_OPTIONS: FieldEditorOption[] = [
  { value: "однородная", label: "однородная" },
  { value: "неоднородная", label: "неоднородная" },
];

export const LYMPH_NODE_SHAPE_OPTIONS: FieldEditorOption[] = [
  { value: "овальная", label: "овальная" },
  { value: "округлая", label: "округлая" },
];

export const LYMPH_NODE_CONTOUR_OPTIONS: FieldEditorOption[] = [
  { value: "ровный четкий", label: "ровный четкий" },
  { value: "нечеткий", label: "нечеткий" },
  { value: "неровный", label: "неровный" },
];

export const LYMPH_NODE_BLOOD_FLOW_OPTIONS: FieldEditorOption[] = [
  { value: "не определяется", label: "не определяется" },
  { value: "сохранен", label: "сохранен" },
];
