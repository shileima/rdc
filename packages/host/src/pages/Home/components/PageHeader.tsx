import React from 'react'

const PageHeader: React.FC = () => {
  return (
    <header className="text-center mb-8 flex-shrink-0">
      <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent mb-3 tracking-tight animate-gradient-shift">
        RDC 微前端平台
      </h1>
      <p className="text-lg text-gray-300 dark:text-gray-400 font-medium">
        基于 React + Vite + Module Federation 的企业级微前端解决方案
      </p>
    </header>
  )
}

export default React.memo(PageHeader)
