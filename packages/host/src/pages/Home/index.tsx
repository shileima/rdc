import React, { useCallback } from 'react'
import { useRemoteComponents } from './hooks/useRemoteComponents'
import PageHeader from './components/PageHeader'
import RdcSelector from './components/RdcSelector'
import ManagementLinks from './components/ManagementLinks'
import TechStack from './components/TechStack'
import Features from './components/Features'
import RemoteComponentViewer from './components/RemoteComponentViewer'
import { homeStyles } from './styles'

const Home: React.FC = () => {
  const {
    currentRdc,
    showRemote,
    setCurrentRdc,
    getCurrentComponent
  } = useRemoteComponents()

  const handleRdcChange = useCallback((rdc: typeof currentRdc) => {
    setCurrentRdc(rdc)
  }, [setCurrentRdc])

  const currentComponent = getCurrentComponent()

  return (
    <div className="min-h-screen w-screen text-white p-8 md:p-12 relative overflow-hidden">
      {/* 炫酷背景渐变 - 动态呼吸 */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900/30 via-purple-900/20 to-gray-900 -z-10 animate-background-breathing"></div>
      
      {/* 呼吸灯效果 - 多个渐变球，增强动态效果 */}
      <div className="fixed top-20 left-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl -z-10 animate-breathing"></div>
      <div className="fixed bottom-20 right-1/4 w-[600px] h-[600px] bg-purple-500/18 rounded-full blur-3xl -z-10 animate-breathing-delayed"></div>
      <div className="fixed top-1/2 left-0 w-[400px] h-[400px] bg-cyan-500/18 rounded-full blur-3xl -z-10 animate-breathing-slow"></div>
      <div className="fixed top-1/3 right-0 w-[450px] h-[450px] bg-indigo-500/15 rounded-full blur-3xl -z-10 animate-breathing"></div>
      <div className="fixed bottom-1/3 left-1/2 w-[350px] h-[350px] bg-amber-500/12 rounded-full blur-3xl -z-10 animate-breathing-slow"></div>
      
      {/* 动态光效 - 增强呼吸感 */}
      <div className="fixed inset-0 bg-gradient-to-r from-transparent via-blue-500/10 via-purple-500/6 to-transparent -z-10 animate-shimmer"></div>
      <div className="fixed inset-0 radial-gradient-breathe -z-10 animate-pulse-slow"></div>
      
      {/* 网格背景 - 动态呼吸 */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:50px_50px] -z-10 animate-grid-breathing"></div>
      
      <div className="max-w-7xl mx-auto relative z-10 h-full">
        <div className="flex flex-col h-full">
          <PageHeader />

          <main className="grid grid-cols-[1fr_2fr] gap-6 flex-1 min-h-0">
            <div className="space-y-6 overflow-y-auto scrollbar-hide pr-2">
              <RdcSelector
                currentRdc={currentRdc}
                onSelect={handleRdcChange}
              />

              <ManagementLinks />

              <TechStack />

              <Features />
            </div>

            <RemoteComponentViewer
              showRemote={showRemote}
              component={currentComponent}
            />
          </main>
        </div>
      </div>

      {/* 样式 */}
      <style>{homeStyles}</style>
    </div>
  )
}

export default Home
