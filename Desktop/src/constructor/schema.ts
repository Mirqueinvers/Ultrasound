// Типы JSON-схемы протокола

export type FieldType = 'sizeRow' | 'buttonSelect' | 'selectWithTextarea' | 'textarea' | 'text' | 'fieldset'

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
  fields: FieldDefinition[]
}

export interface ProtocolSchema {
  id: string
  selectionLabel: string
  title: string
  description: string
  sections: SectionDefinition[]
}