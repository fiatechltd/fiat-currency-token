const FiatToken = artifacts.require("./FiatToken.sol");
//const FiatToken = artifacts.require("FiatToken");
const USDF = artifacts.require("./USDf.sol");
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

const common = require("./common.js");
const TEST_TAG = 'ERC20-Blacklist-tests - ';



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
		
		//await admins.addAdmin(admin1, {from: contractOwner});
		assert.equal(await dconfig.isAdmin(admin1), true, 'admin1 should have admin role by now');
		//await dconfig.addAdmin(admin2, {from: contractOwner});
		assert.equal(await dconfig.isAdmin(admin2), true, 'admin2 should have admin role by now');
    });
	
	
	
	/// whenNOTBlacklistedAddress tests
	it(TEST_TAG + 'users can NOT transfer tokens when address is blacklisted', async () => {
		await config.blacklistUserAddress(useR, {from: admin1});
		assert.equal(await config.isBlacklisted(useR), true, 'useR should be blacklisted by now');
		
		await truffleAssert.reverts(
			ffc.transfer(user1, 1000, { from: useR }), "" //"BlacklistController: sender address must NOT be blacklisted!"
		);
		
		await truffleAssert.reverts(
			ffc.transfer(useR, 1000, { from: useR2 }), "" //"BlacklistController: <to> is blacklisted!"
		);
		
		let ok = await ffc.transfer.call(user1, 1000, { from: useR2 });
		assert.equal(ok, true, 'useR2 transfer should return true');
	});
	
	it(TEST_TAG + 'users can NOT approve other users to spend tokens when address is blacklisted', async () => {
		await config.blacklistUserAddress(useR, {from: admin1});
		assert.equal(await config.isBlacklisted(useR), true, 'useR should be blacklisted by now');
		
		await truffleAssert.reverts(
			ffc.approve(user1, 1000, { from: useR }), "" //"BlacklistController: sender address must NOT be blacklisted!"
		);
		
		await truffleAssert.reverts(
			ffc.approve(useR, 1000, { from: useR2 }), "" //"BlacklistController: <spender> is blacklisted!"
		);
		
		let ok = await ffc.approve.call(user1, 1000, { from: useR2 });
		assert.equal(ok, true, 'useR2 approve user1 should return true');
	});
	
	it(TEST_TAG + 'users can NOT spend approved tokens (transferFrom) when address is blacklisted', async () => {
		// useR approves user1 to spend some tokens
		await ffc.approve(user1, 1000, { from: useR });
		await ffc.approve(user2, 1000, { from: useR });
		
		await config.blacklistUserAddress(useR, {from: admin1});
		assert.equal(await config.isBlacklisted(useR), true, 'useR should be blacklisted by now');
		
		await config.blacklistUserAddress(user1, {from: admin1});
		assert.equal(await config.isBlacklisted(user1), true, 'user1 should be blacklisted by now');
		
		await truffleAssert.reverts(
			ffc.transferFrom(useR, user2, 1000, { from: user1 }), "" //"BlacklistController: sender address must NOT be blacklisted!"
		);
		
		await truffleAssert.reverts(
			ffc.transferFrom(useR, user2, 1000, { from: user2 }), "" //"BlacklistController: <from> is blacklisted!"
		);
		
		await config.allowBlacklistedUserAddress(useR, {from: admin1});
		assert.equal(await config.isBlacklisted(useR), false, 'useR should be allowed by now');
		
		await truffleAssert.reverts(
			ffc.transferFrom(useR, user1, 1000, { from: user2 }), "" //"BlacklistController: <to> is blacklisted!"
		);
		
		let ok = await ffc.transferFrom.call(useR, user2, 1000, { from: user2 });
		assert.equal(ok, true, 'user2 transferFrom useR should return true');
	});
});
