import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { message } from 'antd'
import { useEscKey } from '../utils/useEscKey'
import { normalizeVersions, extractVersionsFromRdcInfo, createEmptyVersions, getSelectedVersion } from '../utils/versionUtils'
import { fetchRdcInfo, saveRdcInfo } from '../api/componentApi'
import VersionForm from './VersionForm'
import type { ComponentData, ComponentVersions, RdcInfo, Status, Environment } from '../types'
import { STATUS, ENV_MAPPING } from '../types'
import { extractApiError } from '../utils/errorHandler'

interface EditComponentModalProps {
  visible: boolean
  component: ComponentData | null
  onClose: () => void
  onSave: (name: string, versions: ComponentVersions) => Promise<boolean>
  onRefresh?: () => Promise<void>
  onUpdateComponent?: (componentName: string, versions: ComponentVersions) => void
}

const EditComponentModal: React.FC<EditComponentModalProps> = ({
  visible,
  component,
  onClose,
  onSave,
  onRefresh,
  onUpdateComponent
}) => {
  const [versions, setVersions] = useState<ComponentVersions>(createEmptyVersions())
  const [rdcInfo, setRdcInfo] = useState<RdcInfo | null>(null)
  const [saving, setSaving] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  useEscKey(visible, onClose)

  // 当弹框打开且组件存在时，获取 rdcInfo 并填充表单
  useEffect(() => {
    const loadRdcInfo = async () => {
      if (!visible || !component) {
        setVersions(createEmptyVersions())
        setRdcInfo(null)
        return
      }

      try {
        setLoading(true)
        // 调用接口获取 rdcInfo
        const fetchedRdcInfo = await fetchRdcInfo(component.componentName)
        
        if (fetchedRdcInfo) {
          setRdcInfo(fetchedRdcInfo)
          // 从 rdcInfo 中提取版本信息（优先显示 isValid: 1，如果没有则显示 stable，再没有则显示 latest）
          const extractedVersions = extractVersionsFromRdcInfo(fetchedRdcInfo)
          setVersions(extractedVersions)
        } else {
          // 如果接口返回为空，使用组件原有的版本信息作为后备
          setRdcInfo(null)
          setVersions(normalizeVersions(component.versions))
        }
      } catch (error) {
        console.error('获取组件信息失败:', error)
        // 出错时使用组件原有的版本信息作为后备
        if (component) {
          setRdcInfo(null)
          setVersions(normalizeVersions(component.versions))
        }
      } finally {
        setLoading(false)
      }
    }

    loadRdcInfo()
  }, [visible, component])

  // 处理关闭
  const handleClose = useCallback(() => {
    setVersions(createEmptyVersions())
    onClose()
  }, [onClose])

  // 处理保存
  const handleSave = useCallback(async () => {
    if (!component) return

    try {
      setSaving(true)
      
      // 如果有 rdcInfo，需要更新版本数组中的 isValid
      if (rdcInfo) {
        // 更新 rdcInfo 中的版本数组，给选中的版本添加 isValid: 1
        const updatedRdcInfo: RdcInfo = { ...rdcInfo }
        
        // 更新版本有效性的通用函数
        const updateVersionIsValid = (
          versionArray: Array<{ type: string; version: string; isValid?: Status }> | undefined,
          selectedVersion: string
        ): Array<{ type: string; version: string; isValid?: Status }> => {
          if (!versionArray) {
            // 如果没有版本数组，创建新版本项
            return selectedVersion ? [{
              type: 'latest',
              version: selectedVersion,
              isValid: STATUS.ACTIVE
            }] : []
          }
          
          // 检查选中的版本是否已存在
          const existingVersion = versionArray.find(item => item.version === selectedVersion)
          
          if (existingVersion) {
            // 如果版本已存在，更新 isValid
            return versionArray.map(item => {
              if (item.version === selectedVersion) {
                return { ...item, isValid: STATUS.ACTIVE }
              } else {
                return { ...item, isValid: STATUS.INACTIVE }
              }
            })
          } else {
            // 如果版本不存在（手动输入的新版本），添加新版本项
            const updatedArray = versionArray.map(item => ({
              ...item,
              isValid: STATUS.INACTIVE
            }))
            updatedArray.push({
              type: 'latest',
              version: selectedVersion,
              isValid: STATUS.ACTIVE
            })
            return updatedArray
          }
        }
        
        // 使用循环处理所有环境，避免重复代码
        Object.entries(ENV_MAPPING).forEach(([env, versionKey]) => {
          const version = versions[env as Environment]
          if (version) {
            const rdcVersionArray = rdcInfo[versionKey as keyof RdcInfo] as Array<{ type: string; version: string; isValid?: Status }> | undefined
            ;(updatedRdcInfo[versionKey as keyof RdcInfo] as Array<{ type: string; version: string; isValid?: Status }>) = 
              updateVersionIsValid(rdcVersionArray, version)
          }
        })
        
        // 保存更新后的 rdcInfo
        const saveResult = await saveRdcInfo(component.componentName, updatedRdcInfo)
        if (saveResult.success) {
          // 从更新后的 rdcInfo 中提取版本信息，直接更新组件列表
          const updatedVersions = extractVersionsFromRdcInfo(updatedRdcInfo)
          if (onUpdateComponent) {
            onUpdateComponent(component.componentName, updatedVersions)
          } else if (onRefresh) {
            // 如果没有 onUpdateComponent，则使用 onRefresh（向后兼容）
            await onRefresh()
          }
          message.success('保存版本成功')
          handleClose()
          return
        } else {
          const errorMessage = extractApiError(saveResult, '保存版本失败')
          console.error('保存 rdcInfo 失败:', errorMessage)
          message.error(errorMessage)
          return
        }
      } else {
        // 如果没有 rdcInfo，使用原来的保存逻辑
        const success = await onSave(component.componentName, versions)
        if (success) {
          message.success('保存版本成功')
          handleClose()
        } else {
          message.error('保存版本失败，请重试')
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '保存版本失败，请重试'
      console.error('保存版本时发生错误:', error)
      message.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }, [component, versions, rdcInfo, onSave, onRefresh, onUpdateComponent, handleClose])

  if (!visible || !component) return null

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <div
        className="bg-gradient-to-br from-gray-800/95 via-gray-800/98 to-gray-800/95 rounded-xl shadow-2xl p-8 w-full max-w-2xl transform transition-all duration-300 scale-100 border-2 border-amber-500/30 relative overflow-visible backdrop-blur-sm"
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-sm text-gray-400">加载中...</span>
            </div>
          ) : (
            <VersionForm
              versions={versions}
              onChange={setVersions}
              rdcInfo={rdcInfo}
            />
          )}
        </div>

        <div className="flex justify-end gap-3 mt-8 relative z-[1]">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 text-sm font-semibold bg-gray-700/80 text-gray-200 rounded-lg hover:bg-gray-600/80 transition-all duration-200 border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            aria-label="取消编辑"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
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

