import React from 'react'

const FEATURES = [
  { label: '热重载', color: 'bg-yellow-500', icon: '🔥' },
  { label: '类型安全', color: 'bg-red-500', icon: '🛡️' },
  { label: '响应式设计', color: 'bg-pink-500', icon: '📱' },
  { label: '微前端支持', color: 'bg-indigo-500', icon: '🚀' }
]

const Features: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-gray-800/95 via-gray-800/98 to-gray-800/95 rounded-xl shadow-2xl border border-amber-500/20 overflow-hidden transition-all duration-300 hover:shadow-amber-500/20 hover:border-amber-500/40 backdrop-blur-sm">
      <div className="p-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-5">
          功能特性
        </h2>
        <ul className="space-y-3">
          {FEATURES.map((feature, index) => (
            <li key={index} className="flex items-center text-gray-300 group">
              <span className={`w-3 h-3 ${feature.color} rounded-full mr-4 group-hover:scale-125 transition-transform duration-200`}></span>
              <span className="text-lg mr-2">{feature.icon}</span>
              <span className="font-medium">{feature.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default React.memo(Features)
