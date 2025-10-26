import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import { copyAndReplaceFiles } from './utils';

interface AppProjectConfig {
  name: string;
  isQiankun: boolean;
  port?: number;
  location: 'packages' | 'singleton' | '';
}

// 获取已使用的端口号和对应的项目信息
function getUsedPorts() {
  const mainPath = path.join(process.cwd(), 'main');
  const envDevPath = path.join(mainPath, '.env.development');
  const usedPorts = new Set<string>();
  const portProjects = new Map<string, string>(); // 存储端口号和项目名称的映射

  if (fs.existsSync(envDevPath)) {
    const envContent = fs.readFileSync(envDevPath, 'utf8');
    // 匹配所有 VITE_APP_SUB_ 开头的环境变量
    const lines = envContent.split('\n');

    for (const line of lines) {
      // 跳过空行和注释
      if (!line.trim() || line.trim().startsWith('#')) {
        continue;
      }

      const match = line.match(/VITE_APP_SUB_(.+?)=(\/\/|http:\/\/|https:\/\/)?localhost:(\d+)/);
      if (match) {
        const [, projectKey, , port] = match;
        const projectName = projectKey.toLowerCase().replace(/_/g, '-');
        usedPorts.add(port);
        portProjects.set(port, projectName);
      }
    }
  }

  return { usedPorts, portProjects };
}

// 显示端口使用情况
function showPortUsage(portProjects: Map<string, string>) {
  if (portProjects.size === 0) {
    console.log(chalk.yellow('\n当前没有子工程配置端口号'));
    return;
  }

  console.log(chalk.yellow('\n当前端口使用情况：'));
  console.log(chalk.yellow('-------------------'));
  for (const [port, project] of portProjects.entries()) {
    console.log(chalk.yellow(`端口: ${port.padEnd(5)} -> 项目: ${project}`));
  }
  console.log(chalk.yellow('-------------------\n'));
}

// 验证端口号
function isValidPort(port: string, usedPorts: Set<string>): boolean {
  const portNum = parseInt(port, 10);
  // 放宽端口号长度限制，只要是有效的端口号即可
  return (
    !isNaN(portNum) &&
    portNum >= 1024 && // 避免使用系统保留端口
    portNum <= 65535 && // 最大有效端口号
    !usedPorts.has(port.toString())
  );
}

// 自动生成端口号
function generatePort(usedPorts: Set<string>): number {
  // 找出所有以1开头的已使用端口
  const oneThousandPorts = Array.from(usedPorts)
    .map(port => parseInt(port, 10))
    .filter(port => port >= 1000 && port < 2000);
  
  // 如果没有以1开头的端口，从1025开始
  if (oneThousandPorts.length === 0) {
    return 1025;
  }
  
  // 找出最大的以1开头的端口
  const maxPort = Math.max(...oneThousandPorts);
  
  // 加5作为新端口
  const newPort = maxPort + 5;
  
  // 确保新端口不超过65535
  return newPort > 65535 ? 1025 : newPort;
}

// 获取已使用的项目信息
function getExistingProjects() {
  const mainPath = path.join(process.cwd(), 'main');
  const envDevPath = path.join(mainPath, '.env.development');
  const projects = new Map(); // 存储项目名称和端口号的映射

  if (fs.existsSync(envDevPath)) {
    const envContent = fs.readFileSync(envDevPath, 'utf8');
    const lines = envContent.split('\n');

    for (const line of lines) {
      if (!line.trim() || line.trim().startsWith('#')) {
        continue;
      }

      const match = line.match(/VITE_APP_SUB_(.+?)=(\/\/|http:\/\/|https:\/\/)?localhost:(\d+)/);
      if (match) {
        const [, projectKey, , port] = match;
        const projectName = projectKey.toLowerCase().replace(/_/g, '-');
        projects.set(projectName, port);
      }
    }
  }

  return projects;
}

// 显示项目使用情况
function showProjectUsage(projectName: string, projects: Map<string, string>): boolean {
  const normalizedName = projectName.toLowerCase().replace(/[_-]/g, '');
  const conflictProjects = new Map();

  for (const [existingName, port] of projects.entries()) {
    const normalizedExisting = existingName.toLowerCase().replace(/[_-]/g, '');
    if (normalizedExisting === normalizedName) {
      conflictProjects.set(existingName, port);
    }
  }

  if (conflictProjects.size > 0) {
    console.log(chalk.red('\n检测到同名项目：'));
    console.log(chalk.red('-------------------'));
    for (const [name, port] of conflictProjects.entries()) {
      console.log(chalk.red(`项目名: ${name.padEnd(20)} -> 端口: ${port}`));
    }
    console.log(chalk.red('-------------------\n'));
    return true;
  }
  return false;
}

// 验证项目名称格式
function isValidProjectName(name: string): boolean {
  // 只允许小写字母、数字和连字符，必须以字母开头，不能以连字符结尾
  const nameRegex = /^[a-z][a-z0-9-]*[a-z0-9]$/;
  return nameRegex.test(name);
}

// 创建目录结构
function createDirectoryStructure(projectPath: string) {
  const directories = ['', 'src', 'src/pages', 'public'];

  directories.forEach((dir) => {
    const fullPath = path.join(projectPath, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
}

// 更新主应用的配置
function updateMainConfig(projectName: string, port: number) {
  const mainPath = path.join(process.cwd(), 'main');
  const envVarName = projectName.replace(/-/g, '_').toUpperCase();

  // 更新 .env.development
  const envDevPath = path.join(mainPath, '.env.development');
  if (fs.existsSync(envDevPath)) {
    const envContent = fs.readFileSync(envDevPath, 'utf8');
    // 确保最后一行不是空行，如果是则移除
    const trimmedContent = envContent.trimEnd();
    const newEnvContent = trimmedContent + `\nVITE_APP_SUB_${envVarName}=http://localhost:${port}`;
    fs.writeFileSync(envDevPath, newEnvContent);
  }

  // 更新 apps.js
  const appsPath = path.join(mainPath, 'src', 'apps.js');
  if (fs.existsSync(appsPath)) {
    const appsContent = fs.readFileSync(appsPath, 'utf8');
    const newApp = `  {
    name: '${projectName}',
    entry: import.meta.env.VITE_APP_SUB_${envVarName},
    activeRule: '/${projectName}'
  },`;

    // 在最后一个应用后插入新应用
    const insertIndex = appsContent.lastIndexOf(']');
    const newAppsContent =
      appsContent.slice(0, insertIndex).trimEnd() + '\n' + newApp + '\n]' + appsContent.slice(insertIndex + 1);

    fs.writeFileSync(appsPath, newAppsContent);
  }
}

export async function createAppProject() {
  const config = await getAppProjectConfig();
  
  // 直接在当前目录创建项目
  const projectPath = path.join(process.cwd(), config.name);

  if (fs.existsSync(projectPath)) {
    console.error(chalk.red('Error: Project already exists'));
    process.exit(1);
  }

  // 创建项目目录
  createDirectoryStructure(projectPath);

  // 复制模板文件
  const templatePath = path.join(__dirname, '..', 'templates', 'rdc', 'webpack');
  copyAndReplaceFiles(templatePath, projectPath, config);

  // 如果是乾坤子应用，更新主应用配置
  if (config.isQiankun && config.port) {
    updateMainConfig(config.name, config.port);
  }

  console.log(chalk.green('\nProject created successfully!'));
  console.log(chalk.cyan('\nTo get started:'));
  console.log(chalk.yellow(`cd ${config.name}`));
  console.log(chalk.yellow('pnpm install'));
  console.log(chalk.yellow('pnpm webpack:dev'));

  if (config.isQiankun) {
    console.log(chalk.cyan('\n提示：该项目已配置为乾坤子应用，并已更新主应用配置。'));
    console.log(chalk.cyan('请确保主应用正在运行，然后访问：'));
    console.log(chalk.green(`http://localhost:8000/${config.name}`));
  }
}

async function getAppProjectConfig(): Promise<AppProjectConfig> {
  const { name } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Project name:',
      default: 'app',
      validate: (input: string) => {
        if (!input) return 'Project name is required';
        if (!isValidProjectName(input)) {
          return 'Project name must start with a letter and can only contain lowercase letters, numbers, and hyphens';
        }
        return true;
      }
    }
  ]);

  // 检查项目名称是否已存在
  const existingProjects = getExistingProjects();
  if (showProjectUsage(name, existingProjects)) {
    console.log(chalk.red('Error: Project name already exists (ignoring case and special characters), please enter a new name'));
    return getAppProjectConfig();
  }

  const { isQiankun } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'isQiankun',
      message: 'Do you want to integrate with Qiankun?',
      default: false
    }
  ]);

  // 不再需要 location 参数，因为项目直接创建在当前目录
  const location = '';

  let port: number | undefined;
  if (isQiankun) {
    const { usedPorts, portProjects } = getUsedPorts();
    showPortUsage(portProjects);

    // 自动生成端口号
    port = generatePort(usedPorts);
    console.log(chalk.green(`\n已自动分配端口号: ${port}`));
  }

  return { name, isQiankun, port, location };
} 