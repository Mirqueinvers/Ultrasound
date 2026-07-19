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
}