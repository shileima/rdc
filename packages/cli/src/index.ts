#!/usr/bin/env node

import { Command } from 'commander';
import { createAppProject } from './createAppProject';
import { createRdcProject } from './createRdcProject';
import inquirer from 'inquirer';

const program = new Command();

program
  .name('now')
  .description('CLI tool for quickly creating React projects')
  .version('1.0.0');

program
  .command('create')
  .description('Create a new project')
  .action(async () => {
    try {
      const { projectType } = await inquirer.prompt([
        {
          type: 'list',
          name: 'projectType',
          message: 'What type of project do you want to create?',
          choices: [
            { name: 'App (React + Vite)', value: 'app' },
            { name: 'RDC Component (React Component Library)', value: 'rdc' }
          ]
        }
      ]);

      if (projectType === 'app') {
        await createAppProject();
      } else {
        await createRdcProject();
      }
    } catch (error) {
      console.error('Error creating project:', error);
      process.exit(1);
    }
  });

program.parse(); 