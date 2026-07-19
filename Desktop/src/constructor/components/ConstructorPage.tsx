import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Save, Eye, Edit3, Plus, Trash2, ChevronUp, ChevronDown, Printer, Upload, Download } from 'lucide-react'
import type { ProtocolSchema, SectionDefinition, FieldsetDefinition, FieldDefinition, FieldType, PrintTemplate } from '../schema'
import { DynamicProtocolForm } from './DynamicProtocolForm'
import { PrintTemplateEditor } from './PrintTemplateEditor'
import { loadCustomProtocols, saveCustomProtocol, exportProtocolToFile, importProtocolFromFile, loadCustomProtocolsSync } from '../utils/storage'

// =============== Компонент редактирования поля ===============

interface FieldEditorProps {
  field: FieldDefinition
  index: number
  onChange: (index: number, field: FieldDefinition) => void
  onDelete: (index: number) => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  isFirst: boolean
  isLast: boolean
}

const FieldEditor: React.FC<FieldEditorProps> = ({
  field,
  index,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) => {
  const update = (partial: Partial<FieldDefinition>) => {
    onChange(index, { ...field, ...partial })
  }

  const fieldTypes: { value: FieldType; label: string }[] = [
    { value: 'sizeRow', label: 'Размер (SizeRow)' },
    { value: 'buttonSelect', label: 'Выбор кнопками' },
    { value: 'selectWithTextarea', label: 'Выбор + текст' },
    { value: 'textarea', label: 'Текст (многострочный)' },
    { value: 'text', label: 'Текст (однострочный)' },
    { value: 'repeatingGroup', label: 'Повторяющаяся группа' },
  ]

  return (
    <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMoveUp(index)}
            disabled={isFirst}
            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            onClick={() => onMoveDown(index)}
            disabled={isLast}
            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
          >
            <ChevronDown size={14} />
          </button>
        </div>
        <span className="text-xs font-medium text-slate-400">Поле #{index + 1}</span>
        <button
          type="button"
          onClick={() => onDelete(index)}
          className="p-1 text-red-400 hover:text-red-600"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-slate-500">ID поля</label>
          <input
            type="text"
            className="w-full text-xs border border-slate-200 rounded px-2 py-1"
            value={field.id}
            onChange={(e) => update({ id: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">Тип</label>
          <select
            className="w-full text-xs border border-slate-200 rounded px-2 py-1"
            value={field.type}
            onChange={(e) => update({ type: e.target.value as FieldType })}
          >
            {fieldTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-xs text-slate-500">Подпись (label)</label>
          <input
            type="text"
            className="w-full text-xs border border-slate-200 rounded px-2 py-1"
            value={field.label}
            onChange={(e) => update({ label: e.target.value })}
          />
        </div>
      </div>

      {/* Дополнительные настройки в зависимости от типа */}
      {field.type === 'sizeRow' && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-slate-500">Норма мин</label>
            <input
              type="number"
              className="w-full text-xs border border-slate-200 rounded px-2 py-1"
              value={field.normalRange?.min ?? ''}
              onChange={(e) =>
                update({
                  normalRange: {
                    ...field.normalRange,
                    min: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Норма макс</label>
            <input
              type="number"
              className="w-full text-xs border border-slate-200 rounded px-2 py-1"
              value={field.normalRange?.max ?? ''}
              onChange={(e) =>
                update({
                  normalRange: {
                    ...field.normalRange,
                    max: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
            />
          </div>
        </div>
      )}

      {(field.type === 'buttonSelect' || field.type === 'selectWithTextarea') && (
        <div>
          <label className="text-xs text-slate-500">Опции (JSON: [{'"value":"","label":""}'}])</label>
          <textarea
            className="w-full text-xs border border-slate-200 rounded px-2 py-1 font-mono"
            rows={3}
            value={JSON.stringify(field.options ?? [], null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value)
                if (Array.isArray(parsed)) update({ options: parsed })
              } catch { /* ignore invalid JSON */ }
            }}
          />
        </div>
      )}

      {field.type === 'selectWithTextarea' && (
        <>
          <div>
            <label className="text-xs text-slate-500">Триггер (значение для показа textarea)</label>
            <input
              type="text"
              className="w-full text-xs border border-slate-200 rounded px-2 py-1"
              value={field.triggerValue ?? ''}
              onChange={(e) => update({ triggerValue: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">ID textarea</label>
            <input
              type="text"
              className="w-full text-xs border border-slate-200 rounded px-2 py-1"
              value={field.textareaId ?? ''}
              onChange={(e) => update({ textareaId: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Подпись textarea</label>
            <input
              type="text"
              className="w-full text-xs border border-slate-200 rounded px-2 py-1"
              value={field.textareaLabel ?? ''}
              onChange={(e) => update({ textareaLabel: e.target.value })}
            />
          </div>
        </>
      )}

      {field.type === 'textarea' && (
        <div>
          <label className="text-xs text-slate-500">Кол-во строк (rows)</label>
          <input
            type="number"
            className="w-full text-xs border border-slate-200 rounded px-2 py-1"
            value={field.rows ?? 3}
            onChange={(e) => update({ rows: Number(e.target.value) || 3 })}
          />
        </div>
      )}

      {/* Редактор для repeatingGroup */}
      {field.type === 'repeatingGroup' && (
        <div className="border-t border-slate-200 pt-2 space-y-2">
          <div className="text-xs font-semibold text-slate-600">Настройки повторяющейся группы</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-500">Шаблон заголовка (itemLabel)</label>
              <input
                type="text"
                className="w-full text-xs border border-slate-200 rounded px-2 py-1"
                value={field.repeatingGroup?.itemLabel ?? ''}
                onChange={(e) =>
                  update({
                    repeatingGroup: {
                      ...(field.repeatingGroup ?? { fields: [] }),
                      itemLabel: e.target.value,
                    },
                  })
                }
                placeholder="Конкремент #{index}"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Текст кнопки (addButtonLabel)</label>
              <input
                type="text"
                className="w-full text-xs border border-slate-200 rounded px-2 py-1"
                value={field.repeatingGroup?.addButtonLabel ?? ''}
                onChange={(e) =>
                  update({
                    repeatingGroup: {
                      ...(field.repeatingGroup ?? { fields: [] }),
                      addButtonLabel: e.target.value,
                    },
                  })
                }
                placeholder="Добавить конкремент"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500">Опции триггера (JSON)</label>
            <textarea
              className="w-full text-xs border border-slate-200 rounded px-2 py-1 font-mono"
              rows={2}
              value={JSON.stringify(field.repeatingGroup?.triggerOptions ?? [
                { value: 'не определяются', label: 'не определяются' },
                { value: 'определяются', label: 'определяются' },
              ], null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value)
                  if (Array.isArray(parsed))
                    update({
                      repeatingGroup: {
                        ...(field.repeatingGroup ?? { fields: [] }),
                        triggerOptions: parsed,
                      },
                    })
                } catch { /* ignore invalid JSON */ }
              }}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Поля шаблона (JSON): [{'"id":"","label":"","type":"sizeRow"}'}]</label>
            <textarea
              className="w-full text-xs border border-slate-200 rounded px-2 py-1 font-mono"
              rows={4}
              value={JSON.stringify(field.repeatingGroup?.fields ?? [], null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value)
                  if (Array.isArray(parsed))
                    update({
                      repeatingGroup: {
                        ...(field.repeatingGroup ?? { fields: [] }),
                        fields: parsed,
                      },
                    })
                } catch { /* ignore invalid JSON */ }
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// =============== Компонент редактора секции ===============

interface SectionEditorProps {
  section: SectionDefinition
  index: number
  onChange: (index: number, section: SectionDefinition) => void
  onDelete: (index: number) => void
}

const SectionEditor: React.FC<SectionEditorProps> = ({ section, index, onChange, onDelete }) => {
  const updateSection = (partial: Partial<SectionDefinition>) => {
    onChange(index, { ...section, ...partial })
  }

  const addFieldset = () => {
    const newFieldset: FieldsetDefinition = {
      id: `fieldset-${Date.now()}`,
      title: 'Новый блок',
      fields: [],
    }
    updateSection({
      fieldsets: [...(section.fieldsets ?? []), newFieldset],
    })
  }

  const updateFieldset = (fsIndex: number, fieldset: FieldsetDefinition) => {
    const updated = [...(section.fieldsets ?? [])]
    updated[fsIndex] = fieldset
    updateSection({ fieldsets: updated })
  }

  const deleteFieldset = (fsIndex: number) => {
    const updated = (section.fieldsets ?? []).filter((_, i) => i !== fsIndex)
    updateSection({ fieldsets: updated })
  }

  const addField = (fsIndex: number) => {
    const newField: FieldDefinition = {
      id: `field-${Date.now()}`,
      label: 'Новое поле',
      type: 'text',
    }
    const updated = [...(section.fieldsets ?? [])]
    updated[fsIndex] = {
      ...updated[fsIndex],
      fields: [...updated[fsIndex].fields, newField],
    }
    updateSection({ fieldsets: updated })
  }

  const updateField = (fsIndex: number, fieldIndex: number, field: FieldDefinition) => {
    const updated = [...(section.fieldsets ?? [])]
    updated[fsIndex] = {
      ...updated[fsIndex],
      fields: updated[fsIndex].fields.map((f, i) => (i === fieldIndex ? field : f)),
    }
    updateSection({ fieldsets: updated })
  }

  const deleteField = (fsIndex: number, fieldIndex: number) => {
    const updated = [...(section.fieldsets ?? [])]
    updated[fsIndex] = {
      ...updated[fsIndex],
      fields: updated[fsIndex].fields.filter((_, i) => i !== fieldIndex),
    }
    updateSection({ fieldsets: updated })
  }

  const moveField = (fsIndex: number, fieldIndex: number, direction: -1 | 1) => {
    const fields = [...(section.fieldsets?.[fsIndex]?.fields ?? [])]
    const newIndex = fieldIndex + direction
    if (newIndex < 0 || newIndex >= fields.length) return
    ;[fields[fieldIndex], fields[newIndex]] = [fields[newIndex], fields[fieldIndex]]
    const updated = [...(section.fieldsets ?? [])]
    updated[fsIndex] = { ...updated[fsIndex], fields }
    updateSection({ fieldsets: updated })
  }

  return (
    <div className="border-2 border-sky-200 rounded-xl p-4 bg-sky-50 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-sky-700">Секция #{index + 1}</span>
        <button
          type="button"
          onClick={() => onDelete(index)}
          className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
        >
          <Trash2 size={12} /> Удалить секцию
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs text-slate-500">ID секции</label>
          <input
            type="text"
            className="w-full text-xs border border-slate-200 rounded px-2 py-1"
            value={section.id}
            onChange={(e) => updateSection({ id: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">Название (label)</label>
          <input
            type="text"
            className="w-full text-xs border border-slate-200 rounded px-2 py-1"
            value={section.label}
            onChange={(e) => updateSection({ label: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">desktopKey</label>
          <input
            type="text"
            className="w-full text-xs border border-slate-200 rounded px-2 py-1"
            value={section.desktopKey}
            onChange={(e) => updateSection({ desktopKey: e.target.value })}
          />
        </div>
      </div>

      {/* Fieldset'ы */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">Блоки полей (Fieldset):</span>
          <button
            type="button"
            onClick={addFieldset}
            className="text-xs text-sky-600 hover:text-sky-800 flex items-center gap-1"
          >
            <Plus size={12} /> Добавить блок
          </button>
        </div>

        {(section.fieldsets ?? []).map((fieldset, fsIndex) => (
          <div key={fieldset.id ?? fsIndex} className="border border-slate-200 rounded-lg p-3 bg-white space-y-2">
            <div className="flex items-center justify-between">
              <input
                type="text"
                className="text-sm font-medium border-none bg-transparent px-0 py-0 w-auto"
                value={fieldset.title}
                onChange={(e) => updateFieldset(fsIndex, { ...fieldset, title: e.target.value })}
              />
              <button
                type="button"
                onClick={() => deleteFieldset(fsIndex)}
                className="text-xs text-red-400 hover:text-red-600"
              >
                <Trash2 size={12} />
              </button>
            </div>

            <div className="space-y-2">
              {(fieldset.fields ?? []).map((field, fIndex) => (
                <FieldEditor
                  key={field.id}
                  field={field}
                  index={fIndex}
                  onChange={(_, f) => updateField(fsIndex, fIndex, f)}
                  onDelete={() => deleteField(fsIndex, fIndex)}
                  onMoveUp={(i) => moveField(fsIndex, i, -1)}
                  onMoveDown={(i) => moveField(fsIndex, i, 1)}
                  isFirst={fIndex === 0}
                  isLast={fIndex === (fieldset.fields.length - 1)}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => addField(fsIndex)}
              className="text-xs text-sky-600 hover:text-sky-800 flex items-center gap-1"
            >
              <Plus size={12} /> Добавить поле
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// =============== Главный компонент конструктора ===============

export const ConstructorPage: React.FC = () => {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [activeTab, setActiveTab] = useState<'sections' | 'print'>('sections')
  const [schema, setSchema] = useState<ProtocolSchema>({
    id: 'custom-protocol',
    selectionLabel: 'Мой протокол',
    title: 'Мой протокол',
    description: 'Описание протокола',
    sections: [],
  })
  const [customProtocols, setCustomProtocols] = useState<ProtocolSchema[]>(loadCustomProtocolsSync())
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [showSavedList, setShowSavedList] = useState(false)
  const protocolsLoadedRef = useRef(false)

  // Асинхронная загрузка протоколов при монтировании
  useEffect(() => {
    if (!protocolsLoadedRef.current) {
      protocolsLoadedRef.current = true
      loadCustomProtocols().then((list) => {
        if (list.length > 0) setCustomProtocols(list)
      })
    }
  }, [])

  const updateSchema = (partial: Partial<ProtocolSchema>) => {
    setSchema((prev) => ({ ...prev, ...partial }))
  }

  const addSection = () => {
    const newSection: SectionDefinition = {
      id: `section-${Date.now()}`,
      label: 'Новая секция',
      desktopKey: `Новый протокол:новая секция`,
      order: schema.sections.length + 1,
      fieldsets: [],
    }
    updateSchema({ sections: [...schema.sections, newSection] })
  }

  const updateSection = (index: number, section: SectionDefinition) => {
    const updated = [...schema.sections]
    updated[index] = section
    updateSchema({ sections: updated })
  }

  const deleteSection = (index: number) => {
    updateSchema({ sections: schema.sections.filter((_, i) => i !== index) })
  }

  const handleSave = useCallback(async () => {
    if (!schema.id || !schema.selectionLabel) {
      setSaveMessage('❌ Укажите ID и название протокола')
      return
    }

    const success = await saveCustomProtocol(schema)
    if (success) {
      // Обновляем список
      const updatedList = await loadCustomProtocols()
      setCustomProtocols(updatedList)
      setSaveMessage(`✅ Протокол "${schema.selectionLabel}" сохранён!`)

      window.dispatchEvent(
        new CustomEvent('protocol-register-custom', { detail: schema })
      )
    } else {
      setSaveMessage('❌ Ошибка сохранения')
    }

    setTimeout(() => setSaveMessage(null), 3000)
  }, [schema])

  const handlePrintTemplateChange = useCallback((template: PrintTemplate | undefined) => {
    setSchema((prev) => ({ ...prev, printTemplate: template }))
  }, [])

  const loadProtocol = useCallback((p: ProtocolSchema) => {
    setSchema(JSON.parse(JSON.stringify(p)))
    setShowSavedList(false)
  }, [])

  const handleExport = useCallback(async () => {
    await exportProtocolToFile(schema)
  }, [schema])

  const handleImport = useCallback(async () => {
    const result = await importProtocolFromFile()
    if (result.success && result.data) {
      setSchema(result.data)
      setSaveMessage(`✅ Загружен протокол "${result.data.selectionLabel}"`)
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }, [])

  const refreshProtocols = useCallback(async () => {
    const list = await loadCustomProtocols()
    setCustomProtocols(list)
  }, [])

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      {/* Заголовок и кнопки */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-slate-800">Конструктор протоколов</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setShowSavedList(!showSavedList); if (!showSavedList) refreshProtocols() }}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Сохранённые ({customProtocols.length})
          </button>
          <button
            type="button"
            onClick={handleImport}
            className="text-xs px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 flex items-center gap-1"
          >
            <Upload size={14} /> Импорт
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="text-xs px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 flex items-center gap-1"
          >
            <Download size={14} /> Экспорт
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === 'edit' ? 'preview' : 'edit')}
            className="text-xs px-3 py-1.5 rounded-lg bg-sky-100 text-sky-700 hover:bg-sky-200 flex items-center gap-1"
          >
            {mode === 'edit' ? <Eye size={14} /> : <Edit3 size={14} />}
            {mode === 'edit' ? 'Предпросмотр' : 'Редактор'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1"
          >
            <Save size={14} /> Сохранить
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="mb-4 px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
          {saveMessage}
        </div>
      )}

      {/* Список сохранённых протоколов */}
      {showSavedList && customProtocols.length > 0 && (
        <div className="mb-4 p-3 border border-slate-200 rounded-xl bg-white space-y-2">
          <h3 className="text-sm font-semibold text-slate-700">
            Сохранённые протоколы
            <button
              type="button"
              onClick={refreshProtocols}
              className="ml-2 text-xs text-sky-500 hover:text-sky-700"
            >
              (обновить)
            </button>
          </h3>
          {customProtocols.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{p.selectionLabel}</span>
                <span className="text-xs text-slate-400">({p.sections.length} секций)</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => loadProtocol(p)}
                  className="text-xs text-sky-600 hover:text-sky-800"
                >
                  Загрузить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Вкладки: Секции / Печать */}
      {mode === 'edit' && (
        <div className="flex items-center gap-1 mb-4 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('sections')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'sections'
                ? 'border-sky-500 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Edit3 size={14} className="inline mr-1" /> Секции
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('print')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'print'
                ? 'border-sky-500 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Printer size={14} className="inline mr-1" /> Печать
          </button>
        </div>
      )}

      {mode === 'edit' ? (
        /* ===== РЕДАКТОР ===== */
        <div className="space-y-4">
          {activeTab === 'print' ? (
            <PrintTemplateEditor
              template={schema.printTemplate}
              onChange={handlePrintTemplateChange}
            />
          ) : (
            <>
              {/* Основные настройки протокола */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                <h2 className="text-sm font-semibold text-slate-700">Основные настройки</h2>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-slate-500">ID протокола</label>
                    <input
                      type="text"
                      className="w-full text-sm border border-slate-200 rounded px-2 py-1"
                      value={schema.id}
                      onChange={(e) => updateSchema({ id: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Название (selectionLabel)</label>
                    <input
                      type="text"
                      className="w-full text-sm border border-slate-200 rounded px-2 py-1"
                      value={schema.selectionLabel}
                      onChange={(e) => updateSchema({ selectionLabel: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-slate-500">Заголовок (title)</label>
                    <input
                      type="text"
                      className="w-full text-sm border border-slate-200 rounded px-2 py-1"
                      value={schema.title}
                      onChange={(e) => updateSchema({ title: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Описание</label>
                  <input
                    type="text"
                    className="w-full text-sm border border-slate-200 rounded px-2 py-1"
                    value={schema.description}
                    onChange={(e) => updateSchema({ description: e.target.value })}
                  />
                </div>
              </div>

              {/* Секции */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-700">Секции ({schema.sections.length})</h2>
                  <button
                    type="button"
                    onClick={addSection}
                    className="text-xs px-3 py-1.5 rounded-lg bg-sky-600 text-white hover:bg-sky-700 flex items-center gap-1"
                  >
                    <Plus size={14} /> Добавить секцию
                  </button>
                </div>

                {schema.sections.map((section, i) => (
                  <SectionEditor
                    key={section.id}
                    section={section}
                    index={i}
                    onChange={updateSection}
                    onDelete={deleteSection}
                  />
                ))}

                {schema.sections.length === 0 && (
                  <div className="text-center py-8 text-sm text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                    Нажмите "Добавить секцию", чтобы начать собирать протокол
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        /* ===== ПРЕДПРОСМОТР ===== */
        <div className="border border-slate-200 rounded-xl p-4 bg-white">
          <div className="text-xs text-slate-400 mb-3 italic">
            Предпросмотр протокола "<strong>{schema.selectionLabel}</strong>"
          </div>
          <DynamicProtocolForm schema={schema} />
        </div>
      )}
    </div>
  )
}

export default ConstructorPage