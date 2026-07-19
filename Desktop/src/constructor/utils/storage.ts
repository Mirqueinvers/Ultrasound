import { type ProtocolSchema } from '../schema'

const STORAGE_KEY = 'custom-protocols'

// Проверяем, запущены ли мы в Electron (лениво, т.к. protocolFileAPI может быть ещё не инициализирован)
function isElectron(): boolean {
  return typeof (window as any).protocolFileAPI !== 'undefined'
}

// Получаем API протоколов (Electron) или fallback
function getFileAPI(): any {
  if (isElectron()) {
    return (window as any).protocolFileAPI
  }
  return null
}

// Принудительная очистка localStorage от старых протоколов (для миграции с localStorage на файлы)
export function clearLegacyLocalStorage(): void {
  try { localStorage.removeItem('custom-protocols') } catch { /* ignore */ }
}

export async function loadCustomProtocols(): Promise<ProtocolSchema[]> {
  const api = getFileAPI()
  if (api) {
    try {
      const entries = await api.list()
      const results: ProtocolSchema[] = []
      for (const entry of entries) {
        try {
          const schema = await api.load(entry.id)
          if (schema && schema.id) {
            results.push(schema as ProtocolSchema)
          }
        } catch { /* skip */ }
      }
      // Синхронизируем localStorage: удаляем протоколы, которых нет на диске
      try {
        const oldRaw = localStorage.getItem(STORAGE_KEY)
        if (oldRaw) {
          const oldList = JSON.parse(oldRaw) as ProtocolSchema[]
          const diskIds = new Set(results.map((p) => p.id))
          const filtered = oldList.filter((p) => diskIds.has(p.id))
          localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
        }
      } catch { /* ignore */ }
      return results
    } catch {
      // fallback на localStorage
    }
  }

  // Fallback: localStorage (для браузера)
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as ProtocolSchema[]
  } catch {
    return []
  }
}

export async function deleteCustomProtocol(id: string): Promise<boolean> {
  const api = getFileAPI()
  if (api) {
    try {
      const result = await api.delete(id)
      if (result.success) return true
      // Если файл не найден на диске — пробуем localStorage (старые данные)
    } catch {
      // fallback на localStorage
    }
  }

  // Fallback: localStorage
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as ProtocolSchema[]
    const filtered = existing.filter((p) => p.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    return true
  } catch {
    return false
  }
}

export async function saveCustomProtocol(protocol: ProtocolSchema): Promise<boolean> {
  const api = getFileAPI()
  if (api) {
    try {
      const result = await api.save({
        id: protocol.id,
        selectionLabel: protocol.selectionLabel,
        data: protocol,
      })
      return result.success
    } catch {
      return false
    }
  }

  // Fallback: localStorage
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as ProtocolSchema[]
    const idx = existing.findIndex((p) => p.id === protocol.id)
    if (idx >= 0) {
      existing[idx] = protocol
    } else {
      existing.push(protocol)
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
    return true
  } catch {
    return false
  }
}

export async function exportProtocolToFile(protocol: ProtocolSchema): Promise<{ success: boolean; canceled?: boolean; filePath?: string }> {
  const api = getFileAPI()
  if (api) {
    try {
      return await api.exportDialog({ id: protocol.id, data: protocol })
    } catch {
      return { success: false }
    }
  }

  // Fallback (браузер): скачать как blob
  try {
    const blob = new Blob([JSON.stringify(protocol, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${protocol.id || 'protocol'}.json`
    a.click()
    URL.revokeObjectURL(url)
    return { success: true }
  } catch {
    return { success: false }
  }
}

export async function importProtocolFromFile(): Promise<{ success: boolean; canceled?: boolean; data?: ProtocolSchema }> {
  const api = getFileAPI()
  if (api) {
    try {
      const result = await api.importDialog()
      if (result.success && result.data) {
        return { success: true, data: result.data as ProtocolSchema }
      }
      return { success: false, canceled: result.canceled }
    } catch {
      return { success: false }
    }
  }

  // Fallback (браузер): file input
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) {
        resolve({ success: false, canceled: true })
        return
      }
      try {
        const text = await file.text()
        const data = JSON.parse(text) as ProtocolSchema
        resolve({ success: true, data })
      } catch {
        resolve({ success: false })
      }
    }
    input.click()
  })
}

// Синхронная версия для обратной совместимости
export function loadCustomProtocolsSync(): ProtocolSchema[] {
  // В Electron не используем localStorage — данные на диске, подгружаются асинхронно
  if (isElectron()) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as ProtocolSchema[]
  } catch {
    return []
  }
}
