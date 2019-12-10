pragma solidity ^0.4.24;

import "./IERC20.sol";



/**
 * @dev Fiat Token contract interface.
 */
contract IFiatToken is IERC20
{
	/**
	 * @dev Event raised when transfer fee was collected.
	 * @param from User address the transfer amount was taken from.
	 * @param to User address the transfer amount was sent to.
	 * @param transferTokens Transfer tokens amount.
	 * @param feesCollector Address that collected fee goes to.
	 * @param transferTokensFee Transfer tokens fee amount in tokens.
	 */
	event TransferFeesCollected(address indexed from, address indexed to, uint transferTokens, address indexed feesCollector, uint transferTokensFee);
	
	/**
	 * @dev Event raised when user address has been deposited tokens.
	 * @param _admin Admin address performing the operation.
	 * @param _to User address to deposit tokens to.
	 * @param _amount Deposit tokens amount.
	 */
	event DepositAccepted(address indexed _admin, address indexed _to, uint _amount);
	
	/**
	 * @dev Event raised when user asked for withdrawal.
	 * @param _from User address asking for withdrawal.
	 * @param _amount Withdrawal tokens amount.
	 * @param _withdrawalTokensFee Withdrawal fee in tokens if any.
	 */
	event WithdrawalRequested(address indexed _from, uint _amount, uint _withdrawalTokensFee);
	
	/**
	 * @dev Event raised when admin wiped out user address balance.
	 * @param _admin Admin address performing the operation.
	 * @param _account User address wiped out.
	 * @param _value User address latest balance available just before the wipe out.
	 */
	event WipeoutBlacklistedAddress(address indexed _admin, address indexed _account, uint _value);
	
	
	
	/**
	 * @dev Credit user balance with given tokens amount, only admin can do it.
	 * @param _to User address to deposit tokens to.
	 * @param _amount Tokens to deposit.
	 * @return bool If success returns true, false otherwise.
	 */
	function depositAccept(address _to, uint _amount) public returns (bool success);
	
	/**
	 * @dev User withdraws tokens.
	 * @param _amount Tokens to withdraw.
	 * @return bool If success returns true, false otherwise.
	 */
	function withdrawRequest(uint _amount) public returns (bool success);
	
	/**
	 * @dev Wipe out blacklisted user address, only admin can do it.
	 * @param _account User address.
	 * @return bool If success returns true, false otherwise.
	 */
	function wipeoutAddressBalance(address _account) public returns (bool success);
}