import React from 'react'

const TECH_STACK_ITEMS = [
  { label: 'React + Vite + Typescript + TailwindCSS', color: 'bg-green-500', icon: '⚡' }
]

const TechStack: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-gray-800/95 via-gray-800/98 to-gray-800/95 rounded-xl shadow-2xl border border-amber-500/20 overflow-hidden transition-all duration-300 hover:shadow-amber-500/20 hover:border-amber-500/40 backdrop-blur-sm">
      <div className="p-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-5">
          技术栈
        </h2>
        <ul className="space-y-3">
          {TECH_STACK_ITEMS.map((item, index) => (
            <li key={index} className="flex items-center text-gray-300 group">
              <span className={`w-3 h-3 ${item.color} rounded-full mr-4 group-hover:scale-125 transition-transform duration-200`}></span>
              <span className="text-lg mr-2">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default React.memo(TechStack)
