import { useEffect } from 'react'
import { loadCustomProtocols } from '@/constructor/utils/storage'

/**
 * Хук для динамической регистрации кастомных протоколов.
 * Слушает CustomEvent 'protocol-register-custom' и dispatch'ит событие для реестра.
 */
export function useCustomProtocolRegistry() {
  useEffect(() => {
    const handleRegister = () => {
      window.dispatchEvent(
        new CustomEvent('protocol-registry-sync', {
          detail: loadCustomProtocols(),
        })
      )
    }

    window.addEventListener('protocol-register-custom', handleRegister)
    return () => {
      window.removeEventListener('protocol-register-custom', handleRegister)
    }
  }, [])
}
