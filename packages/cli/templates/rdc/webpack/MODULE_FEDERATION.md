# Module Federation 配置说明

本模板已预配置 Module Federation，支持作为微前端主应用接入远程组件，也支持作为微前端子应用被其他应用接入。

## 🎯 核心特性

### 1. 样式支持
- ✅ TailwindCSS 已正确配置
- ✅ CSS 在 index.tsx 中导入
- ✅ 开发和生产环境都支持样式热重载

### 2. 模块联邦配置

#### 作为子应用（暴露组件）
```javascript
// webpack.dev.config.js 和 webpack.prod.config.js
new ModuleFederationPlugin({
  name: 'template_webpack',
  filename: 'remoteEntry.js',
  exposes: {
    './App': './src/bootstrap.tsx',  // 暴露 App 组件
  },
  shared: {
    react: { singleton: true, eager: true },
    'react-dom': { singleton: true, eager: true },
  },
})
```

#### 作为主应用（接入远程组件）
```javascript
// 在 webpack.dev.config.js 或 webpack.prod.config.js 中添加
remotes: {
  remoteComponent: `remoteComponent@http://localhost:3001/remoteEntry.js`,
},
```

### 3. 共享模块配置

所有共享模块都配置了 `eager: true`，解决常见的 Module Federation 错误：
```javascript
shared: {
  react: {
    singleton: true,
    requiredVersion: packageJson.dependencies.react,
    eager: true,  // 关键配置，避免 "Shared module is not available for eager consumption" 错误
  },
  'react-dom': {
    singleton: true,
    requiredVersion: packageJson.dependencies['react-dom'],
    eager: true,
  },
}
```

## 📝 使用指南

### 1. 创建新项目
```bash
npm run now rdc create
```

### 2. 接入远程组件

#### 步骤 1：在 webpack 配置中添加 remotes
```javascript
// scripts/webpack.dev.config.js 或 webpack.prod.config.js
remotes: {
  rdc_test_table: `rdc_test_table@https://example.com/rdc_test_table/webpack/0.0.1/remoteEntry.js`,
},
```

#### 步骤 2：创建类型声明文件
```typescript
// src/types.d.ts
declare module 'rdc_test_table/App' {
  import { ComponentType } from 'react'
  const App: ComponentType
  export default App
}
```

#### 步骤 3：在组件中使用
```tsx
import { lazy, Suspense } from 'react';

const RemoteComponent = lazy(() => import('rdc_test_table/App'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RemoteComponent />
    </Suspense>
  );
}
```

### 3. 同时开发多个项目

使用 `dev:all` 脚本一键启动多个服务：

```bash
# 修改 package.json 中的 dev:all 脚本
"dev:all": "concurrently \"cd ../rdc_other && pnpm dev\" \"pnpm dev\""

# 运行
pnpm dev:all
```

## ⚠️ 常见问题

### 1. 样式丢失
**问题**：页面没有样式，文本和按钮都是默认样式

**解决方案**：
1. 确认 `tailwind.config.js` 使用 `module.exports` 而非 `export default`
2. 确认 `src/index.tsx` 中导入了 `import './index.css'`

### 2. Shared module 错误
**错误**：`Shared module is not available for eager consumption`

**解决方案**：
- 在 Module Federation 的 shared 配置中添加 `eager: true`

### 3. 跨域问题
**问题**：无法加载远程组件

**解决方案**：
- 在 devServer 配置中添加 CORS 头：
```javascript
headers: {
  'Access-Control-Allow-Origin': '*',
}
```

## 🔧 开发环境配置

开发环境（webpack.dev.config.js）已包含：
- ✅ Module Federation 基础配置
- ✅ 正确的 shared 配置（eager: true）
- ✅ CORS 支持
- ✅ CSS 处理

生产环境（webpack.prod.config.js）已包含：
- ✅ Module Federation 基础配置
- ✅ 正确的 shared 配置（eager: true）
- ✅ CSS 压缩和优化
- ✅ 示例 remotes 配置（已注释）

## 📦 依赖

确保以下依赖已安装：
- `webpack` ^5.90.3
- `@webpack/container` (内置)
- `concurrently` ^9.2.1 (用于启动多个服务)

