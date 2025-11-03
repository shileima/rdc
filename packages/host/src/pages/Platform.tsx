import React, { useState, useEffect } from 'react'
import { pinyin } from 'pinyin-pro'
import { getEnvFromUrl, getApiBaseUrl } from '../utils'

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

interface SavePlatformRequest {
  env: 'dev' | 'test' | 'staging' | 'prod'
  appkey: string
  key: string
  value: Platform[]
}

const Platform: React.FC = () => {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [showAddModal, setShowAddModal] = useState<boolean>(false)
  const [showAddPlatformModal, setShowAddPlatformModal] = useState<boolean>(false)
  const [currentPlatform, setCurrentPlatform] = useState<Platform | null>(null)
  const [rdcComponents, setRdcComponents] = useState<string[]>([])
  const [selectedRdcs, setSelectedRdcs] = useState<string[]>([])
  const [loadingRdcs, setLoadingRdcs] = useState<boolean>(false)
  const [newPlatformName, setNewPlatformName] = useState<string>('')
  const [newPlatformValue, setNewPlatformValue] = useState<string>('')
  const [valueError, setValueError] = useState<string>('')
  const [saving, setSaving] = useState<boolean>(false)
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [platformToDelete, setPlatformToDelete] = useState<Platform | null>(null)
  const [deleting, setDeleting] = useState<boolean>(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const apiUrl = `${getApiBaseUrl()}/nodeapi/lionConfig?key=rdc_platform_list`
        const response = await fetch(apiUrl)
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
    // 初始化已选中的组件（平台已有的 rdcs）
    const existingRdcs = platform.rdcs.filter(rdc => typeof rdc === 'string') as string[]
    setSelectedRdcs(existingRdcs)
    
    // 获取 RDC 组件列表
    try {
      setLoadingRdcs(true)
      const apiUrl = `${getApiBaseUrl()}/nodeapi/lionConfig?key=rdc_component_version`
      const response = await fetch(apiUrl)
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
    setSelectedRdcs([])
    setRdcComponents([])
  }

  const handleToggleRdc = (rdc: string) => {
    setSelectedRdcs(prev => {
      if (prev.includes(rdc)) {
        return prev.filter(item => item !== rdc)
      } else {
        return [...prev, rdc]
      }
    })
  }

  const handleSaveComponent = async () => {
    if (!currentPlatform) return
    
    try {
      setSaving(true)
      
      // 更新平台的 rdcs 数组
      const updatedPlatforms = platforms.map(platform => 
        platform.id === currentPlatform.id
          ? { ...platform, rdcs: selectedRdcs }
          : platform
      )

      // 构建请求数据
      const requestData: SavePlatformRequest = {
        env: getEnvFromUrl(),
        appkey: 'com.sankuai.waimaiqafc.automan',
        key: 'rdc_platform_list',
        value: updatedPlatforms
      }

      // 调用 API 保存
      const apiUrl = `${getApiBaseUrl()}/nodeapi/lionConfig`
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        // 更新本地状态
        setPlatforms(updatedPlatforms)
        handleCloseModal()
      } else {
        console.error('保存组件失败')
        alert('保存组件失败，请重试')
      }
    } catch (error) {
      console.error('保存组件失败:', error)
      alert('保存组件失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  // 检测是否为中文字符
  const isChinese = (text: string): boolean => {
    return /[\u4e00-\u9fa5]/.test(text)
  }

  // 将中文转换为拼音，用下划线连接
  const chineseToPinyin = (text: string): string => {
    // 使用 pinyin-pro 库将中文转换为拼音
    // 分离中文字符和其他字符
    const chars = text.split('')
    const result: string[] = []
    
    for (const char of chars) {
      if (/[\u4e00-\u9fa5]/.test(char)) {
        // 中文字符转换为拼音
        const py = pinyin(char, {
          toneType: 'none', // 不带声调
          pattern: 'pinyin', // 全拼
        })
        if (py) {
          result.push(py.toLowerCase())
        }
      } else if (/[a-zA-Z0-9]/.test(char)) {
        // 英文字母和数字保留
        result.push(char.toLowerCase())
      } else if (/[\s\-_]+/.test(char)) {
        // 空格、连字符等转换为下划线（如果前一个不是下划线）
        if (result.length > 0 && result[result.length - 1] !== '_') {
          result.push('_')
        }
      }
    }
    
    // 用下划线连接，并清理多余的下划线
    return result
      .filter(item => item.length > 0)
      .join('_')
      .replace(/_+/g, '_') // 多个连续下划线替换为单个
      .replace(/^_+|_+$/g, '') // 移除首尾下划线
  }

  // 根据平台名称生成平台值
  const generatePlatformValue = (name: string): string => {
    if (!name.trim()) {
      return ''
    }

    let result = ''
    
    // 如果包含中文，转换为拼音
    if (isChinese(name)) {
      result = chineseToPinyin(name)
    } else {
      // 如果是英文，转小写，空格和特殊字符替换为下划线
      result = name
        .toLowerCase()
        .replace(/[^a-z0-9_]+/g, '_') // 非小写字母、数字、下划线的字符替换为下划线
        .replace(/^_+|_+$/g, '') // 移除首尾下划线
        .replace(/_+/g, '_') // 多个连续下划线替换为单个
    }

    // 确保结果以小写英文字母开头
    if (result && !/^[a-z]/.test(result)) {
      // 如果开头不是小写字母，移除开头的数字和下划线
      result = result.replace(/^[0-9_]+/, '')
      // 如果还是没有字母，添加默认前缀
      if (!result || !/^[a-z]/.test(result)) {
        result = 'platform_' + result.replace(/^_+/, '')
      }
    }

    return result
  }

  const handleOpenAddPlatform = () => {
    setShowAddPlatformModal(true)
    setNewPlatformName('')
    setNewPlatformValue('')
    setValueError('')
  }

  const handlePlatformNameChange = (value: string) => {
    setNewPlatformName(value)
    // 自动生成平台值
    if (value.trim()) {
      const generatedValue = generatePlatformValue(value)
      if (generatedValue) {
        setNewPlatformValue(generatedValue)
        // 验证生成的平台值
        if (!validatePlatformValue(generatedValue)) {
          setValueError('平台值只能以小写英文开头，仅支持小写英文、下划线和数字')
        } else {
          setValueError('')
        }
      }
    } else {
      setNewPlatformValue('')
      setValueError('')
    }
  }

  const handleCloseAddPlatformModal = () => {
    setShowAddPlatformModal(false)
    setNewPlatformName('')
    setNewPlatformValue('')
    setValueError('')
  }

  const validatePlatformValue = (value: string): boolean => {
    // 只能以小写英文开头，仅支持小写英文、下划线和数字
    const pattern = /^[a-z][a-z0-9_]*$/
    return pattern.test(value)
  }

  const handlePlatformValueChange = (value: string) => {
    setNewPlatformValue(value)
    if (value && !validatePlatformValue(value)) {
      setValueError('平台值只能以小写英文开头，仅支持小写英文、下划线和数字')
    } else {
      setValueError('')
    }
  }

  const handleDeletePlatform = (platform: Platform) => {
    setPlatformToDelete(platform)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!platformToDelete) return

    try {
      setDeleting(true)
      
      // 从列表中移除该平台
      const updatedPlatforms = platforms.filter(
        platform => platform.id !== platformToDelete.id
      )

      // 构建请求数据
      const requestData: SavePlatformRequest = {
        env: getEnvFromUrl(),
        appkey: 'com.sankuai.waimaiqafc.automan',
        key: 'rdc_platform_list',
        value: updatedPlatforms
      }

      // 调用 API 保存
      const apiUrl = `${getApiBaseUrl()}/nodeapi/lionConfig`
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        // 更新本地状态
        setPlatforms(updatedPlatforms)
        setShowDeleteModal(false)
        setPlatformToDelete(null)
      } else {
        console.error('删除平台失败')
        alert('删除平台失败，请重试')
      }
    } catch (error) {
      console.error('删除平台失败:', error)
      alert('删除平台失败，请重试')
    } finally {
      setDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteModal(false)
    setPlatformToDelete(null)
  }

  const handleSavePlatform = async () => {
    if (!newPlatformName.trim() || !newPlatformValue.trim() || valueError) {
      return
    }

    try {
      setSaving(true)
      
      // 计算新的 ID
      const newId = platforms.length + 1
      
      // 创建新平台对象
      const newPlatform: Platform = {
        id: newId,
        name: newPlatformName.trim(),
        value: newPlatformValue.trim(),
        rdcs: []
      }

      // 构建请求数据
      const updatedPlatforms = [...platforms, newPlatform]
      
      const requestData: SavePlatformRequest = {
        env: getEnvFromUrl(),
        appkey: 'com.sankuai.waimaiqafc.automan',
        key: 'rdc_platform_list',
        value: updatedPlatforms
      }

      // 调用 API 保存
      const apiUrl = `${getApiBaseUrl()}/nodeapi/lionConfig`
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        // 更新本地状态
        setPlatforms(updatedPlatforms)
        handleCloseAddPlatformModal()
      } else {
        console.error('保存平台失败')
        alert('保存平台失败，请重试')
      }
    } catch (error) {
      console.error('保存平台失败:', error)
      alert('保存平台失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen w-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">平台列表</h1>
            <p className="text-gray-400">RDC 平台管理与监控</p>
          </div>
          <button
            onClick={handleOpenAddPlatform}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            新增平台
          </button>
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
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleAddComponent(platform)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            增加组件
                          </button>
                          <button
                            onClick={() => handleDeletePlatform(platform)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            删除
                          </button>
                        </div>
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
                <label className="block text-xs font-medium text-gray-300 mb-2">
                  选择 RDC 组件（支持多选）
                </label>
                {loadingRdcs ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                    <span className="ml-2 text-sm text-gray-400">加载中...</span>
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto bg-gray-700 border border-gray-600 rounded p-2 space-y-2">
                    {rdcComponents.length > 0 ? (
                      rdcComponents.map((rdc) => (
                        <label
                          key={rdc}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-600 rounded px-2 py-1"
                        >
                          <input
                            type="checkbox"
                            checked={selectedRdcs.includes(rdc)}
                            onChange={() => handleToggleRdc(rdc)}
                            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-200">{rdc}</span>
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-2">暂无可用组件</p>
                    )}
                  </div>
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
                disabled={saving}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新增平台弹框 */}
      {showAddPlatformModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCloseAddPlatformModal}
        >
          <div
            className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-2">新增平台</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  ID
                </label>
                <input
                  type="text"
                  value={platforms.length + 1}
                  disabled
                  className="w-full text-sm bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 opacity-50 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  平台名称
                </label>
                <input
                  type="text"
                  value={newPlatformName}
                  onChange={(e) => handlePlatformNameChange(e.target.value)}
                  className="w-full text-sm bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入平台名称"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  平台值
                </label>
                <input
                  type="text"
                  value={newPlatformValue}
                  onChange={(e) => handlePlatformValueChange(e.target.value)}
                  className={`w-full text-sm bg-gray-700 border rounded px-2 py-1 focus:outline-none focus:ring-2 ${
                    valueError 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-600 focus:ring-blue-500'
                  } text-white`}
                  placeholder="只能以小写英文开头，仅支持小写英文、下划线和数字"
                />
                {valueError && (
                  <p className="text-xs text-red-400 mt-1">{valueError}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCloseAddPlatformModal}
                className="px-4 py-2 text-sm bg-gray-600 text-gray-200 rounded hover:bg-gray-500 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSavePlatform}
                disabled={!newPlatformName.trim() || !newPlatformValue.trim() || !!valueError || saving}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认弹框 */}
      {showDeleteModal && platformToDelete && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCancelDelete}
        >
          <div
            className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-2">确认删除</h2>
              <p className="text-sm text-gray-400">
                确定要删除平台 <span className="font-semibold text-white">{platformToDelete.name}</span> 吗？
              </p>
              <p className="text-xs text-red-400 mt-2">此操作不可恢复</p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm bg-gray-600 text-gray-200 rounded hover:bg-gray-500 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-500 transition-colors disabled:bg-red-700 disabled:cursor-not-allowed"
              >
                {deleting ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Platform

