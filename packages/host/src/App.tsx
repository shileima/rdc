import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Platform from './pages/Platform'
import Component from './pages/Component'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/rdc" element={<Navigate to="/rdc/home" replace />} />
        <Route path="/rdc/home" element={<Home />} />
        <Route path="/rdc/platform" element={<Platform />} />
        <Route path="/rdc/component" element={<Component />} />
        <Route path="*" element={<Navigate to="/rdc/home" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
