import React from 'react'
import type { SectionDefinition, FieldsetDefinition } from '../schema'
import { DynamicField } from './DynamicField'
import { ResearchSectionCard } from '@/UI/ResearchSectionCard'
import { Fieldset } from '@/UI/Fieldset'

interface DynamicSectionProps {
  section: SectionDefinition
  value: Record<string, any>
  onChange: (fieldId: string, value: any) => void
}

function evaluateFieldsetVisibleWhen(
  fieldset: FieldsetDefinition,
  getValue: (fieldId: string) => string
): boolean {
  if (!fieldset.visibleWhen || fieldset.visibleWhen.length === 0) return true

  return fieldset.visibleWhen.every((condition) => {
    const currentValue = getValue(condition.field)

    switch (condition.operator) {
      case '==':
        return currentValue === String(condition.value)
      default:
        return true
    }
  })
}

export const DynamicSection: React.FC<DynamicSectionProps> = ({
  section,
  value,
  onChange,
}) => {
  if (!section.fieldsets || section.fieldsets.length === 0) {
    return null
  }

  const getValue = (fieldId: string): string => value[fieldId] ?? ''

  return (
    <ResearchSectionCard title={section.label}>
      <div className="flex flex-col gap-6">
        {section.fieldsets.map((fieldset) => {
          // Проверка видимости филдсета
          if (!evaluateFieldsetVisibleWhen(fieldset, getValue)) {
            return null
          }

          return (
            <Fieldset key={fieldset.id ?? fieldset.title} title={fieldset.title}>
              <div className="flex flex-col gap-3">
                {fieldset.fields.map((field) => (
                  <DynamicField
                    key={field.id}
                    field={field}
                    value={value}
                    onChange={onChange}
                  />
                ))}
              </div>
            </Fieldset>
          )
        })}
      </div>
    </ResearchSectionCard>
  )
}

export default DynamicSection