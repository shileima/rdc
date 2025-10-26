import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import pkg from './package.json';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  console.log(env);
  return {
    base:
      process.env.NODE_ENV === 'development'
        ? './'
        : `${env.VITE_APP_AUTOMAN_HOST}/rdc_host/rdc/${pkg.name}/vite/${pkg.version}/`,
    plugins: [
      react(),
      federation({
        name: pkg.name,
        filename: 'remoteEntry.js',
        exposes: {
          './App': './src/App.tsx',
        },
        shared: {
          react: {
            // @ts-ignore
            singleton: true,
            eager: true,
          },
          'react-dom': {
            // @ts-ignore
            singleton: true,
            eager: true,
          },
          lodash: {
            // @ts-ignore
            singleton: true,
            eager: true,
          },
          'react-router-dom': {
            // @ts-ignore
            singleton: true,
            eager: true,
          },
        },
      }),
    ],
    css: {
      modules: {
        //
      },
      preprocessorOptions: {
        postcss: {
          plugins: [tailwindcss, autoprefixer],
        },
        less: {
          javascriptEnabled: true,
        },
      },
    },
    build: {
      outDir: `dist/rdc/${pkg.name}/vite/${pkg.version}`,
      target: 'esnext',
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            // @ts-ignore
            if (assetInfo.name?.endsWith('.css')) {
              return assetInfo.name;
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
    },
    esbuild: {
      supported: {
        'top-level-await': true,
      },
    },
    server: {
      open: true,
    },
  };
});
