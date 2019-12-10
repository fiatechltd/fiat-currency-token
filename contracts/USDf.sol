pragma solidity ^0.4.24;

import "./FiatToken.sol";



/**
 * @dev Top-level ERC20 compliant USD fiat currency token, with symbol, name, version and decimals among others.
 * Token units in this contract mean cents or pennies of the fiat currency it represents.
 */
contract USDf is FiatToken
{
	/**
	 * @dev Constructor
	 */
    constructor(address _config, address _fees)
		FiatToken(_config, _fees)
		public
	{
    }
	
	function decimals() public pure returns (uint8) {
        return 2;
    }

    function name() public pure returns (string) {
        return "USD fiat token";
    }

    function symbol() public pure returns (string) {
        return "USDf";
    }
	
	function version() public pure returns (string) {
        return "v1.0";
    }
}