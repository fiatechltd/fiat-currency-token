pragma solidity ^0.4.24;



/**
 * @dev ITokensRecovery interface protocol used by admin to recover other tokens mistakenly deposited to the contract implementing this interface.
 */
interface ITokensRecovery {
	
	///**
	// * @dev Event raised when foreign tokens were claimed/recovered from mistakenly transfer operation to contract address implementing this interface.
	// * @param tokenAddress Lost foreign tokens contract address
	// * @param fromContractAddress Contract address that was mistakenly sent tokens and is about to recover them
	// * @param to Address we send lost tokens to
	// * @param tokens Amount of tokens to recover
	// */
	//event ERC20TokenRecovered(address indexed tokenAddress, address indexed fromContractAddress, address indexed to, uint tokens);
	
	
	
	/**
	 * @dev Recover mistakenly sent other contract tokens to this contract address by executing foreign contract transfer function from this contract.
	 * @param tokenAddress Foreign token contract address to recover tokens of.
	 * @param tokens Tokens to recover.
	 * @return bool.
	 */
	function recoverAnyERC20Token(address tokenAddress, uint tokens) external returns (bool success);
}