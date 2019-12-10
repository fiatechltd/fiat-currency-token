pragma solidity ^0.4.24;

import "./libs/SafeMathLib.sol";
import "./libs/FeesLib.sol";
import "./interfaces/IFeesLibEvents.sol";
import "./interfaces/IFees.sol";
import "./Owned.sol";
import "./Mortal.sol";
import "./EtherReclaimer.sol";
import "./Named.sol";
import "./HasAdmin.sol";



/**
 * @title FeesLib
 * @dev Contract library for managing fees on any contract, it handles fees percentages with minimum and maximum amount,
 * on eth blockchain having parts per X as percentage storing the two parts of the fraction.
 */
contract Fees is IFeesLibEvents
	, IFees
	, Owned
	, Mortal
	, EtherReclaimer
	, Named
	, HasAdmin
{
	using SafeMathLib for uint;
	
	using FeesLib for FeesLib.FeeStorage;
	
	FeesLib.FeeStorage fees;
	
	
	
	constructor(address _admins)
		HasAdmin(_admins)
		public
	{
		uint parts_Fee = 1; // 1 per 1000 as 0.1%
		uint perX_Fee = 1000; // 1 per 1000 as 0.1%
		uint min_Fee_tokens = 10; //10 cent(s) as fixed minimum fee
		uint max_Fee_tokens = 0; //0 means disabled fixed maximum fee
		bool fee_Enabled = false;
		fees.init(parts_Fee, perX_Fee, min_Fee_tokens, max_Fee_tokens, fee_Enabled);
	}
	
	/**
	 * @dev initTransferFees, given all required parameters in the same order as they are declared in the Fee struct.
	 * @param _parts_Fee Numerator component of the fee percentage
	 * @param _perX_Fee Denominator component of the fee percentage
	 * @param _min_Fee Mininmum amount of tokens for the fee
	 * @param _max_Fee Maximum amount of tokens for the fee, zero means no maximum
	 * @param _feesEnabled Are fees enables?
	 * @return bool
	 */
	function init(uint _parts_Fee, uint _perX_Fee, uint _min_Fee, uint _max_Fee, bool _feesEnabled) public onlyAdmin returns (bool) {
		return fees.init(_parts_Fee, _perX_Fee, _min_Fee, _max_Fee, _feesEnabled);
	}
	
	
	
	/**
	 * @dev CalculateFee, given token amount, calculate transfer fee in units/tokens that are cents or pennies
	 * @param tokens Tokens amount to calculate fees for
	 * @return uint
	 */
	function calculateFee(uint tokens) public view returns (uint fee) {
		return fees.calculateFee(tokens);
	}
	
	
	
	/**
	 * @dev Get minimum fee tokens/pennies/cents
	 * @return uint
	 */
	function getMinFee() public view returns (uint) {
		return fees.min_Fee;
	}
	
	/**
	 * @dev Get maximum fee tokens/pennies/cents
	 * @return uint
	 */
	function getMaxFee() public view returns (uint) {
		return fees.max_Fee;
	}
	
	
	
	/**
	 * @dev Change minimum fee tokens/pennies/cents
	 * @param newMinFee Minimum amount of tokens to be set as minimum
	 * @return bool
	 */
	function setMinFee(uint newMinFee) public onlyAdmin returns (bool ok) {
		ok = fees.setMinFee(newMinFee);
		if (ok) {
			emit MinFeesChanged(msg.sender, newMinFee);
		}
	}
	
	/**
	 * @dev Change maximum fee tokens/pennies/cents
	 * @param newMaxFee Maximum amount of tokens to be set as maximum
	 * @return bool
	 */
	function setMaxFee(uint newMaxFee) public onlyAdmin returns (bool ok) {
		ok = fees.setMaxFee(newMaxFee);
		if (ok) {
			emit MaxFeesChanged(msg.sender, newMaxFee);
		}
	}
	
	
	
	/**
	 * @dev Check enabled/disabled fees
	 * @return bool
	 */
	function feesEnabled() public view returns (bool) {
		return fees.feesEnabled;
	}
	
	/**
	 * @dev Enable/Disable fees
	 * @return bool
	 */
	function enableFees(bool enable) public onlyAdmin returns (bool ok) {
		ok = fees.enableFees(enable);
		if (ok) {
			if (enable)
				emit FeesEnabled(msg.sender);
			else emit FeesDisabled(msg.sender);
		}
	}
	
	
	
	/**
	 * @dev Get fees as parts per X units
	 * @return bool
	 */
	function getFeesNumerator() public view returns (uint _parts_Fee) {
		_parts_Fee = fees.parts_Fee;
	}
	
	
	/**
	 * @dev Get fees as parts per X units
	 * @return bool
	 */
	function getFeesDenominator() public view returns (uint _perX_Fee) {
		_perX_Fee = fees.perX_Fee;
	}
	
	/**
	 * @dev Set fees as parts per X units
	 * @param _parts_Fee Parts component of the fee percentage
	 * @param _perX_Fee Per X component of the fee percentage
	 * @return bool
	 */
	function setFees(uint _parts_Fee, uint _perX_Fee) public onlyAdmin returns (bool ok) {
		ok = fees.setFees(_parts_Fee, _perX_Fee);
		if (ok) {
			emit FeesChanged(msg.sender, _parts_Fee, _perX_Fee);
		}
	}
}