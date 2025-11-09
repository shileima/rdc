# @xbot/vite-plugin-now

Vite 插件，用于动态生成 Module Federation 的 remotes 配置，简化 RDC 组件的接入。

## 安装

```bash
pnpm add @xbot/vite-plugin-now
```

## 使用

在 `vite.config.ts` 中使用：

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import nowPlugin from '@xbot/vite-plugin-now'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'rdc_component',
      remotes: nowPlugin({
        components: ['rdc_test_1', 'rdc_test_form', 'rdc_test_table', 'rdc_test_editor'],
        env: 'test',
      }),
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    })
  ],
})
```

## 配置选项

### `components`

- **类型**: `string[]`
- **必填**: 是
- **说明**: RDC 组件名称列表

### `env`

- **类型**: `'dev' | 'test' | 'staging' | 'prod'`
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

## License

MIT
