const FiatToken = artifacts.require("./FiatToken.sol");
//const FiatToken = artifacts.require("FiatToken");
const USDF = artifacts.require("./USDf.sol");
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

const common = require("./common.js");
const TEST_TAG = 'ERC20-Pausable-tests - ';



contract(common.TEST_CONTRACT_NAME, async accounts => {
	let contractOwner = accounts[0];
	let admin1 = accounts[1];
	let admin2 = accounts[2];
	let user1 = accounts[3];
	let user2 = accounts[4];
	let useR = accounts[5]; //user with some money in his wallet
	let useR2 = accounts[6]; //user with some money in his wallet
	let ffc;
	let dffc;
	let config;
	let fees;
	let dconfig;
	let dfees;
	let admins;
	
	
	
	// 'beforeEach' function will run before each test creating a new instance of the contract each time
	beforeEach('setup contract for each test', async () => {
		//let ffc = await FiatToken.deployed();
        //ffc = await FiatToken.new(common.tokenSymbolUSD, common.tokenNameUSD, common.tokenVersion, common.tokenDecimals, {from: contractOwner});
		//dffc = await FiatToken.new(common.tokenSymbolUSD, common.tokenNameUSD, common.tokenVersion, common.tokenDecimals, {from: contractOwner});
		//ffc = await common.createNewUSDContract(contractOwner);
		//dffc = await common.createNewUSDContract(contractOwner);
		[ffc, admins, config, fees] = await common.createNewUSDContract(contractOwner);
		[dffc, , dconfig, dfees] = await common.createNewUSDContractWithParams(contractOwner, admins);
		
		//config = await common.getConfig(ffc);
		//fees = await common.getTransferFees(ffc);
		
		//dconfig = await common.getConfig(dffc);
		//dfees = await common.getTransferFees(dffc);
		
		// deposit 1000 usd (100.000 tokens) to contract owner
		await ffc.depositAccept(contractOwner, 100000, { from: contractOwner });
		await dffc.depositAccept(contractOwner, 100000, { from: contractOwner });
		
		// deposit 100000 tokens to useR wallet
		await ffc.depositAccept(useR, 100000, { from: contractOwner });
		await dffc.depositAccept(useR, 100000, { from: contractOwner });
		// deposit 100000 tokens to useR2 wallet
		await ffc.depositAccept(useR2, 100000, { from: contractOwner });
		await dffc.depositAccept(useR2, 100000, { from: contractOwner });
		
		// add a system admin to perform admin operations
		await admins.addAdmin(admin1, {from: contractOwner});
		assert.equal(await config.isAdmin(admin1), true, 'admin1 should have admin role by now');
		await admins.addAdmin(admin2, {from: contractOwner});
		assert.equal(await config.isAdmin(admin2), true, 'admin2 should have admin role by now');
		
		//await dffc.disableTransfers({from: contractOwner});
		await dconfig.enableTransfers(false, {from: contractOwner});
		
		//await dconfig.addAdmin(admin1, {from: contractOwner});
		assert.equal(await dconfig.isAdmin(admin1), true, 'admin1 should have admin role by now');
		//await dconfig.addAdmin(admin2, {from: contractOwner});
		assert.equal(await dconfig.isAdmin(admin2), true, 'admin2 should have admin role by now');
    });
	
	
	
	
	/// paused contract and transfers disabled tests
	it(TEST_TAG + 'users can NOT transfer tokens when contract is paused or transfers are disabled', async () => {
		await config.pause({from: contractOwner});
		assert.equal(await config.isPaused(), true, 'contract should be paused by now');
		
		await truffleAssert.reverts(
			ffc.transfer(user1, 1000, { from: useR }), "" //"Pausable: paused"
		);
		
		await truffleAssert.reverts(
			dffc.transfer(user1, 1000, { from: useR }), "" //"TransfersController: Operation allowed only when transfers are enabled!"
		);
	});
	
	
	
	it(TEST_TAG + 'users can NOT approve other users to spend tokens when contract is paused or transfers are disabled', async () => {
		await config.pause({from: contractOwner});
		assert.equal(await config.isPaused(), true, 'contract should be paused by now');
		
		await truffleAssert.reverts(
			ffc.approve(user1, 1000, { from: useR }), "" //"Pausable: paused"
		);
		
		await truffleAssert.reverts(
			dffc.approve(user1, 1000, { from: useR }), "" //"TransfersController: Operation allowed only when transfers are enabled!"
		);
	});
	
	
	
	it(TEST_TAG + 'users can NOT spend approved tokens (transferFrom) when contract is paused or transfers are disabled', async () => {
		// useR approves user1 to spend some tokens
		ffc.approve(user1, 1000, { from: useR });
		
		await config.pause({from: contractOwner});
		assert.equal(await config.isPaused(), true, 'contract should be paused by now');
		
		await truffleAssert.reverts(
			ffc.transferFrom(useR, user2, 1000, { from: user1 }), "" //"Pausable: paused"
		);
		
		await config.unpause({from: contractOwner});
		assert.equal(await config.isPaused(), false, 'contract should be unpaused by now');
		
		await config.enableTransfers(false, {from: contractOwner});
		assert.equal(await config.transfersEnabled(), false, 'contract transfers should be disabled by now');
		
		await truffleAssert.reverts(
			ffc.transferFrom(useR, user2, 1000, { from: user1 }), "" //"TransfersController: Operation allowed only when transfers are enabled!"
		);
	});
});
