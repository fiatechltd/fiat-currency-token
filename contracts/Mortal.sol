pragma solidity ^0.4.24;

import "./Owned.sol";



/**
 * @dev Contract used to self destruct contract.
 */
contract Mortal is Owned {
    
	/**
	 * @dev Constructor
	 */
    constructor () internal {
    }
	
	/**
	 * @dev Destroy contract eliminating it from the blockchain
	 */
    function kill() public onlyOwner {
		// transfer available funds to owner
		selfdestruct(owner);
    }
}