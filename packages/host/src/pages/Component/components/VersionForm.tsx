import React from 'react'
import type { ComponentVersions } from '../types'

interface VersionFormProps {
  versions: ComponentVersions
  onChange: (versions: ComponentVersions) => void
  autoFilledFields?: Set<string>
  onFieldChange?: (field: keyof ComponentVersions, value: string) => void
}

const VersionForm: React.FC<VersionFormProps> = ({
  versions,
  onChange,
  autoFilledFields,
  onFieldChange
}) => {
  const handleChange = (field: keyof ComponentVersions, value: string) => {
    const updated = { ...versions, [field]: value }
    onChange(updated)
    onFieldChange?.(field, value)
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-5">
      <div>
        <label htmlFor="dev-version" className="block text-sm font-semibold text-gray-300 mb-2">
          Development 环境版本
        </label>
        <input
          id="dev-version"
          type="text"
          value={versions.development || ''}
          onChange={(e) => handleChange('development', e.target.value)}
          className="w-full text-sm bg-gray-700/50 border border-blue-500/40 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/60 transition-all duration-200 placeholder-gray-400"
          placeholder="请输入版本号"
        />
      </div>
      
      <div>
        <label htmlFor="test-version" className="block text-sm font-semibold text-gray-300 mb-2">
          Test 环境版本
        </label>
        <input
          id="test-version"
          type="text"
          value={versions.test || ''}
          onChange={(e) => handleChange('test', e.target.value)}
          className="w-full text-sm bg-gray-700/50 border border-yellow-500/40 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/60 transition-all duration-200 placeholder-gray-400"
          placeholder="请输入版本号"
        />
      </div>
      
      <div>
        <label htmlFor="staging-version" className="block text-sm font-semibold text-gray-300 mb-2">
          Staging 环境版本
        </label>
        <input
          id="staging-version"
          type="text"
          value={versions.staging || ''}
          onChange={(e) => handleChange('staging', e.target.value)}
          className="w-full text-sm bg-gray-700/50 border border-orange-500/40 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/60 transition-all duration-200 placeholder-gray-400"
          placeholder="请输入版本号"
        />
      </div>
      
      <div>
        <label htmlFor="prod-version" className="block text-sm font-semibold text-gray-300 mb-2">
          Production 环境版本
        </label>
        <input
          id="prod-version"
          type="text"
          value={versions.production || ''}
          onChange={(e) => handleChange('production', e.target.value)}
          className="w-full text-sm bg-gray-700/50 border border-amber-500/50 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/60 transition-all duration-200 placeholder-gray-400"
          placeholder="请输入版本号"
        />
      </div>
    </div>
  )
}

export default React.memo(VersionForm)

