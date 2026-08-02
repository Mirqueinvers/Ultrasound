/**
 * Типизированные ключи секций протоколов.
 * Единый источник значений вместо магических строк ("ОБП:печень", "Почки:правая" и т.д.).
 * Значения синхронизированы с `desktopKey` в `src/protocols/catalog.ts`.
 */
export const SECTION_KEYS = {
  // ОБП
  OBP_LIVER: "ОБП:печень",
  OBP_GALLBLADDER: "ОБП:желчный",
  OBP_PANCREAS: "ОБП:поджелудочная",
  OBP_SPLEEN: "ОБП:селезёнка",

  // Почки
  KIDNEY_RIGHT: "Почки:правая",
  KIDNEY_LEFT: "Почки:левая",
  KIDNEY_BLADDER: "Почки:мочевой пузырь",

  // Органы мошонки
  SCROTUM_RIGHT_TESTIS: "Органы мошонки:правое яичко",
  SCROTUM_LEFT_TESTIS: "Органы мошонки:левое яичко",

  // ОМТ (женщины)
  OMT_FEMALE_UTERUS: "ОМТ (Ж):матка",
  OMT_FEMALE_RIGHT_OVARY: "ОМТ (Ж):правый яичник",
  OMT_FEMALE_LEFT_OVARY: "ОМТ (Ж):левый яичник",
  OMT_FEMALE_BLADDER: "ОМТ (Ж):мочевой пузырь",

  // ОМТ (мужчины)
  OMT_MALE_PROSTATE: "ОМТ (М):простата",
  OMT_MALE_BLADDER: "ОМТ (М):мочевой пузырь",

  // Щитовидная железа
  THYROID_RIGHT_LOBE: "Щитовидная железа:правая доля",
  THYROID_LEFT_LOBE: "Щитовидная железа:левая доля",

  // Плевральные полости
  PLEURAL_RIGHT: "Плевральная полость:правая",
  PLEURAL_LEFT: "Плевральная полость:левая",

  // Слюнные железы
  SALIVARY_RIGHT_PAROTID: "Слюнные железы:околоушная правая",
  SALIVARY_LEFT_PAROTID: "Слюнные железы:околоушная левая",
  SALIVARY_RIGHT_SUBMANDIBULAR: "Слюнные железы:подчелюстная правая",
  SALIVARY_LEFT_SUBMANDIBULAR: "Слюнные железы:подчелюстная левая",
  SALIVARY_RIGHT_SUBLINGUAL: "Слюнные железы:подъязычная правая",
  SALIVARY_LEFT_SUBLINGUAL: "Слюнные железы:подъязычная левая",

  // БЦА
  BCA_RIGHT_OSA: "БЦА:ОСА правая",
  BCA_RIGHT_VSA: "БЦА:ВСА правая",
  BCA_RIGHT_NSA: "БЦА:НСА правая",
  BCA_RIGHT_VERTEBRAL: "БЦА:позвоночная правая",
  BCA_RIGHT_SUBCLAVIAN: "БЦА:подключичная правая",
  BCA_LEFT_OSA: "БЦА:ОСА левая",
  BCA_LEFT_VSA: "БЦА:ВСА левая",
  BCA_LEFT_NSA: "БЦА:НСА левая",
  BCA_LEFT_VERTEBRAL: "БЦА:позвоночная левая",
  BCA_LEFT_SUBCLAVIAN: "БЦА:подключичная левая",

  // Вены нижних конечностей
  LEV_RIGHT_FEMORAL: "Вены НК:бедренная правая",
  LEV_LEFT_FEMORAL: "Вены НК:бедренная левая",
  LEV_RIGHT_POPLITEAL: "Вены НК:подколенная правая",
  LEV_LEFT_POPLITEAL: "Вены НК:подколенная левая",
  LEV_RIGHT_TIBIAL: "Вены НК:большеберцовая правая",
  LEV_LEFT_TIBIAL: "Вены НК:большеберцовая левая",
  LEV_RIGHT_PV: "Вены НК:БПВ правая",
  LEV_LEFT_PV: "Вены НК:БПВ левая",
  LEV_RIGHT_MV: "Вены НК:МПВ правая",
  LEV_LEFT_MV: "Вены НК:МПВ левая",

  // Молочные железы
  BREAST_RIGHT: "Молочные железы:правая железа",
  BREAST_LEFT: "Молочные железы:левая железа",

  // Мягкие ткани
  SOFT_TISSUE_MAIN: "Мягкие ткани:основной блок",

  // Лимфатические узлы
  LYMPH_SUBMANDIBULAR: "Лимфатические узлы:Поднижнечелюстные",
  LYMPH_CERVICAL: "Лимфатические узлы:Шейные",
  LYMPH_SUPRACLAVICULAR: "Лимфатические узлы:Подключичные",
  LYMPH_SUBCLAVIAN: "Лимфатические узлы:Надключичные",
  LYMPH_AXILLARY: "Лимфатические узлы:Подмышечные",
  LYMPH_INGUINAL: "Лимфатические узлы:Паховые",
} as const;

export type SectionKeyValue = (typeof SECTION_KEYS)[keyof typeof SECTION_KEYS];

export const PROTOCOL_SECTION_KEY_VALUES: readonly SectionKeyValue[] =
  Object.values(SECTION_KEYS);

export const CONCLUSION_SECTION_KEY = "Заключение" as const;