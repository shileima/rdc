import React, { useState, useCallback } from 'react'
import { message } from 'antd'
import { useEscKey } from '../utils/useEscKey'
import { createEmptyVersions } from '../utils/versionUtils'
import VersionForm from './VersionForm'
import type { ComponentVersions } from '../types'

interface AddComponentModalProps {
  visible: boolean
  onClose: () => void
  onSave: (name: string, versions: ComponentVersions) => Promise<boolean>
  existingNames: string[]
}

const AddComponentModal: React.FC<AddComponentModalProps> = ({
  visible,
  onClose,
  onSave,
  existingNames
}) => {
  const [componentName, setComponentName] = useState<string>('')
  const [versions, setVersions] = useState<ComponentVersions>(createEmptyVersions())
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState<boolean>(false)

  useEscKey(visible, onClose)

  // 重置表单
  const resetForm = useCallback(() => {
    setComponentName('')
    setVersions(createEmptyVersions())
    setAutoFilledFields(new Set())
  }, [])

  // 处理关闭
  const handleClose = useCallback(() => {
    resetForm()
    onClose()
  }, [resetForm, onClose])

  // 处理开发版本变化（自动填充）
  const handleDevVersionChange = useCallback((field: keyof ComponentVersions, value: string) => {
    if (field === 'development') {
      const updatedVersions = { ...versions, development: value }
      const updatedAutoFilled = new Set(autoFilledFields)
      
      if (value) {
        // 如果 test 为空或是自动填充的，则更新
        if (!(versions.test || '').trim() || autoFilledFields.has('test')) {
          updatedVersions.test = value
          updatedAutoFilled.add('test')
        }
        // 如果 staging 为空或是自动填充的，则更新
        if (!(versions.staging || '').trim() || autoFilledFields.has('staging')) {
          updatedVersions.staging = value
          updatedAutoFilled.add('staging')
        }
        // 如果 production 为空或是自动填充的，则更新
        if (!(versions.production || '').trim() || autoFilledFields.has('production')) {
          updatedVersions.production = value
          updatedAutoFilled.add('production')
        }
      } else {
        updatedAutoFilled.delete('test')
        updatedAutoFilled.delete('staging')
        updatedAutoFilled.delete('production')
      }
      
      setAutoFilledFields(updatedAutoFilled)
      setVersions(updatedVersions)
    } else if (field === 'test') {
      const updatedVersions = { ...versions, test: value }
      const updatedAutoFilled = new Set(autoFilledFields)
      
      if (value) {
        if (!(versions.staging || '').trim() || autoFilledFields.has('staging')) {
          updatedVersions.staging = value
          updatedAutoFilled.add('staging')
        }
        if (!(versions.production || '').trim() || autoFilledFields.has('production')) {
          updatedVersions.production = value
          updatedAutoFilled.add('production')
        }
      } else {
        updatedAutoFilled.delete('staging')
        updatedAutoFilled.delete('production')
      }
      
      setAutoFilledFields(updatedAutoFilled)
      setVersions(updatedVersions)
    } else {
      // 用户手动修改其他字段，移除自动填充标记
      const updatedAutoFilled = new Set(autoFilledFields)
      updatedAutoFilled.delete(field)
      setAutoFilledFields(updatedAutoFilled)
    }
  }, [versions, autoFilledFields])

  // 处理保存
  const handleSave = useCallback(async () => {
    if (!componentName.trim()) {
      message.error('请输入组件名称')
      return
    }

    if (existingNames.includes(componentName.trim())) {
      message.error('组件名称已存在')
      return
    }

    try {
      setSaving(true)
      const success = await onSave(componentName.trim(), versions)
      if (success) {
        handleClose()
      }
    } finally {
      setSaving(false)
    }
  }, [componentName, versions, onSave, existingNames, handleClose])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-modal-title"
    >
      <div
        className="bg-gradient-to-br from-gray-800/95 via-gray-800/98 to-gray-800/95 rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 scale-100 border-2 border-amber-500/30 relative overflow-hidden backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -z-10"></div>
        
        <div className="mb-8 relative z-10">
          <h2 id="add-modal-title" className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-amber-400 to-blue-400 bg-clip-text text-transparent mb-2">
            新增组件
          </h2>
          <p className="text-sm text-gray-300">请输入组件名称和版本信息</p>
        </div>
        
        <div className="space-y-5 relative z-10">
          <div>
            <label htmlFor="new-component-name" className="block text-sm font-bold text-blue-200 mb-2">
              组件名称 <span className="text-red-400">*</span>
            </label>
            <input
              id="new-component-name"
              type="text"
              value={componentName}
              onChange={(e) => setComponentName(e.target.value)}
              className="w-full text-sm bg-gradient-to-br from-gray-700/80 to-gray-800/80 border-2 border-blue-500/30 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/60 transition-all duration-200 placeholder-gray-400 shadow-inner"
              placeholder="请输入组件名称"
              aria-required="true"
            />
          </div>
          
          <VersionForm
            versions={versions}
            onChange={setVersions}
            autoFilledFields={autoFilledFields}
            onFieldChange={handleDevVersionChange}
          />
        </div>

        <div className="flex justify-end gap-3 mt-8 relative z-10">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 text-sm font-semibold bg-gray-700/80 text-gray-200 rounded-lg hover:bg-gray-600/80 transition-all duration-200 border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            aria-label="取消新增组件"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !componentName.trim()}
            className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transform hover:-translate-y-0.5 disabled:transform-none"
            aria-label="保存新组件"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default React.memo(AddComponentModal)

