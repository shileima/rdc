export type RdcType = 'rdc1' | 'rdc2' | 'rdc3' | 'rdc4'

export interface RdcConfig {
  id: RdcType
  name: string
  moduleName: string
  displayName: string
}

export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

