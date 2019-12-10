pragma solidity ^0.4.24;

import "./interfaces/IAdmin.sol";
import "./Owned.sol";
import "./Named.sol";

contract Admin is IAdmin
	, Owned
	, Named
{
	/**
	 * @dev Event is raised when a new admin was added.
	 * @param admin Admin address performing the operation.
	 * @param account New admin address added.
	 */
	event AdminAdded(address indexed admin, address indexed account);
	
	/**
	 * @dev Event is raised when admin was removed.
	 * @param admin Admin address performing the operation.
	 * @param account Admin address being removed.
	 */
    event AdminRemoved(address indexed admin, address indexed account);
	
	/**
	 * @dev Event is raised when admin renounces to his admin role.
	 * @param account Admin address renouncing to his admin role.
	 */
	event AdminRenounced(address indexed account);
	
	
	
	mapping(address => bool) public admin;
	
	constructor()
		Owned()
		public
	{
		addAdmin(msg.sender);
		name = "Fiatech admins";
	}
	
	modifier onlyAdmin() {
		require(admin[msg.sender], "Admin required");
		_;
	}
	
	function isAdmin(address _account) public view returns (bool) {
		return admin[_account];
	}
	
	function addAdmin(address _account) public onlyOwner {
		require(_account != address(0));
		require(!admin[_account], "Admin already added");
		admin[_account] = true;
		emit AdminAdded(msg.sender, _account);
	}
	
	function removeAdmin(address _account) public onlyOwner {
		require(_account != address(0));
		require(_account != owner, "Owner can not remove his admin role");
		require(admin[_account], "Remove admin only");
		admin[_account] = false;
		emit AdminRemoved(msg.sender, _account);
	}
	
	function renounceAdmin() public {
		require(msg.sender != owner, "Owner can not renounce to his admin role");
		require(admin[msg.sender], "Renounce admin only");
		admin[msg.sender] = false;
		emit AdminRenounced(msg.sender);
    }
}
