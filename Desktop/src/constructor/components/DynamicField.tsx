import React from 'react'
import type { FieldDefinition } from '../schema'
import { SizeRow } from '@/UI/SizeRow'
import { ButtonSelect } from '@/UI/ButtonSelect'
import { SelectWithTextarea } from '@/UI/SelectWithTextarea'
import { inputClasses } from '@utils/formClasses'
import { Plus, Trash2 } from 'lucide-react'

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
      case '!=':
        return currentValue !== String(condition.value)
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
  const getValue = (fieldId: string): string => {
    const rawValue = value[fieldId]
    if (rawValue !== undefined && rawValue !== '') return rawValue
    if (fieldId === field.id && field.defaultValue) return field.defaultValue
    return rawValue ?? ''
  }

  // Проверка видимости
  if (!evaluateVisibleWhen(field, getValue)) {
    return null
  }

  // Скрытые поля — не рендерим, но они хранятся в состоянии через cystConfig
  if (field.hidden) {
    return null
  }

  const handleSizeRowChange = (fieldId: string, val: string) => {
    onChange(fieldId, val)

    // Авто-вычисление liver.rightLobeTotal = liver.rightLobeAP + liver.rightLobeCCR
    if (fieldId === 'liver.rightLobeAP' || fieldId === 'liver.rightLobeCCR') {
      const ap = parseFloat(fieldId === 'liver.rightLobeAP' ? val : getValue('liver.rightLobeAP')) || 0
      const ccr = parseFloat(fieldId === 'liver.rightLobeCCR' ? val : getValue('liver.rightLobeCCR')) || 0
      if (ap > 0 && ccr > 0) {
        onChange('liver.rightLobeTotal', String(ccr + ap))
      }
      return
    }

    if (fieldId === 'liver.leftLobeAP' || fieldId === 'liver.leftLobeCCR') {
      const ap = parseFloat(fieldId === 'liver.leftLobeAP' ? val : getValue('liver.leftLobeAP')) || 0
      const ccr = parseFloat(fieldId === 'liver.leftLobeCCR' ? val : getValue('liver.leftLobeCCR')) || 0
      if (ap > 0 && ccr > 0) {
        onChange('liver.leftLobeTotal', String(ccr + ap))
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

  // Рендер повторяющейся группы (конкременты, кисты, полипы)
  if (field.type === 'repeatingGroup') {
    const template = field.repeatingGroup
    const triggerValue = getValue(field.id)
    const listFieldId = field.id + 'List'
    const list: Record<string, string>[] = value[listFieldId] ?? []
    const cystCfg = field.cystConfig
    const isCystGroup = cystCfg?.enabled ?? false
    const multipleValue = cystCfg?.multipleFieldId
      ? getValue(cystCfg.multipleFieldId)
      : ''

    const triggerOptions = template?.triggerOptions ?? [
      { value: 'не определяются', label: 'не определяются' },
      { value: 'определяются', label: 'определяются' },
    ]

    const addItem = () => {
      const emptyItem: Record<string, string> = {}
      if (template?.fields) {
        for (const f of template.fields) {
          emptyItem[f.id] = ''
        }
      }
      onChange(listFieldId, [...list, emptyItem])
    }

    const updateItem = (index: number, fieldId: string, val: string) => {
      const newList = list.map((item, i) =>
        i === index ? { ...item, [fieldId]: val } : item
      )
      onChange(listFieldId, newList)
    }

    const removeItem = (index: number) => {
      onChange(listFieldId, list.filter((_, i) => i !== index))
    }

    const handleSizeJoinChange = (
      itemIndex: number,
      subFieldId: string,
      val: string,
      parentFieldId: string,
      joinFields: { id: string; label: string }[],
      delimiter: string
    ) => {
      const itemData = list[itemIndex] ?? {}
      const parts = (itemData[parentFieldId] ?? '').split(delimiter)
      const idx = joinFields.findIndex((f) => f.id === subFieldId)
      const newParts = joinFields.map((_, i) => (i === idx ? val : parts[i] ?? ''))
      const newVal = newParts.join(delimiter)
      updateItem(itemIndex, parentFieldId, newVal)
    }

    const renderTemplateField = (
      tplField: FieldDefinition,
      itemIndex: number,
      itemData: Record<string, string>
    ) => {
      // Обработка sizeRowJoin — два SizeRow, объединённые через delimiter
      if (tplField.type === 'sizeRowJoin') {
        const delimiter = tplField.joinDelimiter ?? 'x'
        const joinFields = tplField.joinFields ?? [{ id: 'size1', label: 'Размер 1 (мм)' }, { id: 'size2', label: 'Размер 2 (мм)' }]
        const currentValue = itemData[tplField.id] ?? ''
        const parts = currentValue.split(delimiter)

        return (
          <div className="space-y-2">
            {joinFields.map((jf, jIdx) => (
              <SizeRow
                key={jf.id}
                label={jf.label}
                value={parts[jIdx] ?? ''}
                onChange={(val) => handleSizeJoinChange(itemIndex, jf.id, val, tplField.id, joinFields, delimiter)}
                range={
                  tplField.normalRange
                    ? { min: tplField.normalRange.min ?? 0, max: tplField.normalRange.max ?? 999, unit: 'мм' }
                    : undefined
                }
              />
            ))}
          </div>
        )
      }

      const itemValue = itemData[tplField.id] ?? ''

      switch (tplField.type) {
        case 'sizeRow':
          return (
            <SizeRow
              label={tplField.label}
              value={itemValue}
              onChange={(val) => updateItem(itemIndex, tplField.id, val)}
              range={
                tplField.normalRange
                  ? { min: tplField.normalRange.min ?? 0, max: tplField.normalRange.max ?? 999, unit: 'мм' }
                  : undefined
              }
            />
          )

        case 'buttonSelect':
          return (
            <ButtonSelect
              label={tplField.label}
              value={itemValue}
              onChange={(val) => updateItem(itemIndex, tplField.id, val)}
              options={tplField.options ?? []}
            />
          )

        case 'textField':
          return (
            <label className="block text-sm font-semibold text-slate-700">
              {tplField.label}
              <input
                type="text"
                className={inputClasses}
                value={itemValue}
                onChange={(e) => updateItem(itemIndex, tplField.id, e.target.value)}
              />
            </label>
          )

        default:
          return null
      }
    }

    return (
      <div className="space-y-2">
        <ButtonSelect
          label={field.label}
          value={triggerValue}
          onChange={(val) => onChange(field.id, val)}
          options={triggerOptions}
        />

        {triggerValue === 'определяются' && (
          <div className="mt-3 space-y-3 ml-4">
            {/* Для кист: показываем блок множественных кист */}
            {isCystGroup && multipleValue === 'да' && cystCfg && (
              <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-3">
                    <div className="mb-4">Максимальным размером до</div>
                    <SizeRow
                      label="Размер 1 (мм)"
                      value={(value[cystCfg.multipleSizeFieldId ?? ''] ?? '').split('x')[0] || ''}
                      onChange={(e) => {
                        const multipleSizeId = cystCfg.multipleSizeFieldId ?? ''
                        const current = value[multipleSizeId] ?? ''
                        const size2 = current.split('x')[1] || ''
                        onChange(multipleSizeId, e + (size2 ? `x${size2}` : ''))
                      }}
                    />
                    <SizeRow
                      label="Размер 2 (мм)"
                      value={(value[cystCfg.multipleSizeFieldId ?? ''] ?? '').split('x')[1] || ''}
                      onChange={(e) => {
                        const multipleSizeId = cystCfg.multipleSizeFieldId ?? ''
                        const current = value[multipleSizeId] ?? ''
                        const size1 = current.split('x')[0] || ''
                        onChange(multipleSizeId, size1 + (e ? `x${e}` : ''))
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="text-amber-600 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-white/50 flex-shrink-0 mt-2"
                    onClick={() => {
                      onChange(cystCfg!.multipleFieldId!, 'нет')
                      if (cystCfg?.multipleSizeFieldId) {
                        onChange(cystCfg.multipleSizeFieldId, '')
                      }
                    }}
                    title="Удалить множественные кисты"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Пустое состояние — только когда нет кист и нет множественных */}
            {list.length === 0 && !(isCystGroup && multipleValue === 'да') && (
              <div className="text-center py-4 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                <p className="text-slate-500 text-xs mb-3">
                  {template?.addButtonLabel
                    ? `${template.addButtonLabel.replace('Добавить ', '')} не добавлены`
                    : 'Элементы не добавлены'}
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all text-sm"
                  >
                    <Plus size={16} />
                    {template?.addButtonLabel ?? 'Добавить'}
                  </button>
                  {isCystGroup && cystCfg && (
                    <button
                      type="button"
                      onClick={() => onChange(cystCfg!.multipleFieldId!, 'да')}
                      className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all text-sm"
                    >
                      <Plus size={16} />
                      Множественные кисты
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Список одиночных кист/конкрементов */}
            {list.length > 0 && (
              <>
                {list.map((itemData, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                  >
                    <div className="bg-sky-500 px-3 py-1.5 flex items-center justify-between">
                      <span className="text-white font-semibold text-xs">
                        {template?.itemLabel?.replace('#{index}', String(itemIndex + 1)) ?? `Элемент #${itemIndex + 1}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(itemIndex)}
                        className="text-white hover:bg-white/20 p-1 rounded-md transition-colors"
                        title={`Удалить ${template?.addButtonLabel?.toLowerCase() ?? 'элемент'}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="p-3 flex flex-col gap-2">
                      {template?.fields.map((tplField) => (
                        <div key={tplField.id}>
                          {renderTemplateField(tplField, itemIndex, itemData)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border-2 border-dashed border-sky-300 text-sky-600 rounded-xl hover:bg-sky-50 hover:border-sky-400 transition-all text-sm"
                  >
                    <Plus size={16} />
                    {template?.addButtonLabel ?? 'Добавить'}
                  </button>
                  {isCystGroup && cystCfg && multipleValue !== 'да' && (
                    <button
                      type="button"
                      onClick={() => onChange(cystCfg!.multipleFieldId!, 'да')}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border-2 border-dashed border-amber-300 text-amber-600 rounded-xl hover:bg-amber-50 hover:border-amber-400 transition-all text-sm"
                    >
                      <Plus size={16} />
                      Множественные кисты
                    </button>
                  )}
                  {isCystGroup && cystCfg && multipleValue === 'да' && (
                    <button
                      type="button"
                      onClick={() => {
                        onChange(cystCfg!.multipleFieldId!, 'нет')
                        if (cystCfg?.multipleSizeFieldId) {
                          onChange(cystCfg.multipleSizeFieldId, '')
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border-2 border-dashed border-amber-300 text-amber-600 rounded-xl hover:bg-amber-50 hover:border-amber-400 transition-all text-sm"
                    >
                      <Trash2 size={16} />
                      Удалить множественные кисты
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
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