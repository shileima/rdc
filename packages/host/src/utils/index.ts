/**
 * 根据当前 URL 判断环境
 * @returns 环境标识
 */
export const getEnvFromUrl = (): 'dev' | 'test' | 'staging' | 'prod' => {
  const hostname = window.location.hostname
  const port = window.location.port
  
  // 如果是本地环境（9090 端口运行），使用 dev 环境
  if (hostname.includes('localhost') || hostname === '127.0.0.1' || port === '9090') {
    return 'dev'
  } else if (hostname.includes('test.sankuai.com')) {
    return 'test'
  } else if (hostname.includes('staging')) {
    return 'staging'
  } else if (hostname.includes('prod')) {
    return 'prod'
  }
  
  // 默认返回 test
  return 'test'
}

/**
 * 获取 API 基础 URL
 * @returns API 基础 URL
 */
export const getApiBaseUrl = (): string => {
  // 如果是本地开发环境（9090 端口），使用 localhost:8080
  if (import.meta.env.DEV && (window.location.port === '9090' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:8080'
  }
  return 'https://automan.waimai.test.sankuai.com'
}

