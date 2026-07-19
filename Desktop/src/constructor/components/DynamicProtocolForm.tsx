import React, { useState, useEffect, useCallback } from 'react'
import type { ProtocolSchema } from '../schema'
import { DynamicSection } from './DynamicSection'
import { generateDefaultState } from '../utils/generateDefaultState'
import type { SectionKey } from "@components/common/OrgNavigation";

interface DynamicProtocolFormProps {
  schema: ProtocolSchema
  value?: Record<string, any>
  onChange?: (data: Record<string, any>) => void
  sectionRefs?: Record<SectionKey, React.RefObject<HTMLDivElement | null>>;
  className?: string
}

/**
 * Универсальный рендерер протокола из JSON-схемы.
 * Полностью повторяет логику существующих компонентов-протоколов (Obp, Kidney и т.д.).
 */
export const DynamicProtocolForm: React.FC<DynamicProtocolFormProps> = ({
  schema,
  value,
  onChange,
  sectionRefs,
  className = '',
}) => {
  const defaultState = useCallback(
    () => generateDefaultState(schema),
    [schema]
  )

  const [form, setForm] = useState<Record<string, any>>(value ?? defaultState())

  // Синхронизация с внешним value
  useEffect(() => {
    if (value) {
      setForm((prev) => ({ ...prev, ...value }))
    }
  }, [value])

  const handleFieldChange = (fieldId: string, fieldValue: any) => {
    const updated = { ...form, [fieldId]: fieldValue }
    setForm(updated)
    onChange?.(updated)
  }

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {/* Заголовок исследования */}
      {schema.title && (
        <div className="text-2xl font-semibold text-center mt-2 mb-4">
          {schema.title}
        </div>
      )}

      {/* Секции */}
      {schema.sections.map((section) => (
        <div
          key={section.id}
          ref={sectionRefs?.[section.desktopKey as SectionKey]}
        >
          <DynamicSection
            section={section}
            value={form}
            onChange={handleFieldChange}
          />
        </div>
      ))}
    </div>
  )
}

export default DynamicProtocolForm