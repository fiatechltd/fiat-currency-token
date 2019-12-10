pragma solidity ^0.4.24;

import "./Owned.sol";
import "./interfaces/IFees.sol";



/**
 * @dev Base contract for config contract as external contract usage.
 */
contract HasFees is Owned
{
	IFees public transferFees;
	
	/**
	 * @dev Constructor
	 */
    constructor(address _fees) internal {
		setIFees(_fees);
    }
	
	function setIFees(address _fees) public onlyOwner {
		transferFees = IFees(_fees);
	}
}