const fs = require('fs');
const path = require('path');
const prompts = require('prompts');
const axios = require('axios');
const platforms = require('./platforms');
const qrcode = require('qrcode-terminal'); // Import qrcode-terminal
const { createDeploymentUI } = require('./ui');

// Function to retrieve .sol files from the specified directories and remove duplicates
const getSolidityFiles = (directories) => {
  const solidityFiles = [];
  const fileSet = new Set();

  const readDirectory = (directory) => {
    const files = fs.readdirSync(directory);
    files.forEach(file => {
      const filePath = path.join(directory, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        readDirectory(filePath);
      } else if (file.endsWith('.sol')) {
        const code = fs.readFileSync(filePath, 'utf8');
        const fileKey = `${file}_${code}`;
        if (!fileSet.has(fileKey)) {
          solidityFiles.push({ name: file.replace('.sol', ''), code });
          fileSet.add(fileKey);
        }
      }
    });
  };

  directories.forEach(directory => {
    if (fs.existsSync(directory)) {
      readDirectory(directory);
    }
  });

  return solidityFiles;
};

// Function to call the Latitude API for suggestion
const indexSuggestion = async (solidityFiles) => {
  try {
    const response = await axios.post(
      'https://gateway.latitude.so/api/v2/projects/180/versions/a0fcdad5-6f3c-466a-80e4-3d2f2f12a41f/documents/run',
      {
        path: 'index',
        stream: false,
        parameters: { code: solidityFiles.map(file => file.code).join('\n') }
      },
      {
        headers: {
          'Authorization': 'Bearer 893e0115-5088-4d7a-b615-352f9d16f703',
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract and display the "text" content if it exists
    if (response.data && response.data.response && response.data.response.text) {
      console.log("Latitude Index Suggestion:");
      console.log(response.data.response.text);
    } else {
      throw new Error("Latitude Index response format is incorrect or 'text' field is missing.");
    }
  } catch (error) {
    // Error handling for missing or incorrect response format
    console.error("Error in latitude index call:", error.response ? error.response.data : error.message);
  }
};

// Function to call the Latitude API for the final check
const defender = async (solidityFiles) => {
  try {
    const response = await axios.post(
      'https://gateway.latitude.so/api/v2/projects/180/versions/a0fcdad5-6f3c-466a-80e4-3d2f2f12a41f/documents/run',
      {
        path: 'defender',
        stream: false,
        parameters: { code: solidityFiles.map(file => file.code).join('\n') }
      },
      {
        headers: {
          'Authorization': 'Bearer 893e0115-5088-4d7a-b615-352f9d16f703',
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract and display the "text" content if it exists
    if (response.data && response.data.response && response.data.response.text) {
      console.log("Defender Analysis Report:");
      console.log(response.data.response.text);
    } else {
      throw new Error("Defender response format is incorrect or 'text' field is missing.");
    }

    return response.data;
  } catch (error) {
    // Error handling for missing or incorrect response format
    console.error("Error in defender check:", error.response ? error.response.data : error.message);
  }
};

// Function to deploy contracts
const deployContracts = async () => {
  const platformResponse = await prompts({
    type: 'select',
    name: 'platform',
    message: 'Please select a Blockchain Platform:',
    choices: platforms.map(platform => ({ title: platform.name, value: platform }))
  });
  const selectedPlatform = platformResponse.platform;

  if (!selectedPlatform) return;

  const environmentResponse = await prompts({
    type: 'select',
    name: 'environment',
    message: 'Please select an environment:',
    choices: [{ title: 'Testnet', value: 'testnet' }, { title: 'Mainnet', value: 'mainnet' }]
  });
  const selectedEnvironment = environmentResponse.environment;
  if (!selectedEnvironment) return;

  const environmentNumber = selectedEnvironment === 'testnet' ? 0 : 1;

  const contractTitleResponse = await prompts({
    type: 'text',
    name: 'contractTitle',
    message: 'Please enter the contract title:'
  });
  const contractTitle = contractTitleResponse.contractTitle;
  if (!contractTitle) return;

  const currentDir = process.cwd();
  const pmFolder = path.join(currentDir, 'pm');
  const solidityFiles = getSolidityFiles([currentDir, pmFolder]);

  // Run `index` as a suggestion provider
  console.log("Running Index Suggestion for constructor suggestions...");
  await indexSuggestion(solidityFiles);

  // Proceed without waiting for user input
  const constructorArgsResponse = await prompts({
    type: 'text',
    name: 'constructorArgs',
    message: 'Please enter constructor arguments (exact input):'
  });
  const constructorArgs = constructorArgsResponse.constructorArgs.split(',').map(arg => arg.trim());

  const userPrivateKeyResponse = await prompts({
    type: 'text',
    name: 'userPrivateKey',
    message: 'Please enter your private key:'
  });
  const userPrivateKey = userPrivateKeyResponse.userPrivateKey;

  const payload = {
    environment: environmentNumber,
    contractTitle: contractTitle,
    solidityFiles: solidityFiles,
    constructorArgs: constructorArgs,
    userPrivateKey: userPrivateKey
  };

  console.log("Thank you for using Oath Stone. Performing final Defender check...");
  
  // Run `defender` for final analysis and proceed directly to deployment
  await defender(solidityFiles);

  try {
    const response = await axios.post(selectedPlatform.endpoint, payload);
    console.log("Deployment Response:", JSON.stringify(response.data, null, 2));

    const { celoScanUrl, etherscanUrl } = response.data;

    if (celoScanUrl) {
      console.log('CeloScan URL:', celoScanUrl);
      qrcode.generate(celoScanUrl, { small: true });
      createDeploymentUI(response.data);
    } else if (etherscanUrl) {
      console.log('Etherscan URL:', etherscanUrl);
      qrcode.generate(etherscanUrl, { small: true });
      createDeploymentUI(response.data);
    } else {
      console.error("No scan URL found in response.");
    }
  } catch (error) {
    console.error("Error deploying contract:", error.response ? error.response.data : error.message);
  }
};

module.exports = deployContracts;








