#!/usr/bin/env node

const fs = require('fs-extra'); // Updated to use fs-extra
const path = require('path');
const prompts = require('prompts');
const deployContracts = require('./deploy'); // Import deploy function

// Function to display welcome message and prompt for action
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

  // Create prompt to choose between New Contract and Deploy Contract
  const response = await prompts({
    type: 'select',
    name: 'action',
    message: 'Please choose an option:',
    choices: [
      { title: 'New Contract', value: 'init' }, // Option for creating a new contract
      { title: 'Deploy Contract', value: 'deploy' } // Option for deploying an existing contract
    ],
  });

  // Handle the user's choice
  const selectedAction = response.action;

  if (selectedAction === 'init') {
    await createContractFolder(); // Call the init function for new contract creation
  } else if (selectedAction === 'deploy') {
    await deployContracts(); // Call the deploy function from deploy.js
  } else {
    console.log('No valid option selected.');
  }
};

// Function to prompt the user for a contract title and template selection
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

  // Get available templates from the "templates" folder
  const templatesPath = path.join(__dirname, 'templates');
  const templates = fs.readdirSync(templatesPath).filter(file => fs.statSync(path.join(templatesPath, file)).isDirectory());

  // Prompt user to select a template
  const templateResponse = await prompts({
    type: 'select',
    name: 'template',
    message: 'Please select a template:',
    choices: templates.map(template => ({ title: template, value: template })),
  });

  const selectedTemplate = templateResponse.template;

  // Create a folder based on the contract title
  const folderPath = path.join(process.cwd(), contractTitle);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
    console.log(`Created folder: ${folderPath}`);
  }

  // Copy selected template folder to the new contract folder using fs-extra
  const selectedTemplatePath = path.join(templatesPath, selectedTemplate);
  fs.copySync(selectedTemplatePath, folderPath); // Use fs.copySync to copy the directory
  console.log(`Template '${selectedTemplate}' has been copied to: ${folderPath}`);
};

// Main function to handle commands
const main = async () => {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    await displayWelcomeMessage(); // Display welcome message and handle prompts when no command is provided
  } else if (command === 'init') {
    await createContractFolder(); // Initialize and create contract folder
  } else if (command === 'deploy') {
    await deployContracts(); // Deploy contracts
  } else {
    console.log('Unknown command. Available commands: init, deploy');
  }
};

// Run the main function
main();












