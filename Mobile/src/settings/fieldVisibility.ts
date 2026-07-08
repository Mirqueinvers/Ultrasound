/**
 * VisibilityGroupId — идентификатор группы полей, которую можно скрыть в UI.
 * Каждый протокол имеет свои группы.
 * Каждая группа соответствует ОДНОМУ полю (ProtocolFieldRow).
 */

// ===== OBP =====
export const OBP_VISIBILITY_GROUPS = {
  // === Печень ===
  "obp.liver.rightLobeAP": "Печень: Правая доля, ПЗР",
  "obp.liver.leftLobeAP": "Печень: Левая доля, ПЗР",
  "obp.liver.rightLobeCCR": "Печень: Правая доля, ККР",
  "obp.liver.rightLobeCVR": "Печень: Правая доля, КВР",
  "obp.liver.leftLobeCCR": "Печень: Левая доля, ККР",
  "obp.liver.rightLobeTotal": "Печень: Правая доля, ККР + ПЗР",
  "obp.liver.leftLobeTotal": "Печень: Левая доля, ККР + ПЗР",
  "obp.liver.echogenicity": "Печень: Эхогенность",
  "obp.liver.homogeneity": "Печень: Эхоструктура",
  "obp.liver.contours": "Печень: Контуры",
  "obp.liver.lowerEdgeAngle": "Печень: Угол нижнего края",
  "obp.liver.focalLesionsPresence": "Печень: Патологические образования",
  "obp.liver.focalLesions": "Печень: Описание патологических образований",
  "obp.liver.vascularPattern": "Печень: Сосудистый рисунок",
  "obp.liver.portalVeinDiameter": "Печень: Воротная вена",
  "obp.liver.ivc": "Печень: Нижняя полая вена",
  "obp.liver.additional": "Печень: Дополнительно",

  // === Желчный пузырь ===
  "obp.gallbladder.position": "ЖП: Положение",
  "obp.gallbladder.length": "ЖП: Длина",
  "obp.gallbladder.width": "ЖП: Ширина",
  "obp.gallbladder.wallThickness": "ЖП: Толщина стенки",
  "obp.gallbladder.shape": "ЖП: Форма",
  "obp.gallbladder.constriction": "ЖП: Перетяжка",
  "obp.gallbladder.contentType": "ЖП: Тип содержимого",
  "obp.gallbladder.concretions": "ЖП: Конкременты",
  "obp.gallbladder.polyps": "ЖП: Полипы",
  "obp.gallbladder.content": "ЖП: Дополнительно по содержимому",
  "obp.gallbladder.cysticDuct": "ЖП: Пузырный проток",
  "obp.gallbladder.commonBileDuct": "ЖП: Общий желчный проток",
  "obp.gallbladder.additional": "ЖП: Дополнительно",

  // === Поджелудочная железа ===
  "obp.pancreas.head": "ПЖ: Головка",
  "obp.pancreas.body": "ПЖ: Тело",
  "obp.pancreas.tail": "ПЖ: Хвост",
  "obp.pancreas.echogenicity": "ПЖ: Эхогенность",
  "obp.pancreas.echostructure": "ПЖ: Эхоструктура",
  "obp.pancreas.contour": "ПЖ: Контур",
  "obp.pancreas.pathologicalFormations": "ПЖ: Патологические образования",
  "obp.pancreas.pathologicalFormationsText": "ПЖ: Описание патологических образований",
  "obp.pancreas.wirsungDuct": "ПЖ: Вирсунгов проток",
  "obp.pancreas.additional": "ПЖ: Дополнительно",

  // === Селезёнка ===
  "obp.spleen.position": "Селезёнка: Положение",
  "obp.spleen.length": "Селезёнка: Длина",
  "obp.spleen.width": "Селезёнка: Ширина",
  "obp.spleen.echogenicity": "Селезёнка: Эхогенность",
  "obp.spleen.echostructure": "Селезёнка: Эхоструктура",
  "obp.spleen.contours": "Селезёнка: Контур",
  "obp.spleen.pathologicalFormations": "Селезёнка: Патологические образования",
  "obp.spleen.pathologicalFormationsText": "Селезёнка: Описание патологических образований",
  "obp.spleen.splenicVein": "Селезёнка: Селезёночная вена",
  "obp.spleen.splenicArtery": "Селезёнка: Селезёночная артерия",
  "obp.spleen.additional": "Селезёнка: Дополнительно",

  // === Финал ===
  "obp.final.freeFluid": "Свободная жидкость в брюшной полости",
  "obp.final.freeFluidDetails": "Описание свободной жидкости",
  "obp.final.conclusion": "Заключение ОБП",
  "obp.final.recommendations": "Рекомендации",
} as const;

// ===== Kidneys =====
export const KIDNEYS_VISIBILITY_GROUPS = {
  // === Почка ===
  "kidneys.position": "Положение",
  "kidneys.length": "Длина",
  "kidneys.width": "Ширина",
  "kidneys.thickness": "Толщина",
  "kidneys.contour": "Контур почки",
  "kidneys.parenchymaSize": "Размер паренхимы",
  "kidneys.parenchymaEchogenicity": "Эхогенность паренхимы",
  "kidneys.parenchymaStructure": "Структура паренхимы",
  "kidneys.parenchymaConcrements": "Конкременты паренхимы",
  "kidneys.parenchymaCysts": "Кисты паренхимы",
  "kidneys.parenchymaPathologicalFormations": "Патологические образования паренхимы",
  "kidneys.pcsSize": "Размер ЧЛС",
  "kidneys.pcsMicroliths": "Микролиты",
  "kidneys.pcsMicrolithsSize": "Размер микролитов (мм)",
  "kidneys.pcsConcrements": "Конкременты ЧЛС",
  "kidneys.pcsCysts": "Кисты ЧЛС",
  "kidneys.pcsPathologicalFormations": "Патологические образования ЧЛС",
  "kidneys.sinus": "Почечный синус",
  "kidneys.adrenalArea": "Область надпочечников",
  "kidneys.additional": "Почки: Дополнительно",

  // === Мочевой пузырь ===
  "kidneys.bladder.length": "МП: Длина",
  "kidneys.bladder.width": "МП: Ширина",
  "kidneys.bladder.depth": "МП: Передне-задний",
  "kidneys.bladder.volume": "МП: Объём",
  "kidneys.bladder.wallThickness": "МП: Толщина стенки",
  "kidneys.bladder.residualStatus": "МП: Объём остаточной мочи",
  "kidneys.bladder.residualLength": "МП: Ост. моча - Длина",
  "kidneys.bladder.residualWidth": "МП: Ост. моча - Ширина",
  "kidneys.bladder.residualDepth": "МП: Ост. моча - Передне-задний",
  "kidneys.bladder.residualVolume": "МП: Ост. моча - Объём",
  "kidneys.bladder.contents": "МП: Характер содержимого",
  "kidneys.bladder.contentsText": "МП: Описание содержимого",
  "kidneys.bladder.additional": "МП: Дополнительно",
  "kidneys.conclusion": "Заключение / Рекомендации",
} as const;

// ===== Scrotum =====
export const SCROTUM_VISIBILITY_GROUPS = {
  "scrotum.length": "Яичко: Длина (мм)",
  "scrotum.width": "Яичко: Ширина (мм)",
  "scrotum.depth": "Яичко: Глубина (мм)",
  "scrotum.volume": "Яичко: Объем (см³)",
  "scrotum.location": "Яичко: Расположение",
  "scrotum.contour": "Яичко: Контур",
  "scrotum.capsule": "Яичко: Капсула",
  "scrotum.capsuleText": "Яичко: Описание капсулы",
  "scrotum.echogenicity": "Яичко: Эхогенность",
  "scrotum.echotexture": "Яичко: Эхоструктура",
  "scrotum.echotextureText": "Яичко: Описание эхоструктуры",
  "scrotum.mediastinum": "Яичко: Структура средостения",
  "scrotum.mediastinumText": "Яичко: Описание средостения",
  "scrotum.bloodFlow": "Яичко: Кровоток",
  "scrotum.appendage": "Яичко: Придаток",
  "scrotum.appendageText": "Яичко: Описание придатка",
  "scrotum.fluidAmount": "Яичко: Количество жидкости",
  "scrotum.fluidAmountText": "Яичко: Описание жидкости",
  "scrotum.additional": "Яичко: Дополнительно",
  "scrotum.conclusion": "Заключение / Рекомендации",
} as const;

// ===== OMT Female =====
export const OMTFEMALE_VISIBILITY_GROUPS = {
  // === Матка: Информация ===
  "omt_female.uterusStatus": "Матка: Положение матки",
  "omt_female.studyType": "Матка: Вид исследования",
  "omt_female.lastMenstruationDate": "Матка: Дата последней менструации",
  "omt_female.cycleDay": "Матка: День цикла",
  "omt_female.menopause": "Матка: Менопауза",

  // === Матка: Размеры ===
  "omt_female.length": "Матка: Длина (мм)",
  "omt_female.width": "Матка: Ширина (мм)",
  "omt_female.apDimension": "Матка: ПЗР (мм)",
  "omt_female.volume": "Матка: Объем (см³)",

  // === Матка: Форма ===
  "omt_female.shape": "Матка: Форма",
  "omt_female.position": "Матка: Положение",

  // === Матка: Миометрий ===
  "omt_female.myometriumStructure": "Матка: Структура миометрия",
  "omt_female.myometriumStructureText": "Матка: Описание миометрия",
  "omt_female.myometriumEchogenicity": "Матка: Эхогенность миометрия",

  // === Матка: Миома ===
  "omt_female.myomaNodesPresence": "Матка: Миоматозные узлы",

  // === Матка: Эндометрий ===
  "omt_female.endometriumSize": "Матка: Размер эндометрия (мм)",
  "omt_female.endometriumStructure": "Матка: Структура эндометрия",

  // === Матка: Шейка ===
  "omt_female.cervixSize": "Матка: Размер шейки (мм)",
  "omt_female.cervixEchostructure": "Матка: Эхоструктура шейки",
  "omt_female.cervixEchostructureText": "Матка: Описание эхоструктуры шейки",
  "omt_female.cervicalCanal": "Матка: Цервикальный канал",
  "omt_female.cervicalCanalText": "Матка: Описание цервикального канала",
  "omt_female.freeFluid": "Матка: Свободная жидкость",
  "omt_female.freeFluidText": "Матка: Описание свободной жидкости",

  // === Матка: Дополнительно ===
  "omt_female.additional": "Матка: Дополнительно",

  // === Яичники (правый/левый) ===
  "omt_female.ovaryPosition": "Яичник: Положение",
  "omt_female.ovaryLength": "Яичник: Длина (мм)",
  "omt_female.ovaryWidth": "Яичник: Ширина (мм)",
  "omt_female.ovaryThickness": "Яичник: Толщина (мм)",
  "omt_female.ovaryVolume": "Яичник: Объем (см³)",
  "omt_female.ovaryShape": "Яичник: Форма",
  "omt_female.ovaryContour": "Яичник: Контур",
  "omt_female.ovaryCysts": "Яичник: Наличие кист",
  "omt_female.ovaryFormations": "Яичник: Наличие образований",
  "omt_female.ovaryFormationsText": "Яичник: Описание образований",
  "omt_female.ovaryAdditional": "Яичник: Дополнительно",

  // === Мочевой пузырь (ОМТ Ж) ===
  "omt_female.bladderLength": "МП: Длина",
  "omt_female.bladderWidth": "МП: Ширина",
  "omt_female.bladderDepth": "МП: Передне-задний",
  "omt_female.bladderVolume": "МП: Объем",
  "omt_female.bladderWallThickness": "МП: Толщина стенки",
  "omt_female.bladderResidualStatus": "МП: Определение остаточной мочи",
  "omt_female.bladderResidualLength": "МП: Ост. моча - Длина",
  "omt_female.bladderResidualWidth": "МП: Ост. моча - Ширина",
  "omt_female.bladderResidualDepth": "МП: Ост. моча - Передне-задний",
  "omt_female.bladderResidualVolume": "МП: Объем остаточной мочи",
  "omt_female.bladderContents": "МП: Характер содержимого",
  "omt_female.bladderContentsText": "МП: Описание содержимого",
  "omt_female.bladderAdditional": "МП: Дополнительно",

  // === Финал ===
  "omt_female.conclusion": "Заключение / Рекомендации",
} as const;

// ===== OMT Male =====
export const OMTMALE_VISIBILITY_GROUPS = {
  // === Простата ===
  "omt_male.studyType": "Простата: Вид исследования",
  "omt_male.position": "Простата: Положение",
  "omt_male.length": "Простата: Длина (мм)",
  "omt_male.width": "Простата: Ширина (мм)",
  "omt_male.apDimension": "Простата: ПЗР (мм)",
  "omt_male.volume": "Простата: Объем (см³)",
  "omt_male.contour": "Простата: Контур",
  "omt_male.symmetry": "Простата: Симметричность",
  "omt_male.shape": "Простата: Форма",
  "omt_male.echogenicity": "Простата: Эхогенность",
  "omt_male.echotexture": "Простата: Эхоструктура",
  "omt_male.echotextureText": "Простата: Описание эхоструктуры",
  "omt_male.bladderProtrusion": "Простата: Выпячивание",
  "omt_male.bladderProtrusionMm": "Простата: Выпячивание на (мм)",
  "omt_male.pathologicLesions": "Простата: Патологические образования",
  "omt_male.pathologicLesionsText": "Простата: Описание патологических образований",
  "omt_male.additional": "Простата: Дополнительно",

  // === Мочевой пузырь (ОМТ М) ===
  "omt_male.bladderLength": "МП: Длина",
  "omt_male.bladderWidth": "МП: Ширина",
  "omt_male.bladderDepth": "МП: Передне-задний",
  "omt_male.bladderVolume": "МП: Объем",
  "omt_male.bladderWallThickness": "МП: Толщина стенки",
  "omt_male.bladderResidualStatus": "МП: Определение остаточной мочи",
  "omt_male.bladderResidualLength": "МП: Ост. моча - Длина",
  "omt_male.bladderResidualWidth": "МП: Ост. моча - Ширина",
  "omt_male.bladderResidualDepth": "МП: Ост. моча - Передне-задний",
  "omt_male.bladderResidualVolume": "МП: Объем остаточной мочи",
  "omt_male.bladderContents": "МП: Характер содержимого",
  "omt_male.bladderContentsText": "МП: Описание содержимого",
  "omt_male.bladderAdditional": "МП: Дополнительно",

  // === Финал ===
  "omt_male.conclusion": "Заключение / Рекомендации",
} as const;

// ===== Thyroid =====
export const THYROID_VISIBILITY_GROUPS = {
  // === Доля ===
  "thyroid.length": "Щитовидная железа: Длина (мм)",
  "thyroid.width": "Щитовидная железа: Ширина (мм)",
  "thyroid.depth": "Щитовидная железа: Глубина (мм)",
  "thyroid.volume": "Щитовидная железа: Объем (мл)",

  // === Перешеек ===
  "thyroid.isthmusSize": "Щитовидная железа: Размер перешейка (мм)",

  // === Общие показатели ===
  "thyroid.echogenicity": "Щитовидная железа: Эхогенность железы",
  "thyroid.echostructure": "Щитовидная железа: Эхоструктура",
  "thyroid.contour": "Щитовидная железа: Контур",
  "thyroid.symmetry": "Щитовидная железа: Симметричность",
  "thyroid.position": "Щитовидная железа: Положение",

  // === Объемные образования ===
  "thyroid.volumeFormations": "Щитовидная железа: Определение",

  // === Дополнительно ===
  "thyroid.additional": "Щитовидная железа: Дополнительно",

  // === Финал ===
  "thyroid.conclusion": "Заключение / Рекомендации",
} as const;

// ===== Breast =====
export const BREAST_VISIBILITY_GROUPS = {
  // === Общая информация ===
  "breast.lastMenstruationDate": "Молочные железы: Дата последней менструации",
  "breast.cycleDay": "Молочные железы: День цикла",

  // === Правая молочная железа ===
  "breast.right.skin": "Правая: Кожа",
  "breast.right.skinComment": "Правая: Описание изменений кожи",
  "breast.right.nipples": "Правая: Соски и ареолы",
  "breast.right.nipplesComment": "Правая: Описание изменений сосков и ареол",
  "breast.right.milkDucts": "Правая: Млечные протоки",
  "breast.right.volumeFormations": "Правая: Определение",
  "breast.right.additional": "Правая: Дополнительно",

  // === Левая молочная железа ===
  "breast.left.skin": "Левая: Кожа",
  "breast.left.skinComment": "Левая: Описание изменений кожи",
  "breast.left.nipples": "Левая: Соски и ареолы",
  "breast.left.nipplesComment": "Левая: Описание изменений сосков и ареол",
  "breast.left.milkDucts": "Левая: Млечные протоки",
  "breast.left.volumeFormations": "Левая: Определение",
  "breast.left.additional": "Левая: Дополнительно",

  // === Структура ===
  "breast.structure": "Молочные железы: Структура",

  // === Финал ===
  "breast.conclusion": "Заключение / Рекомендации",
} as const;

// ===== Lymph Nodes =====
export const LYMPH_VISIBILITY_GROUPS = {
  "lymph_nodes.size1": "Лимфоузлы: Размер 1 (мм)",
  "lymph_nodes.size2": "Лимфоузлы: Размер 2 (мм)",
  "lymph_nodes.echogenicity": "Лимфоузлы: Эхогенность",
  "lymph_nodes.echostructure": "Лимфоузлы: Эхоструктура",
  "lymph_nodes.shape": "Лимфоузлы: Форма",
  "lymph_nodes.contour": "Лимфоузлы: Контур",
  "lymph_nodes.bloodFlow": "Лимфоузлы: Кровоток",
  "lymph_nodes.additional": "Лимфоузлы: Дополнительно",
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
