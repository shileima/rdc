import React, { Suspense, ComponentType } from 'react'
import ErrorBoundary from './ErrorBoundary'
import RemoteComponentWrapper from './RemoteComponentWrapper'

interface RemoteComponentViewerProps {
  showRemote: boolean
  component: ComponentType | null
}

const RemoteComponentViewer: React.FC<RemoteComponentViewerProps> = ({
  showRemote,
  component
}) => {
  if (!showRemote || !component) {
    return (
      <div className="bg-gradient-to-br from-gray-800/95 via-gray-800/98 to-gray-800/95 rounded-xl shadow-2xl border border-amber-500/20 overflow-hidden transition-all duration-300 hover:shadow-amber-500/20 hover:border-amber-500/40 backdrop-blur-sm">
        <div className="p-6 min-h-[200px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">准备加载远程组件...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-800/95 via-gray-800/98 to-gray-800/95 rounded-xl shadow-2xl border border-amber-500/20 overflow-hidden transition-all duration-300 hover:shadow-amber-500/20 hover:border-amber-500/40 backdrop-blur-sm">
      <div className="p-6 overflow-y-auto scrollbar-hide min-h-[200px]">
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-300 font-medium">加载远程组件中...</p>
                  <p className="text-sm text-gray-500 mt-2">请稍候</p>
                </div>
              </div>
            }
          >
            <RemoteComponentWrapper component={component} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  )
}

export default React.memo(RemoteComponentViewer)
