const FiatechFiatCurrency = artifacts.require("./FiatToken.sol");
const USDF = artifacts.require("./USDf.sol");
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

const common = require("./common.js");
const TEST_TAG = 'Blacklist-Controller - ';



contract(common.TEST_CONTRACT_NAME, async accounts => {
	var tokenInstance;
	let contractOwner = accounts[0];
	let admin1 = accounts[1];
	let admin2 = accounts[2];
	let user1 = accounts[3];
	let user2 = accounts[4];
	let user3 = accounts[5];
	let ffc;
	let sym;
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
		//config = common.config;
		//fees = common.fees;
		//admins = common.admins;
		
		// add a system admin to perform admin operations
		await admins.addAdmin(admin1, {from: contractOwner});
		assert.equal(await config.isAdmin(admin1), true, 'admin1 should have admin role by now');
		await admins.addAdmin(admin2, {from: contractOwner});
		assert.equal(await config.isAdmin(admin2), true, 'admin2 should have admin role by now');
		
		// admin2 is blacklisted upon deployment for testing purposes
		await config.blacklistUserAddress(admin2, {from: contractOwner});
		await config.blacklistUserAddress(user2, {from: contractOwner});
		
		sym = await ffc.symbol();
    });
	
	
	
	it(TEST_TAG + 'owner is NOT blacklisted upon deployment', async () => {
		assert.equal(await config.isBlacklisted(contractOwner), false, 'contract owner should NOT be blacklisted upon deployment');
	});
	
	it(TEST_TAG + 'user1 is NOT blacklisted upon deployment', async () => {
		assert.equal(await config.isBlacklisted(user1), false, 'user1 should NOT be blacklisted upon deployment');
	});
	
	
	
	it(TEST_TAG + 'admin can blacklist a user', async () => {
		// admin1 tries to blacklist user2
		await config.blacklistUserAddress(user3, {from: admin1});
		assert.equal(await config.isBlacklisted(user3), true, 'user3 should be blacklisted by now');
	});
	
	it(TEST_TAG + 'admin can NOT blacklist contract owner', async () => {
		// admin1 tries to blacklist owner
		try {
            await config.blacklistUserAddress(contractOwner, {from: admin1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'blacklistUserAddress error message must contain revert');
        }
		assert.equal(await config.isBlacklisted(contractOwner), false, 'contractOwner should NOT be blacklisted');
	});
	
	it(TEST_TAG + 'contract owner can NOT blacklist himself', async () => {
		// owner tries to blacklist himself should fail
		try {
            await config.blacklistUserAddress(contractOwner, {from: contractOwner});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'blacklistUserAddress error message must contain revert');
        }
		assert.equal(await config.isBlacklisted(contractOwner), false, 'contractOwner should NOT be blacklisted');
	});
	
	it(TEST_TAG + 'blacklisted user can not be blacklisted twice', async () => {
		// make sure user address is already blacklisted before trying to blacklist again
		assert.equal(await config.isBlacklisted(admin2), true, 'admin2 should be blacklisted by now');
		
		// trying to KYC approve admin should fail
		try {
            await config.blacklistUserAddress(admin2, {from: contractOwner});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'blacklistUserAddress error message must contain revert');
        }
	});
	
	it(TEST_TAG + 'blacklisting a user triggers the "BlacklistedAddress" event', async () => {
		// admin1 blacklists user1
		let receipt = await config.blacklistUserAddress(user1, {from: admin1});
		// check for emitted event 'BlacklistedAddress(address indexed _admin, address indexed _userAddress, string _symbol)'
		assert.equal(receipt.logs.length, 1, 'triggers one event');
		assert.equal(receipt.logs[0].event, 'BlacklistedAddress', 'should be the "BlacklistedAddress" event');
		assert.equal(receipt.logs[0].args._admin, admin1, 'logs the admin address performing the operation');
		assert.equal(receipt.logs[0].args._userAddress, user1, 'logs the new blacklisted address');
	});
	
	
	
	it(TEST_TAG + 'user can NOT blacklist another user', async () => {
		// user1 trying to blacklist himself should fail
		try {
            await config.blacklistUserAddress(user1, {from: user1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'blacklistUserAddress error message must contain revert');
        }
		assert.equal(await config.isBlacklisted(user1), false, 'user1 should NOT be blacklisted');
		
		// user1 trying to blacklist another user should fail
		try {
            await config.blacklistUserAddress(user2, {from: user1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'blacklistUserAddress error message must contain revert');
        }
		assert.equal(await config.isBlacklisted(user2), true, 'user2 should still be blacklisted');
	});
	
	
	
	it(TEST_TAG + 'admin can allow blacklisted user address and make it be back to normal', async () => {
		// admin1 tries to allow blacklisted address to admin2
		await config.allowBlacklistedUserAddress(admin2, {from: admin1});
        assert.equal(await config.isBlacklisted(admin2), false, 'admin2 should NOT be blacklisted by now');
	});
	
	it(TEST_TAG + 'admin can NOT allow user address that is NOT blacklisted', async () => {
		// admin1 tries to allow user address that is not blacklisted
		try {
            await config.allowBlacklistedUserAddress(user1, {from: admin1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'allowBlacklistedUserAddress error message must contain revert');
        }
		assert.equal(await config.isBlacklisted(user1), false, 'user1 should NOT be blacklisted');
	});
	
	
	
	it(TEST_TAG + 'user can NOT allow other blacklisted users address', async () => {
		// user1 tries to allow blacklisted user2
		try {
            await config.allowBlacklistedUserAddress(user2, {from: user1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'allowBlacklistedUserAddress error message must contain revert');
        }
		assert.equal(await config.isBlacklisted(user2), true, 'user2 should still be blacklisted');
	});
	
	it(TEST_TAG + 'allowing blacklisted user address triggers the "AllowedAddress" event', async () => {
		// allow blacklisted address for admin1
		let receipt = await config.allowBlacklistedUserAddress(user2, {from: admin1});
		// check for emitted event 'AllowedBlacklistedAddress(address indexed _admin, address indexed _userAddress, string _symbol)'
		assert.equal(receipt.logs.length, 1, 'allowBlacklistedUserAddress should trigger an event');
		assert.equal(receipt.logs[0].event, 'AllowedBlacklistedAddress', 'should be the "AllowedBlacklistedAddress" event');
		assert.equal(receipt.logs[0].args._admin, admin1, 'logs the admin address performing the operation');
		assert.equal(receipt.logs[0].args._userAddress, user2, 'logs the blacklisted address being allowed');
	});
})
