import React, { useState } from 'react'
import { Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import type { PrintTemplate, PrintBlock } from '../schema'
import { PRINT_BLOCK_LABELS } from '../schema'

// ---- Вспомогательные функции ----

function createDefaultBlock(type: string): PrintBlock {
  switch (type) {
    case 'section':
      return {
        type: 'section',
        label: 'Новая секция',
        fields: [],
      } as PrintBlock
    case 'freeFluid':
      return {
        type: 'freeFluid',
        field: '',
        detailsField: '',
        templates: { notDetermined: '', determinedEmpty: '' },
      } as PrintBlock
    case 'conclusion':
      return {
        type: 'conclusion',
        field: '',
        label: 'Заключение',
      } as PrintBlock
    case 'recommendations':
      return {
        type: 'recommendations',
        field: '',
        label: 'Рекомендации',
      } as PrintBlock
    default:
      return { type: 'section', label: '', fields: [] } as PrintBlock
  }
}

function getBlockSummary(block: PrintBlock): string {
  switch (block.type) {
    case 'section':
      return block.label || 'Секция'
    case 'freeFluid':
      return 'Свободная жидкость'
    case 'conclusion':
      return block.label || 'Заключение'
    case 'recommendations':
      return block.label || 'Рекомендации'
    default:
      return 'Неизвестный блок'
  }
}

// ---- Компонент ----

interface PrintTemplateEditorProps {
  template: PrintTemplate | undefined
  onChange: (template: PrintTemplate | undefined) => void
}

export const PrintTemplateEditor: React.FC<PrintTemplateEditorProps> = ({ template, onChange }) => {
  const [collapsedBlocks, setCollapsedBlocks] = useState<Set<number>>(new Set())
  const [jsonErrors, setJsonErrors] = useState<Record<number, string>>({})

  // Инициализация пустого шаблона если undefined
  const safeTemplate = template ?? { title: '', body: [] }

  const updateTitle = (title: string) => {
    onChange({ ...safeTemplate, title })
  }

  const addBlock = (type: string) => {
    const newBlock = createDefaultBlock(type)
    onChange({
      ...safeTemplate,
      body: [...safeTemplate.body, newBlock],
    })
  }

  const removeBlock = (index: number) => {
    const updated = safeTemplate.body.filter((_, i) => i !== index)
    onChange({ ...safeTemplate, body: updated })
    setCollapsedBlocks((prev) => {
      const next = new Set(prev)
      next.delete(index)
      return next
    })
  }

  const moveBlock = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= safeTemplate.body.length) return
    const updated = [...safeTemplate.body]
    ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
    onChange({ ...safeTemplate, body: updated })
  }

  const toggleCollapse = (index: number) => {
    setCollapsedBlocks((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const handleBlockChange = (index: number, rawJson: string) => {
    try {
      const parsed = JSON.parse(rawJson)
      if (!parsed || typeof parsed !== 'object') throw new Error('Невалидный объект')

      // Валидация: должен быть type
      if (!parsed.type) throw new Error('Отсутствует поле type')

      const updated = [...safeTemplate.body]
      updated[index] = parsed
      onChange({ ...safeTemplate, body: updated })
      setJsonErrors((prev) => {
        const next = { ...prev }
        delete next[index]
        return next
      })
    } catch (e: any) {
      setJsonErrors((prev) => ({ ...prev, [index]: e.message || 'Ошибка JSON' }))
    }
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

      {/* Кнопки добавления блоков */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-slate-600">Добавить блок:</span>
        {Object.entries(PRINT_BLOCK_LABELS).map(([type, label]) => (
          <button
            key={type}
            type="button"
            onClick={() => addBlock(type)}
            className="text-xs px-3 py-1.5 rounded-lg bg-sky-100 text-sky-700 hover:bg-sky-200 flex items-center gap-1"
          >
            <Plus size={12} /> {label}
          </button>
        ))}
      </div>

      {/* Список блоков */}
      {safeTemplate.body.length === 0 && (
        <div className="text-center py-8 text-sm text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
          Добавьте блоки печати, чтобы настроить вывод протокола
        </div>
      )}

      {safeTemplate.body.map((block, index) => {
        const isCollapsed = collapsedBlocks.has(index)
        const error = jsonErrors[index]
        const jsonStr = JSON.stringify(block, null, 2)

        return (
          <div key={index} className="border border-slate-200 rounded-xl bg-white overflow-hidden">
            {/* Заголовок блока */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400">#{index + 1}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-sky-100 text-sky-700 font-medium">
                  {PRINT_BLOCK_LABELS[block.type] || block.type}
                </span>
                <span className="text-sm text-slate-700">{getBlockSummary(block)}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveBlock(index, -1)}
                  disabled={index === 0}
                  className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => moveBlock(index, 1)}
                  disabled={index === safeTemplate.body.length - 1}
                  className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => toggleCollapse(index)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  {isCollapsed ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => removeBlock(index)}
                  className="p-1 text-red-400 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* JSON редактор (под спойлером) */}
            {!isCollapsed && (
              <div className="p-3">
                {error && (
                  <div className="mb-2 flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                    <AlertTriangle size={12} /> {error}
                  </div>
                )}
                <textarea
                  className="w-full text-xs font-mono border border-slate-200 rounded px-2 py-1"
                  rows={Math.max(6, jsonStr.split('\n').length)}
                  value={jsonStr}
                  onChange={(e) => handleBlockChange(index, e.target.value)}
                />
              </div>
            )}
          </div>
        )
      })}

      {/* Итоговый JSON всего шаблона для копирования */}
      <details className="border border-slate-200 rounded-xl bg-white">
        <summary className="px-4 py-2 text-xs font-medium text-slate-500 cursor-pointer hover:bg-slate-50">
          Итоговый JSON шаблона
        </summary>
        <div className="p-3">
          <textarea
            className="w-full text-xs font-mono border border-slate-200 rounded px-2 py-1"
            rows={8}
            readOnly
            value={JSON.stringify(safeTemplate, null, 2)}
          />
        </div>
      </details>
    </div>
  )
}

export default PrintTemplateEditor