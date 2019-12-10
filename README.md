# fiat-currency-token
Fiatech fiat currency token on ethereum blockchain.

# Testing
Testing was made with trufle v5, using chai and truffle-assertions

***Unit testing environment setup with truffle steps:
1. install truffle:
$ npm install -g truffle@beta

2. we also need some sort of Ethereum test network, such as Ganache
$ brew cask install ganache
$ npm install -g ganache-cli

3. create a project directory, and initialise a new Truffle project in it
$ mkdir truffle-revert-tests
$ cd truffle-revert-tests
$ truffle init
$ npm init -y

4. Install the testing packages
npm install --save-dev chai truffle-assertions

NOTE:
further tutorial and contract test example check:
https://kalis.me/check-events-solidity-smart-contract-test-truffle/
https://kalis.me/assert-reverts-solidity-smart-contract-test-truffle/
