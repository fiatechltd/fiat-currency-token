const FiatToken = artifacts.require("./FiatToken.sol");
const USDF = artifacts.require("./USDf.sol");
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

const common = require("./common.js");
const TEST_TAG = 'Fees-Wallet - ';



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
    });
	
	
	
	it(TEST_TAG + 'owner address is the fees collector address upon deployment', async () => {
		assert.equal(await config.feesCollectorWallet({from: contractOwner}), contractOwner, 'contract owner address should be the fees wallet address');
	});
	
	it(TEST_TAG + 'admin can see the fees wallet address', async () => {
		assert.equal(await config.feesCollectorWallet({from: admin1}), contractOwner, 'admin1 should see the fees wallet address');
	});
	
	it(TEST_TAG + 'user can see the fees wallet address', async () => {
		assert.equal(await config.feesCollectorWallet({from: user1}), contractOwner, 'user1 should see the fees wallet address');
	});
	
	
	
	it(TEST_TAG + 'owner can change the fees collector address', async () => {
		// call without submitting changes to the blockchain
		let res = await config.setFeesCollectorWallet.call(admin1, {from: contractOwner});
		assert.equal(res, true, 'setFeesCollectorWallet should return true');
		
		// trying to change fees address submitting changes to blockchain
		await config.setFeesCollectorWallet(admin1, {from: contractOwner});
		assert.equal(await config.feesCollectorWallet({from: contractOwner}), admin1, 'fees wallet address should have changed');
	});
	
	it(TEST_TAG + 'admin can NOT change the fees collector address', async () => {
		await truffleAssert.reverts(
			config.setFeesCollectorWallet(admin1, {from: admin1}), "Owner required"
		);
		assert.equal(await config.feesCollectorWallet({from: contractOwner}), contractOwner, 'fees wallet address should not have changed');
	});
	
	it(TEST_TAG + 'user can NOT change the fees collector address', async () => {
		await truffleAssert.reverts(
			config.setFeesCollectorWallet(user1, {from: user1}), "Owner required"
		);
		assert.equal(await config.feesCollectorWallet({from: contractOwner}), contractOwner, 'fees wallet address should not have changed');
	});
	
	
	
	it(TEST_TAG + 'on fees collector address change, new address has to be different than existing one', async () => {
		let res = await config.setFeesCollectorWallet.call(contractOwner, {from: contractOwner}); // "New fees address must be different than current fees address"
		assert.equal(res, false, 'fees wallet address should not have changed');
	});
})
