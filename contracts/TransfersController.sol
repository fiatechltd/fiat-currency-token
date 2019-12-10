pragma solidity ^0.4.24;

/**
 * @dev TransfersController abstract contract used to control transfers workflow.
 */
contract TransfersController {
	
	// toggle to control transfers
	bool public transfersEnabled;
	
	/**
	 * @dev Event is raised when admin enables transfers.
	 * @param _admin Admin address performing the operation.
	 */
	event TransfersEnabled(address indexed _admin);
	
	/**
	 * @dev Event is raised when admin disables transfers.
	 * @param _admin Admin address performing the operation.
	 */
	event TransfersDisabled(address indexed _admin);
	
	
	
	/**
	 * @dev Constructor
	 */
	constructor() internal {
        transfersEnabled = true;
    }
	
	modifier whenTransfersEnabled {
		require(transfersEnabled == true, "Transfers must be enabled!");
		_;
	}
	
	
	
	/**
	 * @dev Enable/Disable transfers.
	 * @param enable Toggle for enable/disable.
	 * @return bool.
	 */
	function enableTransfers(bool enable) public returns (bool) {
		if (transfersEnabled != enable) {
			transfersEnabled = enable;
			if (enable)
				emit TransfersEnabled(msg.sender);
			else emit TransfersDisabled(msg.sender);
			return true;
		}
		return false;
	}
	
	/**
	 * @dev Disable transfers if they are enabled.
	 * @return bool.
	 */
	/*function disableTransfers() public returns (bool) {
		if (transfersEnabled) {
			transfersEnabled = false;
			emit TransfersDisabled(msg.sender);
			return true;
		}
		return false;
	}*/
	
}
