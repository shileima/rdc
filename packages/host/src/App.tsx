import { useState, useEffect, lazy, Suspense } from 'react'
import './App.css'

// 动态导入远程组件
const RemoteComponent1 = lazy(() => import('rdc_test_1/App'))
const RemoteComponent2 = lazy(() => import('rdc_test_form/App'))

type RdcType = 'rdc1' | 'rdc2'

function App() {
  const [count, setCount] = useState(0)
  const [currentRdc, setCurrentRdc] = useState<RdcType>('rdc1')
  const [showRemote, setShowRemote] = useState(false)

  useEffect(() => {
    // 自动加载远程组件
    setShowRemote(true)
  }, [])

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      <div className="px-[200px] py-8 h-full">
        <div className="mx-auto h-full flex flex-col">
          <header className="text-center mb-4 flex-shrink-0">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              RDC Host
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              基于 React + Vite + Module Federation 的微前端主应用
            </p>
          </header>

          <main className="grid grid-cols-[1fr_2fr] gap-6 flex-1 min-h-0">
            <div className="space-y-6 overflow-y-auto scrollbar-hide">
              <div className="dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h5 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  计数器示例
                </h5>
                <div className="flex items-center justify-start text-center">
                  <div className="text-left text-5xl font-bold text-indigo-600 dark:text-indigo-400 min-w-[100px]">
                    {count}
                  </div>
                  <button
                    onClick={() => setCount((count) => count + 1)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    点击 +1
                  </button>
                </div>
              </div>

              <div className="dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  切换 RDC 组件
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentRdc('rdc1')}
                    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                      currentRdc === 'rdc1'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    RDC Test 1
                  </button>
                  <button
                    onClick={() => setCurrentRdc('rdc2')}
                    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                      currentRdc === 'rdc2'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    RDC Test Form
                  </button>
                </div>
              </div>

              <div className="dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  技术栈
                </h2>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    React + Vite + TailwindCSS
                  </li>
                </ul>
              </div>

              <div className="dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  功能特性
                </h2>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                    热重载
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                    类型安全
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
                    响应式设计
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                    微前端支持
                  </li>
                </ul>
              </div>
            </div>

            <div className="dark:bg-gray-800 rounded-lg shadow-lg p-6 overflow-y-auto scrollbar-hide">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                远程 RDC 组件
              </h2>
              <div className="min-h-[200px]">
                {showRemote && (
                  <Suspense fallback={
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-300">加载远程组件中...</p>
                      </div>
                    </div>
                  }>
                    {currentRdc === 'rdc1' ? <RemoteComponent1 /> : <RemoteComponent2 />}
                  </Suspense>
                )}
              </div>
            </div>
          </main>

          
        </div>
      </div>
    </div>
  )
}

export default App
