import type { ComponentVersions } from '../types'

/**
 * 获取版本显示文本
 */
export const getVersionDisplay = (version: string | undefined): string => {
  return version && version.trim() ? version : '暂无'
}

/**
 * 创建空的版本对象
 */
export const createEmptyVersions = (): ComponentVersions => ({
  development: '',
  test: '',
  staging: '',
  production: ''
})

/**
 * 规范化版本对象（确保所有字段存在）
 */
export const normalizeVersions = (versions: ComponentVersions): ComponentVersions => ({
  development: versions.development || '',
  test: versions.test || '',
  staging: versions.staging || '',
  production: versions.production || ''
})

