import { useState, useEffect, useCallback } from 'react'
import { message } from 'antd'
import { fetchComponents, saveComponentVersions, deleteComponent, addRdcInfo, updateRdcStatus } from '../api/componentApi'
import type { ComponentData, ComponentVersions, Status } from '../types'
import { STATUS } from '../types'

/**
 * 清理版本数据，过滤掉空字符串
 */
const cleanVersions = (versions: ComponentVersions): ComponentVersions => {
  const cleaned: ComponentVersions = {}
  if (versions.development?.trim()) {
    cleaned.development = versions.development.trim()
  }
  if (versions.test?.trim()) {
    cleaned.test = versions.test.trim()
  }
  if (versions.staging?.trim()) {
    cleaned.staging = versions.staging.trim()
  }
  if (versions.production?.trim()) {
    cleaned.production = versions.production.trim()
  }
  return cleaned
}

/**
 * 组件管理 Hook
 */
export const useComponents = () => {
  const [components, setComponents] = useState<ComponentData[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // 加载组件列表
  const loadComponents = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchComponents()
      const componentList: ComponentData[] = Object.entries(data).map(
        ([componentName, item]) => ({
          componentName,
          versions: item.versions,
          status: item.status
        })
      )
      setComponents(componentList)
    } catch (error) {
      console.error('加载组件列表失败:', error)
      message.error('加载组件列表失败')
    } finally {
      setLoading(false)
    }
  }, [])

  // 初始化加载
  useEffect(() => {
    loadComponents()
  }, [loadComponents])

  // 更新组件版本
  const updateComponent = useCallback(async (
    componentName: string,
    versions: ComponentVersions
  ): Promise<boolean> => {
    try {
      const cleanedVersions = cleanVersions(versions)
      const allComponentsMap: Record<string, ComponentVersions> = {}
      components.forEach(comp => {
        allComponentsMap[comp.componentName] = comp.versions
      })

      const result = await saveComponentVersions(
        componentName,
        allComponentsMap,
        cleanedVersions
      )

      if (result.success) {
        setComponents(prev => 
          prev.map(comp => 
            comp.componentName === componentName
              ? { ...comp, versions: cleanedVersions }
              : comp
          )
        )
        message.success('保存版本成功')
        return true
      } else {
        const errorMessage = result.message || `保存版本失败 (code: ${result.code || 'unknown'})`
        message.error(errorMessage)
        return false
      }
    } catch (error) {
      console.error('更新组件失败:', error)
      message.error('保存版本失败，请重试')
      return false
    }
  }, [components])

  // 添加组件
  const addComponent = useCallback(async (
    componentName: string,
    versions: ComponentVersions
  ): Promise<boolean> => {
    // 检查组件名称是否已存在
    if (components.some(comp => comp.componentName === componentName.trim())) {
      message.error('组件名称已存在')
      return false
    }

    try {
      const cleanedVersions = cleanVersions(versions)
      
      // 使用新的 addRdcInfo 接口
      const result = await addRdcInfo(componentName.trim(), cleanedVersions)

      if (result.success) {
        setComponents(prev => [
          ...prev,
          {
            componentName: componentName.trim(),
            versions: cleanedVersions,
            status: STATUS.ACTIVE // 新增组件默认为生效状态
          }
        ])
        message.success('新增组件成功')
        return true
      } else {
        const errorMessage = result.message || `新增组件失败 (code: ${result.code || 'unknown'})`
        message.error(errorMessage)
        return false
      }
    } catch (error) {
      console.error('新增组件失败:', error)
      message.error('新增组件失败，请重试')
      return false
    }
  }, [components])

  // 删除组件
  const removeComponent = useCallback(async (componentName: string): Promise<boolean> => {
    try {
      const allComponentsMap: Record<string, ComponentVersions> = {}
      components.forEach(comp => {
        allComponentsMap[comp.componentName] = comp.versions
      })

      const result = await deleteComponent(componentName, allComponentsMap)

      if (result.success) {
        setComponents(prev => prev.filter(comp => comp.componentName !== componentName))
        message.success('删除组件成功')
        return true
      } else {
        const errorMessage = result.message || `删除组件失败 (code: ${result.code || 'unknown'})`
        message.error(errorMessage)
        return false
      }
    } catch (error) {
      console.error('删除组件失败:', error)
      message.error('删除组件失败，请重试')
      return false
    }
  }, [components])

  // 直接更新组件版本（不调用 API，仅更新本地状态）
  const updateComponentLocal = useCallback((
    componentName: string,
    versions: ComponentVersions
  ): void => {
    const cleanedVersions = cleanVersions(versions)
    setComponents(prev => 
      prev.map(comp => 
        comp.componentName === componentName
          ? { ...comp, versions: cleanedVersions }
          : comp
      )
    )
  }, [])

  // 更新组件状态（上线/下线）
  const updateComponentStatus = useCallback(async (
    componentName: string,
    status: Status
  ): Promise<boolean> => {
    try {
      const result = await updateRdcStatus(componentName, status)
      
      if (result.success) {
        setComponents(prev => 
          prev.map(comp => 
            comp.componentName === componentName
              ? { ...comp, status }
              : comp
          )
        )
        message.success(status === STATUS.ACTIVE ? '上线成功' : '下线成功')
        return true
      } else {
        const errorMessage = result.message || `更新状态失败 (code: ${result.code || 'unknown'})`
        message.error(errorMessage)
        return false
      }
    } catch (error) {
      console.error('更新组件状态失败:', error)
      message.error('更新组件状态失败，请重试')
      return false
    }
  }, [])

  return {
    components,
    loading,
    loadComponents,
    updateComponent,
    updateComponentLocal,
    addComponent,
    removeComponent,
    updateComponentStatus
  }
}

