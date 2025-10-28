import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

interface RdcProjectConfig {
  name: string;
  templateType: 'vite' | 'webpack';
}

export function copyRdcFiles(templatePath: string, projectPath: string, config: RdcProjectConfig) {
  const files = {
    'package.json': (content: string) => {
      const pkg = JSON.parse(content);
      pkg.name = `qa-rdc-${config.name}`;
      
      // 根据模板类型设置不同的脚本
      if (config.templateType === 'webpack') {
        pkg.scripts = {
          ...pkg.scripts,
          'dev': 'cross-env NODE_ENV=development npx webpack serve --config scripts/webpack.dev.config.js',
          'build:test': 'cross-env NODE_ENV=test npx webpack --config scripts/webpack.prod.config.js',
          'build:staging': 'cross-env NODE_ENV=staging npx webpack --config scripts/webpack.prod.config.js',
          'build:prod': 'cross-env NODE_ENV=production npx webpack --config scripts/webpack.prod.config.js',
          'deploy:test': `pnpm build:test && webstatic publish --appkey=com.sankuai.waimaiqafc.aie --env=test --artifact=dist --build-command='pnpm build:test' --token=269883ad-b7b0-4431-b5e7-5886cd1d590f`,
          'deploy:staging': `pnpm build:staging && webstatic publish --appkey=com.sankuai.waimaiqafc.aie.fe --env=staging --artifact=dist --build-command='pnpm build:staging' --token=98f9aed6-a075-461f-b6da-7ca4598c3829`,
          'deploy:prod': `pnpm build:prod && webstatic publish --appkey=com.sankuai.waimaiqafc.aie.fe --env=prod --artifact=dist --build-command='pnpm build:prod' --token=98f9aed6-a075-461f-b6da-7ca4598c3829`,
        };
        // 保留原有依赖，并添加新的依赖
        pkg.dependencies = {
          ...pkg.dependencies,
          "@ant-design/icons": "^5.5.2",
          "react": "^18.3.1",
          "react-dom": "^18.3.1"
        };
        pkg.devDependencies = {
          ...pkg.devDependencies,
          "@babel/core": "^7.23.9",
          "@babel/preset-env": "^7.23.9",
          "@babel/preset-react": "^7.23.3",
          "@babel/preset-typescript": "^7.23.3",
          "@types/react": "^18.3.12",
          "@types/react-dom": "^18.3.1",
          "antd": "5.22.2",
          "autoprefixer": "^10.4.20",
          "babel-loader": "^9.1.3",
          "cross-env": "^7.0.3",
          "css-loader": "^6.10.0",
          "css-minimizer-webpack-plugin": "^7.0.2",
          "html-webpack-plugin": "^5.6.0",
          "mini-css-extract-plugin": "^2.9.2",
          "postcss": "^8.4.47",
          "postcss-loader": "^8.1.0",
          "style-loader": "^3.3.4",
          "tailwindcss": "^3.4.1",
          "typescript": "5.7.2",
          "webpack": "^5.90.3",
          "webpack-cli": "^5.1.4",
          "webpack-dev-server": "^5.0.2",
          "webpack-merge": "^6.0.1"
        };
      }
      
      return JSON.stringify(pkg, null, 2);
    },
    'index.ts': (content: string) => {
      return content.replace(/from\s+['"](\.\/)?src\/demo['"]/g, `from '@${config.name}/demo'`);
    },
    'webpack.prod.config.js': (content: string) => {
      return content
        .replace('template_webpack', config.name.replace(/-/g, '_'))
        .replace('template-webpack', config.name);
    },
    'src/Button.tsx': (content: string) => {
      // 替换硬编码的路径，使用项目名称动态生成
      return content
        .replace(/rdc\/test\/src\/Button\.tsx/g, `rdc/${config.name}/src/Button.tsx`)
        .replace(/rdc\/test\/src\/App\.tsx/g, `rdc/${config.name}/src/App.tsx`);
    }
  };

  // 复制文件
  copyDirectory(templatePath, projectPath, files);
}

function copyDirectory(src: string, dest: string, fileTransformers: Record<string, (content: string) => string>) {
  if (!fs.existsSync(src)) {
    console.log(chalk.yellow(`Warning: Source directory ${src} does not exist, skipping`));
    return;
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath, fileTransformers);
    } else {
      if (fileTransformers[entry.name]) {
        const content = fs.readFileSync(srcPath, 'utf8');
        fs.writeFileSync(destPath, fileTransformers[entry.name](content));
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
} 