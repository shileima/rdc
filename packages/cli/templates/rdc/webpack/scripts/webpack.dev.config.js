const { merge } = require('webpack-merge');
const commonConfig = require('../config/webpack.common.js');
const path = require('path');
const webpack = require('webpack');
const fs = require('fs');

// 读取package.json
const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8'));
const { ModuleFederationPlugin } = webpack.container;

const devConfig = {
  mode: 'development',
  devtool: 'eval-source-map',
  plugins: [
    new ModuleFederationPlugin({
      name: 'template_webpack',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/bootstrap.tsx',
      },
      // 示例：配置远程组件（开发环境可以使用本地或其他远程地址）
      // remotes: {
      //   remoteComponent: `remoteComponent@http://localhost:3001/remoteEntry.js`,
      // },
      shared: {
        react: {
          singleton: true,
          requiredVersion: packageJson.dependencies.react,
          eager: true,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: packageJson.dependencies['react-dom'],
          eager: true,
        },
      },
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, '../public'),
    },
    hot: true,
    port: 3000,
    open: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
};

module.exports = merge(commonConfig, devConfig);
