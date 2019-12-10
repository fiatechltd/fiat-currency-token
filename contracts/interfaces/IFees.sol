pragma solidity ^0.4.24;

import "./IFeesLibEvents.sol";



/**
 * @dev Interface for contract fees library.
 */
contract IFees is IFeesLibEvents
{
	/**
	 * @dev Init fees
	 * @param parts_Fee Numerator part of the percentage fee.
	 * @param perX_Fee Denominator part of the percentage fee.
	 * @param min_Fee_tokens Minimum fee limit.
	 * @param max_Fee_tokens Maximum fee limit.
	 * @param fee_Enabled Enable/disable fees toggle.
	 * @return bool
	 */
	function init(uint parts_Fee, uint perX_Fee, uint min_Fee_tokens, uint max_Fee_tokens, bool fee_Enabled) public returns (bool);
	
	/**
	 * @dev calculateFee, given token amount, calculate transfer fee in units/tokens that are cents or pennies
	 * @param tokens Tokens amount to calculate fees for
	 * @return uint
	 */
	function calculateFee(uint tokens) public view returns (uint fee);
	
	
	
	/**
	 * @dev Get minimum fee tokens/pennies/cents
	 * @return uint
	 */
	function getMinFee() public view returns (uint);
	
	/**
	 * @dev Get maximum fee tokens/pennies/cents
	 * @return uint
	 */
	function getMaxFee() public view returns (uint);
	
	
	
	/**
	 * @dev Change minimum fee tokens/pennies/cents
	 * @param newMinFee Minimum amount of tokens to be set as minimum
	 * @return bool
	 */
	function setMinFee(uint newMinFee) public returns (bool);
	
	/**
	 * @dev Change maximum fee tokens/pennies/cents
	 * @param newMaxFee Maximum amount of tokens to be set as maximum
	 * @return bool
	 */
	function setMaxFee(uint newMaxFee) public returns (bool);
	
	
	
	/**
	 * @dev Check enabled/disabled fees
	 * @return bool
	 */
	function feesEnabled() public view returns (bool);
	
	/**
	 * @dev Enable/Disable fees
	 * @return bool
	 */
	function enableFees(bool enable) public returns (bool);
	
	
	
	/**
	 * @dev Get fees as parts per X units
	 * @return bool
	 */
	function getFeesNumerator() public view returns (uint _parts_Fee);
	
	/**
	 * @dev Get fees as parts per X units
	 * @return bool
	 */
	function getFeesDenominator() public view returns (uint _perX_Fee);
	
	/**
	 * @dev Set fees as parts per X units
	 * @param _parts_Fee Parts component of the fee percentage
	 * @param _perX_Fee Per X component of the fee percentage
	 * @return bool
	 */
	function setFees(uint _parts_Fee, uint _perX_Fee) public returns (bool);
}