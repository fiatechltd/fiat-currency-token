pragma solidity ^0.4.24;

import "./Owned.sol";
import "./interfaces/IConfig.sol";

/**
 * @dev Base contract for config contract as external contract usage.
 */
contract HasConfig is Owned
{
	IConfig public config;
	
	/**
	 * @dev Constructor
	 */
    constructor(address _config) internal {
		setIConfig(_config);
    }
	
	modifier onlyAdmin {
		require(config.isAdmin(msg.sender), "Admin required");
		_;
	}
	
	function setIConfig(address _config) public onlyOwner {
		config = IConfig(_config);
	}
}