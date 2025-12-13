import { useState, useCallback } from 'react'
import { message } from 'antd'
import { fetchRdcInfo, saveRdcInfo, fetchUserByAccount } from '../api/componentApi'
import type { RdcInfo, MiscUser, ComponentVersions } from '../types'

/**
 * 权限管理 Hook
 */
export const usePermissions = (components: Array<{ componentName: string; versions: ComponentVersions }>) => {
  const [selectedAdmins, setSelectedAdmins] = useState<MiscUser[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  // 加载权限列表
  const loadPermissions = useCallback(async (rdcName: string) => {
    try {
      setLoading(true)
      const rdcInfo = await fetchRdcInfo(rdcName)
      
      if (rdcInfo?.admins && rdcInfo.admins.length > 0) {
        // 根据 account 获取用户详细信息
        const adminUsers: MiscUser[] = []
        for (const account of rdcInfo.admins) {
          const user = await fetchUserByAccount(account)
          if (user) {
            adminUsers.push(user)
          }
        }
        setSelectedAdmins(adminUsers)
      } else {
        setSelectedAdmins([])
      }
    } catch (error) {
      console.error('加载权限失败:', error)
      setSelectedAdmins([])
    } finally {
      setLoading(false)
    }
  }, [])

  // 构建或获取 RdcInfo
  const buildRdcInfo = useCallback(async (
    rdcName: string,
    currentAdmins: MiscUser[]
  ): Promise<RdcInfo> => {
    const existingRdcInfo = await fetchRdcInfo(rdcName)
    
    if (existingRdcInfo) {
      return {
        ...existingRdcInfo,
        admins: currentAdmins.map(admin => admin.account)
      }
    }

    // 如果不存在，从组件数据中构建新的 rdc_info
    const currentComponent = components.find(comp => comp.componentName === rdcName)
    const componentVersions = currentComponent?.versions || {}
    
    const buildVersionArray = (version: string | undefined): Array<{ type: string; version: string }> => {
      if (version && version.trim()) {
        return [{ type: 'latest', version: version.trim() }]
      }
      return []
    }
    
    return {
      key: `rdc_info_${rdcName}`,
      label: rdcName,
      devVersions: buildVersionArray(componentVersions.development),
      testVersions: buildVersionArray(componentVersions.test),
      stagingVersions: buildVersionArray(componentVersions.staging),
      productionVersions: buildVersionArray(componentVersions.production),
      admins: currentAdmins.map(admin => admin.account)
    }
  }, [components])

  // 保存权限
  const savePermissions = useCallback(async (
    rdcName: string,
    currentAdmins: MiscUser[]
  ): Promise<boolean> => {
    try {
      setLoading(true)
      const rdcInfo = await buildRdcInfo(rdcName, currentAdmins)
      const result = await saveRdcInfo(rdcName, rdcInfo)
      
      if (result.success) {
        message.success('保存权限成功')
        return true
      } else {
        const errorMessage = result.message || `保存权限失败 (code: ${result.code || 'unknown'})`
        message.error(errorMessage)
        return false
      }
    } catch (error) {
      console.error('保存权限失败:', error)
      message.error('保存权限失败，请重试')
      return false
    } finally {
      setLoading(false)
    }
  }, [buildRdcInfo])

  // 添加管理员
  const addAdmin = useCallback((user: MiscUser) => {
    if (!selectedAdmins.find(admin => admin.account === user.account)) {
      setSelectedAdmins(prev => [...prev, user])
    }
  }, [selectedAdmins])

  // 移除管理员
  const removeAdmin = useCallback((account: string) => {
    setSelectedAdmins(prev => prev.filter(admin => admin.account !== account))
  }, [])

  // 重置
  const reset = useCallback(() => {
    setSelectedAdmins([])
  }, [])

  return {
    selectedAdmins,
    loading,
    loadPermissions,
    savePermissions,
    addAdmin,
    removeAdmin,
    reset,
    setSelectedAdmins
  }
}

