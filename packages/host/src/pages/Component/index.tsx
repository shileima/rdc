import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { LeftCircleOutlined } from '@ant-design/icons'
import { message, Modal } from 'antd'
import { fetchUserInfo } from './api/componentApi'
import { useComponents } from './hooks/useComponents'
import { usePermissions } from './hooks/usePermissions'
import { useMiscSearch } from './hooks/useMiscSearch'
import ComponentTable from './components/ComponentTable'
import AddComponentModal from './components/AddComponentModal'
import EditComponentModal from './components/EditComponentModal'
import PermissionModal from './components/PermissionModal'
import { componentStyles } from './styles'
import type { UserInfo, ComponentData, ComponentVersions, MiscUser } from './types'

const Component: React.FC = () => {
  const navigate = useNavigate()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false)
  const [editModal, setEditModal] = useState<ComponentData | null>(null)
  const [permissionModalVisible, setPermissionModalVisible] = useState<boolean>(false)
  const [currentRdcName, setCurrentRdcName] = useState<string>('')
  const [deleting, setDeleting] = useState<string | null>(null)

  // 组件管理 Hook
  const {
    components,
    loading,
    updateComponent,
    addComponent,
    removeComponent
  } = useComponents()

  // 权限管理 Hook
  const {
    selectedAdmins,
    loading: permissionLoading,
    loadPermissions,
    savePermissions,
    addAdmin,
    removeAdmin,
    reset: resetPermissions
  } = usePermissions(components)

  // 用户搜索 Hook
  const {
    searchKeyword,
    searchResults,
    searching,
    handleSearch,
    clearSearch
  } = useMiscSearch(selectedAdmins)

  // 初始化：配置 message 和获取用户信息
  useEffect(() => {
    message.config({
      top: 24,
      duration: 3,
      maxCount: 3,
    })

    const loadUserInfo = async () => {
      const user = await fetchUserInfo()
      setUserInfo(user)
    }
    loadUserInfo()
  }, [])

  // 处理编辑
  const handleEdit = useCallback((component: ComponentData) => {
    setEditModal(component)
  }, [])

  // 处理关闭编辑
  const handleCloseEditModal = useCallback(() => {
    setEditModal(null)
  }, [])

  // 处理保存编辑
  const handleSaveEdit = useCallback(async (name: string, versions: ComponentVersions) => {
    return await updateComponent(name, versions)
  }, [updateComponent])

  // 处理新增组件
  const handleAddComponent = useCallback(() => {
    setAddModalVisible(true)
  }, [])

  // 处理关闭新增
  const handleCloseAddModal = useCallback(() => {
    setAddModalVisible(false)
  }, [])

  // 处理保存新增
  const handleSaveAdd = useCallback(async (name: string, versions: ComponentVersions) => {
    return await addComponent(name, versions)
  }, [addComponent])

  // 处理删除
  const handleDelete = useCallback((componentName: string) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除组件 "${componentName}" 吗？此操作不可恢复。`,
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setDeleting(componentName)
          await removeComponent(componentName)
        } finally {
          setDeleting(null)
        }
      }
    })
  }, [removeComponent])

  // 处理打开权限管理
  const handleOpenPermissionModal = useCallback(async (rdcName: string) => {
    setCurrentRdcName(rdcName)
    setPermissionModalVisible(true)
    await loadPermissions(rdcName)
  }, [loadPermissions])

  // 处理关闭权限管理
  const handleClosePermissionModal = useCallback(() => {
    setPermissionModalVisible(false)
    setCurrentRdcName('')
    resetPermissions()
    clearSearch()
  }, [resetPermissions, clearSearch])

  // 处理选择用户
  const handleSelectUser = useCallback((user: MiscUser) => {
    addAdmin(user)
    clearSearch()
  }, [addAdmin, clearSearch])

  // 处理保存权限
  const handleSavePermissions = useCallback(async (): Promise<boolean> => {
    const success = await savePermissions(currentRdcName, selectedAdmins)
    if (success) {
      handleClosePermissionModal()
      return true
    }
    return false
  }, [savePermissions, currentRdcName, selectedAdmins, handleClosePermissionModal])

  const canManage = userInfo?.login === 'mashilei'
  const existingNames = components.map(c => c.componentName)

  return (
    <div className="min-h-screen w-screen text-white p-8 md:p-12 relative overflow-hidden">
      {/* 背景效果 */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900/30 via-purple-900/20 to-gray-900 -z-10 animate-background-breathing"></div>
      <div className="fixed top-20 left-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl -z-10 animate-breathing"></div>
      <div className="fixed bottom-20 right-1/4 w-[600px] h-[600px] bg-purple-500/18 rounded-full blur-3xl -z-10 animate-breathing-delayed"></div>
      <div className="fixed top-1/2 left-0 w-[400px] h-[400px] bg-cyan-500/18 rounded-full blur-3xl -z-10 animate-breathing-slow"></div>
      <div className="fixed top-1/3 right-0 w-[450px] h-[450px] bg-indigo-500/15 rounded-full blur-3xl -z-10 animate-breathing"></div>
      <div className="fixed bottom-1/3 left-1/2 w-[350px] h-[350px] bg-amber-500/12 rounded-full blur-3xl -z-10 animate-breathing-slow"></div>
      <div className="fixed inset-0 bg-gradient-to-r from-transparent via-blue-500/10 via-purple-500/6 to-transparent -z-10 animate-shimmer"></div>
      <div className="fixed inset-0 radial-gradient-breathe -z-10 animate-pulse-slow"></div>
      <div className="fixed inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:50px_50px] -z-10 animate-grid-breathing"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* 页面头部 */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/rdc/home')}
                className="text-blue-400 hover:text-blue-300 transition-all duration-200 bg-transparent border-none p-2 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="返回首页"
                tabIndex={0}
              >
                <LeftCircleOutlined className="text-2xl" />
              </button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2 tracking-tight animate-gradient-shift">
                  组件管理平台
                </h1>
                <p className="text-base bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 bg-clip-text text-transparent font-medium">
                  组件版本管理与上下架状态监控
                </p>
              </div>
            </div>
            {canManage && (
              <button
                onClick={handleAddComponent}
                className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transform hover:-translate-y-0.5"
                aria-label="新增组件"
                tabIndex={0}
              >
                新增组件
              </button>
            )}
          </div>
        </div>

        {/* 表格卡片 */}
        <div className="bg-gradient-to-br from-gray-800/95 via-gray-800/98 to-gray-800/95 rounded-xl shadow-2xl border border-amber-500/20 overflow-hidden transition-all duration-300 hover:shadow-amber-500/20 hover:border-amber-500/40 backdrop-blur-sm">
          <ComponentTable
            components={components}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPermission={handleOpenPermissionModal}
            deleting={deleting}
            canManage={canManage}
          />
        </div>
      </div>

      {/* 样式 */}
      <style>{componentStyles}</style>

      {/* 新增组件弹框 */}
      <AddComponentModal
        visible={addModalVisible}
        onClose={handleCloseAddModal}
        onSave={handleSaveAdd}
        existingNames={existingNames}
      />

      {/* 编辑弹框 */}
      <EditComponentModal
        visible={!!editModal}
        component={editModal}
        onClose={handleCloseEditModal}
        onSave={handleSaveEdit}
      />

      {/* 权限管理弹框 */}
      <PermissionModal
        visible={permissionModalVisible}
        rdcName={currentRdcName}
        selectedAdmins={selectedAdmins}
        searching={searching}
        searchResults={searchResults}
        searchKeyword={searchKeyword}
        onClose={handleClosePermissionModal}
        onSave={handleSavePermissions}
        onSearch={handleSearch}
        onSelectUser={handleSelectUser}
        onRemoveAdmin={removeAdmin}
        saving={permissionLoading}
      />
    </div>
  )
}

export default Component

