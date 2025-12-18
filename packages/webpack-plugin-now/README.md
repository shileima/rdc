# @xbot/webpack-plugin-now

Webpack 插件，用于动态生成 Module Federation 的 remotes 配置，简化 RDC 组件的接入。

## 安装

### 从 npm 安装（推荐）

```bash
# 使用 pnpm
pnpm add @xbot/webpack-plugin-now

# 或使用 npm
npm install @xbot/webpack-plugin-now

# 或使用 yarn
yarn add @xbot/webpack-plugin-now
```

### 使用本地版本（开发调试）

如果需要在发布前使用本地版本进行测试，可以使用以下方式：

```bash
# 方式1: 使用 file: 协议（推荐）
pnpm add @xbot/webpack-plugin-now@file:../path/to/webpack-plugin-now

# 方式2: 使用 link
cd /path/to/webpack-plugin-now
pnpm link
cd /path/to/your-project
pnpm link @xbot/webpack-plugin-now
```

## 使用

### CommonJS 使用（推荐）

在 `webpack.config.js` 中直接使用，**无需 `.default`**：

```javascript
const { ModuleFederationPlugin } = require('webpack').container;
const webpackNowPlugin = require('@xbot/webpack-plugin-now');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'my_app',
      remotes: webpackNowPlugin({
        components: ['devicemanage'],
        env: 'test'
      }),
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true },
      },
    }),
  ],
};
```

> **注意**：插件已配置为 CommonJS 导出，可以直接 `require` 使用，无需 `.default`。

### TypeScript 使用

如果使用 TypeScript 编写 webpack 配置，可以使用 ES Module 导入：

```typescript
import { Configuration } from 'webpack';
import { container } from 'webpack';
import webpackNowPlugin, { NowPluginEnv } from '@xbot/webpack-plugin-now';

const { ModuleFederationPlugin } = container;

const config: Configuration = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'my_app',
      remotes: webpackNowPlugin({
        components: ['devicemanage'],
        env: 'test' as NowPluginEnv,
      }),
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true },
      },
    }),
  ],
};

export default config;
```

或者使用 CommonJS 方式（与 JavaScript 配置相同）：

```typescript
import { Configuration } from 'webpack';
import { container } from 'webpack';
const webpackNowPlugin = require('@xbot/webpack-plugin-now');
import type { NowPluginEnv } from '@xbot/webpack-plugin-now';

const { ModuleFederationPlugin } = container;

const config: Configuration = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'my_app',
      remotes: webpackNowPlugin({
        components: ['devicemanage'],
        env: 'test' as NowPluginEnv,
      }),
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true },
      },
    }),
  ],
};

export default config;
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
- **注意**: 如果在运行时设置了 `process.env.MF_ENV` 环境变量，会优先使用环境变量的值

### `configApiUrl`

- **类型**: `string`
- **可选**: 是
- **说明**: 自定义配置 API URL，覆盖默认的环境配置

### `rdcBaseUrl`

- **类型**: `string`
- **可选**: 是
- **说明**: 自定义 RDC 基础 URL，覆盖默认的环境配置

## 工作原理

该插件会为每个组件生成一个 Promise 字符串，这个 Promise 会：

1. **请求版本号接口**：从配置的 API 获取组件版本号
2. **动态加载脚本**：根据版本号动态创建 script 标签加载对应版本的 `remoteEntry.js`
3. **初始化模块**：检查全局变量并返回包含 `get` 和 `init` 方法的模块对象，符合 Webpack Module Federation 规范

生成的 remotes 配置可以直接用于 `ModuleFederationPlugin`，无需手动编写复杂的 Promise 逻辑。

### 环境变量支持

插件支持通过 `process.env.MF_ENV` 环境变量动态覆盖配置的环境：

```javascript
// 在运行时，如果设置了 process.env.MF_ENV，会优先使用环境变量的值
// 例如：process.env.MF_ENV = 'production'
// 即使配置中 env: 'test'，实际也会使用 'production' 环境
```

## 示例

### 基本使用

```javascript
const remotes = webpackNowPlugin({
  components: ['devicemanage'],
  env: 'test'
});
```

### 多个组件

```javascript
const remotes = webpackNowPlugin({
  components: ['devicemanage', 'usercenter', 'dashboard'],
  env: 'production'
});
```

### 自定义配置

```javascript
const remotes = webpackNowPlugin({
  components: ['devicemanage'],
  env: 'test',
  configApiUrl: 'https://custom-api.com/config',
  rdcBaseUrl: 'https://custom-cdn.com/rdc'
});
```

### 根据环境变量动态配置

```javascript
const mode = process.env.NODE_ENV || 'development';
const env = mode === 'production' ? 'production' : 'test';

const remotes = webpackNowPlugin({
  components: ['devicemanage'],
  env: env
});
```

## 常见问题

### Q: 为什么可以直接 require，不需要 `.default`？

A: 插件在源码中同时使用了 `export default` 和 `module.exports`，TypeScript 编译时会保留 `module.exports`，因此可以直接使用 CommonJS 的 `require` 方式。

### Q: 如何在不同环境使用不同的配置？

A: 可以通过 `env` 参数指定环境，或者设置 `process.env.MF_ENV` 环境变量。插件会优先使用环境变量的值。

### Q: 生成的 Promise 字符串在哪里执行？

A: 生成的 Promise 字符串会在浏览器运行时执行，用于动态加载远程组件的 `remoteEntry.js` 文件。

