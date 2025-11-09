import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import nowPlugin from '@xbot/vite-plugin-now'

const publicPath = process.env.NODE_ENV === 'development' ? '/' : process.env.PUBLIC_PATH;

// https://vitejs.dev/config/
export default defineConfig({
  base: publicPath,
  plugins: [
    react(),
    federation({
      name: 'rdc_component',
      // @ts-expect-error - federation plugin 的 Remotes 类型定义不完整，实际支持 Record 类型
      remotes: nowPlugin({
        components: ['rdc_test_1', 'rdc_test_form', 'rdc_test_table', 'rdc_test_editor'],
        env: 'test',
      }),
      shared: {
        react: {
          // @ts-ignore
          singleton: true,
          requiredVersion: '^18.3.1',
          eager: false,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.3.1',
          eager: false,
        },
      },
    })
  ],
  server: {
    port: 9090,
    host: true,
    open: true,
    proxy: {
      '/nodeapi': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'esnext'
  }
})
