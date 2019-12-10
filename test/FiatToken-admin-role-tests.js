const FiatechFiatCurrency = artifacts.require("./FiatToken.sol");
const USDF = artifacts.require("./USDf.sol");
//const USDf_config = artifacts.require("./USDf_config.sol");
const USDf_config = artifacts.require("./Config.sol");
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

var common = require("./common.js");
const TEST_TAG = 'Admin-Role - ';



contract(common.TEST_CONTRACT_NAME, async accounts => {
	var tokenInstance;
	let contractOwner = accounts[0];
	let admin1 = accounts[1];
	let admin2 = accounts[2];
	let user1 = accounts[3];
	let user2 = accounts[4];
	let ffc;
	let config;
	let fees;
	let admins;
	
	
	// 'beforeEach' function will run before each test creating a new instance of the contract each time
	beforeEach('setup contract for each test', async () => {
		//let ffc = await FiatechFiatCurrency.deployed();
        //ffc = await FiatechFiatCurrency.new(common.tokenSymbolUSD, common.tokenNameUSD, common.tokenVersion, common.tokenDecimals, {from: contractOwner});
		[ffc, admins, config, fees] = await common.createNewUSDContract(contractOwner);
		
		//config = await common.getConfig(ffc);
		//fees = await common.getTransferFees(ffc);
		//admins = await common.getAdmins(config);
		//config = common.config;
		//fees = common.fees;
		//admins = common.admins;
		
		// add a system admin to perform admin operations
		await admins.addAdmin(admin1, {from: contractOwner});
		assert.equal(await config.isAdmin(admin1), true, 'admin1 should have admin role by now');
		await admins.addAdmin(admin2, {from: contractOwner});
		assert.equal(await config.isAdmin(admin2), true, 'admin2 should have admin role by now');
    });
	
	
	
	it(TEST_TAG + 'owner is the first/default admin upon deployment', async () => {
		assert.equal(await config.isAdmin(contractOwner), true, 'contract owner should have admin role');
	});
	
	it(TEST_TAG + 'admin1 is admin upon deployment', async () => {
		assert.equal(await config.isAdmin(admin1), true, 'admin1 should have admin role');
	});
	
	it(TEST_TAG + 'user1 is NOT admin upon deployment', async () => {
		assert.equal(await config.isAdmin(user1), false, 'user1 should NOT have admin role');
	});
	
	
	
	it(TEST_TAG + 'owner can add a new system admin', async () => {
		// contract owner tries to add admin role for user1
		await admins.addAdmin(user1, {from: contractOwner});
		assert.equal(await config.isAdmin(user1), true, 'user1 should have admin role by now');
	});
	
	it(TEST_TAG + 'admin can not add a new system admin', async () => {
		// admin1 trying to add admin role for user2 should fail
		try {
            await admins.addAdmin(user2, {from: admin1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'addAdmin error message must contain revert');
        }
		assert.equal(await config.isAdmin(user2), false, 'user2 should not have admin role');
	});
	
	it(TEST_TAG + 'new admin can not be added if he already has admin role', async () => {
		// make sure user address is already admin before trying to give him that role
		assert.equal(await config.isAdmin(admin1), true, 'admin1 should have admin role');
		
		// trying to add admin role to an admin should fail
		try {
            await admins.addAdmin(admin1, {from: contractOwner});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'addAdmin error message must contain revert');
        }
	});
	
	it(TEST_TAG + 'adding an admin triggers the "AdminAdded" event', async () => {
		// give admin role to user1
		let receipt = await admins.addAdmin(user1, {from: contractOwner});
		// check for emitted event 'AdminAdded(address indexed admin, address indexed account)'
		assert.equal(receipt.logs.length, 1, 'addAdmin should trigger an event');
		assert.equal(receipt.logs[0].event, 'AdminAdded', 'should be the "AdminAdded" event');
		assert.equal(receipt.logs[0].args.admin, contractOwner, 'logs the admin address performing the operation');
		assert.equal(receipt.logs[0].args.account, user1, 'logs the new address given admin role');
	});
	
	
	
	it(TEST_TAG + 'user can NOT add a new system admin', async () => {
		// user1 trying to add admin role to himself should fail
		try {
            await admins.addAdmin(user1, {from: user1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'addAdmin error message must contain revert');
        }
		assert.equal(await config.isAdmin(user1), false, 'user1 should NOT have admin role');
		
		// user1 trying to add admin role to another user should fail
		try {
            await admins.addAdmin(user2, {from: user1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'addAdmin error message must contain revert');
        }
		assert.equal(await config.isAdmin(user2), false, 'user2 should NOT have admin role');
	});
	
	
	
	it(TEST_TAG + 'owner can remove a system admin', async () => {
		// contract owner tries to remove admin1 admin role
		await admins.removeAdmin(admin1, {from: contractOwner});
		assert.equal(await config.isAdmin(admin1), false, 'admin1 should not have admin role by now');
	});
	
	it(TEST_TAG + 'admin can not remove another admin', async () => {
		// admin1 tries to remove admin2 admin role
		try {
            await admins.removeAdmin(admin2, {from: admin1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'removeAdmin error message must contain revert');
        }
		assert.equal(await config.isAdmin(admin2), true, 'admin2 should still have admin role');
	});
	
	it(TEST_TAG + 'admin can not remove admin role for contract owner', async () => {
		// admin1 tries to remove contract owner admin role
		try {
            await admins.removeAdmin(contractOwner, {from: admin1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'removeAdmin error message must contain revert');
        }
		assert.equal(await config.isAdmin(contractOwner), true, 'contract owner should still have admin role');
	});
	
	it(TEST_TAG + 'owner can not remove his admin role', async () => {
		// contract owner tries to remove his admin role
		try {
            await admins.removeAdmin(contractOwner, {from: contractOwner});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'removeAdmin error message must contain revert');
        }
		assert.equal(await config.isAdmin(contractOwner), true, 'contract owner should still have admin role');
	});
	
	
	
	it(TEST_TAG + 'user can not remove admin role for contract owner', async () => {
		// user1 tries to remove contract owner admin role
		try {
            await admins.removeAdmin(contractOwner, {from: user1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'removeAdmin error message must contain revert');
        }
		assert.equal(await config.isAdmin(contractOwner), true, 'contract owner should still have admin role');
	});
	
	it(TEST_TAG + 'user can not remove admin role for admin', async () => {
		// user1 tries to remove admin1 admin role
		try {
            await admins.removeAdmin(admin1, {from: user1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'removeAdmin error message must contain revert');
        }
		assert.equal(await config.isAdmin(admin1), true, 'admin1 should still have admin role');
	});
	
	it(TEST_TAG + 'user can not remove admin role for other users', async () => {
		// user1 tries to remove user2 admin role that he does not have
		try {
            await admins.removeAdmin(user2, {from: user1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'removeAdmin error message must contain revert');
        }
		assert.equal(await config.isAdmin(user2), false, 'user2 should still have no admin role');
	});
	
	it(TEST_TAG + 'removing an admin triggers the "AdminRemoved" event', async () => {
		// remove admin role to admin1
		let receipt = await admins.removeAdmin(admin1, {from: contractOwner});
		// check for emitted event 'AdminRemoved(address indexed admin, address indexed account)'
		assert.equal(receipt.logs.length, 1, 'removeAdmin should trigger an event');
		assert.equal(receipt.logs[0].event, 'AdminRemoved', 'should be the "AdminRemoved" event');
		assert.equal(receipt.logs[0].args.admin, contractOwner, 'logs the admin address performing the operation');
		assert.equal(receipt.logs[0].args.account, admin1, 'logs the address being removed admin role to');
	});
	
	
	
	it(TEST_TAG + 'owner can NOT renounce to his admin role', async () => {
		// contrat owner tries to renounce to his admin role
		try {
            await admins.renounceAdmin({from: contractOwner});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'renounceAdmin error message must contain revert');
        }
		assert.equal(await config.isAdmin(contractOwner), true, 'contract owner should still have admin role');
	});
	
	it(TEST_TAG + 'admin can renounce to his admin role', async () => {
		// admin1 renounces to his admin role
		await admins.renounceAdmin({from: admin1});
		assert.equal(await config.isAdmin(admin1), false, 'admin1 should have NO admin role by now');
	});
	
	it(TEST_TAG + 'user can NOT renounce to admin role as he does NOT have one', async () => {
		// user1 tries to renounce to admin role that he does not have
		try {
            await admins.renounceAdmin({from: user1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'renounceAdmin error message must contain revert');
        }
		assert.equal(await config.isAdmin(user1), false, 'user1 should still have NO admin role');
	});
	
	it(TEST_TAG + 'admin renounce triggers "AdminRenounced" event', async () => {
		// admin1 renounces to his admin role
		let receipt = await admins.renounceAdmin({from: admin1});
		// check for emitted event 'AdminRenounced(address indexed account)'
		assert.equal(receipt.logs.length, 1, 'renounceAdmin should trigger an event');
		assert.equal(receipt.logs[0].event, 'AdminRenounced', 'should be the "AdminRenounced" event');
		assert.equal(receipt.logs[0].args.account, admin1, 'logs the admin address renounced his admin role');
	});
})
