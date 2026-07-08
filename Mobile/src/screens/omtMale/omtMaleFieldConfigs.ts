import type { FieldEditorOption } from "../../components/FieldEditorModal";
import type { UrinaryBladderDraft } from "../../shared/omtFemaleDraft";

export type { EditorState } from "../../hooks/useFieldEditor";

export type ConclusionSample = { title: string; value: string };

export const PROSTATE_STUDY_TYPE_OPTIONS: FieldEditorOption[] = [
  { value: "трансабдоминальное", label: "трансабдоминальное" },
  { value: "трансректальное", label: "трансректальное" },
];

export const PROSTATE_POSITION_OPTIONS: FieldEditorOption[] = [
  { value: "обычное", label: "Обычное" },
  { value: "простатэктомия", label: "Простатэктомия" },
];

export const PROSTATE_CONTOUR_OPTIONS: FieldEditorOption[] = [
  { value: "четкий ровный", label: "четкий ровный" },
  { value: "четкий неровный", label: "четкий неровный" },
  { value: "нечеткий", label: "нечеткий" },
];

export const PROSTATE_SYMMETRY_OPTIONS: FieldEditorOption[] = [
  { value: "сохранена", label: "Сохранена" },
  { value: "ассиметрична", label: "Ассиметрична" },
];

export const PROSTATE_SHAPE_OPTIONS: FieldEditorOption[] = [
  { value: "овальная", label: "Овальная" },
  { value: "треугольная", label: "Треугольная" },
];

export const PROSTATE_ECHOGENICITY_OPTIONS: FieldEditorOption[] = [
  { value: "средняя", label: "Средняя" },
  { value: "повышенная", label: "Повышенная" },
  { value: "пониженная", label: "Пониженная" },
];

export const PROSTATE_ECHOTEXTURE_OPTIONS: FieldEditorOption[] = [
  { value: "однородная", label: "Однородная" },
  { value: "неоднородная", label: "Неоднородная" },
  { value: "диффузно-неоднородная", label: "Диффузно-неоднородная" },
];

export const YES_NO_OPTIONS: FieldEditorOption[] = [
  { value: "не определяются", label: "Не определяются" },
  { value: "определяются", label: "Определяются" },
];

export const PROSTATE_BLAADDER_PROTRUSION_OPTIONS: FieldEditorOption[] = [
  { value: "не выступает", label: "Не выступает" },
  { value: "выступает", label: "Выступает" },
];

export const BLADDER_RESIDUAL_OPTIONS: FieldEditorOption[] = [
  { value: "не определяется", label: "Не определяется" },
  { value: "определяется", label: "Определяется" },
];

export const BLADDER_CONTENT_OPTIONS: FieldEditorOption[] = [
  { value: "однородное", label: "Однородное" },
  { value: "неоднородное", label: "Неоднородное" },
];

export const OMT_MALE_CONCLUSION_SAMPLES: ConclusionSample[] = [
  { title: "Норма", value: "УЗ-признаков патологии предстательной железы не выявлено." },
  { title: "Аденома", value: "Эхографические признаки аденомы предстательной железы." },
  { title: "Хр. простатит", value: "Эхографические признаки хронического простатита." },
];

export const OMT_MALE_SECTION_IDS = {
  prostate: "omt_male.prostate",
  bladder: "omt_male.bladder",
  conclusion: "omt_male.conclusion",
} as const;

export function resolveActiveOmtMaleSection(activeSectionId: string | null | undefined) {
  if (!activeSectionId) return null;
  switch (activeSectionId) {
    case OMT_MALE_SECTION_IDS.prostate: return OMT_MALE_SECTION_IDS.prostate;
    case OMT_MALE_SECTION_IDS.bladder: return OMT_MALE_SECTION_IDS.bladder;
    case OMT_MALE_SECTION_IDS.conclusion: return OMT_MALE_SECTION_IDS.conclusion;
    default: return OMT_MALE_SECTION_IDS.prostate;
  }
}

export function computeProstateVolume(length: string, width: string, ap: string): string {
  const l = parseFloat(length);
  const w = parseFloat(width);
  const a = parseFloat(ap);
  if ([l, w, a].some((p) => Number.isNaN(p) || p <= 0)) return "";
  return ((l * w * a * 0.523) / 1000).toFixed(1);
}
