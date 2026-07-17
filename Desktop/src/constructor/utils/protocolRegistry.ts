/**
 * Динамический реестр кастомных протоколов.
 * Позволяет добавлять протоколы из localStorage в список "УЗИ протоколы".
 */
import type { ProtocolSchema } from '../schema'
import { loadCustomProtocols } from './storage'

let customSchemas: ProtocolSchema[] = []
let listeners: Array<(schemas: ProtocolSchema[]) => void> = []

export function getCustomSchemas(): ProtocolSchema[] {
  return customSchemas
}

export function refreshCustomSchemas(): ProtocolSchema[] {
  customSchemas = loadCustomProtocols()
  listeners.forEach((fn) => fn(customSchemas))
  return customSchemas
}

export function subscribeToCustomSchemas(fn: (schemas: ProtocolSchema[]) => void): () => void {
  listeners.push(fn)
  return () => {
    listeners = listeners.filter((l) => l !== fn)
  }
}

// Слушаем CustomEvent для автоматического обновления
if (typeof window !== 'undefined') {
  window.addEventListener('protocol-register-custom', () => {
    refreshCustomSchemas()
  })

  window.addEventListener('protocol-registry-sync', ((e: CustomEvent) => {
    customSchemas = e.detail as ProtocolSchema[]
    listeners.forEach((fn) => fn(customSchemas))
  }) as EventListener)
}