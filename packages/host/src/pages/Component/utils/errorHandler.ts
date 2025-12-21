/**
 * 错误处理工具函数
 */

export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  BUSINESS = 'BUSINESS',
  UNKNOWN = 'UNKNOWN'
}

export interface ErrorInfo {
  type: ErrorType
  message: string
  originalError?: unknown
}

/**
 * 处理 API 错误
 */
export const handleApiError = (
  error: unknown,
  defaultMessage: string,
  context?: string
): ErrorInfo => {
  // 网络错误
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: ErrorType.NETWORK,
      message: `网络请求失败，请检查网络连接${context ? ` (${context})` : ''}`,
      originalError: error
    }
  }

  // 业务错误（有错误消息）
  if (error instanceof Error) {
    return {
      type: ErrorType.BUSINESS,
      message: error.message || defaultMessage,
      originalError: error
    }
  }

  // 验证错误（通常是字符串）
  if (typeof error === 'string') {
    return {
      type: ErrorType.VALIDATION,
      message: error,
      originalError: error
    }
  }

  // 未知错误
  return {
    type: ErrorType.UNKNOWN,
    message: defaultMessage,
    originalError: error
  }
}

/**
 * 从 API 响应中提取错误信息
 */
export const extractApiError = (
  response: { success: boolean; message?: string; code?: number },
  defaultMessage: string
): string => {
  if (!response.success) {
    if (response.message) {
      return response.message
    }
    if (response.code) {
      return `${defaultMessage} (错误代码: ${response.code})`
    }
  }
  return defaultMessage
}

