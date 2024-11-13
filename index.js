#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const prompts = require('prompts');
const deployContracts = require('./deploy');
const runPackageManager = require('./pm'); // Import the package manager function
const { version } = require('./package.json');
const { execSync } = require('child_process');

// Check for latest version
const checkForLatestVersion = async () => {
  const packageName = 'oathstone';
  try {
    const latestVersion = await import('latest-version');
    const latest = await latestVersion.default(packageName);

    if (latest !== version) {
      console.log(`\nA new version of ${packageName} is available!`);
      console.log(`You are using version ${version}, but version ${latest} is being installed.`);
      try {
        console.log(`\nUpdating ${packageName} to the latest version...`);
        execSync(`npm install -g ${packageName}`, { stdio: 'inherit' });
        console.log(`\nSuccessfully updated to version ${latest}! Restarting the tool...\n`);
        execSync(`oathstone`, { stdio: 'inherit' });
        process.exit();
      } catch (error) {
        console.error('Failed to update the CLI tool:', error.message);
        process.exit(1);
      }
    } else {
      console.log(`\nYou are using the latest version of ${packageName} (${version}).`);
    }
  } catch (error) {
    console.error('Error checking for the latest version:', error);
  }
};

// Display welcome message and prompt for action
const displayWelcomeMessage = async () => {
  console.log("\nWelcome To");

  console.log(`
    /$$$$$$   /$$$$$$  /$$$$$$$$ /$$   /$$        /$$$$$$  /$$$$$$$$  /$$$$$$  /$$   /$$ /$$$$$$$$
   /$$__  $$ /$$__  $$|__  $$__/| $$  | $$       /$$__  $$|__  $$__/ /$$__  $$| $$$ | $$| $$_____/
  | $$  \\ $$| $$  \\ $$   | $$   | $$  | $$      | $$  \\__/   | $$   | $$  \\ $$| $$$$| $$| $$      
  | $$  | $$| $$$$$$$$   | $$   | $$$$$$$$      |  $$$$$$    | $$   | $$  | $$| $$ $$ $$| $$$$$   
  | $$  | $$| $$__  $$   | $$   | $$__  $$       \\____  $$   | $$   | $$  | $$| $$  $$$$| $$__/   
  | $$  | $$| $$  | $$   | $$   | $$  | $$       /$$  \\ $$   | $$   | $$  | $$| $$\\  $$$| $$      
  |  $$$$$$/| $$  | $$   | $$   | $$  | $$      |  $$$$$$/   | $$   |  $$$$$$/| $$ \\  $$| $$$$$$$$
   \\______/ |__/  |__/   |__/   |__/  |__/       \\______/    |__/    \\______/ |__/  \\__/|________/
  `);

  console.log("\nWhat would you like to do today?");

  const response = await prompts({
    type: 'select',
    name: 'action',
    message: 'Please choose an option:',
    choices: [
      { title: 'New Contract', value: 'init' },
      { title: 'Deploy Contract', value: 'deploy' },
      { title: 'Install Contract', value: 'install' } // Add new option for Install Contract
    ],
  });

  const selectedAction = response.action;

  if (selectedAction === 'init') {
    await createContractFolder();
  } else if (selectedAction === 'deploy') {
    await deployContracts();
  } else if (selectedAction === 'install') {
    runPackageManager(); // Call the package manager function when "Install Contract" is selected
  } else {
    console.log('No valid option selected.');
  }
};

// Function to create contract folder
const createContractFolder = async () => {
  const response = await prompts([{
    type: 'text',
    name: 'contractTitle',
    message: 'Please enter the contract title:'
  }]);

  const contractTitle = response.contractTitle;

  if (!contractTitle) {
    console.log('No contract title provided.');
    return;
  }

  const templatesPath = path.join(__dirname, 'templates');
  const templates = fs.readdirSync(templatesPath).filter(file => fs.statSync(path.join(templatesPath, file)).isDirectory());

  const templateResponse = await prompts({
    type: 'select',
    name: 'template',
    message: 'Please select a template:',
    choices: templates.map(template => ({ title: template, value: template })),
  });

  const selectedTemplate = templateResponse.template;
  const folderPath = path.join(process.cwd(), contractTitle);
  
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
    console.log(`Created folder: ${folderPath}`);
  }

  const selectedTemplatePath = path.join(templatesPath, selectedTemplate);
  fs.copySync(selectedTemplatePath, folderPath);
  console.log(`Template '${selectedTemplate}' has been copied to: ${folderPath}`);
};

// Main function to handle commands
const main = async () => {
  await checkForLatestVersion();

  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    await displayWelcomeMessage(); // Display prompt if no command provided
  } else if (command === 'init') {
    await createContractFolder();
  } else if (command === 'deploy') {
    await deployContracts();
  } else if (command === 'install') {
    runPackageManager(); // Link the command "install" to the package manager function
  } else {
    console.log('Unknown command. Available commands: init, deploy, install');
  }
};

// Run main function
main();










