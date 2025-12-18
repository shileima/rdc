/**
 * @xbot/webpack-plugin-now
 * Webpack plugin for dynamic RDC component federation
 */

import type { NowPluginOptions, EnvType } from './types'
import { getEnvConfig } from './config'

// 导出类型（通过命名空间导出，避免与 export = 冲突）
export type { NowPluginEnv, NowPluginOptions } from './types'

/**
 * 生成单个组件的 Promise 字符串
 * 这个 Promise 会：
 * 1. 请求版本号接口获取版本
 * 2. 动态创建 script 标签加载 remoteEntry.js
 * 3. 检查全局变量并返回模块对象
 */
function createRemotePromiseString(
  componentName: string,
  configApiUrl: string,
  rdcBaseUrl: string,
  env: EnvType
): string {
  const remoteEntryPath = `qa-rdc-${componentName}/webpack/`
  
  // 生成 Promise 字符串，用于 webpack ModuleFederationPlugin 的 remotes 配置
  return `promise new Promise((resolve, reject) => {
    // 1. 请求版本号接口
    const mfEnv = (typeof process !== 'undefined' && process.env && process.env.MF_ENV) || '${env}';
    fetch('${configApiUrl}')
      .then(res => res.json())
      .then(data => {
        const version = data.value?.${componentName}?.[mfEnv];
        console.log('MF_ENV-->', mfEnv);
        console.log('version-->', version);
        
        // 检查版本号是否存在
        if (!version) {
          reject(new Error('Version not found in config for ${componentName}.' + mfEnv));
          return;
        }
        
        // 构造最终的 remoteEntry 地址
        const scriptUrl = '${rdcBaseUrl}/${remoteEntryPath}' + version + '/remoteEntry.js';
        console.log('Loading remoteEntry from:', scriptUrl);
        
        // 2. 动态创建 script 标签加载这个文件
        const script = document.createElement('script');
        script.src = scriptUrl;
        script.async = true;
        
        script.onload = () => {
          // 3. 脚本加载完后，检查全局变量是否存在
          // 远程应用暴露的全局变量名是 ${componentName}
          if (typeof window.${componentName} === 'undefined') {
            reject(new Error('Remote container ${componentName} not found after script load'));
            return;
          }
          
          // 下面是 Webpack 模块联邦的标准初始化代码
          const module = {
            get: (request) => {
              if (!window.${componentName} || !window.${componentName}.get) {
                throw new Error('Remote container ${componentName}.get is not available');
              }
              return window.${componentName}.get(request);
            },
            init: (shareScope) => {
              try {
                if (!window.${componentName} || !window.${componentName}.init) {
                  throw new Error('Remote container ${componentName}.init is not available');
                }
                // 确保共享作用域已准备好
                if (shareScope && typeof shareScope === 'object') {
                  return window.${componentName}.init(shareScope);
                }
                // 如果没有提供 shareScope，尝试使用默认的
                return window.${componentName}.init();
              } catch(e) {
                console.log('Remote container already initialized:', e);
                // 即使初始化失败，也继续，因为可能已经初始化过了
              }
            }
          };
          // 4. Resolve 这个 Promise，Webpack 就能拿到模块了
          resolve(module);
        };
        
        script.onerror = (error) => {
          reject(new Error('Failed to load remoteEntry.js: ' + scriptUrl));
        };
        
        document.head.appendChild(script);
      })
      .catch(err => {
        console.error('Failed to fetch version config:', err);
        reject(err);
      });
  })`
}

/**
 * 生成 remotes 配置
 */
function generateRemotes(options: NowPluginOptions): Record<string, string> {
  const env = options.env || 'test'
  const envConfig = getEnvConfig(env)
  
  const configApiUrl = options.configApiUrl || envConfig.configApiUrl
  const rdcBaseUrl = options.rdcBaseUrl || envConfig.rdcBaseUrl
  
  return options.components.reduce((acc, componentName) => {
    acc[componentName] = createRemotePromiseString(componentName, configApiUrl, rdcBaseUrl, env)
    return acc
  }, {} as Record<string, string>)
}

/**
 * Webpack Plugin Now - 动态生成 Module Federation remotes 配置
 * 
 * @param options 插件配置选项
 * @returns remotes 配置对象，可直接用于 ModuleFederationPlugin
 * 
 * @example
 * ```javascript
 * const { ModuleFederationPlugin } = require('webpack').container;
 * const webpackNowPlugin = require('@xbot/webpack-plugin-now');
 * 
 * new ModuleFederationPlugin({
 *   name: 'my_app',
 *   remotes: webpackNowPlugin({
 *     components: ['devicemanage'],
 *     env: 'test'
 *   }),
 * })
 * ```
 */
function webpackNowPlugin(options: NowPluginOptions): Record<string, string> {
  if (!options.components || options.components.length === 0) {
    throw new Error('[webpack-plugin-now] components 配置不能为空')
  }
  
  return generateRemotes(options)
}

// 导出默认函数（用于 ES Module）
export default webpackNowPlugin

// 直接导出为 module.exports（用于 CommonJS，TypeScript 会保留这行代码）
// @ts-ignore - TypeScript 会保留这行 CommonJS 代码
module.exports = webpackNowPlugin

