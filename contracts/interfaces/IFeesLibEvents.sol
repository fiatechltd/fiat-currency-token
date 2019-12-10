pragma solidity ^0.4.24;

/**
 * @dev Interface for fees library with events.
 */
interface IFeesLibEvents {
	
	/**
	 * @dev Event raised when fees are enabled.
	 */
	event FeesEnabled(address indexed admin);
	
	/**
	 * @dev Event raised when fees are disabled.
	 */
	event FeesDisabled(address indexed admin);
	
	/**
	 * @dev Event raised when percent fees are changed.
	 */
	event FeesChanged(address indexed admin, uint parts_Fee, uint perX_Fee);
	
	/**
	 * @dev Event raised when minimum fees are changed.
	 */
	event MinFeesChanged(address indexed admin, uint minFee);
	
	/**
	 * @dev Event raised when maximum fees are changed.
	 */
	event MaxFeesChanged(address indexed admin, uint maxFee);
}