pragma solidity ^0.4.24;

import "./libs/SafeMathLib.sol";
import "./interfaces/IEtherReclaimer.sol";
import "./Owned.sol";



/**
 * @dev ERC20 Token, with symbol, name, standard and decimals among others.
 * Token units in this contract mean cents or pennies of the fiat currency it represents.
 */
contract EtherReclaimer is Owned
		, IEtherReclaimer
{
    /**
	 * @dev Constructor
	 */
    constructor()
		Owned()
		public
	{
    }
	
	/**
	 * Accept ETH
	 */
    function () external payable {
    }
	
	
	
	/**
	 * @dev Send all eth balance in the contract to another address
	 * @param _to Address to send contract ether balance to
	 * @return bool
	 */
    function reclaimEther(address _to) external onlyOwner returns (bool) {
        _to.transfer(address(this).balance);
		return true;
    }
}