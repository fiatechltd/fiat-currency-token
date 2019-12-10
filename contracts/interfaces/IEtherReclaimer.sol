pragma solidity ^0.4.24;



/**
 * @dev IEtherReclaimer interface protocol used by owner to reclaim other amount sent to contract address.
 */
interface IEtherReclaimer {
	
	/**
	 * @dev Send all eth balance in the contract to another address
	 * @param _to Address to send contract ether balance to
	 * @return bool.
	 */
    function reclaimEther(address _to) external returns (bool success);
}