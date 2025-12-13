import React, { useState, useEffect, useCallback } from 'react'
import { useEscKey } from '../utils/useEscKey'
import { normalizeVersions } from '../utils/versionUtils'
import VersionForm from './VersionForm'
import type { ComponentData, ComponentVersions } from '../types'

interface EditComponentModalProps {
  visible: boolean
  component: ComponentData | null
  onClose: () => void
  onSave: (name: string, versions: ComponentVersions) => Promise<boolean>
}

const EditComponentModal: React.FC<EditComponentModalProps> = ({
  visible,
  component,
  onClose,
  onSave
}) => {
  const [versions, setVersions] = useState<ComponentVersions>({
    development: '',
    test: '',
    staging: '',
    production: ''
  })
  const [saving, setSaving] = useState<boolean>(false)

  useEscKey(visible, onClose)

  // 当组件变化时更新版本
  useEffect(() => {
    if (component) {
      setVersions(normalizeVersions(component.versions))
    }
  }, [component])

  // 处理关闭
  const handleClose = useCallback(() => {
    setVersions({
      development: '',
      test: '',
      staging: '',
      production: ''
    })
    onClose()
  }, [onClose])

  // 处理保存
  const handleSave = useCallback(async () => {
    if (!component) return

    try {
      setSaving(true)
      const success = await onSave(component.componentName, versions)
      if (success) {
        handleClose()
      }
    } finally {
      setSaving(false)
    }
  }, [component, versions, onSave, handleClose])

  if (!visible || !component) return null

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <div
        className="bg-gradient-to-br from-gray-800/95 via-gray-800/98 to-gray-800/95 rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 scale-100 border-2 border-amber-500/30 relative overflow-hidden backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -z-10"></div>
        
        <div className="mb-8 relative z-10">
          <h2 id="edit-modal-title" className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-amber-400 to-blue-400 bg-clip-text text-transparent mb-2">
            编辑版本
          </h2>
          <p className="text-sm text-blue-200 font-medium">{component.componentName}</p>
        </div>
        
        <div className="space-y-5 relative z-10">
          <VersionForm
            versions={versions}
            onChange={setVersions}
          />
        </div>

        <div className="flex justify-end gap-3 mt-8 relative z-10">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 text-sm font-semibold bg-gray-700/80 text-gray-200 rounded-lg hover:bg-gray-600/80 transition-all duration-200 border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            aria-label="取消编辑"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transform hover:-translate-y-0.5 disabled:transform-none"
            aria-label="保存版本"
          >
            {saving ? '保存中...' : '保存版本'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default React.memo(EditComponentModal)

