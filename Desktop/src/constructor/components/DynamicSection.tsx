import React from 'react'
import type { SectionDefinition } from '../schema'
import { DynamicField } from './DynamicField'
import { ResearchSectionCard } from '@/UI/ResearchSectionCard'
import { Fieldset } from '@/UI/Fieldset'

interface DynamicSectionProps {
  section: SectionDefinition
  value: Record<string, any>
  onChange: (fieldId: string, value: any) => void
}

export const DynamicSection: React.FC<DynamicSectionProps> = ({
  section,
  value,
  onChange,
}) => {
  if (!section.fieldsets || section.fieldsets.length === 0) {
    return null
  }

  return (
    <ResearchSectionCard title={section.label}>
      <div className="flex flex-col gap-6">
        {section.fieldsets.map((fieldset) => (
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
        ))}
      </div>
    </ResearchSectionCard>
  )
}

export default DynamicSection