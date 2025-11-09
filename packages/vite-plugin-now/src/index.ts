/**
 * @xbot/vite-plugin-now
 * Vite plugin for dynamic RDC component federation
 */

export interface NowPluginOptions {
  /**
   * RDC 组件列表
   */
  components: string[]
  
  /**
   * 环境配置
   * @default 'test'
   */
  env?: 'dev' | 'test' | 'staging' | 'prod'
  
  /**
   * 自定义配置 API URL
   */
  configApiUrl?: string
  
  /**
   * 自定义 RDC 基础 URL
   */
  rdcBaseUrl?: string
}

/**
 * 环境配置映射
 */
const ENV_CONFIG: Record<string, { configApiUrl: string; rdcBaseUrl: string }> = {
  dev: {
    configApiUrl: 'https://automan.waimai.test.sankuai.com/nodeapi/lionConfig?key=rdc_component_version',
    rdcBaseUrl: 'https://aie.waimai.test.sankuai.com/rdc_host/rdc',
  },
  test: {
    configApiUrl: 'https://automan.waimai.test.sankuai.com/nodeapi/lionConfig?key=rdc_component_version',
    rdcBaseUrl: 'https://aie.waimai.test.sankuai.com/rdc_host/rdc',
  },
  staging: {
    configApiUrl: 'https://automan.waimai.staging.sankuai.com/nodeapi/lionConfig?key=rdc_component_version',
    rdcBaseUrl: 'https://aie.waimai.staging.sankuai.com/rdc_host/rdc',
  },
  prod: {
    configApiUrl: 'https://automan.waimai.sankuai.com/nodeapi/lionConfig?key=rdc_component_version',
    rdcBaseUrl: 'https://aie.waimai.sankuai.com/rdc_host/rdc',
  },
}

/**
 * Remote 配置类型
 */
export interface RemoteConfig {
  external: string
  externalType: string
  format: string
  from: string
}

/**
 * 生成 RDC 组件的 remote 配置
 */
function createRdcRemoteConfig(
  componentName: string,
  configApiUrl: string,
  rdcBaseUrl: string,
  env: string
): RemoteConfig {
  const remoteEntryPath = `qa-rdc-${componentName}/webpack/`
  
  return {
    external: `fetch('${configApiUrl}').then((res) => res.json()).then((res) => {
      const remoteEntry = '${rdcBaseUrl}/${remoteEntryPath}' + res.value?.${componentName}.${env} + '/remoteEntry.js';
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
 * Vite Plugin Now - 动态生成 Module Federation remotes 配置
 */
export default function nowPlugin(options: NowPluginOptions): Record<string, RemoteConfig> {
  if (!options.components || options.components.length === 0) {
    throw new Error('[vite-plugin-now] components 配置不能为空')
  }
  
  return generateRemotes(options)
}
