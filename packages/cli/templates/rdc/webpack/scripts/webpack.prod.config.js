const { merge } = require('webpack-merge');
const commonConfig = require('../config/webpack.common.js');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const webpack = require('webpack');
const fs = require('fs');

// 读取package.json
const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8'));
const { name: projectName, version } = packageJson;

const { ModuleFederationPlugin } = webpack.container;

// 环境配置
const ENV = process.env.NODE_ENV || 'production';
console.log('ENV: ', ENV);
// const envConfig = {
//   test: {
//     publicPath: '//test-cdn.com/common/template-webpack/webpack/',
//     appKey: 'your.test.appkey',
//   },
//   staging: {
//     publicPath: '//staging-cdn.com/common/template-webpack/webpack/',
//     appKey: 'your.staging.appkey',
//   },
//   production: {
//     publicPath: '//prod-cdn.com/common/template-webpack/webpack/',
//     appKey: 'your.prod.appkey',
//   },
// }[ENV];

const prodConfig = {
  mode: 'production',
  output: {
    path: path.resolve(__dirname, `../dist/rdc/${projectName}/webpack/${version}`),
    filename: '[name].[contenthash].js',
    clean: true,
    // publicPath: `${envConfig.publicPath}${version}/`,
    publicPath: 'auto',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: ['tailwindcss', 'autoprefixer'],
              },
            },
          },
        ],
      },
    ],
  },
  optimization: {
    minimizer: ['...', new CssMinimizerPlugin()],
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          type: 'css/mini-extract',
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(ENV),
    }),
    new ModuleFederationPlugin({
      name: 'template_webpack',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/bootstrap.tsx',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: packageJson.dependencies.react,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: packageJson.dependencies['react-dom'],
        },
        antd: {
          singleton: true,
          requiredVersion: packageJson.devDependencies.antd,
        },
      },
    }),
    new MiniCssExtractPlugin({
      filename: 'styles/[name].[contenthash].css',
    }),
  ],
};

module.exports = merge(commonConfig, prodConfig);
