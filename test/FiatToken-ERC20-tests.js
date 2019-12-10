const FiatToken = artifacts.require("./FiatToken.sol");
//const FiatToken = artifacts.require("FiatToken");
const USDF = artifacts.require("./USDf.sol");
const IConfig = artifacts.require("./IConfig.sol");
const IFees = artifacts.require("./IFees.sol");
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

const common = require("./common.js");
const TEST_TAG = 'ERC20-tests - ';



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
		
		//config = await common.createConfigContract(contractOwner);
		//fees = await common.createFeesContract(contractOwner);
		//config = await IConfig.at(await ffc.config());
		//fees = await IFees.at(await ffc.transferFees());
		//config = await common.getConfig(ffc);
		//fees = await common.getTransferFees(ffc);
		
		//dconfig = await common.getConfig(dffc);
		//dfees = await common.getTransferFees(dffc);
		
		//await ffc.setIConfig(config.address);
		//await ffc.setIFees(fees.address);
		//await dffc.setIConfig(config.address);
		//await dffc.setIFees(fees.address);
		
		//console.log("config.address : ", config.address, " | ", await ffc.config());
		//console.log("fees.address : ", fees.address, " | ", await ffc.transferFees());
		
		// deposit 1000 usd (100.000 tokens) to contract owner
		await ffc.depositAccept(contractOwner, 100000, { from: contractOwner });
		await dffc.depositAccept(contractOwner, 100000, { from: contractOwner });
		
		// deposit 100000 tokens to useR wallet
		await ffc.depositAccept(useR, 100000, { from: contractOwner });
		await dffc.depositAccept(useR, 100000, { from: contractOwner });
		// deposit 100000 tokens to useR2 wallet
		await ffc.depositAccept(useR2, 100000, { from: contractOwner });
		await dffc.depositAccept(useR2, 100000, { from: contractOwner });
		
		// await dffc.disableTransfers({from: contractOwner});
		///await dffc.enableTransfers(false, {from: contractOwner});
		await dconfig.enableTransfers(false, {from: contractOwner});
		
		// add a system admin to perform admin operations
		await admins.addAdmin(admin1, {from: contractOwner});
		assert.equal(await config.isAdmin(admin1), true, 'admin1 should have admin role by now');
		await admins.addAdmin(admin2, {from: contractOwner});
		assert.equal(await config.isAdmin(admin2), true, 'admin2 should have admin role by now');
		
		//await dconfig.addAdmin(admin1, {from: contractOwner});
		assert.equal(await dconfig.isAdmin(admin1), true, 'admin1 should have admin role by now');
		//await dconfig.addAdmin(admin2, {from: contractOwner});
		assert.equal(await dconfig.isAdmin(admin2), true, 'admin2 should have admin role by now');
    });
	
	
	
	it(TEST_TAG + 'contract owner (no fees address) trying to transfer more tokens than available should fail', async () => {
		// Test `require` statement first by transferring something larger than the sender's balance
		//let res = await ffc.transfer.call(user1, 999999999999999, {from: contractOwner});
		//assert.equal(res, false, 'transfer must return false');
		
		try {
			await ffc.transfer(user1, 999999999999999, {from: contractOwner});
			assert.fail();
		} catch(error) {
			//console.log('error >> ', error);
			assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than approved amount');
		}
		/*await truffleAssert.reverts(
			ffc.transfer(user1, 999999999999999, {from: contractOwner}), "Not enough token in sender's balance!"
		);*/
	});
	
	it(TEST_TAG + 'contract owner (no fees address) transfers tokens, triggers "Transfer" and "TransferFeesCollected" events', async () => {
		let success = await ffc.transfer.call(user1, 10000, { from: contractOwner });
		assert.equal(success, true, 'must return true');
		
		let sym = await ffc.symbol();
		
		let tx = await ffc.transfer(user1, 10000, { from: contractOwner });
		// check for emitted events:
		// Transfer(address indexed from, address indexed to, uint tokens)
		// TransferFeesCollected(address indexed from, address indexed to, uint transferTokens, uint transferTokensFee, string symbol)
		//truffleAssert.eventEmitted(tx, 'Transfer', (ev) => {
		//	return ev.from === contractOwner && ev.to === user1 && ev.tokens === 10000;
        //});
		assert.equal(tx.logs.length, 3, 'triggers two events');
		
		assert.equal(tx.logs[0].event, 'Transfer', 'should be the "Transfer" event');
		assert.equal(tx.logs[0].args.from, contractOwner, 'logs the account the tokens are transferred from');
		assert.equal(tx.logs[0].args.to, user1, 'logs the account the tokens are transferred to');
		assert.equal(tx.logs[0].args.tokens, 10000, 'logs the transfer amount');
		
		assert.equal(tx.logs[2].event, 'TransferFeesCollected', 'should be the "TransferFeesCollected" event');
		assert.equal(tx.logs[2].args.from, contractOwner, 'logs the account the tokens are transferred from');
		assert.equal(tx.logs[2].args.to, user1, 'logs the account the tokens are transferred to');
		assert.equal(tx.logs[2].args.transferTokens, 10000, 'logs the transfer amount');
		assert.equal(tx.logs[2].args.transferTokensFee, 0, 'logs the transfer fee amount');
		
		let balanceAcc1 = await ffc.balanceOf(user1);
		assert.equal(balanceAcc1.toNumber(), 10000, 'adds the amount to the receiving account');
		
		let balanceAcc0 = await ffc.balanceOf(contractOwner);
		assert.equal(balanceAcc0.toNumber(), 90000, 'deducts the amount from the sending account');
		
		// fee wallet is contract owner wallet in this case
		let balanceFeeWallet = await ffc.balanceOf(await config.feesCollectorWallet({from: contractOwner}));
		assert.equal(balanceFeeWallet.toNumber(), 90000, 'deducts the fee amount from the sending account');
		
		let totalSupply1 = await ffc.totalSupply();
		assert.equal(totalSupply1.toNumber(), 300000, 'total supply should match amount in circulation');
	});
	
	it(TEST_TAG + 'user transfers tokens paying small fee when transfer fees are enabled, triggers "Transfer" and "TransferFeesCollected" events', async () => {
		let success = await ffc.transfer.call(user1, 10000, { from: useR });
		assert.equal(success, true, 'must return true');
		
		let sym = await ffc.symbol();
		
		// enable transfer fees
		//await ffc.enableTransferFees({from: admin1});
		await fees.enableFees(true, {from: contractOwner});
		
		let tx = await ffc.transfer(user1, 10000, { from: useR });
		// check for emitted events:
		// Transfer(address indexed from, address indexed to, uint tokens)
		// TransferFeesCollected(address indexed from, address indexed to, uint transferTokens, uint transferTokensFee, string symbol)
		//truffleAssert.eventEmitted(tx, 'Transfer', (ev) => {
		//	return ev.from === useR && ev.to === user1 && ev.tokens === 10000;
        //});
		assert.equal(tx.logs.length, 3, 'triggers two events');
		
		assert.equal(tx.logs[0].event, 'Transfer', 'should be the "Transfer" event');
		assert.equal(tx.logs[0].args.from, useR, 'logs the account the tokens are transferred from');
		assert.equal(tx.logs[0].args.to, user1, 'logs the account the tokens are transferred to');
		assert.equal(tx.logs[0].args.tokens, 10000, 'logs the transfer amount');
		
		assert.equal(tx.logs[2].event, 'TransferFeesCollected', 'should be the "TransferFeesCollected" event');
		assert.equal(tx.logs[2].args.from, useR, 'logs the account the tokens are transferred from');
		assert.equal(tx.logs[2].args.to, user1, 'logs the account the tokens are transferred to');
		assert.equal(tx.logs[2].args.transferTokens, 10000, 'logs the transfer amount');
		assert.equal(tx.logs[2].args.transferTokensFee, 10, 'logs the transfer fee amount');
		
		let balanceAcc1 = await ffc.balanceOf(user1);
		assert.equal(balanceAcc1.toNumber(), 10000, 'adds the amount to the receiving account');
		
		// user pays 0.1% fee on transfer, 10K at 0.1% = 10 tokens fee
		let balanceAcc0 = await ffc.balanceOf(useR);
		assert.equal(balanceAcc0.toNumber(), 100000 - 10000 - 10, 'deducts the amount from the sending account');
		
		let balanceFeeWallet = await ffc.balanceOf(await config.feesCollectorWallet({from: contractOwner}));
		assert.equal(balanceFeeWallet.toNumber(), 100010, 'deducts the fee amount from the sending account');
		
		let totalSupply1 = await ffc.totalSupply();
		assert.equal(totalSupply1.toNumber(), 300000, 'total supply should match amount in circulation');
	});
	
	
	
	it(TEST_TAG + 'user transfers tokens paying no transfer fees when they are disabled, triggers "Transfer" and "TransferFeesCollected" events', async () => {
		let success = await ffc.transfer.call(user1, 10000, { from: useR });
		assert.equal(success, true, 'must return true');
		
		let sym = await ffc.symbol();
		
		let tx = await ffc.transfer(user1, 10000, { from: useR });
		// check for emitted events:
		// Transfer(address indexed from, address indexed to, uint tokens)
		// TransferFeesCollected(address indexed from, address indexed to, uint transferTokens, uint transferTokensFee, string symbol)
		//truffleAssert.eventEmitted(tx, 'Transfer', (ev) => {
		//	return ev.from === useR && ev.to === user1 && ev.tokens === 10000;
        //});
		assert.equal(tx.logs.length, 3, 'triggers two events');
		
		assert.equal(tx.logs[0].event, 'Transfer', 'should be the "Transfer" event');
		assert.equal(tx.logs[0].args.from, useR, 'logs the account the tokens are transferred from');
		assert.equal(tx.logs[0].args.to, user1, 'logs the account the tokens are transferred to');
		assert.equal(tx.logs[0].args.tokens, 10000, 'logs the transfer amount');
		
		assert.equal(tx.logs[2].event, 'TransferFeesCollected', 'should be the "TransferFeesCollected" event');
		assert.equal(tx.logs[2].args.from, useR, 'logs the account the tokens are transferred from');
		assert.equal(tx.logs[2].args.to, user1, 'logs the account the tokens are transferred to');
		assert.equal(tx.logs[2].args.transferTokens, 10000, 'logs the transfer amount');
		assert.equal(tx.logs[2].args.transferTokensFee, 0, 'logs the transfer fee amount');
		
		let balanceAcc1 = await ffc.balanceOf(user1);
		assert.equal(balanceAcc1.toNumber(), 10000, 'adds the amount to the receiving account');
		
		// user pays 0.1% fee on transfer, 10K at 0.1% = 10 tokens fee
		let balanceAcc0 = await ffc.balanceOf(useR);
		assert.equal(balanceAcc0.toNumber(), 100000 - 10000 - 0, 'deducts the amount from the sending account');
		
		let balanceFeeWallet = await ffc.balanceOf(await config.feesCollectorWallet({from: contractOwner}));
		assert.equal(balanceFeeWallet.toNumber(), 100000, 'deducts the fee amount from the sending account');
		
		let totalSupply1 = await ffc.totalSupply();
		assert.equal(totalSupply1.toNumber(), 300000, 'total supply should match amount in circulation');
	});
	
	
	
	it(TEST_TAG + 'approve tokens for delegated transfer, triggers "Approval" event', async () => {
		let success = await ffc.approve.call(user1, 100, {from: contractOwner});
		assert.equal(success, true, 'it should return true');
		
		let tx = await ffc.approve(user1, 100, { from: contractOwner });
		// check for emitted events:
		// Approval(address indexed tokenOwner, address indexed spender, uint tokens)
		assert.equal(tx.logs.length, 1, 'triggers one event');
		assert.equal(tx.logs[0].event, 'Approval', 'should be the "Approval" event');
		assert.equal(tx.logs[0].args.owner, contractOwner, 'logs the account the tokens are authorized by');
		assert.equal(tx.logs[0].args.spender, user1, 'logs the account the tokens are authorized to');
		assert.equal(tx.logs[0].args.tokens, 100, 'logs the transfer amount');
		
		let allowance = await ffc.allowance(contractOwner, user1);
		assert.equal(allowance.toNumber(), 100, 'check the allowance for delegated transfer');
	});
	
	
	
	it(TEST_TAG + 'handles delegated token transfers, triggers "Transfer" and "TransferFeesCollected" events', async () => {
		let fromAccount = contractOwner; //accounts[2];
		let toAccount = user2; //accounts[3];
		let spendingAccount = user1; //accounts[4];
		
		let sym = await ffc.symbol();
		
		// send spender some funds so he can pay transfer fees
		let tx = await ffc.transfer(spendingAccount, 10, { from: contractOwner });
		let spendingAccBalance = await ffc.balanceOf(spendingAccount);
		assert.equal(spendingAccBalance.toNumber(), 10, 'check account has the correct amount in his account');
		
		// approve spendingAccount to spend 10000 tokens from fromAccount
		tx = await ffc.approve(spendingAccount, 10000, { from: fromAccount });
		
		let allowance = await ffc.allowance(fromAccount, spendingAccount);
		assert.equal(allowance.toNumber(), 10000, 'check the allowance for delegated transfer');
		
		// Try transferring something larger than the approved amount
		try {
			await ffc.transferFrom(fromAccount, toAccount, 10001, { from: spendingAccount });
			assert.fail();
		} catch(error) {
			assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than approved amount');
		}
		
		let success = await ffc.transferFrom.call(fromAccount, toAccount, 10000, { from: spendingAccount });
		assert.equal(success, true, 'transferFrom should return true');
		
		tx = await ffc.transferFrom(fromAccount, toAccount, 10000, { from: spendingAccount });
		assert.equal(tx.logs.length, 5, 'triggers five events');
		
		assert.equal(tx.logs[0].event, 'Transfer', 'should be the "Transfer" event');
		assert.equal(tx.logs[0].args.from, fromAccount, 'logs the account the tokens are transferred from');
		assert.equal(tx.logs[0].args.to, toAccount, 'logs the account the tokens are transferred to');
		assert.equal(tx.logs[0].args.tokens, 10000, 'logs the transfer amount');
		
		assert.equal(tx.logs[4].event, 'TransferFeesCollected', 'should be the "TransferFeesCollected" event');
		assert.equal(tx.logs[4].args.from, fromAccount, 'logs the account the tokens are transferred from');
		assert.equal(tx.logs[4].args.to, toAccount, 'logs the account the tokens are transferred to');
		assert.equal(tx.logs[4].args.transferTokens, 10000, 'logs the transfer amount');
		assert.equal(tx.logs[4].args.transferTokensFee, 0, 'logs the transfer fee amount');
		
		// in this case, fees wallet is the same as account spender spent funds from, 10 tokens fee at 0.1% for 10K tokens
		let balance = await ffc.balanceOf(fromAccount);
		assert.equal(balance.toNumber(), 90000 - 10, 'deducts the amount from the sending account');
		
		balance = await ffc.balanceOf(toAccount);
		assert.equal(balance.toNumber(), 10000, 'adds the amount from the receiving account');
		
		balance = await ffc.balanceOf(spendingAccount);
		assert.equal(balance.toNumber(), 10, 'check balance match expected value');
		
		allowance = await ffc.allowance(fromAccount, spendingAccount);
		assert.equal(allowance.toNumber(), 0, 'deducts the amount from the allowance');
	});
});
