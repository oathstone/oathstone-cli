const fs = require('fs');
const path = require('path');
const prompts = require('prompts');
const axios = require('axios');
const platforms = require('./platforms');
const qrcode = require('qrcode-terminal'); // Import qrcode-terminal

// Function to retrieve .sol files and format them
const getSolidityFiles = (directory) => {
  const files = fs.readdirSync(directory);
  return files
    .filter(file => file.endsWith('.sol'))
    .map(file => {
      const code = fs.readFileSync(path.join(directory, file), 'utf8');
      return {
        name: file.replace('.sol', ''), // Remove the .sol extension for the name
        code: code
      };
    });
};

// Function to deploy contracts
const deployContracts = async () => {
  // Prompt to ask the user to select a blockchain platform
  const platformResponse = await prompts({
    type: 'select',
    name: 'platform',
    message: 'Please select a Blockchain Platform:',
    choices: platforms.map(platform => ({ title: platform.name, value: platform }))
  });

  const selectedPlatform = platformResponse.platform;

  if (!selectedPlatform) {
    console.log('No platform selected.');
    return;
  }

  console.log(`You selected the platform: ${selectedPlatform.name} (${selectedPlatform.endpoint})`);

  // Prompt to select the environment (testnet or mainnet)
  const environmentResponse = await prompts({
    type: 'select',
    name: 'environment',
    message: 'Please select an environment:',
    choices: [
      { title: 'Testnet', value: 'testnet' },
      { title: 'Mainnet', value: 'mainnet' }
    ]
  });

  const selectedEnvironment = environmentResponse.environment;

  if (!selectedEnvironment) {
    console.log('No environment selected.');
    return;
  }

  // Get the environment value from the selected platform
  const environmentValue = selectedPlatform[selectedEnvironment];
  const environmentNumber = selectedEnvironment === 'testnet' ? 0 : 1;

  console.log(`You selected the environment: ${environmentValue}`);
  console.log(`Environment: ${environmentNumber}`);

  // Prompt for contract title
  const contractTitleResponse = await prompts({
    type: 'text',
    name: 'contractTitle',
    message: 'Please enter the contract title:'
  });

  const contractTitle = contractTitleResponse.contractTitle;

  if (!contractTitle) {
    console.log('No contract title provided.');
    return;
  }

  console.log(`Contract Title: ${contractTitle}`);

  // Retrieve all .sol files in the current directory
  const solidityFiles = getSolidityFiles(process.cwd());

  console.log("Solidity Files extracted");

  // Check if the contract has a constructor by checking constructorArgs
  const hasConstructor = solidityFiles.some(file => file.code.includes('constructor('));

  let constructorArgs = [];

  if (hasConstructor) {
    // If the contract has a constructor, prompt for arguments
    const constructorArgsResponse = await prompts({
      type: 'text',
      name: 'constructorArgs',
      message: 'Please enter constructor arguments (comma separated, wrapped in [] if needed):'
    });

    try {
      // Try parsing the input as a valid array (in case of JSON-like input, e.g. [1000000, "Token", ...])
      constructorArgs = JSON.parse(constructorArgsResponse.constructorArgs);
      console.log(`Constructor Args (parsed as array): ${JSON.stringify(constructorArgs)}`);
    } catch (error) {
      // If parsing fails, fall back to splitting and trimming the input
      constructorArgs = constructorArgsResponse.constructorArgs.split(',').map(arg => arg.trim());
      console.log(`Constructor Args (split): ${JSON.stringify(constructorArgs)}`);
    }
  } else {
    console.log('No constructor found, skipping constructor arguments prompt.');
  }

  // Prompt for user private key
  const userPrivateKeyResponse = await prompts({
    type: 'text',
    name: 'userPrivateKey',
    message: 'Please enter your private key:'
  });

  const userPrivateKey = userPrivateKeyResponse.userPrivateKey;
  console.log(`User Private Key: ${userPrivateKey}`);

  // Construct the payload for the request
  const payload = {
    environment: environmentNumber,
    contractTitle: contractTitle,
    solidityFiles: solidityFiles,
    constructorArgs: constructorArgs, // Pass the constructorArgs as-is
    userPrivateKey: userPrivateKey
  };

  
  // Add the message before the API call
  console.log("Thank you for using Oath Stone. Please wait while we deploy your contract. Processing...");

  try {
    // Make an Axios POST request to the selected platform's endpoint
    const response = await axios.post(selectedPlatform.endpoint, payload);
    console.log("Full Deployment response:", JSON.stringify(response.data, null, 2)); // Log the full response for debugging

    // Check if celoScanUrl or etherscanUrl exists in the response
    const { celoScanUrl, etherscanUrl } = response.data;

    if (celoScanUrl) {
      console.log('CeloScan URL:', celoScanUrl);
      // Log Celo URL length for debugging
      console.log('CeloScan URL Length:', celoScanUrl.length);
      // Generate a QR code for the CeloScan URL
      qrcode.generate(celoScanUrl, { small: true });
    }else {
        console.log('No CeloScan URL found.');
      }

    if (etherscanUrl) {
      console.log('EtherScan URL:', etherscanUrl);
      // Log EtherScan URL length for debugging
      console.log('EtherScan URL Length:', etherscanUrl.length);
      // Generate a QR code for the EtherScan URL
      qrcode.generate(etherscanUrl, { small: true });
    } else {
      console.log('No EtherScan URL found.');
    }

  } catch (error) {
    console.error("Error during contract deployment:", error.response ? error.response.data : error.message);
  }
};

module.exports = deployContracts;











