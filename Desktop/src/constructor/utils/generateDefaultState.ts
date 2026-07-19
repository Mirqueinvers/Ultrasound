import type { ProtocolSchema } from '../schema'

/**
 * Рекурсивно генерирует дефолтное состояние для протокола.
 * Все поля заполняются пустыми строками, вложенные блоки с dependsOn — null.
 */
export function generateDefaultState(schema: ProtocolSchema): Record<string, any> {
  const state: Record<string, any> = {}

  function processFields(fields: import('../schema').FieldDefinition[]) {
    for (const field of fields) {
      if (field.type === 'selectWithTextarea') {
        // У selectWithTextarea два связанных поля: селект и textarea
        state[field.id] = ''
        if (field.textareaId) {
          state[field.textareaId] = ''
        }
      } else if (field.type === 'repeatingGroup') {
        // Повторяющаяся группа: триггер — строка, список — пустой массив
        state[field.id] = ''
        state[field.id + 'List'] = []
      } else {
        state[field.id] = ''
      }

      // Если есть вложенные поля (например, условный блок или repeatingGroup template)
      if (field.fields && field.fields.length > 0) {
        processFields(field.fields)
      }

      // Также обрабатываем поля шаблона repeatingGroup
      if (field.repeatingGroup?.fields) {
        processFields(field.repeatingGroup.fields)
      }
    }
  }

  for (const section of schema.sections) {
    if (section.fieldsets) {
      for (const fieldset of section.fieldsets) {
        processFields(fieldset.fields)
      }
    }
  }

  return state
}