import React, { useState, useCallback } from 'react'
import { Plus, Trash2, ChevronRight, ChevronDown, Settings } from 'lucide-react'
import type { ProtocolSchema, SectionDefinition, FieldsetDefinition, FieldDefinition, FieldType, NormalRange, RepeatingGroupTemplate, VisibleWhenCondition } from '../schema'
import { DynamicProtocolForm } from './DynamicProtocolForm'

// ============================================================
// Вспомогательные компоненты
// ============================================================

type TreeNodeType = 'section' | 'fieldset' | 'field'

interface TreeNode {
  type: TreeNodeType
  id: string
  label: string
  icon: string
  data: SectionDefinition | FieldsetDefinition | FieldDefinition
  parent?: TreeNode
  children?: TreeNode[]
  collapsed?: boolean
}

// Иконки для типов полей
const FIELD_ICONS: Record<FieldType, string> = {
  sizeRow: '📏',
  buttonSelect: '🔘',
  selectWithTextarea: '📝',
  textarea: '✏️',
  text: '📄',
  fieldset: '📁',
  repeatingGroup: '🔁',
}

// ============================================================
// Компонент дерева
// ============================================================

interface TreeNodeItemProps {
  node: TreeNode
  depth: number
  selectedId: string | null
  onSelect: (node: TreeNode) => void
  onToggleCollapse: (id: string) => void
}

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({ node, depth, selectedId, onSelect, onToggleCollapse }) => {
  const isSelected = selectedId === node.id
  const hasChildren = node.children && node.children.length > 0

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1.5 cursor-pointer rounded-md text-sm transition-colors ${
          isSelected
            ? 'bg-sky-100 text-sky-800 font-medium'
            : 'hover:bg-slate-100 text-slate-700'
        }`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={() => onSelect(node)}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleCollapse(node.id) }}
            className="p-0.5 text-slate-400 hover:text-slate-600"
          >
            {node.collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
          </button>
        ) : (
          <span className="w-5" />
        )}
        <span className="text-base mr-1">{node.icon}</span>
        <span className="truncate">{node.label}</span>
      </div>

      {hasChildren && !node.collapsed && (
        <div>
          {node.children!.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onToggleCollapse={onToggleCollapse}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Панель свойств для разных типов
// ============================================================

interface FieldPropertiesProps {
  field: FieldDefinition
  onChange: (field: FieldDefinition) => void
}

const FieldProperties: React.FC<FieldPropertiesProps> = ({ field, onChange }) => {
  const update = (partial: Partial<FieldDefinition>) => {
    onChange({ ...field, ...partial })
  }

  const fieldTypes: { value: FieldType; label: string }[] = [
    { value: 'sizeRow', label: '📏 Размер' },
    { value: 'buttonSelect', label: '🔘 Выбор кнопками' },
    { value: 'selectWithTextarea', label: '📝 Выбор + текст' },
    { value: 'textarea', label: '✏️ Текст (многострочный)' },
    { value: 'text', label: '📄 Текст (однострочный)' },
    { value: 'repeatingGroup', label: '🔁 Повторяющаяся группа' },
  ]

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-slate-500 font-medium">ID поля (техническое имя)</label>
        <input
          type="text"
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
          value={field.id}
          onChange={(e) => update({ id: e.target.value })}
        />
      </div>
      <div>
        <label className="text-xs text-slate-500 font-medium">Подпись (что видит пользователь)</label>
        <input
          type="text"
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
          value={field.label}
          onChange={(e) => update({ label: e.target.value })}
        />
      </div>
      <div>
        <label className="text-xs text-slate-500 font-medium">Тип поля</label>
        <select
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
          value={field.type}
          onChange={(e) => update({ type: e.target.value as FieldType })}
        >
          {fieldTypes.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {field.type === 'sizeRow' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 font-medium">Норма (мин)</label>
            <input
              type="number"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
              value={field.normalRange?.min ?? ''}
              onChange={(e) =>
                update({
                  normalRange: {
                    ...field.normalRange,
                    min: e.target.value ? Number(e.target.value) : undefined,
                  } as NormalRange,
                })
              }
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium">Норма (макс)</label>
            <input
              type="number"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
              value={field.normalRange?.max ?? ''}
              onChange={(e) =>
                update({
                  normalRange: {
                    ...field.normalRange,
                    max: e.target.value ? Number(e.target.value) : undefined,
                  } as NormalRange,
                })
              }
            />
          </div>
        </div>
      )}

      {(field.type === 'buttonSelect' || field.type === 'selectWithTextarea') && (
        <div>
          <label className="text-xs text-slate-500 font-medium">Варианты выбора</label>
          <div className="space-y-1.5 mt-1">
            {(field.options ?? []).map((opt, i) => (
              <div key={i} className="flex items-center gap-1">
                <input
                  type="text"
                  className="flex-1 text-sm border border-slate-200 rounded-lg px-2 py-1"
                  value={opt.value}
                  onChange={(e) => {
                    const updated = [...(field.options ?? [])]
                    updated[i] = { ...updated[i], value: e.target.value, label: e.target.value }
                    update({ options: updated })
                  }}
                  placeholder="Значение"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = (field.options ?? []).filter((_, j) => j !== i)
                    update({ options: updated })
                  }}
                  className="p-1 text-red-400 hover:text-red-600"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const updated = [...(field.options ?? []), { value: '', label: '' }]
                update({ options: updated })
              }}
              className="text-xs text-sky-600 hover:text-sky-800 flex items-center gap-1 mt-1"
            >
              <Plus size={12} /> Добавить вариант
            </button>
          </div>
        </div>
      )}

      {field.type === 'selectWithTextarea' && (
        <>
          <div>
            <label className="text-xs text-slate-500 font-medium">Триггер (значение для показа текста)</label>
            <input
              type="text"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
              value={field.triggerValue ?? ''}
              onChange={(e) => update({ triggerValue: e.target.value })}
              placeholder='например "определяются"'
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium">ID поля для доп. текста</label>
            <input
              type="text"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
              value={field.textareaId ?? ''}
              onChange={(e) => update({ textareaId: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium">Подпись поля для доп. текста</label>
            <input
              type="text"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
              value={field.textareaLabel ?? ''}
              onChange={(e) => update({ textareaLabel: e.target.value })}
            />
          </div>
        </>
      )}

      {field.type === 'textarea' && (
        <div>
          <label className="text-xs text-slate-500 font-medium">Количество строк</label>
          <input
            type="number"
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
            value={field.rows ?? 3}
            onChange={(e) => update({ rows: Number(e.target.value) || 3 })}
          />
        </div>
      )}

      {field.type === 'repeatingGroup' && (
        <div className="space-y-2 border-t border-slate-200 pt-2">
          <div className="text-xs font-semibold text-slate-600">Настройки повторяющейся группы</div>
          <div>
            <label className="text-xs text-slate-500">Шаблон заголовка</label>
            <input
              type="text"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
              value={field.repeatingGroup?.itemLabel ?? ''}
              onChange={(e) =>
                update({
                  repeatingGroup: {
                    ...(field.repeatingGroup ?? { fields: [] }),
                    itemLabel: e.target.value,
                  } as RepeatingGroupTemplate,
                })
              }
              placeholder='Конкремент #{index}'
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Текст кнопки добавления</label>
            <input
              type="text"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
              value={field.repeatingGroup?.addButtonLabel ?? ''}
              onChange={(e) =>
                update({
                  repeatingGroup: {
                    ...(field.repeatingGroup ?? { fields: [] }),
                    addButtonLabel: e.target.value,
                  } as RepeatingGroupTemplate,
                })
              }
              placeholder='Добавить конкремент'
            />
          </div>
        </div>
      )}

      {/* VisibleWhen */}
      <div className="border-t border-slate-200 pt-2">
        <label className="text-xs text-slate-500 font-medium">Условия показа (VisibleWhen)</label>
        <div className="space-y-1.5 mt-1">
          {(field.visibleWhen ?? []).map((cond, i) => (
            <div key={i} className="flex items-center gap-1">
              <input
                type="text"
                className="flex-1 text-sm border border-slate-200 rounded-lg px-2 py-1"
                value={cond.field}
                onChange={(e) => {
                  const updated = [...(field.visibleWhen ?? [])]
                  updated[i] = { ...updated[i], field: e.target.value }
                  update({ visibleWhen: updated })
                }}
                placeholder="ID поля"
              />
              <select
                className="text-sm border border-slate-200 rounded-lg px-2 py-1"
                value={cond.operator}
                onChange={(e) => {
                  const updated = [...(field.visibleWhen ?? [])]
                  updated[i] = { ...updated[i], operator: e.target.value as '==' | '>' | '<' | '>=' | '<=' }
                  update({ visibleWhen: updated })
                }}
              >
                <option value="==">=</option>
                <option value=">">{'>'}</option>
                <option value="<">{'<'}</option>
                <option value=">=">{'>='}</option>
                <option value="<=">{'<='}</option>
              </select>
              <input
                type="text"
                className="w-16 text-sm border border-slate-200 rounded-lg px-2 py-1"
                value={String(cond.value ?? '')}
                onChange={(e) => {
                  const updated = [...(field.visibleWhen ?? [])]
                  const val = e.target.value
                  updated[i] = { ...updated[i], value: isNaN(Number(val)) ? val : Number(val) }
                  update({ visibleWhen: updated })
                }}
                placeholder="Значение"
              />
              <button
                type="button"
                onClick={() => {
                  const updated = (field.visibleWhen ?? []).filter((_, j) => j !== i)
                  update({ visibleWhen: updated })
                }}
                className="p-1 text-red-400 hover:text-red-600"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const updated: VisibleWhenCondition[] = [...(field.visibleWhen ?? []), { field: '', operator: '==', value: '' }]
              update({ visibleWhen: updated })
            }}
            className="text-xs text-sky-600 hover:text-sky-800 flex items-center gap-1"
          >
            <Plus size={12} /> Добавить условие
          </button>
        </div>
      </div>
    </div>
  )
}

interface FieldsetPropertiesProps {
  fieldset: FieldsetDefinition
  onChange: (fieldset: FieldsetDefinition) => void
}

const FieldsetProperties: React.FC<FieldsetPropertiesProps> = ({ fieldset, onChange }) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-slate-500 font-medium">Название блока (fieldset)</label>
        <input
          type="text"
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
          value={fieldset.title}
          onChange={(e) => onChange({ ...fieldset, title: e.target.value })}
        />
      </div>
      <div className="text-xs text-slate-400">
        Этот блок содержит <strong>{fieldset.fields.length}</strong> полей. Управляйте полями через дерево слева.
      </div>
    </div>
  )
}

interface SectionPropertiesProps {
  section: SectionDefinition
  onChange: (section: SectionDefinition) => void
}

const SectionProperties: React.FC<SectionPropertiesProps> = ({ section, onChange }) => {
  const update = (partial: Partial<SectionDefinition>) => {
    onChange({ ...section, ...partial })
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-slate-500 font-medium">ID секции (техническое имя)</label>
        <input
          type="text"
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
          value={section.id}
          onChange={(e) => update({ id: e.target.value })}
        />
      </div>
      <div>
        <label className="text-xs text-slate-500 font-medium">Название (label)</label>
        <input
          type="text"
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
          value={section.label}
          onChange={(e) => update({ label: e.target.value })}
        />
      </div>
      <div>
        <label className="text-xs text-slate-500 font-medium">desktopKey (ключ в навигации)</label>
        <input
          type="text"
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
          value={section.desktopKey}
          onChange={(e) => update({ desktopKey: e.target.value })}
        />
      </div>
      <div className="text-xs text-slate-400">
        Секция содержит <strong>{(section.fieldsets ?? []).length}</strong> блоков полей.
      </div>
    </div>
  )
}

// ============================================================
// Основной компонент редактора
// ============================================================

interface ProtocolTreeEditorProps {
  schema: ProtocolSchema
  onChange: (schema: ProtocolSchema) => void
}

export const ProtocolTreeEditor: React.FC<ProtocolTreeEditorProps> = ({ schema, onChange }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set())

  // Сборка дерева из схемы
  const buildTree = useCallback((): TreeNode[] => {
    return schema.sections.map((section) => {
      const sectionNode: TreeNode = {
        type: 'section',
        id: section.id,
        label: section.label || 'Секция',
        icon: '📋',
        data: section,
        collapsed: collapsedNodes.has(section.id),
        children: (section.fieldsets ?? []).map((fieldset) => {
          const fieldsetNode: TreeNode = {
            type: 'fieldset',
            id: fieldset.id ?? `fieldset-${fieldset.title}`,
            label: fieldset.title || 'Блок полей',
            icon: '📁',
            data: fieldset,
            collapsed: collapsedNodes.has(fieldset.id ?? `fieldset-${fieldset.title}`),
            children: fieldset.fields.map((field) => ({
              type: 'field' as const,
              id: field.id,
              label: field.label || 'Поле',
              icon: FIELD_ICONS[field.type] || '📄',
              data: field,
            })),
          }
          return fieldsetNode
        }),
      }
      return sectionNode
    })
  }, [schema.sections, collapsedNodes])

  const tree = buildTree()

  // Поиск выделенного элемента в дереве
  const findSelectedNode = useCallback((): TreeNode | null => {
    for (const section of tree) {
      if (section.id === selectedId) return section
      for (const fieldset of section.children ?? []) {
        if (fieldset.id === selectedId) return fieldset
        for (const field of fieldset.children ?? []) {
          if (field.id === selectedId) return field
        }
      }
    }
    return null
  }, [tree, selectedId])

  const selectedNode = findSelectedNode()

  const handleToggleCollapse = (id: string) => {
    setCollapsedNodes((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSelect = (node: TreeNode) => {
    setSelectedId(node.id)
  }

  // --- Операции с секциями ---

  const addSection = () => {
    const newSection: SectionDefinition = {
      id: `section-${Date.now()}`,
      label: 'Новая секция',
      desktopKey: 'Новый протокол:новая секция',
      order: schema.sections.length + 1,
      fieldsets: [],
    }
    onChange({ ...schema, sections: [...schema.sections, newSection] })
    setSelectedId(newSection.id)
  }

  const updateSection = (index: number, section: SectionDefinition) => {
    const updated = [...schema.sections]
    updated[index] = section
    onChange({ ...schema, sections: updated })
  }

  const deleteSection = (index: number) => {
    onChange({
      ...schema,
      sections: schema.sections.filter((_, i) => i !== index),
    })
    setSelectedId(null as string | null)
  }

  // --- Операции с fieldsets ---

  const addFieldset = (sectionIndex: number) => {
    const newFieldset: FieldsetDefinition = {
      id: `fieldset-${Date.now()}`,
      title: 'Новый блок',
      fields: [],
    }
    const updated = [...schema.sections]
    updated[sectionIndex] = {
      ...updated[sectionIndex],
      fieldsets: [...(updated[sectionIndex].fieldsets ?? []), newFieldset],
    }
    onChange({ ...schema, sections: updated })
    setSelectedId(newFieldset.id!)
  }

  const updateFieldset = (sectionIndex: number, fsIndex: number, fieldset: FieldsetDefinition) => {
    const updated = [...schema.sections]
    const fieldsets = [...(updated[sectionIndex].fieldsets ?? [])]
    fieldsets[fsIndex] = fieldset
    updated[sectionIndex] = { ...updated[sectionIndex], fieldsets }
    onChange({ ...schema, sections: updated })
  }

  const deleteFieldset = (sectionIndex: number, fsIndex: number) => {
    const updated = [...schema.sections]
    updated[sectionIndex] = {
      ...updated[sectionIndex],
      fieldsets: (updated[sectionIndex].fieldsets ?? []).filter((_, i) => i !== fsIndex),
    }
    onChange({ ...schema, sections: updated })
    setSelectedId(null as string | null)
  }

  // --- Операции с полями ---

  const addField = (sectionIndex: number, fsIndex: number) => {
    const newField: FieldDefinition = {
      id: `field-${Date.now()}`,
      label: 'Новое поле',
      type: 'text',
    }
    const updated = [...schema.sections]
    const fieldsets = [...(updated[sectionIndex].fieldsets ?? [])]
    fieldsets[fsIndex] = {
      ...fieldsets[fsIndex],
      fields: [...fieldsets[fsIndex].fields, newField],
    }
    updated[sectionIndex] = { ...updated[sectionIndex], fieldsets }
    onChange({ ...schema, sections: updated })
    setSelectedId(newField.id)
  }

  const updateField = (sectionIndex: number, fsIndex: number, fieldIndex: number, field: FieldDefinition) => {
    const updated = [...schema.sections]
    const fieldsets = [...(updated[sectionIndex].fieldsets ?? [])]
    const fields = [...fieldsets[fsIndex].fields]
    fields[fieldIndex] = field
    fieldsets[fsIndex] = { ...fieldsets[fsIndex], fields }
    updated[sectionIndex] = { ...updated[sectionIndex], fieldsets }
    onChange({ ...schema, sections: updated })
  }

  const deleteField = (sectionIndex: number, fsIndex: number, fieldIndex: number) => {
    const updated = [...schema.sections]
    const fieldsets = [...(updated[sectionIndex].fieldsets ?? [])]
    fieldsets[fsIndex] = {
      ...fieldsets[fsIndex],
      fields: fieldsets[fsIndex].fields.filter((_, i) => i !== fieldIndex),
    }
    updated[sectionIndex] = { ...updated[sectionIndex], fieldsets }
    onChange({ ...schema, sections: updated })
    setSelectedId(null as string | null)
  }

  // Рендер панели свойств на основе выделенного узла
  const renderProperties = () => {
    if (!selectedNode) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm py-12">
          <Settings size={32} className="mb-2 opacity-40" />
          Выберите элемент в дереве, чтобы редактировать его свойства
        </div>
      )
    }

    switch (selectedNode.type) {
      case 'section': {
        const section = selectedNode.data as SectionDefinition
        const secIndex = schema.sections.findIndex((s) => s.id === section.id)
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Секция</h3>
              <button
                type="button"
                onClick={() => {
                  const idx = schema.sections.findIndex((s) => s.id === section.id)
                  if (idx >= 0) {
                    addFieldset(idx)
                  }
                }}
                className="text-xs px-2 py-1 rounded bg-sky-100 text-sky-700 hover:bg-sky-200 flex items-center gap-1"
              >
                <Plus size={12} /> Добавить блок
              </button>
            </div>
            <SectionProperties
              section={section}
              onChange={(updated) => {
                if (secIndex >= 0) updateSection(secIndex, updated)
              }}
            />
            {secIndex >= 0 && (
              <button
                type="button"
                onClick={() => deleteSection(secIndex)}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 size={12} /> Удалить секцию
              </button>
            )}
          </div>
        )
      }
      case 'fieldset': {
        const fieldset = selectedNode.data as FieldsetDefinition
        let secIndex = -1
        let fsIndex = -1
        for (let s = 0; s < schema.sections.length; s++) {
          const fsi = (schema.sections[s].fieldsets ?? []).findIndex((f) => f.id === fieldset.id)
          if (fsi >= 0) {
            secIndex = s
            fsIndex = fsi
            break
          }
        }
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Блок полей</h3>
              <button
                type="button"
                onClick={() => {
                  if (secIndex >= 0 && fsIndex >= 0) addField(secIndex, fsIndex)
                }}
                className="text-xs px-2 py-1 rounded bg-sky-100 text-sky-700 hover:bg-sky-200 flex items-center gap-1"
              >
                <Plus size={12} /> Добавить поле
              </button>
            </div>
            <FieldsetProperties
              fieldset={fieldset}
              onChange={(updated) => {
                if (secIndex >= 0 && fsIndex >= 0) updateFieldset(secIndex, fsIndex, updated)
              }}
            />
            {secIndex >= 0 && fsIndex >= 0 && (
              <button
                type="button"
                onClick={() => deleteFieldset(secIndex, fsIndex)}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 size={12} /> Удалить блок
              </button>
            )}
          </div>
        )
      }
      case 'field': {
        const field = selectedNode.data as FieldDefinition
        let secIndex = -1
        let fsIndex = -1
        let fIndex = -1
        for (let s = 0; s < schema.sections.length; s++) {
          for (let fs = 0; fs < (schema.sections[s].fieldsets ?? []).length; fs++) {
            const fi = (schema.sections[s].fieldsets?.[fs].fields ?? []).findIndex((f) => f.id === field.id)
            if (fi >= 0) {
              secIndex = s
              fsIndex = fs
              fIndex = fi
              break
            }
          }
        }
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Поле</h3>
              {secIndex >= 0 && fsIndex >= 0 && fIndex >= 0 && (
                <button
                  type="button"
                  onClick={() => deleteField(secIndex, fsIndex, fIndex)}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                  <Trash2 size={12} /> Удалить поле
                </button>
              )}
            </div>
            <FieldProperties
              field={field}
              onChange={(updated) => {
                if (secIndex >= 0 && fsIndex >= 0 && fIndex >= 0) {
                  updateField(secIndex, fsIndex, fIndex, updated)
                }
              }}
            />
          </div>
        )
      }
    }
  }

  return (
    <div className="flex gap-4">
      {/* Левая панель: дерево */}
      <div className="w-72 flex-shrink-0">
        <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">
              Структура ({schema.sections.length})
            </span>
            <button
              type="button"
              onClick={addSection}
              className="text-xs px-2 py-1 rounded bg-sky-100 text-sky-700 hover:bg-sky-200 flex items-center gap-1"
            >
              <Plus size={12} /> Секция
            </button>
          </div>
          <div className="p-2 max-h-[600px] overflow-y-auto">
            {tree.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-400">
                Добавьте секцию
              </div>
            ) : (
              tree.map((section) => (
                <TreeNodeItem
                  key={section.id}
                  node={section}
                  depth={0}
                  selectedId={selectedId}
                  onSelect={handleSelect}
                  onToggleCollapse={handleToggleCollapse}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Правая панель: свойства */}
      <div className="flex-1">
        <div className="border border-slate-200 rounded-xl bg-white p-4 min-h-[300px]">
          {renderProperties()}
        </div>
      </div>

      {/* Превью формы (внизу, если нужно раскомментировать) */}
      {schema.sections.length > 0 && (
        <div className="hidden">
          <DynamicProtocolForm schema={schema} />
        </div>
      )}
    </div>
  )
}

export default ProtocolTreeEditor