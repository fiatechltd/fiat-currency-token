const FiatToken = artifacts.require("./FiatToken.sol");
const USDF = artifacts.require("./USDf.sol");
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

const common = require("./common.js");
const TEST_TAG = 'Transfers-Controller - ';



contract(common.TEST_CONTRACT_NAME, async accounts => {
	var tokenInstance;
	let contractOwner = accounts[0];
	let admin1 = accounts[1];
	let admin2 = accounts[2];
	let user1 = accounts[3];
	let user2 = accounts[4];
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
		
		await dconfig.enableTransfers(false, {from: contractOwner});
		assert.equal(await dconfig.transfersEnabled(), false, 'transfers should be disabled for dffc by now');
		
		// add a system admin to perform admin operations
		await admins.addAdmin(admin1, {from: contractOwner});
		assert.equal(await config.isAdmin(admin1), true, 'admin1 should have admin role by now');
		
		//await dconfig.addAdmin(admin1, {from: contractOwner});
		assert.equal(await dconfig.isAdmin(admin1), true, 'admin1 should have admin role by now');
    });
	
	
	
	it(TEST_TAG + 'transfers are enabled by default upon deployment', async () => {
		assert.equal(await config.transfersEnabled(), true, 'contract should have transfers enabled upon deployment');
	});
	
	it(TEST_TAG + 'transfers controller has the correct token symbol upon deployment', async () => {
		assert.equal(await ffc.symbol(), common.tokenSymbolUSD, 'transfers controller should have the correct token symbol upon deployment');
	});
	
	
	
	it(TEST_TAG + 'admin can disable transfers', async () => {
		await config.enableTransfers(false, {from: admin1});
		assert.equal(await config.transfersEnabled(), false, 'contract should have transfers disabled by now');
	});
	
	it(TEST_TAG + 'user can NOT disable transfers', async () => {
		// user1 trying to disable transfers should fail
		try {
            await config.enableTransfers(false, {from: user1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'disableTransfers error message must contain revert');
        }
		assert.equal(await config.transfersEnabled(), true, 'contract should still have transfers enabled');
	});
	
	it(TEST_TAG + 'disable transfers should be possible only when they are enabled', async () => {
		let res = await dconfig.enableTransfers.call(false, {from: admin1});
		assert.equal(res, false, 'transfers should still be disabled');
	});
	
	it(TEST_TAG + 'disable transfers should trigger "TransfersDisabled" event', async () => {
		let receipt = await config.enableTransfers(false, {from: admin1});
		// check for emitted event 'TransfersDisabled(address indexed _admin)'
		assert.equal(receipt.logs.length, 1, 'disableTransfers should trigger an event');
		assert.equal(receipt.logs[0].event, 'TransfersDisabled', 'should be the "TransfersDisabled" event');
		assert.equal(receipt.logs[0].args._admin, admin1, 'logs the admin address performing the operation');
	});
	
	
	
	it(TEST_TAG + 'admin can enable transfers', async () => {
		await dconfig.enableTransfers(true, {from: admin1});
		assert.equal(await dconfig.transfersEnabled(), true, 'contract should have transfers enabled by now');
	});
	
	it(TEST_TAG + 'user can NOT enable transfers', async () => {
		// user1 trying to enable transfers should fail
		try {
            await dconfig.enableTransfers(true, {from: user1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'enableTransfers error message must contain revert');
        }
		assert.equal(await dconfig.transfersEnabled(), false, 'contract should still have transfers disabled');
	});
	
	it(TEST_TAG + 'enable transfers should be possible only when they are disabled', async () => {
		let res = await config.enableTransfers.call(true, {from: admin1});
		assert.equal(res, false, 'transfers should still be enabled');
	});
	
	it(TEST_TAG + 'enable transfers should trigger "TransfersEnabled" event', async () => {
		let receipt = await dconfig.enableTransfers(true, {from: admin1});
		// check for emitted event 'TransfersEnabled(address indexed _admin)'
		assert.equal(receipt.logs.length, 1, 'enableTransfers should trigger an event');
		assert.equal(receipt.logs[0].event, 'TransfersEnabled', 'should be the "TransfersEnabled" event');
		assert.equal(receipt.logs[0].args._admin, admin1, 'logs the admin address performing the operation');
	});
})
