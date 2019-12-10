pragma solidity ^0.4.24;

/**
 * @dev Contract used to give other contracts ownership rights and management features.
 * based on:
 * https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/ownership/Ownable.sol
 */
contract Owned {
	
    address public owner;
    address public newOwner;
	
	/**
	 * @dev Event raised when ownership was transfered to a different address.
	 * @param _from Current owner address we transfer ownership from
	 * @param _to New owner address that just acquired ownership
	 */
    event OwnershipTransferred(address indexed _from, address indexed _to);
	
	
	
	/**
	 * @dev Constructor
	 */
    constructor() internal {
        owner = msg.sender;
		emit OwnershipTransferred(address(0), owner);
    }
	
    modifier onlyOwner {
        require(msg.sender == owner, "Owner required");
        _;
    }
	
	/**
	 * @dev Transfer ownership function
	 * @param _newOwner New owner address acquiring ownership of contract
	 */
    function transferOwnership(address _newOwner) public onlyOwner {
        newOwner = _newOwner;
    }
	
	/**
	 * @dev New owner pending to accept ownership executes this function to confirm his ownership.
	 */
    function acceptOwnership() public {
        require(msg.sender == newOwner, "Owned: Only user with pending ownership acceptance can accept ownership!");
		
        emit OwnershipTransferred(owner, newOwner);
        
		owner = newOwner;
        newOwner = address(0);
    }
}