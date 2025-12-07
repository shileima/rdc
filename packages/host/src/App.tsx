import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import Home from './pages/Home'
import Platform from './pages/Platform'
import Component from './pages/Component'
import './App.css'

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgElevated: '#1f2937',
          colorText: '#e5e7eb',
          colorTextSecondary: '#9ca3af',
          colorBorder: '#374151',
          borderRadius: 8,
        },
        components: {
          Message: {
            contentBg: '#1f2937',
            colorText: '#e5e7eb',
            colorInfo: '#60a5fa',
            colorSuccess: '#34d399',
            colorError: '#f87171',
            colorWarning: '#fbbf24',
            borderRadius: 8,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
          },
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/rdc" element={<Navigate to="/rdc/home" replace />} />
          <Route path="/rdc/home" element={<Home />} />
          <Route path="/rdc/platform" element={<Platform />} />
          <Route path="/rdc/component" element={<Component />} />
          <Route path="*" element={<Navigate to="/rdc/home" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
