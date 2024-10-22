![OATHSTONE](https://oathstone.cloud/logo.jpg)

# OATHSTONE

**Welcome to OATHSTONE**, a powerful CLI tool designed for developers to easily deploy smart contracts on the Celo blockchain. OATHSTONE simplifies the process of managing and deploying Solidity contracts, offering an intuitive interface and useful features like QR code generation for quick access to deployed contracts.

---

## Key Features

- **Contract Deployment**: Deploy Solidity contracts to the Celo blockchain with a single command.
- **Multiple Solidity Files Support**: Deploy complex contracts with multiple `.sol` files.
- **QR Code Generation**: Generate a QR code for your deployed contract's CeloScan URL after successful deployment.
- **Template System**: Kickstart your contract development with pre-built templates.



---

## Installation

Use OATHSTONE directly via `npx` without needing a global installation:

```bash
npx oathstone

---

## Usage

1. Initialize a Project
Start by initializing a project using the init command. You will be prompted to enter a contract title and select a template:

bash
Copy code
npx oathstone init
After responding to the prompts, OATHSTONE will create a project folder with a default index.sol file for you to modify.

2. Deploy Your Contract
Once your contract files are ready, deploy them using the deploy command. Ensure you are in the project directory containing your .sol files:

bash
Copy code
npx oathstone deploy
After deployment, OATHSTONE will return the CeloScan URL and display a QR code that points directly to your contract on the Celo blockchain.

Example Workflow
Initialize a Project:

bash
Copy code
npx oathstone init
Provide a contract title, choose a template, and OATHSTONE will create a project folder with a default index.sol file.

Edit Your Contract:

Modify the generated index.sol file as needed, or add additional .sol files if your contract is split across multiple components.

Deploy the Contract:

Run the deploy command to compile and deploy the contract:

bash
Copy code
npx oathstone deploy
You will receive the contract’s CeloScan URL and a QR code for easy access.

---

## Templates

OATHSTONE includes several useful templates located in the template folder. Available templates include:

Blank Contract: A clean slate to write your own custom contract.
HelloWorld: A basic contract for new users to get started quickly.
Select a template when you initialize a project, and it will generate the appropriate structure.

---

---

## Contribute

To contribute to this repo take the following steps

Step 1
Clong this Repo

Step 2
npm install

Step 3
node index.js

Step 4
node link

Step 5
oathstone


Once youre done making your changes, make a pull request. 


---



License
OATHSTONE is licensed under the MIT License. See the LICENSE file for more details.

