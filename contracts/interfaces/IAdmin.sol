pragma solidity ^0.4.24;

/**
 * @dev Interface for System Config admin.
 */
contract IAdmin
{
	function isAdmin(address _account) public view returns (bool);
	
	function addAdmin(address _account) public;
	
	function removeAdmin(address _account) public;
	
    function renounceAdmin() public;
}