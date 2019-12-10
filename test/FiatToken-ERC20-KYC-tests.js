const FiatToken = artifacts.require("./FiatToken.sol");
//const FiatToken = artifacts.require("FiatToken");
const USDF = artifacts.require("./USDf.sol");
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

const common = require("./common.js");
const TEST_TAG = 'ERC20-KYC-tests - ';



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
	
	
	
	/// whenKYCDisabledOrApprovedAddress tests
	it(TEST_TAG + 'users can NOT transfer tokens when contract has KYC enabled and address is not approved', async () => {
		await config.enableKYC({from: admin1});
		assert.equal(await config.isKYCEnabled(), true, 'contract should be have KYC enabled by now');
		
		await truffleAssert.reverts(
			ffc.transfer(user1, 1000, { from: useR }), "" //"KYC: sender address must be approved!"
		);
		
		await config.approveKYCUserAddress(useR, { from: admin1 });
		assert.equal(await config.isKYCApproved(useR), true, 'useR should have KYC approved status by now');
		
		await truffleAssert.reverts(
			ffc.transfer(user1, 1000, { from: useR }), "" //"KYC: <to> KYC is not approved!"
		);
		
		await config.approveKYCUserAddress(user1, { from: admin1 });
		assert.equal(await config.isKYCApproved(user1), true, 'user1 should have KYC approved status by now');
		
		let ok = await ffc.transfer.call(user1, 1000, { from: useR });
		assert.equal(ok, true, 'useR transfer should return true');
	});
	
	it(TEST_TAG + 'users can NOT approve other users to spend tokens when contract has KYC enabled and address is not approved', async () => {
		await config.enableKYC({from: admin1});
		assert.equal(await config.isKYCEnabled(), true, 'contract should be have KYC enabled by now');
		
		await truffleAssert.reverts(
			ffc.approve(user1, 1000, { from: useR }), "" //"KYC: sender address must be approved!"
		);
		
		await config.approveKYCUserAddress(useR, { from: admin1 });
		assert.equal(await config.isKYCApproved(useR), true, 'useR should have KYC approved status by now');
		
		await truffleAssert.reverts(
			ffc.approve(user1, 1000, { from: useR }), "" //"KYC: <spender> KYC is not approved!"
		);
		
		await config.approveKYCUserAddress(user1, { from: admin1 });
		assert.equal(await config.isKYCApproved(user1), true, 'user1 should have KYC approved status by now');
		
		let ok = await ffc.approve.call(user1, 1000, { from: useR });
		assert.equal(ok, true, 'useR approve should return true');
	});
	
	it(TEST_TAG + 'users can NOT spend approved tokens (transferFrom) when contract has KYC enabled and address is not approved', async () => {
		// useR approves user1 to spend some tokens
		await ffc.approve(user1, 1000, { from: useR });
		assert.equal(await config.isKYCEnabled(), false, 'contract should be have KYC disabled');
		
		await config.enableKYC({from: admin1});
		assert.equal(await config.isKYCEnabled(), true, 'contract should be have KYC enabled by now');
		
		await truffleAssert.reverts(
			ffc.transferFrom(useR, user2, 1000, { from: user1 }), "" //"KYC: sender address must be approved!"
		);
		
		await config.approveKYCUserAddress(user1, { from: admin1 });
		assert.equal(await config.isKYCApproved(user1), true, 'user1 should have KYC approved status by now');
		
		await truffleAssert.reverts(
			ffc.transferFrom(useR, user2, 1000, { from: user1 }), "" //"KYC: <from> KYC is not approved!"
		);
		
		await config.approveKYCUserAddress(useR, { from: admin1 });
		assert.equal(await config.isKYCApproved(useR), true, 'useR should have KYC approved status by now');
		
		await truffleAssert.reverts(
			ffc.transferFrom(useR, user2, 1000, { from: user1 }), "" //"KYC: <to> KYC is not approved!"
		);
		
		await config.approveKYCUserAddress(user2, { from: admin1 });
		assert.equal(await config.isKYCApproved(user2), true, 'user2 should have KYC approved status by now');
		
		let ok = await ffc.transferFrom.call(useR, user2, 1000, { from: user1 });
		assert.equal(ok, true, 'user1 transferFrom useR should return true');
	});
});
