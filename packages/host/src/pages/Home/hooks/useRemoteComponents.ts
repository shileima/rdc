import { useState, useEffect, lazy, ComponentType } from 'react'
import type { RdcType } from '../types'

// 动态导入远程组件
const RemoteComponent1 = lazy(() => import('rdc_test_1/App'))
const RemoteComponent2 = lazy(() => import('rdc_test_form/App'))
const RemoteComponent3 = lazy(() => import('rdc_test_table/App'))
const RemoteComponent4 = lazy(() => import('rdc_test_editor/App'))

// RDC 配置映射
const RDC_COMPONENTS: Record<RdcType, ComponentType> = {
  rdc1: RemoteComponent1,
  rdc2: RemoteComponent2,
  rdc3: RemoteComponent3,
  rdc4: RemoteComponent4
}

/**
 * 远程组件管理 Hook
 */
export const useRemoteComponents = () => {
  const [currentRdc, setCurrentRdc] = useState<RdcType>('rdc1')
  const [showRemote, setShowRemote] = useState<boolean>(false)

  // 自动加载远程组件
  useEffect(() => {
    setShowRemote(true)
  }, [])

  // 获取当前组件
  const getCurrentComponent = (): ComponentType | null => {
    return RDC_COMPONENTS[currentRdc] || null
  }

  return {
    currentRdc,
    showRemote,
    setCurrentRdc,
    getCurrentComponent
  }
}

