import { useState, useEffect, useCallback } from 'react'
import { message } from 'antd'
import { fetchComponents, saveComponentVersions, deleteComponent } from '../api/componentApi'
import type { ComponentData, ComponentVersions } from '../types'

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
        ([componentName, versions]) => ({
          componentName,
          versions
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
      const allComponentsMap: Record<string, ComponentVersions> = {}
      components.forEach(comp => {
        allComponentsMap[comp.componentName] = comp.versions
      })
      allComponentsMap[componentName.trim()] = cleanedVersions

      const result = await saveComponentVersions(
        componentName.trim(),
        allComponentsMap,
        cleanedVersions
      )

      if (result.success) {
        setComponents(prev => [
          ...prev,
          {
            componentName: componentName.trim(),
            versions: cleanedVersions
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

  return {
    components,
    loading,
    loadComponents,
    updateComponent,
    addComponent,
    removeComponent
  }
}

