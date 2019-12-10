pragma solidity ^0.4.24;

import "./Owned.sol";

/**
 * @dev Contract used to give a name to implementing contract.
 */
contract Named is Owned
{
	bytes32 public name;
	
	/**
	 * @dev Event raised when name was changed.
	 * @param _owner Contract owner performing the operation.
	 * @param _newName New name given to contract.
	 */
	event NameChanged(address indexed _owner, bytes32 _newName);
    
	
	
	/**
	 * @dev Constructor
	 */
    constructor() internal {
		name = "";
    }
	
    /**
	 * @dev Change contract name, only admin can do it.
	 * @param _newName New name given to contract.
	 */
    function setName(bytes32 _newName) public onlyOwner returns (bool success) {
		if (name != _newName) {
			name = _newName;
			emit NameChanged(msg.sender, _newName);
			return true;
		}
		return false;
    }
}