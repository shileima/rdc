const { merge } = require('webpack-merge');
const commonConfig = require('../config/webpack.common.js');
const path = require('path');

const devConfig = {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, '../public'),
    },
    hot: true,
    port: 3000,
    open: true,
  },
};

module.exports = merge(commonConfig, devConfig);
