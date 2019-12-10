const FiatToken = artifacts.require("./FiatToken.sol");
const USDF = artifacts.require("./USDf.sol");
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

const common = require("./common.js");
const TEST_TAG = 'KYC - ';



contract(common.TEST_CONTRACT_NAME, async accounts => {
	var tokenInstance;
	let contractOwner = accounts[0];
	let admin1 = accounts[1];
	let admin2 = accounts[2];
	let user1 = accounts[3];
	let user2 = accounts[4];
	let ffc;
	let sym;
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
		
		// add a system admin to perform admin operations
		await admins.addAdmin(admin1, {from: contractOwner});
		assert.equal(await config.isAdmin(admin1), true, 'admin1 should have admin role by now');
		await admins.addAdmin(admin2, {from: contractOwner});
		assert.equal(await config.isAdmin(admin2), true, 'admin2 should have admin role by now');
		
		// admins is KYC approved upon deployment for testing purposes
		await config.approveKYCUserAddress(admin1, {from: contractOwner});
		await config.approveKYCUserAddress(admin2, {from: contractOwner});
		
		sym = await ffc.symbol();
    });
	
	
	
	it(TEST_TAG + 'owner is the first/default KYC approved upon deployment', async () => {
		assert.equal(await config.isKYCApproved(contractOwner), true, 'contract owner should be KYC approved');
	});
	
	it(TEST_TAG + 'user1 is NOT KYC approved upon deployment', async () => {
		assert.equal(await config.isKYCApproved(user1), false, 'user1 should NOT be KYC approved upon deployment');
	});
	
	
	
	it(TEST_TAG + 'owner can add a new KYC approved user', async () => {
		// contract owner tries to add user1 KYC approved
		await config.approveKYCUserAddress(user1, {from: contractOwner});
		assert.equal(await config.isKYCApproved(user1), true, 'user1 should be KYC approved by now');
	});
	
	it(TEST_TAG + 'admin can add a new KYC approved user', async () => {
		// admin1 tries to add user2 KYC approved
		await config.approveKYCUserAddress(user2, {from: admin1});
		assert.equal(await config.isKYCApproved(user2), true, 'user2 should be KYC approved by now');
	});
	
	it(TEST_TAG + 'new KYC approved user can not be added if he was already approved', async () => {
		// make sure user address is already KYC approved before trying to add him
		assert.equal(await config.isKYCApproved(admin1), true, 'admin1 should be KYC approved');
		
		// trying to KYC approve admin should fail
		try {
            await config.approveKYCUserAddress(admin1, {from: contractOwner});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'approveKYCUserAddress error message must contain revert');
        }
	});
	
	it(TEST_TAG + 'adding a new KYC approved user triggers the "KYCUserApproved" event', async () => {
		// admin1 KYC approved user1
		let receipt = await config.approveKYCUserAddress(user1, {from: admin1});
		// check for emitted event 'KYCAddressApproved(address indexed _admin, address indexed _userAddress)'
		assert.equal(receipt.logs.length, 1, 'triggers one event');
		assert.equal(receipt.logs[0].event, 'KYCAddressApproved', 'should be the "KYCAddressApproved" event');
		assert.equal(receipt.logs[0].args._admin, admin1, 'logs the admin address performing the operation');
		assert.equal(receipt.logs[0].args._userAddress, user1, 'logs the new address KYC approved');
	});
	
	
	
	it(TEST_TAG + 'user can NOT add KYC approved status to user', async () => {
		// user1 trying to KYC approve himself should fail
		try {
            await config.approveKYCUserAddress(user1, {from: user1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'approveKYCUserAddress error message must contain revert');
        }
		assert.equal(await config.isKYCApproved(user1), false, 'user1 should NOT be KYC approved');
		
		// user1 trying to KYC approve another user should fail
		try {
            await config.approveKYCUserAddress(user2, {from: user1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'approveKYCUserAddress error message must contain revert');
        }
		assert.equal(await config.isKYCApproved(user2), false, 'user2 should NOT be KYC approved');
	});
	
	
	
	it(TEST_TAG + 'owner can remove KYC approved status to user', async () => {
		// contract owner tries to remove KYC approved status to admin1
		await config.disapproveKYCUserAddress(admin1, {from: contractOwner});
		assert.equal(await config.isKYCApproved(admin1), false, 'admin1 should be KYC dispproved by now');
	});
	
	it(TEST_TAG + 'admin can remove KYC approved status to another admin', async () => {
		// admin1 tries to remove KYC approve status to admin2
		await config.disapproveKYCUserAddress(admin2, {from: admin1});
        assert.equal(await config.isKYCApproved(admin2), false, 'admin2 should be KYC disapproved by now');
	});
	
	it(TEST_TAG + 'admin can not remove KYC approve status to contract owner', async () => {
		// admin1 tries to remove KYC approved status to contract owner
		try {
            await config.disapproveKYCUserAddress(contractOwner, {from: admin1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'disapproveKYCUserAddress error message must contain revert');
        }
		assert.equal(await config.isKYCApproved(contractOwner), true, 'contract owner should still be KYC approved');
	});
	
	it(TEST_TAG + 'owner can not remove his KYC approved status', async () => {
		// contract owner tries to remove his KYC approved statuc
		try {
            await config.disapproveKYCUserAddress(contractOwner, {from: contractOwner});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'disapproveKYCUserAddress error message must contain revert');
        }
		assert.equal(await config.isKYCApproved(contractOwner), true, 'contract owner should still be KYC approved');
	});
	
	
	
	it(TEST_TAG + 'user can not remove KYC approved status for contract owner', async () => {
		// user1 tries to remove KYC approved status for contract owner
		try {
            await config.disapproveKYCUserAddress(contractOwner, {from: user1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'disapproveKYCUserAddress error message must contain revert');
        }
		assert.equal(await config.isKYCApproved(contractOwner), true, 'contract owner should still have KYC status approved');
	});
	
	it(TEST_TAG + 'user can not remove KYC approved status for admin', async () => {
		// user1 tries to remove KYC approved status for admin1
		try {
            await config.disapproveKYCUserAddress(admin1, {from: user1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'disapproveKYCUserAddress error message must contain revert');
        }
		assert.equal(await config.isKYCApproved(admin1), true, 'admin1 should still have KYC status approved');
	});
	
	it(TEST_TAG + 'user can not remove KYC approved status for other users', async () => {
		// user1 tries to remove KYC approved status for user2
		try {
            await config.disapproveKYCUserAddress(user2, {from: user1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'disapproveKYCUserAddress error message must contain revert');
        }
		assert.equal(await config.isKYCApproved(user2), false, 'user2 should still have KYC status disapproved');
	});
	
	it(TEST_TAG + 'removing KYC approved status for admin1 triggers the "KYCUserDisapproved" event', async () => {
		// remove KYC approved status to admin1
		let receipt = await config.disapproveKYCUserAddress(admin1, {from: contractOwner});
		// check for emitted event 'KYCAddressDisapproved(address indexed _admin, address indexed _userAddress)'
		assert.equal(receipt.logs.length, 1, 'disapproveKYCUserAddress should trigger an event');
		assert.equal(receipt.logs[0].event, 'KYCAddressDisapproved', 'should be the "KYCAddressDisapproved" event');
		assert.equal(receipt.logs[0].args._admin, contractOwner, 'logs the admin address performing the operation');
		assert.equal(receipt.logs[0].args._userAddress, admin1, 'logs the address being removed KYC approved status to');
	});
})
