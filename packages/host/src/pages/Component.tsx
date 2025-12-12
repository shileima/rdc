import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { LeftCircleOutlined, CloseOutlined, DeleteOutlined, WarningOutlined } from '@ant-design/icons'
import { getEnvFromUrl, getApiBaseUrl } from '../utils'
import { message, Modal, Select, Avatar, Spin } from 'antd'

interface ComponentVersions {
  development?: string
  test?: string
  staging?: string
  production?: string
}

interface ComponentData {
  componentName: string
  versions: ComponentVersions
}

interface ApiResponse {
  success: boolean
  value: Record<string, ComponentVersions>
  message: string
}

interface EditModalData {
  componentName: string
  versions: ComponentVersions
}

interface SaveComponentRequest {
  rdcName: string
  env: 'dev' | 'test' | 'staging' | 'prod'
  appkey: string
  key: string
  value: Record<string, ComponentVersions>
  misId: string
}

interface UserInfo {
  id: number
  login: string
  name: string
  email: string
  code: string
  tenantId: number
  isVerified: number
  verifyType: string
  verifyExpireTime: number
  passport: string
  type: number
  subjectType: string
}

interface MiscUser {
  avatarUrl: string
  avatar_url: string
  bigAvatarUrl: string
  big_avatar_url: string
  orgPath: string
  orgPathName: string
  headName: string
  orgId: string
  name: string
  orgName: string
  account: string
  jobStatus: string | null
}

interface MiscListResponse {
  code: number
  msg: string
  data: MiscUser[]
}

interface RdcInfo {
  key: string
  label: string
  devVersions?: Array<{ type: string; version: string }>
  testVersions?: Array<{ type: string; version: string }>
  stagingVersions?: Array<{ type: string; version: string }>
  productionVersions?: Array<{ type: string; version: string }>
  admins?: string[]
}

const Component: React.FC = () => {
  const navigate = useNavigate()
  const [components, setComponents] = useState<ComponentData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [editModal, setEditModal] = useState<EditModalData | null>(null)
  const [editVersions, setEditVersions] = useState<ComponentVersions>({
    development: '',
    test: '',
    staging: '',
    production: ''
  })
  const [saving, setSaving] = useState<boolean>(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false)
  const [newComponentName, setNewComponentName] = useState<string>('')
  const [newComponentVersions, setNewComponentVersions] = useState<ComponentVersions>({
    development: '',
    test: '',
    staging: '',
    production: ''
  })
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set())
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [permissionModalVisible, setPermissionModalVisible] = useState<boolean>(false)
  const [currentRdcName, setCurrentRdcName] = useState<string>('')
  const [selectedAdmins, setSelectedAdmins] = useState<MiscUser[]>([])
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const [searchResults, setSearchResults] = useState<MiscUser[]>([])
  const [searching, setSearching] = useState<boolean>(false)

  useEffect(() => {
    // 配置 message 暗黑主题样式
    message.config({
      top: 24,
      duration: 3,
      maxCount: 3,
    })

    const fetchUserInfo = async () => {
      try {
        const apiUrl = getApiUrl('/nodeapi/userInfo')
        const response = await fetch(apiUrl)
        const userData: UserInfo = await response.json()
        setUserInfo(userData)
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        const apiUrl = getApiUrl('/nodeapi/lionConfig?key=rdc_component_version')
        const response = await fetch(apiUrl)
        const data: ApiResponse = await response.json()
        
        if (data.success && data.value) {
          const componentList: ComponentData[] = Object.entries(data.value).map(
            ([componentName, versions]) => ({
              componentName,
              versions
            })
          )
          setComponents(componentList)
        }
      } catch (error) {
        console.error('获取数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserInfo()
    fetchData()
  }, [])

  // ESC 键关闭弹框
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (addModalVisible) {
          setAddModalVisible(false)
          setNewComponentName('')
          setNewComponentVersions({
            development: '',
            test: '',
            staging: '',
            production: ''
          })
        }
        if (editModal) {
          setEditModal(null)
          setEditVersions({ development: '', test: '', staging: '', production: '' })
        }
      }
    }

    if (addModalVisible || editModal) {
      window.addEventListener('keydown', handleEscKey)
      return () => {
        window.removeEventListener('keydown', handleEscKey)
      }
    }
  }, [addModalVisible, editModal])

  // 获取 API URL，开发环境使用相对路径通过 Vite proxy
  const getApiUrl = (path: string): string => {
    // 开发环境使用相对路径，通过 Vite proxy 代理，避免 CORS 问题
    if (import.meta.env.DEV) {
      return path
    }
    return `${getApiBaseUrl()}${path}`
  }

  const handleEdit = (component: ComponentData) => {
    setEditModal({ componentName: component.componentName, versions: component.versions })
    // 确保空值也保留
    setEditVersions({
      development: component.versions.development || '',
      test: component.versions.test || '',
      staging: component.versions.staging || '',
      production: component.versions.production || ''
    })
  }

  const getMisIdFromLocalStorage = () => {
    try {
      const userInfoStr = localStorage.getItem('userInfo')
      if (!userInfoStr) {
        return ''
      }
      const userInfo = JSON.parse(userInfoStr)
      return userInfo?.sso_account || ''
    } catch (error) {
      console.error('获取 userInfo 失败:', error)
      return ''
    }
  }

  const handleSaveVersions = async () => {
    if (!editModal) return
    
    try {
      setSaving(true)
      
      // 构建更新后的版本数据
      // 过滤掉空字符串，只保留有值的版本
      const updatedVersions: ComponentVersions = {}
      if (editVersions.development && editVersions.development.trim()) {
        updatedVersions.development = editVersions.development.trim()
      }
      if (editVersions.test && editVersions.test.trim()) {
        updatedVersions.test = editVersions.test.trim()
      }
      if (editVersions.staging && editVersions.staging.trim()) {
        updatedVersions.staging = editVersions.staging.trim()
      }
      if (editVersions.production && editVersions.production.trim()) {
        updatedVersions.production = editVersions.production.trim()
      }

      // 构建完整的组件版本对象
      const updatedValue: Record<string, ComponentVersions> = {}
      components.forEach(comp => {
        if (comp.componentName === editModal.componentName) {
          updatedValue[comp.componentName] = updatedVersions
        } else {
          updatedValue[comp.componentName] = comp.versions
        }
      })

      const misId = getMisIdFromLocalStorage()

      // 构建请求数据
      const requestData: SaveComponentRequest = {
        env: getEnvFromUrl(),
        appkey: 'com.sankuai.waimaiqafc.automan',
        key: 'rdc_component_version',
        value: updatedValue,
        rdcName: editModal.componentName,
        misId
      }

      // 调用 API 保存
      const apiUrl = getApiUrl('/nodeapi/setLionConfig')
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
      
      const result = await response.json()
      console.log('response result:', result)
      
      if (result.success) {
        // 更新本地状态
        setComponents(prev => 
          prev.map(comp => 
            comp.componentName === editModal.componentName
              ? { ...comp, versions: updatedVersions }
              : comp
          )
        )
        setEditModal(null)
        message.success('保存版本成功')
      } else {
        const errorMessage = result.message || `保存版本失败 (code: ${result.code || 'unknown'})`
        console.error('保存版本失败:', errorMessage, 'code:', result.code)
        message.error(errorMessage)
      }
    } catch (error) {
      console.error('保存版本失败:', error)
      message.error('保存版本失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const handleCloseModal = () => {
    setEditModal(null)
    setEditVersions({ development: '', test: '', staging: '', production: '' })
  }

  const getVersionDisplay = (version: string | undefined): string => {
    return version && version.trim() ? version : '暂无'
  }

  const handleOpenPermissionModal = async (rdcName: string) => {
    setCurrentRdcName(rdcName)
    setPermissionModalVisible(true)
    
    // 加载当前权限列表
    try {
      const apiUrl = getApiUrl(`/nodeapi/lionConfig?key=rdc_info_${rdcName}`)
      const response = await fetch(apiUrl)
      const data: ApiResponse = await response.json()
      
      if (data.success && data.value) {
        const rdcInfo = (data.value as unknown) as RdcInfo
        const adminAccounts = rdcInfo.admins || []
        
        // 根据 account 获取用户详细信息
        const adminUsers: MiscUser[] = []
        for (const account of adminAccounts) {
          try {
            const searchUrl = `https://eci.sankuai.com/api/qa/v1/common/getMiscListDetail?name=${account}`
            const searchResponse = await fetch(searchUrl)
            const searchData: MiscListResponse = await searchResponse.json()
            if (searchData.code === 0 && searchData.data && searchData.data.length > 0) {
              adminUsers.push(searchData.data[0])
            }
          } catch (error) {
            console.error(`获取用户 ${account} 信息失败:`, error)
          }
        }
        setSelectedAdmins(adminUsers)
      } else {
        setSelectedAdmins([])
      }
    } catch (error) {
      console.error('获取权限信息失败:', error)
      setSelectedAdmins([])
    }
  }

  const handleClosePermissionModal = () => {
    setPermissionModalVisible(false)
    setCurrentRdcName('')
    setSelectedAdmins([])
    setSearchKeyword('')
    setSearchResults([])
  }

  const fetchMiscUsers = useCallback(async (search: string): Promise<MiscUser[]> => {
    if (!search.trim()) {
      return []
    }
    
    try {
      setSearching(true)
      const searchUrl = `https://eci.sankuai.com/api/qa/v1/common/getMiscListDetail?name=${search}`
      const response = await fetch(searchUrl)
      const data: MiscListResponse = await response.json()
      
      if (data.code === 0 && data.data) {
        // 过滤掉已经选中的用户
        const selectedAccounts = selectedAdmins.map(admin => admin.account)
        return data.data.filter(user => !selectedAccounts.includes(user.account))
      }
      return []
    } catch (error) {
      console.error('搜索用户失败:', error)
      return []
    } finally {
      setSearching(false)
    }
  }, [selectedAdmins])

  // 简单的 debounce 实现
  const debounce = (func: (search: string, callback: (users: MiscUser[]) => void) => void, wait: number) => {
    let timeout: ReturnType<typeof setTimeout> | null = null
    return function executedFunction(search: string, callback: (users: MiscUser[]) => void) {
      const later = () => {
        timeout = null
        func(search, callback)
      }
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  const debouncedFetchMiscUsers = useMemo(
    () => debounce((search: string, callback: (users: MiscUser[]) => void) => {
      fetchMiscUsers(search).then(callback)
    }, 300),
    [fetchMiscUsers]
  )

  const handleSelectUser = (user: MiscUser) => {
    if (!selectedAdmins.find(admin => admin.account === user.account)) {
      setSelectedAdmins([...selectedAdmins, user])
    }
    setSearchKeyword('')
    setSearchResults([])
  }

  const handleRemoveAdmin = (account: string) => {
    setSelectedAdmins(selectedAdmins.filter(admin => admin.account !== account))
  }

  const handleSavePermissions = async () => {
    try {
      setSaving(true)
      
      // 获取当前的 rdc_info 数据
      const apiUrl = getApiUrl(`/nodeapi/lionConfig?key=rdc_info_${currentRdcName}`)
      const response = await fetch(apiUrl)
      const data: ApiResponse = await response.json()
      
      let rdcInfo: RdcInfo
      
      // 检查 data.value 是否存在且是对象类型（不是字符串错误消息）
      const isValidRdcInfo = data.success && 
                             data.value && 
                             typeof data.value === 'object' && 
                             !Array.isArray(data.value) &&
                             !(data.value instanceof String)
      
      if (isValidRdcInfo) {
        // 如果已存在，使用现有数据，确保 admins 字段存在
        rdcInfo = {
          ...(data.value as unknown as RdcInfo),
          admins: (data.value as unknown as RdcInfo).admins || []
        }
      } else {
        // 如果不存在或返回错误，从组件数据中构建新的 rdc_info
        const currentComponent = components.find(comp => comp.componentName === currentRdcName)
        const componentVersions = currentComponent?.versions || {}
        
        // 构建版本数组，格式: [{type: "latest", version: "版本号"}]
        const buildVersionArray = (version: string | undefined): Array<{ type: string; version: string }> => {
          if (version && version.trim()) {
            return [{ type: 'latest', version: version.trim() }]
          }
          return []
        }
        
        rdcInfo = {
          key: `rdc_info_${currentRdcName}`,
          label: currentRdcName, // 可以根据需要修改为更友好的显示名称
          devVersions: buildVersionArray(componentVersions.development),
          testVersions: buildVersionArray(componentVersions.test),
          stagingVersions: buildVersionArray(componentVersions.staging),
          productionVersions: buildVersionArray(componentVersions.production),
          admins: []
        }
      }
      
      // 更新 admins 字段
      rdcInfo.admins = selectedAdmins.map(admin => admin.account)
      
      const misId = getMisIdFromLocalStorage()
      
      // 保存到 lion
      const saveUrl = getApiUrl('/nodeapi/setLionConfig')
      const saveResponse = await fetch(saveUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          env: getEnvFromUrl(),
          appkey: 'com.sankuai.waimaiqafc.automan',
          key: `rdc_info_${currentRdcName}`,
          value: rdcInfo,
          rdcName: currentRdcName,
          misId
        })
      })
      
      const saveResult = await saveResponse.json()
      
      if (saveResult.success) {
        message.success('保存权限成功')
        handleClosePermissionModal()
      } else {
        const errorMessage = saveResult.message || `保存权限失败 (code: ${saveResult.code || 'unknown'})`
        console.error('保存权限失败:', errorMessage, 'code:', saveResult.code)
        message.error(errorMessage)
      }
    } catch (error) {
      console.error('保存权限失败:', error)
      message.error('保存权限失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const handleAddComponent = () => {
    setNewComponentName('')
    setNewComponentVersions({
      development: '',
      test: '',
      staging: '',
      production: ''
    })
    setAddModalVisible(true)
  }

  const handleCloseAddModal = () => {
    setAddModalVisible(false)
    setNewComponentName('')
    setNewComponentVersions({
      development: '',
      test: '',
      staging: '',
      production: ''
    })
    setAutoFilledFields(new Set())
  }

  const handleNewDevVersionChange = (value: string) => {
    const updatedVersions = { ...newComponentVersions, development: value }
    const updatedAutoFilled = new Set(autoFilledFields)
    
    // 如果 dev 有值，实时填充到 test/staging/production（如果它们为空或是自动填充的）
    if (value) {
      // 如果 test 为空或是自动填充的，则更新
      if (!(newComponentVersions.test || '').trim() || autoFilledFields.has('test')) {
        updatedVersions.test = value
        updatedAutoFilled.add('test')
      }
      // 如果 staging 为空或是自动填充的，则更新
      if (!(newComponentVersions.staging || '').trim() || autoFilledFields.has('staging')) {
        updatedVersions.staging = value
        updatedAutoFilled.add('staging')
      }
      // 如果 production 为空或是自动填充的，则更新
      if (!(newComponentVersions.production || '').trim() || autoFilledFields.has('production')) {
        updatedVersions.production = value
        updatedAutoFilled.add('production')
      }
    } else {
      // 如果 dev 被清空，清除自动填充标记
      updatedAutoFilled.delete('test')
      updatedAutoFilled.delete('staging')
      updatedAutoFilled.delete('production')
    }
    
    setAutoFilledFields(updatedAutoFilled)
    setNewComponentVersions(updatedVersions)
  }

  const handleNewTestVersionChange = (value: string) => {
    const updatedVersions = { ...newComponentVersions, test: value }
    const updatedAutoFilled = new Set(autoFilledFields)
    
    // 如果 test 有值，实时填充到 staging/production（如果它们为空或是自动填充的）
    if (value) {
      // 如果 staging 为空或是自动填充的，则更新
      if (!(newComponentVersions.staging || '').trim() || autoFilledFields.has('staging')) {
        updatedVersions.staging = value
        updatedAutoFilled.add('staging')
      }
      // 如果 production 为空或是自动填充的，则更新
      if (!(newComponentVersions.production || '').trim() || autoFilledFields.has('production')) {
        updatedVersions.production = value
        updatedAutoFilled.add('production')
      }
    } else {
      // 如果 test 被清空，清除自动填充标记
      updatedAutoFilled.delete('staging')
      updatedAutoFilled.delete('production')
    }
    
    setAutoFilledFields(updatedAutoFilled)
    setNewComponentVersions(updatedVersions)
  }


  const handleSaveNewComponent = async () => {
    if (!newComponentName.trim()) {
      message.error('请输入组件名称')
      return
    }

    // 检查组件名称是否已存在
    if (components.some(comp => comp.componentName === newComponentName.trim())) {
      message.error('组件名称已存在')
      return
    }

    try {
      setSaving(true)
      
      // 构建新组件的版本数据
      const newVersions: ComponentVersions = {}
      if (newComponentVersions.development && newComponentVersions.development.trim()) {
        newVersions.development = newComponentVersions.development.trim()
      }
      if (newComponentVersions.test && newComponentVersions.test.trim()) {
        newVersions.test = newComponentVersions.test.trim()
      }
      if (newComponentVersions.staging && newComponentVersions.staging.trim()) {
        newVersions.staging = newComponentVersions.staging.trim()
      }
      if (newComponentVersions.production && newComponentVersions.production.trim()) {
        newVersions.production = newComponentVersions.production.trim()
      }

      // 构建完整的组件版本对象（包含新组件）
      const updatedValue: Record<string, ComponentVersions> = {}
      components.forEach(comp => {
        updatedValue[comp.componentName] = comp.versions
      })
      updatedValue[newComponentName.trim()] = newVersions

      const misId = getMisIdFromLocalStorage()

      // 构建请求数据
      const requestData: SaveComponentRequest = {
        env: getEnvFromUrl(),
        appkey: 'com.sankuai.waimaiqafc.automan',
        key: 'rdc_component_version',
        value: updatedValue,
        rdcName: newComponentName.trim(),
        misId
      }

      // 调用 API 保存
      const apiUrl = getApiUrl('/nodeapi/setLionConfig')
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
      
      const result = await response.json()
      console.log('add component response result:', result)
      
      if (result.success) {
        // 更新本地状态，添加新组件
        setComponents(prev => [
          ...prev,
          {
            componentName: newComponentName.trim(),
            versions: newVersions
          }
        ])
        handleCloseAddModal()
        message.success('新增组件成功')
      } else {
        const errorMessage = result.message || `新增组件失败 (code: ${result.code || 'unknown'})`
        console.error('新增组件失败:', errorMessage, 'code:', result.code)
        message.error(errorMessage)
      }
    } catch (error) {
      console.error('新增组件失败:', error)
      message.error('新增组件失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (componentName: string) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除组件 "${componentName}" 吗？此操作不可恢复。`,
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setDeleting(componentName)
          
          // 构建删除后的组件版本对象（排除要删除的组件）
          const updatedValue: Record<string, ComponentVersions> = {}
          components.forEach(comp => {
            if (comp.componentName !== componentName) {
              updatedValue[comp.componentName] = comp.versions
            }
          })

          const misId = getMisIdFromLocalStorage()

          // 构建请求数据
          const requestData: SaveComponentRequest = {
            env: getEnvFromUrl(),
            appkey: 'com.sankuai.waimaiqafc.automan',
            key: 'rdc_component_version',
            value: updatedValue,
            rdcName: componentName,
            misId
          }

          // 调用 API 保存（删除操作）
          const apiUrl = getApiUrl('/nodeapi/setLionConfig')
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
          })
          
          const result = await response.json()
          console.log('delete response result:', result)
          
          if (result.success) {
            // 更新本地状态，从列表中移除该组件
            setComponents(prev => prev.filter(comp => comp.componentName !== componentName))
            message.success('删除组件成功')
          } else {
            const errorMessage = result.message || `删除组件失败 (code: ${result.code || 'unknown'})`
            console.error('删除组件失败:', errorMessage, 'code:', result.code)
            message.error(errorMessage)
          }
        } catch (error) {
          console.error('删除组件失败:', error)
          message.error('删除组件失败，请重试')
        } finally {
          setDeleting(null)
        }
      }
    })
  }

  return (
    <div className="min-h-screen w-screen text-white p-8 md:p-12 relative overflow-hidden">
      {/* 炫酷背景渐变 - 动态呼吸 */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900/30 via-purple-900/20 to-gray-900 -z-10 animate-background-breathing"></div>
      
      {/* 呼吸灯效果 - 多个渐变球，增强动态效果 */}
      <div className="fixed top-20 left-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl -z-10 animate-breathing"></div>
      <div className="fixed bottom-20 right-1/4 w-[600px] h-[600px] bg-purple-500/18 rounded-full blur-3xl -z-10 animate-breathing-delayed"></div>
      <div className="fixed top-1/2 left-0 w-[400px] h-[400px] bg-cyan-500/18 rounded-full blur-3xl -z-10 animate-breathing-slow"></div>
      <div className="fixed top-1/3 right-0 w-[450px] h-[450px] bg-indigo-500/15 rounded-full blur-3xl -z-10 animate-breathing"></div>
      <div className="fixed bottom-1/3 left-1/2 w-[350px] h-[350px] bg-amber-500/12 rounded-full blur-3xl -z-10 animate-breathing-slow"></div>
      
      {/* 动态光效 - 增强呼吸感 */}
      <div className="fixed inset-0 bg-gradient-to-r from-transparent via-blue-500/10 via-purple-500/6 to-transparent -z-10 animate-shimmer"></div>
      <div className="fixed inset-0 radial-gradient-breathe -z-10 animate-pulse-slow"></div>
      
      {/* 网格背景 - 动态呼吸 */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:50px_50px] -z-10 animate-grid-breathing"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* 页面头部 - 增加留白和视觉层级 */}
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
            {userInfo?.login === 'mashilei' && (
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

        {/* 表格卡片 - 商业化风格 */}
        <div className="bg-gradient-to-br from-gray-800/95 via-gray-800/98 to-gray-800/95 rounded-xl shadow-2xl border border-amber-500/20 overflow-hidden transition-all duration-300 hover:shadow-amber-500/20 hover:border-amber-500/40 backdrop-blur-sm">
          {loading ? (
            <div className="px-8 py-16 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-gray-400 mt-4 text-sm">加载中...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/60 border-b border-gray-600/50">
                    <tr>
                      <th className="px-8 py-5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        组件名称
                      </th>
                      <th className="px-8 py-5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        版本
                      </th>
                      <th className="px-8 py-5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800/50 divide-y divide-amber-500/10">
                    {components.map((component, index) => (
                      <tr
                        key={component.componentName}
                        className="group transition-all duration-300 border-l-4 border-transparent hover:bg-gradient-to-r hover:from-blue-900/30 hover:via-amber-900/20 hover:to-blue-900/30 hover:shadow-lg hover:border-l-amber-500/70"
                        style={{
                          animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                          borderLeft: '4px solid transparent'
                        }}
                      >
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className="text-sm font-bold text-blue-200">
                            {component.componentName}
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex justify-center">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                              <div className="flex items-center justify-end space-x-3">
                                <span className="text-xs text-gray-400 font-medium">development:</span>
                                <code className="text-xs bg-gray-700/50 text-white px-2.5 py-1 rounded-lg font-mono border border-blue-500/40 min-w-[60px] text-center">
                                  {getVersionDisplay(component.versions.development)}
                                </code>
                              </div>
                              <div className="flex items-center justify-end space-x-3">
                                <span className="text-xs text-gray-400 font-medium">test:</span>
                                <code className="text-xs bg-gray-700/50 text-white px-2.5 py-1 rounded-lg font-mono border border-yellow-500/40 min-w-[60px] text-center">
                                  {getVersionDisplay(component.versions.test)}
                                </code>
                              </div>
                              <div className="flex items-center justify-end space-x-3">
                                <span className="text-xs text-gray-400 font-medium">staging:</span>
                                <code className="text-xs bg-gray-700/50 text-white px-2.5 py-1 rounded-lg font-mono border border-orange-500/40 min-w-[60px] text-center">
                                  {getVersionDisplay(component.versions.staging)}
                                </code>
                              </div>
                              <div className="flex items-center justify-end space-x-3">
                                <span className="text-xs text-gray-400 font-medium">production:</span>
                                <code className="text-xs bg-gray-700/50 text-white px-2.5 py-1 rounded-lg font-mono border border-amber-500/50 min-w-[60px] text-center">
                                  {getVersionDisplay(component.versions.production)}
                                </code>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-center">
                          <div className="flex items-center justify-center gap-4">
                            <button
                              onClick={() => handleEdit(component)}
                              className="text-blue-400 hover:text-blue-300 transition-all duration-200 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded px-2 py-1"
                              aria-label={`编辑组件 ${component.componentName}`}
                              tabIndex={0}
                            >
                              编辑
                            </button>
                            {userInfo?.login === 'mashilei' && (
                              <>
                                <button
                                  onClick={() => handleOpenPermissionModal(component.componentName)}
                                  className="text-gray-400 hover:text-gray-300 transition-all duration-200 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded px-2 py-1"
                                  aria-label={`权限管理 ${component.componentName}`}
                                  tabIndex={0}
                                >
                                  权限
                                </button>
                                <button
                                  onClick={() => handleDelete(component.componentName)}
                                  disabled={deleting === component.componentName}
                                  className="text-red-500 hover:text-red-400 transition-all duration-200 font-medium hover:underline disabled:text-gray-600 disabled:cursor-not-allowed disabled:hover:no-underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded px-2 py-1"
                                  aria-label={`删除组件 ${component.componentName}`}
                                  tabIndex={0}
                                >
                                  {deleting === component.componentName ? '删除中...' : '删除'}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes breathing {
          0%, 100% {
            opacity: 0.25;
            transform: scale(1) translate(0, 0);
          }
          33% {
            opacity: 0.5;
            transform: scale(1.2) translate(20px, -20px);
          }
          66% {
            opacity: 0.35;
            transform: scale(1.1) translate(-15px, 15px);
          }
        }
        @keyframes breathing-delayed {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1) translate(0, 0);
          }
          33% {
            opacity: 0.45;
            transform: scale(1.25) translate(-25px, 25px);
          }
          66% {
            opacity: 0.3;
            transform: scale(1.15) translate(20px, -15px);
          }
        }
        @keyframes breathing-slow {
          0%, 100% {
            opacity: 0.22;
            transform: scale(1) translate(0, 0);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.15) translate(15px, 20px);
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) skewX(-15deg);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(200%) skewX(-15deg);
            opacity: 0;
          }
        }
        @keyframes background-breathing {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.95;
          }
        }
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }
        @keyframes grid-breathing {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-background-breathing {
          animation: background-breathing 6s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        .animate-grid-breathing {
          animation: grid-breathing 4s ease-in-out infinite;
        }
        .radial-gradient-breathe {
          background: radial-gradient(circle at center, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
        }
        .animate-breathing {
          animation: breathing 4s ease-in-out infinite;
        }
        .animate-breathing-delayed {
          animation: breathing-delayed 5s ease-in-out infinite;
          animation-delay: 1s;
        }
        .animate-breathing-slow {
          animation: breathing-slow 6s ease-in-out infinite;
          animation-delay: 2s;
        }
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
        .animate-shimmer {
          animation: shimmer 8s linear infinite;
        }
        .permission-select .ant-select-selector {
          background-color: #374151 !important;
          border-color: #4b5563 !important;
          color: #ffffff !important;
          height: 42px !important;
          min-height: 42px !important;
        }
        .permission-select .ant-select-selector:hover {
          border-color: #6b7280 !important;
        }
        .permission-select.ant-select-focused .ant-select-selector {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
        }
        .permission-select .ant-select-selection-placeholder {
          color: #9ca3af !important;
          line-height: 40px !important;
        }
        .permission-select .ant-select-selection-search-input {
          color: #ffffff !important;
          height: 40px !important;
          line-height: 40px !important;
        }
        .permission-select .ant-select-selection-item {
          line-height: 40px !important;
        }
        .permission-select-dropdown {
          background-color: #1f2937 !important;
        }
        .permission-select-dropdown .ant-select-item {
          color: #e5e7eb !important;
          background-color: #1f2937 !important;
        }
        .permission-select-dropdown .ant-select-item:hover {
          background-color: #374151 !important;
        }
        .permission-select-dropdown .ant-select-item-option-selected {
          background-color: #374151 !important;
        }
      `}</style>

      {/* 新增组件弹框 */}
      {addModalVisible && (
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
            {/* 背景装饰 */}
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
                  value={newComponentName}
                  onChange={(e) => setNewComponentName(e.target.value)}
                  className="w-full text-sm bg-gradient-to-br from-gray-700/80 to-gray-800/80 border-2 border-blue-500/30 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/60 transition-all duration-200 placeholder-gray-400 shadow-inner"
                  placeholder="请输入组件名称"
                  aria-required="true"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                <div>
                  <label htmlFor="new-dev-version" className="block text-sm font-semibold text-gray-300 mb-2">
                    Development 环境版本
                  </label>
                  <input
                    id="new-dev-version"
                    type="text"
                    value={newComponentVersions.development}
                    onChange={(e) => handleNewDevVersionChange(e.target.value)}
                    className="w-full text-sm bg-gray-700/50 border border-blue-500/40 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/60 transition-all duration-200 placeholder-gray-400"
                    placeholder="请输入版本号"
                  />
                </div>
                
                <div>
                  <label htmlFor="new-test-version" className="block text-sm font-semibold text-gray-300 mb-2">
                    Test 环境版本
                  </label>
                  <input
                    id="new-test-version"
                    type="text"
                    value={newComponentVersions.test}
                    onChange={(e) => handleNewTestVersionChange(e.target.value)}
                    className="w-full text-sm bg-gray-700/50 border border-yellow-500/40 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/60 transition-all duration-200 placeholder-gray-400"
                    placeholder="请输入版本号"
                  />
                </div>
                
                <div>
                  <label htmlFor="new-staging-version" className="block text-sm font-semibold text-gray-300 mb-2">
                    Staging 环境版本
                  </label>
                  <input
                    id="new-staging-version"
                    type="text"
                    value={newComponentVersions.staging}
                    onChange={(e) => {
                      setNewComponentVersions({ ...newComponentVersions, staging: e.target.value })
                      // 用户手动修改 staging，移除自动填充标记
                      const updatedAutoFilled = new Set(autoFilledFields)
                      updatedAutoFilled.delete('staging')
                      setAutoFilledFields(updatedAutoFilled)
                    }}
                    className="w-full text-sm bg-gray-700/50 border border-orange-500/40 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/60 transition-all duration-200 placeholder-gray-400"
                    placeholder="请输入版本号"
                  />
                </div>
                
                <div>
                  <label htmlFor="new-prod-version" className="block text-sm font-semibold text-gray-300 mb-2">
                    Production 环境版本
                  </label>
                  <input
                    id="new-prod-version"
                    type="text"
                    value={newComponentVersions.production}
                    onChange={(e) => {
                      setNewComponentVersions({ ...newComponentVersions, production: e.target.value })
                      // 用户手动修改 production，移除自动填充标记
                      const updatedAutoFilled = new Set(autoFilledFields)
                      updatedAutoFilled.delete('production')
                      setAutoFilledFields(updatedAutoFilled)
                    }}
                    className="w-full text-sm bg-gray-700/50 border border-amber-500/50 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/60 transition-all duration-200 placeholder-gray-400"
                    placeholder="请输入版本号"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 relative z-10">
              <button
                onClick={handleCloseAddModal}
                className="px-6 py-2.5 text-sm font-semibold bg-gray-700/80 text-gray-200 rounded-lg hover:bg-gray-600/80 transition-all duration-200 border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                aria-label="取消新增组件"
              >
                取消
              </button>
              <button
                onClick={handleSaveNewComponent}
                disabled={saving}
                className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transform hover:-translate-y-0.5 disabled:transform-none"
                aria-label="保存新组件"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑弹框 */}
      {editModal && (
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
            {/* 背景装饰 */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -z-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -z-10"></div>
            
            <div className="mb-8 relative z-10">
              <h2 id="edit-modal-title" className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-amber-400 to-blue-400 bg-clip-text text-transparent mb-2">
                编辑版本
              </h2>
              <p className="text-sm text-blue-200 font-medium">{editModal.componentName}</p>
            </div>
            
            <div className="space-y-5 relative z-10">
              <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                <div>
                  <label htmlFor="edit-dev-version" className="block text-sm font-semibold text-gray-300 mb-2">
                    Development 环境版本
                  </label>
                  <input
                    id="edit-dev-version"
                    type="text"
                    value={editVersions.development}
                    onChange={(e) => setEditVersions({ ...editVersions, development: e.target.value })}
                    className="w-full text-sm bg-gray-700/50 border border-blue-500/40 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/60 transition-all duration-200 placeholder-gray-400"
                    placeholder="请输入版本号"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-test-version" className="block text-sm font-semibold text-gray-300 mb-2">
                    Test 环境版本
                  </label>
                  <input
                    id="edit-test-version"
                    type="text"
                    value={editVersions.test}
                    onChange={(e) => setEditVersions({ ...editVersions, test: e.target.value })}
                    className="w-full text-sm bg-gray-700/50 border border-yellow-500/40 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/60 transition-all duration-200 placeholder-gray-400"
                    placeholder="请输入版本号"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-staging-version" className="block text-sm font-semibold text-gray-300 mb-2">
                    Staging 环境版本
                  </label>
                  <input
                    id="edit-staging-version"
                    type="text"
                    value={editVersions.staging}
                    onChange={(e) => setEditVersions({ ...editVersions, staging: e.target.value })}
                    className="w-full text-sm bg-gray-700/50 border border-orange-500/40 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/60 transition-all duration-200 placeholder-gray-400"
                    placeholder="请输入版本号"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-prod-version" className="block text-sm font-semibold text-gray-300 mb-2">
                    Production 环境版本
                  </label>
                  <input
                    id="edit-prod-version"
                    type="text"
                    value={editVersions.production}
                    onChange={(e) => setEditVersions({ ...editVersions, production: e.target.value })}
                    className="w-full text-sm bg-gray-700/50 border border-amber-500/50 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/60 transition-all duration-200 placeholder-gray-400"
                    placeholder="请输入版本号"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 relative z-10">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2.5 text-sm font-semibold bg-gray-700/80 text-gray-200 rounded-lg hover:bg-gray-600/80 transition-all duration-200 border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                aria-label="取消编辑"
              >
                取消
              </button>
              <button
                onClick={handleSaveVersions}
                disabled={saving}
                className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transform hover:-translate-y-0.5 disabled:transform-none"
                aria-label="保存版本"
              >
                {saving ? '保存中...' : '保存版本'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 权限管理弹框 */}
      {permissionModalVisible && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="permission-modal-title"
        >
          <div
            className="bg-gradient-to-br from-gray-800/95 via-gray-800/98 to-gray-800/95 rounded-xl shadow-2xl p-8 w-full max-w-2xl transform transition-all duration-300 scale-100 border-2 border-amber-500/30 relative overflow-hidden backdrop-blur-sm max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 背景装饰 */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -z-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -z-10"></div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h2 id="permission-modal-title" className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-amber-400 to-blue-400 bg-clip-text text-transparent">
                权限管理
              </h2>
              <button
                onClick={handleClosePermissionModal}
                className="text-gray-400 hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                aria-label="关闭权限管理"
              >
                <CloseOutlined className="text-xl" />
              </button>
            </div>

            {/* 提示信息 */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/30 via-blue-800/20 to-transparent border-l-4 border-blue-400 rounded-lg shadow-lg relative overflow-hidden relative z-10">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-400/30">
                  <WarningOutlined className="text-blue-400 text-xl animate-pulse" />
                </div>
                <p className="text-sm text-gray-200 leading-relaxed m-0 flex-1 font-medium">
                  新增权限后，可对该RDC的所有环境进行版本管理，请谨慎操作！
                </p>
              </div>
            </div>

            {/* 搜索和新增 */}
            <div className="mb-6 relative z-10">
              <div className="flex items-stretch gap-3 mb-4">
                <div className="flex-1">
                  <Select
                    showSearch
                    placeholder="请输入用户名搜索"
                    value={null}
                    onSearch={(value) => {
                      setSearchKeyword(value)
                      if (value.trim()) {
                        debouncedFetchMiscUsers(value, (users: MiscUser[]) => {
                          setSearchResults(users)
                        })
                      } else {
                        setSearchResults([])
                      }
                    }}
                    onChange={(value) => {
                      if (value) {
                        const user = searchResults.find(u => u.account === value)
                        if (user) {
                          handleSelectUser(user)
                        }
                      }
                    }}
                    notFoundContent={searching ? <Spin size="small" /> : (searchKeyword ? '未找到用户' : null)}
                    className="w-full permission-select h-[42px]"
                    filterOption={false}
                    style={{ width: '100%', height: '42px' }}
                    allowClear
                    popupClassName="permission-select-dropdown"
                  >
                    {searchResults.map((user) => (
                      <Select.Option key={user.account} value={user.account}>
                        <div className="flex items-center gap-2 py-1">
                          <Avatar src={user.avatarUrl} size={24} />
                          <span className="text-gray-200">{user.name}</span>
                          <span className="text-gray-400 text-xs">({user.account})</span>
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                </div>
                <button
                  onClick={() => {
                    const input = document.querySelector('.ant-select-selection-search-input') as HTMLInputElement
                    if (input) {
                      input.focus()
                    }
                  }}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all duration-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 h-[42px] flex items-center whitespace-nowrap"
                >
                  新增权限
                </button>
              </div>
              
              <div className="text-sm text-gray-400 font-medium">
                当前权限: 个人 {selectedAdmins.length}
              </div>
            </div>

            {/* 当前权限列表 */}
            {selectedAdmins.length > 0 && (
              <div className="mb-6 relative z-10">
                {/* <div className="text-sm font-semibold text-gray-300 mb-4">
                  个人{selectedAdmins.length}
                </div> */}
                <div className="space-y-3">
                  {selectedAdmins.map((admin) => (
                    <div
                      key={admin.account}
                      className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-200 border border-gray-600 hover:border-gray-500"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar src={admin.avatarUrl} size={40} className="border-2 border-gray-600" />
                        <div>
                          <div className="text-sm font-semibold text-gray-200 mb-0.5">{admin.name}</div>
                          <div className="text-xs text-gray-400">{admin.account}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveAdmin(admin.account)}
                        className="text-gray-400 hover:text-red-400 transition-all duration-200 p-2 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-700"
                        aria-label={`删除 ${admin.name} 的权限`}
                      >
                        <DeleteOutlined className="text-lg" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedAdmins.length === 0 && (
              <div className="text-center py-12 text-gray-500 text-sm relative z-10">
                暂无权限设置
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-700 relative z-10">
              <button
                onClick={handleClosePermissionModal}
                className="px-6 py-2.5 text-sm font-medium bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                aria-label="取消"
              >
                取消
              </button>
              <button
                onClick={handleSavePermissions}
                disabled={saving}
                className="px-6 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transform hover:-translate-y-0.5 disabled:transform-none"
                aria-label="保存权限"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Component

