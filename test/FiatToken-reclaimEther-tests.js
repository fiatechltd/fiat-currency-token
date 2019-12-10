const FiatToken = artifacts.require("./FiatToken.sol");
const USDF = artifacts.require("./USDf.sol");
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

const common = require("./common.js");
const TEST_TAG = 'ReclaimETHER - ';


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
    });
	
	
	
	it(TEST_TAG + 'only owner can reclaim ether sent to contract address', async () => {
		let ffcAddress = ffc.address;
		console.log("ffc.address >> ", ffcAddress);
		
		let ethers = 10;
		let wei = web3.utils.toWei(ethers.toString(), "ether"); //10 * Math.pow(18); //10 ethers in wei
		
		let ffcAddressBalance1 = await web3.eth.getBalance(ffcAddress);
		assert.equal(ffcAddressBalance1, 0, "contract should have " + 0 + " ether upon deployment");
		
		// user1 sends ether to contract address as donation
		//let tx = await ffc.send(wei, {from: user1});
		let tx = await web3.eth.sendTransaction({from: user1, to: ffcAddress, value: wei});
		
		// recover lost funds
		let ffcAddressBalance2 = await web3.eth.getBalance(ffcAddress);
		assert.equal(web3.utils.fromWei(ffcAddressBalance2, "ether"), ethers, "ffcAddressBalance2 should have " + ethers);
		
		// user1 trying to reclaim ether sent to contract address should fail
		await truffleAssert.reverts(
			ffc.reclaimEther(contractOwner, {from: user1}), "Owner required"
		);
		
		// admin trying to reclaim ether sent to contract address should fail
		await truffleAssert.reverts(
			ffc.reclaimEther(contractOwner, {from: admin1}), "Owner required"
		);
		
		let user2Balance1 = await web3.eth.getBalance(user2);
		let user2Balance1ether = web3.utils.fromWei(user2Balance1, "ether");
		console.log("***user2Balance1ether >> ", user2Balance1ether);
		
		await ffc.reclaimEther(user2, {from: contractOwner});
		//assert.equal(ok, true, "owner should be able to reclaim ether from contract address");
		
		let user2Balance2 = await web3.eth.getBalance(user2);
		let user2Balance2ether = web3.utils.fromWei(user2Balance2, "ether");
		
		let user2BalanceExpected = parseFloat(user2Balance1ether) + ethers;
		assert.equal(user2Balance2ether, user2BalanceExpected, "user2 should have " + ethers + " ether balance increase by now");
		
		let ffcAddressBalance3 = await web3.eth.getBalance(ffcAddress);
		assert.equal(ffcAddressBalance3, 0, "contract should have " + 0 + " ether after they were reclaimed");
	});
})
