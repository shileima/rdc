import { getEnvFromUrl, getApiBaseUrl } from '../../../utils'
import { getSelectedVersion } from '../utils/versionUtils'
import { handleApiError } from '../utils/errorHandler'
import type { 
  ApiResponse, 
  ComponentVersions, 
  SaveComponentRequest,
  UserInfo,
  RdcInfo,
  MiscListResponse,
  MiscUser,
  RdcListResponse,
  Status,
  Environment
} from '../types'
import { STATUS, ENV_MAPPING, UI_CONSTANTS } from '../types'

/**
 * 获取 API URL，开发环境使用相对路径通过 Vite proxy
 */
const getApiUrl = (path: string): string => {
  if (import.meta.env.DEV) {
    return path
  }
  return `${getApiBaseUrl()}${path}`
}

/**
 * 规范化 RDC key，确保只有一个 rdc_info_ 前缀
 */
const normalizeRdcKey = (rdcName: string): string => {
  // 移除已有的 rdc_info_ 前缀（如果有）
  const nameWithoutPrefix = rdcName.startsWith('rdc_info_') 
    ? rdcName.substring('rdc_info_'.length)
    : rdcName
  // 添加 rdc_info_ 前缀
  return `rdc_info_${nameWithoutPrefix}`
}

/**
 * 从 localStorage 获取 misId
 */
const getMisIdFromLocalStorage = (): string => {
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

/**
 * 获取用户信息
 */
export const fetchUserInfo = async (): Promise<UserInfo | null> => {
  try {
    const apiUrl = getApiUrl('/nodeapi/userInfo')
    const response = await fetch(apiUrl)
    const userData: UserInfo = await response.json()
    return userData
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return null
  }
}

/**
 * 从 RdcInfo 或 versionInfo 中提取版本信息
 */
const extractVersionsFromVersionInfo = (versionInfo: RdcInfo | string | { admins?: string[] } | undefined): ComponentVersions => {
  // 如果是字符串（如 "请设置Lion key"），返回空版本
  if (typeof versionInfo === 'string') {
    return {
      development: '',
      test: '',
      staging: '',
      production: ''
    }
  }

  // 如果只有 admins 字段，返回空版本
  if (versionInfo && 'admins' in versionInfo && !('devVersions' in versionInfo)) {
    return {
      development: '',
      test: '',
      staging: '',
      production: ''
    }
  }

  // 如果是完整的 RdcInfo 对象
  if (versionInfo && typeof versionInfo === 'object' && 'devVersions' in versionInfo) {
    const rdcInfo = versionInfo as RdcInfo
    
    return {
      development: getSelectedVersion(rdcInfo.devVersions),
      test: getSelectedVersion(rdcInfo.testVersions),
      staging: getSelectedVersion(rdcInfo.stagingVersions),
      production: getSelectedVersion(rdcInfo.productionVersions)
    }
  }

  // 默认返回空版本
  return {
    development: '',
    test: '',
    staging: '',
    production: ''
  }
}

/**
 * 获取组件列表（包含 status）
 */
export const fetchComponents = async (): Promise<Record<string, { versions: ComponentVersions; status?: Status }>> => {
  try {
    const apiUrl = getApiUrl('/nodeapi/lion/getRdcList')
    const response = await fetch(apiUrl)
    const data: RdcListResponse = await response.json()
    
    if (data.success && data.value) {
      // 将 RdcListResponse 转换为包含 versions 和 status 的对象
      const result: Record<string, { versions: ComponentVersions; status?: Status }> = {}
      
      Object.entries(data.value).forEach(([componentName, item]) => {
        result[componentName] = {
          versions: extractVersionsFromVersionInfo(item.versionInfo),
          status: item.status
        }
      })
      
      return result
    }
    return {}
  } catch (error) {
    console.error('获取数据失败:', error)
    return {}
  }
}

/**
 * 保存组件版本
 */
export const saveComponentVersions = async (
  componentName: string,
  allComponents: Record<string, ComponentVersions>,
  updatedVersions: ComponentVersions
): Promise<{ success: boolean; message?: string; code?: number }> => {
  try {
    const updatedValue = {
      ...allComponents,
      [componentName]: updatedVersions
    }

    const requestData: SaveComponentRequest = {
      env: getEnvFromUrl(),
      appkey: 'com.sankuai.waimaiqafc.automan',
      key: 'rdc_component_list',
      value: updatedValue,
      rdcName: componentName,
      misId: getMisIdFromLocalStorage()
    }

    const apiUrl = getApiUrl('/nodeapi/setLionConfig')
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })
    
    const result = await response.json()
    return {
      success: result.success,
      message: result.message,
      code: result.code
    }
  } catch (error) {
    console.error('保存版本失败:', error)
    return {
      success: false,
      message: '保存版本失败，请重试'
    }
  }
}

/**
 * 删除组件
 */
export const deleteComponent = async (
  componentName: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _allComponents?: Record<string, ComponentVersions> // 保留参数以保持兼容性，但不再使用
): Promise<{ success: boolean; message?: string; code?: number }> => {
  try {
    const env = getEnvFromUrl() // 返回 'dev' | 'test' | 'staging' | 'prod'
    const deleteUrl = getApiUrl('/nodeapi/lion/deleteRdcInfoByKey')
    const requestData = {
      key: componentName,
      env: env,
      rdcName: componentName
    }

    const response = await fetch(deleteUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })
    
    const result = await response.json()
    return {
      success: result.success,
      message: result.message,
      code: result.code
    }
  } catch (error) {
    const errorInfo = handleApiError(error, '删除组件失败', 'deleteComponent')
    console.error('删除组件失败:', errorInfo.originalError)
    return {
      success: false,
      message: errorInfo.message
    }
  }
}

/**
 * 获取 RDC 权限信息
 */
export const fetchRdcInfo = async (rdcName: string): Promise<RdcInfo | null> => {
  try {
    const normalizedKey = normalizeRdcKey(rdcName)
    const apiUrl = getApiUrl(`/nodeapi/lion/getRdcInfoByKey?key=${normalizedKey}`)
    const response = await fetch(apiUrl)
    const data: ApiResponse<RdcInfo> = await response.json()
    
    if (data.success && data.value) {
      return data.value
    }
    return null
  } catch (error) {
    console.error('获取权限信息失败:', error)
    return null
  }
}

/**
 * 新增 RDC 组件
 */
export const addRdcInfo = async (
  rdcName: string,
  versions: ComponentVersions
): Promise<{ success: boolean; message?: string; code?: number }> => {
  try {
    const env = getEnvFromUrl() // 返回 'dev' | 'test' | 'staging' | 'prod'
    const addUrl = getApiUrl('/nodeapi/lion/addRdcInfo')
    
    // 构建版本数组，每个环境只有一个版本，type 为 "latest"，isValid 为 1
    const rdcInfo: Partial<RdcInfo> = {}
    
    // 使用循环处理所有环境，避免重复代码
    Object.entries(ENV_MAPPING).forEach(([env, versionKey]) => {
      const version = versions[env as Environment]
      if (version) {
        ;(rdcInfo[versionKey as keyof RdcInfo] as Array<{ type: string; version: string; isValid?: Status }>) = [{
          type: UI_CONSTANTS.VERSION_TYPE.LATEST,
          version: version,
          isValid: STATUS.ACTIVE
        }]
      }
    })
    
    const response = await fetch(addUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key: normalizeRdcKey(rdcName),
        env: env,
        rdcName: rdcName,
        ...rdcInfo
      })
    })
    
    const result = await response.json()
    return {
      success: result.success,
      message: result.message,
      code: result.code
    }
  } catch (error) {
    const errorInfo = handleApiError(error, '新增组件失败', 'addRdcInfo')
    console.error('新增组件失败:', errorInfo.originalError)
    return {
      success: false,
      message: errorInfo.message
    }
  }
}

/**
 * 保存 RDC 权限信息
 */
export const saveRdcInfo = async (
  rdcName: string,
  rdcInfo: RdcInfo
): Promise<{ success: boolean; message?: string; code?: number }> => {
  try {
    const env = getEnvFromUrl() // 返回 'dev' | 'test' | 'staging' | 'prod'
    const saveUrl = getApiUrl('/nodeapi/lion/setRdcInfoByKey')
    const saveResponse = await fetch(saveUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key: normalizeRdcKey(rdcName),
        value: rdcInfo,
        env: env
      })
    })
    
    const saveResult = await saveResponse.json()
    return {
      success: saveResult.success,
      message: saveResult.message,
      code: saveResult.code
    }
  } catch (error) {
    console.error('保存权限失败:', error)
    return {
      success: false,
      message: '保存权限失败，请重试'
    }
  }
}

/**
 * 更新 RDC 组件状态
 */
export const updateRdcStatus = async (
  componentName: string,
  status: Status
): Promise<{ success: boolean; message?: string; code?: number }> => {
  try {
    const updateUrl = getApiUrl('/nodeapi/lion/updateRdcStatus')
    const response = await fetch(updateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key: componentName,
        status: status
      })
    })
    
    const result = await response.json()
    return {
      success: result.success,
      message: result.message,
      code: result.code
    }
  } catch (error) {
    const errorInfo = handleApiError(error, '更新组件状态失败', 'updateRdcStatus')
    console.error('更新组件状态失败:', errorInfo.originalError)
    return {
      success: false,
      message: errorInfo.message
    }
  }
}

/**
 * 搜索 Misc 用户
 */
export const searchMiscUsers = async (search: string): Promise<MiscUser[]> => {
  if (!search.trim()) {
    return []
  }
  
  try {
    const searchUrl = `https://eci.sankuai.com/api/qa/v1/common/getMiscListDetail?name=${search}`
    const response = await fetch(searchUrl)
    const data: MiscListResponse = await response.json()
    
    if (data.code === 0 && data.data) {
      return data.data
    }
    return []
  } catch (error) {
    console.error('搜索用户失败:', error)
    return []
  }
}

/**
 * 根据账号获取用户信息
 */
export const fetchUserByAccount = async (account: string): Promise<MiscUser | null> => {
  try {
    const users = await searchMiscUsers(account)
    return users.length > 0 ? users[0] : null
  } catch (error) {
    console.error(`获取用户 ${account} 信息失败:`, error)
    return null
  }
}

