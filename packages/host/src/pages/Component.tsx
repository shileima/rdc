import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LeftCircleOutlined } from '@ant-design/icons'
import { getEnvFromUrl, getApiBaseUrl } from '../utils'
import { message } from 'antd'

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

  useEffect(() => {
    // 配置 message 暗黑主题样式
    message.config({
      top: 24,
      duration: 3,
      maxCount: 3,
    })

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

    fetchData()
  }, [])

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

  return (
    <div className="min-h-screen w-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate('/rdc/home')}
              className="text-blue-500 hover:text-blue-400 transition-colors bg-transparent border-none p-0"
              aria-label="返回"
            >
              <LeftCircleOutlined className="text-3xl" />
            </button>
            <h1 className="text-3xl font-bold text-blue-400">组件管理平台</h1>
          </div>
          <p className="text-gray-400">组件版本管理与上下架状态监控</p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          {loading ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-400">加载中...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        组件名称
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        版本
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {components.map((component) => (
                      <tr key={component.componentName} className="hover:bg-gray-750 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-200 font-medium">
                            {component.componentName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-400 w-20">development:</span>
                              <code className="text-xs bg-gray-700 text-gray-200 px-1.5 py-0.5 rounded">
                                {getVersionDisplay(component.versions.development)}
                              </code>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-400 w-20">test:</span>
                              <code className="text-xs bg-gray-700 text-gray-200 px-1.5 py-0.5 rounded">
                                {getVersionDisplay(component.versions.test)}
                              </code>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-400 w-20">staging:</span>
                              <code className="text-xs bg-gray-700 text-gray-200 px-1.5 py-0.5 rounded">
                                {getVersionDisplay(component.versions.staging)}
                              </code>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-400 w-20">production:</span>
                              <code className="text-xs bg-gray-700 text-gray-200 px-1.5 py-0.5 rounded">
                                {getVersionDisplay(component.versions.production)}
                              </code>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(component)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            编辑
                          </button>
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

      {/* 编辑弹框 */}
      {editModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-2">编辑版本</h2>
              <p className="text-sm text-gray-400">{editModal.componentName}</p>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Development 环境版本
                </label>
                <input
                  type="text"
                  value={editVersions.development}
                  onChange={(e) => setEditVersions({ ...editVersions, development: e.target.value })}
                  className="w-full text-sm bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入版本号"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Test 环境版本
                </label>
                <input
                  type="text"
                  value={editVersions.test}
                  onChange={(e) => setEditVersions({ ...editVersions, test: e.target.value })}
                  className="w-full text-sm bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入版本号"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Staging 环境版本
                </label>
                <input
                  type="text"
                  value={editVersions.staging}
                  onChange={(e) => setEditVersions({ ...editVersions, staging: e.target.value })}
                  className="w-full text-sm bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入版本号"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Production 环境版本
                </label>
                <input
                  type="text"
                  value={editVersions.production}
                  onChange={(e) => setEditVersions({ ...editVersions, production: e.target.value })}
                  className="w-full text-sm bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入版本号"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm bg-gray-600 text-gray-200 rounded hover:bg-gray-500 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveVersions}
                disabled={saving}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors disabled:bg-blue-700 disabled:cursor-not-allowed"
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

