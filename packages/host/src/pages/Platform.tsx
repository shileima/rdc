import React, { useState, useEffect } from 'react'

interface PlatformRdc {
  id?: string | number
  name?: string
  value?: string
  [key: string]: unknown
}

interface Platform {
  id: number
  name: string
  value: string
  rdcs: (string | PlatformRdc)[]
}

interface ApiResponse {
  success: boolean
  value: Platform[]
  message: string
}

interface RdcComponentResponse {
  success: boolean
  value: Record<string, unknown>
  message: string
}

const Platform: React.FC = () => {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [showAddModal, setShowAddModal] = useState<boolean>(false)
  const [currentPlatform, setCurrentPlatform] = useState<Platform | null>(null)
  const [rdcComponents, setRdcComponents] = useState<string[]>([])
  const [selectedRdc, setSelectedRdc] = useState<string>('')
  const [loadingRdcs, setLoadingRdcs] = useState<boolean>(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('https://automan.waimai.test.sankuai.com/nodeapi/lionConfig?key=rdc_platform_list')
        const data: ApiResponse = await response.json()
        
        if (data.success && data.value) {
          setPlatforms(data.value)
        }
      } catch (error) {
        console.error('获取数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAddComponent = async (platform: Platform) => {
    setCurrentPlatform(platform)
    setShowAddModal(true)
    setSelectedRdc('')
    
    // 获取 RDC 组件列表
    try {
      setLoadingRdcs(true)
      const response = await fetch('https://automan.waimai.test.sankuai.com/nodeapi/lionConfig?key=rdc_vomponent_version')
      const data: RdcComponentResponse = await response.json()
      
      if (data.success && data.value) {
        // 提取对象的所有 key 作为 RDC 组件名称列表
        const rdcList = Object.keys(data.value)
        setRdcComponents(rdcList)
      }
    } catch (error) {
      console.error('获取 RDC 组件列表失败:', error)
    } finally {
      setLoadingRdcs(false)
    }
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setCurrentPlatform(null)
    setSelectedRdc('')
    setRdcComponents([])
  }

  const handleSaveComponent = () => {
    if (!selectedRdc || !currentPlatform) return
    
    // 这里可以添加保存逻辑，比如调用接口将 RDC 添加到平台
    // 暂时只更新本地状态
    setPlatforms(prev => 
      prev.map(platform => 
        platform.id === currentPlatform.id
          ? { ...platform, rdcs: [...(platform.rdcs || []), selectedRdc] }
          : platform
      )
    )
    
    handleCloseModal()
  }

  return (
    <div className="min-h-screen w-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">平台列表</h1>
          <p className="text-gray-400">RDC 平台管理与监控</p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          {loading ? (
            <div className="px-6 py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-400">加载中...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      平台名称
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      平台值
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      RDC 数量
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      RDC 列表
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {platforms.map((platform) => (
                    <tr key={platform.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-200 font-medium">
                          {platform.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-200 font-medium">
                          {platform.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm bg-gray-700 text-gray-200 px-2 py-1 rounded">
                          {platform.value}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-900 text-blue-200 border border-blue-700">
                          {platform.rdcs?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {platform.rdcs && platform.rdcs.length > 0 ? (
                            platform.rdcs.map((rdc, index) => {
                              // 如果是字符串，直接显示
                              const rdcName = typeof rdc === 'string' 
                                ? rdc 
                                : (rdc.name || rdc.value || `RDC-${index}`)
                              
                              return (
                                <span
                                  key={typeof rdc === 'string' ? rdc : (rdc.id || index)}
                                  className="inline-flex px-2 py-1 text-xs font-medium rounded bg-gray-700 text-gray-300"
                                >
                                  {rdcName}
                                </span>
                              )
                            })
                          ) : (
                            <span className="text-sm text-gray-500">暂无</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleAddComponent(platform)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          增加组件
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 增加组件弹框 */}
      {showAddModal && currentPlatform && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-2">增加组件</h2>
              <p className="text-sm text-gray-400">平台：{currentPlatform.name}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  选择 RDC 组件
                </label>
                {loadingRdcs ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                    <span className="ml-2 text-sm text-gray-400">加载中...</span>
                  </div>
                ) : (
                  <select
                    value={selectedRdc}
                    onChange={(e) => setSelectedRdc(e.target.value)}
                    className="w-full text-sm bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">请选择 RDC 组件</option>
                    {rdcComponents.map((rdc) => (
                      <option key={rdc} value={rdc}>
                        {rdc}
                      </option>
                    ))}
                  </select>
                )}
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
                onClick={handleSaveComponent}
                disabled={!selectedRdc}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Platform

