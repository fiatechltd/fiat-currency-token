pragma solidity ^0.4.24;

// ----------------------------------------------------------------------------
// based on:
// https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/lifecycle/Pausable.sol
// ----------------------------------------------------------------------------

import "../HasConfig.sol";

/**
 * @title Pausable
 * @dev Base contract which allows children to implement an emergency stop mechanism.
 */
contract Pausable is HasConfig {
    
	event Paused(address account);
    event Unpaused(address account);

    bool private _paused;

	/**
	 * @dev Constructor
	 */
    constructor () internal {
        _paused = false;
    }

    /**
	 * @dev Check if contract is paused
     * @return bool True if the contract is paused, false otherwise.
     */
    function paused() public view returns (bool) {
        return _paused;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     */
    modifier whenNotPaused() {
        require(!_paused, "Pausable: paused");
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     */
    modifier whenPaused() {
        require(_paused, "Pausable: not paused");
        _;
    }

    /**
     * @dev Called by a admin to pause, triggers stopped state.
     */
    function pause() public onlyAdmin whenNotPaused {
        _paused = true;
        emit Paused(msg.sender);
    }

    /**
     * @dev Called by a admin to unpause, returns to normal state.
     */
    function unpause() public onlyAdmin whenPaused {
        _paused = false;
        emit Unpaused(msg.sender);
    }
}