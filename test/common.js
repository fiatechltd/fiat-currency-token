const FiatechFiatCurrency = artifacts.require("./FiatToken.sol");
const USDF = artifacts.require("./USDf.sol");
const Admin = artifacts.require("./Admin.sol");
const Config = artifacts.require("./USDf_config.sol");
const Fees = artifacts.require("./USDf_fees.sol");
const IAdmin = artifacts.require("./IAdmin.sol");
const IConfig = artifacts.require("./IConfig.sol");
const IFees = artifacts.require("./IFees.sol");

module.exports.TEST_CONTRACT_NAME = 'USDf-FiatToken';

module.exports.tokenSymbolUSD = 'USDf';
module.exports.tokenNameUSD = 'USD fiat token';

module.exports.tokenSymbolEUR = 'EURf';
module.exports.tokenNameEUR = 'EUR fiat token';

module.exports.tokenVersion = 'v1.0';
module.exports.tokenDecimals = 2;

module.exports.ownerInitialBalance = 100000; //in cents/pennies/tokens

//module.exports.admins;
//module.exports.config;
//module.exports.fees;

module.exports.createNewUSDContract = async function(contractOwner) {
	//return FiatToken.new(tokenSymbolUSD, tokenNameUSD, tokenVersion, tokenDecimals, {from: contractOwner});
	let admins = await Admin.new({from: contractOwner});
	let config = await Config.new(admins.address, {from: contractOwner});
	let fees = await Fees.new(admins.address, {from: contractOwner});
	let usd = await USDF.new(config.address, fees.address, {from: contractOwner});
	//await usd.setIConfig(config.address);
	//await usd.setIFees(fees.address);
	return [usd, admins, config, fees];
};

module.exports.createNewUSDContractWithParams = async function(contractOwner, admins) {
	let config = await Config.new(admins.address, {from: contractOwner});
	let fees = await Fees.new(admins.address, {from: contractOwner});
	let usd = await USDF.new(config.address, fees.address, {from: contractOwner});
	return [usd, admins, config, fees];
};



module.exports.createConfigContract = async function(contractOwner) {
	let admins = Admin.new({from: contractOwner});
	let config = Config.new(admins.address, {from: contractOwner});
	return config;
};

module.exports.createFeesContract = async function(contractOwner) {
	let admins = Admin.new({from: contractOwner});
	let fees = Fees.new(admins.address, {from: contractOwner});
	return fees;
};



module.exports.getAdmins = async function(contract) {
	let admins = await IAdmin.at(await contract.admins());
	return admins;
};

module.exports.getConfig = async function(contract) {
	let config = await IConfig.at(await contract.config());
	return config;
};

module.exports.getTransferFees = async function(contract) {
	let fees = await IFees.at(await contract.transferFees());
	return fees;
};