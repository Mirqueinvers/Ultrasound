import type { FieldEditorOption } from "../../components/FieldEditorModal";

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

export const LOCATION_OPTIONS: FieldEditorOption[] = [
  { value: "в мошонке", label: "в мошонке" },
  { value: "не в мошонке", label: "не в мошонке" },
];

export const CONTOUR_OPTIONS: FieldEditorOption[] = [
  { value: "четкий ровный", label: "четкий ровный" },
  { value: "четкий неровный", label: "четкий неровный" },
  { value: "нечеткий", label: "нечеткий" },
];

export const CAPSULE_OPTIONS: FieldEditorOption[] = [
  { value: "не изменена", label: "не изменена" },
  { value: "изменена", label: "изменена" },
];

export const ECHOGENICITY_OPTIONS: FieldEditorOption[] = [
  { value: "средняя", label: "средняя" },
  { value: "повышена", label: "повышена" },
  { value: "понижена", label: "понижена" },
];

export const ECHOTEXTURE_OPTIONS: FieldEditorOption[] = [
  { value: "однородная", label: "однородная" },
  { value: "неоднородная", label: "неоднородная" },
  { value: "диффузно-неоднородная", label: "диффузно-неоднородная" },
];

export const MEDIASTINUM_OPTIONS: FieldEditorOption[] = [
  { value: "не изменена", label: "не изменена" },
  { value: "изменена", label: "изменена" },
];

export const BLOOD_FLOW_OPTIONS: FieldEditorOption[] = [
  { value: "не изменен", label: "не изменен" },
  { value: "усилен", label: "усилен" },
  { value: "ослаблен", label: "ослаблен" },
];

export const APPENDAGE_OPTIONS: FieldEditorOption[] = [
  { value: "не изменен", label: "не изменен" },
  { value: "изменен", label: "изменен" },
];

export const FLUID_AMOUNT_OPTIONS: FieldEditorOption[] = [
  { value: "не изменено", label: "не изменено" },
  { value: "увеличено", label: "увеличено" },
];

export const CONCLUSION_SAMPLES: ConclusionSample[] = [
  {
    title: "Норма",
    value: "УЗ-признаков патологии органов мошонки не выявлено.",
  },
  {
    title: "Варикоцеле",
    value: "Эхографические признаки варикоцеле.",
  },
  {
    title: "Гидроцеле",
    value: "Эхографические признаки гидроцеле.",
  },
];

export function computeVolume(length: string, width: string, depth: string): string {
  const l = parseFloat(length);
  const w = parseFloat(width);
  const d = parseFloat(depth);

  if ([l, w, d].some((part) => Number.isNaN(part) || part <= 0)) {
    return "";
  }

  return ((l * w * d * 0.523) / 1000).toFixed(2);
}
