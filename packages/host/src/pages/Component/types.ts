export interface ComponentVersions {
  development?: string
  test?: string
  staging?: string
  production?: string
}

export interface ComponentData {
  componentName: string
  versions: ComponentVersions
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
  devVersions?: Array<{ type: string; version: string }>
  testVersions?: Array<{ type: string; version: string }>
  stagingVersions?: Array<{ type: string; version: string }>
  productionVersions?: Array<{ type: string; version: string }>
  admins?: string[]
}

