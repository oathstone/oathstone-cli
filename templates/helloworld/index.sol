// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HelloWorld {
    // Public state variable to store the greeting message
    string public greet = "Hello, Celo!";

    // Function to set a new greeting message
    function setGreeting(string memory _greet) public {
        greet = _greet;
    }

    // Function to retrieve the current greeting message
    function getGreeting() public view returns (string memory) {
        return greet;
    }
}



















