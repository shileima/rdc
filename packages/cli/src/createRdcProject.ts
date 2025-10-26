import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import { copyRdcFiles } from './rdcUtils';

interface RdcProjectConfig {
  name: string;
  templateType: 'vite' | 'webpack';
}

export async function createRdcProject() {
  const config = await getRdcProjectConfig();
  
  // 直接在当前目录创建项目
  const projectPath = path.join(process.cwd(), config.name);

  if (fs.existsSync(projectPath)) {
    console.error(chalk.red(`Error: Project ${config.name} already exists!`));
    process.exit(1);
  }

  console.log(chalk.cyan(`Creating ${config.name} project with ${config.templateType} template...`));

  // 复制模板文件
  const templatePath = path.join(__dirname, '..', 'templates', 'rdc', config.templateType);
  copyRdcFiles(templatePath, projectPath, config);

  console.log(chalk.green(`\n${config.name} project created successfully!`));
  console.log(chalk.cyan('\nInstalling dependencies...'));
  
  try {
    // 进入项目目录
    process.chdir(projectPath);
    console.log(chalk.cyan(`Current directory: ${process.cwd()}`));
    
    // 安装依赖
    console.log(chalk.yellow('Running pnpm install...'));
    execSync('pnpm install', { stdio: 'inherit' });
    
    console.log(chalk.green('Dependencies installed successfully!'));
    console.log(chalk.cyan('\nNext steps:'));
    console.log(chalk.yellow(`  cd ${config.name}`));
    console.log(chalk.yellow('  pnpm dev'));
    console.log(chalk.cyan('\nHappy coding! 🚀'));
    
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`Error: ${error.message}`));
    } else {
      console.error(chalk.red(`Error: ${String(error)}`));
    }
  }
}

async function getRdcProjectConfig(): Promise<RdcProjectConfig> {
  const { name } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'RDC component name:',
      validate: (input: string) => {
        if (!input) return 'Component name is required';
        if (!/^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(input)) {
          return 'Component name must follow npm package naming conventions';
        }
        if (input.length < 2) {
          return 'Component name must be at least 2 characters long';
        }
        if (input.length > 214) {
          return 'Component name must be less than 214 characters';
        }
        const reservedWords = ['node_modules', 'favicon.ico'];
        if (reservedWords.includes(input)) {
          return `Component name cannot be a reserved word: ${reservedWords.join(', ')}`;
        }
        return true;
      }
    }
  ]);

  // 注释掉模板类型选择，默认使用 Webpack
  // const { templateType } = await inquirer.prompt([
  //   {
  //     type: 'list',
  //     name: 'templateType',
  //     message: 'Select template type:',
  //     choices: [
  //       { name: 'Vite', value: 'vite' }, // 暂时不支持vite, 后续再添加
  //       { name: 'Webpack', value: 'webpack' }
  //     ]
  //   }
  // ]);

  return { name, templateType: 'webpack' };
}