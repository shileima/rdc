import React from 'react'
import { Link } from 'react-router-dom'

const ManagementLinks: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-gray-800/95 via-gray-800/98 to-gray-800/95 rounded-xl shadow-2xl border border-amber-500/20 overflow-hidden transition-all duration-300 hover:shadow-amber-500/20 hover:border-amber-500/40 backdrop-blur-sm">
      <div className="p-6">
        <h5 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-5">
          管理入口
        </h5>
        <div className="flex gap-3">
          <Link
            to="/rdc/component"
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 text-center shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-0.5"
            aria-label="组件管理"
          >
            组件管理
          </Link>
          <Link
            to="/rdc/platform"
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 text-center shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-0.5"
            aria-label="平台列表"
          >
            平台列表
          </Link>
        </div>
      </div>
    </div>
  )
}

export default React.memo(ManagementLinks)
