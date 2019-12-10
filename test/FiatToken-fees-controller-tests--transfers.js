const FiatToken = artifacts.require("./FiatToken.sol");
const USDF = artifacts.require("./USDf.sol");
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

const common = require("./common.js");
const TEST_TAG = 'Fees-Controller--transfers - ';



contract(common.TEST_CONTRACT_NAME, async accounts => {
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
		
		// add a system admin to perform admin operations
		await admins.addAdmin(admin1, {from: contractOwner});
		assert.equal(await config.isAdmin(admin1), true, 'admin1 should have admin role by now');
		await admins.addAdmin(admin2, {from: contractOwner});
		assert.equal(await config.isAdmin(admin2), true, 'admin2 should have admin role by now');
		
		//await ffc.enableTransferFees({from: contractOwner});
		await fees.enableFees(true, {from: contractOwner});
		
		//await dffc.disableTransferFees({from: contractOwner});
		//await dconfig.addAdmin(admin1, {from: contractOwner});
		assert.equal(await dconfig.isAdmin(admin1), true, 'admin1 should have admin role by now');
		//await dconfig.addAdmin(admin2, {from: contractOwner});
		assert.equal(await dconfig.isAdmin(admin2), true, 'admin2 should have admin role by now');
    });
	
	
	
	it(TEST_TAG + 'transfer fees are disabled upon contract initialization', async () => {
		assert.equal(await fees.feesEnabled(), true, 'contract should have transfer fees enabled upon deployment');
		assert.equal(await dfees.feesEnabled(), false, 'contract should have transfer fees disabled upon deployment');
	});
	
	it(TEST_TAG + 'transfer fees match expected values upon deployment', async () => {
		//(parts_Fee, perX_Fee) = await fees.getTransferFees();
		let parts_Fee = await fees.getFeesNumerator();
		let perX_Fee = await fees.getFeesDenominator();
		let minFeeTokens = await fees.getMinFee();
		let maxFeeTokens = await fees.getMaxFee();
		let feesEnabled = await fees.feesEnabled();
		assert.equal(parts_Fee, 1, 'parts_Fee should be ' + 1);
		assert.equal(perX_Fee, 1000, 'perX_Fee should be ' + 1000);
		assert.equal(minFeeTokens, 10, 'minFeeTokens should be ' + 10);
		assert.equal(maxFeeTokens, 0, 'maxFeeTokens should be ' + 0);
		assert.equal(feesEnabled, true, 'feesEnabled should be true');
	});
	
	it(TEST_TAG + 'admin can initTransferFees and must return true', async () => {
		let res = await fees.init.call(2, 1000, 10, 0, false, {from: contractOwner});
		assert.equal(res, true, 'contract initTransferFees should return true');
		
		await fees.init(2, 1000, 10, 0, false, {from: contractOwner});
		//(parts_Fee, perX_Fee) = await fees.getTransferFees();
		let parts_Fee = await fees.getFeesNumerator();
		let perX_Fee = await fees.getFeesDenominator();
		let minFeeTokens = await fees.getMinFee();
		let maxFeeTokens = await fees.getMaxFee();
		let feesEnabled = await fees.feesEnabled();
		assert.equal(parts_Fee, 2, 'parts_Fee should be ' + 2);
		assert.equal(perX_Fee, 1000, 'perX_Fee should be ' + 1000);
		assert.equal(minFeeTokens, 10, 'minFeeTokens should be ' + 10);
		assert.equal(maxFeeTokens, 0, 'maxFeeTokens should be ' + 0);
		assert.equal(feesEnabled, false, 'feesEnabled should be true');
	});
	
	it(TEST_TAG + 'user can NOT initTransferFees', async () => {
		//let res = await ffc.initTransferFees.call(2, 1000, 10, 0, false, {from: user1});
		//assert.equal(res, false, 'contract initTransferFees should return true');
		
		await truffleAssert.reverts(
			fees.init(2, 1000, 10, 0, false, {from: user1}), "Admin required" //"AdminRole: caller does not have the Admin role"
		);
	});
	
	it(TEST_TAG + 'user can calculate transfer fees tokens', async () => {
		let tokensFee = await fees.calculateFee(100000, {from: user1});
		assert.equal(tokensFee.toNumber(), 100, 'tokens fee should match expected value ' + 100);
		
		// check for minimum fee
		tokensFee = await fees.calculateFee(1000, {from: user1});
		assert.equal(tokensFee.toNumber(), 10, 'tokens fee should match expected value ' + 10);
	});
	
	it(TEST_TAG + 'user can check minimum transfer fees tokens', async () => {
		let tokensFee = await fees.getMinFee({from: user1});
		assert.equal(tokensFee.toNumber(), 10, 'tokens fee should match expected value ' + 10);
	});
	
	it(TEST_TAG + 'user can check if transfer fees are enabled', async () => {
		let enabled = await fees.feesEnabled({from: user1});
		assert.equal(enabled, true, 'tokens fee enabled should match expected value true');
	});
	
	it(TEST_TAG + 'user can check transfer fees', async () => {
		let parts_Fee = await fees.getFeesNumerator({from: user1});
		let perX_Fee = await fees.getFeesDenominator({from: user1});
		assert.equal(parts_Fee, 1, 'parts_Fee should be ' + 1);
		assert.equal(perX_Fee, 1000, 'perX_Fee should be ' + 1000);
	});
	
	
	
	it(TEST_TAG + 'user can NOT enable/disable or set/change transfer fees parameters', async () => {
		// user1 trying to set/change minimum transfer fee tokens should fail
		await truffleAssert.reverts(
			fees.setMinFee(2, {from: user1}), "Admin required" //"AdminRole: caller does not have the Admin role"
		);
		
		// user1 trying to set/change maximum transfer fee tokens should fail
		await truffleAssert.reverts(
			fees.setMaxFee(100, {from: user1}), "Admin required" //"AdminRole: caller does not have the Admin role"
		);
		
		// user1 trying to set transfer fees should fail
		await truffleAssert.reverts(
			fees.setFees(2, 1000, {from: user1}), "Admin required" //"AdminRole: caller does not have the Admin role"
		);
		
		// user1 trying to enable transfer fees should fail
		await truffleAssert.reverts(
			dfees.enableFees(true, {from: user1}), "Admin required" //"AdminRole: caller does not have the Admin role"
		);
		
		// user1 trying to disable transfer fees should fail
		await truffleAssert.reverts(
			fees.enableFees(false, {from: user1}), "Admin required" //"AdminRole: caller does not have the Admin role"
		);
	});
	
	
	
	it(TEST_TAG + 'admin can NOT enable/disable or set/change transfer fees, IF they already have that value', async () => {
		// admin1 trying to set the same minimum transfer fee tokens should fail
		/*await truffleAssert.reverts(
			fees.setMinFee(10, {from: contractOwner}), "FeesLib._setMinimumFeeTokens: required (self.min_Fee_tokens != newMinFeeTokens)"
		);*/
		let res = await fees.setMinFee.call(10, {from: contractOwner});
		assert.equal(res, false, "FeesLib._setMinimumFeeTokens: required (self.min_Fee_tokens != newMinFeeTokens)");
		
		// admin1 trying to set the same maximum transfer fee tokens should fail
		/*await truffleAssert.reverts(
			fees.setMaxFee(0, {from: contractOwner}), "FeesLib._setMaximumFeeTokens: required (self.max_Fee_tokens != newMaxFeeTokens)"
		);*/
		res = await fees.setMaxFee.call(0, {from: contractOwner});
		assert.equal(res, false, "FeesLib._setMaximumFeeTokens: required (self.max_Fee_tokens != newMaxFeeTokens)");
		
		// admin1 trying to set the same transfer fees should fail
		await truffleAssert.reverts(
			fees.setFees(1, 1000, {from: contractOwner}), "FeesLib._setFees: required _parts_Fee != self.parts_Fee || _perX_Fee != self.perX_Fee"
		);
		
		// admin1 trying to set _perX_Fee = 0 should fail
		await truffleAssert.reverts(
			fees.setFees(10, 0, {from: contractOwner}), "FeesLib._setFees: required _perX_Fee > 0"
		);
		
		// admin1 trying to set _parts_Fee >= _perX_Fee should fail
		await truffleAssert.reverts(
			fees.setFees(100, 10, {from: contractOwner}), "FeesLib._setFees: required _parts_Fee < _perX_Fee"
		);
		
		// admin1 trying to enable transfer fees when they already are enabled should fail
		/*await truffleAssert.reverts(
			fees.enableFees(true, {from: contractOwner}), "FeesLib._enableFees: Fees are already enabled!"
		);*/
		res = await fees.enableFees.call(true, {from: contractOwner});
		assert.equal(res, false, "FeesLib._enableFees: Fees are already enabled!");
		
		// admin1 trying to disable transfer fees when they already are disabled should fail
		/*await truffleAssert.reverts(
			dfees.enableFees(false, {from: contractOwner}), "FeesLib._disableFees: Fees are already disabled!"
		);*/
		res = await dfees.enableFees.call(false, {from: contractOwner});
		assert.equal(res, false, "FeesLib._disableFees: Fees are already disabled!");
	});
	
	
	
	it(TEST_TAG + 'admin can enable/disable and set/change transfer fees parameters, triggering events', async () => {
		// check the event is emitted:
		// FeesEnabled(address indexed admin)
		// FeesDisabled(address indexed admin)
		// FeesChanged(address indexed admin, uint parts_Fee, uint perX_Fee)
		// MinFeeChanged(address indexed admin, uint newTransferFeeTokens)
		// MaxFeeChanged(address indexed admin, uint newTransferFeeTokens)
		
		let sym = await ffc.symbol();
		
		// admin1 trying to set/change minimum transfer fee tokens
		let tx = await fees.setMinFee(2, {from: contractOwner});
		/*truffleAssert.eventEmitted(tx, 'MinimumTransferFeeTokensChanged', (ev) => {
			return ev.admin === admin1 && ev.symbol === sym && ev.newTransferFeeTokens === 2;
        });*/
		assert.equal(tx.logs.length, 1, 'triggers one event');
		assert.equal(tx.logs[0].event, 'MinFeesChanged', 'should be the "MinFeesChanged" event');
		assert.equal(tx.logs[0].args.admin, contractOwner, 'logs the admin address');
		assert.equal(tx.logs[0].args.minFee.toNumber(), 2, 'logs the token fees minimum');
		assert.equal((await fees.getMinFee()).toNumber(), 2, 'tokens fee minimum should match expected value ' + 2);
		
		// admin1 trying to set/change maximum transfer fee tokens
		tx = await fees.setMaxFee(100, {from: contractOwner});
		assert.equal(tx.logs.length, 1, 'triggers one event');
		assert.equal(tx.logs[0].event, 'MaxFeesChanged', 'should be the "MaxFeesChanged" event');
		assert.equal(tx.logs[0].args.admin, contractOwner, 'logs the admin address');
		assert.equal(tx.logs[0].args.maxFee.toNumber(), 100, 'logs the token fees minimum');
		assert.equal((await fees.getMaxFee()).toNumber(), 100, 'tokens fee maximum should match expected value ' + 100);
		
		// admin1 trying to set transfer fees
		tx = await fees.setFees(2, 1000, {from: contractOwner});
		/*truffleAssert.eventEmitted(tx, 'TransferFeesChanged', (ev) => {
			return ev.admin === admin1 && ev.symbol === sym && ev.parts_Fee === 2 && ev.perX_Fee === 1000;
        });*/
		assert.equal(tx.logs.length, 1, 'triggers one event');
		assert.equal(tx.logs[0].event, 'FeesChanged', 'should be the "FeesChanged" event');
		assert.equal(tx.logs[0].args.admin, contractOwner, 'logs the admin address');
		assert.equal(tx.logs[0].args.parts_Fee.toNumber(), 2, 'logs the parts fee');
		assert.equal(tx.logs[0].args.perX_Fee.toNumber(), 1000, 'logs the parts per X fee');
		
		// admin1 trying to enable transfer fees
		tx = await dfees.enableFees(true, {from: contractOwner});
		/*truffleAssert.eventEmitted(tx, 'TransferFeesEnabled', (ev) => {
			return ev.admin === admin1 && ev.symbol === sym;
        });*/
		assert.equal(tx.logs.length, 1, 'triggers one event');
		assert.equal(tx.logs[0].event, 'FeesEnabled', 'should be the "FeesEnabled" event');
		assert.equal(tx.logs[0].args.admin, contractOwner, 'logs the admin address');
		
		// admin1 trying to disable transfer fees
		tx = await dfees.enableFees(false, {from: contractOwner});
		/*truffleAssert.eventEmitted(tx, 'TransferFeesDisabled', (ev) => {
			return ev.admin === admin1 && ev.symbol === sym;
        });*/
		assert.equal(tx.logs.length, 1, 'triggers one event');
		assert.equal(tx.logs[0].event, 'FeesDisabled', 'should be the "FeesDisabled" event');
		assert.equal(tx.logs[0].args.admin, contractOwner, 'logs the admin address');
	});
})
