const fs = require('fs-extra');
const path = require('path');
const prompts = require('prompts');

// Function to list and manage available packages
const packageManager = async () => {
  // Define the path where your packages are stored
  const packagesPath = path.join(__dirname, 'packages'); // Folder containing package folders
  
  // Check if the packages folder exists
  if (!fs.existsSync(packagesPath)) {
    console.log('No packages available.');
    return;
  }

  // Get available packages (assuming each package is a directory within the packages folder)
  const packages = fs.readdirSync(packagesPath).filter(file => fs.statSync(path.join(packagesPath, file)).isDirectory());

  // If no packages are found
  if (packages.length === 0) {
    console.log('No packages available.');
    return;
  }

  // Step 1: Prompt user to select a package
  const packageResponse = await prompts({
    type: 'select',
    name: 'selectedPackage',
    message: 'Select a package to install:',
    choices: packages.map(pkg => ({ title: pkg, value: pkg }))
  });

  const selectedPackage = packageResponse.selectedPackage;
  if (!selectedPackage) {
    console.log('No package selected.');
    return;
  }

  // Step 2: Prompt user to enter the exact file path
  const fileResponse = await prompts({
    type: 'text',
    name: 'filePath',
    message: 'Enter the file path to install (relative to the package):',
  });

  const filePath = fileResponse.filePath;
  if (!filePath) {
    console.log('No file path provided.');
    return;
  }

  // Construct the full path to the file in the package
  const sourceFilePath = path.join(packagesPath, selectedPackage, filePath);

  // Step 3: Check if the file exists in the package
  let nodeModulesPath; // Declare nodeModulesPath here
  if (fs.existsSync(sourceFilePath)) {
    console.log(`Found in package: ${sourceFilePath}`);
  } else {
    console.log(`File not found in package path: ${sourceFilePath}. Checking node_modules...`);

    // Check under the corresponding node_modules directory
    nodeModulesPath = path.join(packagesPath, selectedPackage, 'node_modules', filePath);
    if (fs.existsSync(nodeModulesPath)) {
      console.log(`Found in node_modules: ${nodeModulesPath}`);
    } else {
      console.log(`File not found: ${sourceFilePath} and ${nodeModulesPath}`);
      return;
    }
  }

  // Step 4: Copy the file to the local pm folder
  const destinationPath = path.join(process.cwd(), 'pm', selectedPackage); // ./pm/packageName folder
  fs.ensureDirSync(destinationPath); // Ensure the directory exists

  // Determine which file path to use for copying
  const destFilePath = fs.existsSync(sourceFilePath) ? sourceFilePath : nodeModulesPath;

  fs.copyFileSync(destFilePath, path.join(destinationPath, path.basename(filePath)));
  console.log(`Copied ${filePath} to ${destinationPath}`);

  console.log(`\nInstallation completed. Installed file from the ${selectedPackage} package.`);
};

module.exports = packageManager;








