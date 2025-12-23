import React from 'react'
import type { RdcType } from '../types'

interface RdcSelectorProps {
  currentRdc: RdcType
  onSelect: (rdc: RdcType) => void
}

const RDC_OPTIONS: Array<{ id: RdcType; label: string }> = [
  { id: 'rdc1', label: 'Test' },
  { id: 'rdc2', label: 'Form' },
  { id: 'rdc3', label: 'Table' }
]

const RdcSelector: React.FC<RdcSelectorProps> = ({ currentRdc, onSelect }) => {
  return (
    <div className="bg-gradient-to-br from-gray-800/95 via-gray-800/98 to-gray-800/95 rounded-xl shadow-2xl border border-amber-500/20 overflow-hidden transition-all duration-300 hover:shadow-amber-500/20 hover:border-amber-500/40 backdrop-blur-sm">
      <div className="p-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-5">
          切换 RDC 组件
        </h2>
        <div className="flex gap-3 flex-nowrap">
          {RDC_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={`flex-1 px-4 py-3 rounded-lg transition-all duration-200 font-semibold text-sm transform hover:-translate-y-0.5 whitespace-nowrap ${
                currentRdc === option.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/30'
                  : 'bg-gray-700/80 text-gray-300 hover:bg-gray-600/80 border border-gray-600/50'
              }`}
              aria-label={`切换到 ${option.label} 组件`}
              aria-pressed={currentRdc === option.id}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default React.memo(RdcSelector)
