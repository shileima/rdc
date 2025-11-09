import type { EnvType } from './types'

/**
 * 环境配置映射
 */
const ENV_CONFIG: Record<EnvType, { configApiUrl: string; rdcBaseUrl: string }> = {
  dev: {
    configApiUrl: 'https://automan.waimai.dev.sankuai.com/nodeapi/lionConfig?key=rdc_component_version',
    rdcBaseUrl: 'https://aie.waimai.dev.sankuai.com/rdc_host/rdc',
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
 * 获取环境配置
 */
export const getEnvConfig = (env: EnvType) => {
  return ENV_CONFIG[env]
}

