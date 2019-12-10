pragma solidity ^0.4.24;

import "./Config.sol";

/**
 * @dev Top-level ERC20 compliant USD fiat currency token config contract.
 */
contract USDf_config is Config
{
	/**
	 * @dev Constructor
	 */
    constructor(address _admins)
		Config(_admins)
		public
	{
		name = "Fiatech USDf config";
    }
}