![OATHSTONE](https://drive.google.com/file/d/1_A3lLe32y3leoj3QUe3O0-ANgsUHzRD8/view?usp=sharing)

# OATHSTONE V2

**Welcome to OATHSTONE V@**, a powerful CLI tool designed for developers to easily deploy smart contracts on the Celo blockchain. OATHSTONE simplifies the process of managing and deploying Solidity contracts, offering an intuitive interface and useful features like QR code generation for quick access to deployed contracts.

---

## Key Features

- **Contract Deployment**: Deploy Solidity contracts to the Celo blockchain with a single command.
- **Multiple Solidity Files Support**: Deploy complex contracts with multiple `.sol` files.
- **QR Code Generation**: Generate a QR code for your deployed contract's CeloScan URL after successful deployment.
- **Template System**: Kickstart your contract development with pre-built templates.
- **AI Assisted Constructor Argument Suggestion**: Users no longer have to be confused on how best to format their Constructor Arguments. Every deploy instance now come to helpful suggestion on what your constructor argument should be based on your Solidty Codes
- **AI Defender**: OathStone now comes built in with a powerful AI Defender that checks your conde for best practices and gives suggestions on how to improve it. It also checks to see if your code does not have any vulnerablity that may cost you dearly when you deploy to Mainnet. With OathStone you can now be sure those line of code does or does not meet glocal standards. 


---

## Installation

Use OATHSTONE directly via `npx` without needing a global installation:

```bash
npm install -g oathstone

---

## Usage

1. Initialize a Project
Start by initializing a project using the init command. You will be prompted to enter a contract title and select a template:

bash
Copy code
oathstone
After responding to the prompts, OATHSTONE will create a project folder with a default index.sol file for you to modify.

2. Deploy Your Contract
Once your contract files are ready, deploy them using the oathstone command. Ensure you are in the project directory containing your .sol files:


---

## Templates

OATHSTONE includes several useful templates located in the template folder. Available templates include:

Blank Contract: A clean slate to write your own custom contract.

HelloWorld: A basic contract for new users to get started quickly.
Select a template when you initialize a project, and it will generate the appropriate structure.

---


## Contribute

To contribute to this repo take the following steps

Step 1
Clone this Repo

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

For support contact me at graderng@gmail.com with the Subject title "Oath Stone CLI"

---

License
OATHSTONE is licensed under the MIT License. See the LICENSE file for more details.








