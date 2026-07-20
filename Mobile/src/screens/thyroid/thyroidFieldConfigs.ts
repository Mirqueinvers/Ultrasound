import type { FieldEditorOption } from "../../components/FieldEditorModal";
import type { ThyroidNodeDraft } from "../../shared/thyroidDraft";

export type { EditorState } from "../../hooks/useFieldEditor";

export type ConclusionSample = {
  title: string;
  value: string;
};

export const THYROID_ECHOGENICITY_OPTIONS: FieldEditorOption[] = [
  { value: "средняя", label: "Средняя" },
  { value: "повышена", label: "Повышена" },
  { value: "снижена", label: "Снижена" },
];

export const THYROID_ECHOSTRUCTURE_OPTIONS: FieldEditorOption[] = [
  { value: "однородная", label: "Однородная" },
  { value: "неоднородная", label: "Неоднородная" },
];

export const THYROID_CONTOUR_OPTIONS: FieldEditorOption[] = [
  { value: "четкий, ровный", label: "четкий, ровный" },
  { value: "четкий, неровный", label: "четкий, неровный" },
  { value: "нечеткий", label: "нечеткий" },
];

export const THYROID_SYMMETRY_OPTIONS: FieldEditorOption[] = [
  { value: "симметричная", label: "Симметричная" },
  { value: "ассиметричная", label: "Ассиметричная" },
];

export const THYROID_POSITION_OPTIONS: FieldEditorOption[] = [
  { value: "типичное", label: "Типичное" },
  { value: "низкое", label: "Низкое" },
  { value: "загрудинное", label: "Загрудинное" },
  { value: "атипичное", label: "Атипичное" },
];

export const THYROID_VOLUME_FORMATIONS_OPTIONS: FieldEditorOption[] = [
  { value: "не определяются", label: "Не определяются" },
  { value: "определяются", label: "Определяются" },
];

export const THYROID_NODE_ECHOGENICITY_OPTIONS: FieldEditorOption[] = [
  { value: "анэхогенный", label: "анэхогенный" },
  { value: "гиперэхогенный", label: "гиперэхогенный" },
  { value: "изоэхогенный", label: "изоэхогенный" },
  { value: "гипоэхогенный", label: "гипоэхогенный" },
  { value: "выраженно гипоэхогенный", label: "выраженно гипоэхогенный" },
];

export const THYROID_NODE_ECHOSTRUCTURE_OPTIONS: FieldEditorOption[] = [
  { value: "кистозный", label: "кистозный" },
  { value: "спонгиозный", label: "спонгиозный" },
  { value: "кистозно-солидная", label: "кистозно-солидная" },
  { value: "преимущественно солидный", label: "преимущественно солидный" },
  { value: "солидный", label: "солидный" },
];

export const THYROID_NODE_CONTOUR_OPTIONS: FieldEditorOption[] = [
  { value: "четкий ровный", label: "четкий ровный" },
  { value: "не четкий", label: "не четкий" },
  { value: "не ровный", label: "не ровный" },
  { value: "экстра-тиреоидальное распространение", label: "экстра-тиреоидальное распространение" },
];

export const THYROID_NODE_ECHOGENIC_FOCI_OPTIONS: FieldEditorOption[] = [
  { value: "нет", label: "Нет" },
  { value: "артефакт хвоста кометы", label: "Артефакт хвоста кометы" },
  { value: "макрокальцинаты", label: "Макрокальцинаты" },
  { value: "периферические кальцинаты", label: "Периферические кальцинаты" },
  { value: "микрокальцинаты", label: "Микрокальцинаты" },
];

export const THYROID_NODE_ORIENTATION_OPTIONS: FieldEditorOption[] = [
  { value: "горизонтальная", label: "Горизонтальная" },
  { value: "вертикальная", label: "Вертикальная" },
];

export const THYROID_NODE_BLOOD_FLOW_OPTIONS: FieldEditorOption[] = [
  { value: "не изменен", label: "Не изменен" },
  { value: "усилен", label: "Усилен" },
  { value: "обеднен", label: "Обеднен" },
];

export const THYROID_CONCLUSION_SAMPLES: ConclusionSample[] = [
  { title: "Норма", value: "УЗ-признаков патологии щитовидной железы не выявлено." },
  { title: "Диффузные изменения", value: "Эхографические признаки диффузных изменений щитовидной железы." },
  { title: "Узловое образование", value: "Эхографические признаки узлового(ых) образования(й) щитовидной железы." },
  { title: "Аутоиммунный тиреоидит", value: "Эхографические признаки аутоиммунного тиреоидита." },
];

export const ECHOGENICITY_POINTS: Record<string, number> = {
  "анэхогенный": 0,
  "гиперэхогенный": 1,
  "изоэхогенный": 1,
  "гипоэхогенный": 2,
  "выраженно гипоэхогенный": 3,
};

export const ECHOSTRUCTURE_POINTS: Record<string, number> = {
  "кистозный": 0,
  "спонгиозный": 0,
  "кистозно-солидная": 1,
  "преимущественно солидный": 2,
  "солидный": 2,
};

export const CONTOUR_POINTS: Record<string, number> = {
  "четкий ровный": 0,
  "не четкий": 0,
  "не ровный": 2,
  "экстра-тиреоидальное распространение": 3,
};

export const ECHOGENIC_FOCI_POINTS: Record<string, number> = {
  "нет": 0,
  "артефакт хвоста кометы": 0,
  "макрокальцинаты": 1,
  "периферические кальцинаты": 2,
  "микрокальцинаты": 3,
};

export const ORIENTATION_POINTS: Record<string, number> = {
  "горизонтальная": 0,
  "вертикальная": 3,
};

export const THYROID_SECTION_IDS = {
  rightLobe: "thyroid.right_lobe",
  leftLobe: "thyroid.left_lobe",
  commonIndicators: "thyroid.common_indicators",
  conclusion: "thyroid.conclusion",
} as const;

export function resolveActiveThyroidSection(activeSectionId: string | null | undefined) {
  if (!activeSectionId) return null;
  switch (activeSectionId) {
    case THYROID_SECTION_IDS.rightLobe: return THYROID_SECTION_IDS.rightLobe;
    case THYROID_SECTION_IDS.leftLobe: return THYROID_SECTION_IDS.leftLobe;
    case THYROID_SECTION_IDS.commonIndicators: return THYROID_SECTION_IDS.commonIndicators;
    case THYROID_SECTION_IDS.conclusion: return THYROID_SECTION_IDS.conclusion;
    default: return THYROID_SECTION_IDS.rightLobe;
  }
}

export function computeVolume(length: string, width: string, depth: string): string {
  const l = parseFloat(length);
  const w = parseFloat(width);
  const d = parseFloat(depth);

  if ([l, w, d].some((part) => Number.isNaN(part) || part <= 0)) {
    return "";
  }

  return ((l * w * d * 0.479) / 1000).toFixed(2);
}

export function getTiradsCategory(points: number): string {
  if (points <= 1) return "2";
  if (points <= 3) return "3";
  if (points <= 5) return "4";
  return "5";
}

export function computeNodeTiradsCategory(node: ThyroidNodeDraft): string {
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
