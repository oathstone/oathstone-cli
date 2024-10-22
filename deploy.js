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

// Defender function to call the Latitude API
const defender = async (solidityFiles) => {
  try {
    const response = await axios.post(
      'https://gateway.latitude.so/api/v2/projects/180/versions/a0fcdad5-6f3c-466a-80e4-3d2f2f12a41f/documents/run',
      {
        path: 'defender',
        stream: false,
        parameters: {
          code: solidityFiles.map(file => file.code).join('\n') // Join all Solidity code as one string
        }
      },
      {
        headers: {
          'Authorization': 'Bearer 893e0115-5088-4d7a-b615-352f9d16f703',
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data; // Return the response from the Latitude API
  } catch (error) {
    console.error("Error calling Defender API:", error.response ? error.response.data : error.message);
    return null; // Return null in case of error
  }
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
  console.log(`${solidityFiles.length} files found.`); // Count of Solidity files

  // Check if the contract has a constructor by checking constructorArgs
  const hasConstructor = solidityFiles.some(file => file.code.includes('constructor('));

  let constructorArgs = [];

  if (hasConstructor) {
    console.log("Constructor detected. Please wait while we make some recommendations. Processing...");

    // Send the Solidity code with constructor to the Latitude API
    try {
      const latitudeApiResponse = await axios.post(
        'https://gateway.latitude.so/api/v2/projects/180/versions/a0fcdad5-6f3c-466a-80e4-3d2f2f12a41f/documents/run',
        {
          path: 'index',
          stream: false,
          parameters: {
            code: solidityFiles.map(file => file.code).join('\n') // Join all Solidity code as one string
          }
        },
        {
          headers: {
            'Authorization': 'Bearer 893e0115-5088-4d7a-b615-352f9d16f703',
            'Content-Type': 'application/json'
          }
        }
      );

      // Accessing and displaying only the content of the message
      const messageContent = latitudeApiResponse.data.messages[0]?.content;
      if (messageContent) {
        console.log("Suggestion:", messageContent);
      } else {
        console.log("No suggestions received.");
      }

    } catch (error) {
      console.error("Error calling Latitude API:", error.response ? error.response.data : error.message);
    }

    // Prompt for constructor arguments after sending code to the Latitude API
    const constructorArgsResponse = await prompts({
      type: 'text',
      name: 'constructorArgs',
      message: 'Please enter constructor arguments (exact input):'
    });

    // Send the exact input from the user as is, no formatting
    constructorArgs = constructorArgsResponse.constructorArgs;
    console.log(`Constructor Args (exact input): ${constructorArgs}`);
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
    constructorArgs: constructorArgs, // Pass the exact input for constructorArgs
    userPrivateKey: userPrivateKey
  };

  // Add the message before the API call
  console.log("Thank you for using Oath Stone. Please wait while we deploy your contract. Processing...");

  // Call the defender function before sending the payload
  const defenderResponse = await defender(solidityFiles);

  // Only display the specified messages from the defender response
  if (defenderResponse && defenderResponse.messages) {
    const analysisResult = defenderResponse.messages.find(msg => msg.role === 'assistant');

    if (analysisResult) {
      console.log("Defender Analysis Results:", analysisResult.content);

      // Check if the analysis result contains PASS or FAIL
      if (analysisResult.content.includes('PASS')) {
        // Proceed to call the API since the response is PASS
        try {
          const response = await axios.post(selectedPlatform.endpoint, payload);
          console.log("Full Deployment response:", JSON.stringify(response.data, null, 2)); // Log the full response for debugging

          // Check if celoScanUrl or etherscanUrl exists in the response
          const { celoScanUrl, etherscanUrl } = response.data;

          if (celoScanUrl) {
            console.log('CeloScan URL:', celoScanUrl);
            console.log('CeloScan URL Length:', celoScanUrl.length);
            qrcode.generate(celoScanUrl, { small: true });
          } else {
            console.log('No CeloScan URL found.');
          }

          if (etherscanUrl) {
            console.log('EtherScan URL:', etherscanUrl);
            console.log('EtherScan URL Length:', etherscanUrl.length);
            qrcode.generate(etherscanUrl, { small: true });
          } else {
            console.log('No EtherScan URL found.');
          }

        } catch (error) {
          console.error("Error during contract deployment:", error.response ? error.response.data : error.message);
        }

      } else if (analysisResult.content.includes('FAIL')) {
        // Display error message if the response is FAIL
        console.error("Sorry, we would not be able to deploy this code because it doesn't meet our safety requirements. Kindly check the message above for more information. You can retry when all issues have been resolved.");
      } else {
        console.log("No analysis results found.");
      }
    } else {
      console.log("No analysis results found.");
    }
  } else {
    console.error("Deployment aborted due to defender error.");
    return; // Exit if the defender call fails
  }

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
      qrcode.generate(celoScanUrl, { small: true });
    } else {
      console.log('No CeloScan URL found.');
    }

    if (etherscanUrl) {
      console.log('EtherScan URL:', etherscanUrl);
      // Log Ether URL length for debugging
      console.log('EtherScan URL Length:', etherscanUrl.length);
      qrcode.generate(etherscanUrl, { small: true });
    } else {
      console.log('No EtherScan URL found.');
    }

  } catch (error) {
    console.error("Error during contract deployment:", error.response ? error.response.data : error.message);
  }
};

// Export the deployContracts function
module.exports = deployContracts;










