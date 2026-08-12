/**
 * Типизированные ключи исследований (studyKey) — уникальные значения уровня
 * протокола, используемые как ключи в `studiesData`, `setStudyData` и
 * реестре исследований (`desktopResearchRegistry`).
 *
 * Значения синхронизированы с `ProtocolSelectionLabel` в `protocols/catalog.ts`
 * и `studyKey` в `researches/desktopResearchRegistry.ts`.
 */
export const STUDY_KEYS = {
  OBP: "ОБП",
  KIDNEYS: "Почки",
  SCROTUM: "Органы мошонки",
  OMT_FEMALE: "ОМТ (Ж)",
  OMT_MALE: "ОМТ (М)",
  THYROID: "Щитовидная железа",
  SALIVARY_GLANDS: "Слюнные железы",
  BCA: "БЦА",
  LOWER_EXTREMITY_VEINS: "УВНК",
  PLEURAL: "Плевральные полости",
  BREAST: "Молочные железы",

  /** Основной ключ лимфоузлов по реестру (`desktopResearchRegistry`). */
  LYMPH_NODES: "Лимфоузлы",
  /** Legacy-алиас, читается в print-слое для обратной совместимости. */
  LYMPH_NODES_ALT: "Лимфатические узлы",

  CHILD_DISPENSARY: "Детская диспансеризация",
  SOFT_TISSUE: "Мягких тканей",
  URINARY_BLADDER: "Мочевой пузырь",
} as const;

export type StudyKey = (typeof STUDY_KEYS)[keyof typeof STUDY_KEYS];