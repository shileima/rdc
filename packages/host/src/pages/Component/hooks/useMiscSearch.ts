import { useState, useCallback, useRef, useEffect } from 'react'
import { searchMiscUsers } from '../api/componentApi'
import type { MiscUser } from '../types'

/**
 * Misc 用户搜索 Hook（带防抖）
 */
export const useMiscSearch = (selectedUsers: MiscUser[] = []) => {
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const [searchResults, setSearchResults] = useState<MiscUser[]>([])
  const [searching, setSearching] = useState<boolean>(false)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 清理防抖定时器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  // 执行搜索
  const performSearch = useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      setSearchResults([])
      setSearching(false)
      return
    }

    try {
      setSearching(true)
      const users = await searchMiscUsers(keyword)
      // 过滤掉已经选中的用户
      const selectedAccounts = selectedUsers.map(user => user.account)
      const filteredUsers = users.filter(user => !selectedAccounts.includes(user.account))
      setSearchResults(filteredUsers)
    } catch (error) {
      console.error('搜索用户失败:', error)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }, [selectedUsers])

  // 防抖搜索
  const debouncedSearch = useCallback((keyword: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(keyword)
    }, 300)
  }, [performSearch])

  // 处理搜索输入
  const handleSearch = useCallback((value: string) => {
    setSearchKeyword(value)
    if (value.trim()) {
      debouncedSearch(value)
    } else {
      setSearchResults([])
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [debouncedSearch])

  // 清除搜索
  const clearSearch = useCallback(() => {
    setSearchKeyword('')
    setSearchResults([])
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
  }, [])

  return {
    searchKeyword,
    searchResults,
    searching,
    handleSearch,
    clearSearch
  }
}

