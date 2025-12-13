import { useEffect } from 'react'

/**
 * ESC 键关闭弹框 Hook
 */
export const useEscKey = (
  isOpen: boolean,
  onClose: () => void
) => {
  useEffect(() => {
    if (!isOpen) return

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscKey)
    return () => {
      window.removeEventListener('keydown', handleEscKey)
    }
  }, [isOpen, onClose])
}

