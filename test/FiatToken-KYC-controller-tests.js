const FiatToken = artifacts.require("./FiatToken.sol");
const USDF = artifacts.require("./USDf.sol");
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

const common = require("./common.js");
const TEST_TAG = 'KYC-Controller - ';



contract(common.TEST_CONTRACT_NAME, async accounts => {
	var tokenInstance;
	let contractOwner = accounts[0];
	let admin1 = accounts[1];
	let admin2 = accounts[2];
	let user1 = accounts[3];
	let user2 = accounts[4];
	let ffc;
	let effc;
	let config;
	let fees;
	let econfig;
	let efees;
	let admins;
	
	
	
	// 'beforeEach' function will run before each test creating a new instance of the contract each time
	beforeEach('setup contract for each test', async () => {
		//let ffc = await FiatToken.deployed();
        //ffc = await common.createNewUSDContract(contractOwner);
		//effc = await common.createNewUSDContract(contractOwner);
		[ffc, admins, config, fees] = await common.createNewUSDContract(contractOwner);
		[effc, , econfig, efees] = await common.createNewUSDContractWithParams(contractOwner, admins);
		
		//config = await common.getConfig(ffc);
		//fees = await common.getTransferFees(ffc);
		//econfig = await common.getConfig(effc);
		//efees = await common.getTransferFees(effc);
		
		await econfig.enableKYC(true, {from: contractOwner});
		assert.equal(await econfig.isKYCEnabled(), true, 'KYC should be enabled for effc by now');
		
		// add a system admin to perform admin operations
		await admins.addAdmin(admin1, {from: contractOwner});
		assert.equal(await config.isAdmin(admin1), true, 'admin1 should have admin role by now');
		
		//await econfig.addAdmin(admin1, {from: contractOwner});
		assert.equal(await econfig.isAdmin(admin1), true, 'admin1 should have admin role by now');
    });
	
	
	
	it(TEST_TAG + 'KYC is disabled by default upon deployment', async () => {
		assert.equal(await config.isKYCEnabled(), false, 'contract should have KYC disabled upon deployment');
	});
	
	it(TEST_TAG + 'KYC controller has the correct token symbol upon deployment', async () => {
		assert.equal(await ffc.symbol(), common.tokenSymbolUSD, 'KYC controller should have the correct token symbol upon deployment');
	});
	
	
	
	it(TEST_TAG + 'admin can enable KYC', async () => {
		await config.enableKYC(true, {from: admin1});
		assert.equal(await config.isKYCEnabled(), true, 'contract should have KYC enabled by now');
	});
	
	it(TEST_TAG + 'user can NOT enable KYC', async () => {
		// user1 trying to enable KYC should fail
		try {
            await config.enableKYC(true, {from: user1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'enableKYC error message must contain revert');
        }
		assert.equal(await config.isKYCEnabled(), false, 'contract should still have KYC disabled');
	});
	
	it(TEST_TAG + 'enable KYC should be possible only when they are disabled', async () => {
		let res = await econfig.enableKYC.call(true, {from: admin1});
        assert.equal(res, false, 'KYC should still be enabled');
	});
	
	it(TEST_TAG + 'enable KYC should trigger "KYCEnabled" event', async () => {
		let receipt = await config.enableKYC(true, {from: admin1});
		// check for emitted event 'KYCEnabled(address indexed _admin, string _symbol)'
		assert.equal(receipt.logs.length, 1, 'enableKYC should trigger an event');
		assert.equal(receipt.logs[0].event, 'KYCEnabled', 'should be the "KYCEnabled" event');
		assert.equal(receipt.logs[0].args._admin, admin1, 'logs the admin address performing the operation');
	});
	
	
	
	it(TEST_TAG + 'admin can disable KYC', async () => {
		await econfig.enableKYC(false, {from: admin1});
		assert.equal(await econfig.isKYCEnabled(), false, 'contract should have KYC disabled by now');
	});
	
	it(TEST_TAG + 'user can NOT disable KYC', async () => {
		// user1 trying to disable KYC should fail
		try {
            await econfig.enableKYC(false, {from: user1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'disableKYC error message must contain revert');
        }
		assert.equal(await econfig.isKYCEnabled(), true, 'contract should still have KYC enabled');
	});
	
	it(TEST_TAG + 'disable KYC should be possible only when they are enabled', async () => {
		let res = await config.enableKYC.call(false, {from: admin1});
		assert.equal(res, false, 'KYC should still be disabled');
	});
	
	it(TEST_TAG + 'disable KYC should trigger "KYCDisabled" event', async () => {
		let receipt = await econfig.enableKYC(false, {from: admin1});
		// check for emitted event 'KYCDisabled(address indexed _admin, string _symbol)'
		assert.equal(receipt.logs.length, 1, 'disableKYC should trigger an event');
		assert.equal(receipt.logs[0].event, 'KYCDisabled', 'should be the "KYCDisabled" event');
		assert.equal(receipt.logs[0].args._admin, admin1, 'logs the admin address performing the operation');
	});
})
