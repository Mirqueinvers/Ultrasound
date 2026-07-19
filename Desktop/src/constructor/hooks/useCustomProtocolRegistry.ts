import { useEffect } from 'react'
import { refreshCustomSchemas } from '@/constructor/utils/protocolRegistry'

/**
 * Хук для динамической регистрации кастомных протоколов.
 * Загрузка с диска запускается автоматически при импорте модуля protocolRegistry.
 * Хук только слушает CustomEvent 'protocol-register-custom' для обновления после сохранения.
 */
export function useCustomProtocolRegistry() {
  useEffect(() => {
    const handleRegister = () => {
      refreshCustomSchemas().catch(console.error)
    }

    window.addEventListener('protocol-register-custom', handleRegister)
    return () => {
      window.removeEventListener('protocol-register-custom', handleRegister)
    }
  }, [])
}
