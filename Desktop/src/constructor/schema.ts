// Типы JSON-схемы протокола

export type FieldType = 'sizeRow' | 'buttonSelect' | 'selectWithTextarea' | 'textarea' | 'text' | 'fieldset' | 'repeatingGroup'

export interface ButtonSelectOption {
  value: string
  label: string
}

export interface NormalRange {
  min?: number
  max?: number
  label?: string
}

export interface VisibleWhenCondition {
  field: string
  operator: '>' | '<' | '>=' | '<=' | '=='
  value: number | string
}

export interface RepeatingGroupTemplate {
  itemLabel?: string         // шаблон заголовка карточки, например "Конкремент #{index}"
  addButtonLabel?: string    // "Добавить конкремент"
  triggerOptions?: ButtonSelectOption[] // опции селекта для показа/скрытия (по умолчанию "не определяются"/"определяются")
  fields: FieldDefinition[]  // поля одного элемента
}

export interface FieldDefinition {
  id: string
  label: string
  type: FieldType
  defaultValue?: string
  options?: ButtonSelectOption[]
  triggerValue?: string
  textareaLabel?: string
  textareaId?: string
  normalRange?: NormalRange
  rows?: number
  readOnly?: boolean
  autoCalculated?: boolean
  visibleWhen?: VisibleWhenCondition[]
  fields?: FieldDefinition[]
  repeatingGroup?: RepeatingGroupTemplate
}

export interface SectionDefinition {
  id: string
  label: string
  desktopKey: string
  order: number
  fieldsets?: FieldsetDefinition[]
}

export interface FieldsetDefinition {
  id?: string
  title: string
  visibleWhen?: VisibleWhenCondition[]
  fields: FieldDefinition[]
}

export interface ProtocolSchema {
  id: string
  selectionLabel: string
  title: string
  description: string
  sections: SectionDefinition[]
  printTemplate?: PrintTemplate
}

// ---- Типы для печати (printTemplate) ----

export type PrintTemplate = {
  title: string
  body: PrintBlock[]
}

export type PrintBlock =
  | PrintSection
  | PrintFreeFluid
  | PrintConclusion
  | PrintRecommendations

export const PRINT_BLOCK_LABELS: Record<string, string> = {
  section: 'Секция органа',
  freeFluid: 'Свободная жидкость',
  conclusion: 'Заключение',
  recommendations: 'Рекомендации',
}

export interface PrintSection {
  type: "section"
  label: string
  fields: PrintField[]
  /** Если указано — секция выводит статический текст когда это поле !== пусто */
  specialConditionField?: string
  /** Текст который выводится вместо полей при specialCondition */
  specialConditionText?: string
  /** Поле с additional текстом для specialCondition */
  specialConditionAdditionalField?: string
  /** Капитализация первого символа у всего блока */
  capitalize?: boolean
}

export type PrintField =
  | PrintFieldValues
  | PrintSelectWithTextarea
  | PrintConditionalField
  | PrintConcretionList
  | PrintPolypList
  | PrintPancreasSizes
  | PrintText

export interface PrintFieldValues {
  type: "fieldValues"
  fields: PrintFieldValueItem[]
  /** Разделитель между полями (по умолчанию ", ") */
  separator?: string
  /** Суффикс после всех полей */
  suffix?: string
  /** Показывать только если хотя бы одно поле имеет значение */
  optional?: boolean
}

export interface PrintFieldValueItem {
  field: string
  template: string  // шаблон с {value}
  /** Если true — поле опционально, не блокирует отображение секции */
  optional?: boolean
}

export interface PrintSelectWithTextarea {
  type: "selectWithTextarea"
  field: string
  /** Текст когда поле пустое или имеет значение != trigger */
  notSelectedText: string
  /** Значение триггера (например, "определяются") */
  triggerValue: string
  /** Поле textarea */
  textareaField: string
  /** Текст когда выбран trigger, но textarea пустая */
  selectedFallbackText?: string
  /** Статический префикс перед текстом из textarea */
  prefix?: string
}

export interface PrintConditionalField {
  type: "conditional"
  field: string
  values: Record<string, string>  // { "обычное": "текст", ... }
}

export interface PrintText {
  type: "text"
  text: string
}

// ---- Сложные типы ----

export interface PrintPancreasSizes {
  type: "pancreasSizes"
  fields: {
    head: string
    body: string
    tail: string
  }
  templates: {
    hasValue: string     // шаблон с {value}, например "головка {value} мм"
    noValue: string      // текст когда нет значения, например "головки"
  }
}

export interface PrintConcretionList {
  type: "concretionList"
  trigger: {
    field: string
    notSelectedText: string
  }
  list: {
    field: string
    emptyText: string
  }
  item: {
    sizeField: string
    positionField: string
  }
  templates: {
    positionPrefix: string         // "В области "
    positionJoinWord: string       // " и "
    sizePrefix: string             // "размерами до "
    sizeUnit: string               // " мм"
    sizeJoinWord: string           // " и "
    acoustic: string               // "с акустической тенью"
    labels: {
      one: string   // "гиперэхогенное образование"
      few: string   // "гиперэхогенных образования"
      many: string  // "гиперэхогенных образований"
    }
  }
  /** Если true — использовать предлоги "В области", иначе "В" */
  usePositionPrefixIn?: boolean
}

export interface PrintPolypList {
  type: "polypList"
  trigger: {
    field: string
    notSelectedText: string
  }
  list: {
    field: string
    emptyText: string
  }
  item: {
    sizeField: string
    positionField: string
    wallField: string
  }
  templates: {
    positionPrefix: string         // "В "
    positionJoinWord: string       // " и "
    wallPrefix: string             // ", "
    wallJoinWord: string           // " и "
    wallSingleSuffix: string       // " стенке"
    wallBothText: string           // "по передней и задней стенкам"
    sizePrefix: string             // "размерами до "
    sizeUnit: string               // " мм"
    sizeJoinWord: string           // " и "
    acoustic: string               // "без акустической тени"
    participleSingle: string       // "выступающее из стенки органа в просвет, неподвижное при смене положения"
    participleFew: string          // "выступающие из стенки органа в просвет, неподвижные при смене положения"
    labels: {
      one: string   // "гиперэхогенное образование"
      few: string   // "гиперэхогенных образования"
    }
  }
}

// ---- Блоки верхнего уровня ----

export interface PrintFreeFluid {
  type: "freeFluid"
  field: string
  detailsField: string
  templates: {
    notDetermined: string
    determinedEmpty: string
  }
}

export interface PrintConclusion {
  type: "conclusion"
  field: string
  label: string
}

export interface PrintRecommendations {
  type: "recommendations"
  field: string
  label: string
}