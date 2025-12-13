import { getEnvFromUrl, getApiBaseUrl } from '../../../utils'
import type { 
  ApiResponse, 
  ComponentVersions, 
  SaveComponentRequest,
  UserInfo,
  RdcInfo,
  MiscListResponse,
  MiscUser
} from '../types'

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
 * 获取组件列表
 */
export const fetchComponents = async (): Promise<Record<string, ComponentVersions>> => {
  try {
    const apiUrl = getApiUrl('/nodeapi/lionConfig?key=rdc_component_version')
    const response = await fetch(apiUrl)
    const data: ApiResponse<Record<string, ComponentVersions>> = await response.json()
    
    if (data.success && data.value) {
      return data.value
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
      key: 'rdc_component_version',
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
  allComponents: Record<string, ComponentVersions>
): Promise<{ success: boolean; message?: string; code?: number }> => {
  try {
    const updatedValue: Record<string, ComponentVersions> = {}
    Object.keys(allComponents).forEach(key => {
      if (key !== componentName) {
        updatedValue[key] = allComponents[key]
      }
    })

    const requestData: SaveComponentRequest = {
      env: getEnvFromUrl(),
      appkey: 'com.sankuai.waimaiqafc.automan',
      key: 'rdc_component_version',
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
    console.error('删除组件失败:', error)
    return {
      success: false,
      message: '删除组件失败，请重试'
    }
  }
}

/**
 * 获取 RDC 权限信息
 */
export const fetchRdcInfo = async (rdcName: string): Promise<RdcInfo | null> => {
  try {
    const apiUrl = getApiUrl(`/nodeapi/lionConfig?key=rdc_info_${rdcName}`)
    const response = await fetch(apiUrl)
    const data: ApiResponse = await response.json()
    
    if (data.success && data.value && 
        typeof data.value === 'object' && 
        !Array.isArray(data.value) &&
        !(data.value instanceof String)) {
      return data.value as unknown as RdcInfo
    }
    return null
  } catch (error) {
    console.error('获取权限信息失败:', error)
    return null
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
    const saveUrl = getApiUrl('/nodeapi/setLionConfig')
    const saveResponse = await fetch(saveUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        env: getEnvFromUrl(),
        appkey: 'com.sankuai.waimaiqafc.automan',
        key: `rdc_info_${rdcName}`,
        value: rdcInfo,
        rdcName,
        misId: getMisIdFromLocalStorage()
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

