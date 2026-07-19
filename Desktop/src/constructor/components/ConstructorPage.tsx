import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Save, Eye, Edit3, Printer, Upload, Download } from 'lucide-react'
import type { ProtocolSchema, PrintTemplate } from '../schema'
import { DynamicProtocolForm } from './DynamicProtocolForm'
import { PrintTemplateVisualEditor } from './PrintTemplateVisualEditor'
import { ProtocolTreeEditor } from './ProtocolTreeEditor'
import { loadCustomProtocols, saveCustomProtocol, deleteCustomProtocol, exportProtocolToFile, importProtocolFromFile, clearLegacyLocalStorage } from '../utils/storage'

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
  const [customProtocols, setCustomProtocols] = useState<ProtocolSchema[]>([])
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [showSavedList, setShowSavedList] = useState(false)
  const protocolsLoadedRef = useRef(false)

  // Асинхронная загрузка протоколов при монтировании
  useEffect(() => {
    if (!protocolsLoadedRef.current) {
      protocolsLoadedRef.current = true
      // Очищаем localStorage от старых протоколов (миграция на файлы)
      clearLegacyLocalStorage()
      loadCustomProtocols().then((list) => {
        if (list.length > 0) setCustomProtocols(list)
      })
    }
  }, [])

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

  const handleDelete = useCallback(async (id: string, label: string) => {
    if (!window.confirm(`Удалить протокол "${label}"?`)) return
    const success = await deleteCustomProtocol(id)
    if (success) {
      setSaveMessage(`✅ Протокол "${label}" удалён`)
      const updatedList = await loadCustomProtocols()
      setCustomProtocols(updatedList)
    } else {
      setSaveMessage('❌ Ошибка удаления')
    }
    setTimeout(() => setSaveMessage(null), 3000)
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
                <button
                  type="button"
                  onClick={() => handleDelete(p.id, p.selectionLabel)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Метаданные протокола */}
      {mode === 'edit' && (
        <div className="mb-4 p-4 border border-slate-200 rounded-xl bg-white space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 font-medium">Название протокола</label>
              <input
                type="text"
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
                value={schema.selectionLabel}
                onChange={(e) => setSchema((prev) => ({ ...prev, selectionLabel: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium">ID (техническое имя)</label>
              <input
                type="text"
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
                value={schema.id}
                onChange={(e) => setSchema((prev) => ({ ...prev, id: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium">Заголовок</label>
              <input
                type="text"
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
                value={schema.title}
                onChange={(e) => setSchema((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium">Описание</label>
              <input
                type="text"
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 mt-0.5"
                value={schema.description}
                onChange={(e) => setSchema((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
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
            <PrintTemplateVisualEditor
              template={schema.printTemplate}
              onChange={handlePrintTemplateChange}
            />
          ) : (
            <ProtocolTreeEditor
              schema={schema}
              onChange={setSchema}
            />
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