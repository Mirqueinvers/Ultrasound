import type { FieldEditorOption } from "../../components/FieldEditorModal";

export type EditorState = {
  title: string;
  mode: "number" | "select" | "text";
  value: string;
  placeholder?: string;
  multiline?: boolean;
  options?: FieldEditorOption[];
  onSave: (value: string) => void;
} | null;

export type ConclusionSample = { title: string; value: string };

export const UTERUS_STATUS_OPTIONS: FieldEditorOption[] = [
  { value: "обычное", label: "Обычное" },
  { value: "субтотальная гистерэктомия", label: "Субтотальная гистерэктомия" },
  { value: "тотальная гистерэктомия", label: "Тотальная гистерэктомия" },
  { value: "гистеросальпингоовариэктомия", label: "Гистеросальпингоовариэктомия" },
  { value: "радикальная гистерэктомия", label: "Радикальная гистерэктомия" },
];

export const UTERUS_STUDY_TYPE_OPTIONS: FieldEditorOption[] = [
  { value: "трансабдоминальное", label: "Трансабдоминальное" },
  { value: "трансвагинальное", label: "Трансвагинальное" },
];

export const MENOPAUSE_OPTIONS: FieldEditorOption[] = [
  { value: "пременопауза", label: "Пременопауза" },
  { value: "менопауза", label: "Менопауза" },
  { value: "постменопауза", label: "Постменопауза" },
];

export const UTERUS_SHAPE_OPTIONS: FieldEditorOption[] = [
  { value: "грушевидная", label: "Грушевидная" },
  { value: "округлая", label: "Округлая" },
];

export const UTERUS_POSITION_OPTIONS: FieldEditorOption[] = [
  { value: "антефлексио", label: "Антефлексио" },
  { value: "ретрофлексио", label: "Ретрофлексио" },
  { value: "антеверзия", label: "Антеверзия" },
  { value: "ретроверзия", label: "Ретроверзия" },
];

export const UTERUS_STRUCTURE_OPTIONS: FieldEditorOption[] = [
  { value: "однородная", label: "Однородная" },
  { value: "неоднородная", label: "Неоднородная" },
];

export const UTERUS_ECHOGENICITY_OPTIONS: FieldEditorOption[] = [
  { value: "средняя", label: "Средняя" },
  { value: "повышена", label: "Повышена" },
  { value: "понижена", label: "Понижена" },
];

export const YES_NO_OPTIONS: FieldEditorOption[] = [
  { value: "не определяются", label: "Не определяются" },
  { value: "определяются", label: "Определяются" },
];

export const UTERINE_CAVITY_OPTIONS: FieldEditorOption[] = [
  { value: "не расширена", label: "Не расширена" },
  { value: "расширена", label: "Расширена" },
];

export const ENDOMETRIUM_STRUCTURE_OPTIONS: FieldEditorOption[] = [
  { value: "однородная", label: "Однородная" },
  { value: "неоднородная", label: "Неоднородная" },
  { value: "диффузно-неоднородная", label: "Диффузно-неоднородная" },
];

export const CERVIX_ECHOSTRUCTURE_OPTIONS: FieldEditorOption[] = [
  { value: "однородная", label: "Однородная" },
  { value: "неоднородная", label: "Неоднородная" },
];

export const CERVICAL_CANAL_OPTIONS: FieldEditorOption[] = [
  { value: "сомкнут", label: "Сомкнут" },
  { value: "расширен", label: "Расширен" },
];

export const FREE_FLUID_OPTIONS: FieldEditorOption[] = [
  { value: "не определяется", label: "Не определяется" },
  { value: "определяется", label: "Определяется" },
];

export const OVARY_POSITION_OPTIONS: FieldEditorOption[] = [
  { value: "обычное", label: "Обычное" },
  { value: "не визуализируется", label: "Не визуализируется" },
];

export const OVARY_SHAPE_OPTIONS: FieldEditorOption[] = [
  { value: "овальная", label: "Овальная" },
  { value: "округлая", label: "Округлая" },
  { value: "неправильная", label: "Неправильная" },
];

export const OVARY_CONTOUR_OPTIONS: FieldEditorOption[] = [
  { value: "чёткий ровный", label: "Чёткий ровный" },
  { value: "чёткий не ровный", label: "Чёткий не ровный" },
  { value: "нечёткий", label: "Нечёткий" },
];

export const BLADDER_RESIDUAL_OPTIONS: FieldEditorOption[] = [
  { value: "не определяется", label: "Не определяется" },
  { value: "определяется", label: "Определяется" },
];

export const BLADDER_CONTENT_OPTIONS: FieldEditorOption[] = [
  { value: "однородное", label: "Однородное" },
  { value: "неоднородное", label: "Неоднородное" },
];

export const OMT_FEMALE_CONCLUSION_SAMPLES: ConclusionSample[] = [
  { title: "Норма", value: "УЗ-признаков патологии органов малого таза не выявлено." },
  { title: "Миома матки", value: "Эхографические признаки миомы(миом) матки." },
  { title: "Киста правого яичника", value: "Эхографические признаки кисты правого яичника." },
  { title: "Киста левого яичника", value: "Эхографические признаки кисты левого яичника." },
  { title: "Эндометриоз", value: "Эхографические признаки эндометриоза." },
];

export const OMT_FEMALE_SECTION_IDS = {
  uterus: "omt_female.uterus",
  rightOvary: "omt_female.right_ovary",
  leftOvary: "omt_female.left_ovary",
  bladder: "omt_female.bladder",
  conclusion: "omt_female.conclusion",
} as const;

export function resolveActiveOmtFemaleSection(activeSectionId: string | null | undefined) {
  if (!activeSectionId) return null;
  switch (activeSectionId) {
    case OMT_FEMALE_SECTION_IDS.uterus: return OMT_FEMALE_SECTION_IDS.uterus;
    case OMT_FEMALE_SECTION_IDS.rightOvary: return OMT_FEMALE_SECTION_IDS.rightOvary;
    case OMT_FEMALE_SECTION_IDS.leftOvary: return OMT_FEMALE_SECTION_IDS.leftOvary;
    case OMT_FEMALE_SECTION_IDS.bladder: return OMT_FEMALE_SECTION_IDS.bladder;
    case OMT_FEMALE_SECTION_IDS.conclusion: return OMT_FEMALE_SECTION_IDS.conclusion;
    default: return OMT_FEMALE_SECTION_IDS.uterus;
  }
}

export function splitPairSize(value: string): [string, string] {
  const [first = "", second = ""] = value.split("x");
  return [first, second];
}

export function joinPairSize(first: string, second: string): string {
  return `${first}${second ? `x${second}` : ""}`;
}

export function formatDateDisplay(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return `${isoMatch[3]}.${isoMatch[2]}.${isoMatch[1]}`;
  const dotMatch = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dotMatch) return trimmed;
  return trimmed;
}

export function parseDateInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length !== 8) return value.trim();
  return `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
}

export function getDateEditorValue(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return `${isoMatch[3]}${isoMatch[2]}${isoMatch[1]}`;
  return trimmed.replace(/\D/g, "").slice(0, 8);
}

export function computeCycleDay(dateValue: string): string {
  if (!dateValue.trim()) return "";
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return "";
  const diffDays = Math.ceil((Date.now() - parsed.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? String(diffDays) : "";
}

export function ensurePeriod(text: string): string {
  return text.endsWith(".") ? text : `${text}.`;
}

export function computeVolume(length: string, width: string, ap: string): string {
  const l = parseFloat(length);
  const w = parseFloat(width);
  const a = parseFloat(ap);
  if ([l, w, a].some((p) => Number.isNaN(p) || p <= 0)) return "";
  return ((l * w * a * 0.523) / 1000).toFixed(1);
}
