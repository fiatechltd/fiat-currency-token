pragma solidity ^0.4.24;

import "./SafeMathLib.sol";

/**
 * @title FeesLib
 * @dev Library for managing fees on any contract, it handles fees percentages with minimum and maximum amount,
 * on eth blockchain having parts per X as percentage storing the two parts of the fraction.
 */
library FeesLib {
	
	using SafeMathLib for uint;
	
	// fee as parts per X units, e.g. 2 per 1000 = 0.2%
    struct FeeStorage {
		// e.g. 0.1% => [1] per 1000, this is 1
		uint parts_Fee;
		
		// e.g. 0.1% => 1 per [1000], this is 1000
		uint perX_Fee;
		
		// minimum fee in tokens that are the minimum unit number in smart contract
		uint min_Fee;
		
		// maximum fee in tokens that are the maximum unit number in smart contract, if zero is disabled
		uint max_Fee;
		
		// fees enabled/disabled
		bool feesEnabled;
    }
	
	
	
	/**
	 * @dev initTransferFees, given all required parameters in the same order as they are declared in the FeeStorage struct.
	 * @param _parts_Fee Parts component of the fee percentage
	 * @param _perX_Fee Per X component of the fee percentage
	 * @param _min_Fee Mininmum amount of tokens for the fee
	 * @param _max_Fee Maximum amount of tokens for the fee, zero means no maximum
	 * @param _feesEnabled Are fees enables?
	 * @return bool
	 */
	function init(FeeStorage storage self, uint _parts_Fee, uint _perX_Fee, uint _min_Fee, uint _max_Fee, bool _feesEnabled) internal returns (bool) {
		if (self.parts_Fee != _parts_Fee)
			self.parts_Fee = _parts_Fee;
		if (self.perX_Fee != _perX_Fee)
			self.perX_Fee = _perX_Fee;
		if (self.min_Fee != _min_Fee)
			self.min_Fee = _min_Fee;
		if (self.max_Fee != _max_Fee)
			self.max_Fee = _max_Fee;
		if (self.feesEnabled != _feesEnabled)
			self.feesEnabled = _feesEnabled;
		return true;
	}
	
	
	
	/**
	 * @dev CalculateFee, given token amount, calculate transfer fee in units/tokens that are cents or pennies
	 * @param tokens Tokens amount to calculate fees for
	 * @return uint
	 */
	function calculateFee(FeeStorage storage self, uint tokens) internal view returns (uint fee) {
		if (!self.feesEnabled)
			return 0;
		
		fee = tokens.percent(self.parts_Fee, self.perX_Fee);
		
		//filter fee to minimum amount of tokens/pennies allowed
		if (self.feesEnabled && fee < self.min_Fee) {
			fee = self.min_Fee;
		}
		
		//filter fee to maximum amount of tokens/pennies allowed if greater than zero
		if (self.feesEnabled && self.max_Fee > 0 && fee > self.max_Fee) {
			fee = self.max_Fee;
		}
	}
	
	
	
	/**
	 * @dev Get minimum fee tokens/pennies/cents
	 * @return uint
	 */
	function getMinFee(FeeStorage storage self) internal view returns (uint) {
		return self.min_Fee;
	}
	
	/**
	 * @dev Get maximum fee tokens/pennies/cents
	 * @return uint
	 */
	function getMaxFee(FeeStorage storage self) internal view returns (uint) {
		return self.max_Fee;
	}
	
	
	
	/**
	 * @dev Change minimum fee tokens/pennies/cents
	 * @param newMinFee Minimum amount of tokens to be set as minimum
	 * @return bool
	 */
	function setMinFee(FeeStorage storage self, uint newMinFee) internal returns (bool) {
		if (self.min_Fee != newMinFee) {
			self.min_Fee = newMinFee;
			return true;
		}
		return false;
	}
	
	/**
	 * @dev Change maximum fee tokens/pennies/cents
	 * @param newMaxFee Maximum amount of tokens to be set as maximum
	 * @return bool
	 */
	function setMaxFee(FeeStorage storage self, uint newMaxFee) internal returns (bool) {
		if (self.max_Fee != newMaxFee) {
			self.max_Fee = newMaxFee;
			return true;
		}
		return false;
	}
	
	
	
	/**
	 * @dev Enable/Disable fees
	 * @return bool
	 */
	function enableFees(FeeStorage storage self, bool enable) internal returns (bool) {
		if (self.feesEnabled != enable) {
			self.feesEnabled = enable;
			return true;
		}
		return false;
	}
	
	
	
	/**
	 * @dev Set fees as parts per X units
	 * @param _parts_Fee Parts component of the fee percentage
	 * @param _perX_Fee Per X component of the fee percentage
	 * @return bool
	 */
	function setFees(FeeStorage storage self, uint _parts_Fee, uint _perX_Fee) internal returns (bool) {
		// at least one factor has to be different for change to be allowed, what's the point of setting the same values anyway?
		require(_parts_Fee != self.parts_Fee || _perX_Fee != self.perX_Fee, "FeesLib._setFees: required _parts_Fee != self.parts_Fee || _perX_Fee != self.perX_Fee");
		require(_perX_Fee > 0, "FeesLib._setFees: required _perX_Fee > 0");
		require(_parts_Fee < _perX_Fee, "FeesLib._setFees: required _parts_Fee < _perX_Fee");
		
		self.parts_Fee = _parts_Fee;
		self.perX_Fee = _perX_Fee;
		
		return true;
	}
}