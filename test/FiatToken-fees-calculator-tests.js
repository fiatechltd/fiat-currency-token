const FiatToken = artifacts.require("./FiatToken.sol");
const USDF = artifacts.require("./USDf.sol");
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

const common = require("./common.js");
const TEST_TAG = 'Fees-Calculator - ';



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
		
		//await dconfig.addAdmin(admin1, {from: contractOwner});
		assert.equal(await dconfig.isAdmin(admin1), true, 'admin1 should have admin role by now');
		//await dconfig.addAdmin(admin2, {from: contractOwner});
		assert.equal(await dconfig.isAdmin(admin2), true, 'admin2 should have admin role by now');
		
		//await ffc.initTransferFees(1, 1000, 0, 0, true, {from: admin1});
		await fees.init(1, 1000, 0, 0, true, {from: contractOwner});
    });
	
	
	
	it(TEST_TAG + 'transfer fees match expected values upon deployment', async () => {
		//(parts_Fee, perX_Fee) = await ffc.getTransferFees();
		let parts_Fee = await fees.getFeesNumerator();
		let perX_Fee = await fees.getFeesDenominator();
		let minFeeTokens = await fees.getMinFee();
		let maxFeeTokens = await fees.getMaxFee();
		let feesEnabled = await fees.feesEnabled();
		assert.equal(parts_Fee, 1, 'parts_Fee should be ' + 1);
		assert.equal(perX_Fee, 1000, 'perX_Fee should be ' + 1000);
		assert.equal(minFeeTokens, 0, 'minFeeTokens should be ' + 0);
		assert.equal(maxFeeTokens, 0, 'maxFeeTokens should be ' + 0);
		assert.equal(feesEnabled, true, 'feesEnabled should be true');
	});
	
	it(TEST_TAG + 'testing 1,000,000,000 tokens transfer fee should be 1,000,000 with disabled min and max transfer fee and 0.1%', async () => {
		let tokensFee = await fees.calculateFee(1000000000, {from: user1});
		assert.equal(tokensFee.toNumber(), 1000000, 'tokens fee should match expected value ' + 1000000);
	});
	
	it(TEST_TAG + 'testing 10 tokens transfer fee should be 0 with disabled min and max transfer fee and 0.1%', async () => {
		let tokensFee = await fees.calculateFee(10, {from: user1});
		assert.equal(tokensFee.toNumber(), 0, 'tokens fee should match expected value ' + 0);
	});
	
	it(TEST_TAG + 'testing 100000 tokens transfer fee should be 10 with 10 max transfer fee and 0.1%', async () => {
		await fees.setMaxFee(10, {from: contractOwner});
		let tokensFee = await fees.calculateFee(100000, {from: user1});
		assert.equal(tokensFee.toNumber(), 10, 'tokens fee should match expected value ' + 10);
	});
	
	it(TEST_TAG + 'testing 1000 tokens transfer fee should be 20 with 20 min transfer fee and 0.1%', async () => {
		await fees.setMinFee(20, {from: contractOwner});
		let tokensFee = await fees.calculateFee(1000, {from: user1});
		assert.equal(tokensFee.toNumber(), 20, 'tokens fee should match expected value ' + 20);
	});
})
