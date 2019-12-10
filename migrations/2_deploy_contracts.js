//var FiatechFiatCurrency = artifacts.require("./FiatechFiatCurrency.sol");
const USDF = artifacts.require("./USDf.sol");
//const ERC20Lib = artifacts.require("./ERC20Lib.sol");
const Admin = artifacts.require("./Admin.sol");
//const Config = artifacts.require("./Config.sol");
//const Fees = artifacts.require("./Fees.sol");
const USDf_config = artifacts.require("./USDf_config.sol");
const USDf_fees = artifacts.require("./USDf_fees.sol");

var tokenSymbol = 'USDF';
var tokenName = 'US dollar fiat token';

module.exports = function(deployer) {
  //deployer.deploy(FiatechFiatCurrency, "USD", "US dollar").then(function() {
	// deployer.deploy(FiatechFiatCurrency, tokenSymbol, tokenName, "v1.0", 2).then(function() {
	//deployer.deploy(ERC20Lib);
	deployer.deploy(Admin)
	.then(() => {
		return deployer.deploy(USDf_config, Admin.address);
	})
	.then(() => {
		return deployer.deploy(USDf_fees, Admin.address);
	})
	.then(() => {
		return deployer.deploy(USDF, USDf_config.address, USDf_fees.address);
	});
	
	//deployer.link(ERC20Lib, USDF);
	//deployer.link(AttributesLib, USDF);
	//deployer.link(FeesLib, USDF);
	
	/*deployer.deploy(USDF).then(function() {
		// Token price is 0.001 Ether
		var tokenPrice = 1000000000000000;
		//return deployer.deploy(DappTokenSale, DappToken.address, tokenPrice);
	});*/
};
