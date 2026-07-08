import type { FieldEditorOption } from "../../components/FieldEditorModal";
import type { BreastStudyDraft } from "../../shared/breastDraft";

export type { EditorState } from "../../hooks/useFieldEditor";

export type BreastUpdateStudy = (updater: (current: BreastStudyDraft) => BreastStudyDraft) => void;

// ---- Section IDs ----

export const BREAST_SECTION_IDS = {
  right: "breast.right",
  left: "breast.left",
  commonInfo: "breast.common_info",
  conclusion: "breast.conclusion",
} as const;

export function resolveActiveBreastSection(activeSectionId: string | null | undefined) {
  if (!activeSectionId) return null;
  switch (activeSectionId) {
    case BREAST_SECTION_IDS.right: return BREAST_SECTION_IDS.right;
    case BREAST_SECTION_IDS.left: return BREAST_SECTION_IDS.left;
    case BREAST_SECTION_IDS.commonInfo: return BREAST_SECTION_IDS.commonInfo;
    case BREAST_SECTION_IDS.conclusion: return BREAST_SECTION_IDS.conclusion;
    default: return BREAST_SECTION_IDS.right;
  }
}

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

export {
  formatDateInput,
  parseDateInput,
  getDateEditorValue,
  computeCycleDay,
} from "../../utils/dateUtils";
