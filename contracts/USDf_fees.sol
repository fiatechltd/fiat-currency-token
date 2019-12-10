pragma solidity ^0.4.24;

import "./Fees.sol";

/**
 * @dev Top-level ERC20 compliant USD fiat currency token fees contract.
 */
contract USDf_fees is Fees
{
	/**
	 * @dev Constructor
	 */
    constructor(address _admins)
		Fees(_admins)
		public
	{
		name = "Fiatech USDf fees";
    }
}