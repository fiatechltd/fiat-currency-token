pragma solidity ^0.4.24;

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// Safe maths
// ----------------------------------------------------------------------------

library SafeMathLib {
	
	using SafeMathLib for uint;
	
	/**
	 * @dev Sum two uint numbers.
	 * @param a Number 1
	 * @param b Number 2
	 * @return uint
	 */
    function add(uint a, uint b) internal pure returns (uint c) {
        c = a + b;
        require(c >= a, "SafeMathLib.add: required c >= a");
    }
	
	/**
	 * @dev Substraction of uint numbers.
	 * @param a Number 1
	 * @param b Number 2
	 * @return uint
	 */
    function sub(uint a, uint b) internal pure returns (uint c) {
        require(b <= a, "SafeMathLib.sub: required b <= a");
        c = a - b;
    }
	
	/**
	 * @dev Product of two uint numbers.
	 * @param a Number 1
	 * @param b Number 2
	 * @return uint
	 */
    function mul(uint a, uint b) internal pure returns (uint c) {
        c = a * b;
        require((a == 0 || c / a == b), "SafeMathLib.mul: required (a == 0 || c / a == b)");
    }
	
	/**
	 * @dev Division of two uint numbers.
	 * @param a Number 1
	 * @param b Number 2
	 * @return uint
	 */
    function div(uint a, uint b) internal pure returns (uint c) {
        require(b > 0, "SafeMathLib.div: required b > 0");
        c = a / b;
    }
	
	
	
	/**
	 * @dev Calculate percent as parts 'parts' per X amount 'perX' from given number 'amount'
	 * @param amount Amount to calculate percent for
	 * @param parts Parts of the percent e.g. (7) parts per 1000.
	 * @param perX Per X amount of the percent, like 7 parts per (1000) perX.
	 * @return uint percent amount tokens
	 */
	function percent(uint amount, uint parts, uint perX) internal pure returns (uint p) {
		require(perX > 0, "SafeMathLib.percent: required perX > 0");
        if (amount == 0)
			return 0;
		
		uint c = amount * parts;
        bool mulOverflow = (parts > 0 && c / amount != parts);
		
		// if mulOverflow, we do the division first instead of the multiplication
		// as we have the formula for percentage: percent = amount * parts / perX;
		if (mulOverflow)
			p = amount.div(perX).mul(parts);
		else p = amount.mul(parts).div(perX);
    }
}