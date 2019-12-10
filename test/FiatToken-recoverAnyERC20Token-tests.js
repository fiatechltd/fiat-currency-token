const FiatToken = artifacts.require("./FiatToken.sol");
const USDF = artifacts.require("./USDf.sol");
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

const common = require("./common.js");
const TEST_TAG = 'RecoverAnyERC20Token - ';


contract(common.TEST_CONTRACT_NAME, async accounts => {
	var tokenInstance;
	let contractOwner = accounts[0];
	let admin1 = accounts[1];
	//let admin2 = accounts[2];
	let user1 = accounts[3];
	let user2 = accounts[4];
	let ffc;
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
		
		// add a system admin to perform admin operations like recoverable wallets reset
		await admins.addAdmin(admin1, {from: contractOwner});
		assert.equal(await config.isAdmin(admin1), true, 'admin1 should have admin role by now');
		
		// make contract address a no fee wallet for zero fees on transfers for easier testing
		await config.addNoFeeAddress(ffc.address, {from: contractOwner});
		assert.equal(await config.isNoFeeAddress(ffc.address), true, 'ffc.address should have no fee address role by now');
    });
	
	
	
	it(TEST_TAG + 'only owner can recover funds user sent by mistake to the contract address, triggers "ERC20TokenRecovered" event', async () => {
		let tokens = 100000; //tokens/pennies = 1000 usd
		
		let ffcAddress = ffc.address;
		console.log("ffc.address >> ", ffcAddress);
		
		// make sure user1 has some funds before withdrawing, for testing
		let tx = await ffc.depositAccept(user1, tokens, {from: admin1});
		
		let user1Balance1 = await ffc.balanceOf(user1);
		let totalSupply1 = await ffc.totalSupply();
		assert.equal(user1Balance1.toNumber(), tokens, "user1 should already have " + tokens + " tokens");
		
		let ffcAddressBalance1 = await ffc.balanceOf(ffcAddress);
		assert.equal(ffcAddressBalance1.toNumber(), 0, "ffcAddressBalance1 should be zero");
		
		// user1 sends tokens to contract address for some reason and their are locked
		tx = await ffc.transfer(ffc.address, tokens, {from: user1});
		
		// default withdrawal fee is 0.1%
		let withdrawalFeeTokens = 0; // 0.1% of 100000
		
		let user1Balance2 = await ffc.balanceOf(user1);
		assert.equal(user1Balance2.toNumber(), user1Balance1.toNumber() - tokens, "user1 should have remaining tokens: " + user1Balance2);
		
		let totalSupply2 = await ffc.totalSupply();
		assert.equal(totalSupply2.toNumber(), totalSupply1.toNumber(), "totalSupply after user1 withdrawal should be " + totalSupply2);
		
		// recover lost funds
		let ffcAddressBalance2 = await ffc.balanceOf(ffcAddress);
		assert.equal(ffcAddressBalance2.toNumber(), tokens, "ffcAddressBalance2 should be " + tokens);
		
		// user trying to recover tokens sent to this same contract should fail
		await truffleAssert.reverts(
			ffc.recoverAnyERC20Token(ffcAddress, tokens, {from: user1}), "Owner required"
		);
		
		// recover tokens sent to this same contract
		tx = await ffc.recoverAnyERC20Token(ffcAddress, tokens, {from: contractOwner});
		// check for emitted event:
		// ERC20TokenRecovered(address indexed tokenAddress, address indexed fromContractAddress, address indexed to, uint tokens)
		/*assert.equal(tx.logs.length, 3, 'recoverAnyERC20Token should trigger some events');
		assert.equal(tx.logs[2].event, 'ERC20TokenRecovered', 'should be the "ERC20TokenRecovered" event');
		assert.equal(tx.logs[2].args.tokenAddress, ffcAddress, 'logs locked tokens contract address');
		assert.equal(tx.logs[2].args.fromContractAddress, ffcAddress, 'logs the current contract address that foreign tokens were locked in');
		assert.equal(tx.logs[2].args.to, contractOwner, 'logs the address tokens were sent to and recovered');
		assert.equal(tx.logs[2].args.tokens, tokens, 'logs the amount of tokens that were recovered');*/
		
		let ffcAddressBalance3 = await ffc.balanceOf(ffcAddress);
		assert.equal(ffcAddressBalance3.toNumber(), 0, "ffcAddressBalance3 should be " + tokens);
		
		// make sure owner has got the lost/locked funds in this contract that were just recovered
		let ownerBalance1 = await ffc.balanceOf(contractOwner);
		assert.equal(ownerBalance1.toNumber(), tokens, "ownerBalance1 should be " + tokens);
	});
})
