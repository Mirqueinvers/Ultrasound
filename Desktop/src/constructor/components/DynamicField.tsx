import React from 'react'
import type { FieldDefinition } from '../schema'
import { SizeRow } from '@/UI/SizeRow'
import { ButtonSelect } from '@/UI/ButtonSelect'
import { SelectWithTextarea } from '@/UI/SelectWithTextarea'
import { inputClasses } from '@utils/formClasses'

function evaluateVisibleWhen(
  field: FieldDefinition,
  getValue: (fieldId: string) => string
): boolean {
  if (!field.visibleWhen || field.visibleWhen.length === 0) return true

  // Все условия должны выполняться (AND)
  return field.visibleWhen.every((condition) => {
    const currentValue = getValue(condition.field)
    const numValue = parseFloat(currentValue)
    const condValue =
      typeof condition.value === 'number'
        ? condition.value
        : parseFloat(condition.value)

    if (isNaN(numValue) || isNaN(condValue)) return false

    switch (condition.operator) {
      case '>':
        return numValue > condValue
      case '<':
        return numValue < condValue
      case '>=':
        return numValue >= condValue
      case '<=':
        return numValue <= condValue
      case '==':
        return currentValue === String(condition.value)
      default:
        return true
    }
  })
}

interface DynamicFieldProps {
  field: FieldDefinition
  value: Record<string, any>
  onChange: (fieldId: string, value: any) => void
}

export const DynamicField: React.FC<DynamicFieldProps> = ({
  field,
  value,
  onChange,
}) => {
  const getValue = (fieldId: string): string => value[fieldId] ?? ''

  // Проверка видимости
  if (!evaluateVisibleWhen(field, getValue)) {
    return null
  }

  const handleSizeRowChange = (fieldId: string, val: string) => {
    // Сначала обновляем само поле
    onChange(fieldId, val)

    // Авто-вычисление rightLobeTotal = rightLobeAP + rightLobeCCR
    if (fieldId === 'rightLobeAP' || fieldId === 'rightLobeCCR') {
      const ap = parseFloat(fieldId === 'rightLobeAP' ? val : getValue('rightLobeAP')) || 0
      const ccr = parseFloat(fieldId === 'rightLobeCCR' ? val : getValue('rightLobeCCR')) || 0
      if (ap > 0 && ccr > 0) {
        onChange('rightLobeTotal', String(ccr + ap))
      }
      return
    }

    // Авто-вычисление leftLobeTotal = leftLobeAP + leftLobeCCR
    if (fieldId === 'leftLobeAP' || fieldId === 'leftLobeCCR') {
      const ap = parseFloat(fieldId === 'leftLobeAP' ? val : getValue('leftLobeAP')) || 0
      const ccr = parseFloat(fieldId === 'leftLobeCCR' ? val : getValue('leftLobeCCR')) || 0
      if (ap > 0 && ccr > 0) {
        onChange('leftLobeTotal', String(ccr + ap))
      }
      return
    }
  }

  // Если это вложенный fieldset
  if (field.type === 'fieldset' && field.fields) {
    return (
      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        {field.label && (
          <h5 className="text-xs font-semibold text-amber-800 mb-3">
            {field.label}
          </h5>
        )}
        <div className="flex flex-col gap-3">
          {field.fields.map((subField) => (
            <DynamicField
              key={subField.id}
              field={subField}
              value={value}
              onChange={onChange}
            />
          ))}
        </div>
      </div>
    )
  }

  // Рендер поля по типу
  switch (field.type) {
    case 'sizeRow':
      return (
        <SizeRow
          label={field.label}
          value={getValue(field.id)}
          onChange={(val) => handleSizeRowChange(field.id, val)}
          range={
            field.normalRange
              ? { min: field.normalRange.min ?? 0, max: field.normalRange.max ?? 999, unit: 'мм' }
              : undefined
          }
          readOnly={field.readOnly}
          autoCalculated={field.autoCalculated}
        />
      )

    case 'buttonSelect':
      return (
        <ButtonSelect
          label={field.label}
          value={getValue(field.id)}
          onChange={(val) => onChange(field.id, val)}
          options={field.options ?? []}
        />
      )

    case 'selectWithTextarea':
      return (
        <SelectWithTextarea
          label={field.label}
          selectValue={getValue(field.id)}
          textareaValue={field.textareaId ? getValue(field.textareaId) : ''}
          onSelectChange={(val) => onChange(field.id, val)}
          onTextareaChange={(val) => {
            if (field.textareaId) onChange(field.textareaId, val)
          }}
          options={field.options ?? []}
          triggerValue={field.triggerValue ?? ''}
          textareaLabel={field.textareaLabel ?? ''}
          rows={field.rows ?? 3}
        />
      )

    case 'textarea':
      return (
        <label className="block text-sm font-semibold text-slate-700">
          {field.label !== field.id ? field.label : ''}
          <textarea
            rows={field.rows ?? 3}
            className={`${inputClasses} resize-y`}
            value={getValue(field.id)}
            onChange={(e) => onChange(field.id, e.target.value)}
          />
        </label>
      )

    case 'text':
      return (
        <label className="block text-sm font-semibold text-slate-700">
          {field.label}
          <input
            type="text"
            className={inputClasses}
            value={getValue(field.id)}
            onChange={(e) => onChange(field.id, e.target.value)}
          />
        </label>
      )

    default:
      return null
  }
}

export default DynamicField