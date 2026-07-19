/**
 * Динамический реестр кастомных протоколов.
 * Позволяет добавлять протоколы из localStorage в список "УЗИ протоколы".
 */
import type { ProtocolSchema } from '../schema'
import { loadCustomProtocols } from './storage'

let customSchemas: ProtocolSchema[] = []
let listeners: Array<(schemas: ProtocolSchema[]) => void> = []
let loadPromise: Promise<ProtocolSchema[]> | null = null

async function doLoad(): Promise<ProtocolSchema[]> {
  customSchemas = await loadCustomProtocols()
  // Уведомляем всех подписчиков
  for (const fn of listeners) {
    try { fn(customSchemas) } catch { /* ignore */ }
  }
  return customSchemas
}

// Запускаем загрузку сразу при импорте модуля (до монтирования React)
loadPromise = doLoad()

export function getCustomSchemas(): ProtocolSchema[] {
  return customSchemas
}

export async function refreshCustomSchemas(): Promise<ProtocolSchema[]> {
  loadPromise = doLoad()
  return loadPromise
}

/**
 * Подписка на изменения списка кастомных протоколов.
 * Если данные уже загружены (customSchemas не пуст или loadPromise завершён),
 * callback вызывается немедленно.
 */
export function subscribeToCustomSchemas(fn: (schemas: ProtocolSchema[]) => void): () => void {
  listeners.push(fn)

  // Если данные уже загружены — сразу вызываем callback
  if (customSchemas.length > 0) {
    fn(customSchemas)
  } else if (loadPromise) {
    // Если загрузка идёт или уже была завершена — ждём её
    loadPromise.then(() => {
      fn(customSchemas)
    }).catch(() => {
      // если загрузка упала, customSchemas всё ещё пуст
    })
  }

  return () => {
    listeners = listeners.filter((l) => l !== fn)
  }
}

// Слушаем CustomEvent для автоматического обновления
if (typeof window !== 'undefined') {
window.addEventListener('protocol-register-custom', () => {
    refreshCustomSchemas().catch(console.error)
  })

  window.addEventListener('protocol-registry-sync', ((e: CustomEvent) => {
    customSchemas = e.detail as ProtocolSchema[]
    listeners.forEach((fn) => fn(customSchemas))
  }) as EventListener)
}
