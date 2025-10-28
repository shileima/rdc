import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

// https://vitejs.dev/config/
export default defineConfig({
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
      },
      shared: ['react', 'react-dom'],
    })
  ],
  server: {
    port: 9090,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
