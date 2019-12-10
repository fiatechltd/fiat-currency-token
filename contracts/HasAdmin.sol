pragma solidity ^0.4.24;

import "./Owned.sol";
import "./interfaces/IAdmin.sol";

/**
 * @dev Base contract for admin contract as external contract usage.
 */
contract HasAdmin is Owned
{
	IAdmin public admins;
	
	/**
	 * @dev Constructor
	 */
    constructor(address _admins) internal {
		setIAdmin(_admins);
    }
	
	modifier onlyAdmin {
		require(admins.isAdmin(msg.sender), "Admin required");
		_;
	}
	
	function setIAdmin(address _admins) public onlyOwner {
		admins = IAdmin(_admins);
	}
}