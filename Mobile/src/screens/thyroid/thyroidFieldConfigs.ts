import type { FieldEditorOption } from "../../components/FieldEditorModal";
import type { ThyroidNodeDraft } from "../../shared/thyroidDraft";

export type EditorState = {
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
  }) => React.ReactNode;
  onSave: (value: string) => void;
} | null;

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
  { value: "средняя", label: "Средняя" },
  { value: "повышенная", label: "Повышенная" },
  { value: "пониженная", label: "Пониженная" },
  { value: "анэхогенный", label: "Анэхогенный" },
  { value: "смешанная", label: "Смешанная" },
];

export const THYROID_NODE_ECHOSTRUCTURE_OPTIONS: FieldEditorOption[] = [
  { value: "однородная", label: "Однородная" },
  { value: "неоднородная", label: "Неоднородная" },
  { value: "кистозно-солидная", label: "Кистозно-солидная" },
  { value: "кистозная", label: "Кистозная" },
  { value: "солидная", label: "Солидная" },
];

export const THYROID_NODE_CONTOUR_OPTIONS: FieldEditorOption[] = [
  { value: "четкий, ровный", label: "Четкий, ровный" },
  { value: "четкий, неровный", label: "Четкий, неровный" },
  { value: "нечеткий, ровный", label: "Нечеткий, ровный" },
  { value: "нечеткий, неровный", label: "Нечеткий, неровный" },
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
  "средняя": 1,
  "пониженная": 2,
  "повышенная": 3,
  "смешанная": 1,
};

export const ECHOSTRUCTURE_POINTS: Record<string, number> = {
  "однородная": 0,
  "неоднородная": 0,
  "кистозно-солидная": 1,
  "кистозная": 0,
  "солидная": 1,
};

export const CONTOUR_POINTS: Record<string, number> = {
  "четкий, ровный": 0,
  "четкий, неровный": 0,
  "нечеткий, ровный": 0,
  "нечеткий, неровный": 3,
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
