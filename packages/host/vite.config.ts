import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

const publicPath = process.env.NODE_ENV === 'development' ? '/' : process.env.PUBLIC_PATH;

// https://vitejs.dev/config/
export default defineConfig({
  base: publicPath,
  plugins: [
    react(),
    federation({
      name: 'rdc_component',
      remotes: {
        rdc_test_1: {
          external: `fetch('https://automan.waimai.test.sankuai.com/nodeapi/lionConfig?key=test').then((res) => res.json()).then((res) => {
            const host = window.location.origin;
            const remoteEntry = 'https://aie.waimai.test.sankuai.com/rdc_host/rdc/qa-rdc-rdc_test_1/webpack/' + res.value?.rdc_test_1.test + '/remoteEntry.js';
            return remoteEntry;
          })`,
          externalType: 'promise',
          format: 'var',
          from: 'webpack',
        },
        rdc_test_form: {
          external: `fetch('https://automan.waimai.test.sankuai.com/nodeapi/lionConfig?key=test').then((res) => res.json()).then((res) => {
            const host = window.location.origin;
            const remoteEntry = 'https://aie.waimai.test.sankuai.com/rdc_host/rdc/qa-rdc-rdc_test_form/webpack/' + res.value?.rdc_test_form.test + '/remoteEntry.js';
            return remoteEntry;
          })`,
          externalType: 'promise',
          format: 'var',
          from: 'webpack',
        },
        rdc_test_table: {
          external: `fetch('https://automan.waimai.test.sankuai.com/nodeapi/lionConfig?key=test').then((res) => res.json()).then((res) => {
            const host = window.location.origin;
            const remoteEntry = 'https://aie.waimai.test.sankuai.com/rdc_host/rdc/qa-rdc-rdc_test_table/webpack/' + res.value?.rdc_test_table.test + '/remoteEntry.js';
            return remoteEntry;
          })`,
          externalType: 'promise',
          format: 'var',
          from: 'webpack',
        },
        rdc_test_editor: {
          external: `fetch('https://automan.waimai.test.sankuai.com/nodeapi/lionConfig?key=test').then((res) => res.json()).then((res) => {
            const host = window.location.origin;
            const remoteEntry = 'https://aie.waimai.test.sankuai.com/rdc_host/rdc/qa-rdc-rdc_test_editor/webpack/' + res.value?.rdc_test_editor.test + '/remoteEntry.js';
            return remoteEntry;
          })`,
          externalType: 'promise',
          format: 'var',
          from: 'webpack',
        },
      },
      shared: {
        react: {
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
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'esnext'
  }
})
