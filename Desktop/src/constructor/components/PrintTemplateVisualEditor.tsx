import React, { useState, useCallback } from 'react'
import { Plus, Trash2, ChevronRight, ChevronDown, Settings, GripVertical } from 'lucide-react'
import type {
  PrintTemplate,
  PrintBlock,
  PrintSection,
  PrintField,
  PrintFieldValues,
  PrintFieldValueItem,
  PrintSelectWithTextarea,
  PrintConditionalField,
  PrintConcretionList,
  PrintPolypList,
  PrintPancreasSizes,
  PrintText,
  PrintFreeFluid,
  PrintConclusion,
  PrintRecommendations,
} from '../schema'

// ============================================================
// Типы дерева
// ============================================================

type TreeNodeType = 'block' | 'printField'

interface TreeNode {
  type: TreeNodeType
  id: string
  label: string
  icon: string
  data: PrintBlock | PrintField
  blockIndex: number
  fieldIndex?: number
  children?: TreeNode[]
  collapsed?: boolean
}

const BLOCK_ICONS: Record<string, string> = {
  section: '🧩',
  freeFluid: '💧',
  conclusion: '📝',
  recommendations: '📋',
}

const FIELD_ICONS: Record<string, string> = {
  fieldValues: '📊',
  selectWithTextarea: '🎯',
  conditional: '🔀',
  concretionList: '💎',
  polypList: '🩹',
  pancreasSizes: '🧮',
  text: '📄',
}

// ============================================================
// Компонент узла дерева
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
// Вспомогательные функции
// ============================================================

function createDefaultBlock(type: string): PrintBlock {
  switch (type) {
    case 'section':
      return { type: 'section', label: 'Новая секция', fields: [] } as PrintSection
    case 'freeFluid':
      return { type: 'freeFluid', field: '', detailsField: '', templates: { notDetermined: '', determinedEmpty: '' } } as PrintFreeFluid
    case 'conclusion':
      return { type: 'conclusion', field: '', label: 'Заключение' } as PrintConclusion
    case 'recommendations':
      return { type: 'recommendations', field: '', label: 'Рекомендации' } as PrintRecommendations
    default:
      return { type: 'section', label: '', fields: [] } as PrintSection
  }
}

function createDefaultPrintField(type: string): PrintField {
  switch (type) {
    case 'fieldValues':
      return { type: 'fieldValues', fields: [] } as PrintFieldValues
    case 'selectWithTextarea':
      return { type: 'selectWithTextarea', field: '', notSelectedText: '', triggerValue: '', textareaField: '' } as PrintSelectWithTextarea
    case 'conditional':
      return { type: 'conditional', field: '', values: {} } as PrintConditionalField
    case 'concretionList':
      return {
        type: 'concretionList',
        trigger: { field: '', notSelectedText: '' },
        list: { field: '', emptyText: '' },
        item: { sizeField: '', positionField: '' },
        templates: {
          positionPrefix: 'В области ',
          positionJoinWord: ' и ',
          sizePrefix: 'размерами до ',
          sizeUnit: ' мм',
          sizeJoinWord: ' и ',
          acoustic: 'с акустической тенью',
          labels: { one: '', few: '', many: '' },
        },
      } as PrintConcretionList
    case 'polypList':
      return {
        type: 'polypList',
        trigger: { field: '', notSelectedText: '' },
        list: { field: '', emptyText: '' },
        item: { sizeField: '', positionField: '', wallField: '' },
        templates: {
          positionPrefix: 'В области ',
          positionJoinWord: ' и ',
          wallPrefix: ', ',
          wallJoinWord: ' и ',
          wallSingleSuffix: ' стенке',
          wallBothText: 'по передней и задней стенкам',
          sizePrefix: 'размерами до ',
          sizeUnit: ' мм',
          sizeJoinWord: ' и ',
          acoustic: 'без акустической тени',
          participleSingle: 'выступающее из стенки органа в просвет, неподвижное при смене положения',
          participleFew: 'выступающие из стенки органа в просвет, неподвижные при смене положения',
          labels: { one: '', few: '' },
        },
      } as PrintPolypList
    case 'pancreasSizes':
      return {
        type: 'pancreasSizes',
        fields: { head: '', body: '', tail: '' },
        templates: { hasValue: '', noValue: '' },
      } as PrintPancreasSizes
    case 'text':
      return { type: 'text', text: '' } as PrintText
    default:
      return { type: 'text', text: '' } as PrintText
  }
}

function getBlockLabel(block: PrintBlock): string {
  switch (block.type) {
    case 'section': return (block as PrintSection).label || 'Секция'
    case 'freeFluid': return 'Свободная жидкость'
    case 'conclusion': return (block as PrintConclusion).label || 'Заключение'
    case 'recommendations': return (block as PrintRecommendations).label || 'Рекомендации'
    default: return 'Блок'
  }
}

function getFieldLabel(field: PrintField): string {
  switch (field.type) {
    case 'fieldValues': return 'Группа значений'
    case 'selectWithTextarea': return 'Выбор + текст'
    case 'conditional': return 'Условный вывод'
    case 'concretionList': return 'Список конкрементов'
    case 'polypList': return 'Список полипов'
    case 'pancreasSizes': return 'Размеры ПЖ'
    case 'text': return 'Статический текст'
    default: return 'Поле'
  }
}

// ============================================================
// Редакторы блоков верхнего уровня
// ============================================================

interface BlockSectionEditorProps {
  block: PrintSection
  onChange: (block: PrintSection) => void
}

const BlockSectionEditor: React.FC<BlockSectionEditorProps> = ({ block, onChange }) => {
  const update = (partial: Partial<PrintSection>) => {
    onChange({ ...block, ...partial })
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-slate-500 font-medium">Заголовок секции (label)</label>
        <input
          type="text"
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
          value={block.label}
          onChange={(e) => update({ label: e.target.value })}
          placeholder="Печень"
        />
      </div>
      <div>
        <label className="text-xs text-slate-500 font-medium">ID поля для спец. условия (опционально)</label>
        <input
          type="text"
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
          value={block.specialConditionField ?? ''}
          onChange={(e) => update({ specialConditionField: e.target.value || undefined })}
          placeholder="liverStatus"
        />
      </div>
      {block.specialConditionField && (
        <>
          <div>
            <label className="text-xs text-slate-500 font-medium">Текст при спец. условии</label>
            <input
              type="text"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
              value={block.specialConditionText ?? ''}
              onChange={(e) => update({ specialConditionText: e.target.value || undefined })}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium">Доп. поле для спец. условия</label>
            <input
              type="text"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
              value={block.specialConditionAdditionalField ?? ''}
              onChange={(e) => update({ specialConditionAdditionalField: e.target.value || undefined })}
            />
          </div>
        </>
      )}
      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-500 font-medium">Капитализация</label>
        <input
          type="checkbox"
          className="rounded border-slate-300"
          checked={block.capitalize ?? false}
          onChange={(e) => update({ capitalize: e.target.checked || undefined })}
        />
      </div>
    </div>
  )
}

interface BlockFreeFluidEditorProps {
  block: PrintFreeFluid
  onChange: (block: PrintFreeFluid) => void
}

const BlockFreeFluidEditor: React.FC<BlockFreeFluidEditorProps> = ({ block, onChange }) => {
  const update = (partial: Partial<PrintFreeFluid>) => {
    onChange({ ...block, ...partial })
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-slate-500 font-medium">Поле триггера (field)</label>
        <input
          type="text"
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
          value={block.field}
          onChange={(e) => update({ field: e.target.value })}
          placeholder="freeFluid"
        />
      </div>
      <div>
        <label className="text-xs text-slate-500 font-medium">Поле для деталей (detailsField)</label>
        <input
          type="text"
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
          value={block.detailsField}
          onChange={(e) => update({ detailsField: e.target.value })}
          placeholder="freeFluidDetails"
        />
      </div>
      <div>
        <label className="text-xs text-slate-500 font-medium">Текст когда "не определяется"</label>
        <input
          type="text"
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
          value={block.templates.notDetermined}
          onChange={(e) => update({ templates: { ...block.templates, notDetermined: e.target.value } })}
          placeholder="Свободная жидкость не определяется"
        />
      </div>
      <div>
        <label className="text-xs text-slate-500 font-medium">Текст когда "определяется, но пусто"</label>
        <input
          type="text"
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
          value={block.templates.determinedEmpty}
          onChange={(e) => update({ templates: { ...block.templates, determinedEmpty: e.target.value } })}
          placeholder="Свободная жидкость определяется"
        />
      </div>
    </div>
  )
}

interface BlockConclusionEditorProps {
  block: PrintConclusion
  onChange: (block: PrintConclusion) => void
}

const BlockConclusionEditor: React.FC<BlockConclusionEditorProps> = ({ block, onChange }) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-slate-500 font-medium">ID поля для заключения</label>
        <input
          type="text"
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
          value={block.field}
          onChange={(e) => onChange({ ...block, field: e.target.value })}
          placeholder="conclusion"
        />
      </div>
      <div>
        <label className="text-xs text-slate-500 font-medium">Заголовок (label)</label>
        <input
          type="text"
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
          value={block.label}
          onChange={(e) => onChange({ ...block, label: e.target.value })}
          placeholder="Заключение"
        />
      </div>
    </div>
  )
}

interface BlockRecommendationsEditorProps {
  block: PrintRecommendations
  onChange: (block: PrintRecommendations) => void
}

const BlockRecommendationsEditor: React.FC<BlockRecommendationsEditorProps> = ({ block, onChange }) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-slate-500 font-medium">ID поля для рекомендаций</label>
        <input
          type="text"
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
          value={block.field}
          onChange={(e) => onChange({ ...block, field: e.target.value })}
          placeholder="recommendations"
        />
      </div>
      <div>
        <label className="text-xs text-slate-500 font-medium">Заголовок (label)</label>
        <input
          type="text"
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
          value={block.label}
          onChange={(e) => onChange({ ...block, label: e.target.value })}
          placeholder="Рекомендации"
        />
      </div>
    </div>
  )
}

// ============================================================
// Редакторы полей печати
// ============================================================

interface FieldValuesEditorProps {
  field: PrintFieldValues
  onChange: (field: PrintFieldValues) => void
}

const FieldValuesEditor: React.FC<FieldValuesEditorProps> = ({ field, onChange }) => {
  const update = (partial: Partial<PrintFieldValues>) => {
    onChange({ ...field, ...partial })
  }

  const addItem = () => {
    const newItem: PrintFieldValueItem = { field: '', template: '{value}' }
    update({ fields: [...field.fields, newItem] })
  }

  const updateItem = (index: number, item: PrintFieldValueItem) => {
    const updated = [...field.fields]
    updated[index] = item
    update({ fields: updated })
  }

  const removeItem = (index: number) => {
    update({ fields: field.fields.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-slate-600">Поля для вывода</div>
      <div className="space-y-2">
        {field.fields.map((item, i) => (
          <div key={i} className="border border-slate-200 rounded-lg p-2 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Поле #{i + 1}</span>
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="p-1 text-red-400 hover:text-red-600"
              >
                <Trash2 size={12} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400">ID поля</label>
                <input
                  type="text"
                  className="w-full text-xs border border-slate-200 rounded px-2 py-1"
                  value={item.field}
                  onChange={(e) => updateItem(i, { ...item, field: e.target.value })}
                  placeholder="liverSize"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Шаблон</label>
                <input
                  type="text"
                  className="w-full text-xs border border-slate-200 rounded px-2 py-1"
                  value={item.template}
                  onChange={(e) => updateItem(i, { ...item, template: e.target.value })}
                  placeholder="размером {value}"
                />
              </div>
            </div>
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                className="rounded border-slate-300"
                checked={item.optional ?? false}
                onChange={(e) => updateItem(i, { ...item, optional: e.target.checked })}
              />
              <span className="text-xs text-slate-500">Опциональное (не блокирует секцию)</span>
            </label>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="text-xs text-sky-600 hover:text-sky-800 flex items-center gap-1"
        >
          <Plus size={12} /> Добавить поле
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-500 font-medium">Разделитель</label>
          <input
            type="text"
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
            value={field.separator ?? ''}
            onChange={(e) => update({ separator: e.target.value || undefined })}
            placeholder=", "
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 font-medium">Суффикс</label>
          <input
            type="text"
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
            value={field.suffix ?? ''}
            onChange={(e) => update({ suffix: e.target.value || undefined })}
            placeholder=" мм"
          />
        </div>
      </div>
      <label className="flex items-center gap-1.5">
        <input
          type="checkbox"
          className="rounded border-slate-300"
          checked={field.optional ?? false}
          onChange={(e) => update({ optional: e.target.checked || undefined })}
        />
        <span className="text-xs text-slate-500">Опциональная группа (скрывать если пусто)</span>
      </label>
    </div>
  )
}

interface SelectWithTextareaEditorProps {
  field: PrintSelectWithTextarea
  onChange: (field: PrintSelectWithTextarea) => void
}

const SelectWithTextareaEditor: React.FC<SelectWithTextareaEditorProps> = ({ field, onChange }) => {
  const update = (partial: Partial<PrintSelectWithTextarea>) => {
    onChange({ ...field, ...partial })
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-slate-500 font-medium">ID поля-триггера (field)</label>
        <input
          type="text"
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
          value={field.field}
          onChange={(e) => update({ field: e.target.value })}
          placeholder="gallBladder"
        />
      </div>
      <div>
        <label className="text-xs text-slate-500 font-medium">Текст когда не выбрано</label>
        <input
          type="text"
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
          value={field.notSelectedText}
          onChange={(e) => update({ notSelectedText: e.target.value })}
          placeholder="Желчный пузырь не изменён"
        />
      </div>
      <div>
        <label className="text-xs text-slate-500 font-medium">Значение-триггер (triggerValue)</label>
        <input
          type="text"
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
          value={field.triggerValue}
          onChange={(e) => update({ triggerValue: e.target.value })}
          placeholder='например "определяются"'
        />
      </div>
      <div>
        <label className="text-xs text-slate-500 font-medium">ID поля textarea</label>
        <input
          type="text"
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
          value={field.textareaField}
          onChange={(e) => update({ textareaField: e.target.value })}
          placeholder="gallBladderDetails"
        />
      </div>
      <div>
        <label className="text-xs text-slate-500 font-medium">Текст когда триггер выбран, но textarea пуста (опционально)</label>
        <input
          type="text"
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
          value={field.selectedFallbackText ?? ''}
          onChange={(e) => update({ selectedFallbackText: e.target.value || undefined })}
        />
      </div>
      <div>
        <label className="text-xs text-slate-500 font-medium">Префикс (опционально)</label>
        <input
          type="text"
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
          value={field.prefix ?? ''}
          onChange={(e) => update({ prefix: e.target.value || undefined })}
          placeholder="Стенка: "
        />
      </div>
    </div>
  )
}

interface ConditionalFieldEditorProps {
  field: PrintConditionalField
  onChange: (field: PrintConditionalField) => void
}

const ConditionalFieldEditor: React.FC<ConditionalFieldEditorProps> = ({ field, onChange }) => {
  const update = (partial: Partial<PrintConditionalField>) => {
    onChange({ ...field, ...partial })
  }

  const entries = Object.entries(field.values)

  const addEntry = () => {
    update({ values: { ...field.values, '': '' } })
  }

  const updateEntry = (oldKey: string, newKey: string, value: string) => {
    const newValues = { ...field.values }
    delete newValues[oldKey]
    newValues[newKey] = value
    update({ values: newValues })
  }

  const removeEntry = (key: string) => {
    const newValues = { ...field.values }
    delete newValues[key]
    update({ values: newValues })
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-slate-500 font-medium">ID поля (field)</label>
        <input
          type="text"
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
          value={field.field}
          onChange={(e) => update({ field: e.target.value })}
          placeholder="gallBladderShape"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600">Соответствия (значение поля → текст)</label>
        <div className="space-y-2 mt-1">
          {entries.map(([key, val]) => (
            <div key={key} className="flex items-center gap-1">
              <input
                type="text"
                className="flex-1 text-sm border border-slate-200 rounded-lg px-2 py-1"
                value={key}
                onChange={(e) => updateEntry(key, e.target.value, val)}
                placeholder="Ключ (значение поля)"
              />
              <input
                type="text"
                className="flex-1 text-sm border border-slate-200 rounded-lg px-2 py-1"
                value={val}
                onChange={(e) => updateEntry(key, key, e.target.value)}
                placeholder="Текст для вывода"
              />
              <button
                type="button"
                onClick={() => removeEntry(key)}
                className="p-1 text-red-400 hover:text-red-600"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addEntry}
            className="text-xs text-sky-600 hover:text-sky-800 flex items-center gap-1"
          >
            <Plus size={12} /> Добавить соответствие
          </button>
        </div>
      </div>
    </div>
  )
}

interface ConcretionListEditorProps {
  field: PrintConcretionList
  onChange: (field: PrintConcretionList) => void
}

const ConcretionListEditor: React.FC<ConcretionListEditorProps> = ({ field, onChange }) => {
  const update = (partial: Partial<PrintConcretionList>) => {
    onChange({ ...field, ...partial })
  }

  return (
    <div className="space-y-3">
      <details className="border border-slate-200 rounded-lg" open>
        <summary className="px-3 py-1.5 text-xs font-semibold text-slate-600 cursor-pointer bg-slate-50 rounded-lg">
          Триггер
        </summary>
        <div className="p-3 space-y-2">
          <div>
            <label className="text-xs text-slate-400">ID поля триггера</label>
            <input
              type="text"
              className="w-full text-xs border border-slate-200 rounded px-2 py-1"
              value={field.trigger.field}
              onChange={(e) => update({ trigger: { ...field.trigger, field: e.target.value } })}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Текст когда не выбрано</label>
            <input
              type="text"
              className="w-full text-xs border border-slate-200 rounded px-2 py-1"
              value={field.trigger.notSelectedText}
              onChange={(e) => update({ trigger: { ...field.trigger, notSelectedText: e.target.value } })}
            />
          </div>
        </div>
      </details>

      <details className="border border-slate-200 rounded-lg" open>
        <summary className="px-3 py-1.5 text-xs font-semibold text-slate-600 cursor-pointer bg-slate-50 rounded-lg">
          Список
        </summary>
        <div className="p-3 space-y-2">
          <div>
            <label className="text-xs text-slate-400">Поле списка</label>
            <input
              type="text"
              className="w-full text-xs border border-slate-200 rounded px-2 py-1"
              value={field.list.field}
              onChange={(e) => update({ list: { ...field.list, field: e.target.value } })}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Текст когда пусто</label>
            <input
              type="text"
              className="w-full text-xs border border-slate-200 rounded px-2 py-1"
              value={field.list.emptyText}
              onChange={(e) => update({ list: { ...field.list, emptyText: e.target.value } })}
            />
          </div>
        </div>
      </details>

      <details className="border border-slate-200 rounded-lg" open>
        <summary className="px-3 py-1.5 text-xs font-semibold text-slate-600 cursor-pointer bg-slate-50 rounded-lg">
          Поля элемента
        </summary>
        <div className="p-3 space-y-2">
          <div>
            <label className="text-xs text-slate-400">Поле размера</label>
            <input
              type="text"
              className="w-full text-xs border border-slate-200 rounded px-2 py-1"
              value={field.item.sizeField}
              onChange={(e) => update({ item: { ...field.item, sizeField: e.target.value } })}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Поле положения</label>
            <input
              type="text"
              className="w-full text-xs border border-slate-200 rounded px-2 py-1"
              value={field.item.positionField}
              onChange={(e) => update({ item: { ...field.item, positionField: e.target.value } })}
            />
          </div>
        </div>
      </details>

      <details className="border border-slate-200 rounded-lg">
        <summary className="px-3 py-1.5 text-xs font-semibold text-slate-600 cursor-pointer bg-slate-50 rounded-lg">
          Шаблоны
        </summary>
        <div className="p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400">Префикс положения</label>
              <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.templates.positionPrefix} onChange={(e) => update({ templates: { ...field.templates, positionPrefix: e.target.value } })} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Разделитель положений</label>
              <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.templates.positionJoinWord} onChange={(e) => update({ templates: { ...field.templates, positionJoinWord: e.target.value } })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400">Префикс размера</label>
              <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.templates.sizePrefix} onChange={(e) => update({ templates: { ...field.templates, sizePrefix: e.target.value } })} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Единица размера</label>
              <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.templates.sizeUnit} onChange={(e) => update({ templates: { ...field.templates, sizeUnit: e.target.value } })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400">Разделитель размеров</label>
              <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.templates.sizeJoinWord} onChange={(e) => update({ templates: { ...field.templates, sizeJoinWord: e.target.value } })} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Акустическая тень</label>
              <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.templates.acoustic} onChange={(e) => update({ templates: { ...field.templates, acoustic: e.target.value } })} />
            </div>
          </div>
          <div className="text-xs font-medium text-slate-500 mt-2">Склонения (labels)</div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-slate-400">Один</label>
              <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.templates.labels.one} onChange={(e) => update({ templates: { ...field.templates, labels: { ...field.templates.labels, one: e.target.value } } })} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Несколько (2-4)</label>
              <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.templates.labels.few} onChange={(e) => update({ templates: { ...field.templates, labels: { ...field.templates.labels, few: e.target.value } } })} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Много (5+)</label>
              <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.templates.labels.many} onChange={(e) => update({ templates: { ...field.templates, labels: { ...field.templates.labels, many: e.target.value } } })} />
            </div>
          </div>
        </div>
      </details>

      <label className="flex items-center gap-1.5">
        <input
          type="checkbox"
          className="rounded border-slate-300"
          checked={field.usePositionPrefixIn ?? false}
          onChange={(e) => update({ usePositionPrefixIn: e.target.checked || undefined })}
        />
        <span className="text-xs text-slate-500">Использовать предлог "В области"</span>
      </label>
    </div>
  )
}

interface PolypListEditorProps {
  field: PrintPolypList
  onChange: (field: PrintPolypList) => void
}

const PolypListEditor: React.FC<PolypListEditorProps> = ({ field, onChange }) => {
  const update = (partial: Partial<PrintPolypList>) => {
    onChange({ ...field, ...partial })
  }

  return (
    <div className="space-y-3">
      <details className="border border-slate-200 rounded-lg" open>
        <summary className="px-3 py-1.5 text-xs font-semibold text-slate-600 cursor-pointer bg-slate-50 rounded-lg">
          Триггер
        </summary>
        <div className="p-3 space-y-2">
          <div>
            <label className="text-xs text-slate-400">ID поля триггера</label>
            <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.trigger.field} onChange={(e) => update({ trigger: { ...field.trigger, field: e.target.value } })} />
          </div>
          <div>
            <label className="text-xs text-slate-400">Текст когда не выбрано</label>
            <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.trigger.notSelectedText} onChange={(e) => update({ trigger: { ...field.trigger, notSelectedText: e.target.value } })} />
          </div>
        </div>
      </details>

      <details className="border border-slate-200 rounded-lg" open>
        <summary className="px-3 py-1.5 text-xs font-semibold text-slate-600 cursor-pointer bg-slate-50 rounded-lg">
          Список
        </summary>
        <div className="p-3 space-y-2">
          <div>
            <label className="text-xs text-slate-400">Поле списка</label>
            <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.list.field} onChange={(e) => update({ list: { ...field.list, field: e.target.value } })} />
          </div>
          <div>
            <label className="text-xs text-slate-400">Текст когда пусто</label>
            <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.list.emptyText} onChange={(e) => update({ list: { ...field.list, emptyText: e.target.value } })} />
          </div>
        </div>
      </details>

      <details className="border border-slate-200 rounded-lg" open>
        <summary className="px-3 py-1.5 text-xs font-semibold text-slate-600 cursor-pointer bg-slate-50 rounded-lg">
          Поля элемента
        </summary>
        <div className="p-3 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-slate-400">Поле размера</label>
              <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.item.sizeField} onChange={(e) => update({ item: { ...field.item, sizeField: e.target.value } })} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Поле положения</label>
              <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.item.positionField} onChange={(e) => update({ item: { ...field.item, positionField: e.target.value } })} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Поле стенки</label>
              <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.item.wallField} onChange={(e) => update({ item: { ...field.item, wallField: e.target.value } })} />
            </div>
          </div>
        </div>
      </details>

      <details className="border border-slate-200 rounded-lg">
        <summary className="px-3 py-1.5 text-xs font-semibold text-slate-600 cursor-pointer bg-slate-50 rounded-lg">
          Шаблоны
        </summary>
        <div className="p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400">Префикс положения</label>
              <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.templates.positionPrefix} onChange={(e) => update({ templates: { ...field.templates, positionPrefix: e.target.value } })} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Разделитель положений</label>
              <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.templates.positionJoinWord} onChange={(e) => update({ templates: { ...field.templates, positionJoinWord: e.target.value } })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400">Префикс стенки</label>
              <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.templates.wallPrefix} onChange={(e) => update({ templates: { ...field.templates, wallPrefix: e.target.value } })} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Разделитель стенок</label>
              <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.templates.wallJoinWord} onChange={(e) => update({ templates: { ...field.templates, wallJoinWord: e.target.value } })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400">Суффикс одной стенки</label>
              <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.templates.wallSingleSuffix} onChange={(e) => update({ templates: { ...field.templates, wallSingleSuffix: e.target.value } })} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Текст обеих стенок</label>
              <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.templates.wallBothText} onChange={(e) => update({ templates: { ...field.templates, wallBothText: e.target.value } })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400">Префикс размера</label>
              <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.templates.sizePrefix} onChange={(e) => update({ templates: { ...field.templates, sizePrefix: e.target.value } })} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Единица размера</label>
              <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.templates.sizeUnit} onChange={(e) => update({ templates: { ...field.templates, sizeUnit: e.target.value } })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400">Разделитель размеров</label>
              <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.templates.sizeJoinWord} onChange={(e) => update({ templates: { ...field.templates, sizeJoinWord: e.target.value } })} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Акустическая тень</label>
              <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.templates.acoustic} onChange={(e) => update({ templates: { ...field.templates, acoustic: e.target.value } })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400">Причастие (один)</label>
              <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.templates.participleSingle} onChange={(e) => update({ templates: { ...field.templates, participleSingle: e.target.value } })} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Причастие (несколько)</label>
              <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.templates.participleFew} onChange={(e) => update({ templates: { ...field.templates, participleFew: e.target.value } })} />
            </div>
          </div>
          <div className="text-xs font-medium text-slate-500 mt-2">Склонения (labels)</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400">Один</label>
              <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.templates.labels.one} onChange={(e) => update({ templates: { ...field.templates, labels: { ...field.templates.labels, one: e.target.value } } })} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Несколько</label>
              <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.templates.labels.few} onChange={(e) => update({ templates: { ...field.templates, labels: { ...field.templates.labels, few: e.target.value } } })} />
            </div>
          </div>
        </div>
      </details>
    </div>
  )
}

interface PancreasSizesEditorProps {
  field: PrintPancreasSizes
  onChange: (field: PrintPancreasSizes) => void
}

const PancreasSizesEditor: React.FC<PancreasSizesEditorProps> = ({ field, onChange }) => {
  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-slate-600">Поля размеров</div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs text-slate-400">Головка</label>
          <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.fields.head} onChange={(e) => onChange({ ...field, fields: { ...field.fields, head: e.target.value } })} placeholder="pancreasHead" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Тело</label>
          <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.fields.body} onChange={(e) => onChange({ ...field, fields: { ...field.fields, body: e.target.value } })} placeholder="pancreasBody" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Хвост</label>
          <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.fields.tail} onChange={(e) => onChange({ ...field, fields: { ...field.fields, tail: e.target.value } })} placeholder="pancreasTail" />
        </div>
      </div>
      <div className="text-xs font-semibold text-slate-600">Шаблоны</div>
      <div>
        <label className="text-xs text-slate-400">Когда есть значение</label>
        <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.templates.hasValue} onChange={(e) => onChange({ ...field, templates: { ...field.templates, hasValue: e.target.value } })} placeholder="головка {value} мм" />
      </div>
      <div>
        <label className="text-xs text-slate-400">Когда нет значения</label>
        <input type="text" className="w-full text-xs border border-slate-200 rounded px-2 py-1" value={field.templates.noValue} onChange={(e) => onChange({ ...field, templates: { ...field.templates, noValue: e.target.value } })} placeholder="головки" />
      </div>
    </div>
  )
}

interface TextEditorProps {
  field: PrintText
  onChange: (field: PrintText) => void
}

const TextEditor: React.FC<TextEditorProps> = ({ field, onChange }) => {
  return (
    <div>
      <label className="text-xs text-slate-500 font-medium">Статический текст</label>
      <textarea
        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
        rows={3}
        value={field.text}
        onChange={(e) => onChange({ ...field, text: e.target.value })}
        placeholder="Текст который будет выведен в протоколе"
      />
    </div>
  )
}

// ============================================================
// Универсальный редактор PrintField
// ============================================================

interface PrintFieldEditorProps {
  field: PrintField
  onChange: (field: PrintField) => void
}

const PrintFieldEditor: React.FC<PrintFieldEditorProps> = ({ field, onChange }) => {
  const fieldTypes = [
    { value: 'fieldValues', label: '📊 Группа значений' },
    { value: 'selectWithTextarea', label: '🎯 Выбор + текст' },
    { value: 'conditional', label: '🔀 Условный вывод' },
    { value: 'concretionList', label: '💎 Список конкрементов' },
    { value: 'polypList', label: '🩹 Список полипов' },
    { value: 'pancreasSizes', label: '🧮 Размеры ПЖ' },
    { value: 'text', label: '📄 Статический текст' },
  ]

  const handleTypeChange = (newType: string) => {
    onChange(createDefaultPrintField(newType))
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-slate-500 font-medium">Тип поля</label>
        <select
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
          value={field.type}
          onChange={(e) => handleTypeChange(e.target.value)}
        >
          {fieldTypes.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {field.type === 'fieldValues' && (
        <FieldValuesEditor field={field as PrintFieldValues} onChange={onChange} />
      )}
      {field.type === 'selectWithTextarea' && (
        <SelectWithTextareaEditor field={field as PrintSelectWithTextarea} onChange={onChange} />
      )}
      {field.type === 'conditional' && (
        <ConditionalFieldEditor field={field as PrintConditionalField} onChange={onChange} />
      )}
      {field.type === 'concretionList' && (
        <ConcretionListEditor field={field as PrintConcretionList} onChange={onChange} />
      )}
      {field.type === 'polypList' && (
        <PolypListEditor field={field as PrintPolypList} onChange={onChange} />
      )}
      {field.type === 'pancreasSizes' && (
        <PancreasSizesEditor field={field as PrintPancreasSizes} onChange={onChange} />
      )}
      {field.type === 'text' && (
        <TextEditor field={field as PrintText} onChange={onChange} />
      )}
    </div>
  )
}

// ============================================================
// Основной компонент
// ============================================================

interface PrintTemplateVisualEditorProps {
  template: PrintTemplate | undefined
  onChange: (template: PrintTemplate | undefined) => void
}

export const PrintTemplateVisualEditor: React.FC<PrintTemplateVisualEditorProps> = ({ template, onChange }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set())

  const safeTemplate = template ?? { title: '', body: [] }

  // Сборка дерева
  const buildTree = useCallback((): TreeNode[] => {
    return safeTemplate.body.map((block, blockIndex) => {
      const blockNode: TreeNode = {
        type: 'block',
        id: `block-${blockIndex}`,
        label: getBlockLabel(block),
        icon: BLOCK_ICONS[block.type] || '📦',
        data: block,
        blockIndex,
        collapsed: collapsedNodes.has(`block-${blockIndex}`),
        children: block.type === 'section'
          ? (block as PrintSection).fields.map((field, fieldIndex) => ({
              type: 'printField',
              id: `block-${blockIndex}-field-${fieldIndex}`,
              label: getFieldLabel(field),
              icon: FIELD_ICONS[field.type] || '📄',
              data: field,
              blockIndex,
              fieldIndex,
            }))
          : undefined,
      }
      return blockNode
    })
  }, [safeTemplate, collapsedNodes])

  const tree = buildTree()

  // Поиск выделенного узла
  const findSelectedNode = useCallback((): TreeNode | null => {
    for (const block of tree) {
      if (block.id === selectedId) return block
      for (const field of block.children ?? []) {
        if (field.id === selectedId) return field
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

  // Операции с блоками
  const updateTitle = (title: string) => {
    onChange({ ...safeTemplate, title })
  }

  const addBlock = (type: string) => {
    const newBlock = createDefaultBlock(type)
    onChange({
      ...safeTemplate,
      body: [...safeTemplate.body, newBlock],
    })
    setSelectedId(`block-${safeTemplate.body.length}`)
  }

  const removeBlock = (blockIndex: number) => {
    const updated = safeTemplate.body.filter((_, i) => i !== blockIndex)
    onChange({ ...safeTemplate, body: updated })
    setSelectedId(null)
  }

  const moveBlock = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= safeTemplate.body.length) return
    const updated = [...safeTemplate.body]
    ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
    onChange({ ...safeTemplate, body: updated })
  }

  const updateBlock = (blockIndex: number, block: PrintBlock) => {
    const updated = [...safeTemplate.body]
    updated[blockIndex] = block
    onChange({ ...safeTemplate, body: updated })
  }

  // Операции с полями внутри section
  const addField = (blockIndex: number) => {
    const block = safeTemplate.body[blockIndex]
    if (block.type !== 'section') return
    const section = block as PrintSection
    const newField = createDefaultPrintField('fieldValues')
    const updatedSection = { ...section, fields: [...section.fields, newField] }
    updateBlock(blockIndex, updatedSection)
    setSelectedId(`block-${blockIndex}-field-${section.fields.length}`)
  }

  const removeField = (blockIndex: number, fieldIndex: number) => {
    const block = safeTemplate.body[blockIndex]
    if (block.type !== 'section') return
    const section = block as PrintSection
    const updatedSection = { ...section, fields: section.fields.filter((_, i) => i !== fieldIndex) }
    updateBlock(blockIndex, updatedSection)
    setSelectedId(null)
  }

  const updateField = (blockIndex: number, fieldIndex: number, field: PrintField) => {
    const block = safeTemplate.body[blockIndex]
    if (block.type !== 'section') return
    const section = block as PrintSection
    const updatedFields = [...section.fields]
    updatedFields[fieldIndex] = field
    const updatedSection = { ...section, fields: updatedFields }
    updateBlock(blockIndex, updatedSection)
  }

  // Рендер панели свойств
  const renderProperties = () => {
    if (!selectedNode) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm py-12">
          <Settings size={32} className="mb-2 opacity-40" />
          Выберите элемент в дереве, чтобы редактировать его свойства
        </div>
      )
    }

    if (selectedNode.type === 'block') {
      const block = selectedNode.data as PrintBlock
      const bi = selectedNode.blockIndex

      switch (block.type) {
        case 'section':
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">Секция органа</h3>
                <button
                  type="button"
                  onClick={() => addField(bi)}
                  className="text-xs px-2 py-1 rounded bg-sky-100 text-sky-700 hover:bg-sky-200 flex items-center gap-1"
                >
                  <Plus size={12} /> Добавить поле
                </button>
              </div>
              <BlockSectionEditor
                block={block as PrintSection}
                onChange={(updated) => updateBlock(bi, updated)}
              />
              <button
                type="button"
                onClick={() => removeBlock(bi)}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 size={12} /> Удалить блок
              </button>
            </div>
          )
        case 'freeFluid':
          return (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700">Свободная жидкость</h3>
              <BlockFreeFluidEditor
                block={block as PrintFreeFluid}
                onChange={(updated) => updateBlock(bi, updated)}
              />
              <button
                type="button"
                onClick={() => removeBlock(bi)}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 size={12} /> Удалить блок
              </button>
            </div>
          )
        case 'conclusion':
          return (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700">Заключение</h3>
              <BlockConclusionEditor
                block={block as PrintConclusion}
                onChange={(updated) => updateBlock(bi, updated)}
              />
              <button
                type="button"
                onClick={() => removeBlock(bi)}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 size={12} /> Удалить блок
              </button>
            </div>
          )
        case 'recommendations':
          return (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700">Рекомендации</h3>
              <BlockRecommendationsEditor
                block={block as PrintRecommendations}
                onChange={(updated) => updateBlock(bi, updated)}
              />
              <button
                type="button"
                onClick={() => removeBlock(bi)}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 size={12} /> Удалить блок
              </button>
            </div>
          )
        default:
          return null
      }
    }

    if (selectedNode.type === 'printField') {
      const field = selectedNode.data as PrintField
      const bi = selectedNode.blockIndex
      const fi = selectedNode.fieldIndex!

      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Поле печати</h3>
            <button
              type="button"
              onClick={() => removeField(bi, fi)}
              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
            >
              <Trash2 size={12} /> Удалить поле
            </button>
          </div>
          <PrintFieldEditor
            field={field}
            onChange={(updated) => updateField(bi, fi, updated)}
          />
        </div>
      )
    }

    return null
  }

  return (
    <div className="space-y-4">
      {/* Заголовок шаблона */}
      <div className="border border-slate-200 rounded-xl p-4 bg-white">
        <label className="text-xs text-slate-500">Заголовок шаблона печати</label>
        <input
          type="text"
          className="w-full text-sm border border-slate-200 rounded px-2 py-1 mt-1"
          value={safeTemplate.title}
          onChange={(e) => updateTitle(e.target.value)}
          placeholder="Протокол УЗИ ОБП"
        />
      </div>

      <div className="flex gap-4">
        {/* Левая панель: дерево */}
        <div className="w-72 flex-shrink-0">
          <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                Блоки ({safeTemplate.body.length})
              </span>
            </div>
            <div className="p-2 max-h-[500px] overflow-y-auto">
              {tree.length === 0 ? (
                <div className="text-center py-6 text-sm text-slate-400">
                  Добавьте блоки печати
                </div>
              ) : (
                tree.map((blockNode) => (
                  <div key={blockNode.id}>
                    <div className="flex items-center gap-0">
                      <button
                        type="button"
                        onClick={() => moveBlock(blockNode.blockIndex, -1)}
                        disabled={blockNode.blockIndex === 0}
                        className="p-0.5 text-slate-300 hover:text-slate-500 disabled:opacity-20"
                      >
                        <ChevronRight size={10} className="rotate-270" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBlock(blockNode.blockIndex, 1)}
                        disabled={blockNode.blockIndex === tree.length - 1}
                        className="p-0.5 text-slate-300 hover:text-slate-500 disabled:opacity-20"
                      >
                        <ChevronRight size={10} className="rotate-90" />
                      </button>
                      <div className="flex-1">
                        <TreeNodeItem
                          key={blockNode.id}
                          node={blockNode}
                          depth={0}
                          selectedId={selectedId}
                          onSelect={handleSelect}
                          onToggleCollapse={handleToggleCollapse}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Кнопки добавления блоков */}
            <div className="px-3 py-2 border-t border-slate-200 space-y-1">
              <div className="text-xs font-medium text-slate-500 mb-1">Добавить блок:</div>
              <div className="flex flex-wrap gap-1">
                {Object.entries({
                  section: '🧩 Секция',
                  freeFluid: '💧 Жидкость',
                  conclusion: '📝 Заключение',
                  recommendations: '📋 Рекомендации',
                }).map(([type, label]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addBlock(type)}
                    className="text-xs px-2 py-1 rounded bg-sky-100 text-sky-700 hover:bg-sky-200"
                  >
                    <Plus size={10} className="inline mr-0.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Правая панель: свойства */}
        <div className="flex-1">
          <div className="border border-slate-200 rounded-xl bg-white p-4 min-h-[300px]">
            {renderProperties()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrintTemplateVisualEditor