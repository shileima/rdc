// 通用状态类型（用于组件状态和版本有效性）
export type Status = 0 | 1

// 状态常量（统一用于组件状态和版本有效性）
export const STATUS = {
  INACTIVE: 0 as const,  // 失效/无效
  ACTIVE: 1 as const      // 生效/有效
} as const

// UI 常量
export const UI_CONSTANTS = {
  Z_INDEX: {
    DROPDOWN: 9999,
    MODAL: 50,
    MENU: 50
  },
  VERSION_TYPE: {
    LATEST: 'latest',
    STABLE: 'stable'
  }
} as const

// 环境映射配置
export const ENV_MAPPING = {
  development: 'devVersions',
  test: 'testVersions',
  staging: 'stagingVersions',
  production: 'productionVersions'
} as const

export type Environment = keyof typeof ENV_MAPPING

export interface ComponentVersions {
  development?: string
  test?: string
  staging?: string
  production?: string
}

export interface ComponentData {
  componentName: string
  versions: ComponentVersions
  status?: Status // 1 表示生效，0 表示失效
}

export interface ApiResponse<T = any> {
  success: boolean
  value: T
  message: string
  code?: number
}

export interface SaveComponentRequest {
  rdcName: string
  env: 'dev' | 'test' | 'staging' | 'prod'
  appkey: string
  key: string
  value: Record<string, ComponentVersions>
  misId: string
}

export interface UserInfo {
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
  roles?: {
    isSuperAdmin?: boolean
  }
}

export interface MiscUser {
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

export interface MiscListResponse {
  code: number
  msg: string
  data: MiscUser[]
}

export interface RdcInfo {
  key: string
  label: string
  devVersions?: Array<{ type: string; version: string; isValid?: Status }>
  testVersions?: Array<{ type: string; version: string; isValid?: Status }>
  stagingVersions?: Array<{ type: string; version: string; isValid?: Status }>
  productionVersions?: Array<{ type: string; version: string; isValid?: Status }>
  admins?: string[]
}

/**
 * RDC 列表项
 */
export interface RdcListItem {
  status: Status
  versionInfo: RdcInfo | string | { admins?: string[] }
}

/**
 * RDC 列表响应
 */
export interface RdcListResponse {
  success: boolean
  value: Record<string, RdcListItem>
  message: string
}

