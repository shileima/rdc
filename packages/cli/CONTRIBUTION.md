# 贡献指南

感谢您对 `@xbot/now` CLI 工具的关注！本文档将指导您如何为项目做出贡献，包括开发新功能、修复问题或改进文档。

## 目录

- [项目结构](#项目结构)
- [开发环境设置](#开发环境设置)
- [开发流程](#开发流程)
- [添加新功能](#添加新功能)
- [模板系统](#模板系统)
- [测试](#测试)
- [提交代码](#提交代码)
- [发布](#发布)

## 项目结构

```
libs/cli/
├── bin/                # CLI 入口文件
│   └── now.js          # 可执行文件
├── src/                # 源代码
│   ├── index.ts        # 主入口文件
│   ├── createAppProject.ts  # 创建应用项目逻辑
│   ├── createRdcProject.ts  # 创建 RDC 组件逻辑
│   ├── utils.ts        # 通用工具函数
│   └── rdcUtils.ts     # RDC 相关工具函数
├── templates/          # 项目模板
│   ├── app/            # 应用项目模板
│   └── rdc/            # RDC 组件模板
│       ├── vite/       # Vite 构建的 RDC 模板
│       └── webpack/    # Webpack 构建的 RDC 模板
├── dist/               # 编译后的代码
├── package.json        # 项目配置
└── tsconfig.json       # TypeScript 配置
```

## 开发环境设置

1. 克隆仓库：

```bash
git clone ssh://git@git.sankuai.com/waimqa/waimai-qa-aie-fe.git
cd waimai-qa-aie-fe
```

2. 安装依赖：

```bash
pnpm install
```

3. 构建项目：

```bash
cd libs/cli
pnpm build
```

4. 本地链接（可选）：

```bash
pnpm link --global
```

## 开发流程

1. 创建新分支：

```bash
git checkout -b feature/your-feature-name
```

2. 启动开发模式：

```bash
pnpm dev
```

这将启动 TypeScript 的监视模式，当您修改源代码时自动重新编译。

3. 测试您的更改：

```bash
# 在 libs/cli 目录下
now create  # 然后选择 "App (React + Vite)" 或 "RDC Component (React Component Library)"
```

## 添加新功能

### 添加新的项目类型

1. 在 `src/index.ts` 中添加新的项目类型选项：

```typescript
const { projectType } = await inquirer.prompt([
  {
    type: 'list',
    name: 'projectType',
    message: 'What type of project do you want to create?',
    choices: [
      { name: 'App (React + Vite)', value: 'app' },
      { name: 'RDC Component (React Component Library)', value: 'rdc' },
      { name: 'Your New Project Type', value: 'new-type' }  // 添加新选项
    ]
  }
]);

if (projectType === 'app') {
  await createAppProject();
} else if (projectType === 'rdc') {
  await createRdcProject();
} else if (projectType === 'new-type') {
  await createNewTypeProject();  // 调用新函数
}
```

2. 创建新的项目创建函数，例如 `src/createNewTypeProject.ts`：

```typescript
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { copyAndReplaceFiles } from './utils';

interface NewTypeProjectConfig {
  name: string;
  // 其他配置项
}

export async function createNewTypeProject() {
  const config = await getNewTypeProjectConfig();
  
  // 确保目录存在
  const projectDir = path.join(process.cwd(), 'your-directory');
  if (!fs.existsSync(projectDir)) {
    console.log(chalk.cyan('Creating directory...'));
    fs.mkdirSync(projectDir, { recursive: true });
  }
  
  const projectPath = path.join(projectDir, config.name);

  if (fs.existsSync(projectPath)) {
    console.error(chalk.red(`Error: Project ${config.name} already exists!`));
    process.exit(1);
  }

  // 创建项目目录结构
  createDirectoryStructure(projectPath);

  // 复制模板文件
  const templatePath = path.join(__dirname, '..', 'templates', 'new-type');
  copyAndReplaceFiles(templatePath, projectPath, config);

  console.log(chalk.green(`\n${config.name} project created successfully!`));
  
  // 提供后续步骤
  console.log(chalk.cyan('\nTo get started:'));
  console.log(chalk.yellow(`cd your-directory/${config.name}`));
  console.log(chalk.yellow('pnpm install'));
  console.log(chalk.yellow('pnpm dev'));
}

async function getNewTypeProjectConfig(): Promise<NewTypeProjectConfig> {
  // 实现配置收集逻辑
  const { name } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Project name:',
      validate: (input: string) => {
        // 验证逻辑
        return true;
      }
    }
  ]);

  return { name };
}

function createDirectoryStructure(projectPath: string) {
  // 实现目录创建逻辑
}
```

3. 创建新的模板目录 `templates/new-type/`，包含所有必要的模板文件。

### 修改现有功能

1. 找到相关文件（如 `src/createAppProject.ts` 或 `src/createRdcProject.ts`）
2. 修改代码以实现新功能
3. 测试您的更改

## 模板系统

模板系统是 CLI 工具的核心部分，它决定了生成的项目结构和配置。

### 模板结构

每个模板应包含以下基本文件：

- `package.json` - 项目依赖和脚本
- `tsconfig.json` - TypeScript 配置
- 源代码目录（如 `src/`）
- 构建配置文件（如 `vite.config.ts` 或 `webpack.config.js`）

### 模板变量替换

在 `utils.ts` 中的 `copyAndReplaceFiles` 函数负责复制模板文件并替换变量：

```typescript
export function copyAndReplaceFiles(templatePath: string, projectPath: string, config: any) {
  // 实现文件复制和变量替换逻辑
}
```

要添加新的变量替换，请修改此函数或创建新的替换函数。

## 测试

在提交代码前，请确保测试您的更改：

1. 构建项目：`pnpm build`
2. 测试创建应用：`now create`，然后选择 "App (React + Vite)"
3. 测试创建 RDC 组件：`now create`，然后选择 "RDC Component (React Component Library)"
4. 验证生成的项目是否可以正常运行

## 提交代码

1. 确保您的代码符合项目的代码风格
2. 提交您的更改：

```bash
git add .
git commit -m "feat: add new feature"
```

3. 推送到远程仓库：

```bash
git push origin feature/your-feature-name
```

4. 创建 Pull Request

## 发布

发布新版本需要以下步骤：

1. 更新 `package.json` 中的版本号
2. 构建项目：`pnpm build`
3. 发布到 npm：

```bash
npm publish
```

## 常见问题

### 如何添加新的依赖？

1. 在 `package.json` 中添加依赖
2. 运行 `pnpm install` 安装依赖
3. 如果依赖是 CLI 工具使用的，确保将其添加到 `dependencies` 中
4. 如果依赖仅用于开发，将其添加到 `devDependencies` 中

### 如何修改模板？

1. 找到相关模板目录（如 `templates/app/` 或 `templates/rdc/vite/`）
2. 修改模板文件
3. 测试您的更改

### 如何添加新的命令行选项？

1. 在 `src/index.ts` 中使用 Commander.js 添加新的命令或选项
2. 实现相应的处理函数
3. 测试您的更改

## 联系方式

如有任何问题或建议，请联系项目维护者：mashilei@meituan.com 