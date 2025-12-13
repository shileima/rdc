import React from 'react'
import type { ComponentData } from '../types'
import { getVersionDisplay } from '../utils/versionUtils'

interface ComponentTableProps {
  components: ComponentData[]
  loading: boolean
  onEdit: (component: ComponentData) => void
  onDelete: (componentName: string) => void
  onPermission: (componentName: string) => void
  deleting: string | null
  canManage: boolean
}

const ComponentTable: React.FC<ComponentTableProps> = ({
  components,
  loading,
  onEdit,
  onDelete,
  onPermission,
  deleting,
  canManage
}) => {
  if (loading) {
    return (
      <div className="px-8 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="text-gray-400 mt-4 text-sm">加载中...</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-800/60 border-b border-gray-600/50">
          <tr>
            <th className="px-8 py-5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              组件名称
            </th>
            <th className="px-8 py-5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
              版本
            </th>
            <th className="px-8 py-5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-800/50 divide-y divide-amber-500/10">
          {components.map((component, index) => (
            <tr
              key={component.componentName}
              className="group transition-all duration-300 border-l-4 border-transparent hover:bg-gradient-to-r hover:from-blue-900/30 hover:via-amber-900/20 hover:to-blue-900/30 hover:shadow-lg hover:border-l-amber-500/70"
              style={{
                animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                borderLeft: '4px solid transparent'
              }}
            >
              <td className="px-8 py-6 whitespace-nowrap">
                <span className="text-sm font-bold text-blue-200">
                  {component.componentName}
                </span>
              </td>
              <td className="px-8 py-6 whitespace-nowrap">
                <div className="flex justify-center">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    <div className="flex items-center justify-end space-x-3">
                      <span className="text-xs text-gray-400 font-medium">development:</span>
                      <code className="text-xs bg-gray-700/50 text-white px-2.5 py-1 rounded-lg font-mono border border-blue-500/40 min-w-[60px] text-center">
                        {getVersionDisplay(component.versions.development)}
                      </code>
                    </div>
                    <div className="flex items-center justify-end space-x-3">
                      <span className="text-xs text-gray-400 font-medium">test:</span>
                      <code className="text-xs bg-gray-700/50 text-white px-2.5 py-1 rounded-lg font-mono border border-yellow-500/40 min-w-[60px] text-center">
                        {getVersionDisplay(component.versions.test)}
                      </code>
                    </div>
                    <div className="flex items-center justify-end space-x-3">
                      <span className="text-xs text-gray-400 font-medium">staging:</span>
                      <code className="text-xs bg-gray-700/50 text-white px-2.5 py-1 rounded-lg font-mono border border-orange-500/40 min-w-[60px] text-center">
                        {getVersionDisplay(component.versions.staging)}
                      </code>
                    </div>
                    <div className="flex items-center justify-end space-x-3">
                      <span className="text-xs text-gray-400 font-medium">production:</span>
                      <code className="text-xs bg-gray-700/50 text-white px-2.5 py-1 rounded-lg font-mono border border-amber-500/50 min-w-[60px] text-center">
                        {getVersionDisplay(component.versions.production)}
                      </code>
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-center">
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => onEdit(component)}
                    className="text-blue-400 hover:text-blue-300 transition-all duration-200 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded px-2 py-1"
                    aria-label={`编辑组件 ${component.componentName}`}
                    tabIndex={0}
                  >
                    编辑
                  </button>
                  {canManage && (
                    <>
                      <button
                        onClick={() => onPermission(component.componentName)}
                        className="text-gray-400 hover:text-gray-300 transition-all duration-200 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded px-2 py-1"
                        aria-label={`权限管理 ${component.componentName}`}
                        tabIndex={0}
                      >
                        权限
                      </button>
                      <button
                        onClick={() => onDelete(component.componentName)}
                        disabled={deleting === component.componentName}
                        className="text-red-500 hover:text-red-400 transition-all duration-200 font-medium hover:underline disabled:text-gray-600 disabled:cursor-not-allowed disabled:hover:no-underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded px-2 py-1"
                        aria-label={`删除组件 ${component.componentName}`}
                        tabIndex={0}
                      >
                        {deleting === component.componentName ? '删除中...' : '删除'}
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default React.memo(ComponentTable)

