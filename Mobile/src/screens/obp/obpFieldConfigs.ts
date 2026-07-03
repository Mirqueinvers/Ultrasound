import type { FieldEditorOption } from "../../components/FieldEditorModal";
import type {
  GallbladderConcretionDraft,
  GallbladderDraft,
  GallbladderPolypDraft,
  LiverDraft,
  PancreasDraft,
  SpleenDraft,
} from "../../shared/obpDraft";

// ---- Типы field spec ----

export type LiverFieldSpec = {
  key: keyof LiverDraft;
  label: string;
  kind: "number" | "select" | "text";
  placeholder?: string;
  multiline?: boolean;
  options?: FieldEditorOption[];
  visibilityGroup?: string;
};

export type GallbladderFieldKey = Exclude<
  keyof GallbladderDraft,
  "concretionsList" | "polypsList"
>;

export type GallbladderFieldSpec = {
  key: GallbladderFieldKey;
  label: string;
  kind: "number" | "select" | "text";
  placeholder?: string;
  multiline?: boolean;
  options?: FieldEditorOption[];
  hiddenWhenCholecystectomy?: boolean;
  visibilityGroup?: string;
};

export type GallbladderConcretionFieldSpec = {
  key: keyof GallbladderConcretionDraft;
  label: string;
  kind: "number" | "select" | "text";
  placeholder?: string;
  options?: FieldEditorOption[];
};

export type GallbladderPolypFieldSpec = {
  key: keyof GallbladderPolypDraft;
  label: string;
  kind: "number" | "select" | "text";
  placeholder?: string;
  options?: FieldEditorOption[];
};

export type PancreasFieldSpec = {
  key: keyof PancreasDraft;
  label: string;
  kind: "number" | "select" | "text";
  placeholder?: string;
  multiline?: boolean;
  options?: FieldEditorOption[];
  visibilityGroup?: string;
};

export type SpleenFieldSpec = {
  key: keyof SpleenDraft;
  label: string;
  kind: "number" | "select" | "text";
  placeholder?: string;
  multiline?: boolean;
  options?: FieldEditorOption[];
  visibilityGroup?: string;
};

export type ObpFinalFieldSpec = {
  key: "freeFluid" | "freeFluidDetails" | "conclusion" | "recommendations";
  label: string;
  kind: "select" | "text";
  placeholder?: string;
  multiline?: boolean;
  options?: FieldEditorOption[];
  visibilityGroup?: string;
};

// ---- Опции ----

export const ECHOGENICITY_OPTIONS: FieldEditorOption[] = [
  { value: "средняя", label: "Средняя" },
  { value: "повышена", label: "Повышена" },
  { value: "снижена", label: "Снижена" },
];

export const HOMOGENEITY_OPTIONS: FieldEditorOption[] = [
  { value: "однородная", label: "Однородная" },
  { value: "неоднородная", label: "Неоднородная" },
  { value: "диффузно-неоднородная", label: "Диффузно-неоднородная" },
];

export const CONTOURS_OPTIONS: FieldEditorOption[] = [
  { value: "четкий, ровный", label: "четкий, ровный" },
  { value: "четкий, неровный", label: "четкий, неровный" },
  { value: "бугристый", label: "бугристый" },
];

export const LOWER_EDGE_OPTIONS: FieldEditorOption[] = [
  { value: "заострён", label: "заострён" },
  { value: "закруглён", label: "закруглён" },
];

export const FOCAL_OPTIONS: FieldEditorOption[] = [
  { value: "не определяются", label: "Не определяются" },
  { value: "определяются", label: "Определяются" },
];

export const VASCULAR_OPTIONS: FieldEditorOption[] = [
  { value: "не изменен", label: "Не изменен" },
  { value: "обеднен", label: "Обеднен" },
  { value: "усилен", label: "Усилен" },
];

export const GALLBLADDER_POSITION_OPTIONS: FieldEditorOption[] = [
  { value: "обычное", label: "Обычное" },
  { value: "холецистэктомия", label: "Холецистэктомия" },
];

export const GALLBLADDER_SHAPE_OPTIONS: FieldEditorOption[] = [
  { value: "Правильная", label: "Правильная" },
  { value: "S-образная", label: "S-образная" },
  { value: "С загибом", label: "С загибом" },
];

export const GALLBLADDER_CONSTRICTION_OPTIONS: FieldEditorOption[] = [
  { value: "шейки", label: "Шейка" },
  { value: "тела", label: "Тело" },
  { value: "дна", label: "Дно" },
];

export const GALLBLADDER_CONTENT_OPTIONS: FieldEditorOption[] = [
  { value: "Однородное", label: "Однородное" },
  { value: "Взвесь", label: "Взвесь" },
  { value: "Сладж", label: "Сладж" },
];

export const GALLBLADDER_YES_NO_OPTIONS: FieldEditorOption[] = [
  { value: "Не определяются", label: "Не определяются" },
  { value: "Определяются", label: "Определяются" },
];

export const GALLBLADDER_CONCRETION_POSITION_OPTIONS: FieldEditorOption[] = [
  { value: "шейки", label: "Шейка" },
  { value: "тела", label: "Тело" },
  { value: "дна", label: "Дно" },
];

export const GALLBLADDER_POLYP_POSITION_OPTIONS: FieldEditorOption[] = [
  { value: "шейке", label: "Шейка" },
  { value: "теле", label: "Тело" },
  { value: "дне", label: "Дно" },
];

export const GALLBLADDER_POLYP_WALL_OPTIONS: FieldEditorOption[] = [
  { value: "по передней", label: "Передняя" },
  { value: "по задней", label: "Задняя" },
];

export const PANCREAS_ECHOGENICITY_OPTIONS: FieldEditorOption[] = [
  { value: "средняя", label: "Средняя" },
  { value: "повышена", label: "Повышена" },
  { value: "снижена", label: "Снижена" },
];

export const PANCREAS_ECHOSTRUCTURE_OPTIONS: FieldEditorOption[] = [
  { value: "однородная", label: "Однородная" },
  { value: "неоднородная", label: "Неоднородная" },
  { value: "диффузно-неоднородная", label: "Диффузно-неоднородная" },
];

export const PANCREAS_CONTOUR_OPTIONS: FieldEditorOption[] = [
  { value: "чёткий, ровный", label: "Чёткий, ровный" },
  { value: "чёткий, не ровный", label: "Чёткий, не ровный" },
  { value: "не чёткий", label: "Не чёткий" },
  { value: "бугристый", label: "Бугристый" },
];

export const YES_NO_OPTIONS: FieldEditorOption[] = [
  { value: "не определяются", label: "Не определяются" },
  { value: "определяются", label: "Определяются" },
];

export const SPLEEN_POSITION_OPTIONS: FieldEditorOption[] = [
  { value: "обычное", label: "Обычное" },
  { value: "спленэктомия", label: "Спленэктомия" },
];

export const SPLEEN_ECHOGENICITY_OPTIONS: FieldEditorOption[] = [
  { value: "средняя", label: "Средняя" },
  { value: "повышена", label: "Повышена" },
  { value: "снижена", label: "Снижена" },
];

export const SPLEEN_ECHOSTRUCTURE_OPTIONS: FieldEditorOption[] = [
  { value: "однородная", label: "Однородная" },
  { value: "неоднородная", label: "Неоднородная" },
  { value: "диффузно-неоднородная", label: "Диффузно-неоднородная" },
];

export const SPLEEN_CONTOUR_OPTIONS: FieldEditorOption[] = [
  { value: "ровные", label: "четкий, ровный" },
  { value: "неровные", label: "четкий, неровный" },
  { value: "бугристые", label: "бугристый" },
];

export const OBP_FREE_FLUID_OPTIONS: FieldEditorOption[] = [
  { value: "не определяется", label: "Не определяется" },
  { value: "определяется", label: "Определяется" },
];

// ---- Field specs ----

export const LIVER_FIELDS: LiverFieldSpec[] = [
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

export const GALLBLADDER_FIELDS: GallbladderFieldSpec[] = [
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

export const GALLBLADDER_CONCRETION_FIELDS: GallbladderConcretionFieldSpec[] = [
  { key: "size", label: "Размер", kind: "number", placeholder: "мм" },
  { key: "position", label: "Положение", kind: "select", options: GALLBLADDER_CONCRETION_POSITION_OPTIONS },
];

export const GALLBLADDER_POLYP_FIELDS: GallbladderPolypFieldSpec[] = [
  { key: "size", label: "Размер", kind: "number", placeholder: "мм" },
  { key: "position", label: "Положение", kind: "select", options: GALLBLADDER_POLYP_POSITION_OPTIONS },
  { key: "wall", label: "Стенка", kind: "select", options: GALLBLADDER_POLYP_WALL_OPTIONS },
];

export const PANCREAS_FIELDS: PancreasFieldSpec[] = [
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

export const SPLEEN_FIELDS: SpleenFieldSpec[] = [
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

export const OBP_FINAL_FIELDS: ObpFinalFieldSpec[] = [
  { key: "freeFluid", label: "Свободная жидкость в брюшной полости", kind: "select", options: OBP_FREE_FLUID_OPTIONS, visibilityGroup: "obp.final.freeFluid" },
  { key: "freeFluidDetails", label: "Описание свободной жидкости", kind: "text", placeholder: "Введите описание", multiline: true, visibilityGroup: "obp.final.freeFluid" },
  { key: "conclusion", label: "Заключение ОБП", kind: "text", placeholder: "Введите общее заключение", multiline: true, visibilityGroup: "obp.final.conclusion" },
  { key: "recommendations", label: "Рекомендации", kind: "text", placeholder: "Введите рекомендации", multiline: true, visibilityGroup: "obp.final.conclusion" },
];

// ---- Константы ----

export const OBP_SECTION_IDS = {
  liver: "obp.liver",
  gallbladder: "obp.gallbladder",
  pancreas: "obp.pancreas",
  spleen: "obp.spleen",
  conclusion: "obp.conclusion",
} as const;

export const OBP_CONCLUSION_SAMPLES: Array<{ title: string; value: string }> = [
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