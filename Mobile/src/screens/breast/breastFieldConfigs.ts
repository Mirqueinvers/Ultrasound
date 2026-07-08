import type { FieldEditorOption } from "../../components/FieldEditorModal";
import type { BreastStudyDraft } from "../../shared/breastDraft";

// ---- Types ----

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

export type BreastUpdateStudy = (updater: (current: BreastStudyDraft) => BreastStudyDraft) => void;

// ---- Section IDs ----

export const BREAST_SECTION_IDS = {
  right: "breast.right",
  left: "breast.left",
  conclusion: "breast.conclusion",
} as const;

// ---- Option arrays ----

export const BREAST_SKIN_OPTIONS: FieldEditorOption[] = [
  { value: "не изменена", label: "Не изменена" },
  { value: "изменена", label: "Изменена" },
];

export const BREAST_NIPPLES_OPTIONS: FieldEditorOption[] = [
  { value: "не изменены", label: "Не изменены" },
  { value: "изменены", label: "Изменены" },
];

export const BREAST_MILK_DUCTS_OPTIONS: FieldEditorOption[] = [
  { value: "не расширены", label: "Не расширены" },
  { value: "расширены", label: "Расширены" },
];

export const BREAST_VOLUME_FORMATIONS_OPTIONS: FieldEditorOption[] = [
  { value: "не определяются", label: "Не определяются" },
  { value: "определяются", label: "Определяются" },
];

export const BREAST_STRUCTURE_OPTIONS: FieldEditorOption[] = [
  { value: "преимущественно жировая ткань", label: "Преимущественно жировая ткань" },
  { value: "преимущественно железистая ткань", label: "Преимущественно железистая ткань" },
  { value: "жировая и железистая", label: "Жировая и железистая" },
  { value: "жировая и фиброзная", label: "Жировая и фиброзная" },
  { value: "жировая железистая и фиброзная", label: "Жировая железистая и фиброзная" },
];

export const BREAST_NODE_ECHOGENICITY_OPTIONS: FieldEditorOption[] = [
  { value: "средняя", label: "Средняя" },
  { value: "повышенная", label: "Повышенная" },
  { value: "пониженная", label: "Пониженная" },
  { value: "анэхогенный", label: "Анэхогенный" },
  { value: "смешанная", label: "Смешанная" },
];

export const BREAST_NODE_ECHOSTRUCTURE_OPTIONS: FieldEditorOption[] = [
  { value: "однородная", label: "Однородная" },
  { value: "неоднородная", label: "Неоднородная" },
];

export const BREAST_NODE_CONTOUR_OPTIONS: FieldEditorOption[] = [
  { value: "четкий ровный", label: "Четкий ровный" },
  { value: "четкий неровный", label: "Четкий неровный" },
  { value: "нечеткий", label: "Нечеткий" },
];

export const BREAST_NODE_ORIENTATION_OPTIONS: FieldEditorOption[] = [
  { value: "горизонтальная", label: "Горизонтальная" },
  { value: "вертикальная", label: "Вертикальная" },
];

export const BREAST_NODE_BLOOD_FLOW_OPTIONS: FieldEditorOption[] = [
  { value: "не изменен", label: "Не изменен" },
  { value: "усилен", label: "Усилен" },
  { value: "усилен периферический", label: "Усилен периферический" },
];

// ---- Date utilities ----

export function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}

export function parseDateInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length !== 8) {
    return value.trim();
  }

  return `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
}

export function getDateEditorValue(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return `${isoMatch[3]}${isoMatch[2]}${isoMatch[1]}`;
  }

  return trimmed.replace(/\D/g, "").slice(0, 8);
}

export function computeCycleDay(dateValue: string): string {
  if (!dateValue.trim()) {
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
