const fs = require('fs');
const path = require('path');
const prompts = require('prompts');
const fse = require('fs-extra'); // For copying templates

// Function to prompt the user for a contract title and template selection
const createContractFolder = async () => {
  // Prompt user to enter the contract title
  const response = await prompts([
    {
      type: 'text',
      name: 'contractTitle',
      message: 'Please enter the contract title:'
    }
  ]);

  const contractTitle = response.contractTitle;

  if (!contractTitle) {
    console.log('No contract title provided.');
    return;
  }

  // Path to the templates folder
  const templatesPath = path.join(__dirname, 'templates');

  // Get available templates from the "templates" folder (list only directories)
  const templates = fs.readdirSync(templatesPath).filter(file => {
    const templatePath = path.join(templatesPath, file);
    const isDir = fs.statSync(templatePath).isDirectory(); // Only list directories
    console.log(`Found template: ${file} (isDirectory: ${isDir})`); // Debug logging
    return isDir;
  });

  if (templates.length === 0) {
    console.log('No templates found.');
    return;
  }

  // Prompt user to select a template
  const templateResponse = await prompts({
    type: 'select',
    name: 'template',
    message: 'Please select a template:',
    choices: templates.map(template => ({ title: template, value: template })),
  });

  const selectedTemplate = templateResponse.template;

  if (!selectedTemplate) {
    console.log('No template selected.');
    return;
  }

  // Create a folder based on the contract title
  const folderPath = path.join(process.cwd(), contractTitle);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
    console.log(`Created folder: ${folderPath}`);
  }

  // Copy the selected template folder to the new contract folder
  const selectedTemplatePath = path.join(templatesPath, selectedTemplate);
  if (fs.existsSync(selectedTemplatePath)) {
    fse.copySync(selectedTemplatePath, folderPath);
    console.log(`Template '${selectedTemplate}' has been copied to: ${folderPath}`);
  } else {
    console.log(`Template '${selectedTemplate}' does not exist.`);
  }
};

module.exports = {
  createContractFolder
};












