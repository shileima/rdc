/**
 * @xbot/vite-plugin-now
 * Vite plugin for dynamic RDC component federation
 */

import type { EnvType, NowPluginOptions, RemoteConfig } from './types'

// 导出类型
export type { NowPluginEnv, NowPluginOptions, RemoteConfig } from './types'

/**
 * Shared 配置类型
 */
export type SharedConfig = Record<string, {
  singleton?: boolean
  requiredVersion?: string
  eager?: boolean
  [key: string]: unknown
}>

/**
 * 环境配置映射
 */
const ENV_CONFIG: Record<string, { configApiUrl: string; rdcBaseUrl: string }> = {
  development: {
    configApiUrl: 'https://automan.sankuai.com/nodeapi/lionConfig?key=rdc_component_version',
    rdcBaseUrl: 'https://aie.waimai.test.sankuai.com/rdc_host/rdc',
  },
  test: {
    configApiUrl: 'https://automan.sankuai.com/nodeapi/lionConfig?key=rdc_component_version',
    rdcBaseUrl: 'https://aie.waimai.test.sankuai.com/rdc_host/rdc',
  },
  staging: {
    configApiUrl: 'https://automan.sankuai.com/nodeapi/lionConfig?key=rdc_component_version',
    rdcBaseUrl: 'https://aie.waimai.test.sankuai.com/rdc_host/rdc',
  },
  production: {
    configApiUrl: 'https://automan.sankuai.com/nodeapi/lionConfig?key=rdc_component_version',
    rdcBaseUrl: 'https://aie.waimai.test.sankuai.com/rdc_host/rdc',
  },
}

/**
 * 生成 RDC 组件的 remote 配置
 */
function createRdcRemoteConfig(
  componentName: string,
  configApiUrl: string,
  rdcBaseUrl: string,
  env: EnvType
): RemoteConfig {
  const remoteEntryPath = `qa-rdc-${componentName}/webpack/`
  
  return {
    external: `fetch('${configApiUrl}').then((res) => res.json()).then((res) => {
      const remoteEntry = '${rdcBaseUrl}/${remoteEntryPath}' + res.value?.${componentName}.${env || 'test'} + '/remoteEntry.js';
      return remoteEntry;
    })`,
    externalType: 'promise',
    format: 'var',
    from: 'webpack',
  }
}

/**
 * 生成 remotes 配置
 */
export function generateRemotes(options: NowPluginOptions): Record<string, RemoteConfig> {
  const env = options.env || 'test'
  const envConfig = ENV_CONFIG[env]
  
  const configApiUrl = options.configApiUrl || envConfig.configApiUrl
  const rdcBaseUrl = options.rdcBaseUrl || envConfig.rdcBaseUrl
  
  return options.components.reduce((acc, componentName) => {
    acc[componentName] = createRdcRemoteConfig(componentName, configApiUrl, rdcBaseUrl, env)
    return acc
  }, {} as Record<string, RemoteConfig>)
}

/**
 * 默认的 shared 配置
 */
export const DEFAULT_SHARED: SharedConfig = {
  react: {
    singleton: true,
    requiredVersion: '^18.3.1',
    eager: false,
  },
  'react-dom': {
    singleton: true,
    requiredVersion: '^18.3.1',
    eager: false,
  },
}

/**
 * 获取 shared 配置，支持覆盖默认配置
 * @param customShared 自定义 shared 配置，会与默认配置合并
 * @returns 合并后的 shared 配置
 */
export function getSharedConfig(customShared?: SharedConfig): SharedConfig {
  if (!customShared) {
    return DEFAULT_SHARED
  }
  
  // 深度合并配置
  const merged = { ...DEFAULT_SHARED }
  
  for (const key in customShared) {
    if (merged[key]) {
      // 如果已存在，合并配置
      merged[key] = { ...merged[key], ...customShared[key] }
    } else {
      // 如果不存在，直接添加
      merged[key] = customShared[key]
    }
  }
  
  return merged
}

/**
 * Vite Plugin Now - 动态生成 Module Federation remotes 配置
 */
export default function nowPlugin(options: NowPluginOptions): Record<string, RemoteConfig> {
  if (!options.components || options.components.length === 0) {
    throw new Error('[vite-plugin-now] components 配置不能为空')
  }
  
  return generateRemotes(options)
}
