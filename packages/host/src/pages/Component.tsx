import React, { useState, useEffect } from 'react'

interface ComponentVersions {
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

const Component: React.FC = () => {
  const [components, setComponents] = useState<ComponentData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [editModal, setEditModal] = useState<EditModalData | null>(null)
  const [editVersions, setEditVersions] = useState<ComponentVersions>({
    test: '',
    staging: '',
    production: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('https://automan.waimai.test.sankuai.com/nodeapi/lionConfig?key=test')
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

  const handleEdit = (component: ComponentData) => {
    setEditModal({ componentName: component.componentName, versions: component.versions })
    setEditVersions({ ...component.versions })
  }

  const handleSaveVersions = () => {
    if (!editModal) return
    
    // 更新本地状态
    setComponents(prev => 
      prev.map(comp => 
        comp.componentName === editModal.componentName
          ? { ...comp, versions: editVersions }
          : comp
      )
    )
    
    // 这里可以添加保存到后端的逻辑
    // await saveVersionsToBackend(editModal.componentName, editVersions)
    
    setEditModal(null)
  }

  const handleCloseModal = () => {
    setEditModal(null)
    setEditVersions({ test: '', staging: '', production: '' })
  }

  const getVersionDisplay = (version: string | undefined): string => {
    return version && version.trim() ? version : '暂无'
  }

  return (
    <div className="min-h-screen w-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">组件管理平台</h1>
          <p className="text-gray-400">组件版本管理与上下架状态监控-v1.0.0</p>
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
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
              >
                保存版本
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Component

