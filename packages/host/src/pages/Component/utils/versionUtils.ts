import type { ComponentVersions, RdcInfo, Status } from '../types'

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

/**
 * 从版本数组中获取选中的版本（优先 isValid: 1，如果没有则 stable，再没有则 latest）
 */
export const getSelectedVersion = (versions?: Array<{ type: string; version: string; isValid?: Status }>): string => {
  if (!versions || versions.length === 0) {
    return ''
  }
  
  // 优先查找 isValid 为 1 的版本
  const validVersion = versions.find(v => v.isValid === 1) // 使用数字 1 因为 Status 类型就是 0 | 1
  if (validVersion) {
    return validVersion.version || ''
  }
  
  // 如果没有 isValid: 1，查找 type 为 'stable' 的版本
  const stableVersion = versions.find(v => v.type === 'stable')
  if (stableVersion) {
    return stableVersion.version || ''
  }
  
  // 如果没有 stable，查找 type 为 'latest' 的版本
  const latestVersion = versions.find(v => v.type === 'latest')
  if (latestVersion) {
    return latestVersion.version || ''
  }
  
  // 如果都没有，取第一个
  return versions[0]?.version || ''
}

/**
 * 从 RdcInfo 中提取版本信息，转换为 ComponentVersions
 * 优先显示 isValid: 1 的版本，如果没有则显示 stable 版本，再没有则显示 latest 版本
 */
export const extractVersionsFromRdcInfo = (rdcInfo: RdcInfo | null): ComponentVersions => {
  if (!rdcInfo) {
    return createEmptyVersions()
  }

  return {
    development: getSelectedVersion(rdcInfo.devVersions),
    test: getSelectedVersion(rdcInfo.testVersions),
    staging: getSelectedVersion(rdcInfo.stagingVersions),
    production: getSelectedVersion(rdcInfo.productionVersions)
  }
}

