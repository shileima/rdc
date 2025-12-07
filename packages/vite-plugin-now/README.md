# @xbot/vite-plugin-now

Vite 插件，用于动态生成 Module Federation 的 remotes 配置，简化 RDC 组件的接入。

## 安装

### 从 npm 安装（推荐）

```bash
# 使用 pnpm
pnpm add @xbot/vite-plugin-now

# 或使用 npm
npm install @xbot/vite-plugin-now

# 或使用 yarn
yarn add @xbot/vite-plugin-now
```

### 使用本地版本（开发调试）

如果需要在发布前使用本地版本进行测试，可以使用以下方式：

```bash
# 方式1: 使用 file: 协议（推荐）
pnpm add @xbot/vite-plugin-now@file:../path/to/vite-plugin-now

# 方式2: 使用 link
cd /path/to/vite-plugin-now
pnpm link
cd /path/to/your-project
pnpm link @xbot/vite-plugin-now
```

## 使用

在 `vite.config.ts` 中使用：

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import nowPlugin, { getSharedConfig, NowPluginEnv } from '@xbot/vite-plugin-now'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'rdc_component',
      remotes: nowPlugin({
        components: ['rdc_test_1', 'rdc_test_form', 'rdc_test_table', 'rdc_test_editor'],
        env: 'test',
      }),
      shared: getSharedConfig(),
    })
  ],
})
```

### 类型导入

如果需要使用类型定义：

```typescript
import type { NowPluginEnv, NowPluginOptions, RemoteConfig } from '@xbot/vite-plugin-now'

// 使用类型
const env: NowPluginEnv = 'test'
```

## 配置选项

### `components`

- **类型**: `string[]`
- **必填**: 是
- **说明**: RDC 组件名称列表

### `env`

- **类型**: `'development' | 'test' | 'staging' | 'production'`
- **默认值**: `'test'`
- **说明**: 环境配置，决定使用哪个环境的 API 和 CDN 地址

### `configApiUrl`

- **类型**: `string`
- **可选**: 是
- **说明**: 自定义配置 API URL，覆盖默认的环境配置

### `rdcBaseUrl`

- **类型**: `string`
- **可选**: 是
- **说明**: 自定义 RDC 基础 URL，覆盖默认的环境配置

## 环境配置

插件内置了不同环境的配置：

| 环境 | Config API URL | RDC Base URL |
|------|----------------|--------------|
| dev  | `https://automan.waimai.test.sankuai.com/nodeapi/lionConfig?key=rdc_component_version` | `https://aie.waimai.test.sankuai.com/rdc_host/rdc` |
| test | `https://automan.waimai.test.sankuai.com/nodeapi/lionConfig?key=rdc_component_version` | `https://aie.waimai.test.sankuai.com/rdc_host/rdc` |
| staging | `https://automan.waimai.staging.sankuai.com/nodeapi/lionConfig?key=rdc_component_version` | `https://aie.waimai.staging.sankuai.com/rdc_host/rdc` |
| prod | `https://automan.waimai.sankuai.com/nodeapi/lionConfig?key=rdc_component_version` | `https://aie.waimai.sankuai.com/rdc_host/rdc` |

## 示例

### 基础使用

```typescript
nowPlugin({
  components: ['rdc_test_1', 'rdc_test_table'],
  env: 'test',
})
```

### 自定义 URL

```typescript
nowPlugin({
  components: ['rdc_test_1', 'rdc_test_table'],
  env: 'test',
  configApiUrl: 'https://custom-api.example.com/config',
  rdcBaseUrl: 'https://custom-cdn.example.com/rdc',
})
```

## 开发

### 本地开发

```bash
# 进入插件目录
cd packages/vite-plugin-now

# 安装依赖
pnpm install

# 构建
pnpm build

# 监听模式开发
pnpm dev
```

## 发布流程

### 前置准备

1. **确保已登录 npm**
   ```bash
   npm login
   # 或使用 pnpm
   pnpm login
   ```

2. **确保有发布权限**
   - 确认你有 `@xbot` scope 的发布权限
   - 如果没有权限，请联系包管理员

### 发布步骤

1. **更新版本号**
   
   在 `package.json` 中更新 `version` 字段，遵循 [语义化版本](https://semver.org/lang/zh-CN/)：
   - `0.0.1` → `0.0.2` (补丁版本：bug 修复)
   - `0.0.2` → `0.1.0` (次版本：新功能，向后兼容)
   - `0.1.0` → `1.0.0` (主版本：不兼容的变更)

   ```bash
   # 或使用 npm version 命令自动更新
   npm version patch   # 0.0.1 -> 0.0.2
   npm version minor   # 0.0.2 -> 0.1.0
   npm version major   # 0.1.0 -> 1.0.0
   ```

2. **构建项目**
   
   ```bash
   cd packages/vite-plugin-now
   pnpm build
   ```
   
   > 注意：发布时会自动执行 `prepublishOnly` 钩子进行构建，但建议先手动构建并检查

3. **检查构建产物**
   
   确认 `dist` 目录包含以下文件：
   - `index.js` - 主入口文件
   - `index.d.ts` - TypeScript 类型定义
   - `types.js` / `types.d.ts` - 类型文件
   - `config.js` / `config.d.ts` - 配置文件

4. **发布到 npm**
   
   ```bash
   # 在插件目录下执行
   cd packages/vite-plugin-now
   pnpm publish
   
   # 或使用 npm
   npm publish
   ```
   
   > 注意：如果使用 pnpm，确保在插件目录下执行，而不是在 monorepo 根目录

5. **验证发布**
   
   发布成功后，可以通过以下方式验证：
   ```bash
   # 查看包信息
   npm view @xbot/vite-plugin-now
   
   # 查看最新版本
   npm view @xbot/vite-plugin-now version
   ```

### 发布注意事项

- ✅ 发布前确保代码已提交到 Git
- ✅ 确保 `dist` 目录已构建且包含最新代码
- ✅ 检查 `package.json` 中的 `files` 字段，确保只发布必要文件
- ✅ 发布前建议在本地测试构建产物
- ⚠️ 发布后版本号无法回退，请谨慎操作
- ⚠️ 如果发布错误，只能发布新的版本来修复

### 发布到私有源（如需要）

如果包需要发布到私有 npm 源，需要配置 `.npmrc`：

```ini
@xbot:registry=https://your-private-registry.com/
```

## License

MIT
