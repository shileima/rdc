import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LeftCircleOutlined } from '@ant-design/icons'
import { getEnvFromUrl, getApiBaseUrl } from '../utils'
import { message, Modal } from 'antd'

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
    <div className="min-h-screen w-screen bg-gray-900 text-white p-8 md:p-12">
      <div className="max-w-7xl mx-auto">
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
                <h1 className="text-4xl font-bold text-blue-400 mb-2 tracking-tight">
                  组件管理平台
                </h1>
                <p className="text-base text-gray-400 font-normal">
                  组件版本管理与上下架状态监控
                </p>
              </div>
            </div>
            {userInfo?.login === 'mashilei' && (
              <button
                onClick={handleAddComponent}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all duration-200 text-sm font-medium border border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="新增组件"
                tabIndex={0}
              >
                新增组件
              </button>
            )}
          </div>
        </div>

        {/* 表格卡片 - 现代极简风格 */}
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden transition-shadow duration-300 hover:shadow-xl">
          {loading ? (
            <div className="px-8 py-16 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-gray-400 mt-4 text-sm">加载中...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700 border-b border-gray-600">
                    <tr>
                      <th className="px-8 py-5 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        组件名称
                      </th>
                      <th className="px-8 py-5 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        版本
                      </th>
                      <th className="px-8 py-5 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {components.map((component, index) => (
                      <tr
                        key={component.componentName}
                        className="transition-all duration-200 hover:bg-gray-750 hover:shadow-sm"
                        style={{
                          animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`
                        }}
                      >
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-200">
                            {component.componentName}
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex justify-center">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                              <div className="flex items-center justify-end space-x-3">
                                <span className="text-xs text-gray-400 font-medium">development:</span>
                                <code className="text-xs bg-gray-700 text-gray-200 px-2.5 py-1 rounded-lg font-mono border border-gray-600 min-w-[60px] text-center">
                                  {getVersionDisplay(component.versions.development)}
                                </code>
                              </div>
                              <div className="flex items-center justify-end space-x-3">
                                <span className="text-xs text-gray-400 font-medium">test:</span>
                                <code className="text-xs bg-gray-700 text-gray-200 px-2.5 py-1 rounded-lg font-mono border border-gray-600 min-w-[60px] text-center">
                                  {getVersionDisplay(component.versions.test)}
                                </code>
                              </div>
                              <div className="flex items-center justify-end space-x-3">
                                <span className="text-xs text-gray-400 font-medium">staging:</span>
                                <code className="text-xs bg-gray-700 text-gray-200 px-2.5 py-1 rounded-lg font-mono border border-gray-600 min-w-[60px] text-center">
                                  {getVersionDisplay(component.versions.staging)}
                                </code>
                              </div>
                              <div className="flex items-center justify-end space-x-3">
                                <span className="text-xs text-gray-400 font-medium">production:</span>
                                <code className="text-xs bg-gray-700 text-gray-200 px-2.5 py-1 rounded-lg font-mono border border-gray-600 min-w-[60px] text-center">
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
                              <button
                                onClick={() => handleDelete(component.componentName)}
                                disabled={deleting === component.componentName}
                                className="text-red-500 hover:text-red-400 transition-all duration-200 font-medium hover:underline disabled:text-gray-600 disabled:cursor-not-allowed disabled:hover:no-underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded px-2 py-1"
                                aria-label={`删除组件 ${component.componentName}`}
                                tabIndex={0}
                              >
                                {deleting === component.componentName ? '删除中...' : '删除'}
                              </button>
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
      `}</style>

      {/* 新增组件弹框 */}
      {addModalVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-modal-title"
        >
          <div
            className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 scale-100 border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-8">
              <h2 id="add-modal-title" className="text-2xl font-bold text-white mb-2">
                新增组件
              </h2>
              <p className="text-sm text-gray-400">请输入组件名称和版本信息</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <label htmlFor="new-component-name" className="block text-sm font-semibold text-gray-300 mb-2">
                  组件名称 <span className="text-red-500">*</span>
                </label>
                <input
                  id="new-component-name"
                  type="text"
                  value={newComponentName}
                  onChange={(e) => setNewComponentName(e.target.value)}
                  className="w-full text-sm bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
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
                    className="w-full text-sm bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
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
                    className="w-full text-sm bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
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
                    className="w-full text-sm bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
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
                    className="w-full text-sm bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                    placeholder="请输入版本号"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={handleCloseAddModal}
                className="px-6 py-2.5 text-sm font-medium bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                aria-label="取消新增组件"
              >
                取消
              </button>
              <button
                onClick={handleSaveNewComponent}
                disabled={saving}
                className="px-6 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transform hover:-translate-y-0.5 disabled:transform-none"
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
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-modal-title"
        >
          <div
            className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 scale-100 border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-8">
              <h2 id="edit-modal-title" className="text-2xl font-bold text-white mb-2">
                编辑版本
              </h2>
              <p className="text-sm text-gray-400">{editModal.componentName}</p>
            </div>
            
            <div className="space-y-5">
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
                    className="w-full text-sm bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
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
                    className="w-full text-sm bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
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
                    className="w-full text-sm bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
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
                    className="w-full text-sm bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                    placeholder="请输入版本号"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2.5 text-sm font-medium bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                aria-label="取消编辑"
              >
                取消
              </button>
              <button
                onClick={handleSaveVersions}
                disabled={saving}
                className="px-6 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transform hover:-translate-y-0.5 disabled:transform-none"
                aria-label="保存版本"
              >
                {saving ? '保存中...' : '保存版本'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Component

