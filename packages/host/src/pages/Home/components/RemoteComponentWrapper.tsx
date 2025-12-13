import React from 'react'

interface RemoteComponentWrapperProps {
  component: React.ComponentType
}

const RemoteComponentWrapper: React.FC<RemoteComponentWrapperProps> = ({ component: Component }) => {
  try {
    return <Component />
  } catch (error) {
    console.error('Remote component error:', error)
    return (
      <div className="flex items-center justify-center h-full bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
            组件加载失败
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300">
            远程组件渲染时出现错误
          </p>
        </div>
      </div>
    )
  }
}

export default React.memo(RemoteComponentWrapper)

