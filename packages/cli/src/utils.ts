import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

interface AppProjectConfig {
  name: string;
  isQiankun: boolean;
  port?: number;
}

export function copyAndReplaceFiles(templatePath: string, projectPath: string, config: AppProjectConfig) {
  const files = {
    'package.json': (content: string) => {
      const pkg = JSON.parse(content);
      pkg.name = config.name;
      pkg.devDependencies = {
        ...pkg.devDependencies,
        "@types/node": "^20.11.24",
        "@types/react": "^18.2.61",
        "@types/react-dom": "^18.2.19",
        "@vitejs/plugin-react": "^4.2.1",
        "autoprefixer": "^10.4.17",
        "postcss": "^8.4.35",
        "tailwindcss": "^3.4.1",
        "typescript": "^5.3.3",
        "vite": "^5.1.4"
      };
      pkg.dependencies = {
        ...pkg.dependencies,
        "react": "^18.3.1",
        "react-dom": "^18.3.1",
        "react-router-dom": "^6.22.2"
      };
      if (config.isQiankun) {
        pkg.devDependencies = {
          ...pkg.devDependencies,
          "vite-plugin-qiankun": "^1.0.15",
          "@originjs/vite-plugin-federation": "^1.3.5"
        };
      }
      return JSON.stringify(pkg, null, 2);
    },
    'vite.config.ts': (content: string) =>
      content
        .replace('build/template', `build/${config.name}`)
        .replace("PUBLIC_PATH + '/template'", `PUBLIC_PATH + '/${config.name}'`)
        .replace("qiankun('template'", `qiankun('${config.name}'`)
        .replace("name: 'template'", `name: '${config.name}'`)
        .replace('port: 3000', `port: ${config.port || 3000}`),
    'src/App.tsx': (content: string) =>
      content
        .replace(/\/template\/a/g, `/${config.name}/a`)
        .replace(/\/template\/b/g, `/${config.name}/b`)
        .replace(/\/template(['"])/g, `/${config.name}$1`)
        .replace(/Template App/g, `${config.name.charAt(0).toUpperCase() + config.name.slice(1)} App`),
    'index.html': (content: string) => content.replace(/template/g, config.name),
    'src/Button.tsx': (content: string) => {
      return content
        .replace(/\${PROJECT_NAME}/g, config.name);
    }
  };

  // 复制文件
  copyDirectory(templatePath, projectPath, files);
}

function copyDirectory(src: string, dest: string, fileTransformers: Record<string, (content: string) => string> = {}) {
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