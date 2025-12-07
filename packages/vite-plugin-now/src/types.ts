/**
 * 环境类型
 */
export type EnvType = 'development' | 'test' | 'staging' | 'production'

/**
 * 环境类型（别名，用于导出）
 */
export type NowPluginEnv = EnvType

/**
 * Remote 配置类型
 */
export type RemoteConfig = {
  external: string
  externalType: string
  format: string
  from: string
}

/**
 * 插件配置选项
 */
export interface NowPluginOptions {
  /**
   * RDC 组件名称列表
   */
  components: string[]
  /**
   * 环境类型
   * @default 'test'
   */
  env?: EnvType
  /**
   * 自定义配置 API URL（可选）
   */
  configApiUrl?: string
  /**
   * 自定义 RDC 基础 URL（可选）
   */
  rdcBaseUrl?: string
}

