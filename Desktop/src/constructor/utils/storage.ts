import { type ProtocolSchema } from '../schema'

const STORAGE_KEY = 'custom-protocols'

export function loadCustomProtocols(): ProtocolSchema[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as ProtocolSchema[]
  } catch {
    return []
  }
}

export function saveCustomProtocols(protocols: ProtocolSchema[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(protocols))
}

export function deleteCustomProtocol(id: string) {
  const protocols = loadCustomProtocols()
  const updated = protocols.filter((p) => p.id !== id)
  saveCustomProtocols(updated)
  return updated
}