const FiatToken = artifacts.require("./FiatToken.sol");
const USDF = artifacts.require("./USDf.sol");
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

const common = require("./common.js");
const TEST_TAG = 'Contract-Ownership - ';



contract(common.TEST_CONTRACT_NAME, async accounts => {
	var tokenInstance;
	let contractOwner = accounts[0];
	let newContractOwner = accounts[1];
	let admin1 = accounts[2];
	let user1 = accounts[3];
	let ffc;
	let config;
	let fees;
	let admins;
	
	
	
	// 'beforeEach' function will run before each test creating a new instance of the contract each time
	beforeEach('setup contract for each test', async () => {
		//let ffc = await FiatToken.deployed();
        //ffc = await FiatToken.new(common.tokenSymbolUSD, common.tokenNameUSD, common.tokenVersion, common.tokenDecimals, {from: contractOwner});
		[ffc, admins, config, fees] = await common.createNewUSDContract(contractOwner);
		
		//config = await common.getConfig(ffc);
		//fees = await common.getTransferFees(ffc);
		
		await admins.addAdmin(admin1, {from: contractOwner});
		assert(await config.isAdmin(admin1), true, 'admin1 should have admin role by now');
    });
	
	
	
	it(TEST_TAG + 'contract owner address should be the same as deployer address upon deployment', async () => {
		assert.equal(await ffc.owner(), contractOwner, 'deployer address should match contract owner address upon deployment');
	});
	
	it(TEST_TAG + 'nominated new contract owner address is zero upon deployment', async () => {
		//check that nominated new contract owner address is zero upon deployment
		let newNominatedOwner1 = await ffc.newOwner();
		assert.equal(newNominatedOwner1, 0x0, 'nominated new owner address is zero upon deployment');
	});
	
	it(TEST_TAG + 'contract ownership transfer', async () => {
        //make sure contract owner address is the same as deployer address
		assert.equal(await ffc.owner(), contractOwner);
		
		// Test not owner user trying to transfer ownership of contract
		await truffleAssert.reverts(
			ffc.transferOwnership(user1, { from: admin1 }), "Owner required"
		);
		
		
		
		//transfer contract ownership
		let req = await ffc.transferOwnership(newContractOwner);
		assert.equal(await ffc.newOwner(), newContractOwner, 'contract ownership nominated the correct new owner address');
		
		//only new nominated owner accepts contract ownership
		try {
            await ffc.acceptOwnership({from: user1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'acceptOwnership error message must contain revert');
        }
		
		//new nominated owner finally accepts contract ownership
		let receipt = await ffc.acceptOwnership({from: newContractOwner});
		//console.log('receipt.logs[0] >>> ', receipt.logs[0]);
		assert.equal(receipt.logs.length, 1, 'triggers one event');
		assert.equal(receipt.logs[0].event, 'OwnershipTransferred', 'should be the "OwnershipTransferred" event');
		assert.equal(receipt.logs[0].args._from, contractOwner, 'logs the current contract owner address');
		assert.equal(receipt.logs[0].args._to, newContractOwner, 'logs the nominated new contract owner address');
		
		//check the new contract owner is correct
		let newOwner1 = await ffc.owner();
		assert.equal(newOwner1, newContractOwner, 'nominated owner accepted contract ownership');
		
		//check that nominatd new contract owner is zero now
		let newNominatedOwner1 = await ffc.newOwner();
		assert.equal(newNominatedOwner1, 0x0, 'nominated new owner address is zero after he just accepted contract ownership');
    });
})
