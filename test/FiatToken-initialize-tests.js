const FiatToken = artifacts.require("./FiatToken.sol");
//const FiatToken = artifacts.require("FiatToken");
const USDF = artifacts.require("./USDf.sol");
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

const common = require("./common.js");
const TEST_TAG = 'Initialize - ';



contract(common.TEST_CONTRACT_NAME, async accounts => {
	var tokenInstance;
	let contractOwner = accounts[0];
	let ffc;
	let config;
	let fees;
	let admins;
	
	
	
	// 'beforeEach' function will run before each test creating a new instance of the contract each time
	beforeEach('setup contract for each test', async () => {
		//let ffc = await FiatToken.deployed();
        //ffc = await FiatToken.new(common.tokenSymbolUSD, common.tokenNameUSD, common.tokenVersion, common.tokenDecimals, {from: contractOwner});
		//ffc = await common.createNewUSDContract(contractOwner);
		[ffc, admins, config, fees] = await common.createNewUSDContract(contractOwner);
		
		//config = await common.getConfig(ffc);
		//fees = await common.getTransferFees(ffc);
    });
	
	
	
	it(TEST_TAG + 'contract has an owner', async () => {
        assert.equal(await ffc.owner(), contractOwner);
    });
	
	it(TEST_TAG + 'owner deposited some funds to himself', async () => {
		// deposit 1000 usd (100.000 tokens) to contract owner
		await ffc.depositAccept(contractOwner, common.ownerInitialBalance, {from: contractOwner});
		
		let balance = await ffc.balanceOf(contractOwner);
		assert.equal(balance.toNumber(), common.ownerInitialBalance, 'deposit some funds to owner address for testing');
	});
	
	it(TEST_TAG + 'check the initial supply is zero upon deployment', async () => {
		let totalSupply = await ffc.totalSupply();
		assert.equal(totalSupply.toNumber(), 0, 'check that total supply is zero');
	});
	
	it(TEST_TAG + 'check that owner balance is zero upon deployment', async () => {
		let ownerBalance = await ffc.balanceOf(contractOwner);
		assert.equal(ownerBalance.toNumber(), 0, 'check that owner balance upon deployment is zero');
	});
	
	it(TEST_TAG + 'initializes the contract with USD currency token values', async () => {
		let symbol = await ffc.symbol.call();
		assert.equal(symbol, 'USDf', 'has the correct symbol');
		
		let name = await ffc.name.call();
		assert.equal(name, 'USD fiat token', 'has the correct name');
		
		let version = await ffc.version();
		assert.equal(version, 'v1.0', 'has the correct version');
		
		let decimals = await ffc.decimals();
		assert.equal(decimals.toNumber(), 2, 'has the correct decimals');
	});
	
	// test event FiatTokenCreated is raised:
	// event FiatTokenCreated(address indexed issuer, string symbol, string name, string version, uint8 decimals);
	it(TEST_TAG + 'FiatTokenCreated event is raised upon deployment... [pending]', async () => {
		const receipt = await web3.eth.getTransactionReceipt(ffc.transactionHash);
		// we have 10 events emitted in contract constructor:
		// OwnershipTransferred
		// PauserAdded
		// AdminAddressAdded
		// TransferFeesChanged
		// MinimumTransferFeeTokensChanged
		// TransferFeesEnabled
		// WithdrawalFeesChanged
		// MinimumWithdrawalFeeTokensChanged
		// WithdrawalFeesEnabled
		// FiatTokenCreated
		let n_events = 10;
		
		//console.log('FiatTokenCreated test ffc.transactionHash >> ', ffc.transactionHash);
		//console.log('FiatTokenCreated test receipt >> ', receipt);
		
		//console.log('FiatTokenCreated test receipt.logs[9].topics >> ', receipt.logs[9].topics);
		
		//assert.equal(receipt.logs.length, n_events, 'triggers one event');
		//assert.equal(receipt.logs[9].event, 'FiatTokenCreated', 'should be the "FiatTokenCreated" event');
		//assert.equal(receipt.logs[9].args.issuer, accounts[0], 'logs the new contract owner as issuer address');
		//assert.equal(receipt.logs[9].args.symbol, common.tokenSymbolUSD, 'logs the new contract token symbol');
		//assert.equal(receipt.logs[9].args.name, common.tokenNameUSD, 'logs the new contract token name');
		//assert.equal(receipt.logs[9].args.standard, 'Fiatech Fiat Token 1.0', 'logs the new contract token standard');
		//assert.equal(receipt.logs[9].args.decimals, 2, 'logs the new contract token decimals');
	});
})
