const fs = require('fs');
const path = require('path');

// Function to log "Oathstone UI"
function createDeploymentUI(apiResponse) {
    const uiDir = path.join(process.cwd(), 'ui');

    // Check if the ui directory exists
    if (fs.existsSync(uiDir)) {
        console.log("UI directory found.");
    } else {
        // Create the ui directory if it does not exist
        fs.mkdirSync(uiDir);
        console.log("UI directory created.");
    }

    const contractTitle = apiResponse.contractTitle; // Get contract title from API response
    let folderName;
    let folderPath;
    let increment = 1;

    // Ensure the folder name is unique using contractTitle and an incremental number
    do {
        folderName = `${contractTitle}_${increment}`;
        folderPath = path.join(uiDir, folderName);
        increment++;
    } while (fs.existsSync(folderPath));

    // Create the unique folder
    fs.mkdirSync(folderPath);
    console.log(`Created folder: ${folderPath}`);

    // Create data.json file and write the full API response
    const dataFilePath = path.join(folderPath, 'data.json');
    fs.writeFileSync(dataFilePath, JSON.stringify(apiResponse, null, 2));
    console.log(`Created data.json with full API response at: ${dataFilePath}`);
}

// Export the function for use in other files
module.exports = { createDeploymentUI };












