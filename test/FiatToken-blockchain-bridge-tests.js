const FiatToken = artifacts.require("./FiatToken.sol");
const USDF = artifacts.require("./USDf.sol");
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

const common = require("./common.js");
const TEST_TAG = 'Blockchain-Bridge - ';



contract(common.TEST_CONTRACT_NAME, async accounts => {
	var tokenInstance;
	let contractOwner = accounts[0];
	let admin1 = accounts[1];
	let admin2 = accounts[2];
	let user1 = accounts[3];
	let user2 = accounts[4];
	let userW = accounts[5];
	let ffc;
	let dffc;
	let admins;
	let config;
	let fees;
	let dconfig;
	let dfees;
	
	
	
	// 'beforeEach' function will run before each test creating a new instance of the contract each time
	beforeEach('setup contract for each test', async () => {
		//let ffc = await FiatToken.deployed();
        //ffc = await FiatToken.new(common.tokenSymbolUSD, common.tokenNameUSD, common.tokenVersion, common.tokenDecimals, {from: contractOwner});
		[ffc, admins, config, fees] = await common.createNewUSDContract(contractOwner);
		
		//dffc = await FiatToken.new(common.tokenSymbolUSD, common.tokenNameUSD, common.tokenVersion, common.tokenDecimals, {from: contractOwner});
		[dffc, , dconfig, dfees] = await common.createNewUSDContractWithParams(contractOwner, admins);
		
		//config = await common.getConfig(ffc);
		//fees = await common.getTransferFees(ffc);
		
		//dconfig = await common.getConfig(dffc);
		//dfees = await common.getTransferFees(dffc);
		
		await dconfig.enableDeposits(false, {from: contractOwner});
		assert.equal(await dconfig.depositsEnabled(), false, 'deposits should be disabled for dffc by now');
		
		await dconfig.enableWithdrawals(false, {from: contractOwner});
		assert.equal(await dconfig.withdrawalsEnabled(), false, 'withdrawals should be disabled for dffc by now');
		
		// add a system admin to perform admin operations
		await admins.addAdmin(admin1, {from: contractOwner});
		assert.equal(await config.isAdmin(admin1), true, 'admin1 should have admin role by now');
		
		//await dconfig.addAdmin(admin1, {from: contractOwner});
		assert.equal(await dconfig.isAdmin(admin1), true, 'admin1 should have admin role by now');
		
		//*** we assume withdrawal and transfer fees are disabled upon contract initialization
    });
	
	
	
	it(TEST_TAG + 'blockchain bridge has the correct token symbol upon deployment', async () => {
		assert.equal(await ffc.symbol(), common.tokenSymbolUSD, 'blockchain bridge should have the correct token symbol upon deployment');
	});
	
	it(TEST_TAG + 'deposits and withdrawals are enabled by default upon deployment', async () => {
		assert.equal(await config.depositsEnabled(), true, 'contract should have deposits disabled upon deployment');
		assert.equal(await config.withdrawalsEnabled(), true, 'contract should have withdrawals disabled upon deployment');
	});
	
	
	
	/// deposits tests
	it(TEST_TAG + 'admin can disable deposits', async () => {
		await config.enableDeposits(false, {from: admin1});
		assert.equal(await config.depositsEnabled(), false, 'contract should have deposits disabled by now');
	});
	
	it(TEST_TAG + 'user can NOT disable deposits', async () => {
		// user1 trying to disable deposits
		await truffleAssert.reverts(
			config.enableDeposits(false, {from: user1}), "" //"AdminRole: caller does not have the Admin role"
		);
	});
	
	it(TEST_TAG + 'disable deposits should be possible only when they are enabled', async () => {
		/*await truffleAssert.reverts(
			dconfig.enableDeposits(false, {from: admin1}), "" //"BlockchainBridge: Deposits are already disabled!"
		);*/
		let res = await dconfig.enableDeposits.call(false, {from: admin1});
		assert.equal(res, false, 'contract should still have deposits disabled');
	});
	
	it(TEST_TAG + 'disable deposits should trigger "DepositsDisabled" event', async () => {
		let tx = await config.enableDeposits(false, {from: admin1});
		// check for emitted event 'DepositsDisabled(address indexed _admin)'
		truffleAssert.eventEmitted(tx, 'DepositsDisabled', (ev) => {
			return ev._admin === admin1;
        });
        // there should be no 'WithdrawalsDisabled' events
        truffleAssert.eventNotEmitted(tx, 'WithdrawalsDisabled');
	});
	
	
	
	it(TEST_TAG + 'admin can enable deposits', async () => {
		await dconfig.enableDeposits(true, {from: admin1});
		assert.equal(await dconfig.depositsEnabled(), true, 'contract should have deposits enabled by now');
	});
	
	it(TEST_TAG + 'user can NOT enable deposits', async () => {
		// user1 trying to enable deposits
		await truffleAssert.reverts(
			dconfig.enableDeposits(true, {from: user1}), "" //"AdminRole: caller does not have the Admin role"
		);
		assert.equal(await dconfig.depositsEnabled(), false, 'contract should still have deposits disabled');
	});
	
	it(TEST_TAG + 'enable deposits should be possible only when they are disabled', async () => {
		/*await truffleAssert.reverts(
			config.enableDeposits(true, {from: admin1}), "" //"BlockchainBridge: Deposits are already enabled!"
		);*/
		let res = await config.enableDeposits.call(true, {from: admin1});
		assert.equal(res, false, 'contract should still have deposits enabled');
	});
	
	it(TEST_TAG + 'enable deposits should trigger "DepositsEnabled" event', async () => {
		let tx = await dconfig.enableDeposits(true, {from: admin1});
		// check for emitted event 'DepositsEnabled(address indexed _admin)'
		truffleAssert.eventEmitted(tx, 'DepositsEnabled', (ev) => {
            return ev._admin === admin1;
        });
        // there should be no 'WithdrawalsEnabled' events
        truffleAssert.eventNotEmitted(tx, 'WithdrawalsEnabled');
	});
	
	
	
	/// withdrawals tests
	it(TEST_TAG + 'admin can disable withdrawals', async () => {
		await config.enableWithdrawals(false, {from: admin1});
		assert.equal(await config.withdrawalsEnabled(), false, 'contract should have withdrawals disabled by now');
	});
	
	it(TEST_TAG + 'user can NOT disable withdrawals', async () => {
		// user1 trying to disable withdrawals
		await truffleAssert.reverts(
			config.enableWithdrawals(false, {from: user1}), "" //"AdminRole: caller does not have the Admin role"
		);
	});
	
	it(TEST_TAG + 'disable withdrawals should be possible only when they are enabled', async () => {
		/*await truffleAssert.reverts(
			dconfig.enableWithdrawals(false, {from: admin1}), "" //"BlockchainBridge: Withdrawals are already disabled!"
		);*/
		let res = await dconfig.enableWithdrawals.call(false, {from: admin1});
		assert.equal(res, false, 'contract should still have withdrawals disabled');
	});
	
	it(TEST_TAG + 'disable withdrawals should trigger "WithdrawalsDisabled" event', async () => {
		let tx = await config.enableWithdrawals(false, {from: admin1});
		// check for emitted event 'WithdrawalsDisabled(address indexed _admin)'
		truffleAssert.eventEmitted(tx, 'WithdrawalsDisabled', (ev) => {
            return ev._admin === admin1;
        });
        // there should be no 'DepositsDisabled' events
        truffleAssert.eventNotEmitted(tx, 'DepositsDisabled');
	});
	
	
	
	it(TEST_TAG + 'admin can enable withdrawals', async () => {
		await dconfig.enableWithdrawals(true, {from: admin1});
		assert.equal(await dconfig.withdrawalsEnabled(), true, 'contract should have withdrawals enabled by now');
	});
	
	it(TEST_TAG + 'user can NOT enable withdrawals', async () => {
		// user1 trying to enable withdrawals
		await truffleAssert.reverts(
			dconfig.enableWithdrawals(true, {from: user1}), "" //"AdminRole: caller does not have the Admin role"
		);
		assert.equal(await dconfig.withdrawalsEnabled(), false, 'contract should still have withdrawals disabled');
	});
	
	it(TEST_TAG + 'enable withdrawals should be possible only when they are disabled', async () => {
		/*await truffleAssert.reverts(
			config.enableWithdrawals(true, {from: admin1}), "" //"BlockchainBridge: Withdrawals are already enabled!"
		);*/
		let res = await config.enableWithdrawals.call(true, {from: admin1});
		assert.equal(res, false, 'contract should still have withdrawals enabled');
	});
	
	it(TEST_TAG + 'enable withdrawals should trigger "WithdrawalsEnabled" event', async () => {
		let tx = await dconfig.enableWithdrawals(true, {from: admin1});
		// check for emitted event 'WithdrawalsEnabled(address indexed _admin)'
		truffleAssert.eventEmitted(tx, 'WithdrawalsEnabled', (ev) => {
            return ev._admin === admin1;
        });
        // there should be no 'DepositsEnabled' events
        truffleAssert.eventNotEmitted(tx, 'DepositsEnabled');
	});
	
	
	
	/// deposit funds on the blockchain
	it(TEST_TAG + 'admin can execute "depositAccept" when user deposits real funds, new user balance and circulating supply match expected values', async () => {
		let tokens = 100000; //tokens/pennies = 1000 usd
		
		let user1Balance1 = await ffc.balanceOf(user1);
		let totalSupply1 = await ffc.totalSupply();
		
		let tx = await ffc.depositAccept(user1, tokens, {from: admin1});
		
		let user1Balance2 = await ffc.balanceOf(user1);
		assert.equal(user1Balance2.toNumber(), user1Balance1.toNumber() + tokens);
		
		let totalSupply2 = await ffc.totalSupply();
		assert.equal(totalSupply2.toNumber(), totalSupply1.toNumber() + tokens);
	});
	
	it(TEST_TAG + 'user can NOT execute "depositAccept"', async () => {
		await truffleAssert.reverts(
			ffc.depositAccept(user1, 1000, {from: user1}), "" //"AdminRole: caller does not have the Admin role"
		);
	});
	
	it(TEST_TAG + 'admin can NOT execute "depositAccept" when contract is paused or deposits are disabled', async () => {
		// admin1 pauses the contract
		await config.pause({from: admin1});
		// make sure contract is paused
		assert.equal(await config.isPaused(), true, 'contract should be paused by now');
		
		// admin1 trying to deposit funds to user when contract is paused should fail
		await truffleAssert.reverts(
			ffc.depositAccept(user1, 1000, {from: admin1}), "" //"Pausable: paused"
		);
		
		// admin1 trying to deposit funds to user when deposits are disabled should fail
		await truffleAssert.reverts(
			dffc.depositAccept(user1, 1000, {from: admin1}), "" //"BlockchainBridge: Operation allowed only when deposits are enabled!"
		);
	});
	
	it(TEST_TAG + 'admin executing "depositAccept" should trigger "DepositAccepted" and "Transfer" events and return true', async () => {
		let tokens = 100000; //tokens/pennies = 1000 usd
		let sym = await ffc.symbol();
		
		// it should also return true without submitting changes to the blockchain
		let res = await ffc.depositAccept.call(user1, tokens, {from: admin1});
		assert.equal(res, true, 'depositAccept should return true');
		
		let tx = await ffc.depositAccept(user1, tokens, {from: admin1});
		// check for emitted events:
		// 'DepositAccepted(address indexed _admin, address indexed _to, uint _amount, string _symbol)'
		// 'Transfer(address indexed from, address indexed to, uint tokens)'
		assert.equal(tx.logs.length, 2, 'triggers two events');
		
		assert.equal(tx.logs[0].event, 'Transfer', 'should be the "Transfer" event');
		assert.equal(tx.logs[0].args.from, 0x0, 'logs the zero address');
		assert.equal(tx.logs[0].args.to, user1, 'logs the user address being deposited funds on the blockchain');
		assert.equal(tx.logs[0].args.tokens, tokens, 'logs the tokens amount');
		
		assert.equal(tx.logs[1].event, 'DepositAccepted', 'should be the "DepositAccepted" event');
		assert.equal(tx.logs[1].args._admin, admin1, 'logs the current admin address');
		assert.equal(tx.logs[1].args._to, user1, 'logs the user address being deposited funds on the blockchain');
		assert.equal(tx.logs[1].args._amount, tokens, 'logs the tokens amount');
		
		/*truffleAssert.eventEmitted(tx, 'DepositAccepted', (ev) => {
            return ev._admin === admin1 && ev._to === user1 && ev._amount.toNumber() === tokens && ev._symbol === sym;
        });
		truffleAssert.eventEmitted(tx, 'Transfer', (ev) => {
            return ev.from === 0x0 && ev.to === user1 && ev.tokens.toNumber() === tokens;
        });*/
		
	});
	
	
	
	/// withdraw funds from the blockchain
	it(TEST_TAG + 'user can execute "withdrawRequest" to withdraw his funds, new user balance and circulating supply match expected values', async () => {
		let tokens = 100000; //tokens/pennies = 1000 usd
		
		// make sure userW has some funds before withdrawing, for testing
		let tx = await ffc.depositAccept(userW, tokens, {from: admin1});
		
		let user1Balance1 = await ffc.balanceOf(userW);
		let totalSupply1 = await ffc.totalSupply();
		assert.equal(user1Balance1.toNumber(), tokens, "userW should already have " + tokens + " tokens");
		
		tx = await ffc.withdrawRequest(tokens, {from: userW});
		
		// withdrawal fees are disabled
		let withdrawalFeeTokens = 0;
		
		let user1Balance2 = await ffc.balanceOf(userW);
		assert.equal(user1Balance2.toNumber(), user1Balance1.toNumber() - tokens, "userW should have remaining tokens: " + user1Balance2);
		
		let totalSupply2 = await ffc.totalSupply();
		assert.equal(totalSupply2.toNumber(), totalSupply1.toNumber() - tokens + withdrawalFeeTokens, "totalSupply after userW withdrawal should be " + totalSupply2);
	});
	
	it(TEST_TAG + 'user can NOT withdraw zero tokens or greater amount than available in his wallet', async () => {
		// make sure userW has some funds before withdrawing, for testing
		let tx = await ffc.depositAccept(userW, 1000, {from: admin1});
		
		// user can not withdraw zero tokens
		await truffleAssert.reverts(
			ffc.withdrawRequest(0, {from: userW}), "" //"Withdrawal tokens must be valid value available greater than zero"
		);
		
		// user can not withdraw more tokens than he has in his wallet
		await truffleAssert.reverts(
			ffc.withdrawRequest(10000, {from: userW}), "" //"Withdrawal tokens must be valid value available greater than zero"
		);
	});
	
	it(TEST_TAG + 'user can NOT withdraw tokens when contract is paused or withdrawals are disabled', async () => {
		// make sure userW has some funds before withdrawing, for testing
		let tx = await ffc.depositAccept(userW, 1000, {from: admin1});
		//tx = await dffc.depositAccept(userW, 1000, {from: admin1});
		
		// admin1 pauses the contract
		await config.pause({from: admin1});
		// make sure contract is paused
		assert.equal(await config.isPaused(), true, 'contract should be paused by now');
		
		// user trying to withdraw funds when contract is paused should fail
		await truffleAssert.reverts(
			ffc.withdrawRequest(1000, {from: userW}), "" //"Pausable: paused"
		);
		
		// admin1 unpauses the contract
		await config.unpause({from: admin1});
		// admin1 disables deposits
		await config.enableWithdrawals(false, {from: admin1});
		
		// user trying to withdraw funds when withdrawals are disabled should fail
		await truffleAssert.reverts(
			ffc.withdrawRequest(1000, {from: userW}), "" //"BlockchainBridge: Operation allowed only when withdrawals are enabled!"
		);
	});
	
	it(TEST_TAG + 'user withdrawing funds should trigger "WithdrawalRequested" event and return true', async () => {
		let tokens = 100000; //tokens/pennies = 1000 usd
		let sym = await ffc.symbol();
		
		// it should also return true without submitting changes to the blockchain
		let res = await ffc.depositAccept.call(user1, tokens, {from: admin1});
		assert.equal(res, true, 'depositAccept should return true');
		
		// deposit tokens into user1 wallet submitting changes to the blockchain
		await ffc.depositAccept(user1, tokens, {from: admin1});
		
		//let withdrawalTokensFee = ffc.calculateWithdrawalFeeTokens(tokens, {from: user1});
		let withdrawalTokensFee = 0;
		
		let tx = await ffc.withdrawRequest(tokens, {from: user1});
		// check for emitted events:
		// 'WithdrawalRequested(address indexed _from, uint _amount, uint _withdrawalTokensFee, string _symbol)'
		// 'WithdrawalFeesCollected(address indexed from, uint withdrawalTokens, uint withdrawalTokensFee, string symbol)'
		assert.equal(tx.logs.length, 2, 'triggers two events');
		
		assert.equal(tx.logs[0].event, 'Transfer', 'should be the "Transfer" event');
		assert.equal(tx.logs[0].args.from, user1, 'logs the user address being deposited funds on the blockchain');
		assert.equal(tx.logs[0].args.to, 0x0, 'logs the zero address');
		assert.equal(tx.logs[0].args.tokens, tokens, 'logs the tokens amount');
		
		assert.equal(tx.logs[1].event, 'WithdrawalRequested', 'should be the "WithdrawalRequested" event');
		assert.equal(tx.logs[1].args._from, user1, 'logs the current user address');
		assert.equal(tx.logs[1].args._amount, tokens, 'logs the tokens amount');
		assert.equal(tx.logs[1].args._withdrawalTokensFee, withdrawalTokensFee, 'logs the tokens fee amount');
		
		//assert.equal(tx.logs[1].event, 'WithdrawalFeesCollected', 'should be the "WithdrawalFeesCollected" event');
		//assert.equal(tx.logs[1].args.from, user1, 'logs the current user address');
		//assert.equal(tx.logs[1].args.withdrawalTokens, tokens, 'logs the tokens amount');
		//assert.equal(tx.logs[1].args.withdrawalTokensFee, withdrawalTokensFee, 'logs the tokens fee amount');
		//assert.equal(tx.logs[1].args.symbol, sym, 'logs the tokens symbol');
		
		/*truffleAssert.eventEmitted(tx, 'WithdrawalRequested', (ev) => {
            return ev._from === user1 && ev._amount.toNumber() === tokens && ev._symbol === sym;
        });
		truffleAssert.eventEmitted(tx, 'WithdrawalFeesCollected', (ev) => {
            return ev.from === user1 && ev.withdrawalTokens.toNumber() === tokens && ev.withdrawalTokensFee.toNumber() === withdrawalTokensFee 
				&& ev.symbol === sym;
        });*/
	});
	
	
	
	it(TEST_TAG + 'user withdrawing funds should pay no withdrawal fees when they are disabled', async () => {
		let tokens = 100000; //tokens/pennies = 1000 usd
		let sym = await ffc.symbol();
		
		// deposit tokens into user1 wallet submitting changes to the blockchain
		await ffc.depositAccept(user1, tokens, {from: admin1});
		
		// disable withdrawal fees
		//await ffc.disableWithdrawalFees({from: admin1});
		
		//let withdrawalTokensFee = await ffc.calculateWithdrawalFeeTokens(tokens, {from: user1});
		//assert.equal(withdrawalTokensFee, 0, 'withdrawal fees should be 0 as they are disabled by now');
		
		let user1Balance1 = await ffc.balanceOf(user1);
		let totalSupply1 = await ffc.totalSupply();
		assert.equal(user1Balance1.toNumber(), tokens, "user1 should already have " + tokens + " tokens");
		
		let tx = await ffc.withdrawRequest(tokens, {from: user1});
		
		let user1Balance2 = await ffc.balanceOf(user1);
		assert.equal(user1Balance2.toNumber(), user1Balance1.toNumber() - tokens, "user1 should have remaining tokens: " + user1Balance2);
		
		// *** total supply should reflect that no fees were charged on last withdrawal
		let totalSupply2 = await ffc.totalSupply();
		assert.equal(totalSupply2.toNumber(), totalSupply1.toNumber() - tokens, "totalSupply after user1 withdrawal should be " + totalSupply2);
	});
	
	it(TEST_TAG + 'admin address (no fees wallet) withdrawing funds should pay no withdrawal fees', async () => {
		let tokens = 100000; //tokens/pennies = 1000 usd
		let sym = await ffc.symbol();
		
		// deposit tokens into user1 wallet submitting changes to the blockchain
		await ffc.depositAccept(user1, tokens, {from: admin1});
		
		// make user1 wallet a no fees wallet / admin role wallet
		await config.addNoFeeAddress(user1, {from: contractOwner});
		
		let user1Balance1 = await ffc.balanceOf(user1);
		let totalSupply1 = await ffc.totalSupply();
		assert.equal(user1Balance1.toNumber(), tokens, "user1 should already have " + tokens + " tokens");
		
		// check fees collector wallet balance for later compare and find out fees were not collected
		let feesWallet = await config.feesCollectorWallet({from: admin1});
		let feesWalletBalance1 = await ffc.balanceOf(feesWallet);
		
		// make sure withdrawal fees are enabled
		//assert.equal(await ffc.checkWithdrawalFeesEnabled(), true, "withdrawal fees should be enabled");
		
		let tx = await ffc.withdrawRequest(tokens, {from: user1});
		
		let user1Balance2 = await ffc.balanceOf(user1);
		assert.equal(user1Balance2.toNumber(), user1Balance1.toNumber() - tokens, "user1 should have remaining tokens: " + user1Balance2);
		
		// *** total supply should reflect that no fees were charged on last withdrawal
		let totalSupply2 = await ffc.totalSupply();
		assert.equal(totalSupply2.toNumber(), totalSupply1.toNumber() - tokens, "totalSupply after user1 withdrawal should be " + totalSupply2);
		
		// *** fees collector wallet should reflect that no fees were charged on last withdrawal
		let feesWalletBalance2 = await ffc.balanceOf(feesWallet);
		assert.equal(feesWalletBalance2.toNumber(), feesWalletBalance1.toNumber(), "fees wallet balance after user1 withdrawal should be the same");
	});
	
	
	
	/// withdraw funds from the blockchain by "transfer" to their same sending address
	it(TEST_TAG + 'user can withdraw funds by transfer to their same sending address, new user balance and circulating supply match expected values', async () => {
		let tokens = 100000; //tokens/pennies = 1000 usd
		
		// make sure userW has some funds before withdrawing, for testing
		let tx = await ffc.depositAccept(userW, tokens, {from: admin1});
		
		let user1Balance1 = await ffc.balanceOf(userW);
		let totalSupply1 = await ffc.totalSupply();
		assert.equal(user1Balance1.toNumber(), tokens, "userW should already have " + tokens + " tokens");
		
		//tx = await ffc.transfer(0, tokens, {from: userW}); // transfer to zero address not allowed in solidity 0.5 ???
		tx = await ffc.transfer(userW, tokens, {from: userW});
		
		// withdrawal fees are disabled
		let withdrawalFeeTokens = 0;
		
		let user1Balance2 = await ffc.balanceOf(userW);
		assert.equal(user1Balance2.toNumber(), user1Balance1.toNumber() - tokens, "userW should have remaining tokens: " + user1Balance2);
		
		let totalSupply2 = await ffc.totalSupply();
		assert.equal(totalSupply2.toNumber(), totalSupply1.toNumber() - tokens + withdrawalFeeTokens, "totalSupply after userW withdrawal should be " + totalSupply2);
	});
	
	
	
	/// withdrawal minimum and maximum tests
	it(TEST_TAG + 'withdrawal amounts, min should be 5000 and max zero(disabled) upon deployment', async () => {
		assert.equal(await config.minWithdrawalAmount(), 5000, 'blockchain bridge withdrawal amount min should be 50 upon deployment');
		assert.equal(await config.maxWithdrawalAmount(), 0, 'blockchain bridge withdrawal amount max should be zero upon deployment');
	});
	
	it(TEST_TAG + 'only admin should be able to change min and max withdrawal amounts'
				+ ', triggers events "MinWithdrawalAmountChanged" and "MaxWithdrawalAmountChanged"', async () => {
		
		let sym = await ffc.symbol();
		
		// user1 trying to change min withdrawal amount should fail
		await truffleAssert.reverts(
			config.setMinWithdrawalAmount(100, {from: user1}), "Admin required" //"AdminRole: caller does not have the Admin role"
		);
		
		// user1 trying to change max withdrawal amount should fail
		await truffleAssert.reverts(
			config.setMaxWithdrawalAmount(100, {from: user1}), "Admin required" //"AdminRole: caller does not have the Admin role"
		);
		
		
		
		// admin1 trying to change min withdrawal amount should succeed and emit event
		let tx = await config.setMinWithdrawalAmount(100, {from: admin1});
		// check for emitted events:
		// 'MinWithdrawalAmountChanged(address indexed _admin, uint _minWithdrawalAmount, uint _newMinWithdrawalAmount, string _symbol)'
		assert.equal(tx.logs.length, 1, 'triggers event');
		
		assert.equal(tx.logs[0].event, 'MinWithdrawalAmountChanged', 'should be the "MinWithdrawalAmountChanged" event');
		assert.equal(tx.logs[0].args._admin, admin1, 'logs the current admin address');
		assert.equal(tx.logs[0].args._minWithdrawalAmount, 5000, 'logs the token min withdrawal amount');
		assert.equal(tx.logs[0].args._newMinWithdrawalAmount, 100, 'logs the token new min withdrawal amount');
		
		assert.equal(await config.minWithdrawalAmount(), 100, 'blockchain bridge withdrawal amount min should match new value');
		
		// admin1 trying to set the same min withdrawal amount should fail
		/*await truffleAssert.reverts(
			config.setMinWithdrawalAmount(100, {from: admin1}), "" //"BlockchainBridge: Min withdrawal amount has to be different than current value!"
		);*/
		let res = await config.setMinWithdrawalAmount.call(100, {from: admin1});
		assert.equal(res, false, 'blockchain bridge withdrawal amount min should still be the same');
		
		
		
		// admin1 trying to change max withdrawal amount should succeed and emit event
		tx = await config.setMaxWithdrawalAmount(100, {from: admin1});
		// check for emitted events:
		// 'MaxWithdrawalAmountChanged(address indexed _admin, uint _maxWithdrawalAmount, uint _newMaxWithdrawalAmount, string _symbol)'
		assert.equal(tx.logs.length, 1, 'triggers event');
		
		assert.equal(tx.logs[0].event, 'MaxWithdrawalAmountChanged', 'should be the "MaxWithdrawalAmountChanged" event');
		assert.equal(tx.logs[0].args._admin, admin1, 'logs the current admin address');
		assert.equal(tx.logs[0].args._maxWithdrawalAmount, 0, 'logs the token max withdrawal amount');
		assert.equal(tx.logs[0].args._newMaxWithdrawalAmount, 100, 'logs the token new max withdrawal amount');
		
		assert.equal(await config.maxWithdrawalAmount(), 100, 'blockchain bridge withdrawal amount max should match new value');
		
		// admin1 trying to set the same max withdrawal amount should fail
		/*await truffleAssert.reverts(
			config.setMaxWithdrawalAmount(100, {from: admin1}), "" //"BlockchainBridge: Max withdrawal amount has to be different than current value!"
		);*/
		res = await config.setMaxWithdrawalAmount.call(100, {from: admin1});
		assert.equal(res, false, 'blockchain bridge withdrawal amount max should still be the same');
	});
	
	it(TEST_TAG + 'test user withdrawal min max amount limits', async () => {
		
		let sym = await ffc.symbol();
		
		// admin1 changes min withdrawal amount
		let tx = await config.setMinWithdrawalAmount(4000, {from: admin1});
		assert.equal(await config.minWithdrawalAmount(), 4000, 'blockchain bridge withdrawal amount min should match new value');
		
		// admin1 changes max withdrawal amount
		tx = await config.setMaxWithdrawalAmount(50000, {from: admin1});
		assert.equal(await config.maxWithdrawalAmount(), 50000, 'blockchain bridge withdrawal amount max should match new value');
		
		
		let tokens = 100000;
		let user1Balance1 = await ffc.balanceOf(user1);
		tx = await ffc.depositAccept(user1, tokens, {from: admin1});
		let user1Balance2 = await ffc.balanceOf(user1);
		assert.equal(user1Balance2.toNumber(), user1Balance1.toNumber() + tokens);
		
		// user1 trying to withdraw less than min withdrawal amount should fail
		await truffleAssert.reverts(
			ffc.withdrawRequest(3000, {from: user1}), "" //"Withdrawal tokens must be greater than or equal to minimum limit"
		);
		
		// user1 trying to withdraw more than max withdrawal amount should fail
		await truffleAssert.reverts(
			ffc.withdrawRequest(50001, {from: user1}), "" //"Withdrawal tokens must be less than or equal to maximum limit"
		);
		
		// user1 trying to withdraw max withdrawal amount should succeed
		let res = await ffc.withdrawRequest.call(50000, {from: user1});
		assert.equal(res, true, 'user1 should be able to withdraw up to withdraw max limit');
		
		// disable max withdrawal
		// admin1 changes max withdrawal amount
		tx = await config.setMaxWithdrawalAmount(0, {from: admin1});
		assert.equal(await config.maxWithdrawalAmount(), 0, 'blockchain bridge withdrawal amount max should match new value');
		
		// user1 trying to withdraw above max withdrawal amount should succeed
		res = await ffc.withdrawRequest.call(50001, {from: user1});
		assert.equal(res, true, 'user1 should be able to withdraw above withdraw max limit');
		
		// user1 trying to withdraw above max withdrawal amount should succeed
		tx = await ffc.withdrawRequest(50001, {from: user1});
		assert.equal(await ffc.balanceOf(user1), tokens - 50001, 'user1 should have correct balance after withdraw');
	});
	
	
	
	/// whenKYCDisabledOrApprovedAddress tests
	it(TEST_TAG + 'users can NOT withdraw tokens when contract has KYC enabled and address is not approved', async () => {
		let tokens = 100000; //tokens/pennies = 1000 usd
		
		// make sure userW has some funds before withdrawing, for testing
		let tx = await ffc.depositAccept(userW, tokens, {from: admin1});
		
		await config.enableKYC(true, {from: admin1});
		assert.equal(await config.isKYCEnabled(), true, 'contract should be have KYC enabled by now');
		
		await truffleAssert.reverts(
			ffc.withdrawRequest(1000, { from: userW }), "" //"KYC: sender address must be approved!"
		);
		
		await config.approveKYCUserAddress(userW, { from: admin1 });
		assert.equal(await config.isKYCApproved(userW), true, 'userW should have KYC approved status by now');
		
		let ok = await ffc.withdrawRequest.call(5000, { from: userW });
		assert.equal(ok, true, 'userW withdrawRequest call should return true');
	});
	
	it(TEST_TAG + 'users can NOT be deposited tokens when contract has KYC enabled and address is not approved', async () => {
		let tokens = 100000; //tokens/pennies = 1000 usd
		
		await config.enableKYC(true, {from: admin1});
		assert.equal(await config.isKYCEnabled(), true, 'contract should be have KYC enabled by now');
		
		await truffleAssert.reverts(
			ffc.depositAccept(userW, tokens, {from: admin1}), "" //"KYC: depositAccept failed, <to> KYC is not approved!"
		);
		
		await config.approveKYCUserAddress(userW, { from: admin1 });
		assert.equal(await config.isKYCApproved(userW), true, 'userW should have KYC approved status by now');
		
		let ok = await ffc.depositAccept.call(userW, tokens, {from: admin1});
		assert.equal(ok, true, 'admin1 depositAccept call to userW should return true');
	});
	
	
	
	/// whenNOTBlacklistedAddress tests
	it(TEST_TAG + 'users can NOT withdraw tokens when address is blacklisted', async () => {
		let tokens = 100000; //tokens/pennies = 1000 usd
		
		// make sure userW has some funds before withdrawing, for testing
		let tx = await ffc.depositAccept(userW, tokens, {from: admin1});
		
		await config.blacklistUserAddress(userW, {from: admin1});
		assert.equal(await config.isBlacklisted(userW), true, 'userW should be blacklisted by now');
		
		await truffleAssert.reverts(
			ffc.withdrawRequest(1000, { from: userW }), "" //"BlacklistController: sender address must NOT be blacklisted!"
		);
		
		await config.allowBlacklistedUserAddress(userW, {from: admin1});
		assert.equal(await config.isBlacklisted(userW), false, 'userW should be allowed by now');
		
		let ok = await ffc.withdrawRequest.call(5000, { from: userW });
		assert.equal(ok, true, 'userW withdrawRequest call should return true');
	});
	
	it(TEST_TAG + 'users can NOT be deposited tokens when address is blacklisted', async () => {
		let tokens = 100000; //tokens/pennies = 1000 usd
		
		await config.blacklistUserAddress(userW, {from: admin1});
		assert.equal(await config.isBlacklisted(userW), true, 'userW should be blacklisted by now');
		
		await truffleAssert.reverts(
			ffc.depositAccept(userW, tokens, {from: admin1}), "" //"BlacklistController: depositAccept failed, <_to> is blacklisted!"
		);
		
		await config.allowBlacklistedUserAddress(userW, {from: admin1});
		assert.equal(await config.isBlacklisted(userW), false, 'userW should be allowed by now');
		
		let ok = await ffc.depositAccept.call(userW, tokens, {from: admin1});
		assert.equal(ok, true, 'admin1 depositAccept call to userW should return true');
	});
})
