/**
 * VisibilityGroupId — идентификатор группы полей, которую можно скрыть в UI.
 * Каждый протокол имеет свои группы.
 * Группы выделены по логическим секциям (Размеры, Структура, Сосуды и т.д.)
 */

// ===== OBP =====
export const OBP_VISIBILITY_GROUPS = {
  "obp.liver.sizes": "Печень: Размеры",
  "obp.liver.structure": "Печень: Структура",
  "obp.liver.vessels": "Печень: Сосуды",
  "obp.liver.focal": "Печень: Очаговые образования",
  "obp.liver.additional": "Печень: Дополнительно",
  "obp.gallbladder.position": "ЖП: Положение",
  "obp.gallbladder.sizes": "ЖП: Размеры",
  "obp.gallbladder.shape": "ЖП: Форма",
  "obp.gallbladder.content": "ЖП: Содержимое",
  "obp.gallbladder.ducts": "ЖП: Протоки",
  "obp.gallbladder.additional": "ЖП: Дополнительно",
  "obp.pancreas.sizes": "ПЖ: Размеры",
  "obp.pancreas.structure": "ПЖ: Структура",
  "obp.pancreas.duct": "ПЖ: Проток",
  "obp.pancreas.additional": "ПЖ: Дополнительно",
  "obp.spleen.sizes": "Селезёнка: Размеры",
  "obp.spleen.structure": "Селезёнка: Структура",
  "obp.spleen.vessels": "Селезёнка: Сосуды",
  "obp.spleen.additional": "Селезёнка: Дополнительно",
  "obp.final.freeFluid": "Свободная жидкость",
  "obp.final.conclusion": "Заключение / Рекомендации",
} as const;

// ===== Kidneys =====
export const KIDNEYS_VISIBILITY_GROUPS = {
  "kidneys.position": "Положение",
  "kidneys.sizes": "Размеры",
  "kidneys.contour": "Контур",
  "kidneys.parenchyma": "Паренхима",
  "kidneys.parenchyma.concrements": "Паренхима: Конкременты",
  "kidneys.parenchyma.cysts": "Паренхима: Кисты",
  "kidneys.parenchyma.pathology": "Паренхима: Патология",
  "kidneys.pcs": "ЧЛС",
  "kidneys.pcs.microliths": "ЧЛС: Микролиты",
  "kidneys.pcs.concrements": "ЧЛС: Конкременты",
  "kidneys.pcs.cysts": "ЧЛС: Кисты",
  "kidneys.pcs.pathology": "ЧЛС: Патология",
  "kidneys.sinus": "Почечный синус",
  "kidneys.adrenal": "Область надпочечников",
  "kidneys.additional": "Почки: Дополнительно",
  "kidneys.bladder.sizes": "МП: Размеры",
  "kidneys.bladder.wall": "МП: Стенка",
  "kidneys.bladder.residual": "МП: Остаточная моча",
  "kidneys.bladder.contents": "МП: Содержимое",
  "kidneys.bladder.additional": "МП: Дополнительно",
  "kidneys.conclusion": "Заключение / Рекомендации",
} as const;

// ===== Scrotum =====
export const SCROTUM_VISIBILITY_GROUPS = {
  "scrotum.sizes": "Размеры",
  "scrotum.position": "Положение",
  "scrotum.contour": "Контур",
  "scrotum.capsule": "Капсула",
  "scrotum.echogenicity": "Эхогенность / Структура",
  "scrotum.mediastinum": "Средостение",
  "scrotum.bloodFlow": "Кровоток",
  "scrotum.appendage": "Придаток",
  "scrotum.fluid": "Жидкость",
  "scrotum.additional": "Дополнительно",
  "scrotum.conclusion": "Заключение / Рекомендации",
} as const;

// ===== OMT Female =====
export const OMTFEMALE_VISIBILITY_GROUPS = {
  "omt_female.uterus.sizes": "Матка: Размеры",
  "omt_female.uterus.position": "Матка: Положение",
  "omt_female.uterus.contour": "Матка: Контур",
  "omt_female.uterus.myometrium": "Матка: Миометрий",
  "omt_female.uterus.endometrium": "Матка: Эндометрий",
  "omt_female.uterus.cervix": "Матка: Шейка",
  "omt_female.uterus.additional": "Матка: Дополнительно",
  "omt_female.rightOvary": "Правый яичник",
  "omt_female.leftOvary": "Левый яичник",
  "omt_female.additional": "Дополнительно",
  "omt_female.conclusion": "Заключение / Рекомендации",
} as const;

// ===== OMT Male =====
export const OMTMALE_VISIBILITY_GROUPS = {
  "omt_male.prostate.sizes": "Простата: Размеры",
  "omt_male.prostate.contour": "Простата: Контур",
  "omt_male.prostate.echogenicity": "Простата: Эхогенность",
  "omt_male.prostate.additional": "Простата: Дополнительно",
  "omt_male.seminalVesicles": "Семенные пузырьки",
  "omt_male.additional": "Дополнительно",
  "omt_male.conclusion": "Заключение / Рекомендации",
} as const;

// ===== Thyroid =====
export const THYROID_VISIBILITY_GROUPS = {
  "thyroid.lobe.sizes": "Размеры долей",
  "thyroid.isthmus": "Перешеек",
  "thyroid.echogenicity": "Эхогенность",
  "thyroid.bloodFlow": "Кровоток",
  "thyroid.lymphNodes": "Лимфоузлы",
  "thyroid.additional": "Дополнительно",
  "thyroid.conclusion": "Заключение / Рекомендации",
} as const;

// ===== Breast =====
export const BREAST_VISIBILITY_GROUPS = {
  "breast.right.skin": "Правая: Кожа / ПЖК",
  "breast.right.parenchyma": "Правая: Паренхима",
  "breast.right.retromammary": "Правая: Ретромаммарное",
  "breast.right.lymphNodes": "Правая: Лимфоузлы",
  "breast.right.patology": "Правая: Патология",
  "breast.right.additional": "Правая: Дополнительно",
  "breast.left.skin": "Левая: Кожа / ПЖК",
  "breast.left.parenchyma": "Левая: Паренхима",
  "breast.left.retromammary": "Левая: Ретромаммарное",
  "breast.left.lymphNodes": "Левая: Лимфоузлы",
  "breast.left.patology": "Левая: Патология",
  "breast.left.additional": "Левая: Дополнительно",
  "breast.conclusion": "Заключение / Рекомендации",
} as const;

// ===== Lymph Nodes =====
export const LYMPH_VISIBILITY_GROUPS = {
  "lymph_nodes.sizes": "Размеры",
  "lymph_nodes.shape": "Форма",
  "lymph_nodes.contour": "Контур",
  "lymph_nodes.echogenicity": "Эхогенность / Структура",
  "lymph_nodes.bloodFlow": "Кровоток",
  "lymph_nodes.additional": "Дополнительно",
  "lymph_nodes.conclusion": "Заключение / Рекомендации",
} as const;

/** Все группы видимости для всех протоколов (объединение) */
export const ALL_VISIBILITY_GROUPS = {
  ...OBP_VISIBILITY_GROUPS,
  ...KIDNEYS_VISIBILITY_GROUPS,
  ...SCROTUM_VISIBILITY_GROUPS,
  ...OMTFEMALE_VISIBILITY_GROUPS,
  ...OMTMALE_VISIBILITY_GROUPS,
  ...THYROID_VISIBILITY_GROUPS,
  ...BREAST_VISIBILITY_GROUPS,
  ...LYMPH_VISIBILITY_GROUPS,
} as const;

/** Тип — ключ группы видимости */
export type VisibilityGroupId = keyof typeof ALL_VISIBILITY_GROUPS;

/** Настройки видимости — Record<VisibilityGroupId, boolean> (true = видно) */
export type FieldVisibility = Record<VisibilityGroupId, boolean>;

/** Создаёт дефолтные настройки (все поля видны) */
export function createDefaultFieldVisibility(): FieldVisibility {
  const result = {} as FieldVisibility;
  for (const key of Object.keys(ALL_VISIBILITY_GROUPS) as VisibilityGroupId[]) {
    result[key] = true;
  }
  return result;
}

/** Ключ для AsyncStorage */
export const STORAGE_KEY = "ultrasound-mobile:field-visibility";

/** Группирует VisibilityGroupId по протоколам для UI */
export const VISIBILITY_GROUPS_BY_PROTOCOL: Record<string, Record<string, string>> = {
  obp: OBP_VISIBILITY_GROUPS,
  kidneys: KIDNEYS_VISIBILITY_GROUPS,
  scrotum: SCROTUM_VISIBILITY_GROUPS,
  omt_female: OMTFEMALE_VISIBILITY_GROUPS,
  omt_male: OMTMALE_VISIBILITY_GROUPS,
  thyroid: THYROID_VISIBILITY_GROUPS,
  breast: BREAST_VISIBILITY_GROUPS,
  lymph_nodes: LYMPH_VISIBILITY_GROUPS,
};