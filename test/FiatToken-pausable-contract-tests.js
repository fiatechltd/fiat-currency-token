const FiatToken = artifacts.require("./FiatToken.sol");
const USDF = artifacts.require("./USDf.sol");
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

const common = require("./common.js");
const TEST_TAG = 'Pausable-contract - ';



contract(common.TEST_CONTRACT_NAME, async accounts => {
	var tokenInstance;
	let contractOwner = accounts[0];
	let admin1 = accounts[1];
	let admin2 = accounts[2];
	let user1 = accounts[3];
	let user2 = accounts[4];
	let ffc;
	let pffc;
	let config;
	let fees;
	let pconfig;
	let pfees;
	let admins;
	
	
	
	// 'beforeEach' function will run before each test creating a new instance of the contract each time
	beforeEach('setup contract for each test', async () => {
		//let ffc = await FiatToken.deployed();
        //ffc = await FiatToken.new(common.tokenSymbolUSD, common.tokenNameUSD, common.tokenVersion, common.tokenDecimals, {from: contractOwner});
		//pffc = await FiatToken.new(common.tokenSymbolUSD, common.tokenNameUSD, common.tokenVersion, common.tokenDecimals, {from: contractOwner});
		//ffc = await common.createNewUSDContract(contractOwner);
		//pffc = await common.createNewUSDContract(contractOwner);
		[ffc, admins, config, fees] = await common.createNewUSDContract(contractOwner);
		[pffc, , pconfig, pfees] = await common.createNewUSDContractWithParams(contractOwner, admins);
		
		//config = await common.getConfig(ffc);
		//fees = await common.getTransferFees(ffc);
		
		//pconfig = await common.getConfig(pffc);
		//pfees = await common.getTransferFees(pffc);
		
		// add a system admin to perform admin operations
		await admins.addAdmin(admin1, {from: contractOwner});
		assert.equal(await config.isAdmin(admin1), true, 'admin1 should have admin role by now');
		
		//await pconfig.addAdmin(admin1, {from: contractOwner});
		assert.equal(await pconfig.isAdmin(admin1), true, 'admin1 should have admin role by now');
		
		// pause a contract for testing
		await pconfig.pause({from: admin1});
    });
	
	
	
	it(TEST_TAG + 'contract is not paused upon deployment', async () => {
		assert.equal(await config.isPaused(), false, 'contract should NOT be paused upon deployment');
	});
	
	
	
	it(TEST_TAG + 'contract owner can pause contract', async () => {
		await config.pause({from: contractOwner});
		assert.equal(await config.isPaused(), true, 'contract should be paused by now');
	});
	
	it(TEST_TAG + 'admin can pause contract', async () => {
		await config.pause({from: admin1});
		assert.equal(await config.isPaused(), true, 'contract should be paused by now');
	});
	
	it(TEST_TAG + 'user can NOT pause contract', async () => {
		// user1 trying to pause contract should fail
		try {
            await config.pause({from: user1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'pause error message must contain revert');
        }
	});
	
	it(TEST_TAG + 'pausing contract triggers "Paused" event', async () => {
		// admin1 pauses contrat
		let receipt = await config.pause({from: admin1});
		// check for emitted event 'Paused(address account)'
		assert.equal(receipt.logs.length, 1, 'pause should trigger an event');
		assert.equal(receipt.logs[0].event, 'Paused', 'should be the "Paused" event');
		assert.equal(receipt.logs[0].args._admin, admin1, 'logs the admin address');
	});
	
	it(TEST_TAG + 'pausing already paused contract should NOT be possible', async () => {
		// admin trying to pause already paused contract should fail
		let res = await pconfig.pause.call({from: admin1});
		assert.equal(res, false, 'contract should still be paused');
	});
	
	
	
	it(TEST_TAG + 'admin can unpause contract', async () => {
		// admin1 trying to unpause paused contract
		let receipt = await pconfig.unpause({from: admin1});
		assert.equal(await pconfig.isPaused(), false, 'contract pffc should be unpaused by now');
	});
	
	it(TEST_TAG + 'user can NOT unpause contract', async () => {
		// user1 trying to unpause paused contract
		try {
            await pconfig.unpause({from: user1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'unpause error message must contain revert');
        }
	});
	
	it(TEST_TAG + 'unpausing contract triggers "Unpaused" event', async () => {
		// admin1 unpauses paused contrat
		let receipt = await pconfig.unpause({from: admin1});
		// check for emitted event 'Unpaused(address account)'
		assert.equal(receipt.logs.length, 1, 'unpause should trigger an event');
		assert.equal(receipt.logs[0].event, 'Unpaused', 'should be the "Unpaused" event');
		assert.equal(receipt.logs[0].args._admin, admin1, 'logs the admin address');
	});
	
	it(TEST_TAG + 'unpausing already unpaused contract should NOT be possible', async () => {
		// admin trying to unpause already unpaused contract should fail
		let res = await config.unpause.call({from: admin1});
		assert.equal(res, false, 'contract should still be unpaused');
	});
})
