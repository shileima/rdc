import React, { useEffect } from 'react'
import { CloseOutlined, DeleteOutlined, WarningOutlined } from '@ant-design/icons'
import { Select, Avatar, Spin } from 'antd'
import { useEscKey } from '../utils/useEscKey'
import { useMiscSearch } from '../hooks/useMiscSearch'
import type { MiscUser } from '../types'

interface PermissionModalProps {
  visible: boolean
  rdcName: string
  selectedAdmins: MiscUser[]
  searching: boolean
  searchResults: MiscUser[]
  searchKeyword: string
  onClose: () => void
  onSave: () => Promise<boolean>
  onSearch: (value: string) => void
  onSelectUser: (user: MiscUser) => void
  onRemoveAdmin: (account: string) => void
  saving: boolean
}

const PermissionModal: React.FC<PermissionModalProps> = ({
  visible,
  rdcName,
  selectedAdmins,
  searching,
  searchResults,
  searchKeyword,
  onClose,
  onSave,
  onSearch,
  onSelectUser,
  onRemoveAdmin,
  saving
}) => {
  useEscKey(visible, onClose)

  const handleSelectChange = (value: string) => {
    if (value) {
      const user = searchResults.find(u => u.account === value)
      if (user) {
        onSelectUser(user)
      }
    }
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="permission-modal-title"
    >
      <div
        className="bg-gradient-to-br from-gray-800/95 via-gray-800/98 to-gray-800/95 rounded-xl shadow-2xl p-8 w-full max-w-2xl transform transition-all duration-300 scale-100 border-2 border-amber-500/30 relative overflow-hidden backdrop-blur-sm max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -z-10"></div>
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <h2 id="permission-modal-title" className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-amber-400 to-blue-400 bg-clip-text text-transparent">
            权限管理
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            aria-label="关闭权限管理"
          >
            <CloseOutlined className="text-xl" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/30 via-blue-800/20 to-transparent border-l-4 border-blue-400 rounded-lg shadow-lg relative overflow-hidden relative z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-400/30">
              <WarningOutlined className="text-blue-400 text-xl animate-pulse" />
            </div>
            <p className="text-sm text-gray-200 leading-relaxed m-0 flex-1 font-medium">
              新增权限后，可对该RDC的所有环境进行版本管理，请谨慎操作！
            </p>
          </div>
        </div>

        <div className="mb-6 relative z-10">
          <div className="flex items-stretch gap-3 mb-4">
            <div className="flex-1">
              <Select
                showSearch
                placeholder="请输入用户名搜索"
                value={null}
                onSearch={onSearch}
                onChange={handleSelectChange}
                notFoundContent={searching ? <Spin size="small" /> : (searchKeyword ? '未找到用户' : null)}
                className="w-full permission-select h-[42px]"
                filterOption={false}
                style={{ width: '100%', height: '42px' }}
                allowClear
                popupClassName="permission-select-dropdown"
              >
                {searchResults.map((user) => (
                  <Select.Option key={user.account} value={user.account}>
                    <div className="flex items-center gap-2 py-1">
                      <Avatar src={user.avatarUrl} size={24} />
                      <span className="text-gray-200">{user.name}</span>
                      <span className="text-gray-400 text-xs">({user.account})</span>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </div>
            <button
              onClick={() => {
                const input = document.querySelector('.ant-select-selection-search-input') as HTMLInputElement
                if (input) {
                  input.focus()
                }
              }}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all duration-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 h-[42px] flex items-center whitespace-nowrap"
            >
              新增权限
            </button>
          </div>
          
          <div className="text-sm text-gray-400 font-medium">
            当前权限: 个人 {selectedAdmins.length}
          </div>
        </div>

        {selectedAdmins.length > 0 && (
          <div className="mb-6 relative z-10">
            <div className="space-y-3">
              {selectedAdmins.map((admin) => (
                <div
                  key={admin.account}
                  className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-200 border border-gray-600 hover:border-gray-500"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={admin.avatarUrl} size={40} className="border-2 border-gray-600" />
                    <div>
                      <div className="text-sm font-semibold text-gray-200 mb-0.5">{admin.name}</div>
                      <div className="text-xs text-gray-400">{admin.account}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveAdmin(admin.account)}
                    className="text-gray-400 hover:text-red-400 transition-all duration-200 p-2 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-700"
                    aria-label={`删除 ${admin.name} 的权限`}
                  >
                    <DeleteOutlined className="text-lg" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedAdmins.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm relative z-10">
            暂无权限设置
          </div>
        )}

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-700 relative z-10">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            aria-label="取消"
          >
            取消
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-6 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transform hover:-translate-y-0.5 disabled:transform-none"
            aria-label="保存权限"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default React.memo(PermissionModal)

