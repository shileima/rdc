import { defineConfig } from 'vite';
import qiankun from 'vite-plugin-qiankun';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import path from 'path';

const useDevMode = process.env.NODE_ENV === 'development';
const PUBLIC_PATH = process.env.PUBLIC_PATH;

export default defineConfig({
  base: PUBLIC_PATH ? PUBLIC_PATH + '/template' : '/',
  plugins: [
    !useDevMode && react(),
    qiankun('template', {
      useDevMode,
    }),
    federation({
      name: 'template',
      remotes: {
        // 如果需要远程模块，可以在这里配置
      },
      shared: ['react', 'react-dom', 'react-router-dom'],
    }),
  ],
  server: {
    port: 3000,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  build: {
    outDir: 'build/template',
    target: 'esnext',
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
