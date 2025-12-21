import React, { useState, useRef, useEffect, useMemo } from 'react'
import type { ComponentVersions, RdcInfo, Status, Environment } from '../types'
import { getSelectedVersion } from '../utils/versionUtils'
import { STATUS, ENV_MAPPING, UI_CONSTANTS } from '../types'

interface VersionFormProps {
  versions: ComponentVersions
  onChange: (versions: ComponentVersions) => void
  autoFilledFields?: Set<string>
  onFieldChange?: (field: keyof ComponentVersions, value: string) => void
  rdcInfo?: RdcInfo | null
}

// 单个版本选择器组件
interface VersionSelectorProps {
  env: Environment
  label: string
  borderColor: string
  focusRingColor: string
  value: string
  versionArray?: Array<{ type: string; version: string; isValid?: Status }>
  onChange: (value: string) => void
  getCurrentType: () => string
}

const VersionSelector: React.FC<VersionSelectorProps> = ({
  env,
  label,
  borderColor,
  focusRingColor,
  value,
  versionArray,
  onChange,
  getCurrentType
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const currentType = getCurrentType()
  
  // 同步外部值变化
  useEffect(() => {
    setInputValue(value)
  }, [value])
  
  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])
  
  const handleInputChange = (newValue: string) => {
    setInputValue(newValue)
    onChange(newValue)
  }
  
  const handleSelectVersion = (version: string) => {
    setInputValue(version)
    onChange(version)
    setIsOpen(false)
  }
  
  const handleItemClick = (e: React.MouseEvent, version: string) => {
    e.preventDefault()
    e.stopPropagation()
    handleSelectVersion(version)
  }
  
  // 如果有版本数组，使用下拉选择框
  if (versionArray && versionArray.length > 0) {
    return (
      <div>
        <label htmlFor={`${env}-version`} className="block text-sm font-semibold text-gray-300 mb-2">
          {label}
        </label>
        <div className="relative" ref={dropdownRef}>
          <div className="relative">
            <input
              id={`${env}-version`}
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => setIsOpen(true)}
              className={`w-full text-sm bg-gray-700/50 border ${borderColor} text-white rounded-lg px-4 py-2.5 pr-20 focus:outline-none focus:ring-2 ${focusRingColor} focus:border-blue-500/60 transition-all duration-200 placeholder-gray-400`}
              placeholder="请输入或选择版本号"
            />
            {currentType && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs font-medium rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {currentType}
              </span>
            )}
          </div>
          
          {isOpen && (
            <div className="absolute w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-60 overflow-auto" style={{ zIndex: UI_CONSTANTS.Z_INDEX.DROPDOWN }}>
              {versionArray.map((item, index) => {
                const isSelected = item.version === value
                const isValid = item.isValid === STATUS.ACTIVE
                return (
                  <div
                    key={index}
                    onClick={(e) => handleItemClick(e, item.version)}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleSelectVersion(item.version)
                    }}
                    className={`px-4 py-2.5 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-600/30 border-l-4 border-blue-500'
                        : 'hover:bg-gray-700/50 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between pointer-events-none">
                      <span className="text-sm text-white font-medium pointer-events-none">{item.version}</span>
                      <div className="flex items-center gap-2 pointer-events-none">
                        {isValid && (
                          <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-green-500/20 text-green-300 border border-green-500/30 pointer-events-none">
                            valid
                          </span>
                        )}
                        <span className={`px-2 py-0.5 text-xs font-medium rounded pointer-events-none ${
                          item.type === 'stable'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {item.type}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }
  
  // 如果没有版本数组，使用普通输入框
  return (
    <div>
      <label htmlFor={`${env}-version`} className="block text-sm font-semibold text-gray-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={`${env}-version`}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          className={`w-full text-sm bg-gray-700/50 border ${borderColor} text-white rounded-lg px-4 py-2.5 pr-20 focus:outline-none focus:ring-2 ${focusRingColor} focus:border-blue-500/60 transition-all duration-200 placeholder-gray-400`}
          placeholder="请输入版本号"
        />
        {currentType && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs font-medium rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
            {currentType}
          </span>
        )}
      </div>
    </div>
  )
}

const VersionForm: React.FC<VersionFormProps> = ({
  versions,
  onChange,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  autoFilledFields,
  onFieldChange,
  rdcInfo
}) => {
  const handleChange = (field: keyof ComponentVersions, value: string) => {
    const updated = { ...versions, [field]: value }
    onChange(updated)
    onFieldChange?.(field, value)
  }

  // 获取当前选中的版本
  // 优先使用用户实际选择的版本（versions[env]），如果没有则使用默认逻辑（优先 isValid: 1，如果没有则 stable，再没有则 latest）
  const getCurrentSelectedVersion = useMemo(() => {
    return (env: Environment): string => {
      // 如果用户已经选择了版本，直接使用用户选择的值
      if (versions[env]) {
        return versions[env] || ''
      }
      
      // 如果没有用户选择的值，使用默认逻辑
      if (!rdcInfo) {
        return ''
      }
      
      const versionKey = ENV_MAPPING[env]
      const versionArray = rdcInfo[versionKey as keyof RdcInfo] as Array<{ type: string; version: string; isValid?: Status }> | undefined
      
      return getSelectedVersion(versionArray) || ''
    }
  }, [versions, rdcInfo])

  // 获取当前选中版本的 type
  const getCurrentSelectedVersionType = useMemo(() => {
    return (env: Environment): string => {
      const currentVersion = versions[env]
      if (!currentVersion) {
        return ''
      }
      
      if (!rdcInfo) {
        // 如果没有 rdcInfo，手动输入的版本默认为 'latest'
        return UI_CONSTANTS.VERSION_TYPE.LATEST
      }
      
      const versionKey = ENV_MAPPING[env]
      const versionArray = rdcInfo[versionKey as keyof RdcInfo] as Array<{ type: string; version: string; isValid?: Status }> | undefined
      
      if (!versionArray || versionArray.length === 0) {
        // 如果没有版本数组，手动输入的版本默认为 'latest'
        return UI_CONSTANTS.VERSION_TYPE.LATEST
      }
      
      const versionItem = versionArray.find(item => item.version === currentVersion)
      // 如果版本不存在（手动输入的新版本），默认为 'latest'
      return versionItem?.type || UI_CONSTANTS.VERSION_TYPE.LATEST
    }
  }, [versions, rdcInfo])

  // 渲染版本选择下拉框（支持手动输入和下拉选择）
  const renderVersionSelect = (
    env: Environment,
    label: string,
    borderColor: string,
    focusRingColor: string
  ) => {
    const versionKey = ENV_MAPPING[env]
    const versionArray = rdcInfo?.[versionKey as keyof RdcInfo] as Array<{ type: string; version: string; isValid?: Status }> | undefined
    const currentValue = getCurrentSelectedVersion(env)
    
    return (
      <VersionSelector
        env={env}
        label={label}
        borderColor={borderColor}
        focusRingColor={focusRingColor}
        value={currentValue}
        versionArray={versionArray}
        onChange={(value) => handleChange(env, value)}
        getCurrentType={() => getCurrentSelectedVersionType(env)}
      />
    )
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-5">
      {renderVersionSelect('development', 'Development 环境版本', 'border-blue-500/40', 'focus:ring-blue-500/50')}
      {renderVersionSelect('test', 'Test 环境版本', 'border-yellow-500/40', 'focus:ring-yellow-500/50')}
      {renderVersionSelect('staging', 'Staging 环境版本', 'border-orange-500/40', 'focus:ring-orange-500/50')}
      {renderVersionSelect('production', 'Production 环境版本', 'border-amber-500/50', 'focus:ring-amber-500/50')}
    </div>
  )
}

export default React.memo(VersionForm)

