/**
 * Webpack Plugin Now 使用示例
 * 
 * 这个文件展示了如何在 webpack 配置中使用 @xbot/webpack-plugin-now
 */

const { ModuleFederationPlugin } = require('webpack').container;
const webpackNowPlugin = require('@xbot/webpack-plugin-now');

// 示例 1: 基本使用
const basicExample = {
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

// 示例 2: 多个组件
const multipleComponentsExample = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'my_app',
      remotes: webpackNowPlugin({
        components: ['devicemanage', 'usercenter', 'dashboard'],
        env: 'production'
      }),
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true },
      },
    }),
  ],
};

// 示例 3: 自定义配置
const customConfigExample = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'my_app',
      remotes: webpackNowPlugin({
        components: ['devicemanage'],
        env: 'test',
        configApiUrl: 'https://custom-api.com/config',
        rdcBaseUrl: 'https://custom-cdn.com/rdc'
      }),
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true },
      },
    }),
  ],
};

// 示例 4: 在 webpack 配置文件中使用（根据环境变量）
const mode = process.env.NODE_ENV || 'development';
const env = mode === 'production' ? 'production' : 'test';

const envBasedExample = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'my_app',
      remotes: webpackNowPlugin({
        components: ['devicemanage'],
        env: env
      }),
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true },
      },
    }),
  ],
};

module.exports = {
  basicExample,
  multipleComponentsExample,
  customConfigExample,
  envBasedExample
};

