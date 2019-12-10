const FiatToken = artifacts.require("./FiatToken.sol");
const USDF = artifacts.require("./USDf.sol");
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

const common = require("./common.js");
const TEST_TAG = 'No-Fee-Address-Role - ';



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
		//ffc = await common.createNewUSDContract(contractOwner);
		[ffc, admins, config, fees] = await common.createNewUSDContract(contractOwner);
		
		//config = await common.getConfig(ffc);
		//fees = await common.getTransferFees(ffc);
		
		// add a system admin to perform admin operations
		await admins.addAdmin(admin1, {from: contractOwner});
		assert.equal(await config.isAdmin(admin1), true, 'admin1 should have admin role by now');
		await admins.addAdmin(admin2, {from: contractOwner});
		assert.equal(await config.isAdmin(admin2), true, 'admin2 should have admin role by now');
		
		// add no fee address roles for admins
		await config.addNoFeeAddress(admin1, {from: contractOwner});
		assert.equal(await config.isNoFeeAddress(admin1), true, 'admin1 should have admin address role by now');
		await config.addNoFeeAddress(admin2, {from: contractOwner});
		assert.equal(await config.isNoFeeAddress(admin2), true, 'admin2 should have admin address role by now');
    });
	
	
	
	it(TEST_TAG + 'owner has no fee address role upon deployment', async () => {
		assert.equal(await config.isNoFeeAddress(contractOwner), true, 'contract owner should have admin address role');
	});
	
	it(TEST_TAG + 'admin1 is admin being added by owner', async () => {
		assert.equal(await config.isNoFeeAddress(admin1), true, 'admin1 should have no fee address role');
	});
	
	it(TEST_TAG + 'user1 has NO no fee address role upon deployment', async () => {
		assert.equal(await config.isNoFeeAddress(user1), false, 'user1 should NOT have no fee address role');
	});
	
	
	
	it(TEST_TAG + 'owner can add a new no fee address', async () => {
		// contract owner tries to add no fee address role for user1
		await config.addNoFeeAddress(user1, {from: contractOwner});
		assert.equal(await config.isNoFeeAddress(user1), true, 'user1 should have no fee address role by now');
	});
	
	it(TEST_TAG + 'admin can NOT add a new no fee address', async () => {
		// admin1 trying to add no fee address role for user2 should fail
		await truffleAssert.reverts(
			config.addNoFeeAddress(user2, {from: admin1}), "Owner required"
		);
	});
	
	it(TEST_TAG + 'existing no fee address can not be added twice', async () => {
		// make sure user address is already no fee address before trying to give him that role
		assert.equal(await config.isNoFeeAddress(admin1), true, 'admin1 should have no fee address role');
		
		// trying to add no fee address role to an existing admin address should fail
		await truffleAssert.reverts(
			config.addNoFeeAddress(admin1, {from: contractOwner}), "No fee address already added"
		);
	});
	
	it(TEST_TAG + 'adding a no fee address triggers the "NoFeeAddressAdded" event', async () => {
		// give no fee address role to user1
		let tx = await config.addNoFeeAddress(user1, {from: contractOwner});
		// check for emitted event 'NoFeeAddressAdded(address indexed admin, address indexed account)'
		truffleAssert.eventEmitted(tx, 'NoFeeAddressAdded', (ev) => {
			return ev.admin === contractOwner && ev.account === user1;
        });
	});
	
	
	
	it(TEST_TAG + 'user can NOT add a new no fee address', async () => {
		// user1 trying to add no fee address role to himself should fail
		await truffleAssert.reverts(
			config.addNoFeeAddress(user1, {from: user1}), "Owner required"
		);
		assert.equal(await config.isNoFeeAddress(user1), false, 'user1 should NOT have no fee address role');
		
		// user1 trying to add no fee address role to another user should fail
		await truffleAssert.reverts(
			config.addNoFeeAddress(user2, {from: user1}), "Owner required"
		);
		assert.equal(await config.isNoFeeAddress(user2), false, 'user2 should NOT have no fee address role');
	});
	
	
	
	it(TEST_TAG + 'owner can remove a no fee address', async () => {
		// contract owner tries to remove admin1 no fee address role
		await config.removeNoFeeAddress(admin1, {from: contractOwner});
		assert.equal(await config.isNoFeeAddress(admin1), false, 'admin1 should not have no fee address role by now');
	});
	
	it(TEST_TAG + 'admin can not remove another no fee address', async () => {
		// admin1 tries to remove admin2 no fee address role
		await truffleAssert.reverts(
			config.removeNoFeeAddress(admin2, {from: admin1}), "Owner required"
		);
		assert.equal(await config.isNoFeeAddress(admin2), true, 'admin2 should still have no fee address role');
	});
	
	it(TEST_TAG + 'admin can not remove contract owner no fee address role', async () => {
		// admin1 tries to remove contract owner no fee address role
		await truffleAssert.reverts(
			config.removeNoFeeAddress(contractOwner, {from: admin1}), "Owner required"
		);
		assert.equal(await config.isNoFeeAddress(contractOwner), true, 'contract owner should still have no fee address role');
	});
	
	it(TEST_TAG + 'owner can remove his no fee address role', async () => {
		// contract owner tries to remove his no fee address role
		await config.removeNoFeeAddress(contractOwner, {from: contractOwner});
		assert.equal(await config.isNoFeeAddress(contractOwner), false, 'contract owner should have no fee address role removed by now');
	});
	
	
	
	it(TEST_TAG + 'user can not remove contract owner no fee address role', async () => {
		// user1 tries to remove contract owner no fee address role
		await truffleAssert.reverts(
			config.removeNoFeeAddress(contractOwner, {from: user1}), "Owner required"
		);
		assert.equal(await config.isNoFeeAddress(contractOwner), true, 'contract owner should still have no fee address role');
	});
	
	it(TEST_TAG + 'user can not remove no fee address role from admin', async () => {
		// user1 tries to remove admin1 no fee address role
		await truffleAssert.reverts(
			config.removeNoFeeAddress(admin1, {from: user1}), "Owner required"
		);
		assert.equal(await config.isNoFeeAddress(admin1), true, 'admin1 should still have admin address role');
	});
	
	it(TEST_TAG + 'user can not remove other users no fee address role', async () => {
		// user1 tries to remove user2 no fee address role that he does not have
		await truffleAssert.reverts(
			config.removeNoFeeAddress(user2, {from: user1}), "Owner required"
		);
		assert.equal(await config.isNoFeeAddress(user2), false, 'user2 should still have no fee address role');
	});
	
	it(TEST_TAG + 'removing an admin triggers the "NoFeeAddressRemoved" event', async () => {
		// remove no fee address role from admin1
		let tx = await config.removeNoFeeAddress(admin1, {from: contractOwner});
		// check for emitted event 'NoFeeAddressRemoved(address indexed admin, address indexed account)'
		truffleAssert.eventEmitted(tx, 'NoFeeAddressRemoved', (ev) => {
			return ev.admin === contractOwner && ev.account === admin1;
        });
		// there should be no 'NoFeeAddressRenounced' events
        truffleAssert.eventNotEmitted(tx, 'NoFeeAddressRenounced');
	});
	
	
	
	it(TEST_TAG + 'owner can renounce to his no fee address role', async () => {
		// contrat owner tries to renounce to his no fee address role
		await config.renounceNoFeeAddress({from: contractOwner});
		assert.equal(await config.isNoFeeAddress(contractOwner), false, 'contract owner should have no fee address role removed by now');
	});
	
	it(TEST_TAG + 'admin can renounce to his no fee address role', async () => {
		// admin1 renounces to his no fee address role
		await config.renounceNoFeeAddress({from: admin1});
		assert.equal(await config.isNoFeeAddress(admin1), false, 'admin1 should have no fee address role removed by now');
	});
	
	it(TEST_TAG + 'user can NOT renounce to no fee address role as he does NOT have one', async () => {
		// user1 tries to renounce to no fee address role that he does not have
		await truffleAssert.reverts(
			config.renounceNoFeeAddress({from: user1}), "Renounce no fee address only"
		);
		assert.equal(await config.isNoFeeAddress(user1), false, 'user1 should still have NO no fee address role');
	});
	
	it(TEST_TAG + 'admin renounce triggers "NoFeeAddressRenounced" event', async () => {
		// admin1 renounces to his no fee address role
		let tx = await config.renounceNoFeeAddress({from: admin1});
		// check for emitted event 'NoFeeAddressRenounced(address indexed account)'
		truffleAssert.eventEmitted(tx, 'NoFeeAddressRenounced', (ev) => {
			return ev.account === admin1;
        });
		// there should be no 'NoFeeAddressRemoved' events
        truffleAssert.eventNotEmitted(tx, 'NoFeeAddressRemoved');
	});
})
