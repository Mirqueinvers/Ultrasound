/**
 * Типы для визуального редактора маппинга импорта Medison.
 * Описывают схему полей каждого протокола для выбора в выпадающем списке.
 */

export interface ProtocolField {
  /** Путь к полю внутри структуры исследования, например "liver.rightLobeAP" */
  path: string;
  /** Человекочитаемое название, например "Печень: ПЗР правая доля (мм)" */
  label: string;
  /** Тип значения: "string" | "number" | "date" */
  type: string;
}

export interface StudySchema {
  /** Ключ типа исследования, например "obp", "kidneys" */
  studyType: string;
  /** Название для отображения, например "Органы брюшной полости" */
  label: string;
  /** Доступные поля для маппинга */
  fields: ProtocolField[];
}

/**
 * Все возможные исследования, в которые можно импортировать данные.
 * Вручную синхронизировано с useMedisonImport.ts / medisonTypes.ts.
 */
export const STUDY_SCHEMAS: StudySchema[] = [
  {
    studyType: "obp",
    label: "Органы брюшной полости",
    fields: [
      { path: "liver.rightLobeAP", label: "Печень: ПЗР правая доля (мм)", type: "string" },
      { path: "liver.leftLobeAP", label: "Печень: ПЗР левая доля (мм)", type: "string" },
      { path: "gallbladder.length", label: "ЖП: длина (мм)", type: "string" },
      { path: "gallbladder.width", label: "ЖП: ширина (мм)", type: "string" },
      { path: "gallbladder.wallThickness", label: "ЖП: толщина стенки (мм)", type: "string" },
      { path: "gallbladder.commonBileDuct", label: "ЖП: холедох (мм)", type: "string" },
      { path: "pancreas.head", label: "ПЖЖ: головка (мм)", type: "string" },
      { path: "pancreas.body", label: "ПЖЖ: тело (мм)", type: "string" },
      { path: "pancreas.tail", label: "ПЖЖ: хвост (мм)", type: "string" },
      { path: "spleen.length", label: "Селезёнка: длина (мм)", type: "string" },
      { path: "spleen.width", label: "Селезёнка: ширина (мм)", type: "string" },
      { path: "portalVein.diameter", label: "Воротная вена: диаметр (мм)", type: "string" },
    ],
  },
  {
    studyType: "kidneys",
    label: "Почки",
    fields: [
      { path: "leftKidney.length", label: "Левая почка: длина (мм)", type: "string" },
      { path: "leftKidney.width", label: "Левая почка: ширина (мм)", type: "string" },
      { path: "leftKidney.parenchymaSize", label: "Левая почка: паренхима (мм)", type: "string" },
      { path: "rightKidney.length", label: "Правая почка: длина (мм)", type: "string" },
      { path: "rightKidney.width", label: "Правая почка: ширина (мм)", type: "string" },
      { path: "rightKidney.parenchymaSize", label: "Правая почка: паренхима (мм)", type: "string" },
    ],
  },
  {
    studyType: "gyn",
    label: "Гинекология (ОМТ Ж)",
    fields: [
      { path: "uterus.length", label: "Матка: длина (мм)", type: "string" },
      { path: "uterus.height", label: "Матка: передне-задний (мм)", type: "string" },
      { path: "uterus.width", label: "Матка: ширина (мм)", type: "string" },
      { path: "uterus.volume", label: "Матка: объём (мл)", type: "string" },
      { path: "uterus.endometriumThickness", label: "Матка: эндометрий (мм)", type: "string" },
      { path: "uterus.cervixWidth", label: "Матка: шейка матки (мм)", type: "string" },
      { path: "rightOvary.length", label: "Правый яичник: длина (мм)", type: "string" },
      { path: "rightOvary.width", label: "Правый яичник: ширина (мм)", type: "string" },
      { path: "leftOvary.length", label: "Левый яичник: длина (мм)", type: "string" },
      { path: "leftOvary.width", label: "Левый яичник: ширина (мм)", type: "string" },
    ],
  },
  {
    studyType: "uro",
    label: "Урология",
    fields: [
      { path: "bladder.length", label: "Мочевой пузырь: длина (мм)", type: "string" },
      { path: "bladder.height", label: "Мочевой пузырь: высота (мм)", type: "string" },
      { path: "bladder.width", label: "Мочевой пузырь: ширина (мм)", type: "string" },
      { path: "bladder.volume", label: "Мочевой пузырь: объём (мл)", type: "string" },
      { path: "bladder.residualLength", label: "Остаточная моча: длина (мм)", type: "string" },
      { path: "bladder.residualHeight", label: "Остаточная моча: высота (мм)", type: "string" },
      { path: "bladder.residualWidth", label: "Остаточная моча: ширина (мм)", type: "string" },
      { path: "bladder.residualVolume", label: "Остаточная моча: объём (мл)", type: "string" },
      { path: "prostate.length", label: "Простата: длина (мм)", type: "string" },
      { path: "prostate.height", label: "Простата: высота (мм)", type: "string" },
      { path: "prostate.width", label: "Простата: ширина (мм)", type: "string" },
      { path: "prostate.volume", label: "Простата: объём (мл)", type: "string" },
      { path: "prostate.tzLength", label: "Простата: Т-зона (мм)", type: "string" },
      { path: "prostate.predictedPSA", label: "Простата: ПСА (нг)", type: "string" },
    ],
  },
  {
    studyType: "thyroid",
    label: "Щитовидная железа",
    fields: [
      { path: "rightLobe.length", label: "Правая доля: длина (мм)", type: "string" },
      { path: "rightLobe.height", label: "Правая доля: высота (мм)", type: "string" },
      { path: "rightLobe.width", label: "Правая доля: ширина (мм)", type: "string" },
      { path: "rightLobe.volume", label: "Правая доля: объём (мл)", type: "string" },
      { path: "leftLobe.length", label: "Левая доля: длина (мм)", type: "string" },
      { path: "leftLobe.height", label: "Левая доля: высота (мм)", type: "string" },
      { path: "leftLobe.width", label: "Левая доля: ширина (мм)", type: "string" },
      { path: "leftLobe.volume", label: "Левая доля: объём (мл)", type: "string" },
      { path: "isthmusSize", label: "Перешеек (мм)", type: "string" },
    ],
  },
  {
    studyType: "breast",
    label: "Молочные железы",
    fields: [
      { path: "rightBreast.volumeFormations", label: "Правая: образования", type: "string" },
      { path: "leftBreast.volumeFormations", label: "Левая: образования", type: "string" },
    ],
  },
  {
    studyType: "testis",
    label: "Яички",
    fields: [
      { path: "rightTestis.length", label: "Правое яичко: длина (мм)", type: "string" },
      { path: "rightTestis.width", label: "Правое яичко: ширина (мм)", type: "string" },
      { path: "rightTestis.depth", label: "Правое яичко: толщина (мм)", type: "string" },
      { path: "rightTestis.volume", label: "Правое яичко: объём (мл)", type: "string" },
      { path: "leftTestis.length", label: "Левое яичко: длина (мм)", type: "string" },
      { path: "leftTestis.width", label: "Левое яичко: ширина (мм)", type: "string" },
      { path: "leftTestis.depth", label: "Левое яичко: толщина (мм)", type: "string" },
      { path: "leftTestis.volume", label: "Левое яичко: объём (мл)", type: "string" },
    ],
  },
];

/**
 * Все известные measurementId из парсера Medison с их описанием
 */
export const ALL_MEASUREMENTS = [
  // ОБП
  { id: "Rad_Liver_L", label: "Печень: ПЗР", studyType: "obp" },
  { id: "Rad_Liver_W", label: "Печень: поперечник", studyType: "obp" },
  { id: "Rad_GB_L", label: "ЖП: длина", studyType: "obp" },
  { id: "Rad_GB_W", label: "ЖП: ширина", studyType: "obp" },
  { id: "Rad_GB_GBW", label: "ЖП: толщина стенки", studyType: "obp" },
  { id: "Rad_GB_CBD", label: "ЖП: холедох", studyType: "obp" },
  { id: "Rad_Pancreas_PancHead", label: "ПЖЖ: головка", studyType: "obp" },
  { id: "Rad_Pancreas_PancBody", label: "ПЖЖ: тело", studyType: "obp" },
  { id: "Rad_Pancreas_PancTail", label: "ПЖЖ: хвост", studyType: "obp" },
  { id: "Rad_Spleen_L", label: "Селезёнка: длина", studyType: "obp" },
  { id: "Rad_Spleen_W", label: "Селезёнка: ширина", studyType: "obp" },
  { id: "Rad_MPortalV_VDist", label: "Воротная вена: диаметр", studyType: "obp" },
  // Почки
  { id: "Rad_Kidney_LL", label: "Левая почка: длина", studyType: "kidneys" },
  { id: "Rad_Kidney_LW", label: "Левая почка: ширина", studyType: "kidneys" },
  { id: "Rad_Kidney_LH", label: "Левая почка: паренхима", studyType: "kidneys" },
  { id: "Rad_Kidney_RL", label: "Правая почка: длина", studyType: "kidneys" },
  { id: "Rad_Kidney_RW", label: "Правая почка: ширина", studyType: "kidneys" },
  { id: "Rad_Kidney_RH", label: "Правая почка: паренхима", studyType: "kidneys" },
  // Гинекология
  { id: "GYN_UTERUS_LENGTH", label: "Матка: длина", studyType: "gyn" },
  { id: "GYN_UTERUS_HEIGHT", label: "Матка: высота", studyType: "gyn" },
  { id: "GYN_UTERUS_WIDTH", label: "Матка: ширина", studyType: "gyn" },
  { id: "GYN_UTERUS_VOL", label: "Матка: объём", studyType: "gyn" },
  { id: "GYN_UTERUS_EndoTh", label: "Матка: эндометрий", studyType: "gyn" },
  { id: "GYN_UTERUS_CervixW", label: "Матка: шейка", studyType: "gyn" },
  { id: "GYN_RtOvary_LENGTH", label: "Правый яичник: длина", studyType: "gyn" },
  { id: "GYN_RtOvary_WIDTH", label: "Правый яичник: ширина", studyType: "gyn" },
  { id: "GYN_LtOvary_LENGTH", label: "Левый яичник: длина", studyType: "gyn" },
  { id: "GYN_LtOvary_WIDTH", label: "Левый яичник: ширина", studyType: "gyn" },
  // Урология
  { id: "Uro_Bladder_Length", label: "МП: длина", studyType: "uro" },
  { id: "Uro_Bladder_Height", label: "МП: высота", studyType: "uro" },
  { id: "Uro_Bladder_Width", label: "МП: ширина", studyType: "uro" },
  { id: "Uro_Bladder_Volume", label: "МП: объём", studyType: "uro" },
  { id: "Uro_ResVol_PostLength", label: "Ост. моча: длина", studyType: "uro" },
  { id: "Uro_ResVol_PostHeight", label: "Ост. моча: высота", studyType: "uro" },
  { id: "Uro_ResVol_PostWidth", label: "Ост. моча: ширина", studyType: "uro" },
  { id: "Uro_ResVol_PostVolume", label: "Ост. моча: объём", studyType: "uro" },
  { id: "Uro_Prostate_Length", label: "Простата: длина", studyType: "uro" },
  { id: "Uro_Prostate_Height", label: "Простата: высота", studyType: "uro" },
  { id: "Uro_Prostate_Width", label: "Простата: ширина", studyType: "uro" },
  { id: "Uro_Prostate_Volume", label: "Простата: объём", studyType: "uro" },
  { id: "Uro_TZ_Length", label: "Простата: Т-зона", studyType: "uro" },
  { id: "Uro_PREDPSA_PREDPSA", label: "Простата: ПСА", studyType: "uro" },
  // Щитовидка
  { id: "Thyroid_Lobe_RL", label: "ЩЖ: правая длина", studyType: "thyroid" },
  { id: "Thyroid_Lobe_RH", label: "ЩЖ: правая высота", studyType: "thyroid" },
  { id: "Thyroid_Lobe_RW", label: "ЩЖ: правая ширина", studyType: "thyroid" },
  { id: "Thyroid_Lobe_RVol", label: "ЩЖ: правый объём", studyType: "thyroid" },
  { id: "Thyroid_Lobe_LL", label: "ЩЖ: левая длина", studyType: "thyroid" },
  { id: "Thyroid_Lobe_LH", label: "ЩЖ: левая высота", studyType: "thyroid" },
  { id: "Thyroid_Lobe_LW", label: "ЩЖ: левая ширина", studyType: "thyroid" },
  { id: "Thyroid_Lobe_LVol", label: "ЩЖ: левый объём", studyType: "thyroid" },
  { id: "Thyroid_Lobe_Isthmus", label: "ЩЖ: перешеек", studyType: "thyroid" },
];